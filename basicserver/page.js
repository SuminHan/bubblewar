Physics(function(world){

  var viewWidth = 500;
  var viewHeight = 300;
  var x = document.getElementById("viewport");

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
            fillStyle: '#d33682',
            angleIndicator: '#351024'
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

  // add some gravity
  world.add( Physics.behavior('constant-acceleration') );

  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){

      world.step( time );
  });

  // start the ticker
  Physics.util.ticker.start();

});