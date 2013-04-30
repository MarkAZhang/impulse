PiercingFighterBullet.prototype = new FighterBullet()

PiercingFighterBullet.prototype.constructor = PiercingFighterBullet

function PiercingFighterBullet(world, x, y, id, impulse_game_state, dir, parent_id) {
  this.type = "piercing_fighter_bullet"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.v = new b2Vec2(Math.cos(dir), Math.sin(dir))
  this.v.Normalize()
  this.v.Multiply(this.force)

  this.do_yield = false
  this.bullet_force = 100
  this.bullet_enemy_factor = 1.5

  this.parent_id = parent_id
  this.bullet_low_enemy_factor= 0.3;

  this.bullet_goo_factor = 0.33

}

PiercingFighterBullet.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
}

PiercingFighterBullet.prototype.collide_with = function(other) {
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
}