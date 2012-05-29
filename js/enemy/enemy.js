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
  this.dying_start = 0

}

Enemy.prototype.process = function(enemy_index) {

  if(this.dying && (new Date()).getTime() - this.dying_start > 500)
  {
    dead_enemies.push(enemy_index)
    if(this.dying=="kill")
    {
      game_numbers.kills +=1
    }
    return
  }

  if(this.dying)
  {
    return
  }
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")
      
      return
    }
  }

  if(!this.path || this.path.length == 1 || this.pathfinding_counter == this.pathfinding_delay)
    //if this.path.length == 1, there is nothing in between the enemy and the player. In this case, it's not too expensive to check every frame to make sure the enemy doesn't kill itself
  {
    var new_path = visibility_graph.query(this.body.GetPosition(), player.body.GetPosition(), level.boundary_polygons)
    if(new_path!=null)
      this.path = new_path
    this.pathfinding_counter = Math.floor(Math.random()*100)
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
  
  //check if yielding
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

  

  if(!this.yield)
  {
    this.move(endPt)
  }
  
  this.additionalProcessing()
}

Enemy.prototype.additionalProcessing = function() {

}

Enemy.prototype.move = function(endPt) {
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
    dir.Multiply(this.force)
  }
 
  this.body.ApplyImpulse(dir, this.body.GetWorldCenter())
}

Enemy.prototype.start_death = function(death) {
  this.dying_start = (new Date()).getTime()
  this.dying = death
}

Enemy.prototype.collide_with = function(player) {
//function for colliding with the player
  if(p_dist(player.body.GetPosition(), this.body.GetPosition()) > player.shape.GetRadius() + this.effective_radius)
  {
    return
  }
  if(!this.dying)//this ensures it only collides once
  {
    this.start_death("hit_player")
  }
  player.stun(0.5)
}

Enemy.prototype.draw = function(context, draw_factor) {
  if(this.dying) {
    if(this.shape instanceof b2CircleShape)
    {
      var prog = ((new Date()).getTime() - this.dying_start) / 500
      context.beginPath()
      context.globalAlpha = (1 - prog)
      context.strokeStyle = this.color
      context.lineWidth = (1 - prog) * 2
      context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.shape.GetRadius()*draw_factor) * (1 + this.death_radius * prog), 0, 2*Math.PI, true)
      context.stroke()
      context.fillStyle = this.color
      context.globalAlpha/=2
      context.fill()
      context.globalAlpha = 1
    }
    else if(this.shape instanceof b2PolygonShape)
    {
      var prog = ((new Date()).getTime() - this.dying_start) / 500
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
      context.fillStyle = this.color
      context.globalAlpha/=2
      context.fill()
      context.restore()
    }
  }
  else {
    if(this.shape instanceof b2CircleShape)
    {
      context.beginPath()
      context.strokeStyle = this.color;
      context.lineWidth = 2
      context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.shape.GetRadius()*draw_factor, 0, 2*Math.PI, true)
      context.stroke()
      context.globalAlpha = .5
      context.fillStyle = this.color
      context.fill()
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
      context.globalAlpha = .5
      context.fillStyle = this.color
      context.fill() 
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
  }
}
