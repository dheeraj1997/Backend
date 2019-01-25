/**
 * Created by abhivendra on 10/12/16.
 */

let deferred = require('../lib/common-utils/deferred');
let moment = require('moment');
let User = require('../models/mongo/repo/master').user;
let sms = require('../services/smsService').getInstance();

class AuthAPI {
    login(params) {
        console.log(" params.post", params.post);
        let userName = params.post.username;
        let password = params.post.password;
        let fcmToken = params.post.fcmToken;
        if (!userName || !password) {
            return deferred.failure(
                'Params mismatch!'
            );
        }
        return User.findUser(userName).to(function (res) {
            console.log('res', res);
            if (!res) {
                return deferred.failure(
                    "This user doesn't exist!"
                );
            } else if (res.password !== password) {
                return deferred.failure(
                    "Incorrect password!"
                );
            } else {
                delete res.password;
                delete res.lastLoginIpAddress;
                delete res.signUpIpAddress;
                delete res.updatedAt;
                delete res.createdAt;
                delete res.lastLogin;
                User.updateUserIpAndLastLoginAndToken(res._id, params.ip, fcmToken);
                return {
                    success: true,
                    message: "Login successful!",
                    data: res
                }
            }
        });
    }

    forget(params) {
        console.log(" params.post", params.post);
        let userName = params.post.username;
        if (!userName) {
            return deferred.success({
                success: false,
                message: 'Params mismatch!'
            });
        }
        return User.findUser(userName).to(function (res) {
            console.log('res', res);
            if (!res) {
                return {
                    success: false,
                    message: "This user doesn't exist. Please contact your admin for user name."
                };
            } else {
                if (!res.mobile) {
                    return {
                        success: false,
                        message: "Mobile number on this user doesn't exist. Please contact your admin for password change."
                    };
                } else {
                    delete res.password;
                    delete res.lastLoginIpAddress;
                    delete res.signUpIpAddress;
                    delete res.updatedAt;
                    delete res.createdAt;
                    delete res.lastLogin;
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let otpMessage = 'One time password for your Inforida account is ' + otp;
                    let msgSend = sms.sendOtp(res.mobile, otpMessage);
                    let updateUser = User.updateUserOtp(res._id, otp);
                    return deferred.combine({
                        msgSend: msgSend,
                        updateUser: updateUser
                    }).to(combRes => {
                        return {
                            success: true,
                            message: "Please enter 6 digit OTP sent to your phone.!",
                        }
                    })
                }
            }
        });
    }

    submitForgetOtp(params) {
        console.log(" params.post", params.post);
        let userName = params.post.username;
        let otp = params.post.otp;
        if (!userName) {
            return deferred.success({
                success: false,
                message: 'Params mismatch!'
            });
        }
        return User.findUser(userName).to(function (res) {
            console.log('res', res);
            if (!res) {
                return {
                    success: false,
                    message: "This user doesn't exist. Please contact your admin for user name."
                };
            } else {
                console.log('diff', moment(res.forgetData.expiry).diff(moment(), 'seconds'));
                if (!res.forgetData || res.forgetData.isUsed || moment(res.forgetData.expiry).diff(moment(), 'seconds') < 0) {
                    return {
                        success: false,
                        message: "Your OTP is expired!",
                    }
                } else if (res.forgetData.otp !== otp) {
                    return {
                        success: false,
                        message: "OTP Mismatch!",
                    }
                } else {
                    return {
                        success: true,
                        message: "Your OTP is correct!",
                    }
                }
            }
        });
    }

    submitForgetPassword(params) {
        console.log(" params.post", params.post);
        let userName = params.post.username;
        let password = params.post.password;
        if (!userName) {
            return deferred.success({
                success: false,
                message: 'Params mismatch!'
            });
        }
        return User.changePasswordByUsername(userName, password).to(function (res) {
            return {
                success: true,
                message: "Your password changed successfully!",
            };
        })
    }

    signUp(params) {
        console.log(" params", params);
        console.log(" params.post", params.post);
        let userData = params.post;
        if (
            !userData.username ||
            !userData.password ||
            !userData.userType ||
            !userData.userType.type ||
            !userData.userType.category

        ) {
            return deferred.failure('Params mismatch!');
        }
        console.log('userData', userData);
        userData.signUpIpAddress = params.ip;
        // let userByMobile = User.findUserByMobile(userData.mobile);
        // let userByUserName = User.findUserByUserName(userData.username);
        return User.findUserByUserName(userData.username).to(function (res) {
            console.log('res', res);
            if (res && res.username === userData.username) {
                return deferred.failure('User already exist, please choose new username.');
            } else {
                return User.createUser(userData).to(function (res) {
                    let toRet = JSON.parse(JSON.stringify(res));
                    delete toRet.password;
                    delete toRet.signUpIpAddress;
                    delete toRet.updatedAt;
                    delete toRet.__v;
                    delete toRet.lastLogin;
                    delete toRet.lastLoginIpAddress;
                    return {
                        success: true,
                        message: "User created successfully!",
                        data: toRet
                    }
                })
            }
        });

    }
}

module.exports = AuthAPI;
