var Player = function(world, x, y) {
  this.init(world, x, y)
}

Player.prototype.lin_damp = 2.99

Player.prototype.force = .5

Player.prototype.init = function(world, x, y) {
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

Player.prototype.keyDown = function(keyCode) {
  switch(keyCode)
  {
    case 65:
      this.f_x = -1;
      break;
    case 68:
      this.f_x = 1;
      break;
    case 83:
      this.f_y = 1;
      break;
    case 87:
      this.f_y = -1;
      break;
  }
}

Player.prototype.keyUp = function(keyCode) {
  switch(keyCode)
  {
    case 65:
      this.f_x = 0;
      break;
    case 68:
      this.f_x = 0;
      break;
    case 83:
      this.f_y = 0;
      break;
    case 87:
      this.f_y = 0;
      break;
  }
}

Player.prototype.process = function() {
  var force = Math.abs(this.f_x)+Math.abs(this.f_y)==2 ? this.force/Math.sqrt(2) : this.force;
  this.body.ApplyImpulse(new b2Vec2(this.force*this.f_x, this.force*this.f_y), this.body.GetWorldCenter())
}

Player.prototype.draw = function(context, draw_factor) {
  context.beginPath()
	context.fillStyle = 'black';
	context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.shape.GetRadius()*draw_factor, 0, 2*Math.PI, true)
	context.fill()
}

