let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Student = require('../models/models').student;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Teacher = require('../models/models').teacher;
let Subject = require('../models/models').subject;

class TeacherRepo {
    addTeacher(data) {
        return fn.defer(Teacher.create, Teacher)(data);
    }

    getTeacherBySchool(sId) {
        let leanObj = Teacher.find(
            {schoolId: sId, isDeleted: false}, {updatedAt: 0}).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    deleteTeacherById(id) {
        return fn.defer(Teacher.update, Teacher)({
            _id: id
        }, {
            $set: {isDeleted: true}
        });
    }

    getTeacherById(tId) {
        return fn.defer(Teacher.findOne, Teacher)({_id: tId, isDeleted: false});
    }

    updateTeacherById(id, data) {
        delete data.updatedAt;
        if (data.contact && data.contact.phone[0]) {
            data.emergencyContactNo = data.contact.phone[0];
        }
        return fn.defer(Teacher.update, Teacher)({
            _id: id
        }, {
            $set: data,
            $push: {updatedAt: new Date()}
        });
    }

    getTeacherByLoginId(lId) {
        return fn.defer(Teacher.findOne, Teacher)({loginId: lId, isDeleted: false});

    }

    getTeachersByTeacherIds(teacherIdArr) {
        return fn
            .defer(Teacher.find, Teacher)
            ({_id: {$in: teacherIdArr}, isDeleted: false}, {name: 1});
    }


    getTeachersCountFromSchoolId(schoolId) {
        return fn.defer(Teacher.count, Teacher)({schoolId: schoolId,
            isDeleted: false});
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new TeacherRepo();
    return instance;
};