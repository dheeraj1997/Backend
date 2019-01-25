let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');
let User = require('../models/models').user;

class AuthRepo {
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new AuthRepo();
    return instance;
};