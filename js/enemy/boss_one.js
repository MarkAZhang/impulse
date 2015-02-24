BossOne.prototype = new Boss()

BossOne.prototype.constructor = BossOne

function BossOne(world, x, y, id, impulse_game_state) {
  this.type = "first boss"

  this.world = world

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.shoot_interval = 562.5

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

  this.bullet_alternater = 0

  this.safe = true

  this.shoot_interval = 3000

  this.shoot_speedup_factor = 2

  this.times_shot = 0

  this.lighten_interval = 9000

  this.turret_enemy_threshold = 30

  this.lighten_timer = this.lighten_interval - 1

  this.lighten_duration = 3000

  this.lightened = false

  this.spawned = false

  this.enemies_to_spawn = ["stunner", "spear", "tank"]
  this.spawn_force =
  {
    "stunner": 5, //30,
    "spear": 3, //15,
    "tank": 20//80
  }
  this.default_heading = false

  this.body.SetAngle(Math.PI/2)
  this.initial_angle = Math.PI/2

  this.visibility = 0

  this.turret_firing_interval = 500

  if(imp_vars.player_data.difficulty_mode == "easy") {
    this.turret_firing_interval = 750
  }

  // Slightly easier to push on easy mode.
  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.impulse_extra_factor = 20
  } else {
    // Impulse is HIGHER on normal mode because touching the boss is death.
    this.impulse_extra_factor = 15
  }

  this.turn_rate = 5000

  this.red_visibility = 0

  this.body.SetLinearDamping(imp_params.impulse_enemy_stats[this.type].lin_damp * 100)

  this.boss_force = 30

  if(imp_vars.player_data.difficulty_mode == "easy") {
    this.boss_force = 20
  }

  this.joint_padding = 1

  this.punch_force = 8

  this.retract_force = 1

  this.action_interval = 750

  this.default_transition_interval = 400
  this.loading_punch_interval = 400

  this.retract_transition_interval = 300
  this.punch_action_interval = 400
  this.paralyze_interval = 300

  this.right_arm_punch_offset_delay = (this.default_transition_interval + this.punch_action_interval + this.retract_transition_interval + this.loading_punch_interval + this.paralyze_interval)/2

  this.action_default_interval = 1500
  this.turret_transition_interval = 1500

  this.knockback_red_interval = 150
  this.knockback_red_duration = 0

  this.punch_knockback_window = 100

  this.knockback_arm_interval = 150
  this.knockback_arm_timers = {
    left: 0,
    right: 0
  }

  this.min_turret_switch_dist = 15

  this.paralyzed_pause = {
    left: 0,
    right: 0
  }

  this.action_timer = {
    left: this.action_interval,
    right: this.action_interval
  }

  this.data = imp_params.impulse_enemy_stats[this.type]

  this.state = "turret"
  this.state_switch_interval = 10000
  this.state_switch_timer = this.state_switch_interval

  this.arm_states = {
    left: "none",
    right: "none"
  }
  this.joints = {}
  this.body_parts = {}

  this.add_arms()

  this.joint_target_locs = {}

  this.joint_polygons = {

    "lu": this.data.upper_arm_polygon[0],
    "ru": this.data.upper_arm_polygon[0],
    "ll": this.data.lower_arm_polygon[0],
    "rl": this.data.lower_arm_polygon[0],
    "lh": this.data.hand_polygon[0],
    "rh": this.data.hand_polygon[0]
  }

  this.punch_start = {}


  this.punch_target_pts = {
    left: "none",
    right: "none"
  }

  this.last_action_interval = {
    left: 0,
    right: 0
  }
  this.punch_range = 13

  this.punch_angle= {
    left: 0,
    right: 0
  }

  this.target_angle = null
  var _this = this;


  this.punching_explode_interval = 13500 // slightly earlier than 13400
  this.punching_explode_timer = this.punching_explode_interval

  this.punching_explode_warning_interval = 2000
  this.punching_explode_shockwave_interval = 200

  this.punching_explode_warning_parts = 8
  this.punching_explode_warning_size = 100

  this.punching_explode_radius = 15

  this.punching_explode_force = 150

  this.punch_exploded = false

  this.max_turret_interval = 4000
  this.max_punching_interval = 12000
  this.max_punching_interval_with_no_enemies = 6000
  this.max_turret_timer = this.max_turret_interval
  this.max_punching_timer = this.max_punching_interval

  this.require_open = false

  this.impulse_hand_force = 0.1

  this.lockon_display_interval = 1000
  this.lockon_display_timer = 0
  this.lockon_display = null

  this.start_time = 0

  this.first_turret = true
}

//
BossOne.prototype.add_arms = function() {

  var upper_arm_r = imp_params.impulse_enemy_stats[this.type].upper_arm_polygon[0].r;
  var lower_arm_r = imp_params.impulse_enemy_stats[this.type].lower_arm_polygon[0].r
  var hand_r = imp_params.impulse_enemy_stats[this.type].hand_polygon[0].r;
  var body_r = this.effective_radius;
  var body_x = this.body.GetPosition().x
  var body_y = this.body.GetPosition().y
  var j_gap = this.joint_padding

  this.body_parts["lu"] = this.create_upper_arm_piece(body_x + body_r + upper_arm_r - 2 * j_gap, body_y)
  this.joints["lu"] = this.create_joint(new b2Vec2(body_x + body_r - j_gap, body_y), this.body, this.body_parts["lu"])

  this.body_parts["ll"] = this.create_lower_arm_piece(body_x + body_r + 2 * upper_arm_r + lower_arm_r - 4 * j_gap, body_y)
  this.joints["ll"] = this.create_joint(new b2Vec2(body_x + body_r + 2 * upper_arm_r - 3* j_gap, body_y), this.body_parts["lu"], this.body_parts["ll"])

  this.body_parts["lh"] = this.create_hand(body_x + body_r + 2 * upper_arm_r + 2*lower_arm_r - 4 * j_gap + 0.25 * hand_r, body_y)
  this.body_parts["lh"].SetAngle(Math.PI/4)
  this.joints["lh"] = this.create_joint(new b2Vec2(body_x + body_r + 2 * upper_arm_r + 2 * lower_arm_r - 4* j_gap + 0.25 * hand_r, body_y), this.body_parts["ll"], this.body_parts["lh"])

  this.body_parts["ru"] = this.create_upper_arm_piece(body_x - (body_r + upper_arm_r - 2 * j_gap), body_y)
  this.joints["ru"] = this.create_joint(new b2Vec2(body_x - (body_r - j_gap), body_y), this.body, this.body_parts["ru"])

  this.body_parts["rl"] = this.create_lower_arm_piece(body_x - (body_r + 2 * upper_arm_r + lower_arm_r - 4 * j_gap), body_y)
  this.joints["rl"] = this.create_joint(new b2Vec2(body_x - (body_r + 2 * upper_arm_r - 3* j_gap), body_y), this.body_parts["ru"], this.body_parts["rl"])

  this.body_parts["rh"] = this.create_hand(body_x - (body_r + 2 * upper_arm_r + 2*lower_arm_r - 4 * j_gap + 0.25 * hand_r), body_y)
  this.body_parts["rh"].SetAngle(Math.PI/4)
  this.joints["rh"] = this.create_joint(new b2Vec2(body_x - (body_r + 2 * upper_arm_r + 2 * lower_arm_r - 4* j_gap + 0.25 * hand_r), body_y), this.body_parts["rl"], this.body_parts["rh"])

}

