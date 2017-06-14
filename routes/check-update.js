var Session = require('../models/session');
var Deal = require('../models/deal');
var User = require('../models/user');

var moment = require('moment');

module.exports = function(req, res) {
	var resObject = {};
	var reqUser;
	User.findOne({ token: req.body.token })
		.then(user => {
			reqUser = user;
			return Session.findOne({ $or: [ { status: 1 }, { status: 2 } ] }).populate('instruments');
		})
		.then(session => {
			if (session === null) {
				resObject.session = { id: 0 };
				resObject.deals = [];
				res.json(resObject);
			} else if (session.status === 1) {
				var startDate = moment(session.start).format();
				var currentDate = moment().format();
				if (currentDate > startDate) {
					return Session.findOneAndUpdate(
						{ _id: session._id }, 
						{ $set: { status: 2 } }, 
						{ new: true }
					).populate('instruments');
				} else {
					session = session.toObject();
					session.id = session._id;
					delete session._id;
					session.instruments = [];
					resObject.session = session;
					resObject.deals = [];
					res.json(resObject);	
				}
			} else if (session.status === 2) {
				var endDate = moment(session.end).format();
				var currentDate = moment().format();
				if (currentDate > endDate) {
					return Session.findOneAndUpdate(
						{ _id: session._id }, 
						{ $set: { status: 0, instrumentsSnapshot: session.instruments } }, 
						{ new: true }
					);
				} else {
					resObject.session = session.toObject();
					resObject.session.id = resObject.session._id;
					delete resObject.session._id;
					for (let i = 0; i < resObject.session.instruments.length; i++) {
						resObject.session.instruments[i].id = resObject.session.instruments[i]._id;
						delete resObject.session.instruments[i]._id;
					}
					return Deal.find({ session: session._id, $or: [ { 'buyer.user': reqUser._id }, { 'seller.user': reqUser._id } ] });	
				}
			}
		})
		.then(result => {
				if (!result) {
					return;
				} else if (result._id && result.status === 0) {
					console.log(result);
					resObject.session = { id: 0 };
					resObject.deals = [];
					res.json(resObject);
				} else if (result._id && result.status !== 0) {		
					session = result.toObject();
					session.id = session._id;
					delete session._id;
					for (let i = 0; i < session.instruments.length; i++) {
						session.instruments[i].id = session.instruments[i]._id;
						delete session.instruments[i]._id;
					}
					resObject.session = session;
					return Deal.find({ session: result._id, $or: [ { 'buyer.user': reqUser._id }, { 'seller.user': reqUser._id } ] });	
				} else if (result.length === 0) {
					resObject.deals = [];
					res.json(resObject);
				} else if (result.length > 1) {
					resObject.deals = result;
					res.json(resObject);
				}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result.length === 0) {
				resObject.deals = [];
				res.json(resObject);
			} else if (result.length > 1) {
				resObject.deals = result;
				res.json(resObject);
			} else {
				res.status(500).send('Unidentified error');				
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		})
}

// module.exports = function(req, res) {
// 	// console.log(req.body.token);
// 	var resObject = {};
// 	var reqUser;
// 	User.findOne({ token: req.body.token })
// 		.then(user => {
// 			reqUser = user;
// 			return Session.findOne({ $or: [ { status: 1 }, { status: 2 } ] }).populate('instruments');
// 		})
// 		.then(session => {
// 			if (session === null) {
// 				res.json({
// 					session: {
// 						id: 0
// 					},
// 					instruments: [],
// 					deals: []
// 				});
// 			} else {
// 				session = session.toObject();
// 				session.id = session._id;
// 				delete session._id;
// 				for (let i = 0; i < session.instruments.length; i++) {
// 					session.instruments[i].id = session.instruments[i]._id;
// 					delete session.instruments[i]._id;
// 				}
// 				var startDate = moment(session.start).format();
// 				var currentDate = moment().format();
// 				if (currentDate > startDate) {
// 					resObject.session = session;
// 					Deal.find({ session: session.id, $or: [ { 'buyer.user': reqUser._id }, { 'seller.user': reqUser._id } ] })
// 						.lean()
// 						.then(deals => {
// 							for (let i = 0; i < deals.length; i++) {
// 								deals[i].id = deals[i]._id;
// 								delete deals[i]._id;
// 							}
// 							resObject.deals = deals;
// 							res.json(resObject);
// 						})
// 						.catch(err => res.status(500).send('Unidentified error in finding deals'));
// 				} else {
// 					session.instruments = [];
// 					resObject.session = session;
// 					resObject.deals = [];
// 					resObject.instruments = [];	
// 					res.json(resObject);
// 				}
// 			}
// 		})
// 		.catch(err => {
// 			console.log(err);
// 			res.status(500).send('Unidentified error');
// 		})
// };