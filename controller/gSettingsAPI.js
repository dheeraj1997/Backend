let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let GSettings = require('../models/mongo/repo/master').gSettings;
let Auth = require('./authAPI');
let auth = new Auth();

class GSettingsAPI {

    saveSettings(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.schoolId) {
            return deferred.failure("incorrect params!");
        }
        console.log('postObj', postObj);
        return GSettings.createSettings(postObj).to(function (res) {
            return {
                success: true,
                message: "Settings created!",
                data: res
            }
        })
    }

    getSettings(params) {
        let schoolId = params.schoolId;
        console.log('schoolId', schoolId);
        return School.getSchoolSettings(schoolId).to(function (res) {
            return {
                success: true,
                message: "Settings Fetched!",
                data: res
            }
        })
    }

    getClassAttendanceSettings(params) {
        let schoolId = params.schoolId;
        let sessionId = params.sessionId;
        console.log('schoolId', schoolId);
        console.log('sessionId', sessionId);
        return School.getClassAttendanceSetting(schoolId, sessionId).to(function (res) {
            return {
                success: true,
                message: "Settings Fetched!",
                data: res
            }
        })
    }

    addClassAttendanceSettings(params) {
        let postObj = params.post;

        console.log('postObj', postObj);
        return School.addClassAttendanceSetting(postObj).to(function (res) {
            return {
                success: true,
                message: "Settings Saved!",
                data: res
            }
        })
    }

}

module.exports = GSettingsAPI;