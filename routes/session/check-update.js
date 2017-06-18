var Session = require('../../models/session');
var Deal = require('../../models/deal');
var User = require('../../models/user');
var Instrument = require('../../models/instrument');
var Order = require('../../models/order');

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
				var id = session._id;
				if (currentDate > endDate) {
					session = session.toObject();
					session.instruments = session.instruments.sort((a, b) => {
						if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
						if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
						if (a.name.toLowerCase() === b.name.toLowerCase()) {
							if (a.name > b.name) return 1;
							if (a.name < b.name) return -1;
						}
					});
					for (let i = 0; i < session.instruments.length; i++) {
						session.instruments[i].id = session.instruments[i]._id.toString();
						delete session.instruments[i]._id;
					}
					return Session.findOneAndUpdate(
						{ _id: id }, 
						{ $set: { status: 0, instrumentsSnapshot: session.instruments } }, 
						{ new: true }
					);
				} else {
					resObject.session = session.toObject();
					resObject.session.id = resObject.session._id;
					delete resObject.session._id;
					resObject.session.instruments = resObject.session.instruments.sort((a, b) => {
						if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
						if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
						if (a.name.toLowerCase() === b.name.toLowerCase()) {
							if (a.name > b.name) return 1;
							if (a.name < b.name) return -1;
						}
					});
					for (let i = 0; i < resObject.session.instruments.length; i++) {
						resObject.session.instruments[i].id = resObject.session.instruments[i]._id;
						delete resObject.session.instruments[i]._id;
					}
					return Deal.find({ 
						session: session._id, 
						$or: [ 
							{ 'buyer.user': reqUser._id }, 
							{ 'seller.user': reqUser._id } 
						] 
					}).lean();
				}
			}
		})
		.then(result => {
				if (!result) {
					return;
				} else if (result._id && result.status === 0) {
					return Instrument.updateMany({}, { $set: { interested: false, dealt: 0 } });
				} else if (result._id && result.status !== 0) {		
					session = result.toObject();
					session.id = session._id;
					delete session._id;
					session.instruments = session.instruments.sort((a, b) => {
						if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
						if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
						if (a.name.toLowerCase() === b.name.toLowerCase()) {
							if (a.name > b.name) return 1;
							if (a.name < b.name) return -1;
						}
					});
					for (let i = 0; i < session.instruments.length; i++) {
						session.instruments[i].id = session.instruments[i]._id;
						delete session.instruments[i]._id;
					}
					resObject.session = session;
					return Deal.find({ 
						session: session._id, 
						$or: [ 
							{ 'buyer.user': reqUser._id }, 
							{ 'seller.user': reqUser._id } 
						] 
					}).lean();
				} else if (result.length === 0) {
					resObject.deals = [];
					res.json(resObject);
				} else if (result.length > 0) {
					resObject.deals = result;
					for (let i = 0; i < resObject.deals.length; i++) {
						let deal = resObject.deals[i];
						deal.id = deal._id;
						delete deal._id;
					}
					res.json(resObject);
				}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result.length === 0) {
				resObject.deals = [];
				res.json(resObject);
			} else if (result.length > 0) {
				resObject.deals = result;
				for (let i = 0; i < resObject.deals.length; i++) {
					let deal = resObject.deals[i];
					deal.id = deal._id;
					delete deal._id;
				}
				res.json(resObject);
			} else if (result.ok) {
				return Order.deleteMany({});
			}	else {
				res.status(500).send('Unidentified error');				
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result.result.ok) {
				resObject.session = { id: 0 };
				resObject.deals = [];
				res.json(resObject);
			} else {
				res.status(500).send('Unidentified error');
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		})
};