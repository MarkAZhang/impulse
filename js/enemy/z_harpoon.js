Harpoon.prototype = new Enemy()

Harpoon.prototype.constructor = Harpoon

function Harpoon(world, x, y, id, impulse_game_state) {
  if(world === undefined) return
  this.type = "harpoon"

  var h_vertices = []

  var s_radius = .3

  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0), s_radius*Math.sin(Math.PI*0)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*5/6), s_radius*Math.sin(Math.PI*5/6)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*7/6), s_radius*Math.sin(Math.PI*7/6)))
  this.harpoon_shape = h_vertices

  this.silence_outside_arena = true
  this.entered_arena_delay = 1000

  this.init(world, x, y, id, impulse_game_state)

  if(world == null) return

  this.death_radius = 2

  this.fast_factor = 3

  // Estimated harpoon length.
  this.harpoon_length = 17
  if(saveData.difficultyMode == "easy") {
    this.harpoon_length = 13
  }

  this.goalPt = null

  this.harpoon_color = "orange"

  this.harpoon_state = "inactive"

  this.harpooned_force = 6
  if(saveData.difficultyMode == "easy") {
    this.harpooned_force = 4.5
  }
  this.harpooned_goo_factor = 0.33

  this.harpoonhead_force = 400
  if(saveData.difficultyMode == "easy") {
    this.harpoonhead_force = 50
  }
  this.harpoonhead_retract_force = 1.2
  if(saveData.difficultyMode == "easy") {
    this.harpoonhead_retract_force = 0.6
  }

  this.harpoon_explode_force = 70

  this.safe_radius = this.player.impulse_radius
  this.safe_radius_buffer = 2

  this.safe_distance = this.harpoon_length * 0.8

  this.pathfinding_delay_far = 40;
  this.pathfinding_delay_near = 20;

  this.pathfinding_delay = 40;

  this.offset_multiplier = Math.random() < 0.5 ? 1 : -1;
  this.silence_length = 500 //after being hit by player, becomes silenced

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

  this.max_guesses = 4

  this.harpoon_head_defaut_dist = Math.sqrt(2)/2+Math.sqrt(6)/6 - 0.4

  this.add_harpoon_head()

  this.harpoon_disengage_dist = 3
  this.harpoon_disengage_id = null

  this.delay_between_shots = 1000
  this.harpooned_target = null
  this.cautious = false
  this.harpoonable = false


  this.dire_harpoon = false
  this.attack_mode = true
  this.extra_adjust = false
  this.adjust_position_factor = 1;

  if(saveData.difficultyMode == "normal") {
    this.adjust_position_factor = 0.8;
  }
  this.orbiter_checks = [0, -1, 1, -2, 2, -4, 4, -8, 8, -12, 12, -16, 16, -20, 20]

  this.has_bulk_draw = true
  this.bulk_draw_nums = 3
  this.die_on_player_collision = false
}

Harpoon.prototype.add_harpoon_head = function() {
  var vloc = this.get_virtual_harpoon_loc();
  this.harpoon_head = new HarpoonHead(this.world, vloc.x, vloc.y, this.id + 10000, this.impulse_game_state, this)
}

Harpoon.prototype.draw_harpoon_head = function(context, draw_factor, latest_color) {
  this.harpoon_head.color = latest_color

  this.harpoon_head.color_silenced = this.color_silenced
  this.harpoon_head.durations = this.durations

  this.harpoon_head.draw(context, draw_factor)

}


Harpoon.prototype.get_target_path = Orbiter.prototype.get_target_path

Harpoon.prototype.enemy_move = Orbiter.prototype.move

Harpoon.prototype.player_hit_proc = function() {}

Harpoon.prototype.move = function() {
  if(this.harpoon_state != "inactive" && this.harpoon_state != "engaged") {return}//do not move if harpooning

  if(this.harpoon_state == "engaged") {
    var dir = new b2Vec2(this.body.GetPosition().x - this.harpooned_target.body.GetPosition().x, this.body.GetPosition().y - this.harpooned_target.body.GetPosition().y)
    dir.Normalize()
    dir.Multiply(this.harpooned_force)
    if(this.harpooned_target==this.player && this.is_gooed()) {
      dir.Multiply(this.harpooned_goo_factor)
    }
    this.harpooned_target.body.ApplyImpulse(dir, this.body.GetWorldCenter())
    if(this.harpooned_target != this.player) {
      this.harpooned_target.open(1500)
      if (this.harpooned_target.type == "tank") {
        this.harpooned_target.durations["volatile"] = 1500
      }
    }
    return
  }

  if(this.path == null) {
    this.pathfinding_counter = this.pathfinding_delay
  }
  this.enemy_move()

}

