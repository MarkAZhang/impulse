var Level = function(data, impulse_game_state) {
  this.init(data, impulse_game_state)
}

Level.prototype.init = function(data, level_intro_state) {
  this.level_intro_state = level_intro_state
  this.impulse_game_state = null
  this.enemies_data = data.enemies
  this.enemy_spawn_timers = {}
  this.enemy_spawn_counters = {}
  this.enemy_numbers = {}
  this.level_name = data.level_name
  this.player_loc = data.player_loc

  this.spawn_points = data.spawn_points

  for(i in this.enemies_data) {
    this.enemy_spawn_timers[i] = this.enemies_data[i][1]
    this.enemy_spawn_counters[i] = this.enemies_data[i][2]
    this.enemy_numbers[i] = 0
  }
  this.cutoff_scores = data.cutoff_scores
  this.obstacle_num = data.obstacle_num
  this.obstacle_v = data.obstacle_v
  this.get_obstacle_vertices = data.get_obstacle_vertices
  this.color = impulse_colors["world "+this.level_intro_state.world_num]
  this.dark_color = impulse_colors["world "+this.level_intro_state.world_num+" dark"]

  this.buffer_radius = data.buffer_radius

  this.boundary_polygons = []; //the polygons that enemies use to calculate pathfinding
  this.obstacle_polygons = []; //the actual polygons that kill players and enemies
  this.obstacles = []
  this.obstacle_edges = []

  this.obstacle_visibility = 1 //for Wisp
  this.obstacles_visible_timer = 0
  this.obstacle_vertices = []

  this.enemies = []
  this.enemy_counter = 0

  this.fragments = []

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
    "slingshot": Slingshot,
    "deathray": DeathRay,
    "first boss": BossOne,
    "second boss": BossTwo,
    "third boss": BossThree,
    "fourth boss": BossFour,
    "boss four spawner": BossFourSpawner,
  }

  this.dead_enemies = []
  this.expired_enemies = []
  this.spawned_enemies = []

  this.spawn_queue = [] //enemies that need to be spawned

  this.spawn_interval = 100
  this.spawn_timer = this.spawn_interval

  this.boss_delay_interval = 10000
  this.boss_delay_timer = 0
  this.boss_radius = 3
  this.boss = null
  this.boss_kills = 0

}

Level.prototype.reset = function() {
  this.enemies = []
  this.enemy_counter = 0
  this.spawn_interval = 100
  this.spawn_timer = this.spawn_interval
  this.obstacle_visibility = 1 //for Wisp
  this.obstacles_visible_timer = 0
  this.boss_delay_interval = 10000
  this.boss_delay_timer = 0
  this.boss_radius = 3
  this.boss = null
  this.boss_kills = 0
  for(i in this.enemies_data) {
    this.enemy_spawn_timers[i] = this.enemies_data[i][1]
    this.enemy_spawn_counters[i] = this.enemies_data[i][2]
    this.enemy_numbers[i] = 0
  }

  this.dead_enemies = []
  this.expired_enemies = []
  this.spawned_enemies = []
  this.spawn_queue = []
}

Level.prototype.process = function(dt) {

    if(this.boss_delay_timer > 0) {
      this.boss_delay_timer -= dt
    }
  //handle obstacle visibility
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
    }

    for(var i = this.fragments.length - 1; i >= 0; i--) {
      this.fragments[i].process(dt);
      if(this.fragments[i].isDone()) {
        this.fragments.splice(i, 1);
      }
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
    }

    while(this.expired_enemies.length > 0)
    {
      var dead_i = this.expired_enemies.pop()

      this.enemy_numbers[this.enemies[dead_i].type] -= 1
      if((impulse_enemy_stats[this.enemies[dead_i].type].className).prototype.is_boss) {
        this.boss_delay_timer = this.boss_delay_interval
        this.boss_radius = impulse_enemy_stats[this.enemies[dead_i].type].effective_radius
        this.boss = null
        this.boss_kills += 1
      }

      this.enemies.splice(dead_i, 1)

    }

    while(this.spawned_enemies.length > 0)
    {
      var new_enemy = this.spawned_enemies.pop()

      this.enemy_numbers[new_enemy.type] += 1
      this.enemies.push(new_enemy)

    }


    this.check_enemy_spawn_timers(dt)

    if(this.spawn_timer >= 0) {
      this.spawn_timer -= dt
    }
    else {
      if(this.spawn_queue.length > 0) {
        var enemy_type_to_spawn = this.spawn_queue[0]
        this.spawn_queue = this.spawn_queue.slice(1)
        this.spawn_this_enemy(enemy_type_to_spawn)
        this.spawn_timer = this.spawn_interval
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
      for(var j = 1; j <= this.enemy_spawn_counters[k]; j++) {
        this.spawn_queue.push(k)

      }
    }
  }
}

