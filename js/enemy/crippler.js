Crippler.prototype = new Goo()

Crippler.prototype.constructor = Crippler

function Crippler(world, x, y, id) {
  var s_radius = 2  //temp var
  this.effective_radius = .5
  var vertices = []
  vertices.push(new b2Vec2(s_radius * .25 * Math.cos(Math.PI * 0), s_radius * .25 * Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/2), s_radius*Math.sin(Math.PI * 1/2)))
  vertices.push(new b2Vec2(s_radius* .25 * Math.cos(Math.PI * 1), s_radius* .25 * Math.sin(Math.PI * 1)))
  vertices.push(new b2Vec2(s_radius * Math.cos(Math.PI * 3/2), s_radius* Math.sin(Math.PI * 3/2)))  
  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)

  this.collision_polygon = []

  this.collision_polygon.push(new b2Vec2((player.r + s_radius * .25 + 0.2) * Math.cos(Math.PI * 0), (player.r + s_radius * .25 + 0.2) * Math.sin(Math.PI*0)))
  this.collision_polygon.push(new b2Vec2((player.r + s_radius + 0.2) * Math.cos(Math.PI * 1/2), (player.r + s_radius + 0.2) *Math.sin(Math.PI * 1/2)))
  this.collision_polygon.push(new b2Vec2((player.r + s_radius * .25 + 0.2) * Math.cos(Math.PI * 1), (player.r + s_radius * .25 + 0.2) * Math.sin(Math.PI * 1)))
  this.collision_polygon.push(new b2Vec2((player.r + s_radius + 0.2) * Math.cos(Math.PI * 3/2), (player.r + s_radius + 0.2) * Math.sin(Math.PI * 3/2)))  

  this.color = "rgb(255, 20, 147)"
  this.density = 1.2
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99
  this.init(world, x, y, id)

  //how fast enemies move
  this.force = .8
  //how fast enemies move when cautious
  this.slow_force = .1

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10
  this.death_radius = 2
  this.score_value = 2000
  this.goo_polygons = []
  this.goo_interval = 250
  this.goo_timer = this.goo_interval
  this.goo_radius = 2 //radius of goo trail
  this.goo_duration = 5000 //amount of time a given goo polygon lasts
  this.goo_death_duration = 500
  this.goo_color = [255, 105, 180]
  this.last_left = null
  this.last_right = null
  this.do_yield = false
  this.effective_heading = this.body.GetAngle()//the heading used to calculate the goo, does not turn instantaneously
  
}



Crippler.prototype.collide_with = function(other) {
//function for colliding with the player

  if(other !== player) {
    return
  }
  //if(!pointInPolygon(this.collision_polygon, {x: other.body.GetPosition().x - this.body.GetPosition().x, y: other.body.GetPosition().y - this.body.GetPosition().y}))
  if(p_dist(player.body.GetPosition(), this.body.GetPosition()) > player.shape.GetRadius() + this.effective_radius)
  {
    return
  }
  if(!this.dying)//this ensures it only collides once
  {
    this.start_death("hit_player")
  }
  reset_combo()
  if(this.status_duration[1] <= 0)
    player.stun(2000)
}

Crippler.prototype.trail_effect = function(obj) {
  obj.stun(100)
}

Crippler.prototype.additional_drawing = function(context, draw_factor) {
  var tp = this.body.GetPosition()
      context.save();
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.body.GetAngle());
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
      
      context.beginPath()
      
      context.moveTo((tp.x+this.collision_polygon[0].x)*draw_factor, (tp.y+this.collision_polygon[0].y)*draw_factor)
      for(var i = 1; i < this.points.length; i++)
      {
        context.lineTo((tp.x+this.collision_polygon[i].x)*draw_factor, (tp.y+this.collision_polygon[i].y)*draw_factor)
      }
      context.closePath()
      context.lineWidth = 2

      
      context.strokeStyle = "black" 
      //var vertices = 
      context.stroke()
      context.globalAlpha = this.visibility ? this.visibility/2 : .5

      context.restore()
}
