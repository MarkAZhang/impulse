DeathRay.prototype = new Enemy()

DeathRay.prototype.constructor = DeathRay

function DeathRay(world, x, y, id, impulse_game_state) {
  if(!world) return
  this.type = "deathray"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.do_yield = false

  this.safe_radius = 10

  this.safe_radius_buffer = 2 //prevents the Death Ray from immediately toggling between running away and running towards

  this.interior_buffer = 5
  this.safe = true
  this.within_bounds = false

  this.turret_mode = false
  this.turret_timer = 0 //1 indicates ready to fire, 0 indicates ready to move
  this.turret_duration = 2500

  this.shoot_interval = 2000

  this.shoot_duration = this.shoot_interval

  this.aim_proportion = .56

  this.fire_interval = 200

  this.fire_duration = this.fire_interval

  this.ray_angle = null

  this.ray_radius = 3
  this.ray_buffer_radius = 3
  this.ray_polygon = []

  this.ray_force = 200

  this.turret_arm_angle = 0

  this.aimed = false
  this.fired = false

  this.goalPt = null

  this.ray_size = 100

  this.default_heading = false

  this.spin_rate = 4000

  this.impulse_extra_factor = 10


}

DeathRay.prototype.additional_processing = function(dt) {

  if(!this.turret_mode && this.turret_timer <= 0) {
    this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)
  } else if(this.turret_mode && this.turret_timer >= 1) {
    this.body.SetAngle(_atan(this.body.GetPosition(), this.player.body.GetPosition()))
  } else if(this.turret_mode){
    this.turret_arm_angle = this.body.GetAngle();
  }

  if(this.safe != p_dist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius)
  {
    this.safe = !this.safe
    this.path = null
  }

  this.within_bounds = check_bounds(this.interior_buffer, this.body.GetPosition(), draw_factor)
  this.special_mode = this.safe && this.within_bounds && this.status_duration[1] <= 0

  if(this.status_duration[1] > 0) {
    this.shoot_duration = this.shoot_interval
    this.fire_duration = this.fire_interval
    this.aimed = false
    this.fired = false
    return
  }

  this.turret_mode = this.safe && this.within_bounds

  if(!this.turret_mode) {
    this.shoot_duration = this.shoot_interval
    this.fire_duration = this.fire_interval
    this.aimed = false
    this.fired = false
  }

  if(this.turret_mode && this.turret_timer < 1)
  {
    this.turret_timer = Math.min(this.turret_timer + dt/this.turret_duration, 1)
  }
  else if(!this.turret_mode && this.turret_timer > 0)
  {
    this.turret_timer = Math.max(this.turret_timer - dt/this.turret_duration, 0)
  }

  if(this.turret_timer == 1) {
    //ready to shoot
    if(this.shoot_duration <= 0) {

      if(this.fire_duration <= 0) {
        //reset everything
        this.shoot_duration = this.shoot_interval
        this.fire_duration = this.fire_interval
        this.aimed = false
        this.fired = false
        this.ray_angle = null
      }
      else {
        this.fire_duration = Math.max(this.fire_duration - dt, 0)
        //fire the ray
        if(this.fire_duration <= this.fire_interval/2 && !this.fired) {
          this.fired = true
          if(pointInPolygon(this.ray_polygon, this.player.body.GetPosition())) {
            this.player.body.ApplyImpulse(new b2Vec2(this.ray_force * Math.cos(this.ray_angle), this.ray_force * Math.sin(this.ray_angle)), this.player.body.GetWorldCenter())
            this.impulse_game_state.reset_combo()
          }
          for(var i = 0; i < this.level.enemies.length; i++) {
            if(pointInPolygon(this.ray_polygon, this.level.enemies[i].body.GetPosition())) {
              this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.ray_force * Math.cos(this.ray_angle), this.ray_force * Math.sin(this.ray_angle)), this.level.enemies[i].body.GetWorldCenter())
              this.level.enemies[i].open(1500)
            }
          }
        }
      }

    }
    else {

      this.shoot_duration = Math.max(this.shoot_duration - dt, 0)
      if(this.shoot_duration <= this.shoot_interval* this.aim_proportion && !this.aimed) {//if it hasn't been aimed, aim it now
        this.ray_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
        this.ray_polygon = []
        this.ray_polygon.push({x: this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle + Math.PI/2),
         y: this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle + Math.PI/2)})
        this.ray_polygon.push({x: this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle - Math.PI/2),
          y: this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle - Math.PI/2)})
        this.ray_polygon.push({x: this.body.GetPosition().x + this.ray_size * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle - Math.PI/2),
         y: this.body.GetPosition().y + this.ray_size * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle - Math.PI/2)})
        this.ray_polygon.push({x: this.body.GetPosition().x + this.ray_size * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle + Math.PI/2),
         y: this.body.GetPosition().y + this.ray_size * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle + Math.PI/2)})
        this.aimed = true
      }
    }
  }
}

DeathRay.prototype.player_hit_proc = function() {
}

DeathRay.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
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
    return {x: point.x/draw_factor, y: point.y/draw_factor}
  }
  else {
    if(this.goalPt == null) {
      this.goalPt = {x: this.level.player_loc.x/draw_factor, y: this.level.player_loc.y/draw_factor}//getRandomCentralValidLocation({x: -10, y: -10})
    }
    return this.goalPt
  }
}

DeathRay.prototype.enemy_move = Enemy.prototype.move

