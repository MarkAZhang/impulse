HowToPlayState.prototype = new GameState

HowToPlayState.prototype.constructor = HowToPlayState

function HowToPlayState(ctx) {
  this.pause = true
  this.ready = false
  this.buttons = []

  if(!player_data.first_time)
    this.buttons.push(new SmallButton("MAIN MENU", 15, canvasWidth/2, canvasHeight/2+270, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
  this.buttons.push(new SmallButton("CLICK HERE TO CONTINUE", 20, canvasWidth/2, canvasHeight/2+200, 200, 50, function(_this){return function(){_this.increment_state()}}(this)))

  this.state = 0

  this.draw_factor = 15
  this.last_fps_time = 0
  this.fps_counter = null
  this.fps = 0
  this.score_labels = []
  this.score_label_duration = 1000
  this.score_label_rise = 30
  this.buffer_radius = 1 //primarily for starting player location

  this.stars = 0
  this.cutoff_messages = ["BRONZE SCORE ACHIEVED", "SILVER SCORE ACHIEVED", "GOLD SCORE ACHIEVED"]
  this.star_colors =  ["bronze", "silver", "gold"]

  this.loading_screen()
  this.level_name = "HOW TO PLAY 1"
  this.reload_world() 

}

HowToPlayState.prototype.increment_state = function() {
  this.state+=1
  if(this.state <= 4) {
    this.level_name = "HOW TO PLAY "+(this.state+1)
    this.reload_world()
  }
  if(this.state == 6) {
    if(player_data.first_time) {
      switch_game_state(new ImpulseGameState(ctx, "LEVEL 1-1", 1))
      player_data.first_time = false
      save_game()
    }
    else
      switch_game_state(new TitleState(true))
  }
}

HowToPlayState.prototype.reload_world = function() {
  setTimeout(function(this_state, level_name){return function(){this_state.setup_world_next(level_name)}}(this, this.level_name), 5)
}

HowToPlayState.prototype.loading_screen = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath()
  ctx.font = '30px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("LOADING", canvasWidth/2, canvasHeight/2)
  ctx.fill()
}

HowToPlayState.prototype.process = function(dt) {
  
  if(this.state > 4) {
    return
  }

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

HowToPlayState.prototype.draw = function(ctx) {
  if(!this.ready) return

  if(this.state > 4) {
    for(var i = 0; i < this.buttons.length; i++)
    {
      this.buttons[i].draw(ctx)
    }
    ctx.fillStyle = 'black'
    ctx.font = '20px Century Gothic'
    ctx.fillText("HOW TO PLAY", canvasWidth/2, 25)
    ctx.fillStyle = 'blue'
    ctx.font = '25px Century Gothic'
    var text = "ACHIEVE THE BRONZE, SILVER, AND GOLD SCORES IN EACH LEVEL TO EARN STARS AND UNLOCK MORE LEVELS."
    var phrase_list = getLines(ctx, text, canvasWidth * 3/4, '25px Century Gothic')

    for(var i = 0; i < phrase_list.length; i++) {
      var j = (i - phrase_list.length/2)
      ctx.fillText(phrase_list[i], canvasWidth/2, canvasHeight/2 + 35 * j)
    }
    var temp_colors = ['bronze', 'silver', 'gold']
    var temp_text = ["BRONZE SCORE (1 STAR)", "SILVER SCORE (2 STARS)", "GOLD SCORE (3 STARS)"]
    for(var i = 0; i < 3; i++) {
      ctx.textAlign = "left"
      ctx.fillStyle = impulse_colors[temp_colors[i]]
      ctx.fillText(temp_text[i],  canvasWidth/2 - 200, canvasHeight/2 + 80 + 35 * i)


      draw_star(ctx,  canvasWidth/2 + 180, canvasHeight/2 + 75 + 35 * i, 13, temp_colors[i])
      if(i >= 1) {
        draw_star(ctx,  canvasWidth/2 + 180 - 30, canvasHeight/2 + 75 + 35 * i, 13, temp_colors[i-1])
      }
      if(i >= 2) {
        draw_star(ctx,  canvasWidth/2 + 180 - 60, canvasHeight/2 + 75 + 35 * i, 13, temp_colors[i-2])
      }

    }

    return
  }

  this.level.draw(ctx, this.draw_factor)
  this.player.draw(ctx)

  this.draw_interface(ctx)
  
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  var text = ["WASD TO MOVE. SPACEBAR TO PAUSE", "MOVE MOUSE TO AIM, CLICK TO FIRE AN IMPULSE. IMPULSING ENEMIES PUSHES THEM AWAY.", "THE SHAPES OF DEATH IN EACH LEVEL INSTANTLY KILL ANYTHING THAT TOUCHES THEM.", "PUSH ENEMIES INTO THE SHAPES OF DEATH WITH YOUR IMPULSE TO KILL THEM AND SCORE POINTS.", "EACH KILL INCREASES YOUR MULTIPLIER. TOUCHING MOST ENEMIES WILL RESET YOUR MULTIPLIER. YOUR MULTIPLIER ALSO PERMANENTLY INCREASES SLOWLY THE LONGER YOU SURVIVE."]

  var extra_text = [[], [], [{text: "SHAPE OF DEATH", x: 400, y: 160}, {text: "SHAPE OF DEATH", x: 400, y: 410}], [{text: "SHAPE OF DEATH", x: 400, y: 160}, {text: "SHAPE OF DEATH", x: 400, y: 410}], [{text: "MULTIPLIER", x: 680, y: 50}, {text: "GAME TIME", x: 80, y: 50}]]

  ctx.beginPath()
  ctx.fillStyle = 'blue'
  ctx.font = '25px Century Gothic'
  var phrase_list = getLines(ctx, text[this.state], canvasWidth * 3/4, '25px Century Gothic')

  for(var i = 0; i < phrase_list.length; i++) {
    var j = (i - phrase_list.length/2)
    ctx.fillText(phrase_list[i], canvasWidth/2, canvasHeight/2 + 35 * j)
  }

  for(var i = 0; i < extra_text[this.state].length; i++) {
    ctx.fillText(extra_text[this.state][i].text, extra_text[this.state][i].x, extra_text[this.state][i].y)
  }
  ctx.fill()

  
}

HowToPlayState.prototype.draw_interface = function(ctx) {
  ctx.beginPath()
  ctx.font = '20px Century Gothic'
  ctx.textAlign = 'left'
  this.game_numbers.seconds = Math.round(this.game_numbers.game_length/1000)
  var a =  this.game_numbers.seconds % 60
  a = a < 10 ? "0"+a : a
  this.game_numbers.last_time = Math.floor(this.game_numbers.seconds/60)+":"+a
  ctx.fillStyle = 'black'
  if(this.state == 4) {
    ctx.fillStyle = 'blue'
    ctx.font = '25px Century Gothic'
  }
  ctx.fillText(this.game_numbers.last_time, 10, 25)
  ctx.font = '20px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'right'
  if(this.state == 3) {
    ctx.fillStyle = 'blue'
    ctx.font = '25px Century Gothic'
  }

  ctx.fillText("SCORE: "+this.game_numbers.score, canvasWidth - 10, 25)
  
  ctx.font = '20px Century Gothic'
  ctx.fillStyle = 'black'

  if(this.state == 4) {
    ctx.fillStyle = 'blue'
    ctx.font = '25px Century Gothic'
  }
  ctx.fillText("x"+this.game_numbers.combo, canvasWidth - 10, 50)

  ctx.font = '20px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("HOW TO PLAY", canvasWidth/2, 25)

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
  ctx.fillText("FPS: "+this.fps, canvasWidth - 5, canvasHeight - 5)
  ctx.fill()

  for(var i = 0; i < this.score_labels.length; i++)
  {
    ctx.beginPath()
    ctx.font = this.score_labels[i].size+'px Century Gothic'
    var prog = this.score_labels[i].duration / this.score_label_duration
    ctx.globalAlpha = prog
    ctx.fillStyle = this.score_labels[i].color
    ctx.textAlign = 'center'
    ctx.fillText(this.score_labels[i].text, this.score_labels[i].x * this.draw_factor, this.score_labels[i].y * this.draw_factor - (1 - prog) * this.score_label_rise)
    ctx.fill()
  }
  ctx.globalAlpha = 1

}

HowToPlayState.prototype.on_mouse_move = function(x, y) {
  if(!this.ready) return
  
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }

  if(!this.pause)
    this.player.mouseMove({x: x, y: y})
}

HowToPlayState.prototype.on_click = function(x, y) {
  if(!this.ready) return

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  if(!this.pause)
    this.player.click({x: x, y: y}, this.level.enemies)
  
}

HowToPlayState.prototype.on_key_down = function(keyCode) {
  if(!this.ready) return
  if(keyCode == 32) {
    this.pause = !this.pause
    if(this.pause) {
      set_dialog_box(new PauseMenu(this.level, this.game_numbers, this))
    }
  }
  else
    this.player.keyDown(keyCode)  //even if paused, must still process
}

HowToPlayState.prototype.on_key_up = function(keyCode) {
  if(!this.ready) return
  this.player.keyUp(keyCode)
}

HowToPlayState.prototype.setup_world_next = function(level_name) {
  this.game_numbers = {score: 0, combo: 1, base_combo: 1, seconds: 0, kills: 0, game_length: 0, last_time: null}
  var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  this.world = new b2World(gravity, doSleep); 
    
  //add walls
  this.addWalls()

  this.level = new Level(impulse_level_data[level_name], this)
    
  this.generate_level()
  this.player = new Player(this.world, canvasWidth/this.draw_factor/2, canvasHeight/this.draw_factor/2, this)
  var contactListener = new b2ContactListener;
  contactListener.PreSolve = this.handle_collisions
  this.world.SetContactListener(contactListener);
  this.pause = false
  this.ready = true
}

HowToPlayState.prototype.addWalls = function() {
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

HowToPlayState.prototype.generate_level = function() {
  this.level.generate_obstacles()
  this.visibility_graph = new VisibilityGraph(this.level.boundary_polygons, this.level)

}

HowToPlayState.prototype.handle_collisions = function(contact) {
  var first = contact.GetFixtureA().GetUserData()
  var second = contact.GetFixtureB().GetUserData()

  if(!first || !second) return

  first.collide_with(second)
  second.collide_with(first)

}

HowToPlayState.prototype.addScoreLabel = function(str, color, x, y, font_size) {
  var temp_score_label = {text: str, color: color, x: x, y: y, duration: this.score_label_duration, size: font_size}
  this.score_labels.push(temp_score_label)
}

HowToPlayState.prototype.check_cutoffs = function() {
  if(this.game_numbers.score >= this.level.cutoff_scores[this.stars])
  {
    this.stars+=1
    this.addScoreLabel(this.cutoff_messages[this.stars-1], this.star_colors[this.stars-1], canvasWidth/this.draw_factor/2, canvasHeight/this.draw_factor/2, 40)
  }
}

HowToPlayState.prototype.increment_combo = function() {
  this.game_numbers.base_combo += 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}

HowToPlayState.prototype.reset_combo = function() {
  this.game_numbers.base_combo = 1
  this.game_numbers.combo = this.game_numbers.base_combo + Math.floor(this.game_numbers.seconds/10)
}
