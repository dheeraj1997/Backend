/**
 * Created by bhaveshkasana on 15/02/2017 AD.
 */

var deferred = require('../common-utils/deferred');
var fn = require('../common-utils/functions');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


var options ={
    host:'smtp.mandrillapp.com',
    port:587,
    auth: {
        user: 'nishrit@stalkbuylove.com',
        pass: 'xaCz7k1nBO6KOF8GKSmljg'
    }
};


var transporter = nodemailer.createTransport(smtpTransport(options));
// setup e-mail data with unicode symbols
var fs = require('fs');
var path = require("path");

function sendMail(to, body, subject){
    var mailOptions = {
        from: 'contact@stalkbuylove.com', // sender address
        to:to,
        subject: subject, // Subject line
        html: body // html body
    };
    return fn.defer(transporter.sendMail , transporter)(mailOptions).to(function (res) {
        console.log("sendMailHelper: mail sent");
        return res;
    });
};

function sendForgotPasswordMail(to, body, subject){
    var mailOptions = {
        from: 'contact@stalkbuylove.com', // sender address
        to:to,
        subject: subject, // Subject line
        html: body, // html body,
        attachments:[
            {
                filename: 'qlogo.png',
                path:path.join(__dirname ,'../..','public/mailer/qlogo.jpg'),
                cid: 'qlogo' //same cid value as in the html img src
            },
            {
                filename: 'password.png',
                path:path.join(__dirname , '../..','public/mailer/password.jpg'),
                cid: 'password' //same cid value as in the html img src
            }
        ]
    };
    console.log('inside fun');
    return fn.defer(transporter.sendMail , transporter)(mailOptions).to(function (res) {
        console.log("sendMailHelper: mail sent");
        return res;
    });
    // return body;
}

module.exports={
    sendMail:sendMail,
    sendForgotPasswordMail:sendForgotPasswordMail
};