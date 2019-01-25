let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let TeacherHomework = require('../models/mongo/repo/master').teacherHomework;
let Auth = require('./authAPI');
let auth = new Auth();
let _ = require("lodash");
let Subject = require('../models/mongo/repo/master').subject;
let Cls = require('../models/mongo/repo/master').cls;
let Teacher =  require('../models/mongo/repo/master').teacher;

class HomeworkAPI {

    saveHomework(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.classId || !postObj.subjectId || !postObj.teacherId ||!postObj.homeworkText || !postObj.schoolId) {
            return deferred.failure("incorrect params!");
        }
        return TeacherHomework.createHomework(postObj).to(function (res) {
            return {
                success: true,
                message: "Homework created",
                data: res
            }
        })
    }

    editHomework(params) {

        let postObj = params.post;
        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj.classId || !postObj.subjectId || !postObj.teacherId ||!postObj.homeworkText || !postObj.schoolId) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        postObj.updatedAt = new Date();
        return TeacherHomework.updateHomeworkById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Homework Edited!!",
                data: res
            }
        })
    }

    deleteHomework(params) {
        let homeworkId = params.homeworkId;
        if (!homeworkId) {
            return {
                success: false,
                message: "No Homework id!"
            }
        }
        return TeacherHomework.deleteHomeworkById(homeworkId).to(function (res) {
            return {
                success: true,
                message: "Homework Deleted!!",
                data: res
            }
        })
    }

    getHomeworkBySchoolTeacherId(params) {
        let schoolId = params.schoolId;
        let teacherId = params.teacherId;
        if (!schoolId || !teacherId) {
            return deferred.failure('School or Teacher id not provided');
        }
        return TeacherHomework.getHomeworksBySchoolTeacher(schoolId , teacherId).to(function (res) {
            let toSendData= JSON.parse(JSON.stringify(res))
            let allTeacher = toSendData.map(function (val) {
                return val.teacherId.toString();
            });
            let allClass = toSendData.map(function (val) {
                return val.classId.toString();
            });
            let allSubject = toSendData.map(function (val) {
                return val.subjectId.toString();
            });

            allTeacher = _.union(allTeacher);
            allClass = _.union(allClass);
            allSubject = _.union(allSubject);
            let classNameMap = Cls.getClassesByClassIds(allClass).to(function (res2) {
                return res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
            });
            let subjectNameMap =  Subject.getSubjectBySubjectIds(allSubject).to(function (res2) {
                return res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
            });
            let teacherNameMap = Teacher.getTeachersByTeacherIds(allTeacher).to(function (res2) {
                return res2.reduce(function (a, p) {
                    a[p._id] = p.name;
                    return a;
                }, {});
            });    
            return deferred.combine({
                teacherNameMap : teacherNameMap,
                classNameMap :classNameMap,
                subjectNameMap: subjectNameMap
            }).to(combRes=>{
                teacherNameMap = combRes.teacherNameMap;
                classNameMap = combRes.classNameMap;
                subjectNameMap = combRes.subjectNameMap;
                let data = toSendData.map(function (x) {
                    x.teacherName = teacherNameMap[x.teacherId.toString()];
                    x.className = classNameMap[x.classId.toString()];
                    x.subjectName = subjectNameMap[x.subjectId.toString()];
                    return x;
                });
                return {
                    success: true,
                    message: "Homeworks fetched!",
                    data: data
                }
            })
        })
    }

    getByHomeworkId(params) {
        let homeworkId = params.homeworkId;
        if (!homeworkId) {
            return deferred.failure('Homework id not provided.');
        }
        return TeacherHomework.getHomeworksById(homeworkId).to(function (res) {
            return {
                success: true,
                message: "Homework fetched!",
                data: res
            }
        })
    }

}

module.exports = HomeworkAPI;
