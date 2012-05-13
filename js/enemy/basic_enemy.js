var BasicEnemy = function(world, x, y) {
  this.init(world, x, y)
}

BasicEnemy.prototype.lin_damp = 2.99

BasicEnemy.prototype.force = .5

BasicEnemy.prototype.pathfinding_delay = 100

BasicEnemy.prototype.init = function(world, x, y) {
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

}

BasicEnemy.prototype.process = function(enemy_index) {

  for(var k = 0; k < obstacle_polygons.length; k++)
  {
    if(pointInPolygon(obstacle_polygons[k], this.body.GetPosition()))
    {
      console.log("ENEMY DEATH")
      console.log(obstacle_polygons[k])
      console.log(this.body.GetPosition())
      dead_enemies.push(enemy_index)
      return
    }
  }

  if(!this.path || this.path.length == 1 || this.pathfinding_counter == this.pathfinding_delay)
    //if this.path.length == 1, there is nothing in between the enemy and the player. In this case, it's not too expensive to check every frame to make sure the enemy doesn't kill itself
  {
    var new_path = visibility_graph.query(this.body.GetPosition(), player.body.GetPosition(), obstacle_polygons)
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

  var dir = new b2Vec2(endPt.x - this.body.GetPosition().x, endPt.y - this.body.GetPosition().y)
  dir.Normalize()
  dir.Multiply(this.force)

  this.body.ApplyImpulse(dir, this.body.GetWorldCenter())
  
}

BasicEnemy.prototype.draw = function(context, draw_factor) {
  context.beginPath()
	context.fillStyle = 'red';
	context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.shape.GetRadius()*draw_factor, 0, 2*Math.PI, true)
	context.fill()
}
