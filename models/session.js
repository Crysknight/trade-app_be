var mongoose = require('mongoose');
var connection = require('../mongo-connection');
var ObjectId = mongoose.Schema.Types.ObjectId;

//User Schema
var sessionSchema = mongoose.Schema({
	start: {
		type: String,
		required: true
	},
	end: {
		type: String,
		required: true
	},
	status: {
		type: Number,
		min: 0,
		max: 2,
		default: 1
	},
	instruments: [{
		type: ObjectId,
		ref: 'Instrument'
	}],
	instrumentsSnapshot: []
});

var Session = module.exports = connection.model('Session', sessionSchema);
