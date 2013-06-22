//currently 15 by 15px

var Player = function(world, x, y, impulse_game_state) {
  this.init(world, x, y, impulse_game_state)
}

Player.prototype.lin_damp = 3.5//old = 3

Player.prototype.true_force = 1//old = .5

Player.prototype.impulse_force = 50

Player.prototype.impulse_radius = 10

Player.prototype.impulse_width = 1/32

Player.prototype.impulse_target_color = impulse_colors["impulse_target_blue"]
Player.prototype.impulse_color = impulse_colors["impulse_blue"]

Player.prototype.density = 9/16

Player.prototype.radius = .66
Player.prototype.effective_radius = .66

Player.prototype.init = function(world, x, y, impulse_game_state) {
  if(player_data.difficulty_mode == "easy") {
    this.density *= 1.5;
    this.true_force *= 1.5;
  }
  var fixDef = new b2FixtureDef;
  fixDef.density = this.density;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = imp_vars.PLAYER_BIT
  fixDef.filter.maskBits = imp_vars.ENEMY_BIT | imp_vars.WALL_BIT | imp_vars.BOSS_BITS
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
  fixDef.shape = new b2CircleShape(Player.prototype.radius);
  this.r = Player.prototype.radius;
  this.level = impulse_game_state.level
  this.impulse_game_state = impulse_game_state
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = this.lin_damp
  this.body = world.CreateBody(bodyDef)
  this.body.CreateFixture(fixDef).SetUserData({"owner": this, "body": this.body, "self": this});
  this.shape = fixDef.shape


  this.points_polar_form = []
  for(var i = 0; i < 4; i++) {
    this.points_polar_form.push({r: .5, ang: i * Math.PI/2})
  }

  this.left = false
  this.right = false
  this.down = false
  this.up = false
  this.ileft = null
  this.iright = null
  this.idown = null
  this.iup = null
  this.impulse_angle = 0
  this.attacking = false
  this.attack_start = 0
  this.enemies_hit = [] //stores ids of enemies hit
  this.attack_loc = {}
  this.attack_angle = 0
  this.mouse_pos = {x: 0, y: 0}//keeps track of last mouse position on player's part
  this.draw_factor = impulse_game_state.draw_factor
  this.status = "normal"  //currently unused
  this.status_duration = [0, 0, 0, 0, 0, 0] //[locked, silenced, gooed, lighten, confuse, bulk], time left for each status
  this.attack_length = 500
  this.attack_duration = 0
  this.slow_factor = .3
  this.dying = false
  this.dying_length = 1000
  this.dying_duration = 0
  this.color = impulse_colors["player_color"]
  this.force = this.true_force
  this.bulk_factor = 10

  this.lighten_factor = 2

  this.last_mouse_down = 0
  this.mouse_pressed = false

}

Player.prototype.keyDown = function(keyCode) {
  switch(keyCode)
  {
    case imp_vars.keys.LEFT_KEY:
      this.left = true
      break;
    case imp_vars.keys.RIGHT_KEY:
      this.right = true
      break;
    case imp_vars.keys.DOWN_KEY:
      this.down = true
      break;
    case imp_vars.keys.UP_KEY:
      this.up = true
      break;
    case imp_vars.keys.PAUSE:
      this.up = false
      this.down = false
      this.left = false
      this.right = false
      this.ileft = null
      this.iright = null
      this.iup = null
      this.idown = null
      break
    case imp_vars.keys.ILEFT_KEY:
      this.ileft = (new Date()).getTime()
      break;
    case imp_vars.keys.IUP_KEY:
      this.iup = (new Date()).getTime()
      break;
    case imp_vars.keys.IRIGHT_KEY:
      this.iright = (new Date()).getTime()
      break;
    case imp_vars.keys.IDOWN_KEY:
      this.idown = (new Date()).getTime()
      break;
  }
}

