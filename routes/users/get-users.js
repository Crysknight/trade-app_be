var User = require('../../models/user');

module.exports = function(req, res) {
	User.find()
		.where('status', true)
		.lean()
		.then(users => {
			for (let i = 0; i < users.length; i++) {
				users[i].id = users[i]._id;
				delete users[i]._id;
				delete users[i].pass;
			}
			res.json(users);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};