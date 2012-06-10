var Enemy = function(world, x, y, id, impulse_game_state) {
  //empty constructor since Enemy should not be constructed
}

Enemy.prototype.init = function(world, x, y, id, impulse_game_state) {
//need to set this.type before calling init

//need to set effective_radius if do_yield = true




  this.impulse_game_state = impulse_game_state
  this.level = impulse_game_state.level
  this.player = impulse_game_state.player
  this.world = world
  for(i in impulse_enemy_stats[this.type]) {
    this[i] = impulse_enemy_stats[this.type][i]
  }

  if(this.shape_type == "circle") {
    this.shape = new b2CircleShape(this.effective_radius)
  }
  else if(this.shape_type == "polygon") {
    var vertices = []
    for(var i= 0; i < this.shape_vertices.length; i++) {
      vertices.push(new b2Vec2(this.effective_radius * this.shape_vertices[i][0], this.effective_radius * this.shape_vertices[i][1]))
    }
    this.shape = new b2PolygonShape
    this.shape.SetAsArray(vertices, vertices.length)
  }


  var fixDef = new b2FixtureDef;//make the shape
  fixDef.density = this.density;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = 0x0011
  fixDef.filter.maskBits = 0x0012
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = this.shape

  if(this.shape instanceof b2PolygonShape) {
    this.points = fixDef.shape.m_vertices
    this.collision_polygon = getBoundaryPolygon(this.points, (this.player.r + 0.1))
  }
  
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = this.lin_damp
  bodyDef.fixedRotation = true  //polygonShapes do not rotate

  this.body = world.CreateBody(bodyDef)
  this.body.CreateFixture(fixDef).SetUserData(this)
  this.shape = fixDef.shape

  this.path = null
  
  this.yield_counter = 0    

  
  

  this.yield = false
  this.id = id
  this.dying = false
  this.dying_length = 500
  this.dying_duration = 0
  
  this.status_duration = [0, 0, 0] //[locked, silenced, slowed], time left for each status
  
  this.is_enemy = true

  this.special_mode = false
  this.special_mode_visibility_timer = 0  //helps with the flashing special_mode appearance
  this.sp_visibility = 0  


  //DEFAULTS, CAN BE OVERRIDDEN
  //how often enemy path_finds
  this.pathfinding_delay = 100
  this.pathfinding_counter =  Math.floor(Math.random()*this.pathfinding_delay)  //pathfinding_delay and yield are defined in enemy

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.slow_factor = .3

  this.do_yield = true

  this.slow_force = this.force / 3

  this.death_radius = 2
}

Enemy.prototype.check_death = function() {
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")
      
      return
    }
  }
}

Enemy.prototype.process = function(enemy_index, dt) {

  if(this.dying && this.dying_duration < 0)
  {//if expired, dispose of it
    this.level.dead_enemies.push(enemy_index)
    return
  }

  if(this.dying )
  {//if dying, expire
    this.dying_duration -= dt
    return
  }

  if(this.activated) {
    this.activated_processing(dt)
    return 
  }//for tank, and potentially other enemies

  if(this.status_duration[0] > 0) {
    this.status_duration[0] -= dt
  }
  if(this.status_duration[1] > 0) {
    this.status_duration[1] -= dt
  }
  if(this.status_duration[2] > 0) {
    this.status_duration[2] -= dt
  }

  this.special_mode_visibility_timer +=dt
  var leftover = this.special_mode_visibility_timer % 1000
  if(leftover > 500) leftover = 1000 - leftover
  this.sp_visibility = leftover/500
  
  this.check_death()

  this.move()
  
  this.additional_processing(dt)
}

Enemy.prototype.additional_processing = function(dt) {

}

Enemy.prototype.activated_processing = function(dt) {

}

Enemy.prototype.get_target_point = function() {
  return this.player.body.GetPosition()

}

