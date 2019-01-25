/**
 * Created by animesh on 14/1/18.
 */

let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let LibrarianAPI = require('../controller/librarianAPI');
let apiObj = new LibrarianAPI();

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

router.post('/addBook', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'saveBook'));
});
router.post('/issueBook', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'issueBook'));
});
router.post('/returnBook', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'returnBook'));
});
router.post('/edit', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'editBook'));
});
router.post('/deleteBook/:bookId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'deleteBook'));
});
router.get('/getBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getBooksBySchoolId'));
});
router.get('/getBookById/:bookId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getByBookId'));
});

router.get('/getIssueBookBySchoolId/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getIssueBooksBySchoolId'));
});
router.get('/getBooksCount/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getBookCount'));
});
router.get('/getIssueBooksCount/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getIssueBookCount'));
});
router.get('/getReturnBooksCount/:schoolId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getReturnBookCount'));
});

module.exports = router;