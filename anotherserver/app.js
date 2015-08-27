var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Physics = require('./js/physicsjs-full');
var FPS = 30;
var userData = {};
var sampleData = { 
'xxx':
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
'yyy':{
	id: 'yyy',
	type: 'circle',
	team: 'B',
	x: 300,
	y: 300,
	r: 10,
	ang: 0,
	dir: 10
},
'zzz':{
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
};
//var game = require('./game.js');


http.listen(3000, function(){
	console.log('listening on *:3000');
});

app.use(express.static(__dirname));
app.get('/', function(req, res){res.sendFile(__dirname + '/index.html');});


/*** Physics ***/
//Physics
var viewWidth = 800;
var viewHeight = 600;
var today = new Date();
// bounds of the window
var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
var world = Physics();
var ball1 = Physics.body('circle', {
	x: 450, // x-coordinate
	y: 30, // y-coordinate
	vx: -0.5, // velocity in x-direction
	vy: 0.01, // velocity in y-direction
	radius: 20,
});
var ball2 = Physics.body('circle', {
	x: 50, // x-coordinate
	y: 30, // y-coordinate
	vx: 0.7, // velocity in x-direction
	vy: 0.01, // velocity in y-direction
	radius: 20
});
// add the circle to the world
world.add( ball1 );
world.add( ball2 );

// constrain objects to these bounds
world.add(Physics.behavior('edge-collision-detection', {
	aabb: viewportBounds,
	restitution: 0.8,
	cof: 0.8
}));

// ensure objects bounce when edge collision is detected
world.add( Physics.behavior('body-impulse-response'));
world.add( Physics.behavior('body-collision-detection'));
//world.add( Physics.behavior('constant-acceleration'));

world.add(Physics.behavior('newtonian'));

var ballList = [ball1, ball2];

world.on('step', function(){
	//world.render();
	for(var i in ballList){
		setData(ballList[i]);
	}
});


/*** Socket.io IO-CONNECTION ***/
io.on('connection', function(socket){
	//io.emit('init-client', {fps: FPS});
	io.sockets.connected[socket.id].emit('init-client', {fps: FPS});

	socket.on('disconnect', function(){
		console.log('user disconnected');
		io.emit('user-data', userData);
	});
	socket.on('usermode', function(udata){
		userData[socket.id] = {
			mode: udata.mode,
			name: udata.name,
			time: new Date().toUTCString()
		};
		io.emit('user-data', userData);
	});

	//server --> ball created
	socket.on('client-pushed-button', function(msg){
		var nb = Physics.body('circle', {
			x: 50, // x-coordinate
			y: 30, // y-coordinate
			vx: 0.7, // velocity in x-direction
			vy: 0.01, // velocity in y-direction
			radius: 20
		});
		// add the circle to the world
		world.add( nb );
		ballList.push(nb);
		console.log('pushed-button!!');

		if(!!io.sockets.connected[socket.id])
			io.emit('user-data', userData);


	});

	setInterval(function(){
		if(!!io.sockets.connected[socket.id])
			io.emit('body-update', sampleData);
	}, 1000/FPS);

/*
	// subscribe to ticker to advance the simulation
	Physics.util.ticker.on(function( time, dt ){
		world.step( time );
	});

	// start the ticker
	Physics.util.ticker.start();
	//io.emit('load-world', sample);
	//io.emit('load-world', sample.getBodies());
*/


});

function setData(e){
	//console.log(e.state.pos, e.state.pos.x, e.state.pos.y);
	sampleData[e.uid] = {
		id: e.uid,
		type: 'circle',
		team: 'A',
		x: e.state.pos.x,
		y: e.state.pos.y,
		r: e.radius,
		ang: 0,
	};
}

setInterval(function(){
	world.step();
}, 1);




