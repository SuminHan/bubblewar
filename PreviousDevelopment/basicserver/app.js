var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Physics = require('./js/physicsjs-full');

var viewWidth = 1000;
var viewHeight = 100;

user = {};
teamA = 0;
teamB = 0;
pushA = 0;
pushB = 0;

http.listen(3000, function(){
	console.log('listening on *:3000');
});

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

	//physics stuff
	var sample = Physics();
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
		radius: 15
	});
	// add the circle to the world
	sample.add( ball1 );
	sample.add( ball2 );

	// bounds of the window
	var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

	// constrain objects to these bounds
	sample.add(Physics.behavior('edge-collision-detection', {
		aabb: viewportBounds,
		restitution: 0.8,
		cof: 0.8
	}));

	// ensure objects bounce when edge collision is detected
	sample.add( Physics.behavior('body-impulse-response'));
	sample.add( Physics.behavior('body-collision-detection'));
	sample.add(Physics.behavior('newtonian'));

	// subscribe to ticker to advance the simulation
	Physics.util.ticker.on(function( time, dt ){
		sample.step( time );
	});

	// start the ticker
	Physics.util.ticker.start();
	//io.emit('load-world', sample);
	//io.emit('load-world', sample.getBodies());
	
});


