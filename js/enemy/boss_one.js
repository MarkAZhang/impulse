BossOne.prototype = new Enemy()

BossOne.prototype.constructor = BossOne

BossOne.prototype.is_boss = true

function BossOne(world, x, y, id, impulse_game_state) {
  this.type = "first boss"

  this.world = world

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.shoot_interval = 750

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

  this.bullet_alternater = 0

  this.safe = true

  this.shoot_interval = 3000

  this.shoot_speedup_factor = 2

  this.times_shot = 0

  this.lighten_interval = 13400

  this.lighten_timer = this.lighten_interval - 1

  this.lighten_duration = 7000

  this.lightened = false

  this.shoot_duration = this.shoot_interval - 1

  this.shooter_types = [0, 0]//0 = stunner, 1 = spear, 2 = boss

  this.shooter_enemies = ["stunner", "spear", "tank"]

  this.shooter_change_interval = 4

  this.shooter_change_counter = this.shooter_change_interval

  this.shooter_force = [50, 20, 175]

  this.shooter_color_change_prog = 0//if 1, need to push to 0

  this.shooter_color_change_interval = 500

  this.shooter_old_types = null

  this.shooter_types_list = [[0, 0], [2, 2], [1, 1], [0, 2], [0, 1], [1, 2], [1, 0], [2, 0], [2, 1]]

  this.spawn_interval = 1000//7600
  this.spawn_duration = this.spawn_interval

  this.spawned = false

  this.default_heading = false

  this.body.SetAngle(Math.PI/2)

  this.visibility = 0

  this.dying_length = 2000

  this.red_visibility = 0

  this.body.SetLinearDamping(impulse_enemy_stats[this.type].lin_damp * 2)

  this.boss_force = 100

  this.joint_inside_width = 1

  this.punch_force = 200

  this.action_interval = 1000

  this.action_timer = this.action_interval

  this.state = "none"

  this.add_arms()



}

