let deferred = require('../lib/common-utils/deferred');
let moment = require('moment');
let csvToJson = require('csvjson');
let fs = require('fs');
let _ = require("lodash");
let admissionService = require('../services/admissionService').getInstance();
let School = require('../models/mongo/repo/master').school;
let Session = require('../models/mongo/repo/master').session;
let Student = require('../models/mongo/repo/master').student;
let StudentModel = require('../models/mongo/models/models').student;
let SchoolModel = require('../models/mongo/models/models').school;
let ClassModel = require('../models/mongo/models/models').class;
let SessionModel = require('../models/mongo/models/models').session;
let SettingModel = require('../models/mongo/models/models').gSettings;
let TimeTable = require('../models/mongo/repo/master').schoolTimeTable;
let Guardian = require('../models/mongo/repo/master').guardian;
let Cls = require('../models/mongo/repo/master').cls;
let User = require('../models/mongo/repo/master').user;
let sms = require('../services/smsService').getInstance();
let Auth = require('./authAPI');
let auth = new Auth();
// Chunk function

const chunk = (target, size) => {
    let res = [];
    while (target.length) {
        res.push(target.splice(0, size));
    }
    return res;
};

class StudentAPI {
    addStudent(params) {
        console.log("params.post", JSON.stringify(params.post));
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.name) {
            return deferred.failure("no student name!")
        }
        if (!postObj.guardianInfo ||
            !postObj.guardianInfo.name ||
            !postObj.guardianInfo.relation ||
            !postObj.guardianInfo.contactNo) {
            return deferred.failure("no guardian info!")
        }

        // if (!postObj.schoolDetail || !postObj.schoolDetail.admissionNumber) {
        //     return deferred.failure("no admission number!")
        // }
        if (!postObj.schoolDetail.classId) {
            return deferred.failure("no class provided!")
        }
        if (!postObj.schoolDetail.sessionId) {
            return deferred.failure("no class provided!")
        }
        if (!postObj.schoolDetail.schoolId) {
            return deferred.failure("no school id provided!")
        }
        // if (!postObj.schoolDetail.srnNo) {
        //     return deferred.failure("no sr number provided!")
        // }
        if (!postObj.schoolDetail.admissionType) {
            return deferred.failure("no admission type provided!")
        }
        if (!postObj.createdById) {
            return deferred.failure("no created by provided!")
        }
        // if (!postObj.feesData || !postObj.feesData.length) {
        //     return deferred.failure("no fees data provided!")
        // }
        let isBulk = postObj.isBulk;
        console.log('postObj', postObj);
        let schoolId = postObj.schoolDetail.schoolId;
        let schoolSettings = School.getSchoolSettings(schoolId);
        let studentCount = Student.getStudentsCountFromSchoolId(schoolId);
        let existingStudent = deferred.success({});
        if (postObj.aadhaarId) {
            existingStudent = Student.getStudentByAadhaarId(postObj.aadhaarId);
        }

