var ctx;
var world;
var canvasWidth, canvasHeight;
var player;
var draw_factor = 10;
var enemies = [];
var obstacles = []

function setupWorld() {
    var gravity = new b2Vec2(000, 000);
    var doSleep = false; //objects in our world will rarely go to sleep
    world = new b2World(gravity, doSleep); 
    player = new Player(world, 40, 30)
    generate_level()
}

function generate_level() {
  for(var i = 0; i < 10; i++) {
    enemies.push(new BasicEnemy(world, Math.random()*80, Math.random()*60))
  }
  //obstacles.push(new BasicObstacle(world, [new b2Vec2(20,20), new b2Vec2(40,20), new b2Vec2(20,40)]))
}

function step() {
    processGame();
    world.Step(1.0/60, 1, 10, 10);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	  drawWorld();
  	setTimeout('step()', 10);
}

function drawWorld() {
  player.draw(ctx, draw_factor)
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].draw(ctx, draw_factor)
  }
}



Event.observe(window, 'load', function() {
    b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2AABB = Box2D.Collision.b2AABB
    ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,	b2Body = Box2D.Dynamics.b2Body
    ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,	b2Fixture = Box2D.Dynamics.b2Fixture
    ,	b2World = Box2D.Dynamics.b2World
    ,	b2MassData = Box2D.Collision.Shapes.b2MassData
    ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    
    canvasWidth = 800;
    canvasHeight = 600;
   // screen setup
    var canvas = document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onKeyUp);
    //canvas.addEventListener("click", onClick, false);
    setupWorld(); // as you like
    // game loop
    // msDuration = time since last tick() call
    step()
});

function onKeyDown(event) {
    var keyCode = event==null? window.event.keyCode : event.keyCode;
    player.keyDown(keyCode)
}

function onKeyUp(event) {
    var keyCode = event==null? window.event.keyCode : event.keyCode;
    player.keyUp(keyCode)
}

function processGame() {
  player.process()
}

function getCursorPosition(){

    var x;
    var y;
    if (e.pageX || e.pageY) { 
      x = e.pageX;
      y = e.pageY;
    }
    else { 
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 
    x -= gCanvasElement.offsetLeft;
    y -= gCanvasElement.offsetTop;

}
