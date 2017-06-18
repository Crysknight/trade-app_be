var Session = require('../../models/session');

module.exports = function(req, res) {
	Session.find({ status: 0 })
		.sort({ _id: -1 })
		.limit(1)
		.then(result => {
			result = result[0];
			result = result.toObject();
			result.id = result._id;
			delete result._id;
			res.json(result);
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		})
};