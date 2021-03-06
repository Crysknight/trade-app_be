var mongoose = require('mongoose');
var connection = require('../mongo-connection');
var ObjectId = mongoose.Schema.Types.ObjectId;

//User Schema
var orderSchema = mongoose.Schema({
	orderType: {
		type: String,
		required: true
	},
	quantity: {
		type: Number,
		min: 0,
		max: 100,
		required: true
	},
	user: {
		type: ObjectId,
		ref: 'User',
		required: true
	},
	instrument: {
		type: ObjectId,
		ref: 'Instrument',
		required: true
	},
	session: {
		type: ObjectId,
		ref: 'Session'
	},
	date: {
		type: String
	},
	processing: {
		type: Boolean,
		default: false
	}
});

var Order = module.exports = connection.model('Order', orderSchema);
