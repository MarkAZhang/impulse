Harpoon.prototype = new Enemy()

Harpoon.prototype.constructor = Harpoon

function Harpoon(world, x, y, id, impulse_game_state) {
  if(!world) return
  this.type = "harpoon"

  var h_vertices = []

  var s_radius = .3

  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0), s_radius*Math.sin(Math.PI*0)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*5/6), s_radius*Math.sin(Math.PI*5/6)))
  h_vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*7/6), s_radius*Math.sin(Math.PI*7/6)))  
  this.harpoon_shape = h_vertices

  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2

  this.harpoon_length = 15

  this.goalPt = null

  this.harpooning = false //whether the Harpoon is currently shooting
  this.harpoon_loc = null
  this.harpoon_v = null
  this.harpoon_velocity = 15

  this.harpoon_color = "orange"

  this.harpooned = false
  this.harpooned_force = 15

  this.safe_radius = 10
  this.safe_radius_buffer = 2
  

  this.safe = true
  this.harpoon_joint = null

  this.do_yield = false

}

Harpoon.prototype.get_target_point = function() {
  if(!this.safe) {
    this.goalPt = null
    return get_safe_point(this, this.player)
  }
  else {

    if(this.goalPt != null && p_dist(this.player.body.GetPosition(), this.goalPt) < .9 * this.harpoon_length && !isVisible(this.player.body.GetPosition(), this.goalPt, this.level.obstacle_edges)) {
      return this.goalPt 
    }

    for(var i = 0; i < 5; i++) {

      var random_angle = Math.random() * Math.PI * 2

      var is_valid = true

      var tempPt = new b2Vec2(this.player.body.GetPosition().x + Math.cos(random_angle) * this.harpoon_length * .75, this.player.body.GetPosition().y + Math.sin(random_angle) * this.harpoon_length * .75)

      if(tempPt.x >= canvasWidth/draw_factor || tempPt.x <= 0 || tempPt.y >= canvasHeight/draw_factor || tempPt.y <= 0) {
        is_valid = false
      }

      for(var k = 0; k < this.level.boundary_polygons.length; k++)
      {
        if(pointInPolygon(this.level.boundary_polygons[k], tempPt))
        {
          is_valid = false
        }
      }

      if(isVisible(tempPt, this.player.body.GetPosition(), this.level.obstacle_edges)) {
        is_valid = false
      }
      if(is_valid) {
        this.goalPt = tempPt
        return tempPt
      }
    }
    this.goalPt = null
    return this.player.body.GetPosition()
    
  }
}

Harpoon.prototype.enemy_move = Enemy.prototype.move

Harpoon.prototype.move = function() {
  if(this.harpooning) {return}//do not move if harpooning

  if(this.harpooned) {
    
    var dir = new b2Vec2(this.body.GetPosition().x - this.player.body.GetPosition().x, this.body.GetPosition().y - this.player.body.GetPosition().y)
    dir.Normalize()
    dir.Multiply(this.harpooned_force)
    this.body.ApplyImpulse(dir, this.body.GetWorldCenter())
    this.body.SetAngle(_atan(this.player.body.GetPosition(), this.body.GetPosition()))
    return
  }
  if(p_dist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius && p_dist(this.player.body.GetPosition(), this.body.GetPosition()) < this.safe_radius + this.safe_radius_buffer) {
    this.path = null
  }
  else {
    if(this.path == null) {
      this.pathfinding_counter = 2 * this.pathfinding_delay
    }
    this.enemy_move()
  }
}

Harpoon.prototype.get_harpoon_target_pt = function() {

  return this.player.body.GetPosition().Copy()

  //attempts to predict where the player will go
  //code doesn't work. Maybe try to do it work later. 
  /*var cur_player_loc = this.player.body.GetPosition().Copy()
  var cur_player_v = this.player.body.GetLinearVelocity().Copy()
  var low = 0
  var t = 2
  var high = 4
  for(var i = 0; i < 10; i++) {
    
    var predicted_point = {x: cur_player_loc.x + cur_player_v.x * t, y: cur_player_loc.y + cur_player_v.y * t}
    
    var dist = p_dist(predicted_point, this.body.GetPosition())
      
    var time_taken = dist/this.harpoon_velocity
    
    if(dist > this.harpoon_length || time_taken < t) {
      high = t
      t = (t + low)/2

    }
    if(dist > this.harpoon_length || time_taken > t) {
      low = t
      t = (t + high)/2
    }
    else if(time_taken < t) {
     
    }
    else {
      break
    }
  }
  console.log("RETURNED "+t)
  return new b2Vec2( cur_player_loc.x + cur_player_v.x * t, cur_player_loc.y + cur_player_v * t)*/

}

Harpoon.prototype.additional_processing = function(dt) {

  if(this.status_duration[1] > 0 && (this.harpooning || this.harpooned)) {
    this.disengage()
    this.harpooning = false
  }
  
  if(this.safe != (p_dist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius || !isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)))
  {
    this.safe = !this.safe
    this.path = null
  }

  if(this.status_duration[1] <= 0 && !this.harpooning && !this.harpooned && check_bounds(0, this.body.GetPosition(), draw_factor) && p_dist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.harpoon_length && !isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)) {
    this.harpooning = true
    this.harpoon_loc = this.body.GetPosition().Copy()
    
  

    var temp = this.get_harpoon_target_pt()
    
    temp.Subtract(this.body.GetPosition().Copy())
    temp.Normalize()
    temp.Multiply(this.harpoon_velocity)
    console.log("HARPOON V "+temp.x+" "+temp.y)
    this.harpoon_v = temp
    
  }
  else if(this.harpooning && p_dist(this.body.GetPosition(), this.harpoon_loc) >= this.harpoon_length) {
    this.harpooning = false
  }
  else if(this.harpooning) {

    if(this.player.point_intersect(this.harpoon_loc)) {
      this.harpooned = true
      this.harpooning = false
      this.harpoon_joint = new Box2D.Dynamics.Joints.b2DistanceJointDef
      this.harpoon_joint.Initialize(this.body, this.player.body, this.body.GetWorldCenter(), this.player.body.GetWorldCenter())
      this.harpoon_joint.collideConnected = true
      this.harpoon_joint = this.world.CreateJoint(this.harpoon_joint)
    }

    var temp_v = this.harpoon_v.Copy()
    temp_v.Multiply(dt/1000)
    this.harpoon_loc.Add(temp_v)

  }
  else if(this.harpooned && (this.player.body.GetPosition().x >= canvasWidth/draw_factor - 1|| this.player.body.GetPosition().x <= 1 || this.player.body.GetPosition().y >= canvasHeight/draw_factor - 1|| this.player.body.GetPosition().y <= 1)) {
    this.disengage()
  }
  else if(this.harpooned && this.player.dying) {
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
    context.lineTo(this.player.body.GetPosition().x * draw_factor, this.player.body.GetPosition().y * draw_factor)
    context.stroke()
  }
}

Harpoon.prototype.process_impulse = function() {
  this.harpooning = false
}

Harpoon.prototype.disengage = function() {
  if(this.harpooned) {
    this.world.DestroyJoint(this.harpoon_joint)
    this.harpoon_joint = null
    this.harpooned = false
  }
}

Harpoon.prototype.collide_with = function() {
  
}
