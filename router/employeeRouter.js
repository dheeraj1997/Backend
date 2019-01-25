/**
 * Created by animesh on 16/2/18.
 */
let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');
let moment = require('moment');
let EmployeeAPI = require('../controller/employeeAPI');
let apiObj = new EmployeeAPI();

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

router.post('/addEmployee', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveEmployee'));
});
router.post('/getAll', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getAllEmployees'));
});
router.post('/editEmployee', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editEmployee'));
});
router.post('/deleteEmployee/:employeeId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteEmployee'));
});
router.get('/:employeeId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByEmployeeId'));
});
router.post('/getAllCount', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getEmployeesCount'));
});
module.exports = router;