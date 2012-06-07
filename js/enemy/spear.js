Spear.prototype = new Enemy()

Spear.prototype.constructor = Spear

function Spear(world, x, y, id) {
  this.type = "spear"
  vertices = []
  var s_radius = impulse_enemy_stats[this.type]['effective_radius']  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*5/6), s_radius*Math.sin(Math.PI*5/6)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*7/6), s_radius*Math.sin(Math.PI*7/6)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0/6), s_radius*Math.sin(Math.PI*0/6)))

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)

  this.init(world, x, y, id)

  this.spear_range = 30   //distance from which spear effects activate

  this.fast_factor = 5

  this.spear_force = 30 //force that the spear impulses the player

  this.death_radius = 5

  this.stun_length = 5000 //after being hit by player, becomes stunned

  this.do_yield = false
}

Spear.prototype.modify_movement_vector = function(dir) {
  //apply impulse to move enemy
  var in_poly = false
  for(var i = 0; i < level.obstacle_polygons.length; i++)
  {
    if(pointInPolygon(level.obstacle_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }
  if(in_poly)
  {
    dir.Multiply(this.slow_force)
  }
  else {
    if(this.special_mode)
    {
      dir.Multiply(this.fast_factor)
    }  
    if(this.status_duration[2] > 0) {
      dir.Multiply(this.slow_factor)
    }
    dir.Multiply(this.force)
  }
}

Spear.prototype.additional_processing = function(dt) {
  this.special_mode = !this.dying && this.path && this.path.length == 1 && p_dist(this.body.GetPosition(), player.body.GetPosition()) < this.spear_range && (this.status_duration[1] <= 0)
  
}

Spear.prototype.player_hit_proc = function() {
  var spear_angle = _atan(this.body.GetPosition(), player.body.GetPosition())
  var a = new b2Vec2(this.spear_force * Math.cos(spear_angle), this.spear_force * Math.sin(spear_angle))
  player.body.ApplyImpulse(new b2Vec2(this.spear_force * Math.cos(spear_angle), this.spear_force * Math.sin(spear_angle)), player.body.GetWorldCenter())
}

Spear.prototype.process_impulse = function(attack_loc, impulse_force) {
  this.silence(this.stun_length)
}

