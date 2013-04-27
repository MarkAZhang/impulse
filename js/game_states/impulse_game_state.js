ImpulseGameState.prototype = new GameState

ImpulseGameState.prototype.constructor = ImpulseGameState

function ImpulseGameState(world, level, visibility_graph) {
  this.pause = true
  this.ready = false
  this.buttons = []
  this.draw_factor = draw_factor
  this.game_numbers = {score: 0, combo: 1, base_combo: 1, seconds: 0, kills: 0, game_length: 0, last_time: null}
  this.last_fps_time = 0
  this.fps_counter = null
  this.fps = 0
  this.score_labels = []
  this.score_label_duration = 1000
  this.score_label_rise = 30
  this.buffer_radius = 1 //primarily for starting player location
  this.bg_drawn = false

  this.stars = 0
  this.world_num = world
  this.cutoff_messages = ["BRONZE SCORE ACHIEVED", "SILVER SCORE ACHIEVED", "GOLD SCORE ACHIEVED"]
  this.score_goal_messages = ["BRONZE: ", "SILVER: ", "GOLD: "]
  this.star_colors =  ["bronze", "silver", "gold"]

  this.progress_bar_prop = 0
  this.progress_bar_adjust = 3000
  this.level = level
  this.level.reset() //we re-use the level
  this.level_name = this.level.level_name
  this.level.impulse_game_state = this
  this.visibility_graph = visibility_graph

  var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  this.world = new b2World(gravity, doSleep);

  //add walls
  this.addWalls()

  if(this.level.player_loc) {
    this.player = new Player(this.world, this.level.player_loc.x/draw_factor, this.level.player_loc.y/draw_factor, this)
  }
  else {
    var r_p = getRandomValidLocation({x: -10, y: -10}, this.buffer_radius, this.draw_factor)
    this.player = new Player(this.world, r_p.x, r_p.y, this)
  }
  var contactListener = new b2ContactListener;
  contactListener.BeginContact = this.handle_collisions
  this.world.SetContactListener(contactListener);
  this.pause = false
  this.ready = true

  this.world_visible = true

  this.world_visibility = 1

  if(this.level_name == "BOSS 4") {
    impulse_bg_music.play(imp_var.songs["Final Tessellation"])
  }
  else if(this.level_name.slice(0, 4) == "BOSS")
    impulse_bg_music.play(imp_var.songs["Tessellation"])
  else
    impulse_bg_music.play(imp_var.songs["Hive "+this.world_num])

}


ImpulseGameState.prototype.loading_screen = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath()
  ctx.font = '30px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("LOADING", canvasWidth/2, (canvasHeight - topbarHeight)/2)
  ctx.fill()
}

