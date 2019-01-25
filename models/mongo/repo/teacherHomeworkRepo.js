let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let TeacherHomework = require('../models/models').teacherHomework;


class teacherHomeworkRepo {

    createHomework(data) {
        return fn.defer(TeacherHomework.create, TeacherHomework)(data);
    }

    updateHomeworkById(id, data) {
        return fn.defer(TeacherHomework.update, TeacherHomework)({
            _id: id
        }, {
            $set: data
        });
    }

    deleteHomeworkById(id) {
        return fn.defer(TeacherHomework.update, TeacherHomework)({
            _id: id
        }, {
            $set: {isDeleted: true}
        });
    }

    getHomeworksBySchoolTeacher(schoolId,teacherId) {
        let query = {
            "schoolId": schoolId,
            "teacherId": teacherId,
            isDeleted: false
        };

        let leanObj = TeacherHomework.find(query).sort({createdAt:-1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getHomeworksById(cId) {
        return fn.defer(TeacherHomework.findOne, TeacherHomework)({_id: cId, isDeleted: false});
    }

    getHomeworksByHomeworkIds(HomeworkIdArr) {
        return fn
        .defer(TeacherHomework.find, TeacherHomework)
        ({_id: {$in: HomeworkIdArr}, isDeleted: false}, {name: 1});
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new teacherHomeworkRepo();
    return instance;
};