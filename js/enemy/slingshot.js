Slingshot.prototype = new Enemy()

Slingshot.prototype.constructor = Slingshot

function Slingshot(world, x, y, id) {
  
  vertices = []
  var s_radius = 1  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*2/3), s_radius*Math.sin(Math.PI*2/3)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*4/3), s_radius*Math.sin(Math.PI*4/3)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0/6), s_radius*Math.sin(Math.PI*0/6)))  
//  this.shape = new b2CircleShape(.5)

  this.effective_radius =  s_radius//an approximation of the radius of this shape

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.collision_polygon = getBoundaryPolygon(vertices, (player.r + 0.1))
  this.color = "rgb(160, 82, 45)"
  this.density = .2
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 6

  this.init(world, x, y, id)
  //this.fast_lin_damp = 1.5
  this.spear_range = 30

  //how fast enemies move
  this.force = .4

  this.fast_force = 1

  //how fast enemies move when cautious
  this.slow_force = .1

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.special_mode = false

  this.slingshot_force = 30 //force that the spear impulses the player

  this.death_radius = 5

  this.score_value = 800

  this.do_yield = true

  this.slingshot_mode = false
  this.slingshot_point = null
  this.slingshot_duration = 0
  this.slingshot_interval = 100
  this.slingshot_multiplier = 1
  this.empowered_duration = 0
  this.empowered_interval = 500
  this.empowered_force = 100
}

Slingshot.prototype.enemy_move = Enemy.prototype.move

Slingshot.prototype.move = function() {
  if(this.slingshot_mode) {
    if(this.status_duration[0] <= 0) {
      var dir = new b2Vec2(this.slingshot_point.x - this.body.GetPosition().x, this.slingshot_point.y - this.body.GetPosition().y)
      dir.Multiply(this.slingshot_multiplier)
      if(this.status_duration[2] > 0)
        dir.Multiply(this.slow_factor)
      this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

      var heading = _atan(this.body.GetPosition(), this.slingshot_point)
      this.body.SetAngle(heading)
    }
  }
  else {
    this.enemy_move()
  }
}

Slingshot.prototype.additional_processing = function(dt) {
  
  if(this.slingshot_mode && (this.slingshot_duration <= 0 && p_dist(this.slingshot_point, this.body.GetPosition()) < 1) || this.status_duration[1] > 0) {
    this.slingshot_mode = false
    this.body.SetLinearDamping(6)
  }
    
  this.special_mode = this.empowered_duration > 0

  this.color = this.slingshot_mode ? "red" : this.color

  if(this.slingshot_duration > 0)
  {
    this.slingshot_duration -= dt
  }

  if(this.empowered_duration > 0)
  {
    this.empowered_duration -= dt
  }
}

Slingshot.prototype.player_hit_proc = function() {

  var spear_angle = _atan(this.body.GetPosition(), player.body.GetPosition())
  var a = new b2Vec2(Math.cos(spear_angle), Math.sin(spear_angle))
  if(this.empowered_duration > 0)
  {
    a.Multiply(this.empowered_force)
  }
  else
  {
    a.Multiply(this.slingshot_force)
  }
  player.body.ApplyImpulse(a, player.body.GetWorldCenter())
    
}

Slingshot.prototype.check_death = function() {
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")
      this.body.SetLinearDamping(6)
      return
    }
  }
  
}

Slingshot.prototype.process_impulse = function(attack_loc, impulse_force) {
  if(this.status_duration[1] <= 0) {
    this.slingshot_point = this.body.GetPosition().Copy()
    this.slingshot_mode = true
    this.slingshot_duration = this.slingshot_interval
    this.empowered_duration = this.empowered_interval
    this.body.SetLinearDamping(1)
  }
}

Slingshot.prototype.additional_drawing = function(context, draw_factor) {
  if(this.slingshot_mode) {
    context.beginPath()
    context.strokeStyle = this.color
    context.lineWidth = 2
    context.moveTo(this.slingshot_point.x * draw_factor, this.slingshot_point.y * draw_factor)
    context.lineTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    context.stroke()
  }
}

