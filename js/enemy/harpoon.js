Harpoon.prototype = new Enemy()

Harpoon.prototype.constructor = Harpoon

function Harpoon(world, x, y, id) {
  var vertices = []
  var s_radius = .7  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*2/5), s_radius*Math.sin(Math.PI*2/5)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*4/5), s_radius*Math.sin(Math.PI*4/5)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*6/5), s_radius*Math.sin(Math.PI*6/5)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*8/5), s_radius*Math.sin(Math.PI*8/5)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0/5), s_radius*Math.sin(Math.PI*0/5)))  
  this.shape = new b2PolygonShape

  var h_vertices = []

  s_radius = .3

  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0), s_radius*Math.sin(Math.PI*0)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*5/6), s_radius*Math.sin(Math.PI*5/6)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*7/6), s_radius*Math.sin(Math.PI*7/6)))  
  this.harpoon_shape = h_vertices

  this.shape.SetAsArray(vertices, vertices.length)
  this.collision_polygon = getBoundaryPolygon(vertices, (player.r + 0.1))
  this.effective_radius = s_radius
  this.color = "yellow"
  this.harpoon_color = "orange"
  this.density = 3
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99
  this.init(world, x, y, id)

  //how fast enemies move
  this.force =1.5

  //how fast enemies move when cautious
  this.slow_force = .1

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10
  this.death_radius = 2
  this.score_value = 2500

  this.harpoon_length = 15

  this.goalPt = null

  this.harpooning = false //whether the Harpoon is currently shooting
  this.harpoon_loc = null
  this.harpoon_v = null
  this.harpoon_velocity = 15

  this.harpooned = false
  this.harpooned_force = 15

  this.safe_radius = 10
  this.safe_radius_buffer = 2
  this.safe_lines = [{x: -5, y: -5}, {x: -5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: -5}]

  this.safe = true
  this.harpoon_joint = null
}

Harpoon.prototype.move = function() {
  if(this.harpooning) {return}//do not move if harpooning

  if(this.harpooned) {
    
    var dir = new b2Vec2(this.body.GetPosition().x - player.body.GetPosition().x, this.body.GetPosition().y - player.body.GetPosition().y)
    dir.Normalize()
    dir.Multiply(this.harpooned_force)
    this.body.ApplyImpulse(dir, this.body.GetWorldCenter())
    this.body.SetAngle(_atan(player.body.GetPosition(), this.body.GetPosition()))
    return
  }


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
    if(!this.path ||
     (this.path.length == 1 && this.goalPt == player.body.GetPosition()) || //keep re-checking if directly going to player
     (this.pathfinding_counter >= 2 * this.pathfinding_delay && (this.goalPt == player.body.GetPosition() || //delay is cover and we're going towards the player
     p_dist(this.goalPt, player.body.GetPosition()) > this.harpoon_length )) || //goal point is too far from player
     (this.path.length >=2 && !isVisible(this.path[this.path.length-1], this.path[this.path.length-2], level.obstacle_edges))) //we can no longer get from second edge to first edge
     
    {
      console.log(this.pathfinding_counter +" "+this.pathfinding_delay)
      this.goalPt = null
      for(var i = 0; i < 5; i++) {

        var random_angle = Math.random() * Math.PI * 2

        var is_valid = true

        var tempPt = new b2Vec2(player.body.GetPosition().x + Math.cos(random_angle) * this.harpoon_length * .75, player.body.GetPosition().y + Math.sin(random_angle) * this.harpoon_length * .75)

        //console.log("TRYING POINT " + tempPt.x +" "+tempPt.y)

        if(tempPt.x >= canvasWidth/draw_factor || tempPt.x <= 0 || tempPt.y >= canvasHeight/draw_factor || tempPt.y <= 0) {
          is_valid = false
          //console.log("OUT OF BOUNDS")
        }

        for(var k = 0; k < level.boundary_polygons.length; k++)
        {
          if(pointInPolygon(level.boundary_polygons[k], tempPt))
          {
            is_valid = false
            //console.log("INSIDE POLYGON")
            //console.log(level.boundary_polygons[k])
          }
        }

        if(isVisible(tempPt, player.body.GetPosition(), level.obstacle_edges)) {
          is_valid = false
        }
        if(is_valid) {

          this.goalPt = tempPt
          break
        }
      }
    

      if(this.goalPt == null) {//we failed to find a suitable point
        this.goalPt = player.body.GetPosition()
      }

      console.log("QUERYING FROM HARPOON")

       var new_path = visibility_graph.query(this.body.GetPosition(), this.goalPt, level.boundary_polygons)
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
    if(p_dist(this.body.GetPosition(), endPt) > 1) {
      this.move_to(endPt)
    }
  }
  else {
    this.path = null
  }
}

