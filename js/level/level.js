var Level = function(data, impulse_game_state) {
  this.init(data, impulse_game_state)
}

Level.prototype.init = function(data, level_intro_state) {

  this.world_num = level_intro_state.world_num
  this.level_intro_state = level_intro_state
  this.impulse_game_state = null

  // Retrieve enemy data. Use easy mode if necessary but default to normal.
  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.enemies_data = data.enemies_easy
  }
  if (!this.enemies_data) {
    this.enemies_data = data.enemies
  } else {
    this.using_enemies_easy = true
  }

  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.initial_spawn_data = data.initial_spawn_data_easy
  }
  if (!this.initial_spawn_data) {
    this.initial_spawn_data = data.initial_spawn_data
  } else {
    this.using_initial_spawn_data_easy = true
  }
  this.enemy_numbers = {}
  this.level_name = data.level_name

  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.spark_spawn_points = data.spark_spawn_points_easy
  }
  if (!this.spark_spawn_points) {
    this.spark_spawn_points = data.spark_spawn_points
  }

  this.spark_spin_angle = 0
  this.spark_spin_rate = 8000

  this.pick_alt_path = data.pick_alt_path

  this.starting_loc = data.player_loc
  if (imp_vars.player_data.difficulty_mode == "easy" && data.player_loc_easy) {
    this.starting_loc = data.player_loc_easy
  }
  this.player_loc = this.get_starting_loc()

  this.spawn_points = data.spawn_points

  this.obstacle_num = data.obstacle_num
  

  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.obstacle_v = data.obstacle_v_easy
  }
  if (!this.obstacle_v) {
    this.obstacle_v = data.obstacle_v
  }
  this.get_obstacle_vertices = data.get_obstacle_vertices
  this.color = impulse_colors["world "+this.level_intro_state.world_num]
  this.dark_color = impulse_colors["world "+this.level_intro_state.world_num+" dark"]
  this.lite_color = impulse_colors["world "+this.level_intro_state.world_num+" lite"]
  this.bright_color = impulse_colors["world "+this.level_intro_state.world_num+" bright"]
  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"
  if(!this.is_boss_level) {
    this.level_number = parseInt(this.level_name.slice(this.level_name.length-1, this.level_name.length))
    this.cutoff_scores = data.cutoff_scores[imp_vars.player_data.difficulty_mode]
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
  this.max_fragments = 20

  this.gateway_opened = false

  this.tessellation_angle = 0
  this.tessellation_rotate_rate = 12000

  this.enemy_map = {
    "stunner": Stunner,
    "spear": Spear,
    "tank": Tank,
    "mote": Mote,
    "goo": Goo,
    "disabler": Disabler,
    "troll": Troll,
    "fighter": Fighter,
    "harpoon": Harpoon,
    "orbiter": Orbiter,
    "slingshot": Slingshot,
    "deathray": DeathRay,
    "first boss": BossOne,
    "second boss": BossTwo,
    "third boss": BossThree,
    "fourth boss": BossFour,
    "boss four spawner": BossFourSpawner,
  }
  this.gateway_loc = {x: this.get_starting_loc().x/imp_vars.draw_factor, y: this.get_starting_loc().y/imp_vars.draw_factor}
  this.gateway_size = 4

  this.gateway_transition_interval = 500
  this.gateway_transition_duration = null

  // structure:
  // start_x, start_y
  // prop
  this.gateway_particles = []
  this.gateway_particle_gen_interval = 1000
  this.gateway_particle_gen_timer = this.gateway_particle_gen_interval
  this.gateway_particle_duration = 2000
  this.gateway_particles_per_round = 5

  this.spawn_point_counter = 0;
  this.reset();

  this.enemy_images = {}

  this.bulk_draw_enemies = {} // allows us to use a single beginPath/stroke to draw the same characteristics for many enemies

}

Level.prototype.get_starting_loc = function() {
  return this.starting_loc
}

