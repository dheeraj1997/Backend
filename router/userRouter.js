/**
 * Created by abhivendra on 15/10/17.
 */



let express = require('express');
let router = express.Router();
let multer = require('multer');
let storageProfile = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile')
    },
    filename: function (req, file, cb) {
        let fileName = Date.now() + file.originalname.replace(/ /g, '_');
        cb(null, fileName)
    },
    limits: {fileSize: 3 * 1024 * 1024}
});
let storageLogo = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/logo')
    },
    filename: function (req, file, cb) {
        let fileName = Date.now() + file.originalname.replace(/ /g, '_');
        cb(null, fileName)
    },
    limits: {fileSize: 3 * 1024 * 1024}
});
let uploadProfile = multer({storage: storageProfile});
let uploadLogo = multer({storage: storageLogo});

let fn = require('../lib/common-utils/functions');

let UserAPI = require('../controller/userAPI');
let apiObj = new UserAPI();

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

router.post('/changePassword/:userId', function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'changePassword'));
});

router.post('/add/profile', uploadProfile.single('profile'), function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'uploadProfilePicture'))
});

router.post('/add/logo', uploadLogo.single('logo'), function (req, res) {
    callAPI(req, res, fn.bind(apiObj, 'uploadProfilePicture'))
});




module.exports = router;
