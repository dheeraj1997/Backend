let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let ResultAPI = require('../controller/resultAPI');
let apiObj = new ResultAPI();

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

router.post('/addResult', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveResult'));
});

router.get('/getResult/:schoolId/:sessionId/:classId/:examId/:subjectId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getResult'));
});

router.get('/getResultByExam/:schoolId/:sessionId/:classId/:examId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getResultByExam'));
});

router.post('/getReportCard', apiObj.getReportCard);

router.post('/getAdmitCard', apiObj.getAdmitCard);

module.exports = router;