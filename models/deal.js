var mongoose = require('mongoose');
var connection = require('../mongo-connection');
var ObjectId = mongoose.Schema.Types.ObjectId;

//User Schema
var dealSchema = mongoose.Schema({
	volume: {
		type: Number,
		required: true
	},
	seller: {
		user: ObjectId,
		order: ObjectId
	},
	buyer: {
		user: ObjectId,
		order: ObjectId
	},
	instrument: ObjectId,
	session: ObjectId,
	date: Date
});

var Deal = module.exports = connection.model('Deal', dealSchema);
