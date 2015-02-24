BossTwo.prototype = new Boss()

BossTwo.prototype.constructor = BossTwo

function BossTwo(world, x, y, id, impulse_game_state) {
  this.type = "second boss"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.do_yield = false

  this.gateway_particles = []
  this.gateway_particle_gen_interval = 1000
  this.gateway_particle_gen_timer = this.gateway_particle_gen_interval
  this.gateway_particle_duration = 2000
  this.gateway_particles_per_round = 8

  this.safe = true

  this.arm_core_angle = Math.PI * 3/4
  this.arm_width_angle_min = Math.PI * 3/16
  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.arm_width_angle_min = Math.PI * 5/32
  }
  this.arm_width_angle_max = Math.PI * 1/2
  this.arm_width_angle = this.arm_width_angle_min
  this.arm_width_angle_transition_rate = Math.PI * 1/8
  this.arm_length = 50
  this.arm_taper = .9
  this.num_arms = 4

  this.absorbed_enemy_types = [];


  this.arm_full_rotation = 15000

  this.spawned = false

  this.body.SetAngle(this.arm_core_angle)

  this.default_heading = false

  this.spin_rate = this.arm_full_rotation

  this.visibility = 0

  this.black_hole_interval = 13500
  this.black_hole_timer = this.black_hole_interval - 1
  this.black_hole_duration = 2000
  this.black_hole_radius = 0
  this.black_hole_force = 10
  this.black_hole_player_factor = 1
  this.black_hole_switch_time = 1000
  this.black_hole_expand_prop = 0.9
  this.black_hole_sound_played = false

  this.knockback_red_interval = 150
  this.knockback_red_duration = 0

  this.player_gravity_force = 0

  this.red_visibility = 0

  this.spawned_harpoons = false

  //this.high_gravity_factor = 1.25//.25
  this.high_gravity_factor = 2.5//1.5
  this.low_gravity_factor = 4//3

  this.boss_high_gravity_force = 0.9
  this.boss_low_gravity_force = .3
  this.boss_beam_gravity_force = 1.2
  // In easy mode, the player is heavier. Need to make boss stronger, else it's just too easy.
  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.boss_high_gravity_force *= 1.5
    this.boss_low_gravity_force *= 1.5
    this.boss_beam_gravity_force *= 1.5
  }

  this.spawn_spawners = false
  this.spawners = []

  this.growth_factor = 1

  this.last_growth_factor = 1

  this.transition_rate = 0.2

  this.growth_on_enemy = 0.125

  this.shrink_rate = 0.025

  this.enemy_spawn_interval = 12000
  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.enemy_spawn_interval = 12000
  }
  this.enemy_spawn_duration = 2000

  this.spawn_sets = [
    ["stunner", "tank"],
    ["harpoon", "spear"],
    ["mote", "goo"]
  ]

  if (imp_vars.player_data.difficulty_mode == "normal") {
    this.spawn_sets = [
      ["stunner", "stunner", "tank", "goo"],
      ["harpoon", "spear", "spear", "tank"],
      ["mote", "goo", "tank", "harpoon"]
    ]
  }

  this.enemy_gravity_factor = {
    "stunner": 0.4,
    "spear": 0.4,
    "tank": 2,
    "mote": 0.2,
    "goo": 2.5,
    "harpoon": 2
  }

  this.player_struck = false
  this.enemies_struck = []

  this.spawn_pattern_counter = 0


}

BossTwo.prototype.adjust_size = function() {

  var fixtures = this.body.GetFixtureList()
  if (fixtures.length === undefined) {
    fixtures = [fixtures]
  }

  for(var i = 0; i < fixtures.length; i++) {
    var vertices = this.body.GetFixtureList().m_shape.m_vertices
    var polygon = this.shape_polygons[i]

    for(var j = 0; j < vertices.length; j++)
    {
      vertices[j] = new b2Vec2(polygon.x + (polygon.r * polygon.vertices[j][0]) * this.last_growth_factor,
        polygon.y + polygon.r * polygon.vertices[j][1] * this.last_growth_factor)
    }

  }
  this.body.ResetMassData()
}

