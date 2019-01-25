let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Student = require('../models/models').student;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Subject = require('../models/models').subject;

class SubjectRepo {
    createSubject(data) {
        return fn.defer(Subject.create, Subject)(data);
    }

    updateSubjectById(id, data) {
        return fn.defer(Subject.update, Subject)({
            _id: id,
            isDeleted: false
        }, {
            $set: data
        });
    }

    deleteSubjectById(id) {
        return fn.defer(Subject.update, Subject)({
            _id: id,
            isDeleted: false
        }, {
            $set: {isDeleted: true}
        });
    }

    getSubjectById(sId) {
        return fn.defer(Subject.findOne, Subject)({_id: sId, isDeleted: false});
    }

    getSubjectBySchool(sId) {
        let leanObj = Subject.find({schoolId: sId,isDeleted:false}).sort({createdAt:-1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getSubjectBySubjectIds(subIdArr) {
        return fn.defer(Subject.find, Subject)
        ({_id: {$in: subIdArr}, isDeleted: false}, {name: 1});
    }

    getSubjectCountFromSchoolId(schoolId) {
        return fn.defer(Subject.count, Subject)({schoolId: schoolId, isDeleted: false});
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new SubjectRepo();
    return instance;
};