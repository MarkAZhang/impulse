var Level = function(data, impulse_game_state) {
  this.init(data, impulse_game_state)
}

Level.prototype.init = function(data, level_intro_state) {

  this.world_num = level_intro_state.world_num
  this.level_intro_state = level_intro_state
  this.impulse_game_state = null
  this.enemies_data = data.enemies
  this.initial_spawn_data = data.initial_spawn_data;
  this.enemy_spawn_timers = {}
  this.enemy_spawn_counters = {}
  this.enemy_numbers = {}
  this.level_name = data.level_name
  this.bit_spawn_points = data.bit_spawn_points

  this.player_loc = data.player_loc

  this.spawn_points = data.spawn_points



  this.obstacle_num = data.obstacle_num
  this.obstacle_v = data.obstacle_v
  this.get_obstacle_vertices = data.get_obstacle_vertices
  this.color = impulse_colors["world "+this.level_intro_state.world_num]
  this.dark_color = impulse_colors["world "+this.level_intro_state.world_num+" dark"]
  this.lite_color = impulse_colors["world "+this.level_intro_state.world_num+" lite"]
  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"
  if(!this.is_boss_level) {
    this.level_number = parseInt(this.level_name.slice(this.level_name.length-1, this.level_name.length))
    this.cutoff_scores = data.cutoff_scores[player_data.difficulty_mode]
  }
  this.boss_victory = false

  this.buffer_radius = data.buffer_radius

  this.boundary_polygons = []; //the polygons that enemies use to calculate pathfinding
  this.obstacle_polygons = []; //the actual polygons that kill players and enemies
  this.obstacles = []
  this.obstacle_edges = []

  this.obstacle_vertices = []

  this.fragments = []
  this.total_fragments = 0
  this.max_fragments = 42

  this.enemy_map = {
    "stunner": Stunner,
    "spear": Spear,
    "tank": Tank,
    "mote": Mote,
    "goo": Goo,
    "disabler": Disabler,
    "troll": Troll,
    "wisp": Wisp,
    "fighter": Fighter,
    "harpoon": Harpoon,
    "orbiter": Orbiter,
    "slingshot": Slingshot,
    "deathray": DeathRay,
    "deathraydire": DeathRayDire,
    "first boss": BossOne,
    "second boss": BossTwo,
    "third boss": BossThree,
    "fourth boss": BossFour,
    "boss four spawner": BossFourSpawner,
  }
  this.gateway_loc = {x: data.player_loc.x/draw_factor, y: data.player_loc.y/draw_factor}
  this.gateway_size = 4

  this.gateway_transition_interval = 500
  this.gateway_transition_duration = null


  this.spawn_point_counter = 0;
  this.reset();

  this.enemy_images = {}

}

Level.prototype.reset = function() {

  if(this.impulse_game_state && this.impulse_game_state.hive_numbers) {
    this.main_game = true
  } else {
    this.main_game = false
  }
  this.enemies = []
  this.enemy_counter = 0
  this.spawn_interval = 200
  this.spawn_timer = this.spawn_interval
  this.obstacle_visibility = 1 //for Wisp
  this.obstacles_visible_timer = 0
  this.boss_radius = 3
  this.boss = null
  this.boss_spawned = false
  this.boss_victory = false
  for(i in this.enemies_data) {
    this.enemy_spawn_timers[i] = this.enemies_data[i][1]
    this.enemy_spawn_counters[i] = this.enemies_data[i][2]
    this.enemy_numbers[i] = 0
  }

  this.dead_enemies = []
  this.expired_enemies = []
  this.spawned_enemies = []
  this.spawn_queue = [] //enemies that need to be spawned
  this.initial_spawn_done = false
  this.bit_loc = null
  this.bit_duration = null
  this.bit_life = 10000
  this.bit_value = null

  this.multi_loc = null
  this.multi_duration = null
  this.multi_life = 10000
  this.multi_value = null
}

