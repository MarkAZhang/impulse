DeathRayDire.prototype = new DeathRay()

DeathRayDire.prototype.constructor = DeathRayDire

function DeathRayDire(world, x, y, id, impulse_game_state) {
  this.type = "deathraydire"
   
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

  this.shoot_interval = 2000

  this.shoot_duration = this.shoot_interval

  this.aim_proportion = .75

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

DeathRayDire.prototype.get_target_point = function() {
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
    //go towards center
    return {x: canvasWidth/draw_factor/2, y: (canvasHeight - topbarHeight)/draw_factor/2}
  }
}