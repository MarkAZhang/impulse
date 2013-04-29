Orbiter.prototype = new Enemy()

Orbiter.prototype.constructor = Orbiter

function Orbiter(world, x, y, id, impulse_game_state) {
  this.type = "orbiter"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.safe_distance = this.player.impulse_radius * 1.25

  this.offset_multiplier = 1;

  this.pathfinding_delay = 18;

  this.pathfinding_delay_far = 18;
  this.pathfinding_delay_near = 6;

  this.cautious = false;

}

Orbiter.prototype.player_hit_proc = function() {
  this.player.silence(2000)
}

Orbiter.prototype.additional_processing = function(dt) {
  if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) < this.safe_distance * 1.5) {
    this.pathfinding_delay = this.pathfinding_delay_near;

  } else {
    this.pathfinding_delay = this.pathfinding_delay_far;
  }
}

Orbiter.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
    this.body.ApplyImpulse(new b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
}

Orbiter.prototype.get_target_path = function() {

  var orig_angle = _atan(this.player.body.GetPosition(), this.body.GetPosition());
  var divisions = 64;
  var offsets = [-1, 1, -2, 2, -4, 4, -8, 8, -12, 12, -16, 16, -20, 20]
  var offset = 0;
  this.offset_multiplier *= -1;

  var is_valid = false;
  var this_path = null;
  while(!is_valid && offset< offsets.length) {


    var guess_angle = orig_angle + (Math.PI * 2) / divisions * offsets[offset] * this.offset_multiplier;
    if(isNaN(guess_angle)) {
    }

    is_valid = true;


    var tempPt = new b2Vec2(this.player.body.GetPosition().x + Math.cos(guess_angle) * this.safe_distance,
                            this.player.body.GetPosition().y + Math.sin(guess_angle) * this.safe_distance)
    for(var k = 0; k < this.level.boundary_polygons.length; k++)
    {
      if(pointInPolygon(this.level.boundary_polygons[k], tempPt))
      {
        is_valid = false
        break;
      }
    }

    if(is_valid) {
      this_path = this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), tempPt, this.level.boundary_polygons, this)

      if(!this_path.path) {
        is_valid = false;
      } else if(!path_safe_from_pt(this_path.path, this.player.body.GetPosition(), this.player.impulse_radius * 1.1)) {
        is_valid = false
      }
    }

    if(is_valid) {
      return this_path;
    }
    offset += 1;
  }



  return this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), get_safe_point(this, this.player), this.level.boundary_polygons, this)

}

Enemy.prototype.move = function() {

  if(this.player.dying) return //stop moving once player dies

  if(this.status_duration[0] > 0) return //locked

  this.pathfinding_counter+=1
  if ((this.path && !this.path[0]) || this.pathfinding_counter % 8 == 0 || this.pathfinding_counter >= this.pathfinding_delay) {
    //only update path every four frames. Pretty expensive operation
    var target_path = this.get_target_path()

    if(!target_path.path) return
    if((this.path && this.path.length == 0) || (this.path && this.path.length == 1 && target_path.path[target_path.length - 1] == this.player.body.GetPosition()) || this.pathfinding_counter >= this.pathfinding_delay || (this.path && !isVisible(this.body.GetPosition(), this.path[0], this.level.obstacle_edges)))
    //if this.path.length == 1, there is nothing in between the enemy and the player. In this case, it's not too expensive to check every frame to make sure the enemy doesn't kill itself
    {
        var new_path = target_path;

      if(new_path.path!=null) {
        this.path = new_path.path
        this.path_dist = new_path.dist
        this.target_point = this.path[this.path.length - 1]
      }
      this.pathfinding_counter = Math.floor(Math.random()*.5 * this.pathfinding_delay)
    }

  }

  if(!this.path)
  {
    return
  }

  var endPt = this.path[0]
  if ( this.pathfinding_counter % 4 == 0) {
    while(this.path.length > 0 && p_dist(endPt, this.body.GetPosition())<1)
    //get rid of points that are too close
    {
      this.path = this.path.slice(1)
      endPt = this.path[0]
    }

    if(!endPt || !isVisible(this.body.GetPosition(), endPt, this.level.obstacle_edges))
    //if it's not possible to reach the point
    {
      return
    }

    if(isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges) && this.target_point == this.player.body.GetPosition()) {//if we can see the player directly, immediately make that the path
      this.path = [this.player.body.GetPosition()]
      endPt = this.path[0]
    }
  }
  if(endPt)
    this.move_to(endPt)
}