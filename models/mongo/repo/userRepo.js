let mongoose = require('mongoose');
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment');
let User = require('../models/models').user;

class UserRepo {
    findUserByUserName(username) {
        let qry = {
            username: username,
            isDeleted: false
        };
        let leanObj = User.findOne(qry, {__v: 0}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    findUserByUserNameArr(usernameArr) {
        let qry = {
            username: {$in: usernameArr},
            isDeleted: false
        };
        let leanObj = User.findOne(qry, {__v: 0}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    findUserById(id) {
        let qry = {
            _id: id,
            isDeleted: false
        };
        let leanObj = User.findOne(qry, {__v: 0}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    deactivateUserById(id) {
        return fn.defer(User.update, User)({
            _id: id
        }, {isDeleted: true});
    }

    findUser(username) {
        let qry = {
            username: username,
            isDeleted: false
        };
        let leanObj = User.findOne(qry, {__v: 0}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    findUserByMobile(mobile) {
        let qry = {
            mobile: mobile,
            isDeleted: false
        };
        let leanObj = User.findOne(qry, {__v: 0}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    findUsersNameByIds(ids) {
        let qry = {
            _id: {$in: ids},
            isDeleted: false
        };
        let leanObj = User.find(qry, {username: 1}).lean();
        return fn.defer(leanObj.exec, leanObj)();
    }

    createUser(userData) {
        return fn.defer(User.create, User)(userData);
    }

    updateUserIpAndLastLoginAndToken(id, ip, fcm) {
        let update = {
            $push: {lastLogin: new Date(), lastLoginIpAddress: ip}
        };
        if (fcm) {
            update = {
                $push: {lastLogin: new Date(), lastLoginIpAddress: ip},
                $addToSet: {fcmTokens: fcm}
            }
        }
        return fn.defer(User.update, User)({
            _id: id,
            isDeleted: false
        }, update);
    }

    updateUserOtp(id, otp) {
        let update = {
            $set: {
                "forgetData.otp": otp,
                "forgetData.isUsed": false,
                "forgetData.expiry": new Date(moment().add(1, 'day').format())
            }
        };
        return fn.defer(User.update, User)({
            _id: id
        }, update);
    }

    changePasswordById(id, pass) {
        return fn.defer(User.update, User)({
            _id: id
        }, {
            $set: {password: pass}
        });
    }

    changePasswordByUsername(username, pass) {
        return fn.defer(User.update, User)({
            username: username
        }, {
            $set: {password: pass}
        });
    }
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new UserRepo();
    return instance;
};