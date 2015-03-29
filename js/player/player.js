//currently 15 by 15px
var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');
var controls = require('../core/controls.js');
var music_player = require('../core/music_player.js');
var renderUtils = require('../render/utils.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');
var utils = require('../core/utils.js');

var Player = function(world, x, y, impulse_game_state) {
  this.init(world, x, y, impulse_game_state)
}

Player.prototype.lin_damp = 3.5//old = 3

Player.prototype.id = 9999

Player.prototype.true_force = 1.2//old = .5

Player.prototype.impulse_force = 50

Player.prototype.impulse_radius = 10

Player.prototype.impulse_width = 1/32

Player.prototype.impulse_target_color = constants.colors["impulse_target_blue"]
Player.prototype.impulse_color = constants.colors["impulse_blue"]

Player.prototype.density = 9/16

Player.prototype.radius = .66
Player.prototype.effective_radius = .66

Player.prototype.init = function(world, x, y, impulse_game_state) {
  if (world == null) return

  if(saveData.difficultyMode == "easy") {
    this.density *= 1.5;
    this.true_force *= 1.5;
  }
  var fixDef = new box_2d.b2FixtureDef;
  fixDef.density = this.density;
  fixDef.friction = 0;
  fixDef.restitution = 1.0;
  fixDef.filter.categoryBits = box_2d.PLAYER_BIT
  fixDef.filter.maskBits = box_2d.ENEMY_BIT | box_2d.WALL_BIT | box_2d.BOSS_BITS
  var bodyDef = new box_2d.b2BodyDef;
  bodyDef.type = box_2d.b2Body.b2_dynamicBody;
  fixDef.shape = new box_2d.b2CircleShape(Player.prototype.radius);
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

  this.has_lightened_properties = false

  this.enemies_hit = [] //stores ids of enemies hit

  this.attacking = false
  this.attack_start = 0
  this.attack_loc = {}
  this.attack_angle = 0
  this.attack_length = 500
  this.attack_duration = 0

  // used for status timers
  this.confuse_duration = 0
  this.confuse_interval = 0
  this.silence_duration = 0
  this.silence_interval = 0

  this.gooed_damping_factor = 5;
  this.gooed_force_boost = 1.7;

  this.mouse_pos = {x: 0, y: 0}//keeps track of last mouse position on player's part
  this.status = "normal"  //currently unused
  this.status_duration = [0, 0, 0, 0, 0, 0] //[locked, silenced, gooed, lighten, confuse, bulk], time left for each status

  this.slow_factor = .3
  this.dying = false
  this.dying_length = 1000
  this.dying_duration = 0
  this.color = constants.colors["player_color"]
  this.force = this.true_force
  this.bulk_factor = 5
  this.bulked = false

  this.lighten_factor = 1.5

  this.last_mouse_down = 0
  this.mouse_pressed = false
  this.last_right_mouse_down = 0
  this.right_mouse_pressed = false

  // When the player first appears.
  this.appear_duration = 250;
  this.appearing = true;
  this.appear_timer = this.appear_duration;
}

Player.prototype.keyDown = function(keyCode) {
  switch(keyCode)
  {
    case controls.keys.LEFT_KEY:
      this.left = true
      break;
    case controls.keys.RIGHT_KEY:
      this.right = true
      break;
    case controls.keys.DOWN_KEY:
      this.down = true
      break;
    case controls.keys.UP_KEY:
      this.up = true
      break;
    case controls.keys.PAUSE:
    case controls.keys.SECONDARY_PAUSE:
      this.up = false
      this.down = false
      this.left = false
      this.right = false
      this.ileft = null
      this.iright = null
      this.iup = null
      this.idown = null
      break
    case controls.keys.ILEFT_KEY:
      this.ileft = (new Date()).getTime()
      break;
    case controls.keys.IUP_KEY:
      this.iup = (new Date()).getTime()
      break;
    case controls.keys.IRIGHT_KEY:
      this.iright = (new Date()).getTime()
      break;
    case controls.keys.IDOWN_KEY:
      this.idown = (new Date()).getTime()
      break;
  }
}

