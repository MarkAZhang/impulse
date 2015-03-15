BossThree.prototype = new Boss()

BossThree.prototype.constructor = BossThree

function BossThree(world, x, y, id, impulse_game_state) {

  this.type = "third boss"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.shoot_interval = 1500

  this.shoot_duration = 5

  this.do_yield = false

  this.safe = true

  this.spawned = false

  this.body.SetAngle(7 * Math.PI/16)

  this.visibility = 0

  this.red_visibility = 0

  this.knockback_red_duration = 0
  this.knockback_red_interval = 150

  this.boss_force = 200

  if (imp_params.player_data.difficulty_mode == "easy") {
    this.boss_force = 120
  }
  this.num_arms = 16
  this.striking_arms = {}
  this.strike_duration = 2200 // this is how long the strike lasts, with the first part of it being the "charge"
  if(imp_params.player_data.difficulty_mode == "easy") {
    this.strike_duration = 2800
  }
  this.strike_interval = 1500 // every interval, we add a new strike
  if(imp_params.player_data.difficulty_mode == "easy") {
    this.strike_interval = 2000
  }
  this.strike_timer = this.strike_interval
  this.strike_charging_prop = 0.7

  this.default_heading = false
  this.spin_rate = 16*this.strike_duration * (1 - this.strike_charging_prop)

  this.wheel_spinning_duration = 4000
  if (imp_params.player_data.difficulty_mode == "easy") {
    this.wheel_spinning_duration = 6000 // spin one more round on easy-mode
  }
  this.wheel_spinning_timer = this.wheel_spinning_duration
  this.wheel_default_skips = 16

  this.wheel_cur_index = 0

  this.wheel_state = "gap" // gap, fadein, spinning, activate, fadeout
  this.wheel_fade_duration = 1000
  this.wheel_fade_timer = this.wheel_fade_duration
  this.wheel_gap_interval = 2000
  this.wheel_gap_timer = this.wheel_gap_interval
  this.wheel_sections = 4
  this.wheel_radius = 4.3
  this.last_wheel_index_with_sound = -1

  this.wheel_activate_duration = 1000
  this.wheel_activate_timer = 0
  this.gap_activation_counter = 0
  this.gap_activation_threshold = 1000
  this.gap_activated = false

  this.strike_frenzy_duration = 4500
  this.strike_frenzy_timer = this.strike_frenzy_duration
  this.strike_frenzy_speedup = 0.8

  this.extra_gap = 0

  this.striking_state = "extend" // extend, striking, retract, gap
  this.strike_transition_interval = 500
  this.strike_transition_timer = this.strike_transition_interval
  this.default_strike_position = this.effective_radius + 2
  this.default_strike_range = 18
  this.target_arm_length = this.effective_radius

  this.wheel_visibility = 0

  this.wheel_sets = [
    ["harpoon", "spear", "tank", "mote"],
    ["fighter", "spear", "stunner", "mote"],
    ["troll", "disabler", "stunner", "mote"],
  ]

  this.current_wheel_set = this.generate_wheel_set()

  this.spawn_queue = []
  this.spawn_enemy_timer = 0;
  this.wheel_effect_activated = false

  this.spawn_enemy_intervals = {
    "stunner" : 150,
    "spear" : 200,
    "tank" : 200,
    "mote" : 200,
    "goo" : 200,
    "harpoon" : 200,
    "disabler" : 200,
    "fighter" : 200,
    "troll" : 200,
  }

  this.spawn_count = {
   "stunner" : 14,
   "spear" : 12,
   "tank" : 10,
   "mote" : 6,
   "goo" : 1,
   "harpoon" : 6,
   "disabler" : 1,
   "fighter" : 4,
   "troll" : 10,
 }

  if(imp_params.player_data.difficulty_mode == "easy") {
      this.spawn_count = {
       "stunner" : 6,
       "spear" : 5,
       "tank" : 3,
       "mote" : 5,
       "goo" : 1,
       "harpoon" : 3,
       "disabler" : 1,
       "fighter" : 2,
       "troll" : 5,
     }
  }

 this.spawn_force = {
  "stunner" : 25,
   "spear" : 18,
   "tank" : 200,
   "mote" : 10,
   "goo" : 200,
   "harpoon" : 400,
   "disabler" : 300,
   "fighter" : 400,
   "troll" : 20,
}

 this.spawn_gap = {
  "stunner" : 500,
  "spear" : 1000,
  "tank" : 2000,
  "mote" : 500,
  "goo" : 0,
  "harpoon" : 5000,
  "disabler" : 0,
  "fighter" : 5000,
  "troll" : 2000,
  "frenzy": 1000
}

this.silence_interval = 20000
this.silence_timer = this.silence_interval - 1
this.silence_duration = 7000
this.silenced = false
this.rotation_dir = -1
this.rotating = false

 this.initialize_arms()
}

