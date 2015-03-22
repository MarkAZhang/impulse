var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');
var enemyData = require('../data/enemy_data.js');
var layers = require('../core/layers.js');
var levelData = require('../data/level_data.js');
var music_player = require('../core/music_player.js');
var objectRenderUtils = require('../render/object.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');
var utils = require('../core/utils.js');

var BasicObstacle = require('../obstacle/basic_obstacle.js');
var EnemyFactory = require('../enemy/enemy_factory.js');
var EnemySpawner = require('../level/enemy_spawner.js');
var FragmentGroup = require('../render/fragment_group.js');

var Level = function(data, impulse_game_state) {
  this.init(data, impulse_game_state)
}

Level.prototype.init = function(data, level_intro_state) {

  this.world_num = level_intro_state.world_num

  this.level_intro_state = level_intro_state
  this.impulse_game_state = null
  this.spawn_pattern = data.spawn_pattern;
  this.impulse_disabled = data.impulse_disabled;

  // If the player has died, we tell the level to blow up enemies and other maintenance to prepare for restart.
  this.restarting_level = false;

  // The length of effects that occur during restart.
  this.restarting_effects_duration = 500;

  // Retrieve enemy data. Use easy mode if necessary but default to normal.
  if (saveData.difficultyMode == "easy") {
    this.enemies_data = data.enemies_easy
  }
  if (!this.enemies_data) {
    this.enemies_data = data.enemies
  } else {
    this.using_enemies_easy = true
  }

  if (saveData.difficultyMode == "easy") {
    this.initial_spawn_data = data.initial_spawn_data_easy
  }
  if (!this.initial_spawn_data) {
    this.initial_spawn_data = data.initial_spawn_data
  } else {
    this.using_initial_spawn_data_easy = true
  }
  this.enemy_numbers = {}
  this.level_name = data.level_name
  this.is_level_zero = (parseInt(this.level_name.substring(7, 8)) === 0);
  if (this.is_level_zero) {
    this.world_num = 0;
  }

  if (saveData.difficultyMode == "easy") {
    this.multi_spawn_points = data.multi_spawn_points_easy
  }
  if (!this.multi_spawn_points) {
    this.multi_spawn_points = data.multi_spawn_points
  }

  this.pick_alt_path = data.pick_alt_path

  this.starting_loc = data.player_loc
  if (saveData.difficultyMode == "easy" && data.player_loc_easy) {
    this.starting_loc = data.player_loc_easy
  }
  this.player_loc = this.get_starting_loc()

  this.spawn_points = data.spawn_points

  this.order_spawn_points();

  this.obstacle_num = data.obstacle_num

  if (saveData.difficultyMode == "easy") {
    this.obstacle_v = data.obstacle_v_easy
  }
  if (!this.obstacle_v) {
    this.obstacle_v = data.obstacle_v
  }
  this.get_obstacle_vertices = data.get_obstacle_vertices
  this.color = constants.colors["world "+level_intro_state.world_num]
  this.dark_color = constants.colors["world "+level_intro_state.world_num+" dark"]
  this.lite_color = constants.colors["world "+level_intro_state.world_num+" lite"]
  this.bright_color = constants.colors["world "+level_intro_state.world_num+" bright"]
  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"
  if(!this.is_boss_level) {
    this.level_number = parseInt(this.level_name.slice(this.level_name.length-1, this.level_name.length))
    this.cutoff_scores = data.cutoff_scores[saveData.difficultyMode]
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

  if (data.gateway_loc) {
    this.gateway_loc = {x: data.gateway_loc.x/constants.drawFactor, y: data.gateway_loc.y/constants.drawFactor}
  } else {
    this.gateway_loc = {x: this.get_starting_loc().x/constants.drawFactor, y: this.get_starting_loc().y/constants.drawFactor}
  }
  this.gateway_size = 4

  this.gateway_pulse_radius = 300

  this.gateway_transition_interval = 1000
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
  this.flash_obstacle_color = null;
  this.flash_obstacle_prop = 0;
}

Level.prototype.get_starting_loc = function() {
  return this.starting_loc
}

Level.prototype.prepare_level_for_reset = function() {
  this.restarting_level = true;
  this.restarting_timer = this.restarting_effects_duration;
  for (var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].start_death("fade")
  }
}