Player.prototype.keyUp = function(keyCode) {
  switch(keyCode)
  {
    case imp_vars.keys.LEFT_KEY:
      this.left = false
      break;
    case imp_vars.keys.RIGHT_KEY:
      this.right = false
      break;
    case imp_vars.keys.DOWN_KEY:
      this.down = false
      break;
    case imp_vars.keys.UP_KEY:
      this.up = false
      break;
    case imp_vars.keys.ILEFT_KEY:
      this.ileft = null
      break;
    case imp_vars.keys.IUP_KEY:
      this.iup = null
      break;
    case imp_vars.keys.IRIGHT_KEY:
      this.iright = null
      break;
    case imp_vars.keys.IDOWN_KEY:
      this.idown = null
      break;
    case imp_vars.keys.PAUSE_KEY:
      this.up = false
      this.down = false
      this.left = false
      this.right = false
      this.ileft = null
      this.iright = null
      this.iup = null
      this.idown = null
      break
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

Player.prototype.goo = function(dur) {
  this.status_duration[2] = Math.max(dur, this.status_duration[2])
}

Player.prototype.lighten = function(dur) {
  this.status_duration[3] = Math.max(dur, this.status_duration[3])
  this.last_lighten = this.status_duration[3]
  this.lighten_start = 1
  this.lighten_finish = 1/this.lighten_factor
}

Player.prototype.bulk = function(dur) {
  this.status_duration[5] = Math.max(dur, this.status_duration[5])
}

Player.prototype.confuse= function(dur) {
  this.confuse_duration = dur;
  this.status_duration[4] = Math.max(dur, this.status_duration[4])
}

Player.prototype.mouse_down= function(pos) {
  this.last_mouse_down = (new Date()).getTime()
  this.mouse_pressed = true
}

Player.prototype.mouse_up= function(pos) {
  this.mouse_pressed = false
}

Player.prototype.process = function(dt) {
 if(this.dying && this.dying_duration < 0)
  {
    /*if(this.impulse_game_state instanceof ImpulseGameState) {
      this.impulse_game_state.game_over()
      return
    }
    else if(this.impulse_game_state instanceof HowToPlayState) {
      this.impulse_game_state.reload_world()
      return
    }*/
  }

  if(this.dying )
  {
    this.dying_duration -= dt
    return
  }


  if(this.status_duration[0] > 0) {
    this.status_duration[0] -= dt
  }
  if(this.status_duration[1] > 0) {
    this.status_duration[1] -= dt
  }
  if(this.status_duration[2] > 0) {
    this.status_duration[2] -= dt
    this.body.SetLinearDamping(this.lin_damp * 3)
  }
  else if (this.status_duration[3] > 0){
    this.status_duration[3] -= dt
    if(!this.is_lightened) {
      this.is_lightened = true
      var fixtures = this.body.GetFixtureList()
      if (fixtures.length === undefined) {
        fixtures = [fixtures]
      }
      for(var i = 0; i < fixtures.length; i++) {
        fixtures[i].m_shape.m_radius /= this.lighten_factor
        //fixtures[i].SetDensity(this.density/3)
      }
      this.body.ResetMassData()
      this.force = this.true_force/this.lighten_factor/this.lighten_factor
    }
  }
  else {
    if(this.is_lightened) {
      this.is_lightened = false
      var fixtures = this.body.GetFixtureList()
      if (fixtures.length === undefined) {
        fixtures = [fixtures]
      }
      for(var i = 0; i < fixtures.length; i++) {
        fixtures[i].m_shape.m_radius *= this.lighten_factor
        //fixtures[i].SetDensity(this.density)
      }
      this.body.ResetMassData()
      this.force = this.true_force

    }
    this.body.SetLinearDamping(this.lin_damp)
  }

  if(this.status_duration[4] > 0) {
    this.status_duration[4] -= dt
  }

  if(this.status_duration[5] > 0) {
    this.status_duration[5] -= dt
    var fixtures = this.body.GetFixtureList()
    if (fixtures.length === undefined) {
      fixtures = [fixtures]
    }
    for(var i = 0; i < fixtures.length; i++) {

      fixtures[i].SetDensity(this.density*this.bulk_factor)
    }
    this.force = this.true_force * this.bulk_factor
    this.body.ResetMassData()

  } else {
    var fixtures = this.body.GetFixtureList()
    if (fixtures.length === undefined) {
      fixtures = [fixtures]
    }
    for(var i = 0; i < fixtures.length; i++) {
      fixtures[i].SetDensity(this.density)
    }
    this.force = this.true_force
    this.body.ResetMassData()
  }


  cur_time = (new Date()).getTime()

  if(player_data.options.control_scheme == "mouse") {
    if((this.mouse_pressed || cur_time - this.last_mouse_down < 100) && !this.attacking && this.status_duration[1] <= 0)
    {
      this.attacking = true
      this.attack_loc = this.body.GetPosition().Copy()
      this.attack_angle = this.impulse_angle
      this.attack_duration = this.attack_length
      impulse_music.play_sound("impulse")
    }

    this.impulse_angle = _atan({x: this.body.GetPosition().x*this.draw_factor, y: this.body.GetPosition().y*this.draw_factor}, this.mouse_pos)
  } else if(player_data.options.control_scheme == "keyboard") {
    if(!this.attacking && this.status_duration[1] <= 0) {
      var earliest_key_press = 0
      if(this.ileft != null && this.ileft > earliest_key_press) earliest_key_press = this.ileft
      if(this.iright != null && this.iright > earliest_key_press) earliest_key_press = this.iright
      if(this.iup != null && this.iup > earliest_key_press) earliest_key_press = this.iup
      if(this.idown != null && this.idown > earliest_key_press) earliest_key_press = this.idown


      if(earliest_key_press != 0 && (new Date().getTime() - earliest_key_press > 40)) {
        if(this.ileft != null && this.iup != null) {
          this.attack_angle = Math.PI * 5/4
        }
        else if(this.ileft != null && this.idown != null) {
          this.attack_angle = Math.PI * 3/4
        }
        else if(this.iright != null && this.iup != null) {
          this.attack_angle = Math.PI * 7/4
        }
        else if(this.iright != null && this.idown != null) {
          this.attack_angle = Math.PI * 1/4
        }
        else if(this.ileft != null) {
          this.attack_angle = Math.PI
        }
        else if(this.iright != null) {
          this.attack_angle = 0
        }
        else if(this.iup != null) {
          this.attack_angle = Math.PI * 3/2
        }
        else if(this.idown != null) {
          this.attack_angle = Math.PI * 1/2
        }
        if (this.status_duration[4] > 0) {
          this.attack_angle += Math.PI
        }
        this.attacking = true
        this.attack_loc = this.body.GetPosition().Copy()
        this.attack_duration = this.attack_length
        impulse_music.play_sound("impulse")
      }
    }


  }

  this.body.SetAngle(this.impulse_angle)

  if (this.status_duration[4] > 0) {
    this.impulse_angle += Math.PI
  }
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death()
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

      for(var i = 0; i < this.level.enemies.length; i++)
      {
        if(this.level.enemies[i] instanceof Mote && this.level.enemies[i].status_duration[1] <= 0) continue

        if(this.level.enemies[i] instanceof BossOne) this.level.enemies[i].process_impulse_on_hands(this.attack_loc, this.impulse_force);

        if(this.enemies_hit.indexOf(this.level.enemies[i].id)==-1 && !this.level.enemies[i].dying)//enemy has not been hit
        {
          var impulse_sensitive_points = this.level.enemies[i].get_impulse_sensitive_pts()

          for(var j = 0; j < impulse_sensitive_points.length; j++) {

            if(this.point_in_impulse_angle(impulse_sensitive_points[j]))
            {

              if (this.point_in_impulse_dist(impulse_sensitive_points[j], this.level.enemies[i].body.GetLinearVelocity().Length() > 20))
              {
                var angle = _atan(this.attack_loc, impulse_sensitive_points[j])//not sure if it should be this point
                this.enemies_hit.push(this.level.enemies[i].id)
                this.level.enemies[i].process_impulse(this.attack_loc, this.impulse_force, angle)
                break
              }
              if(this.level.enemies[i] instanceof Harpoon && this.level.enemies[i].harpoon_state == "engaged") {
                this.level.enemies[i].disengage_harpoon()
              }
            }
          }
        }

        // if Harpoon, also check the Head
        if(this.level.enemies[i] instanceof Harpoon && this.level.enemies[i].harpoon_state != "inactive") {
          var this_harpoon_head = this.level.enemies[i].harpoon_head;
          var impulse_sensitive_points = this_harpoon_head.get_impulse_sensitive_pts()

          for(var j = 0; j < impulse_sensitive_points.length; j++) {

            if(this.point_in_impulse_angle(impulse_sensitive_points[j]))
            {

              if (this.point_in_impulse_dist(impulse_sensitive_points[j], this.level.enemies[i].body.GetLinearVelocity().Length() > 20))
              {
                var angle = _atan(this.attack_loc, impulse_sensitive_points[j])//not sure if it should be this point
                this_harpoon_head.process_impulse(this.attack_loc, this.impulse_force, angle)
              }
            }
          }
        }
      }
      this.attack_duration -= dt
    }
  }

  if(this.status_duration[0] <= 0)
  {
    var f = this.force
    var f_x = 0
    var f_y = 0
    if(this.left) f_x -= 1
    if(this.right) f_x += 1
    if(this.up) f_y -= 1
    if(this.down) f_y += 1


    var force = Math.abs(f_x)+Math.abs(f_y)==2 ? f/Math.sqrt(2) : f;

    if(this.status_duration[4] > 0) {
      f_x *= -1
      f_y *= -1
    }
    this.body.ApplyImpulse(new b2Vec2(force*f_x, force*f_y), this.body.GetWorldCenter())
  }
}

