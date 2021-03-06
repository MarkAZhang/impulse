var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');
var enemyData = require('../data/enemy_data.js');
var music_player = require('../core/music_player.js');
var renderUtils = require('../render/utils.js');
var saveData = require('../load/save_data.js');
var sprites = require('../render/sprites.js');
var utils = require('../core/utils.js');

var Boss = require('../enemy/boss.js');
var BossFourAttacker = require('../enemy/boss_four_attacker.js');
var BossFourSpawner = require('../enemy/boss_four_spawner.js');

BossFour.prototype = new Boss()

BossFour.prototype.constructor = BossFour

function BossFour(world, x, y, id, impulse_game_state) {
  this.type = "boss_four"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.do_yield = false

  this.safe = true

  this.body.SetAngle(Math.PI/2)

  this.visibility = 0

  this.red_visibility = 0

  this.spawn_interval = 1000
  if (this.impulse_game_state.first_time && this.impulse_game_state.main_game) {
    this.spawn_interval = 2300
  }
  this.spawn_duration = this.spawn_interval
  this.spawn_particle_duration = 1500 * this.spawn_interval / 6600;
  this.spawn_particle_interval = 250 * this.spawn_interval / 6600;

  // Need to reset shake_level since the spawn_interval is shorter.
  if (this.impulse_game_state.first_time && this.impulse_game_state.level.main_game) {
    this.impulse_game_state.shake_level(this.spawn_interval);
  }

  this.spawned = false

  this.anger_level = 0;
  this.anger_level_max = 5;
  this.anger_level_cooloff_period = 1000;
  this.anger_level_cooloff_timer = 0;

  this.spawn_laser_angle = Math.PI/2
  this.spawn_laser_colors = ["#000000", "#110000", "#660000", "#990000", "#cc0000", "#ff0000"];
  this.spawn_laser_flare_prop = 0;
  this.spawn_laser_flare_transition_period_base = 250;

  this.spawn_laser_revolution_base = 20000

  if (saveData.difficultyMode == "easy") {
    this.spawn_laser_revolution_base = 30000
  }

  this.spawn_laser_radius_base = 0.2

  this.spawner_spawn_count = {
   "stunner" : 8,
   "spear" : 5,
   "tank" : 6,
   "mote" : 6,
   "goo" : 1,
   "harpoon" : 4,
   "orbiter" : 5,
   "disabler" : 1,
   "fighter" : 3,
   "slingshot" : 4,
   "troll" : 6,
   "deathray" : 2
 }

 this.spawner_spawn_count_easy = {
   "stunner" : 6,
   "spear" : 4,
   "tank" : 4,
   "mote" : 4,
   "goo" : 1,
   "harpoon" : 3,
   "orbiter" : 3,
   "disabler" : 1,
   "fighter" : 2,
   "slingshot" : 2,
   "troll" : 4,
   "deathray" : 1
 }

 this.spawner_spawn_force = {
  "stunner" : 10,
   "spear" : 10,
   "tank" : 75,
   "mote" : 10,
   "goo" : 20,
   "harpoon" : 20,
   "orbiter" : 8,
   "disabler" : 20,
   "fighter" : 30,
   "slingshot" : 10,
   "troll" : 10,
   "deathray" : 50
 }


  this.spawn_order = ["stunner", "spear", "fighter", "orbiter", "troll", "goo", "harpoon", "deathray", "slingshot", "mote", "tank", "disabler", ]
  if (saveData.difficultyMode == "normal") {
    this.spawn_order = ["spear", "mote", "fighter", "orbiter", "troll", "goo", "harpoon", "deathray", "slingshot", "stunner", "tank", "disabler"]
  }

  this.spawn_counter = 0

  this.possible_spawn_sets = [

  ["fighter", "spear"],
  ["goo", "troll"],
  ["tank", "disabler"],
  ["stunner", "deathray"],
  ["mote", "slingshot"],
  ["orbiter", "spear"],
  ["harpoon", "goo"]
 ]

  this.spawner_push_force = 500
  this.spawner_interval = 22000//19000
  this.spawner_timer = 0

  this.last_object_hit = null

  this.laser_check_timer = 2
  this.laser_check_counter = this.laser_check_timer
  this.laser_check_diff = Math.PI/4

  this.laser_target_visible = true
  this.laser_target_visibility = 1

  this.num_buds = 5
  this.buds = []

  this.ready_attack_bud = null;
  this.ready_bud_queue = [];

  this.spawner_bud_frequency = 4;

  if (saveData.difficultyMode == "easy") {
    this.spawner_bud_frequency = 4;
  }

  this.attack_bud_expand_period = 10000

  if (saveData.difficultyMode == "easy") {
    this.attack_bud_expand_period = 12000
  }

  this.attack_bud_charging = false
  this.attack_bud_charge_period = 1250
  this.attack_bud_charge_timer = this.attack_bud_charge_period
  this.attack_bud_cooldown_timer = 0
  this.attack_bud_cooldown_period = 1000
  if (saveData.difficultyMode == "easy") {
    this.attack_bud_cooldown_period = 1500
  }

  this.initial_spawn = false
  this.do_initial_spawn = true
  this.body_bud_radius = enemyData[this.type].body_bud_radius
  this.createBodyBuds()

  this.turn_rate = 4000
  this.spawner_force = 2000

  this.bud_count = 0

  this.tank_force = 100

  if (saveData.difficultyMode) {
    this.tank_force = 70
  }

  this.darkness_interval = 20000
  this.darkness_timer = this.darkness_interval - 1
  // The time it takes for the darkness to spread.
  this.darkness_spreading_duration = 1000
  // How long the darkness stays.
  this.darkness_duration = 1000
  // How long the darkness takes to vanish.
  this.darkness_vanish_duration = 1000

  this.darkness_canvas = document.createElement('canvas');
  this.darkness_canvas_ctx = this.darkness_canvas.getContext('2d');
  this.darkness_canvas.width = 200;
  this.darkness_canvas.height = 200;
  // The angle at which to draw the darkness. When the darkness spreads, it should no longer rotate with the boss.
  this.darkness_angle = 0;

  this.darkness_canvas_ctx.beginPath()

  this.darkness_canvas_ctx.moveTo(100 + 100 * Math.cos(Math.PI * 2 * 4 / 5),
                  100 + 100 * Math.sin(Math.PI * 2 * 4 / 5));
  for (var i = 0; i < 5; i++) {
    this.darkness_canvas_ctx.lineTo(100 + 100 * Math.cos(Math.PI * 2 * i / 5),
                    100 + 100 * Math.sin(Math.PI * 2 * i / 5));
  }
  this.darkness_canvas_ctx.closePath();
  this.darkness_canvas_ctx.fillStyle = "black";
  this.darkness_canvas_ctx.fill()
  this.darkness_sound_played = false
}


