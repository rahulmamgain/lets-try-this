/**
 * Creates The Config For The Application
 * @return {[type]} [description]
 */
var config = (function createConfig () {
    // Set the environment.
    var env = require('get-env')({
        dev: ['dv', 'dev', 'development'],
        stage: ['st', 'stg', 'stage'],
        prod: ['pr', 'prod', 'production']
    });

    var config = require('./env.json')[env];
    return config;

})();


module.exports = config;
