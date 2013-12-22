DeathRay.prototype = new Enemy()

DeathRay.prototype.constructor = DeathRay

function DeathRay(world, x, y, id, impulse_game_state) {
  if(world === undefined) return
  this.type = "deathray"

  this.init(world, x, y, id, impulse_game_state)
  if(world === null) return

  //this.special_mode = false

  this.do_yield = false

  this.safe_radius = 10

  this.safe_radius_buffer = 2 //prevents the Death Ray from immediately toggling between running away and running towards

  this.interior_buffer = 5
  this.safe = true
  this.within_bounds = false

  /*this.turret_mode = false
  this.turret_timer = 0 //1 indicates ready to fire, 0 indicates ready to move
  this.turret_duration = 2500*/

  this.shoot_interval = 1600

  this.shoot_duration = this.shoot_interval

  this.aim_proportion = .56

  this.fire_interval = 200

  this.fire_duration = this.fire_interval

  this.ray_angle = null

  this.ray_radius = 0.8
  this.ray_buffer_radius = -0.5

  this.ray_force = 400

  this.turret_arm_angle = 0

  this.stun_length = 1000

  this.aimed = false
  this.fired = false

  this.goalPt = null

  this.ray_size = 100
  this.ray_spread = Math.PI/48

  this.default_heading = false

  this.impulse_extra_factor = 3

  this.tank_force = 100
}

DeathRay.prototype.stun = function(dur) {
  this.status_duration[0] = Math.max(dur, this.status_duration[0]) //so that a short stun does not shorten a long stun
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
  this.recovery_timer = dur
  this.recovery_interval = dur
}

DeathRay.prototype.additional_processing = function(dt) {

  //if(!this.turret_mode && this.turret_timer <= 0) {
  //  this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)
  //} else if(this.turret_mode && this.turret_timer >= 1) {
    
  //} else if(this.turret_mode){
  //  this.turret_arm_angle = this.body.GetAngle();
  //}

  if(this.aimed) {
    this.set_heading(this.ray_angle)
  } else 
    this.set_heading(_atan(this.body.GetPosition(), this.player.body.GetPosition()))

  if(this.safe != p_dist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius)
  {
    this.safe = !this.safe
  }

  if(this.destroyable_timer > 0) {
    this.destroyable_timer -= dt
  }

  this.within_bounds = check_bounds(this.interior_buffer, this.body.GetPosition(), imp_vars.draw_factor)
  //this.special_mode = this.safe && this.within_bounds && this.status_duration[1] <= 0

  if (this.recovery_timer > 0) {
    this.recovery_timer -= dt
  }
  if(this.status_duration[1] > 0) {
    this.reset_ray()
    return
  }


  //this.turret_mode = this.safe && this.within_bounds

  /*if(!this.turret_mode) {
    this.shoot_duration = this.shoot_interval
    this.fire_duration = this.fire_interval
    this.aimed = false
    this.fired = false
  }*/

  /*if(this.turret_mode && this.turret_timer < 1)
  {
    this.turret_timer = Math.min(this.turret_timer + dt/this.turret_duration, 1)
  }
  else if(!this.turret_mode && this.turret_timer > 0)
  {
    this.turret_timer = Math.max(this.turret_timer - dt/this.turret_duration, 0)
  }*/

  //ready to shoot
  if(this.shoot_duration <= 0) {

    if(this.fire_duration <= 0) {
      //reset everything
      this.reset_ray()
      this.stun(this.stun_length)
    }
    else {
      this.fire_duration = Math.max(this.fire_duration - dt, 0)
      //fire the ray
      if(this.fire_duration <= this.fire_interval/2 && !this.fired) {
        var ray_polygon = this.get_ray_polygon()
        this.fired = true
        if(pointInPolygon(ray_polygon, this.player.body.GetPosition())) {
          var factor = 1
          if(this.player.status_duration[5] > 0 && !this.player.ultimate) {
            factor *= 10
          }
          if(this.player.status_duration[2] > 0) {
            factor *= 0.25
          }
          this.player.body.ApplyImpulse(new b2Vec2(factor * this.ray_force * Math.cos(this.ray_angle), factor * this.ray_force * Math.sin(this.ray_angle)), this.player.body.GetWorldCenter())
          this.impulse_game_state.reset_combo()
        }
        for(var i = 0; i < this.level.enemies.length; i++) {
          if(this.level.enemies[i] != this && pointInPolygon(ray_polygon, this.level.enemies[i].body.GetPosition())) {
            if(this.level.enemies[i].type == "orbiter") {
              this.level.enemies[i].weaken()
            }
            this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.ray_force * Math.cos(this.ray_angle), this.ray_force * Math.sin(this.ray_angle)), this.level.enemies[i].body.GetWorldCenter())
            this.level.enemies[i].open(2500)
          }
        }
      }
    }

  }
  else if(this.within_bounds && !this.moving) {
    this.shoot_duration = Math.max(this.shoot_duration - dt, 0)
    if(this.shoot_duration <= this.shoot_interval* this.aim_proportion && !this.aimed) {//if it hasn't been aimed, aim it now
      this.aim_ray()
    }
  }
}

