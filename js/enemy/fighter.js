Fighter.prototype = new Enemy()

Fighter.prototype.constructor = Fighter

function Fighter(world, x, y, id) {
  
  vertices = []
  var s_radius = 1  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 0), s_radius*Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/4), s_radius*Math.sin(Math.PI * 1/4)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 3/4), s_radius*Math.sin(Math.PI * 3/4)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 5/4), s_radius*Math.sin(Math.PI * 5/4)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 7/4), s_radius*Math.sin(Math.PI * 7/4)))  
//  this.shape = new b2CircleShape(.5)

  this.effective_radius =  s_radius//an approximation of the radius of this shape

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.collision_polygon = getBoundaryPolygon(vertices, (player.r + 0.1))
  this.color = "rgb(30, 144, 255)"
  this.density = 1
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99

  this.init(world, x, y, id)

  //this.fast_lin_damp = 1.5

  //how fast enemies move
  this.force = .7

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.special_mode = false

  this.tank_force = 100 //force that the spear impulses the player

  this.death_radius = 5

  this.score_value = 1000

  this.shoot_interval = 750

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

  this.safe_radius = 10

  this.safe_radius_buffer = 2

  this.safe_lines = [{x: -5, y: -5}, {x: -5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: -5}]

  this.safe = true

}

Fighter.prototype.additional_processing = function(dt) {

  if(this.safe != p_dist(player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius)
  {
    this.safe = !this.safe
    this.path = null
  }

  if(this.shoot_duration < 0 && this.status_duration[1] <= 0) {
    this.shoot_duration = this.shoot_interval
    if(this.special_mode) {
      spawned_enemies.push(new FighterBullet(world, this.body.GetPosition().x + this.effective_radius * 3 * Math.cos(this.body.GetAngle()), this.body.GetPosition().y + this.effective_radius * 3 * Math.sin(this.body.GetAngle()), enemy_counter, (player.body.GetPosition().x - this.body.GetPosition().x), (player.body.GetPosition().y - this.body.GetPosition().y), this.id))
      enemy_counter += 1
    }
  }
  this.shoot_duration -= dt

  this.special_mode = isVisible(player.body.GetPosition(), this.body.GetPosition(), level.obstacle_edges) && this.status_duration[1] <= 0
}

Fighter.prototype.player_hit_proc = function() {
}

Fighter.prototype.move = function() {
  if(!this.safe) {
    if(!this.path || this.pathfinding_counter == this.pathfinding_delay)
      {
        var targetPt = null
        var rayOut = new b2Vec2(this.body.GetPosition().x - player.body.GetPosition().x, this.body.GetPosition().y - player.body.GetPosition().y)
        rayOut.Normalize()
        rayOut.Multiply(200)
        var j = this.safe_lines.length - 1
        for(var i = 0; i < this.safe_lines.length; i++)
        {
          var temp = getSegIntersection(player.body.GetPosition(), {x: player.body.GetPosition().x + rayOut.x, y: player.body.GetPosition().y + rayOut.y}, this.safe_lines[i], this.safe_lines[j])

          if(temp!=null)
          {
            targetPt = temp
            break
          }

          j = i
        }
        console.log("RUNNING! target is "+targetPt)
        console.log(rayOut)
        console.log(this.body.GetPosition())
        console.log(player.body.GetPosition())

        var new_path = visibility_graph.query(this.body.GetPosition(), targetPt, level.boundary_polygons)
        if(new_path!=null)
          this.path = new_path
        this.pathfinding_counter = Math.floor(Math.random()*this.pathfinding_counter)
      }
    this.pathfinding_counter +=1
    if(!this.path)
    {
      return
    }
    
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
    this.move_to(endPt)
  }
  else if(p_dist(player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius + this.safe_radius_buffer)
    {
      if(!this.path || this.path.length == 1 || this.pathfinding_counter == 2 * this.pathfinding_delay || !isVisible(this.path[this.path.length-1], this.path[this.path.length-2], level.obstacle_edges))
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
      this.move_to(endPt)

    }
  else 
    this.path = null
}

Fighter.prototype.set_heading = function(endPt) {
  var heading = _atan(this.body.GetPosition(), player.body.GetPosition())
  this.body.SetAngle(heading)
}
