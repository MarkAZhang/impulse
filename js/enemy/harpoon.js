Harpoon.prototype = new Enemy()

Harpoon.prototype.constructor = Harpoon

function Harpoon(world, x, y, id, impulse_game_state) {
  if(!world) return
  this.type = "harpoon"

  var h_vertices = []

  var s_radius = .3

  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0), s_radius*Math.sin(Math.PI*0)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*5/6), s_radius*Math.sin(Math.PI*5/6)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*7/6), s_radius*Math.sin(Math.PI*7/6)))
  this.harpoon_shape = h_vertices

  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2

  this.harpoon_length = 15
  if(player_data.difficulty_mode == "easy") {
    this.harpoon_length = 10
  }

  this.goalPt = null

  this.harpoon_color = "orange"

  this.harpoon_state = "inactive"

  this.harpooned_force = 6
  this.harpooned_goo_factor = 0.33

  this.harpoonhead_force = 400
  if(player_data.difficulty_mode == "easy") {
    this.harpoonhead_force = 200
  }
  this.harpoonhead_retract_force = 6
  this.harpoon_explode_force = 70

  this.safe_radius = this.player.impulse_radius
  this.safe_radius_buffer = 2

  this.safe_distance = this.harpoon_length * 0.8

  this.pathfinding_delay_far = 40;
  this.pathfinding_delay_near = 20;

  this.pathfinding_delay = 40;

  this.offset_multiplier = Math.random() < 0.5 ? 1 : -1;
  this.stun_length = 2000 //after being hit by player, becomes stunned

  this.harpoon_joint = null

  this.do_yield = false

  this.twitch = false

  this.check_harpoon_interval = 5//so that we don't check for harpooning every frame
  this.check_harpoon_timer = this.check_harpoon_interval

  this.state = "seek" //seek or flee

  this.check_for_good_target_point_interval = 15

  this.check_for_good_target_point_timer = this.check_for_good_target_point_interval

  this.check_safety_interval = 8

  this.check_safety_timer = this.check_safety_interval

  this.silence_on_impulse_length = 1000

  this.default_heading = false

  this.harpoon_head_defaut_dist = Math.sqrt(2)/2+Math.sqrt(6)/6 - 0.4

  this.add_harpoon_head()

  this.require_open = true

  this.entered_arena = false
  this.entered_arena_delay = 1000
  this.entered_arena_timer = 1000
  this.last_stun = this.entered_arena_delay

  this.harpoon_disengage_dist = 3

  this.delay_between_shots = 1000
  this.harpooned_target = null
  this.cautious = false
  this.harpoonable = false

  this.additional_statuses = ["unharpoonable"]

  this.dire_harpoon = false
  this.attack_mode = true
  this.extra_adjust = false

  this.destroyable_timer = 0

  this.orbiter_checks = [-1, 1, -2, 2, -4, 4, -8, 8, -12, 12, -16, 16, -20, 20]

  this.has_bulk_draw = true
  this.bulk_draw_nums = 3
}

Harpoon.prototype.add_harpoon_head = function() {
  var vloc = this.get_virtual_harpoon_loc();
  this.harpoon_head = new HarpoonHead(this.world, vloc.x, vloc.y, 0, this.impulse_game_state, this)
}

Harpoon.prototype.draw_harpoon_head = function(context, draw_factor, latest_color) {
  this.harpoon_head.color = latest_color

  this.harpoon_head.color_silenced = this.color_silenced
  this.harpoon_head.durations = this.durations

  this.harpoon_head.draw(context, draw_factor)

}


Harpoon.prototype.get_target_path = Orbiter.prototype.get_target_path

/*Harpoon.prototype.get_target_point = function() {
  if(!this.safe) {
    this.goalPt = null
    return get_safe_point(this, this.player)
  }
  else {

    if(this.goalPt != null && p_dist(this.player.body.GetPosition(), this.goalPt) < .9 * this.harpoon_length && !isVisible(this.player.body.GetPosition(), this.goalPt, this.level.obstacle_edges)) {
      return this.goalPt
    }

    if (this.check_for_good_target_point_timer > 0) {
      this.check_for_good_target_point_timer -= 1
      return this.player.body.GetPosition()
    }

    this.check_for_good_target_point_timer = this.check_for_good_target_point_interval

    for(var i = 0; i < 5; i++) {

      var random_angle = Math.random() * Math.PI * 2

      var is_valid = true

      var tempPt = new b2Vec2(this.player.body.GetPosition().x + Math.cos(random_angle) * this.harpoon_length * .9, this.player.body.GetPosition().y + Math.sin(random_angle) * this.harpoon_length * .9)

      if(!check_bounds(0, tempPt, draw_factor)) {
        is_valid = false
      }

      for(var k = 0; k < this.level.boundary_polygons.length; k++)
      {
        if(pointInPolygon(this.level.boundary_polygons[k], tempPt))
        {
          is_valid = false
        }
      }

      if(isVisible(tempPt, this.player.body.GetPosition(), this.level.obstacle_edges)) {
        is_valid = false
      }
      if(is_valid) {
        this.goalPt = tempPt
        return tempPt
      }
    }
    this.goalPt = null
    return this.player.body.GetPosition()

  }
}*/

