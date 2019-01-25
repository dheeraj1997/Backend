/**
 * Created by animesh on 13/2/18.
 */



let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let HomeworkAPI = require('../controller/homeworkAPI');
let apiObj = new HomeworkAPI();

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

router.post('/addHomework', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveHomework'));
});
router.post('/edit', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editHomework'));
});
router.post('/delete/:homeworkId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteHomework'));
});
router.get('/getHomeWorkBySchoolTeacher/:schoolId/:teacherId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getHomeworkBySchoolTeacherId'));
});
router.get('/:homeworkId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByHomeworkId'));
});


module.exports = router;
