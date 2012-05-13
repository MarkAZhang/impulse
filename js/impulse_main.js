var ctx;
var world;
var canvasWidth, canvasHeight;
var player;
var draw_factor = 15;
var enemies = [];
var obstacles = []
var pointToPlayer; //function for enemies to process
var polygons = []
var visibility_graph;
var this_path = null
var last_time = 0
var fps_counter = null
var fps = 0
var game_state = 0
var step_id;
var dead_enemies = [];
var other_polygon;
var obstacle_polygons = [];
var buffer_radius = 1;  //radius around obstacles and around outer wall

function setupWorld() {
    enemies = []
    obstacles = []
    polygons = []
    obstacle_polygons = []
    var gravity = new b2Vec2(000, 000);
    var doSleep = false; //objects in our world will rarely go to sleep
    world = new b2World(gravity, doSleep); 
    //player = new Player(world, canvasWidth/20, canvasHeight/20)
    
    //add walls
    addWalls()

    player = new Player(world, 0, 0)
    pointToPlayer = (function(player) {
      var _player = player
      return function(startPt) {
    
        return _player.body.GetPosition()
      }
    })(player)
    generate_level()
}

function addWalls() {
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = 0x0001
  fixDef.filter.maskBits = 0x0002
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_staticBody;
  fixDef.shape = new b2PolygonShape
  fixDef.shape.SetAsBox(canvasWidth/draw_factor/2, 2)
  bodyDef.position.Set(canvasWidth/draw_factor/2, -2)
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = 0x0001
  fixDef.filter.maskBits = 0x0002
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_staticBody;
  fixDef.shape = new b2PolygonShape
  fixDef.shape.SetAsBox(canvasWidth/draw_factor/2, 2)
  bodyDef.position.Set(canvasWidth/draw_factor/2, canvasHeight/draw_factor+2)
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = 0x0001
  fixDef.filter.maskBits = 0x0002
  bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_staticBody;
  fixDef.shape = new b2PolygonShape
  fixDef.shape.SetAsBox(2, canvasHeight/draw_factor/2)
  bodyDef.position.Set(-2, canvasHeight/draw_factor/2)
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = 0x0001
  fixDef.filter.maskBits = 0x0002
  bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_staticBody;
  fixDef.shape = new b2PolygonShape
  fixDef.shape.SetAsBox(2, canvasHeight/draw_factor/2)
  bodyDef.position.Set(canvasWidth/draw_factor+2, canvasHeight/draw_factor/2)
  world.CreateBody(bodyDef).CreateFixture(fixDef);


}

function generate_level() {
  
  
  generate_obstacles()
  visibility_graph = new VisibilityGraph(polygons)
  for(var i = 0; i < 50; i++) {
    var r_p = getRandomValidLocation()
    enemies.push(new BasicEnemy(world, r_p.x, r_p.y))
    //enemies.push(new BasicEnemy(world, canvasWidth/10, canvasHeight/10))
  }
}

function generate_obstacles() {
  console.log("GENERATING POLYGONS")
  //obstacles.push(new BasicObstacle(world, 30, 30, [[new b2Vec2(-10,-10), new b2Vec2(10, -10), new b2Vec2(-10, 10)], 
  //      [new b2Vec2(-30,-10), new b2Vec2(-10, -30), new b2Vec2(-10, -10)]]))
  for(var i = 0; i < 20; i++)
  {
    var x = Math.random()*canvasWidth/draw_factor
    var y =  Math.random()*canvasHeight/draw_factor
    var r1 = Math.random()*4+3
    var r2 = Math.random()*4+3
    var r3 = Math.random()*4+3
    var r4 = Math.random()*2*Math.PI
    var temp_v = [new b2Vec2(r1*Math.cos(r4+Math.PI)+x, r1*Math.sin(r4+Math.PI)+y),
          new b2Vec2(r2*Math.cos(r4+Math.PI*2/3)+x, r2*Math.sin(r4+Math.PI*2/3)+y),
          new b2Vec2(r3*Math.cos(r4+Math.PI*4/3)+x, r3*Math.sin(r4+Math.PI*4/3)+y)]
    obstacles.push(new BasicObstacle(temp_v))
    obstacle_polygons.push(temp_v)
    polygons.push(getBoundaryPolygon(temp_v, buffer_radius))
    
  }

}


function step() {
    processGame();
    world.Step(1.0/60, 1, 10, 10);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	  drawWorld();
    if(game_state==0)
    	step_id = setTimeout('step()', 20);
}