Player.prototype.point_in_impulse_angle = function(pt) {
  var angle = _atan(this.attack_loc, pt)

  var struck;

  if(this.attack_angle < -Math.PI * 2/3)
  {
    struck = angle <= this.attack_angle + Math.PI/3 || angle >= this.attack_angle + 5*Math.PI/3
  }
  else if(this.attack_angle > 2*Math.PI/3)
  {
    struck = angle <= this.attack_angle - 5*Math.PI/3 || angle >= this.attack_angle - Math.PI/3
  }
  else
    struck = angle>=this.attack_angle - Math.PI/3 && angle <= this.attack_angle + Math.PI/3

  return struck
}

Player.prototype.point_in_impulse_dist = function(pt, fast) {
  var lighten_factor = this.get_lighten_factor()
  var dist = this.attack_loc.Copy()
  dist.Subtract(pt)
  dist = dist.Normalize()
  var speedy_factor = fast ? this.impulse_width * 4: this.impulse_width * 2

  return dist >= this.impulse_radius * lighten_factor * (((this.attack_length - this.attack_duration)/this.attack_length) - speedy_factor)
   && dist <= this.impulse_radius * lighten_factor * (((this.attack_length - this.attack_duration)/this.attack_length) + speedy_factor)
}

Player.prototype.draw = function(context) {
  if(this.dying) {

  }
  else {

    /*context.beginPath()

    context.strokeStyle = this.color
    context.arc(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor, this.shape.GetRadius()*this.draw_factor, 0, 2*Math.PI, true)
    context.lineWidth = 2
    context.stroke()
    context.globalAlpha = .5
    context.fillStyle = this.color
    context.fill()*/
    context.save()
    if(this.status_duration[4] > 0)
    {
      context.beginPath()
      var prop = Math.max(((this.confuse_duration-this.status_duration[4]) / this.confuse_duration), 0)
      context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * prop, true)
      context.lineWidth = 2
      context.strokeStyle = "#24ac40"
      context.stroke()
    }
    if(this.status_duration[0] > 0)
    {
      this.draw_player_sprite(context, "player_red");
    }
    else if(this.status_duration[1] > 0)
    {
      this.draw_player_sprite(context, "player_gray");
    }
    else if(this.status_duration[2] > 0)
    {
      this.draw_player_sprite(context, "player_yellow");
    }
    else if(this.status_duration[4] > 0)
    {
      this.draw_player_sprite(context, "player_green");
    } else {
      //normal
      /*context.beginPath()
      context.shadowBlur = 10;
      context.shadowColor = impulse_colors["impulse_blue"];
      context.fillStyle = impulse_colors["impulse_blue"];
      context.arc(this.body.GetPosition().x * this.draw_factor, this.body.GetPosition().y * this.draw_factor, this.shape.GetRadius() * this.draw_factor, 0, 2*Math.PI, true)
      context.fill()
      context.shadowBlur = 0;*/
        this.draw_player_sprite(context, "player_normal");
      }
      var lighten_factor = this.get_lighten_factor()

    if(this.status_duration[3] > 0) {
      context.beginPath()
      context.arc(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor,
       this.radius* lighten_factor * this.draw_factor, 0, 2* Math.PI, false)
      context.strokeStyle = "black"
      context.stroke()

    }
    context.beginPath()

    if(player_data.options.impulse_shadow) {
      if (this.status_duration[1] <= 0 && player_data.options.control_scheme == "mouse") {
        context.fillStyle = this.impulse_target_color

        context.arc(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor, this.impulse_radius * lighten_factor* this.draw_factor, this.impulse_angle - Math.PI/3, this.impulse_angle + Math.PI/3)
        context.lineTo(this.body.GetPosition().x*this.draw_factor + Math.cos(this.impulse_angle + Math.PI/3) * this.impulse_radius * lighten_factor * this.draw_factor, this.body.GetPosition().y*this.draw_factor + Math.sin(this.impulse_angle + Math.PI/3) * this.impulse_radius * lighten_factor*this.draw_factor)
        context.lineTo(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor)
        context.fill()
      } else if(this.status_duration[1] <= 0 && player_data.options.control_scheme == "keyboard") {
        context.beginPath()
        context.arc(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor, this.impulse_radius * lighten_factor *this.draw_factor, 0, 2 * Math.PI)
        context.globalAlpha /= 10
        context.lineWidth = 2
        context.strokeStyle = impulse_colors["impulse_blue"]
        context.stroke()
        context.globalAlpha *= 10
      }
    }
    if(this.attacking)
    {
      var cur_time = (new Date()).getTime()
      context.beginPath();
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 10;
      context.shadowColor = this.impulse_color;

      context.lineWidth = this.impulse_radius * this.impulse_width * this.draw_factor * lighten_factor
      var prop = ((this.attack_length - this.attack_duration)/this.attack_length);
      context.save();
      if(prop > 0.5) {

        context.globalAlpha *= (1 - prop)/(0.5) < 0 ? 0 : (1-prop)/(0.5);
      }

      context.arc(this.attack_loc.x*this.draw_factor, this.attack_loc.y*this.draw_factor, this.impulse_radius * lighten_factor* prop * this.draw_factor,  this.attack_angle - Math.PI/3, this.attack_angle + Math.PI/3);
      //context.lineWidth = 15;
      // line color
      context.strokeStyle = this.impulse_color
      context.lineWidth = 5
      context.stroke();
      context.restore();
    }


    if(player_data.options.progress_circle) {
      context.beginPath()
      context.arc(this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor, this.radius * 1.5 * this.draw_factor, -.5* Math.PI, -.5 * Math.PI - 2*Math.PI * this.impulse_game_state.progress_bar_prop, true)
      context.strokeStyle = this.color //impulse_colors[this.impulse_game_state.star_colors[this.impulse_game_state.stars]]
      context.lineWidth = 2
      context.stroke()
    }
    if(player_data.options.multiplier_display) {
      context.font = "12px Muli"
      context.fillStyle = impulse_colors["impulse_blue"]
      context.textAlign = "center"
      context.shadowBlur = 0
      context.fillText("x"+this.impulse_game_state.game_numbers.combo, this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor + 25)
    }
    context.restore()
  }
}

