var Order = require('../../models/order');
var Deal = require('../../models/deal');
var Instrument = require('../../models/instrument');

var moment = require('moment');


module.exports = function(req, res) {
	delete req.body.token;
	req.body.date = moment().format();
	var resObject = {
		deals: []
	};

	// Create order from request
	var reqOrder = new Order(req.body);

	// Query for locking down the processed orders
	var processingQuery = {
		'instrument': reqOrder.instrument,
		'quantity': { $ne: 0 }
	};

	// Query for searching the corresponding orders
	var searchingQuery = {
		orderType: { $ne: reqOrder.orderType },
		'user': { $ne: reqOrder.user },
		'instrument': reqOrder.instrument,
		'quantity': { $ne: 0 },
		processing: true				
	};

	// Save instrument.dealt here to update instrument in one request
	var dealt;

	// Lock down the processed orders by updating their 'processing' property
	Order.updateMany(
		processingQuery, 
		{ $set: { processing: true } }
	)
		.then(result => {
			// Return the 509 mistake if there is a concurrent simultaneous request from another user
			// (when it happens, the updating operation finds corresponding orders (result.n), but doesn't update
			// 'processing' property, which is already set to true)
			if (result.n !== result.nModified) {
				res.status(509).send('Route occupied');
			} else {
			// If no conflicts with concurrent requests - find all orders of different type and from different user
				return Order.find(searchingQuery);
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result.length === 0) {
				// If no corresponding orders - save this order in db
				return reqOrder.save();
			} else if (result.length > 0) {
				// If there are corresponding orders - sort them by date 
				result.sort((a, b) => {
					if (a.date > b.date) return 1;
					if (a.date < b.date) return -1;
				});
				// Prepare bulk for bulkWrite
				var bulk = [];
				// Enter the comparison loop
				for (let i = 0; i < result.length; i++) {
					var resOrder = result[i];
					var seller;
					var buyer;
					// Sort out, who is seller and who - buyer
					if (reqOrder.orderType === 'sell') {
						seller = {
							user: reqOrder.user,
							order: reqOrder.id
						};
						buyer = {
							user: resOrder.user,
							order: resOrder.id
						};
					} else {
						seller = {
							user: resOrder.user,
							order: resOrder.id
						};
						buyer = {
							user: reqOrder.user,
							order: reqOrder.id
						};
					}
					var deal = {
						seller,
						buyer,
						instrument: reqOrder.instrument,
						session: reqOrder.session,
						date: reqOrder.date
					};
					if (reqOrder.quantity <= resOrder.quantity) {
						// If the current order from db is bigger than incoming one - create a deal, update order, 
						// set the incoming order's quantity to zero, save it and exit the loop
						deal.volume = reqOrder.quantity;
						resObject.deals.push(deal);
						bulk.push(
							{
								updateOne: {
									filter: { _id: resOrder._id },
									update: { quantity: (resOrder.quantity - reqOrder.quantity) }
								}
							},
							{
								insertOne: {
									document: reqOrder
								}
							}
						);
						reqOrder.quantity = 0;
						break;
					} else {
						// If the current order from db is lesser than incoming one - create a deal, null out the order,
						// update the incoming order's quantity and go to the next iteration of the loop
						deal.volume = resOrder.quantity;
						resObject.deals.push(deal);
						reqOrder.quantity -= resOrder.quantity;
						bulk.push({
							updateOne: {
								filter: { _id: resOrder._id },
								update: { quantity: 0 }
							} 
						});
					}
				}
				// If after all iterations the incoming order still has quantity left - save it into database with that quantity
				if (reqOrder.quantity !== 0) {
					bulk.push({
						insertOne: {
							document: reqOrder
						}
					});
				}
				return Order.bulkWrite(bulk);
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result._id) {
				result = result.toObject();
				result.id = result._id;
				delete result._id;
				resObject.order = result;
				return Instrument.findOneAndUpdate({ _id: result.instrument }, { $set: { interested: true } });
			} else if (result.insertedCount) {
				reqOrder = reqOrder.toObject();
				reqOrder.id = reqOrder._id;
				delete reqOrder._id;
				resObject.order = reqOrder;
				return Deal.insertMany(resObject.deals);
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result._id) {
				delete processingQuery['quantity'];
				return Order.updateMany(processingQuery, { $set: { processing: false } });
			} else if (result.length) {
				resObject.deals = result;
				for (let i = 0; i < resObject.deals.length; i++) {
					resObject.deals[i] = resObject.deals[i].toObject();
					resObject.deals[i].id = resObject.deals[i]._id;
					delete resObject.deals[i]._id;
				}
				return Instrument.findById(reqOrder.instrument);
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result.n) {
				res.json(resObject);
				return;
			} else if (result._id) {
				dealt = result.dealt;
				return Order.find({ instrument: reqOrder.instrument, quantity: { $ne: 0 } });
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else if (result.length === 0) {
				return Instrument.findOneAndUpdate(
					{ _id: reqOrder.instrument }, 
					{ $set: { dealt: ++dealt, interested: false } }, 
					{ new: true }
				);
			} else if (result.length > 0) {
				return Instrument.findOneAndUpdate({ _id: reqOrder.instrument }, { $set: { dealt: ++dealt } }, { new: true });
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else {
				delete processingQuery['quantity'];
				return Order.updateMany(processingQuery, { $set: { processing: false } });
			}
		})
		.then(result => {
			if (!result) {
				return;
			} else {
				res.json(resObject);
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		});

}