BossFour.prototype.draw = function(context, draw_factor) {

  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) return

  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
  context.save()
  if (this.dying)
      context.globalAlpha *= (1 - prog)
    else
      context.globalAlpha *= this.visibility != null ? this.visibility : 1

  var tp = this.body.GetPosition()

  //if(this.knockback_red_duration > 0) {
    renderUtils.drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle()),
      this.effective_radius * 2 * draw_factor, this.effective_radius * 2 * draw_factor, "adrogantia_head", sprites.adrogantiaSprite)


  if (this.anger_level > 0) {
    context.save();
    context.beginPath();
    var angle = this.body.GetAngle();
    context.moveTo(tp.x*draw_factor + this.effective_radius * draw_factor * Math.cos(angle),
      tp.y*draw_factor + this.effective_radius * draw_factor * Math.sin(angle))
    for (var i = 1; i <= this.anger_level; i++) {
      context.lineTo(tp.x*draw_factor + this.effective_radius * draw_factor * Math.cos(angle + i * Math.PI * 2 / 5),
      tp.y*draw_factor + this.effective_radius * draw_factor * Math.sin(angle + i * Math.PI * 2 / 5))
    }
    if (this.anger_level < 5) {
      context.lineTo(tp.x*draw_factor, tp.y*draw_factor);
    }
    context.closePath();
    context.clip();
    renderUtils.drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle()),
      this.effective_radius * 2 * draw_factor, this.effective_radius * 2 * draw_factor, "adrogantia_head_red", sprites.adrogantiaSprite)
    context.restore();
  }
  //} else {
  //  renderUtils.drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle() + Math.PI/16), this.effective_radius * 2 * draw_factor, this.effective_radius * 2 * draw_factor, "negligentia_head", sprites.negligentiaSprite)
  //}
  this.additional_drawing(context, draw_factor)

  context.restore()
}

BossFour.prototype.boss_specific_final_draw = function(context, draw_factor) {
  context.save();
  context.globalAlpha = 1;
  this.draw_blindness_overlay(context, draw_factor);
  context.restore();
}

