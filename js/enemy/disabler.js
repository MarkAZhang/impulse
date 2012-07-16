Disabler.prototype = new Goo()

Disabler.prototype.constructor = Disabler

function Disabler(world, x, y, id, impulse_game_state) {
 this.type = "disabler"
  
  this.init(world, x, y, id, impulse_game_state)

  
  this.death_radius = 2
  this.goo_color = [238, 233, 233]
  this.life_time = 7500 //goo automatically dies after this
  this.trailing_enemy_init()

  this.do_yield = false
  
}

Disabler.prototype.player_hit_proc = function() {
  this.player.silence(2000)
}

Disabler.prototype.collide_with = function(other) {
//function for colliding with the player

  if(this.dying)//ensures the collision effect only activates once
    return

  if(other === this.player && this.check_player_intersection(this.player)) {
   
    this.start_death("hit_player")
    if(this.status_duration[1] <= 0) {//do not proc if silenced
      this.player_hit_proc()
      this.impulse_game_state.reset_combo()
    }
  }
}

Disabler.prototype.trail_effect = function(obj) {
  obj.silence(200)
}
