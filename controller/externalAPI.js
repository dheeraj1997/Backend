let deferred = require('../lib/common-utils/deferred');
let moment = require('moment-timezone');
let pinService = require('../services/pinCodeService').getInstance();

class ExternalAPI {
    getPinInformation(params) {
        let pinCode = params.pin.replace(/ /g, "");
        if (!/^[1-9][0-9]{5}$/.test(pinCode)) {
            return deferred.failure('Invalid Pin code!');
        }
        return pinService.getPinInfo(pinCode)
            .to(function (res) {
                console.log('res', res);
                let data = JSON.parse(res);
                if (data && data.PostOffice && data.PostOffice.length) {
                    return data.PostOffice[0];
                } else {
                    return deferred.failure('No information available!');
                }
            })
    }

}

module.exports = ExternalAPI;