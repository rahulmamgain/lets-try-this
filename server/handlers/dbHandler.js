var mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    database;

function connect(dbconfig,cb) {
    //console.log('Connecting To Mongo Db');
    var connectionString = getConnectionInfo(dbconfig);
    database = mongoose.connect(connectionString,cb);
}

function close() {
    mongoose.disconnect();
}

function getConnection() {
    return database;
}


function getConnectionInfo(dbconfig) {

    var standardURI = 'mongodb://';

    if (dbconfig.host2) { // production db
        standardURI = standardURI.concat(
            dbconfig.host,
            ':',
            dbconfig.port,
            ',',
            dbconfig.host2,
            ':',
            dbconfig.port2,
            '/',
            dbconfig.name,
            '?replicaSet=',
            dbconfig.replicaset
      );
    }
    else {
        standardURI = standardURI.concat(
            dbconfig.host,
            ':',
            dbconfig.port,
            '/',
            dbconfig.name
        );
    }
    
    return standardURI;
}

module.exports = {
    connect,
    close,
    getConnection 
};
