var Player = function(world, x, y, draw_factor) {
  this.init(world, x, y, draw_factor)
}

Player.prototype.lin_damp = 2.99

Player.prototype.force = .5

Player.prototype.impulse_force = 50

Player.prototype.impulse_radius = 10

Player.prototype.init = function(world, x, y, draw_factor) {
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
  this.attacking = false
  this.attack_start = 0
  this.enemies_hit = [] //stores ids of enemies hit
  this.attack_loc = {}
  this.attack_angle = 0
  this.mouse_pos = {}//keeps track of last mouse position on player's part
  this.draw_factor = draw_factor

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

Player.prototype.mouseMove = function(pos) {
  this.mouse_pos = pos
}


Player.prototype.click = function(pos, enemies) {

  if(!this.attacking)
  {
    this.attacking = true
    this.attack_start = (new Date()).getTime()
    this.attack_loc = this.body.GetPosition().Copy()
    this.attack_angle = this.impulse_angle
  }

  
}

Player.prototype.process = function() {

  this.impulse_angle = _atan({x: this.body.GetPosition().x*this.draw_factor, y: this.body.GetPosition().y*this.draw_factor}, this.mouse_pos)
  for(var k = 0; k < obstacle_polygons.length; k++)
  {
    if(pointInPolygon(obstacle_polygons[k], this.body.GetPosition()))
    {
      gameOver()
      break
    }
  }

  if(this.attacking)
  {
    var cur_time = (new Date()).getTime()
    if(cur_time > this.attack_start + 500)//attack lasts 500 ms
    {
      this.attacking = false
      this.enemies_hit = []
    }
    else
    {

      for(var i = 0; i < enemies.length; i++)
      {
        if(this.enemies_hit.indexOf(enemies[i].id)==-1)//enemy has not been hit
        {
          var angle = _atan(this.attack_loc, enemies[i].body.GetPosition())
          
          var struck;

          if(this.attack_angle < -Math.PI/6)
          {
            struck = angle <= this.attack_angle + Math.PI/3 || angle >= this.attack_angle + 5*Math.PI/3
          }
          else if(this.attack_angle > 7*Math.PI/6)
          {
            struck = angle <= this.attack_angle - 5*Math.PI/3 || angle >= this.attack_angle - Math.PI/3
          }
          else
            struck = angle>=this.attack_angle - Math.PI/3 && angle <= this.attack_angle + Math.PI/3
          
          if(struck)
          {
            var dist = this.attack_loc.Copy()
            dist.Subtract(enemies[i].body.GetPosition())
            dist = dist.Normalize()
            if (dist >= this.impulse_radius * (cur_time - this.attack_start)/600 && dist <= this.impulse_radius * (cur_time - this.attack_start + 100)/600)
            {
              enemies[i].body.ApplyImpulse(new b2Vec2(this.impulse_force*Math.cos(angle), this.impulse_force*Math.sin(angle)), enemies[i].body.GetWorldCenter())
              this.enemies_hit.push(enemies[i].id)
            }
          }
        }
      }
    }

  }
  
  var force = Math.abs(this.f_x)+Math.abs(this.f_y)==2 ? this.force/Math.sqrt(2) : this.force;
  this.body.ApplyImpulse(new b2Vec2(this.force*this.f_x, this.force*this.f_y), this.body.GetWorldCenter())
}

Player.prototype.draw = function(context) {
  context.beginPath()
	context.fillStyle = 'black';
	context.arc(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor, this.shape.GetRadius()*this.draw_factor, 0, 2*Math.PI, true)
	context.fill()
  context.beginPath()
  context.fillStyle = "rgba(0, 255, 255, 0.2)";
  context.arc(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor, this.impulse_radius * this.draw_factor, this.impulse_angle - Math.PI/3, this.impulse_angle + Math.PI/3)
  context.moveTo(this.body.GetPosition().x*this.draw_factor + Math.cos(this.impulse_angle - Math.PI/3) * this.impulse_radius * this.draw_factor, this.body.GetPosition().y*this.draw_factor + Math.sin(this.impulse_angle - Math.PI/3) * this.impulse_radius * this.draw_factor)
  context.lineTo(this.body.GetPosition().x*this.draw_factor + Math.cos(this.impulse_angle + Math.PI/3) * this.impulse_radius * this.draw_factor, this.body.GetPosition().y*this.draw_factor + Math.sin(this.impulse_angle + Math.PI/3) * this.impulse_radius * this.draw_factor)
  context.lineTo(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor)
  context.closePath()
  context.fill()

  if(player.attacking)
  {
    var cur_time = (new Date()).getTime()
    context.beginPath();
    context.lineWidth = this.impulse_radius * 1/6 * this.draw_factor
    context.arc(this.attack_loc.x*this.draw_factor, this.attack_loc.y*this.draw_factor, (this.impulse_radius * (cur_time - this.attack_start + 100)/600) * this.draw_factor,  this.attack_angle - Math.PI/3, this.attack_angle + Math.PI/3);
    context.lineWidth = 15;
    // line color
    context.strokeStyle = "rgba(0,255,255)";
    context.stroke();
    
  }

}