Harpoon.prototype.enemy_move = Orbiter.prototype.move

Harpoon.prototype.move = function() {
  if(this.harpoon_state != "inactive" && this.harpoon_state != "engaged") {return}//do not move if harpooning

  if(this.harpoon_state == "engaged") {
    var dir = new b2Vec2(this.body.GetPosition().x - this.harpooned_target.body.GetPosition().x, this.body.GetPosition().y - this.harpooned_target.body.GetPosition().y)
    dir.Normalize()
    dir.Multiply(this.harpooned_force)
    if(this.harpooned_target==this.player && this.player.status_duration[2] > 0) {
      dir.Multiply(this.harpooned_goo_factor)
    }
    this.harpooned_target.body.ApplyImpulse(dir, this.body.GetWorldCenter())
    if(this.harpooned_target != this.player) {
      this.harpooned_target.open(1500)
    }
    this.body.SetAngle(_atan(this.player.body.GetPosition(), this.body.GetPosition()))
    return
  }

  if(this.path == null) {
    this.pathfinding_counter = this.pathfinding_delay
    //console.log("PATH IS NULL")
  }
  //console.log("BEFORE ENEMY MOVE "+this.pathfinding_counter)
  this.enemy_move()

}

Harpoon.prototype.get_harpoon_target_pt = function() {

  return this.player.body.GetPosition().Copy()

  //attempts to predict where the player will go
  //code doesn't work. Maybe try to do it work later.
  /*var cur_player_loc = this.player.body.GetPosition().Copy()
  var cur_player_v = this.player.body.GetLinearVelocity().Copy()
  var low = 0
  var t = 2
  var high = 4
  for(var i = 0; i < 10; i++) {

    var predicted_point = {x: cur_player_loc.x + cur_player_v.x * t, y: cur_player_loc.y + cur_player_v.y * t}

    var dist = p_dist(predicted_point, this.body.GetPosition())

    var time_taken = dist/this.harpoon_velocity

    if(dist > this.harpoon_length || time_taken < t) {
      high = t
      t = (t + low)/2

    }
    if(dist > this.harpoon_length || time_taken > t) {
      low = t
      t = (t + high)/2
    }
    else if(time_taken < t) {

    }
    else {
      break
    }
  }
  console.log("RETURNED "+t)
  return new b2Vec2( cur_player_loc.x + cur_player_v.x * t, cur_player_loc.y + cur_player_v * t)*/

}

Harpoon.prototype.no_sight = function() {
  return !isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)
}

Harpoon.prototype.can_harpoon = function() {
  return (this.status_duration[1] <= 0 && this.entered_arena && !this.dying && this.harpoon_state == "inactive" && check_bounds(0, this.body.GetPosition(), draw_factor)
   && p_dist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.harpoon_length)


}

Harpoon.prototype.get_virtual_harpoon_loc = function() {
  return new b2Vec2(this.body.GetPosition().x+(this.harpoon_head_defaut_dist)*(impulse_enemy_stats[this.type].effective_radius) * Math.cos(this.body.GetAngle()),
    this.body.GetPosition().y+(this.harpoon_head_defaut_dist)*(impulse_enemy_stats[this.type].effective_radius) * Math.sin(this.body.GetAngle()))
}


Harpoon.prototype.silence = function(dur, color_silence, destroyable) {
  if(color_silence) {
    this.color_silenced = true
  }
  if(destroyable) {
    this.destroyable_timer = dur
  }
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
  this.last_stun = this.status_duration[1]
}

