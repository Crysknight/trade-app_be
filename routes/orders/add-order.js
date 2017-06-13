var Order = require('../../models/order');
var Deal = require('../../models/deal');
var Instrument = require('../../models/instrument');

var moment = require('moment');


module.exports = function(req, res) {
	delete req.body.token;
	var resObject = {},
			reqOrder = new Order(req.body),
			processingQuery = {
				'instrument.str': reqOrder.instrument.str		
			},
			searchingQuery = {
				orderType: { $ne: req.body.orderType },
				'user.toString()': { $ne: req.body.user },
				'instrument.str': reqOrder.instrument.str,
				processing: true				
			};

	Order.updateMany(
		processingQuery, 
		{ $set: { processing: true } }
	)
		.then(result => {
			console.log('result of updating: ', result);
			if (result.n !== result.nModified) {
				res.status(509).send('Route occupied');
				return 'finish chain';
			} else {
				return Order.find(searchingQuery);
			}
		})
		.then(result => {
			if (result === 'finish chain') {
				return 'finish chain';
			} else {
				console.log('result of search: ',  result);
				return Order.updateMany(
					processingQuery,
					{ $set: { processing: false } }
				);
			}
		})
		.then(result => {
			if (result === 'finish chain') {
				return 'finish chain';
			} else {
				console.log('result of second update: ', result);
				res.send('ok');
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		});

}

// function saveOrder(order, res) {
// 	var resObject = {};
// 	order.save()
// 		.then(order => {
// 			order = order.toObject();
// 			order.id = order._id;
// 			delete order._id;
// 			delete order.user;
// 			resObject.order = order;
// 			resObject.deals = [];
// 			return Instrument.findOneAndUpdate({ _id: order.instrument }, { $set: { interested: true } });
// 		})
// 		.then(instrument => {
// 			res.json(resObject);
// 		})
// 		.catch(err => res.status(500).send('Unidentified error: saving new order'));
// }

// function compareOrders(incomingOrder, processingOrder, deals) {
// 	var seller;
// 	var buyer;
// 	if (incomingOrder.orderType === 'sell') {
// 		seller = {
// 			user: incomingOrder.user,
// 			order: incomingOrder.id
// 		};
// 		buyer = {
// 			user: processingOrder.user,
// 			order: processingOrder.id
// 		};
// 	} else {
// 		seller = {
// 			user: processingOrder.user,
// 			order: processingOrder.id
// 		};
// 		buyer = {
// 			user: incomingOrder.user,
// 			order: incomingOrder.id
// 		};
// 	}
// 	if (incomingOrder.quantity <= processingOrder.quantity) {
// 		var deal = {
// 			volume: incomingOrder.quantity,
// 			seller,
// 			buyer,
// 			instrument: incomingOrder.instrument,
// 			session: incomingOrder.session,
// 			date: incomingOrder.date
// 		};
// 		deals.push(deal);
// 		return {
// 			deals,
// 			continueComparing: false,
// 			incomingOrderRemain: 0,
// 			processingOrderRemain: processingOrder.quantity - incomingOrder.quantity
// 		};
// 	} else {
// 		var deal = {
// 			volume: processingOrder.quantity,
// 			seller,
// 			buyer,
// 			instrument: incomingOrder.instrument,
// 			session: incomingOrder.session,
// 			date: incomingOrder.date
// 		};
// 		deals.push(deal);
// 		return {
// 			deals,
// 			continueComparing: true,
// 			incomingOrderRemain: incomingOrder.quantity - processingOrder.quantity,
// 			processingOrderRemain: 0
// 		};
// 	}
// }

// module.exports = function(req, res) {
// 	delete req.body.token;
// 	var resObject = {};
// 	var reqOrder = new Order(req.body);
// 	reqOrder.date = moment().format();

// 	// Find all orders of different type
// 	Order.find()
// 		.where('orderType').ne(reqOrder.orderType)
// 		.where('quantity').ne(0)
// 		.lean()
// 		.then(orders => {

// 			// If no orders of different type, save the incoming order
// 			if (orders.length === 0) {
// 				saveOrder(reqOrder, res);
// 			} else {

// 				// Filter the orders from the orders of the same user
// 				orders = orders.filter(order => {
// 					return ((order.user.toString() !== reqOrder.user.toString()) && (order.instrument.toString() === reqOrder.instrument.toString()));
// 				});

// 				// If no orders from other user, save the incoming order
// 				if (orders.length === 0) {
// 					saveOrder(reqOrder, res);
// 				} else {

// 					// Sort orders by the date of creation
// 					orders.sort((a, b) => {
// 						if (a.date > b.date) return 1;
// 						if (a.date < b.date) return -1;
// 					});

// 					reqOrder.save()
// 						.then(order => {

// 							var deals = [];
// 							var ordersToNullOut = [];
// 							var incomingOrderRemain = order.quantity;
// 							// Loop through orders and compare them with the incoming one
// 							for (let i = 0; i < orders.length; i++) {
// 								var comparing = compareOrders(
// 									{ 
// 										id: order._id, 
// 										quantity: incomingOrderRemain, 
// 										type: order.orderType,
// 										user: order.user,
// 										instrument: order.instrument,
// 										session: order.session, 
// 										date: order.date
// 									},
// 									{ 
// 										id: orders[i]._id, 
// 										quantity: orders[i].quantity,
// 										type: orders[i].orderType,
// 										user: orders[i].user
// 									},
// 									deals
// 								);
// 								if (!comparing.continueComparing) {
// 									var bulk = [];
// 									for (let i = 0; i < ordersToNullOut.length; i++) {
// 										bulk.push({
// 											updateOne: {
// 												filter: { _id: ordersToNullOut[i] },
// 												update: { quantity: 0 }
// 											}
// 										});
// 									}
// 									bulk.push({
// 										updateOne: {
// 											filter: { _id: orders[i]._id },
// 											update: { quantity: comparing.processingOrderRemain }
// 										}
// 									});
// 									bulk.push({
// 										updateOne: {
// 											filter: { _id: order._id },
// 											update: { quantity: 0 }
// 										}
// 									});

// 									Deal.insertMany(comparing.deals)
// 										.then(deals => {
// 											var bulk = [];
// 											for (let i = 0; i < ordersToNullOut.length; i++) {
// 												bulk.push({
// 													updateOne: {
// 														filter: { _id: ordersToNullOut[i] },
// 														update: { quantity: 0 }
// 													}
// 												});
// 											}
// 											bulk.push({
// 												updateOne: {
// 													filter: { _id: orders[i]._id },
// 													update: { quantity: comparing.processingOrderRemain }
// 												}
// 											});
// 											bulk.push({
// 												updateOne: {
// 													filter: { _id: order._id },
// 													update: { quantity: 0 }
// 												}
// 											});
// 											Order.bulkWrite(bulk)
// 												.then(result => {
// 													order = order.toObject();
// 													order.remain = 0;
// 													order.id = order._id;
// 													delete order._id;
// 													resObject.order = order;
// 													for (let i = 0; i < deals.length; i++) {
// 														deals[i] = deals[i].toObject();
// 														deals[i].id = deals[i]._id;
// 														delete deals[i]._id;
// 													}
// 													resObject.deals = deals;
// 													var orderInstrument = order.instrument;
// 													Instrument.findById(order.instrument)
// 														.then(instrument => {
// 															return Instrument.findOneAndUpdate({ _id: instrument._id }, { $set: { dealt: ++instrument.dealt } });
// 														})
// 														.then(instrument => {
// 														return Order.find({ instrument: orderInstrument }).where('quantity').ne(0);
// 														})
// 														.then(orders => {
// 															if (orders.length === 0) {
// 																return Instrument.findOneAndUpdate({ _id: orderInstrument }, { $set: { interested: false } });
// 															} else {
// 																return orders;
// 															}
// 														})
// 														.then(result => {
// 															res.json(resObject);
// 														})
// 														.catch(err => {
// 															res.status(500).send('Unidentified error: finding instrument');
// 														})
// 												})
// 												.catch(err => res.status(500).send('Unidentified error with saving deals'))
// 										})
// 										.catch(err => res.status(500).send('Unidentified error with saving deals'));
// 									incomingOrderRemain = comparing.incomingOrderRemain;
// 									break;
// 								} else {
// 									ordersToNullOut.push(orders[i]._id);
// 									deals = comparing.deals;
// 									incomingOrderRemain = comparing.incomingOrderRemain;
// 									// res.json(order);
// 								}
// 							}
// 							if (incomingOrderRemain !== 0) {
// 								Deal.insertMany(deals)
// 									.then(deals => {
// 										var bulk = [];
// 										for (let i = 0; i < ordersToNullOut.length; i++) {
// 											bulk.push({
// 												updateOne: {
// 													filter: { _id: ordersToNullOut[i] },
// 													update: { quantity: 0 }
// 												}
// 											});
// 										}
// 										bulk.push({
// 											updateOne: {
// 												filter: { _id: order._id },
// 												update: { quantity: incomingOrderRemain }
// 											}
// 										});
// 										Order.bulkWrite(bulk)
// 											.then(result => {
// 												order = order.toObject();
// 												order.remain = incomingOrderRemain;
// 												order.id = order._id;
// 												delete order._id;
// 												resObject.order = order;
// 												for (let i = 0; i < deals.length; i++) {
// 													deals[i] = deals[i].toObject();
// 													deals[i].id = deals[i]._id;
// 													delete deals[i]._id;
// 												}
// 												resObject.deals = deals;
// 												var orderInstrument = order.instrument;
// 												Instrument.findById(order.instrument)
// 													.then(instrument => {
// 														return Instrument.findOneAndUpdate({ _id: instrument._id }, { $set: { dealt: ++instrument.dealt } });
// 													})
// 													.then(instrument => {
// 														return Order.find({ instrument: orderInstrument }).where('quantity').ne(0);
// 													})
// 													.then(orders => {
// 														if (orders.length === 0) {
// 															return Instrument.findOneAndUpdate({ _id: orderInstrument }, { $set: { interested: false } });
// 														} else {
// 															return orders;
// 														}
// 													})
// 													.then(result => {
// 														res.json(resObject);
// 													})
// 													.catch(err => {
// 														res.status(500).send('Unidentified error: finding instrument');
// 													})
// 											})
// 											.catch(err => res.status(500).send('Unidentified error with saving deals'))
// 									})
// 									.catch(err => res.status(500).send('Unidentified error with saving deals'));
// 							}
// 							// res.json(order);
// 						})
// 						.catch(err => res.status(500).send('Unidentified error with saving order'));
// 				}
// 			}
// 		})
// 		.catch(err => {
// 			console.log(err);
// 			res.status(500).send('Unidentified error');
// 		});
// };

