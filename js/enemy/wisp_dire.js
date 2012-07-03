WispDire.prototype = new Wisp()

WispDire.prototype.constructor = WispDire

function WispDire(world, x, y, id, impulse_game_state) {
  
  this.type = "wispdire"

  this.init(world, x, y, id, impulse_game_state)
  this.interior_color = "white"

  this.special_mode = false

  this.death_radius = 5

  this.visibility_timer = 0

}

WispDire.prototype.additional_processing = function(dt) {
  this.visibility_timer +=dt
  var leftover = this.visibility_timer % 2000
  if(leftover > 1000) leftover = 2000 - leftover
  this.visibility = this.status_duration[1] <= 0 ? leftover / 1000 : 1
  
}

WispDire.prototype.player_hit_proc = function() {
  this.level.obstacles_visible = false
  setTimeout(function(_this){return function() {_this.level.obstacles_visible = true}}(this), 4000)

  //for boss four
  if(this.level.boss != null) {
    this.level.boss.laser_target_visible = false
    setTimeout(function(_this){return function() {_this.level.boss.laser_target_visible = true}}(this), 4000)    
  }
}

