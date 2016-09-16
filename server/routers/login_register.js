/*
Handles login and registration things.
 */
var express = require('express');
var router = express.Router();
var filters = require('../filter.js');
var CONSTANTS = require('../config/constants');
var User = require('../models/user_model');
var LoginStatus = require('../models/login_status_model');
var async = require('async');
var moment = require('moment');
const crypto = require('crypto');
var validator = require('validator');
var Data = require('../models/data_model');

var config = require('../config/config');

router.all('*', filters.logRequest, filters.verifyTimestamp, filters.verifyNonce);

/**
 * Logout
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {}          [description]
 * @return {[type]}       [description]
 */
router.post('/logout', function(req, res, next) {
    console.log('Logout');
    if (!req.headers.token) {
        res.status(500).send({message : 'Send A Valid Token'});
        return;
    }

    if (req.headers.token.length === 0) {
        res.status(500).send({message : 'Send A Valid Token'});
        return;
    }
    async.waterfall([
        (callback) => {
            try {
                LoginStatus.LoginStatusModel.find({token : req.headers.token}).remove().exec();
                callback(null);
            } catch (err) {
                req.logger.error(err.message);
                return callback(err);
            }
        }
    ],(err) => {
        try {
            if (err) {
                req.logger.error(err.stack);
                res.status(err.status ? err.status : 500).send({});
            }               
            req.logger.info('Successfully Logged Out');
            res.status(204).send();
        } catch (err) {
            req.logger.error(err.stack);
            res.status(500).send({});
        }
    });
});


/**
 * Login a current user
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {}          [description]
 * @return {[type]}      [description]
 */
router.post('/login', function(req, res, next) {
    console.log('Login');

    if (!req.body.emailId) {
        res.status(400).send(CONSTANTS.ErrorMessages.InvalidEmailId); return;
    }
    if (!req.body.password) {
        res.status(400).send(CONSTANTS.ErrorMessages.InvalidPassword); return;
    }
   
    if (!(validator.isEmail(req.body.emailId))) {
        res.status(400).send(CONSTANTS.ErrorMessages.InvalidPassword); return;
    }

    async.waterfall([
        (callback) => {
            try {
                User.UserModel.findOne({email : req.body.emailId, password : req.body.password}, 
                (err, user) => {
                    if (err) {
                        req.logger.debug('Error While Finding User ' + err.message);
                        return callback(err);
                    }
                    return callback(null, user);
                });
            } catch (err) {
                req.logger.error(err.message);
                return callback(err);
            }
        },

        (user, callback) => {
            if (!user) {
                return callback({
                    message : CONSTANTS.ErrorMessages.InvalidEmailIdOrPassword,
                    status : 401
                });
            }
            crypto.randomBytes(256, (err, buf) => {
                if (err) {
                    req.logger.debug('Error While Finding User ' + err.message);
                    return callback(err);
                }
                return callback(null, user, buf);
            });
        },
        (user, buf, callback) => {
            var session = new LoginStatus.SessionModel({
                ip : req.ip,
                userAgent : req.user
            });
            //user.password = null;
            var loginStatus = new LoginStatus.LoginStatusModel({
                user : user.id,
                token : buf.toString('hex'),
                createdOn : moment().toDate(),
                session : session
            });
            LoginStatus.LoginStatusModel.create(loginStatus, (err, loginStatus) => {
                if (err) {
                    req.logger.debug('Error While Finding User ' + err.message);
                    return callback(err);
                }
                loginStatus = loginStatus.toJSON();
                loginStatus.user = user;
                callback(null, loginStatus);
            });

        }
    ], (err, loginStatus) => {
        try {
            if (err) {
                req.logger.error(err.stack);
                res.status(err.status ? err.status : 500).send(err);
            }
            req.logger.info('Successfully Logged In');
            res.send(loginStatus);
        } catch (err) {
            req.logger.error(err.stack);
            res.status(500).send({});
        }
    });
});

/**
 * Registers a new user
 * @param  {[type]} req      [description]
 * @param  {[type]} res){} [description]
 * @return {[type]}          [description]
 * TODO Hash The Password, Change Login Accordingly
 * TODO Do hash the password you stupid person
 */
router.post('/register', function(req, res, next) {
    console.log(JSON.stringify(req.body));

    
    if (!req.body.emailId) {
        res.status(400).send('Req body should contains emailId'); return;
    }

    if (!req.body.name) {
        res.status(400).send('Req body should contains name'); return;
    }
    if (!req.body.password) {
        res.status(400).send('Req body should contains password'); return;
    }
    if (!(validator.isEmail(req.body.emailId))) {
        res.status(400).send('Invalid emailId'); return;
    }

    async.waterfall([
        (callback) => {
            try {
                var user = new User.UserModel({
                    email : req.body.emailId,
                    password : req.body.password,
                    name : req.body.name
                });
                User.UserModel.create(user, (err) => {
                    if (err)
                        return callback(err);
                    return callback(null, user);
                });
            } catch (err) {
                req.logger.error(err.message);
                return callback(err);
            }
        },(user, callback) => {
            var sendgrid   = require('sendgrid')(config.sendgridUserName, config.sendgridPassword);
            var email = new sendgrid.Email();

            email.addTo("asj@tandf.com");
            email.setFrom(user.email);
            email.setSubject("Welcome To ASJ");
            email.setHtml("Hello");
            sendgrid.send(email, function(err, json) {
                if (err) { 
                    console.log(err);
                }
                else {
                    return callback(null, user); 
                }
            })
                           
        }
    ],(err, user) => {
        try {
            
            if (err) {
                req.logger.error(err.stack);
                res.status(err.status ? err.status : 500).send(err);
            }               
            req.logger.info('user is registered');
            res.send(user);
        } catch (err) {
            req.logger.error(err.stack);
            res.status(500).send({});
        }
    });
});

module.exports = router;