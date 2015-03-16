PiercingFighterBullet.prototype = new FighterBullet()

PiercingFighterBullet.prototype.constructor = PiercingFighterBullet

function PiercingFighterBullet(world, x, y, id, impulse_game_state, dir, parent_id) {
  this.type = "piercing_fighter_bullet"

  this.init(world, x, y, id, impulse_game_state)

  if(world === null) return

  this.special_mode = false

  this.death_radius = 5

  this.parent_id = parent_id

  this.v = new box_2d.b2Vec2(Math.cos(dir), Math.sin(dir))
  this.v.Normalize()
  this.v.Multiply(this.force)

  if(saveData.difficultyMode == "easy") {
    this.v.Multiply(0.5)
  }
  this.do_yield = false
  this.bullet_force = 100
  if(saveData.difficultyMode == "easy") {
    this.bullet_force = 50
  }

  this.reflected = false
  this.body.SetBullet(true)

  this.adjust_position_enabled = false

  this.bullet_goo_factor = 0.33

  this.bullet_enemy_factor = 150;


  this.bullet_goo_factor = 0.33

}

PiercingFighterBullet.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
}

PiercingFighterBullet.prototype.collide_with = FighterBullet.prototype.collide_with
