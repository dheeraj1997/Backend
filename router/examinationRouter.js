/**
 * Created by animesh on 1/2/18.
 */
let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let ExaminationAPI = require('../controller/examinationAPI');
let apiObj = new ExaminationAPI();

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

router.post('/addExam', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveExam'));
});
router.post('/addExamSettings', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveExamSettings'));
});

router.get('/getBySchoolId/:schoolId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getExamBySchoolId'));
});

router.get('/getSettingsBySchoolId/:schoolId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getSettingsBySchoolId'));
});

router.post('/edit', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editExam'));
});
router.post('/deleteExam/:examId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteExam'));
});
router.get('/:examId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByExamId'));
});

module.exports = router;