var FragmentGroup = function(enemy_type, loc, velocity) {
  this.init(enemy_type, loc, velocity)
}

FragmentGroup.prototype.init = function(enemy_type, loc, velocity) {

  this.fragments = []
  velocity_adjustment_factor = Math.min(1, 10/Math.sqrt(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)))

  this.burst_force = Math.max(3, Math.sqrt(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)))


  //decrease the velocity some so that the explosion looks good
  velocity = {x: velocity.x * velocity_adjustment_factor, y: velocity.y * velocity_adjustment_factor}
  this.lifespan = 1000
  this.life_left = this.lifespan
  this.color = "black"


  if(enemy_type=="player") {
    this.shape =
      {type: "circle", x: 0, y: 0, r: Player.prototype.radius}
    this.color = impulse_colors["player_color"]
    this.original_v_damping = 0.5
    this.num_fragments = 10

  } else {
    this.shape = impulse_enemy_stats[enemy_type].shape_polygons[0]
    this.color = impulse_enemy_stats[enemy_type].color
    this.original_v_damping = 0.3
    this.num_fragments = 3
  }

  this.v_decay_per_second = .5
  this.center = {x: loc.x, y: loc.y}
  this.center_velocity = {x: this.original_v_damping * velocity.x, y: this.original_v_damping * velocity.y }

  for(var i = 0; i < this.num_fragments; i++) {
    dir = 2*Math.PI/this.num_fragments*Math.random()
    new_v = {x: this.original_v_damping * velocity.x + Math.cos(dir + 2 * Math.PI/this.num_fragments * i) * this.burst_force,
      y: this.original_v_damping * velocity.y + Math.sin(dir + 2 * Math.PI/this.num_fragments * i) * this.burst_force}

    this.fragments.push(new Fragment(this.shape, draw_factor/3, {x: loc.x * draw_factor, y: loc.y * draw_factor},
     {x: new_v.x * draw_factor, y: new_v.y * draw_factor}, this.color))
  }

  for(var i = 0; i < this.num_fragments; i++) {
    dir = 2*Math.PI/this.num_fragments*Math.random()
    new_v = {x: this.original_v_damping * velocity.x + Math.cos(dir + 2 * Math.PI/this.num_fragments * i) * 2 *this.burst_force,
      y: this.original_v_damping * velocity.y + Math.sin(dir + 2 * Math.PI/this.num_fragments * i) * 2*this.burst_force}

    this.fragments.push(new Fragment(this.shape, draw_factor/3, {x: loc.x * draw_factor, y: loc.y * draw_factor},
     {x: new_v.x * draw_factor, y: new_v.y * draw_factor}, this.color))
  }
}

FragmentGroup.prototype.process = function(dt) {
  this.life_left -= dt
  this.center.x += this.center_velocity.x * dt/1000
  this.center.y += this.center_velocity.y * dt/1000
  this.center_velocity.x -= this.v_decay_per_second * this.center_velocity.x * dt/1000
  this.center_velocity.y -= this.v_decay_per_second * this.center_velocity.y * dt/1000

  for(var i = 0; i < this.fragments.length; i++) {
    this.fragments[i].process(dt)
  }
}

FragmentGroup.prototype.draw = function(context) {

  var prog = this.life_left/this.lifespan

  for(var i = 0; i < this.fragments.length; i++) {
    this.fragments[i].draw(context, this.life_left/this.lifespan)
  }
}

FragmentGroup.prototype.isDone = function() {
  return this.life_left <= 0
}

var Fragment = function(shape, size, loc, velocity, color) {
  this.init(shape, size, loc, velocity, color)
}

Fragment.prototype.init = function(shape, size, loc, velocity, color) {
  this.loc = loc
  this.shape = shape
  this.size = size
  this.velocity = velocity
  this.color = color
  this.v_decay_per_second = .5
}

Fragment.prototype.process = function(dt) {
  this.loc.x += this.velocity.x * dt/1000
  this.loc.y += this.velocity.y * dt/1000
  this.velocity.x -= this.v_decay_per_second * this.velocity.x * dt/1000
  this.velocity.y -= this.v_decay_per_second * this.velocity.y * dt/1000
}

Fragment.prototype.draw = function(context, prog) {
  var pointer_angle = _atan({x: 0, y: 0}, this.velocity)
  draw_shape(context, this.loc.x, this.loc.y, this.shape, this.size, this.color, prog, pointer_angle)
}