/**
 * Created by abhivendra on 12/11/17.
 */

let httpClient = require('../lib/clients/httpclient').getInstance();
let School = require('../models/mongo/repo/master').school;
let deferred = require('../lib/common-utils/deferred');
const URL = "http://priority.muzztech.in/sms_api/sendSms.php?username=ankur12&password=akshat@123";

class SmsService {
    sendSingleSms(number, message, data, senderName) {
        console.log('sendSingleSms number', number);
        // let messageEncode = encodeURIComponent(message);
        console.log('message', message);
        console.log('sendSingleSms message', message);
        let url = "http://priority.muzztech.in/sms_api/sendSms.php";
        return httpClient.postForm(url, {
            username: "ankur12",
            password: "akshat@123",
            sendername: "WEBTEL",
            mobile: number,
            message: message
        }).to(function (res) {
            console.log('inside sms success res', res);
            data.sentTo = number.split(',');
            data.text = message;
            data.smsLength = message.length;
            data.totalSmsSent = (data.sentTo.length) * Math.ceil(data.smsLength / 160);
            let resSplit = res.split(": ");
            data.jobId = resSplit.length ? resSplit.pop() : 'failed';
            console.log('data', data);
            return School.getSchoolById(data.schoolId).to(function (schoolInfo) {
                let schoolSms = schoolInfo.smsCount;
                let schoolUpdated = School.updateSchool(
                    schoolInfo._id,
                    {
                        "smsCount.used": (schoolSms.used + data.totalSmsSent)
                    });
                let createSms = School.createSchoolSms(data);
                return deferred.combine({
                    schoolUpdated: schoolUpdated,
                    createSms: createSms
                }).to(function (cR) {
                    return {
                        success: true,
                        message: "Sms Sent Successfully!!",
                        data: cR
                    }
                })
            })

        }).toFailure(err => {
            console.log('inside sms fail err', err);
            return {
                success: false,
                message: "Sms Not Sent!!",
                data: err
            };
        });
    }

    sendOtp(number, message) {
        console.log('number', number);
        let messageEncode = encodeURIComponent(message);
        console.log('message', message);
        let composedUrl = URL + '&mobile=' + number;
        composedUrl += '&sendername=WEBTEL';
        composedUrl += '&message=' + messageEncode;
        console.log('composedUrl', composedUrl);
        return httpClient.getJSON(composedUrl).to(function (res) {
            console.log('inside sms res', res);
            return {
                success: true,
                message: 'OTP Sent'
            }
        });
    }

    sendSingleSmsUnicode(number, message, data, senderName) {
        // let URL = "http://priority.muzztech.in/sms_api/smsUnicode.php?username=ankur12&password=akshat@123&MType=U";
        console.log('number', number);
        // let messageEncode = encodeURIComponent(message);
        console.log('message', message);
        // let composedUrl = URL + '&mobile=' + number;
        // composedUrl += '&sendername=' + (senderName || 'WEBTEL');
        // composedUrl += '&message=' + messageEncode;
        // console.log('composedUrl', composedUrl);
        let url = "http://priority.muzztech.in/sms_api/smsUnicode.php";
        return httpClient.postForm(url, {
            username: "ankur12",
            password: "akshat@123",
            sendername: "WEBTEL",
            MType: "U",
            mobile: number,
            message: message
        }).to(function (res) {
            console.log('inside sms res', res);
            data.sentTo = number.split(',');
            data.text = message;
            data.smsLength = message.length;
            data.totalSmsSent = (data.sentTo.length) * Math.ceil(data.smsLength / 70);
            data.jobId = '';
            console.log('data', data);
            return School.getSchoolById(data.schoolId).to(function (schoolInfo) {
                let schoolSms = schoolInfo.smsCount;
                let schoolUpdated = School.updateSchool(
                    schoolInfo._id,
                    {
                        "smsCount.used": (schoolSms.used + data.totalSmsSent)
                    });
                let createSms = School.createSchoolSms(data);
                return deferred.combine({
                    schoolUpdated: schoolUpdated,
                    createSms: createSms
                }).to(function (cR) {
                    return {
                        success: true,
                        message: "Sms Sent Successfully!!",
                        data: cR
                    }
                })
            }).toFailure(err => {
                console.log('inside sms fail err', err);
                return {
                    success: false,
                    message: "Sms Not Sent!!",
                    data: err
                };
            });

        });
    }

    // sendSingleSmsUnicode(number, message, data, senderName) {
    //     let URL = "http://priority.muzztech.in/sms_api/smsUnicode.php?username=ankur12&password=akshat@123&MType=U";
    //     console.log('number', number);
    //     let messageEncode = encodeURIComponent(message);
    //     console.log('message', message);
    //     let composedUrl = URL + '&mobile=' + number;
    //     composedUrl += '&sendername=' + (senderName || 'WEBTEL');
    //     composedUrl += '&message=' + messageEncode;
    //     console.log('composedUrl', composedUrl);
    //     return httpClient.getJSON(composedUrl).to(function (res) {
    //         console.log('inside sms res', res);
    //         data.sentTo = number.split(',');
    //         data.text = message;
    //         data.smsLength = message.length;
    //         data.totalSmsSent = (data.sentTo.length) * Math.ceil(data.smsLength / 70);
    //         data.jobId = '';
    //         return School.getSchoolById(data.schoolId).to(function (schoolInfo) {
    //             let schoolSms = schoolInfo.smsCount;
    //             let schoolUpdated = School.updateSchool(
    //                 schoolInfo._id,
    //                 {
    //                     "smsCount.used": (schoolSms.used + data.totalSmsSent)
    //                 });
    //             let createSms = School.createSchoolSms(data);
    //             return deferred.combine({
    //                 schoolUpdated: schoolUpdated,
    //                 createSms: createSms
    //             })
    //         })
    //     });
    // }

    sendMultipleSms(numberArr, message, senderName) {
        let numberString = numberArr.reduce(function (a, p) {
            a += p + ',';
            return a;
        }, "");
        console.log('numberString', numberString);
        let composedUrl = URL + '&mobile=' + numberString;
        composedUrl += '&sendername=' + (senderName || 'WEBTEL');
        composedUrl += '&message=' + encodeURIComponent(message);
        console.log('composedUrl', composedUrl);
        return httpClient.getJSON(composedUrl).to(function (res) {
            console.log('inside sms res', res);
            return res;
        });

    }
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new SmsService();
    return instance;
};