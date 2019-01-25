let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let Subject = require('../models/mongo/repo/master').subject;
let Auth = require('./authAPI');
let auth = new Auth();

class SubjectAPI {


    saveSubject(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.name || !postObj.schoolId) {
            return deferred.failure("incorrect params!");
        }
        return Subject.createSubject(postObj).to(function (res) {
            return {
                success: true,
                message: "Subject created!",
                data: res
            }
        })
    }

    editSubject(params) {
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
        return Subject.updateSubjectById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Subject Edited!!",
                data: res
            }
        })
    }

    deleteSubject(params) {
        console.log("params.post", params.post);
        let subjectId = params.subjectId;
        if (!subjectId) {
            return {
                success: false,
                message: "No subject id!"
            }
        }
        return Subject.deleteSubjectById(subjectId).to(function (res) {
            return {
                success: true,
                message: "Subject Deleted!!",
                data: res
            }
        })
    }

    getBySubjectId(params) {
        let subjectId = params.subjectId;
        if (!subjectId) {
            return deferred.failure('Subject id not provided.');
        }
        return Subject.getSubjectById(subjectId).to(function (res) {
            return {
                success: true,
                message: "Subject fetched!",
                data: res
            }
        })
    }

    getSubjectsBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Subject.getSubjectBySchool(schoolId).to(function (res) {
            return {
                success: true,
                message: "Subjects fetched!",
                data: res
            }
        })
    }

    getSubjectsCountBySchoolId(params) {
        let schoolId = params.schoolId;
        console.log('param.schoolId', params.schoolId)
        if (!schoolId) {
            return deferred.failure('SchoolID not provided');
        }
        return Subject.getSubjectCountFromSchoolId(schoolId).to(function (sc) {
            if (!sc) {
                sc = 0;
            }

            return {
                success: true,
                message: "Subject count fetched!",
                data: sc
            }
        })
    }

}

module.exports = SubjectAPI;