DeathRay.prototype.additional_drawing = function(context, draw_factor) {
  if(this.recovery_timer > 0 && !this.dying) {
    draw_prog_circle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.effective_radius, 1 - this.recovery_timer/this.recovery_interval, "#444444")
  }
}


DeathRay.prototype.reset_ray = function() {
  this.shoot_duration = this.shoot_interval
  this.fire_duration = this.fire_interval
  this.aimed = false
  this.fired = false
  this.ray_angle = null
}

DeathRay.prototype.aim_ray = function() {
  this.ray_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
  this.shoot_duration = this.shoot_interval * this.aim_proportion
  

/*  this.ray_polygon.push({x: this.body.GetPosition().x + this.ray_size * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle - Math.PI/2),
   y: this.body.GetPosition().y + this.ray_size * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle - Math.PI/2)})
  this.ray_polygon.push({x: this.body.GetPosition().x + this.ray_size * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle + Math.PI/2),
   y: this.body.GetPosition().y + this.ray_size * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle + Math.PI/2)})*/
  this.aimed = true
}

DeathRay.prototype.get_ray_polygon = function() {
  var ray_polygon = []
  ray_polygon.push({x: this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle + Math.PI/2),
   y: this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle + Math.PI/2)})
  ray_polygon.push({x: this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle - Math.PI/2),
    y: this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle - Math.PI/2)})
  ray_polygon.push({x: ray_polygon[1].x + this.ray_size * Math.cos(this.ray_angle - this.ray_spread),
    y: ray_polygon[1].y + this.ray_size * Math.sin(this.ray_angle - this.ray_spread)
  })
  ray_polygon.push({x: ray_polygon[0].x + this.ray_size * Math.cos(this.ray_angle + this.ray_spread),
    y: ray_polygon[0].y + this.ray_size * Math.sin(this.ray_angle + this.ray_spread)
  })
  return ray_polygon
}

DeathRay.prototype.player_hit_proc = function() {
}

