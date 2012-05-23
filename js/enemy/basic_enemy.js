var BasicEnemy = function(world, x, y, id) {
  this.init(world, x, y, id)
}

//the dampening factor that determines how much "air resistance" unit has
BasicEnemy.prototype.lin_damp = 2.99

//how fast enemies move
BasicEnemy.prototype.force = .5

//how fast enemies move when cautious
BasicEnemy.prototype.slow_force = .1

//how often enemy path_finds
BasicEnemy.prototype.pathfinding_delay = 100

//how often enemy checks to see if it can move if yielding
BasicEnemy.prototype.yield_delay = 10

BasicEnemy.prototype.init = function(world, x, y, id) {
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = 0x0011
  fixDef.filter.maskBits = 0x0012
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = new b2CircleShape(.5);
  
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = this.lin_damp
  this.body = world.CreateBody(bodyDef)
  this.body.CreateFixture(fixDef);
  this.shape = fixDef.shape
  this.path = null
  this.pathfinding_counter = 0
  this.yield_counter = 0
  this.yield = false
  this.id = id

}

BasicEnemy.prototype.process = function(enemy_index) {

  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < obstacle_polygons.length; k++)
  {
    if(pointInPolygon(obstacle_polygons[k], this.body.GetPosition()))
    {
      dead_enemies.push(enemy_index)
      return
    }
  }


  if(!this.path || this.path.length == 1 || this.pathfinding_counter == this.pathfinding_delay)
    //if this.path.length == 1, there is nothing in between the enemy and the player. In this case, it's not too expensive to check every frame to make sure the enemy doesn't kill itself
  {
    var new_path = visibility_graph.query(this.body.GetPosition(), player.body.GetPosition(), boundary_polygons)
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
    var nearby_enemies = getObjectsWithinRadius(this.body.GetPosition(), this.shape.GetRadius()*4, enemies, function(enemy) {return enemy.body.GetPosition()})
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

  //apply impulse to move enemy
  var in_poly = false
  for(var i = 0; i < obstacle_polygons.length; i++)
  {
    if(pointInPolygon(obstacle_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }

  if(!this.yield)
  {
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
  
}

BasicEnemy.prototype.draw = function(context, draw_factor) {
  context.beginPath()
	context.fillStyle = 'red';
	context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.shape.GetRadius()*draw_factor, 0, 2*Math.PI, true)
	context.fill()
}
