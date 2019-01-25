let deferred = require('../lib/common-utils/deferred');
let moment = require('moment');
let _ = require('lodash');
let School = require('../models/mongo/repo/master').school;
let User = require('../models/mongo/repo/master').user;
let Session = require('../models/mongo/repo/master').session;
let jsonexport = require('jsonexport');
let fs = require('fs');
let receipt = require('../services/receiptService').getInstance();
let Sms = require('../services/smsService').getInstance();
let Student = require('../models/mongo/repo/master').student;
let Cls = require('../models/mongo/repo/master').cls;
let Auth = require('./authAPI');
let auth = new Auth();

class SchoolAPI {
    addSchool(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.name) {
            return deferred.failure("no school name!")
        }
        if (!postObj.contact || !postObj.contact.email || !postObj.contact.email[0]) {
            return deferred.failure("no contact info!")
        }
        // if (!postObj.username) {
        //     return deferred.failure("no user name!")
        // }
        // if (!postObj.password) {
        //     return deferred.failure("no password!")
        // }
        if (!postObj.status) {
            return deferred.failure("no status!")
        }
        let schoolObj = {
            name: postObj.name,
            establishedYear: postObj.establishedYear,
            contact: postObj.contact,
            address: postObj.address,
            affiliation: postObj.affiliation,
            location: postObj.location,
            createdById: postObj.createdById,
            status: postObj.status
        };
        let userCreated = deferred.success({});
        if (postObj.username && postObj.password) {
            let userObj = {
                username: postObj.username,
                password: postObj.password,
                email: postObj.contact.email && postObj.contact.email[0],
                mobile: postObj.contact.phone[0],
                userType: {
                    category: "admin",
                    type: "school"
                },
                createdById: postObj.createdById
            };
            userCreated = auth.signUp({post: userObj, ip: params.ip});
        }
        return userCreated.to(function (res) {
            console.log('res', res);
            if (res && res.data && res.data._id) {
                schoolObj.loginId = res.data._id;
            }
            return School.createSchool(schoolObj).to(function (res2) {
                return {
                    success: true,
                    message: "School Created Successfully!",
                    data: {user: res, school: res2}
                }
            })
        });
    }


    addOrgSchool(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.name) {
            return deferred.failure("no school name!")
        }
        if (!postObj.contact || !postObj.contact.email || !postObj.contact.email[0]) {
            return deferred.failure("no contact info!")
        }
        if (!postObj.username) {
            return deferred.failure("no user name!")
        }
        if (!postObj.password) {
            return deferred.failure("no password!")
        }
        let schoolObj = {
            name: postObj.name,
            establishedYear: postObj.establishedYear,
            contact: postObj.contact,
            address: postObj.address,
            affiliation: postObj.affiliation,
            location: postObj.location,
            createdById: postObj.createdById,
            isOrganization:postObj.isOrganization,
            organizationName:postObj.organizationName,
            organizationId: postObj.organizationId
        };
        let userCreated = deferred.success({});
        if (postObj.username && postObj.password) {
            let userObj = {
                username: postObj.username,
                password: postObj.password,
                email: postObj.contact.email && postObj.contact.email[0],
                mobile: postObj.contact.phone[0],
                userType: {
                    category: "admin",
                    type: "school"
                },
                createdById: postObj.createdById
            };
            userCreated = auth.signUp({post: userObj, ip: params.ip});
        }
        return userCreated.to(function (res) {
            console.log('res', res);
            if (res && res.data && res.data._id) {
                schoolObj.loginId = res.data._id;
            }
            return School.createSchool(schoolObj).to(function (res2) {
                return {
                    success: true,
                    message: "School Created Successfully!",
                    data: {user: res, school: res2}
                }
            })
        });
    }

    editSchool(params) {
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
        postObj.updatedAt = new Date();
        let userCreated = deferred.success({});
        if (postObj.username && postObj.password) {
            userCreated = User.findUserByUserName(postObj.username).to(function (userRes) {
                if (userRes && userRes.username) {
                    return userRes;
                } else {
                    let userObj = {
                        username: postObj.username,
                        password: postObj.password,
                        email: postObj.contact.email && postObj.contact.email[0],
                        mobile: postObj.contact.phone[0],
                        userType: {
                            category: "admin",
                            type: "school"
                        },
                        createdById: postObj.createdById
                    };
                    return auth.signUp({post: userObj, ip: params.ip});
                }
            });
        }
        return userCreated.to(function (res) {
            console.log('res', res);
            if (res && res._id) {
                postObj.loginId = res._id;
            }
            if (res && res.data && res.data._id) {
                postObj.loginId = res.data._id;
            }
            delete postObj.username;
            delete postObj.password;
            return School.updateSchoolById(postObj._id, postObj).to(function (res) {
                return {
                    success: true,
                    message: "School Edited!!",
                    data: res
                }
            });
        });
    }

    deleteSchool(params) {
        console.log("params.post", params.post);
        let schoolId = params.schoolId;
        if (!schoolId) {
            return {
                success: false,
                message: "No school id!"
            }
        }
        return School.getSchoolById(schoolId).to(function (res) {
            let loginId = res.loginId;
            let deactivateUser = deferred.success({});
            if (loginId) {
                deactivateUser = User.deactivateUserById(loginId);
            }
            let deleteSchoolData = School.deleteSchoolById(schoolId);
            return deferred.combine({
                deactivateUser: deactivateUser,
                deleteSchool: deleteSchoolData
            }).to(function (res) {
                return {
                    success: true,
                    message: "School Deleted!!",
                    data: res
                }
            })
        });
    }

    getById(params) {
        let id = params.id;
        return School.getSchoolById(id).to(function (res) {
            if (res.loginId) {
                return User.findUserById(res.loginId).to(userRes => {
                    let toSend = JSON.parse(JSON.stringify(res));
                    toSend.username = userRes.username;
                    return {
                        success: true,
                        message: "School fetched!",
                        data: toSend
                    }
                })
            }
            return {
                success: true,
                message: "School fetched!",
                data: res
            }
        })
    }

    getAllSchools(params) {
        console.log("params.query", params.query);
        let start = params.query.start || 0;
        let limit = params.query.limit || 10;
        return School.getSchools(parseInt(start), parseInt(limit)).to(function (res) {
            let allCreatedBy = res.reduce((a, p) => {
                if (p.createdById && a.indexOf(p.createdById) === -1) {
                    a.push(p.createdById);
                }
                return a;
            }, []);
            let allLoginIds = res.reduce(function (a, val) {
                if (val.loginId) {
                    a.push(val.loginId);
                }
                return a;
            }, []);
            console.log('allCreatedBy', allCreatedBy);
            console.log('allLoginIds', allLoginIds);
            let allIds = _.union(allCreatedBy, allLoginIds);
            console.log('allIds', allIds);
            return User.findUsersNameByIds(allIds).to(function (userRes) {
                let idUserNameMap = userRes.reduce((a, p) => {
                    a[p._id] = p.username;
                    return a;
                }, {});
                console.log('idUserNameMap', idUserNameMap);
                res = res.map(val => {
                    val.createdBy = idUserNameMap[val.createdById];
                    val.userName = idUserNameMap[val.loginId];
                    return val;
                });
                return {
                    success: true,
                    message: "All school fetched.",
                    data: res
                }
            })

        })
    }
     getOrganizationAllSchools(params) {
        console.log("params",params);
        let organizationId = params.organizationId;
        if (!organizationId) {
            return deferred.failure('organizationId id not provided');
        }
        return School.getOrganizationSchool(organizationId).to(function (res) {
            return {
                success: true,
                message: "Schools fetched!",
                data: res
            }
        })
    }
    setCurrentSession(params) {
        let postData = params.post;
        if (!postData || !postData.sessionId || !postData.schoolId) {
            return deferred.failure('Session Id not present');
        }
        return School.setCurrentSessionBySchool(postData.schoolId, postData.sessionId).to(function (res) {
            return {
                success: true,
                message: "Current Session Saved!",
                data: res
            }
        })
    }

    getSchoolCount(params) {
        return School.getTotalSchool().to(function (res) {
            return {
                success: true,
                message: "All school count fetched.",
                data: res
            }
        })
    }

    sendBulkSms(params) {
        let postParams = params.post;
        if (!postParams) {
            return deferred.failure('No params!');
        }
        if (!postParams.schoolId) {
            return deferred.failure('No School Id!');
        }
        if (!postParams.text) {
            return deferred.failure('No SMS Text!');
        }
        if (!postParams.language) {
            return deferred.failure('No language present!');
        }
        if (!postParams.createdById) {
            return deferred.failure('No createdBy Id!');
        }
        if ((!postParams.studentIdArr || !postParams.studentIdArr.length) &&
            (!postParams.teacherIdArr || !postParams.teacherIdArr.length) &&
            (!postParams.staffIdArr || !postParams.staffIdArr.length)) {
            return deferred.failure('No Contact found!');
        }
        let studentData = deferred.success([]);
        let teacherData = deferred.success([]);
        let staffData = deferred.success([]);
        if (postParams.studentIdArr && postParams.studentIdArr.length) {
            studentData = Student.getStudentNumberByIds(postParams.studentIdArr);
        }
        if (postParams.teacherIdArr && postParams.teacherIdArr.length) {
            teacherData = Student.getTeacherNumberByIds(postParams.teacherIdArr);
        }
        if (postParams.staffIdArr && postParams.staffIdArr.length) {
            staffData = Student.getStaffNumberByIds(postParams.staffIdArr);
        }
        return deferred.combine({
            studentData: studentData,
            teacherData: teacherData,
            staffData: staffData
        }).to(function (combRes) {
            let allStudentNumbers = combRes.studentData.map(x => x.emergencyContactNo);
            let allTeacherNumbers = combRes.teacherData.map(x => x.emergencyContactNo);
            let allStaffNumbers = combRes.staffData.map(x => x.emergencyContactNo);
            let allNumbers = _.union(allStudentNumbers, allTeacherNumbers, allStaffNumbers);
            console.logger.info('allNumbers collected by emergencyContactNo', allNumbers);
            console.logger.info('allNumbers collected by emergencyContactNo length', allNumbers.length);
            let smsLength = postParams.text.length;
            let totalSms = 0;
            if (postParams.language === 'eng') {
                totalSms = Math.ceil((smsLength * 1.0) / 160);
            } else {
                totalSms = Math.ceil((smsLength * 1.0) / 70);
            }
            totalSms = totalSms * allNumbers.length;
            postParams.text.replace(/\s\s+/g, ' ');
            return School
                .getSchoolById(postParams.schoolId)
                .to(function (schoolInfo) {
                    let schoolSms = schoolInfo.smsCount;
                    if (schoolSms.total < schoolSms.used + totalSms) {
                        return deferred.failure("You don't have " +
                            "enough sms balance. You need " +
                            (schoolSms.used + totalSms -
                                schoolSms.total) + " more sms!");
                    } else {
                        let smsSent = deferred.success({});
                        let smsData = {
                            schoolId: postParams.schoolId,
                            sessionId: schoolInfo.currentSession,
                            createdById: postParams.createdById
                        };
                        if (postParams.language === 'eng') {
                            smsSent = Sms.sendSingleSms(allNumbers.join(','), postParams.text, smsData);
                        } else {
                            smsSent = Sms.sendSingleSmsUnicode(allNumbers.join(','), postParams.text, smsData);
                        }
                        return smsSent;
                    }
                })
        })
    }

    saveAccountantFees(params) {
        let postParams = params.post;
        if (!postParams || !postParams.length) {
            return deferred.failure('No params!');
        }
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        let studentId = postParams[0].studentId;
        let createdById = postParams[0].createdById;
        let fileName = postParams[0].fileName;
        let paymentMode = postParams[0].paymentMode;
        let classId = postParams[0].classId;
        console.log('saveFees postParams', postParams);
        let allIds = postParams.reduce((a, p) => {
            if (p._id) {
                a.push(p._id);
            }
            return a;
        }, []);
        let deleteFees = School.deleteAccountantFeesArr(allIds);
        let studentData = Student.getStudentByStudentId(studentId);
        return deferred.combine({
            deleteFees: deleteFees,
            studentData: studentData
        })
            .to(combRes => {
                let sd = combRes.studentData;
                return School.addAccountantFees(postParams)
                    .to(function (res) {
                        let totalFeeData = postParams.reduce((a, p) => {
                            if (!p.isAlreadyCollected && p.toCollect) {
                                a.total += p.amount;
                                a.monthArr.push(p.month);
                            }
                            return a;
                        }, {total: 0, monthArr: []});
                        // let smsText = `Dear Parents,\nAcademic fees of ${sd.name} has been collected. Amount Paid Rs. ${totalFeeData.total} via ${paymentMode.toUpperCase()}.Please download receipt @ https://inforida.in/feereceipt/${fileName}.\nRegards\nInforida`;
                        let smsText = `Dear Parents,\nAcademic fees of ${sd.name} has been collected. Amount Paid is Rs. ${totalFeeData.total} via ${paymentMode.toUpperCase()}. Thanks for payment.\nRegards\nInforida`;
                        let smsData = {
                            schoolId: schoolId,
                            sessionId: sessionId,
                            createdById: createdById
                        };
                        let toShowAccountant = {
                            total: totalFeeData.total,
                            fileName: fileName,
                            schoolId: schoolId,
                            sessionId: sessionId,
                            studentId: studentId,
                            classId: classId,
                            feesIds: res.map(x => x._id.toString()),
                            paymentMode: paymentMode,
                            createdById: createdById
                        };
                        let toShowAcc = School.addAccountantShowFees(toShowAccountant);
                        let smsSent = Sms.sendSingleSms(sd.emergencyContactNo, smsText, smsData);
                        return deferred.combine({
                            toShowAcc: toShowAcc,
                            smsSent: smsSent
                        }).to(function (cal) {
                            return {
                                success: true,
                                message: "Fees collected successfully!!",
                                data: res
                            }
                        })
                    })
                    .toFailure(err => {
                        console.log('err', err);
                        return err;
                    });
            })
    }

    saveFees(params) {
        let postParams = params.post;
        if (!postParams || !postParams.length) {
            return deferred.failure('No params!');
        }
        console.log('saveFees postParams', postParams);
        let schoolId = postParams[0].schoolId;
        let sessionId = postParams[0].sessionId;
        let classId = postParams[0].classId;
        return School.deleteSchoolFees(schoolId, sessionId, classId)
            .to(function (del) {
                console.log('del', del);
                return School.addSchoolFees(postParams)
                    .to(function (res) {
                        let allStudents = Student.getStudentBySchoolClassSession(schoolId, classId, sessionId);
                        let allStudentFees = Student.getStudentFeesBySchoolClassSession(schoolId, classId, sessionId);
                        return deferred.combine({
                            allStudents: allStudents,
                            allStudentFees: allStudentFees,
                        }).to(function (combRes) {
                            allStudents = combRes.allStudents.map(x => x._id.toString());
                            allStudentFees = combRes.allStudentFees.map(x => x.studentId.toString());
                            let remainingStudents = _.difference(allStudents, allStudentFees);
                            let toInsertFeesData = remainingStudents.reduce((a, p) => {
                                res.forEach(val => {
                                    a.push({
                                        sessionId: sessionId,
                                        studentId: p,
                                        schoolId: schoolId,
                                        classId: classId,
                                        feeData: val.feeData,
                                        createdById: val.createdById
                                    })
                                });
                                return a;
                            }, []);
                            if (toInsertFeesData.length) {
                                return Student.createStudentFees(toInsertFeesData)
                                    .to(stuFee => {
                                        return {
                                            success: true,
                                            message: "Fees edited successfully!",
                                            data: res
                                        }
                                    })
                            }
                            return {
                                success: true,
                                message: "Fees edited successfully!",
                                data: res
                            }

                        });
                    })
                    .toFailure(err => {
                        console.log('err', err);
                        return err;
                    });
            })

    }

    getTotalFeesCollected(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;

        return School.getTotalCollectedFees(schoolId, sessionId)
            .to(res => {
                if (res[0] && res[0].totalFee) {
                    return {
                        success: true,
                        message: "Fees fetched Successfully!!",
                        data: res[0].totalFee
                    }
                } else {
                    return {
                        success: true,
                        message: "Fees fetched Successfully!!",
                        data: 0
                    }
                }

            })
    }

    getTodayClassAttendanceList(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        let today = moment().tz('Asia/Calcutta');
        let allClasses = Cls.getClassesBySchool(schoolId);
        let classAttendance = School.getClassAttendance(schoolId, sessionId, today.format('DD-MM-YYYY'));
        return deferred.combine({
            allClasses: allClasses,
            classAttendance: classAttendance,
        }).to(combRes => {
            let allClassIds = combRes.allClasses.map(val => val._id.toString());
            let classNameMap = combRes.allClasses.reduce((a, p) => {
                a[p._id] = p.name;
                return a;
            }, {});
            let takenByIds = combRes.classAttendance.reduce((a, p) => {
                if (p.takenBy) {
                    a.push(p.takenBy);
                }
                return a;
            }, []);
            console.log('combRes', combRes);
            console.log('allClasses', combRes.allClasses);
            console.log('allClassIds', allClassIds);
            console.log('takenByIds', takenByIds);
            console.log('classNameMap', classNameMap);
            let users = deferred.success({});
            if (takenByIds.length) {
                users = User.findUsersNameByIds(takenByIds).to(function (usRes) {
                    console.log('usRes', usRes);
                    return usRes.reduce((a, p) => {
                        a[p._id] = p.username;
                        return a;
                    }, {})
                })
            }
            let allStudents = Student.getTotalStudentByClassIds(allClassIds, sessionId);
            return deferred.combine({
                users: users,
                allStudents: allStudents
            }).to(combResHere => {
                let stuCount = combResHere.allStudents;
                console.log('stuCount', stuCount);
                console.log('combResHere.users', combResHere.users);
                let classStudentCountMap = stuCount.reduce((a, p) => {
                    a[p._id] = p.total;
                    return a;
                }, {});
                console.log('classStudentCountMap', classStudentCountMap);
                if (!combRes.classAttendance || !combRes.classAttendance.length) {
                    return School.getClassAttendanceSetting(schoolId, sessionId)
                        .to(setRes => {
                            if (setRes && setRes.classData) {
                                let isTodayDay = setRes.days.some(val => {
                                    if (val.name.toLowerCase() === today.format('dddd').toLowerCase() &&
                                        val.selected) {
                                        return true;
                                    }
                                });
                                if (!isTodayDay) {
                                    return {
                                        success: false,
                                        message: 'Attendance list not fetched.',
                                        type: 'no day'
                                    }
                                }
                                let classAttendanceDataToCreate = setRes.classData.reduce((a, p) => {
                                    for (let i = 0; i < p.frequency; i++) {
                                        a.push({
                                            sessionId: sessionId,
                                            schoolId: schoolId,
                                            classId: p.classId,
                                            comment: '',
                                            date: today.format('DD-MM-YYYY')
                                        });
                                    }
                                    return a;
                                }, []);
                                return School.createClassAttendance(classAttendanceDataToCreate)
                                    .to(clsAtRes => {
                                        let toSend = JSON.parse(JSON.stringify(clsAtRes)).map(val => {
                                            val.className = classNameMap[val.classId] || '';
                                            val.totalStudents = classStudentCountMap[val.classId] || 0;
                                            return val;
                                        });
                                        return {
                                            success: true,
                                            message: 'Attendance List fetched.',
                                            data: toSend.sort((a, b) => {
                                                if (a.className < b.className) return -1;
                                                if (a.className > b.className) return 1;
                                                return 0;
                                            })
                                        }
                                    });
                            } else {
                                return {
                                    success: false,
                                    message: 'Attendance List not fetched.',
                                    type: 'no settings'
                                }
                            }
                        })
                } else {
                    let toSend = JSON.parse(JSON.stringify(combRes.classAttendance)).map(val => {
                        val.className = classNameMap[val.classId] || '';
                        if (val.takenBy) {
                            val.takenByName = combResHere.users[val.takenBy] || '';
                        }
                        val.totalStudents = classStudentCountMap[val.classId] || 0;
                        return val;
                    });
                    return {
                        success: true,
                        message: 'Attendance List fetched.',
                        data: toSend.sort((a, b) => {
                            if (a.className < b.className) return -1;
                            if (a.className > b.className) return 1;
                            return 0;
                        })
                    }
                }
            });
        });
    }

    getTodayClassAttendanceSummery(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        let today = moment().tz('Asia/Calcutta');
        let allClasses = Cls.getClassesBySchool(schoolId);
        let classAttendance = School.getClassAttendance(schoolId, sessionId, today.format('DD-MM-YYYY'));
        return deferred.combine({
            allClasses: allClasses,
            classAttendance: classAttendance,
        }).to(combRes => {
            let allClassIds = combRes.allClasses.map(val => val._id.toString());
            let classNameMap = combRes.allClasses.reduce((a, p) => {
                a[p._id] = p.name;
                return a;
            }, {});
            let takenByIds = combRes.classAttendance.reduce((a, p) => {
                if (p.takenBy) {
                    a.push(p.takenBy);
                }
                return a;
            }, []);
            console.log('combRes', combRes);
            console.log('allClasses', combRes.allClasses);
            console.log('allClassIds', allClassIds);
            console.log('takenByIds', takenByIds);
            console.log('classNameMap', classNameMap);
            let users = deferred.success({});
            if (takenByIds.length) {
                users = User.findUsersNameByIds(takenByIds).to(function (usRes) {
                    console.log('usRes', usRes);
                    return usRes.reduce((a, p) => {
                        a[p._id] = p.username;
                        return a;
                    }, {})
                })
            }
            let allStudents = Student.getTotalStudentByClassIds(allClassIds, sessionId);
            let allStudentsAttendance = School.getClassAttendanceBySchooSessionClassId(schoolId, sessionId, allClassIds, today.format('DD-MM-YYYY'));
            return deferred.combine({
                users: users,
                allStudents: allStudents,
                allStudentsAttendance: allStudentsAttendance
            }).to(combResHere => {
                let stuCount = combResHere.allStudents;
                console.log('stuCount', stuCount);
                console.log('combResHere.users', combResHere.users);
                console.log('combResHere.allStudentsAttendance', combResHere.allStudentsAttendance);
                let classStudentCountMap = stuCount.reduce((a, p) => {
                    a[p._id] = p.total;
                    return a;
                }, {});
                let classAbsentPresentMap = combResHere.allStudentsAttendance.reduce(function (a, p) {
                    if (!a[p.classAttendanceId]) {
                        a[p.classAttendanceId] = {absent: 0, present: 0, takenAt: p.createdAt}
                    }
                    if (p.status === 'present') {
                        a[p.classAttendanceId].present++;
                    } else {
                        a[p.classAttendanceId].absent++;
                    }
                    return a;
                }, {});
                // console.log('classStudentCountMap', classStudentCountMap);
                // console.log('classAbsentPresentMap', classAbsentPresentMap);

                let toSend = JSON.parse(JSON.stringify(combRes.classAttendance)).map(val => {
                    val.className = classNameMap[val.classId] || '';
                    if (val.takenBy) {
                        val.takenByName = combResHere.users[val.takenBy] || '';
                    }
                    val.totalStudents = classStudentCountMap[val.classId] || 0;
                    val.absentStudents = (classAbsentPresentMap[val._id.toString()] && classAbsentPresentMap[val._id.toString()].absent) || 0;
                    val.presentStudents = (classAbsentPresentMap[val._id.toString()] && classAbsentPresentMap[val._id.toString()].present) || 0;
                    val.takenAt = (classAbsentPresentMap[val._id.toString()] && classAbsentPresentMap[val._id.toString()].takenAt) || new Date();
                    return val;
                });
                toSend = toSend.filter(val => {
                    return val.totalStudents;
                });
                // console.log('toSend', toSend);
                return {
                    success: true,
                    message: 'Today Attendance List fetched.',
                    data: toSend.sort((a, b) => {
                        if (a.className < b.className) return -1;
                        if (a.className > b.className) return 1;
                        return 0;
                    })
                }

            });
        });
    }

    getTodayClassAttendanceReport(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        let classId = params.classId;
        let betweenDatesArr = params.post.dates;
        console.log('betweenDatesArr', betweenDatesArr);
        let allStudents = Student.getStudentByClassSession(classId, sessionId);
        let allStudentsAttendance = School.getClassAttendanceBySchooSessionClassIdDateArr(schoolId, sessionId, classId, betweenDatesArr);
        return deferred.combine({
            allStudents: allStudents,
            allStudentsAttendance: allStudentsAttendance
        }).to(combResHere => {
            console.log('combResHere.allStudents', combResHere.allStudents);
            console.log('combResHere.allStudentsAttendance', combResHere.allStudentsAttendance);
            if (!combResHere.allStudentsAttendance.length) {
                return {
                    success: false,
                    message: 'No attendance present!',
                }
            }
            let classAbsentPresentMap = combResHere.allStudentsAttendance.reduce(function (a, p) {
                if (!a[p.studentId]) {
                    a[p.studentId] = betweenDatesArr.reduce((acc, pre) => {
                        acc[pre] = '';
                        return acc;
                    }, {})
                }
                if (a[p.studentId][p.date] !== 'A') {
                    a[p.studentId][p.date] = p.status[0].toUpperCase();
                }
                return a;
            }, {});
            // console.log('classStudentCountMap', classStudentCountMap);
            console.log('classAbsentPresentMap', classAbsentPresentMap);

            let toSend = JSON.parse(JSON.stringify(combResHere.allStudents)).map(val => {
                let temp = {};
                temp._id = val._id;
                temp.name = val.name;
                temp.attendance = classAbsentPresentMap[val._id.toString()];
                temp.rollNo = val.schoolDetail.rollNo;
                temp.admissionNumber = val.schoolDetail.admissionNumber;
                return temp;
            });
            return {
                success: true,
                message: 'Attendance List fetched.',
                data: toSend.sort((a, b) => {
                    if (a.rollNo && b.rollNo) {
                        return parseInt(a.rollNo, 10) - parseInt(b.rollNo, 10);
                    } else {
                        return parseInt(a.admissionNumber, 10) - parseInt(b.admissionNumber, 10);
                    }
                })
            }
        });

    }

    getClassAttendanceList(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        let date = moment(params.date, 'DD-MM-YYYY').tz('Asia/Calcutta').format('DD-MM-YYYY');
        let allClasses = Cls.getClassesBySchool(schoolId);
        let classAttendance = School.getClassAttendance(schoolId, sessionId, date);
        return deferred.combine({
            allClasses: allClasses,
            classAttendance: classAttendance,
        }).to(combRes => {
            if (!combRes.classAttendance || !combRes.classAttendance.length) {
                return {
                    success: true,
                    message: 'Attendance List fetched.',
                    data: []
                }
            }
            let allClassIds = combRes.allClasses.map(val => val._id.toString());
            let classNameMap = combRes.allClasses.reduce((a, p) => {
                a[p._id] = p.name;
                return a;
            }, {});
            let takenByIds = combRes.classAttendance.reduce((a, p) => {
                if (p.takenBy) {
                    a.push(p.takenBy);
                }
                return a;
            }, []);
            console.log('combRes', combRes);
            console.log('allClasses', combRes.allClasses);
            console.log('allClassIds', allClassIds);
            console.log('takenByIds', takenByIds);
            console.log('classNameMap', classNameMap);
            let users = deferred.success({});
            if (takenByIds.length) {
                users = User.findUsersNameByIds(takenByIds).to(function (usRes) {
                    console.log('usRes', usRes);
                    return usRes.reduce((a, p) => {
                        a[p._id] = p.username;
                        return a;
                    }, {})
                })
            }
            let allStudents = Student.getTotalStudentByClassIds(allClassIds, sessionId);
            return deferred.combine({
                users: users,
                allStudents: allStudents
            }).to(combResHere => {
                let stuCount = combResHere.allStudents;
                console.log('stuCount', stuCount);
                console.log('combResHere.users', combResHere.users);
                let classStudentCountMap = stuCount.reduce((a, p) => {
                    a[p._id] = p.total;
                    return a;
                }, {});
                console.log('classStudentCountMap', classStudentCountMap);
                let toSend = JSON.parse(JSON.stringify(combRes.classAttendance)).reduce((a, val) => {
                    val.className = classNameMap[val.classId] || '';
                    if (val.takenBy) {
                        val.takenByName = combResHere.users[val.takenBy] || '';
                    }
                    val.totalStudents = classStudentCountMap[val.classId] || 0;
                    if (!val.toTake) {
                        a.push(val);
                    }
                    return a;
                }, []);
                return {
                    success: true,
                    message: 'Attendance List fetched.',
                    data: toSend.sort((a, b) => {
                        if (a.className < b.className) return -1;
                        if (a.className > b.className) return 1;
                        return 0;
                    })
                }

            });
        });
    }

    getAttendanceListToTake(params) {
        let listId = params.listId;
        return School.getClassAttendanceById(listId).to(attendanceListData => {
            console.log('attendanceListData', attendanceListData);
            if (!attendanceListData ||
                !attendanceListData.classId ||
                !attendanceListData.schoolId ||
                !attendanceListData.sessionId) {
                return {
                    success: false,
                    message: 'This id does not exists'
                }
            }
            let classData = Cls.getClassesById(attendanceListData.classId);
            let stuData = Student.getStudentByClassSession(attendanceListData.classId, attendanceListData.sessionId);

            return deferred.combine({
                classData: classData,
                stuData: stuData
            }).to(combRes => {
                console.log('combRes', combRes);
                let toSend = JSON.parse(JSON.stringify(attendanceListData));
                toSend.className = combRes.classData.name;
                toSend.studentList = combRes.stuData.map(val => {
                    val.isPresent = true;
                    return val;
                }).sort((a, b) => {
                    if (a.schoolDetail.rollNo && b.schoolDetail.rollNo) {
                        return parseInt(a.schoolDetail.rollNo, 10) - parseInt(b.schoolDetail.rollNo, 10);
                    } else {
                        return parseInt(a.schoolDetail.admissionNumber, 10) - parseInt(b.schoolDetail.admissionNumber, 10);
                    }
                });
                return {
                    success: true,
                    message: 'Attendance Fetched!',
                    data: toSend
                }
            });
        });
    }

    getAttendanceListToView(params) {
        let listId = params.listId;
        return School.getClassAttendanceTakenByAttId(listId).to(attendanceData => {
            console.log('attendanceData', attendanceData);
            if (!attendanceData ||
                !attendanceData.length) {
                return {
                    success: false,
                    message: 'No Data Found'
                }
            } else {
                return {
                    success: true,
                    message: 'Attendance Fetched!',
                    data: attendanceData.sort((a, b) => {
                        return parseInt(a.rollNo, 10) - parseInt(b.rollNo, 10);
                    })
                }
            }
        });
    }

    getFeeReceipt(req, res) {
        console.log('req.params', req.params);
        let toSendData = req.body;
        console.log('toSendData', toSendData);
        toSendData.date = moment().tz('Asia/Calcutta').format("DD-MMMM-YYYY");
        toSendData.recNo = toSendData.schoolName.substring(0, 3).toUpperCase() + '-' + Date.now();
        console.log('toSendData', toSendData);
        // res.send(toSendData);
        let stu = toSendData;
        let fileName = stu.studentName + '-' + stu.studentClass + '-' + stu.recNo + '-' + stu.date + '-fees-receipt';
        res.render('../templates/feeReceipt.jade', toSendData,
            function (err, result) {
                console.log('err', err);
                console.log('result', result);
                receipt.generateFeeReceipt(result, fileName).then(fileRes => {
                    res.send({filename: fileRes});
                    // res.sendfile(fileRes, {root: './public/feereceipt'});
                })
            }
        )
    }

    saveClassAttendanceTaken(params) {
        let postData = params.post;
        let schoolId = params.post[0].schoolId;
        let sessionId = params.post[0].sessionId;
        let schoolName = params.post[0].schoolName;
        let takenBy = params.post[0].createdById;
        let listId = params.post[0].classAttendanceId;
        let isSms = params.post[0].isSms;
        console.log('schoolId', schoolId);
        console.log('sessionId', sessionId);
        let studentIdNameNoMap = postData.reduce(function (a, p) {
            console.log('p', p);
            a.push({
                name: p.name,
                schoolName: schoolName,
                contact: p.emergencyContactNo,
                date: p.date,
                status: p.status,
                schoolId: schoolId,
                createdById: p.createdById,
                sessionId: p.sessionId,
                isSms: p.isSms
            });
            return a;
        }, []);
        console.log('studentIdNameNoMap', studentIdNameNoMap);
        let smsDef = {
            update: School.updateClassAttendanceTakenById(listId, {
                toTake: false,
                takenBy: takenBy,
                isSms: isSms
            })
        };
        return School.getSchoolSettings(schoolId, sessionId).to(setRes => {
            console.log('setRes', setRes);
            studentIdNameNoMap.forEach(function (val, index) {
                if (val.status === 'absent' && val.isSms) {
                    let data = {
                        schoolId: val.schoolId,
                        sessionId: val.sessionId,
                        createdById: val.createdById
                    };

                    if (setRes.smsLanguage === 'hin') {
                        let msg = val.date + "\nप्रिय अभिभावक,\nआपका पाल्य " +
                            val.name.split([' '])[0] + " विद्यालय में अनुपस्थित है" +
                            ".\nसादर\n" + (setRes.attendanceSignature || val.schoolName);
                        smsDef[index] = Sms.sendSingleSmsUnicode(val.contact, msg, data);
                    } else {
                        let msg = "Dear Parent,\nYour ward "
                            + val.name.split([' '])[0] +
                            " has not attended school on " + val.date +
                            ".\nRegards\n" + (setRes.attendanceSignature || val.schoolName);
                        smsDef[index] = Sms.sendSingleSms(val.contact, msg, data);
                    }
                }
            });
            return deferred.combine(smsDef).to(function (defCombRes) {
                console.log('defCombRes', defCombRes);
                return School.createClassAttendanceTaken(postData).to(attendanceListData => {
                    return {
                        success: true,
                        message: 'Attendance Saved!',
                        data: attendanceListData
                    };
                });
            });
        });
    }

    savePeriod(params) {
        let postParams = params.post;
        if (!postParams || !postParams.length) {
            return deferred.failure('No params!');
        }
        console.log('savePeriod postParams', postParams);
        return School.addSchoolPeriods(postParams).to(function (res) {
            return {
                success: true,
                message: "Period Saved Successfully!!",
                data: res
            }
        }).toFailure(err => {
            console.log('err', err);
            return err;
        });

    }

    getPeriods(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        return School.getSchoolPeriodClasses(schoolId, sessionId).to(function (res) {
            return {
                success: true,
                message: "Period Saved Successfully!!",
                data: res
            }
        }).toFailure(err => {
            console.log('err', err);
            return err;
        });

    }

    getPeriodsByClassAndSchool(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        let sessionId = params.sessionId;
        if (!schoolId || !sessionId || !classId) {
            return deferred.failure('No params!');
        }
        return School.getSchoolPeriods(schoolId, classId, sessionId)
            .to(function (res) {
                console.log('getSchoolPeriods res', res);
                if (res) {
                    return {
                        success: true,
                        message: "Periods fetched Successfully!!",
                        data: res
                    }
                } else {
                    return {
                        success: false,
                        message: "No Period found!!",
                    }
                }

            })
            .toFailure(err => {
                console.log('err', err);
                return err;
            });
    }

    getFees(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        let sessionId = params.sessionId;
        if (!schoolId || !sessionId || !classId) {
            return deferred.failure('No params!');
        }
        return School.getSchoolFees(schoolId, classId, sessionId)
            .to(function (res) {
                return {
                    success: true,
                    message: "Fees fetched Successfully!!",
                    data: res
                }
            })
            .toFailure(err => {
                console.log('err', err);
                return err;
            });
    }

    getFeesLedger(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        let sessionId = params.sessionId;
        if (!schoolId || !sessionId || !classId) {
            return deferred.failure('No params!');
        }
        let allStudents = Student.getStudentBySchoolClassSession(schoolId, classId, sessionId);
        let allStudentsFees = Student.getStudentFeesBySchoolClassSession(schoolId, classId, sessionId);
        let allCollectedFees = School.getCollectedFee(schoolId, classId, sessionId);
        let sessionData = Session.getSessionsBySessionId(sessionId);
        return deferred.combine({
            allStudents: allStudents,
            allStudentsFees: allStudentsFees,
            allCollectedFees: allCollectedFees,
            sessionData: sessionData
        }).to(function (combRes) {
            // console.log('combRes', JSON.stringify(combRes));
            let sessionData = combRes.sessionData;
            let studentData = combRes.allStudents;
            let studentFessData = combRes.allStudentsFees;
            let collectedData = combRes.allCollectedFees;
            let sessionStartDate = moment(sessionData.startDate.day + '-' + sessionData.startDate.month + '-' + sessionData.startDate.year, 'DD-MM-YYYY');
            let allMonths = [sessionStartDate.format('MMMM-YY')];
            for (let i = 1; i < 12; i++) {
                allMonths.push(sessionStartDate.add(1, 'month').format('MMMM-YY'));
            }
            let studentTotalYearlyFees = studentFessData.reduce(function (a, p) {
                // console.log('p', p);
                console.log('studentId', p.studentId);
                console.log('p.feeData.type', p.feeData.type);
                console.log('p.feeData.type', p.feeData.type);
                if (!a[p.studentId]) {
                    a[p.studentId] = 0;
                }
                if (p.feeData.type === 'admission') {
                    a[p.studentId] += p.feeData.amount;
                } else {
                    let totalMonthsToCollect = p.feeData.months.reduce((acc, pre) => {
                        if (pre.selected) {
                            acc++;
                        }
                        return acc;
                    }, 0);
                    a[p.studentId] += (totalMonthsToCollect * p.feeData.amount);
                }
                return a;
            }, {});

            let studentMonthWiseCollected = collectedData.reduce(function (a, p) {
                if (!a[p.studentId]) {
                    a[p.studentId] = allMonths.reduce(function (acc, val) {
                        acc[val] = 0;
                        return acc;
                    }, {});
                    a[p.studentId].totalCollected = 0;
                    a[p.studentId].total = studentTotalYearlyFees[p.studentId];
                }
                // console.log('total', p.total);
                // console.log('moment(p.createdAt).format(\'MMMM-YY\')', moment(p.createdAt).format('MMMM-YY'));
                a[p.studentId][moment(p.createdAt).format('MMMM-YY')] += p.total;
                a[p.studentId].totalCollected += p.total;
                return a;
            }, {});

            let toSend = studentData.map(val => {
                let temp = {};
                temp.rollNo = val.schoolDetail.rollNo;
                temp.srnNo = val.schoolDetail.srnNo;
                temp.admissionNumber = val.schoolDetail.admissionNumber;
                temp.name = val.name;
                temp.feeData = studentMonthWiseCollected[val._id.toString()];
                if (!temp.feeData) {
                    temp.feeData = allMonths.reduce((a, p) => {
                        a[p] = 0;
                        return a;
                    }, {});
                    temp.feeData.totalCollected = 0;
                    temp.feeData.total = studentTotalYearlyFees[val._id.toString()];
                }
                return temp;
            });
            return {
                success: true,
                message: "Ledger fetched Successfully!",
                data: toSend.sort((a, b) => {
                    if (a.rollNo && b.rollNo) {
                        return parseInt(a.rollNo, 10) - parseInt(b.rollNo, 10);
                    } else {
                        return parseInt(a.admissionNumber, 10) - parseInt(b.admissionNumber, 10);
                    }
                })
            }
        })
    }

    getFeesLedgerCsv(req, res) {
        let postData = req.body;
        let fileName = postData.fileName;
        let csvJson = postData.data;
        jsonexport(csvJson, function (err, csv) {
            if (err) return console.log(err);
            console.log(csv);
            fs.writeFile('./public/feesledger/' + fileName + '.csv', csv, function (err) {
                if (err) throw err;
                res.send({
                    success: true,
                    file: fileName + '.csv'
                });
                console.log('Saved!');
            });
        });
    }

    getAttendanceReportCsv(req, res) {
        let postData = req.body;
        let fileName = postData.fileName;
        let csvJson = postData.data;
        jsonexport(csvJson, function (err, csv) {
            if (err) return console.log(err);
            console.log(csv);
            fs.writeFile('./public/attendancereport/' + fileName + '.csv', csv, function (err) {
                if (err) throw err;
                res.send({
                    success: true,
                    file: fileName + '.csv'
                });
                console.log('Saved!');
            });
        });
    }

    getSchoolSms(params) {
        let schoolId = params.schoolId;
        let endDate = moment(params.query.endDate, 'DD-MM-YYYY').add(1, 'days').tz('Asia/Calcutta').format();
        let startDate = moment(params.query.startDate, 'DD-MM-YYYY').tz('Asia/Calcutta').format();
        if (!schoolId || !endDate || !startDate) {
            return deferred.failure('No params!');
        }
        return School.getSchoolSmsBySchoolId(schoolId, endDate, startDate)
            .to(function (res) {
                return {
                    success: true,
                    message: "Sms data fetched Successfully!!",
                    data: res
                }
            })
            .toFailure(err => {
                console.log('err', err);
                return err;
            });
    }

    getAccountantFees(params) {
        let schoolId = params.schoolId;
        let studentId = params.studentId;
        let sessionId = params.sessionId;
        if (!schoolId || !sessionId || !studentId) {
            return deferred.failure('No params!');
        }
        return School.getAllAccountantFees(schoolId, studentId, sessionId)
            .to(function (res) {
                return {
                    success: true,
                    message: "Fees fetched Successfully!!",
                    data: res
                }
            })
            .toFailure(err => {
                console.log('err', err);
                return err;
            });
    }

    editFees(params) {
        let postParams = params.post;
        if (!postParams) {
            return deferred.failure('No params!');
        }
        if (!postParams._id) {
            return deferred.failure('No Fees Id!');
        }
        if (!postParams.schoolId) {
            return deferred.failure('No School Id!');
        }
        if (!postParams.sessionId) {
            return deferred.failure('No Session Id!');
        }
        if (!postParams.classId) {
            return deferred.failure('No classId!');
        }
        if (!postParams.createdById) {
            return deferred.failure('No createdBy Id!');
        }
        let fId = postParams._id;
        delete postParams._id;
        return Student
            .updateSchoolFees(fId, postParams)
            .to(function (res) {
                return {
                    success: true,
                    message: "Fees Updated Successfully!!",
                    data: res
                }
            });
    }

    deleteFees(params) {
        if (!params && params.feesId) {
            return deferred.failure('No params!');
        }
        return Student
            .deleteFeesById(params.feesId)
            .to(function (res) {
                return {
                    success: true,
                    message: "Fees Deleted Successfully!!",
                    data: res
                }
            });
    }

    getByLoginId(params) {
        let loginId = params.loginId;
        if (!loginId) {
            return deferred.failure('Login id not provided');
        }
        return School.getSchoolByLoginId(loginId).to(function (res) {
            return {
                success: true,
                message: "School fetched!",
                data: res
            }
        })
    }

    getByUserName(params) {
        let userName = params.userName;
        if (!userName) {
            return deferred.failure('User Name not provided!');
        }
        return User.findUserByUserName(userName).to(function (res) {
            if (res && res._id && res.userType.type === 'school' && res.userType.category === 'admin') {
                let loginId = res._id;
                return School.getSchoolByLoginId(loginId).to(function (scRes) {
                    return {
                        success: true,
                        message: "School fetched!",
                        data: scRes
                    }
                })
            } else {
                return {
                    success: false,
                    message: "No School present!"
                }
            }

        })
    }


    editSchoolSms(params) {
        console.log("editSchoolSms");
        // console.log("params", params);
        console.log("params.post", params.post);
        let postObj = params.post;
        let schoolId = params.schoolId;
        if (!postObj || !schoolId) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        return School.updateSchoolSmsById(schoolId, postObj.total || 0).to(function (res) {
            return {
                success: true,
                message: "School Edited!!",
                data: res
            }
        })
    }

    editSchoolStatus(params) {
        console.log("editSchoolStatus");
        // console.log("params", params);
        console.log("params.post", params.post);
        let postObj = params.post;
        let schoolId = params.schoolId;
        if (!postObj || !schoolId) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        return School.updateSchoolStatusById(schoolId, postObj.status).to(function (res) {
            return {
                success: true,
                message: "School Edited!!",
                data: res
            }
        })
    }

    getFeesCollection(params) {
        let schoolId = params.schoolId;
        let classId = params.classId;
        let sessionId = params.sessionId;
        if (!schoolId || !sessionId || !classId) {
            return deferred.failure('No params!');
        }
        return School.getCollectedFee(schoolId, classId, sessionId).to(function (res) {
            let toSendData = JSON.parse(JSON.stringify(res));
            let allStudent = toSendData.map(function (val) {
                return val.studentId.toString();
            });
            allStudent = _.union(allStudent);

            return Student.getStudentNameByStudentIdArr(allStudent)
                .to(function (res2) {
                    let studentNameMap = res2.reduce(function (a, p) {
                        a[p._id] = p.name;
                        return a;
                    }, {});

                    let data = toSendData.map(function (x) {
                        x.studentName = studentNameMap[x.studentId.toString()];
                        return x;
                    });
                    return {
                        success: true,
                        message: "fee collected fetched!",
                        data: data
                    }
                })
        })
    }


}

