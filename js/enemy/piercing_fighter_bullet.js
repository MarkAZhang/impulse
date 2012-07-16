PiercingFighterBullet.prototype = new FighterBullet()

PiercingFighterBullet.prototype.constructor = PiercingFighterBullet

function PiercingFighterBullet(world, x, y, id, impulse_game_state, vx, vy, parent_id) {
  this.type = "piercing_fighter_bullet"
  
  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.v = new b2Vec2(vx, vy)
  this.v.Normalize()
  this.v.Multiply(this.force)

  this.do_yield = false
  this.bullet_force = 60
  this.bullet_enemy_factor = 1.5

  this.parent_id = parent_id

}


PiercingFighterBullet.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
}