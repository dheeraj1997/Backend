let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let csvToJson = require('csvjson');
let fs = require('fs');
let School = require('../models/mongo/repo/master').school;
let Cls = require('../models/mongo/repo/master').cls;
let Teacher = require('../models/mongo/repo/master').teacher;
let User = require('../models/mongo/repo/master').user;
let Auth = require('./authAPI');
let auth = new Auth();

class TeacherAPI {

    saveTeacher(params) {
        console.log("params.post", params.post);
        let postObj = params.post;

        if (!postObj) {
            return deferred.failure("No post param!")
        }
        if (!postObj.name) {
            return deferred.failure("No teacher name!")
        }
        if (!postObj.username) {
            return deferred.failure("No user name!")
        }
        if (!postObj.password) {
            return deferred.failure("No password!")
        }
        if (!postObj.emergencyContactNo) {
            return deferred.failure("No emergency contact no!");
        }
        let userObj = {
            username: postObj.username,
            password: postObj.password,
            email: postObj.contact.email[0],
            mobile: postObj.contact.phone[0],
            userType: {
                category: "teacher",
                type: "school"
            },
            createdById: postObj.createdById
        };
        let teacherObj = {
            name: postObj.name,
            gender: postObj.gender,
            aadhaarId: postObj.aadhaarId,
            emergencyContactNo: postObj.emergencyContactNo,
            schoolId: postObj.schoolId,
            bloodGroup: postObj.bloodGroup,
            contact: postObj.contact,
            address: postObj.address,
            createdById: postObj.createdById
        };
        return auth.signUp({post: userObj}).to(function (res) {
            teacherObj.loginId = res.data._id;
            return Teacher.addTeacher(teacherObj).to(function (res) {
                return {
                    success: true,
                    message: "Teacher created successfully!",
                    data: res
                }
            })
        });
    }

