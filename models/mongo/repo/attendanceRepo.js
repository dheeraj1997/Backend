let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Student = require('../models/models').student;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Attendance = require('../models/models').attendance;
let TeacherAttendance = require('../models/models').teacherAttendance;
let Subject = require('../models/models').subject;

class AttendanceRepo {
    createAttendance(data) {
        return fn.defer(Attendance.create, Attendance)(data);
    }

    getByTimetableId(tId) {
        return fn.defer(Attendance.find, Attendance)({timetableId: tId});
    }

    getByTimetableIdAndDate(tId, dateHere) {
        return fn.defer(Attendance.find, Attendance)
        ({timetableId: tId, date: dateHere});
    }

    getByClassSubIdAndDate(tId, sId, dateHere, teacherTimetableId) {
        let query = {classId: tId, subjectId: sId, date: dateHere};
        if (teacherTimetableId) {
            query.teacherTimetableId = teacherTimetableId;
        }
        return fn.defer(Attendance.find, Attendance)(query);
    }

    getBySchoolId(sId) {
        return fn.defer(Attendance.find, Attendance)({schoolId: sId});
    }

    getAttendanceByAttendanceIdArr(aIdArr) {
        return fn.defer(Attendance.find, Attendance)({_id: {$in: aIdArr}});
    }

    setTeacherAttendanceTaken(id) {
        return fn.defer(TeacherAttendance.update, TeacherAttendance)({
            _id: id
        }, {$set: {toTake: false}})
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new AttendanceRepo();
    return instance;
};