BossFour.prototype.draw_blindness_overlay = function(context, draw_factor) {
  var tp = this.body.GetPosition()
  if (this.darkness_timer > 0) {
    // Draw blindness indicator.
    var prog = 1 - (this.darkness_timer / this.darkness_interval);
    var r = this.effective_radius * prog * draw_factor;
    this.darkness_angle = this.body.GetAngle();
    context.save();
    context.globalAlpha *= 0.5
    context.translate(tp.x * draw_factor, tp.y * draw_factor);
    context.rotate(this.darkness_angle)
    context.drawImage(this.darkness_canvas, 0, 0, this.darkness_canvas.width, this.darkness_canvas.height, -r, -r, 2 * r, 2 * r);
    context.restore();
  } else if (this.darkness_timer > -this.darkness_spreading_duration) {
    if (!this.darkness_sound_played) {
      this.darkness_sound_played = true
      music_player.play_sound("b4darkness")
    }
    var prog = (this.darkness_timer / -this.darkness_spreading_duration);
    var r = (this.effective_radius * (1 - prog) + 60 * prog) * draw_factor;
    context.save();
    context.globalAlpha *= 0.5
    context.translate(tp.x * draw_factor, tp.y * draw_factor);
    context.rotate(this.darkness_angle)
    context.drawImage(this.darkness_canvas, 0, 0, this.darkness_canvas.width, this.darkness_canvas.height, -r, -r, 2 * r, 2 * r);
    context.restore();
  } else if (this.darkness_timer > -(this.darkness_spreading_duration + this.darkness_duration)) {
    var r = 60 * draw_factor;
    context.save();
    context.globalAlpha *= 0.5;
    context.translate(tp.x * draw_factor, tp.y * draw_factor);
    context.rotate(this.darkness_angle)
    context.drawImage(this.darkness_canvas, 0, 0, this.darkness_canvas.width, this.darkness_canvas.height, -r, -r, 2 * r, 2 * r);
    context.restore();
  } else if (this.darkness_timer > -(this.darkness_spreading_duration + this.darkness_duration + this.darkness_vanish_duration)) {
    var prog = 1 - (this.darkness_timer + this.darkness_spreading_duration + this.darkness_duration) / -this.darkness_vanish_duration;
    var r = 60 * draw_factor;
    context.save();
    context.globalAlpha *= 0.5 * prog;
    context.translate(tp.x * draw_factor, tp.y * draw_factor);
    context.rotate(this.darkness_angle)
    context.drawImage(this.darkness_canvas, 0, 0, this.darkness_canvas.width, this.darkness_canvas.height, -r, -r, 2 * r, 2 * r);
    context.restore();
  }
}


BossFour.prototype.get_next_enemy_type = function() {
  this.spawn_counter += 1
  return this.spawn_order[(this.spawn_counter - 1) % this.spawn_order.length]
}
BossFour.prototype.additional_drawing = function(context, draw_factor) {

  this.process_body_buds()
  this.draw_body_buds(context, draw_factor)
}

BossFour.prototype.boss_specific_additional_processing = function(dt) {
  if (this.attack_bud_cooldown_timer > 0) {
    this.attack_bud_cooldown_timer -= dt;
  }

  if (this.anger_level > 0) {
    this.anger_level_cooloff_timer -= dt;
    if (this.anger_level_cooloff_timer < 0) {
      this.anger_level_cooloff_timer = this.anger_level_cooloff_period
      this.anger_level -= 1;
    }
  }

  if (this.cur_object != null && this.cur_object.type === "boss_four_spawner"  && !this.cur_object.is_silenced()) {
    this.spawn_laser_flare_prop += dt/this.get_spawn_laser_flare_transition_period();
    if (this.spawn_laser_flare_prop > 1) {
      this.spawn_laser_flare_prop = 1;
    }
    this.spawn_laser_flare_transition_period = 250;
  } else if (this.spawn_laser_flare_prop > 0) {
    this.spawn_laser_flare_prop -= dt/this.spawn_laser_flare_transition_period_base;
    if (this.spawn_laser_flare_prop < 0) {
      this.spawn_laser_flare_prop = 0;
    }
  }

  if(this.do_initial_spawn) {
    this.create_initial_attack_buds()
    this.do_initial_spawn = false
  }
  this.process_attack_buds(dt)

  this.repel_enemies()

  if (this.darkness_timer < 0 && this.darkness_timer > -this.darkness_spreading_duration) {
    var prog = (this.darkness_timer / -this.darkness_spreading_duration);
    this.level.enemy_visibility = 1 - prog;
  } else if (this.darkness_timer < -(this.darkness_spreading_duration + this.darkness_duration) && this.darkness_timer > -(this.darkness_spreading_duration + this.darkness_duration + this.darkness_vanish_duration)) {
    var prog = (this.darkness_timer + this.darkness_spreading_duration + this.darkness_duration) / -this.darkness_vanish_duration;
    this.level.enemy_visibility = prog;
  } else if (this.darkness_timer >= 0) {
    this.level.enemy_visibility = 1;
  }

  if(this.ready_attack_bud) {

    if(this.attack_bud_charging) {
      this.attack_bud_charge_timer -= dt
      if(this.attack_bud_charge_timer < 0) {
        this.fire_attack_bud(this.ready_attack_bud)
      }

    } else {

      var cur_angle = this.body.GetAngle();
      if(this.ready_attack_bud.type == "attack") {

        var target_angle =  utils.angleClosestTo(cur_angle,utils.atan(this.body.GetPosition(), this.player.get_current_position()) - this.attack_bud_angle);

      } else if(this.ready_attack_bud.type == "spawn") {

        if(this.initial_spawn) {
          var target_angle = utils.angleClosestTo(cur_angle, Math.PI/2)
        } else {
          if(this.target_spawn_angle == null) {
            this.generate_target_spawn_angle()
          }
          var target_angle =  utils.angleClosestTo(cur_angle, this.target_spawn_angle - this.attack_bud_angle);
        }
      }
      var angle_between = utils.smallAngleBetween(cur_angle, target_angle)

      var turn_rate = this.turn_rate;

      if(angle_between < Math.PI * 2 * dt/turn_rate) {
        this.body.SetAngle(target_angle)
        this.attack_bud_charging = true

        if(this.initial_spawn) {
          this.attack_bud_charge_timer = 0
        } else {
          this.attack_bud_charge_timer = this.attack_bud_charge_period
          this.ready_attack_bud.enemy.firing = true
        }
      } else {
        if(target_angle > cur_angle) {
          this.body.SetAngle(this.body.GetAngle() + Math.PI * 2 * dt/turn_rate)
        } else {
          this.body.SetAngle(this.body.GetAngle() - Math.PI * 2 * dt/turn_rate)
        }
      }
    }



  }

  this.process_body_buds()

  this.spawn_laser_angle += dt / this.get_spawn_laser_revolution() * Math.PI * 2

  this.get_object_hit()
  if (saveData.difficultyMode == "normal") {
    this.darkness_timer -= dt;

    if (this.darkness_timer < 0) {


      if (this.darkness_timer < -(this.darkness_spreading_duration + this.darkness_duration + this.darkness_vanish_duration)) {
        this.darkness_timer = this.darkness_interval;
        this.darkness_sound_played = false
      }

    }
  }
}