BossOne.prototype.additional_death_prep_specific = function() {
  var body_parts = ["lu", "ll", "lh", "ru", "rl", "rh"];
  var death_explode_force = 10;
  this.knockback_red_duration = 0;
  this.knockback_arm_timers.left = 0;
  this.knockback_arm_timers.right = 0;

  for (var i = 0; i < body_parts.length; i++) {
    this.world.DestroyJoint(this.joints[body_parts[i]]);
    var angle = _atan(this.body.GetPosition(), this.body_parts[body_parts[i]].GetPosition());
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    dir.Normalize();
    dir.Multiply(death_explode_force);
    this.body_parts[body_parts[i]].ApplyImpulse(dir, this.body_parts[body_parts[i]].GetWorldCenter())
  }
}

BossOne.prototype.load_punch_at_player = function(side, pt) {
    this.set_timer(side, this.loading_punch_interval)
    if(side=="left") {
      var _this = this;
      this.arm_states[side] = "loading"
      this.rotate_joint_to("lu", -Math.PI * 0.3)
      //this.rotate_joint_to("ll", Math.PI * 0.75)
      this.rotate_joint_to("lh", Math.PI/4)
      this.rotate_joint_to("ll", function() {
        var this_angle = angle_closest_to(_this.joints["ll"].GetJointAngle(), _atan(_this.joints["ll"].GetAnchorA(), _this.player.get_current_position())
         - _this.joints["lu"].GetJointAngle() - (_this.body.GetAngle() - _this.initial_angle))
        return this_angle
        //return _atan(_this.joints["ll"].GetAnchorA(), _this.player.get_current_position()) - _this.joints["lu"].GetJointAngle()
      })
      //this.rotate_joint_to("lh", Math.PI/4)*/
      this.punch_angle[side] = _atan(this.joints["ll"].GetAnchorA(), pt)

      this.punch_target_pts[side] = {x: this.joints["ll"].GetAnchorA().x + Math.cos(this.punch_angle[side]) * this.punch_range,
                            y: this.joints["ll"].GetAnchorA().y + Math.sin(this.punch_angle[side]) * this.punch_range,
                          }
      this.lockon_display_timer = this.lockon_display_interval
      this.lockon_display = "left"
    }

    if(side=="right") {
      var _this = this;
      this.arm_states[side] = "loading"
      this.rotate_joint_to("ru", Math.PI * 0.3)
      //this.rotate_joint_to("rl", - Math.PI* 0.75)
      this.rotate_joint_to("rh", -Math.PI/4)
      this.rotate_joint_to("rl", function() {
        var this_angle = angle_closest_to(_this.joints["rl"].GetJointAngle(), Math.PI+_atan(_this.joints["rl"].GetAnchorA(), _this.player.get_current_position())
         - _this.joints["ru"].GetJointAngle() - (_this.body.GetAngle() - _this.initial_angle))
        return this_angle
        //return _atan(_this.joints["ll"].GetAnchorA(), _this.player.get_current_position()) - _this.joints["lu"].GetJointAngle()
      })
      //this.rotate_joint_to("rh", -Math.PI/4)*/
      this.punch_angle[side] = _atan(this.joints["rl"].GetAnchorA(), pt)

      this.punch_target_pts[side] = {x: this.joints["rl"].GetAnchorA().x + Math.cos(this.punch_angle[side]) * this.punch_range,
                            y: this.joints["rl"].GetAnchorA().y + Math.sin(this.punch_angle[side]) * this.punch_range,
      }
      this.lockon_display_timer = this.lockon_display_interval
      this.lockon_display = "right"
    }
}

BossOne.prototype.move_arm_to_default = function(side, right_stall) {
    this.set_timer(side, this.default_transition_interval)
    if(side=="left") {
      this.arm_states[side] = "default"
      this.rotate_joint_to("lu", -Math.PI/4)
      this.rotate_joint_to("ll", Math.PI/2)
      this.rotate_joint_to("lh", 0)
    } else if(side=="right") {
      this.arm_states[side] = "default"
      if(right_stall) {
        this.arm_states[side] = "delay_default"
      }
      this.rotate_joint_to("ru", Math.PI/4)
      this.rotate_joint_to("rl", -Math.PI/2)
      this.rotate_joint_to("rh", 0)
    }
}



BossOne.prototype.move_arm_to_turret = function(side, right_stall) {
    this.set_timer(side, this.turret_transition_interval)
    if(side=="left") {
      this.arm_states[side] = "loading_turret"
      this.rotate_joint_to("lu", Math.PI/2)
      this.rotate_joint_to("ll", 0)
      this.rotate_joint_to("lh", 0)
    } else if(side=="right") {
      this.arm_states[side] = "loading_turret"
      this.rotate_joint_to("ru", -Math.PI/2)
      this.rotate_joint_to("rl", 0)
      this.rotate_joint_to("rh", 0)
    }
}