BossThree.prototype.generate_wheel_set = function() {
  /*var temp = []
  for(var i = 0; i < 4; i++)
    temp.push("fighter")
  return temp*/
  var tough_enemies = ["tank", "fighter", "troll", "harpoon"]
  var easy_enemies = ["stunner", "spear", "goo", "disabler"]
  var all_enemies = ["mote", "harpoon", "stunner", "spear", "goo", "disabler", "tank", "fighter", "troll"]

  /*var wheel_set = []
  var tough_enemies_index = Math.floor(Math.random() * tough_enemies.length)
  wheel_set.push(tough_enemies[tough_enemies_index])
  all_enemies.splice(all_enemies.indexOf(tough_enemies[tough_enemies_index]), 1)
  for(var i = 0; i < 2; i++) {
    var random_index = Math.floor(Math.random() * all_enemies.length)
    wheel_set.push(all_enemies[random_index])
    if(easy_enemies.indexOf(all_enemies[random_index])!= -1) {
      easy_enemies.splice(easy_enemies.indexOf(all_enemies[random_index]), 1)
    }
    all_enemies.splice(random_index, 1)
  }
  var easy_enemies_index = Math.floor(Math.random() * easy_enemies.length)
  wheel_set.push(easy_enemies[easy_enemies_index])*/

  if(this.level.enemies.length > 6) {
    easy_enemies.push("frenzy")
    all_enemies.push("frenzy")
  }

  var wheel_set = []
  var tough_enemies_index = Math.floor(Math.random() * tough_enemies.length)
  wheel_set.push(tough_enemies[tough_enemies_index])
  all_enemies.splice(all_enemies.indexOf(tough_enemies[tough_enemies_index]), 1)
  tough_enemies.splice(tough_enemies_index, 1)
  var tough_enemies_index2 = Math.floor(Math.random() * tough_enemies.length)
  wheel_set.push(tough_enemies[tough_enemies_index2])
  all_enemies.splice(all_enemies.indexOf(tough_enemies[tough_enemies_index2]), 1)
  var random_index = Math.floor(Math.random() * all_enemies.length)
  wheel_set.push(all_enemies[random_index])
  if(easy_enemies.indexOf(all_enemies[random_index])!= -1) {
    easy_enemies.splice(easy_enemies.indexOf(all_enemies[random_index]), 1)
  }
  var easy_enemies_index = Math.floor(Math.random() * easy_enemies.length)
  wheel_set.push(easy_enemies[easy_enemies_index])

  return wheel_set
}

