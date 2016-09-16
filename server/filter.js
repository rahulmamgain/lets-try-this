/**
 * Filters For All the Shit There Can Be
 */

var User = require('./models/user_model');
var LoginStatus = require('./models/login_status_model');
var Activity = require('./models/activity_model');

/**
 * Verifies Whether The Request has A Valid Timestamp or not
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
module.exports.verifyTimestamp = function(req, res, next) {
    next();
};

/**
 * Verify whether each request has a nonce or not
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
module.exports.verifyNonce = function(req, res, next) {
    next();
};

module.exports.verifyUser = function(req, res, next) {
    try {
        req.logger.debug('Inside Verify User Filter');
        LoginStatus.LoginStatusModel.findOne({token : req.headers.token})
        .populate({
            path : 'user',
            model : User.UserModel
        }).exec((err, loginStatus) => {
            req.logger.debug('Login Status Query Executed');
            if (err) {
                req.logger.error('Error While Finding loginStatus ' + err.message);
                res.status(err.status ? err.status : 500).send(err);
                return;
            }

            if (!loginStatus) {
                req.logger.error('No loginStatus found');
                res.status(401).send({text : 'NOT_ALLOWED' , invalid_token : true});
                return;
            }
            req.loginStatus = loginStatus;
            req.logger.debug('User Is Authenticated');
            next();
        });
    } catch (err) {
        res.status(err.status ? err.status : 500).send({});
    }
};

/**
 * Logs Request
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
module.exports.logRequest = function(req, res, next) {
    var activity = new Activity.ActivityModel({
        metadata : {
            body : req.body,
            params : req.params,
            query : req.query,
            path : req.path
        },
        user : req.loginStatus ? req.loginStatus.user.id : null
    });
    activity.save((err, doc) => {
        if(err) {
            console.log('The Error Is' + err.message);
        }
    });
    next();
};