var Boss = function(world, x, y, id, impulse_game_state) {
  //empty constructor since Enemy should not be constructed
}
Boss.prototype = new Enemy()

Boss.prototype.constructor = Boss
Boss.prototype.init = function(world, x, y, id, impulse_game_state) {

  this.enemy_init(world, x, y, id, impulse_game_state)
  this.spawn_interval = 1000
  this.impulse_extra_factor = 10
  if(this.impulse_game_state.first_time && this.impulse_game_state.level.main_game)
    this.spawn_interval = 6600

  this.spawn_duration = this.spawn_interval

}

Boss.prototype.enemy_init = Enemy.prototype.init



Boss.prototype.is_boss = true

Boss.prototype.getLife = function() {
  if(this.dying) {
    return 0
  }
  var dist = Math.min(775/draw_factor - this.body.GetPosition().x, this.body.GetPosition().x - 25/draw_factor)
  var dist2 = Math.min(575/draw_factor - this.body.GetPosition().y, this.body.GetPosition().y - 25/draw_factor)
  return Math.min(dist, dist2)/(275/draw_factor)

}

Boss.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  if(this.spawned)  {
    this.body.ApplyImpulse(new b2Vec2(this.impulse_extra_factor * impulse_force*Math.cos(hit_angle), this.impulse_extra_factor * impulse_force*Math.sin(hit_angle)),
      this.body.GetWorldCenter())
    this.process_impulse_specific(attack_loc, impulse_force, hit_angle)
  }
}

Boss.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.knockback_red_duration = this.knockback_red_interval
}