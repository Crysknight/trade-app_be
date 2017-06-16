var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var mongoose = require('mongoose');

var routes = require('./routes');

// Serving build folder with React in it
app.use(express.static(path.join(__dirname, 'build')));


// Serving the images
app.use('/images', express.static(path.join(__dirname, 'images')));


// User login. User gets a token on login for further uses
app.post('/api/login', (req, res) => routes.login(req, res));



/* =================================================================================================== */
/* < TOKEN VALIDATION > */
/* =================================================================================================== */

// All routes after this will need a token to work. Thus, they're all POST
app.use('/api/*', (req, res, next) => routes.checkToken(req, res, next));

/* =================================================================================================== */



/* =================================================================================================== */
/* < USER BLOCK > */
/* =================================================================================================== */

// Session

app.post('/api/check-update', (req, res) => routes.checkUpdate(req, res));


// Orders

app.post('/api/add-order', (req, res) => routes.addOrder(req, res));

app.post('/api/get-orders', (req, res) => routes.getOrders(req, res));

app.post('/api/delete-orders', (req, res) => routes.deleteOrders(req, res));

/* =================================================================================================== */



/* =================================================================================================== */
/* < ADMIN BLOCK > */
/* =================================================================================================== */

// Instruments

app.post('/api/add-instrument', (req, res) => routes.addInstrument(req, res));

app.post('/api/get-instruments', (req, res) => routes.getInstruments(req, res));

app.post('/api/disable-instrument', (req, res) => routes.disableInstrument(req, res));

app.post('/api/update-instrument', (req, res) => routes.updateInstrument(req, res));


// Users

app.post('/api/register', (req, res) => routes.register(req, res));

app.post('/api/get-users', (req, res) => routes.getUsers(req, res));

app.post('/api/update-user', (req, res) => routes.updateUser(req, res));

app.post('/api/disable-user', (req, res) => routes.disableUser(req, res));


// Session

app.post('/api/create-session', (req, res) => routes.createSession(req, res));

app.post('/api/update-session', (req, res) => routes.updateSession(req, res));

app.post('/api/get-sessions-count', (req, res) => routes.getSessionsCount(req, res));

app.post('/api/get-sessions', (req, res) => routes.getSessions(req, res));

/* =================================================================================================== */


// If the path didn't match to any of API ones, try to delegate the request to React app. 404 page is in React's competence
app.get('/*', function(req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.listen(80);
console.log('Running on port 80...');