ImpulseGameState.prototype.process = function(dt) {
  if(!this.ready) return
  if(!this.pause)
  {
    var temp_stars = this.stars < 3 ? this.stars : 2
    var prop = Math.min(this.game_numbers.score/this.level.cutoff_scores[temp_stars], 1)
    if(this.progress_bar_prop > prop) {
      this.progress_bar_prop  = Math.max(this.progress_bar_prop - dt/this.progress_bar_adjust, prop)

    }
    else if(this.progress_bar_prop < prop) {
      this.progress_bar_prop  = Math.min(this.progress_bar_prop + dt/this.progress_bar_adjust, prop)
    }


    if(this.world_visible && this.world_visibility < 1)
    {
      this.world_visibility = Math.min(1, this.world_visibility + dt/1000)
    }
    else if(!this.world_visible && this.world_visibility > 0)
    {
      this.world_visibility = Math.max(0, this.world_visibility - dt/1000)
    }
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

ImpulseGameState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.ready) return

  if(!this.bg_drawn) {
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    var imageObj = new Image();

        /*imageObj.onload = function() {
          bg_ctx.drawImage(imageObj, 0, topbarHeight, canvas.width, canvas.height - topbarHeight);
        };
        imageObj.src = "art/bg_temp.jpg";*/

    this.bg_drawn = true
  }


  ctx.translate(0, topbarHeight)//allows us to have a topbar

  this.level.draw(ctx, this.draw_factor)

  if(this.world_visibility < 1) {
    ctx.globalAlpha = 1 - this.world_visibility
    ctx.fillStyle = "white"
    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.fill()
  }

  this.player.draw(ctx)

  ctx.translate(0, -topbarHeight)
  this.draw_interface(ctx)

  /*for(var i = 0; i < this.visibility_graph.vertices.length; i++)
  {
      ctx.beginPath()
    	ctx.fillStyle = 'green';
    	ctx.arc(this.visibility_graph.vertices[i].x*this.draw_factor, this.visibility_graph.vertices[i].y*this.draw_factor, 2, 0, 2*Math.PI, true)
      ctx.font = 'italic 10px sans-serif'
      ctx.fillText(i, this.visibility_graph.vertices[i].x*this.draw_factor, this.visibility_graph.vertices[i].y*this.draw_factor)
    	ctx.fill()
  }

  for(var i = 0; i < this.visibility_graph.poly_edges.length; i++)
  {
      ctx.beginPath()
      ctx.lineWidth = 1
    	ctx.strokeStyle = 'green';
      ctx.moveTo(this.visibility_graph.poly_edges[i].p1.x*draw_factor, this.visibility_graph.poly_edges[i].p1.y*draw_factor)
      ctx.lineTo(this.visibility_graph.poly_edges[i].p2.x*draw_factor, this.visibility_graph.poly_edges[i].p2.y*draw_factor)
    	ctx.stroke()
  }

  /*for(var i = 0; i < this.level.obstacle_edges.length; i++)
  {
      ctx.beginPath()
      ctx.lineWidth = 3
    	ctx.strokeStyle = 'brown';
      ctx.moveTo(this.level.obstacle_edges[i].p1.x*this.draw_factor, this.level.obstacle_edges[i].p1.y*this.draw_factor)
      ctx.lineTo(this.level.obstacle_edges[i].p2.x*this.draw_factor, this.level.obstacle_edges[i].p2.y*this.draw_factor)
    	ctx.stroke()
  }

  for(var i = 0; i < this.visibility_graph.edges.length; i++)
  {
      ctx.beginPath()
    	ctx.strokeStyle = 'red';
      ctx.moveTo(this.visibility_graph.edges[i].p1.x*draw_factor, this.visibility_graph.edges[i].p1.y*draw_factor)
      ctx.lineTo(this.visibility_graph.edges[i].p2.x*draw_factor, this.visibility_graph.edges[i].p2.y*draw_factor)
    	ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = 'red'
      ctx.fillText(Math.round(p_dist(this.visibility_graph.edges[i].p1, this.visibility_graph.edges[i].p2)), (this.visibility_graph.edges[i].p1.x*this.draw_factor+this.visibility_graph.edges[i].p2.x*this.draw_factor)/2, (this.visibility_graph.edges[i].p1.y*this.draw_factor+this.visibility_graph.edges[i].p2.y*this.draw_factor)/2)
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
        ctx.moveTo(this.level.enemies[j].body.GetPosition().x*this.draw_factor, this.level.enemies[j].body.GetPosition().y*this.draw_factor + topbarHeight)
        for(var i = 0; i < this_path.length; i++)
        {
            ctx.lineTo(this_path[i].x*this.draw_factor, this_path[i].y*this.draw_factor + topbarHeight)
        }
        ctx.stroke()
        ctx.lineWidth = 1
      }
    }
  }*/


}

ImpulseGameState.prototype.draw_interface = function(ctx) {


  ctx.beginPath()

  ctx.rect(0, 0, 800, topbarHeight)
  ctx.fillStyle = "white"
  ctx.fill()
  ctx.strokeStyle = "black"
  ctx.lineWidth = 2
  ctx.stroke()
  /*ctx.fillStyle = impulse_colors["world "+this.world_num]
  ctx.globalAlpha = .3
  ctx.fill()*/
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.moveTo(0, topbarHeight)
  ctx.lineTo(800, topbarHeight)
  ctx.strokeStyle = "black"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.font = '20px Century Gothic'
  ctx.globalAlpha = 1

  ctx.fillStyle = this.level_name.slice(0,4) == "BOSS" ? 'red' : impulse_colors["world "+this.world_num]

  ctx.textAlign = 'left'
  ctx.fillText(this.game_numbers.score, 10, 25)



  ctx.textAlign = 'right'

  if(this.stars < 3) {
    ctx.font = '20px Century Gothic'
    ctx.fillStyle = impulse_colors[this.star_colors[this.stars]]
    ctx.fillText(this.level.cutoff_scores[this.stars], canvasWidth - 10, 25)
  }
  else {
    ctx.font = '20px Century Gothic'
    ctx.fillStyle = impulse_colors[this.star_colors[2]]
    ctx.fillText("WIN", canvasWidth - 10, 25)
  }

  var temp_stars = this.stars < 3 ? this.stars : 2

  draw_progress_bar(ctx, 400, 20, 500, 10, this.progress_bar_prop, impulse_colors[this.star_colors[temp_stars]])
  draw_star(ctx, 150, 22, 15, impulse_colors[this.star_colors[temp_stars]])

  ctx.beginPath()

  ctx.rect(350, 2, 100, topbarHeight-4)
  ctx.fillStyle = "white"
  ctx.globalAlpha = .6
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.textAlign = 'center'
  ctx.font = '30px Century Gothic'
  ctx.fillStyle = "black"
  ctx.fillText("x"+this.game_numbers.combo, canvasWidth/2, 30)

  ctx.font = '10px sans-serif'
  ctx.fillStyle = this.level_name.slice(0,4) == "BOSS" ? 'red' : impulse_colors["world "+this.world_num]
  ctx.textAlign = 'left'
  this.game_numbers.seconds = Math.round(this.game_numbers.game_length/1000)
  var a =  this.game_numbers.seconds % 60
  a = a < 10 ? "0"+a : a
  this.game_numbers.last_time = Math.floor(this.game_numbers.seconds/60)+":"+a

  ctx.fillText(this.game_numbers.last_time, 10, (canvasHeight) - 5)

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
  ctx.fillText("FPS: "+this.fps, canvasWidth - 5, (canvasHeight) - 5)
  ctx.fill()

  for(var i = 0; i < this.score_labels.length; i++)
  {
    ctx.beginPath()
    ctx.font = this.score_labels[i].size+'px Century Gothic'
    var prog = this.score_labels[i].duration / this.score_labels[i].max_duration
    ctx.globalAlpha = prog
    ctx.fillStyle = this.score_labels[i].color
    ctx.textAlign = 'center'
    ctx.fillText(this.score_labels[i].text, this.score_labels[i].x * this.draw_factor, this.score_labels[i].y * this.draw_factor - (1 - prog) * this.score_label_rise)
    ctx.fill()
  }
  ctx.globalAlpha = 1

}

