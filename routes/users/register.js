var User = require('../../models/user');
var passwordHash = require('password-hash');

module.exports = function(req, res) {
	delete req.body.token;
	var user = new User(req.body);
	user.pass = passwordHash.generate(user.pass);
	user.save()
		.then(user => {
			user = user.toObject();
			user.id = user._id;
			delete user._id;
			res.json(user);
		})
		.catch(err => {
			console.log(err);
			if (err.code === 11000) {
				res.status(500).send('Unique login required');
			} else {
				res.status(500).send('Unidentified error from register');
			}
		});
};