var Order = require('../../models/order');

module.exports = function(req, res) {
	Order.find()
		.where('status', true)
		.lean()
		.then(orders => {
			console.log(orders);
			for (let i = 0; i < orders.length; i++) {
				orders[i].id = orders[i]._id;
				delete orders[i]._id;
			}
			res.json(orders);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};