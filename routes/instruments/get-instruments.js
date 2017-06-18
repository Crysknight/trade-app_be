var Instrument = require('../../models/instrument');

module.exports = function(req, res) {
	Instrument.find()
		.where('status', true)
		.lean()
		.then(instruments => {
			for (let i = 0; i < instruments.length; i++) {
				instruments[i].id = instruments[i]._id;
				delete instruments[i]._id;
			}
			instruments = instruments.sort((a, b) => {
				if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
				if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
				if (a.name.toLowerCase() === b.name.toLowerCase()) {
					if (a.name > b.name) return 1;
					if (a.name < b.name) return -1;
				}
			});
			res.json(instruments);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};