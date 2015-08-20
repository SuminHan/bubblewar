$( document ).ready(function() {
  console.log( "ready!" );
  var world = Physics();
  var viewWidth = 500;
  var viewHeight = 500;
  var x = document.getElementById("viewport");
  var r = 10;

  var socket = io();
  var myteam;

  $('#btn').click(function( event ) {
    socket.emit('pushbutton', '');
  });

  $(document).on('keypress', function( event ) {
    var key = event.which || event.keyCode;
    if(key == '32')
      socket.emit('pushbutton', $('#m').val());
  });

  socket.on('new ball', function(a){

	if(a === 'A'){
    world.add(
      Physics.body('circle', {
        x: 250, // x-coordinate
        y: 0, // y-coordinate
        vx: 0.15, // velocity in x-direction
        vy: 1.0, // velocity in y-direction
        radius: r,
    		styles:{
                strokeStyle: '#351024',
                lineWidth: 1,
                fillStyle: '#ff0000',
                angleIndicator: '#351024'
    		}
      })
    );
	}
	if(a === 'B'){
    world.add(
      Physics.body('circle', {
        x: 250, // x-coordinate
        y: 500, // y-coordinate
        vx: -0.15, // velocity in x-direction
        vy: -1.0, // velocity in y-direction
        radius: r,
    		styles:{
                strokeStyle: '#351024',
                lineWidth: 1,
                fillStyle: '#00ff00',
                angleIndicator: '#351024'
    		}
      })
    );
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

var renderer = Physics.renderer('canvas', {
    el: x,
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
        }
        /*
        'convex-polygon' : {
           strokeStyle: '#542437',
           lineWidth: 1,
           fillStyle: '#ffff00',
           angleIndicator: 'white'
        }
        */
    }
  });
  // add the renderer
  world.add( renderer );

  var shelf = Physics.body('convex-polygon', {
      x: 250,
      y: 250,
      vertices: [
      { x: -50, y: -50 },
      { x: 50, y: -50 },
      { x: 50, y: 50 },
      { x: -50, y: 50 }
      ],
      mass: 100,
      restitution: 0.5
  });
  world.add(shelf);

  world.add(Physics.integrator('verlet', {
      drag: 0.003
  }));
  

  var pinConstraints = Physics.behavior('pin-constraints');
  // add a pin constraint constraining the shelf's center to its current position
  pinConstraints.add( shelf, shelf.state.pos );
  world.add(pinConstraints);

  //world.add(Physics.behavior('constant-acceleration'));
  world.add(Physics.behavior('body-collision-detection'));
  world.add(Physics.behavior('body-impulse-response'));
  //world.add(Physics.behavior('sweep-prune'));

  var bounds = Physics.aabb(0, 0, viewWidth, viewHeight);

  world.add(Physics.behavior('edge-collision-detection', {
      aabb: bounds,
      restitution: 0.01,
      cof: 0.8
  }));

  // render on each step
  world.on('step', function(){
    world.render();
  });

  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){

      world.step( time );
  });

  // start the ticker
  Physics.util.ticker.start();

});