Harpoon.prototype.additional_processing = function(dt) {

  if(this.status_duration[1] > 0 && (this.harpooning || this.harpooned)) {
    this.disengage()
    this.harpooning = false
  }
  
  if(this.safe != (p_dist(player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius || !isVisible(this.body.GetPosition(), player.body.GetPosition(), level.obstacle_edges)))
  {
    this.safe = !this.safe
    this.path = null
  }

  if(this.status_duration[1] <= 0 && !this.harpooning && !this.harpooned && p_dist(this.body.GetPosition(), player.body.GetPosition()) <= this.harpoon_length && !isVisible(this.body.GetPosition(), player.body.GetPosition(), level.obstacle_edges)) {
    this.harpooning = true
    this.harpoon_loc = this.body.GetPosition().Copy()
    var temp = this.body.GetPosition().Copy()
    temp.Subtract(player.body.GetPosition())
    temp.Normalize()
    temp.Multiply(this.harpoon_velocity)
    this.harpoon_v = temp
    
  }
  else if(this.harpooning && p_dist(this.body.GetPosition(), this.harpoon_loc) >= this.harpoon_length) {
    this.harpooning = false
  }
  else if(this.harpooning) {

    if(player.point_intersect(this.harpoon_loc)) {
      this.harpooned = true
      this.harpooning = false
      this.harpoon_joint = new Box2D.Dynamics.Joints.b2DistanceJointDef
      this.harpoon_joint.Initialize(this.body, player.body, this.body.GetWorldCenter(), player.body.GetWorldCenter())
      this.harpoon_joint.collideConnected = true
      this.harpoon_joint = world.CreateJoint(this.harpoon_joint)
    }

    var temp_v = this.harpoon_v.Copy()
    temp_v.Multiply(dt/1000)
    this.harpoon_loc.Subtract(temp_v)

  }
  else if(this.harpooned && (player.body.GetPosition().x >= canvasWidth/draw_factor - 1|| player.body.GetPosition().x <= 1 || player.body.GetPosition().y >= canvasHeight/draw_factor - 1|| player.body.GetPosition().y <= 1)) {
    this.disengage()
  }
  else if(this.harpooned && player.dying) {
    this.disengage()
  }
}

Harpoon.prototype.additional_drawing = function(context, draw_factor) {
  if(this.harpooning) {
    context.beginPath()
    context.strokeStyle = this.color
    context.lineWidth = 3
    context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    context.lineTo(this.harpoon_loc.x * draw_factor, this.harpoon_loc.y * draw_factor)
    context.stroke()

    context.save()
    context.translate(this.harpoon_loc.x * draw_factor, this.harpoon_loc.y * draw_factor);
    context.rotate(_atan(this.body.GetPosition(), this.harpoon_loc));
    context.translate(-(this.harpoon_loc.x) * draw_factor, -(this.harpoon_loc.y) * draw_factor);

    var tp = this.harpoon_loc

    context.moveTo((tp.x+this.harpoon_shape[0].x)*draw_factor, (tp.y+this.harpoon_shape[0].y)*draw_factor)
      for(var i = 1; i < this.harpoon_shape.length; i++)
      {
        context.lineTo((tp.x+this.harpoon_shape[i].x)*draw_factor, (tp.y+this.harpoon_shape[i].y)*draw_factor)
      }
      context.closePath()
      context.lineWidth = 2
      context.strokeStyle = this.color
      context.stroke()
      context.restore()
  }
  if(this.harpooned) {
    context.beginPath()
    context.strokeStyle = this.harpoon_color
    context.lineWidth = 3
    context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    context.lineTo(player.body.GetPosition().x * draw_factor, player.body.GetPosition().y * draw_factor)
    context.stroke()
  }
}

Harpoon.prototype.process_impulse = function() {
  this.harpooning = false
}

Harpoon.prototype.disengage = function() {
  if(this.harpooned) {
    console.log("DISENGAGING "+this.harpoon_joint.m_bodyA+" "+this.harpoon_joint.m_bodyB)
    world.DestroyJoint(this.harpoon_joint)
    this.harpoon_joint = null
    this.harpooned = false
  }
}

Harpoon.prototype.collide_with = function() {
  
}
