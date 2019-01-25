/**
 * Created by abhivendra on 10/12/16.
 */

let erpConnection = require('../sql_connections').inforida;
let fn = require('../../../lib/common-utils/functions');
let deferred = require('../../../lib/common-utils/deferred');
let moment = require('moment-timezone');

function AuthRepo() {
    //class init
}

AuthRepo.prototype.test = function () {
    let qry = 'SELECT * FROM additional_input_po';
    return  fn.defer(erpConnection.query , erpConnection)(qry).to(function (res) {
        return res;
    });
};

AuthRepo.prototype.getUserByEmailId = function (emailId) {
    let qry = 'SELECT * FROM auth where email="'+emailId+'"';
    return  fn.defer(erpConnection.query , erpConnection)(qry).to(function (res) {
        return res;
    });
};
AuthRepo.prototype.createUserDB = function (userObj) {
    let qry = 'INSERT INTO auth SET ?';
    console.log(qry);
    return  fn.defer(erpConnection.query , erpConnection)(qry , userObj).to(function (res) {
        console.logger.info(res);
        return res;
    });
};

AuthRepo.prototype.createRoleDB = function (roleName) {
    let qry = 'INSERT INTO user_role (role_name) VALUES ("'+roleName+'")';
    console.log(qry);
    return  fn.defer(erpConnection.query , erpConnection)(qry).to(function (res) {
        console.logger.info(res);
        return res;
    });
};

AuthRepo.prototype.getAllRolesDB = function () {
    let qry = 'select * from user_role';
    return  fn.defer(erpConnection.query , erpConnection)(qry).to(function (res) {
        return res;
    });
};

AuthRepo.prototype.getAllUsersDB = function () {
    let qry = 'select * from auth';
    return  fn.defer(erpConnection.query , erpConnection)(qry).to(function (res) {
        return res;
    });
};
AuthRepo.prototype.deleteRoleDB = function (roleId) {
    let qry = 'DELETE FROM user_role where role_id ='+roleId;
    return  fn.defer(erpConnection.query , erpConnection)(qry).to(function (res) {
        return res;
    });
};

AuthRepo.prototype.getAllScreenSectionInfoDB = function () {
    let qry = 'select sc.id as screen_id , sc.name as screen_name , sa.id as sec_id , sa.name as sec_name from screen sc left join section sa ON sc.sectionid = sa.id;';
    return  fn.defer(erpConnection.query , erpConnection)(qry).to(function (res) {
        return res;
    });
};
AuthRepo.prototype.getScreenPermissionOfRole = function (roleId) {
    let qry = 'select * from role_screen_permission where role_id ='+roleId;
    return  fn.defer(erpConnection.query , erpConnection)(qry).to(function (res) {
        return res;
    });
};

let instance;

exports.getInstance = function () {
    if (!instance) instance = new AuthRepo();
    return instance;
};