Level.prototype.reset = function() {

  if(this.impulse_game_state && this.impulse_game_state.main_game) {
    this.main_game = true
  } else {
    this.main_game = false
  }
  this.enemies = []
  this.enemy_counter = 0
  this.spawn_interval = 200
  this.spawn_timer = this.spawn_interval
  this.enemy_visibility = 1 // for boss four
  this.gateway_opened = false
  this.obstacles_visible_timer = 0
  this.boss_radius = 3
  this.boss = null
  this.boss_spawned = false
  this.boss_victory = false
  this.tessellation_angle = 0

  this.enemy_spawners = {};

  for (i in this.enemies_data) {
    var enemy_data = this.enemies_data[i];
    this.enemy_spawners[i] = new EnemySpawner(
      i, /* type */
      enemy_data[0], /* first_spawn_time */
      enemy_data[1], /* spawn_period_init */
      enemy_data[2], /* spawn_period_decr_per_minute */
      enemy_data[3], /* spawn_period_min */
      enemy_data[4], /* num_per_spawn_init */
      enemy_data[5], /* num_per_spawn_incr_per_minute */
      enemy_data[6]  /* max_enemies */
    );
    this.enemy_numbers[i] = 0
  }
  
  this.dead_enemies = []
  this.expired_enemies = []
  this.spawned_enemies = []
  this.spawn_queue = [] //enemies that need to be spawned
  this.initial_spawn_done = false
  this.spark_loc = null
  this.spark_duration = null
  this.spark_life = 10000
  this.spark_value = null

  this.multi_loc = null
  this.multi_duration = null
  this.multi_life = 10000
  this.multi_value = null
}

Level.prototype.generate_spark = function() {
  var spark_index = Math.floor(Math.random() * this.spark_spawn_points.length)
  this.spark_loc = {x: this.spark_spawn_points[spark_index][0], y: this.spark_spawn_points[spark_index][1]};
  var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * imp_vars.draw_factor, y: this.impulse_game_state.player.body.GetPosition().y * imp_vars.draw_factor}


  while(p_dist(player_loc,  this.spark_loc) < 125 || (this.multi_loc && this.multi_loc.x == this.spark_loc.x && this.multi_loc.y == this.spark_loc.y)) {
    spark_index+=1
    spark_index = spark_index % this.spark_spawn_points.length
    this.spark_loc =  {x: this.spark_spawn_points[spark_index][0], y: this.spark_spawn_points[spark_index][1]};

  }

  this.spark_duration = this.spark_life
  this.spark_value = 1
}

Level.prototype.generate_multi = function() {
  var multi_index = Math.floor(Math.random() * this.spark_spawn_points.length)
  this.multi_loc = {x: this.spark_spawn_points[multi_index][0], y: this.spark_spawn_points[multi_index][1]};
  var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * imp_vars.draw_factor, y: this.impulse_game_state.player.body.GetPosition().y * imp_vars.draw_factor}
  while(p_dist(player_loc,  this.multi_loc) < 125 || (this.spark_loc && this.multi_loc.x == this.spark_loc.x && this.multi_loc.y == this.spark_loc.y)) {
    multi_index+=1
    multi_index = multi_index % this.spark_spawn_points.length
    this.multi_loc = {x: this.spark_spawn_points[multi_index][0], y: this.spark_spawn_points[multi_index][1]};
  }

  this.multi_duration = this.multi_life
  this.multi_value = 1
}

