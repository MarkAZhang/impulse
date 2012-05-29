Tank.prototype = new Enemy()

Tank.prototype.constructor = Tank

function Tank(world, x, y, id) {
  
  vertices = []
  var s_radius = 1  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 0), s_radius*Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/2), s_radius*Math.sin(Math.PI * 1/2)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1), s_radius*Math.sin(Math.PI * 1)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 3/2), s_radius*Math.sin(Math.PI * 3/2)))  
//  this.shape = new b2CircleShape(.5)

  this.effective_radius =  s_radius//an approximation of the radius of this shape

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.color = "purple"
  this.density = 2
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99

  //this.fast_lin_damp = 1.5

  //how fast enemies move
  this.force = .5

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.special_mode = false

  this.tank_force = 100 //force that the spear impulses the player

  this.death_radius = 5

  this.init(world, x, y, id)
}

Tank.prototype.move = function(endPt) {

  //apply impulse to move enemy
  var in_poly = false
  for(var i = 0; i < level.obstacle_polygons.length; i++)
  {
    if(pointInPolygon(level.obstacle_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }

  var dir = new b2Vec2(endPt.x - this.body.GetPosition().x, endPt.y - this.body.GetPosition().y)
  dir.Normalize()
  dir.Multiply(this.force)
  
  this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

  var heading = _atan(this.body.GetPosition(), endPt)

  this.body.SetAngle(heading)
    
}

Tank.prototype.additionalProcessing = function() {
}

Tank.prototype.collide_with = function(player) {
//function for colliding with the player
  if(p_dist(player.body.GetPosition(), this.body.GetPosition()) > player.shape.GetRadius() + this.effective_radius)
  {
    return
  }
  if(!this.dying)//this ensures it only collides once
  {
    this.start_death("hit_player")
    console.log("PLAYER HIT! " + this.tank_force)
    var tank_angle = _atan(this.body.GetPosition(), player.body.GetPosition())
    player.body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), player.body.GetWorldCenter())
      for(var i = 0; i < enemies.length; i++)
      {
        if(p_dist(this.body.GetPosition(), enemies[i].body.GetPosition()) <= this.effective_radius)
        {
          var _angle = _atan(this.body.GetPosition(), enemies[i].body.GetPosition())
          enemies[i].body.ApplyImpulse(new b2Vec2(this.tank_force * .8 * Math.cos(tank_angle), this.tank_force * .8 * Math.sin(tank_angle)), player.body.GetWorldCenter())

        }
      }
  }
  

}


