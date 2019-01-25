/**
 * Created by abhivendra on 15/10/17.
 */



let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let SubjectAPI = require('../controller/subjectAPI');
let apiObj = new SubjectAPI();

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

router.post('/add', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveSubject'));
});

router.post('/edit', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editSubject'));
});

router.post('/delete/:subjectId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteSubject'));
});

router.get('/:subjectId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getBySubjectId'));
});

router.get('/getBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getSubjectsBySchoolId'));
});
router.get('/getSubjectCount/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getSubjectsCountBySchoolId'));
});

module.exports = router;
