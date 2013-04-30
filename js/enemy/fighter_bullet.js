FighterBullet.prototype = new Enemy()

FighterBullet.prototype.constructor = FighterBullet

function FighterBullet(world, x, y, id, impulse_game_state, dir, parent_id) {

  if(!world) return
  this.type = "fighter_bullet"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.v = new b2Vec2(Math.cos(dir), Math.sin(dir))
  this.v.Normalize()
  this.v.Multiply(this.force)

  this.do_yield = false
  this.bullet_force = 100
  this.bullet_self_factor = 3;

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
      var bullet_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
      if(this.player.status_duration[2] > 0) {
        this.player.body.ApplyImpulse(new b2Vec2(this.bullet_force * this.bullet_goo_factor * Math.cos(bullet_angle),
        this.bullet_force * this.bullet_goo_factor* Math.sin(bullet_angle)), this.player.body.GetWorldCenter())
      } else {
        this.player.body.ApplyImpulse(new b2Vec2(this.bullet_force * Math.cos(bullet_angle), this.bullet_force * Math.sin(bullet_angle)), this.player.body.GetWorldCenter())
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
        var bullet_angle = _atan(this.body.GetPosition(), other.body.GetPosition())
        other.open(1500)

        var factor = 1;
        if(other.id == this.parent_id) {
          factor = this.bullet_self_factor;

        } else if(this.reflected) {
          factor = this.bullet_enemy_factor;

        } else {
          factor = this.bullet_low_enemy_factor;
        }
        var force = new b2Vec2(this.bullet_force * factor * Math.cos(bullet_angle), this.bullet_force * factor * Math.sin(bullet_angle));
        console.log("THIS_FORCE"+force.x+" "+force.y+" "+factor)

        other.body.ApplyImpulse(force, other.body.GetWorldCenter())
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
  if(this.body.GetPosition().x <= -5 || this.body.GetPosition().x >= canvasWidth/draw_factor + 5 || this.body.GetPosition().y <= -5 || this.body.GetPosition().y >= canvasWidth/draw_factor + 5)
  {
    this.start_death("kill")
  }
}
FighterBullet.prototype.player_hit_proc = function() {
}


