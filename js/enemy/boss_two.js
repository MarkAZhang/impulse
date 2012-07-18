BossTwo.prototype = new Enemy()

BossTwo.prototype.constructor = BossTwo

BossTwo.prototype.is_boss = true

function BossTwo(world, x, y, id, impulse_game_state) {
  this.type = "second boss"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.do_yield = false

  this.safe = true

  this.arm_core_angle = Math.PI/2
  this.arm_width_angle = Math.PI/8
  this.arm_length = 50
  this.arm_taper = .9
  this.num_arms = 4

  this.arm_full_rotation = 15000

  this.spawn_interval = 7600
  this.spawn_duration = this.spawn_interval

  this.spawned = false

  this.body.SetAngle(Math.PI/2)

  this.visibility = 0

  this.dying_length = 2000

  this.explode_interval = 13400
  this.explode_timer = this.explode_interval - 1
  this.explode_duration = 500
  this.explode_force = 150
  this.explode_player_factor = 1

  this.red_visibility = 0

  this.spawned_harpoons = false

  this.body.SetLinearDamping(impulse_enemy_stats[this.type].lin_damp * 2)

  this.boss_force = 100

  this.boss_super_gravity_force = 5
  this.boss_extra_gravity_factor = 1

  this.high_gravity_factor = 1.25//.25
  this.med_gravity_factor = 2.5//1.5
  this.low_gravity_factor = 4//3

  this.high_f_incr = 0.016
  this.med_f_incr = 0.1
  this.low_f_incr = 0.2


  this.boss_high_gravity_force = 1.2
  this.boss_med_gravity_force = .4
  this.boss_low_gravity_force = .2

  this.small_exploding = false

  this.small_exploding_interval = 100
  this.small_exploding_duration = 0
  this.small_exploding_radius = this.effective_radius + 2
  this.small_exploding_force = 100

}

