var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
			io.emit('myteam', 'B');
		}
		else{
			user[socket.id] = {n:0, team:'A'};
			teamA += 1;
			io.emit('myteam', 'A');
		}
		io.emit('pushedbutton', user);
		io.emit('status', {A:pushA, B:pushB});
	}
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	});
	socket.on('pushbutton', function(msg){
		user[socket.id].n += 1;
		if(user[socket.id].team == 'A')	
			pushA += 1;
		else
			pushB += 1;

		console.log(user);
		console.log('pushed button from ' + socket.id);
		io.emit('pushedbutton', user);
		io.emit('status', {A:pushA, B:pushB});
		if(pushA%2 === 0){
			pushA ++;
			console.log('new ball');
			io.emit('new ball', 'A');
		}else if (pushB%2 === 0){
			pushB ++;
			console.log('new ball');
			io.emit('new ball', 'B');
		}
	});
	io.emit('some event', { for: 'everyone' });
});


http.listen(3000, function(){
	console.log('listening on *:3000');
});
