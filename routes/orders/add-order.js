var Order = require('../../models/order');
var Deal = require('../../models/deal');

var moment = require('moment');


function saveOrder(order, res) {
	order.save()
		.then(order => {
			var resObject = {};
			order = order.toObject();
			order.id = order._id;
			delete order._id;
			delete order.instrument;
			delete order.user;
			resObject.order = order;
			resObject.deals = [];
			res.json(resObject);
		})
		.catch(err => res.status(500).send('Unidentified error'));
}

function compareOrders(incomingOrder, processingOrder, deals) {
	var seller;
	var buyer;
	if (incomingOrder.orderType === 'sell') {
		seller = {
			user: incomingOrder.user,
			order: incomingOrder.id
		};
		buyer = {
			user: processingOrder.user,
			order: processingOrder.id
		};
	} else {
		seller = {
			user: processingOrder.user,
			order: processingOrder.id
		};
		buyer = {
			user: incomingOrder.user,
			order: incomingOrder.id
		};
	}
	if (incomingOrder.quantity <= processingOrder.quantity) {
		var deal = {
			volume: incomingOrder.quantity,
			seller,
			buyer,
			instrument: incomingOrder.instrument,
			session: incomingOrder.session,
			date: incomingOrder.date
		};
		deals.push(deal);
		return {
			deals,
			continueComparing: false,
			incomingOrderRemain: 0,
			processingOrderRemain: processingOrder.quantity - incomingOrder.quantity
		};
	} else {
		var deal = {
			volume: processingOrder.quantity,
			seller,
			buyer,
			instrument: incomingOrder.instrument,
			session: incomingOrder.session,
			date: incomingOrder.date
		};
		deals.push(deal);
		return {
			deals,
			continueComparing: true,
			incomingOrderRemain: incomingOrder.quantity - processingOrder.quantity,
			processingOrderRemain: 0
		};
	}
}

module.exports = function(req, res) {
	delete req.body.token;
	var resObject = {};
	var reqOrder = new Order(req.body);
	reqOrder.date = moment().format();

	// Find all orders of different type
	Order.find()
		.where('orderType').ne(reqOrder.orderType)
		.where('quantity').ne(0)
		.lean()
		.then(orders => {

			// If no orders of different type, save the incoming order
			if (orders.length === 0) {
				saveOrder(reqOrder, res);
			} else {

				// Filter the orders from the orders of the same user
				orders = orders.filter(order => {
					return ((order.user.toString() !== reqOrder.user.toString()) && (order.instrument.toString() === reqOrder.instrument.toString()));
				});

				// If no orders from other user, save the incoming order
				if (orders.length === 0) {
					saveOrder(reqOrder, res);
				} else {

					// Sort orders by the date of creation
					orders.sort((a, b) => {
						if (a.date > b.date) return 1;
						if (a.date < b.date) return -1;
					});

					reqOrder.save()
						.then(order => {

							var deals = [];
							var ordersToNullOut = [];
							var incomingOrderRemain = order.quantity;
							// Loop through orders and compare them with the incoming one
							for (let i = 0; i < orders.length; i++) {
								var comparing = compareOrders(
									{ 
										id: order._id, 
										quantity: incomingOrderRemain, 
										type: order.orderType,
										user: order.user,
										instrument: order.instrument,
										session: order.session, 
										date: order.date
									},
									{ 
										id: orders[i]._id, 
										quantity: orders[i].quantity,
										type: orders[i].orderType,
										user: orders[i].user
									},
									deals
								);
								if (!comparing.continueComparing) {
									var bulk = [];
									for (let i = 0; i < ordersToNullOut.length; i++) {
										bulk.push({
											updateOne: {
												filter: { _id: ordersToNullOut[i] },
												update: { quantity: 0 }
											}
										});
									}
									bulk.push({
										updateOne: {
											filter: { _id: orders[i]._id },
											update: { quantity: comparing.processingOrderRemain }
										}
									});
									bulk.push({
										updateOne: {
											filter: { _id: order._id },
											update: { quantity: 0 }
										}
									});

									Deal.insertMany(comparing.deals)
										.then(deals => {
											var bulk = [];
											for (let i = 0; i < ordersToNullOut.length; i++) {
												bulk.push({
													updateOne: {
														filter: { _id: ordersToNullOut[i] },
														update: { quantity: 0 }
													}
												});
											}
											bulk.push({
												updateOne: {
													filter: { _id: orders[i]._id },
													update: { quantity: comparing.processingOrderRemain }
												}
											});
											bulk.push({
												updateOne: {
													filter: { _id: order._id },
													update: { quantity: 0 }
												}
											});
											Order.bulkWrite(bulk)
												.then(result => {
													order = order.toObject();
													order.remain = 0;
													order.id = order._id;
													delete order._id;
													resObject.order = order;
													for (let i = 0; i < deals.length; i++) {
														deals[i] = deals[i].toObject();
														deals[i].id = deals[i]._id;
														delete deals[i]._id;
													}
													resObject.deals = deals;
													res.json(resObject);
												})
												.catch(err => res.status(500).send('Unidentified error with saving deals'))
										})
										.catch(err => res.status(500).send('Unidentified error with saving deals'));
									incomingOrderRemain = comparing.incomingOrderRemain;
									break;
								} else {
									ordersToNullOut.push(orders[i]._id);
									deals = comparing.deals;
									incomingOrderRemain = comparing.incomingOrderRemain;
									// res.json(order);
								}
							}
							if (incomingOrderRemain !== 0) {
								Deal.insertMany(deals)
									.then(deals => {
										var bulk = [];
										for (let i = 0; i < ordersToNullOut.length; i++) {
											bulk.push({
												updateOne: {
													filter: { _id: ordersToNullOut[i] },
													update: { quantity: 0 }
												}
											});
										}
										bulk.push({
											updateOne: {
												filter: { _id: order._id },
												update: { quantity: incomingOrderRemain }
											}
										});
										Order.bulkWrite(bulk)
											.then(result => {
												order = order.toObject();
												order.remain = incomingOrderRemain;
												order.id = order._id;
												delete order._id;
												resObject.order = order;
												for (let i = 0; i < deals.length; i++) {
													deals[i] = deals[i].toObject();
													deals[i].id = deals[i]._id;
													delete deals[i]._id;
												}
												resObject.deals = deals;
												res.json(resObject);
											})
											.catch(err => res.status(500).send('Unidentified error with saving deals'))
									})
									.catch(err => res.status(500).send('Unidentified error with saving deals'));
							}
							// res.json(order);
						})
						.catch(err => res.status(500).send('Unidentified error with saving order'));
				}
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).send('Unidentified error');
		});
};