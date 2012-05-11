var BasicObstacle = function(world, x, y, vertices) {
  this.init(world, x, y, vertices)
}



BasicObstacle.prototype.init = function(world, x, y, vertices) {
  var fixDef = new b2FixtureDef
  fixDef.density = 1.0
  fixDef.friction = 0.5
  fixDef.restitution = 0.2
  fixDef.isSensor = true
  var bodyDef = new b2BodyDef
  bodyDef.type = b2Body.b2_dynamicBody
  fixDef.shape = new b2PolygonShape

  fixDef.shape.SetAsArray(vertices, vertices.length)
  bodyDef.position.x = x
  bodyDef.position.y = y

  this.body = world.CreateBody(bodyDef)
  this.body.CreateFixture(fixDef);
  this.shape = fixDef.shape
  this.points = fixDef.shape.m_vertices
}

BasicObstacle.prototype.process = function() {
}

BasicObstacle.prototype.draw = function(context, draw_factor) {
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
	context.fillStyle = 'orange';
  //var vertices = 
	context.fill()

  context.restore()
  console.log(tp.x+" "+tp.y+" "+this.body.GetAngle())
}

