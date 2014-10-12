BossFourSpawner.prototype = new Enemy()

BossFourSpawner.prototype.constructor = BossFourSpawner

function BossFourSpawner(world, x, y, id, impulse_game_state, enemy_type, enemy_spawn, push_force, boss, start_size) {

  this.type = "boss four spawner"

  this.init(world, x, y, id, impulse_game_state)

  this.enemy_type = enemy_type
  this.image_enemy_type = this.type+" "+enemy_type

  this.color = "black"
  this.interior_color = imp_params.impulse_enemy_stats[this.enemy_type].color
  this.spawn = false
  this.spawn_number = enemy_spawn
  this.push_force = push_force
  this.size = start_size

  this.default_heading = false

  this.parent = boss

  this.spawned = false
  this.firing = false

  this.spawn_action_period = 1000
  this.spawn_action_timer = 0

  this.spawn_expand_factor = 2
  this.impulse_extra_factor = 2
  this.tank_force = 100

}

BossFourSpawner.prototype.additional_processing = function(dt) {
  if(this.dying) return

  if(this.spawned) {
    if(this.spawn_action_timer > 0) {
      var cur_factor = 1 + bezier_interpolate(0.15, 0.85, 0.5 - Math.abs(this.spawn_action_timer/this.spawn_action_period - 0.5))
      this.set_size(imp_params.impulse_enemy_stats[this.type].effective_radius * cur_factor)
      this.spawn_action_timer -= dt
    } else {
      if(this.size != imp_params.impulse_enemy_stats[this.type].effective_radius) {
        this.set_size(imp_params.impulse_enemy_stats[this.type].effective_radius)
      }
    }  
  }
  

	if(this.spawn && this.spawn_action_timer < this.spawn_action_period/2) {
    imp_vars.impulse_music.play_sound("b4spawneract")  
		var ray_angle = _atan(this.parent.body.GetPosition(), this.body.GetPosition())
    var j = 0
    var exit_points = Math.max(this.spawn_number, 4)
    for(var i = 0; i < this.spawn_number; i++) {

      if(this.level.enemy_numbers[this.enemy_type] + i >= this.level.enemies_data[this.enemy_type][6]) {
        //prevents over_spawn
        this.silence(500)
        this.spawn = false
        return
      }

      // find a direction that isn't close to the wall
      var angle = ray_angle + Math.PI * 2 * (j + (1/((j - (j % exit_points))/exit_points + 1)))/exit_points
      while(!isVisible(this.body.GetPosition(),
        {x: this.body.GetPosition().x + 10 * Math.cos(angle),
          y: this.body.GetPosition().y + 10 * Math.sin(angle)},
          this.level.obstacle_edges
        )) 
      {
          j += 1
          angle = ray_angle + Math.PI * 2 * (j + (1/((j - (j % exit_points))/exit_points + 1)))/exit_points
      }

  		var loc = [this.body.GetPosition().x + this.effective_radius * 2 * Math.cos(angle),
  		this.body.GetPosition().y + this.effective_radius * 2 * Math.sin(angle)]

      var temp_enemy = new (imp_params.impulse_enemy_stats[this.enemy_type].className)(this.world, loc[0], loc[1], this.level.enemy_counter, this.impulse_game_state)

      var force = new b2Vec2(Math.cos(angle), Math.sin(angle))
      force.Multiply(this.push_force)
      temp_enemy.body.ApplyImpulse(force, temp_enemy.body.GetWorldCenter())
      temp_enemy.pathfinding_counter = temp_enemy.pathfinding_delay

  		this.level.spawned_enemies.push(temp_enemy)

      this.level.enemy_counter +=1
      j+=1
    }

    this.spawn = false
    this.silence(1000)
	}

}

BossFourSpawner.prototype.set_size = function(size) {
  var vertices = []
  for(var j = 0; j < 5; j++) {
    vertices.push({x: Math.cos(Math.PI * 2 * j / 5) * size, y: Math.sin(Math.PI * 2 * j / 5) * size})
  }
  this.body.GetFixtureList().m_shape.m_vertices = vertices
  this.size = size
  this.body.ResetMassData()
}


BossFourSpawner.prototype.additional_drawing = function(context, draw_factor) {
  if(this.status_duration[1] > 0 && this.color_silenced && !this.dying) {
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 1.5, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * 0.999 * (this.status_duration[1] / this.last_stun), true)
    context.lineWidth = 2
    context.strokeStyle = "red";
    context.stroke()
  }

}
BossFourSpawner.prototype.silence = function(dur, color_silence) {
  if(color_silence)
    this.color_silenced = color_silence
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
  this.last_stun = this.status_duration[1]
}

BossFourSpawner.prototype.collide_with = function(other) {
  if(this.dying)//ensures the collision effect only activates once
    return

  if (other === this.player) {
    this.impulse_game_state.reset_combo();  
  }

  //if(this.status_duration[1] > 0) return

  /*if(other === this.player) {

      var tank_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
      this.player.body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
  }*/ 
}

BossFourSpawner.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  if(this.spawned)  {
    this.body.ApplyImpulse(new b2Vec2(this.impulse_extra_factor * impulse_force*Math.cos(hit_angle), this.impulse_extra_factor * impulse_force*Math.sin(hit_angle)),
      this.body.GetWorldCenter())
    this.process_impulse_specific(attack_loc, impulse_force, hit_angle)
  }
}

BossFourSpawner.prototype.spawn_enemy = function() {
  if(this.status_duration[1] <= 0) {
  	this.spawn = true
    this.spawn_action_timer = this.spawn_action_period
  }
}

BossFourSpawner.prototype.draw  = function(context, draw_factor) {
  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
  context.save()
  context.globalAlpha *= 1-prog
  drawSprite(context, this.body.GetPosition().x* draw_factor, this.body.GetPosition().y* draw_factor, this.body.GetAngle(), this.size * draw_factor * 2, this.size* draw_factor * 2, "adrogantia_spawner", adrogantiaSprite)
  
  if(this.status_duration[1] > 0)
    context.globalAlpha *= 0.5

  //draw_enemy(context, enemy_name, x, y, d, rotate, status, enemy_color
  draw_enemy_colored(context, this.enemy_type, this.body.GetPosition().x* draw_factor, this.body.GetPosition().y* draw_factor, this.size * draw_factor * 0.7, this.body.GetAngle(), "black")
  /*context.beginPath()
  context.arc(this.body.GetPosition().x* draw_factor, this.body.GetPosition().y* draw_factor, this.size * draw_factor * 0.7, 0, Math.PI * 2)
  context.lineWidth = 2
  context.strokeStyle = imp_params.impulse_enemy_stats[this.enemy_type].color
  context.stroke()*/
  context.restore()

  this.additional_drawing(context, draw_factor)
}

BossFourSpawner.prototype.move = function() {
}
