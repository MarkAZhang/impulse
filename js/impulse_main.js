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
  for(var i = 0; i < 10; i++) {
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
    
    canvasWidth = 800;
    canvasHeight = 600;
    
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
    var mPos = getCursorPosition(event)
    player.mouseMove(mPos, draw_factor)
}

function onClick(event) {
    var mPos = getCursorPosition(event)
    player.click(mPos, enemies)
}

function processGame() {
  player.process()
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].process(pointToPlayer)
  }
}

function getCursorPosition(e){

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
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    return {x: x, y: y}

}

var _atan = function(center, ray) {
  var angle
  if(center.x == ray.x)
  {
    if(center.y > ray.y)
    {
      angle = -Math.PI/2
    }
    else
    {
      angle = Math.PI/2
    }
  }
  angle = Math.atan((center.y-ray.y)/(center.x-ray.x))
  if(center.x > ray.x)
  {
    angle +=Math.PI
  }
  return angle
}
