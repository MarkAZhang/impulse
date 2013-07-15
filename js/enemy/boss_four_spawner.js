BossFourSpawner.prototype = new Enemy()

BossFourSpawner.prototype.constructor = BossFourSpawner

function BossFourSpawner(world, x, y, id, impulse_game_state, enemy_type, enemy_spawn, push_force, boss) {

  this.type = "boss four spawner"

  this.init(world, x, y, id, impulse_game_state)

  this.enemy_type = enemy_type
  this.image_enemy_type = this.type+" "+enemy_type

  this.color = "black"
  this.interior_color = impulse_enemy_stats[this.enemy_type].color
  this.spawn = false
  this.spawn_number = enemy_spawn
  this.push_force = push_force

  this.parent = boss

}

BossFourSpawner.prototype.additional_processing = function(dt) {
  if(this.level.enemy_numbers[this.enemy_type] >= this.level.enemies_data[this.enemy_type][4]) {
      this.silence(100)
      this.spawn = false
      return
  }

	if(this.spawn) {

		var ray_angle = _atan(this.parent.body.GetPosition(), this.body.GetPosition())
    var j = 0
    var exit_points = Math.max(this.spawn_number, 4)
    for(var i = 0; i < this.spawn_number; i++) {

      if(this.level.enemy_numbers[this.enemy_type] + i >= this.level.enemies_data[this.enemy_type][4]) {
        //prevents over_spawn
        this.silence(100)
        this.spawn = false
        return
      }
      while(!isVisible(this.body.GetPosition(),
        {x: this.body.GetPosition().x + 10 * Math.cos(ray_angle + Math.PI * 2 * j/exit_points),
          y: this.body.GetPosition().y + 10 * Math.sin(ray_angle + Math.PI * 2 * j/exit_points)},
          this.level.obstacle_edges
        )) {j += 1}

  		var loc = [this.body.GetPosition().x + this.effective_radius * Math.cos(ray_angle + Math.PI * 2 * j/exit_points),
  		this.body.GetPosition().y + this.effective_radius * Math.sin(ray_angle + Math.PI * 2 * j/exit_points)]

      var temp_enemy = new (impulse_enemy_stats[this.enemy_type].className)(this.world, loc[0], loc[1], this.level.enemy_counter, this.impulse_game_state)

      var force = new b2Vec2(Math.cos(ray_angle + Math.PI * 2 * j/exit_points), Math.sin(ray_angle + Math.PI * 2 * j/exit_points))
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

BossFourSpawner.prototype.additional_drawing = function(context, draw_factor) {
  if(this.status_duration[1] > 0 && !this.color_silenced && !this.dying) {
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * 0.999 * (this.status_duration[1] / this.last_stun), true)
    context.lineWidth = 2
    context.strokeStyle = this.interior_color;
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
//Death Rays do not die on collision
}

BossFourSpawner.prototype.spawn_enemy = function() {
  if(this.status_duration[1] <= 0) {
  	this.spawn = true
  }

}

BossFourSpawner.prototype.move = function() {
  this.set_heading(this.player.body.GetPosition())
}