DeathRay.prototype.move = function() {
  if(!this.safe && this.turret_timer == 0) {
    if(this.path == null) {
      this.pathfinding_counter = 2 * this.pathfinding_delay
    }
    this.goalPt = null
    this.enemy_move()
  }
  else
  {
    if(this.within_bounds)
    {//within bounds
      this.path = null
      this.goalPt = null
    }
    else if(p_dist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius + this.safe_radius_buffer)
    {
      if(this.path == null) {
        this.pathfinding_counter = 2 * this.pathfinding_delay
      }
      this.enemy_move()
    }
    else
      this.goalPt = null

  }

}

DeathRay.prototype.pre_draw = function(context, draw_factor) {



  if(this.turret_timer > 0) {
    var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
    context.save()
    context.globalAlpha *= (1-prog)
    context.shadowBlur = 0
    var tp = this.body.GetPosition()
    var prog = this.turret_timer
    context.fillStyle= this.get_current_color_with_status(this.interior_color)

    // draw the arms

    for(var i = 0; i < 8; i++) {
      var angle = this.turret_arm_angle + Math.PI * i / 4;
      context.beginPath()

      var turret_arm_radius = 0.5;

      context.moveTo((tp.x + this.effective_radius * Math.cos(angle) + turret_arm_radius * Math.cos(angle + Math.PI/2))*draw_factor,
        (tp.y + this.effective_radius * Math.sin(angle)  + turret_arm_radius * Math.sin(angle + Math.PI/2))*draw_factor)
      context.lineTo((tp.x + this.effective_radius * Math.cos(angle) + turret_arm_radius * Math.cos(angle - Math.PI/2))*draw_factor,
        (tp.y + this.effective_radius * Math.sin(angle)  + turret_arm_radius * Math.sin(angle - Math.PI/2))*draw_factor)
      context.lineTo((tp.x + this.effective_radius * (1 + prog) * Math.cos(angle) + 0.5 * turret_arm_radius * Math.cos(angle - Math.PI/2))*draw_factor,
        (tp.y + this.effective_radius * (1 + prog) * Math.sin(angle)  + 0.5 * turret_arm_radius * Math.sin(angle - Math.PI/2))*draw_factor)
      context.lineTo((tp.x + this.effective_radius * (1 + prog) * Math.cos(angle) + 0.5 * turret_arm_radius * Math.cos(angle + Math.PI/2))*draw_factor,
        (tp.y + this.effective_radius * (1 + prog) * Math.sin(angle)  + 0.5 * turret_arm_radius * Math.sin(angle + Math.PI/2))*draw_factor)
      context.closePath()
      context.save();
      context.globalAlpha *= 0.7;
      context.fill()
      context.restore();
      context.strokeStyle = "#ddd"//context.fillStyle
      context.stroke();
    }
    context.restore()
  }
}

DeathRay.prototype.additional_drawing = function(context, draw_factor) {


  if(this.status_duration[1] <= 0) {
    var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
    context.save()
    context.globalAlpha *= (1-prog)
    if(!this.aimed && this.turret_timer > 0)
    {
      //this part takes care of the "aimer"
      context.beginPath()
      var ray_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
      context.moveTo((this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(ray_angle) + this.ray_radius * Math.cos(ray_angle + Math.PI/2))*draw_factor,
       (this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(ray_angle) + this.ray_radius * Math.sin(ray_angle + Math.PI/2))*draw_factor)
      context.lineTo((this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(ray_angle) + this.ray_radius * Math.cos(ray_angle - Math.PI/2))*draw_factor,
        (this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(ray_angle) + this.ray_radius * Math.sin(ray_angle - Math.PI/2))*draw_factor)
      context.strokeStyle = this.color
      context.lineWidth = Math.ceil(5 * this.turret_timer/2)
      context.stroke()
    }
    else if(this.turret_timer > 0){
      context.beginPath()
      context.moveTo(this.ray_polygon[0].x * draw_factor, this.ray_polygon[0].y * draw_factor)
      context.lineTo(this.ray_polygon[1].x * draw_factor, this.ray_polygon[1].y * draw_factor)
      context.strokeStyle = this.color
      context.lineWidth = Math.ceil(5 * this.turret_timer/2)
      context.stroke()
    }

    if(this.shoot_duration <= this.shoot_interval * this.aim_proportion && this.ray_angle!= null) {
      var prog = 1 - this.shoot_duration / (this.shoot_interval * this.aim_proportion)
      context.save();
      context.beginPath()
      context.globalAlpha = Math.max(prog, .2)
      context.moveTo(this.ray_polygon[1].x * draw_factor, this.ray_polygon[1].y * draw_factor)
      context.lineTo(this.ray_polygon[2].x * draw_factor, this.ray_polygon[2].y * draw_factor)
      context.moveTo(this.ray_polygon[3].x * draw_factor, this.ray_polygon[3].y * draw_factor)
      context.lineTo(this.ray_polygon[0].x * draw_factor, this.ray_polygon[0].y * draw_factor)
      context.lineWidth = 1
      context.strokeStyle = this.color
      context.stroke()

      if(this.fire_duration < this.fire_interval) {

        var vis = this.fire_duration > this.fire_interval/2 ? this.fire_interval - this.fire_duration : this.fire_duration
        vis /= (this.fire_interval/2)
        context.globalAlpha = vis

        context.beginPath()

        context.moveTo(this.ray_polygon[0].x * draw_factor, this.ray_polygon[0].y * draw_factor)

        for(var i = 1; i < this.ray_polygon.length; i++)
        {
          context.lineTo(this.ray_polygon[i].x * draw_factor, this.ray_polygon[i].y * draw_factor)
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

DeathRay.prototype.collide_with = function(other) {
//Death Rays do not die on collision
}