BossThree.prototype.boss_specific_additional_processing = function(dt) {

    if(this.rotating) {
      if(this.rotation_dir % 2 == 0)
        this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)
      else if(this.rotation_dir % 2 == 1)
        this.body.SetAngle(this.body.GetAngle() - 2*Math.PI * dt/this.spin_rate)
    }

  if(imp_params.player_data.difficulty_mode == "normal") {
    if(this.silence_timer < 0 && !this.silenced && (this.wheel_state != "activate" && this.wheel_state != "fadeout" && this.wheel_state != "gap")) {
      this.silence_timer = 0;
      this.silenced = true
      this.global_silence()
      this.force_frenzy()
    }


    if(this.silenced && this.silence_timer < -this.silence_duration) {
        this.silenced = false
        this.silence_timer = this.silence_interval
    }

    this.silence_timer -= dt
  }

  if(this.striking_state == "extend") {
    this.strike_transition_timer -= dt

    var prog = Math.min(1 - this.strike_transition_timer/this.strike_transition_interval, 1)
    this.target_arm_length = this.effective_radius + prog * (this.default_strike_position - this.effective_radius)
    this.set_all_arms_length(this.target_arm_length)

    if(this.strike_transition_timer < 0) {
      if(this.silenced) {
        this.striking_state = "frenzy"
        this.strike_frenzy_timer = this.silence_timer + this.silence_duration
        this.strike_timer = 0
      } else {
        this.striking_state = "striking"
        this.rotating = true
        this.rotation_dir += 1
        this.strike_timer = 0
      }
    }
  } else if(this.striking_state == "striking") {
    this.process_striking_arms()
    if(p_dist(this.body.GetPosition(), this.player.get_current_position()) <= 15) {
      this.strike_timer -= dt
      if(this.strike_timer <= 0 && !(this.wheel_activate_timer > 0 && this.current_wheel_set[this.wheel_cur_index] == "frenzy")) {
        this.strike_timer = this.strike_interval
        this.strike_at_player()
      }
    } else {
      this.strike_timer -= dt
    }
  } else if(this.striking_state == "retract") {
    this.strike_transition_timer -= dt
    var prog = Math.max(this.strike_transition_timer/this.strike_transition_interval, 0)
    this.target_arm_length = this.effective_radius + prog * (this.default_strike_position - this.effective_radius)
    this.set_all_arms_length(this.target_arm_length)
    this.process_striking_arms()

    if(this.strike_transition_timer < 0) {
      this.striking_state = "gap"
    }

  } else if(this.striking_state == "gap") {
    this.process_striking_arms()
    //wait
  } else if(this.striking_state == "frenzy") {
    this.process_striking_arms()
    this.strike_timer -= dt
    this.strike_frenzy_timer -= dt
    if(this.strike_timer <= 0) {
      if(this.strike_frenzy_timer > this.strike_frenzy_speedup * this.strike_duration) {
        this.strike_timer = this.strike_interval * this.strike_frenzy_speedup
        this.strike_at_player()
      }
    }
    if(this.strike_frenzy_timer < 0) {
      this.striking_state = "striking"
      this.rotating = true
      this.rotation_dir += 1
      this.strike_timer = this.strike_interval
    }
  }

  if(this.wheel_state == "fadein") {
    this.wheel_cur_index = 0
    this.wheel_fade_timer -= dt
    this.wheel_visibility = Math.min(1 - this.wheel_fade_timer/this.wheel_fade_duration, 1)
    if(this.wheel_fade_timer <= 0) {
      this.wheel_state = "spinning"
      this.wheel_visibility = 1
      this.wheel_spinning_timer = this.wheel_spinning_duration
    }
  } else if(this.wheel_state == "spinning") {
    this.wheel_spinning_timer -= dt
    var prog = Math.pow(Math.min(1 - this.wheel_spinning_timer/this.wheel_spinning_duration, 1), 1)
    this.wheel_cur_index = Math.floor(prog * this.wheel_default_skips) % this.wheel_sections
    if (this.last_wheel_index_with_sound != this.wheel_cur_index) {
      // play the sound if it's the first time on this index
      this.last_wheel_index_with_sound = this.wheel_cur_index
      imp_params.impulse_music.play_sound("b3tick")
    }

    if(this.wheel_spinning_timer <= 0) {
      this.activate_wheel()
    }
  } else if(this.wheel_state == "fadeout") {
    this.wheel_fade_timer -= dt
    this.wheel_visibility = Math.max(this.wheel_fade_timer/this.wheel_fade_duration, 0)
    if(this.wheel_fade_timer <= 0) {
      this.wheel_state = "gap"
      this.wheel_visibility = 0
      if(!this.silenced)
        this.wheel_gap_timer = this.spawn_gap[this.current_wheel_set[this.wheel_cur_index]] + this.extra_gap
      else
        this.wheel_gap_timer = this.silence_timer + this.silence_duration
      this.extra_gap = 0
      this.gap_activation_counter = 0
      this.gap_activated = false
      this.wheel_cur_index = null
    }
  } else if(this.wheel_state == "activate") {
    if(this.striking_state == "striking" && this.current_wheel_set[this.wheel_cur_index] != "frenzy") {
      this.striking_state = "retract"
      this.rotating = false
      this.strike_transition_timer = this.strike_transition_interval
      this.cancel_strikes()
    }
    if(this.wheel_activate_timer == this.wheel_activate_duration && this.current_wheel_set[this.wheel_cur_index] == "frenzy" && !this.wheel_effect_activated)
      this.cancel_strikes()
    this.wheel_activate_timer -= dt

    if(this.wheel_activate_timer < 0) {
      if(!this.wheel_effect_activated) {
        var type = this.current_wheel_set[this.wheel_cur_index];
        if(type != "frenzy") {
          for(var i = 0; i < this.spawn_count[type]; i++) {
            this.spawn_queue.push(type)
            this.wheel_activate_timer += this.spawn_enemy_intervals[type];
          }
        } else {
          this.striking_state = "frenzy"
          this.rotating = false
          this.strike_frenzy_timer = this.strike_frenzy_duration
          this.wheel_activate_timer += this.strike_frenzy_duration
          this.strike_timer = 0
        }
        this.wheel_effect_activated = true
      } else {
        this.wheel_state = "fadeout"
        this.wheel_fade_timer = this.wheel_fade_duration
        if(this.striking_state == "gap" &&  this.current_wheel_set[this.wheel_cur_index] != "frenzy") {
          this.striking_state = "extend"
          this.strike_transition_timer = this.strike_transition_interval
        }
      }
    }

  } else if(this.wheel_state == "gap") {
    this.wheel_gap_timer -= dt
    this.gap_activation_counter += dt
    /*if(this.gap_activation_counter > this.gap_activation_threshold && !this.gap_activated) {
      this.gap_activated = true
      var type = this.current_wheel_set[this.wheel_cur_index]
      if(type != "strike") {

        for(var i = 0; i < this.spawn_count[type]; i++) {
          this.spawn_queue.push(type)
        }
      }
    }*/
    if(this.wheel_gap_timer <= 0) {
      this.wheel_state = "fadein"
      this.wheel_fade_timer = this.wheel_fade_duration
      this.current_wheel_set = this.generate_wheel_set()
    }
  }

  if(this.spawn_queue.length > 0) {
    this.spawn_enemy_timer -= dt
    if(this.spawn_enemy_timer < 0) {
      this.spawn_this_enemy(this.spawn_queue[0])
      this.spawn_queue.splice(0, 1)
      this.spawn_enemy_timer = this.spawn_enemy_intervals[this.current_wheel_set[this.wheel_cur_index]]
    }
  }
  if(this.knockback_red_duration > 0) {
    this.knockback_red_duration -= dt
  }

  // Don't re-adjust the arms if dying, so they can explode out.
  if (!this.dying) {
    this.process_arm_polygons();
  }
}

BossThree.prototype.force_frenzy = function() {
  //get to a frenzy state as soon as possible given current wheel and strike state
  //obey fadeout/fadein/extend/retract
  if(this.wheel_state == "fadein") {
    this.wheel_fade_timer = this.wheel_fade_duration - this.wheel_fade_timer
    this.wheel_state = "fadeout"
    this.wheel_cur_index = null
  } else if(this.wheel_state == "spinning" || this.wheel_state == "activate") {
    this.wheel_fade_timer = this.wheel_fade_duration
    this.wheel_state = "fadeout"
    if(this.wheel_state == "spinning")
      this.wheel_cur_index = null
  } else if(this.wheel_state == "gap") {
    this.wheel_gap_timer = this.silence_timer + this.silence_duration
  }

  if(this.striking_state == "retract") {
    this.strike_transition_timer = this.strike_transition_interval - this.strike_transition_timer
    this.striking_state = "extend"
  } else if(this.striking_state == "gap") {
    this.strike_transition_timer = this.strike_transition_interval
    this.striking_state = "extend"
  } else if(this.striking_state == "striking") {
    this.cancel_strikes()
    this.striking_state = "frenzy"
    this.rotating = false
    this.strike_frenzy_timer = this.silence_timer + this.silence_duration
  } else if(this.striking_state == "frenzy") {
    this.strike_frenzy_timer = this.silence_timer + this.silence_duration
  }
  this.spawn_queue = []

}