BossTwo.prototype.boss_specific_additional_processing = function(dt) {

  // spawn spawners if necessary
  if(!this.spawn_spawners) {
    this.spawn_spawners = true
    var spawner_buffer = 80
    var locs = [[imp_vars.levelWidth - spawner_buffer, imp_vars.levelHeight - spawner_buffer],
      [spawner_buffer, spawner_buffer]]
    if (imp_vars.player_data.difficulty_mode == "normal") {
      locs = [
        [spawner_buffer, spawner_buffer],
        [imp_vars.levelWidth - spawner_buffer, spawner_buffer],
        [imp_vars.levelWidth - spawner_buffer, imp_vars.levelHeight - spawner_buffer],
        [spawner_buffer, imp_vars.levelHeight - spawner_buffer]
      ];
    }
    for(var i = 0; i < locs.length; i++) {
      var new_spawner = new BossTwoSpawner(locs[i][0], locs[i][1], this, this.impulse_game_state)
      new_spawner.spawn_duration = i/locs.length * new_spawner.spawn_interval
      this.spawners.push(new_spawner)
    }
  }

  if(this.spawn_duration > 0) {
    this.spawn_duration = Math.max(this.spawn_duration - dt, 0)
    this.visibility = 1 - this.spawn_duration / this.spawn_interval
    return
  }
  else if(this.spawned == false){
    this.spawned = true
    this.visibility = 1
    this.body.SetLinearDamping(imp_params.impulse_enemy_stats[this.type].lin_damp)

  }
  this.body.SetAngle(this.arm_core_angle)

  if(this.knockback_red_duration > 0) {
    this.knockback_red_duration -= dt
  }
  // get spawners to spawn enemys simultaneously in a pattern
  this.enemy_spawn_duration -= dt
  if(this.enemy_spawn_duration < 0) {
    this.enemy_spawn_duration = this.enemy_spawn_interval

    for (var i = 0; i < this.spawners.length; i++) {
      this.spawners[i].spawn_enemies(this.spawn_sets[this.spawn_pattern_counter][i])
    }
    this.spawn_pattern_counter += 1
    this.spawn_pattern_counter = this.spawn_pattern_counter % this.spawn_sets.length
  }

  if(this.growth_factor > 1) {
    this.growth_factor = Math.max(1, this.growth_factor - dt/1000 * this.shrink_rate)
  }

  if(this.last_growth_factor != this.growth_factor) {
    if(this.last_growth_factor < this.growth_factor) {
      this.last_growth_factor = Math.min(this.last_growth_factor + this.transition_rate * dt/1000,this.growth_factor)
    } else {
      this.last_growth_factor = Math.max(this.last_growth_factor - this.transition_rate * dt/1000,this.growth_factor)
    }
    this.adjust_size()
  }
  this.process_gateway_particles(dt);

  var target_arm_width_angle = this.get_target_arm_width_angle()
  if(this.arm_width_angle != target_arm_width_angle) {
    if(this.arm_width_angle < target_arm_width_angle) {
      this.arm_width_angle = Math.min(this.arm_width_angle + this.arm_width_angle_transition_rate * dt/1000, target_arm_width_angle)
    } else {
      this.arm_width_angle = Math.max(this.arm_width_angle - this.arm_width_angle_transition_rate * dt/1000, target_arm_width_angle)
    }
  }

  for(var index in this.spawners) {
    this.spawners[index].process(dt)
  }

  if(this.small_exploding) {
    if(this.small_exploding_duration < 0) {

      this.small_exploding = false

    }
    else {
      this.small_exploding_duration -= dt
    }
  }

  this.arm_core_angle += Math.PI * 2 * dt / (this.arm_full_rotation / this.last_growth_factor)

  for(var i = 0; i < this.level.enemies.length; i++) {
    if (this.level.enemies[i].id == this.id) continue
    var boss_angle = _atan(this.level.enemies[i].body.GetPosition(), this.body.GetPosition())

    var gravity_force = this.enemy_gravity_factor[this.level.enemies[i].type] * this.get_gravity_force(this.level.enemies[i].body.GetPosition(), true)

    if(gravity_force > 0)
      this.level.enemies[i].body.ApplyImpulse(new b2Vec2(gravity_force * Math.cos(boss_angle), gravity_force * Math.sin(boss_angle)), this.level.enemies[i].body.GetWorldCenter())
  }

  this.player_gravity_force = 0
  var boss_angle = _atan(this.player.get_current_position(), this.body.GetPosition())

  var gravity_force = this.get_gravity_force(this.player.get_current_position())

  if(gravity_force > 0) {
    this.player_gravity_force += gravity_force
    this.player.body.ApplyImpulse(new b2Vec2(gravity_force *  Math.cos(boss_angle), gravity_force * Math.sin(boss_angle)), this.player.body.GetWorldCenter())
  }


  if (imp_vars.player_data.difficulty_mode == "normal") {
    if(this.black_hole_timer < 0) {
      if (!this.black_hole_sound_played) {
        this.black_hole_sound_played = true
        imp_vars.impulse_music.play_sound("b2bhole")
      }
      var prop = -this.black_hole_timer/this.black_hole_duration
      if(prop < this.black_hole_expand_prop)
        this.black_hole_radius = this.effective_radius * (this.last_growth_factor * this.low_gravity_factor * (prop/this.black_hole_expand_prop))
      else
        this.black_hole_radius = this.effective_radius * (this.last_growth_factor * this.low_gravity_factor * (1 - (prop-this.black_hole_expand_prop)/(1-this.black_hole_expand_prop)))
      //this.black_hole()
    }
    if(this.black_hole_timer < -this.black_hole_duration) {
      this.black_hole_timer = this.black_hole_interval
      this.black_hole_radius = 0
      this.player_struck = false
      this.enemies_struck = []
      this.black_hole_sound_played = false
    }
    this.black_hole_timer -= dt
  }
}

