//currently 15 by 15px

var Player = function(world, x, y, impulse_game_state) {
  this.init(world, x, y, impulse_game_state)
}

Player.prototype.lin_damp = 3.5//old = 3

Player.prototype.id = 9999

Player.prototype.true_force = 1.2//old = .5

Player.prototype.impulse_force = 50

Player.prototype.impulse_radius = 10

Player.prototype.impulse_width = 1/32

Player.prototype.impulse_target_color = impulse_colors["impulse_target_blue"]
Player.prototype.impulse_color = impulse_colors["impulse_blue"]

Player.prototype.density = 9/16

Player.prototype.radius = .66
Player.prototype.effective_radius = .66

Player.prototype.init = function(world, x, y, impulse_game_state) {
  if(imp_vars.player_data.difficulty_mode == "easy") {
    this.density *= 1.5;
    this.true_force *= 1.5;
  }
  var fixDef = new b2FixtureDef;
  fixDef.density = this.density;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = imp_params.PLAYER_BIT
  fixDef.filter.maskBits = imp_params.ENEMY_BIT | imp_params.WALL_BIT | imp_params.BOSS_BITS
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
  this.ultimate = null
  this.impulse_angle = 0

  this.enemies_hit = [] //stores ids of enemies hit
  this.ultimate_enemies_hit = [] //stores ids of enemies hit

  this.attacking = false
  this.attack_start = 0
  this.attack_loc = {}
  this.attack_angle = 0
  this.attack_length = 500
  this.attack_duration = 0

  this.ultimate = false
  this.ultimate_start = 0
  this.ultimate_loc = {}
  this.ultimate_length = 1000
  this.ultimate_duration = 0
  this.ultimate_radius = 20
  this.ultimate_factor = 250 // multiple of the enemy's force
  this.ultimate_width = 1/32

  // used for status timers
  this.confuse_duration = 0
  this.confuse_interval = 0
  this.silence_duration = 0
  this.silence_interval = 0

  this.mouse_pos = {x: 0, y: 0}//keeps track of last mouse position on player's part
  this.status = "normal"  //currently unused
  this.status_duration = [0, 0, 0, 0, 0, 0] //[locked, silenced, gooed, lighten, confuse, bulk], time left for each status
  
  this.slow_factor = .3
  this.dying = false
  this.dying_length = 1000
  this.dying_duration = 0
  this.color = impulse_colors["player_color"]
  this.force = this.true_force
  this.bulk_factor = 100
  this.bulked = false

  this.lighten_factor = 1.5

  this.last_mouse_down = 0
  this.mouse_pressed = false
  this.last_right_mouse_down = 0
  this.right_mouse_pressed = false
}

Player.prototype.keyDown = function(keyCode) {
  switch(keyCode)
  {
    case imp_params.keys.LEFT_KEY:
      this.left = true
      break;
    case imp_params.keys.RIGHT_KEY:
      this.right = true
      break;
    case imp_params.keys.DOWN_KEY:
      this.down = true
      break;
    case imp_params.keys.UP_KEY:
      this.up = true
      break;
    case imp_params.keys.PAUSE:
      this.up = false
      this.down = false
      this.left = false
      this.right = false
      this.ileft = null
      this.iright = null
      this.iup = null
      this.idown = null
      this.iultimate - null
      break
    case imp_params.keys.ILEFT_KEY:
      this.ileft = (new Date()).getTime()
      break;
    case imp_params.keys.IUP_KEY:
      this.iup = (new Date()).getTime()
      break;
    case imp_params.keys.IRIGHT_KEY:
      this.iright = (new Date()).getTime()
      break;
    case imp_params.keys.IDOWN_KEY:
      this.idown = (new Date()).getTime()
      break;
    case imp_params.keys.ULTIMATE_KEY:
      this.iultimate = (new Date()).getTime()
      break;
  }
}