BossFour.prototype.generate_target_spawn_angle = function() {
  // get the angle to release the spawner
  var angle_to_player = utils.atan(this.body.GetPosition(), this.player.body.GetPosition());
  var possible_angles = [
    angle_to_player + Math.PI, // pick the angle opposite the player.
    angle_to_player + Math.PI / 4,
    angle_to_player - Math.PI / 4
  ];

  for (var i = 0; i < possible_angles.length; i++) {
    var angle = possible_angles[i];
    var distance = 15
    var test_point = {x: this.body.GetPosition().x + Math.cos(angle) * distance,
        y: this.body.GetPosition().y + Math.sin(angle) * distance}
    var dist = Math.min(775/constants.drawFactor - test_point.x, test_point.x - 25/constants.drawFactor)
    var dist2 = Math.min(575/constants.drawFactor - test_point.y, test_point.y - 25/constants.drawFactor)

    // One of these three angles MUST work.
    if(utils.isVisible(this.body.GetPosition(), test_point, this.level.obstacle_edges) && Math.min(dist, dist2) > 5) {
      this.target_spawn_angle = angle;
      return;
    }
  }
}

BossFour.prototype.fire_attack_bud = function(bud, initial) {
  if(this.initial_spawn) {
    // fire all spawn buds
    this.initial_spawn = false
    for(var i = 0; i < this.buds.length; i++) {
      var cur_bud = this.buds[i];
      if(cur_bud.type == "spawn") {
        this.fire_attack_bud(cur_bud, true)
      }
    }
    return
  }

  if(bud.type == "attack") {
    bud.enemy.dir = {x: bud.body.GetPosition().x - this.body.GetPosition().x, y: bud.body.GetPosition().y - this.body.GetPosition().y}
    bud.body = null
    bud.delay = 0
    this.ready_attack_bud = null
    this.attack_bud_charging = false
    bud.enemy.body.ResetMassData()
    bud.enemy = null
    music_player.play_sound("b4attacker")
  } else if(bud.type == "spawn"){
    this.ready_attack_bud = null
    this.attack_bud_charging = false
    bud.delay = 0
    bud.body = null
    var angle = utils.atan(this.body.GetPosition(), bud.enemy.body.GetPosition())
    var force = new box_2d.b2Vec2(Math.cos(angle), Math.sin(angle))
    force.Multiply(this.spawner_force)
    bud.enemy.body.ApplyImpulse(force, bud.enemy.body.GetWorldCenter())
    bud.enemy.spawned = true
    bud.enemy.firing = false
    if(initial != true)
      bud.enemy.silence(5000, true, true)
    bud.enemy.generate_collision_polygons()
    bud.enemy.body.ResetMassData()
    bud.enemy = null
    this.target_spawn_angle = null
    music_player.play_sound("b4spawner")
  }
  this.attack_bud_cooldown_timer = this.attack_bud_cooldown_period;
}

