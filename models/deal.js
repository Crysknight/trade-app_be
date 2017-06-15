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
		user: {
			type: ObjectId,
			ref: 'User'
		},
		order: {
			type: ObjectId,
			ref: 'Order'
		}
	},
	buyer: {
		user: {
			type: ObjectId,
			ref: 'User'
		},
		order: {
			type: ObjectId,
			ref: 'Order'
		}
	},
	instrument: {},
	session: {
		type: ObjectId,
		ref: 'Session'
	},
	date: String
});

var Deal = module.exports = connection.model('Deal', dealSchema);