Harpoon.prototype.additional_processing = function(dt) {

  //console.log(this.pathfinding_counter)

  if(this.destroyable_timer > 0) {
    this.destroyable_timer -= dt
  }

  if(this.harpoon_state == "inactive" || this.harpoon_state == "engaged") {
    this.set_heading(this.player.body.GetPosition())
  } else {
    this.set_heading(this.harpoon_head.body.GetPosition())
  }

  this.adjust_position_enabled = (this.harpoon_state == "inactive")

  if(!this.entered_arena && check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.silence(this.entered_arena_delay, true)
    this.last_stun = Math.max(this.entered_arena_delay, this.last_stun)
    this.entered_arena = true
  }

  if(this.entered_arena_timer > 0) {
    this.entered_arena_timer -= dt
  }
  if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) < this.safe_distance * 1.5) {
    this.pathfinding_delay = this.pathfinding_delay_near;

  } else {
    this.pathfinding_delay = this.pathfinding_delay_far;
  }

  if(!check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.entered_arena = false
  }

  if(this.harpoon_state != "inactive") {
  }

  if(this.harpoon_state == "inactive") {
    this.harpoon_head.body.SetPosition(this.get_virtual_harpoon_loc())
    this.harpoon_head.body.SetAngle(this.body.GetAngle())
  } else if(this.harpoon_state == "fire") {
    this.harpoon_head.body.SetAngle(this.harpoon_dir)
    if(this.harpoon_head.body.m_linearVelocity.Length() < 1) {
      this.harpoon_state = "retract"
    }
    /*if(this.harpooning && p_dist(this.body.GetPosition(), this.harpoon_head.body.GetPosition()) >= this.harpoon_length) {
      this.harpooning = false
    }*/
  } else if(this.harpoon_state == "retract") {
    var dir = _atan(this.harpoon_head.body.GetPosition(), this.body.GetPosition())
    this.harpoon_head.body.ApplyImpulse(new b2Vec2(this.harpoonhead_retract_force * Math.cos(dir), this.harpoonhead_retract_force * Math.sin(dir)), this.harpoon_head.body.GetWorldCenter())
    this.harpoon_head.body.SetAngle(Math.PI + dir)
    if(p_dist(this.harpoon_head.body.GetPosition(), this.body.GetPosition()) < this.harpoon_head_defaut_dist * 1.1) {
      //this.silence(this.delay_between_shots)
      //this.last_stun = Math.max(this.delay_between_shots, this.last_stun)
      this.harpoon_state = "inactive"
    }

  } else if(this.harpoon_state == "engaged") {

    this.harpoon_head.body.SetPosition(new b2Vec2(-100, -100));
    /*this.harpoon_head.body.SetPosition(this.player.body.GetPosition());
    this.harpoon_head.body.SetAngle(_atan(this.body.GetPosition(), this.player.body.GetPosition()))*/
  } else if(this.harpoon_state == "retract_ready") {
    this.silence(this.delay_between_shots)
    var dir = new b2Vec2(this.player.body.GetPosition().x - this.body.GetPosition().x, this.player.body.GetPosition().y - this.body.GetPosition().y)
    dir.Normalize()
    dir.Multiply(this.player.radius * 2)
    var pos = this.harpooned_target.body.GetPosition().Copy()//this.player.body.GetPosition().Copy()
    pos.Subtract(dir)
    this.harpoon_head.body.SetPosition(pos)
    var dir = _atan(this.body.GetPosition(), this.harpoon_head.body.GetPosition())
    this.harpoon_head.body.SetAngle(dir)
      this.harpoon_state = "retract"
    this.harpooned_target = null
  }



  if(this.check_safety_timer <= 0) {
    var cur_dist = p_dist(this.player.body.GetPosition(), this.body.GetPosition())
    var cur_vis = isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)

    if((cur_dist > this.safe_distance + this.safe_distance_buffer || !cur_vis) && !this.attack_mode) {
      this.attack_mode = true
      this.path = null
    }
    else if ((cur_dist < this.safe_distance && cur_vis) && this.attack_mode) {
      this.attack_mode = false
      this.path = null
    }

    this.check_safety_timer = this.check_safety_interval
  }
  this.check_safety_timer -= 1

  if(this.check_harpoon_timer > 0)
    this.check_harpoon_timer -= 1



  if(this.check_harpoon_timer <= 0) {
    if(this.no_sight() || this.impulse_game_state.is_boss_level) {
      this.harpoonable = true
      if(this.can_harpoon() ) {
        this.harpoon_state = "fire"
        this.harpoon_dir = _atan(this.harpoon_head.body.GetPosition(), this.get_harpoon_target_pt())
        this.harpoon_head.body.ApplyImpulse(new b2Vec2(this.harpoonhead_force * Math.cos(this.harpoon_dir), this.harpoonhead_force * Math.sin(this.harpoon_dir)), this.harpoon_head.body.GetWorldCenter())
        this.harpoon_head.body.SetAngle(this.harpoon_dir)
      }
    }
    else {
      this.harpoonable = false
    }

    this.check_cancel_harpoon()

    this.check_harpoon_timer = this.check_harpoon_interval


  }

  //harpoonhead stuff
  if(this.harpoon_head.durations["open"] > 0) {
    this.harpoon_head.durations["open"] -= dt;
  }
}