Level.prototype.process = function(dt) {
  //handle obstacle visibility
    this.spark_duration -= dt
    if(!this.is_boss_level && (this.spark_loc == null || this.spark_duration < 0)) {
      this.generate_spark()
    } else if(!this.is_boss_level) {
      var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * imp_vars.draw_factor, y: this.impulse_game_state.player.body.GetPosition().y * imp_vars.draw_factor}
      if(p_dist(player_loc, this.spark_loc) < 25) {
        imp_vars.impulse_music.play_sound("sparks")
          this.impulse_game_state.hive_numbers.sparks += this.impulse_game_state.hive_numbers.spark_val;
        if(this.impulse_game_state.hive_numbers.sparks >= 100) {
          this.impulse_game_state.hive_numbers.sparks -= 100;
          this.impulse_game_state.hive_numbers.lives += 1
          this.impulse_game_state.addScoreLabel("1UP", impulse_colors["impulse_blue"], this.impulse_game_state.player.body.GetPosition().x, this.impulse_game_state.player.body.GetPosition().y - 1, 24, 3000)
        }

        //this.add_fragments("spark", {x: this.spark_loc.x, y: this.spark_loc.y})
        this.impulse_game_state.addScoreLabel(
          "+" + this.impulse_game_state.hive_numbers.spark_val,
          impulse_colors["impulse_blue"],
          this.spark_loc.x / imp_vars.draw_factor,
          this.spark_loc.y / imp_vars.draw_factor,
          20, 2000, true);
        this.generate_spark()
      }

    }
    this.multi_duration -= dt
    if(!this.is_boss_level && (this.multi_loc == null || this.multi_duration < 0)) {
      this.generate_multi()
    } else if(!this.is_boss_level) {
      var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * imp_vars.draw_factor, y: this.impulse_game_state.player.body.GetPosition().y * imp_vars.draw_factor}
      if(p_dist(player_loc, this.multi_loc) < 25) {
        imp_vars.impulse_music.play_sound("sparks")
        this.impulse_game_state.game_numbers.base_combo += 5
        this.impulse_game_state.game_numbers.combo =
          this.impulse_game_state.game_numbers.base_combo + Math.floor(this.impulse_game_state.game_numbers.seconds/10)
        //this.add_fragments("multi", {x: this.multi_loc.x, y: this.multi_loc.y})
        this.impulse_game_state.addScoreLabel(
          "x" + this.impulse_game_state.game_numbers.combo,
          "white",
          this.multi_loc.x / imp_vars.draw_factor,
          this.multi_loc.y / imp_vars.draw_factor,
          20,
          2000);
        this.generate_multi()
      }

    }

    this.spark_spin_angle += Math.PI * 2 * dt / this.spark_spin_rate

    if(this.gateway_transition_duration != null) {
      if(this.gateway_transition_duration > 0) {
        this.gateway_transition_duration -= dt
      } else {
        imp_vars.bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
        this.draw_bg(imp_vars.bg_ctx)
        imp_vars.bg_ctx.translate(-imp_vars.sidebarWidth, 0)//allows us to have a topbar
        this.gateway_transition_duration = null
      }
    }

    // if the gateway is opened, process the particles
    if (this.gateway_opened) {
      this.process_gateway_particles(dt);
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
        this.total_fragments -= 4;
      }
    }

    while(this.expired_enemies.length > 0)
    {
      var dead_i = this.expired_enemies.pop()

      this.enemy_numbers[this.enemies[dead_i].type] -= 1

      if(this.enemies[dead_i].type == "goo" || this.enemies[dead_i].type == "disabler") { // if goo or disabler died, reset the death timer
        this.enemy_spawners[this.enemies[dead_i].type].reset_spawn_period(this.impulse_game_state.game_numbers.seconds);
      }

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
      if(!this.is_boss_level && imp_vars.player_data.difficulty_mode == "easy" && !this.using_initial_spawn_data_easy) {
        num_enemies_to_spawn = Math.max( 1, 0.5 * num_enemies_to_spawn)
      }

      if (this.impulse_game_state.show_tutorial) {
        num_enemies_to_spawn = Math.ceil(num_enemies_to_spawn * 0.5)
      }      

      for(var i = 0; i < Math.floor(num_enemies_to_spawn); i++) {
        this.spawn_this_enemy(enemy, spawn_point_index);
        spawn_point_index+=1;
      }
    }
  }
}

