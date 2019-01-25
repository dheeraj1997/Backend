let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let Session = require('../models/mongo/repo/master').session;
let Auth = require('./authAPI');
let auth = new Auth();

class SessionAPI {

    saveSession(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.startDate || !postObj.endDate || !postObj.schoolId) {
            return deferred.failure("incorrect params!");
        }
        return Session.createSession(postObj).to(function (res) {
            return {
                success: true,
                message: "Session created",
                data: res
            }
        })
    }

    editSession(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return {
                success: false,
                message: "No post param!"
            }
        }
        if (!postObj._id || !postObj.startDate || !postObj.endDate || !postObj.schoolId) {
            return {
                success: false,
                message: "Incorrect params!"
            };
        }
        postObj.updatedAt = new Date();
        return Session.updateSessionById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Session Edited!!",
                data: res
            }
        })
    }

    deleteSession(params) {
        console.log("params.post", params.post);
        let sessionId = params.sessionId;
        if (!sessionId) {
            return {
                success: false,
                message: "No session id!"
            }
        }
        return Session.deleteSessionById(sessionId).to(function (res) {
            return {
                success: true,
                message: "Session Deleted!!",
                data: res
            }
        })
    }

    getSessionBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Session.getSessionsBySchool(schoolId).to(function (res) {
            return {
                success: true,
                message: "Sessions fetched!",
                data: res
            }
        })
    }

    getSessionById(params) {
        let sessionId = params.sessionId;
        if (!sessionId) {
            return deferred.failure('Session id not provided');
        }
        return Session.getSessionsBySessionId(sessionId).to(function (res) {
            if (res) {
                return {
                    success: true,
                    message: "Session fetched!",
                    data: res
                }
            } else {
                return {
                    success: false,
                    message: "Session not found!",
                }
            }

        })
    }

}

module.exports = SessionAPI;
