let request = require('request');
let deferred = require('../common-utils/deferred');
let fn = require('../common-utils/functions');

function HttpClient() {}

HttpClient.prototype.main = function() {
	let args = Array.prototype.slice.call(arguments, 0);
	return deferred.defer(function (callbacks) {
        function callback(err, resObject, result) {
            if (err || resObject.statusCode > 400) {
                callbacks.failure(err);
            } else {
                callbacks.success(result);
            }
        }
        args.push(callback);
        request.apply(null, args);
    });
};

HttpClient.prototype.getJSON = function(url, xtraOptions) {
    let options = {
        url : url,
        method : 'GET',
        headers : {
            "Content-type" : "application/json"
        }
    };
    options = fn.merge(options, xtraOptions);
    return this.main(options);
};

HttpClient.prototype.getPlainText = function(url) {
    let options = {
        url : url,
        method : 'GET',
        headers : {
            "Content-type" : "text/plain"
        }
    };
    return this.main(options);
};

HttpClient.prototype.postJSON = function(url, params) {
    let options = {
        url : url,
        method : "POST",
        json : params
    };
    return this.main(options);
};

HttpClient.prototype.raw = function(options) {
    return this.main(options);
};

HttpClient.prototype.postForm = function(url, form, xtraOptions) {
    let options = {
        url : url,
        method : 'POST',
        form: form
    };
    options = fn.merge(options, xtraOptions);
    return this.main(options);
};

exports.HttpClient = HttpClient;
exports.getInstance = function() {
	return new HttpClient(); 
};