BossFour.prototype.createBodyBuds = function() {
  for(var index = 0; index < this.num_buds; index++) {
    var angle = (index + 0.5)/this.num_buds * Math.PI * 2 + this.body.GetAngle()
    var bud_body =  utils.createBody(this.world, enemyData[this.type].bud_polygon,
      this.body.GetPosition().x + this.effective_radius *1.5 * Math.cos(Math.PI/5)  * Math.cos(angle),
       this.body.GetPosition().y + this.effective_radius * 1.5 * Math.cos(Math.PI/5) * Math.sin(angle),
      3, 10, box_2d.BOSS_FOUR_BIT, box_2d.PLAYER_BIT | box_2d.ENEMY_BIT, "static", this, null)

    bud_body.SetAngle(angle)
    this.buds.push({
      type: "body",
      loc: index, // where the bud is located
      body: bud_body,
      size: this.body_bud_radius * (0.8 + 0.2 * utils.bezierInterpolate(0.15, 0.85, Math.abs(((1000 - (new Date().getTime()) % 2000)))/1000))
    })
  }
}

BossFour.prototype.additional_death_prep_specific = function() {
  for(var index = 0; index < this.buds.length; index++) {
    var bud = this.buds[index];
    var angle = utils.atan(this.body.GetPosition(), bud.body.GetPosition());
    if (bud.type == "body") {
      var bud_body =  utils.createBody(this.world, enemyData[this.type].bud_polygon,
        this.body.GetPosition().x + this.effective_radius *1.5 * Math.cos(Math.PI/5)  * Math.cos(angle),
         this.body.GetPosition().y + this.effective_radius * 1.5 * Math.cos(Math.PI/5) * Math.sin(angle),
        3, 0.1, box_2d.BOSS_FOUR_BIT, box_2d.PLAYER_BIT | box_2d.ENEMY_BIT, "dynamic", this, null)

      bud_body.SetAngle(angle)
      this.buds[index].body = bud_body;
      var dir = new box_2d.b2Vec2(Math.cos(angle), Math.sin(angle));
      dir.Normalize();
      dir.Multiply(20);
      bud_body.ApplyImpulse(dir, bud_body.GetWorldCenter())
    } else if (bud.expand_timer > 0) {
      var dir = new box_2d.b2Vec2(Math.cos(angle), Math.sin(angle));
      dir.Normalize();
      dir.Multiply(30);
      this.buds[index].body.ApplyImpulse(dir, this.buds[index].body.GetWorldCenter())
    }
  }
}

BossFour.prototype.repel_enemies = function() {
  var ref_angle = utils.atan(this.body.GetPosition(), this.player.get_current_position())
  for(var index in this.level.enemies) {
    var enemy = this.level.enemies[index]
    if(enemy.dying) continue
    if(enemy != this && enemy.type != "boss_four_attacker" && enemy.type != "boss_four_spawner") {

      if(utils.pDist(enemy.body.GetPosition(), this.body.GetPosition()) < 6) { // kill the enemy
        enemy.start_death("absorbed")
        continue
      }
      if(utils.pDist(enemy.body.GetPosition(), this.body.GetPosition()) < 8) {

        var enemy_angle = utils.angleClosestTo(ref_angle, utils.atan(this.body.GetPosition(), enemy.body.GetPosition()))
        enemy.body.ApplyImpulse(new box_2d.b2Vec2(enemy.force * 5* Math.cos(enemy_angle), enemy.force * 5* Math.sin(enemy_angle)), enemy.body.GetWorldCenter())

        //help the enemy along
        if(enemy_angle < ref_angle) {
          var help_angle = enemy_angle + Math.PI/2
        } else {
          var help_angle = enemy_angle - Math.PI/2
        }
        enemy.body.ApplyImpulse(new box_2d.b2Vec2(enemy.force * Math.cos(help_angle), enemy.force * Math.sin(help_angle)), enemy.body.GetWorldCenter())
      }
    }
  }
}

