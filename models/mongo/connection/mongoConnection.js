/**
 * Created by abhivendra on 29/04/17.
 */
"use strict";
let mongoose = require('mongoose');
let mongoConfig = require('config').mongoConfig;
// mongoose.Promise = global.Promise;

let connection = mongoose.createConnection('mongodb://' + mongoConfig.host);
connection.on('error', function (err) {
    console.logger.error("something is wrong : ", err);
});

connection.on('open', function () {
    console.logger.info("successfully connected to mongodb: ");
});

module.exports = {
    connection: connection
};

