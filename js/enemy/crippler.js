Crippler.prototype = new Goo()

Crippler.prototype.constructor = Crippler

function Crippler(world, x, y, id, impulse_game_state) {
  this.type = "crippler"
  var s_radius = impulse_enemy_stats[this.type]['effective_radius']  //temp var
  
  var vertices = []
  vertices.push(new b2Vec2(s_radius * .25 * Math.cos(Math.PI * 0), s_radius * .25 * Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/2), s_radius*Math.sin(Math.PI * 1/2)))
  vertices.push(new b2Vec2(s_radius* .25 * Math.cos(Math.PI * 1), s_radius* .25 * Math.sin(Math.PI * 1)))
  vertices.push(new b2Vec2(s_radius * Math.cos(Math.PI * 3/2), s_radius* Math.sin(Math.PI * 3/2)))  
  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)

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

