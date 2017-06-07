var Instrument = require('../../models/instrument');

module.exports = function(req, res) {
	var id = req.body.id;
	Instrument.findOneAndUpdate(
		{
			_id: id
		},
		{
			status: false
		},
		{
			new: true
		}
	)
		.lean()
		.then(instrument => {
			instrument.id = instrument._id;
			delete instrument._id;
			res.json(instrument);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};