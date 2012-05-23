var ctx;
var world;
var canvasWidth, canvasHeight;
var player;
var draw_factor = 15;
var enemies = [];
var obstacles = []
var obstacle_edges = []
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
var boundary_polygons = []; //the polygons that enemies use to calculate pathfinding
var obstacle_polygons = []; //the actual polygons that kill players and enemies
var buffer_radius = 1;  //radius around obstacles and around outer wall
var enemy_counter; //give each enemy an ID
var offset_left, offset_top
var game_numbers = {score: 0, seconds: 0, kills: 0, game_start: 0, max_enemies: [10, 0, 0, 0]}

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
    var canvas_container = document.getElementById("canvas_container");
    canvas.width = canvasWidth;
    canvas.height =  canvasHeight;
    canvas_container.style.width = canvasWidth + 'px'
    canvas_container.style.height = canvasHeight + 'px'

    ctx = canvas.getContext('2d');
    canvas.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove)

    var dim = getWindowDimensions()

    canvas_container.style.position = 'absolute'
    if(canvasWidth < dim.w)
    {
      offset_left = (dim.w-canvasWidth)/2
      canvas_container.style.left =  Math.round(offset_left) + 'px'
    }
    if(canvasHeight < dim.h)
    {
      offset_top = (dim.h-canvasHeight)/2
      canvas_container.style.top = Math.round(offset_top) + 'px'
    }

      
    //canvas.addEventListener("click", onClick, false);

    draw()

    
});


function setupWorld() {
    enemy_counter = 0
    enemies = []
    obstacles = []
    boundary_polygons = []
    obstacle_polygons = []
    obstacle_edges = []
    game_numbers.score = 0
    game_numbers.kills = 0
    game_numbers.seconds = 0

    var gravity = new b2Vec2(000, 000);
    var doSleep = false; //objects in our world will rarely go to sleep
    world = new b2World(gravity, doSleep); 
    player = new Player(world, canvasWidth/20, canvasHeight/20, draw_factor)
    
    //add walls
    addWalls()
    
    generate_level()
    var r_p = getRandomValidLocation({x: -10, y: -10})
    //player = new Player(world, r_p.x, r_p.y)
    game_numbers.game_start = (new Date()).getTime()
    game_numbers.last_time = null
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
  visibility_graph = new VisibilityGraph(boundary_polygons)
  
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
    boundary_polygons.push(getBoundaryPolygon(temp_v, buffer_radius))
    
  }
  generate_obstacle_edges()

}

function generate_obstacle_edges() {
  for(var i = 0; i < obstacles.length; i++)
  {
    var obstacle = obstacles[i]
    var k = obstacle.verticeSet.length - 1
    for(var j = 0; j < obstacle.verticeSet.length; j++)
    {
      obstacle_edges.push({p1: obstacle.verticeSet[k], p2: obstacle.verticeSet[j]})
      k = j
    }
  }
}

function drawWorld() {
  for(var i = 0; i < obstacles.length; i++) {
    obstacles[i].draw(ctx, draw_factor)
  }

  player.draw(ctx)
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].draw(ctx, draw_factor)
  }
  
 
  for(var i = 0; i < visibility_graph.vertices.length; i++)
  {
      ctx.beginPath()
    	ctx.fillStyle = 'green';
    	ctx.arc(visibility_graph.vertices[i].x*draw_factor, visibility_graph.vertices[i].y*draw_factor, 2, 0, 2*Math.PI, true)
      //ctx.font = 'italic 10px sans-serif'
      //ctx.fillText(i, visibility_graph.vertices[i].x*draw_factor, visibility_graph.vertices[i].y*draw_factor)
    	ctx.fill()
  }

  for(var i = 0; i < visibility_graph.poly_edges.length; i++)
  {
      ctx.beginPath()
      ctx.lineWidth = 1
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
  if(enemies[0])
  {
    this_path = visibility_graph.query(enemies[0].body.GetPosition(), player.body.GetPosition(), boundary_polygons)
    if(this_path)
    {

      ctx.beginPath()
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 3
      ctx.moveTo(enemies[0].body.GetPosition().x*draw_factor, enemies[0].body.GetPosition().y*draw_factor)
      for(var i = 0; i < this_path.length; i++)
      {
          ctx.lineTo(this_path[i].x*draw_factor, this_path[i].y*draw_factor)
      }
      ctx.stroke()
      ctx.lineWidth = 1
    }
  }

  draw_interface()
}

