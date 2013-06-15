BossThree.prototype = new Boss()

BossThree.prototype.constructor = BossThree

function BossThree(world, x, y, id, impulse_game_state) {

  this.type = "third boss"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false
  this.spawn_duration = 1000

  this.death_radius = 5

  this.shoot_interval = 1500

  this.shoot_duration = 5

  this.do_yield = false

  this.safe = true

  this.spawned = false

  this.body.SetAngle(Math.PI/16)

  this.dying_length = 2000

  this.visibility = 0

  this.silence_interval = 13400

  this.silence_timer = this.silence_interval - 1

  this.silence_duration = 7000

  this.silenced = false

  this.red_visibility = 0

  this.striking_arms = {}

  this.strike_interval = 1000

  this.strike_timer = this.strike_interval
  this.default_heading = false

}

BossThree.prototype.additional_processing = function(dt) {
  if(this.spawn_duration > 0) {
    this.spawn_duration = Math.max(this.spawn_duration - dt, 0)
    this.visibility = 1 - this.spawn_duration / this.spawn_interval
    return
  }
  else if(this.spawned == false){
    this.spawned = true
    this.visibility = 1
    this.body.SetLinearDamping(impulse_enemy_stats[this.type].lin_damp)
  }

  this.strike_timer -= dt
  if(this.strike_timer < 0) {
    this.strike_timer = this.strike_interval
    this.strike_with_arm(0, 10)
    this.strike_with_arm(2, 10)
    this.strike_with_arm(4, 10)
    this.strike_with_arm(6, 10)
  }

  for(var index in this.striking_arms) {
    var data = this.striking_arms[index]
    data.duration -= dt
    if(data.duration < 0) {
      this.world.DestroyBody(this.striking_arms[index].body)
      delete this.striking_arms[index]
      continue;
    }
    var prog = data.duration/data.interval * 3.3
    if(data.duration/data.interval > 0.7) {
      prog = Math.abs(1 - data.duration/data.interval) * 3.3
    } else if(data.duration/data.interval > 0.3){
      prog = 1
    }
    var angle = this.striking_arms[index].body.GetAngle()

    prog = bezier_interpolate(0.15, 0.85, prog);
    data.cur_dist = data.max_dist * prog + data.start_dist * (1-prog)
    data.body.SetPosition(this.body.GetPosition())
    data.body.GetFixtureList().m_shape.m_vertices[1] = {x: Math.cos(0) * data.cur_dist, y: Math.sin(0) * data.cur_dist}
    data.body.GetFixtureList().m_shape.m_vertices[2] = {x: Math.cos(Math.PI/8) * data.cur_dist, y: Math.sin(Math.PI/8) * data.cur_dist}
  }
}

BossThree.prototype.additional_drawing = function(context, draw_factor) {
  for(var index in this.striking_arms) {
    context.beginPath()
    var body_vertices = this.striking_arms[index].body.GetFixtureList().m_shape.m_vertices
    var tp = this.striking_arms[index].body.GetPosition()
    var angle = this.striking_arms[index].body.GetAngle()
    context.save()
    context.translate(tp.x * draw_factor, tp.y * draw_factor)
    context.rotate(angle)

    context.moveTo(body_vertices[0].x * draw_factor, body_vertices[0].y * draw_factor)
    context.lineTo(body_vertices[1].x * draw_factor, body_vertices[1].y * draw_factor)
    context.lineTo(body_vertices[2].x * draw_factor, body_vertices[2].y * draw_factor)

    /*var data = this.striking_arms[index]
    context.moveTo(this.body.GetPosition().x * draw_factor, this.body.GetPosition().y * draw_factor)
    var angle = this.body.GetAngle() + Math.PI*2/16 * index
    context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle) * data.cur_dist * draw_factor, this.body.GetPosition().y * draw_factor + Math.sin(angle) * data.cur_dist * draw_factor)
    context.lineTo(this.body.GetPosition().x * draw_factor + Math.cos(angle + Math.PI/8) * data.cur_dist * draw_factor, this.body.GetPosition().y * draw_factor + Math.sin(angle + Math.PI/8) * data.cur_dist * draw_factor)
    */context.fillStyle = "red"
    context.fill()
    context.restore()
  }
}

BossThree.prototype.strike_with_arm = function(index, dist) {
  if(!this.striking_arms.hasOwnProperty(index)) {
    var arm_body =  create_body(this.world, impulse_enemy_stats[this.type].arm_polygon, this.body.GetPosition().x, this.body.GetPosition().y, 3, 10, imp_vars.BOSS_THREE_BIT, imp_vars.PLAYER_BIT | imp_vars.ENEMY_BIT, "static", this, null)
    arm_body.SetAngle(Math.PI/8 * index)
    this.striking_arms[index] = {interval: this.strike_interval, duration: this.strike_interval, max_dist: dist, start_dist: this.effective_radius, cur_dist: this.effective_radius, body: arm_body}
  }
}

BossThree.prototype.collide_with = function(other, body) {
  if(this.dying || !this.spawned)//ensures the collision effect only activates once
    return

}