//v = {x: 0, y: 0}
Level.prototype.add_fragments = function(enemy_type, loc, v, shadowed) {
  this.fragments.push(new FragmentGroup(enemy_type, loc, v, shadowed))

}

Level.prototype.spawn_this_enemy = function(enemy_type) {

  var this_enemy = impulse_enemy_stats[enemy_type].className

  if(this_enemy.prototype.is_boss && this.boss_delay_timer > 0) return

  //if at the cap, don't spawn more
  if(this.enemy_numbers[enemy_type] >= this.enemies_data[enemy_type][4]) return


  if(this_enemy.prototype.is_boss) {
    var temp_enemy = new this_enemy(this.impulse_game_state.world, levelWidth/draw_factor/2, (levelHeight)/draw_factor/2, this.enemy_counter, this.impulse_game_state)
  }
  else if(this.spawn_points) {
    var r_p = this.spawn_points[Math.floor(Math.random() * this.spawn_points.length)]
    var temp_enemy = new this_enemy(this.impulse_game_state.world, r_p[0]/draw_factor, r_p[1]/draw_factor, this.enemy_counter, this.impulse_game_state)
  }
  else {
    var r_p = getRandomOutsideLocation(5, 2)
    var temp_enemy = new this_enemy(this.impulse_game_state.world, r_p.x, r_p.y, this.enemy_counter, this.impulse_game_state)
  }

  this.enemies.push(temp_enemy)

  this.enemy_counter+=1

  this.enemy_numbers[enemy_type] += 1

  if(this_enemy.prototype.is_boss) this.boss = temp_enemy
}

Level.prototype.generate_obstacles = function() {
  console.log("GENERATING POLYGONS")
  //obstacles.push(new BasicObstacle(world, 30, 30, [[new b2Vec2(-10,-10), new b2Vec2(10, -10), new b2Vec2(-10, 10)],
  //      [new b2Vec2(-30,-10), new b2Vec2(-10, -30), new b2Vec2(-10, -10)]]))

  if(this.obstacle_num == null && this.obstacle_v.length) {
    this.obstacle_num = this.obstacle_v.length
  }

  for(var i = 0; i < this.obstacle_num; i++)
  {
    var temp_v = this.get_obstacle_vertices(i)
    this.obstacles.push(new BasicObstacle(temp_v, this.color, this.dark_color))
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

Level.prototype.draw = function(context, draw_factor) {
  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].pre_draw(context, draw_factor)
  }
  //context.globalAlpha = this.obstacle_visibility

  for(var i = 0; i < this.fragments.length; i++) {
    this.fragments[i].draw(ctx, draw_factor)
  }

  context.globalAlpha = 1

  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].draw(ctx, draw_factor)
  }

  if(this.boss_delay_timer >= 0) {

    context.beginPath()
    context.arc(levelWidth/draw_factor/2 * draw_factor, (levelHeight)/draw_factor/2 * draw_factor, (this.boss_radius * 2 *draw_factor), -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (this.boss_delay_timer / this.boss_delay_interval), true)

    context.lineWidth = 2
    context.strokeStyle = "gray"
    context.stroke()

    context.restore()
    context.globalAlpha = 1
  }
}
Level.prototype.draw_bg = function(bg_ctx) {
  draw_bg(bg_ctx, 0, 0, levelWidth, levelHeight, "Hive "+this.level_intro_state.world_num)
  console.log("BG DRAWN")
  for(var i = 0; i < this.obstacles.length; i++) {
    this.obstacles[i].draw(bg_ctx, draw_factor)
  }
}
