BossFourAttacker.prototype = new Enemy()

BossFourAttacker.prototype.constructor = BossFourAttacker

function BossFourAttacker(world, x, y, id, impulse_game_state,size) {

  this.type = "boss four attacker"

  this.init(world, x, y, id, impulse_game_state)

  this.size = size
  this.default_heading = false
  this.tank_force = 100
  this.spawner_hit_force = 200

  this.dir = null
  this.firing = false

  this.adjust_position_enabled = false

}

BossFourAttacker.prototype.draw = function(context, draw_factor) {

  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
  context.save()
  context.globalAlpha = 1-prog
  if(this.firing)
    drawSprite(context, this.body.GetPosition().x* draw_factor, this.body.GetPosition().y* draw_factor, this.body.GetAngle(), this.size * draw_factor * 2, this.size* draw_factor * 2, "adrogantia_attack_bud_firing", adrogantiaSprite)
  else
    drawSprite(context, this.body.GetPosition().x* draw_factor, this.body.GetPosition().y* draw_factor, this.body.GetAngle(), this.size * draw_factor * 2, this.size* draw_factor * 2, "adrogantia_attack_bud", adrogantiaSprite)
  context.restore()
}

BossFourAttacker.prototype.additional_processing = function(dt) {
  if(this.dir) {
    var dir = new b2Vec2(this.dir.x, this.dir.y)
    dir.Normalize()
    dir.Multiply(this.force)
    if (imp_vars.player_data.difficulty_mode == "easy") {
      dir.Multiply(0.5)
    }
    this.body.ApplyImpulse(dir, this.body.GetWorldCenter())
  }
}

BossFourAttacker.prototype.move = function() {
  return
}

BossFourAttacker.prototype.collide_with = function(other) {
  if(this.dying)//ensures the collision effect only activates once
    return

  if(this.status_duration[1] > 0) return


  if(other === this.player) {

      var tank_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
      this.player.body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
      //this.cause_of_death = "hit_player"
      return
  } else if(this.dir && other.type == "boss four spawner") {
    var tank_angle = _atan({x:0, y:0}, this.dir)
    var ref_angle = angle_closest_to(tank_angle, _atan(this.body.GetPosition(), other.body.GetPosition()))
    if(tank_angle < ref_angle) {
      tank_angle -= Math.PI/2
    } else {
      tank_angle += Math.PI/2
    }
    other.body.ApplyImpulse(new b2Vec2(this.spawner_hit_force * Math.cos(tank_angle), this.spawner_hit_force * Math.sin(tank_angle)), other.body.GetWorldCenter())
  } else if(this.dir && other.type != "fourth boss") {
    var tank_angle = _atan(this.body.GetPosition(), other.body.GetPosition())
    var dir = new b2Vec2(this.dir.x, this.dir.y)
    dir.Normalize()
    dir.Multiply(20 * other.force)
    other.body.ApplyImpulse(dir, other.body.GetWorldCenter())
    //this.cause_of_death = "hit_player"

  }
  
}

BossFourAttacker.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {

}

BossFourAttacker.prototype.check_death = function() {
  //check if enemy has intersected polygon, if so die

  if(!this.dir) return

  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {

      if (this.durations["open"] <= 0 && this.require_open) {
        this.start_death("accident")
      } else {
        this.start_death("kill")
      }

      return
    }
  }
}


BossFourAttacker.prototype.set_size = function(size) {
  var vertices = []
  for(var j = 0; j < 5; j++) {
    vertices.push({x: Math.cos(Math.PI * 2 * j / 5) * size, y: Math.sin(Math.PI * 2 * j / 5) * size})
  }
  this.body.GetFixtureList().m_shape.m_vertices = vertices
  this.size = size
  this.body.ResetMassData()
}