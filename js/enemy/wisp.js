Wisp.prototype = new Enemy()

Wisp.prototype.constructor = Wisp

function Wisp(world, x, y, id, impulse_game_state) {
  
  this.type = "wisp"
  vertices = []
  var s_radius = impulse_enemy_stats[this.type]['effective_radius']  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 0), s_radius*Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/2), s_radius*Math.sin(Math.PI * 1/2)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1), s_radius*Math.sin(Math.PI * 1)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 3/2), s_radius*Math.sin(Math.PI * 3/2)))  

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)

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
  this.level.obstacles_visible = false
  setTimeout(function(_this){return function() {_this.level.obstacles_visible = true}}(this), 5000)
}

