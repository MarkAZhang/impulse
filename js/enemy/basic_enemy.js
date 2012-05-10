var BasicEnemy = function(world, x, y) {
  this.init(world, x, y)
}

BasicEnemy.prototype.lin_damp = .96

BasicEnemy.prototype.init = function(world, x, y) {
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = new b2CircleShape(.5);
  
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = this.lin_damp
  this.body = world.CreateBody(bodyDef)
  this.body.CreateFixture(fixDef);
  this.shape = fixDef.shape
  this.f_x = 0 //horizontal movement force
  this.f_y = 0 //vertical movement force
}

BasicEnemy.prototype.process = function() {
}

BasicEnemy.prototype.draw = function(context, draw_factor) {
  context.beginPath()
	context.fillStyle = 'red';
	context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.shape.GetRadius()*draw_factor, 0, 2*Math.PI, true)
	context.fill()
}
