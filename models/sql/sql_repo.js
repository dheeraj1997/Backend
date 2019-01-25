/**
 * Created by abhivendra on 10/12/16.
 */
let authRepo = require('./repos/auth_repo').getInstance();


let Repos = {
    sqlAuthRepo : authRepo,
    //anotherRepo : anotherRepo
};

module.exports = Repos;