BossThree.prototype.global_silence = function() {
  this.player.silence(Math.round(this.silence_duration))
  for(var i = 0; i < this.level.enemies.length; i++) {
    if(this.level.enemies[i].id != this.id)
      this.level.enemies[i].silence(Math.round(this.silence_duration), true, true)
  }
}

BossThree.prototype.process_arm_polygons = function() {
  // adjusts the arms bsaed on their current angle and the location/angle of the boss
  for(var index in this.striking_arms) {
    var data = this.striking_arms[index]
    data.body.SetAngle(this.body.GetAngle() + Math.PI/(this.num_arms/2) * index)


    data.body.SetPosition(this.body.GetPosition())
    data.body.GetFixtureList().m_shape.m_vertices[1] = {x: Math.cos(0) * data.cur_dist, y: Math.sin(0) * data.cur_dist}
    data.body.GetFixtureList().m_shape.m_vertices[2] = {x: Math.cos(Math.PI/8) * data.cur_dist, y: Math.sin(Math.PI/8) * data.cur_dist}
  }
}

BossThree.prototype.process_striking_arms = function() {
  for(var index in this.striking_arms) {
    var data = this.striking_arms[index]
    if(data.duration > 0) {
      data.duration -= dt
    }

    if(data.duration <= 0) {
      data.cur_dist = data.start_dist
    } else {
      var prog = 1 - data.duration/data.interval
      var arm_size = 0
      if(data.max_dist == null) {
        data.max_dist = p_dist(this.body.GetPosition(), this.player.get_current_position()) + 5
        if(data.max_dist < 20) data.max_dist += 10
      }

      var start_strike_t = data.charging_prop;
      var finish_strike_t = data.charging_prop + (1-data.charging_prop) * 0.3;
      var start_retract_t = data.charging_prop + (1-data.charging_prop) * 0.7;
      var finish_retract_t = 1;

      if (prog < start_strike_t) {
        arm_size = prog / start_strike_t;
        data.cur_dist = data.start_dist * (1 - arm_size) + (data.charge_dist) * (arm_size)
      } else if (prog >= start_strike_t && prog < finish_strike_t) {
        arm_size = (prog - start_strike_t) / (finish_strike_t - start_strike_t);
        arm_size = bezier_interpolate(0.15, 0.85, arm_size);
        data.cur_dist = data.max_dist * (arm_size) + (data.charge_dist) * (1 - arm_size)
        if (!data.sound_played) {
          data.sound_played = true
          imp_params.impulse_music.play_sound("b3strike")
        }
      } else if (prog >= finish_strike_t && prog < start_retract_t) {
        data.cur_dist = data.max_dist
      } else if (prog >= start_retract_t && prog < finish_retract_t) {
        arm_size = (prog - start_retract_t) / (finish_retract_t - start_retract_t);
        arm_size = bezier_interpolate(0.15, 0.85, arm_size);
        if (arm_size > 0) {
          data.cur_dist = data.max_dist * (1 - arm_size) + (data.start_dist) * (arm_size)
        } else {
          data.cur_dist = data.start_dist
        }
      }
    }
  }
}

BossThree.prototype.set_all_arms_length = function(length) {
  for(var index in this.striking_arms) {
    var data = this.striking_arms[index]
    data.start_dist = length
    if(data.duration <= 0)
      data.cur_dist = length
  }
}

BossThree.prototype.cancel_strikes = function() {
  for(var index in this.striking_arms) {
    var data = this.striking_arms[index]
    if(data.duration > 0) {
      var prog = 1 - data.duration/data.interval
      if(prog < data.charging_prop)
        data.duration = 0
      else if(prog > data.charging_prop && prog < 0.5 * data.charging_prop + 0.5) {
        var mid_value = data.interval * (0.5 - data.charging_prop * 0.5)
        data.duration = 2 * mid_value - data.duration
      }
    }
  }
}