Level.prototype.check_enemy_spawn_timers = function(dt) {
  if (this.is_boss_level) return

  for(var enemy_type in this.enemy_spawners) {
    var enemy_spawner = this.enemy_spawners[enemy_type]

    enemy_spawner.process(dt, this.impulse_game_state.game_numbers.seconds);

    var num_enemies_to_spawn = enemy_spawner.get_spawn_number(this.impulse_game_state.game_numbers.seconds);

    if(num_enemies_to_spawn > 0) {

      if(imp_vars.player_data.difficulty_mode == "easy" && !this.using_enemies_easy) {
        num_enemies_to_spawn = Math.max(1, 0.5 * num_enemies_to_spawn)
      }

      if (this.impulse_game_state instanceof HowToPlayState && this.double_spawn) {
        num_enemies_to_spawn *= 2
      }

      if (this.impulse_game_state.show_tutorial) {
        num_enemies_to_spawn = Math.ceil(num_enemies_to_spawn * 0.5);
      }

      if (this.impulse_game_state instanceof HowToPlayState && this.no_spawn) {
        num_enemies_to_spawn = 0
      }

      // re-seed for each type of enemy
      var spawn_point_index = 0;
      if(this.spawn_points)
        spawn_point_index = Math.floor(Math.random() * this.spawn_points.length)

      for(var j = 0; j < Math.floor(num_enemies_to_spawn); j++) {
        this.spawn_queue.push({type: enemy_type, spawn_point: spawn_point_index})
        spawn_point_index+=1;
      }
    }
  }
  if (this.enemies.length == 0 && this.spawn_queue.length == 0) {
    this.skip_enemy_spawn_timers()
  }
}

Level.prototype.skip_enemy_spawn_timers = function() {
  var min_timer = 1000
  // find the minimum time to next enemy spawn
  for(var enemy_type in this.enemy_spawners) {
    var enemy_spawner = this.enemy_spawners[enemy_type];
    if (this.impulse_game_state.game_numbers.seconds > enemy_spawner.first_spawn_time) {
      min_timer = Math.min(min_timer, enemy_spawner.spawn_period)
    }
  }

  // adjust all enemy timers accordingly, but skip those that haven't spawned yet
  for(var enemy_type in this.enemy_spawners) {
    var enemy_spawner = this.enemy_spawners[enemy_type];
    enemy_spawner.process(min_timer, this.impulse_game_state.game_numbers.seconds)
  }
}

//v = {x: 0, y: 0}
Level.prototype.add_fragments = function(enemy_type, loc, v, shadowed) {
  if(enemy_type == "player" || enemy_type == "spark" || enemy_type == "multi" || enemy_type.slice(enemy_type.length - 4, enemy_type.length) == "boss"
    || (this.total_fragments < this.max_fragments && imp_vars.player_data.options.explosions)) {
      this.fragments.push(new FragmentGroup(enemy_type, loc, v, shadowed))
      this.total_fragments += 4;
  }
}

Level.prototype.spawn_this_enemy = function(enemy_type, spawn_point) {
  var this_enemy = imp_params.impulse_enemy_stats[enemy_type].className

  if(this_enemy.prototype.is_boss && this.boss_spawned) {
    return;
  }

  //if at the cap, don't spawn more
  if(this.enemy_numbers[enemy_type] >= this.enemy_spawners[enemy_type].get_max_enemies()) {
    return
  }

  if(this_enemy.prototype.is_boss) {
    var temp_enemy = new this_enemy(this.impulse_game_state.world, imp_vars.levelWidth/imp_vars.draw_factor/2, (imp_vars.levelHeight)/imp_vars.draw_factor/2, this.enemy_counter, this.impulse_game_state)
    this.boss = temp_enemy
    this.boss_spawned = true
  }
  else if(this.spawn_points) {

    var r_p = this.spawn_points[spawn_point % this.spawn_points.length]
    var temp_enemy = new this_enemy(this.impulse_game_state.world, r_p[0]/imp_vars.draw_factor, r_p[1]/imp_vars.draw_factor, this.enemy_counter, this.impulse_game_state)
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

  /*if(!this.enemy_images.hasOwnProperty(enemy.image_enemy_type)) {
    this.enemy_images[enemy.image_enemy_type] = enemy.generate_images()
    if(enemy.image_enemy_type == "harpoon") {
      this.enemy_images["harpoonhead"] = enemy.harpoon_head.generate_images()
    }
  }*/

  if(enemy.has_bulk_draw && !this.bulk_draw_enemies.hasOwnProperty(enemy.type)) {
    this.bulk_draw_enemies[enemy.type] = enemy.bulk_draw_nums
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
      this.obstacle_edges.push({"p1": obstacle.verticeSet[k], "p2": obstacle.verticeSet[j]})
      k = j
    }
  }
}

