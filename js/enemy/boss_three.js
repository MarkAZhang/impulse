BossThree.prototype = new Boss()

BossThree.prototype.constructor = BossThree

function BossThree(world, x, y, id, impulse_game_state) {

  this.type = "third boss"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false
  this.spawn_duration = 1000

  this.death_radius = 5

  this.shoot_interval = 1500

  this.shoot_duration = 5

  this.do_yield = false

  this.safe = true

  this.spawned = false

  this.body.SetAngle(Math.PI/16)

  this.dying_length = 2000

  this.visibility = 0

  this.red_visibility = 0

  this.boss_force = 100
  this.num_arms = 16
  this.striking_arms = {}
  this.strike_duration = 2500
  this.strike_interval = 1500
  this.strike_timer = this.strike_interval
  this.strike_charging_prop = 0.7

  this.default_heading = false
  this.spin_rate = 16*this.strike_duration * (1 - this.strike_charging_prop)

  this.wheel_spinning_duration = 4000
  this.wheel_spinning_timer = this.wheel_spinning_duration
  this.wheel_default_skips = 16
  this.wheel_switch = 250
  this.wheel_cur_index = 0

  this.wheel_state = "gap" // gap, fadein, spinning, activate, fadeout
  this.wheel_fade_duration = 1000
  this.wheel_fade_timer = this.wheel_fade_duration
  this.wheel_gap_interval = 2000
  this.wheel_gap_timer = this.wheel_gap_interval
  this.wheel_sections = 4
  this.wheel_radius = 3

  this.wheel_activate_duration = 1000
  this.wheel_activate_timer = 0
  this.gap_activation_counter = 0
  this.gap_activation_threshold = 1000
  this.gap_activated = false

  this.strike_frenzy_duration = 4500
  this.strike_frenzy_timer = this.strike_frenzy_duration
  this.strike_frenzy_speedup = 0.6

  this.extra_gap = 0

  this.striking_state = "extend" // extend, striking, retract, gap
  this.strike_transition_interval = 500
  this.strike_transition_timer = this.strike_transition_interval
  this.default_strike_position = this.effective_radius + 2

  this.wheel_visibility = 0

  this.wheel_sets = [
    ["harpoon", "spear", "tank", "mote"],
    ["fighter", "spear", "stunner", "mote"],
    ["troll", "disabler", "stunner", "mote"],
  ]

  this.current_wheel_set = this.generate_wheel_set()

  this.spawn_queue = []
  this.spawn_enemy_interval = 200
  this.spawn_enemy_timer = this.spawn_enemy_interval
  this.wheel_effect_activated = false

  this.spawn_count = {
   "stunner" : 8,
   "spear" : 8,
   "tank" : 6,
   "mote" : 8,
   "goo" : 1,
   "harpoon" : 4,
   "disabler" : 1,
   "fighter" : 4,
   "troll" : 8,
 }

 this.spawn_force = {
  "stunner" : 50,
   "spear" : 60,
   "tank" : 300,
   "mote" : 6,
   "goo" : 200,
   "harpoon" : 1250,
   "disabler" : 300,
   "fighter" : 1000,
   "troll" : 30,
}

 this.spawn_gap = {
  "stunner" : 500,
   "spear" : 1000,
   "tank" : 2000,
   "mote" : 500,
   "goo" : 0,
   "harpoon" : 2000,
   "disabler" : 0,
   "fighter" : 5000,
   "troll" : 1000,
   "frenzy": 1000
}

this.silence_interval = 30000//13400//20000
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
    temp.push("frenzy")
  return temp*/
  var tough_enemies = ["tank", "fighter", "troll", "frenzy"]
  var easy_enemies = ["stunner", "spear", "goo", "disabler"]
  var all_enemies = ["mote", "harpoon", "frenzy", "stunner", "spear", "goo", "disabler", "tank", "fighter", "troll"]

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

BossThree.prototype.additional_processing = function(dt) {
  if(this.spawn_duration > 0) {
    this.spawn_duration = Math.max(this.spawn_duration - dt, 0)
    this.visibility = 1 - this.spawn_duration / this.spawn_interval
    return
  }
  else if(this.spawned == false){
    this.spawned = true
    this.visibility = 1
    this.body.SetLinearDamping(impulse_enemy_stats[this.type].lin_damp)
  }
    if(this.rotating) {
      if(this.rotation_dir % 2 == 0)
        this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)
      else if(this.rotation_dir % 2 == 1)
        this.body.SetAngle(this.body.GetAngle() - 2*Math.PI * dt/this.spin_rate)
    }

  if(this.silence_timer < 0 && !this.silenced) {
    this.silenced = true
    this.global_silence()
    this.force_frenzy()
  }

  if(this.silence_timer < -this.silence_duration) {
    this.silenced = false
    this.silence_timer = this.silence_interval
  }
  this.silence_timer -= dt

  if(this.striking_state == "extend") {
    this.strike_transition_timer -= dt

    var prog = Math.min(1 - this.strike_transition_timer/this.strike_transition_interval, 1)
    var target_arm_length = this.effective_radius + prog * (this.default_strike_position - this.effective_radius)
    this.set_all_arms_length(target_arm_length)

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
    if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) <= 15) {
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
    var target_arm_length = this.effective_radius + prog * (this.default_strike_position - this.effective_radius)
    this.set_all_arms_length(target_arm_length)
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

    if(this.wheel_spinning_timer <= 0) {
      this.wheel_state = "activate"
      this.wheel_activate_timer = this.wheel_activate_duration
      this.wheel_effect_activated = false
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
        var type = this.current_wheel_set[this.wheel_cur_index]
        if(type != "frenzy") {
          for(var i = 0; i < this.spawn_count[type]; i++) {
            this.spawn_queue.push(type)
            this.wheel_activate_timer += this.spawn_enemy_interval
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
      this.spawn_enemy_timer = this.spawn_enemy_interval
    }
  }
  this.process_arm_polygons()
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

}

BossThree.prototype.global_silence = function() {
  this.player.silence(Math.round(this.silence_duration))
  for(var i = 0; i < this.level.enemies.length; i++) {
    if(this.level.enemies[i].id != this.id)
      this.level.enemies[i].silence(Math.round(this.silence_duration), true)
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

      if(prog > data.charging_prop && prog < data.charging_prop + (1-data.charging_prop) * 0.3) {
        arm_size = (prog  - data.charging_prop)* 1/((1-data.charging_prop) * 0.3)
      } else if(prog >= data.charging_prop + (1-data.charging_prop) * 0.3  && prog < data.charging_prop + (1-data.charging_prop) * 0.7) {
        arm_size = 1
      } else if(prog >= data.charging_prop + (1-data.charging_prop) * 0.7 ) {
        arm_size = (1-prog) * 1/((1-data.charging_prop) * 0.3)
      }
      arm_size = bezier_interpolate(0.15, 0.85, arm_size);
      data.cur_dist = data.max_dist * arm_size + (data.start_dist) * (1-arm_size)
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
      else if(prog > data.charging_prop && prog < data.charging_prop + (1 - data.charging_prop) * 0.5) {
        data.duration = data.charging_prop * data.interval - data.duration
      }

    }
  }
}

