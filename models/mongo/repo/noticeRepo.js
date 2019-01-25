let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Notice = require('../models/models').notice;

class NoticeRepo {

    createNotice(data) {
        return fn.defer(Notice.create, Notice)(data);
    }

    getNoticeBySchool(sId, target) {
        let leanObj = Notice.find({
            schoolId: sId,
            isDraft: false,
            isDeleted: false,
            targetGroup: {$in: target}
        }).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    getNoticeDraftBySchool(sId) {
        let leanObj = Notice.find({
            schoolId: sId,
            isDraft: true,
            isDeleted: false
        }).sort({createdAt: -1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    deleteNoticeById(id) {
        return fn.defer(Notice.update, Notice)({
            _id: id
        }, {
            $set: {isDeleted: true}
        });
    }

    getNoticeById(nId) {
        return fn.defer(Notice.findOne, Notice)({_id: nId, isDeleted: false});
    }

    updateNoticeById(id, data) {
        delete data._id;
        data.isDraft = false;
        return fn.defer(Notice.update, Notice)({
            _id: id
        }, {
            $set: data
        });
    }
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new NoticeRepo();
    return instance;
};