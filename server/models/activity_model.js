/**
 * [mongoose description]
 * @type {[type]}
 */
var mongoose = require('mongoose');
var User = require('./user_model.js');


var ActivitySchema = new mongoose.Schema({
    metadata : 'Mixed',
    user : {type: mongoose.Schema.Types.ObjectId, ref: User.UserSchema}
}, {
	timestamps : true
});

module.exports.ActivityModel = mongoose.model('Activity', ActivitySchema);