BossOne.prototype.punch_at = function(pt, side) {
  this.set_timer(side, this.punch_action_interval )

  if(side == "left")
  /*console.log("LH: "+this.joints["lh"].GetJointAngle()+" RH: "+this.joints["rh"].GetJointAngle()+" LL: "+this.joints["ll"].GetJointAngle()
   +" RL: "+this.joints["rl"].GetJointAngle()+" LU: "+this.joints["lu"].GetJointAngle()+" RU: "+this.joints["ru"].GetJointAngle()
   +" CUR ANGLE: "+this.body.GetAngle())*/

  if(side=="left") {
    this.punch_start["ll"] = this.joints["ll"].GetJointAngle()
    this.punch_start["lu"] = this.joints["lu"].GetJointAngle()
    this.punch_start["lh"] = this.joints["lh"].GetJointAngle()

    /*this.punch_angle[side] = _atan(this.joints["ll"].GetAnchorA(), pt)

    this.punch_target_pts[side] = {x: this.joints["ll"].GetAnchorA().x + Math.cos(this.punch_angle[side]) * this.punch_range,
                            y: this.joints["ll"].GetAnchorA().y + Math.sin(this.punch_angle[side]) * this.punch_range,
                          }*/
    this.arm_states[side] = "punching"
    this.joints["ll"].SetLimits(0, Math.PI)
    this.joints["lu"].SetLimits(-Math.PI, Math.PI)
    this.joints["lh"].SetLimits(0, 0)
  }

  if(side=="right") {
    this.punch_start["rl"] = this.joints["rl"].GetJointAngle()
    this.punch_start["ru"] = this.joints["ru"].GetJointAngle()
    this.punch_start["rh"] = this.joints["rh"].GetJointAngle()

    /*this.punch_angle[side] = _atan(this.joints["rl"].GetAnchorA(), pt)

    this.punch_target_pts[side] = {x: this.joints["rl"].GetAnchorA().x + Math.cos(this.punch_angle[side]) * this.punch_range,
                            y: this.joints["rl"].GetAnchorA().y + Math.sin(this.punch_angle[side]) * this.punch_range,
                          }*/
    this.arm_states[side] = "punching"
    this.joints["rl"].SetLimits(-Math.PI, 0)
    this.joints["ru"].SetLimits(-Math.PI, Math.PI)
    this.joints["rh"].SetLimits(0, 0)
  }
}

BossOne.prototype.paralyze_arm = function(side) {
  this.arm_states[side] = "paralyzed"
  if(side == "right") {
    var joints = ["rl", "ru", "rh"]
  }
  if(side == "left") {
    var joints = ["ll", "lu", "lh"]
  }

  for(var index in joints) {
    var joint_name = joints[index]
    this.joints[joint_name].SetLimits(this.joints[joint_name].GetJointAngle(), this.joints[joint_name].GetJointAngle())
  }


}

BossOne.prototype.retract_punch = function(side) {

  this.set_timer(side, this.retract_transition_interval)
    if(side=="left") {
      this.punch_target_pts["left"] = null
      this.arm_states[side] = "retract"
      this.rotate_joint_to("lu", this.punch_start["lu"])
      this.rotate_joint_to("ll", this.punch_start["ll"])
      this.rotate_joint_to("lh", this.punch_start["lh"])
    } else if(side=="right") {
      this.punch_target_pts["right"] = null
      this.arm_states[side] = "retract"
      this.rotate_joint_to("ru", this.punch_start["ru"])
      this.rotate_joint_to("rl", this.punch_start["rl"])
      this.rotate_joint_to("rh", this.punch_start["rh"])
    }

  /*if(side=="left") {


    //this.punch_target_pts[side] = {x: this.joints["lh"].GetAnchorA().x + Math.cos(Math.PI+this.punch_angle[side]) * this.punch_range/2,
    //                        y: this.joints["lh"].GetAnchorA().y + Math.sin(Math.PI+this.punch_angle[side]) * this.punch_range/2,
    //                      }
    this.arm_states[side] = "retract"
    this.joints["ll"].SetLimits(0, Math.PI)
    this.joints["lu"].SetLimits(-Math.PI, Math.PI)
    this.joints["lh"].SetLimits(0, 0)
  }

  if(side=="right") {

    this.punch_target_pts[side] = {x: this.joints["rh"].GetAnchorA().x + Math.cos(Math.PI+this.punch_angle[side]) * this.punch_range/2,
                            y: this.joints["rh"].GetAnchorA().y + Math.sin(Math.PI+this.punch_angle[side]) * this.punch_range/2,
                          }
    this.arm_states[side] = "retract"
    this.joints["rl"].SetLimits(-Math.PI, 0)
    this.joints["ru"].SetLimits(-Math.PI, Math.PI)
    this.joints["rh"].SetLimits(0, 0)
  }*/
}

BossOne.prototype.rotate_joint_to = function(joint_name, angle) {

  this.joint_target_locs[joint_name] = {
    start: this.joints[joint_name].GetJointAngle(),
    end: angle
  }
}

BossOne.prototype.turret_fire_enemy = function(arm) {

  var dir = new b2Vec2(Math.cos(this.body.GetAngle()), Math.sin(this.body.GetAngle()));

  var enemy_type = this.enemies_to_spawn[Math.floor(Math.random() * this.enemies_to_spawn.length)]
  if (imp_vars.player_data.difficulty_mode == "easy" && enemy_type == "tank") {
    // If it's a tank, reroll to reduce number of tanks.
    if (Math.random() < 0.5) {
      enemy_type = this.enemies_to_spawn[Math.floor(Math.random() * this.enemies_to_spawn.length)]
    }
  }
  dir.Normalize()
  var spawn_loc = null;
  if(arm == "left")
    spawn_loc = {x: this.body_parts['lh'].GetPosition().x + dir.x * 3,
     y: this.body_parts['lh'].GetPosition().y + dir.y * 3}
  if(arm == "right")
    spawn_loc = {x: this.body_parts['rh'].GetPosition().x + dir.x * 3,
  y: this.body_parts['rh'].GetPosition().y + dir.y * 3}
  dir.Multiply(this.spawn_force[enemy_type])
  var new_enemy = new this.level.enemy_map[enemy_type](this.world, spawn_loc.x, spawn_loc.y, this.level.enemy_counter, this.impulse_game_state)
  this.level.spawned_enemies.push(new_enemy)
  new_enemy.body.ApplyImpulse(dir, new_enemy.body.GetWorldCenter())
  new_enemy.stun(this.max_turret_timer + 2000)
  new_enemy.invincible(this.max_turret_timer + 2000)
  if(enemy_type == "stunner")
    new_enemy.open(1500)
  new_enemy.pathfinding_counter = 2 * new_enemy.pathfinding_delay //immediately look for path
  new_enemy.set_heading(this.body.GetAngle());
  if(this.lighten_timer < 0) {
    new_enemy.lighten((this.lighten_timer + this.lighten_duration))
  }
  this.level.enemy_counter += 1
}

