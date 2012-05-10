var BasicObstacle = function(world, vertices) {
  this.init(world, vertices)
}



BasicObstacle.prototype.init = function(world, x, y, vertices) {
  return
  var polygon = new b2PolygonShape()
  polygon.Set(vertices, vertices.length)
  var polyBd = new b2BodyDef();
  polyBd.AddShape(polygon);
  polyBd.position.Set(x, y);

  this.body = world.CreateBody(circleBd);
  this.body.m_linearDamping = this.lin_damp;
  this.shape = this.body.GetShapeList()

}

BasicObstacle.prototype.process = function() {
}

BasicObstacle.prototype.draw = function(context, draw_factor) {
  context.beginPath()
	context.fillStyle = 'orange';
  //var vertices = 
	context.fill()
}

