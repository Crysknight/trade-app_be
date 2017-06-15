var Session = require('../../models/session');

module.exports = function(req, res) {
	// console.log(req.body);
	// res.send('ok');
	Session.findOneAndUpdate({ _id: req.body.id }, { $set: { end: req.body.date } })
		.then(result => {
			res.send('ok');
		})
		.catch(err => {
			res.status(500).send('Unidentified error');
		})
}