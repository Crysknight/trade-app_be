var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var connection = require('../mongo-connection');

//User Schema
var userSchema = mongoose.Schema({
	login: {
		type: String,
		unique: true,
		required: true
	},
	pass: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true
	},
	name: String,
	organization: String,
	phone: String,
	comment: String,
	token: String,
	status: {
		type: Boolean,
		default: true
	}
});

var User = module.exports = connection.model('User', userSchema);