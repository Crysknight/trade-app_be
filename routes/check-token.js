var User = require('../models/user');

var adminPaths = [
	'add-instrument',
	'get-admin-instruments',
	'disable-instrument',
	'register',
	'get-users',
	'update-user',
	'disable-user'
];

module.exports = function(req, res, next) {
	var pathName = req.originalUrl.replace(/\/api\//, '');
	var isAdminPath = false;
	for (let i = 0; i < adminPaths.length; i++) {
		if (adminPaths[i] === pathName) {
			isAdminPath = true;
			break;
		}
	}
	var token = req.body.token;
	User.findOne({ token })
		.then(user => {
			if (user === null) {
				res.status(401).send('Unauthorized');
			} else {
				if (isAdminPath) {
					if (user.role === 'admin') {
						next();
					} else {
						res.status(401).send('Unprivileged');
					}
				} else {
					next();		
				}
			}
		})
		.catch(err => {
			res.status(500).send('Unidentified error');
		})
};