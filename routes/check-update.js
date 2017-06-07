var Session = require('../models/session');

module.exports = function(req, res) {
	var resObject = {};
	Session.findOne({ status: 1 })
		.populate('instruments')
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
				var startDate = new Date(session.start);
				var currentDate = new Date();
				if (currentDate > startDate) {
					resObject.session = session;
					res.json(resObject);
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