/**
 * Created by abhivendra on 17/10/17.
 */

let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');
let multer = require('multer');
let storageCsv = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/student/csv')
    },
    filename: function (req, file, cb) {
        let fileName = Date.now() + file.originalname.replace(/ /g, '_');
        cb(null, fileName)
    },
    limits: {fileSize: 100 * 1024}
});

let uploadCsv = multer({storage: storageCsv});


let StudentAPI = require('../controller/studentAPI');
let apiObj = new StudentAPI();

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

router.post('/add', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'addStudent'));
});

router.post('/add/csv', uploadCsv.single('csv'), function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'uploadStudentCsv'))
});

router.get('/get/csv/:type', apiObj.getStudentCsv);

router.post('/assignRollNumbers', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'assignRollNumbers'));
});


router.get('/getAdmissionForm/:studentId', apiObj.getAdmissionForm);

router.get('/getIdCards/:schoolId/:sessionId/:classId', apiObj.getIdCards);

router.post('/getStudentByAadhaar', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentDetailsByAadhaar'));
});

router.get('/getStudentBySchool/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentBySchoolId'));
});

router.get('/getStudentByTimeTable/:timeTableId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentByTimeTable'));
});

router.get('/getStudentBySchoolAndClassAndSession/:schoolId/:classId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentBySchoolAndClassAndSession'));
});
router.get('/getStudentBySchoolAndClassAndSessionByTransport/:schoolId/:classId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentBySchoolAndClassAndSessionByTransport'));
});
router.get('/getStudentBySchoolAndClassAndSessionByTransportFees/:schoolId/:classId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentBySchoolAndClassAndSessionByTransportFees'));
});
router.get('/getStudentBySchoolAndClass/:schoolId/:classId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentBySchoolAndClassId'));
});

router.get('/getStudentByAadhaar/:schoolId/:aadhaarId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentDetailsByAadhaar'));
});

router.get('/getGuardianByAadhaar/:aadhaarId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getGuardianDetailsByAadhaar'));
});

router.get('/getStudentFees/:studentId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getFeesByStudentAndSessionId'));
});

router.post('/edit', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editStudent'));
});

router.post('/transportFee', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'transportFeeStudent'));
});

router.post('/discontinueTransportFee', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'discontinueTransportFee'));
});

router.post('/delete/:studentId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteStudent'));
});

router.get('/getStudentsCount/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentsCount'));
});

router.get('/:studentId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentById'));
});
router.get('/:studentId/', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStudentByTransportFee'));
});

module.exports = router;
