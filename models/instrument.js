var mongoose = require('mongoose');
var connection = require('../mongo-connection');

//User Schema
var instrumentSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	isin: {
		type: String
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	interested: {
		type: Boolean,
		default: false
	},
	dealt: {
		type: Number,
		default: 0
	},
	status: {
		type: Boolean,
		default: true
	}
});

var Instrument = module.exports = connection.model('Instrument', instrumentSchema);
