Crippler.prototype = new Goo()

Crippler.prototype.constructor = Crippler

function Crippler(world, x, y, id, impulse_game_state) {
  this.type = "crippler"

  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2
  this.goo_color = [255, 105, 180]
  this.trailing_enemy_init()
  this.goo_radius = 3
  this.goo_duration = 10000
  this.do_yield = false

  
}

Crippler.prototype.player_hit_proc = function() {
  this.player.stun(5000)
}

Crippler.prototype.trail_effect = function(obj) {
  obj.stun(100)
}

