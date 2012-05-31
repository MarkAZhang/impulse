var Enemy = function(world, x, y, id) {
}

Enemy.prototype.init = function(world, x, y, id) {
  var fixDef = new b2FixtureDef;
  fixDef.density = this.density;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = 0x0011
  fixDef.filter.maskBits = 0x0012
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = this.shape

  if(this.shape instanceof b2PolygonShape)
    this.points = fixDef.shape.m_vertices
  
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = this.lin_damp
  bodyDef.fixedRotation = true  //polygonShapes do not rotate
  this.body = world.CreateBody(bodyDef)
  this.body.CreateFixture(fixDef).SetUserData(this)
  this.shape = fixDef.shape
  this.path = null
  this.pathfinding_counter = 0
  this.yield_counter = 0
  this.yield = false
  this.id = id
  this.dying = false
  this.dying_length = 500
  this.dying_duration = 0
  this.do_yield = true
  this.status_duration = [0, 0, 0] //[locked, silenced, slowed], time left for each status
  this.slow_factor = .3
}

Enemy.prototype.check_death = function()
{
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")
      
      return
    }
  }
}

Enemy.prototype.process = function(enemy_index, dt) {

  if(this.dying && this.dying_duration < 0)
  {
    dead_enemies.push(enemy_index)
    return
  }

  if(this.dying )
  {
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
  
  this.check_death()

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
    this.move(endPt)
  }
  
  this.additional_processing(dt)
}

Enemy.prototype.additional_processing = function(dt) {

}

Enemy.prototype.activated_processing = function(dt) {

}

Enemy.prototype.move = function(endPt) {

  if(this.status_duration[0] > 0) return //locked

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
  if(in_poly)
  {
    dir.Multiply(this.slow_force)
  }
  else
  {
    var f = this.status_duration[2] <= 0 ? this.force : this.force * this.slow_factor
    dir.Multiply(f)
  }
 
  this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

  //if(this.shape instanceof b2PolygonShape) {
    var heading = _atan(this.body.GetPosition(), endPt)
    this.body.SetAngle(heading)
  //}
}

Enemy.prototype.start_death = function(death) {
  this.dying = death
  this.dying_duration = this.dying_length
  if(this.dying == "kill" && !player.dying) {
    game_numbers.kills +=1
    game_numbers.score += game_numbers.combo * this.score_value
    increment_combo()
  }
  
}

Enemy.prototype.collide_with = function(other) {
//function for colliding with the player

  if(other !== player) {
    return
  }
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
    player.stun(500)
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
      //var vertices = 
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
      //var vertices = 
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

Enemy.prototype.additional_drawing = function(context, draw_factor)
{

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