BossTwo.prototype.additional_processing = function(dt) {

  if(!this.spawned_harpoons) {
    this.spawned_harpoons = true
    var locs = [[1, 1], [canvasWidth/draw_factor-1, 1], [canvasWidth/draw_factor-1, (canvasHeight - topbarHeight)/draw_factor-1], [1, (canvasHeight - topbarHeight)/draw_factor-1]]
      for(var i = 0; i < locs.length; i++) {
        this.level.spawned_enemies.push(new FixedHarpoon(this.world, locs[i][0], locs[i][1], this.level.enemy_counter, this.impulse_game_state))
        this.level.enemy_counter +=1
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
    this.body.SetLinearDamping(impulse_enemy_stats[this.type].lin_damp)

  }

  if(this.small_exploding) {
    if(this.small_exploding_duration < 0) {
         
      this.small_exploding = false

    }
    else {
      this.small_exploding_duration -= dt
    }

  }

  this.arm_core_angle += Math.PI * 2 * dt / this.arm_full_rotation
  var polygons = this.get_arm_polygons()

    for(var i = 0; i < this.level.enemies.length; i++) {
      if (this.level.enemies[i].id == this.id || this.level.enemies[i] instanceof FixedHarpoon) continue
      var boss_angle = _atan(this.level.enemies[i].body.GetPosition(), this.body.GetPosition())
      var boss_dist = p_dist(this.level.enemies[i].body.GetPosition(), this.body.GetPosition())
      var inside = false
      for(var j = 0; j < polygons.length; j++) {
        if(pointInPolygon(polygons[j], this.level.enemies[i].body.GetPosition())) {
          inside = true
          break
        }
      }
      var gravity_force = 0

      if (boss_dist <= this.effective_radius * this.high_gravity_factor) {
        gravity_force = this.boss_high_gravity_force
      }
      else if (boss_dist <= this.effective_radius * this.med_gravity_factor) {
        gravity_force = this.boss_med_gravity_force
      }
      else if (boss_dist <= this.effective_radius * this.low_gravity_factor) {
        gravity_force = this.boss_low_gravity_force
      }
      
      if(inside) {
        if(gravity_force > 0)
          gravity_force *= 2
        else 
          gravity_force = .3
      }
      if(this.explode_timer < .175 * this.explode_interval)
        gravity_force *= this.boss_extra_gravity_factor
      if(gravity_force > 0)
        this.level.enemies[i].body.ApplyImpulse(new b2Vec2(gravity_force * Math.cos(boss_angle), gravity_force * Math.sin(boss_angle)), this.level.enemies[i].body.GetWorldCenter())
    }
    var boss_angle = _atan(this.player.body.GetPosition(), this.body.GetPosition())
    var boss_dist = p_dist(this.player.body.GetPosition(), this.body.GetPosition())
    for(var j = 0; j < polygons.length; j++) {
      if(pointInPolygon(polygons[j], this.player.body.GetPosition())) {
        inside = true
      }
    }
    var gravity_force = 0
    if (boss_dist <= this.effective_radius * this.high_gravity_factor) {
        gravity_force = this.boss_high_gravity_force
      }
      else if (boss_dist <= this.effective_radius * this.med_gravity_factor) {
        gravity_force = this.boss_med_gravity_force
      }
      else if (boss_dist <= this.effective_radius * this.low_gravity_factor) {
        gravity_force = this.boss_low_gravity_force
      }
      
      if(inside) {
        if(gravity_force > 0)
          gravity_force *= 2
        else 
          gravity_force = .3
      }
    if(this.explode_timer < .175 * this.explode_interval)
      gravity_force *= this.boss_extra_gravity_factor
    if(gravity_force > 0)
      this.player.body.ApplyImpulse(new b2Vec2(gravity_force *  Math.cos(boss_angle), gravity_force * Math.sin(boss_angle)), this.player.body.GetWorldCenter())

  if(this.explode_timer < -this.explode_duration) {
    this.explode()
    this.explode_timer = this.explode_interval
  }
  this.explode_timer -= dt

  if(this.explode_timer > .9 * this.explode_interval) {
    this.red_visibility = (this.explode_timer - .9 * this.explode_interval)/(.1 * this.explode_interval)
  }
  else if(this.explode_timer < .175 * this.explode_interval && this.explode_timer >= 0) {
    var temp = this.explode_timer
    while(temp > .05 * this.explode_interval) {temp -= .05 * this.explode_interval}

    this.red_visibility = temp > 0.025 * this.explode_interval ? (temp - 0.025 * this.explode_interval)/(0.025 * this.explode_interval) : (0.025*this.explode_interval - temp)/(0.025 * this.explode_interval)
  }
  else if(this.explode_timer < 0) {
    this.red_visibility = 1
  }

  
}

BossTwo.prototype.additional_drawing = function(context, draw_factor) {
  var polygons = this.get_arm_polygons()

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

  for(var j = 0; j < polygons.length; j++) {
    context.beginPath()
      
    context.moveTo(polygons[j][0].x*draw_factor, polygons[j][0].y*draw_factor)
    for(var i = 1; i < polygons[j].length; i++)
    {
      context.lineTo(polygons[j][i].x*draw_factor, polygons[j][i].y*draw_factor)
    }
    context.closePath()
    context.globalAlpha = this.visibility/2
    context.fillStyle = "gray"
    context.fill()
    context.globalAlpha = this.red_visibility/2
    context.fillStyle = "red"
    context.fill()
    context.globalAlpha = 1

  }

  if(this.small_exploding_duration > 0) {
    context.beginPath()
    context.strokeStyle = "red"
    context.lineWidth = 2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius + (this.small_exploding_radius - this.effective_radius)* (1 - this.small_exploding_duration/this.small_exploding_interval)) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
  }

  if(this.explode_timer >= 0) {
  context.beginPath()
  context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (Math.max(this.explode_timer, 0) / this.explode_interval), true)
  context.lineWidth = 2
  context.strokeStyle = "red"
  context.stroke()
  }
  else if(this.explode_timer < 0 && this.explode_timer >= -this.explode_duration) {
    context.beginPath()
    context.strokeStyle = this.color
    context.lineWidth = 2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.low_gravity_factor * (-this.explode_timer/this.explode_duration)) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
  }
  if(this.spawned) {
    context.beginPath()
    context.strokeStyle = "red"
    context.lineWidth = 2

    context.globalAlpha = .2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.low_gravity_factor) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.med_gravity_factor) * draw_factor, 0, 2*Math.PI, true)
    context.globalAlpha = .5
    context.stroke()
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.high_gravity_factor) * draw_factor, 0, 2*Math.PI, true)
    context.globalAlpha = 1
    context.stroke()
  }

}

