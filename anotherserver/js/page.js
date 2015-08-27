$(function(){
  var userMode = null;
  var started = false;
  var oldData = {};
  var newData = {};
  var mygraphics = {};
  var FPS = 30;
  var socket = io();
  var stage = new PIXI.Container();
  var renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor : 0x1099bb});
  var nickName = '';
  $('#myModal').modal({
    keyboard:false,
    show:true,
    backdrop:'static'
  });
  //$('#myModal').modal('show');
  $('#watch').click(function(e){
    $('#myModal').modal('hide');
    $('#viewport').append(renderer.view);
    requestAnimationFrame(animate);
    userMode = 'watch';
    nickName = $('#nickName').val();
    if(!nickName) nickName = 'unnamed';
    socket.emit('usermode', {mode: 'watch', name: nickName});
    started = true;
  });

  $('#attend').click(function(e){
    $('#myModal').modal('hide');
    $('#viewport').append(renderer.view);
    requestAnimationFrame(animate);
    userMode = 'attend';
    nickName = $('#nickName').val();
    if(!nickName) nickName = 'unnamed';
    socket.emit('usermode', {mode: 'attend', name: nickName});
    started = true;
  });
  
//  var renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor : 0x1099bb});
// $(window).width(), $(window).height()

  socket.on('init-client', function(serverData){
    FPS = serverData.fps;
  });

  socket.on('user-data', function(serverData){
    $('#userlist').html('');
    for(var k in serverData){
      $('#userlist')
      .append($('<li>')
      .text(serverData[k].name
        + ' ==== ' + serverData[k].mode
        + ' ==time: ' + serverData[k].time));
    }
  });

  socket.on('body-update', function(serverData){
    oldData = newData;
    newData = serverData;
  });

  $(document).on('keypress', function( event ) {
    if(!started) return;
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
      TweenLite.fromTo(ngraphics, 1/FPS, { x: d.x, y: d.y}, {x: o.x, y: o.y});
      ngraphics.rotation = d.ang;
    }
    oldData = newData;
  }

});





