Mote.prototype = new Enemy()

Mote.prototype.constructor = Mote

function Mote(world, x, y, id) {
  this.type = "mote"
  vertices = []
  var s_radius = impulse_enemy_stats[this.type]['effective_radius']  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 0), s_radius*Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/2), s_radius*Math.sin(Math.PI * 1/2)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1), s_radius*Math.sin(Math.PI * 1)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 3/2), s_radius*Math.sin(Math.PI * 3/2)))  

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)

  this.init(world, x, y, id)

  this.special_mode = false

  this.death_radius = 5

}

Mote.prototype.player_hit_proc = function() {
  player.silence(2000)
}

Mote.prototype.additional_processing = function(dt) {
}

