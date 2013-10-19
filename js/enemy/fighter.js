Fighter.prototype = new Enemy()

Fighter.prototype.constructor = Fighter

function Fighter(world, x, y, id, impulse_game_state) {

  if(world === undefined) return

  this.type = "fighter"

  this.init(world, x, y, id, impulse_game_state)
  this.additional_statuses = ["frenzy"]
  if(world === null) return
  this.death_radius = 5

  this.shoot_interval = 1500
  this.frenzy_shoot_interval = 750

  this.shoot_durations = [this.shoot_interval, 2 * this.shoot_interval]
  this.shoot_fade_out_prop = 0.15 //percentage of shoot_interval
  this.shoot_fade_out = [false, false]

  this.do_yield = false

  this.safe_radius = 10

  this.safe_radius_buffer = 2

  this.fast_factor = 3

  this.has_sight_of_player = false

  this.safe = true

  this.shoot_loc_forward_length = this.effective_radius

  this.shoot_loc_side_length = this.effective_radius * 2

  this.frenzy_charge = 0

  this.frenzy_charge_interval = 2500

  this.frenzy_charge_bars = 5;

  this.fighter_status = "normal"

  this.detonate_timer = 50
  this.detonate_duration = 50
  this.death_delay = 200
  this.bomb_factor = 3

  this.activated = false

  this.tank_force = 100 //force that the fighter impulses the player
  this.cautious = false


}

Fighter.prototype.get_bullet_locations = function(side) {
  var other_angle = this.actual_heading + Math.PI/2 * ((side % 2) * 2 - 1)
  var bullet_start_loc_x = this.body.GetPosition().x + this.shoot_loc_side_length *  Math.cos(other_angle) + this.shoot_loc_forward_length * Math.cos(this.actual_heading)
  var bullet_start_loc_y = this.body.GetPosition().y + this.shoot_loc_side_length *  Math.sin(other_angle) + this.shoot_loc_forward_length * Math.sin(this.actual_heading)
  return {x: bullet_start_loc_x, y: bullet_start_loc_y};

}

Fighter.prototype.get_additional_color_for_status = function(status) {
}

Fighter.prototype.get_current_status = function() {

  if(!this.dying) {
      if(this.status_duration[0] > 0) {
        return 'stunned';
      } else if(this.fighter_status == "frenzy") {
        return "frenzy"
      } else if(this.color_silenced) {
        return 'silenced'
      } else if(this.status_duration[2] > 0) {
        return "gooed"
      }
      if(this.durations["impulsed"] > 0) {
        return "impulsed"
      }
    }

    return this.get_additional_current_status()
}

Fighter.prototype.additional_processing = function(dt) {

  if(this.fighter_status == "normal" && this.frenzy_charge >= this.frenzy_charge_bars) {
    this.fighter_status = "frenzy"

    this.shoot_durations = [this.frenzy_shoot_interval, this.frenzy_shoot_interval]
    this.color = "red"
    this.body.SetLinearDamping(imp_params.impulse_enemy_stats[this.type].lin_damp * 5)
  }

  if(this.fighter_status == "frenzy" && this.frenzy_charge < 0) {
    this.fighter_status = "normal"
    this.shoot_durations = [this.shoot_interval, this.shoot_interval * 2];
    this.color = imp_params.impulse_enemy_stats[this.type].color;
    this.body.SetLinearDamping(imp_params.impulse_enemy_stats[this.type].lin_damp)
  }

  for(var i = 0; i < this.shoot_durations.length; i++) {
    if(this.shoot_durations[i] <= 0 && !this.shoot_fade_out[i] && this.status_duration[1] <= 0) {

      if(check_bounds(0, this.body.GetPosition(), imp_vars.draw_factor)) {
        var cur_bullet_loc = this.get_bullet_locations(i);
        this.has_sight_of_player = isVisible(cur_bullet_loc, this.player.body.GetPosition(), this.level.obstacle_edges)

        var target_angle = _atan(cur_bullet_loc, this.player.body.GetPosition())
        if (this.has_sight_of_player) {
          this.shoot_durations[i] = this.fighter_status == "normal" ? (2 * this.shoot_interval) : this.frenzy_shoot_interval
          if(this.fighter_status == "frenzy") {
            this.frenzy_charge -= 0.5
            this.level.spawned_enemies.push(new PiercingFighterBullet(this.world, cur_bullet_loc.x, cur_bullet_loc.y, this.level.enemy_counter, this.impulse_game_state, target_angle, this.id ))
          }
          else {
            this.level.spawned_enemies.push(new FighterBullet(this.world, cur_bullet_loc.x, cur_bullet_loc.y, this.level.enemy_counter, this.impulse_game_state, target_angle, this.id ))
          }
          this.level.enemy_counter += 1
        } else {
          this.shoot_fade_out[i] = true
        }
      }
    }
    if(this.shoot_fade_out[i] && this.shoot_durations[i] < -this.shoot_fade_out_prop * 
      (this.fighter_status == "normal" ? this.shoot_interval : this.frenzy_shoot_interval)) {
      this.shoot_durations[i] = this.fighter_status == "normal" ? (2 * this.shoot_interval + this.shoot_durations[i]) : this.frenzy_shoot_interval
      this.shoot_fade_out[i] = false
    }
    if(check_bounds(0, this.body.GetPosition(), imp_vars.draw_factor)) {
      this.shoot_durations[i] -= dt
    }
  }
  

  if (this.fighter_status == "normal" && this.status_duration[1] <= 0 && this.frenzy_charge < this.frenzy_charge_bars && check_bounds(0, this.body.GetPosition(), imp_vars.draw_factor)) {
    this.frenzy_charge += dt / this.frenzy_charge_interval;
  }
}