        let existingGuardian = deferred.success({});
        if (postObj.guardianInfo.aadhaarId) {
            existingGuardian = Guardian.getGuardianByAadhaarId(postObj.guardianInfo.aadhaarId);
        }
        let existingAdmission = deferred.success({});
        if (postObj.schoolDetail.admissionNumber) {
            existingAdmission = Student.getStudentBySchoolAdmissionNumber(postObj.schoolDetail.schoolId, postObj.schoolDetail.admissionNumber)
        }
        let existingSrn = deferred.success({});
        if (postObj.schoolDetail.srnNo) {
            existingSrn = Student.getStudentBySchoolSrNumber(postObj.schoolDetail.schoolId, postObj.schoolDetail.srnNo);
        }
        let existingRollNo = deferred.success({});
        if (postObj.schoolDetail.rollNo) {
            existingRollNo = Student.getStudentBySchoolClassRollNumber(postObj.schoolDetail.schoolId, postObj.schoolDetail.rollNo);
        }
        let schoolDetails = School.getSchoolById(postObj.schoolDetail.schoolId);
        return deferred.combine({
            schoolSettings: schoolSettings,
            studentCount: studentCount,
            existingStudent: existingStudent,
            existingGuardian: existingGuardian,
            existingAdmission: existingAdmission,
            existingSrn: existingSrn,
            existingRollNo: existingRollNo,
            schoolDetails: schoolDetails
        }).to(combSetRes => {
            if (combSetRes.existingStudent.length) {
                let isSchoolStudentExist = combSetRes.existingStudent.some(stu => {
                    return stu.schoolDetail.schoolId === postObj.schoolDetail.schoolId;
                });
                if (isSchoolStudentExist) {
                    return deferred.failure('Student already exist in your school!');
                }
            }
            if (combSetRes.existingAdmission && combSetRes.existingAdmission._id) {
                return deferred.failure('Student already exist with this admission number in your school!');
            }
            if (combSetRes.existingSrn && combSetRes.existingSrn._id) {
                return deferred.failure('Student already exist with this SR number in your school!');
            }
            if (combSetRes.existingRollNo && combSetRes.existingRollNo._id) {
                return deferred.failure('Student already exist with this roll number in selected class in your school!');
            }
            let schoolAdmnStart = 0;
            if (combSetRes.schoolSettings && combSetRes.schoolSettings.admissionNo) {
                schoolAdmnStart = parseInt(combSetRes.schoolSettings.admissionNo);
            }
            let studentCountHere = combSetRes.studentCount || 0;
            let studentUserObj;
            let guardianUserObj;
            let studentUserDeffered = deferred.success({});
            let guardianUserDeffered = deferred.success({});
            if (postObj.aadhaarId) {
                studentUserObj = {
                    username: postObj.aadhaarId,
                    password: postObj.aadhaarId + 'saregama',
                    userType: {
                        category: "student",
                        type: "school"
                    },
                    createdById: postObj.createdById
                };
            }
            if (postObj.guardianInfo.aadhaarId) {
                guardianUserObj = {
                    username: postObj.guardianInfo.aadhaarId,
                    password: postObj.guardianInfo.aadhaarId + 'padhanisa',
                    mobile: postObj.guardianInfo.contactNo,
                    userType: {
                        category: "guardian",
                        type: "school"
                    },
                    createdById: postObj.createdById
                };
            }
            console.log('studentUserObj', studentUserObj);
            if (studentUserObj) {
                studentUserDeffered = User.findUser(postObj.aadhaarId).to(function (res) {
                    if (res) {
                        return res;
                    } else {
                        if (combSetRes.existingStudent && combSetRes.existingStudent.length && combSetRes.existingStudent[0].loginId) {
                            return User.findUserById(combSetRes.existingStudent[0].loginId)
                                .to(function (resId) {
                                    if (resId) {
                                        return resId;
                                    } else {
                                        return auth.signUp({post: studentUserObj, ip: params.ip})
                                    }
                                })
                        } else {
                            return auth.signUp({post: studentUserObj, ip: params.ip})
                        }
                    }
                });
            }
            if (guardianUserObj) {
                guardianUserDeffered = User.findUser(postObj.guardianInfo.aadhaarId).to(function (res) {
                    if (res) {
                        return res;
                    } else {
                        // return User.findUser(postObj.guardianInfo.contactNo).to(function (resCont) {
                        //     if (resCont) {
                        //         return resCont;
                        //     } else {
                        if (combSetRes.existingGuardian && combSetRes.existingGuardian.le && combSetRes.existingGuardian[0].loginId) {
                            return User.findUserById(combSetRes.existingGuardian[0].loginId)
                                .to(function (resId) {
                                    if (resId) {
                                        return resId;
                                    } else {
                                        return auth.signUp({post: guardianUserObj, ip: params.ip});
                                    }
                                })
                        } else {
                            return auth.signUp({post: guardianUserObj, ip: params.ip});
                        }
                        //     }
                        //
                        // })
                    }
                });
            }
            postObj.schoolDetail.admissionNumber = postObj.schoolDetail.admissionNumber || schoolAdmnStart + studentCountHere + 1;
            let student = {
                name: postObj.name,
                motherName: postObj.motherName,
                motherOccupation: postObj.motherOccupation,
                fatherOccupation: postObj.fatherOccupation,
                fatherName: postObj.fatherName,
                isTransport: postObj.isTransport,
                transportData: postObj.transportData,
                createdById: postObj.createdById,
                guardianInfo: postObj.guardianInfo,
                schoolDetail: postObj.schoolDetail,
                aadhaarId: postObj.aadhaarId,
                nationality: postObj.nationality,
                height: postObj.height,
                weight: postObj.weight,
                bloodGroup: postObj.bloodGroup,
                gender: postObj.gender,
                motherTongue: postObj.motherTongue,
                religion: postObj.religion,
                caste: postObj.caste,
                picture: postObj.picture,
                contactNo: postObj.contactNo,
                isHandicapped: postObj.isHandicapped,
                emergencyContactNo: postObj.guardianInfo.contactNo,
                primaryContactNo: postObj.guardianInfo.contactNo,
                contact: postObj.contact,
                dob: postObj.dob,
                address: postObj.address,
                isTransport: postObj.isTransport
            };
            let guardian = {
                name: postObj.guardianInfo.name,
                createdById: postObj.createdById,
                aadhaarId: postObj.guardianInfo.aadhaarId,
                relation: postObj.guardianInfo.relation,
                contact: {
                    phone: [postObj.guardianInfo.contactNo],
                    email: [postObj.guardianInfo.email]
                },
                address: postObj.address
            };
            // console.log('student', student);
            // console.log('guardian', guardian);
            return deferred.combine({
                stu: studentUserDeffered,
                gua: guardianUserDeffered
            }).to(function (res) {
                // console.log('combine res', res);
                //student exist with given aadhar id
                if (res.stu._id) {
                    student.loginId = res.stu._id.toString();
                }

                //new student and guardian both do not exists but aadhaar present
                if (res.stu.data &&
                    res.stu.data._id) {
                    student.loginId = res.stu.data._id.toString();
                }
                if (res.gua.data &&
                    res.gua.data._id) {
                    guardian.loginId = res.gua.data._id.toString();
                }

                let smsData = {
                    schoolId: postObj.schoolDetail.schoolId,
                    sessionId: postObj.schoolDetail.sessionId,
                    createdById: postObj.createdById
                };

                let msg = "Dear Parent,\n" +
                    "Your ward " + student.name.split([' '])[0] +
                    " is now a student of " + combSetRes.schoolDetails.name +
                    ". To check regular updates of your ward and school please Sign Up at https://inforida.in";
                let smsDef = deferred.success({});
                if (!isBulk) {
                    smsDef = sms.sendSingleSms(student.emergencyContactNo, msg, smsData);
                }

                //new student but guardian exists
                return smsDef.to(function (smsRes) {
                    if (res.gua._id) {
                        console.log('guardian to be updated');
                        return Student.createStudent(student).to(function (res) {
                            let studentFees;
                            let feeSave = deferred.success({});
                            if (postObj.feesData && postObj.feesData.length) {
                                studentFees = postObj.feesData.map(val => {
                                    val.studentId = res._id.toString();
                                    return val;
                                });
                                feeSave = Student.createStudentFees(studentFees);
                            }
                            guardian.studentId = [res._id.toString()];
                            let guardianSave = Guardian.updateGuardianStudent(guardian.aadhaarId, res._id.toString());
                            return deferred.combine({
                                feeSave: feeSave,
                                guardianSave: guardianSave
                            }).to(function (combFeeGuard) {
                                return {
                                    success: true,
                                    message: 'Student created ' +
                                    'successfully, But guardian exists ' +
                                    'with this aadhaar id, so ' +
                                    'guardian information is ' +
                                    'not changed!',
                                    data: {
                                        student: res,
                                        guardian: combFeeGuard.guardianSave,
                                        fees: combFeeGuard.feeSave
                                    }
                                }
                            })
                        });
                    }
                    //aadhaar absent
                    console.log('student before saving', student);
                    return Student.createStudent(student).to(function (res) {
                        guardian.studentId = [res._id.toString()];
                        console.log('guardian before saving', guardian);
                        let studentFees;
                        let feeSave = deferred.success({});
                        if (postObj.feesData && postObj.feesData.length) {
                            studentFees = postObj.feesData.map(val => {
                                val.studentId = res._id.toString();
                                return val;
                            });
                            feeSave = Student.createStudentFees(studentFees);
                        }
                        guardian.studentId = [res._id.toString()];
                        let guardianSave = Guardian.createGuardian(guardian);
                        return deferred.combine({
                            feeSave: feeSave,
                            guardianSave: guardianSave
                        }).to(function (combFeeGuard) {
                            return {
                                success: true,
                                message: 'Student created successfully!',
                                data: {
                                    student: res,
                                    guardian: combFeeGuard.guardianSave,
                                    fees: combFeeGuard.feeSave
                                }
                            }
                        });
                    });
                })
            });
        })
    }

    getStudentBySchoolId(params) {
        let schoolId = params.schoolId;
        return Student.getStudentBySchool(schoolId).to(function (res) {
            let allClass = res.map(function (val) {
                return val.schoolData.classId.toString();
            });
            allClass = _.union(allClass);
            return Cls.getClassesByClassIds(allClass).to(function (res2) {
                let classNameMap = res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
                let data = res.map(function (x) {
                    x.className = classNameMap[x.schoolData.classId.toString()];
                    return x;
                });
                return {
                    success: true,
                    message: "Student fetched successfully!",
                    data: data
                }
            })
        })
    }

    uploadStudentCsv(params) {
        let self = this;
        if (params.file && params.file.path) {
            let path = params.file.path;
            console.log('path', path);
            let format = path.split('.').pop();
            console.log('format', format);
            if (format !== 'csv') {
                return deferred.failure({
                    success: false,
                    error: "Not CSV Format!"
                });
            }
            let postData = params.post;
            console.log('postData', postData);
            if (!postData.classId) {
                return deferred.failure({
                    success: false,
                    error: "Class Id missing!"
                });
            }
            if (!postData.createdById) {
                return deferred.failure({
                    success: false,
                    error: "Created By Id missing!"
                });
            }
            if (!postData.schoolId) {
                return deferred.failure({
                    success: false,
                    error: "School Id missing!"
                });
            }
            if (!postData.sessionId) {
                return deferred.failure({
                    success: false,
                    error: "Session Id missing!"
                });
            }

            let fileData = fs.readFileSync(path, {encoding: 'utf8'});

            let csvObj = csvToJson.toObject(fileData.replace(/\"/g, ''));
            // { studentAdhaar: '1.23E+11',
            //     studentName: 'Student',
            //     gender: 'm',
            //     nationality: 'indian',
            //     dob: '27-3-1987',
            //     admissionNumber: '1121',
            //     rollNumber: '',
            //     admissionType: 'paid',
            //     guardianAdhaar: '1.23E+11',
            //     guardianName: 'XYSSSSS',
            //     relation: 'mother',
            //     contactNo: '8130114719',
            //     religion: 'hindu',
            //     caste: 'obc',
            //     emailId: 'nishant@usa.com',
            //     pin: '226001',
            //     completeAddress: 'near mandawali fort lucknow' }
            console.log('csvObj', csvObj);
            let error = "";
            let isError = csvObj.some(function (val, index) {
                if (!val.admissionNumber) {
                    error = "Admission Number Not present at " + (index + 1) + " Position.";
                    return true;
                }
                if (!val.studentName) {
                    error = "Name Not present at " + (index + 1) + " Position.";
                    return true;
                }
                if (!val.guardianName) {
                    error = "Guardian Name Not present " +
                        "at " + (index + 1) + " Position.";
                    return true;
                }
                // if (!val.relation) {
                //     error = "guardian Relation Not present " +
                //         "at " + index + " Position.";
                // }
                if (!val.contactNo) {
                    error = "Contact Number Not " +
                        "present at " + (index + 1) + " Position.";
                    return true;
                }
                // if (!val.aadhaarId) {
                //     error = "aadhaarId Not present " +
                //         "at " + index + " Position.";
                // }
                // if (!val.pincode) {
                //     error = "Pincode Not present " +
                //         "at " + (index + 1) + " Position.";
                //     return true;
                // }
                // if (!val.admissionType) {
                //     error = "admissionType Not present " +
                //         "at " + index + " Position.";
                // }
                // if (val.discount) {
                //     error = "Discount Not present " +
                //         "at " + index + " Position.";
                // }
                return false;
            });
            if (isError) {
                return deferred.failure({
                    success: false,
                    error: error
                });
            }
            let allAdmissionNumber = csvObj.reduce(function (a, p) {
                if (p.admissionNumber) {
                    a.push(p.admissionNumber)
                }
                return a;
            }, []);

            let allSrNumbers = csvObj.reduce(function (a, p) {
                if (p.srNumber) {
                    a.push(p.srNumber)
                }
                return a;
            }, []);

            let allAdhaarIds = csvObj.reduce(function (a, p) {
                if (p.studentAdhaar) {
                    a.push(p.studentAdhaar)
                }
                return a;
            }, []);

            let schoolId = postData.schoolId;
            let schoolSettings = School.getSchoolSettings(schoolId);
            let studentCount = Student.getStudentsCountFromSchoolId(schoolId);
            return deferred.combine({
                schoolSettings: schoolSettings,
                studentCount: studentCount
            }).to(combSetRes => {
                let schoolAdmnStart = 0;
                if (combSetRes.schoolSettings && combSetRes.schoolSettings.admissionNo) {
                    schoolAdmnStart = parseInt(combSetRes.schoolSettings.admissionNo);
                }
                let studentCountHere = 0;
                if (combSetRes.studentCount) {
                    studentCountHere = combSetRes.studentCount;
                }
                console.log('schoolAdmnStart', schoolAdmnStart);
                console.log('studentCountHere', studentCountHere);
                let dataToSaveStudent = csvObj.map(function (val, ind) {
                    console.log('ind', ind);
                    val.createdById = postData.createdById;
                    val.name = val.studentName;
                    val.aadhaarId = val.studentAdhaar;
                    val.schoolDetail = JSON.parse(JSON.stringify({
                        schoolId: postData.schoolId,
                        classId: postData.classId,
                        sessionId: postData.sessionId,
                        admissionType: val.admissionType || 'paid',
                        srnNo: val.srNumber || '',
                        admissionNumber: val.admissionNumber || (schoolAdmnStart + studentCountHere + 1 + ind)
                    }));
                    val.emergencyContactNo = val.contactNo;
                    val.primaryContactNo = val.contactNo;
                    val.nationality = val.nationality || 'indian';
                    val.isHandicapped = (val.isHandicapped == 'yes');
                    val.gender = val.gender || 'male';
                    val.isHandicapped = val.isHandicapped || false;
                    val.guardianInfo = {
                        aadhaarId: val.guardianAdhaar,
                        name: val.guardianName,
                        relation: val.relation || 'father',
                        contactNo: val.contactNo
                    };
                    val.address = {
                        pin: val.pin,
                        completeAddress: val.completeAddress,
                    };
                    val.isBulk = true;
                    delete val.guardianAdhaar;
                    delete val.guardianName;
                    delete val.admissionNumber;
                    delete val.srNumber;
                    delete val.studentName;
                    delete val.relation;
                    delete val.contactNo;
                    delete val.admissionType;
                    delete val.completeAddress;
                    delete val.pin;
                    delete val.dob;
                    return val;
                });
                console.log('dataToSaveStudent', dataToSaveStudent);
                let admissionNoAnalysis = allAdmissionNumber.reduce(function (a, p) {
                    if (a.uniqueRno.indexOf(p) !== -1) {
                        if (!a.duplicateRno[p]) {
                            a.duplicateRno[p] = 1;
                        }
                        a.duplicateRno[p]++;
                    } else {
                        a.uniqueRno.push(p);
                    }
                    return a;
                }, {duplicateRno: {}, uniqueRno: []});
                console.log('admissionNoAnalysis', admissionNoAnalysis);
                let srNoAnalysis = allSrNumbers.reduce(function (a, p) {
                    if (a.uniqueRno.indexOf(p) !== -1) {
                        if (!a.duplicateRno[p]) {
                            a.duplicateRno[p] = 1;
                        }
                        a.duplicateRno[p]++;
                    } else {
                        a.uniqueRno.push(p);
                    }
                    return a;
                }, {duplicateRno: {}, uniqueRno: []});
                console.log('srNoAnalysis', srNoAnalysis);
                let adNoAnalysis = allAdhaarIds.reduce(function (a, p) {
                    if (a.uniqueRno.indexOf(p) !== -1) {
                        if (!a.duplicateRno[p]) {
                            a.duplicateRno[p] = 1;
                        }
                        a.duplicateRno[p]++;
                    } else {
                        a.uniqueRno.push(p);
                    }
                    return a;
                }, {duplicateRno: {}, uniqueRno: []});
                console.log('adNoAnalysis', adNoAnalysis);
                if (Object.keys(admissionNoAnalysis.duplicateRno).length) {
                    return deferred.success({
                        success: false,
                        error: "Duplicate Admission numbers present in CSV.",
                        type: 'adup',
                        data: admissionNoAnalysis
                    });
                }
                if (Object.keys(srNoAnalysis.duplicateRno).length) {
                    return deferred.success({
                        success: false,
                        error: "Duplicate SR Numbers present in CSV.",
                        type: 'sdup',
                        data: srNoAnalysis
                    });
                }
                if (Object.keys(adNoAnalysis.duplicateRno).length) {
                    return deferred.success({
                        success: false,
                        error: "Duplicate Aadhaar Ids present in CSV.",
                        type: 'addup',
                        data: adNoAnalysis
                    });
                }
                // return deferred.success(dataToSaveStudent);
                let schoolFeesData = School.getSchoolFees(postData.schoolId, postData.classId, postData.sessionId);
                let schoolStudentAdmissionData = Student.getStudentByAdmissionNoArr(admissionNoAnalysis.uniqueRno, postData.schoolId);
                let schoolStudentSrnData = Student.getStudentBySrNoArr(srNoAnalysis.uniqueRno, postData.schoolId);
                let schoolStudentAdData = Student.getStudentByAdIdArr(adNoAnalysis.uniqueRno, postData.schoolId);

                return deferred.combine({
                    schoolFeesData: schoolFeesData,
                    schoolStudentAdmissionData: schoolStudentAdmissionData,
                    schoolStudentSrnData: schoolStudentSrnData,
                    schoolStudentAdData: schoolStudentAdData
                }).to(function (combRes) {
                    let stuAdmData = combRes.schoolStudentAdmissionData;
                    let stuSrnData = combRes.schoolStudentSrnData;
                    let stuAdData = combRes.schoolStudentAdData;
                    console.log('stuAdmData', stuAdmData);
                    console.log('stuSrnData', stuSrnData);
                    console.log('stuAdData', stuAdData);
                    let feesData = JSON.parse(JSON.stringify(combRes.schoolFeesData));
                    feesData = feesData.map(val => {
                        delete val._id;
                        return val;
                    });
                    if (stuAdmData.length) {
                        return deferred.success({
                            success: false,
                            error: "Admission numbers already exists in your school!",
                            type: 'aexist',
                            data: stuAdmData.reduce(function (a, p) {
                                if (p.schoolDetail && p.schoolDetail.admissionNumber) {
                                    a[p.schoolDetail.admissionNumber] = p.name;
                                }
                                return a;
                            }, {})
                        });
                    }
                    if (stuSrnData.length) {
                        return deferred.success({
                            success: false,
                            error: "Srn numbers already exists in your school!",
                            type: 'sexist',
                            data: stuSrnata.reduce(function (a, p) {
                                if (p.schoolDetail && p.schoolDetail.srnNo) {
                                    a[p.schoolDetail.srnNo] = p.name;
                                }
                                return a;
                            }, {})
                        });
                    }
                    if (stuAdData.length) {
                        return deferred.success({
                            success: false,
                            error: "Aadhaar Ids already exists in your school!",
                            type: 'adexist',
                            data: stuAdData.reduce(function (a, p) {
                                if (p.aadhaarId) {
                                    a[p.aadhaarId] = p.name;
                                }
                                return a;
                            }, {})
                        });
                    }
                    let totalStudent = dataToSaveStudent.length;
                    dataToSaveStudent = dataToSaveStudent.map(function (val) {
                        val.feesData = feesData;
                        return val;
                    });
                    console.log('totalStudent', totalStudent);
                    if (totalStudent > 1) {
                        let deffArr = [];
                        for (let i = 0; i < totalStudent; i++) {
                            console.log('dataToSaveStudent[i]', dataToSaveStudent[i]);
                            console.log('self', self);
                            deffArr.push(self.addStudent({post: dataToSaveStudent[i], ip: params.ip}))
                        }
                        let defObj = deffArr.reduce(function (ac, pr, i) {
                            ac[i] = pr;
                            return ac;
                        }, {});
                        return deferred.combine(defObj).to(function (combObj) {
                            console.log('combObj', combObj);
                            return deferred.success({
                                success: true,
                                message: "Students added Successfully!"
                            });
                        }).toFailure(function (err) {
                            console.log('err', err);
                            return deferred.success({
                                success: false,
                                message: "Error in adding student!"
                            });
                        })
                    } else {
                        return deferred.success({
                            success: false,
                            message: "No student added!"
                        });
                    }
                });
            });
        }
        else {
            return deferred.failure({
                success: false,
                message: 'Error in uploading'
            });
        }
    }

    getStudentCsv(req, res) {
        if (req.params.type === 'sample') {
            res.sendfile('sampleStudent.csv', {root: './public/student'});
        } else if (req.params.type === 'blank') {
            res.sendfile('blankStudent.csv', {root: './public/student'});
        } else {
            res.send({
                success: false,
                error: 'No file found'
            })
        }
    }

    getAdmissionForm(req, res) {
        console.log('req.params', req.params);
        let studentId = req.params.studentId;
        StudentModel.findOne({_id: studentId, isDeleted: false})
            .then(resStudent => {
                console.log('StudentModel.findOne resStudent', resStudent);
                let schoolId = resStudent.schoolDetail.schoolId;
                let classId = resStudent.schoolDetail.classId;
                let sessionId = resStudent.schoolDetail.sessionId;
                let schoolPromise = SchoolModel.findOne({_id: schoolId}).exec();
                let settingPromise = SettingModel.findOne({schoolId: schoolId}).exec();
                let classPromise = ClassModel.findOne({_id: classId}).exec();
                let sessionPromise = SessionModel.findOne({_id: sessionId}).exec();
                Promise.all([schoolPromise, settingPromise, classPromise, sessionPromise])
                    .then(combRes => {
                        console.log('combRes', combRes);
                        let toSendData = resStudent;
                        if (resStudent.dob && resStudent.dob.year) {
                            toSendData.dobString = resStudent.dob.day + '/' + resStudent.dob.month + '/' + resStudent.dob.year;
                        }
                        if (resStudent.schoolDetail.admissionDate && resStudent.schoolDetail.admissionDate.year) {
                            toSendData.admissionDateString = resStudent.schoolDetail.admissionDate.day + '/' + resStudent.schoolDetail.admissionDate.month + '/' + resStudent.schoolDetail.admissionDate.year;
                        }

                        if (combRes[0] && combRes[0]._id) {
                            if (combRes[0].contact) {
                                if (combRes[0].contact.phone &&
                                    combRes[0].contact.phone[0]) {
                                    toSendData.schoolPhone = combRes[0].contact.phone[0];
                                }
                                if (combRes[0].contact.email &&
                                    combRes[0].contact.email[0]) {
                                    toSendData.schoolEmail = combRes[0].contact.email[0];
                                }
                            }
                            if (combRes[0].name) {
                                toSendData.schoolName = combRes[0].name;
                            }
                            if (combRes[0].affiliation) {
                                toSendData.schoolBoard = combRes[0].affiliation.board;
                                toSendData.schoolCode = combRes[0].affiliation.code;
                            }
                            if (combRes[0].address) {
                                toSendData.schoolAddress = combRes[0].address.completeAddress;
                                toSendData.schoolPin = combRes[0].address.pin;
                            }
                        }
                        if (combRes[1] && combRes[1]._id) {
                            toSendData.schoolLogo = combRes[1].logo;
                        }
                        if (combRes[2] && combRes[2]._id) {
                            toSendData.className = combRes[2].name;
                        }
                        if (combRes[3] && combRes[3]._id) {
                            toSendData.sessionStartYear = combRes[3].startDate.year || '2018';
                            toSendData.sessionEndYear = combRes[3].endDate.year || '2019';
                        }
                        let stu = toSendData;
                        let fileName = stu.name + '_' + stu.className + '_' + stu.sessionStartYear + '-' + stu.sessionEndYear + '_admission_form';
                        res.render('../templates/admissionForm.jade', toSendData,
                            function (err, result) {
                                console.log('err', err);
                                // console.log('result', result);
                                admissionService.generateAdmissionForm(result, fileName)
                                    .then(fileRes => {
                                        res.send({filename: fileRes});
                                    })
                            }
                        )
                    });
            })
    };

    getIdCards(req, res) {
        console.log('req.params', req.params);
        let schoolId = req.params.schoolId;
        let classId = req.params.classId;
        let sessionId = req.params.sessionId;

        let schoolPromise = SchoolModel.findOne({_id: schoolId}).exec();
        let settingPromise = SettingModel.findOne({schoolId: schoolId}).exec();
        let classPromise = ClassModel.findOne({_id: classId}).exec();
        let sessionPromise = SessionModel.findOne({_id: sessionId}).exec();
        let studentPromise = StudentModel.find(
            {
                "schoolDetail.sessionId": sessionId,
                "schoolDetail.schoolId": schoolId,
                "schoolDetail.classId": classId
            }).exec();
        Promise.all([
            schoolPromise,
            settingPromise,
            classPromise,
            sessionPromise,
            studentPromise]).then(combRes => {
            console.log('combRes', combRes);
            let tempSend = {};
            if (combRes[0] && combRes[0]._id) {
                if (combRes[0].contact) {
                    if (combRes[0].contact.phone &&
                        combRes[0].contact.phone[0]) {
                        tempSend.schoolPhone = combRes[0].contact.phone[0];
                    }
                    if (combRes[0].contact.email &&
                        combRes[0].contact.email[0]) {
                        tempSend.schoolEmail = combRes[0].contact.email[0];
                    }
                }
                if (combRes[0].name) {
                    tempSend.schoolName = combRes[0].name;
                }
                if (combRes[0].address) {
                    tempSend.schoolAddress = combRes[0].address.completeAddress;
                    tempSend.schoolPin = combRes[0].address.pin;
                }
            }
            if (combRes[1] && combRes[1]._id) {
                tempSend.schoolLogo = combRes[1].logo;
            }
            if (combRes[2] && combRes[2]._id) {
                tempSend.className = combRes[2].name;
            }
            if (combRes[3] && combRes[3]._id) {
                tempSend.sessionStartYear = combRes[3].startDate.year || '2018';
                tempSend.sessionEndYear = combRes[3].endDate.year || '2019';
            }
            let toSendData = {
                studentList: []
            };
            toSendData.studentList = combRes[4].map(function (val) {
                let temp = JSON.parse(JSON.stringify(tempSend));
                temp.name = val.name;
                temp.fatherName = val.fatherName;
                temp.picture = val.picture || "http://www.nicholscrowder.com.au/img/noprofile_lg.gif";
                if (val.dob && val.dob.year) {
                    temp.dobString = val.dob.day + '/' + val.dob.month + '/' + val.dob.year;
                }
                temp.contactNo = val.guardianInfo.contactNo;
                temp.address = val.address.completeAddress;
                temp.pin = val.address.pin;
                return temp;
            });
            let fStu = toSendData.studentList[0];
            let fileName = fStu.schoolName + '_' + fStu.className + '_' + fStu.sessionStartYear + '-' + fStu.sessionEndYear + '_identity_cards';

            toSendData.studentList = chunk(toSendData.studentList, 8);
            console.log('toSendData.studentList', JSON.stringify(toSendData.studentList));
            toSendData.studentList = toSendData.studentList.map(function (val) {
                return chunk(val, 2);
            });
            console.log('toSendData.studentList', JSON.stringify(toSendData.studentList));
            res.render('../templates/idCard.jade', toSendData,
                function (err, result) {
                    console.log('err', err);
                    console.log('result', result);
                    admissionService.generateIdentityCard(result, fileName)
                        .then(fileRes => {
                            res.send({filename: fileRes});
                            // res.sendfile(fileRes, {root: './public/feereceipt'});
                        })
                })
        });

    };

    assignRollNumbers(params) {
        let postParams = params.post;
        if (!postParams) {
            return deferred.failure('No params!');
        }
        if (!postParams.idRollNoArr && postParams.idRollNoArr.length) {
            return deferred.failure('No Roll Numbers');
        }
        console.log('postParams', postParams);
        let defMap = postParams.idRollNoArr.reduce((a, p, i) => {
            console.log('p', p);
            a[i + 1] = Student.updateStudentById(p.studentId, {
                "schoolDetail.rollNo": p.rollNo
            });
            return a;
        }, {});
        console.log('defMap', defMap);
        return deferred.combine(defMap).to(combRes => {
            console.log('combRes', combRes);
            return {
                success: true,
                message: 'Roll Numbers assigned successfully!'
            };
        }).toFailure(err => {
            console.log('err', err);
            return err;
        })

    }

    getStudentById(params) {
        let studentId = params.studentId;
        let sessionId = params.sessionId;
        if (!studentId) {
            return deferred.failure('Student id not provided');
        }
        let studentFees = Student.getStudentFees(studentId, sessionId);
        let studentData = Student.getStudentByStudentId(studentId);
        return deferred.combine({
            studentFees: studentFees,
            studentData: studentData
        }).to(function (combRes) {
            let res = combRes.studentData;
            let studentFees = combRes.studentFees;
            console.log('studentFees', studentFees);
            if (res) {
                return Cls.getClassesById(res.schoolDetail.classId)
                    .to(function (clsRes) {
                        console.log('clsRes', clsRes);
                        let toSend = JSON.parse(JSON.stringify(res));
                        if (clsRes) {
                            toSend.className = clsRes.name;
                        }
                        console.log('getStudentByStudentId toSend', toSend);
                        toSend.feesData = studentFees;
                        return {
                            success: true,
                            message: "Student fetched!",
                            data: toSend
                        }
                    });
            } else {
                return {
                    success: false,
                    message: "Student not found!",
                }
            }

        })
    }

    getStudentByTransportFee(params) {
        let studentId = params.studentId;
        if (!studentId) {
            return deferred.failure('Student id not provided');
        }

        return Student.getStudentByTransportFees(studentId).to(function (res) {
            console.log('studentByTransportFee', res);
            return {
                success: true,
                message: "student fetched!",
                data: res
            }
        })
    }

    getFeesByStudentAndSessionId(params) {
        let studentId = params.studentId;
        let sessionId = params.sessionId;
        if (!studentId) {
            return deferred.failure('Student id not provided');
        }
        if (!sessionId) {
            return deferred.failure('Session id not provided');
        }
        return Student.getStudentFees(studentId, sessionId).to(function (res) {
            if (res) {
                return {
                    success: true,
                    message: "Student Fees fetched!",
                    data: res
                }
            } else {
                return {
                    success: false,
                    message: "Student not found!",
                }
            }

        })
    }

    editStudent(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj._id) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        let feeDef = deferred.success({});
        if (postObj.feesData && postObj.feesData.length) {
            let allFeeIds = postObj.feesData.map(val => val._id.toString());
            console.log('allFeeIds', allFeeIds);
            console.log('postObj.feesData', postObj.feesData);
            feeDef = Student.deleteStudentFeesArr(allFeeIds).to(function (delRes) {
                return Student.createStudentFees(postObj.feesData)
                    .to(function (createRes) {
                        delete postObj.feesData;
                        return createRes;
                    })
                // console.log('delRes', delRes);
            });
        }
        let studentUpdate = Student.updateStudentById(postObj._id, postObj);
        return deferred.combine({
            studentUpdate: studentUpdate,
            feeDef: feeDef
        }).to(function (res) {
            return {
                success: true,
                message: "Student Edited!!",
                data: res
            }
        })
    }

    transportFeeStudent(params) {
        let postObj = params.post;
        console.log('postData', postObj);
        let studentId = postObj.studentId;
        let data = postObj.data;

        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj.studentId && !postObj.data) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        return Student.getStudentByStudentId(studentId).to(function (stuRes) {
            if (stuRes) {
                let schoolId = stuRes.schoolDetail.schoolId;
                let sessionId = stuRes.schoolDetail.sessionId;
                let classId = stuRes.schoolDetail.classId;
                let createdById = stuRes.schoolDetail.createdById;
                let settingData = School.getSchoolSettings(schoolId);
                let sessionData = Session.getSessionsBySessionId(sessionId);
                return deferred.combine({
                    settingData: settingData,
                    sessionData: sessionData
                }).to(function (cRes) {
                    console.log('cRes', cRes);
                    let sel = cRes.sessionData;
                    let feeData = {
                        sessionId: sessionId,
                        studentId: studentId,
                        schoolId: schoolId,
                        classId: classId,
                        feeData: {
                            particular: 'Transport',
                            amount: data.amount,
                            dueDate: 7,
                            type: 'transport',
                            months: []
                        },
                        createdById: createdById
                    };
                    let dojMonth = moment(data.doj.month, 'M').format('MMMM').toLowerCase();
                    if (cRes.settingData && cRes.settingData.feesSettings && cRes.settingData.feesSettings.transportSettings && cRes.settingData.feesSettings.transportSettings.months && cRes.settingData.feesSettings.transportSettings.months.length) {
                        console.log('inside transport setting');
                        console.log('cRes.settingData.feesSettings.transportSettings', cRes.settingData.feesSettings.transportSettings);
                        console.log('cRes.settingData.feesSettings.transportSettings.months', cRes.settingData.feesSettings.transportSettings.months);
                        let dojIndex = cRes.settingData.feesSettings.transportSettings.months.findIndex(val => val.name === dojMonth);
                        feeData.feeData.months = getAllMonthsSetting(dojIndex, cRes.settingData.feesSettings.transportSettings.months);
                    } else {
                        feeData.feeData.months = getAllMonths(sel.startDate.year
                            + '-' + sel.startDate.month + '-' + sel.startDate.day, dojMonth);
                    }
                    console.log('feeData.feeData.months', feeData.feeData.months);
                    let feeAdd = Student.createStudentFees(feeData);
                    let addTransportData = Student.addStudentTransportFeeById(studentId, data);
                    return deferred.combine({
                        addTransportData: addTransportData,
                        feeAdd: feeAdd
                    }).to(function (res) {
                        return {
                            success: true,
                            message: "Transport Fee Added !!",
                            data: res
                        }
                    })
                })
            } else {
                return {
                    success: false,
                    message: "Transport Fee not added !!"
                }
            }
        });

    }

    discontinueTransportFee(params) {
        let postObj = params.post;
        console.log('postData', postObj);
        let studentId = postObj.studentId;
        let discontinueDate = postObj.discontinueDate;

        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj.studentId && !postObj.data) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        return Student.getStudentByStudentId(studentId).to(function (stuRes) {
            if (stuRes) {
                let sessionId = stuRes.schoolDetail.sessionId;
                let discontinueMonth = moment(discontinueDate.month, 'M').format('MMMM').toLowerCase();
                console.log('discontinueMonth', discontinueMonth);
                return Student.getStudentTransportFeesByStudentId(studentId, sessionId)
                    .to(function (feeRes) {
                        if (feeRes.length) {
                            let feeIdMonthMap = feeRes.reduce((a, p) => {
                                let discontinueIndex = p.feeData.months.findIndex(val => val.name === discontinueMonth);
                                a[p._id] = p.feeData.months.map((val, ind) => {
                                    if (ind > discontinueIndex) {
                                        val.selected = false;
                                    }
                                    return val;
                                });
                                return a;
                            }, {});
                            let updateFees = Object.keys(feeIdMonthMap).reduce((a, p) => {
                                a[p] = Student.updateStudentTransportFees(p, feeIdMonthMap[p]);
                                return a;
                            }, {});
                            return deferred.combine(updateFees)
                                .to(function (upRes) {
                                    return Student.discontinueStudentTransportById(studentId).to(function (res) {
                                        return {
                                            success: true,
                                            message: "Transport discontinued!!",
                                            data: res
                                        }
                                    });
                                })
                        } else {
                            return Student.discontinueStudentTransportById(studentId).to(function (res) {
                                return {
                                    success: true,
                                    message: "Transport discontinued!!",
                                    data: res
                                }
                            })
                        }
                    })
            } else {
                return {
                    success: false,
                    message: "Transport Fee not discontinued!!"
                }
            }
        });

    }

    deleteStudent(params) {
        console.log("params.post", params.post);
        let studentId = params.studentId;
        if (!studentId) {
            return {
                success: false,
                message: "No student id!"
            }
        }
        return Student.deleteStudentById(studentId).to(function (res) {
            return {
                success: true,
                message: "Student Deleted!!",
                data: res
            }
        })
    }

    getStudentDetailsByAadhaar(params) {
        let aadhaarId = params.post.aadhaarId;
        console.log('aadhaarId', aadhaarId);
        if (!aadhaarId) {
            return deferred.success({
                success: false,
                error: 'Aadhaar id not provided!'
            });
        }
        return Student.getStudentByAadhaarId(aadhaarId).to(function (res) {
            if (res && res.length) {
                return {
                    success: true,
                    message: "Detail fetched!",
                    data: res[0]
                }
            } else {
                return {
                    success: false,
                    error: "Details from aadhaar id not found!",
                }
            }

        })
    }

    getGuardianDetailsByAadhaar(params) {
        let aadhaarId = params.aadhaarId;
        if (!aadhaarId) {
            return deferred.success({
                success: false,
                error: 'Aadhaar id not provided!'
            });
        }
        return Student.getStudentByGuardianAadhaarId(aadhaarId).to(function (res) {
            if (res) {
                return {
                    success: true,
                    message: "Detail fetched!",
                    data: res.guardianInfo
                }
            } else {
                return {
                    success: false,
                    error: "Details from aadhaar id not found!",
                }
            }

        })
    }

    getStudentBySchoolAndClassId(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        return Student.getStudentBySchoolClass(schoolId, classId).to(function (res) {
            let allClass = res.map(function (val) {
                return val.schoolDetail.classId.toString();
            });
            allClass = _.union(allClass);
            return Cls.getClassesByClassIds(allClass).to(function (res2) {
                let classNameMap = res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
                let data = res.map(function (x) {
                    x.className = classNameMap[x.schoolDetail.classId.toString()];
                    return x;
                });
                return {
                    success: true,
                    message: "Student fetched succesfully!",
                    data: data
                }
            })
        })
    }

    getStudentBySchoolAndClassAndSession(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        let sessionId = params.sessionId;
        return Student.getStudentBySchoolClassSession(schoolId, classId, sessionId).to(function (res) {
            let allClass = res.map(function (val) {
                return val.schoolDetail.classId.toString();
            });
            allClass = _.union(allClass);
            return Cls.getClassesByClassIds(allClass).to(function (res2) {
                let classNameMap = res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
                let data = res.map(function (x) {
                    x.className = classNameMap[x.schoolDetail.classId.toString()];
                    return x;
                });
                return {
                    success: true,
                    message: "Student fetched succesfully!",
                    data: data.sort((a, b) => {
                        if (a.schoolDetail.rollNo && b.schoolDetail.rollNo) {
                            return parseInt(a.schoolDetail.rollNo, 10) - parseInt(b.schoolDetail.rollNo, 10);
                        } else {
                            return parseInt(a.schoolDetail.admissionNumber, 10) - parseInt(b.schoolDetail.admissionNumber, 10);
                        }
                    })
                }
            })
        })
    }

    getStudentBySchoolAndClassAndSessionByTransport(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        let sessionId = params.sessionId;
        return Student.getStudentBySchoolClassSessionByTransport(schoolId, classId, sessionId).to(function (res) {
            let allClass = res.map(function (val) {
                return val.schoolDetail.classId.toString();
            });
            allClass = _.union(allClass);
            return Cls.getClassesByClassIds(allClass).to(function (res2) {
                let classNameMap = res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
                let data = res.map(function (x) {
                    x.className = classNameMap[x.schoolDetail.classId.toString()];
                    return x;
                });
                return {
                    success: true,
                    message: "Student fetched succesfully!",
                    data: data
                }
            })
        })
    }

    getStudentBySchoolAndClassAndSessionByTransportFees(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        let sessionId = params.sessionId;
        return Student.getStudentBySchoolClassSessionByTransportFee(schoolId, classId, sessionId).to(function (res) {
            let allClass = res.map(function (val) {
                return val.schoolDetail.classId.toString();
            });
            allClass = _.union(allClass);
            return Cls.getClassesByClassIds(allClass).to(function (res2) {
                let classNameMap = res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
                let data = res.map(function (x) {
                    x.className = classNameMap[x.schoolDetail.classId.toString()];
                    return x;
                });
                return {
                    success: true,
                    message: "Student fetched succesfully!",
                    data: data
                }
            })
        })
    }

    getStudentByTimeTable(params) {
        let timeTableId = params.timeTableId;
        return TimeTable.getTimeTable(timeTableId).to(function (res) {
            console.log('res', res);
            if (!res) {
                return deferred.failure('No timetable found');
            }
            let classId = res.classId;
            return Student.getStudentByClass(classId).to(function (res2) {
                return {
                    success: true,
                    message: 'Students fetched!',
                    data: res2.sort(function (a, b) {
                        return a.rollNo - b.rollNo;
                    })
                }
            })
        })
    }

    getStudentsCount(params) {

        let schoolId = params.schoolId;
        console.log('param.schoolId', params.schoolId)
        if (!schoolId) {
            return deferred.failure('SchoolID not provided');
        }
        return Student.getStudentsCountFromSchoolId(schoolId).to(function (stu) {
            if (!stu) {
                stu = 0;
            }

            return {
                success: true,
                message: "Students count fetched!",
                data: stu
            }
        })
    }

}

function getAllMonths(start, dojMonth) {

    let allMonths = [];
    const dateStart = moment(start, 'YYYY-MM-DD');
    for (let i = 0; i < 12; i++) {
        allMonths.push(dateStart.format('MMMM').toLowerCase());
        dateStart.add(1, 'month');
    }
    let diff = allMonths.findIndex(val => val === dojMonth);
    console.log('diff', diff);
    return allMonths.map((x, ind) => {
        const tmp = {
            name: x,
            selected: true
        };
        if (ind < diff) {
            tmp.selected = false;
        }
        return tmp;
    });
}

function getAllMonthsSetting(diff, transMonth) {
    console.log('transMonth', transMonth);
    console.log('diff', diff);
    return transMonth.map((x, ind) => {
        if (ind < diff) {
            x.selected = false;
        }
        return x;
    });

}

module.exports = StudentAPI;
