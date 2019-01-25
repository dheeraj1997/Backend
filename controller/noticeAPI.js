let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let Notice = require('../models/mongo/repo/master').notice;
let Auth = require('./authAPI');
let auth = new Auth();

class NoticeAPI {


    saveNotice(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.failure("no post param!")
        }
        if (!postObj.noticeDate || !postObj.title || !postObj.schoolId || !postObj.noticeText) {
            return deferred.failure("incorrect params!");
        }

        console.log('postObj', postObj);
        return Notice.createNotice(postObj).to(function (res) {

            return {
                success: true,
                message: "notice created!",
                data: res
            }
        })
    }

    getNoticeBySchoolId(params) {
        let schoolId = params.schoolId;
        let target = params.query.target && [params.query.target] || ['teachers', 'parents', 'librarians', 'accountants', 'students', 'hr', 'registrar'];
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Notice.getNoticeBySchool(schoolId, target).to(function (res) {
            console.log('res', res);
            return {
                success: true,
                message: "Notice fetched!",
                data: res
            }
        })
    }

    getNoticeDraftBySchoolId(params) {
        let schoolId = params.schoolId;
        if (!schoolId) {
            return deferred.failure('School id not provided');
        }
        return Notice.getNoticeDraftBySchool(schoolId).to(function (res) {
            console.log('res', res);
            return {
                success: true,
                message: "Notice fetched!",
                data: res
            }
        })
    }

    deleteNotice(params) {
        console.log("params.post", params.post);
        let noticeId = params.noticeId;
        if (!noticeId) {
            return {
                success: false,
                message: "No notice id!"
            }
        }
        return Notice.deleteNoticeById(noticeId).to(function (res) {
            return {
                success: true,
                message: "notice Deleted!!",
                data: res
            }
        })
    }

    getByNoticeId(params) {
        let noticeId = params.noticeId;
        if (!noticeId) {
            return deferred.failure('Notice id not provided.');
        }
        return Notice.getNoticeById(noticeId).to(function (res) {
            return {
                success: true,
                message: "Notice fetched!",
                data: res
            }
        })
    }

    editNotice(params) {
        console.log("params.post", params.post);
        let postObj = params.post;
        if (!postObj) {
            return deferred.success({
                success: false,
                message: "No post param!"
            })
        }
        if (!postObj._id || !postObj.title || !postObj.noticeText || !postObj.noticeDate) {
            return deferred.success({
                success: false,
                message: "Incorrect params!"
            });
        }
        postObj.updatedAt = new Date();
        return Notice.updateNoticeById(postObj._id, postObj).to(function (res) {
            return {
                success: true,
                message: "Notice Edited!!",
                data: res
            }
        })
    }
}


module.exports = NoticeAPI;