function fixedCharCodeAt(str, idx) {
    // ex. fixedCharCodeAt('\uD800\uDC00', 0); // 65536
    // ex. fixedCharCodeAt('\uD800\uDC00', 1); // false
    idx = idx || 0;
    const code = str.charCodeAt(idx);
    console.log('code', code);
    let hi, low;

    // High surrogate (could change last hex to 0xDB7F
    // to treat high private surrogates
    // as single characters)
    if (0xD800 <= code && code <= 0xDBFF) {
        hi = code;
        low = str.charCodeAt(idx + 1);
        if (isNaN(low)) {
            console.log('High surrogate not followed by ' +
                'low surrogate in fixedCharCodeAt()');
        }
        return ((hi - 0xD800) * 0x400) +
            (low - 0xDC00) + 0x10000;
    }
    if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
        // We return false to allow loops to skip
        // this iteration since should have already handled
        // high surrogate above in the previous iteration
        return false;
        // hi = str.charCodeAt(idx - 1);
        // low = code;
        // return ((hi - 0xD800) * 0x400) +
        //   (low - 0xDC00) + 0x10000;
    }
    let codeHex = code.toString(16).toUpperCase();
    while (codeHex.length < 4) {
        codeHex = '0' + codeHex;
    }
    return '&#x' + codeHex + ';'
}

module.exports = SchoolAPI;
