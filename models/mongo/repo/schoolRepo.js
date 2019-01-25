let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let moment = require('moment-timezone');
let School = require('../models/models').school;
let SchoolSms = require('../models/models').schoolSms;
let SchoolFees = require('../models/models').schoolFees;
let AccountantFees = require('../models/models').accountantFees;
let AccountantShowFees = require('../models/models').accountantShowFees;
let SchoolPeriod = require('../models/models').schoolPeriod;
let ClassAttendanceSetting = require('../models/models').classAttendanceSetting;
let ClassAttendance = require('../models/models').classAttendance;
let ClassTakenAttendance = require('../models/models').classTakenAttendance;
let GSettings = require('../models/models').gSettings;

class SchoolRepo {
    createSchool(data) {
        console.log('status', data);
        return fn.defer(School.create, School)(data);
    }

    createSchoolSms(data) {
        return fn.defer(SchoolSms.create, SchoolSms)(data);
    }

    deleteSchoolById(id) {
        return fn.defer(School.update, School)({
            _id: id,
            isDeleted: false
        }, {
            $set: {isDeleted: true}
        });
    }

    getSchoolSmsBySchoolId(schoolId, endDate, startDate) {
        let query = {
            schoolId: schoolId,
            createdAt: {$gt: new Date(startDate), $lte: new Date(endDate)}
        };
        let proj = {
            __v: 0
        };
        let leanObj =
            SchoolSms.find(query, proj)
                .sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }


    getTotalSchool() {
        return fn.defer(School.count, School)({isDeleted: false});
    }

    getSchoolSettings(sId) {
        return fn.defer(GSettings.findOne, GSettings)({schoolId: sId});
    }

    getClassAttendanceSetting(sId, sessId) {
        let leanObj = ClassAttendanceSetting.findOne({schoolId: sId, sessionId: sessId});
        return fn.defer(leanObj.exec, leanObj)();
    }

    getClassAttendance(sId, sessId, date) {
        let leanObj = ClassAttendance.find({schoolId: sId, sessionId: sessId, date: date});
        return fn.defer(leanObj.exec, leanObj)();
    }

    getClassAttendanceById(listId) {
        let leanObj = ClassAttendance.findOne({_id: listId});
        return fn.defer(leanObj.exec, leanObj)();
    }

    getClassAttendanceBySchooSessionClassId(schoolId, sessionId, classIds, date) {
        console.log('schoolId', schoolId);
        console.log('sessionId', sessionId);
        console.log('classIds', classIds);
        console.log('date', date);
        let leanObj = ClassTakenAttendance.find({
            schoolId: schoolId,
            sessionId: sessionId,
            classId: {$in: classIds},
            date: date
        });
        return fn.defer(leanObj.exec, leanObj)();
    }

    getClassAttendanceBySchooSessionClassIdDateArr(schoolId, sessionId, classId, dates) {
        console.log('schoolId', schoolId);
        console.log('sessionId', sessionId);
        console.log('classId', classId);
        console.log('dates', dates);
        let leanObj = ClassTakenAttendance.find({
            schoolId: schoolId,
            sessionId: sessionId,
            classId: classId,
            date: {$in: dates}
        });
        return fn.defer(leanObj.exec, leanObj)();
    }

    updateClassAttendanceTakenById(listId, data) {
        let leanObj = ClassAttendance.update({_id: listId}, {$set: data});
        return fn.defer(leanObj.exec, leanObj)();
    }

    createClassAttendance(data) {
        return fn.defer(ClassAttendance.create, ClassAttendance)(data);
    }

    createClassAttendanceTaken(data) {
        return fn.defer(ClassTakenAttendance.create, ClassTakenAttendance)(data);
    }

    getClassAttendanceTakenByAttId(classAttendanceId) {
        return fn.defer(ClassTakenAttendance.find, ClassTakenAttendance)({
            classAttendanceId: classAttendanceId
        });
    }

    addClassAttendanceSetting(data) {
        if (data._id) {
            return fn.defer(ClassAttendanceSetting.update, ClassAttendanceSetting)({_id: data._id}, {$set: data});
        }
        return fn.defer(ClassAttendanceSetting.create, ClassAttendanceSetting)(data);
    }

