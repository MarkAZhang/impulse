HarpoonDire.prototype = new Harpoon()

HarpoonDire.prototype.constructor = HarpoonDire

function HarpoonDire(world, x, y, id, impulse_game_state) {
  this.type = "harpoondire" //still a harpoon

  var h_vertices = []

  var s_radius = .3

  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0), s_radius*Math.sin(Math.PI*0)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*5/6), s_radius*Math.sin(Math.PI*5/6)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*7/6), s_radius*Math.sin(Math.PI*7/6)))  
  this.harpoon_shape = h_vertices

  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2

  this.harpoon_length = 20

  this.goalPt = null

  this.harpooning = false //whether the HarpoonDire is currently shooting
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

}

HarpoonDire.prototype.get_target_point = function() {
  if(!this.safe) {

    var best_dir = _atan(this.player.body.GetPosition(), this.body.GetPosition())

    var mods = [0, Math.PI/4, -Math.PI/4, Math.PI/2, -Math.PI/2, 3*Math.PI/4, -3*Math.PI/4, Math.PI]

    for(var i = 0; i < mods.length; i++) {
      var temp_pt = {x: this.body.GetPosition().x + 10 * Math.cos(best_dir + mods[i]), y: this.body.GetPosition().y + 10 * Math.sin(best_dir + mods[i])}
     if(isVisible(temp_pt, this.body.GetPosition(), this.level.obstacle_edges)) {
        return temp_pt
     }
   }
    return null
  }
  else {
    return this.player.body.GetPosition()
  }
}

HarpoonDire.prototype.enemy_move = Enemy.prototype.move

HarpoonDire.prototype.move = function() {
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
    if(this.path == null) {
      this.pathfinding_counter = 2 * this.pathfinding_delay
    }
    this.enemy_move()
  }
}

HarpoonDire.prototype.can_harpoon = function() {
  return (this.status_duration[1] <= 0 && !this.harpooning && !this.harpooned && check_bounds(0, this.body.GetPosition(), draw_factor)
   && p_dist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.harpoon_length)
}

HarpoonDire.prototype.process_impulse = function() {
  if(this.harpooning)
    this.silence(2000)
  this.harpooning = false
}