BossOne.prototype.set_timer = function(side, time) {
  this.action_timer[side] = time;
  this.last_action_interval[side] = time
}

BossOne.prototype.create_lower_arm_piece = function(x, y) {
  return create_body(this.world, imp_params.impulse_enemy_stats[this.type].lower_arm_polygon, x, y, 3, 0.01, imp_params.BOSS_ONE_BIT, imp_params.ENEMY_BIT | imp_params.PLAYER_BIT, "dynamic", this, null)
}
BossOne.prototype.create_upper_arm_piece = function(x, y) {
  return create_body(this.world, imp_params.impulse_enemy_stats[this.type].upper_arm_polygon, x, y, 3, 0.01, imp_params.BOSS_ONE_BIT, imp_params.ENEMY_BIT | imp_params.PLAYER_BIT, "dynamic", this, null)
}
BossOne.prototype.create_hand = function(x, y) {
  return create_body(this.world, imp_params.impulse_enemy_stats[this.type].hand_polygon, x, y, 3, 0.01, imp_params.BOSS_ONE_BIT, imp_params.ENEMY_BIT | imp_params.PLAYER_BIT, "dynamic", this, null)
}
BossOne.prototype.create_joint = function(joint_loc, body1, body2) {

  var joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef
  joint.Initialize(body1, body2, joint_loc)
  joint.enableLimit = true;
  joint.lowerAngle = -Math.PI/2
  joint.upperAngle = Math.PI/2
  joint.collideConnected = false
  return this.world.CreateJoint(joint)
}

BossOne.prototype.boss_specific_additional_processing = function(dt) {

  this.start_time += dt

  if (this.level.enemies.length == 1) {
    // if there are no enemies on the stage, don't punch for so long
    if (this.max_punching_timer > this.max_punching_interval_with_no_enemies) {
      this.max_punching_timer = this.max_punching_interval_with_no_enemies
    }
  }

  //console.log("LH: "+this.joints["lh"].GetJointAngle()+"RH: "+this.joints["rh"].GetJointAngle()+"LL: "+this.joints["ll"].GetJointAngle()
  //  +"RL: "+this.joints["rl"].GetJointAngle()+"LU: "+this.joints["lu"].GetJointAngle()+"RU: "+this.joints["ru"].GetJointAngle()
  //  +"CUR ANGLE: "+this.body.GetAngle())

  //if(this.punching_explode_timer != null) {
    /*this.punching_explode_timer -= dt
    if(this.punching_explode_timer < 0) {
      this.explode()
      this.punch_exploded = true
      this.punching_explode_timer = this.punching_explode_interval
    }*/
  //}

  if(this.knockback_red_duration > 0) {
    this.knockback_red_duration -= dt
  }

  if(this.lockon_display_timer > 0) {
    this.lockon_display_timer -= dt
  } else {
    this.lockon_display = null
  }


  if(this.state == "turret") {
    this.max_turret_timer -= dt;
    if(this.max_turret_timer < 0) {
      this.switch_to_punching()
    }
  } else if (this.state == "punching") {
    this.max_punching_timer -= dt;
    if(this.max_punching_timer < 0) {
      this.switch_to_turret()
    }
  }

  for(arm in this.arm_states) {
    this.action_timer[arm] -= dt;
    if(this.knockback_arm_timers[arm] > 0) {
      this.knockback_arm_timers[arm] -= dt
    }

    if(this.arm_states[arm] == "none") {
      this.switch_to_turret()

      //this.move_arm_to_default(arm, true)
    }

    if(this.state == "turret") {
      var cur_angle = angle_closest_to(this.body.GetAngle(), _atan(this.body.GetPosition(), this.player.get_current_position())+(Math.abs((this.start_time % 2000) - 1000)-500)/500*Math.PI/8);
    } else if(this.state == "punching") {
      var cur_angle = angle_closest_to(this.body.GetAngle(), _atan(this.body.GetPosition(), this.player.get_current_position()));
    }

    // turn the boss around
    /*if(this.arm_states[arm] == "default") {
      this.process_turning_to_angle(cur_angle)
      if(this.action_timer[arm] < 0) {
        this.load_punch_at_player(arm)
      }
    }*/

    if(this.arm_states[arm] == "loading") {
      this.process_turning_to_angle(cur_angle)
      if(this.action_timer[arm] < 0) {
        //console.log("PUNCHING "+arm+" "+this.start_time)
        this.punch_at(this.player.get_current_position().Copy(), arm)
      } else {
        this.process_move_arms_to_target(arm)
      }
    }

    if(this.arm_states[arm] == "default") {
      this.process_turning_to_angle(cur_angle)
      if(this.action_timer[arm] < 0) {
        //console.log("CONSUMING PARALYZE "+arm+" "+this.paralyzed_pause[arm])
        if(this.paralyzed_pause[arm] > 0) {
          this.paralyzed_pause[arm] -= dt
        } else {
          //console.log("LOADING "+arm+" "+this.start_time)
          this.load_punch_at_player(arm, this.player.get_current_position())
        }
      } else {
        this.process_move_arms_to_target(arm)
      }
    }

    if(this.arm_states[arm] == "delay_default") {
      this.process_turning_to_angle(cur_angle)
      if(this.action_timer[arm] < - this.right_arm_punch_offset_delay) {
        //console.log("CONSUMING PARALYZE "+arm+" "+this.paralyzed_pause[arm])
        if(this.paralyzed_pause[arm] > 0) {
          this.paralyzed_pause[arm] -= dt
        } else {
          this.load_punch_at_player(arm, this.player.get_current_position())
        }
      } else {
        this.process_move_arms_to_target(arm)
      }
    }

    if(this.arm_states[arm] == "punching") {
      if(this.action_timer[arm] < 0) {
        //console.log("RETRACTING "+arm+" "+this.start_time)
        this.paralyze_arm(arm)
        this.action_timer[arm] = this.paralyze_interval
      } else {
        this.process_punching(arm)
      }

    }

    if(this.arm_states[arm] == "retract") {
      if(this.action_timer[arm] < 0) {
        //console.log("DEFAULT "+arm+" "+this.start_time)
        this.move_arm_to_default(arm)
      } else {
        this.process_move_arms_to_target(arm)
        //this.process_retracting(arm)
      }
    }

    if(this.arm_states[arm] == "paralyzed") {
      if(this.action_timer[arm] < 0) {
        this.retract_punch(arm)
        //console.log("RETRACTING "+arm+" "+this.start_time)
        //this.retract_punch(arm)
      } else {
      }
      /*if(this.action_timer[arm] < 0) {
        this.retract_punch(arm)
      }*/
    }
    if(this.arm_states[arm] == "loading_turret") {
      //if(arm == "left")
        //console.log("LOADING TURRET "+arm)
      this.process_turning_to_angle(cur_angle)
      if(this.action_timer[arm] < 0) {
        this.arm_states[arm] = "turret_firing"
      } else {
        this.process_move_arms_to_target(arm)
      }
    }

    if(this.arm_states[arm] == "turret_firing") {
      this.process_turning_to_angle(cur_angle)
      if(this.action_timer[arm] < 0) {
        this.turret_fire_enemy(arm)
        this.action_timer[arm] = this.turret_firing_interval
      }
    }
  }

  if (imp_vars.player_data.difficulty_mode == "normal") {
    if(this.lighten_timer < 0 && this.lighten_timer > -this.lighten_duration * 0.9 && !this.lightened) {
      this.lightened = true
      imp_vars.impulse_music.play_sound("b1shrink")

      if(this.shoot_duration > this.shoot_interval/this.shoot_speedup_factor) {
        this.shoot_duration = this.shoot_interval/this.shoot_speedup_factor
      }
      this.global_lighten()
    }

    if (this.lighten_timer < -this.lighten_duration * 0.9) {
      if (this.lightened)  {
        // in order to play the sound at the right moment, we'll allow the boss's punches to lose the lighten bonus early.
        this.lightened = false
        imp_vars.impulse_music.play_sound("b1grow")
      }
    }

    if(this.lighten_timer < -this.lighten_duration) {
      this.lighten_timer = this.lighten_interval
    }
    this.lighten_timer -= dt

    if(this.lighten_timer > .9 * this.lighten_interval) {
      this.red_visibility = (this.lighten_timer - .9 * this.lighten_interval)/(.1 * this.lighten_interval)
    }
    else if(this.lighten_timer < .175 * this.lighten_interval && this.lighten_timer >= 0) {
      var temp = this.lighten_timer
      while(temp > .05 * this.lighten_interval) {temp -= .05 * this.lighten_interval}

      this.red_visibility = temp > 0.025 * this.lighten_interval ? (temp - 0.025 * this.lighten_interval)/(0.025 * this.lighten_interval) : (0.025*this.lighten_interval - temp)/(0.025 * this.lighten_interval)
    }
    else if(this.lighten_timer < 0) {
      this.red_visibility = 1
    }
  }


}

