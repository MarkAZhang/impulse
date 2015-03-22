var EnemySpawner = function(
		type,
		first_spawn_time,
		spawn_period_init,
		spawn_period_decr_per_minute,
		spawn_period_min,
		num_per_spawn_init,
		num_per_spawn_incr_per_minute,
		max_enemies) {
  this.type = type;
  this.first_spawn_time = first_spawn_time;
  this.spawn_period_init = spawn_period_init;
  this.spawn_period_decr_per_minute = spawn_period_decr_per_minute;
  this.spawn_period_min = spawn_period_min;
  this.num_per_spawn_init = num_per_spawn_init;
  this.num_per_spawn_incr_per_minute = num_per_spawn_incr_per_minute;
  this.max_enemies = max_enemies;

  // if the first_spawn is 0, then it will be in the initial_spawn, so set spawn_period to full. Otherwise 0 so it spawns immediately
  this.spawn_period = this.first_spawn_time == 0 ? this.spawn_period_init * 1000 : 1;
};

// Decrement the spawn period if applicable
EnemySpawner.prototype.process = function(dt, game_seconds) {
	if (game_seconds > this.first_spawn_time) {
		this.spawn_period -= dt;
	}
};

// Get the number of enemies to spawn in this iteration.
EnemySpawner.prototype.get_spawn_number = function(game_seconds) {
	if (this.spawn_period <= 0) {
		this.spawn_period += this.calculate_current_spawn_period_(game_seconds);
		return this.calculate_current_num_spawn_(game_seconds);
	}
}

EnemySpawner.prototype.reset_spawn_period = function(game_seconds) {
	this.spawn_period = this.calculate_current_spawn_period_(game_seconds);
}

EnemySpawner.prototype.get_type = function() {
	return this.type
}

EnemySpawner.prototype.calculate_current_spawn_period_ = function(game_seconds) {
	return Math.max(this.spawn_period_init - (game_seconds - this.first_spawn_time) / 60 * this.spawn_period_decr_per_minute,
									this.spawn_period_min) * 1000;
}

EnemySpawner.prototype.calculate_current_num_spawn_ = function(game_seconds) {
	var num_per_spawn_adj = 0
	if (this.spawn_period_decr_per_minute > 0) {
		// Calculate the current spawn period.
		var current_spawn_period = (this.spawn_period_init - (game_seconds - this.first_spawn_time) / 60 * this.spawn_period_decr_per_minute)
		// Determine if we have already gone past the spawn period min. If so, the period will no longer decrease, and we need to increase the spawn to compensate.
		var minutes_over_spawn_period_min = Math.max(0, (this.spawn_period_min - current_spawn_period) / this.spawn_period_decr_per_minute);
		// Increase the spawn by the equivalent of increasing by 2 per minute with the original spawn period. (a reasonable heuristic)
		num_per_spawn_adj = minutes_over_spawn_period_min * 2 * this.spawn_period_min / this.spawn_period_init;
	}

	return (this.num_per_spawn_init + (game_seconds - this.first_spawn_time) / 60 * this.num_per_spawn_incr_per_minute) + num_per_spawn_adj

}

EnemySpawner.prototype.get_max_enemies = function() {
		return this.max_enemies
}

module.exports = EnemySpawner;
