let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let Result = require('../models/models').result;


class ResultRepo {

    createResult(data) {
        if (data._id) {
            delete data.updatedAt;
            return fn.defer(Result.update, Result)({
                _id: data._id,
            }, {$set: data, $push: {updatedAt: new Date()}});
        }
        return fn.defer(Result.create, Result)(data);
    }

    getResultByData(data) {
        return fn.defer(Result.find, Result)(data);
    }

}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new ResultRepo();
    return instance;
};