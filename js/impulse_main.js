var ctx;
var world;
var canvasWidth, canvasHeight;
var player;
var draw_factor = 15;
var enemies = [];
var num_enemies = 0
var pointToPlayer; //function for enemies to process
var polygons = []
var visibility_graph;
var this_path = null
var last_time = 0
var dt = 0
var last_fps_time = 0
var fps_counter = null
var fps = 0
var game_state
var step_id;
var dead_enemies = [];
var spawned_enemies = [];
var other_polygon;

var buffer_radius = 1;  //radius around obstacles and around outer wall
var enemy_counter; //give each enemy an ID
var offset_left, offset_top
var game_numbers = {score: 0, combo: 1, base_combo: 1, seconds: 0, kills: 0, game_length: 0}
var start_clicked
var buttons = []
var pause = true
var level;
var score_labels = []
var score_label_duration = 1000
var score_label_rise = 30
var score_label_font = '20px Century Gothic'


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
    , b2ContactListener = Box2D.Dynamics.b2ContactListener
    
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
    else
    {
      offset_left = 0
    }
    if(canvasHeight < dim.h)
    {
      offset_top = (dim.h-canvasHeight)/2
      canvas_container.style.top = Math.round(offset_top) + 'px'
    }
    else
    {
      offset_top = 0
    }

      
    //canvas.addEventListener("click", onClick, false);

    game_state = 0
    start_clicked = false
    step()

    
});

function loadingScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath()
  ctx.font = '30px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("LOADING", canvasWidth/2, canvasHeight/2)
  ctx.fill()
}

function setupWorld() {
    pause = true
    loadingScreen()
    setTimeout('setupWorld_next()', 5)
    
}

function setupWorld_next() {
  enemy_counter = 0
    enemies = []
    buttons = []
    game_numbers.score = 0
    game_numbers.kills = 0
    game_numbers.seconds = 0
    game_numbers.base_combo = 1
    num_enemies = 0

    var gravity = new b2Vec2(000, 000);
    var doSleep = false; //objects in our world will rarely go to sleep
    world = new b2World(gravity, doSleep); 
    
    //add walls
    addWalls()

    level = new Level(1)
    
    generate_level()
    var r_p = getRandomValidLocation({x: -10, y: -10})
    player = new Player(world, r_p.x, r_p.y, draw_factor)
    game_numbers.game_length = 0
    game_numbers.last_time = null
    pause = false
    game_state = 2

    var contactListener = new b2ContactListener;
    contactListener.PreSolve = handle_collisions
    world.SetContactListener(contactListener);
    last_time = (new Date()).getTime()
}

function handle_collisions(contact) {
  var first = contact.GetFixtureA().GetUserData()
  var second = contact.GetFixtureB().GetUserData()

  if(!first || !second) return

  first.collide_with(second)
  second.collide_with(first)

  if(first === player)
  {
    var _player = first
    var _other = second
  }
  else if(second === player)
  {
    var _player = second
    var _other = first
  }
  else
  {
    return
  }
  if(_other)
    _other.collide_with(_player)
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
  
  
  level.generate_obstacles()
  visibility_graph = new VisibilityGraph(level.boundary_polygons)
  
}



function drawWorld() {
  
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].pre_draw(ctx, draw_factor)
  }
  level.draw(ctx)
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

  /*for(var i = 0; i < obstacle_edges.length; i++)
  {
      ctx.beginPath()
      ctx.lineWidth = 3
    	ctx.strokeStyle = 'brown';
      ctx.moveTo(obstacle_edges[i].p1.x*draw_factor, obstacle_edges[i].p1.y*draw_factor)
      ctx.lineTo(obstacle_edges[i].p2.x*draw_factor, obstacle_edges[i].p2.y*draw_factor)
    	ctx.stroke()
  }*/

  /*for({
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
  */
  for(var j = 0; j < Math.min(enemies.length, 10); j++)
  {
    if(enemies[j])
    {
      this_path = enemies[j].path
      if(this_path)
      {

        ctx.beginPath()
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3
        ctx.moveTo(enemies[j].body.GetPosition().x*draw_factor, enemies[j].body.GetPosition().y*draw_factor)
        for(var i = 0; i < this_path.length; i++)
        {
            ctx.lineTo(this_path[i].x*draw_factor, this_path[i].y*draw_factor)
        }
        ctx.stroke()
        ctx.lineWidth = 1
      }
    }
  }

  draw_interface()
}