Player.prototype.draw_player_sprite = function(ctx, name) {
    var lighten_factor = this.get_lighten_factor()

    drawSprite(ctx, this.body.GetPosition().x*this.draw_factor, this.body.GetPosition().y*this.draw_factor, (this.body.GetAngle()), this.shape.GetRadius() * this.draw_factor * 6 * lighten_factor, this.shape.GetRadius() * this.draw_factor * 6 * lighten_factor, name)

}

Player.prototype.get_lighten_factor = function() {
  if(this.status_duration[3] <= 0)
    return 1

  var prog = this.status_duration[3]/this.last_lighten
      if(prog < .1)
      {
        var transition = 1 - prog/.1
        lighten_factor = (this.lighten_start) * transition + (this.lighten_finish) * (1-transition)
      } else if(prog > .9) {
        var transition = (prog - .9)/.1
        lighten_factor = (this.lighten_start) * transition + (this.lighten_finish) * (1-transition)
      } else {
        lighten_factor = this.lighten_finish
      }
  return lighten_factor
}

Player.prototype.collide_with = function(other) {

}

Player.prototype.point_intersect = function(pt) {
  return p_dist(pt, this.body.GetPosition()) < this.r
}

Player.prototype.start_death = function() {
  this.dying = true
  this.dying_duration = this.dying_length
  this.level.obstacles_visible = true
  impulse_music.play_sound("pdeath")
  this.level.add_fragments("player", this.body.GetPosition(), this.body.GetLinearVelocity(), true)
}