function drawWorld() {

  if(game_state==1)
  {
    clearTimeout(step_id)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath()
    ctx.font = '30px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText("GAME OVER", canvasWidth/2, canvasHeight/2)
    ctx.fillText("CLICK TO PLAY AGAIN", canvasWidth/2, canvasHeight/2+100)
    return
  }

  for(var i = 0; i < obstacles.length; i++) {
    obstacles[i].draw(ctx, draw_factor)
  }

  player.draw(ctx, draw_factor)
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].draw(ctx, draw_factor)
  }
  fps_counter+=1
  if(fps_counter == null)
  {
    last_time = (new Date()).getTime()
    fps_counter = 0
  }
  else if(fps_counter == 100)
  {
    fps_counter = 0
    fps = 100000/((new Date()).getTime()-last_time)
    last_time = (new Date()).getTime()
  }
  ctx.beginPath()
  ctx.font = '10px sans-serif'
  ctx.fillText(fps, canvasWidth - 20, canvasHeight - 20)
  ctx.fill()
 
  /*for(var i = 0; i < visibility_graph.vertices.length; i++)
  {
      ctx.beginPath()
    	ctx.fillStyle = 'green';
    	ctx.arc(visibility_graph.vertices[i].x*draw_factor, visibility_graph.vertices[i].y*draw_factor, 2, 0, 2*Math.PI, true)
      //ctx.font = 'italic 10px sans-serif'
      //ctx.fillText(i, visibility_graph.vertices[i].x*draw_factor, visibility_graph.vertices[i].y*draw_factor)
    	ctx.fill()
  }*/

  /*for(var i = 0; i < visibility_graph.poly_edges.length; i++)
  {
      ctx.beginPath()
    	ctx.strokeStyle = 'green';
      ctx.moveTo(visibility_graph.poly_edges[i].p1.x*draw_factor, visibility_graph.poly_edges[i].p1.y*draw_factor)
      ctx.lineTo(visibility_graph.poly_edges[i].p2.x*draw_factor, visibility_graph.poly_edges[i].p2.y*draw_factor)
    	ctx.stroke()
  }*/
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
  }
  if(enemies[0])
  {
    this_path = visibility_graph.query(enemies[0].body.GetPosition(), player.body.GetPosition(), obstacle_polygons)
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
  }*/

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
    setupWorld(); 
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
    if(game_state==1)
    {
      game_state = 0
      setupWorld()
      step()
    }

    var mPos = getCursorPosition(event)
    player.click(mPos, enemies)
}

function processGame() {
  dead_enemies = []
  player.process(polygons)
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].process(i)
  }
  while(dead_enemies.length > 0)
  {
    var dead_i = dead_enemies.pop()
    world.DestroyBody(enemies[dead_i].body)
    enemies.splice(dead_i, 1)
    console.log(dead_enemies)
  }
}

function getRandomValidLocation() {
  var r_point = {x:Math.random()*(canvasWidth/draw_factor-2*buffer_radius)+buffer_radius, y: Math.random()*(canvasHeight/draw_factor-2*buffer_radius)+buffer_radius}
  var inPoly = false
  for(var k = 0; k < obstacle_polygons.length; k++)
  {
    if(i != k && pointInPolygon(obstacle_polygons[k], r_point))
    {
      inPoly = true
    }
  }
  if(inPoly)
  {
    return getRandomValidLocation()
  }
  if(visibility_graph.query(r_point, player.body.GetPosition(), obstacle_polygons)==null)
  {
    return getRandomValidLocation()
  }
  return r_point


}

function gameOver() {
  game_state = 1
  
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

function getBoundaryPolygon(polygon, radius) {

  var j = polygon.length - 1
  var ans = []
  for(var i = 0; i < polygon.length; i++)
  {
    
    var k = (i+1)%polygon.length
    var j_to_i_normal = new b2Vec2(polygon[j].y - polygon[i].y, polygon[i].x - polygon[j].x)
    var k_to_i_normal = new b2Vec2(polygon[i].y - polygon[k].y, polygon[k].x - polygon[i].x)
    j_to_i_normal.Normalize()
    k_to_i_normal.Normalize()
    ans.push({x: polygon[j].x+j_to_i_normal.x*radius, y: polygon[j].y + j_to_i_normal.y*radius})
    ans.push({x: polygon[i].x+j_to_i_normal.x*radius, y: polygon[i].y + j_to_i_normal.y*radius})
    var sum = new b2Vec2(j_to_i_normal.x + k_to_i_normal.x, j_to_i_normal.y + k_to_i_normal.y)
    sum.Normalize()
    ans.push({x: polygon[i].x+sum.x * radius, y: polygon[i].y+sum.y * radius})
    j = i
  }
  return ans
}
