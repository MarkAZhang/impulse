Wisp.prototype = new Enemy()

Wisp.prototype.constructor = Wisp

function Wisp(world, x, y, id, impulse_game_state) {

  if(!world) return
  
  this.type = "wisp"

  this.init(world, x, y, id, impulse_game_state)
  this.interior_color = "white"

  this.special_mode = false

  this.death_radius = 5

  this.visibility_timer = 0

  this.blind_interval = 4000

}

Wisp.prototype.additional_processing = function(dt) {
  this.visibility_timer +=dt
  var leftover = this.visibility_timer % 2000
  if(leftover > 1000) leftover = 2000 - leftover
  this.visibility = this.status_duration[1] <= 0 ? leftover / 1000 : 1
  
}

Wisp.prototype.player_hit_proc = function() {
  this.level.obstacles_visible_timer = this.blind_interval
}

