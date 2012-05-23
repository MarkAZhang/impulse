var Player = function(world, x, y) {
  this.init(world, x, y)
}

Player.prototype.lin_damp = 2.99

Player.prototype.force = .5

Player.prototype.impulse_force = 50

Player.prototype.impulse_radius = 10

Player.prototype.init = function(world, x, y) {
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = 0x0003
  fixDef.filter.maskBits = 0x0003
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
  this.impulse_angle = 0

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

Player.prototype.mouseMove = function(pos, draw_factor) {
  this.impulse_angle = _atan({x: this.body.GetPosition().x*draw_factor, y: this.body.GetPosition().y*draw_factor}, pos)
}


Player.prototype.click = function(pos, enemies) {
  console.log(this.impulse_angle)
  for(var i = 0; i < enemies.length; i++)
  {
    var angle = _atan(this.body.GetPosition(), enemies[i].body.GetPosition())
    
    var struck;

    if(this.impulse_angle < -Math.PI/6)
    {
      struck = angle <= this.impulse_angle + Math.PI/3 || angle >= this.impulse_angle + 5*Math.PI/3
    }
    else if(this.impulse_angle > 7*Math.PI/6)
    {
      struck = angle <= this.impulse_angle - 5*Math.PI/3 || angle >= this.impulse_angle - Math.PI/3
    }
    else
      struck = angle>=this.impulse_angle - Math.PI/3 && angle <= this.impulse_angle + Math.PI/3
    
    if(struck)
    {
      var dist = this.body.GetPosition().Copy()
      dist.Subtract(enemies[i].body.GetPosition())
      dist = dist.Normalize()
      if (dist <= this.impulse_radius)
      {
        enemies[i].body.ApplyImpulse(new b2Vec2(this.impulse_force*Math.cos(angle), this.impulse_force*Math.sin(angle)), enemies[i].body.GetWorldCenter())
      }
    }
  }
}

Player.prototype.process = function() {

  for(var k = 0; k < obstacle_polygons.length; k++)
  {
    if(pointInPolygon(obstacle_polygons[k], this.body.GetPosition()))
    {
      gameOver()
      break
    }
  }
  
  var force = Math.abs(this.f_x)+Math.abs(this.f_y)==2 ? this.force/Math.sqrt(2) : this.force;
  this.body.ApplyImpulse(new b2Vec2(this.force*this.f_x, this.force*this.f_y), this.body.GetWorldCenter())
}

Player.prototype.draw = function(context, draw_factor) {
  context.beginPath()
	context.fillStyle = 'black';
	context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.shape.GetRadius()*draw_factor, 0, 2*Math.PI, true)
	context.fill()
  context.beginPath()
  context.fillStyle = "rgba(0, 255, 255, 0.5)";
  context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.impulse_radius * draw_factor, this.impulse_angle - Math.PI/3, this.impulse_angle + Math.PI/3)
  context.moveTo(this.body.GetPosition().x*draw_factor + Math.cos(this.impulse_angle - Math.PI/3) * this.impulse_radius * draw_factor, this.body.GetPosition().y*draw_factor + Math.sin(this.impulse_angle - Math.PI/3) * this.impulse_radius * draw_factor)
  context.lineTo(this.body.GetPosition().x*draw_factor + Math.cos(this.impulse_angle + Math.PI/3) * this.impulse_radius * draw_factor, this.body.GetPosition().y*draw_factor + Math.sin(this.impulse_angle + Math.PI/3) * this.impulse_radius * draw_factor)
  context.lineTo(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor)
  context.closePath()
  context.fill()

}

