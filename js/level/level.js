var Level = function(data, impulse_game_state) {
  this.init(data, impulse_game_state)
}

Level.prototype.init = function(data, impulse_game_state) {
  this.impulse_game_state = impulse_game_state
  this.enemies_data = data.enemies
  this.enemy_spawn_timers = {}
  this.enemy_spawn_counters = {}
  this.enemy_numbers = {}
  this.level_name = data.level_name

  for(i in this.enemies_data) {
    this.enemy_spawn_timers[i] = this.enemies_data[i][1]
    this.enemy_spawn_counters[i] = this.enemies_data[i][2]
    this.enemy_numbers[i] = 0
  }
  this.cutoff_scores = data.cutoff_scores
  this.obstacle_num = data.obstacle_num
  this.get_obstacle_vertices = data.get_obstacle_vertices

  this.buffer_radius = data.buffer_radius

  this.boundary_polygons = []; //the polygons that enemies use to calculate pathfinding
  this.obstacle_polygons = []; //the actual polygons that kill players and enemies
  this.obstacles = []
  this.obstacle_edges = []

  this.obstacle_visibility = 1 //for Wisp
  this.obstacles_visible = true
  this.obstacle_vertices = []

  this.enemies = []
  this.enemy_counter = 0

  this.enemy_map = {
    "stunner": Stunner,
    "spear": Spear,
    "tank": Tank,
    "mote": Mote,
    "goo": Goo,
    "disabler": Disabler,
    "crippler": Crippler,
    "wisp": Wisp,
    "fighter": Fighter,
    "harpoon": Harpoon,
    "slingshot": Slingshot,
    "deathray": DeathRay
  }

  this.dead_enemies = []
  this.spawned_enemies = []

}

Level.prototype.process = function(dt) {
  //handle obstacle visibility
    if(this.obstacles_visible && this.obstacle_visibility < 1)
    {
      this.obstacle_visibility = Math.min(1, this.obstacle_visibility + dt/1000)
    }
    else if(!this.obstacles_visible && this.obstacle_visibility > 0)
    {
      this.obstacle_visibility = Math.max(0, this.obstacle_visibility - dt/1000)
    }

    this.dead_enemies = []
    this.spawned_enemies = []

    for(var i = 0; i < this.enemies.length; i++) {
      this.enemies[i].process(i, dt)
    }
    while(this.dead_enemies.length > 0)
    {
      var dead_i = this.dead_enemies.pop()
      
      this.enemy_numbers[this.enemies[dead_i].type] -= 1

      this.impulse_game_state.world.DestroyBody(this.enemies[dead_i].body)
      this.enemies.splice(dead_i, 1)
    }
    
    while(this.spawned_enemies.length > 0)
    {
      var new_enemy = this.spawned_enemies.pop()

      this.enemy_numbers[new_enemy.type] += 1
      this.enemies.push(new_enemy)
      
    }
    this.spawn_enemies(dt)
}

Level.prototype.spawn_enemies = function(dt) {
  for(var k in this.enemy_spawn_timers) {
      //if we haven't reached the initial spawn time
    if(this.impulse_game_state.game_numbers.seconds < this.enemies_data[k][0]) continue
    //increment the spawn_counters
    this.enemy_spawn_counters[k] += dt/1000/60 * this.enemies_data[k][3]

    this.enemy_spawn_timers[k] += dt/1000
    if(this.enemy_spawn_timers[k] >= this.enemies_data[k][1]) {
      this.enemy_spawn_timers[k] -= this.enemies_data[k][1]
      for(var j = 1; j < this.enemy_spawn_counters[k]; j++) {
        this.spawn_this_enemy(k)

      }
    }
  }

}

Level.prototype.spawn_this_enemy = function(enemy_type) {
  //if at the cap, don't spawn more
  if(this.enemy_numbers[enemy_type] >= this.enemies_data[enemy_type][4]) return

  var r_p = getRandomOutsideLocation(5, 2)
  
  var temp_enemy = new this.enemy_map[enemy_type](this.impulse_game_state.world, r_p.x, r_p.y, this.enemy_counter, this.impulse_game_state)

  this.enemies.push(temp_enemy)

  this.enemy_counter+=1

  this.enemy_numbers[enemy_type] += 1
}

Level.prototype.generate_obstacles = function() {
  console.log("GENERATING POLYGONS")
  //obstacles.push(new BasicObstacle(world, 30, 30, [[new b2Vec2(-10,-10), new b2Vec2(10, -10), new b2Vec2(-10, 10)], 
  //      [new b2Vec2(-30,-10), new b2Vec2(-10, -30), new b2Vec2(-10, -10)]]))
  for(var i = 0; i < this.obstacle_num; i++)
  {
    var temp_v = this.get_obstacle_vertices(i)
    this.obstacles.push(new BasicObstacle(temp_v))
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
  context.globalAlpha = this.obstacle_visibility
  for(var i = 0; i < this.obstacles.length; i++) {
    this.obstacles[i].draw(context, draw_factor)
  }
  context.globalAlpha = 1

  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].draw(ctx, draw_factor)
  }
}
