var express = require('express');
var app = express();
var serv = require('http').Server(app);

var mongojs = require("mongojs");
var db = mongojs('localhost:27017/myGame', ['articles']);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/mainpage.html');
});

app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log('server started');
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
	socket.on('connected', function() {
		console.log('person connected');
	});
	socket.on('gethousedata', function() {
		const billGetter = require('./billgetter');
		billGetter.getPastBills(socket, 'house');
	});
	socket.on('getsenatedata', function() {
		const billGetter = require('./billgetter');
		billGetter.getPastBills(socket, 'senate');
	});
	socket.on('getappealscourtdata', function() {
		const caseGetter = require('./casegetter');
		caseGetter.getPastCases(socket, 'appeals');
	});
	socket.on('gethouselobbydata', function() {
		const lobbyGetter = require('./houselobbygetter');
		lobbyGetter.getHouseLobby(socket);
	});
	socket.on('getsenatelobbydata', function() {
		const lobbyGetter = require('./senatelobbygetter');
		lobbyGetter.getSenateLobby(socket);
	});
	socket.on('getfbidata', function() {
		
	});
	
	socket.on('newarticle', function(data) {
		console.log('here');
		console.log('47 ' + data.date + ' ' + data.text);
		const newArticle = require('./newarticle');
		newArticle.createNewArticle(socket, db, data.date, data.text, data.title);
	});
	socket.on('getarticledata', function() {
		console.log('getting articles');
		const articleGetter = require('./getarticles');
		articleGetter.getArticles(socket, db);
	});
});