Crippler.prototype = new Goo()

Crippler.prototype.constructor = Crippler

function Crippler(world, x, y, id, impulse_game_state) {
  this.type = "crippler"

  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2
  this.goo_color = [255, 105, 180]
  this.life_time = 10000
  this.trailing_enemy_init()

  this.do_yield = false
  
}

Crippler.prototype.player_hit_proc = function() {
  this.player.stun(2000)
}

Crippler.prototype.trail_effect = function(obj) {
  obj.stun(100)
}

