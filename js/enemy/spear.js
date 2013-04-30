Spear.prototype = new Enemy()

Spear.prototype.constructor = Spear

function Spear(world, x, y, id, impulse_game_state) {
  this.type = "spear"

  this.init(world, x, y, id, impulse_game_state)

  this.spear_range = 30   //distance from which spear effects activate

  this.fast_factor = 5

  this.spear_force = 30 //force that the spear impulses the player

  this.death_radius = 5

  this.stun_length = 3000 //after being hit by player, becomes stunned


  this.do_yield = false

  this.entered_arena = false
  this.entered_arena_delay = 1000
  this.entered_arena_timer = 1000
  this.last_stun = this.entered_arena_delay

  this.require_open = false
}

Spear.prototype.modify_movement_vector = function(dir) {
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
    if(this.special_mode)
    {
      dir.Multiply(this.fast_factor)
    }
    if(this.status_duration[2] > 0) {
      dir.Multiply(this.slow_factor)
    }
    dir.Multiply(this.force)
  }
}

Spear.prototype.additional_processing = function(dt) {

  if(!this.entered_arena && check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.silence(this.entered_arena_delay)
    this.last_stun = Math.max(this.entered_arena_delay, this.last_stun)
    this.entered_arena = true
  }

  if(this.entered_arena_timer > 0) {
    this.entered_arena_timer -= dt
  }

  if(!check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.entered_arena = false
  }

  this.special_mode = !this.dying && this.path && this.path.length == 1 && p_dist(this.body.GetPosition(), this.player.body.GetPosition()) < this.spear_range && (this.status_duration[1] <= 0) && this.entered_arena

}

Spear.prototype.player_hit_proc = function() {
  var spear_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
  var a = new b2Vec2(this.spear_force * Math.cos(spear_angle), this.spear_force * Math.sin(spear_angle))
  this.player.body.ApplyImpulse(new b2Vec2(this.spear_force * Math.cos(spear_angle), this.spear_force * Math.sin(spear_angle)), this.player.body.GetWorldCenter())
}

Spear.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.silence(this.stun_length)
  this.last_stun = this.stun_length
}

Spear.prototype.additional_drawing = function(context, draw_factor) {
  if(this.status_duration[1] > 0 && !this.dying) {
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (this.status_duration[1] / this.last_stun), true)
    context.lineWidth = 2
    context.strokeStyle = this.color;
    context.stroke()
  }

}

