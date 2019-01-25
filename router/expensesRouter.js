/**
 * Created by animesh on 23s/2/18.
 */
let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let ExpensesAPI = require('../controller/expensesAPI');
let apiObj = new ExpensesAPI();

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

router.post('/addExpenses', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveExpenses'));
});
router.get('/getBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getExpensesBySchoolId'));
});
router.post('/editExpense', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editExpenses'));
});
router.post('/deleteExpenses/:expensesId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteExpenses'));
});
router.get('/:expensesId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByExpensesId'));
});
router.get('/getTotalExpense/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getTotalExpenses'));
});

// expense category
router.post('/addExpensesCategory', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveExpensesCategory'));
});
router.get('/getCategoryBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getExpensesCategoryBySchoolId'));
});
router.post('/editExpenseCategory', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editedExpenseCategory'));
});
router.post('/deleteExpensesCategory/:expensesCategoryId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteExpensesCategory'));
});
router.get('/expenseCategory/:expensesCategoryId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getCategoryByExpensesId'));
});

module.exports = router;