var Level = function(data) {
  this.init(data)
}

Level.prototype.init = function(data) {
  
  this.enemies_data = data.enemies
  this.enemy_spawn_timers = {}
  this.enemy_spawn_counters = {}
  this.enemy_numbers = {}

  for(i in this.enemies_data) {
    this.enemy_spawn_timers[i] = 0
    this.enemy_spawn_counters[i] = this.enemies_data[i][2]
    this.enemy_numbers[i] = 0
  }
  this.obstacle_num = data.obstacle_num
  this.get_obstacle_vertices = data.get_obstacle_vertices

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
    "feather": Feather,
    "goo": Goo,
    "disarmer": Disarmer,
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

      world.DestroyBody(this.enemies[dead_i].body)
      this.enemies.splice(dead_i, 1)
      console.log(this.enemies)
      
    }
    
    this.spawn_enemies(dt)


}

Level.prototype.spawn_enemies = function(dt) {
  for(i in this.enemy_spawn_timers) {
      //if we haven't reached the initial spawn time
    if(game_numbers.seconds < this.enemies_data[i][0]) continue
      
    //increment the spawn_counters
    this.enemy_spawn_counters[i] += dt/1000/60 * this.enemies_data[i][3]

    this.enemy_spawn_timers[i] += dt/1000
    if(this.enemy_spawn_timers[i] >= this.enemies_data[i][1]) {
      this.enemy_spawn_timers[i] -= this.enemies_data[i][1]
      for(var j = 1; j < this.enemy_spawn_counters[i]; j++) {
        this.spawn_this_enemy(i)
      }
    }
  }

}

Level.prototype.spawn_this_enemy = function(enemy_type) {
  //if at the cap, don't spawn more
  if(level.enemy_numbers[enemy_type] >= level.enemies_data[enemy_type][4]) return

  var r_p = getRandomOutsideLocation(5, 2)
  
  var temp_enemy = new this.enemy_map[enemy_type](world, r_p.x, r_p.y, this.enemy_counter)

  temp_enemy.type = enemy_type
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
    this.boundary_polygons.push(getBoundaryPolygon(temp_v, buffer_radius))
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

Level.prototype.getEnemyCap = function(time) {
  switch(this.id) {
    case 1:
      return Math.min(Math.floor(time), 20)
      break
  }
}

Level.prototype.getSpawnRate = function (time) {
  switch(this.id) {
    case 1:
      return Math.min(0.01+time/200*0.02, 0.03)
      break
  }
}

Level.prototype.getRandomEnemy = function(time) {
  switch(this.id) {
    case 1:
      var enemy_prob = [1,                              //Stunner
          Math.max(Math.min((time-10)/100, 0), 1),    //Spear

          Math.max(Math.min((time-20)/100, 0), 0),    //Tank
          Math.max(Math.min((time-30)/100, 0), 0),    //Feather
          Math.max(Math.min((time-40)/100, 0), 0),    //Goo
          Math.max(Math.min((time-50)/100, 0), 0),    //Disarmer
          Math.max(Math.min((time-60)/100, 0), 0),    //Crippler
          Math.max(Math.min((time-70)/100, 0), 0),    //Wisp
          Math.max(Math.min((time-80)/100, 0), 0),    //Fighter
          Math.max(Math.min((time-90)/100, 0), 0),    //DeathRay
          Math.max(Math.min((time-100)/100, 0), 0),    //Slingshot
          Math.max(Math.min((time-110)/100, 0), 0) ]   //Harpoon
      index = enemy_prob.length - 1
      var choice = Math.random()
      var cumul = enemy_prob[index]
      
      while( choice > cumul)
      {
        index-=1
        cumul+=enemy_prob[index]
      }
      console.log(enemy_prob)
      if( index == 4 || index == 5 || index == 6)
      {//impose a cap on number of trail-enemies
        if(this.trail_enemies_num >= this.trail_enemies_cap)
        {
          return 0
          return this.getRandomEnemy(time)
        }
      }
      console.log("RETURNING "+index +" "+choice)
      return index

      break

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

Level.prototype.has_won = function (game_numbers) {
  return game_numbers.kills >= this.kills_to_win
}

Level.prototype.get_win_progress_text = function (game_numbers) {
  return "KILLS LEFT: "+(Math.max(0, this.kills_to_win - game_numbers.kills))
}