Player.prototype.keyUp = function(keyCode) {
  switch(keyCode)
  {
    case controls.keys.LEFT_KEY:
      this.left = false
      break;
    case controls.keys.RIGHT_KEY:
      this.right = false
      break;
    case controls.keys.DOWN_KEY:
      this.down = false
      break;
    case controls.keys.UP_KEY:
      this.up = false
      break;
    case controls.keys.ILEFT_KEY:
      this.ileft = null
      break;
    case controls.keys.IUP_KEY:
      this.iup = null
      break;
    case controls.keys.IRIGHT_KEY:
      this.iright = null
      break;
    case controls.keys.IDOWN_KEY:
      this.idown = null
      break;
    case controls.keys.PAUSE:
    case controls.keys.SECONDARY_PAUSE:
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

Player.prototype.is_locked = function() {
  return this.status_duration[0] > 0;
};

Player.prototype.is_silenced = function() {
  return this.status_duration[1] > 0;
}

Player.prototype.is_gooed = function() {
  return this.status_duration[2] > 0;
}

Player.prototype.is_lightened = function() {
  return this.status_duration[3] > 0;
}

Player.prototype.is_confused = function() {
  return this.status_duration[4] > 0;
}

Player.prototype.is_bulked = function() {
  return this.status_duration[5] > 0;
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
  if(this.dying )
  {
    this.dying_duration -= dt
    return
  }

  if (this.appearing) {
    this.appear_timer -= dt;
    if (this.appear_timer < 0) {
      this.appearing = false;
    }
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
    this.body.SetLinearDamping(this.lin_damp * this.gooed_damping_factor)
    this.gooed = true
  } else if(this.gooed){
    this.body.SetLinearDamping(this.lin_damp)
  }
  if (this.status_duration[3] > 0){
    this.status_duration[3] -= dt
    if(!this.has_lightened_properties) {
      this.has_lightened_properties = true
      var fixtures = this.body.GetFixtureList()
      if (fixtures.length === undefined) {
        fixtures = [fixtures]
      }
      for(var i = 0; i < fixtures.length; i++) {
        fixtures[i].m_shape.m_radius /= this.lighten_factor
        //fixtures[i].SetDensity(this.density/3)
      }
      this.body.ResetMassData()
      this.readjust_force()
    }
  }
  else {
    if(this.has_lightened_properties) {
      this.has_lightened_properties = false
      var fixtures = this.body.GetFixtureList()
      if (fixtures.length === undefined) {
        fixtures = [fixtures]
      }
      for(var i = 0; i < fixtures.length; i++) {
        fixtures[i].m_shape.m_radius *= this.lighten_factor
        //fixtures[i].SetDensity(this.density)
      }
      this.body.ResetMassData()
      this.readjust_force()
    }
  }

  if(this.status_duration[4] > 0) {
    this.status_duration[4] -= dt
  }

  if (this.status_duration[5] > 0) {
    this.status_duration[5] -= dt;
  }

  if(this.status_duration[5] > 0 && !this.bulked) {
    var fixtures = this.body.GetFixtureList()
    if (fixtures.length === undefined) {
      fixtures = [fixtures]
    }
    for(var i = 0; i < fixtures.length; i++) {

      fixtures[i].SetDensity(this.density*this.bulk_factor)
    }
    this.readjust_force()
    this.body.ResetMassData()
    this.bulked = true
  } else if(this.status_duration[5] <= 0 && this.bulked){
    this.bulked = false
    var fixtures = this.body.GetFixtureList()
    if (fixtures.length === undefined) {
      fixtures = [fixtures]
    }
    for(var i = 0; i < fixtures.length; i++) {
      fixtures[i].SetDensity(this.density)
    }
    this.readjust_force()
    this.body.ResetMassData()
  }

  cur_time = (new Date()).getTime()

  this.maybe_start_impulse();

  this.body.SetAngle(this.impulse_angle)

  if (this.is_confused()) {
    this.impulse_angle += Math.PI
  }
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(utils.pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
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
        if(this.level.enemies[i].type === "mote" && !this.level.enemies[i].is_silenced()) continue

        if(this.level.enemies[i].type === "slingshot" && this.level.enemies[i].empowered) continue

        if(this.enemies_hit.indexOf(this.level.enemies[i].id)==-1 && !this.level.enemies[i].dying)//enemy has not been hit
        {
          var impulse_sensitive_points = this.level.enemies[i].get_impulse_sensitive_pts()

          for(var j = 0; j < impulse_sensitive_points.length; j++) {

            if(this.point_in_impulse_angle(impulse_sensitive_points[j]))
            {

              if (this.point_in_impulse_dist(impulse_sensitive_points[j], this.level.enemies[i].body.GetLinearVelocity().Length() > 20))
              {
                var angle = utils.atan(this.attack_loc, impulse_sensitive_points[j])//not sure if it should be this point
                this.enemies_hit.push(this.level.enemies[i].id)
                var force = this.impulse_force;
                // If it's a goo-ed Harpoon.
                if(this.level.enemies[i].type === "harpoon"  && this.level.enemies[i].is_gooed()) {
                  force *= 2;
                }
                if(this.level.enemies[i].type === "fighter" && this.level.enemies[i].is_disabled()) {
                  force *= 3;
                }
                if(this.level.enemies[i].is_lightened()) {
                  force *= 2.5;
                }
                this.level.enemies[i].process_impulse(this.attack_loc, force, angle)
                break
              }
              if(this.level.enemies[i].type === "harpoon" && this.level.enemies[i].harpoon_state == "engaged") {
                this.level.enemies[i].disengage_harpoon()
              }
            }
          }
        }

        // if Harpoon, also check the Head
        if(this.level.enemies[i].type === "harpoon" && this.level.enemies[i].harpoon_state != "inactive") {
          var this_harpoon_head = this.level.enemies[i].harpoon_head;
          if (this.enemies_hit.indexOf(this_harpoon_head.id) == -1) {
            var impulse_sensitive_points = this_harpoon_head.get_impulse_sensitive_pts()

            for(var j = 0; j < impulse_sensitive_points.length; j++) {

              if(this.point_in_impulse_angle(impulse_sensitive_points[j]))
              {
                if (this.point_in_impulse_dist(impulse_sensitive_points[j], true))
                {
                  var angle = utils.atan(this.attack_loc, impulse_sensitive_points[j])//not sure if it should be this point
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

  if(!this.is_locked())
  {
    var f = this.force
    var f_x = 0
    var f_y = 0
    if(this.left) f_x -= 1
    if(this.right) f_x += 1
    if(this.up) f_y -= 1
    if(this.down) f_y += 1


    var force = Math.abs(f_x)+Math.abs(f_y)==2 ? f/Math.sqrt(2) : f;

    if(this.is_confused()) {
      f_x *= -1
      f_y *= -1
    }

    if(this.is_gooed()) {
      f_x *= this.gooed_force_boost
      f_y *= this.gooed_force_boost
    }
    this.body.ApplyImpulse(new box_2d.b2Vec2(force*f_x, force*f_y), this.body.GetWorldCenter())
    if (this.impulse_game_state.show_tutorial && (f_x != 0 || f_y != 0)) {
      this.impulse_game_state.add_tutorial_signal("player_moved")
    }
  }
}

Player.prototype.maybe_start_impulse = function () {
  if (this.level.impulse_disabled) {
    return;
  }
  if(saveData.optionsData.control_scheme == "mouse") {
    if((this.mouse_pressed || cur_time - this.last_mouse_down < 100) && !this.attacking && !this.is_silenced())
    {
      this.attacking = true
      this.impulse_game_state.game_numbers.impulsed = true;
      this.attack_loc = this.body.GetPosition().Copy()
      this.attack_angle = this.impulse_angle
      this.attack_duration = this.attack_length
      music_player.play_sound("impulse")
      if (this.impulse_game_state.show_tutorial) {
        this.impulse_game_state.add_tutorial_signal("player_impulsed")
      }

    }
    this.impulse_angle = utils.atan({x: this.body.GetPosition().x*constants.drawFactor, y: this.body.GetPosition().y*constants.drawFactor}, this.mouse_pos)
  } else if(saveData.optionsData.control_scheme == "keyboard") {
    if(!this.attacking && !this.is_silenced()) {
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
        if (this.is_confused()) {
          this.attack_angle += Math.PI
        }
        this.attacking = true
        this.impulse_game_state.game_numbers.impulsed = true;
        this.attack_loc = this.body.GetPosition().Copy()
        this.attack_duration = this.attack_length
        music_player.play_sound("impulse")
      }
    }
  }
}

Player.prototype.readjust_force = function() {
  if(this.is_bulked()) {
    this.force = this.true_force * this.bulk_factor
  } else if (this.is_lightened()){
      this.force = this.true_force/this.lighten_factor/this.lighten_factor
  }
  else {
    this.force = this.true_force
  }
}

Player.prototype.get_current_position = function() {
  return this.body.GetPosition()
}

Player.prototype.point_in_impulse_angle = function(pt) {
  var angle = utils.atan(this.attack_loc, pt)

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

Player.prototype.pre_draw = function(context) {}

Player.prototype.draw = function(context) {
  if(this.dying) {

  }
  else {

    context.save()
    if(this.confuse_duration > 0) {
      var prop = Math.max(((this.confuse_interval-this.confuse_duration) / this.confuse_interval), 0)
      uiRenderUtils.drawProgCircle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.radius, prop, "#24ac40")
    } else if(this.silence_duration > 0) {
      var prop = Math.max(((this.silence_interval-this.silence_duration) / this.silence_interval), 0)
      uiRenderUtils.drawProgCircle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.radius, prop, "gray")
    }

    if (!this.appearing) {
      if (this.is_locked())
      {
        this.draw_player_sprite(context, "player_red");
      }
      else if(this.is_confused())
      {
        this.draw_player_sprite(context, "player_green");
      }
      else if(this.is_silenced())
      {
        this.draw_player_sprite(context, "player_gray");
      }
      else if(this.is_gooed())
      {
        this.draw_player_sprite(context, "player_yellow");
      }
      else {
        this.draw_player_sprite(context, "player_normal");
      }
    } else {
      var prog = this.appear_timer / this.appear_duration;
      var factor = 1 + 8 * prog;
      context.save();
      context.globalAlpha *= 1 - prog
      context.beginPath();
      context.lineWidth = Math.ceil(4 - 4 * prog);
      context.strokeStyle = constants.colors["impulse_blue"];
      context.arc(this.body.GetPosition().x * constants.drawFactor, this.body.GetPosition().y * constants.drawFactor, this.shape.GetRadius() * factor * constants.drawFactor, 0, 2*Math.PI, true);
      context.stroke();
      context.restore();
    }


    var lighten_factor = this.get_lighten_factor()

    if(this.is_gooed()) {
      context.beginPath()
      context.arc(this.body.GetPosition().x*constants.drawFactor, this.body.GetPosition().y*constants.drawFactor,
       this.radius* lighten_factor * constants.drawFactor, 0, 2* Math.PI, false)
      context.strokeStyle = "black"
      context.stroke()

    }
    context.beginPath()

    if(saveData.optionsData.impulse_shadow && !this.level.impulse_disabled) {
      context.save();
      var prog = this.appear_timer / this.appear_duration;
      context.globalAlpha *= Math.max(0, 1 - prog);
      if (!this.is_silenced() && saveData.optionsData.control_scheme == "mouse") {
        context.fillStyle = this.impulse_target_color

        context.arc(this.body.GetPosition().x*constants.drawFactor, this.body.GetPosition().y*constants.drawFactor, this.impulse_radius * lighten_factor* constants.drawFactor, this.impulse_angle - Math.PI/3, this.impulse_angle + Math.PI/3)
        context.lineTo(this.body.GetPosition().x*constants.drawFactor + Math.cos(this.impulse_angle + Math.PI/3) * this.impulse_radius * lighten_factor * constants.drawFactor, this.body.GetPosition().y*constants.drawFactor + Math.sin(this.impulse_angle + Math.PI/3) * this.impulse_radius * lighten_factor*constants.drawFactor)
        context.lineTo(this.body.GetPosition().x*constants.drawFactor, this.body.GetPosition().y*constants.drawFactor)
        context.fill()
      } else if(!this.is_silenced() && saveData.optionsData.control_scheme == "keyboard") {
        context.beginPath()
        context.arc(this.body.GetPosition().x*constants.drawFactor, this.body.GetPosition().y*constants.drawFactor, this.impulse_radius * lighten_factor *constants.drawFactor, 0, 2 * Math.PI)
        context.globalAlpha /= 6
        context.lineWidth = 2
        context.strokeStyle = constants.colors["impulse_blue"]
        context.stroke()

      }
      context.restore();
    }
    if(this.attacking)
    {
      var cur_time = (new Date()).getTime()
      context.beginPath();
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 10;
      context.shadowColor = this.impulse_color;

      context.lineWidth = this.impulse_radius * this.impulse_width * constants.drawFactor * lighten_factor
      var prop = ((this.attack_length - this.attack_duration)/this.attack_length);
      context.save();
      if(prop > 0.5) {

        context.globalAlpha *= (1 - prop)/(0.5) < 0 ? 0 : (1-prop)/(0.5);
      }

      context.arc(this.attack_loc.x*constants.drawFactor, this.attack_loc.y*constants.drawFactor, this.impulse_radius * lighten_factor* prop * constants.drawFactor,  this.attack_angle - Math.PI/3, this.attack_angle + Math.PI/3);
      context.strokeStyle = this.impulse_color
      context.lineWidth = 5
      context.stroke();
      context.restore();
    }

    if(this.impulse_game_state.combo_enabled && saveData.optionsData.multiplier_display &&
       !this.impulse_game_state.is_boss_level) {
      context.font = "16px Open Sans"
      context.fillStyle = constants.colors["impulse_blue"]
      context.textAlign = "center"
      context.shadowBlur = 0
      context.fillText("x"+this.impulse_game_state.game_numbers.combo, this.body.GetPosition().x*constants.drawFactor, this.body.GetPosition().y*constants.drawFactor + 30)
    }
    context.restore()
  }
}

Player.prototype.draw_player_sprite = function(ctx, name) {
  var lighten_factor = this.get_lighten_factor()
  renderUtils.drawSprite(ctx, this.body.GetPosition().x*constants.drawFactor, this.body.GetPosition().y*constants.drawFactor, (this.body.GetAngle()), this.shape.GetRadius() * constants.drawFactor * 2.5 * lighten_factor, this.shape.GetRadius() * constants.drawFactor * 2.5 * lighten_factor, name)
}

Player.prototype.get_lighten_factor = function() {
  if(!this.is_lightened())
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
  return utils.pDist(pt, this.body.GetPosition()) < this.r
}

Player.prototype.start_death = function(reason) {
  this.dying = true
  this.dying_duration = this.dying_length
  this.level.obstacles_visible = true
  if (reason != "absorbed")
  music_player.play_sound("pdeath")
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
    var temp_point = utils.getSegIntersection(loc_i, loc_j, seg_s, seg_f)
    if(temp_point == null) continue
    var temp_d = utils.pDist(temp_point, seg_s)
    if(ans_d == null || temp_d < ans_d)
    {
      ans = temp_point
      ans_d = temp_d
    }
    j = i
  }
  return {point: ans, dist: ans_d}

}

module.exports = Player;
