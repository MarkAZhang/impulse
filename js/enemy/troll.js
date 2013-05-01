Troll.prototype = new Enemy()

Troll.prototype.constructor = Troll

function Troll(world, x, y, id, impulse_game_state) {

  this.type = "troll"

  this.init(world, x, y, id, impulse_game_state)

  this.do_yield = false

  this.trolling = false

  this.troll_switch_interval = 750

  this.troll_switch_timer = this.troll_switch_interval

  this.cautious = false

  this.default_heading = false

  this.spin_rate = 2000
}

Troll.prototype.additional_processing = function(dt) {

  var time = (new Date()).getTime()
  if(this.trolling)
    this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)

  this.trolling = time % (3 * this.troll_switch_interval) > this.troll_switch_interval

  if (this.status_duration[1] > 0) {
    this.trolling = false
  }

  this.color = this.trolling ? impulse_enemy_stats[this.type].color : "gray"

}

Troll.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  if (this.trolling) {
    if(isVisible(this.player.body.GetPosition(), this.body.GetPosition(), this.level.obstacle_edges)) {
      this.body.ApplyImpulse(new b2Vec2(.15 * impulse_force*Math.cos(hit_angle + Math.PI), .15 * impulse_force*Math.sin(hit_angle + Math.PI)),
      this.body.GetWorldCenter())
    }
  }
  else {
    this.body.ApplyImpulse(new b2Vec2(.3 * impulse_force*Math.cos(hit_angle), .3 * impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
  }
  this.open(this.open_period)

}

Troll.prototype.player_hit_proc = function() {
  if(this.trolling)
  this.player.confuse(5000)
}