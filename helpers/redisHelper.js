/**
 * Created by abhivendra on 30/10/17.
 */
let config = require('config');
let lodash = require('lodash');
let moment = require('moment-timezone');

let fn = require('../lib/common-utils/functions');


let redis = require("redis");

let redisClient = redis.createClient(config.redisConfig.port, config.redisConfig.host, {});

redisClient.on("error", function (err) {
    console.log("error while connecting to redis client " + err);
});


function pushToRedis(key, value) {
    return fn.defer(redisClient.set, redisClient)(key, value);
}

function pushToRedisTime(key, time, value) {
    return fn.defer(redisClient.setex, redisClient)(key, time, value);
}

function getFromRedis(key) {
    return fn.defer(redisClient.get, redisClient)(key);
}


function removeFromRedis(key) {
    return fn.defer(redisClient.del, redisClient)(key);
}

function getList(key) {
    return fn.defer(redisClient.lrange, redisClient)(key, 0, 1);
}

function addToList(key, value) {
    return fn.defer(redisClient.rpush, redisClient)(key, value)
}

function addToSet(key, value) {
    return fn.defer(redisClient.sadd, redisClient)(key, value);
}

function getSet(key) {
    return fn.defer(redisClient.smembers, redisClient)(key);
}

module.exports = {
    r: redisClient,
    pushToRedis: pushToRedis,
    pushToRedisTime: pushToRedisTime,
    getFromRedis: getFromRedis,
    getSet: getSet,
    addToSet: addToSet,
    remove: removeFromRedis
};