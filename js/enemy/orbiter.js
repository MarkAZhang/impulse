Orbiter.prototype = new Enemy()

Orbiter.prototype.constructor = Orbiter

function Orbiter(world, x, y, id, impulse_game_state) {
  this.type = "orbiter"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

}

Orbiter.prototype.player_hit_proc = function() {
  this.player.silence(2000)
}

Orbiter.prototype.additional_processing = function(dt) {
}

Orbiter.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
    this.body.ApplyImpulse(new b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
}

Orbiter.prototype.enemy_move = Enemy.prototype.move;

Orbiter.prototype.move = function() {
  if(this.path == null) {
    this.pathfinding_counter = this.pathfinding_delay
  }
  this.enemy_move()
}

Orbiter.prototype.get_target_point = function() {
  if(!this.safe) {
    this.goalPt = null
    return get_safe_point(this, this.player)
  }
  else {

    if(this.goalPt != null && p_dist(this.player.body.GetPosition(), this.goalPt) < .9 * this.harpoon_length && !isVisible(this.player.body.GetPosition(), this.goalPt, this.level.obstacle_edges)) {
      return this.goalPt
    }

    if (this.check_for_good_target_point_timer > 0) {
      this.check_for_good_target_point_timer -= 1
      return this.player.body.GetPosition()
    }

    this.check_for_good_target_point_timer = this.check_for_good_target_point_interval

    for(var i = 0; i < 5; i++) {

      var random_angle = Math.random() * Math.PI * 2

      var is_valid = true

      var tempPt = new b2Vec2(this.player.body.GetPosition().x + Math.cos(random_angle) * this.harpoon_length * .9, this.player.body.GetPosition().y + Math.sin(random_angle) * this.harpoon_length * .9)

      if(check_bounds(0, tempPt, draw_factor)) {
        is_valid = false
      }

      for(var k = 0; k < this.level.boundary_polygons.length; k++)
      {
        if(pointInPolygon(this.level.boundary_polygons[k], tempPt))
        {
          is_valid = false
        }
      }

      if(isVisible(tempPt, this.player.body.GetPosition(), this.level.obstacle_edges)) {
        is_valid = false
      }
      if(is_valid) {
        this.goalPt = tempPt
        return tempPt
      }
    }
    this.goalPt = null
    return this.player.body.GetPosition()

  }
}
