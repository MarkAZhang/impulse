BossFourSpawner.prototype = new Enemy()

BossFourSpawner.prototype.constructor = BossFourSpawner

function BossFourSpawner(world, x, y, id, impulse_game_state, enemy_type, boss) {

  this.type = "boss four spawner"
  
  this.init(world, x, y, id, impulse_game_state)

  this.enemy_type = enemy_type

  this.color = impulse_enemy_stats[enemy_type].color
  
  if(impulse_enemy_stats[enemy_type].interior_color) {
    this.interior_color = impulse_enemy_stats[enemy_type].interior_color
  }

  this.spawn = false

  this.parent = boss

}

BossFourSpawner.prototype.additional_processing = function(dt) {

	if(this.spawn) {

		var ray_angle = _atan(this.parent.body.GetPosition(), this.body.GetPosition())

		var loc = [this.body.GetPosition().x + this.effective_radius * Math.cos(ray_angle), 
		this.body.GetPosition().y + this.effective_radius * Math.sin(ray_angle)]
      	var temp_enemy = new this.level.enemy_map[this.enemy_type](this.world, loc[0], loc[1], this.level.enemy_counter, this.impulse_game_state)
      	temp_enemy.pathfinding_counter = temp_enemy.pathfinding_delay * 2
      	
		this.level.spawned_enemies.push(temp_enemy)
      	this.level.enemy_counter +=1
      	
      	this.spawn = false
      	this.stun(1000)
	}
}

BossFourSpawner.prototype.collide_with = function(other) {
//Death Rays do not die on collision
}

BossFourSpawner.prototype.spawn_enemy = function() {
  if(this.status_duration[1] <= 0) {
  	this.spawn = true	
  }
  
}