Player.prototype.get_segment_intersection = function(seg_s, seg_f) {
  //checks if the segment intersects this enemy
  //returns the closest intersection to seg_s
  var j = this.points_polar_form.length - 1
  var ans = null
  var ans_d = null

  var cur_ang = 0

  for(var i = 0; i < this.points_polar_form.length; i++)
  {
    var loc_i = {x: this.body.GetPosition().x + this.points_polar_form[i].r * Math.cos(this.points_polar_form[i].ang + cur_ang),
     y: this.body.GetPosition().y + this.points_polar_form[i].r * Math.sin(this.points_polar_form[i].ang + cur_ang)}
    var loc_j = {x: this.body.GetPosition().x + this.points_polar_form[j].r * Math.cos(this.points_polar_form[j].ang + cur_ang),
     y: this.body.GetPosition().y + this.points_polar_form[j].r * Math.sin(this.points_polar_form[j].ang + cur_ang)}
    var temp_point = getSegIntersection(loc_i, loc_j, seg_s, seg_f)
    if(temp_point == null) continue
    var temp_d = p_dist(temp_point, seg_s)
    if(ans_d == null || temp_d < ans_d)
    {
      ans = temp_point
      ans_d = temp_d
    }
    j = i
  }
  return {point: ans, dist: ans_d}

}
