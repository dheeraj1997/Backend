/**
 * Created by animesh on 06/2/18.
 */
let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let GSettingsAPI = require('../controller/gSettingsAPI');
let apiObj = new GSettingsAPI();

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

router.post('/addSettings', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveSettings'));
});
router.get('/getSettings/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getSettings'));
});

router.get('/getClassAttendanceSettings/:schoolId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getClassAttendanceSettings'));
});

router.post('/addClassAttendanceSettings', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'addClassAttendanceSettings'));
});


module.exports = router;