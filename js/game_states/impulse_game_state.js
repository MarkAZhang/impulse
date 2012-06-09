ImpulseGameState.prototype = new GameState

ImpulseGameState.prototype.constructor = ImpulseGameState

function ImpulseGameState(ctx, level_name) {
  this.pause = true
  this.ready = false
  this.buttons = []
  this.draw_factor = 15
  this.game_numbers = {score: 0, combo: 1, base_combo: 1, seconds: 0, kills: 0, game_length: 0, last_time: null}
  this.last_fps_time = 0
  this.fps_counter = null
  this.fps = 0
  this.score_labels = []
  this.score_label_duration = 1000
  this.score_label_rise = 30
  this.score_label_font = '20px Century Gothic'
  this.buffer_radius = 1 //primarily for starting player location

  this.loading_screen()
  setTimeout(function(this_state, level_name){ return function(){this_state.setup_world_next(level_name)}}(this, level_name), 5)

}


ImpulseGameState.prototype.loading_screen = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath()
  ctx.font = '30px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("LOADING", canvasWidth/2, canvasHeight/2)
  ctx.fill()
}

ImpulseGameState.prototype.process = function(dt) {
  if(!this.ready) return
  if(!this.pause)
  {
    this.player.process(dt)
    this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
    
    this.game_numbers.game_length += dt
    this.level.process(dt)
    for(var i = 0; i < this.score_labels.length; i++) {
      this.score_labels[i].duration -= dt
    }
    while(this.score_labels[0] && this.score_labels[0].duration <= 0)
    {
      this.score_labels = this.score_labels.slice(1)
    }
    this.world.Step(1.0/60, 1, 10, 10);
  }
}

ImpulseGameState.prototype.draw = function(ctx) {
  if(!this.ready) return
  this.level.draw(ctx, this.draw_factor)
  this.player.draw(ctx)
  
  /*
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
  }*/

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
  }*/
 
  /*for(var j = 0; j < Math.min(this.level.enemies.length, 10); j++)
  {
    if(this.level.enemies[j])
    {
      var this_path = this.level.enemies[j].path
      if(this_path)
      {

        ctx.beginPath()
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3
        ctx.moveTo(this.level.enemies[j].body.GetPosition().x*this.draw_factor, this.level.enemies[j].body.GetPosition().y*this.draw_factor)
        for(var i = 0; i < this_path.length; i++)
        {
            ctx.lineTo(this_path[i].x*this.draw_factor, this_path[i].y*this.draw_factor)
        }
        ctx.stroke()
        ctx.lineWidth = 1
      }
    }
  }*/

  this.draw_interface(ctx)
}

ImpulseGameState.prototype.draw_interface = function(ctx) {
  ctx.beginPath()
  ctx.font = '25px Century Gothic'
  ctx.textAlign = 'left'
  this.game_numbers.seconds = Math.round(this.game_numbers.game_length/1000)
  var a =  this.game_numbers.seconds % 60
  a = a < 10 ? "0"+a : a
  this.game_numbers.last_time = Math.floor(this.game_numbers.seconds/60)+":"+a
  ctx.fillStyle = 'black'
  ctx.fillText(this.game_numbers.last_time, 5, canvasHeight - 5)
  ctx.textAlign = 'right'
  ctx.fillText(this.game_numbers.score, canvasWidth - 5, canvasHeight - 5)
  ctx.textAlign = 'center'
  ctx.fillText("x"+this.game_numbers.combo, canvasWidth/2, canvasHeight - 5)

  ctx.textAlign = 'right'
  if(this.fps_counter == null)
  {
    this.last_fps_time = (new Date()).getTime()
    this.fps_counter = 0
    this.fps = "???"
  }
  else if(this.fps_counter == 100)
  {
    this.fps_counter = 0
    var a = (new Date()).getTime()
    this.fps = Math.round(100000/(a-this.last_fps_time))
    this.last_fps_time = (new Date()).getTime()
  }
  this.fps_counter+=1
  ctx.beginPath()
  ctx.font = '10px sans-serif'
  ctx.fillText("FPS: "+this.fps, canvasWidth - 5, 10)
  ctx.fill()

  for(var i = 0; i < this.score_labels.length; i++)
  {
    ctx.beginPath()
    ctx.font = this.score_label_font
    var prog = this.score_labels[i].duration / this.score_label_duration
    ctx.globalAlpha = prog
    ctx.fillStyle = this.score_labels[i].color
    ctx.fillText(this.score_labels[i].text, this.score_labels[i].x * this.draw_factor, this.score_labels[i].y * this.draw_factor - (1 - prog) * this.score_label_rise)
    ctx.fill()
  }
  ctx.globalAlpha = 1

}