BossOne.prototype.process_punching = function(arm) {
  if(arm == "left") {
    var angle = _atan(this.body_parts["lh"].GetPosition(), this.punch_target_pts[arm])
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    var dist = p_dist(this.body_parts["lh"].GetPosition(), this.punch_target_pts[arm])
    var body_dist = p_dist(this.joints["lu"].GetAnchorA(), this.punch_target_pts[arm])
    if(dist < 10) {
      dir.Multiply(dist/10)
    }
    if(this.arm_states[arm] == "punching")
      dir.Multiply(this.punch_force);
    this.body_parts["lh"].ApplyImpulse(dir, this.body_parts["lh"].GetWorldCenter())
    //console.log("PUNCHING "+arm+" "+this.action_timer[arm])
    //console.log(angle+" "+dir.x+" "+dir.y+" "+dist+" "+body_dist+" "+this.body_parts["lh"].GetWorldCenter().x+" "+this.body_parts["lh"].GetWorldCenter().y)
    /*if(this.arm_states[arm] == "punching" && dist < 1){// || body_dist > this.punch_range) {
      this.arm_states[arm] = "paralyzed"
      this.paralyzed_pause[arm] += this.action_timer[arm]
    }*/
  }

  if(arm == "right") {
    var angle = _atan(this.body_parts["rh"].GetPosition(), this.punch_target_pts[arm])
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    var dist = p_dist(this.body_parts["rh"].GetPosition(), this.punch_target_pts[arm])
    var body_dist = p_dist(this.joints["ru"].GetAnchorA(), this.punch_target_pts[arm])
    if(dist < 10) {
      dir.Multiply(dist/10)
    }
    if(this.arm_states[arm] == "punching")
      dir.Multiply(this.punch_force);
    this.body_parts["rh"].ApplyImpulse(dir, this.body_parts["rh"].GetWorldCenter())
    /*if(this.arm_states[arm] == "punching" && dist < 1){// || body_dist > this.punch_range) {
      this.arm_states[arm] = "paralyzed"
      this.paralyzed_pause[arm] += this.action_timer[arm]
    }*/
  }
}