BossTwo.prototype.get_arm_polygons = function() {
  var polygons = []
  for(var i = 0; i < this.num_arms; i++) {
    var polygon = []
    polygon.push({x: this.body.GetPosition().x, y: this.body.GetPosition().y})
    polygon.push({x: this.body.GetPosition().x + this.arm_length * this.arm_taper * Math.cos(Math.PI * 2 * i / this.num_arms + this.arm_core_angle - this.arm_width_angle/2), y: this.body.GetPosition().y + this.arm_length * this.arm_taper * Math.sin(Math.PI * 2 * i / this.num_arms + this.arm_core_angle - this.arm_width_angle/2)})
    polygon.push({x: this.body.GetPosition().x + this.arm_length * Math.cos(Math.PI * 2 * i / this.num_arms + this.arm_core_angle), y: this.body.GetPosition().y + this.arm_length * Math.sin(Math.PI * 2 * i / this.num_arms + this.arm_core_angle)})
    polygon.push({x: this.body.GetPosition().x + this.arm_length * this.arm_taper * Math.cos(Math.PI * 2 * i / this.num_arms + this.arm_core_angle + this.arm_width_angle/2), y: this.body.GetPosition().y + this.arm_length * this.arm_taper * Math.sin(Math.PI * 2 * i / this.num_arms + this.arm_core_angle + this.arm_width_angle/2)})
    polygons.push(polygon)
  }
  return polygons

}

BossTwo.prototype.move = function() {
  this.set_heading(this.player.body.GetPosition())
}

BossTwo.prototype.collide_with = function(other) {
  if(this.dying || !this.spawned)//ensures the collision effect only activates once
    return

  if(other === this.player) {
    this.impulse_game_state.reset_combo()
    if (!this.small_exploding) {
      this.small_exploding = true
      
      this.small_explode()
      this.small_exploding_duration = this.small_exploding_interval
    }
  }
  else if(other !== this.player) {
    if(!other.dying) {
      other.start_death("absorbed")
      this.low_gravity_factor += this.low_f_incr
      this.med_gravity_factor += this.med_f_incr
      this.high_gravity_factor += this.high_f_incr
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

BossTwo.prototype.explode = function() {
  console.log("EXPLODE! " + this.id)
  if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.effective_radius * this.low_gravity_factor)
  {
    var tank_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
    this.player.body.ApplyImpulse(new b2Vec2(this.explode_force * this.explode_player_factor * Math.cos(tank_angle), this.explode_force * this.explode_player_factor * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
  }

  for(var i = 0; i < this.level.enemies.length; i++)
  {

    if(this.level.enemies[i] !== this && p_dist(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) <= this.effective_radius * this.low_gravity_factor)
    {
      var _angle = _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition())
      this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.explode_force * Math.cos(_angle), this.explode_force * Math.sin(_angle)), this.level.enemies[i].body.GetWorldCenter())
      console.log("EXPLODE ON ENEMY "+i+" "+_angle)

    }
  }
}

BossTwo.prototype.small_explode = function() {
  for(var i = 0; i < this.level.enemies.length; i++) {
    if (this.level.enemies[i].id == this.id) continue

    if (p_dist(this.level.enemies[i].body.GetPosition(), this.body.GetPosition()) <= this.small_exploding_radius) {
      var boss_angle = _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition())
      this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.small_exploding_force* Math.cos(boss_angle), this.small_exploding_force * Math.sin(boss_angle)), this.level.enemies[i].body.GetWorldCenter())
    }
  }
  if (p_dist(this.player.body.GetPosition(), this.body.GetPosition()) <= this.small_exploding_radius) {
    var boss_angle = _atan(this.player.body.GetPosition(), this.body.GetPosition())
    this.player.body.ApplyImpulse(new b2Vec2(this.small_exploding_force* Math.cos(boss_angle), this.small_exploding_force * Math.sin(boss_angle)), this.player.body.GetWorldCenter())
  }
}

BossTwo.prototype.player_hit_proc = function() {
  var boss_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
  this.player.body.ApplyImpulse(new b2Vec2(this.boss_force * Math.cos(boss_angle), this.boss_force * Math.sin(boss_angle)), this.player.body.GetWorldCenter())
}
