let httpClient = require('../lib/clients/httpclient').getInstance();
let d = require('../lib/common-utils/deferred');
const URL = "http://postalpincode.in/api/pincode/";

class PinService {
    getPinInfo(pin) {
        if (!pin) {
            return d.failure('No Pin provided!!');
        }
        return httpClient.getJSON(URL + pin)
    }
}

let instance;

exports.getInstance = function () {
    if (!instance) instance = new PinService();
    return instance;
};