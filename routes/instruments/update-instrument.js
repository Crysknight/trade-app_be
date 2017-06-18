var Instrument = require('../../models/instrument');
var Order = require('../../models/order');

module.exports = function(req, res) {
	// console.log(req.body);
	// res.send('ok');
	var update;
	switch (req.body.updateType) {
		case 'updating interest': {
			update = { $set: { interested: req.body.updateValue } };
			break;
		}
		case 'updating volatility': {
			update = { $set: { dealt: 1 } };
			break;
		}
		case 'updating price': {
			update = { $set: { price: req.body.updateValue, interested: false } };
			break;
		}
		default: {
			res.status(500).send('Unidentified error');
		}
	}
	Instrument.findOneAndUpdate({ _id: req.body.instrument }, update, { new: true })
		.then(instrument => {
			if (req.body.updateType === 'updating price') {
				return Order.updateMany({ instrument: instrument._id }, { $set: { quantity: 0 } });
			} else {
				res.send('ok');
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result.ok) {
				res.send('ok');
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		})
};