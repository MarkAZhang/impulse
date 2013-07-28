FighterBullet.prototype = new Enemy()

FighterBullet.prototype.constructor = FighterBullet

function FighterBullet(world, x, y, id, impulse_game_state, dir, parent_id) {
  if(world === undefined) return
  this.type = "fighter_bullet"

  this.init(world, x, y, id, impulse_game_state)

  if(world === null) return
  this.special_mode = false

  this.death_radius = 5

  this.v = new b2Vec2(Math.cos(dir), Math.sin(dir))
  this.v.Normalize()
  this.v.Multiply(this.force)

  if(imp_vars.player_data.difficulty_mode == "easy") {
    this.v.Multiply(0.5)
  }
  this.do_yield = false
  this.bullet_force = 100
  if(imp_vars.player_data.difficulty_mode == "easy") {
    this.bullet_force = 50
  }
  this.bullet_self_factor = 12;
  if(imp_vars.player_data.difficulty_mode == "easy") {
    this.bullet_self_factor = 24
  }

  this.bullet_enemy_factor = 1.5;
  this.bullet_low_enemy_factor= 0.3;

  this.parent_id = parent_id

  this.reflected = false
  this.body.SetBullet(true)

  this.bullet_goo_factor = 0.33

}

FighterBullet.prototype.start_death = function(death) {
  this.dying = death
  this.dying_duration = this.dying_length
  this.died = true
}

FighterBullet.prototype.collide_with = function(other) {
  if(this.dying)//ensures the collision effect only activates once
    return
  if(other === this.player) {
    this.start_death("hit_player")
    if(this.status_duration[1] <= 0) {
      var vel = this.body.GetLinearVelocity().Copy()
      vel.Normalize()
      //_atan(this.body.GetPosition(), this.player.body.GetPosition())
      if(this.player.status_duration[2] > 0) {
        vel.Multiply(this.bullet_force * this.bullet_goo_factor)
        this.player.body.ApplyImpulse(vel, this.player.body.GetWorldCenter())
      } else {
        vel.Multiply(this.bullet_force)
        this.player.body.ApplyImpulse(vel, this.player.body.GetWorldCenter())
      }
      this.impulse_game_state.reset_combo()
    }
  }
  else if(other.is_enemy)
  {

    if(other instanceof FighterBullet) return

    this.start_death("hit_enemy")
    if(other.id != this.parent_id || this.reflected) {

      if(other instanceof Fighter) {
        other.process_hit();
      }
      if(this.status_duration[1] <= 0) {
        var vel = this.body.GetLinearVelocity().Copy()
        vel.Normalize()
        //var bullet_angle = _atan(this.body.GetPosition(), other.body.GetPosition())
        other.open(1500)

        var factor = 1;

        if(other.type == "fighter") {
          if(this.reflected || other.id != this.parent_id)
            factor = this.bullet_self_factor
          else
            factor = this.bullet_low_enemy_factor
        } else {
          factor = this.bullet_enemy_factor
        }

        /*if(other.id == this.parent_id) {
          factor = this.bullet_self_factor;

        } else if(this.reflected && other.type == "fighter") {
          factor = this.bullet_self_factor;

        } else if(this.reflected) {
          factor = this.bullet_enemy_factor
        } else {
          factor = this.bullet_low_enemy_factor;
        }*/
        vel.Multiply(this.bullet_force * factor)
        //var force = new b2Vec2(this.bullet_force * factor * Math.cos(bullet_angle), this.bullet_force * factor * Math.sin(bullet_angle));

        other.body.ApplyImpulse(vel, other.body.GetWorldCenter())
      }
    }
  }

}

FighterBullet.prototype.move = function() {

  this.body.ApplyImpulse(this.v, this.body.GetWorldCenter())

  this.body.SetAngle(_atan({x: 0, y: 0}, this.v))
}

FighterBullet.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  var temp_dir = new b2Vec2(this.body.GetPosition().x - attack_loc.x, this.body.GetPosition().y - attack_loc.y)
  temp_dir.Normalize()
  temp_dir.Multiply(impulse_force)
  this.v.Add(temp_dir)
  this.reflected = true
  this.open(this.open_period)

}

FighterBullet.prototype.check_death = function()
{
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")

      return
    }
  }
  if(this.body.GetPosition().x <= -5 || this.body.GetPosition().x >= imp_vars.canvasWidth/imp_vars.draw_factor + 5 || this.body.GetPosition().y <= -5 || this.body.GetPosition().y >= imp_vars.canvasWidth/imp_vars.draw_factor + 5)
  {
    this.start_death("kill")
  }
}
FighterBullet.prototype.player_hit_proc = function() {
}