function draw_interface() {
  ctx.beginPath()
  ctx.font = '15px Century Gothic'
  ctx.fillColor = 'black'
  ctx.textAlign = 'left'
  game_numbers.seconds = Math.round(((new Date()).getTime() - game_numbers.game_start)/1000)
  var a =  game_numbers.seconds % 60
  a = a < 10 ? "0"+a : a
  game_numbers.last_time = Math.floor( game_numbers.seconds/60)+":"+a

  ctx.fillText(game_numbers.last_time, 5, canvasHeight - 5)
  ctx.textAlign = 'right'
  ctx.fillText("KILLS: "+game_numbers.kills, canvasWidth - 5, canvasHeight - 5)

  if(fps_counter == null)
  {
    last_time = (new Date()).getTime()
    fps_counter = 0
    fps = "???"
  }
  else if(fps_counter == 100)
  {
    fps_counter = 0
    var a = (new Date()).getTime()
    console.log(a+" "+last_time+" "+(a-last_time))
    fps = Math.round(100000/(a-last_time))
    last_time = (new Date()).getTime()
  }
  fps_counter+=1
  ctx.beginPath()
  ctx.font = '10px sans-serif'
  ctx.fillText("FPS: "+fps, canvasWidth - 5, 10)
  ctx.fill()

}

function step() {
    processGame();
    world.Step(1.0/60, 1, 10, 10);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	  draw();
    if(game_state==2)
    	step_id = setTimeout('step()', 20);
}

function draw() {
  
  switch(game_state) {
    case 0: //start screen
      clearTimeout(step_id)
      ctx.beginPath()
      ctx.font = '30px Century Gothic'
      ctx.fillStyle = 'black'
      ctx.textAlign = 'center'
      ctx.fillText("IMPULSE", canvasWidth/2, canvasHeight/2)
      ctx.font = '20px Century Gothic'
      ctx.fillText("CLICK TO BEGIN", canvasWidth/2, canvasHeight/2+50)
      ctx.fill()
      break
    case 1:
      clearTimeout(step_id)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath()
      ctx.fillStyle = 'red'
      ctx.font = '30px Century Gothic'
      ctx.textAlign = 'center'

      ctx.fillText("GAME OVER", canvasWidth/2, canvasHeight/2-25)
      ctx.fill()
      ctx.beginPath()
      ctx.font = '20px Century Gothic'
      ctx.fillStyle = 'black'
      ctx.fillText("KILLS: "+game_numbers.kills, canvasWidth/2, canvasHeight/2+25)
      ctx.fillText("SURVIVED FOR "+game_numbers.last_time, canvasWidth/2, canvasHeight/2+50)

      ctx.fillText("CLICK TO PLAY AGAIN", canvasWidth/2, canvasHeight/2+100)
      ctx.fill()
      break
    case 2:
      drawWorld()
      break
  }

}



function getWindowDimensions() {
  var winW = 800, winH = 600;
  if (document.body && document.body.offsetWidth) {
   winW = document.body.offsetWidth;
   winH = document.body.offsetHeight;
  }
  if (document.compatMode=='CSS1Compat' &&
      document.documentElement &&
      document.documentElement.offsetWidth ) {
   winW = document.documentElement.offsetWidth;
   winH = document.documentElement.offsetHeight;
  }
  if (window.innerWidth && window.innerHeight) {
   winW = window.innerWidth;
   winH = window.innerHeight;
  }

  return {w: winW, h: winH}
}