//
BossOne.prototype.add_arms = function() {

  var upper_arm_r = impulse_enemy_stats[this.type].upper_arm_polygon[0].r;
  var lower_arm_r = impulse_enemy_stats[this.type].lower_arm_polygon[0].r
  var hand_r = impulse_enemy_stats[this.type].hand_polygon[0].r;

  this.left_upperarm = this.create_upper_arm_piece(this.body.GetPosition().x+this.effective_radius + upper_arm_r - 2 * this.joint_inside_width, this.body.GetPosition().y)
  left_upperarm_joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef
  joint_loc = new b2Vec2(this.body.GetPosition().x+this.effective_radius - this.joint_inside_width, this.body.GetPosition().y)
  left_upperarm_joint.Initialize(this.body, this.left_upperarm, joint_loc)
  left_upperarm_joint.enableLimit = true;
  left_upperarm_joint.lowerAngle = -Math.PI/2
  left_upperarm_joint.upperAngle = Math.PI/2
  left_upperarm_joint.collideConnected = false
  this.left_upperarm_joint  = this.world.CreateJoint(left_upperarm_joint)

  this.left_lowerarm = this.create_lower_arm_piece(this.body.GetPosition().x+this.effective_radius + 2 * upper_arm_r +lower_arm_r - 4 * this.joint_inside_width, this.body.GetPosition().y)
  left_lowerarm_joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef
  joint_loc = new b2Vec2(this.body.GetPosition().x+ this.effective_radius +2*upper_arm_r - 3*this.joint_inside_width, this.body.GetPosition().y)
  left_lowerarm_joint.Initialize(this.left_upperarm, this.left_lowerarm, joint_loc)
  left_lowerarm_joint.enableLimit = true;
  left_lowerarm_joint.lowerAngle = -Math.PI/2
  left_lowerarm_joint.upperAngle = Math.PI/2
  left_lowerarm_joint.collideConnected = false
  this.left_lowerarm_joint  = this.world.CreateJoint(left_lowerarm_joint)

  this.left_hand = this.create_hand(this.body.GetPosition().x+this.effective_radius + 2 * upper_arm_r + 2 * lower_arm_r - 4 * this.joint_inside_width + 0.25 * hand_r, this.body.GetPosition().y)
  this.left_hand.SetAngle(Math.PI/4)
  left_hand_joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef
  joint_loc = new b2Vec2(this.body.GetPosition().x+ this.effective_radius + 2 * upper_arm_r + 2 * lower_arm_r - 4*this.joint_inside_width + 0.25 * hand_r, this.body.GetPosition().y)
  left_hand_joint.Initialize(this.left_lowerarm, this.left_hand, joint_loc)
  left_hand_joint.enableLimit = true;
  left_hand_joint.lowerAngle = -Math.PI/2
  left_hand_joint.upperAngle = Math.PI/2
  left_hand_joint.collideConnected = false
  this.left_hand_joint  = this.world.CreateJoint(left_hand_joint)

  this.right_upperarm = this.create_upper_arm_piece(this.body.GetPosition().x - (this.effective_radius + upper_arm_r - 2 * this.joint_inside_width), this.body.GetPosition().y)
  right_upperarm_joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef
  joint_loc = new b2Vec2(this.body.GetPosition().x - (this.effective_radius - this.joint_inside_width), this.body.GetPosition().y)
  right_upperarm_joint.Initialize(this.body, this.right_upperarm, joint_loc)
  right_upperarm_joint.enableLimit = true;
  right_upperarm_joint.lowerAngle = -Math.PI/2
  right_upperarm_joint.upperAngle = Math.PI/2
  right_upperarm_joint.collideConnected = false
  this.right_upperarm_joint  = this.world.CreateJoint(right_upperarm_joint)

  this.right_lowerarm = this.create_lower_arm_piece(this.body.GetPosition().x - (this.effective_radius +  2 * upper_arm_r +lower_arm_r - 4 * this.joint_inside_width), this.body.GetPosition().y)
  right_lowerarm_joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef
  joint_loc = new b2Vec2(this.body.GetPosition().x - (this.effective_radius +2*upper_arm_r - 3*this.joint_inside_width), this.body.GetPosition().y)
  right_lowerarm_joint.Initialize(this.right_upperarm, this.right_lowerarm, joint_loc)
  right_lowerarm_joint.enableLimit = true;
  right_lowerarm_joint.lowerAngle = -Math.PI/2
  right_lowerarm_joint.upperAngle = Math.PI/2
  right_lowerarm_joint.collideConnected = false
  this.right_lowerarm_joint  = this.world.CreateJoint(right_lowerarm_joint)

  this.right_hand = this.create_hand(this.body.GetPosition().x - (this.effective_radius + 2 * upper_arm_r + 2 * lower_arm_r - 4 * this.joint_inside_width + 0.25 * hand_r), this.body.GetPosition().y)
  this.right_hand.SetAngle(Math.PI/4)
  right_hand_joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef
  joint_loc = new b2Vec2(this.body.GetPosition().x - (this.effective_radius + 2 * upper_arm_r + 2 * lower_arm_r - 4*this.joint_inside_width + 0.25 * hand_r), this.body.GetPosition().y)
  right_hand_joint.Initialize(this.right_lowerarm, this.right_hand, joint_loc)
  right_hand_joint.enableLimit = true;
  right_hand_joint.lowerAngle = -Math.PI/2
  right_hand_joint.upperAngle = Math.PI/2
  right_hand_joint.collideConnected = false
  this.right_hand_joint  = this.world.CreateJoint(right_hand_joint)

}

BossOne.prototype.punch_at = function(pt, hand) {
  return
  if(hand == "left") {
    var angle = _atan(this.right_hand.GetPosition(), {x: pt.x, y: pt.y})
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    dir.Multiply(this.punch_force);
    this.right_hand.ApplyImpulse(dir, this.right_hand.GetWorldCenter())
  }
}

