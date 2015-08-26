$(function() {
  console.log( "ready!" );

  var world = null;
  var viewport_el = document.getElementById("viewport");
  var r = 10;

  var socket = io();
  var myteam;

  socket.on('load-world', function(bds){
	world = Physics();
	world.add(bds);
  });

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
    meta: {
		fps: 10,
		ipf: 4
	}, // don't display meta data
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


  // render on each step
  world.on('step', function(){
    world.render();
  });


});