BossThree.prototype.strike_at_player = function() {

  if(this.striking_state == "striking") {
    var boss_angle = _atan(this.body.GetPosition(),this.player.body.GetPosition())
    var arm = Math.floor((boss_angle - this.body.GetAngle())/(Math.PI/8))
    while(arm < 0) {
      arm += this.num_arms
    }
    var dist = 15
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
    var boss_angle = _atan(this.body.GetPosition(),this.player.body.GetPosition())
    var arm = Math.floor((boss_angle - this.body.GetAngle())/(Math.PI/8))
    while(arm < 0) {
      arm += this.num_arms
    }
    var dist = p_dist(this.body.GetPosition(), this.player.body.GetPosition()) + 5
    var choices = [arm-3, arm-2, arm-1, arm, arm+1, arm+2, arm+3]
    for(var index = choices.length - 1; index >= 0; index--) {
      if(choices[index] >= this.num_arms) choices[index] -= this.num_arms
      if(choices[index] < 0) choices[index] += this.num_arms
      if(this.striking_arms[choices[index]].duration > 0) {
        choices.splice(index, 1)
      }
    }
    var index = Math.floor(Math.random() * choices.length)
    this.strike_with_arm(choices[index], dist, this.strike_duration * this.strike_frenzy_speedup)
    choices.splice(index, 1)
    var index2 = Math.floor(Math.random() * choices.length)
    this.strike_with_arm(choices[index2], dist, this.strike_duration * this.strike_frenzy_speedup)
    //choices.splice(index2, 1)
    //var index3 = Math.floor(Math.random() * choices.length)
    //this.strike_with_arm(choices[index3], dist, this.strike_duration * this.strike_frenzy_speedup)
  }
}



