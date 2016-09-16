/**
 * [mongoose description]
 * @type {[type]}
 */
var mongoose = require('mongoose');
var User = require('./user_model.js');


var DataSchema = new mongoose.Schema({
    metadata : 'Mixed',
    user : {type: mongoose.Schema.Types.ObjectId, ref: User.UserSchema}
});

module.exports.DataModel = mongoose.model('Data', DataSchema);