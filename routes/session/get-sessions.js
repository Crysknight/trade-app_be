var Session = require('../../models/session');

module.exports = function(req, res) {
	// console.log(req.body);
	// res.send('ok');
	var body = req.body,
			skip,
			limit;
	skip = (body.page - 1) * body.sessionsPerPage;
	console.log(skip);
	limit = body.sessionsPerPage;
	Session.find()
		.sort('_id')
		.skip(skip)
		.limit(limit)
		.lean()
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.status(500).send('Unidentified error');
		})
};