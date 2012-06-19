DeathRay.prototype = new Enemy()

DeathRay.prototype.constructor = DeathRay

function DeathRay(world, x, y, id, impulse_game_state) {
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
  this.turret_duration = 1000

  this.shoot_interval = 2000  //first 50% is nothing, second 50% is aiming

  this.shoot_duration = this.shoot_interval

  this.fire_interval = 200

  this.fire_duration = this.fire_interval

  this.ray_angle = null

  this.ray_radius = 3
  this.ray_buffer_radius = 3
  this.ray_polygon = []

  this.ray_force = 100

  this.aimed = false
  this.fired = false

  this.goalPt = null

}

DeathRay.prototype.additional_processing = function(dt) {
  
  if(this.safe != p_dist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius)
  {
    this.safe = !this.safe
    this.path = null
  }

  this.within_bounds = this.body.GetPosition().x >= this.interior_buffer && this.body.GetPosition().x <= canvasWidth/draw_factor - this.interior_buffer && this.body.GetPosition().y >= this.interior_buffer && this.body.GetPosition().y <= canvasHeight/draw_factor - this.interior_buffer
  this.special_mode = this.safe && this.within_bounds && this.status_duration[1] <= 0

  if(this.status_duration[1] > 0) {
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
    if(this.shoot_duration <= 0) {
      if(this.fire_duration <= 0) {
        this.shoot_duration = this.shoot_interval
        this.fire_duration = this.fire_interval
        this.aimed = false
        this.fired = false
        this.ray_angle = null
      }
      else {
        this.fire_duration = Math.max(this.fire_duration - dt, 0)
        if(this.fire_duration <= this.fire_interval/2 && !this.fired) {
          this.fired = true
          console.log("FIRED")
          if(pointInPolygon(this.ray_polygon, this.player.body.GetPosition())) {
            this.player.body.ApplyImpulse(new b2Vec2(this.ray_force * Math.cos(this.ray_angle), this.ray_force * Math.sin(this.ray_angle)), this.player.body.GetWorldCenter()) 
            this.impulse_game_state.reset_combo()
          }
          for(var i = 0; i < this.level.enemies.length; i++) {
            if(pointInPolygon(this.ray_polygon, this.level.enemies[i].body.GetPosition())) {
              this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.ray_force * Math.cos(this.ray_angle), this.ray_force * Math.sin(this.ray_angle)), this.player.body.GetWorldCenter()) 
            }
          }
        }
      }

    }
    else {
      this.shoot_duration = Math.max(this.shoot_duration - dt, 0)
      if(this.shoot_duration <= this.shoot_interval/2 && !this.aimed) {//if it hasn't been aimed, aim it now
        this.ray_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
        this.ray_polygon = []
        this.ray_polygon.push({x: this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle + Math.PI/2), y: this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle + Math.PI/2)})
        this.ray_polygon.push({x: this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle - Math.PI/2), y: this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle - Math.PI/2)})
        this.ray_polygon.push({x: this.body.GetPosition().x + 100 * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle - Math.PI/2), y: this.body.GetPosition().y + 100 * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle - Math.PI/2)})
        this.ray_polygon.push({x: this.body.GetPosition().x + 100 * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle + Math.PI/2), y: this.body.GetPosition().y + 100 * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle + Math.PI/2)})
        this.aimed = true
      }
    }
  }
}

DeathRay.prototype.player_hit_proc = function() {
}


DeathRay.prototype.get_target_point = function() {
  if(!this.safe) {
    this.goalPt = null
    return get_safe_point(this, this.player)
  }
  else {
    if(this.goalPt == null) {
      this.goalPt = getRandomCentralValidLocation({x: -10, y: -10})
    }
    return this.goalPt
  }
}

DeathRay.prototype.enemy_move = Enemy.prototype.move

DeathRay.prototype.move = function() {
  if(!this.safe && this.turret_timer == 0) {
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
      this.enemy_move()
    }
    else
      this.goalPt = null

  }

}

DeathRay.prototype.pre_draw = function(context, draw_factor) {
  if(this.turret_timer > 0) {
    var tp = this.body.GetPosition()
    context.beginPath()
    var prog = this.turret_timer
    context.lineWidth = Math.ceil(5 * prog)
    context.strokeStyle = this.color
    for(var i = 0; i < 6; i++) {
      context.moveTo((tp.x + this.effective_radius * Math.cos(Math.PI * i / 3 + this.body.GetAngle()))*draw_factor, (tp.y + this.effective_radius * Math.sin(Math.PI * i / 3 + this.body.GetAngle()))*draw_factor)
      context.lineTo((tp.x + this.effective_radius * (1 + 2 * prog) * Math.cos(Math.PI * i / 3 + this.body.GetAngle()))*draw_factor, (tp.y + this.effective_radius * (1 + 2 * prog) * Math.sin(Math.PI * i / 3 + this.body.GetAngle()))*draw_factor)
    }
    context.stroke()
  }
}

DeathRay.prototype.additional_drawing = function(context, draw_factor) {

  if(!this.aimed && this.turret_timer > 0)
  {
    context.beginPath()
    var ray_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
    context.moveTo((this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(ray_angle) + this.ray_radius * Math.cos(ray_angle + Math.PI/2))*draw_factor, (this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(ray_angle) + this.ray_radius * Math.sin(ray_angle + Math.PI/2))*draw_factor)
    context.lineTo((this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(ray_angle) + this.ray_radius * Math.cos(ray_angle - Math.PI/2))*draw_factor, (this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(ray_angle) + this.ray_radius * Math.sin(ray_angle - Math.PI/2))*draw_factor)
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

  if(this.shoot_duration <= this.shoot_interval/2 && this.ray_angle!= null) {
    var prog = 1 - this.shoot_duration / (this.shoot_interval/2)

    context.beginPath()
    context.globalAlpha = prog
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
      context.globalAlpha = 1
    }

  }
}

DeathRay.prototype.collide_with = function(other) {
//Death Rays do not die on collision
}
