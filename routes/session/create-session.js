var Session = require('../../models/session');

module.exports = function(req, res) {
	var session = new Session(req.body);
	session.save()
		.then(session => {
			session = session.toObject();
			session.id = session._id;
			delete session._id;
			res.json(session);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};