DeathRay.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle, ultimate) {
  if (this.ultimate)
    this.open(this.open_period)
  this.body.ApplyImpulse(new b2Vec2(this.impulse_extra_factor * impulse_force*Math.cos(hit_angle), this.impulse_extra_factor * impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
  this.durations["impulsed"] += this.impulsed_duration
  this.process_impulse_specific(attack_loc, impulse_force, hit_angle)

}

DeathRay.prototype.get_target_point = function() {
  if(!this.safe) {
    this.goalPt = null
    var point = get_nearest_spawn_point(this, this.player, this.impulse_game_state.level_name)
    return {x: point.x/imp_vars.draw_factor, y: point.y/imp_vars.draw_factor}
  }
  else {
    if(this.goalPt == null) {
      this.goalPt = {x: this.level.player_loc.x/imp_vars.draw_factor, y: this.level.player_loc.y/imp_vars.draw_factor}//getRandomCentralValidLocation({x: -10, y: -10})
    }
    return this.goalPt
  }
}

DeathRay.prototype.enemy_move = Enemy.prototype.move

DeathRay.prototype.move = function() {
  if(this.aimed) return // cannot move if aimed
    
  if(!this.safe) {// && this.turret_timer == 0) {
    if(this.path == null) {
      this.pathfinding_counter = 2 * this.pathfinding_delay
    }
    this.goalPt = null
    this.enemy_move()
    this.moving = true
  }
  else
  {
    if(this.within_bounds)
    {//within bounds
      this.path = null
      this.goalPt = null
      this.moving = false
    }
    else if(p_dist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius + this.safe_radius_buffer)
    {
      if(this.path == null) {
        this.pathfinding_counter = 2 * this.pathfinding_delay
      }
      this.enemy_move()
      this.moving = true
    }
    else
      this.goalPt = null

  }

}

DeathRay.prototype.pre_draw = function(context, draw_factor) {


  if(this.status_duration[1] <= 0) {
    var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
    context.save()
    context.globalAlpha *= (1-prog)
    /*if(!this.aimed)// && this.turret_timer > 0)
    {
      //this part takes care of the "aimer"
      context.beginPath()
      var ray_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
      context.moveTo((this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(ray_angle) + this.ray_radius * Math.cos(ray_angle + Math.PI/2))*draw_factor,
       (this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(ray_angle) + this.ray_radius * Math.sin(ray_angle + Math.PI/2))*draw_factor)
      context.lineTo((this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(ray_angle) + this.ray_radius * Math.cos(ray_angle - Math.PI/2))*draw_factor,
        (this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(ray_angle) + this.ray_radius * Math.sin(ray_angle - Math.PI/2))*draw_factor)
      context.strokeStyle = this.color
      //context.lineWidth = Math.ceil(5 * this.turret_timer/2)
      context.stroke()
    }
    else {//if(this.turret_timer > 0){
      context.beginPath()
      context.moveTo(this.ray_polygon[0].x * draw_factor, this.ray_polygon[0].y * draw_factor)
      context.lineTo(this.ray_polygon[1].x * draw_factor, this.ray_polygon[1].y * draw_factor)
      context.strokeStyle = this.color
      //context.lineWidth = Math.ceil(5 * this.turret_timer/2)
      context.stroke()
    }*/

    var ray_polygon = this.get_ray_polygon()

    if(this.shoot_duration <= this.shoot_interval * this.aim_proportion && this.ray_angle!= null) {
      var prog = 1 - this.shoot_duration / (this.shoot_interval * this.aim_proportion)
      context.save();
      context.beginPath()
      context.globalAlpha = Math.max(prog, .2)
      context.moveTo(ray_polygon[1].x * draw_factor, ray_polygon[1].y * draw_factor)
      context.lineTo(ray_polygon[2].x * draw_factor, ray_polygon[2].y * draw_factor)
      context.moveTo(ray_polygon[3].x * draw_factor, ray_polygon[3].y * draw_factor)
      context.lineTo(ray_polygon[0].x * draw_factor, ray_polygon[0].y * draw_factor)
      context.lineWidth = 1
      context.strokeStyle = this.color
      context.stroke()

      if(this.fire_duration < this.fire_interval) {

        var vis = this.fire_duration > this.fire_interval/2 ? this.fire_interval - this.fire_duration : this.fire_duration
        vis /= (this.fire_interval/2)
        context.globalAlpha = vis

        context.beginPath()

        context.moveTo(ray_polygon[0].x * draw_factor, ray_polygon[0].y * draw_factor)

        for(var i = 1; i < ray_polygon.length; i++)
        {
          context.lineTo(ray_polygon[i].x * draw_factor, ray_polygon[i].y * draw_factor)
        }
        context.closePath()
        context.fillStyle = this.color
        context.fill()
      }
      context.restore();
    }
    context.restore()

  }
}

DeathRay.prototype.get_color_for_status = function(status) {
  if(status == "normal") {
    return this.color ? this.color : null
  } else if(status == "stunned") {
    return '#444444';
  } else if(status == "silenced") {
    return 'gray'
  } else if(status == "gooed") {
    return "#e6c43c"
  } else if(status == "impulsed") {
    return this.impulsed_color
  } else if(status == "white") {
    return "white"
  } else if(status.slice(0, 5) == "world") {
    return impulse_colors["world "+status.slice(5,6)+" lite"]
  }

  return this.get_additional_color_for_status(status)
}

DeathRay.prototype.silence = function(dur, color_silence) {
  if(color_silence) {
    this.color_silenced = true
  }
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
}

DeathRay.prototype.collide_with = function(other) {
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
//Death Rays do not die on collision
}