BossThree.prototype.strike_at_player = function() {

  if(this.striking_state == "striking") {
    var boss_angle = _atan(this.body.GetPosition(),this.player.get_current_position())
    var arm = Math.floor((boss_angle - this.body.GetAngle())/(Math.PI/8))
    while(arm < 0) {
      arm += this.num_arms
    }
    var dist = this.default_strike_range
    if(this.rotation_dir % 2 == 0)
      var choices = [arm-1, arm-3, arm-2]
    else
      var choices = [arm+3, arm+1, arm+2]
    for(var index = choices.length - 1; index >= 0; index--) {
      if(choices[index] >= this.num_arms) choices[index] -= this.num_arms
      if(choices[index] < 0) choices[index] += this.num_arms
      if(this.striking_arms[choices[index]].duration > 0) {
        choices.splice(index, 1)
      }
    }
    var index = Math.floor(Math.random() * choices.length)
    this.strike_with_arm(choices[index], dist, this.strike_duration)
  } else if(this.striking_state == "frenzy") {
    var boss_angle = _atan(this.body.GetPosition(),this.player.get_current_position())
    var arm = Math.floor((boss_angle - this.body.GetAngle())/(Math.PI/8))
    while(arm < 0) {
      arm += this.num_arms
    }
    var dist = null
    var choices = [arm-3, arm-2, arm-1, arm, arm+1, arm+2, arm+3, arm+4]
    var winnable = false
    for(var index = choices.length - 1; index >= 0; index--) {
      if(this.striking_arms[this.adjust_arm_index(choices[index])].duration > 0) {
        choices.splice(index, 1)
        if(index >= 2 && index <= 4) winnable = true
      }
    }

    if(!winnable) { // need to ban either arm-1, arm, or arm+1
      var banned_index = Math.floor(Math.random() * 3 - 1)
      choices.splice(choices.indexOf(arm+banned_index), 1)
    }

    var index = Math.floor(Math.random() * choices.length)
    this.strike_with_arm(choices[index], dist, this.strike_duration * this.strike_frenzy_speedup)
    choices.splice(index, 1)
    var index2 = Math.floor(Math.random() * choices.length)
    this.strike_with_arm(choices[index2], dist, this.strike_duration * this.strike_frenzy_speedup)
    choices.splice(index2, 1)

    if (choices.indexOf(arm) !== -1 && Math.random() < 0.5) {
      this.strike_with_arm(arm, dist, this.strike_duration * this.strike_frenzy_speedup);
    } else {
      var index3 = Math.floor(Math.random() * choices.length);
      this.strike_with_arm(choices[index3], dist, this.strike_duration * this.strike_frenzy_speedup);
    }


  }
}

BossThree.prototype.adjust_arm_index = function(index) {
  if(index >= this.num_arms) index -= this.num_arms
  if(index < 0) index += this.num_arms
    return index
}

BossThree.prototype.strike_with_arm = function(index, dist, duration) {

  if(!this.striking_index)
  this.striking_index = index

  index = this.adjust_arm_index(index)
  if(this.striking_arms[index].duration <= 0) {
    this.striking_arms[index].duration = duration
    this.striking_arms[index].interval = duration
    this.striking_arms[index].max_dist = dist
    this.striking_arms[index].start_dist = this.default_strike_position
    this.striking_arms[index].charge_dist = 0.8 * this.default_strike_position
    this.striking_arms[index].charging_prop = this.strike_charging_prop
    this.striking_arms[index].sound_played = false
  }
}

BossThree.prototype.initialize_arms = function() {
  for(var index = 0; index < this.num_arms; index++) {
    var arm_body =  create_body(this.world, imp_params.impulse_enemy_stats[this.type].arm_polygon, this.body.GetPosition().x, this.body.GetPosition().y, 3, 0.01, imp_params.BOSS_THREE_BIT, imp_params.PLAYER_BIT | imp_params.ENEMY_BIT, "static", this, null)
    arm_body.SetAngle(this.body.GetAngle() + Math.PI/(this.num_arms/2) * index)
    this.striking_arms[index] = {
      interval: this.strike_duration,
      duration: 0,
      max_dist: 0,
      cur_dist: this.effective_radius,
      body: arm_body,
      charging_prop: this.strike_charging_prop
    }
  }
}

BossThree.prototype.additional_death_prep_specific = function() {
  for(var index = 0; index < this.num_arms; index++) {
    // Need to recreate arms.
    var arm_body = create_body(this.world, imp_params.impulse_enemy_stats[this.type].arm_polygon, this.body.GetPosition().x,
    this.body.GetPosition().y, 3, 1, imp_params.BOSS_THREE_BIT, imp_params.PLAYER_BIT | imp_params.ENEMY_BIT, "dynamic", this, null)
    var angle = this.body.GetAngle() + Math.PI/(this.num_arms/2) * index;
    arm_body.SetAngle(angle);
    this.striking_arms[index].body = arm_body;
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    dir.Normalize();
    dir.Multiply(10);
    arm_body.ApplyImpulse(dir, arm_body.GetWorldCenter())
  }
}

BossThree.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.shape_points[0].length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add({x: this.shape_points[0][i].x, y: this.shape_points[0][i].y})
    ans.push(temp)
  }
  return ans
}