BossFour.prototype.process_body_buds = function() {
  // Don't process body buds if dying, so we can explode.
  if (this.dying) return;
  var size = 0.8 + 0.2 * utils.bezierInterpolate(0.15, 0.85, Math.abs(((1000 - (new Date().getTime()) % 2000)))/1000)

  var vertices = []
  for(var i = 0; i < 5; i++) {
    vertices.push({x: Math.cos(Math.PI * 2 * i / 5) * size * this.body_bud_radius, y: Math.sin(Math.PI * 2 * i / 5) * size * this.body_bud_radius})
  }
  for(var i in this.buds) {
    var bud = this.buds[i]
    if(bud.type == "body") {
      var bud = this.buds[i]
      var index = this.buds[i].loc
      var angle = (index + 0.5)/this.num_buds * Math.PI * 2 + this.body.GetAngle()
      bud.body.GetFixtureList().m_shape.m_vertices = vertices
      bud.body.SetPosition({x: this.body.GetPosition().x + (this.effective_radius + size * this.body_bud_radius) * Math.cos(Math.PI/5)  * Math.cos(angle),
        y: this.body.GetPosition().y + (this.effective_radius + size * this.body_bud_radius) * Math.cos(Math.PI/5) * Math.sin(angle)})
      bud.body.SetAngle(angle)
      bud.size = size * this.body_bud_radius
    }
  }
}

BossFour.prototype.draw_body_buds = function(context, draw_factor) {
   for(var index in this.buds) {

    if(this.buds[index].type == "body") {

      var bud = this.buds[index]

      var tp = bud.body.GetPosition()
      var angle = bud.body.GetAngle()
      context.save()
      renderUtils.drawSprite(context, tp.x* draw_factor, tp.y* draw_factor, angle,
        bud.size * draw_factor * 2, bud.size* draw_factor * 2,
        bud.loc < this.anger_level ? "adrogantia_body_bud_red" : "adrogantia_body_bud", sprites.adrogantiaSprite)
      context.restore()

    }
  }
}

BossFour.prototype.getNumberSpawners = function() {
  var count = 0
  for(var i = 0; i < this.level.enemies.length; i++)
  {
    if(this.level.enemies[i].type == "boss_four_spawner") {
      count += 1
    }
  }
  return count

}

BossFour.prototype.generate_new_attack_bud = function(bud) {

  if(bud.type == null) {
    // determine the bud type for this bud
    this.bud_count += 1

    if(this.bud_count % this.spawner_bud_frequency == 0) {
      bud.type = "spawn"
    } else {
      bud.type = "attack"
    }
  }
  var index = bud.loc
  var angle = (index)/this.num_buds * Math.PI * 2 + this.body.GetAngle()

  var offset_radius = this.effective_radius + enemyData["boss_four_"+bud.type+"er"].initial_radius * 1.5
  var new_position = {x: this.body.GetPosition().x + (offset_radius) * Math.cos(angle),
    y: this.body.GetPosition().y + (offset_radius) * Math.sin(angle)}
  var new_enemy = null
  if(bud.type == "attack")
    new_enemy = new BossFourAttacker(this.world, new_position.x, new_position.y, this.level.enemy_counter, this.impulse_game_state, 0.1)
  else {
    var spawn_type = this.get_next_enemy_type()
    var spawn_count = saveData.difficultyMode == "easy" ? this.spawner_spawn_count_easy[spawn_type] : this.spawner_spawn_count[spawn_type];
    new_enemy = new BossFourSpawner(this.world, new_position.x, new_position.y, this.level.enemy_counter, this.impulse_game_state, spawn_type, spawn_count, this.spawner_spawn_force[spawn_type], this, 0.1)
  }
  bud.body = new_enemy.body
  bud.enemy = new_enemy
  bud.body.SetAngle(angle)
  this.level.spawned_enemies.push(new_enemy)
  this.level.enemy_counter += 1
  if(this.initial_spawn && bud.type == "spawn") {
    // spawn the initial_spawn faster
    bud.expand_period = 1000
    bud.expand_timer = bud.expand_period
  } else {
    bud.expand_period = this.attack_bud_expand_period
    bud.expand_timer = bud.expand_period
  }
  // create bud
}

BossFour.prototype.create_initial_attack_buds = function() {
  this.initial_spawn = true
  for(var index = 0; index < this.num_buds; index++) {
    var new_bud = null
    if(index == 0) {
      new_bud = {
        type: "attack",
        loc: index, // where the bud is located
        delay: 0,//index * 2000,
        body: null,
        expand_period: null,
        expand_timer: null
      }
    } else {
      new_bud = {
        type: "spawn",
        loc: index, // where the bud is located
        delay: 0,//index * 2000,
        body: null,
        expand_period: null,
        expand_timer: null
      }
    }
    this.buds.push(new_bud)
    this.generate_new_attack_bud(new_bud)
  }
}

