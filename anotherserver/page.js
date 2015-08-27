$(function(){
  var socket = io();

  var stage = new PIXI.Container();
  var renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor : 0x1099bb});
  var oldData = {};
  var newData = {};
  var mygraphics = {};
  $('#viewport').append(renderer.view);

  requestAnimationFrame(animate);

  socket.on('body-update', function(serverData){
    oldData = newData;
    newData = serverData;
  });

  $(document).on('keypress', function( event ) {
    var key = event.which || event.keyCode;
    if(key == '32')
      socket.emit('client-pushed-button', '');
  });

  function animate(){
    updateBodyData();
    requestAnimationFrame(animate);
    renderer.render(stage);
  }
  function updateBodyData(){
    for(var i in newData){
      var d = newData[i];
      var o = oldData[i];
      if(!o){
        o = {
          x: 0,
          y: 0
        };
      }
      var ngraphics = mygraphics[d.id];
      if(!ngraphics){
        ngraphics = new PIXI.Graphics();
        mygraphics[d.id] = ngraphics;

        if(d.team === 'A') ngraphics.beginFill(0xFFFF00);
        else ngraphics.beginFill(0xFFFF00);
        ngraphics.lineStyle(1, 0xFF0000);

        if(d.type === 'circle'){          
          ngraphics.drawCircle(0, 0, d.r);
        }
        else if(d.type === 'rect'){
          ngraphics.drawRect(0, 0, d.w, d.h);
        }
        else{

        }
        stage.addChild(ngraphics);
      }
      //ngraphics.x = d.x;
      //ngraphics.y = d.y;
      TweenLite.fromTo(ngraphics, .1, { x: d.x, y: d.y}, {x: o.x, y: o.y});
      ngraphics.rotation = d.ang;
    }
    oldData = newData;
  }


});




/**
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

**/