BossThree.prototype.draw = function(context, draw_factor) {
  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) {
    return
  }

  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
  context.save()
  if (this.dying)
    context.globalAlpha *= (1 - prog)
  else
    context.globalAlpha *= this.visibility != null ? this.visibility : 1

  var tp = this.body.GetPosition()

  var arms_active = [];
  if(this.spawned) {
    for(var index in this.striking_arms) {
      if(this.striking_arms[index].duration > 0 || this.dying) {
        var tp = this.striking_arms[index].body.GetPosition()
        var angle = this.striking_arms[index].body.GetAngle()
        context.save()
        context.translate(tp.x * draw_factor, tp.y * draw_factor)
        context.rotate(angle + Math.PI/16)
        var v_dist = this.striking_arms[index].cur_dist * Math.sin(Math.PI/16) * 2
        var h_dist = this.striking_arms[index].cur_dist * Math.cos(Math.PI/16)
        var armSpriteName = this.knockback_red_duration > 0 ? "negligentia_arm_striking_red" : "negligentia_arm_striking"
        drawSprite(context, h_dist/2 * draw_factor, 0, 0,
                  h_dist * draw_factor,v_dist * draw_factor, armSpriteName, negligentiaSprite)
        context.restore()
        arms_active.push(index);
      }
    }
  }

  context.save();
  context.beginPath();
  var tp = this.body.GetPosition()
  var cur_radius = this.target_arm_length * draw_factor;
  if (arms_active.indexOf("0") !== -1) {
    cur_radius = this.target_arm_length * draw_factor * 0.8;
  }
  var angle = this.body.GetAngle();
  context.moveTo(tp.x * draw_factor + cur_radius * Math.cos(angle), tp.y * draw_factor + cur_radius * Math.sin(angle));
  for (var i = 0; i < this.num_arms; i++) {
    var j = (i + 1) % this.num_arms;
    context.lineTo(tp.x * draw_factor + cur_radius * Math.cos(j * 2 * Math.PI / this.num_arms + angle),
      tp.y * draw_factor + cur_radius * Math.sin(j * 2 * Math.PI / this.num_arms + angle));
    var next_radius = this.target_arm_length * draw_factor;
    if (arms_active.indexOf("" + j) !== -1) {
      next_radius = this.target_arm_length * draw_factor * 0.8
    }
    if (next_radius != cur_radius) {
      context.lineTo(tp.x * draw_factor + next_radius * Math.cos(j * 2 * Math.PI / this.num_arms + angle),
        tp.y * draw_factor + next_radius * Math.sin(j * 2 * Math.PI / this.num_arms + angle));
      cur_radius = next_radius;
    }
  }
  context.closePath();
  context.clip();


  if(this.spawned) {
    if(this.striking_state == "extend" || this.striking_state == "retract") {
      var tp = this.body.GetPosition()
      drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle() + Math.PI/16), this.target_arm_length * draw_factor * 2, this.target_arm_length * draw_factor * 2, "negligentia_arm_ring", negligentiaSprite)
    } else if(this.striking_state == "striking" || this.striking_state == "frenzy") {
      var tp = this.body.GetPosition()
      drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle() + Math.PI/16), this.default_strike_position* draw_factor * 2, this.default_strike_position * draw_factor * 2, "negligentia_arm_ring", negligentiaSprite)
    }
  }
  context.restore();

  if(this.knockback_red_duration > 0) {
    drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle() + Math.PI/16), this.effective_radius * 2 * draw_factor, this.effective_radius * 2 * draw_factor, "negligentia_head_red", negligentiaSprite)
  } else {
    drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle() + Math.PI/16), this.effective_radius * 2 * draw_factor, this.effective_radius * 2 * draw_factor, "negligentia_head", negligentiaSprite)
  }

  /* context.save()
  context.globalAlpha *= 0.3
  for(var i = 0; i < 16; i++) {
    var angle = 2 * Math.PI * (i/16 + 1/32 - 1/4);


    if(1 - this.silence_timer / this.silence_interval > 1-i/16) {
      //context.globalAlpha *= 1.5
      drawSprite(context, (tp.x+Math.cos(angle)*this.default_strike_range) * draw_factor,
      (tp.y+Math.sin(angle) *this.default_strike_range) * draw_factor,
      angle + Math.PI/2, 30, 50, "negligentia_aura", negligentiaSprite)

    } else {
      drawSprite(context, (tp.x+Math.cos(angle)*this.default_strike_range) * draw_factor,
      (tp.y+Math.sin(angle) *this.default_strike_range) * draw_factor,
      angle + Math.PI/2, 30, 50, "negligentia_aura", negligentiaSprite)
    }
  }
  context.restore() */
  this.additional_drawing(context, draw_factor)

  context.restore()
}

BossThree.prototype.draw_glows = function(context, draw_factor) {

  var tp = this.body.GetPosition()
  if(this.knockback_red_duration > 0) {
    drawSprite(context, tp.x*draw_factor,
    tp.y*draw_factor,
    (this.body.GetAngle()), 300, 300, "negligentia_glow_red", negligentiaSprite)
  } else {
    drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (this.body.GetAngle()), 300, 300, "negligentia_glow", negligentiaSprite)
  }
}



