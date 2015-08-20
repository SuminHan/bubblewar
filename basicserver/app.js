var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Physics = require('./js/physicsjs-full');

var world = Physics();

user = {};
teamA = 0;
teamB = 0;
pushA = 0;
pushB = 0;

app.get('/', function(req, res){
	//res.send('<h1>Hello world</h1>');
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname));

io.on('connection', function(socket){
	if(!user[socket.id]){
		if(teamA>teamB){
			user[socket.id] = {n:0, team:'B'};
			teamB += 1;
			io.emit('myteam-info', 'B');
		}
		else{
			user[socket.id] = {n:0, team:'A'};
			teamA += 1;
			io.emit('myteam-info', 'A');
		}
		io.emit('score-board', user);
		io.emit('status', {A:pushA, B:pushB});
	}
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	});
	socket.on('client-pushed-button', function(msg){
		user[socket.id].n += 1;
		if(user[socket.id].team == 'A')	
			pushA += 1;
		else
			pushB += 1;

		console.log(user);
		console.log('pushed button from ' + socket.id);
		io.emit('score-board', user);
		io.emit('status', {A:pushA, B:pushB});
		if(pushA%11 === 0){
			pushA ++;
			io.emit('ball-created', PHYSICS.ball);
		}else if (pushB%11 === 0){
			pushB ++;
			io.emit('ball-created', PHYSICS.ball);
		}
	});
	io.emit('some event', { for: 'everyone' });

});


http.listen(3000, function(){
	console.log('listening on *:3000');
});