Harpoon.prototype.get_harpoon_target_pt = function() {
  return this.player.body.GetPosition().Copy()
}

Harpoon.prototype.no_sight = function() {
  return !utils.isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)
}

Harpoon.prototype.can_harpoon = function() {
  return (!this.is_silenced() && this.entered_arena && !this.dying && this.harpoon_state == "inactive" && utils.checkBounds(0, this.body.GetPosition(), imp_params.draw_factor)
   && utils.pDist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.harpoon_length)
}

Harpoon.prototype.get_virtual_harpoon_loc = function() {
  return new b2Vec2(this.body.GetPosition().x+(this.harpoon_head_defaut_dist)*(enemyData[this.type].effective_radius) * Math.cos(this.actual_heading),
    this.body.GetPosition().y+(this.harpoon_head_defaut_dist)*(enemyData[this.type].effective_radius) * Math.sin(this.actual_heading))
}

Harpoon.prototype.set_heading = function(heading) {

  this.heading_timer -= 1
  if(this.heading_timer <= 0) {
    this.body.SetAngle(heading)
    this.heading_timer = this.heading_gap
    this.harpoon_head.body.SetAngle(this.harpoon_head.actual_heading)
  }
  this.actual_heading = heading
}


Harpoon.prototype.additional_processing = function(dt) {

  if(this.harpoon_state == "inactive") {
    this.set_heading_to(this.player.body.GetPosition())
  } else if(this.harpoon_state == "engaged") {
    this.set_heading_to(this.harpooned_target.body.GetPosition())
  } else {
    this.set_heading_to(this.harpoon_head.body.GetPosition())
  }

  this.adjust_position_enabled = (this.harpoon_state == "inactive")

  if(utils.pDist(this.body.GetPosition(), this.player.body.GetPosition()) < this.safe_distance * 1.5) {
    this.pathfinding_delay = this.pathfinding_delay_near;

  } else {
    this.pathfinding_delay = this.pathfinding_delay_far;
  }

  if(this.harpoon_state == "inactive") {
    this.harpoon_head.body.SetPosition(this.get_virtual_harpoon_loc())
    this.harpoon_head.set_heading(this.actual_heading)
  } else if(this.harpoon_state == "fire") {
    var dir = utils.atan(this.body.GetPosition(), this.harpoon_head.body.GetPosition())
    this.harpoon_head.set_heading(dir)
    if(this.harpoon_head.body.m_linearVelocity.Length() < 1) {
      this.harpoon_state = "retract"
    }
    /*if(this.harpooning && utils.pDist(this.body.GetPosition(), this.harpoon_head.body.GetPosition()) >= this.harpoon_length) {
      this.harpooning = false
    }*/
  } else if(this.harpoon_state == "retract") {
    if (!this.is_silenced() || !utils.checkBounds(0, this.body.GetPosition(), imp_params.draw_factor)) {
      var dir = utils.atan(this.harpoon_head.body.GetPosition(), this.body.GetPosition())
      this.harpoon_head.body.ApplyImpulse(new b2Vec2(this.harpoonhead_retract_force * Math.cos(dir), this.harpoonhead_retract_force * Math.sin(dir)), this.harpoon_head.body.GetWorldCenter())
      this.harpoon_head.set_heading(Math.PI + dir)
      if(utils.pDist(this.harpoon_head.body.GetPosition(), this.body.GetPosition()) < this.harpoon_head_defaut_dist * 1.1) {
        this.harpoon_state = "inactive"
        this.silence(this.delay_between_shots, true)
        if (this.delay_between_shots > this.recovery_timer) {
          this.recovery_interval = this.delay_between_shots
          this.recovery_timer = this.delay_between_shots
        }
        this.harpoon_disengage_id = null
      }
    }
  } else if(this.harpoon_state == "engaged") {

    this.harpoon_head.body.SetPosition(new b2Vec2(-100, -100));
    /*this.harpoon_head.body.SetPosition(this.player.body.GetPosition());
    this.harpoon_head.body.SetAngle(utils.atan(this.body.GetPosition(), this.player.body.GetPosition()))*/
  } else if(this.harpoon_state == "retract_ready") {
    var dir = new b2Vec2(this.player.body.GetPosition().x - this.body.GetPosition().x, this.player.body.GetPosition().y - this.body.GetPosition().y)
    dir.Normalize()
    dir.Multiply(this.player.radius * 2)
    var pos = this.harpooned_target.body.GetPosition().Copy()//this.player.body.GetPosition().Copy()
    pos.Subtract(dir)
    this.harpoon_head.body.SetPosition(pos)
    var dir = utils.atan(this.body.GetPosition(), this.harpoon_head.body.GetPosition())
    this.harpoon_head.set_heading(dir)
    this.harpoon_state = "retract"
    this.harpooned_target = null
  }

  if(this.check_safety_timer <= 0) {
    var cur_dist = utils.pDist(this.player.body.GetPosition(), this.body.GetPosition())
    var cur_vis = utils.isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)

    this.attack_mode = false
    // If safe or not visible, move towards
    /*if((cur_dist > this.safe_distance + this.safe_distance_buffer || !cur_vis) && !this.attack_mode) {
      this.attack_mode = true
      this.path = null
    }
    else if ((cur_dist < this.safe_distance && cur_vis) && this.attack_mode) {
      this.attack_mode = false
      this.path = null
    }*/

    this.check_safety_timer = this.check_safety_interval
  }
  this.check_safety_timer -= 1

  if(this.check_harpoon_timer > 0)
    this.check_harpoon_timer -= 1

  if(this.check_harpoon_timer <= 0) {
    if(this.no_sight() || this.impulse_game_state.is_boss_level) {
      this.harpoonable = true
      if(this.can_harpoon() ) {
        imp_params.impulse_music.play_sound("hfire")
        this.harpoon_state = "fire"
        this.harpoon_dir = utils.atan(this.harpoon_head.body.GetPosition(), this.get_harpoon_target_pt())
        this.harpoon_head.body.ApplyImpulse(new b2Vec2(this.harpoonhead_force * Math.cos(this.harpoon_dir), this.harpoonhead_force * Math.sin(this.harpoon_dir)), this.harpoon_head.body.GetWorldCenter())
        this.harpoon_head.set_heading(this.harpoon_dir)
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

Harpoon.prototype.modify_movement_vector = function(dir) {
  if(!utils.checkBounds(-3, this.body.GetPosition(), imp_params.draw_factor)) {
    dir.Multiply(this.fast_factor)
  }

  dir.Multiply(this.force);
}

Harpoon.prototype.start_death = function(death) {

  this.disengage_harpoon();

  this.dying = death
  this.dying_duration = this.dying_length
  this.died = true
  if(this.dying == "kill" && !this.player.dying) {
    //if the player hasn't died and this was a kill, increase score
    this.impulse_game_state.game_numbers.kills +=1
    if(enemyData[this.type].proxy)
      enemyData[enemyData[this.type].proxy].kills += 1
    else
      enemyData[this.type].kills += 1
    if(!this.level.is_boss_level) {
      var score_value = this.impulse_game_state.game_numbers.combo * this.score_value
      if(saveData.optionsData.score_labels)
        this.impulse_game_state.addScoreLabel(score_value, this.color, this.body.GetPosition().x, this.body.GetPosition().y, 20)
      this.impulse_game_state.game_numbers.score += score_value
      this.impulse_game_state.increment_combo()
      this.impulse_game_state.check_cutoffs()
    }
  }
  if (this.dying != "fade") {
    this.level.add_fragments(this.type, this.body.GetPosition(), this.body.GetLinearVelocity())
    this.additional_death_prep(death)
    imp_params.impulse_music.play_sound("sdeath")
  }

  this.harpoon_head.start_death(this.dying == "fade" ? "fade" : "accident")

}


Harpoon.prototype.check_cancel_harpoon = function() {
  if(this.is_silenced() && (this.harpoon_state != "inactive")) {
    this.disengage_harpoon()
  }
  if(this.harpoon_state == "engaged" && (!utils.checkBounds(1, this.harpooned_target.body.GetPosition(), imp_params.draw_factor) || this.harpooned_target.dying || utils.pDist(this.harpooned_target.body.GetPosition(), this.body.GetPosition()) < this.harpoon_disengage_dist)) {
    this.disengage_harpoon()
  }
  /*else if(this.harpoon_state == "engaged" && !utils.checkBounds(0, this.body.GetPosition(), draw_factor)) {
    this.disengage_harpoon()
  }*/
  else if(this.harpoon_state == "engaged" && this.player.dying) {
    this.disengage_harpoon()
  }
}

Harpoon.prototype.pre_draw = function(context, draw_factor) {
  var latest_color = this.get_current_color_with_status()
  if(latest_color != this.color || this.dying) {
      context.save()
      context.strokeStyle = latest_color
      context.lineWidth = 3
      context.globalAlpha *= .5

      var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
      if (this.dying)
        context.globalAlpha *= (1 - prog)
      context.beginPath()
      if(this.harpoon_state != "engaged" && this.harpoon_state != "retract_ready") {
        context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
        context.lineTo(this.harpoon_head.body.GetPosition().x * draw_factor, this.harpoon_head.body.GetPosition().y * draw_factor)

      } else {
        context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
        context.lineTo(this.harpooned_target.body.GetPosition().x * draw_factor, this.harpooned_target.body.GetPosition().y * draw_factor)
      }
      context.stroke()
      context.restore()
    }
}

Harpoon.prototype.additional_drawing = function(context, draw_factor) {

  if(this.harpoon_state != "engaged" && this.harpoon_state != "retract_ready") {
    this.draw_harpoon_head(context, draw_factor, this.get_current_color_with_status())
  }
}

Harpoon.prototype.bulk_draw_start = function(context, draw_factor, num) {

  context.save()
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
    context.strokeStyle = "gray";
  }
}

Harpoon.prototype.bulk_draw = function(context, draw_factor, num) {
  // Do not draw if dying. We cannot change the opacity for a given enemy for bulk-draw, so we just don't draw at all.
  if (this.dying) {
    return
  }
  if(num == 1) {
    if(!this.is_silenced() && this.entered_arena && this.harpoon_state == "inactive") {
      context.moveTo(this.body.GetPosition().x*draw_factor + this.harpoon_length * draw_factor, this.body.GetPosition().y*draw_factor)
      context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.harpoon_length * draw_factor, 0, 2*Math.PI * 0.999)
    }

  }
  if(num == 2) {
    if(this.get_current_color_with_status() != this.color || this.dying) return
    if(this.harpoon_state != "engaged" && this.harpoon_state != "retract_ready") {
      context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
      context.lineTo(this.harpoon_head.body.GetPosition().x * draw_factor, this.harpoon_head.body.GetPosition().y * draw_factor)
    } else {
      context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
      context.lineTo(this.harpooned_target.body.GetPosition().x * draw_factor, this.harpooned_target.body.GetPosition().y * draw_factor)
    }
  }
  if(num == 3) {
    if(this.recovery_timer > 0 && !this.dying && !this.is_locked()) {
      uiRenderUtils.bulkDrawProgCircle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.effective_radius, 1 - this.recovery_timer/this.recovery_interval)
    }
  }
}

Harpoon.prototype.bulk_draw_end = function(context, draw_factor, num) {
  context.stroke()
  context.restore()
}

Harpoon.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.silence(this.silence_length, true)
  if (this.silence_length > this.recovery_timer) {
    this.recovery_interval = this.silence_length
    this.recovery_timer = this.silence_length
  }
}

Harpoon.prototype.disengage_harpoon = function() {
  if(this.harpoon_state == "engaged") {

    //this.world.DestroyJoint(this.harpoon_joint)
    this.harpoon_joint = null
    this.harpoon_state = "retract_ready"
    this.harpoon_disengage_id = this.harpooned_target.id
  }
}

Harpoon.prototype.engage_harpoon = function(target) {
  if(this.harpoon_state != "engaged" && !this.dying && !this.is_silenced() && target.id !== this.harpoon_disengage_id) {
    imp_params.impulse_music.play_sound("hhit")
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
