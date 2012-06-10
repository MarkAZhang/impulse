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

Disabler.prototype.trail_effect = function(obj) {
  obj.silence(100)
}