BossOne.prototype.create_lower_arm_piece = function(x, y) {
  return create_body(this.world, impulse_enemy_stats[this.type].lower_arm_polygon, x, y, 3, 0.1, 0x0100, 0x0012, this)
}
BossOne.prototype.create_upper_arm_piece = function(x, y) {
  return create_body(this.world, impulse_enemy_stats[this.type].upper_arm_polygon, x, y, 3, 0.1, 0x0100, 0x0012, this)
}
BossOne.prototype.create_hand = function(x, y) {
  return create_body(this.world, impulse_enemy_stats[this.type].hand_polygon, x, y, 3, 0.1, 0x0100, 0x0012, this)
}

BossOne.prototype.additional_processing = function(dt) {

  var cur_angle = this.body.GetAngle();
  var player_angle =  _atan(this.body.GetPosition(), this.player.body.GetPosition());
  var angle_between = small_angle_between(cur_angle, player_angle )

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

  // turn the boss around
  if(this.state == "none") {
    if(is_angle_between(cur_angle - Math.PI, cur_angle, player_angle)) {
      if(angle_between < Math.PI * 2 * dt/2000)
        this.body.SetAngle(this.body.GetAngle() - angle_between)
      else
        this.body.SetAngle(this.body.GetAngle() - Math.PI * 2 * dt/2000)
    } else {
      if(angle_between < Math.PI * 2 * dt/2000)
        this.body.SetAngle(this.body.GetAngle() + angle_between)
      else
      this.body.SetAngle(this.body.GetAngle() + Math.PI * 2 * dt/2000)
    }
  }

  if(this.state == "punching_left") {
    if(this.left_hand.m_linearVelocity.Length() < 1) {
      this.state = "none"
      this.action_timer = this.action_interval
    }
  }

  if(this.action_timer < 0) {
    if(this.state == "none") {
      this.state = "punching_left"
      this.punch_at(this.player.body.GetPosition(), "left")
    }

  } else {
    this.action_timer -= dt;
  }


  if(this.shooter_color_change_prog > 0) {
    this.shooter_color_change_prog = Math.max(this.shooter_color_change_prog - dt/this.shooter_color_change_interval, 0)
  }

  if(this.lighten_timer < 0 && !this.lightened) {
    this.lightened = true
    if(this.shoot_duration > this.shoot_interval/this.shoot_speedup_factor) {
      this.shoot_duration = this.shoot_interval/this.shoot_speedup_factor
    }
    this.global_lighten()
  }

  if(this.lighten_timer < -this.lighten_duration) {
    this.lightened = false
    this.lighten_timer = this.lighten_interval
  }
  this.lighten_timer -= dt

  if(this.shoot_duration < 0) {
    this.shoot_duration = this.lightened ? this.shoot_interval/this.shoot_speedup_factor : this.shoot_interval


    var shooter_locs = this.get_two_shooter_locs()

    /*for(var j = 0; j < 2; j++) {
      var dir = new b2Vec2(this.player.body.GetPosition().x - shooter_locs[j].x, this.player.body.GetPosition().y - shooter_locs[j].y)
      dir.Normalize()
      var spawn_loc = {x: shooter_locs[j].x + dir.x * 2, y: shooter_locs[j].y + dir.y * 2}
        dir.Multiply(this.shooter_force[this.shooter_types[j]])
      var new_enemy = new this.level.enemy_map[this.shooter_enemies[this.shooter_types[j]]](this.world, spawn_loc.x, spawn_loc.y, this.level.enemy_counter, this.impulse_game_state)
      this.level.spawned_enemies.push(new_enemy)
        new_enemy.body.ApplyImpulse(dir, new_enemy.body.GetWorldCenter())
      new_enemy.pathfinding_counter = 2 * new_enemy.pathfinding_delay //immediately look for path
      if(this.lighten_timer < 0) {
        new_enemy.lighten((this.lighten_timer + this.lighten_duration))
      }
      this.level.enemy_counter += 1
    }*/

    this.shooter_change_counter -= 1

    if(this.shooter_change_counter <=0) {
      this.shooter_old_types = this.shooter_types
      if(this.impulse_game_state.game_numbers.score > impulse_level_data[this.level.level_name].cutoff_scores[2] * .75) {
        this.shooter_types = [2, 2]
      }
      else {
        this.times_shot += 1
        this.shooter_types = this.get_shooter_types(this.times_shot)
      }

      this.shooter_color_change_prog = 1
      this.shooter_change_counter = this.shooter_change_interval
    }

  }
  this.shoot_duration -= dt

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

BossOne.prototype.draw_body_part = function(body_part, polygon, context, draw_factor) {
    // fade out if dying

    var alpha = this.visibility ? this.visibility : 1
    if (this.dying)
      alpha *= (1 - prog)
    tp = body_part.GetPosition();
    draw_shape(context, body_part.GetPosition().x * draw_factor, body_part.GetPosition().y * draw_factor,
      polygon, draw_factor, this.get_color_with_status(this.interior_color), alpha, body_part.GetAngle())

}

BossOne.prototype.draw_hand = function(arm, context, draw_factor) {
    // fade out if dying

    var alpha = this.visibility ? this.visibility : 1
    if (this.dying)
      alpha *= (1 - prog)
    tp = arm.GetPosition();
    draw_shape(context, arm.GetPosition().x * draw_factor, arm.GetPosition().y * draw_factor,
      impulse_enemy_stats[this.type].hand_polygon[0], draw_factor, this.get_color_with_status(this.interior_color), alpha, arm.GetAngle())

}

BossOne.prototype.additional_drawing = function(context, draw_factor) {

  if (this.dying) return

  var shooter_locs = this.get_two_shooter_locs()
  this.draw_body_part(this.left_upperarm, impulse_enemy_stats[this.type].upper_arm_polygon[0], context, draw_factor);
  this.draw_body_part(this.left_lowerarm, impulse_enemy_stats[this.type].lower_arm_polygon[0], context, draw_factor);
  this.draw_body_part(this.right_upperarm, impulse_enemy_stats[this.type].upper_arm_polygon[0], context, draw_factor);
  this.draw_body_part(this.right_lowerarm, impulse_enemy_stats[this.type].lower_arm_polygon[0], context, draw_factor);
  this.draw_body_part(this.left_hand, impulse_enemy_stats[this.type].hand_polygon[0], context, draw_factor);
  this.draw_body_part(this.right_hand, impulse_enemy_stats[this.type].hand_polygon[0], context, draw_factor);

  /*for(var j = 0; j < 2; j++) {

      var tp = shooter_locs[j]
      context.save();
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.body.GetAngle());
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);

      context.beginPath()

      context.moveTo((tp.x+this.shape_points[0][0].x * .5)*draw_factor, (tp.y+this.shape_points[0][0].y * .5)*draw_factor)
      for(var i = 1; i < this.shape_points[0].length; i++)
      {
        context.lineTo((tp.x+this.shape_points[0][i].x * .5)*draw_factor, (tp.y+this.shape_points[0][i].y * .5)*draw_factor)
      }
      context.closePath()
      context.lineWidth = 2

      if(this.shooter_color_change_prog > 0) {
        context.strokeStyle = impulse_enemy_stats[this.shooter_enemies[this.shooter_types[j]]].color
        context.globalAlpha = 1 - this.shooter_color_change_prog
        context.stroke()
        context.globalAlpha /= 2
        context.fillStyle = context.strokeStyle
        context.fill()
        context.globalAlpha = this.shooter_color_change_prog
        context.strokeStyle = impulse_enemy_stats[this.shooter_enemies[this.shooter_old_types[j]]].color
        context.stroke()
        context.globalAlpha /= 2
        context.fillStyle = context.strokeStyle
        context.fill()
      }
      else {
        if(this.spawned == false) {
          context.globalAlpha = 1 - this.spawn_duration / this.spawn_interval
        }

        context.strokeStyle = impulse_enemy_stats[this.shooter_enemies[this.shooter_types[j]]].color
        context.stroke()
        context.globalAlpha /=2
        context.fillStyle = context.strokeStyle
        context.fill()
        context.globalAlpha = 1
      }
      if(this.spawned == false) {
        context.globalAlpha = 1 - this.spawn_duration / this.spawn_interval
      }
      context.beginPath()
      var total_time = this.lightened ? this.shoot_interval/this.shoot_speedup_factor : this.shoot_interval
      context.arc(tp.x*draw_factor, tp.y*draw_factor, (this.effective_radius*draw_factor) * .75, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (this.shoot_duration / total_time), true)
      context.lineWidth = 2
      context.strokeStyle = "gray"
      context.stroke()

      context.restore()
      context.globalAlpha = 1
  }

  if(this.red_visibility > 0) {
      var tp = this.body.GetPosition()
      context.save();
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.body.GetAngle());
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);

      context.beginPath()
      context.globalAlpha = this.red_visibility

      context.moveTo((tp.x+this.shape_points[0][0].x)*draw_factor, (tp.y+this.shape_points[0][0].y)*draw_factor)
      for(var i = 1; i < this.shape_points[0].length; i++)
      {
        context.lineTo((tp.x+this.shape_points[0][i].x)*draw_factor, (tp.y+this.shape_points[0][i].y)*draw_factor)
      }
      context.closePath()
      context.fillStyle = "red"
      context.fill()
      context.globalAlpha = 1
      context.restore()
  }

  if(this.lighten_timer >= 0) {
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (Math.max(this.lighten_timer, 0) / this.lighten_interval), true)
    context.lineWidth = 2
    context.strokeStyle = "red"
    context.stroke()
  }*/


}

BossOne.prototype.get_two_shooter_locs = function() {
  var locs = []
  locs.push({x: this.body.GetPosition().x + Math.cos(this.body.GetAngle() - Math.PI/4) * this.effective_radius * 1.5, y: this.body.GetPosition().y +Math.sin(this.body.GetAngle() - Math.PI/4) * this.effective_radius * 1.5})
  locs.push({x: this.body.GetPosition().x +Math.cos(this.body.GetAngle() + Math.PI/4) * this.effective_radius * 1.5, y: this.body.GetPosition().y +Math.sin(this.body.GetAngle() + Math.PI/4) * this.effective_radius * 1.5})
  return locs

}

BossOne.prototype.get_shooter_types = function(num_shot) {

  return this.shooter_types_list[num_shot % this.shooter_types_list.length]

}


BossOne.prototype.pre_draw = function(context, draw_factor) {
  if(this.lighten_timer < 0 && this.lighten_timer >= -this.lighten_duration) {
    var gray = Math.min(5 - Math.abs((-this.lighten_timer - this.lighten_duration/2)/(this.lighten_duration/10)), 1)
    context.globalAlpha = gray/6
    context.fillStyle = "#00bfff"
    context.fillRect(0, 0, canvasWidth, canvasHeight)
  }

}

BossOne.prototype.move = function() {
  /*this.set_heading(this.player.body.GetPosition())*/
  var cur_angle = this.body.GetAngle();
  var player_angle =  _atan(this.body.GetPosition(), this.player.body.GetPosition());
  var angle_between = small_angle_between(cur_angle, player_angle )
  var torque = Math.min(250, angle_between/Math.PI * 1000);

  if(is_angle_between(cur_angle - Math.PI, cur_angle, player_angle)) {

    this.body.SetAngle(this.body.GetAngle() - Math.PI/2000)
  } else {
    this.body.SetAngle(this.body.GetAngle() + Math.PI/2000)
  }

}

BossOne.prototype.collide_with = function(other) {
  if(this.dying || !this.spawned)//ensures the collision effect only activates once
    return

  if(other === this.player) {

    this.player_hit_proc()
    this.impulse_game_state.reset_combo()
  }

}
BossOne.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.shape_points[0].length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add(this.shape_points[0][i])
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
  var boss_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
  this.player.body.ApplyImpulse(new b2Vec2(this.boss_force * Math.cos(boss_angle), this.boss_force * Math.sin(boss_angle)), this.player.body.GetWorldCenter())
}