function draw_interface() {
  ctx.beginPath()
  ctx.font = '25px Century Gothic'
  ctx.textAlign = 'left'
  game_numbers.seconds = Math.round(game_numbers.game_length/1000)
  var a =  game_numbers.seconds % 60
  a = a < 10 ? "0"+a : a
  game_numbers.last_time = Math.floor( game_numbers.seconds/60)+":"+a
  ctx.fillStyle = 'black'
  ctx.fillText(game_numbers.last_time, 5, canvasHeight - 5)
  ctx.textAlign = 'right'
  ctx.fillText(game_numbers.score, canvasWidth - 5, canvasHeight - 5)
  ctx.textAlign = 'center'
  ctx.fillText("x"+game_numbers.combo, canvasWidth/2, canvasHeight - 5)

  //ctx.fillText("KILLS: "+game_numbers.kills, canvasWidth - 5, canvasHeight - 5)

  ctx.textAlign = 'right'
  if(fps_counter == null)
  {
    last_fps_time = (new Date()).getTime()
    fps_counter = 0
    fps = "???"
  }
  else if(fps_counter == 100)
  {
    fps_counter = 0
    var a = (new Date()).getTime()
    fps = Math.round(100000/(a-last_fps_time))
    last_fps_time = (new Date()).getTime()
  }
  fps_counter+=1
  ctx.beginPath()
  ctx.font = '10px sans-serif'
  ctx.fillText("FPS: "+fps, canvasWidth - 5, 10)
  ctx.fill()

  for(var i = 0; i < score_labels.length; i++)
  {
    ctx.beginPath()
    ctx.font = score_label_font
    var prog = score_labels[i].duration / score_label_duration
    ctx.globalAlpha = prog
    ctx.fillStyle = score_labels[i].color
    ctx.fillText(score_labels[i].text, score_labels[i].x * draw_factor, score_labels[i].y * draw_factor - (1 - prog) * score_label_rise)
    ctx.fill()
  }
  ctx.globalAlpha = 1

}

function step() {
  var cur_time = (new Date()).getTime()
  dt = cur_time - last_time
  if(game_state==2 && !pause)
  {
    processGame();
    world.Step(1.0/60, 1, 10, 10);
  }
	draw();
  last_time = (new Date()).getTime()
  step_id = setTimeout('step()', 20);

}

function processGame() {
  if(!pause)
  {
    check_win()
    dead_enemies = []
    spawned_enemies = []
    player.process(dt)
    game_numbers.combo = game_numbers.base_combo + Math.floor(game_numbers.seconds/10)
    for(var i = 0; i < enemies.length; i++) {
      enemies[i].process(i, dt)
    }
    while(dead_enemies.length > 0)
    {
      var dead_i = dead_enemies.pop()
      if(enemies[dead_i] instanceof Goo || enemies[dead_i] instanceof Disarmer || enemies[dead_i] instanceof Crippler) {
        level.trail_enemies_num -= 1
      }
      if(! (enemies[dead_i] instanceof FighterBullet)) {
        num_enemies -= 1
      }
      
      world.DestroyBody(enemies[dead_i].body)
      enemies.splice(dead_i, 1)
      console.log("REMOVED ENEMY " + " " + num_enemies)
      console.log(enemies)
      
    }
    for(var i = 0; i < spawned_enemies.length; i++) {
      enemies.push(spawned_enemies[i])
      if(! (spawned_enemies[i] instanceof FighterBullet)) {
        num_enemies += 1
      }
      console.log("PUSHED SPAWN " + num_enemies)
      console.log(enemies)
    }
    if(!level.has_won(game_numbers))
    {
      generate_enemies()
    }
    game_numbers.game_length += dt
    level.process(dt)
    for(var i = 0; i < score_labels.length; i++) {
      score_labels[i].duration -= dt
    }
    while(score_labels[0] && score_labels[0].duration <= 0)
    {
      score_labels = score_labels.slice(1)
    }


  }
}