Level.prototype.generate_bit = function() {
  var bit_index = Math.floor(Math.random() * this.bit_spawn_points.length)
  this.bit_loc = {x: this.bit_spawn_points[bit_index][0], y: this.bit_spawn_points[bit_index][1]};
  var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * draw_factor, y: this.impulse_game_state.player.body.GetPosition().y * draw_factor}


  while(p_dist(player_loc,  this.bit_loc) < 125 || (this.multi_loc && this.multi_loc.x == this.bit_loc.x && this.multi_loc.y == this.bit_loc.y)) {
    bit_index+=1
    bit_index = bit_index % this.bit_spawn_points.length
    this.bit_loc =  {x: this.bit_spawn_points[bit_index][0], y: this.bit_spawn_points[bit_index][1]};

  }

  console.log("SPAWNED BIT AT "+this.bit_loc.x+" "+this.bit_loc.y)
  this.bit_duration = this.bit_life
  this.bit_value = 1
}

Level.prototype.generate_multi = function() {
  var multi_index = Math.floor(Math.random() * this.bit_spawn_points.length)
  this.multi_loc = {x: this.bit_spawn_points[multi_index][0], y: this.bit_spawn_points[multi_index][1]};
  var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * draw_factor, y: this.impulse_game_state.player.body.GetPosition().y * draw_factor}
  while(p_dist(player_loc,  this.multi_loc) < 125 || (this.bit_loc && this.multi_loc.x == this.bit_loc.x && this.multi_loc.y == this.bit_loc.y)) {
    multi_index+=1
    multi_index = multi_index % this.bit_spawn_points.length
    this.multi_loc = {x: this.bit_spawn_points[multi_index][0], y: this.bit_spawn_points[multi_index][1]};
  }

  this.multi_duration = this.multi_life
  this.multi_value = 1
}