Enemy.prototype.move = function() {
  if(this.player.dying) return
  var target_point = this.get_target_point()
  this.pathfinding_counter+=1
  if((this.path && this.path.length == 1 && target_point == this.player.body.GetPosition()) || this.pathfinding_counter >= 2 * this.pathfinding_delay || (this.path && this.path.length > 1 && !isVisible(this.path[this.path.length-1], this.path[this.path.length-2], this.level.obstacle_edges)))
    //if this.path.length == 1, there is nothing in between the enemy and the player. In this case, it's not too expensive to check every frame to make sure the enemy doesn't kill itself
  {
    var new_path = this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), target_point, this.level.boundary_polygons)
    if(new_path!=null)
      this.path = new_path
    this.pathfinding_counter = Math.floor(Math.random()*this.pathfinding_delay)
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

  if(isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges) && target_point == this.player.body.GetPosition()) {//if we can see the player directly, immediately make that the path
    this.path = [this.player.body.GetPosition()]
    endPt = this.path[0]
  }
  
  //check if yielding
  if(this.do_yield) {
    if(this.yield_counter == this.yield_delay)
    {
      var nearby_enemies = getObjectsWithinRadius(this.body.GetPosition(), this.effective_radius*4, this.level.enemies, function(enemy) {return enemy.body.GetPosition()})
      this.yield = false
      for(var i = 0; i < nearby_enemies.length; i++)
      {//move if the highest id enemy
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
  {//move if not yielding
    this.move_to(endPt)
  }
}

Enemy.prototype.move_to = function(endPt) {

  if(this.status_duration[0] > 0) return //locked

  var dir = new b2Vec2(endPt.x - this.body.GetPosition().x, endPt.y - this.body.GetPosition().y)
  dir.Normalize()

  this.modify_movement_vector(dir)  //primarily for Spear
  
  this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

  //if(this.shape instanceof b2PolygonShape) {
  this.set_heading(endPt)
  //}
}

Enemy.prototype.modify_movement_vector = function(dir) {
  //apply impulse to move enemy
  var in_poly = false
  for(var i = 0; i < this.level.obstacle_polygons.length; i++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }
  if(in_poly)//move cautiously...isn't very effective in preventing accidental deaths
  {
    dir.Multiply(this.slow_force)
  }
  else
  {
    if(this.status_duration[2] > 0) {
      dir.Multiply(this.slow_factor)
    }
    dir.Multiply(this.force)
  }
}

Enemy.prototype.set_heading = function(endPt) {
  var heading = _atan(this.body.GetPosition(), endPt)
  this.body.SetAngle(heading)
}

Enemy.prototype.start_death = function(death) {
  this.dying = death
  this.dying_duration = this.dying_length
  if(this.dying == "kill" && !this.player.dying) {
    //if the player hasn't died and this was a kill, increase score
    this.impulse_game_state.game_numbers.kills +=1
    this.impulse_game_state.addScoreLabel(this.impulse_game_state.game_numbers.combo * this.score_value, this.color, this.body.GetPosition().x, this.body.GetPosition().y, 20)
    this.impulse_game_state.game_numbers.score += this.impulse_game_state.game_numbers.combo * this.score_value
    this.impulse_game_state.increment_combo()
    this.impulse_game_state.check_cutoffs()
  }
  
}

Enemy.prototype.collide_with = function(other) {
//function for colliding with the player

  if(this.dying)//ensures the collision effect only activates once
    return

  if(other === this.player && this.check_player_intersection(this.player)) {
   
    this.start_death("hit_player")
    this.impulse_game_state.reset_combo()
    if(this.status_duration[1] <= 0)//do not proc if silenced
      this.player_hit_proc()
  }
}

Enemy.prototype.player_hit_proc = function() {
  //what happens when hits player
  this.player.stun(500)
}

Enemy.prototype.draw = function(context, draw_factor) {
  if(this.dying) {
    var prog = Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1)
    if(this.shape instanceof b2CircleShape)
    {
      context.beginPath()
      context.globalAlpha = (1 - prog)
      context.strokeStyle = this.color
      context.lineWidth = (1 - prog) * 2
      context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.shape.GetRadius()*draw_factor) * (1 + this.death_radius * prog), 0, 2*Math.PI, true)
      context.stroke()
      context.fillStyle = this.interior_color ? this.interior_color : this.color
      context.globalAlpha/=2
      context.fill()
      context.globalAlpha = 1
    }
    else if(this.shape instanceof b2PolygonShape)
    {
      var tp = this.body.GetPosition()
      context.save();
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.body.GetAngle());
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
      
      context.beginPath()
      context.globalAlpha = (1 - prog)
      context.strokeStyle = this.color
      context.lineWidth = (1 - prog) * 2
      context.moveTo((tp.x+this.points[0].x*(1 + this.death_radius * prog))*draw_factor, (tp.y+this.points[0].y*(1 + this.death_radius * prog))*draw_factor)
      for(var i = 1; i < this.points.length; i++)
      {
        context.lineTo((tp.x+this.points[i].x*(1 + this.death_radius * prog))*draw_factor, (tp.y+this.points[i].y*(1 + this.death_radius * prog))*draw_factor)
      }
      context.closePath()
      context.stroke()
      context.fillStyle = this.interior_color ? this.interior_color : this.color
      context.globalAlpha/=2
      context.fill()
      context.restore()
    }
  }
  else {

    context.globalAlpha = this.visibility ? this.visibility : 1
    if(this.shape instanceof b2CircleShape)
    {
      context.beginPath()
      context.strokeStyle = this.status_duration[0] <= 0 ? this.color : 'red';
      context.strokeStyle = this.status_duration[2] <= 0 ? context.strokeStyle : 'yellow'
      context.lineWidth = 2
      context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.shape.GetRadius()*draw_factor, 0, 2*Math.PI, true)
      context.stroke()
      context.globalAlpha = this.visibility ? this.visibility/2 : .5

      context.fillStyle = this.interior_color ? this.interior_color : this.color
      
      context.fill()
      if(this.status_duration[0] > 0)
      {
        context.fillStyle = 'red'
        context.globalAlpha = .5
        context.fill()
      }
      else if(this.status_duration[2] > 0)
      {
        context.fillStyle = 'yellow'
        context.globalAlpha = .5
        context.fill()
      }
      else if(this.status_duration[1] > 0)
      {
        context.fillStyle = 'gray'
        context.globalAlpha = .5
        context.fill()
      }
      if(this.special_mode) {
        context.beginPath()
        context.strokeStyle = this.color
        context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.shape.GetRadius()*draw_factor * 2, 0, 2*Math.PI, true)
        context.lineWidth = 1
        context.stroke()
      }
      context.globalAlpha = 1

    }
    else if(this.shape instanceof b2PolygonShape)
    {
      var tp = this.body.GetPosition()
      context.save();
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.body.GetAngle());
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
      
      context.beginPath()
      
      context.moveTo((tp.x+this.points[0].x)*draw_factor, (tp.y+this.points[0].y)*draw_factor)
      for(var i = 1; i < this.points.length; i++)
      {
        context.lineTo((tp.x+this.points[i].x)*draw_factor, (tp.y+this.points[i].y)*draw_factor)
      }
      context.closePath()
      context.lineWidth = 2

      
      context.strokeStyle = this.color
      context.stroke()
      context.globalAlpha = this.visibility ? this.visibility/2 : .5
      context.fillStyle = this.interior_color ? this.interior_color : this.color
      context.fill() 
      if(this.status_duration[0] > 0)
      {
        context.fillStyle = 'red'
        context.globalAlpha = .5
        context.fill()
      }
      else if(this.status_duration[2] > 0)
      {
        context.fillStyle = 'yellow'
        context.globalAlpha = .5
        context.fill()
      }
      else if(this.status_duration[1] > 0)
      {
        context.fillStyle = 'gray'
        context.globalAlpha = 1
        context.fill()
      }
      if(this.special_mode) {
        context.globalAlpha = this.sp_visibility
         context.beginPath()
      
        context.moveTo((tp.x+this.points[0].x * 2)*draw_factor, (tp.y+this.points[0].y * 2)*draw_factor)
        for(var i = 1; i < this.points.length; i++)
        {
          context.lineTo((tp.x+this.points[i].x * 2)*draw_factor, (tp.y+this.points[i].y * 2)*draw_factor)
        }
        context.closePath()
        context.strokeStyle = this.color
        //var vertices = 
        context.lineWidth = 1
        context.stroke()
      }

      context.restore()
      context.globalAlpha = 1
    }
    this.additional_drawing(context, draw_factor)
  }
}

