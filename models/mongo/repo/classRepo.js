let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Student = require('../models/models').student;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Subject = require('../models/models').subject;

class ClassRepo {

    createClass(data) {
        return fn.defer(Class.create, Class)(data);
    }

    updateClassById(id, data) {
        return fn.defer(Class.update, Class)({
            _id: id
        }, {
            $set: data
        });
    }

    deleteClassById(id) {
        return fn.defer(Class.update, Class)({
            _id: id
        }, {
            $set: {isDeleted: true}
        });
    }

    getClassesBySchool(sId) {
        let leanObj = Class.find({schoolId: sId, isDeleted: false}).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getClassesById(cId) {
        return fn.defer(Class.findOne, Class)({_id: cId, isDeleted: false});
    }

    getClassesByClassIds(classIdArr) {
        return fn.defer(Class.find, Class)
        ({_id: {$in: classIdArr}, isDeleted: false}, {name: 1});
    }

    getClassesCountFromSchoolId(schoolId) {
        return fn.defer(Class.count, Class)({schoolId: schoolId, isDeleted: false});
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new ClassRepo();
    return instance;
};