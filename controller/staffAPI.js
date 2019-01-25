let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let csvToJson = require('csvjson');
let fs = require('fs');
let School = require('../models/mongo/repo/master').school;
let Cls = require('../models/mongo/repo/master').cls;
let Staff = require('../models/mongo/repo/master').staff;
let User = require('../models/mongo/repo/master').user;
let Auth = require('./authAPI');
let auth = new Auth();

class ClassAPI {

    saveStaff(params) {
        console.log("params.post", params.post);
        let postObj = params.post;

        if (!postObj) {
            return deferred.failure("No post param!");
        }
        if (!postObj.name) {
            return deferred.failure("No staff name!");
        }
        if (!postObj.username) {
            return deferred.failure("No user name!");
        }
        if (!postObj.type) {
            return deferred.failure("No staff type!");
        }
        if (!postObj.password) {
            return deferred.failure("No password!");
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
                category: postObj.type,
                type: "school"
            },
            createdById: postObj.createdById
        };
        let staffObj = {
            name: postObj.name,
            gender: postObj.gender,
            aadhaarId: postObj.aadhaarId,
            emergencyContactNo: postObj.emergencyContactNo,
            schoolId: postObj.schoolId,
            type: postObj.type,
            bloodGroup: postObj.bloodGroup,
            contact: postObj.contact,
            address: postObj.address,
            createdById: postObj.createdById
        };
        console.log('userObj', userObj);
        console.log('staffObj', staffObj);
        return auth.signUp({post: userObj}).to(function (res) {
            staffObj.loginId = res.data._id;
            return Staff.addStaff(staffObj).to(function (res) {
                return {
                    success: true,
                    message: "Staff created successfully!",
                    data: res
                }
            })
        });
    }

    uploadStaffCsv(params) {
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
            let dataToSaveStaff = csvObj.map(function (val, ind) {
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
                    let totalStaff = dataToSaveStaff.length;
                    console.log('totalStaff', totalStaff);
                    if (totalStaff > 1) {
                        let deffArr = [];
                        for (let i = 0; i < totalStaff; i++) {
                            console.log('dataToSaveStaff[i]', dataToSaveStaff[i]);
                            console.log('self', self);
                            deffArr.push(self.saveStaff({post: dataToSaveStaff[i], ip: params.ip}))
                        }
                        let defObj = deffArr.reduce(function (ac, pr, i) {
                            ac[i] = pr;
                            return ac;
                        }, {});
                        return deferred.combine(defObj).to(function (combObj) {
                            console.log('combObj', combObj);
                            return deferred.success({
                                success: true,
                                message: "Staff added Successfully!"
                            });
                        }).toFailure(function (err) {
                            console.log('err', err);
                            return deferred.success({
                                success: false,
                                message: "Error in adding staff!"
                            });
                        })
                    } else {
                        return deferred.success({
                            success: false,
                            message: "No staff added!"
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

    getStaffCsv(req, res) {
        if (req.params.type === 'sample') {
            res.sendfile('sampleStaff.csv', {root: './public/staff'});
        } else if (req.params.type === 'blank') {
            res.sendfile('blankStaff.csv', {root: './public/staff'});
        } else {
            res.send({
                success: false,
                error: 'No file found'
            })
        }
    }

    editStaff(params) {
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
        return Staff.updateStaffById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Staff Edited!!",
                data: res
            }
        })
    }

    deleteStaff(params) {
        console.log("params.post", params.post);
        let staffId = params.staffId;
        if (!staffId) {
            return {
                success: false,
                message: "No staff id!"
            }
        }
        return Staff.getStaffById(staffId).to(function (res) {
            let loginId = res.loginId;
            let deactivateUser = deferred.success({});
            if (loginId) {
                deactivateUser = User.deactivateUserById(loginId);
            }
            let deleteStaff = Staff.deleteStaffById(staffId);
            return deferred.combine({
                deactivateUser: deactivateUser,
                deleteStaff: deleteStaff
            }).to(function (res) {
                return {
                    success: true,
                    message: "Staff Deleted!!",
                    data: res
                }
            })
        });
    }

    getStaffCountBySchoolId(params) {
        let schoolId = params.schoolId;
        console.log('param.schoolId', params.schoolId)
        if (!schoolId) {
            return deferred.failure('SchoolID not provided');
        }
        return Staff.getStaffCountFromSchoolId(schoolId).to(function (tea) {
            return {
                success: true,
                message: "Teacher count fetched!",
                data: tea || 0
            }
        })
    }

    getStaffsBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Staff.getStaffBySchool(schoolId).to(function (res) {
            let allLoginIds = res.reduce(function (a, val) {
                if (val.loginId) {
                    a.push(val.loginId);
                }
                return a;
            }, []);
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
                    message: "Staffs fetched!",
                    data: toSend
                }
            });
        })
    }

    getStaffsByLoginId(params) {
        let loginId = params.loginId;
        if (!loginId) {
            return deferred.failure('Login id not provided');
        }
        return Staff.getStaffByLoginId(loginId).to(function (res) {
            return {
                success: true,
                message: "Staffs fetched!",
                data: res
            }
        })
    }

    getByStaffId(params) {
        let staffId = params.staffId;
        if (!staffId) {
            return deferred.failure('staffId not provided.');
        }
        return Staff.getStaffById(staffId).to(function (res) {
            return {
                success: true,
                message: "staff fetched!",
                data: res
            }
        })
    }
}

module.exports = ClassAPI;
