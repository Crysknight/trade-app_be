var Session = require('../../models/session');

module.exports = function(req, res) {
	var body = req.body,
			skip,
			limit;
	skip = (body.page - 1) * body.sessionsPerPage;
	console.log(skip);
	limit = body.sessionsPerPage;
	Session.find()
		.where('status', 0)
		.sort('_id')
		.skip(skip)
		.limit(limit)
		.lean()
		.then(result => {
			for (let i = 0; i < result.length; i++) {
				result[i].id = result[i]._id;
				delete result[i]._id;
			}
			res.json(result);
		})
		.catch(err => {
			res.status(500).send('Unidentified error');
		})
};