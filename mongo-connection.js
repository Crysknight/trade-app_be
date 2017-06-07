var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment-with-decrement');

//Connect to Mongodb + set promise + add an auto incrementing plugin for better ids
mongoose.Promise = global.Promise;
// var opts = { user: 'crysknife', pass: 'Adipisc3..Eli7' };
var connection = mongoose.createConnection('localhost', 'trade-app', 27017, function() {
        console.log('connected to db');
});

autoIncrement.initialize(connection);

module.exports = connection;