Wisp.prototype = new Enemy()

Wisp.prototype.constructor = Wisp

function Wisp(world, x, y, id, impulse_game_state) {
  
  this.type = "wisp"

  this.init(world, x, y, id, impulse_game_state)
  this.interior_color = "white"

  this.special_mode = false

  this.death_radius = 5

  this.visibility_timer = 0

}

Wisp.prototype.additional_processing = function(dt) {
  this.visibility_timer +=dt
  var leftover = this.visibility_timer % 2000
  if(leftover > 1000) leftover = 2000 - leftover
  this.visibility = this.status_duration[1] <= 0 ? leftover / 1000 : 1
  
}

Wisp.prototype.player_hit_proc = function() {
  this.impulse_game_state.world_visible = false
  setTimeout(function(_this){return function() {_this.impulse_game_state.world_visible = true}}(this), 4000)
}