    editTeacher(params) {
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
        return Teacher.updateTeacherById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Teacher Edited!!",
                data: res
            }
        })
    }

    deleteTeacher(params) {
        console.log("params.post", params.post);
        let teacherId = params.teacherId;
        if (!teacherId) {
            return {
                success: false,
                message: "No teacher id!"
            }
        }
        return Teacher.getTeacherById(teacherId).to(function (res) {
            let loginId = res.loginId;
            let deactivateUser = deferred.success({});
            if (loginId) {
                deactivateUser = User.deactivateUserById(loginId);
            }
            let deleteTeacher = Teacher.deleteTeacherById(teacherId);
            return deferred.combine({
                deactivateUser: deactivateUser,
                deleteTeacher: deleteTeacher
            }).to(function (res) {
                return {
                    success: true,
                    message: "Teacher Deleted!!",
                    data: res
                }
            })
        });
    }

    getByTeacherId(params) {
        let teacherId = params.teacherId;
        if (!teacherId) {
            return deferred.failure('Teacher id not provided.');
        }
        return Teacher.getTeacherById(teacherId).to(function (res) {
            return {
                success: true,
                message: "Teacher fetched!",
                data: res
            }
        })
    }

    getTeachersBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Teacher.getTeacherBySchool(schoolId).to(function (res) {
            let allLoginIds = res.reduce(function (a, val) {
                if (val.loginId) {
                    a.push(val.loginId);
                }
                return a;
            }, []);
            console.log('allLoginIds', allLoginIds);
            return User.findUsersNameByIds(allLoginIds).to(function (userRes) {
                let userIdNameMap = userRes.reduce((a, p) => {
                    a[p._id] = p.username;
                    return a;
                }, {});
                let toSend = JSON.parse(JSON.stringify(res));
                toSend = toSend.map(x => {
                    x.userName = userIdNameMap[x.loginId];
                    return x;
                });
                return {
                    success: true,
                    message: "Teachers fetched!",
                    data: toSend
                }
            });

        })
    }


    getTeachersByLoginId(params) {
        let loginId = params.loginId;
        if (!loginId) {
            return deferred.failure('Login id not provided');
        }
        return Teacher.getTeacherByLoginId(loginId).to(function (res) {
            return {
                success: true,
                message: "Teachers fetched!",
                data: res
            }
        })
    }


    getTeachersCountBySchoolId(params) {
        let schoolId = params.schoolId;
        console.log('param.schoolId', params.schoolId)
        if (!schoolId) {
            return deferred.failure('SchoolID not provided');
        }
        return Teacher.getTeachersCountFromSchoolId(schoolId).to(function (tea) {
            return {
                success: true,
                message: "Teacher count fetched!",
                data: tea || 0
            }
        })
    }

    uploadTeacherCsv(params) {
        let self = this;
        if (params.file && params.file.path) {
            let path = params.file.path;
            console.log('path', path);
            let format = path.split('.').pop();
            console.log('format', format);
            if (format !== 'csv') {
                return deferred.success({
                    success: false,
                    error: "Not CSV Format!"
                });
            }
            let postData = params.post;
            console.log('postData', postData);
            if (!postData.createdById) {
                return deferred.success({
                    success: false,
                    error: "Created By Id missing!"
                });
            }
            if (!postData.schoolId) {
                return deferred.success({
                    success: false,
                    error: "School Id missing!"
                });
            }

            let fileData = fs.readFileSync(path, {encoding: 'utf8'});

            let csvObj = csvToJson.toObject(fileData.replace(/\"/g, ''));

            console.log('csvObj', csvObj);
            let error = "";
            let isError = csvObj.some(function (val, index) {
                if (!val.name) {
                    error = "Name Not present at " + (index + 1) + " Position.";
                    return true;
                }

                if (!val.contactNo) {
                    error = "Contact Number Not " +
                        "present at " + (index + 1) + " Position.";
                    return true;
                }
                if (!val.username) {
                    error = "Username Not " +
                        "present at " + (index + 1) + " Position.";
                    return true;
                }
                if (!val.password) {
                    error = "Password  Not " +
                        "present at " + (index + 1) + " Position.";
                    return true;
                }
                return false;
            });
            if (isError) {
                return deferred.failure({
                    success: false,
                    error: error
                });
            }
            let allUserNames = csvObj.reduce(function (a, p) {
                if (p.username) {
                    a.push(p.username)
                }
                return a;
            }, []);
            //changeIt
            let dataToSaveTeacher = csvObj.map(function (val, ind) {
                console.log('ind', ind);
                val.createdById = postData.createdById;
                val.schoolId = postData.schoolId;
                val.contact = {
                    email: [],
                    phone: [val.contactNo]
                };
                val.emergencyContactNo = val.contactNo;
                val.nationality = val.nationality || 'indian';
                val.gender = val.gender || 'male';
                val.isBulk = true;
                delete val.contactNo;
                return val;
            });
            return User.findUserByUserNameArr(allUserNames)
                .to(function (userRes) {
                    if (userRes && userRes.length) {
                        return {
                            success: false,
                            message: 'User names already exists. Please choose new user names.'
                        }
                    }
                    let totalTeacher = dataToSaveTeacher.length;
                    console.log('totalTeacher', totalTeacher);
                    if (totalTeacher > 1) {
                        let deffArr = [];
                        for (let i = 0; i < totalTeacher; i++) {
                            console.log('dataToSaveTeacher[i]', dataToSaveTeacher[i]);
                            console.log('self', self);
                            deffArr.push(self.saveTeacher({post: dataToSaveTeacher[i], ip: params.ip}))
                        }
                        let defObj = deffArr.reduce(function (ac, pr, i) {
                            ac[i] = pr;
                            return ac;
                        }, {});
                        return deferred.combine(defObj).to(function (combObj) {
                            console.log('combObj', combObj);
                            return deferred.success({
                                success: true,
                                message: "Teachers added Successfully!"
                            });
                        }).toFailure(function (err) {
                            console.log('err', err);
                            return deferred.success({
                                success: false,
                                message: "Error in adding teacher!"
                            });
                        })
                    } else {
                        return deferred.success({
                            success: false,
                            message: "No teacher added!"
                        });
                    }
                });
        }

        else {
            return deferred.failure({
                success: false,
                message: 'Error in uploading'
            });
        }
    }

    getTeacherCsv(req, res) {
        if (req.params.type === 'sample') {
            res.sendfile('sampleTeacher.csv', {root: './public/teacher'});
        } else if (req.params.type === 'blank') {
            res.sendfile('blankTeacher.csv', {root: './public/teacher'});
        } else {
            res.send({
                success: false,
                error: 'No file found'
            })
        }
    }

}

module.exports = TeacherAPI;
