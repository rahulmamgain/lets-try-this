/**
 * [mongoose description]
 * @type {[type]}
 */
var mongoose = require('mongoose');
var User = require('./user_model.js');


var SessionSchema = new mongoose.Schema({
    ip : 'String',
    userAgent : 'String'
});

var LoginStatusSchema = new mongoose.Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: User.UserSchema},
    token : 'String',
    createdOn : {type : Date, expires : 60*60*24},
    session : {type : SessionSchema}
});


module.exports.LoginStatusModel = mongoose.model('LoginStatus', LoginStatusSchema);
module.exports.LoginStatusSchema = LoginStatusSchema;
module.exports.SessionModel = mongoose.model('SessionSchema', SessionSchema);
module.exports.SessionSchema = SessionSchema;