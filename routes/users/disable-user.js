var User = require('../../models/user');
var crypto = require('crypto');

module.exports = function(req, res) {
	var id = req.body.id;
	User.findOne({ _id: id	})
		.then(user => {
			var randomChunk = crypto.randomBytes(256).toString('hex').slice(0, 15);
			var newLogin = user.login + '(deleted' + randomChunk + ')';
			return User.findOneAndUpdate({ _id: id }, { status: false, login: newLogin }, { new: true })
		})
		.then(user => {
			user = user.toObject();
			user.id = user._id;
			delete user._id;
			res.json(user);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};