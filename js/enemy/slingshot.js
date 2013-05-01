Slingshot.prototype = new Enemy()

Slingshot.prototype.constructor = Slingshot

function Slingshot(world, x, y, id, impulse_game_state) {
  this.type = "slingshot"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.slingshot_force = 30 //force that the spear impulses the player

  this.death_radius = 5

  this.do_yield = false

  this.real_color = this.color

  this.slingshot_mode = false
  this.slingshot_point = null
  this.slingshot_duration = 0
  this.slingshot_interval = 100
  this.slingshot_multiplier = 1
  this.empowered_duration = 0
  this.empowered_interval = 700

  this.empowered_force = 100

  this.cautious = false

}

Slingshot.prototype.enemy_move = Enemy.prototype.move

Slingshot.prototype.move = function() {
  if(this.slingshot_mode) {
    if(this.status_duration[0] <= 0) {
      var dir = new b2Vec2(this.slingshot_point.x - this.body.GetPosition().x, this.slingshot_point.y - this.body.GetPosition().y)
      dir.Multiply(this.slingshot_multiplier)
      if(this.status_duration[2] > 0)
        dir.Multiply(this.slow_factor)
      this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

      var heading = _atan(this.body.GetPosition(), this.slingshot_point)
      this.body.SetAngle(heading)
    }
  }
  else {
    this.enemy_move()
  }
}

Slingshot.prototype.additional_processing = function(dt) {

  if(this.slingshot_mode && (this.slingshot_duration <= 0 && p_dist(this.slingshot_point, this.body.GetPosition()) < 1) || this.status_duration[1] > 0) {
    this.slingshot_mode = false
    this.body.SetLinearDamping(6)
  }

  this.special_mode = this.empowered_duration > 0

  this.color = this.empowered_duration > 0 ? "red" : this.real_color

  if(this.slingshot_duration > 0)
  {
    this.slingshot_duration -= dt
  }

  if(this.empowered_duration > 0)
  {
    this.empowered_duration -= dt
  }
}

Slingshot.prototype.player_hit_proc = function() {

  var spear_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
  var a = new b2Vec2(Math.cos(spear_angle), Math.sin(spear_angle))
  if(this.empowered_duration > 0)
  {
    a.Multiply(this.empowered_force)
  }
  else
  {
    a.Multiply(this.slingshot_force)
  }
  this.player.body.ApplyImpulse(a, this.player.body.GetWorldCenter())

}

Slingshot.prototype.check_death = function() {

  if (this.durations["open"] <= 0) {
    return
  }
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")
      this.body.SetLinearDamping(6)
      return
    }
  }

}

Slingshot.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {

  if(this.status_duration[1] <= 0) {
    this.slingshot_point = this.body.GetPosition().Copy()
    this.slingshot_mode = true
    this.slingshot_duration = this.slingshot_interval
    this.empowered_duration = this.empowered_interval
    this.body.SetLinearDamping(1)
  }
}

Slingshot.prototype.get_slingshot_hooks = function(hook) {

  var angle = this.body.GetAngle() + Math.PI * 2/3 * hook;
  return {x: this.body.GetPosition().x + Math.cos(angle) * this.effective_radius * 3/4,  y: this.body.GetPosition().y + Math.sin(angle) * this.effective_radius * 3/4}
}

Slingshot.prototype.additional_drawing = function(context, draw_factor) {
  if(this.slingshot_mode) {
    context.beginPath()
    context.strokeStyle = this.color
    context.lineWidth = 2
    context.moveTo(this.slingshot_point.x * draw_factor, this.slingshot_point.y * draw_factor)
    var point_one = this.get_slingshot_hooks(1)
    context.lineTo(point_one.x * draw_factor, point_one.y * draw_factor)
    var point_two = this.get_slingshot_hooks(2)
    context.moveTo(this.slingshot_point.x * draw_factor, this.slingshot_point.y * draw_factor)
    context.lineTo(point_two.x * draw_factor, point_two.y * draw_factor)
    context.stroke()
  }
}