Level.prototype.process = function(dt) {

  //handle obstacle visibility

    this.bit_duration -= dt
    if(!this.is_boss_level && (this.bit_loc == null || this.bit_duration < 0)) {
      this.generate_bit()
    } else if(!this.is_boss_level) {
      var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * draw_factor, y: this.impulse_game_state.player.body.GetPosition().y * draw_factor}
      if(p_dist(player_loc, this.bit_loc) < 25) {
        if(this.impulse_game_state.hive_numbers) {
          this.impulse_game_state.hive_numbers.bits += 10;
          if(this.impulse_game_state.hive_numbers.bits >= 100) {
            this.impulse_game_state.hive_numbers.bits -= 100;
            this.impulse_game_state.hive_numbers.lives += 1
            this.impulse_game_state.addScoreLabel("1UP", impulse_colors["impulse_blue"], this.impulse_game_state.player.body.GetPosition().x, this.impulse_game_state.player.body.GetPosition().y - 1, 24, 3000)
          }
        } else
          this.impulse_game_state.temp_bits += 10

        this.add_fragments("bit", {x: this.bit_loc.x, y: this.bit_loc.y})
        this.generate_bit()
      }

    }
    this.multi_duration -= dt
    if(!this.is_boss_level && (this.multi_loc == null || this.multi_duration < 0)) {
      this.generate_multi()
    } else if(!this.is_boss_level) {
      var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * draw_factor, y: this.impulse_game_state.player.body.GetPosition().y * draw_factor}
      if(p_dist(player_loc, this.multi_loc) < 25) {
        this.impulse_game_state.game_numbers.base_combo += 5
        this.add_fragments("multi", {x: this.multi_loc.x, y: this.multi_loc.y})
        this.generate_multi()
      }

    }

    if(this.gateway_transition_duration != null) {
      if(this.gateway_transition_duration > 0) {
        this.gateway_transition_duration -= dt
      } else {
        bg_ctx.translate(sidebarWidth, 0)//allows us to have a topbar
        this.draw_bg(bg_ctx)
        bg_ctx.translate(-sidebarWidth, 0)//allows us to have a topbar
        this.gateway_transition_duration = null
      }
    }


    if(this.obstacles_visible_timer <= 0 && this.obstacle_visibility < 1)
    {
      this.obstacle_visibility = Math.min(1, this.obstacle_visibility + dt/1000)
    }
    else if(this.obstacles_visible_timer > 0 && this.obstacle_visibility > 0)
    {
      this.obstacle_visibility = Math.max(0, this.obstacle_visibility - dt/1000)
    }
    if (this.obstacles_visible_timer > 0)
      this.obstacles_visible_timer -= dt

    this.dead_enemies = []
    this.spawned_enemies = []
    this.expired_enemies = []

    for(var i = 0; i < this.enemies.length; i++) {
      this.enemies[i].process(i, dt)
    }
    while(this.dead_enemies.length > 0)
    {
      var dead_i = this.dead_enemies.pop()

      if(this.enemies[dead_i] instanceof BossTwo) {
        for(var i = 0; i < this.enemies.length; i++) {
          if (this.enemies[i] instanceof FixedHarpoon) {
            this.enemies[i].start_death("self_destruct")
          }
        }
      }


      this.impulse_game_state.world.DestroyBody(this.enemies[dead_i].body)
      if(this.enemies[dead_i] instanceof Harpoon) {
        this.impulse_game_state.world.DestroyBody(this.enemies[dead_i].harpoon_head.body)
      }

      if(this.enemies[dead_i] == this.boss) {
        this.boss_victory = true

      }
    }

    for(var i = this.fragments.length - 1; i >= 0; i--) {
      this.fragments[i].process(dt);
      if(this.fragments[i].isDone()) {
        this.fragments.splice(i, 1);
        this.total_fragments -= 6;
      }
    }

    while(this.expired_enemies.length > 0)
    {
      var dead_i = this.expired_enemies.pop()

      this.enemy_numbers[this.enemies[dead_i].type] -= 1

      this.enemies.splice(dead_i, 1)

    }

    while(this.spawned_enemies.length > 0)
    {
      var new_enemy = this.spawned_enemies.pop()

      this.add_enemy(new_enemy)

    }

    if(!this.initial_spawn_done) {
      this.initial_spawn()
      this.initial_spawn_done = true;
    } else {
      this.check_enemy_spawn_timers(dt)

      if(this.spawn_timer >= 0) {
        this.spawn_timer -= dt
      }
      else {
        if(this.spawn_queue.length > 0) {
          var enemy_type_to_spawn = this.spawn_queue[0].type;
          var spawn_point_index = this.spawn_queue[0].spawn_point;
          this.spawn_queue = this.spawn_queue.slice(1)
          this.spawn_this_enemy(enemy_type_to_spawn, spawn_point_index)
          this.spawn_timer = this.spawn_interval
        }
      }
    }

  if(this.boss_victory) {
    for(var i = 0; i < this.enemies.length; i++) {
      if(!this.enemies[i].dying)
        this.enemies[i].start_death("kill")
    }
  }

}

Level.prototype.initial_spawn = function() {
  if(this.initial_spawn_data) {
    for(var enemy in this.initial_spawn_data) {

      // re-seed for each type of enemy
      var spawn_point_index = 0;
      if(this.spawn_points)
        spawn_point_index = Math.floor(Math.random() * this.spawn_points.length)

      var num_enemies_to_spawn = this.initial_spawn_data[enemy]
      if(player_data.difficulty_mode == "easy") {
        num_enemies_to_spawn = Math.max(1, num_enemies_to_spawn * 0.5)
      }

      for(var i = 0; i < num_enemies_to_spawn; i++) {
        this.spawn_this_enemy(enemy, spawn_point_index);
        spawn_point_index+=1;
      }
    }
  }
}

Level.prototype.check_enemy_spawn_timers = function(dt) {
  for(var k in this.enemy_spawn_timers) {
      //if we haven't reached the initial spawn time
    if(this.impulse_game_state.game_numbers.seconds < this.enemies_data[k][0]) continue
    //increment the spawn_counters
    this.enemy_spawn_counters[k] += dt/1000/60 * this.enemies_data[k][3]

    this.enemy_spawn_timers[k] += dt/1000
    if(this.enemy_spawn_timers[k] >= this.enemies_data[k][1]) {
      this.enemy_spawn_timers[k] -= this.enemies_data[k][1]

      // re-seed for each type of enemy
      var spawn_point_index = 0;
      if(this.spawn_points)
        spawn_point_index = Math.floor(Math.random() * this.spawn_points.length)

      var num_enemies_to_spawn = this.enemy_spawn_counters[k]

      if(player_data.difficulty_mode == "easy") {
        num_enemies_to_spawn = Math.max(1, num_enemies_to_spawn * 0.7)
      }

      for(var j = 1; j <= num_enemies_to_spawn; j++) {
        this.spawn_queue.push({type: k, spawn_point: spawn_point_index})
        spawn_point_index+=1;

      }
    }
  }
}