// Returns the target arm_width_angle. Since we transition, the actual arm_width_angle may be off slightly.
BossTwo.prototype.get_target_arm_width_angle = function() {
  return this.arm_width_angle_min + Math.min(1, (this.growth_factor - 1) / 2) * (this.arm_width_angle_max - this.arm_width_angle_min);
}

BossTwo.prototype.get_black_hole_force = function(loc, is_enemy) {
  var black_hole_factor = 5

  if(-this.black_hole_timer/this.black_hole_duration < this.black_hole_expand_prop) {
    black_hole_factor = 0.12
  }

  if(p_dist(this.body.GetPosition(), loc) <= this.effective_radius * this.low_gravity_factor)
  {
    black_hole_force = this.black_hole_force * black_hole_factor
    if (!is_enemy) {
      black_hole_force *= this.black_hole_player_factor;
    }

  } else {
    black_hole_force = -1
  }

  return black_hole_force;
}

BossTwo.prototype.get_gravity_force = function(loc, is_enemy) {
  if (this.black_hole_timer < 0) {
    // Check if the black hole force applies. If so, return it.
    var black_hole_force = this.get_black_hole_force(loc, is_enemy);
    if (black_hole_force !== -1) {
      return black_hole_force
    }
  }
  var dist =  p_dist(loc, this.body.GetPosition())
  var polygons = this.get_arm_polygons()
  var inside = false
  var gravity_force = 0;
  for(var j = 0; j < polygons.length; j++) {
    if(pointInPolygon(polygons[j], loc)) {
      gravity_force += this.boss_beam_gravity_force;
      break;
    }
  }
  if (dist <= this.effective_radius * this.last_growth_factor * this.high_gravity_factor) {
    gravity_force += this.boss_high_gravity_force
  }
  else if (dist <= this.effective_radius * this.last_growth_factor * this.low_gravity_factor) {
    gravity_force += this.boss_low_gravity_force
  }

  if (is_enemy) {
    gravity_force *= 0.3;
  }
  return gravity_force;
}
BossTwo.prototype.pre_draw = function(context, draw_factor) {
  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) return
  context.save()
  if (this.dying) {
      var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
      context.globalAlpha *= (1 - prog)
  } else
      context.globalAlpha *= this.visibility ? this.visibility : 1

  if(this.black_hole_timer < 0 && this.black_hole_timer >= -this.black_hole_duration) {
    context.globalAlpha *= 0.5;
    var gray = Math.min(5 - Math.abs((-this.black_hole_timer - this.black_hole_duration/2)/(this.black_hole_duration/10)), 1)
    context.globalAlpha *= gray/2
    context.fillStyle = this.color
    context.fillRect(0, 0, imp_vars.canvasWidth, imp_vars.canvasHeight)
    context.globalAlpha *= 2
  }


  if(this.black_hole_timer < 0 && this.black_hole_timer >= -this.black_hole_duration) {
    var tp = this.body.GetPosition()

    if(-this.black_hole_timer/this.black_hole_duration < this.black_hole_expand_prop) {
      drawSprite(context, tp.x*draw_factor, tp.y*draw_factor,
      0, this.black_hole_radius * draw_factor * 2, this.black_hole_radius * draw_factor * 2, "consumendi_aura", consumendiSprite)
    } else {
      drawSprite(context, tp.x*draw_factor, tp.y*draw_factor,
      0, this.black_hole_radius * draw_factor * 2, this.black_hole_radius * draw_factor * 2, "consumendi_aura", consumendiSprite)
    }



    /*context.beginPath()
    context.strokeStyle = this.color
    context.lineWidth = 2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.black_hole_radius * draw_factor, 0, 2*Math.PI, true)
    context.stroke()*/
  }

  var aura_factor = 1
  if(this.black_hole_timer >= this.black_hole_interval  - this.black_hole_switch_time) {
    aura_factor = 1 - (this.black_hole_timer - this.black_hole_interval  + this.black_hole_switch_time) / this.black_hole_switch_time
  } else if(this.black_hole_timer <= this.black_hole_switch_time && this.black_hole_timer > 0) {
    aura_factor = this.black_hole_timer / this.black_hole_switch_time
  }

  var tp = this.body.GetPosition()
  if(this.black_hole_timer > 0) {
    context.save();
    context.globalAlpha *= 0.7;
    drawSprite(context, tp.x*draw_factor, tp.y*draw_factor,
    0, 90 * aura_factor * this.last_growth_factor * this.high_gravity_factor, 90 * aura_factor *this.last_growth_factor * this.high_gravity_factor, "consumendi_aura", consumendiSprite)
    context.restore();
  }

  context.save()

  context.globalAlpha *= 0.7
  for(var i = 0; i < 16; i++) {
    var angle = 2 * Math.PI * (i/16 + 1/32 - 1/4);
    if(this.spawned && 1 - this.black_hole_timer/ this.black_hole_interval > 1-i/16) {
      drawSprite(context, (tp.x+Math.cos(angle)*this.effective_radius * this.last_growth_factor * this.low_gravity_factor) * draw_factor,
      (tp.y+Math.sin(angle) * this.effective_radius * this.last_growth_factor * this.low_gravity_factor) * draw_factor,
      angle, 30, 56, "consumendi_small_diamond_filled", consumendiSprite)

    } else {
      drawSprite(context, (tp.x+Math.cos(angle)*this.effective_radius * this.last_growth_factor * this.low_gravity_factor) * draw_factor,
      (tp.y+Math.sin(angle) * this.effective_radius * this.last_growth_factor * this.low_gravity_factor) * draw_factor,
      angle, 30, 56, "consumendi_small_diamond", consumendiSprite)
    }
  }
  context.restore()

  this.draw_glows(context, draw_factor)

  this.draw_gateway_particles(context, draw_factor);
  context.restore()
}


