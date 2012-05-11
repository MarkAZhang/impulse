var ctx;
var world;
var canvasWidth, canvasHeight;
var player;
var draw_factor = 10;
var enemies = [];
var obstacles = []
var pointToPlayer; //function for enemies to process

function setupWorld() {
    var gravity = new b2Vec2(000, 000);
    var doSleep = false; //objects in our world will rarely go to sleep
    world = new b2World(gravity, doSleep); 
    player = new Player(world, canvasWidth/20, canvasHeight/20)
    pointToPlayer = (function(player) {
      var _player = player
      return function(startPt) {
    
        return _player.body.GetPosition()
      }
    })(player)
    generate_level()
}

function generate_level() {
  for(var i = 0; i < (canvasWidth/50*canvasHeight/50); i++) {
    enemies.push(new BasicEnemy(world, Math.random()*canvasWidth/10, Math.random()*canvasHeight/10))
  }
  //obstacles.push(new BasicObstacle(world, 30, 30, [new b2Vec2(-10,-10), new b2Vec2(10, -10), new b2Vec2(-10, 10)]))
}

function step() {
    processGame();
    world.Step(1.0/60, 1, 10, 10);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	  drawWorld();
  	setTimeout('step()', 10);
}

function drawWorld() {
  //for(var i = 0; i < obstacles.length; i++) {
    //obstacles[i].draw(ctx, draw_factor)
  //}
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
    
    canvasWidth = 1200;
    canvasHeight = 1000;
var winW = 630, winH = 460;
if (document.body && document.body.offsetWidth) {
 canvasWidth = document.body.offsetWidth;
 canvasHeight = document.body.offsetHeight;
}
if (document.compatMode=='CSS1Compat' &&
    document.documentElement &&
    document.documentElement.offsetWidth ) {
 canvasWidth = document.documentElement.offsetWidth;
 canvasHeight = document.documentElement.offsetHeight;
}
if (window.innerWidth && window.innerHeight) {
 canvasWidth = window.innerWidth;
 canvasHeight = window.innerHeight;
}

canvasWidth-=10
canvasHeight-=10

    
   // screen setup
    var canvas = document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove)
    //canvas.addEventListener("click", onClick, false);
    setupWorld(); // as you like
    canvas.focus()
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

function onMouseMove(event) {
    var keyCode = event==null? window.event.keyCode : event.keyCode;
    player.mouseMove(keyCode)
}

function onClick(event) {
    var keyCode = event==null? window.event.keyCode : event.keyCode;
    player.click(keyCode)
}

function processGame() {
  player.process()
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].process(pointToPlayer)
  }
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
