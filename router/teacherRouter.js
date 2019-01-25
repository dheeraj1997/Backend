/**
 * Created by abhivendra on 15/10/17.
 */



let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');
let multer = require('multer');
let storageCsv = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/teacher/csv')
    },
    filename: function (req, file, cb) {
        let fileName = Date.now() + file.originalname.replace(/ /g, '_');
        cb(null, fileName)
    },
    limits: {fileSize: 100 * 1024}
});

let uploadCsv = multer({storage: storageCsv});
let TeacherAPI = require('../controller/teacherAPI');
let apiObj = new TeacherAPI();

function callAPI(req, res, apiMethod) {
    let params = {};
    params = req.params;
    params.headers = req.headers;
    if (req.method.toLowerCase() !== 'get') {
        params.post = req.body;
    }
    params.query = req.query;
    params.file = req.file;
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

router.post('/add/csv', uploadCsv.single('csv'), function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'uploadTeacherCsv'))
});

router.get('/get/csv/:type', apiObj.getTeacherCsv);

router.post('/add', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveTeacher'));
});

router.get('/getBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getTeachersBySchoolId'));
});

router.get('/getByLoginId/:loginId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getTeachersByLoginId'));
});

router.post('/edit', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editTeacher'));
});

router.post('/delete/:teacherId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteTeacher'));
});

router.get('/getTeacherById/:teacherId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByTeacherId'));
});

router.get('/getTeachersCount/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getTeachersCountBySchoolId'));
});

module.exports = router;
