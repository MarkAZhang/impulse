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

  this.init(world, x, y, id)
  //this.fast_lin_damp = 1.5

  //how fast enemies move
  this.force = 1

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.special_mode = false

  this.tank_force = 100 //force that the spear impulses the player

  this.death_radius = 5

  this.detonate_timer = 200 
  this.detonate_duration = 200
  this.death_delay = 200
  this.bomb_factor = 6

  this.activated = false

  this.cause_of_death = null

}

Tank.prototype.activated_processing = function(dt) {
  if(this.activated)
  {
    console.log(this.detonate_timer + " " + this.id)
    if(this.detonate_timer <= 0 && !this.dying)
    {
      this.start_death(this.cause_of_death)
      this.explode()
    }
    if(this.detonate_timer > 0)
    {
      this.detonate_timer -= dt
    }
  }
}

Tank.prototype.check_death = function()
{
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(level.obstacle_polygons[k], this.body.GetPosition()))
    {
      console.log(this.id + " HAS DIED")
      this.activated = true
      this.cause_of_death = "kill"
      return
    }
  }
}

Tank.prototype.collide_with = function(other) {
  if(other instanceof Tank)
  {
    this.activated = true
    this.cause_of_death = "kill"
  }

  if(other !== player) {
    return
  }
//function for colliding with the player
  if(p_dist(player.body.GetPosition(), this.body.GetPosition()) > player.shape.GetRadius() + this.effective_radius)
  {
    return
  }
  if(!this.dying && !this.activated)//this ensures it only collides once
  {
    console.log(this.id + " HAS HIT PLAYER" )
    this.activated = true
    this.cause_of_death = "hit_player"
  }
  

}

Tank.prototype.explode = function() {
  console.log("EXPLODE! " + this.id)
  if(p_dist(this.body.GetPosition(), player.body.GetPosition()) <= this.effective_radius * this.bomb_factor)
  {
    var tank_angle = _atan(this.body.GetPosition(), player.body.GetPosition())
    player.body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), player.body.GetWorldCenter())
  }

  for(var i = 0; i < enemies.length; i++)
  {

    if(enemies[i] !== this && p_dist(this.body.GetPosition(), enemies[i].body.GetPosition()) <= this.effective_radius * this.bomb_factor)
    {
      var _angle = _atan(this.body.GetPosition(), enemies[i].body.GetPosition())
      enemies[i].body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(_angle), this.tank_force * Math.sin(_angle)), enemies[i].body.GetWorldCenter())
      console.log("EXPLODE ON ENEMY "+i+" "+_angle)

    }
  }
}

Tank.prototype.additional_drawing = function(context, draw_factor) {

  if(this.activated && this.detonate_timer > 0)
  {
    context.beginPath()
    context.strokeStyle = this.color;
    context.lineWidth = 2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.bomb_factor * (1 - this.detonate_timer/this.detonate_duration)) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
  }

}