/*BossOne.prototype.process_retracting = function(arm) {
  if(arm == "left") {
    var angle = _atan(this.body_parts["ll"].GetPosition(), this.punch_target_pts[arm])
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    var dist = p_dist(this.body_parts["ll"].GetPosition(), this.punch_target_pts[arm])
    var body_dist = p_dist(this.joints["lu"].GetAnchorA(), this.punch_target_pts[arm])
    if(dist < 10) {
      dir.Multiply(dist/10)
    }
    if(this.arm_states[arm] == "retract")
      dir.Multiply(this.retract_force)
    this.body_parts["ll"].ApplyImpulse(dir, this.body_parts["lh"].GetWorldCenter())
    if(this.arm_states[arm] == "punching" && dist < 1 || body_dist > this.punch_range) {
      this.arm_states[arm] = "paralyzed"
      this.paralyzed_pause[arm] += this.action_timer
    }
  }

  if(arm == "right") {
    var angle = _atan(this.body_parts["rl"].GetPosition(), this.punch_target_pts[arm])
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    var dist = p_dist(this.body_parts["rl"].GetPosition(), this.punch_target_pts[arm])
    var body_dist = p_dist(this.joints["ru"].GetAnchorA(), this.punch_target_pts[arm])
    if(dist < 10) {
      dir.Multiply(dist/10)
    }
    if(this.arm_states[arm] == "retract")
      dir.Multiply(this.retract_force)
    this.body_parts["rl"].ApplyImpulse(dir, this.body_parts["rh"].GetWorldCenter())
    if(this.arm_states[arm] == "punching" && dist < 1 || body_dist > this.punch_range) {
      this.arm_states[arm] = "paralyzed"
      this.paralyzed_pause[arm] += this.action_timer
    }
  }
}*/
BossOne.prototype.process_turning_to_angle = function(angle) {
  this.body.SetAngle(angle)
  return

  // before there was the concept of going around the arms to hit the body, but this is currently not viable, so we simply the code

  /*var cur_angle = this.body.GetAngle();
  var player_angle =  angle;
  var angle_between = small_angle_between(cur_angle, player_angle )

  var turn_rate = this.turn_rate;

  if(this.state == "turret") {
    turn_rate *= 2;
  }

  if(is_angle_between(cur_angle - Math.PI, cur_angle, player_angle)) {
    if(angle_between < Math.PI * 2 * dt/turn_rate)
      this.body.SetAngle(this.body.GetAngle() - angle_between)
    else
      this.body.SetAngle(this.body.GetAngle() - Math.PI * 2 * dt/turn_rate)
  } else {
    if(angle_between < Math.PI * 2 * dt/turn_rate)
      this.body.SetAngle(this.body.GetAngle() + angle_between)
    else
    this.body.SetAngle(this.body.GetAngle() + Math.PI * 2 * dt/turn_rate)
  }*/

}

BossOne.prototype.process_move_arms_to_target = function(side) {
  var joints = []
  if(side == "left") {
    joints = ["lu", "ll", "lh"]
  }
  if(side == "right") {
    joints = ["ru", "rl", "rh"]
  }
    for(index in joints) {
      var joint = joints[index]
      if(typeof this.joint_target_locs[joint].start !== "undefined" && typeof this.joint_target_locs[joint].end !== "undefined") {
        var prog = Math.max((this.action_timer[side])/(this.last_action_interval[side]),0)
        var end_angle = null;
        if(typeof this.joint_target_locs[joint].end == "function") {
          end_angle = this.joint_target_locs[joint].end()
        } else {
          end_angle = this.joint_target_locs[joint].end
        }
        var cur_angle = prog * this.joint_target_locs[joint].start + (1-prog) * end_angle;
        this.joints[joint].SetLimits(cur_angle, cur_angle)
      }
    }
}

BossOne.prototype.draw_arm_piece = function(arm, context, draw_factor, side) {
    // fade out if dying

    var tp = arm.GetPosition();

    if(this.knockback_red_duration > 0 || this.knockback_arm_timers[side] > 0) {
      drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (arm.GetAngle() + Math.PI/4), 64, 64, "immunitas_arm_red", immunitasSprite)

    } else
      drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (arm.GetAngle() + Math.PI/4), 64, 64, "immunitas_arm", immunitasSprite)


}

BossOne.prototype.draw_hand = function(hand, context, draw_factor, side) {
    // fade out if dying
    var tp = hand.GetPosition();
        if(this.knockback_red_duration > 0 || this.knockback_arm_timers[side] > 0) {
      drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (hand.GetAngle() + Math.PI/4), 64, 64, "immunitas_hand_red", immunitasSprite)

    } else
      drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (hand.GetAngle() + Math.PI/4), 64, 64, "immunitas_hand", immunitasSprite)


}

BossOne.prototype.draw_aura = function(context, draw_factor) {
    // fade out if dying
    var tp = this.body.GetPosition()
    context.globalAlpha *= 0.6
    if(this.knockback_red_duration > 0) {
      drawSprite(context, tp.x*draw_factor,
    tp.y*draw_factor,
    (Math.PI/4), 173, 173, "immunitas_aura_red", immunitasSprite)

    } else
     drawSprite(context, tp.x*draw_factor,
    tp.y*draw_factor,
    (Math.PI/4), 173, 173, "immunitas_aura", immunitasSprite)
     context.globalAlpha /= 0.6
}

BossOne.prototype.draw_glows = function(context, draw_factor) {

  var tp = this.body.GetPosition()
  if(this.knockback_red_duration > 0) {
    drawSprite(context, tp.x*draw_factor,
    tp.y*draw_factor,
    (this.body.GetAngle()), 285, 285, "immunitas_red_glow", immunitasSprite)
  } else {
    drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (this.body.GetAngle()), 285, 285, "immunitas_glow", immunitasSprite)
  }

  var glowing_body_parts = []
  /*if(this.arm_states["left"] == "loading" || (this.arm_states["left"] == "punching" && this.punch_action_interval - this.action_timer["left"] < this.punch_knockback_window))
    glowing_body_parts.push("lh")
  if(this.arm_states["right"] == "loading" || (this.arm_states["right"] == "punching" && this.punch_action_interval - this.action_timer["right"] < this.punch_knockback_window))
    glowing_body_parts.push("rh")*/
  for(index in glowing_body_parts) {
    var name = glowing_body_parts[index]
    if(this.body_parts[name]) {
      var body_part = this.body_parts[name]
      tp = body_part.GetPosition()
      drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (body_part.GetAngle()), 190, 190, "immunitas_glow", immunitasSprite)
    }
  }
}


BossOne.prototype.draw = function(context, draw_factor) {

  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) return

  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
  context.save()
  if (this.dying)
      context.globalAlpha *= (1 - prog)
    else
      context.globalAlpha *= this.visibility ? this.visibility : 1

  this.draw_arm_piece(this.body_parts["lu"], context, draw_factor, "left")
  this.draw_arm_piece(this.body_parts["ru"], context, draw_factor, "right")
  this.draw_arm_piece(this.body_parts["ll"], context, draw_factor, "left")
  this.draw_arm_piece(this.body_parts["rl"], context, draw_factor, "right")
  this.draw_hand(this.body_parts["lh"], context, draw_factor, "left")
  this.draw_hand(this.body_parts["rh"], context, draw_factor, "right")

  var tp = this.body.GetPosition()
      if(this.knockback_red_duration > 0) {
      drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (this.body.GetAngle() + Math.PI/4), 64, 64, "immunitas_head_red", immunitasSprite)

    } else
      drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (this.body.GetAngle() + Math.PI/4), 64, 64, "immunitas_head", immunitasSprite)

  context.restore()

  this.additional_drawing(context, draw_factor)
}

