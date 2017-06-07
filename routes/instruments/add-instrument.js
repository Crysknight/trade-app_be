var Instrument = require('../../models/instrument');

module.exports = function(req, res) {
	var instrument = new Instrument(req.body);
	instrument.save()
		.then(instrument => {
			instrument = instrument.toObject();
			instrument.id = instrument._id;
			delete instrument._id;
			res.json(instrument);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};