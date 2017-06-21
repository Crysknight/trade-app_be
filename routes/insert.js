var Instrument = require('../models/instrument');

module.exports = function(req, res) {
	var array = req.body.instruments;
	Instrument.insertMany(array)
		.then(result => {
			res.send('ok');
		})
		.catch(err => {
			res.status(500).send('hello');
		});
};