//v = {x: 0, y: 0}
Level.prototype.add_fragments = function(enemy_type, loc, v, shadowed) {
  if(this.total_fragments < this.max_fragments || enemy_type.slice(enemy_type.length - 4, enemy_type.length) == "boss") {
    this.fragments.push(new FragmentGroup(enemy_type, loc, v, shadowed))
    this.total_fragments += 6;
  }

}

Level.prototype.spawn_this_enemy = function(enemy_type, spawn_point) {

  var this_enemy = impulse_enemy_stats[enemy_type].className

  if(this_enemy.prototype.is_boss && this.boss_spawned) {
    return;

  }

  //if at the cap, don't spawn more
  if(this.enemy_numbers[enemy_type] >= this.enemies_data[enemy_type][4]) return


  if(this_enemy.prototype.is_boss) {
    var temp_enemy = new this_enemy(this.impulse_game_state.world, levelWidth/draw_factor/2, (levelHeight)/draw_factor/2, this.enemy_counter, this.impulse_game_state)
    this.boss = temp_enemy
    this.boss_spawned = true
  }
  else if(this.spawn_points) {

    var r_p = this.spawn_points[spawn_point % this.spawn_points.length]
    var temp_enemy = new this_enemy(this.impulse_game_state.world, r_p[0]/draw_factor, r_p[1]/draw_factor, this.enemy_counter, this.impulse_game_state)
  }
  else {
    var r_p = getRandomOutsideLocation(5, 2)
    var temp_enemy = new this_enemy(this.impulse_game_state.world, r_p.x, r_p.y, this.enemy_counter, this.impulse_game_state)
  }

  this.add_enemy(temp_enemy)


}

Level.prototype.add_enemy = function(enemy) {
  this.enemies.push(enemy)

  this.enemy_counter+=1

  this.enemy_numbers[enemy.type] += 1

  if(enemy.is_boss) this.boss = enemy

  if(!this.enemy_images.hasOwnProperty(enemy.image_enemy_type)) {
    this.enemy_images[enemy.image_enemy_type] = enemy.generate_images()
    if(enemy.image_enemy_type == "harpoon") {
      this.enemy_images["harpoonhead"] = enemy.harpoon_head.generate_images()
    }
  }
}

Level.prototype.generate_obstacles = function() {
  //obstacles.push(new BasicObstacle(world, 30, 30, [[new b2Vec2(-10,-10), new b2Vec2(10, -10), new b2Vec2(-10, 10)],
  //      [new b2Vec2(-30,-10), new b2Vec2(-10, -30), new b2Vec2(-10, -10)]]))

  if(this.obstacle_num == null && this.obstacle_v.length) {
    this.obstacle_num = this.obstacle_v.length
  }

  for(var i = 0; i < this.obstacle_num; i++)
  {
    var temp_v = this.get_obstacle_vertices(i)
    this.obstacles.push(new BasicObstacle(temp_v, this.lite_color, this.dark_color))
    this.obstacle_polygons.push(temp_v)
    for(var j = 0; j < temp_v.length; j++) {
      this.obstacle_vertices.push(temp_v[j])
    }
    this.boundary_polygons.push(getBoundaryPolygon(temp_v, this.buffer_radius))
  }
  this.generate_obstacle_edges()

}

Level.prototype.generate_obstacle_edges = function() {

  for(var i = 0; i < this.obstacles.length; i++)
  {
    var obstacle = this.obstacles[i]
    var k = obstacle.verticeSet.length - 1
    for(var j = 0; j < obstacle.verticeSet.length; j++)
    {
      this.obstacle_edges.push({p1: obstacle.verticeSet[k], p2: obstacle.verticeSet[j]})
      k = j
    }
  }
}

