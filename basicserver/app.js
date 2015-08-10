var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

user = {};

app.get('/', function(req, res){
	//res.send('<h1>Hello world</h1>');
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	if(!user[socket.id]){
		user[socket.id] = 0;
	}
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	});
	socket.on('pushbutton', function(msg){
		user[socket.id] += 1;
		console.log(user);
		console.log('pushed button from ' + socket.id);
		io.emit('pushedbutton', user);
	});
	io.emit('some event', { for: 'everyone' });
});


http.listen(3000, function(){
	console.log('listening on *:3000');
});
