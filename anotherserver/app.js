var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Physics = require('./js/physicsjs-full');
var sampleData =  
[
{
	id: 'xxx',
	type: 'circle',
	team: 'A',
	x: 400,
	y: 400,
	r: 20,
	ang: 0,
	dir: 10
},
{
	id: 'yyy',
	type: 'circle',
	team: 'B',
	x: 300,
	y: 300,
	r: 10,
	ang: 0,
	dir: 10
},
{
	id: 'zzz',
	type: 'rect',
	team: 'A',
	x: 400,
	y: 200,
	w: 60,
	h: 30,
	ang: 3.14/3,
	dir: 10,
}
];
//var game = require('./game.js');


http.listen(3000, function(){
	console.log('listening on *:3000');
});

app.use(express.static(__dirname));
app.get('/', function(req, res){res.sendFile(__dirname + '/index.html');});

setInterval(function(){
	for(var i in sampleData){
		var d = sampleData[i];
		d.x += d.dir;
		if(d.x > 400)
			d.dir = -10;
		else if(d.x < 200)
			d.dir = 10;


	}
	console.log(sampleData);
}, 50);

io.on('connection', function(socket){
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	setInterval(function(){
		io.emit('body-update', sampleData);
	}, 100);


	
});


