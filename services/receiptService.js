let path = require('path');
let url = require('url');
let fs = require('fs');
let pdf = require('html-pdf');
let moment = require('moment');
var q = require('q');

class ReceiptService {
    generateFeeReceipt(html, filename) {
        let deffered = q.defer();
        let ts = Date.now().toString();
        let clientDir = path.join(__dirname, '../public/feereceipt');
        let pdfPath = path.join(clientDir, filename + '-' + ts + '.pdf');

        let options = {};
        // options.phantomPath = "/usr/bin/phantomjs";
        options.orientation = "portrait";
        options.height = "1754px";
        options.width = "1240px";
        console.log('html', html);
        console.log('filename', filename);
        pdf.create(html, options).toStream(function (err, stream) {
            console.log('err', err);
            console.log('stream', stream);
            stream.pipe(fs.createWriteStream(pdfPath));
            deffered.resolve(filename + '-' + ts + ".pdf");
        });
        return deffered.promise;
    }
}

let instance;
exports.getInstance = function () {
    if (!instance) instance = new ReceiptService();
    return instance;
};