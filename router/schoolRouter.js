/**
 * Created by abhivendra on 15/10/17.
 */



let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');
let moment = require('moment');
let SchoolAPI = require('../controller/schoolAPI');
let apiObj = new SchoolAPI();

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

//School Apis
router.post('/add', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'addSchool'));
});
router.post('/addOrg', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'addOrgSchool'));
});
router.post('/editSchool', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editSchool'));
});

router.post('/deleteSchool/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteSchool'));
});

router.post('/editSchoolStatus/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editSchoolStatus'));
});

router.get('/:id', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getById'));
});

router.post('/setCurrentSession', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'setCurrentSession'));
});

router.post('/getAll', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getAllSchools'));
});
router.get('/getByOrganizationId/:organizationId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getOrganizationAllSchools'));
});
router.get('/getByLoginId/:loginId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByLoginId'));
});

router.get('/getByUserName/:userName', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByUserName'));
});

router.post('/getAllCount', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getSchoolCount'));
});
//school sms apis

router.post('/sendSms', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'sendBulkSms'));
});

router.get('/getSchoolSms/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getSchoolSms'));
});

router.post('/editSchoolSms/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editSchoolSms'));
});


//school class attendance apis

router.get('/getTodayClassAttendanceList/:schoolId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getTodayClassAttendanceList'));
});

router.get('/getTodayClassAttendanceSummery/:schoolId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getTodayClassAttendanceSummery'));
});

router.post('/getTodayClassAttendanceReport/:schoolId/:sessionId/:classId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getTodayClassAttendanceReport'));
});

router.get('/getClassAttendanceList/:schoolId/:sessionId/:date', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getClassAttendanceList'));
});

router.get('/getAttendanceListToTake/:listId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getAttendanceListToTake'));
});

router.post('/saveClassAttendanceTaken', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveClassAttendanceTaken'));
});

router.get('/getAttendanceListToView/:listId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getAttendanceListToView'));
});

router.post('/getAttendanceReportCsv', apiObj.getAttendanceReportCsv);

//school class timing apis

router.post('/savePeriod', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'savePeriod'));
});

router.get('/getPeriodsBySchool/:schoolId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getPeriods'));
});

router.get('/getPeriods/:schoolId/:sessionId/:classId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getPeriodsByClassAndSchool'));
});

//school fees apis

router.post('/saveFees', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveFees'));
});

router.post('/saveAccountantFees/:schoolId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveAccountantFees'));
});

router.get('/getTotalFeesCollected/:schoolId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getTotalFeesCollected'));
});

router.get('/getFees/:schoolId/:sessionId/:classId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getFees'));
});

router.get('/getFeesLedger/:schoolId/:sessionId/:classId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getFeesLedger'));
});

router.post('/getFeesLedgerCsv', apiObj.getFeesLedgerCsv);

router.get('/getAccountantFees/:schoolId/:sessionId/:studentId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getAccountantFees'));
});

router.post('/editFees', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editFees'));
});

router.post('/deleteFees/:feesId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteFees'));
});

router.get('/getFeesHistory/:schoolId/:classId/:sessionId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getFeesCollection'));
});

router.post('/getFeeReceipt', apiObj.getFeeReceipt);

module.exports = router;