BossTwo.prototype.draw = function(context, draw_factor) {

  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) return


  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
  context.save()
  if (this.dying)
      context.globalAlpha *= (1 - prog)
    else
      context.globalAlpha *= this.visibility != null ? this.visibility : 1

  var tp = this.body.GetPosition()

  /*this.draw_glows(context, draw_factor);
  /*if(this.lighten_timer >= 0) {
    this.draw_special_attack_timer(context, draw_factor)
  }*/
  //this.draw_aura(context, draw_factor)



  if(this.knockback_red_duration > 0) {
    drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle() + Math.PI/4), 90 * this.last_growth_factor, 90 * this.last_growth_factor, "consumendi_head_red", consumendiSprite)
  } else {
    drawSprite(context, tp.x*draw_factor, tp.y*draw_factor, (this.body.GetAngle() + Math.PI/4), 90 * this.last_growth_factor, 90 * this.last_growth_factor, "consumendi_head", consumendiSprite)
  }
  this.additional_drawing(context, draw_factor)

  context.restore()
}

BossTwo.prototype.additional_death_prep_specific = function() {
  if (this.absorbed_enemy_types.length == 0) return;
  // Spawn exactly 10 fragments, generated from the array.
  for (var i = 0; i < 10; i++) {
    var type = this.absorbed_enemy_types[Math.floor(this.absorbed_enemy_types.length / 10 * i)];
    var angle = _atan(this.body.GetPosition(), this.player.body.GetPosition()) + (Math.random() - 0.5) * 2 * Math.PI;
    var dir = new b2Vec2(Math.cos(angle), Math.sin(angle));
    dir.Normalize();
    dir.Multiply(100);
    this.level.add_fragments(type, this.body.GetPosition(), dir);

  }
}

