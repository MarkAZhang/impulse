var Player = function(world, x, y, draw_factor) {
  this.init(world, x, y, draw_factor)
}

Player.prototype.lin_damp = 3.49 //old = 2.99

Player.prototype.force = 1 //old = .5

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
  this.body.CreateFixture(fixDef).SetUserData(this);
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
  this.status = "normal"  //currently unused
  this.status_duration = [0, 0] //[locked, silenced], time left for each status
  this.attack_length = 500
  this.attack_duration = 0

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

Player.prototype.stun = function(dur) {
  this.status_duration[0] = Math.max(dur, this.status_duration[0]) //so that a short stun does not shorten a long stun
  this.status_duration[1] = Math.max(dur, this.status_duration[1]) 
}

Player.prototype.silence = function(dur) {
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
}

Player.prototype.lock = function(dur) {
  this.status_duration[0] = Math.max(dur, this.status_duration[0])
}

Player.prototype.click = function(pos, enemies) {

  if(!this.attacking && this.status_duration[1] <= 0)
  {
    this.attacking = true
    this.attack_loc = this.body.GetPosition().Copy()
    this.attack_angle = this.impulse_angle
    this.attack_duration = this.attack_length
  }

  
}

Player.prototype.process = function(dt) {
  
  if(this.status_duration[0] > 0) {
    this.status_duration[0] -= dt
  }
  if(this.status_duration[1] > 0) {
    this.status_duration[1] -= dt
  }

  this.impulse_angle = _atan({x: this.body.GetPosition().x*this.draw_factor, y: this.body.GetPosition().y*this.draw_factor}, this.mouse_pos)
  for(var k = 0; k < level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(level.obstacle_polygons[k], this.body.GetPosition()))
    {
      gameOver()
      break
    }
  }

  if(this.attacking)
  {

    
    if(this.attack_duration < 0)//attack lasts 500 ms
    {
      this.attacking = false
      this.enemies_hit = []
    }
    else
    {

      for(var i = 0; i < enemies.length; i++)
      {
        if(enemies[i] instanceof Feather) continue
        if(this.enemies_hit.indexOf(enemies[i].id)==-1 && !enemies[i].dying)//enemy has not been hit
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
            if (dist >= this.impulse_radius * (this.attack_length - this.attack_duration)/(this.attack_length + this.attack_length * .2) && dist <= this.impulse_radius * (this.attack_length - this.attack_duration + this.attack_length * .2)/(this.attack_length + this.attack_length * .2))
            {
              enemies[i].body.ApplyImpulse(new b2Vec2(this.impulse_force*Math.cos(angle), this.impulse_force*Math.sin(angle)), enemies[i].body.GetWorldCenter())
              this.enemies_hit.push(enemies[i].id)
            }
          }
        }
      }
      this.attack_duration -= dt
    }
  }
  
  if(this.status_duration[0] <= 0)
  {
    var force = Math.abs(this.f_x)+Math.abs(this.f_y)==2 ? this.force/Math.sqrt(2) : this.force;
    this.body.ApplyImpulse(new b2Vec2(this.force*this.f_x, this.force*this.f_y), this.body.GetWorldCenter())
  }
}

Player.prototype.draw = function(context) {
  context.beginPath()
	context.strokeStyle = this.status_duration[0] <= 0 ? 'black' : 'red';
	context.arc(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor, this.shape.GetRadius()*this.draw_factor, 0, 2*Math.PI, true)
  context.lineWidth = 2
	context.stroke()
  context.globalAlpha = .5
  context.fillStyle = this.status_duration[0] <= 0 ? 'black' : 'red';
  context.fill()
  context.globalAlpha = 1
  context.beginPath()
  if(this.status_duration[1] <= 0)
  {
    context.fillStyle = "rgba(0, 255, 255, 0.2)";
  }
  else
  {
    context.fillStyle = "rgba(255, 0, 0, 0.5)";
  }
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
    context.arc(this.attack_loc.x*this.draw_factor, this.attack_loc.y*this.draw_factor, (this.impulse_radius * (this.attack_length - this.attack_duration + this.attack_length * .2)/(this.attack_length + this.attack_length * .2)) * this.draw_factor,  this.attack_angle - Math.PI/3, this.attack_angle + Math.PI/3);
    context.lineWidth = 15;
    // line color
    context.strokeStyle = "rgba(0,255,255, 1)";
    context.stroke();
    
  }

}

Player.prototype.collide_with = function(other) {

}
