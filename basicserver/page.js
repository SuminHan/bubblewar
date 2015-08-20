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
      socket.emit('client-pushed-button', '');
  });

  //server --> ball created
  socket.on('ball-created', function(ball){
	
  });

  //server --> score board (update)
  socket.on('score-board', function(msg){
    console.log(msg);
    $('#messages').html('')
    for(var k in msg){
      $('#messages')
	  .append($('<li>')
	  .text(k.substring(0, 10)
			+ ' ====' + msg[k].team +'==== '
			+ msg[k].n));
	}
  });

  //server --> status (update)
  socket.on('status', function(msg){
    console.log(msg);
    $('#txt').text('teamA: ' + msg.A + ' vs. teamB: ' + msg.B);
  });

  //server --> myteam-info
  socket.on('myteam-info', function(info){
    if(info == 'A')
      $('#btn').removeClass('btn-default').addClass('btn-danger');
    else
      $('#btn').removeClass('btn-default').addClass('btn-info');
  });


  var renderer = Physics.renderer('canvas', {
    el: viewport_el,
    width: viewWidth,
    height: viewHeight,
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