Level.prototype.draw_gateway = function(ctx, draw_factor) {
  if(this.is_boss_level) return
  ctx.save()

  if(this.gateway_transition_duration != null && this.world_num <= 4) {
    var prog = Math.max(this.gateway_transition_duration / this.gateway_transition_interval, 0);
    //ctx.globalAlpha *= 0.5*(1-prog)
    //drawSprite(ctx,  this.gateway_loc.x*draw_factor, this.gateway_loc.y*draw_factor,
    //  (Math.PI/4), this.gateway_size * 4 * draw_factor, this.gateway_size * 4 * draw_factor, tessellation_glow_map[this.world_num], tessellation_sprite_map[this.world_num])
    //ctx.restore()
    //ctx.save()
    ctx.globalAlpha *= 0.3 + 0.2 * (1-prog)
  }
  else if(this.impulse_game_state && this.gateway_opened && this.world_num <= 4) {
    ctx.globalAlpha *= 0.7
    //ctx.globalAlpha *= 1
    //drawSprite(ctx,  this.gateway_loc.x*draw_factor, this.gateway_loc.y*draw_factor,
    //  (Math.PI/4), this.gateway_size * 4 * draw_factor, this.gateway_size * 4 * draw_factor, tessellation_glow_map[this.world_num], tessellation_sprite_map[this.world_num])
  } else {
    ctx.globalAlpha *= 0.3
  }
  draw_tessellation_sign(ctx, 
                         this.world_num,
                         this.gateway_loc.x * draw_factor,
                         this.gateway_loc.y * draw_factor,
                         this.gateway_size * draw_factor,
                         this.gateway_opened,
                         0)//this.tessellation_angle)


  if (this.gateway_opened) {
    this.draw_gateway_particles(ctx, draw_factor);
  }
  ctx.restore()
}

Level.prototype.pre_draw = function(context, draw_factor) {

    if(this.gateway_loc) {
      this.draw_gateway(context, draw_factor)
    }
}

Level.prototype.draw = function(context, draw_factor) {
  context.save()


  if(this.spark_loc) {
    var prog = this.spark_duration/this.spark_life;
    context.save()
    context.globalAlpha *= Math.min(1, (1 - 2*Math.abs(prog-0.5))/.7)

    draw_spark(context, this.spark_loc.x, this.spark_loc.y, this.spark_spin_angle)
    context.restore()

  }

  if(this.multi_loc) {
    var prog = this.multi_duration/this.multi_life;
    context.save()
    context.globalAlpha *= Math.min(1, (1 - 2*Math.abs(prog-0.5))/.7)

    draw_multi(context, this.multi_loc.x, this.multi_loc.y, this.spark_spin_angle)
    context.restore()

  }

  if(this.redraw_bg) {
    imp_vars.bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
    this.draw_bg(imp_vars.bg_ctx, true)
    imp_vars.bg_ctx.translate(-imp_vars.sidebarWidth, 0)//allows us to have a topbar
    this.redraw_bg = false
  }

  if (this.enemy_visibility != 1) {
    context.save();
    context.globalAlpha *= this.enemy_visibility;
  }

  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].pre_draw(context, draw_factor)
  }

  for(var type in this.bulk_draw_enemies) {
    var num_bulks = this.bulk_draw_enemies[type]
    for(var num = 1; num <= num_bulks; num++) {
      var firstEnemy = null
      for(var i = 0; i < this.enemies.length; i++) {
        if(this.enemies[i].type == type) {
          if(firstEnemy == null) {
            firstEnemy = this.enemies[i]
            firstEnemy.bulk_draw_start(context, draw_factor, num)
          }
          this.enemies[i].bulk_draw(context, draw_factor, num)
        }

      }
      if(firstEnemy != null) {
        firstEnemy.bulk_draw_end(context, draw_factor, num)
      }
    }

  }
  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].draw(context, draw_factor)
  }


  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].final_draw(context, draw_factor)
  }


  for(var i = 0; i < this.fragments.length; i++) {
    this.fragments[i].draw(context, draw_factor)
  }
  if (this.enemy_visibility != 1) {
    context.restore();
  }

  if(this.boss_delay_timer >= 0) {

    context.beginPath()
    context.arc(imp_vars.levelWidth/draw_factor/2 * draw_factor, (imp_vars.levelHeight)/draw_factor/2 * draw_factor, (this.boss_radius * 2 *draw_factor), -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (this.boss_delay_timer / this.boss_delay_interval), true)

    context.lineWidth = 2
    context.strokeStyle = "gray"
    context.stroke()

    context.globalAlpha = 1
  }

  context.restore()
}

