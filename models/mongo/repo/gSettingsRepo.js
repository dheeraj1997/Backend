let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let GSettings = require('../models/models').gSettings;

class GSettingsRepo {
    createSettings(data) {
        if (data._id) {
            return fn.defer(GSettings.update, GSettings)({_id: data._id}, {$set: data});
        }
        return fn.defer(GSettings.create, GSettings)(data);
    }
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new GSettingsRepo();
    return instance;
};