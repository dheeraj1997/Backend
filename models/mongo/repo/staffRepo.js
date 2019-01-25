let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Student = require('../models/models').student;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Staff = require('../models/models').staff;
let Subject = require('../models/models').subject;

class StaffRepo {
    addStaff(data) {
        return fn.defer(Staff.create, Staff)(data);
    }

    getStaffBySchool(sId) {
        let leanObj = Staff.find({schoolId: sId, isDeleted: false}, {updatedAt: 0}).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    deleteStaffById(id) {
        return fn.defer(Staff.update, Staff)({
            _id: id
        }, {
            $set: {isDeleted: true}
        });
    }

    getStaffCountFromSchoolId(schoolId) {
        return fn.defer(Staff.count, Staff)({schoolId: schoolId, isDeleted: false});
    }

    updateStaffById(id, data) {
        delete data.updatedAt;
        return fn.defer(Staff.update, Staff)({
            _id: id
        }, {
            $set: data,
            $push: {updatedAt: new Date()}
        });
    }

    getStaffById(sId) {
        return fn.defer(Staff.findOne, Staff)({_id: sId, isDeleted: false});
    }

    getStaffByLoginId(lId) {
        return fn.defer(Staff.findOne, Staff)({loginId: lId, isDeleted: false});
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new StaffRepo();
    return instance;
};