Level.prototype.reset = function() {

  if(this.impulse_game_state && this.impulse_game_state.main_game) {
    this.main_game = true
  } else {
    this.main_game = false
  }
  this.restarting_level = false;
  this.enemies = []
  this.fragments = []
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

  this.multi_loc = null
  this.multi_duration = null
  this.multi_life = 10000
  this.multi_value = null
}

Level.prototype.generate_multi = function() {
  var multi_index = Math.floor(Math.random() * this.multi_spawn_points.length)
  this.multi_loc = {x: this.multi_spawn_points[multi_index][0], y: this.multi_spawn_points[multi_index][1]};
  var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * constants.drawFactor, y: this.impulse_game_state.player.body.GetPosition().y * constants.drawFactor}
  while(utils.pDist(player_loc,  this.multi_loc) < 125) {
    multi_index+=1
    multi_index = multi_index % this.multi_spawn_points.length
    this.multi_loc = {x: this.multi_spawn_points[multi_index][0], y: this.multi_spawn_points[multi_index][1]};
  }

  this.multi_duration = this.multi_life
  this.multi_value = 1
}

Level.prototype.process = function(dt) {
  //handle obstacle visibility
  if (!this.is_boss_level && this.multi_spawn_points.length > 0 && this.impulse_game_state.combo_enabled) {

    this.multi_duration -= dt
    if(this.multi_loc == null || this.multi_duration < 0) {
      this.generate_multi()
    } else {
      var player_loc = {x: this.impulse_game_state.player.body.GetPosition().x * constants.drawFactor, y: this.impulse_game_state.player.body.GetPosition().y * constants.drawFactor}
      if(utils.pDist(player_loc, this.multi_loc) < 25) {
        music_player.play_sound("multi")
        this.impulse_game_state.game_numbers.base_combo += 5
        this.impulse_game_state.game_numbers.combo =
          this.impulse_game_state.game_numbers.base_combo + Math.floor(this.impulse_game_state.game_numbers.seconds/10)
        //this.add_fragments("multi", {x: this.multi_loc.x, y: this.multi_loc.y})
        this.impulse_game_state.addScoreLabel(
          "x" + this.impulse_game_state.game_numbers.combo,
          "white",
          this.multi_loc.x / constants.drawFactor,
          this.multi_loc.y / constants.drawFactor,
          20,
          2000);
        this.generate_multi()
      }
    }
  }

  if(this.gateway_transition_duration != null) {
    if(this.gateway_transition_duration > 0) {
      this.gateway_transition_duration -= dt
    } else {
      layers.bgCtx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
      this.draw_bg(layers.bgCtx)
      layers.bgCtx.translate(-constants.sideBarWidth, 0)//allows us to have a topbar
      this.gateway_transition_duration = null
    }
  }

  if (this.restarting_level) {
    this.restarting_timer -= dt;
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
  if (this.obstacles_visible_timer > 0) {
    this.obstacles_visible_timer -= dt
  }

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
    if(this.enemies[dead_i].type === "harpoon" ) {
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
    if (this.level_name == "HIVE 0-3" && this.impulse_game_state.gateway_unlocked) {
      // Do not spawn enemies if we're on tutorial level and have already unlocked gateway.
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
  }

  if(this.boss_victory) {
    for(var i = 0; i < this.enemies.length; i++) {
      if(!this.enemies[i].dying)
        this.enemies[i].start_death("kill")
    }
  }
}

Level.prototype.order_spawn_points = function() {
  this.spawn_points.sort(function(a, b) {
    var angle_a = utils.atan({x: 400, y: 300}, {x: a[0], y: a[1]});
    var angle_b = utils.atan({x: 400, y: 300}, {x: b[0], y: b[1]});
    return angle_a - angle_b;
  })
}

Level.prototype.initial_spawn = function() {
  if(this.initial_spawn_data) {
    var enemy_type_list = [];
    for(var enemy in this.initial_spawn_data) {

      var num_enemies_to_spawn = this.initial_spawn_data[enemy]
      if(!this.is_boss_level && saveData.difficultyMode == "easy" && !this.using_initial_spawn_data_easy) {
        num_enemies_to_spawn = Math.max(1, 0.5 * num_enemies_to_spawn)
      }

      for (var i = 0; i < num_enemies_to_spawn; i++) {
        enemy_type_list.push(enemy);
      }

      if (this.spawn_pattern == "separate_by_type") {
        this.spawn_enemy_set(enemy_type_list);
        enemy_type_list = [];
      }
    }
    if (this.spawn_pattern != "separate_by_type") {
      this.spawn_enemy_set(enemy_type_list);
    }
  }
}

Level.prototype.spawn_enemy_set = function(enemy_type_list) {
  var pivot_spawn_index = this.pick_pivot_spawn_index();
  var enemies_left = enemy_type_list.slice(0);
  for (var i = 0; i < enemy_type_list.length; i++) {
    // Spread the spawn around the unit circle.
    var next_spawn_index = pivot_spawn_index + Math.floor(i / enemy_type_list.length * this.spawn_points.length);
    var enemy_index = Math.floor(Math.random() * enemies_left.length);
    this.spawn_this_enemy(enemies_left[enemy_index], next_spawn_index);
    enemies_left.splice(enemy_index, 1);
  }
}

Level.prototype.pick_pivot_spawn_index = function() {
  // Pick the spawn point furthest from any enemy.
  if (this.spawn_pattern == "spread") {
    var max_distance = 0;
    var best_spawn_point = Math.floor(Math.random() * this.spawn_points.length);
    for (var i = 0; i < this.spawn_points.length; i++) {
      var spawn_point = {x: this.spawn_points[i][0] / constants.drawFactor, y: this.spawn_points[i][1] / constants.drawFactor};
      var min_dist = -1;
      for (var j = 0; j < this.enemies.length; j++) {
        var dist_to_enemy = utils.pDist(this.enemies[j].body.GetPosition(), spawn_point);
        if (min_dist == -1 || dist_to_enemy < min_dist) {
          min_dist = dist_to_enemy;
        }
      }
      if (min_dist > max_distance) {
        max_distance = min_dist;
        best_spawn_point = i;
      }
    }
    return best_spawn_point;
  } else {
    // The default is a random spawn point.
    return Math.floor(Math.random() * this.spawn_points.length)
  }
}

Level.prototype.check_enemy_spawn_timers = function(dt) {
  if (this.is_boss_level) return

  var enemy_type_list = [];

  for(var enemy_type in this.enemy_spawners) {
    var enemy_spawner = this.enemy_spawners[enemy_type]

    enemy_spawner.process(dt, this.impulse_game_state.game_numbers.seconds);

    var num_enemies_to_spawn = enemy_spawner.get_spawn_number(this.impulse_game_state.game_numbers.seconds);

    if(num_enemies_to_spawn > 0) {

      if(saveData.difficultyMode == "easy" && !this.using_enemies_easy) {
        num_enemies_to_spawn = Math.max(1, 0.5 * num_enemies_to_spawn)
      }

      for (var i = 1; i <= num_enemies_to_spawn; i++) {
        enemy_type_list.push(enemy_type);
      }
    }
  }
  this.spawn_enemy_set(enemy_type_list);
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
  if(enemy_type == "player" || enemy_type == "shadow" || enemy_type == "multi" || enemy_type.slice(enemy_type.length - 4, enemy_type.length) == "boss"
    || (this.total_fragments < this.max_fragments && saveData.optionsData.explosions)) {
      this.fragments.push(new FragmentGroup(enemy_type, loc, v, shadowed))
      this.total_fragments += 4;
  }
}

Level.prototype.spawn_this_enemy = function(enemy_type, spawn_point) {
  if (this.restarting_level) {
    return
  }

  var this_enemy = EnemyFactory.getEnemyClassFromType(enemy_type);

  if(this_enemy.prototype.is_boss && this.boss_spawned) {
    return;
  }

  //if at the cap, don't spawn more
  if(this.enemy_numbers[enemy_type] >= this.enemy_spawners[enemy_type].get_max_enemies()) {
    return
  }

  if(this_enemy.prototype.is_boss) {
    var temp_enemy = new this_enemy(this.impulse_game_state.world, constants.levelWidth/constants.drawFactor/2, (constants.levelHeight)/constants.drawFactor/2, this.enemy_counter, this.impulse_game_state)
    this.boss = temp_enemy
    this.boss_spawned = true
  }
  else if(this.spawn_points) {
    var r_p = this.spawn_points[spawn_point % this.spawn_points.length]
    var temp_enemy = new this_enemy(this.impulse_game_state.world, r_p[0]/constants.drawFactor, r_p[1]/constants.drawFactor, this.enemy_counter, this.impulse_game_state)
  }
  else {
    var r_p = utils.getRandomOutsideLocation(5, 2)
    var temp_enemy = new this_enemy(this.impulse_game_state.world, r_p.x, r_p.y, this.enemy_counter, this.impulse_game_state)
  }

  this.add_enemy(temp_enemy)
}

Level.prototype.add_enemy = function(enemy) {
  this.enemies.push(enemy)

  this.enemy_counter+=1

  this.enemy_numbers[enemy.type] += 1

  if(enemy.is_boss) this.boss = enemy

  if(enemy.has_bulk_draw && !this.bulk_draw_enemies.hasOwnProperty(enemy.type)) {
    this.bulk_draw_enemies[enemy.type] = enemy.bulk_draw_nums
  }
}

Level.prototype.generate_obstacles = function() {

  if(this.obstacle_num == null && this.obstacle_v.length) {
    this.obstacle_num = this.obstacle_v.length
  }

  for(var i = 0; i < this.obstacle_num; i++)
  {
    var temp_v = this.get_obstacle_vertices(i)
    if (this.is_level_zero) {
      this.obstacles.push(new BasicObstacle(temp_v,
        constants.colors["world "+this.world_num+" lite"],
        constants.colors["world "+this.world_num+" dark"]))
    } else {
      this.obstacles.push(new BasicObstacle(temp_v,
        constants.colors["world "+this.level_intro_state.world_num+" lite"],
        constants.colors["world "+this.level_intro_state.world_num+" dark"]))
    }
    this.obstacle_polygons.push(temp_v)
    for(var j = 0; j < temp_v.length; j++) {
      this.obstacle_vertices.push(temp_v[j])
    }
    this.boundary_polygons.push(utils.getBoundaryPolygon(temp_v, this.buffer_radius))
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
  if(this.is_boss_level) {
    if (!this.impulse_game_state.boss_after_death_actions) {
      return;
    }
  }
  var world_num = this.level_intro_state.world_num;
  if (this.is_boss_level && this.boss && (this.boss.dying || this.boss.died)) {
    world_num = 0;
  }
  ctx.save()

  if(this.gateway_transition_duration != null && this.world_num <= 4) {
    var prog = Math.max(this.gateway_transition_duration / this.gateway_transition_interval, 0);
    ctx.globalAlpha *= 0.3 + 0.2 * (1-prog)
    ctx.strokeStyle = constants.colors["world "+world_num+" bright"]
    if (this.level_name != "HIVE 0-1" && this.level_name != "HIVE 0-2" && !this.is_level_zero) {
      ctx.save();
      if (prog > 0.5) {
        // go from 0.3 to 0.8
        ctx.globalAlpha = 0.3 + (1 - prog)
      } else {
        // go from 0.8 to 0
        ctx.globalAlpha = Math.max(0, 0 + 1.6 * (prog))
      }
      ctx.beginPath();
      ctx.arc(
        this.gateway_loc.x * draw_factor,
        this.gateway_loc.y * draw_factor,
        this.gateway_pulse_radius * (1 - prog),
        0,
        Math.PI * 2
      )
      ctx.lineWidth = 2 + 8 * prog;
      ctx.stroke();
      ctx.restore();
    }
  }
  else if(this.impulse_game_state && this.gateway_opened && this.world_num <= 4) {
    ctx.globalAlpha *= 0.7
  } else {
    ctx.globalAlpha *= 0.3
  }
  uiRenderUtils.drawTessellationSign(
    ctx,
    world_num,
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

Level.prototype.flash_obstacles = function(color, prop) {
  this.flash_obstacle_prop = prop;
  this.flash_obstacle_color = color;
}

Level.prototype.draw = function(context, draw_factor) {
  context.save()

  if (this.flash_obstacle_prop > 0) {
    context.save();
    context.globalAlpha = this.flash_obstacle_prop;

    for(var i = 0; i < this.obstacles.length; i++) {
      var origColor = this.obstacles[i].color;
      this.obstacles[i].color = this.flash_obstacle_color;
      this.obstacles[i].draw(context, constants.drawFactor)
      this.obstacles[i].color = origColor;
    }
    context.restore();
  }

  if(this.multi_loc) {
    var prog = this.multi_duration/this.multi_life;
    context.save()
    context.globalAlpha *= Math.min(1, (1 - 2*Math.abs(prog-0.5))/.7)

    // if restarting level, force the multi to fade.
    if (this.restarting_level) {
      context.globalAlpha *= Math.max(0, this.restarting_timer / this.restarting_effects_duration)
    }

    objectRenderUtils.drawMultiPowerup(context, this.multi_loc.x, this.multi_loc.y, prog)
    context.restore()

  }

  if(this.redraw_bg) {
    layers.bgCtx.translate(constants.sideBarWidth, 0)//allows us to have a topbar
    this.draw_bg(layers.bgCtx, true)
    layers.bgCtx.translate(-constants.sideBarWidth, 0)//allows us to have a topbar
    this.redraw_bg = false
  }

  if (this.enemy_visibility != 1) {
    context.save();
    context.globalAlpha *= this.enemy_visibility;
  }

  for(var i = 0; i < this.fragments.length; i++) {
    this.fragments[i].draw(context, draw_factor)
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

  if (this.enemy_visibility != 1) {
    context.restore();
  }

  if(this.boss_delay_timer >= 0) {

    context.beginPath()
    context.arc(constants.levelWidth/draw_factor/2 * draw_factor, (constants.levelHeight)/draw_factor/2 * draw_factor, (this.boss_radius * 2 *draw_factor), -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (this.boss_delay_timer / this.boss_delay_interval), true)

    context.lineWidth = 2
    context.strokeStyle = "gray"
    context.stroke()

    context.globalAlpha = 1
  }

  context.restore()
}

Level.prototype.final_draw = function(context, draw_factor) {
};

Level.prototype.open_gateway = function() {
  this.gateway_transition_duration = this.gateway_transition_interval
  this.gateway_opened = true
}

Level.prototype.draw_bg = function(bg_ctx, omit_gateway) {
  bg_ctx.save()
  bg_ctx.beginPath();
  bg_ctx.rect(0, 0, constants.levelWidth, constants.levelHeight)
  bg_ctx.fillStyle = this.dark_color;
  bg_ctx.fill();
  bg_ctx.clip()

  if (this.world_num != null && this.is_boss_level && this.boss && (this.boss.dying || this.boss.died)) {
    bg_ctx.save();
    uiRenderUtils.tessellateBg(bg_ctx, 0, 0, constants.levelWidth, constants.levelHeight, "Hive 0")
    bg_ctx.restore();
  } else if(this.world_num != null && !this.is_level_zero) {
    bg_ctx.save();
    uiRenderUtils.tessellateBg(bg_ctx, 0, 0, constants.levelWidth, constants.levelHeight, "Hive "+this.world_num)
    bg_ctx.restore();
  } else if (this.world_num != null && this.is_level_zero) {
    bg_ctx.save();
    uiRenderUtils.tessellateBg(bg_ctx, 0, 0, constants.levelWidth, constants.levelHeight, "Hive 0");
    bg_ctx.restore();
  } else {
    bg_ctx.fillStyle = constants.colors["world 0 bright"]
    bg_ctx.fillRect(0, 0, constants.levelWidth, constants.levelHeight)
  }

  if (this.is_level_zero) {
    bg_ctx.save();
    var r = 0.15;
    var x = this.gateway_loc.x * constants.drawFactor;
    var y = this.gateway_loc.y * constants.drawFactor;
    uiRenderUtils.tessellateBg(bg_ctx, x - constants.levelWidth * r, y - constants.levelHeight * r,
      x + constants.levelWidth * r, y + constants.levelHeight * r,
      "Hive "+this.level_intro_state.world_num);
    bg_ctx.restore();
    bg_ctx.beginPath();
    bg_ctx.rect(x - constants.levelWidth * r, y - constants.levelHeight * r,
      2 * constants.levelWidth * r, 2 * constants.levelHeight * r);
    bg_ctx.lineWidth = 2;
    bg_ctx.strokeStyle = constants.colors["world " + this.level_intro_state.world_num + " dark"];
    bg_ctx.stroke();
  }


  for(var i = 0; i < this.obstacles.length; i++) {
    this.obstacles[i].draw(bg_ctx, constants.drawFactor)
  }

  // Draw any additional rectangles to hide obstacle seams.
  if ((this.is_boss_level || this.is_level_zero) && this.obstacle_polygons.length > 0) {
    bg_ctx.fillStyle = constants.colors["world " + this.world_num + " dark"]
    bg_ctx.fillRect(375, 0, 50, 22);
    bg_ctx.fillRect(375, 578, 50, 22);
    bg_ctx.fillRect(0, 275, 22, 50);
    bg_ctx.fillRect(778, 275, 22, 50);
  } else if (this.level_name == "HIVE 0-3") {
    bg_ctx.fillStyle = constants.colors["world " + this.world_num + " dark"]
    bg_ctx.fillRect(0, 0, 47, 600);
    bg_ctx.fillRect(753, 0, 47, 600);
  } else if (this.level_name == "HIVE 0-4") {
    bg_ctx.fillStyle = constants.colors["world " + this.world_num + " dark"]
    bg_ctx.fillRect(0, 0, 800, 47);
    bg_ctx.fillRect(0, 553, 800, 47);
  }

  if (this.is_level_zero) {
    bg_ctx.fillStyle = constants.colors["world " + this.level_intro_state.world_num + " bright"];
    bg_ctx.textAlign = "center";
    bg_ctx.font = "32px Muli";
    bg_ctx.fillText(levelData.hiveNames[this.level_intro_state.world_num], 400, 150);
    bg_ctx.font = "16px Muli";
    bg_ctx.fillText("8 LEVELS", 400, 170);
  }

  bg_ctx.restore()
}

Level.prototype.process_gateway_particles = function(dt) {
  for (var i = 0; i < this.gateway_particles.length; i++) {
    var particle = this.gateway_particles[i];
    particle.prop += dt / this.gateway_particle_duration;
  }
  for (var i = this.gateway_particles.length - 1; i >= 0; i--) {
    var particle = this.gateway_particles[i];
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
    if (this.is_boss_level && this.boss && (this.boss.dying || this.boss.died)) {
      ctx.fillStyle = constants.colors["world 0 bright"];
    } else if (this.is_level_zero) {
      ctx.fillStyle = constants.colors["world " + this.level_intro_state.world_num + " bright"]
    } else {
      ctx.fillStyle = constants.colors["world " + this.world_num + " bright"]
    }
    ctx.fill()
    ctx.restore()
  }
}

Level.prototype.create_enemy_images = function(enemy) {

}

Level.prototype.clear_obstacles = function () {
  // Only really used for boss level.
  this.boundary_polygons = []; //the polygons that enemies use to calculate pathfinding
  this.obstacle_polygons = []; //the actual polygons that kill players and enemies
  this.obstacles = []
  this.obstacle_edges = []
  this.obstacle_vertices = []
}

Level.prototype.dispose = function() {
}

module.exports = Level;