BossTwo.prototype.draw_glows = function(context, draw_factor) {

  var tp = this.body.GetPosition()
  if(this.knockback_red_duration > 0) {
    drawSprite(context, tp.x*draw_factor,
    tp.y*draw_factor,
    (this.body.GetAngle()), 200 * this.last_growth_factor, 200 * this.last_growth_factor, "immunitas_red_glow", immunitasSprite)
  } else {
    drawSprite(context, tp.x*draw_factor,
      tp.y*draw_factor,
      (this.body.GetAngle()), 200 * this.last_growth_factor, 200 * this.last_growth_factor, "consumendi_glow", consumendiSprite)
  }
}

BossTwo.prototype.additional_drawing = function(context, draw_factor) {

  for(var index in this.spawners) {
    this.spawners[index].draw(context, draw_factor, (Math.max(this.enemy_spawn_duration, 0) / this.enemy_spawn_interval), this.spawn_sets[this.spawn_pattern_counter][index])

  }

  var polygons = this.get_arm_polygons()

  /*if(this.red_visibility > 0) {
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
  }*/

  context.save()
  context.beginPath()
  context.rect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  context.clip()

  for(var j = 0; j < polygons.length; j++) {
    context.beginPath()

    context.moveTo(polygons[j][0].x*draw_factor, polygons[j][0].y*draw_factor)
    for(var i = 1; i < polygons[j].length; i++)
    {
      context.lineTo(polygons[j][i].x*draw_factor, polygons[j][i].y*draw_factor)
    }
    context.closePath()
    context.save()
    context.globalAlpha *= this.visibility/4
    context.fillStyle = this.color
    context.fill()
    /*context.globalAlpha = this.red_visibility/2
    context.fillStyle = "red"
    context.fill()*/


    var tp = this.body.GetPosition()
    var arm_angle = Math.PI * 2 * j / this.num_arms + this.arm_core_angle
    drawSprite(context, (tp.x+Math.cos(arm_angle)*this.effective_radius * this.last_growth_factor * this.low_gravity_factor * 1.5) * draw_factor,
    (tp.y+Math.sin(arm_angle) * this.effective_radius * this.last_growth_factor * this.low_gravity_factor * 1.5) * draw_factor,
    arm_angle + Math.PI/2, 50, 80, "consumendi_small_arrow", consumendiSprite)
    context.restore()

  }
  context.restore()

  /*if(this.small_exploding_duration > 0) {
    context.beginPath()
    context.strokeStyle = "red"
    context.lineWidth = 2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius + (this.small_exploding_radius - this.effective_radius)* (1 - this.small_exploding_duration/this.small_exploding_interval)) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
  }*/

  /*if(this.black_hole_timer >= 0) {
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (Math.max(this.black_hole_timer, 0) / this.black_hole_interval), true)
    context.lineWidth = 2
    context.strokeStyle = "red"
    context.stroke()
  }*/

  var tp = this.player.get_current_position()
  var angle = _atan(tp, this.body.GetPosition())


  if(!this.player.dying) {


    if(this.player_gravity_force >= 0.3)
      drawSprite(context, (tp.x+Math.cos(angle)*2) * draw_factor,
      (tp.y+Math.sin(angle) * 2) * draw_factor,
      angle - Math.PI/2, 20, 10, "consumendi_small_arrow", consumendiSprite)
    if(this.player_gravity_force >= 0.75)
      drawSprite(context, (tp.x+Math.cos(angle)*2.75) * draw_factor,
      (tp.y+Math.sin(angle) * 2.75) * draw_factor,
      angle - Math.PI/2, 20, 10, "consumendi_small_arrow", consumendiSprite)
    if(this.player_gravity_force >= 1.2)
      drawSprite(context, (tp.x+Math.cos(angle)*3.5) * draw_factor,
      (tp.y+Math.sin(angle) * 3.5) * draw_factor,
      angle - Math.PI/2, 20, 10, "consumendi_small_arrow", consumendiSprite)
    if(this.player_gravity_force >= 2)
      drawSprite(context, (tp.x+Math.cos(angle)*4.25) * draw_factor,
      (tp.y+Math.sin(angle) * 4.25) * draw_factor,
      angle - Math.PI/2, 20, 10, "consumendi_small_arrow", consumendiSprite)
  }
}