Level.prototype.draw_gateway = function(ctx, draw_factor) {
  if(this.is_boss_level) return
    var factor = 1
    ctx.save()
    ctx.globalAlpha = 1

    if(this.gateway_transition_duration != null) {
      var prog = Math.max(this.gateway_transition_duration / this.gateway_transition_interval, 0);
      factor = 1 * prog + 2 * (1-prog)
      ctx.globalAlpha *= 0.3*(1-prog)
      drawSprite(ctx,  this.gateway_loc.x*draw_factor, this.gateway_loc.y*draw_factor,
      (Math.PI/4), this.gateway_size * 4 * draw_factor, this.gateway_size * 4 * draw_factor, tessellation_glow_map[this.world_num], tessellation_sprite_map[this.world_num])
    }

    else if(this.impulse_game_state && this.impulse_game_state.gateway_unlocked) {
      factor = 2
      ctx.globalAlpha *= 0.3
      drawSprite(ctx,  this.gateway_loc.x*draw_factor, this.gateway_loc.y*draw_factor,
      (Math.PI/4), this.gateway_size * 4 * draw_factor, this.gateway_size * 4 * draw_factor, tessellation_glow_map[this.world_num], tessellation_sprite_map[this.world_num])
    }
    ctx.restore()
    draw_tessellation_sign(ctx, this.world_num, this.gateway_loc.x * draw_factor, this.gateway_loc.y * draw_factor, this.gateway_size * draw_factor, factor)
}

Level.prototype.draw = function(context, draw_factor, alpha) {

  if(this.bit_loc) {
    var prog = this.bit_duration/this.bit_life;
    context.save()
    context.globalAlpha *= Math.min(1, (1 - 2*Math.abs(prog-0.5))/.7)

    draw_bit(context, this.bit_loc.x, this.bit_loc.y, this.bit_value)
    context.restore()

  }

  if(this.multi_loc) {
    var prog = this.multi_duration/this.multi_life;
    context.save()
    context.globalAlpha *= Math.min(1, (1 - 2*Math.abs(prog-0.5))/.7)

    draw_multi(context, this.multi_loc.x, this.multi_loc.y, this.multi_value)
    context.restore()

  }

  if(this.redraw_bg) {
    bg_ctx.translate(sidebarWidth, 0)//allows us to have a topbar
    this.draw_bg(bg_ctx, true)
    bg_ctx.translate(-sidebarWidth, 0)//allows us to have a topbar
    this.redraw_bg = false
  }
  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].pre_draw(context, draw_factor)
  }
  //context.globalAlpha = this.obstacle_visibility

  context.globalAlpha = alpha;

  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].draw(ctx, draw_factor)
  }

  context.globalAlpha = 1
  for(var i = 0; i < this.fragments.length; i++) {
    this.fragments[i].draw(ctx, draw_factor)
  }

  if(this.boss_delay_timer >= 0) {

    context.beginPath()
    context.arc(levelWidth/draw_factor/2 * draw_factor, (levelHeight)/draw_factor/2 * draw_factor, (this.boss_radius * 2 *draw_factor), -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (this.boss_delay_timer / this.boss_delay_interval), true)

    context.lineWidth = 2
    context.strokeStyle = "gray"
    context.stroke()

    context.globalAlpha = 1
  }
  if(this.gateway_transition_duration != null) {
    if(this.gateway_loc) {
      this.draw_gateway(ctx, draw_factor)

    }
  }
}

Level.prototype.open_gateway = function() {

  this.gateway_transition_duration = this.gateway_transition_interval
  this.redraw_bg = true
}

Level.prototype.draw_bg = function(bg_ctx, omit_gateway) {

  draw_bg(bg_ctx, 0, 0, levelWidth, levelHeight, "Hive "+this.level_intro_state.world_num)

  for(var i = 0; i < this.obstacles.length; i++) {
    this.obstacles[i].draw(bg_ctx, draw_factor)
  }

  if(this.gateway_loc && !omit_gateway) {
    this.draw_gateway(bg_ctx, draw_factor)
  }
}

Level.prototype.create_enemy_images = function(enemy) {


}