BossThree.prototype.strike_with_arm = function(index, dist, duration) {
  if(this.striking_arms[index].duration <= 0) {

    this.striking_arms[index].duration = duration
    this.striking_arms[index].interval = duration
    this.striking_arms[index].max_dist = dist
    this.striking_arms[index].start_dist = this.default_strike_position
    this.striking_arms[index].charging_prop = this.strike_charging_prop

  }
}

BossThree.prototype.initialize_arms = function() {
  for(var index = 0; index < this.num_arms; index++) {
    var arm_body =  create_body(this.world, impulse_enemy_stats[this.type].arm_polygon, this.body.GetPosition().x, this.body.GetPosition().y, 3, 10, imp_vars.BOSS_THREE_BIT, imp_vars.PLAYER_BIT | imp_vars.ENEMY_BIT, "static", this, null)
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

BossThree.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.shape_points[0].length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add({x: this.shape_points[0][i].x * 0.6, y: this.shape_points[0][i].y * 0.6})
    ans.push(temp)
  }
  return ans
}




BossThree.prototype.pre_draw = function(context, draw_factor) {
  for(var index in this.striking_arms) {
    context.beginPath()
    var body_vertices = this.striking_arms[index].body.GetFixtureList().m_shape.m_vertices
    var tp = this.striking_arms[index].body.GetPosition()
    var angle = this.striking_arms[index].body.GetAngle()
    context.save()
    context.translate(tp.x * draw_factor, tp.y * draw_factor)
    context.rotate(angle)

    context.moveTo(body_vertices[0].x * draw_factor, body_vertices[0].y * draw_factor)
    context.lineTo(body_vertices[1].x * draw_factor, body_vertices[1].y * draw_factor)
    context.lineTo(body_vertices[2].x * draw_factor, body_vertices[2].y * draw_factor)

    /*var data = this.striking_arms[index]
    context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    var angle = this.body.GetAngle() + Math.PI*2/16 * index
    context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle) * data.cur_dist * draw_factor, this.body.GetPosition().y * draw_factor + Math.sin(angle) * data.cur_dist * draw_factor)
    context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/8) * data.cur_dist * draw_factor, this.body.GetPosition().y * draw_factor + Math.sin(angle + Math.PI/8) * data.cur_dist * draw_factor)
    */context.strokeStyle = this.color
    context.stroke()
    if(this.striking_arms[index].duration > 0) {
      context.fillStyle = this.color
      context.fill()
    }
    context.restore()
  }

  context.save()
  context.globalAlpha *= 0.8;
  if(this.silence_timer < 0 && this.silence_timer >= -this.silence_duration) {
    var gray = Math.min(5 - Math.abs((-this.silence_timer - this.silence_duration/2)/(this.silence_duration/10)), 1)
    context.globalAlpha *= gray/2
    context.fillStyle = this.color
    context.fillRect(0, 0, canvasWidth, canvasHeight)
  }
  context.restore()
}

