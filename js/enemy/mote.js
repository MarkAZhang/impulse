Mote.prototype = new Enemy()

Mote.prototype.constructor = Mote

function Mote(world, x, y, id, impulse_game_state) {
  this.type = "mote"
  
  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

}

Mote.prototype.player_hit_proc = function() {
  this.player.silence(2000)
}

Mote.prototype.additional_processing = function(dt) {
}

