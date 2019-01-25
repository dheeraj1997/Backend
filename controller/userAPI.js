let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let School = require('../models/mongo/repo/master').school;
let Subject = require('../models/mongo/repo/master').subject;
let User = require('../models/mongo/repo/master').user;
let Auth = require('./authAPI');
let auth = new Auth();

class UserAPI {
    changePassword(params) {
        let userId = params.userId;
        let newPass = params.post.password;
        return User.changePasswordById(userId, newPass).to(function (res) {
            return {
                success: true,
                message: 'Password changed successfully!',
                data: res
            }
        })
    }

    uploadProfilePicture(params) {
        console.log('params', params);
        if (params.file && params.file.path) {
            let path = params.file.path;
            console.log('path', path);
            let format = path.split('.').pop();
            console.log('format', format);
            return deferred.success({
                success: true,
                data: {name: params.file.filename}
            });
            // if (format !== 'csv') {
            //     return deferred.failure({
            //         success: false,
            //         error: "Not CSV Format!"
            //     });
            // }
        }
        else {
            return deferred.success({
                success: false,
                message: 'Error in uploading'
            });
        }
    }
}

module.exports = UserAPI;