BossThree.prototype.additional_drawing = function(context, draw_factor) {

  context.save()
  context.globalAlpha *= this.wheel_visibility

  if(this.wheel_state == "fadein" || this.wheel_state == "spinning") {
    // fill the current wheel
    context.beginPath()
    var angle = Math.PI/(this.wheel_sections/2) * this.wheel_cur_index + this.body.GetAngle()
    context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle) * this.wheel_radius*draw_factor, this.body.GetPosition().y * draw_factor  + Math.sin(angle) * this.wheel_radius *draw_factor)
    context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/(this.wheel_sections/2)) * this.wheel_radius*draw_factor, this.body.GetPosition().y * draw_factor  + Math.sin(angle + Math.PI/(this.wheel_sections/2)) * this.wheel_radius*draw_factor)
    context.fillStyle = this.color
    context.fill()

    context.beginPath()
    for(var i = 0; i < this.wheel_sections; i++) {
      var angle = Math.PI/(this.wheel_sections/2) * i + this.body.GetAngle()
      context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
      context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle) * this.wheel_radius*draw_factor, this.body.GetPosition().y * draw_factor  + Math.sin(angle) * this.wheel_radius *draw_factor)
      context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/(this.wheel_sections/2)) * this.wheel_radius*draw_factor, this.body.GetPosition().y * draw_factor  + Math.sin(angle + Math.PI/(this.wheel_sections/2)) * this.wheel_radius*draw_factor)

    }
    context.lineWidth = 2
    context.strokeStyle = this.color
    context.stroke()

    for(var i = 0; i < this.wheel_sections; i++) {
      var angle = Math.PI/(this.wheel_sections/2) * i + this.body.GetAngle()
      if(this.current_wheel_set[i] != "frenzy") {
        draw_enemy(context, this.current_wheel_set[i], this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/(this.wheel_sections/2)/2) * this.wheel_radius/3 * draw_factor,
          this.body.GetPosition().y * draw_factor + Math.sin(angle + Math.PI/(this.wheel_sections/2)/2) * this.wheel_radius/3 * draw_factor, 15, angle + Math.PI*1/4)
      } else {
        draw_tessellation_sign(context, 3, this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/(this.wheel_sections/2)/2) * this.wheel_radius/3 * draw_factor,
          this.body.GetPosition().y * draw_factor + Math.sin(angle + Math.PI/(this.wheel_sections/2)/2) * this.wheel_radius/3 * draw_factor, 15, null, angle)

      }
    }
  } else if(this.wheel_state == "fadeout" || this.wheel_state == "activate") {
    context.beginPath()
    var angle = Math.PI/(this.wheel_sections/2) * (this.wheel_sections - 1) + this.body.GetAngle()
    context.moveTo(this.body.GetPosition().x * draw_factor + Math.cos(angle) * this.wheel_radius*draw_factor, this.body.GetPosition().y * draw_factor  + Math.sin(angle) * this.wheel_radius *draw_factor)
    for(var i = 0; i < this.wheel_sections; i++) {
      var angle = Math.PI/(this.wheel_sections/2) * i + this.body.GetAngle()
      context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle) * this.wheel_radius*draw_factor, this.body.GetPosition().y * draw_factor  + Math.sin(angle) * this.wheel_radius *draw_factor)
    }
    context.fillStyle = this.color
    context.fill()

    if(this.wheel_cur_index != null) { // will be null if forcing frenzy
      if(this.current_wheel_set[this.wheel_cur_index] != "frenzy") {
        draw_enemy(context, this.current_wheel_set[this.wheel_cur_index], this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor, 15, angle + Math.PI*1/4)
      } else {
        draw_tessellation_sign(context, 3, this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor, 15, null, angle)

      }
    }
  }

  if(this.silence_timer >= 0) {
    this.draw_special_attack_timer(context, draw_factor)
  }

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

  var angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
  var spawn_loc = {x: (this.body.GetPosition().x + Math.cos(angle) * this.effective_radius * 1.25)* draw_factor,
    y: (this.body.GetPosition().y + Math.sin(angle) * this.effective_radius * 1.25)* draw_factor}

  var new_enemy = new this.level.enemy_map[enemy_type](this.world, spawn_loc.x/draw_factor, spawn_loc.y/draw_factor, this.level.enemy_counter, this.impulse_game_state)
  this.level.spawned_enemies.push(new_enemy)
  this.level.enemy_counter += 1
  if(enemy_type == "stunner" && Math.random() < 0.7)
    angle += Math.random()*Math.PI/4 - Math.PI/8
  if((enemy_type == "tank") && Math.random() < 0.7)
    angle += Math.random()*Math.PI/3 - Math.PI/6
  if((enemy_type == "mote") && Math.random() < 0.7)
    angle += Math.random()*Math.PI * 0.7 - Math.PI * 0.35
  if((enemy_type == "troll") && Math.random() < 0.7)
    angle += Math.random()*Math.PI * 0.8 - Math.PI * 0.4
  if((enemy_type == "harpoon"))
    angle += Math.random()*Math.PI/8 - Math.PI/16
  var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
  dir.Multiply(this.spawn_force[enemy_type])
  new_enemy.body.ApplyImpulse(dir, new_enemy.body.GetWorldCenter())
  new_enemy.body.SetAngle(angle)
  new_enemy.pathfinding_counter = 2 * new_enemy.pathfinding_delay //immediately look for path
  new_enemy.entered_arena_delay = 0
  new_enemy.entered_arena_timer = 0
  if(enemy_type == "harpoon") {
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    dir.Multiply(this.spawn_force[enemy_type])
    new_enemy.silence(500, true)
    setTimeout(function(){new_enemy.body.ApplyImpulse(dir, new_enemy.body.GetWorldCenter())}, 20)
  }
}