Fighter.prototype.player_hit_proc = function() {
}

Fighter.prototype.additional_drawing = function(context, draw_factor) {
  if(!this.dying) {
    context.save();
    context.globalAlpha *= 0.7
    if(this.frenzy_charge > 0) {
      for(var i = 0; i < Math.floor(this.frenzy_charge); i++) {
        context.beginPath()
        context.arc(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor,
         this.effective_radius * 2 * draw_factor,
          Math.PI * 2 * (i+1) / this.frenzy_charge_bars - Math.PI/24, Math.PI * 2 * i / this.frenzy_charge_bars + Math.PI/24, true)
        /*context.arc((this.body.GetPosition().x + this.effective_radius * 2 * Math.cos(Math.PI * 2 * i / this.frenzy_charge_bars)) * draw_factor,
         (this.body.GetPosition().y + this.effective_radius * 2 * Math.sin(Math.PI * 2 * i / this.frenzy_charge_bars))*draw_factor,
       4, 0, 2 * Math.PI, true)*/
        context.strokeStyle = "red"
        context.lineWidth = 5;
        context.stroke()
      }
    }

    if(this.status_duration[1] <= 0 && this.frenzy_charge < this.frenzy_charge_bars) {
      i = Math.floor(this.frenzy_charge)
      var prop = this.frenzy_charge - i;
      context.beginPath()
      context.arc(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor,
        this.effective_radius * 2 * draw_factor,
        Math.PI * 2 * i / this.frenzy_charge_bars + Math.PI/24 + (2 * Math.PI/this.frenzy_charge_bars - Math.PI/12) * prop, Math.PI * 2 * i / this.frenzy_charge_bars + Math.PI/24, true)
      context.lineWidth = 5
      context.strokeStyle = "red"
      context.stroke()
    }

    context.restore();

    for(var i = 0; i < this.shoot_durations.length; i++) {
      var cur_bullet_loc = this.get_bullet_locations(i);
      var cur_interval = (this.fighter_status == "normal" ? this.shoot_interval : this.frenzy_shoot_interval)
      var loaded_prop = Math.max((cur_interval - this.shoot_durations[i])/(cur_interval), 0)
      // draw charging bullet.
      if (loaded_prop > 0 && loaded_prop < 1) {
        context.save()
        context.globalAlpha *= loaded_prop
        var bullet_type = this.fighter_status == "frenzy" ? "piercing_fighter_bullet" : "fighter_bullet"
        if (this.actual_heading)
          draw_enemy(context, bullet_type, cur_bullet_loc.x * draw_factor, cur_bullet_loc.y * draw_factor, null, this.actual_heading)
        else
          draw_enemy(context, bullet_type, cur_bullet_loc.x * draw_factor, cur_bullet_loc.y * draw_factor, null, this.body.GetAngle())   

        if(this.shoot_durations[i] > 0 && loaded_prop > 0) {
          context.beginPath()
          context.arc(cur_bullet_loc.x*draw_factor, cur_bullet_loc.y*draw_factor,
            (this.effective_radius*draw_factor) * 1, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * loaded_prop * 0.999)
          context.lineWidth = 2
          context.strokeStyle = this.color
          context.stroke()
        }    
        context.restore()
      // draw fading bullet
      } else if (this.shoot_durations[i] < 0) {
        var faded_prop = 1 - Math.min((loaded_prop - 1) / (this.shoot_fade_out_prop), 1);
        context.save()
        context.globalAlpha *= faded_prop
        var bullet_type = this.fighter_status == "frenzy" ? "piercing_fighter_bullet" : "fighter_bullet"
        if (this.actual_heading)
          draw_enemy(context, bullet_type, cur_bullet_loc.x * draw_factor, cur_bullet_loc.y * draw_factor, null, this.actual_heading)
        else
          draw_enemy(context, bullet_type, cur_bullet_loc.x * draw_factor, cur_bullet_loc.y * draw_factor, null, this.body.GetAngle())        
        context.beginPath()
        context.arc(cur_bullet_loc.x*draw_factor, cur_bullet_loc.y*draw_factor,
          (this.effective_radius*draw_factor) * 1, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * 0.999)
        context.lineWidth = 2
        context.strokeStyle = this.color
        context.stroke()
        context.restore()
      }
    }
  }

  if(this.activated && this.detonate_timer > 0)
  {
    context.beginPath()
    context.strokeStyle = this.color;
    context.lineWidth = 2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.bomb_factor * (1 - this.detonate_timer/this.detonate_duration)) * draw_factor, 0, 2*Math.PI * 0.999)
    context.stroke()
  }

}