BossOne.prototype.draw_special_attack_timer = function(context, draw_factor) {
  var prog = 1-(Math.max(this.lighten_timer, 0) / this.lighten_interval);

  context.beginPath()
  var distance = 106;
  var tp = {x: draw_factor *this.body.GetPosition().x, y: draw_factor * this.body.GetPosition().y}
  if(prog> 0) {
    context.moveTo(tp.x, tp.y - distance)
    context.lineTo(tp.x + Math.min(1, (prog)/.25) * distance, tp.y - distance + Math.min(1, (prog)/.25) * distance)

  }
  if(prog > .25) {
    context.moveTo(tp.x + distance, tp.y)
    context.lineTo(tp.x + distance - Math.min(1, (prog-.25)/.25) * distance, tp.y + Math.min(1, (prog-.25)/.25) * distance)

  }
  if(prog> 0.5) {
    context.moveTo(tp.x , tp.y + distance)
    context.lineTo(tp.x - Math.min(1, (prog-.5)/.25) * distance , tp.y  + distance - Math.min(1, (prog-.5)/.25) * distance)

  }
  if(prog> 0.75) {
    context.moveTo(tp.x - distance, tp.y)
    context.lineTo(tp.x - distance + Math.min(1, (prog-.75)/.25) * distance, tp.y - Math.min(1, (prog-.75)/.25) * distance)
  }

  context.lineWidth = 15;
  context.strokeStyle = impulse_colors["boss 1"];
  context.stroke()

}

BossOne.prototype.draw_punching_explode_warning = function(ctx, draw_factor) {
  for(var i = 0; i < this.punching_explode_warning_parts; i++) {


    var angle = i/this.punching_explode_warning_parts * Math.PI * 2;
    drawSprite(ctx, this.body.GetPosition().x*draw_factor + (this.punching_explode_radius + 0.9)* draw_factor * Math.cos(angle),
      this.body.GetPosition().y*draw_factor + (this.punching_explode_radius + 0.9)* draw_factor * Math.sin(angle), angle, 70, 70, "immunitas_arrow",immunitasSprite)
    ctx.globalAlpha *= 0.8
    ctx.beginPath()
    ctx.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor,  this.punching_explode_radius* draw_factor,
      0, 2*Math.PI, false)
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.globalAlpha /= 0.8
  }
}

BossOne.prototype.additional_drawing = function(context, draw_factor) {

  if (this.dying) return

  /*if(this.lockon_display != null) {
    if(this.punch_target_pts[this.lockon_display]) {

      var prog = (this.lockon_display_timer/this.lockon_display_interval);
      context.save()
      context.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)
      var tp = this.punch_target_pts[this.lockon_display]
      drawSprite(context, tp.x*draw_factor, tp.y*draw_factor,
      0, 60, 60, "immunitas_lockon", immunitasSprite)
      context.restore()
    }
  }*/

  /*if(this.punch_target_pts["right"]) {
    var tp = this.punch_target_pts["right"]
    drawSprite(context, tp.x*draw_factor, tp.y*draw_factor,
    0, 60, 60, "immunitas_lockon", immunitasSprite)

    /*context.beginPath()
    context.moveTo(this.body_parts["rh"].GetPosition().x * draw_factor, this.body_parts["rh"].GetPosition().y * draw_factor)
    context.lineTo(this.punch_target_pts["right"].x * draw_factor, this.punch_target_pts["right"].y * draw_factor)
    context.stroke()*/
  /*}
  if(this.punch_target_pts["left"]) {

    var tp = this.punch_target_pts["left"]
    drawSprite(context, tp.x*draw_factor, tp.y*draw_factor,
    0, 60, 60, "immunitas_lockon", immunitasSprite)
    /*context.beginPath()
    context.moveTo(this.body_parts["lh"].GetPosition().x * draw_factor, this.body_parts["lh"].GetPosition().y * draw_factor)
    context.lineTo(this.punch_target_pts["left"].x * draw_factor, this.punch_target_pts["left"].y * draw_factor)
    context.stroke()*/
  //}

  context.save()
  if(this.punching_explode_timer != null) {
    if(this.punching_explode_timer < this.punching_explode_warning_interval) {
      context.beginPath()

      context.globalAlpha = (this.punching_explode_warning_interval - this.punching_explode_timer)/this.punching_explode_warning_interval * 0.7
      this.draw_punching_explode_warning(context, draw_factor)
      /*context.strokeStyle = this.color
      context.lineWidth = 2;
      context.stroke()*/
    } else if(this.punching_explode_timer > this.punching_explode_interval - this.punching_explode_warning_interval/2 && this.punch_exploded) {
      context.beginPath()

      context.globalAlpha = (this.punching_explode_timer - (this.punching_explode_interval - this.punching_explode_warning_interval/2))/this.punching_explode_warning_interval/2 * 0.7
      this.draw_punching_explode_warning(context, draw_factor)
    }
    if(this.punching_explode_timer < this.punching_explode_shockwave_interval) {
      context.beginPath()
      var prog = (this.punching_explode_shockwave_interval - this.punching_explode_timer)/this.punching_explode_shockwave_interval
      context.arc(this.body.GetPosition().x *draw_factor, this.body.GetPosition().y * draw_factor, prog*(this.punching_explode_radius * draw_factor), 0, Math.PI * 2, false)
      globalAlpha = 0.7
      context.lineWidth = 4;
      context.strokeStyle = this.color
      context.stroke()
    }
  }
  context.restore()
}

BossOne.prototype.pre_draw = function(context, draw_factor) {
  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) return
  context.save()
  if (this.dying) {
      var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
      context.globalAlpha *= (1 - prog)
  } else
      context.globalAlpha *= this.visibility ? this.visibility : 1
  this.draw_glows(context, draw_factor);
  this.draw_aura(context, draw_factor)
  if(this.lighten_timer >= 0) {
    this.draw_special_attack_timer(context, draw_factor)
  }

  context.globalAlpha *= 0.8;
  if(this.lighten_timer < 0 && this.lighten_timer >= -this.lighten_duration) {
    var gray = Math.min(5 - Math.abs((-this.lighten_timer - this.lighten_duration/2)/(this.lighten_duration/10)), 1)
    context.globalAlpha *= gray/2
    context.fillStyle = this.color
    context.fillRect(0, 0, imp_vars.canvasWidth, imp_vars.canvasHeight)
  }

  context.restore()
}

