var checkToken = require('./check-token');
var checkUpdate = require('./check-update');

// Users
var login = require('./users/login');
var register = require('./users/register');
var getUsers = require('./users/get-users');
var updateUser = require('./users/update-user');
var disableUser = require('./users/disable-user');

// Instruments
var addInstrument = require('./instruments/add-instrument');
var getInstruments = require('./instruments/get-instruments');
var disableInstrument = require('./instruments/disable-instrument');

// Session
var createSession = require('./session/create-session');

var routes = {
	checkToken,
	checkUpdate,
	login,
	register,
	addInstrument,
	getInstruments,
	disableInstrument,
	getUsers,
	updateUser,
	disableUser,
	createSession
};

module.exports = routes;