    getOrganizationSchool(oId) {
        let leanObj = School.find({organizationId: oId, isDeleted: false}).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    setCurrentSessionBySchool(id, sessionId) {
        return fn.defer(School.update, School)({
            _id: id
        }, {
            $set: {currentSession: sessionId}
        });
    }

    getSchools(start, limit) {
        let proj = {
            __v: 0,
            establishedYear: 0,
            picGallery: 0
        };
        let leanObj = School.find({isDeleted: false,}, proj).skip(start).limit(limit).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getSchoolById(id) {
        return fn.defer(School.findOne, School)({_id: id});
    }

    getSchoolByLoginId(lId) {
        return fn.defer(School.findOne, School)({loginId: lId});
    }

    getSchoolByUserName(userName) {
        return fn.defer(School.findOne, School)({loginId: lId});
    }

    updateSchool(sId, data) {
        return fn.defer(School.update, School)({_id: sId}, {$set: data});
    }

    deleteSchoolFees(schoolId, sessionId, classId) {
        console.log('addSchoolFees schoolId', schoolId);
        console.log('addSchoolFees sessionId', sessionId);
        console.log('addSchoolFees classId', classId);
        return fn.defer(SchoolFees.remove, SchoolFees)({
            schoolId: schoolId,
            sessionId: sessionId,
            classId: classId
        });
    }

    deleteAccountantFeesArr(idArr) {
        console.log('AccountantFees idArr', idArr);
        return fn.defer(AccountantFees.remove, AccountantFees)({_id: {$in: idArr}});
    }

    addSchoolFees(data) {
        console.log('addSchoolFees data', data);
        return fn.defer(SchoolFees.create, SchoolFees)(data);
    }

    addAccountantFees(data) {
        console.log('addAccountantFees data', data);
        return fn.defer(AccountantFees.create, AccountantFees)(data);
    }

    addAccountantShowFees(data) {
        console.log('addAccountantFees data', data);
        return fn.defer(AccountantShowFees.create, AccountantShowFees)(data);
    }

    addSchoolPeriods(data) {
        console.log('SchoolPeriod data', data);
        return fn.defer(SchoolPeriod.create, SchoolPeriod)(data);
    }

    getSchoolPeriodClasses(schoolId, sessionId) {
        console.log('SchoolPeriod schoolId', schoolId);
        console.log('SchoolPeriod sessionId', sessionId);
        return fn.defer(SchoolPeriod.find, SchoolPeriod)({schoolId: schoolId, sessionId: sessionId}, {classId: 1});
    }

    getSchoolFees(schoolId, classId, sessionId) {
        console.log('getSchoolFees schoolId', schoolId);
        console.log('getSchoolFees classId', classId);
        console.log('getSchoolFees sessionId', sessionId);
        let query = {
            schoolId: schoolId,
            classId: classId,
            sessionId: sessionId
        };
        let projection = {
            updatedAt: 0,
        };
        let leanObj = SchoolFees.find(query, projection).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getAllAccountantFees(schoolId, studentId, sessionId) {
        console.log('getAccountantFees schoolId', schoolId);
        console.log('getAccountantFees sessionId', studentId);
        console.log('getAccountantFees sessionId', sessionId);
        let query = {
            schoolId: schoolId,
            studentId: studentId,
            sessionId: sessionId
        };
        let leanObj = AccountantFees.find(query).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getCollectedFee(schoolId, classId, sessionId) {
        console.log('getCollectedFee schoolId', schoolId);
        console.log('getCollectedFee classId', classId);
        console.log('getCollectedFee sessionId', sessionId);
        let query = {
            schoolId: schoolId,
            classId: classId,
            sessionId: sessionId
        };
        let leanObj = AccountantShowFees.find(query).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }


    getTotalCollectedFees(schoolId, sessionId) {
        console.log('getAccountantFees schoolId', schoolId);
        console.log('getAccountantFees sessionId', sessionId);
        return fn.defer(AccountantShowFees.aggregate, AccountantShowFees)([
            {
                $match: {
                    "schoolId": schoolId,
                    "sessionId": sessionId,

                }
            },
            {
                $group: {
                    _id: "$schoolId",
                    totalFee: {$sum: "$total"}
                }
            }
        ]);
    }

    getSchoolPeriods(schoolId, classId, sessionId) {
        console.log('getSchoolFees schoolId', schoolId);
        console.log('getSchoolFees classId', classId);
        console.log('getSchoolFees sessionId', sessionId);
        let query = {
            schoolId: schoolId,
            classId: classId,
            sessionId: sessionId
        };
        let projection = {
            updatedAt: 0
        };
        let leanObj = SchoolPeriod.findOne(query, projection).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    updateSchoolFees(fId, data) {
        if (data.updatedAt) {
            delete data.updatedAt;
        }
        return fn.defer(SchoolFees.update, SchoolFees)({_id: fId}, {
            $set: data,
            $push: {updatedAt: new Date()}
        });
    }


    deleteFeesById(fId) {
        return fn.defer(SchoolFees.update, SchoolFees)({
            _id: fId
        }, {
            $set: {isDeleted: true}
        });
    }

    getSchoolFromSchoolAdm(schoolAdmId) {
        let query = {
            loginId: schoolAdmId,
            isDeleted: false
        };
        return fn.defer(School.findOne, School)(query, {_id: 1});
    }

    updateSchoolById(id, data) {
        return fn.defer(School.update, School)({
            _id: id
        }, {
            $set: data
        });
    }

    updateSchoolSmsById(id, total) {
        return fn.defer(School.update, School)({
            _id: id
        }, {
            $set: {"smsCount.total": total}
        });
    }

    updateSchoolStatusById(id, status) {
        return fn.defer(School.update, School)({
            _id: id
        }, {
            $set: {"status": status}
        });
    }
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new SchoolRepo();
    return instance;
};