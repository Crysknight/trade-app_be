var Session = require('../../models/session');

module.exports = function(req, res) {
	Session.count({ status: 0 })
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.status(500).send('Unidentified error');
		});
};