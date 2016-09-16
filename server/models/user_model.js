/**
 * [mongoose description]
 * @type {[type]}
 */
var mongoose = require('mongoose');


/**
 * Schema Definition For Organization
 */

var UserSchema = new mongoose.Schema({
    name : { type : 'String' },
    email : { type : 'String', required: true, unique : true},
    password : { type : 'String' }
}, {
    timestamps : true
});

UserSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports.UserModel = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;
