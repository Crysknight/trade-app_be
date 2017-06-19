var Deal = require('../../models/deal');
var User = require('../../models/user');

var moment = require('moment');

module.exports = function(req, res) {
	var start = moment(req.body.start).format();
	var end = moment(req.body.end).format();
	User.find({ token: req.body.token })
		.then(user => {
			if (user.role === 'admin') {
				return Deal.find({ $and: [ { date: { $gt: start } }, { date: { $lt: end } } ] });
			} else {
				return Deal.find({ $and: [ { date: { $gt: start } }, { date: { $lt: end } }, { user: user._id } ] });
			}
		})
		.then(deals => {
			res.json(deals);
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		});
};