var User = require('../../models/user');
var passwordHash = require('password-hash');

module.exports = function(req, res) {
	let user = req.body;
	delete user.token;
	let { login, role, name, organization, phone, comment, status, id } = user; 
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
			_id: id
		},
		update,
		{
			new: true
		}
	)
		.then(user => {
			user = user.toObject();
			user.id = user._id;
			delete user._id;
			res.json(user);
		})
		.catch(err => {
			if (err.code === 11000) {
				res.status(400).send('Duplicate user login');
			} else {
				res.status(500).send('Unidentified error');
			}
		});
};