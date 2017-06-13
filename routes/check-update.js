var Session = require('../models/session');
var Deal = require('../models/deal');
var User = require('../models/user');

module.exports = function(req, res) {
	// console.log(req.body.token);
	var resObject = {};
	var reqUser;
	User.findOne({ token: req.body.token })
		.then(user => {
			reqUser = user;
			return Session.findOne({ status: 1 }).populate('instruments');
		})
		.then(session => {
			if (session === null) {
				res.json({
					session: {
						id: 0
					},
					instruments: [],
					deals: []
				});
			} else {
				session = session.toObject();
				session.id = session._id;
				delete session._id;
				for (let i = 0; i < session.instruments.length; i++) {
					session.instruments[i].id = session.instruments[i]._id;
					delete session.instruments[i]._id;
				}
				var startDate = new Date(session.start);
				var currentDate = new Date();
				if (currentDate > startDate) {
					resObject.session = session;
					Deal.find({ session: session.id, $or: [ { 'buyer.user': reqUser._id }, { 'seller.user': reqUser._id } ] })
						.lean()
						.then(deals => {
							for (let i = 0; i < deals.length; i++) {
								deals[i].id = deals[i]._id;
								delete deals[i]._id;	
							}
							resObject.deals = deals;
							res.json(resObject);
						})
						.catch(err => res.status(500).send('Unidentified error in finding deals'));
				} else {
					res.json({
						session: {
							id: 0,
							status: 1
						},
						instruments: [],
						deals: []
					});
				}
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		})
};