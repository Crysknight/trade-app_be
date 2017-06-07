var User = require('../../models/user');
var passwordHash = require('password-hash');

module.exports = function(req, res) {
	let user = req.body;
	delete user.token;
	let { login, role, name, organization, phone, comment, status } = user; 
	if (user.pass) {
		update = user;
		delete update.id;
		update.pass = passwordHash.generate(update.pass);
	} else {
		update = { $set: 
			{
				login,
				role,
				name,
				organization,
				phone,
				comment,
				status
			} 
		};
	}
	User.findOneAndUpdate(
		{
			_id: user.id
		},
		update,
		{
			new: true
		}
	)
		.lean()
		.then(instrument => {
			user.id = user._id;
			delete user._id;
			res.json(user);
		})
		.catch(err => res.status(500).send('Unidentified error'));
};