function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch(game_state) {
    case 0: //start screen
      ctx.beginPath()
      ctx.font = '30px Century Gothic'
      ctx.fillStyle = 'black'
      ctx.textAlign = 'center'
      ctx.fillText("IMPULSE", canvasWidth/2, canvasHeight/2)
      
      if(start_clicked)
      {
        for(var i = 0; i < buttons.length; i++)
        {
          buttons[i].draw(ctx)
        }
        
      }
      else
      {
        ctx.font = '20px Century Gothic'
        ctx.fillText("CLICK TO BEGIN", canvasWidth/2, canvasHeight/2+150)
        ctx.fill()
      }
      break
    case 1://death screen
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
      ctx.fillText("SURVIVED FOR "+game_numbers.last_time, canvasWidth/2, canvasHeight/2+60)
      ctx.fillText("SCORE: "+game_numbers.score, canvasWidth/2, canvasHeight/2+95)

      for(var i = 0; i < buttons.length; i++)
        {
          buttons[i].draw(ctx)
        }
      ctx.fill()
      break
    case 2:
      drawWorld()
      break
    case 3:
      loadingScreen()
      break
    case 4: //win screen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath()
      ctx.fillStyle = 'blue'
      ctx.font = '30px Century Gothic'
      ctx.textAlign = 'center'

      ctx.fillText("LEVEL COMPLETE", canvasWidth/2, canvasHeight/2-25)
      ctx.fill()
      ctx.beginPath()
      ctx.font = '20px Century Gothic'
      ctx.fillStyle = 'black'
      ctx.fillText("KILLS: "+game_numbers.kills, canvasWidth/2, canvasHeight/2+25)
      ctx.fillText("TIME: "+game_numbers.last_time, canvasWidth/2, canvasHeight/2+50)
      for(var i = 0; i < buttons.length; i++)
        {
          buttons[i].draw(ctx)
        }
      ctx.fill()
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
  if(keyCode == 32)//pause
  {
    pause = !pause 
  }
  switch(game_state)
  {
    case 2:
      player.keyDown(keyCode)
      break
  }
    
}

function onKeyUp(event) {
    var keyCode = event==null? window.event.keyCode : event.keyCode;
   //

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
    case 0:
    case 1:
    case 4:
      for(var i = 0; i < buttons.length; i++)
      {
        buttons[i].onMouseMove(mPos.x, mPos.y)
      }
      break
    case 2:
      if(!pause)
        player.mouseMove(mPos)
      break
  }
}

function onClick(event) {
  var mPos = getCursorPosition(event)
  switch(game_state)
  {
    case 0:
      if(!start_clicked)
      {
        start_clicked = true
        setupMainMenu()
        

      }  
      else
      {
        for(var i = 0; i < buttons.length; i++)
        {
          buttons[i].onClick(mPos.x, mPos.y)
        }
      }
      break
    case 1:
    case 4:
      for(var i = 0; i < buttons.length; i++)
        {
          buttons[i].onClick(mPos.x, mPos.y)
        }
      break

    case 2:
      if(!pause)
      {
        player.click(mPos, enemies)
      }
      break

  }
    
}

