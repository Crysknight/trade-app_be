var Order = require('../../models/order');
var Instrument = require('../../models/instrument');

module.exports = function(req, res) {
	var orders = req.body.orders;
	var foundOrders = [];
	var ordersInstruments = [];
	Order.find({ _id: { $in: orders } })
		.then(orders => {
			foundOrders = orders;
			return Order.deleteMany({ _id: { $in: orders } });
		})
		.then(result => {
			var instruments = [];
			for (let i = 0; i < foundOrders.length; i++) {
				if (instruments.indexOf(foundOrders[i].instrument) === -1) {
					instruments.push(foundOrders[i].instrument);
				}
			}
			ordersInstruments = instruments;
			return Order.find({ instrument: { $in: instruments } }).where('quantity').ne(0);
		})
		.then(orders => {
			var instruments = [];
			for (let i = 0; i < orders.length; i++) {
				if (instruments.indexOf(orders[i].instrument) === -1) {
					instruments.push(orders[i].instrument);
				}				
			}
			ordersInstruments = ordersInstruments.filter(instrument => {
				return !instruments.some(presentInstrument => presentInstrument.toString() === instrument.toString());
			});
			return Instrument.updateMany({ _id: { $in: ordersInstruments } }, { $set: { interested: false } })
		})
		.then(instruments => {
			res.json(instruments);
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error with deleting orders');
		});
};