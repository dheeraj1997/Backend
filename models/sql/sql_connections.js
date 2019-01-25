/**
 * Created by abhivendra on 10/12/16.
 */

var erpSqlConfig = require('config').inforidaSqlConfig;
var mysql      = require('mysql');

var erpConnection = mysql.createConnection({
    host: erpSqlConfig.host,
    port: erpSqlConfig.port,
    user: erpSqlConfig.user,
    password: erpSqlConfig.password,
    database: erpSqlConfig.database
});
erpConnection.connect(function (err) {
    if (err) {
        console.error('error connecting erpConnection: ' + err.stack);
        return;
    }

    console.log('erpConnection as threadId ' + erpConnection.threadId);
});


module.exports = {
    inforida : erpConnection,
};