function setupMainMenu() {
  buttons = []
  buttons.push(new ImpulseButton("ARENA", 20, canvasWidth/2, canvasHeight/2+70, 200, 50, function(){}))
  buttons.push(new ImpulseButton("SURVIVAL", 20, canvasWidth/2, canvasHeight/2+120, 200, 50, function(){game_state = 3; setupWorld();}))
  buttons.push(new ImpulseButton("ENEMIES", 20, canvasWidth/2, canvasHeight/2+170, 200, 50, function(){}))
  buttons.push(new ImpulseButton("CREDITS", 20, canvasWidth/2, canvasHeight/2+220, 200, 50, function(){}))
  buttons[0].setActive(false)
  buttons[2].setActive(false)
  buttons[3].setActive(false)
}



function check_win() {
 if(level.has_won(game_numbers) && enemies.length == 0) {//all enemies are dead
    game_won()
  } 

}

function game_won() {
  game_state = 4
  buttons = []
  buttons.push(new ImpulseButton("CLICK TO PLAY AGAIN", 20, canvasWidth/2, canvasHeight/2+160, 300, 50, function(){game_state = 3; setupWorld();}))
  buttons.push(new ImpulseButton("RETURN TO MAIN MENU", 20, canvasWidth/2, canvasHeight/2+210, 200, 50, function(){game_state = 0; start_clicked = true; setupMainMenu();}))
    
}

function generate_enemies() {
  if(num_enemies >= level.getEnemyCap(game_numbers.seconds))
  {
    return
  }
  if(Math.random() < level.getSpawnRate(game_numbers.seconds))
  {
    generate_enemy(level.getRandomEnemy(game_numbers.seconds))
    num_enemies += 1
    console.log("ADDED ENEMY " +  " " + num_enemies)
    console.log(enemies)
  }

  
}