Harpoon.prototype.process_death = function(enemy_index, dt) {
  if(this.died && (this.dying != "hit_player" || this.dying_duration < this.dying_length - 50)) {//the moment the enemy starts to die, give a couple steps to resolve collisions, then remove the body from play
    this.died = false

    this.level.dead_enemies.push(enemy_index)
  }

  if(this.dying && this.dying_duration < 0)
  {//if expired, dispose of it
    this.level.expired_enemies.push(enemy_index)
    return true
  }

  if(this.dying )
  {//if dying, expire
    /*if(this.harpoon_joint != null) {
      this.world.DestroyJoint(this.harpoon_joint)
      this.harpoin_joint = null;
    }*/

    this.dying_duration -= dt
    this.harpoon_head.dying_duration -= dt
    return true
  }

  return false
}

Harpoon.prototype.start_death = function(death) {

  this.disengage_harpoon();

  console.log(death)

  this.dying = death
  this.dying_duration = this.dying_length
  this.died = true
  if(this.dying == "kill" && !this.player.dying) {
    //if the player hasn't died and this was a kill, increase score
    this.impulse_game_state.game_numbers.kills +=1
    if(impulse_enemy_stats[this.type].proxy)
      impulse_enemy_stats[impulse_enemy_stats[this.type].proxy].kills += 1
    else
      impulse_enemy_stats[this.type].kills += 1
    if(!this.level.is_boss_level) {
      var score_value = this.impulse_game_state.game_numbers.combo * this.score_value
      this.impulse_game_state.addScoreLabel(score_value, this.color, this.body.GetPosition().x, this.body.GetPosition().y, 20)
      this.impulse_game_state.game_numbers.score += score_value
      this.impulse_game_state.increment_combo()
      this.impulse_game_state.check_cutoffs()
    }
  }

  impulse_music.play_sound("sdeath")

  this.level.add_fragments(this.type, this.body.GetPosition(), this.body.GetLinearVelocity())

  this.harpoon_head.start_death("normal")

}


Harpoon.prototype.check_cancel_harpoon = function() {
  if(this.status_duration[1] > 0 && (this.harpoon_state != "inactive")) {
    this.disengage_harpoon()
  }
  if(this.harpoon_state == "engaged" && (!check_bounds(1, this.harpooned_target.body.GetPosition(), draw_factor) || this.harpooned_target.dying || p_dist(this.harpooned_target.body.GetPosition(), this.body.GetPosition()) < this.harpoon_disengage_dist)) {
    this.disengage_harpoon()
  }
  /*else if(this.harpoon_state == "engaged" && !check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.disengage_harpoon()
  }*/
  else if(this.harpoon_state == "engaged" && this.player.dying) {
    this.disengage_harpoon()
  }
}

Harpoon.prototype.additional_drawing = function(context, draw_factor, latest_color) {


  //context.save();
  if(this.harpoon_state != "engaged" && this.harpoon_state != "retract_ready") {
    /*context.beginPath()
    context.strokeStyle = latest_color
    context.lineWidth = 3
    context.globalAlpha *= 0.5
    context.lineWidth = 3
    context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    context.lineTo(this.harpoon_head.body.GetPosition().x * draw_factor, this.harpoon_head.body.GetPosition().y * draw_factor)
    context.stroke()
    context.globalAlpha *= 2*/

    this.draw_harpoon_head(context, draw_factor, latest_color)
  } /*else {
    context.beginPath()
    context.strokeStyle =  latest_color
    context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    context.lineTo(this.harpooned_target.body.GetPosition().x * draw_factor, this.harpooned_target.body.GetPosition().y * draw_factor)
    context.stroke()

    draw_shape(context, this.player.body.GetPosition().x * draw_factor, this.player.body.GetPosition().y * draw_factor,
      impulse_enemy_stats["harpoonhead"].shape_polygons[0], draw_factor*1.3, this.color, 1, _atan(this.body.GetPosition(), this.player.body.GetPosition()))

  }*/
  //context.restore();

  /*if(!this.dying && this.status_duration[1] > 0) {
    context.beginPath()

    context.lineWidth = 2
    context.strokeStyle = this.color;
    context.stroke()
  }

  /*context.save()
  if(this.status_duration[1] <=0 && this.entered_arena && this.harpoon_state == "inactive") {

    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.harpoon_length * draw_factor, 0, 2*Math.PI * 0.999)
    context.stroke()

  }

  context.restore()*/
}

