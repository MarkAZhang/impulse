var BasicObstacle = function(world, x, y, vertices) {
  this.init(world, x, y, vertices)
}



BasicObstacle.prototype.init = function(world, x, y, verticeSet) {


  var bodyDef = new b2BodyDef
  bodyDef.type = b2Body.b2_dynamicBody
  bodyDef.position.x = x
  bodyDef.position.y = y
  this.body = world.CreateBody(bodyDef)


  for(var vertices = 0; vertices < verticeSet.length; vertices++)
  {
    var fixDef = new b2FixtureDef
    fixDef.density = 1.0
    fixDef.friction = 0.5
    fixDef.restitution = 0.2
    fixDef.isSensor = true
    
    fixDef.shape = new b2PolygonShape

    fixDef.shape.SetAsArray(verticeSet[vertices], verticeSet[vertices].length)
    this.body.CreateFixture(fixDef);
  
  }
  
  this.verticeSet = verticeSet
}

BasicObstacle.prototype.process = function() {
}

BasicObstacle.prototype.draw = function(context, draw_factor) {
  var tp = this.body.GetPosition()
  context.save();
  context.translate(tp.x * draw_factor, tp.y * draw_factor);
  context.rotate(this.body.GetAngle());
  context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
  
  for(var vertices = 0; vertices < this.verticeSet.length; vertices++)
  {
    var points = this.verticeSet[vertices]
    context.beginPath()
    
    context.moveTo((tp.x+points[0].x)*draw_factor, (tp.y+points[0].y)*draw_factor)
    for(var i = 1; i < points.length; i++)
    {
      context.lineTo((tp.x+points[i].x)*draw_factor, (tp.y+points[i].y)*draw_factor)
    }
    context.closePath()
    context.fillStyle = 'orange';
    //var vertices = 
    context.fill()
  }

  context.restore()
}

