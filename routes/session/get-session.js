var Session = require('../../models/session');

module.exports = function(req, res) {
	Session.findOne({ _id: req.body.id })
		.then(result => {
			result = result.toObject();
			result.id = result._id;
			delete result._id;
			res.json(result);
		})
		.catch(err => {
			res.status(500).send('Unidentified error');
		})
};