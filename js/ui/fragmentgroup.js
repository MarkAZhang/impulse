var FragmentGroup = function(enemy_type, loc, velocity, shadowed) {
  this.init(enemy_type, loc, velocity, shadowed)
}

FragmentGroup.prototype.init = function(enemy_type, loc, velocity, shadowed) {
  this.shadowed = shadowed ? true : false;
  this.fragments = []
  if(enemy_type == "spark" || enemy_type == "multi") {
    velocity = {x: 0, y: 0}
  }
  this.waves = 1;

  var velocity_adjustment_factor = Math.min(1, 10/Math.sqrt(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y+0.01)))

  //decrease the velocity some so that the explosion looks good
  velocity = {x: velocity.x * velocity_adjustment_factor, y: velocity.y * velocity_adjustment_factor}
  this.lifespan = 1000
  this.color = "black"

  if(enemy_type.slice(enemy_type.length - 4, enemy_type.length) == "boss") {
    this.shape = imp_params.impulse_enemy_stats[enemy_type].death_polygons[0]
    this.color = imp_params.impulse_enemy_stats[enemy_type].color
    this.original_v_damping = 0.5
    this.num_fragments = 50
    this.burst = 10;
    if (enemy_type == "boss_two") {
      this.burst = 20;
    }
    this.waves = 5;
    this.lifespan = 2000;
  } else if(enemy_type=="player") {
    this.shape =
      {type: "circle", x: 0, y: 0, r: Player.prototype.radius}
    this.color = impulse_colors["player_color"]
    this.original_v_damping = 0.5
    this.num_fragments = 12
    this.burst = 2
    this.waves = 2;
  } else if(enemy_type=="harpoon" || enemy_type=="harpoonhead") {
    this.shape = imp_params.impulse_enemy_stats[enemy_type].shape_polygons[0]
    this.color = imp_params.impulse_enemy_stats[enemy_type].color
    this.original_v_damping = 0.3
    this.num_fragments = 4
    this.burst = 2

  } else if(enemy_type == "spark" ||  enemy_type == "multi") {
    this.num_fragments = 6
    this.burst = 20
    this.original_v_damping = 1
    this.shape = enemy_type

  } else {
    this.shape = imp_params.impulse_enemy_stats[enemy_type].shape_polygons[0]
    this.color = imp_params.impulse_enemy_stats[enemy_type].color
    if(enemy_type=="tanker") {
      this.color = "red"
    }
    this.original_v_damping = 0.3
    this.num_fragments = 4
    this.burst = 2
  }
  this.life_left = this.lifespan

  this.burst_force = this.burst * Math.max(3, Math.sqrt(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)))

  this.v_decay_per_second = .5
  this.center = {x: loc.x, y: loc.y}
  this.center_velocity = {x: this.original_v_damping * velocity.x, y: this.original_v_damping * velocity.y }

  for (var j = 0; j < this.waves; j++) {
    var num_frags_in_wave = this.num_fragments / this.waves;
    for(var i = 0; i < num_frags_in_wave; i++) {    
      dir = 2*Math.PI * i / num_frags_in_wave + (Math.random() - 0.5) * 2 * Math.PI / num_frags_in_wave;
      new_v = {x: this.original_v_damping * velocity.x + Math.cos(dir) * (j + 1 ) / this.waves * this.burst_force,
        y: this.original_v_damping * velocity.y + Math.sin(dir) * (j + 1 ) / this.waves * this.burst_force}

      this.fragments.push(new Fragment(this.shape, imp_vars.draw_factor/3, {x: loc.x * imp_vars.draw_factor, y: loc.y * imp_vars.draw_factor},
       {x: new_v.x * imp_vars.draw_factor, y: new_v.y * imp_vars.draw_factor}, this.color))
    }
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
  if(this.shadowed) {
    context.shadowColor = this.color;
    context.shadowBlur = 15;
  }
  for(var i = 0; i < this.fragments.length; i++) {

    this.fragments[i].draw(context, this.life_left/this.lifespan)

  }
  context.shadowBlur = 0;
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
  this.v_half_life = 500
}

Fragment.prototype.process = function(dt) {
  this.loc.x += this.velocity.x * dt/1000
  this.loc.y += this.velocity.y * dt/1000
  this.velocity.x *= Math.pow(.5, dt/this.v_half_life);
  this.velocity.y *= Math.pow(.5, dt/this.v_half_life);
}

Fragment.prototype.draw = function(context, prog) {
  if(this.shape == "spark" || this.shape == "multi") {
    context.save()
    context.globalAlpha *= prog
    var pointer_angle = _atan({x: 0, y: 0}, this.velocity)
    if(this.shape == "spark")
      draw_spark_fragment(context, this.loc.x/imp_vars.draw_factor, this.loc.y/imp_vars.draw_factor, pointer_angle)
    else if(this.shape == "multi")
      draw_multi_fragment(context, this.loc.x/imp_vars.draw_factor, this.loc.y/imp_vars.draw_factor, pointer_angle)

    context.restore()

  } else {
    context.save()
    var pointer_angle = _atan({x: 0, y: 0}, this.velocity)
    draw_shape(context, this.loc.x, this.loc.y, this.shape, this.size, this.color, prog, pointer_angle)
    context.restore()
  }
}