function generate_enemy(enemy_type) {
  var r_p = getRandomOutsideLocation(5, 2)
  
  switch(enemy_type) {
    case 0:
      enemies.push(new Stunner(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break
    case 1:
      enemies.push(new Spear(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break
    case 2:
      enemies.push(new Tank(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break
    case 3:
      enemies.push(new Feather(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break
    case 4:
      enemies.push(new Goo(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
      level.trail_enemies_num +=1
    break
    case 5:
      enemies.push(new Disarmer(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
      level.trail_enemies_num +=1
    break
    case 6:
      enemies.push(new Crippler(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
      level.trail_enemies_num +=1
    break
    case 7:
      enemies.push(new Wisp(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break
    case 8:
      enemies.push(new Fighter(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break
    case 9:
      enemies.push(new DeathRay(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break
    case 10:
      enemies.push(new Slingshot(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break
    case 11:
      enemies.push(new Harpoon(world, r_p.x, r_p.y, enemy_counter))
      enemy_counter+=1
    break

  }
}

function increment_combo() {
  game_numbers.base_combo += 1
  game_numbers.combo = game_numbers.base_combo + Math.floor(game_numbers.seconds/10)
}

function reset_combo() {
  game_numbers.base_combo = 1
  game_numbers.combo = game_numbers.base_combo + Math.floor(game_numbers.seconds/10)
}

//gets random point that is not inside a boundary polygon
function getRandomValidLocation(testPoint) {
  var r_point = {x:Math.random()*(canvasWidth/draw_factor-2*buffer_radius)+buffer_radius, y: Math.random()*(canvasHeight/draw_factor-2*buffer_radius)+buffer_radius}
  var inPoly = false
  for(var k = 0; k < level.boundary_polygons.length; k++)
  {
    if(i != k && pointInPolygon(level.boundary_polygons[k], r_point))
    {
      inPoly = true
    }
  }
  if(inPoly)
  {
    return getRandomValidLocation(testPoint)
  }
  if(visibility_graph.query(r_point, testPoint, level.boundary_polygons)==null)
  {
    return getRandomValidLocation(testPoint)
  }
  return r_point
}

//gets random point that is not inside a boundary polygon
function getRandomCentralValidLocation(testPoint) {
  var r_point = {x:Math.random()*(canvasWidth/2/draw_factor)+canvasWidth/4/draw_factor, y: Math.random()*(canvasHeight/2/draw_factor)+canvasHeight/4/draw_factor}
  var inPoly = false
  for(var k = 0; k < level.boundary_polygons.length; k++)
  {
    if(i != k && pointInPolygon(level.boundary_polygons[k], r_point))
    {
      inPoly = true
    }
  }
  if(inPoly)
  {
    return getRandomCentralValidLocation(testPoint)
  }
  if(visibility_graph.query(r_point, testPoint, level.boundary_polygons)==null)
  {
    return getRandomCentralValidLocation(testPoint)
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
  buttons = []
  buttons.push(new ImpulseButton("CLICK TO PLAY AGAIN", 20, canvasWidth/2, canvasHeight/2+160, 300, 50, function(){game_state = 3; setupWorld();}))
  buttons.push(new ImpulseButton("RETURN TO MAIN MENU", 20, canvasWidth/2, canvasHeight/2+210, 200, 50, function(){game_state = 0; start_clicked = true; setupMainMenu();}))
  
}

function addScoreLabel(str, color, x, y) {
  var temp_score_label = {text: str, color: color, x: x, y: y, duration: score_label_duration}
  score_labels.push(temp_score_label)
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
    return angle
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

function getBoundaryPolygonOld(polygon, radius) {

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

function getBoundaryPolygon(polygon, radius) {
  var j = polygon.length - 1
  var ans = []
  for(var i = 0; i < polygon.length; i++)
  {
    var k = (i+1)%polygon.length
    var j_to_i_normal = new b2Vec2(polygon[i].y - polygon[j].y, polygon[j].x - polygon[i].x)
    var j_to_i = new b2Vec2(polygon[i].x - polygon[j].x, polygon[i].y - polygon[j].y)
    var k_to_i_normal = new b2Vec2(polygon[k].y - polygon[i].y, polygon[i].x - polygon[k].x)
    var k_to_i = new b2Vec2(polygon[i].x - polygon[k].x, polygon[i].y - polygon[k].y)
    j_to_i_normal.Normalize()
    k_to_i_normal.Normalize()
    j_to_i.Normalize()
    k_to_i.Normalize()
    var first_angle = _atan({x: 0, y: 0}, k_to_i_normal)
    var second_angle = _atan({x: 0, y: 0}, j_to_i_normal)
    var cur_angle = first_angle - second_angle
    cur_angle = cur_angle < 0? cur_angle+Math.PI * 2 : cur_angle
    cur_angle = cur_angle >= 2 * Math.PI ? cur_angle - Math.PI * 2 : cur_angle
    if(cur_angle > Math.PI/2)
    {
      ans.push({x: polygon[i].x+j_to_i_normal.x*radius+j_to_i.x*radius, y: polygon[i].y + j_to_i_normal.y*radius + j_to_i.y * radius})
      ans.push({x: polygon[i].x+k_to_i_normal.x*radius+k_to_i.x*radius, y: polygon[i].y + k_to_i_normal.y*radius + k_to_i.y * radius})
    }
    else
    {
      ans.push({x: polygon[i].x+j_to_i_normal.x*radius+j_to_i.x*Math.tan(cur_angle/2)*radius, y: polygon[i].y + j_to_i_normal.y*radius + j_to_i.y *Math.tan(cur_angle/2)* radius})
      
    }


    /*ans.push({x: polygon[j].x+j_to_i_normal.x*radius, y: polygon[j].y + j_to_i_normal.y*radius})
    ans.push({x: polygon[i].x+j_to_i_normal.x*radius, y: polygon[i].y + j_to_i_normal.y*radius})
    var sum = new b2Vec2(j_to_i_normal.x + k_to_i_normal.x, j_to_i_normal.y + k_to_i_normal.y)
    sum.Normalize()
    ans.push({x: polygon[i].x+sum.x * radius, y: polygon[i].y+sum.y * radius})
    */j = i
  }
  return ans 
}
