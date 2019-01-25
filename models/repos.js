let authRepo = require('./auth_repo.js').getInstance();

let Repos = {
    userRepo : authRepo,
    contentRepo : contentRepo//,
    //anotherRepo : anotherRepo
};

module.exports = Repos;