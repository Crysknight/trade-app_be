var checkToken = require('./check-token');

// Instruments
var addInstrument = require('./instruments/add-instrument');
var getInstruments = require('./instruments/get-instruments');
var disableInstrument = require('./instruments/disable-instrument');
var updateInstrument = require('./instruments/update-instrument');

// Orders
var addOrder = require('./orders/add-order');
var getOrders = require('./orders/get-orders');
var deleteOrders = require('./orders/delete-orders');

// Session
var checkUpdate = require('./session/check-update');
var createSession = require('./session/create-session');
var updateSession = require('./session/update-session');
var getSessionsCount = require('./session/get-sessions-count');
var getSessions = require('./session/get-sessions');

// Users
var login = require('./users/login');
var register = require('./users/register');
var getUsers = require('./users/get-users');
var updateUser = require('./users/update-user');
var disableUser = require('./users/disable-user');

var routes = {
	checkToken,
	checkUpdate,
	login,
	register,
	addInstrument,
	getInstruments,
	disableInstrument,
	updateInstrument,
	getUsers,
	updateUser,
	disableUser,
	createSession,
	updateSession,
	getSessionsCount,
	getSessions,
	addOrder,
	getOrders,
	deleteOrders
};

module.exports = routes;