ImpulseGameState.prototype.on_mouse_move = function(x, y) {
  if(!this.ready) return
  if(!this.pause)
    this.player.mouseMove({x: x, y: y - topbarHeight})
}

ImpulseGameState.prototype.on_mouse_down = function(x, y) {
  if(!this.pause)
    this.player.mouse_down({x: x, y: y - topbarHeight})
}

ImpulseGameState.prototype.on_mouse_up = function(x, y) {
  if(!this.pause)
    this.player.mouse_up({x: x, y: y - topbarHeight})
}

ImpulseGameState.prototype.on_key_down = function(keyCode) {
  if(!this.ready) return
  if(keyCode == 32) {
    this.pause = !this.pause
    if(this.pause) {
      set_dialog_box(new PauseMenu(this.level, this.game_numbers, this, this.visibility_graph))
    }
  }
  else
    this.player.keyDown(keyCode)  //even if paused, must still process
}

ImpulseGameState.prototype.on_key_up = function(keyCode) {
  if(!this.ready) return
  this.player.keyUp(keyCode)
}

ImpulseGameState.prototype.addWalls = function() {
  var wall_dim = [{x: canvasWidth/this.draw_factor/2, y: 2},
      {x: canvasWidth/this.draw_factor/2, y: 2},
      {x: 2, y: (canvasHeight - topbarHeight)/draw_factor/2},
      {x: 2, y: (canvasHeight - topbarHeight)/draw_factor/2}]

  var wall_pos = [{x: canvasWidth/this.draw_factor/2, y: -2},
      {x: canvasWidth/this.draw_factor/2, y: (canvasHeight - topbarHeight)/this.draw_factor+2},
      {x: -2, y: (canvasHeight - topbarHeight)/this.draw_factor/2},
      {x: canvasWidth/this.draw_factor+2, y: (canvasHeight - topbarHeight)/this.draw_factor/2}]

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

ImpulseGameState.prototype.handle_collisions = function(contact) {
  var first = contact.GetFixtureA().GetUserData()
  var second = contact.GetFixtureB().GetUserData()

  if(!first || !second) return

  first.collide_with(second)
  second.collide_with(first)

}

ImpulseGameState.prototype.addScoreLabel = function(str, color, x, y, font_size, duration) {
  var this_duration = duration ? duration : this.score_label_duration
  var max_duration = duration ? duration : this.score_label_duration
  var temp_score_label = {text: str, color: color, x: x, y: y, duration: this_duration, max_duration: max_duration, size: font_size}
  this.score_labels.push(temp_score_label)
}

ImpulseGameState.prototype.check_cutoffs = function() {
  if(this.game_numbers.score >= this.level.cutoff_scores[this.stars])
  {
    while(this.game_numbers.score >= this.level.cutoff_scores[this.stars]) {
      this.stars+=1
    }
    this.addScoreLabel(this.cutoff_messages[this.stars-1], impulse_colors[this.star_colors[this.stars-1]], canvasWidth/this.draw_factor/2, (canvasHeight - topbarHeight)/this.draw_factor/2, 40, 3000)
  }
}

ImpulseGameState.prototype.increment_combo = function() {
  this.game_numbers.base_combo += 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}

ImpulseGameState.prototype.reset_combo = function() {
  this.game_numbers.base_combo = 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}

ImpulseGameState.prototype.game_over = function() {
  switch_game_state(new GameOverState(this.game_numbers, this.level, this.world_num, this.visibility_graph))
}
