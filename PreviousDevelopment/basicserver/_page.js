$( document ).ready(function() {
  console.log( "ready!" );

  var world = Physics();
  var viewWidth = 1000;
  var viewHeight = 100;
  var viewport_el = document.getElementById("viewport");
  var r = 10;

  var socket = io();
  var myteam;

  //space bar signal --> server
  $(document).on('keypress', function( event ) {
    var key = event.which || event.keyCode;
    if(key == '32')
      socket.emit('pushbutton', '');
  });

  //server --> ball created
  socket.on('ball created', function(ball){
	if(a === 'A'){
    world.add(
      Physics.body('circle', {
		vertices: [
				{ x: 0, y: -30 },
				{ x: -29, y: -9 },
				{ x: -18, y: 24 },
				{ x: 18, y: 24 },
				{ x: 29, y: -9 }
			],
        x: 0, // x-coordinate
        y: 0, // y-coordinate
        vx: 1.0, // velocity in x-direction
        vy: 0.1, // velocity in y-direction
        radius: r,
		styles:{
            strokeStyle: '#351024',
            lineWidth: 1,
            fillStyle: '#ff0000',
            angleIndicator: '#351024'
		}
      }));
	}
	if(a === 'B'){
    world.add(
      Physics.body('circle', {
		vertices: [
				{ x: 0, y: -30 },
				{ x: -29, y: -9 },
				{ x: -18, y: 24 },
				{ x: 18, y: 24 },
				{ x: 29, y: -9 }
			],
        x: 1000, // x-coordinate
        y: 0, // y-coordinate
        vx: -1.0, // velocity in x-direction
        vy: 0.1, // velocity in y-direction
        radius: r,
		styles:{
            strokeStyle: '#351024',
            lineWidth: 1,
            fillStyle: '#00ff00',
            angleIndicator: '#351024'
		}
      }));
	}
  });

  socket.on('pushedbutton', function(msg){
    console.log(msg);
    $('#messages').html('')
    for(var k in msg){
      $('#messages').append($('<li>').text(k.substring(0, 10) + ' ====' + msg[k].team +'==== ' + msg[k].n)); }
  });

  socket.on('myteam', function(msg){
    myteam = msg;
    if(myteam == 'A')
      $('#btn').removeClass('btn-default').addClass('btn-danger');
    else
      $('#btn').removeClass('btn-default').addClass('btn-info');
  });

  socket.on('status', function(msg){
    console.log(msg);
    $('#txt').text('teamA: ' + msg.A + ' vs. teamB: ' + msg.B);
  });

  var renderer = Physics.renderer('canvas', {
    el: viewport_el,
    width: viewWidth,
    height: viewHeight,
    meta: false, // don't display meta data
    styles: {
        // set colors for the circle bodies
        'circle' : {
            strokeStyle: '#351024',
            lineWidth: 1,
            fillStyle: '#00ffff',
            angleIndicator: '#351024'
        },
		'convex-polygon' : {
		   strokeStyle: '#542437',
		   lineWidth: 1,
		   fillStyle: '#ffff00',
		   angleIndicator: 'white'
	    }
    }
  });

  // add the renderer
  world.add( renderer );

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
  world.add( ball1 );
  world.add( ball2 );

  // render on each step
  world.on('step', function(){
    world.render();
  });

  // bounds of the window
  var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

  // constrain objects to these bounds
  world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0.8,
      cof: 0.8
  }));

  // ensure objects bounce when edge collision is detected
  world.add( Physics.behavior('body-impulse-response'));
  world.add( Physics.behavior('body-collision-detection'));
  world.add(Physics.behavior('newtonian'));
  //world.add(Physics.behavior('sweep-prune'));
  //world.add(Physics.behavior('verlet-constraints'));

  // add some gravity
  //world.add( Physics.behavior('constant-acceleration'));

  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){
      world.step( time );
  });

  // start the ticker
  Physics.util.ticker.start();

});