BossFour.prototype.process_attack_buds = function(dt) {
  var possible_attack_buds = []
  for(var i in this.buds) {

    var bud = this.buds[i]
    if(bud.type == "attack" || bud.type == "spawn") {
      var bud = this.buds[i]
      var index = this.buds[i].loc
      var angle = (index)/this.num_buds * Math.PI * 2 + this.body.GetAngle()

      if(bud.delay > 0 && !this.initial_spawn) {
        bud.delay -= dt
      } else {
        if(bud.body == null) {
          bud.type = null
          this.ready_bud_queue.splice(this.ready_bud_queue.indexOf(index), 1);
          this.generate_new_attack_bud(bud)
        } else {
          var size = Math.max(0.1, utils.bezierInterpolate(0.15, 0.85, Math.min(1, 1 - bud.expand_timer/bud.expand_period)) * enemyData["boss_four_"+bud.type+"er"].effective_radius)
          var offset_radius = this.effective_radius + size
          var new_position = {x: this.body.GetPosition().x + (offset_radius) * Math.cos(angle),
            y: this.body.GetPosition().y + (offset_radius) * Math.sin(angle)}

          bud.enemy.set_size(size)
          bud.body.SetAngle(angle)
          bud.body.SetPosition(new_position)
          bud.expand_timer -= dt

          if(this.attack_bud_cooldown_timer <= 0 && bud.expand_timer < 0 && this.ready_bud_queue.indexOf(i) === -1 &&
            bud != this.ready_attack_bud) {
            this.ready_bud_queue.push(i);
            // Prioritize spawn buds.
            /*if (bud.type == "spawn") {
              this.ready_attack_bud = bud;
              this.attack_bud_angle = (index)/this.num_buds * Math.PI * 2;
            } else {
              possible_attack_buds.push(i)
            }*/
          }
        }
      }
    }
  }
  if (this.ready_bud_queue.length > 0 && !this.ready_attack_bud) {
    var ready_index = this.ready_bud_queue.splice(0, 1)[0];
    var bud = this.buds[ready_index];
    this.ready_attack_bud = bud
    this.attack_bud_angle = (ready_index)/this.num_buds * Math.PI * 2
  }
}



BossFour.prototype.get_spawner_set = function() {

  if (this.spawn_count == 1) {
    return ["stunner", "spear", "harpoon", "fighter"]
  }
  else {
    return this.possible_spawn_sets[Math.floor(Math.random() * this.possible_spawn_sets.length)]
  }

}

BossFour.prototype.get_object_hit = function() {
  var dist = null
  var object = null
  var ray_end = {x: this.body.GetPosition().x + 100 * Math.cos(this.spawn_laser_angle),
    y: this.body.GetPosition().y + 100 * Math.sin(this.spawn_laser_angle)}
  if(this.laser_check_counter <= 0) {
    this.laser_check_counter = this.laser_check_timer
    for(var i = 0; i < this.level.enemies.length; i++)
    {
      if(this.level.enemies[i].id == this.id) continue
      if(!(this.level.enemies[i].type === "boss_four_spawner")) continue
      if(!this.level.enemies[i].spawned) continue

      if(!utils.isAngleBetween(this.spawn_laser_angle - this.laser_check_diff, this.spawn_laser_angle + this.laser_check_diff,
        utils.atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()))) continue

      var tempDist = this.level.enemies[i].get_segment_intersection(this.body.GetPosition(), ray_end).dist
      if(dist == null || (tempDist != null && tempDist < dist))
      {
        dist = tempDist
        object = this.level.enemies[i]
      }
    }
  }
  else {
    dist = this.cur_dist
    object = this.cur_object

  }
  this.laser_check_counter -=1

  var tempDist = this.player.get_segment_intersection(this.body.GetPosition(), ray_end).dist
    if(dist == null || (tempDist != null && tempDist < dist))
    {
      dist = tempDist
      object = this.player
    }

  if(object.type === "boss_four_spawner" && object.id != this.cur_object.id && object.spawned) {
    object.spawn_enemy()
  }

  this.cur_object = object
  this.cur_dist = dist
}

BossFour.prototype.get_two_laser_locs = function() {
  var locs = []
  locs.push({x: this.body.GetPosition().x + Math.cos(this.body.GetAngle() - Math.PI/2) * this.effective_radius * 1.5,
    y: this.body.GetPosition().y +Math.sin(this.body.GetAngle() - Math.PI/2) * this.effective_radius * 1.5})
  locs.push({x: this.body.GetPosition().x +Math.cos(this.body.GetAngle() + Math.PI/2) * this.effective_radius * 1.5,
    y: this.body.GetPosition().y +Math.sin(this.body.GetAngle() + Math.PI/2) * this.effective_radius * 1.5})
  return locs

}