BossThree.prototype.pre_draw = function(context, draw_factor) {
  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) {
    return
  }
  context.save()
  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0

  if (this.dying) {
      context.globalAlpha *= (1 - prog)
  } else {
    context.globalAlpha *= this.visibility != null ? this.visibility : 1
  }

  if(this.silenced && this.silence_timer < 0 && this.silence_timer >= -this.silence_duration) {
    context.save()
    var gray = Math.min(5 - Math.abs((-this.silence_timer - this.silence_duration/2)/(this.silence_duration/10)), 1)
    context.globalAlpha *= gray/2
    context.fillStyle = this.color
    context.fillRect(0, 0, imp_params.canvasWidth, imp_params.canvasHeight)
    context.restore()
  }

  this.draw_glows(context, draw_factor);

  if (!this.silenced)
    context.globalAlpha *= 0.4
  for(var i = 0; i < 16; i++) {
    var tp = this.body.GetPosition()
    var angle = 2 * Math.PI * (i/16 + 1/32 - 1/4);

    if(1 - this.silence_timer/this.silence_interval > 1-i/16 && (i != 0 || this.silenced)) {
      context.globalAlpha *= 2
      drawSprite(context, (tp.x+Math.cos(angle)*this.effective_radius * 1.8) * draw_factor,
      (tp.y+Math.sin(angle) *this.effective_radius * 1.8) * draw_factor,
      angle + Math.PI/2, 30, 50, "negligentia_aura", negligentiaSprite)
      context.globalAlpha /= 2

    } else {
      drawSprite(context, (tp.x+Math.cos(angle)*this.effective_radius * 1.8) * draw_factor,
      (tp.y+Math.sin(angle) *this.effective_radius * 1.8) * draw_factor,
      angle + Math.PI/2, 30, 50, "negligentia_aura_open", negligentiaSprite)
    }

  }

    /*context.rotate(-Math.PI/16)
    context.moveTo(body_vertices[0].x * draw_factor, body_vertices[0].y * draw_factor)
    context.lineTo(body_vertices[1].x * draw_factor, body_vertices[1].y * draw_factor)
    context.lineTo(body_vertices[2].x * draw_factor, body_vertices[2].y * draw_factor)

    /*var data = this.striking_arms[index]
    context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    var angle = this.body.GetAngle() + Math.PI*2/16 * index
    context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle) * data.cur_dist * draw_factor, this.body.GetPosition().y * draw_factor + Math.sin(angle) * data.cur_dist * draw_factor)
    context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/8) * data.cur_dist * draw_factor, this.body.GetPosition().y * draw_factor + Math.sin(angle + Math.PI/8) * data.cur_dist * draw_factor)
    context.strokeStyle = this.color
    context.stroke()
    if(this.striking_arms[index].duration > 0) {
      context.fillStyle = this.color
      context.fill()
    }*/
  context.restore()


}

BossThree.prototype.additional_drawing = function(context, draw_factor) {

  context.save()
  context.globalAlpha *= this.wheel_visibility

  if(this.wheel_state == "fadein" || this.wheel_state == "spinning" || this.wheel_state == "fadeout" || this.wheel_state == "activate") {
    var wheel_sprite = this.knockback_red_duration > 0 ? "negligentia_wheel_red" : "negligentia_wheel"
    if(this.wheel_state == "fadeout" || this.wheel_state == "activate") {
      wheel_sprite = "negligentia_wheel_complete"
    }
    // fill the current wheel

    var wheel_angle = (this.body.GetAngle() + Math.PI/16) + Math.PI/4
    var angle = Math.PI/(this.wheel_sections/2) * (this.wheel_cur_index +0.5)+ wheel_angle
    drawSprite(context, this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor, wheel_angle + Math.PI/2 * ((this.wheel_cur_index + 1 )% 4),
        2 * this.wheel_radius * Math.cos(Math.PI/4)*draw_factor, 2 * this.wheel_radius * Math.cos(Math.PI/4)*draw_factor, wheel_sprite, negligentiaSprite)


    if(this.wheel_state == "fadein" || this.wheel_state == "spinning") {

      for(var i = 0; i < this.wheel_sections; i++) {
        var angle = Math.PI/(this.wheel_sections/2) * (i+0.5) + wheel_angle
        if(this.current_wheel_set[i] != "frenzy") {
          draw_enemy(context, this.current_wheel_set[i], this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/(this.wheel_sections/2)/2) * this.wheel_radius * 0.4 * draw_factor,
            this.body.GetPosition().y * draw_factor + Math.sin(angle + Math.PI/(this.wheel_sections/2)/2) * this.wheel_radius * 0.4 * draw_factor, 15, angle + Math.PI*1/4)
        } else {
          draw_tessellation_sign(context, 3, this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/(this.wheel_sections/2)/2) * this.wheel_radius * 0.4 * draw_factor,
            this.body.GetPosition().y * draw_factor + Math.sin(angle + Math.PI/(this.wheel_sections/2)/2) * this.wheel_radius * 0.4 * draw_factor, 20, true,angle)

        }
      }
    } else if(this.wheel_state == "fadeout" || this.wheel_state == "activate") {
      if(this.wheel_cur_index != null) { // will be null if forcing frenzy
        if(this.current_wheel_set[this.wheel_cur_index] != "frenzy") {
          draw_enemy(context, this.current_wheel_set[this.wheel_cur_index], this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor, 20, angle + Math.PI*1/4)
        } else {
          draw_tessellation_sign(context, 3, this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor, 50, true, angle)
        }
      }
    }
  }

  /*if(this.silence_timer >= 0) {
    this.draw_special_attack_timer(context, draw_factor)
  }*/



  context.restore()

}

BossThree.prototype.draw_special_attack_timer = function(context, draw_factor) {
  context.beginPath()
  var special_prop = Math.min(1 - this.silence_timer / this.silence_interval, 1)
  context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor,
    (this.effective_radius*draw_factor) * 1.5, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * special_prop * 0.999)
  context.strokeStyle = this.color
  context.lineWidth = 2
  context.stroke()
}

