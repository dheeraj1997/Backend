let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let _ = require('lodash');
let School = require('../models/mongo/repo/master').school;
let Examination = require('../models/mongo/repo/master').examination;
let Auth = require('./authAPI');
let Subject = require('../models/mongo/repo/master').subject;
let Cls = require('../models/mongo/repo/master').cls;
let auth = new Auth();

class ExaminationAPI {

    saveExam(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.name || !postObj.classId || !postObj.schoolId || !postObj.sessionId) {
            return deferred.failure("incorrect params!");
        }
        console.log('postObj', postObj);
        return Examination.createExam(postObj).to(function (res) {

            return {
                success: true,
                message: "Exam created!",
                data: res
            }
        })
    }

    saveExamSettings(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.schoolId || !postObj.sessionId) {
            return deferred.failure("incorrect params!");
        }
        console.log('postObj', postObj);
        return Examination.createExamSettings(postObj).to(function (res) {
            return {
                success: true,
                message: "Exam settings saved!",
                data: res
            }
        })
    }

    getExamBySchoolId(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        if (!schoolId || !sessionId) {
            return deferred.failure('Params mismatch!');
        }

        return Examination.getExamBySchoolSession(schoolId, sessionId).to(function (res) {
            let toSendData = JSON.parse(JSON.stringify(res));
            console.log('getExamBySchoolres', toSendData);
            let allClass = toSendData.map(function (val) {
                return val.classId.toString();
            });
            allClass = _.union(allClass);
            let classNameMap = Cls.getClassesByClassIds(allClass).to(function (res2) {
                return res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
            });
            return deferred.combine({
                classNameMap: classNameMap,
            }).to(combRes => {
                classNameMap = combRes.classNameMap;
                let data = toSendData.map(function (x) {
                    x.className = classNameMap[x.classId.toString()];
                    return x;
                });
                return {
                    success: true,
                    message: "Examination fetched!",
                    data: data
                }
            })
        })
    }

    getSettingsBySchoolId(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        if (!schoolId || !sessionId) {
            return deferred.failure('Params mismatch!');
        }
        return Examination.getExamSettingBySchoolSession(schoolId, sessionId).to(function (res) {
            let toSendData = JSON.parse(JSON.stringify(res));
            console.log('getExamSettingBySchoolSession', toSendData);
            return {
                success: true,
                message: "Examination Settings fetched!",
                data: toSendData
            };
        })
    }

    deleteExam(params) {
        console.log("params.post", params.post);
        let examId = params.examId;
        if (!examId) {
            return {
                success: false,
                message: "No exam id!"
            }
        }
        return Examination.deleteExamById(examId).to(function (res) {
            return {
                success: true,
                message: "Exam Deleted!!",
                data: res
            }
        })
    }

    editExam(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj.name || !postObj.classId || !postObj.schoolId || !postObj.sessionId) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        return Examination.updateExamById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Exam Edited!!",
                data: res
            }
        })
    }

    getByExamId(params) {
        let examId = params.examId;
        if (!examId) {
            return deferred.failure('Exam id not provided.');
        }
        return Examination.getExamsById(examId).to(function (res) {
            return {
                success: true,
                message: "Exam fetched!",
                data: res
            }
        })
    }
}

module.exports = ExaminationAPI;