var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Physics = require('./js/physicsjs-full');
var FPS = 60;
var userData = {};
var sampleData = {};
var ballList = {}; 
var ballRadius = 10;
var vxA = 0;
var vxB = 0;
var scoreA = 0;
var scoreB = 0;
var w = 300;
var h = 300;
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

// constrain objects to these bounds
/*
world.add(Physics.behavior('edge-collision-detection', {
	aabb: viewportBounds,
	restitution: 0.8,
	cof: 0.8
}));
*/
// ensure objects bounce when edge collision is detected
world.add( Physics.behavior('body-impulse-response'));
world.add( Physics.behavior('body-collision-detection'));
//world.add( Physics.behavior('constant-acceleration'));

//world.add(Physics.behavior('newtonian'));

// create a behavior to handle pin constraints
Physics.behavior('pin-constraints', function( parent ){
  return {
    init: function( opts ){
      parent.init.call( this, opts );
      this.pins = [];
    },
    
    add: function( body, targetPos ){
      this.pins.push({
        body: body,
        target: Physics.vector( targetPos )
      });
    },
    
    behave: function( data ){
      var pins = this.pins
        ,pin
        ;
      for (var i = 0, l = pins.length; i < l; i++){
        pin = pins[ i ];
        // move body to correct position
        pin.body.state.pos.clone( pin.target );
      }
    }
  };
});

var things = Physics.body('convex-polygon', {
    x: 400,
    y: 300,

    mass: 10,
    
    vertices: [
    { x: -w/2, y: -h/2 },
    { x: w/2, y: -h/2 },
    { x: w/2, y: h/2 },
    { x: -w/2, y: h/2 }
    ]
});
world.add(things);
ballList[things.uid] = things;

var pinConstraints = Physics.behavior('pin-constraints');
pinConstraints.add( things, things.state.pos );
pinConstraints.behave( things );
world.add(pinConstraints);

var checkptA = false;
var checkptB = false;

world.on('collisions:detected', function(data){
	var cB = data.collisions[0].bodyA;
	var cA = data.collisions[0].bodyB;
	var angleB = ((cB.state.angular.pos / 3.14159265358979 * 180) + 720)% 360;
	//world.remove(cA);
	var angleOK = (angleB<=90 || angleB >=0);

	if((cA.name === 'circle' && cB.name === 'convex-polygon')){
		if(angleOK && cA.team === "A")
		{
			checkptA = true;
		}
		else if (angleOK && cA.team === "B")
		{
			checkptB = true;   
		}
	    setTimeout(function(){
	    	world.removeBody(cA);
	    }, 1000);

	  //world.off('step');

	  console.log({
	    angularB: angleB,
	    scoreA:scoreA,
	    scoreB:scoreB
	  });
	}

});




world.on('step', function(){
	//world.render();
	for(var i in ballList){
		setData(ballList[i]);
	}
});


var playerNum = 0;
/*** Socket.io IO-CONNECTION ***/
io.on('connection', function(socket){
	playerNum ++;
	//io.emit('init-client', {fps: FPS});
	io.sockets.connected[socket.id].emit('init-client', {fps: FPS});

	socket.on('disconnect', function(){
		console.log('user disconnected');
		delete userData[socket.id];
		io.emit('user-data', userData);
	});
	socket.on('usermode', function(udata){
		var me= socket.id;
		var tempTeam;
		if(udata.mode === 'watch'){
			tempTeam = 'none';
		}
		else if(playerNum%2 === 1) tempTeam = 'A';
		else tempTeam = 'B';

		if(!udata.name){
			udata.name = 'unnamed' + playerNum;
		}
		userData[socket.id] = {
			mode: udata.mode,
			name: udata.name,
			team: tempTeam,
			time: new Date().toUTCString()
		};
		io.emit('user-data', {data: userData, you: me});
	});

	socket.on('client-left', function(msg){
		if(userData[socket.id].mode == 'watch') return;
		if(userData[socket.id].team == 'A') vxA -= 0.1;
		else if(userData[socket.id].team == 'B') vxB -= 0.1;
	});
	socket.on('client-right', function(msg){
		if(userData[socket.id].mode == 'watch') return;
		if(userData[socket.id].team == 'A') vxA += 0.1;
		else if(userData[socket.id].team == 'B') vxB += 0.1;
	});

	//server --> ball created
	socket.on('client-pushed-button', function(msg){
		setTimeout(function(){
			if(checkptA) scoreA++;
			if(checkptB) scoreB++;
			checkptA = false;
			checkptB = false;
		}, 100);

		if(userData[socket.id].team === 'A'){
			var nb = Physics.body('circle', {
				x: 400, // x-coordinate
				y: 10, // y-coordinate
				vx: vxA, // velocity in x-direction
				vy: 0.9, // velocity in y-direction
				radius: ballRadius
			});
			// add the circle to the world
			world.add( nb );
			ballList[nb.uid] = nb;
			ballList[nb.uid].team = 'A';
		}
		else if(userData[socket.id].team === 'B'){
			var nb = Physics.body('circle', {
				x: 400, // x-coordinate
				y: 590, // y-coordinate
				vx: vxB, // velocity in x-direction
				vy:-0.9, // velocity in y-direction
				radius: ballRadius
			});
			// add the circle to the world
			world.add( nb );
			ballList[nb.uid] = nb;
			ballList[nb.uid].team = 'B';
		}

	});

	setInterval(function(){
		sampleData.scoreA=scoreA;
    	sampleData.scoreB=scoreB;
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
		type: e.geometry.name,
		team: e.team,
		x: e.state.pos.x,
		y: e.state.pos.y,
		r: e.radius,
		ang: (e.state.angular.pos / 3.14159265358979 * 180) % 360,
	};
}

setInterval(function(){
	world.step();
}, 1);