ImpulseGameState.prototype.on_mouse_move = function(x, y) {
  if(!this.ready) return
  if(!this.pause)
    this.player.mouseMove({x: x, y: y})
}

ImpulseGameState.prototype.on_click = function(x, y) {
  if(!this.ready) return
  if(!this.pause)
    this.player.click({x: x, y: y}, this.level.enemies)
  
}

ImpulseGameState.prototype.on_key_down = function(keyCode) {
  if(!this.ready) return
  if(keyCode == 32)
    this.pause = !this.pause
  else
    this.player.keyDown(keyCode)  //even if paused, must still process
}

ImpulseGameState.prototype.on_key_up = function(keyCode) {
  if(!this.ready) return
  this.player.keyUp(keyCode)
}

ImpulseGameState.prototype.setup_world_next = function(level_name) {
  var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  this.world = new b2World(gravity, doSleep); 
    
  //add walls
  this.addWalls()

  this.level = new Level(impulse_level_data[level_name], this)
    
  this.generate_level()
  var r_p = getRandomValidLocation({x: -10, y: -10}, this.buffer_radius, this.draw_factor)
  this.player = new Player(this.world, r_p.x, r_p.y, this)
  var contactListener = new b2ContactListener;
  contactListener.PreSolve = this.handle_collisions
  this.world.SetContactListener(contactListener);
  this.pause = false
  this.ready = true
}

ImpulseGameState.prototype.addWalls = function() {
  var wall_dim = [{x: canvasWidth/this.draw_factor/2, y: 2},
      {x: canvasWidth/this.draw_factor/2, y: 2},
      {x: 2, y: canvasHeight/draw_factor/2},
      {x: 2, y: canvasHeight/draw_factor/2}]
  
  var wall_pos = [{x: canvasWidth/this.draw_factor/2, y: -2},
      {x: canvasWidth/this.draw_factor/2, y: canvasHeight/this.draw_factor+2},
      {x: -2, y: canvasHeight/this.draw_factor/2},
      {x: canvasWidth/this.draw_factor+2, y: canvasHeight/this.draw_factor/2}]
  
  for(var i = 0; i < 4; i++) {
    var fixDef = new b2FixtureDef;
    fixDef.filter.categoryBits = 0x0001
    fixDef.filter.maskBits = 0x0002
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape
    fixDef.shape.SetAsBox(wall_dim[i].x, wall_dim[i].y)
    bodyDef.position.Set(wall_pos[i].x, wall_pos[i].y)
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
  }
}

ImpulseGameState.prototype.generate_level = function() {
  this.level.generate_obstacles()
  this.visibility_graph = new VisibilityGraph(this.level.boundary_polygons, this.level)

}

ImpulseGameState.prototype.handle_collisions = function(contact) {
  var first = contact.GetFixtureA().GetUserData()
  var second = contact.GetFixtureB().GetUserData()

  if(!first || !second) return

  first.collide_with(second)
  second.collide_with(first)

}

ImpulseGameState.prototype.addScoreLabel = function(str, color, x, y) {
  var temp_score_label = {text: str, color: color, x: x, y: y, duration: this.score_label_duration}
  this.score_labels.push(temp_score_label)
}

ImpulseGameState.prototype.increment_combo = function() {
  this.game_numbers.base_combo += 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}

ImpulseGameState.prototype.reset_combo = function() {
  this.game_numbers.base_combo = 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}
