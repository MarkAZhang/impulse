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

Slingshot.prototype.move = function() {
  if(this.slingshot_mode) {
    var dir = new b2Vec2(this.slingshot_point.x - this.body.GetPosition().x, this.slingshot_point.y - this.body.GetPosition().y)
    dir.Multiply(this.slingshot_multiplier)
    this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

    var heading = _atan(this.body.GetPosition(), this.slingshot_point)
    this.body.SetAngle(heading)
  }
  else {
    if(!this.path || this.path.length == 1 || this.pathfinding_counter == 2 * this.pathfinding_delay || !isVisible(this.path[this.path.length-1], this.path[this.path.length-2], level.obstacle_edges))
    //if this.path.length == 1, there is nothing in between the enemy and the player. In this case, it's not too expensive to check every frame to make sure the enemy doesn't kill itself
    {
      var new_path = visibility_graph.query(this.body.GetPosition(), player.body.GetPosition(), level.boundary_polygons)
      if(new_path!=null)
        this.path = new_path
      this.pathfinding_counter = Math.floor(Math.random()*this.pathfinding_counter)
    }
    if(!this.path)
    {
      return
    }
    this.pathfinding_counter+=1
    var endPt = this.path[0]
    while(this.path.length > 1 && p_dist(endPt, this.body.GetPosition())<1)
    {
      this.path = this.path.slice(1)
      endPt = this.path[0]
    }

    if(!endPt)
    {
      return
    }

    if(isVisible(this.body.GetPosition(), player.body.GetPosition(), level.obstacle_edges)) {//if we can see the player directly, immediately make that the path
      this.path = [player.body.GetPosition()]
      endPt = this.path[0]
    }
    
    //check if yielding
    if(this.do_yield) {
      if(this.yield_counter == this.yield_delay)
      {
        var nearby_enemies = getObjectsWithinRadius(this.body.GetPosition(), this.effective_radius*4, enemies, function(enemy) {return enemy.body.GetPosition()})
        this.yield = false
        for(var i = 0; i < nearby_enemies.length; i++)
        {
          if(nearby_enemies[i].id > this.id)
          {
            this.yield = true
            break
          }
        }
        this.yield_counter = 0
      }
      this.yield_counter++
    }
    

    if(!this.do_yield || !this.yield)
    {
      this.move_to(endPt)
    }
  }
}

Slingshot.prototype.additional_processing = function(dt) {
  
  if(this.slingshot_mode && this.slingshot_duration <= 0 && p_dist(this.slingshot_point, this.body.GetPosition()) < 1) {
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

Slingshot.prototype.process_impulse = function(attack_loc, impulse_force) {
  this.slingshot_point = this.body.GetPosition().Copy()
  this.slingshot_mode = true
  this.slingshot_duration = this.slingshot_interval
  this.empowered_duration = this.empowered_interval
  this.body.SetLinearDamping(1)
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

