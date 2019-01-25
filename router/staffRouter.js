/**
 * Created by abhivendra on 15/10/17.
 */
let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');
let multer = require('multer');
let storageCsv = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/staff/csv')
    },
    filename: function (req, file, cb) {
        let fileName = Date.now() + file.originalname.replace(/ /g, '_');
        cb(null, fileName)
    },
    limits: {fileSize: 100 * 1024}
});

let uploadCsv = multer({storage: storageCsv});
let StaffAPI = require('../controller/staffAPI');
let apiObj = new StaffAPI();

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
    callAPI(req, res, fn.bind(apiObj, 'saveStaff'));
});

router.post('/add/csv', uploadCsv.single('csv'), function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'uploadStaffCsv'))
});

router.get('/get/csv/:type', apiObj.getStaffCsv);

router.get('/getBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStaffsBySchoolId'));
});

router.get('/getByLoginId/:loginId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStaffsByLoginId'));
});

router.post('/edit', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editStaff'));
});

router.get('/:staffId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByStaffId'));
});

router.post('/delete/:staffId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteStaff'));
});

router.get('/getStaffCount/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getStaffCountBySchoolId'));
});
module.exports = router;
