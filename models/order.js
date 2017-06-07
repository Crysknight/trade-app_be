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
		required: true
	},
	instrument: {
		type: ObjectId,
		required: true
	}
});

var Order = module.exports = connection.model('Order', orderSchema);