BossTwo.prototype.get_arm_polygons = function() {
  var polygons = []
  for(var i = 0; i < this.num_arms; i++) {
    var polygon = []
    polygon.push({x: this.body.GetPosition().x, y: this.body.GetPosition().y})
    polygon.push({x: this.body.GetPosition().x + this.arm_length * this.arm_taper *
      Math.cos(Math.PI * 2 * i / this.num_arms + this.arm_core_angle - this.arm_width_angle/2),
      y: this.body.GetPosition().y + this.arm_length * this.arm_taper *
      Math.sin(Math.PI * 2 * i / this.num_arms + this.arm_core_angle - this.arm_width_angle/2)})

    polygon.push({x: this.body.GetPosition().x + this.arm_length *
      Math.cos(Math.PI * 2 * i / this.num_arms + this.arm_core_angle + this.arm_width_angle/2),
      y: this.body.GetPosition().y + this.arm_length *
      Math.sin(Math.PI * 2 * i / this.num_arms + this.arm_core_angle + this.arm_width_angle/2)})

    polygons.push(polygon)
  }
  return polygons

}

BossTwo.prototype.move = function() {
}

BossTwo.prototype.collide_with = function(other) {
  if(this.dying || !this.spawned)//ensures the collision effect only activates once
    return

  if(other.dying) return

  if(other === this.player) {
    imp_vars.impulse_music.play_sound("b2eat")
    var boss_angle = _atan(this.body.GetPosition(),other.body.GetPosition())
    this.player_struck = true
    //other.lin_damp = 2
    other.start_death("absorbed")
    this.impulse_game_state.reset_combo();
    //other.body.SetLinearDamping(other.lin_damp)
    //setTimeout(function() {
    //  other.lin_damp = 3.5
    //  other.body.SetLinearDamping(other.lin_damp)
    //}, 1000)
    //other.body.ApplyImpulse(new b2Vec2(this.boss_force * Math.cos(boss_angle), this.boss_force * Math.sin(boss_angle)), other.body.GetWorldCenter())
  }
  else if(other !== this.player) {
    imp_vars.impulse_music.play_sound("b2eat")
    if(other.type != "harpoonhead") {
      other.start_death("absorbed")
      this.growth_factor += this.growth_on_enemy
      this.enemies_struck.push(other)
      this.absorbed_enemy_types.push(other.type);
    } else {
      this.absorbed_enemy_types.push("harpoon");
      other.harpoon.start_death("absorbed")
      this.growth_factor += this.growth_on_enemy
      this.enemies_struck.push(other)
      this.enemies_struck.push(other.harpoon)
    }
  }
}

BossTwo.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.shape_points[0].length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add(this.shape_points[0][i])
    ans.push(temp)
  }
  return ans
}

