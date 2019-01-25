let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Student = require('../models/models').student;
let Guardian = require('../models/models').guardian;
let Session = require('../models/models').session;
let Class = require('../models/models').class;
let Subject = require('../models/models').subject;

class SessionRepo {
    createSession(data) {
        return fn.defer(Session.create, Session)(data);
    }

    updateSessionById(id, data) {
        return fn.defer(Session.update, Session)({
            _id: id
        }, {
            $set: data
        });
    }

    deleteSessionById(id) {
        return fn.defer(Session.update, Session)({
            _id: id
        }, {
            $set: {isDeleted: true}
        });
    }

    getSessionsBySchool(sId) {
       let leanObj = Session.find({schoolId: sId,isDeleted:false}).sort({createdAt:-1}).lean();
      return fn.defer(leanObj.exec, leanObj)();
    }

    getSessionsBySessionId(sId) {
        let proj = {name: 1, endDate: 1, startDate: 1};
        return fn.defer(Session.findOne, Session)({
            _id: sId,
            isDeleted: false
        }, proj);
    }


}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new SessionRepo();
    return instance;
};