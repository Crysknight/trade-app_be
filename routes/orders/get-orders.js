var Order = require('../../models/order');
var User = require('../../models/user');

module.exports = function(req, res) {
	User.findOne({ token: req.body.token })
		.then(user => {
			if (user.role === 'user') {
				return Order.find({ user: user._id }).where('quantity').ne(0).lean();	
			} else if (user.role === 'admin') {
				return Order.find().where('quantity').ne(0).lean();
			}
		})
		.then(orders => {
			for (let i = 0; i < orders.length; i++) {
				orders[i].id = orders[i]._id;
				delete orders[i]._id;
			}
			res.json(orders);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};