function onKeyDown(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;
  switch(game_state)
  {
    case 2:
      player.keyDown(keyCode)
      break
  }
    
}

function onKeyUp(event) {
    var keyCode = event==null? window.event.keyCode : event.keyCode;
    switch(game_state)
    {
      case 2:
        player.keyUp(keyCode)
        break
    }

}

function onMouseMove(event) {
  var mPos = getCursorPosition(event)
  switch(game_state)
  {
    case 2:
      player.mouseMove(mPos)
      break
  }
}

function onClick(event) {
  var mPos = getCursorPosition(event)
  switch(game_state)
  {
    case 0:
      game_state = 2
      setupWorld()
      step()
      break
    case 1:
      game_state = 2
      setupWorld()
      step()
      break

    case 2:
      player.click(mPos, enemies)
      break

  }
    
}

function processGame() {
  dead_enemies = []
  player.process(obstacle_polygons)
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].process(i)
  }
  while(dead_enemies.length > 0)
  {
    var dead_i = dead_enemies.pop()
    game_numbers.kills +=1
    world.DestroyBody(enemies[dead_i].body)
    enemies.splice(dead_i, 1)
  }
  adjust_difficulty()
  generate_enemies()
}

function adjust_difficulty() {
  game_numbers.max_enemies = [1, 1, 1, 1]
  return
//adjust difficult depending on time
  var seconds = game_numbers.seconds
  game_numbers.max_enemies = [Math.min(Math.floor(seconds/2), 20), 1, 1, 1]

}

function generate_enemies() {
  if(enemies.length > game_numbers.max_enemies[0])
  {
    return
  }
  while(enemies.length < .2 * game_numbers.max_enemies[0])
  {
    generate_enemy()
  }
  if(Math.random() < .1)
  {
    generate_enemy()
  }

  
}

function generate_enemy() {
  var r_p = getRandomOutsideLocation(5, 2)

  enemies.push(new BasicEnemy(world, r_p.x, r_p.y, enemy_counter))
  enemy_counter+=1
}

//gets random point that is not inside a boundary polygon
function getRandomValidLocation(testPoint) {
  var r_point = {x:Math.random()*(canvasWidth/draw_factor-2*buffer_radius)+buffer_radius, y: Math.random()*(canvasHeight/draw_factor-2*buffer_radius)+buffer_radius}
  var inPoly = false
  for(var k = 0; k < boundary_polygons.length; k++)
  {
    if(i != k && pointInPolygon(boundary_polygons[k], r_point))
    {
      inPoly = true
    }
  }
  if(inPoly)
  {
    return getRandomValidLocation(testPoint)
  }
  if(visibility_graph.query(r_point, testPoint, boundary_polygons)==null)
  {
    return getRandomValidLocation(testPoint)
  }
  return r_point


}

function getRandomOutsideLocation(buffer, range) {
  var x_anchor, y_anchor
  if(Math.random() < .5)
  {
    x_anchor = Math.random() < .5 ? -buffer-range : canvasWidth/draw_factor + buffer
    y_anchor = Math.random() * (canvasHeight/draw_factor + 2 * buffer + range) - (buffer + range)
  }
  else
  {
    y_anchor = Math.random() < .5 ? -buffer-range : canvasHeight/draw_factor + buffer
    x_anchor = Math.random() * (canvasWidth/draw_factor + 2 * buffer + range) - (buffer + range)
  }


  //buffer is border outside screen which is not okay, range is range of values beyond that which ARE okay
  var r_point = {x: x_anchor + Math.random() * range, y: y_anchor + Math.random() * range }
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
    x -= offset_left;
    y -= offset_top;
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

function getObjectsWithinRadius(pt, r, objects, getLocation)
{
  var ans = []
  for(var i = 0; i < objects.length; i++)
  {
    var loc = getLocation(objects[i])
    if (p_dist(pt, loc)<r)
    {
      ans.push(objects[i])
    } 
  }
  return ans




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