Level.prototype.open_gateway = function() {

  this.gateway_transition_duration = this.gateway_transition_interval
  this.gateway_opened = true
}

Level.prototype.draw_bg = function(bg_ctx, omit_gateway) {

  bg_ctx.save()
  bg_ctx.rect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  bg_ctx.clip()

  if(this.level_intro_state.world_num != null)
    draw_bg(bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.level_intro_state.world_num)
  else {
    bg_ctx.fillStyle = impulse_colors["world 0 bright"]
    bg_ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  }

  for(var i = 0; i < this.obstacles.length; i++) {
    this.obstacles[i].draw(bg_ctx, imp_vars.draw_factor)
  }

  if (this.is_boss_level) {
    bg_ctx.fillStyle = impulse_colors["world " + this.world_num + " dark"]
    bg_ctx.fillRect(375, 0, 50, 25);
    bg_ctx.fillRect(375, 575, 50, 25);
    bg_ctx.fillRect(0, 275, 25, 50);
    bg_ctx.fillRect(775, 275, 25, 50);
  }

  //if(this.gateway_loc && !omit_gateway) {
  //  this.draw_gateway(bg_ctx, imp_vars.draw_factor)
  //}
  bg_ctx.restore()
  //bg_ctx.clearRect(-100, 0, 100, imp_vars.levelHeight)
  //bg_ctx.clearRect(imp_vars.levelWidth, 0, 100, imp_vars.levelHeight)
}

Level.prototype.process_gateway_particles = function(dt) {
  for (var i = 0; i < this.gateway_particles.length; i++) {
    var particle = this.gateway_particles[i];
    particle.prop += dt / this.gateway_particle_duration;
    // remove the particle
    if (particle.prop > 1) {
      this.gateway_particles.splice(i, 1);
    }
  }

  this.gateway_particle_gen_timer -= dt

  if (this.gateway_particle_gen_timer < 0) {
    this.gateway_particle_gen_timer += this.gateway_particle_gen_interval
    this.generate_gateway_particles(this.gateway_loc.x, this.gateway_loc.y, this.gateway_particles_per_round)
  }
}

Level.prototype.generate_gateway_particles = function(x, y, num_particles) {
  for (var i = 0; i < num_particles; i++) {
    var angle = Math.PI * 2 * i / num_particles + (Math.random() - 0.5) * Math.PI * 2 / num_particles
    this.gateway_particles.push({
      start_x: Math.cos(angle) * 1.5 * this.gateway_size + x,
      start_y: Math.sin(angle) * 1.4 * this.gateway_size + y,
      prop: 0
    });
  }
}

Level.prototype.draw_gateway_particles = function(ctx, draw_factor) {
  for(var i = 0; i < this.gateway_particles.length; i++) {
    var particle = this.gateway_particles[i];
    ctx.save()
    if (particle.prop < 0.25) {
      ctx.globalAlpha *= particle.prop * 4
    } else { 
      var temp = (1 - particle.prop) / (0.75)
      ctx.globalAlpha *= temp
    }
    ctx.beginPath()
    ctx.rect(
      draw_factor * (particle.start_x * (1 - particle.prop) + this.gateway_loc.x * particle.prop) - 3,
      draw_factor * (particle.start_y * (1 - particle.prop) + this.gateway_loc.y * particle.prop) - 3,
      6,
      6)
    ctx.fillStyle = impulse_colors["world " + this.world_num + " bright"]
    ctx.fill()
    ctx.restore()
  }
}

Level.prototype.create_enemy_images = function(enemy) {


}