BossFour.prototype.pre_draw = function(context, draw_factor) {
  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) return

    context.save()
    var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0

    if (this.dying)
      context.globalAlpha *= (1 - prog)
    else
      context.globalAlpha *= this.visibility != null ? this.visibility : 1

    this.draw_glows(context, draw_factor)
    //draw laser

    if(this.spawned) {
      context.beginPath()
      var laser_dist = this.cur_dist != null ? this.cur_dist : 100
      context.moveTo((this.body.GetPosition().x + this.get_spawn_laser_radius() * Math.cos(this.spawn_laser_angle + Math.PI/2)) * draw_factor,
       (this.body.GetPosition().y + this.get_spawn_laser_radius() * Math.sin(this.spawn_laser_angle + Math.PI/2)) * draw_factor)
      context.lineTo((this.body.GetPosition().x + this.get_spawn_laser_radius() * Math.cos(this.spawn_laser_angle - Math.PI/2)) * draw_factor,
       (this.body.GetPosition().y + this.get_spawn_laser_radius() * Math.sin(this.spawn_laser_angle - Math.PI/2)) * draw_factor)
      context.lineTo((this.body.GetPosition().x + laser_dist * Math.cos(this.spawn_laser_angle) +this.get_spawn_laser_radius() * Math.cos(this.spawn_laser_angle - Math.PI/2)) * draw_factor,
        (this.body.GetPosition().y + laser_dist * Math.sin(this.spawn_laser_angle) +this.get_spawn_laser_radius() * Math.sin(this.spawn_laser_angle - Math.PI/2)) * draw_factor)
      context.lineTo((this.body.GetPosition().x + laser_dist * Math.cos(this.spawn_laser_angle) +this.get_spawn_laser_radius() * Math.cos(this.spawn_laser_angle + Math.PI/2)) * draw_factor,
        (this.body.GetPosition().y + laser_dist * Math.sin(this.spawn_laser_angle) +this.get_spawn_laser_radius() * Math.sin(this.spawn_laser_angle + Math.PI/2)) * draw_factor)
      context.closePath()

      context.globalAlpha *= 0.5
      context.fillStyle = this.spawn_laser_colors[this.anger_level];
      context.fill()
      context.globalAlpha *= 2;
      if (this.spawn_laser_flare_prop > 0) {
        context.save();
        context.globalAlpha *= this.spawn_laser_flare_prop;
        context.fillStyle = "red";
        context.fill();
        context.restore();
      }

    }
    context.restore()

}


BossFour.prototype.draw_glows = function(context, draw_factor) {

  var tp = this.body.GetPosition()
  if(this.knockback_red_duration > 0) {
    renderUtils.drawSprite(context, tp.x*draw_factor,
    tp.y*draw_factor,
    (this.body.GetAngle()), 200, 200, "adrogantia_glow", sprites.adrogantiaSprite)
  } else {
    renderUtils.drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (this.body.GetAngle()), 200, 200, "adrogantia_glow", sprites.adrogantiaSprite)
  }
}

BossFour.prototype.move = function() {
  //this.set_heading(this.player.get_current_position())
}

BossFour.prototype.collide_with = function(other) {
  if(this.dying)//ensures the collision effect only activates once
    return

  if(other === this.player) {
    var tank_angle = utils.atan(this.body.GetPosition(), this.player.get_current_position())
    this.player.body.ApplyImpulse(new box_2d.b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
    this.impulse_game_state.reset_combo();
    //this.cause_of_death = "hit_player"
  }

}

BossFour.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.shape_points[0].length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add(this.shape_points[0][i])
    ans.push(temp)
  }
  return ans
}

BossFour.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.knockback_red_duration = this.knockback_red_interval
  if (this.anger_level < this.anger_level_max) {
    this.anger_level += 1;
  }
  this.anger_level_cooloff_timer = this.anger_level_cooloff_period;
}

BossFour.prototype.explode = function() {

}

BossFour.prototype.get_spawn_laser_revolution = function() {
  return this.spawn_laser_revolution_base * Math.pow(0.8, this.anger_level);
}

BossFour.prototype.get_spawn_laser_radius = function() {
  return this.spawn_laser_radius_base * Math.pow(1.2, this.anger_level);
}

BossFour.prototype.get_time_factor = function() {
  //spawn increases by 30% for every minute
  return 1 + (this.impulse_game_state.game_numbers.seconds/60) * .2
}

BossFour.prototype.get_spawn_bonus = function() {
  return 1 + 0.2 * this.anger_level;
}

BossFour.prototype.get_spawn_laser_flare_transition_period = function() {
  return this.spawn_laser_flare_transition_period_base * Math.pow(0.8, this.anger_level);
}

BossFour.prototype.get_impulse_extra_factor = function() {
  if(saveData.difficultyMode == "easy") {
    return this.impulse_extra_factor * 2;
  }
  return this.impulse_extra_factor;
}

module.exports = BossFour;
