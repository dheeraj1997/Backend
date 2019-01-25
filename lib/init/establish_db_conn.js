let Sequelize = require('sequelize');
let seqCfg = require('config').dbConfig;
let sequelize = new Sequelize(seqCfg.database, seqCfg.username, seqCfg.password, seqCfg.options);

exports.sequelize = sequelize;