Fighter.prototype.activated_processing = function(dt) {

}

Fighter.prototype.collide_with = function(other) {

//function for colliding with the player

  if(this.dying || this.activated)//ensures the collision effect only activates once
    return

  if(other === this.player) {

    if(this.status_duration[1] <= 0) {
      var tank_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
      this.player.body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
      //this.cause_of_death = "hit_player"
      this.impulse_game_state.reset_combo()
    }
  }
}


Fighter.prototype.silence = function(dur, color_silence) {
  if(color_silence) {
    this.color_silenced = true
  }
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
  for(var i = 0; i < this.shoot_durations.length; i++) {
    this.shoot_durations[i] = this.fighter_status == "normal" ? this.shoot_interval : this.frenzy_shoot_interval // reset shoot duration
  }
}

Fighter.prototype.get_color_for_status = function(status) {
  if(status == "normal") {
    return this.color
  } else if(status == "stunned") {
    return 'gray';
  } else if(status == "silenced") {
    return 'gray'
  } else if(status == "gooed") {
    return "#e6c43c"
  } else if(status == "frenzy") {
    return "red"
  } else if(status == "impulsed") {
    return impulse_colors["impulse_blue"]
  } else if(status == "white") {
    return "white"
  }

  return this.get_additional_color_for_status(status)
}

Fighter.prototype.modify_movement_vector = function(dir) {
  //apply impulse to move enemy
  var in_poly = false
  for(var i = 0; i < this.level.obstacle_polygons.length; i++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }
  if(in_poly)
  {
    dir.Multiply(this.slow_force)
  }
  else {
    if(this.fighter_status == "frenzy" && this.status_duration[1] <= 0 && !this.has_sight_of_player) {
      dir.Multiply(this.fast_factor)
    }

    if(this.status_duration[2] > 0) {
      dir.Multiply(this.slow_factor)
    }
    dir.Multiply(this.force)
  }
}

Fighter.prototype.explode = function() {
  if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.effective_radius * this.bomb_factor)
  {
    var tank_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
    this.player.body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
  }

  for(var i = 0; i < this.level.enemies.length; i++)
  {

    if(this.level.enemies[i] !== this && p_dist(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) <= this.effective_radius * this.bomb_factor)
    {
      var _angle = _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition())
      this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(_angle), this.tank_force * Math.sin(_angle)), this.level.enemies[i].body.GetWorldCenter())
      this.level.enemies[i].open(1500)

    }
  }
}

Fighter.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.process_hit();
}

Fighter.prototype.process_hit = function() {
  if(this.frenzy_charge > 0) {
    this.frenzy_charge -= 1;
  }
}

/*Fighter.prototype.draw_enemy_image_additional = function(context, color) {
  context.strokeStyle = color
  context.lineWidth = 2;
  //var this_angle = Math.PI/4
  var tp = {x: imp_params.impulse_enemy_stats[this.type].effective_radius * Enemy.prototype.enemy_canvas_factor * imp_vars.draw_factor , y: imp_params.impulse_enemy_stats[this.type].effective_radius* Enemy.prototype.enemy_canvas_factor * imp_vars.draw_factor}
  var vertices = [[Math.cos(Math.PI * 1/4) + 0.3, Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 1/2) + 0.3, Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/2) + 0.3, Math.sin(Math.PI * 7/4) * 1.1],
  [Math.cos(Math.PI * 7/4) + 0.3, Math.sin(Math.PI * 7/4) * 1.1]]
  context.beginPath()
  context.moveTo(tp.x + vertices[0][0] * imp_vars.draw_factor * 0.7, tp.y + Math.sin(Math.PI * 1/4) + vertices[0][1] * imp_vars.draw_factor* 0.7)
  context.lineTo(tp.x + vertices[1][0] * imp_vars.draw_factor* 0.7, tp.y + Math.sin(Math.PI * 1/4) + vertices[1][1] * imp_vars.draw_factor* 0.7)
  context.lineTo(tp.x + vertices[2][0] * imp_vars.draw_factor* 0.7, tp.y + Math.sin(Math.PI * 1/4) + vertices[2][1] * imp_vars.draw_factor* 0.7)
  context.lineTo(tp.x + vertices[3][0] * imp_vars.draw_factor* 0.7, tp.y + Math.sin(Math.PI * 1/4) + vertices[3][1] * imp_vars.draw_factor* 0.7)
  context.closePath()
  context.fillStyle = color
  context.fill()
}*/