BossThree.prototype.spawn_this_enemy = function(enemy_type) {
  var angle = _atan(this.body.GetPosition(), this.player.get_current_position());

  var spread = 0;

  if(enemy_type == "stunner" && Math.random() < 0.7)
    spread = Math.PI/4;
  if(enemy_type == "spear" && Math.random() < 0.7)
    spread = Math.PI/8;
  if((enemy_type == "tank") && Math.random() < 0.9)
    spread = Math.PI;
  if((enemy_type == "mote") && Math.random() < 0.7)
    spread = Math.PI;
  if((enemy_type == "troll") && Math.random() < 0.7)
    spread = Math.PI;
  if((enemy_type == "harpoon"))
    spread = Math.PI * 0.5;
  if((enemy_type == "fighter") && Math.random() < 0.5)
    spread = Math.PI * 0.5;

  if (spread != 0) {
    angle += Math.random() * spread - spread / 2;
  }

  var spawn_loc = {x: (this.body.GetPosition().x + Math.cos(angle) * this.effective_radius * 1.35)* imp_params.draw_factor,
    y: (this.body.GetPosition().y + Math.sin(angle) * this.effective_radius * 1.35)* imp_params.draw_factor}

  var new_enemy = new this.level.enemy_map[enemy_type](this.world, spawn_loc.x/imp_params.draw_factor, spawn_loc.y/imp_params.draw_factor, this.level.enemy_counter, this.impulse_game_state)
  var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
  dir.Multiply(this.spawn_force[enemy_type])
  new_enemy.body.ApplyImpulse(dir, new_enemy.body.GetWorldCenter())
  new_enemy.set_heading(angle);
  this.level.spawned_enemies.push(new_enemy)
  this.level.enemy_counter += 1
  // disable initial silence.
  new_enemy.entered_arena = true;
  new_enemy.recovery_timer = 0;


  new_enemy.pathfinding_counter = 2 * new_enemy.pathfinding_delay //immediately look for path
  new_enemy.entered_arena_delay = 0
  new_enemy.entered_arena_timer = 0
  if(enemy_type == "harpoon") {
    new_enemy.silence(500, true)
    //setTimeout(function(){new_enemy.body.ApplyImpulse(dir, new_enemy.body.GetWorldCenter())}, 20)
  }
}



BossThree.prototype.collide_with = function(other, body) {
  if(this.dying || !this.spawned)//ensures the collision effect only activates once
    return
  if (other === this.player) {
    this.impulse_game_state.reset_combo();
  }
  if(body !== this.body) {
    for(var index in this.striking_arms) {
      var data = this.striking_arms[index]
      var prog = 1 - data.duration/data.interval
      if(data.body == body) {
        if((prog > data.charging_prop && prog < data.charging_prop + (1-data.charging_prop) * 0.3) || prog >= 1 || prog < data.charging_prop) {
          var boss_angle = _atan(this.body.GetPosition(), other.body.GetPosition())
          if(other === this.player) {
            var _this = this;
            other.body.ApplyImpulse(new b2Vec2(_this.boss_force * Math.cos(boss_angle), _this.boss_force * Math.sin(boss_angle)), other.body.GetWorldCenter())
            this.impulse_game_state.reset_combo();
          } else if(other.type == "harpoonhead") {
            other.body.ApplyImpulse(new b2Vec2(this.spawn_force["harpoon"] * Math.cos(boss_angle), this.spawn_force["harpoon"] * Math.sin(boss_angle)), other.body.GetWorldCenter())
          } else {
            if(this.spawn_force[other.type] != undefined)
              var enemy_data = imp_params.impulse_enemy_stats[other.type]
              if (enemy_data) {
                var force = other.body.GetMass() * Math.sqrt(enemy_data.lin_damp) * this.boss_force
                other.body.ApplyImpulse(new b2Vec2(force * Math.cos(boss_angle), force * Math.sin(boss_angle)), other.body.GetWorldCenter())

              }
          }
        } /*else {
          var boss_angle = _atan(this.body.GetPosition(),other.body.GetPosition())
          var arm_angle = angle_closest_to(boss_angle, this.body.GetAngle() + Math.PI/(this.num_arms/2) * index)
          if(boss_angle > arm_angle) {
            var attack_angle = boss_angle + Math.PI/2
            other.body.ApplyImpulse(new b2Vec2(this.boss_force * Math.cos(attack_angle), this.boss_force * Math.sin(attack_angle)), other.body.GetWorldCenter())
          } else {
            var attack_angle = boss_angle - Math.PI/2
            other.body.ApplyImpulse(new b2Vec2(this.boss_force * Math.cos(attack_angle), this.boss_force * Math.sin(attack_angle)), other.body.GetWorldCenter())
          }
        }*/
      }
    }
  } else {
    var boss_angle = _atan(this.body.GetPosition(),other.body.GetPosition())
    var factor = 1
    if(other === this.player && imp_params.player_data.difficulty_mode == "easy") {
      factor = 0.5
    }
    other.body.ApplyImpulse(new b2Vec2(this.boss_force * factor * Math.cos(boss_angle), this.boss_force * factor * Math.sin(boss_angle)), other.body.GetWorldCenter())
  }
}

BossThree.prototype.activate_wheel = function() {
  this.wheel_state = "activate"
  this.wheel_activate_timer = this.wheel_activate_duration
  this.wheel_effect_activated = false
  imp_params.impulse_music.play_sound("b3select")
}

BossThree.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.knockback_red_duration = this.knockback_red_interval
  if(this.wheel_state == "spinning") {
    this.activate_wheel()
    this.extra_gap = this.wheel_spinning_timer
  }
}

BossThree.prototype.get_impulse_extra_factor = function() {
  if(imp_params.player_data.difficulty_mode == "easy") {
    return this.impulse_extra_factor * 1.5;
  }
  return this.impulse_extra_factor;
}
