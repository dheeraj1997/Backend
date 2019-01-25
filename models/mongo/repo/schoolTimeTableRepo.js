let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment');
let Student = require('../models/models').student;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Subject = require('../models/models').subject;
let SchoolTimeTable = require('../models/models').schoolTimeTable;
let TeacherTimeTable = require('../models/models').teacherTimeTable;
let TeacherAttendance = require('../models/models').teacherAttendance;

class SchoolTimeTableRepo {
    createTimeTable(data) {
        if (data._id) {
            let id = data._id;
            delete data._id;
            return fn.defer(SchoolTimeTable.update, SchoolTimeTable)({
                _id: id,
            }, {
                $set: data
            }, {
                $push: {updatedAt: new Date()}
            });
        }
        delete data._id;
        return fn.defer(SchoolTimeTable.create, SchoolTimeTable)(data);
    }

    createTeacherTimeTableBulk(data) {
        return fn.defer(TeacherTimeTable.create, TeacherTimeTable)(data);
    }

    createTeacherTimeTable(data) {
        if (data._id) {
            let id = data._id;
            delete data._id;
            return fn.defer(TeacherTimeTable.update, TeacherTimeTable)({
                _id: id,
            }, {
                $set: data
            }, {
                $push: {updatedAt: new Date()}
            });
        }
        delete data._id;
        return fn.defer(TeacherTimeTable.create, TeacherTimeTable)(data);
    }

    findTeacherTimetable(schoolId, sessionId) {
        return fn.defer(TeacherTimeTable.find, TeacherTimeTable)({
            schoolId: schoolId,
            sessionId: sessionId
        })
    }

    getTimeTable(id) {
        return fn.defer(SchoolTimeTable.findOne, SchoolTimeTable)({_id: id});
    }

    getAllTimeTable(sId) {
        return fn.defer(SchoolTimeTable.find, SchoolTimeTable)({schoolId: sId});
    }

    getSchoolClassTimeTable(sId, classId, sessionId) {
        return fn.defer(SchoolTimeTable.findOne, SchoolTimeTable)(
            {
                schoolId: sId,
                classId: classId,
                sessionId: sessionId
            });
    }

    getTodayTimeTable(tId, sessionId) {
        let query = {
            teacherId: tId,
            sessionId: sessionId
        };
        console.log('query', query);
        let leanObj = TeacherTimeTable.findOne(query).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    createTeacherAttendance(data) {
        return fn.defer(TeacherAttendance.create, TeacherAttendance)(data);
    }

    getTeacherAttendanceById(id) {
        return fn.defer(TeacherAttendance.findOne, TeacherAttendance)({
            _id: id
        })
    }

    removeTeacherAttandance(ids) {
        return fn.defer(TeacherAttendance.remove, TeacherAttendance)({
            _id: {$in: ids}
        })
    }

    getTeacherAttendanceByTeacherSessionDate(tId, sId, date) {
        return fn.defer(TeacherAttendance.find, TeacherAttendance)({
            teacherId: tId,
            sessionId: sId,
            date: date,
        })
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new SchoolTimeTableRepo();
    return instance;
};