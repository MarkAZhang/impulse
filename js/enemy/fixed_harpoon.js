FixedHarpoon.prototype = new Harpoon()

FixedHarpoon.prototype.constructor = FixedHarpoon

function FixedHarpoon(world, x, y, id, impulse_game_state) {
  this.type = "fixed_harpoon" //still a harpoon

  var h_vertices = []

  var s_radius = .3

  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0), s_radius*Math.sin(Math.PI*0)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*5/6), s_radius*Math.sin(Math.PI*5/6)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*7/6), s_radius*Math.sin(Math.PI*7/6)))  
  this.harpoon_shape = h_vertices

  this.init(world, x, y, id, impulse_game_state)

  this.fixed_loc = new b2Vec2(x, y)

  this.death_radius = 2

  this.harpoon_length = 15

  this.goalPt = null

  this.harpooning = false //whether the FixedHarpoon is currently shooting
  this.harpoon_loc = null
  this.harpoon_v = null
  this.harpoon_velocity = 15

  this.harpoon_color = "orange"

  this.harpooned = false
  this.harpooned_force = 15

  this.safe_radius = 10
  this.safe_radius_buffer = 2
  

  this.safe = true
  this.harpoon_joint = null

  this.do_yield = false

  this.check_harpoon_interval = 5//so that we don't check for harpooning every frame
  this.check_harpoon_timer = this.check_harpoon_interval

  this.check_for_good_target_point_interval = 15

  this.check_for_good_target_point_timer = this.check_for_good_target_point_interval

  this.check_safety_interval = 8

  this.check_safety_timer = this.check_safety_interval

}

FixedHarpoon.prototype.get_target_point = function() {
  return this.fixed_loc
}

FixedHarpoon.prototype.enemy_move = Enemy.prototype.move

FixedHarpoon.prototype.move = function() {
  if(this.harpooning) {return}//do not move if harpooning

  if(this.harpooned) {
    
    var dir = new b2Vec2(this.body.GetPosition().x - this.player.body.GetPosition().x, this.body.GetPosition().y - this.player.body.GetPosition().y)
    dir.Normalize()
    dir.Multiply(this.harpooned_force)
    this.body.ApplyImpulse(dir, this.body.GetWorldCenter())
    this.body.SetAngle(_atan(this.player.body.GetPosition(), this.body.GetPosition()))
    return
  }
  else {
    if(p_dist(this.body.GetPosition(), this.fixed_loc) < 1) {
      this.path = null
      return
    }
    if(this.path == null) {
      this.pathfinding_counter = 2 * this.pathfinding_delay
    }
    this.enemy_move()
  }
}

FixedHarpoon.prototype.check_cancel_harpoon = function() {
  if(this.harpooned && !check_bounds(1, this.player.body.GetPosition(), draw_factor)) {
    this.disengage()
  }
  else if(this.harpooned && this.player.dying) {
    this.disengage()
  }
}