BossOne.prototype.move = function() {
  /*this.set_heading(this.player.get_current_position())*/
  var cur_angle = this.body.GetAngle();
  var player_angle =  _atan(this.body.GetPosition(), this.player.get_current_position());
  var angle_between = small_angle_between(cur_angle, player_angle )
  var torque = Math.min(250, angle_between/Math.PI * 1000);

  if(is_angle_between(cur_angle - Math.PI, cur_angle, player_angle)) {

    this.body.SetAngle(this.body.GetAngle() - Math.PI/2000)
  } else {
    this.body.SetAngle(this.body.GetAngle() + Math.PI/2000)
  }
}

BossOne.prototype.collide_with = function(other, body) {
  if(this.dying || !this.spawned)//ensures the collision effect only activates once
    return
  if (other == this.player) {
    imp_vars.impulse_music.play_sound("b1hit")
    this.impulse_game_state.reset_combo();
  }
  if(body == this.body) {
    var boss_angle = _atan(this.body.GetPosition(),other.body.GetPosition())
    other.body.ApplyImpulse(new b2Vec2(this.boss_force * 4 * Math.cos(boss_angle), this.boss_force * 4 * Math.sin(boss_angle)), other.body.GetWorldCenter())
  } else {
    var boss_angle = _atan(this.body.GetPosition(), other.body.GetPosition())
    // hit while punching
    var force = this.boss_force;
    if (this.lightened) {
      force *= 2
    }
    if(this.state == "punching") {
      force *= 1.5
    // hit while turret and not hands
    } else if(body != this.body_parts["lh"] && body != this.body_parts["rh"]){
      force *= 1.5
    // hit hands while turret
    } else if (other == this.player) {
      force *= 1.25
    } else {
      force = 0;
    }
    other.body.ApplyImpulse(new b2Vec2(force *  Math.cos(boss_angle), force * Math.sin(boss_angle)), other.body.GetWorldCenter())
  }
}
BossOne.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.shape_points[0].length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add({x: this.shape_points[0][i].x * 0.6, y: this.shape_points[0][i].y * 0.6})
    ans.push(temp)
  }
  return ans
}

BossOne.prototype.global_lighten = function() {
  this.player.lighten(Math.round(this.lighten_duration))
  for(var i = 0; i < this.level.enemies.length; i++) {
    if(this.level.enemies[i].id != this.id)
      this.level.enemies[i].lighten(Math.round(this.lighten_duration))
  }
}

BossOne.prototype.player_hit_proc = function() {
  var boss_angle = _atan(this.body.GetPosition(), this.player.get_current_position())
  this.player.body.ApplyImpulse(new b2Vec2(this.boss_force * Math.cos(boss_angle), this.boss_force * Math.sin(boss_angle)), this.player.body.GetWorldCenter())
}

BossOne.prototype.check_impulse_on_hands = function(attack_loc, impulse_force, side) {

  var hand = null;
  if(side == "left")
    hand = this.body_parts["lh"];
  if(side == "right")
    hand = this.body_parts["rh"];
  var hand_point = hand.GetPosition()
    if(this.player.point_in_impulse_angle(hand_point))
    {

      if (this.player.point_in_impulse_dist(hand_point))
      {
        //console.log("HIT HAND "+side+" "+this.start_time)
        var angle = _atan(attack_loc, hand_point)//not sure if it should be this point
        //console.log("paralyzed_pause "+side+" "+this.paralyzed_pause[side])
        this.paralyzed_pause[side] += this.action_timer[side]
        if(this.arm_states[side] == "loading")
          this.paralyzed_pause[side] += this.punch_action_interval
        //console.log("paralyzed_pause after"+side+" "+this.paralyzed_pause[side])
        this.arm_states[side] = "paralyzed"
        //hand.ApplyImpulse(new b2Vec2(this.impulse_hand_force * impulse_force*Math.cos(angle),
        // this.impulse_hand_force * impulse_force*Math.sin(angle)),
        //hand.GetWorldCenter())
        this.knockback_arm_timers[side] = this.knockback_arm_interval
      }
    }

}

BossOne.prototype.switch_to_punching = function() {
  this.state = "punching"
  this.move_arm_to_default("left", true)
  this.paralyzed_pause["left"] = 0
  this.paralyzed_pause["right"] = 0
  this.move_arm_to_default("right", true)
  this.max_punching_timer = this.max_punching_interval
  this.state_switch_timer = this.state_switch_interval

}

BossOne.prototype.switch_to_turret = function() {
  this.state = "turret"
  this.move_arm_to_turret("left")
  this.move_arm_to_turret("right")
  this.max_turret_timer = this.max_turret_interval
  this.state_switch_timer = this.state_switch_interval
  this.punch_target_pts["left"] = null
  this.punch_target_pts["right"] = null
  if(this.first_turret) {
    this.max_turret_timer *= 0.75
    this.first_turret = false
  }
}

BossOne.prototype.explode = function() {
  if(p_dist(this.body.GetPosition(), this.player.get_current_position()) <= this.punching_explode_radius)
  {
    var angle = _atan(this.body.GetPosition(), this.player.get_current_position())
    this.player.body.ApplyImpulse(new b2Vec2(this.punching_explode_force * Math.cos(angle),
     this.punching_explode_force * Math.sin(angle)), this.player.body.GetWorldCenter())
  }

  for(var i = 0; i < this.level.enemies.length; i++)
  {
    if(this.level.enemies[i] !== this && p_dist(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) <= this.punching_explode_radius)
    {
      var _angle = _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition())
      this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.punching_explode_force * Math.cos(_angle), this.punching_explode_force * Math.sin(_angle)), this.level.enemies[i].body.GetWorldCenter())
      if(!(this.level.enemies[i] instanceof Tank))
        this.level.enemies[i].open(1500)

    }
  }
}

BossOne.prototype.get_impulse_extra_factor = function() {
  if(imp_vars.player_data.difficulty_mode == "easy") {
    return this.impulse_extra_factor * 2;
  }
  return this.impulse_extra_factor;
}