Harpoon.prototype.bulk_draw_start = function(context, draw_factor, num) {

  context.save()
  var prog = this.dying ? Math.max((this.dying_duration) / this.dying_length, 0) : 1
  if(this.dying) {
    context.globalAlpha *= prog;
  }
  context.beginPath()
  context.strokeStyle = this.color
  if(num == 1) {
    context.lineWidth = 2
    context.globalAlpha *= .2
  }
  if(num == 2) {
    context.lineWidth = 3
    context.globalAlpha *= .5
  }
  if(num == 3) {
    context.lineWidth = 2
  }


}

Harpoon.prototype.bulk_draw = function(context, draw_factor, num) {
  if(num == 1) {
    if(this.status_duration[1] <=0 && this.entered_arena && this.harpoon_state == "inactive") {
      context.moveTo(this.body.GetPosition().x*draw_factor + this.harpoon_length * draw_factor, this.body.GetPosition().y*draw_factor)
      context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.harpoon_length * draw_factor, 0, 2*Math.PI * 0.999)
    }

  }
  if(num == 2) {
    if(this.harpoon_state != "engaged" && this.harpoon_state != "retract_ready") {
      context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
      context.lineTo(this.harpoon_head.body.GetPosition().x * draw_factor, this.harpoon_head.body.GetPosition().y * draw_factor)

    } else {
      context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
      context.lineTo(this.harpooned_target.body.GetPosition().x * draw_factor, this.harpooned_target.body.GetPosition().y * draw_factor)
    }
  }
  if(num == 3) {
    if(!this.dying && this.status_duration[1] > 0) {
      context.moveTo(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor - (this.effective_radius*draw_factor) * 2)
      context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * 0.999 * (this.status_duration[1] / this.last_stun), true)
    }
  }
}

Harpoon.prototype.bulk_draw_end = function(context, draw_factor, num) {
  context.stroke()
  context.restore()
}

Harpoon.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.silence(this.stun_length, true)
}

Harpoon.prototype.disengage_harpoon = function() {
  if(this.harpoon_state == "engaged") {

    //this.world.DestroyJoint(this.harpoon_joint)
    this.harpoon_joint = null
    this.harpoon_state = "retract_ready"
    this.silence(this.stun_length, true)
  }
}

Harpoon.prototype.engage_harpoon = function(target) {
  if(this.harpoon_state != "engaged" && !this.dying && this.status_duration[1] <= 0) {
    this.harpoon_state = "engaged"
    /*this.harpoon_joint = new Box2D.Dynamics.Joints.b2DistanceJointDef
    this.harpoon_joint.Initialize(this.body, target.body, this.body.GetWorldCenter(), target.body.GetWorldCenter())
    this.harpoon_joint.collideConnected = true
    this.harpoon_joint = this.world.CreateJoint(this.harpoon_joint)*/
    this.harpooned_target = target
    if(this.harpooned_target == this.player) {
      this.impulse_game_state.reset_combo()
    }
  }
}

Harpoon.prototype.collide_with = function(other, this_body, other_body) {

  if(this.dying || this.activated)//ensures the collision effect only activates once
    return

  if(other === this.player) {
    if(!this.level.is_boss_level) {
      this.impulse_game_state.reset_combo()
    }
    if(this.destroyable_timer > 0) {
      this.start_death("hit_player")
    }

    //if(this.status_duration[1] <= 0) {
    //  var harpoon_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
    //  this.player.body.ApplyImpulse(new b2Vec2(this.harpoon_explode_force * Math.cos(harpoon_angle), this.harpoon_explode_force * Math.sin(harpoon_angle)), this.player.body.GetWorldCenter())
    //}
  }
}
