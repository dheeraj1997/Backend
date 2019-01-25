let deferred = require('../lib/common-utils/deferred');
let moment = require('moment');
let School = require('../models/mongo/repo/master').school;
let Cls = require('../models/mongo/repo/master').cls;
let Auth = require('./authAPI');
let auth = new Auth();

class ClassAPI {

    saveClass(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        let sessionId = postObj.sessionId;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.name || !postObj.schoolId || !postObj.sessionId) {
            return deferred.failure("incorrect params!");
        }
        delete postObj.sessionId;
        return Cls.createClass(postObj).to(function (res) {
            return School.getClassAttendanceSetting(postObj.schoolId, sessionId)
                .to(setRes => {
                    console.log('setRes', setRes);
                    if (!setRes || !setRes._id) {
                        setRes = {
                            sessionId: sessionId,
                            schoolId: postObj.schoolId,
                            classData: [],
                            days: [
                                {
                                    "selected": true,
                                    "name": "monday"
                                },
                                {
                                    "selected": true,
                                    "name": "tuesday"
                                },
                                {
                                    "selected": true,
                                    "name": "wednesday"
                                },
                                {
                                    "selected": true,
                                    "name": "thursday"
                                },
                                {
                                    "selected": true,
                                    "name": "friday"
                                },
                                {
                                    "selected": true,
                                    "name": "saturday"
                                },
                                {
                                    "selected": false,
                                    "name": "sunday"
                                }],
                            comment: ''
                        }
                    }
                    setRes.classData.push({
                        "frequency": 1,
                        "classId": res._id
                    });
                    let attendanceData = {
                        "sessionId": sessionId,
                        "schoolId": postObj.schoolId,
                        "classId": res._id,
                        "comment": "",
                        "date": moment().tz('Asia/Calcutta').format("DD-MM-YYYY"),
                        "toTake": true,
                    };
                    let createAttendance = School.createClassAttendance(attendanceData);
                    let createSettings = School.addClassAttendanceSetting(setRes);
                    return deferred.combine({
                        createAttendance: createAttendance,
                        createSettings: createSettings
                    }).to(saveRes => {
                        return {
                            success: true,
                            message: "Class created",
                            data: res
                        }
                    })
                });
        })
    }

    editClass(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj._id || !postObj.name) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        postObj.updatedAt = new Date();
        return Cls.updateClassById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Class Edited!!",
                data: res
            }
        })
    }

    deleteClass(params) {
        console.log("params.post", params.post);
        let classId = params.classId;
        if (!classId) {
            return {
                success: false,
                message: "No class id!"
            }
        }
        return Cls.deleteClassById(classId).to(function (res) {
            return {
                success: true,
                message: "Class Deleted!!",
                data: res
            }
        })
    }

    getClassesBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Cls.getClassesBySchool(schoolId).to(function (res) {
            return {
                success: true,
                message: "Classes fetched!",
                data: res
            }
        })
    }

    getByClassId(params) {
        let classId = params.classId;
        if (!classId) {
            return deferred.failure('Class id not provided.');
        }
        return Cls.getClassesById(classId).to(function (res) {
            return {
                success: true,
                message: "Class fetched!",
                data: res
            }
        })
    }

    getClassCountBySchoolId(params) {
        let schoolId = params.schoolId;
        console.log('param.schoolId', params.schoolId)
        if (!schoolId) {
            return deferred.failure('SchoolID not provided');
        }
        return Cls.getClassesCountFromSchoolId(schoolId).to(function (cc) {
            if (!cc) {
                cc = 0;
            }

            return {
                success: true,
                message: "Class count fetched!",
                data: cc
            }
        })
    }


}

module.exports = ClassAPI;