Player.prototype.keyUp = function(keyCode) {
  switch(keyCode)
  {
    case imp_params.keys.LEFT_KEY:
      this.left = false
      break;
    case imp_params.keys.RIGHT_KEY:
      this.right = false
      break;
    case imp_params.keys.DOWN_KEY:
      this.down = false
      break;
    case imp_params.keys.UP_KEY:
      this.up = false
      break;
    case imp_params.keys.ILEFT_KEY:
      this.ileft = null
      break;
    case imp_params.keys.IUP_KEY:
      this.iup = null
      break;
    case imp_params.keys.IRIGHT_KEY:
      this.iright = null
      break;
    case imp_params.keys.IDOWN_KEY:
      this.idown = null
      break;
    case imp_params.keys.ULTIMATE_KEY:
      this.iultimate = null
    break
    case imp_params.keys.PAUSE_KEY:
      this.up = false
      this.down = false
      this.left = false
      this.right = false
      this.ileft = null
      this.iright = null
      this.iup = null
      this.idown = null
      this.iultimate = null
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

Player.prototype.silence = function(dur, single_silence) {
  if (single_silence) {
    this.silence_duration = Math.max(dur, this.status_duration[1])
    this.silence_interval = Math.max(dur, this.status_duration[1])
  }
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
  this.confuse_duration = Math.max(dur, this.status_duration[4])
  this.confuse_interval = Math.max(dur, this.status_duration[4])
  this.status_duration[4] = Math.max(dur, this.status_duration[4])
}

Player.prototype.mouse_down= function(pos) {
  this.last_mouse_down = (new Date()).getTime()
  this.mouse_pressed = true
}

Player.prototype.mouse_up= function(pos) {
  this.mouse_pressed = false
}

Player.prototype.right_mouse_down= function(pos) {
  this.last_right_mouse_down = (new Date()).getTime()
  this.right_mouse_pressed = true
}

Player.prototype.right_mouse_up= function(pos) {
  this.right_mouse_pressed = false
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

  if (this.silence_duration > 0) {
    this.silence_duration -= dt
  }
  if (this.confuse_duration > 0) {
    this.confuse_duration -= dt
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
    this.gooed = true
  } else if(this.gooed){
    this.body.SetLinearDamping(this.lin_damp)
  }
  if (this.status_duration[3] > 0){
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
      this.body.SetLinearDamping(this.lin_damp)

    }
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
    this.bulked = true
  } else if(this.bulked){
    this.bulked = false
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

  if(imp_vars.player_data.options.control_scheme == "mouse") {
    if((this.mouse_pressed || cur_time - this.last_mouse_down < 100) && !this.attacking && this.status_duration[1] <= 0)
    {
      this.attacking = true
      this.attack_loc = this.body.GetPosition().Copy()
      this.attack_angle = this.impulse_angle
      this.attack_duration = this.attack_length
      imp_vars.impulse_music.play_sound("impulse")
    }
    if((this.right_mouse_pressed || cur_time - this.last_right_mouse_down < 100) && !this.ultimate) {
      //if(this.impulse_game_state.hive_numbers.ultimates > 0) {
        this.initiate_ultimate()
        
      //  this.impulse_game_state.hive_numbers.ultimates -= 1
      //}
      
    }


    this.impulse_angle = _atan({x: this.body.GetPosition().x*imp_vars.draw_factor, y: this.body.GetPosition().y*imp_vars.draw_factor}, this.mouse_pos)
  } else if(imp_vars.player_data.options.control_scheme == "keyboard") {
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
        imp_vars.impulse_music.play_sound("impulse")
      }
    }
    if(!this.ultimate) {

      //if(this.iultimate != null && this.impulse_game_state.hive_numbers.ultimates > 0) {
        this.initiate_ultimate()
      //  this.impulse_game_state.hive_numbers.ultimates -= 1
      //}
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

        if(this.level.enemies[i] instanceof Slingshot && this.level.enemies[i].empowered) continue

        //if(this.level.enemies[i] instanceof BossOne) this.level.enemies[i].process_impulse_on_hands(this.attack_loc, this.impulse_force);

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
          if (this.enemies_hit.indexOf(this_harpoon_head.id) == -1) {
            var impulse_sensitive_points = this_harpoon_head.get_impulse_sensitive_pts()

            for(var j = 0; j < impulse_sensitive_points.length; j++) {

              if(this.point_in_impulse_angle(impulse_sensitive_points[j]))
              {
                if (this.point_in_impulse_dist(impulse_sensitive_points[j], true))
                {
                  var angle = _atan(this.attack_loc, impulse_sensitive_points[j])//not sure if it should be this point
                  // Impulse the harpoon head.
                  this_harpoon_head.process_impulse(this.attack_loc, this.impulse_force, angle)
                  this.enemies_hit.push(this_harpoon_head.id)
                }
              }
            }
          }
        }
      }
      this.attack_duration -= dt
    }
  }

  if(this.ultimate) {
    if(this.ultimate_duration < 0)
    {
      this.process_ultimate(true)
      this.finish_ultimate()
    }
    else
    {
      this.process_ultimate(false)
      
      this.ultimate_duration -= dt
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

Player.prototype.initiate_ultimate = function() {
  this.ultimate = true
  this.ultimate_loc = this.body.GetPosition().Copy()
  this.ultimate_duration = this.ultimate_length
  this.bulk(this.ultimate_length)
  this.stun(this.ultimate_length)
  this.body.SetLinearVelocity(new b2Vec2(0, 0))
}

Player.prototype.process_ultimate = function(final_strike) {

var final_strike_factor = final_strike ? 1 : 0.002
  var ultimate_force = final_strike_factor * this.ultimate_factor
  for(var i = 0; i < this.level.enemies.length; i++)
    {
      var this_enemy = this.level.enemies[i]
      if(!this_enemy.dying)//enemy has not been hit
      {
        var impulse_sensitive_points = this_enemy.get_impulse_sensitive_pts()

        for(var j = 0; j < impulse_sensitive_points.length; j++) {
            if (this.point_in_ultimate_dist(impulse_sensitive_points[j], this_enemy.body.GetLinearVelocity().Length() > 20))
            {
              var angle = _atan(this.ultimate_loc, impulse_sensitive_points[j])//not sure if it should be this point
              this_enemy.stun(2000)
              // reset open duration since you should not score points
              this_enemy.durations["open"] = 0
              if (this.ultimate_enemies_hit.indexOf(this_enemy.id) == -1) {
                this.ultimate_enemies_hit.push(this_enemy.id)
                this_enemy.body.SetLinearVelocity(new b2Vec2(0, 0));
              }
              var data = imp_params.impulse_enemy_stats[this_enemy.type]
              var prop = 1 //Math.min(p_dist(impulse_sensitive_points[j], this.ultimate_loc)/this.ultimate_radius * 1.5, 1)

              // Less for bosses.
              var enemy_factor =  this_enemy.is_boss ? 0.05/this_enemy.impulse_extra_factor : 1;

              // Slightly more for Slingshots. Lighter enemies tend to not get thrown as far.
              if (this_enemy.type == "slingshot") {
                enemy_factor *= 2
              }
              this_enemy.process_impulse(this.ultimate_loc, 
                prop * ultimate_force * enemy_factor * this_enemy.body.GetMass() * (data.lin_damp), angle, true)

              break
            }
            
        }
        if(this_enemy instanceof Harpoon && this_enemy.harpoon_state == "engaged" && this_enemy.harpooned_target == this) {
          this_enemy.disengage_harpoon()
        }
      }

      // if Harpoon, also check the Head
      if(this_enemy instanceof Harpoon && this_enemy.harpoon_state != "inactive") {
        var this_harpoon_head = this_enemy.harpoon_head;
        var impulse_sensitive_points = this_harpoon_head.get_impulse_sensitive_pts()

        for(var j = 0; j < impulse_sensitive_points.length; j++) {
          if (this.point_in_ultimate_dist(impulse_sensitive_points[j], this_enemy.body.GetLinearVelocity().Length() > 20))
          {
            var angle = _atan(this.ultimate_loc, impulse_sensitive_points[j])//not sure if it should be this point
            this_harpoon_head.process_impulse(this.ultimate_loc, ultimate_force * 2, angle)
          }
        }
      }
    }
}

Player.prototype.finish_ultimate = function() {
  this.ultimate = false
  this.ultimate_enemies_hit = []
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

Player.prototype.point_in_ultimate_dist = function(pt) {
  var dist = this.ultimate_loc.Copy()
  dist.Subtract(pt)
  dist = dist.Normalize()
  var prop = bezier_interpolate(0.15, 0.5,((this.ultimate_length - this.ultimate_duration)/this.ultimate_length))

  return dist <= this.ultimate_radius * prop
}

Player.prototype.draw_ultimate = function(context) {

  context.save()
  if (this.dying) {
      var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
      context.globalAlpha *= (1 - prog)
  }

  if(this.ultimate && this.ultimate_duration > 0) {
    context.save()
    context.globalAlpha *= 0.3;
    var gray = Math.min(2 - Math.abs((this.ultimate_duration - this.ultimate_length/2)/(this.ultimate_length/4)), 1)
    context.globalAlpha *= gray/2
    context.fillStyle = "white"
    context.fillRect(0, 0, imp_vars.canvasWidth, imp_vars.canvasHeight)

    context.restore()
      var cur_time = (new Date()).getTime()
      context.shadowBlur = 10;
      context.shadowColor = "#ccc";
      context.globalAlpha *= 0.5
      var prop = //Math.pow(((this.ultimate_length - this.ultimate_duration)/this.ultimate_length),3)//
      bezier_interpolate(0.1, 0.5,((this.ultimate_length - this.ultimate_duration)/this.ultimate_length));

      if(prop > 0.4) {
        context.globalAlpha *= (1 - prop)/(0.4) < 0 ? 0 : (1-prop)/(0.4);
      }
      drawSprite(context, 
        this.ultimate_loc.x * imp_vars.draw_factor, 
        this.ultimate_loc.y * imp_vars.draw_factor,  0,
        this.ultimate_radius * prop * imp_vars.draw_factor * 2, this.ultimate_radius * prop * imp_vars.draw_factor * 2,
        "ultimate")
  }

  context.restore()
}

Player.prototype.draw = function(context) {
  if(this.dying) {

  }
  else {

    this.draw_ultimate(context);

    /*context.beginPath()

    context.strokeStyle = this.color
    context.arc(this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor, this.shape.GetRadius()*imp_vars.draw_factor, 0, 2*Math.PI, true)
    context.lineWidth = 2
    context.stroke()
    context.globalAlpha = .5
    context.fillStyle = this.color
    context.fill()*/
    context.save()
    if(this.confuse_duration > 0) {
      var prop = Math.max(((this.confuse_interval-this.confuse_duration) / this.confuse_interval), 0)
      draw_prog_circle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.radius, prop, "24ac40") 
    } else if(this.silence_duration > 0) {
      var prop = Math.max(((this.silence_interval-this.silence_duration) / this.silence_interval), 0)
      draw_prog_circle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.radius, prop, "gray") 
    }
    if(this.ultimate) {

      var lighten_factor = this.get_lighten_factor()
      drawSprite(
        context, 
        this.ultimate_loc.x*imp_vars.draw_factor, 
        this.ultimate_loc.y*imp_vars.draw_factor, 
        (this.body.GetAngle()), 
        this.shape.GetRadius() * imp_vars.draw_factor * 2.5 * lighten_factor,
        this.shape.GetRadius() * imp_vars.draw_factor * 2.5 * lighten_factor, 
        "player_gray")
    } else if(this.status_duration[0] > 0)
    {
      this.draw_player_sprite(context, "player_red");
    }
    else if(this.status_duration[4] > 0)
    {
      this.draw_player_sprite(context, "player_green");
    }
    else if(this.status_duration[1] > 0)
    {
      this.draw_player_sprite(context, "player_gray");
    }
    else if(this.status_duration[2] > 0)
    {
      this.draw_player_sprite(context, "player_yellow");
    }
     else {
      //normal
      /*context.beginPath()
      context.shadowBlur = 10;
      context.shadowColor = impulse_colors["impulse_blue"];
      context.fillStyle = impulse_colors["impulse_blue"];
      context.arc(this.body.GetPosition().x * imp_vars.draw_factor, this.body.GetPosition().y * imp_vars.draw_factor, this.shape.GetRadius() * imp_vars.draw_factor, 0, 2*Math.PI, true)
      context.fill()
      context.shadowBlur = 0;*/
        this.draw_player_sprite(context, "player_normal");
      }
    var lighten_factor = this.get_lighten_factor()

    if(this.status_duration[3] > 0) {
      context.beginPath()
      context.arc(this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor,
       this.radius* lighten_factor * imp_vars.draw_factor, 0, 2* Math.PI, false)
      context.strokeStyle = "black"
      context.stroke()

    }
    context.beginPath()

    if(imp_vars.player_data.options.impulse_shadow) {
      if (this.status_duration[1] <= 0 && imp_vars.player_data.options.control_scheme == "mouse") {
        context.fillStyle = this.impulse_target_color

        context.arc(this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor, this.impulse_radius * lighten_factor* imp_vars.draw_factor, this.impulse_angle - Math.PI/3, this.impulse_angle + Math.PI/3)
        context.lineTo(this.body.GetPosition().x*imp_vars.draw_factor + Math.cos(this.impulse_angle + Math.PI/3) * this.impulse_radius * lighten_factor * imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor + Math.sin(this.impulse_angle + Math.PI/3) * this.impulse_radius * lighten_factor*imp_vars.draw_factor)
        context.lineTo(this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor)
        context.fill()
      } else if(this.status_duration[1] <= 0 && imp_vars.player_data.options.control_scheme == "keyboard") {
        context.beginPath()
        context.arc(this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor, this.impulse_radius * lighten_factor *imp_vars.draw_factor, 0, 2 * Math.PI)
        context.globalAlpha /= 6
        context.lineWidth = 2
        context.strokeStyle = impulse_colors["impulse_blue"]
        context.stroke()
        context.globalAlpha *= 6
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

      context.lineWidth = this.impulse_radius * this.impulse_width * imp_vars.draw_factor * lighten_factor
      var prop = ((this.attack_length - this.attack_duration)/this.attack_length);
      context.save();
      if(prop > 0.5) {

        context.globalAlpha *= (1 - prop)/(0.5) < 0 ? 0 : (1-prop)/(0.5);
      }

      context.arc(this.attack_loc.x*imp_vars.draw_factor, this.attack_loc.y*imp_vars.draw_factor, this.impulse_radius * lighten_factor* prop * imp_vars.draw_factor,  this.attack_angle - Math.PI/3, this.attack_angle + Math.PI/3);
      //context.lineWidth = 15;
      // line color
      context.strokeStyle = this.impulse_color
      context.lineWidth = 5
      context.stroke();
      context.restore();
    }

    /*if(imp_vars.player_data.options.progress_circle) {
      context.beginPath()
      context.arc(this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor, this.radius * 1.5 * imp_vars.draw_factor, -.5* Math.PI, -.5 * Math.PI - 2*Math.PI * this.impulse_game_state.progress_bar_prop, true)
      context.strokeStyle = impulse_colors["impulse_blue"]
      if(this.impulse_game_state.world_num == 0) {
        context.strokeStyle = impulse_colors["impulse_blue_dark"]
      }
      context.lineWidth = 2
      context.stroke()
    }*/
    if(imp_vars.player_data.options.multiplier_display && !this.impulse_game_state.is_boss_level) {
      context.font = "16px Muli"
      context.fillStyle = impulse_colors["impulse_blue"]
      if(this.impulse_game_state.world_num == 0) {
        context.fillStyle = impulse_colors["impulse_blue_dark"]
      }
      context.textAlign = "center"
      context.shadowBlur = 0
      context.fillText("x"+this.impulse_game_state.game_numbers.combo, this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor + 30)
    }
    context.restore()
  }
}

Player.prototype.draw_player_sprite = function(ctx, name) {
  /*ctx.beginPath()

  ctx.strokeStyle = impulse_colors["impulse_blue"]
  ctx.arc(this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor, this.shape.GetRadius() * imp_vars.draw_factor, 0, 2 * Math.PI)
  ctx.shadowBlur = 20
  ctx.shadowColor = impulse_colors["impulse_blue"]
  ctx.fillStyle = "black"
  ctx.fill()
  ctx.lineWidth = 3
  ctx.stroke()
  return*/
  var lighten_factor = this.get_lighten_factor()
  drawSprite(ctx, this.body.GetPosition().x*imp_vars.draw_factor, this.body.GetPosition().y*imp_vars.draw_factor, (this.body.GetAngle()), this.shape.GetRadius() * imp_vars.draw_factor * 2.5 * lighten_factor, this.shape.GetRadius() * imp_vars.draw_factor * 2.5 * lighten_factor, name)
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
  imp_vars.impulse_music.play_sound("pdeath")
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
