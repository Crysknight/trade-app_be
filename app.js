var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var mongoose = require('mongoose');

var routes = require('./routes');

// We need User model here just to check the token. Other models are used in routes folder
var User = require('./models/user');

// Serving build folder with React in it
app.use(express.static(path.join(__dirname, 'build')));


// Serving the images
app.use('/images', express.static(path.join(__dirname, 'images')));


// User login. Gets a token on login for further uses
app.post('/api/login', (req, res) => routes.login(req, res));


// All routes after this will need a token to work. Thus, they're all POST
app.use('/api/*', (req, res, next) => routes.checkToken(req, res, next));



/* =================================================================================================== */
/* < USER BLOCK > */
/* =================================================================================================== */


app.post('/api/check-update', (req, res) => routes.checkUpdate(req, res));


/* =================================================================================================== */
/* =================================================================================================== */



/* =================================================================================================== */
/* < ADMIN BLOCK > */
/* =================================================================================================== */


// Instruments

app.post('/api/add-instrument', (req, res) => routes.addInstrument(req, res));

app.post('/api/get-instruments', (req, res) => routes.getInstruments(req, res));

app.post('/api/disable-instrument', (req, res) => routes.disableInstrument(req, res));


// Users

app.post('/api/register', (req, res) => routes.register(req, res));

app.post('/api/get-users', (req, res) => routes.getUsers(req, res));

app.post('/api/update-user', (req, res) => routes.updateUser(req, res));

app.post('/api/disable-user', (req, res) => routes.disableUser(req, res));


// Session

app.post('/api/create-session', (req, res) => routes.createSession(req, res));


/* =================================================================================================== */
/* =================================================================================================== */



// If the path didn't match to any of API ones, try to delegate the request to React app. 404 page is in React's competence
app.get('/*', function(req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.listen(80);
console.log('Running on port 80...');