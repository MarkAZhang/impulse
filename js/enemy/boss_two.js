BossTwo.prototype = new Enemy()

BossTwo.prototype.constructor = BossTwo

BossTwo.prototype.is_boss = true

function BossTwo(world, x, y, id, impulse_game_state) {
  this.type = "second boss"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.shoot_interval = 750

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

  this.bullet_alternater = 0

  this.safe = true

  this.arm_core_angle = Math.PI/2
  this.arm_width_angle = Math.PI/8
  this.arm_length = 20
  this.arm_taper = .9
  this.num_arms = 4

  this.arm_full_rotation = 15000

  this.spawn_interval = 5000
  this.spawn_duration = this.spawn_interval

  this.spawned = false

  this.body.SetAngle(Math.PI/2)

  this.visibility = 0

  this.explode_interval = 10000
  this.explode_timer = this.explode_interval - 1
  this.explode_duration = 500
  this.explode_factor = 7
  this.explode_force = 90
  this.explode_player_factor = 1

  this.red_visibility = 0

  this.spawned_harpoons = false

}

BossTwo.prototype.additional_processing = function(dt) {

  if(!this.spawned_harpoons) {
    this.spawned_harpoons = true
    if(this.impulse_game_state.game_numbers.seconds < 5) {
      var locs = [[1, 1], [canvasWidth/draw_factor-1, 1], [canvasWidth/draw_factor-1, canvasHeight/draw_factor-1], [1, canvasHeight/draw_factor-1]]
      for(var i = 0; i < locs.length; i++) {
        this.level.spawned_enemies.push(new FixedHarpoon(this.world, locs[i][0], locs[i][1], this.level.enemy_counter, this.impulse_game_state))
        this.level.enemy_counter +=1
      }
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
  }

  this.arm_core_angle += Math.PI * 2 * dt / this.arm_full_rotation
  var polygons = this.get_arm_polygons()

  for(var j = 0; j < polygons.length; j++) {
    if(pointInPolygon(polygons[j], this.player.body.GetPosition())) {
      this.player.silence(100)
    }
  }

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
      
      context.moveTo((tp.x+this.points[0].x)*draw_factor, (tp.y+this.points[0].y)*draw_factor)
      for(var i = 1; i < this.points.length; i++)
      {
        context.lineTo((tp.x+this.points[i].x)*draw_factor, (tp.y+this.points[i].y)*draw_factor)
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
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.explode_factor * (-this.explode_timer/this.explode_duration)) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
  }
  if(this.spawned) {
    context.beginPath()
    context.strokeStyle = "red"
    context.globalAlpha = .2
    context.lineWidth = 2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.explode_factor) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
    context.globalAlpha = 1
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

BossTwo.prototype.collide_with = function() {

}

BossTwo.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.points.length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add(this.points[i])
    ans.push(temp)
  }
  return ans
}

BossTwo.prototype.explode = function() {
  console.log("EXPLODE! " + this.id)
  if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.effective_radius * this.explode_factor)
  {
    var tank_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
    this.player.body.ApplyImpulse(new b2Vec2(this.explode_force * this.explode_player_factor * Math.cos(tank_angle), this.explode_force * this.explode_player_factor * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
  }

  for(var i = 0; i < this.level.enemies.length; i++)
  {

    if(this.level.enemies[i] !== this && p_dist(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) <= this.effective_radius * this.explode_factor)
    {
      var _angle = _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition())
      this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.explode_force * Math.cos(_angle), this.explode_force * Math.sin(_angle)), this.level.enemies[i].body.GetWorldCenter())
      console.log("EXPLODE ON ENEMY "+i+" "+_angle)

    }
  }
}