BossThree.prototype.collide_with = function(other, body) {
  if(this.dying || !this.spawned)//ensures the collision effect only activates once
    return
  if(body !== this.body) {
    for(var index in this.striking_arms) {
      var data = this.striking_arms[index]
      var prog = 1 - data.duration/data.interval
      if(data.body == body) {
        if((prog > data.charging_prop && prog < data.charging_prop + (1-data.charging_prop) * 0.3) || prog >= 1) {
          var boss_angle = _atan(this.body.GetPosition(), other.body.GetPosition())
          if(other === this.player)
            other.body.ApplyImpulse(new b2Vec2(this.boss_force * Math.cos(boss_angle), this.boss_force * Math.sin(boss_angle)), other.body.GetWorldCenter())
          else if(other.type == "harpoonhead") {
            other.body.ApplyImpulse(new b2Vec2(this.spawn_force["harpoon"] * Math.cos(boss_angle), this.spawn_force["harpoon"] * Math.sin(boss_angle)), other.body.GetWorldCenter())
          } else {
            if(this.spawn_force[other.type] != undefined)
              other.body.ApplyImpulse(new b2Vec2(this.spawn_force[other.type] * Math.cos(boss_angle), this.spawn_force[other.type] * Math.sin(boss_angle)), other.body.GetWorldCenter())
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
    other.body.ApplyImpulse(new b2Vec2(this.boss_force * Math.cos(boss_angle), this.boss_force * Math.sin(boss_angle)), other.body.GetWorldCenter())
  }
}

BossThree.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {

  if(this.wheel_state == "spinning") {
    this.wheel_state = "activate"
    this.wheel_activate_timer = this.wheel_activate_duration
    this.wheel_effect_activated = false
    this.extra_gap = this.wheel_spinning_timer
  }
}
