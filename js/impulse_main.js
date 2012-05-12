var ctx;
var world;
var canvasWidth, canvasHeight;
var player;
var draw_factor = 10;
var enemies = [];
var obstacles = []
var pointToPlayer; //function for enemies to process
var vertices = []
var visibility_graph;
var this_path = null

function setupWorld() {
    var gravity = new b2Vec2(000, 000);
    var doSleep = false; //objects in our world will rarely go to sleep
    world = new b2World(gravity, doSleep); 
    //player = new Player(world, canvasWidth/20, canvasHeight/20)
    player = new Player(world, 0, 0)
    pointToPlayer = (function(player) {
      var _player = player
      return function(startPt) {
    
        return _player.body.GetPosition()
      }
    })(player)
    generate_level()
}

function generate_level() {
  for(var i = 0; i < 1; i++) {
    //enemies.push(new BasicEnemy(world, Math.random()*canvasWidth/10, Math.random()*canvasHeight/10))
    enemies.push(new BasicEnemy(world, canvasWidth/10, canvasHeight/10))
  }
  generate_obstacles()
  visibility_graph = new VisibilityGraph(vertices)
  
  
}

function generate_obstacles() {
  //obstacles.push(new BasicObstacle(world, 30, 30, [[new b2Vec2(-10,-10), new b2Vec2(10, -10), new b2Vec2(-10, 10)], 
  //      [new b2Vec2(-30,-10), new b2Vec2(-10, -30), new b2Vec2(-10, -10)]]))
  for(var i = 0; i < 50; i++)
  {
    var x = Math.random()*canvasWidth*4/50+canvasWidth*1/100
    var y =  Math.random()*canvasHeight*4/50+canvasHeight*1/100
    var r1 = Math.random()*4+3
    var r2 = Math.random()*4+3
    var r3 = Math.random()*4+3
    var r4 = Math.random()*2*Math.PI
    var temp_v = [new b2Vec2(r1*Math.cos(r4+Math.PI), r1*Math.sin(r4+Math.PI)),
          new b2Vec2(r2*Math.cos(r4+Math.PI*2/3), r2*Math.sin(r4+Math.PI*2/3)),
          new b2Vec2(r3*Math.cos(r4+Math.PI*4/3), r3*Math.sin(r4+Math.PI*4/3))]
    obstacles.push(new BasicObstacle(world, x, y, [temp_v]))
    var temp_vv = [new b2Vec2(r1*Math.cos(r4+Math.PI)+x, r1*Math.sin(r4+Math.PI)+y),
          new b2Vec2(r2*Math.cos(r4+Math.PI*2/3)+x, r2*Math.sin(r4+Math.PI*2/3)+y),
          new b2Vec2(r3*Math.cos(r4+Math.PI*4/3)+x, r3*Math.sin(r4+Math.PI*4/3)+y)]
    vertices.push(temp_vv)
  }

}


function step() {
    processGame();
    world.Step(1.0/60, 1, 10, 10);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	  drawWorld();
  	setTimeout('step()', 10);
}

function drawWorld() {
  for(var i = 0; i < obstacles.length; i++) {
    obstacles[i].draw(ctx, draw_factor)
  }
  player.draw(ctx, draw_factor)
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].draw(ctx, draw_factor)
  }
 
  for(var i = 0; i < visibility_graph.vertices.length; i++)
  {
      ctx.beginPath()
    	ctx.fillStyle = 'green';
      if(i==0)
        ctx.arc(visibility_graph.vertices[i].x*draw_factor, visibility_graph.vertices[i].y*draw_factor, 5, 0, 2*Math.PI, true)
      else
      	ctx.arc(visibility_graph.vertices[i].x*draw_factor, visibility_graph.vertices[i].y*draw_factor, 2, 0, 2*Math.PI, true)
      //ctx.font = 'italic 10px sans-serif'
      //ctx.fillText(i, visibility_graph.vertices[i].x*draw_factor, visibility_graph.vertices[i].y*draw_factor)
    	ctx.fill()
  }

  for(var i = 0; i < visibility_graph.poly_edges.length; i++)
  {
      ctx.beginPath()
    	ctx.strokeStyle = 'green';
      ctx.moveTo(visibility_graph.poly_edges[i].p1.x*draw_factor, visibility_graph.poly_edges[i].p1.y*draw_factor)
      ctx.lineTo(visibility_graph.poly_edges[i].p2.x*draw_factor, visibility_graph.poly_edges[i].p2.y*draw_factor)
    	ctx.stroke()
  }
  /*for(var i = 0; i < visibility_graph.edges.length; i++)
  {
      ctx.beginPath()
    	ctx.strokeStyle = 'red';
      ctx.moveTo(visibility_graph.edges[i].p1.x*draw_factor, visibility_graph.edges[i].p1.y*draw_factor)
      ctx.lineTo(visibility_graph.edges[i].p2.x*draw_factor, visibility_graph.edges[i].p2.y*draw_factor)
    	ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = 'red'
      ctx.fillText(Math.round(p_dist(visibility_graph.edges[i].p1, visibility_graph.edges[i].p2)), (visibility_graph.edges[i].p1.x*draw_factor+visibility_graph.edges[i].p2.x*draw_factor)/2, (visibility_graph.edges[i].p1.y*draw_factor+visibility_graph.edges[i].p2.y*draw_factor)/2)
      ctx.fill()
  }*/
  if(Math.random() < .1) 
    this_path = visibility_graph.query(enemies[0].body.GetPosition(), player.body.GetPosition())
  if(this_path)
  {

    ctx.beginPath()
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3
    ctx.moveTo(this_path[0].x*draw_factor, this_path[0].y*draw_factor)
    for(var i = 1; i < this_path.length; i++)
    {
        ctx.lineTo(this_path[i].x*draw_factor, this_path[i].y*draw_factor)
    }
    ctx.stroke()
    ctx.lineWidth = 1
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
  /*for(var i = 0; i < enemies.length; i++) {
    enemies[i].process(pointToPlayer)
  }*/
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