BossTwo.prototype.black_hole = function() {

  var black_hole_factor = 5

  if(-this.black_hole_timer/this.black_hole_duration < this.black_hole_expand_prop) {
    black_hole_factor = 0.12
  }
  var black_hole_force = 0

  if(!this.player_struck) {
    if(p_dist(this.body.GetPosition(), this.player.get_current_position()) <= this.black_hole_radius)
    {
      black_hole_force = this.black_hole_force * black_hole_factor * this.black_hole_player_factor
    } else {
      black_hole_force = this.boss_low_gravity_force
    }
    var tank_angle = _atan(this.body.GetPosition(), this.player.get_current_position()) + Math.PI

    this.player_gravity_force += black_hole_force

    this.player.body.ApplyImpulse(new b2Vec2(black_hole_force * Math.cos(tank_angle),
    black_hole_force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
  }

  for(var i = 0; i < this.level.enemies.length; i++)
  {
    if(this.enemies_struck.indexOf(this.level.enemies[i]) == -1 &&!this.level.enemies[i].dying && this.level.enemies[i] !== this) {
      if(p_dist(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) <= this.black_hole_radius)
      {
        var _angle = _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) + Math.PI
        var suction_force = this.black_hole_force * this.enemy_gravity_factor[this.level.enemies[i].type] * black_hole_factor
        this.level.enemies[i].body.ApplyImpulse(new b2Vec2(suction_force * Math.cos(_angle), suction_force * Math.sin(_angle)), this.level.enemies[i].body.GetWorldCenter())
      } else {
        var _angle = _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) + Math.PI
        var suction_force = this.boss_low_gravity_force * this.enemy_gravity_factor[this.level.enemies[i].type]
        this.level.enemies[i].body.ApplyImpulse(new b2Vec2(suction_force * Math.cos(_angle), suction_force * Math.sin(_angle)), this.level.enemies[i].body.GetWorldCenter())
      }
    }
  }
}

BossTwo.prototype.process_gateway_particles = function(dt) {
  for (var i = 0; i < this.gateway_particles.length; i++) {
    var particle = this.gateway_particles[i];
    particle.prop += dt / this.gateway_particle_duration;
    if (this.black_hole_timer < 0) {
      // double time!
      particle.prop += dt / this.gateway_particle_duration;
    }
  }
  for (var i = this.gateway_particles.length - 1; i >= 0; i--) {
    var particle = this.gateway_particles[i];
    if (particle.prop > 1) {
      this.gateway_particles.splice(i, 1);
    }
  }

  this.gateway_particle_gen_timer -= dt
  if (this.black_hole_timer < 0) {
    this.gateway_particle_gen_timer -= dt
  }

  if (this.gateway_particle_gen_timer < 0) {
    this.gateway_particle_gen_timer += this.gateway_particle_gen_interval
    this.generate_gateway_particles(this.body.GetPosition().x, this.body.GetPosition().y, this.gateway_particles_per_round)
  }
}

BossTwo.prototype.generate_gateway_particles = function(x, y, num_particles) {
  for (var i = 0; i < num_particles; i++) {
    var angle = Math.PI * 2 * i / num_particles + (Math.random() - 0.5) * Math.PI * 2 / num_particles
    this.gateway_particles.push({
      start_x: Math.cos(angle) * this.effective_radius * this.last_growth_factor * this.low_gravity_factor + x,
      start_y: Math.sin(angle) * this.effective_radius * this.last_growth_factor * this.low_gravity_factor + y,
      prop: 0
    });
  }
}

BossTwo.prototype.draw_gateway_particles = function(ctx, draw_factor) {
  var particle_shape = imp_params.impulse_enemy_stats[this.type].death_polygons[0];
  for(var i = 0; i < this.gateway_particles.length; i++) {
    var particle = this.gateway_particles[i];
    ctx.save()
    if (particle.prop < 0.25) {
      ctx.globalAlpha *= particle.prop * 4
    } else {
      var temp = (1 - particle.prop) / (0.75)
      ctx.globalAlpha *= temp
    }
    if (this.black_hole_timer >= 0) {
      ctx.globalAlpha *= 0.5;
    }
    var pointer_angle = _atan({x: particle.start_x, y: particle.start_y},
                              {x: this.body.GetPosition().x, y: this.body.GetPosition().y});
    var x = draw_factor * (particle.start_x * (1 - particle.prop) + this.body.GetPosition().x * particle.prop);
    var y = draw_factor * (particle.start_y * (1 - particle.prop) + this.body.GetPosition().y * particle.prop);
    draw_shape(ctx, x, y, particle_shape, 2, impulse_colors["world " + this.impulse_game_state.world_num + " bright"], 1, pointer_angle)
    ctx.restore()
  }
}

BossTwo.prototype.get_impulse_extra_factor = function() {
  if(imp_vars.player_data.difficulty_mode == "easy") {
    return this.impulse_extra_factor * 1.5;
  }
  return this.impulse_extra_factor;
}
