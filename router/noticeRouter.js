/**
 * Created by animesh on 20/1/18.
 */

let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let NoticeAPI = require('../controller/noticeAPI');
let apiObj = new NoticeAPI();

function callAPI(req, res, apiMethod) {
    let params = {};
    params = req.params;
    params.headers = req.headers;
    if (req.method.toLowerCase() !== 'get') {
        params.post = req.body;
    }
    params.query = req.query;
    params.middlewareStorage = req.middlewareStorage;
    params.ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    apiMethod(params)
        .success(function (result) {
            res.send(result);
        })
        .failure(function (error) {
            console.logger.error(error);
            if (!(Object.prototype.toString.call(error) === '[object Object]')) {
                error = {success: false, error: error};
            }
            console.logger.error(error);
            res.status(500).send(error);
        });
}

router.post('/addNotice', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveNotice'));
});
router.get('/getNoticesBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getNoticeBySchoolId'));
});
router.get('/getDraftBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getNoticeDraftBySchoolId'));
});
router.post('/delete/:noticeId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteNotice'));
});
router.get('/:noticeId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByNoticeId'));
});
router.post('/edit', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editNotice'));
});

module.exports = router;