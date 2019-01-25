/**
 * Created by abhivendra on 26/11/17.
 */

let express = require('express');
let router = express.Router();

let fn = require('../lib/common-utils/functions');
let moment = require('moment-timezone');

let ExternalAPI = require('../controller/externalAPI');
let apiObj = new ExternalAPI();

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

router.get('/getPinInfo/:pin', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'getPinInformation'));
});


module.exports = router;