Enemy.prototype.additional_drawing = function(context, draw_factor) {
}

Enemy.prototype.pre_draw = function(context, draw_factor) {
//things that should be drawn before anything else in the world

}

Enemy.prototype.process_impulse = function() {

}

Enemy.prototype.stun = function(dur) {
  this.status_duration[0] = Math.max(dur, this.status_duration[0]) //so that a short stun does not shorten a long stun
  this.status_duration[1] = Math.max(dur, this.status_duration[1]) 
}

Enemy.prototype.silence = function(dur) {
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
}

Enemy.prototype.lock = function(dur) {
  this.status_duration[0] = Math.max(dur, this.status_duration[0])
}

Enemy.prototype.slow = function(dur) {
  this.status_duration[2] = Math.max(dur, this.status_duration[2])
}

Enemy.prototype.check_player_intersection = function(other) {

  
  if(this.collision_polygon) {
    var temp_vec = {x: other.body.GetPosition().x - this.body.GetPosition().x, y: other.body.GetPosition().y - this.body.GetPosition().y}
    var temp_ang = _atan({x:0, y:0}, temp_vec)
    var temp_mag = Math.sqrt(Math.pow(temp_vec.x, 2) + Math.pow(temp_vec.y, 2))
    var rotated_vec = {x: temp_mag * Math.cos(temp_ang - this.body.GetAngle()), y: temp_mag * Math.sin(temp_ang - this.body.GetAngle())}
    return pointInPolygon(this.collision_polygon, rotated_vec)
  }
  else
  {
    return (p_dist(other.body.GetPosition(), this.body.GetPosition()) <= other.shape.GetRadius() + this.effective_radius + 0.1)
  }
}
