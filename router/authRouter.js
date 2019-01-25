/**
 * Created by abhivendra on 10/12/16.
 */



let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');

let AuthAPI = require('../controller/authAPI');
let apiObj = new AuthAPI();

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

//gets list of vendors
router.post('/login', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, "login"));
});

router.post('/forget', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, "forget"));
});

router.post('/submitForgetOtp', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, "submitForgetOtp"));
});

router.post('/submitForgetPassword', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, "submitForgetPassword"));
});

router.post('/signup', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, "signUp"));
});

module.exports = router;
