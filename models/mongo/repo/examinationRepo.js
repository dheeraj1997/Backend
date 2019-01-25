let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Examination = require('../models/models').examination;
let ExaminationSetting = require('../models/models').examinationSetting;

class ExaminationRepo {

    createExam(data) {
        return fn.defer(Examination.create, Examination)(data);
    }

    createExamSettings(data) {
        if (data._id) {
            delete data.updatedAt;
            return fn.defer(ExaminationSetting.update, ExaminationSetting)({_id: data._id}, {
                $set: data,
                $push: {updatedAt: new Date()}
            });
        }
        return fn.defer(ExaminationSetting.create, ExaminationSetting)(data);
    }

    getExamSettingBySchoolSession(sId, sessId) {
        return fn.defer(ExaminationSetting.findOne, ExaminationSetting)({
            schoolId: sId,
            sessionId: sessId,
            isDeleted: false
        }, {updatedAt: 0})
    }

    getExamBySchoolSession(sId, sessId) {
        let leanObj = Examination.find({
            schoolId: sId,
            sessionId: sessId,
            isDeleted: false
        }).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    deleteExamById(id) {
        return fn.defer(Examination.update, Examination)({
            _id: id,
            isDeleted: false
        }, {
            $set: {isDeleted: true}
        });
    }

    getExamsById(eId) {
        return fn.defer(Examination.findOne, Examination)({_id: eId, isDeleted: false});
    }

    updateExamById(id, data) {
        delete data.updatedAt;
        return fn.defer(Examination.update, Examination)({
            _id: id
        }, {
            $set: data,
            $push: {updatedAt: new Date()}
        });
    }


}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new ExaminationRepo();
    return instance;
};