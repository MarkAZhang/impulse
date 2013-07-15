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
  this.pathfinding_delay_near = 9;

  this.cautious = false;
  this.fast_factor = 2;

  this.attack_mode = false;

  this.entered_arena = false;
  this.entered_arena_delay = 1000;

  this.orbiter_force = 50;
  this.twitch = true

  this.orbiter_checks = [-1, 1, -4, 4, -8, 8, -12, 12, -16, 16]

  this.max_guesses = 4

  this.weakened_duration = 0
  this.weakened_interval = 500
  this.orig_lin_damp = impulse_enemy_stats[this.type].lin_damp
  this.extra_adjust = true
  this.adjust_position_factor = 0.3

  this.check_in_poly_interval = 200
  this.check_in_poly_timer = 100

  this.orbit_radius = 1.2 * this.player.impulse_radius

  this.no_death_on_open = true

}

Orbiter.prototype.player_hit_proc = function() {
  this.player.silence(2000)
}

Orbiter.prototype.additional_drawing = function(context, draw_factor) {
  return
  context.beginPath()
  var orig_angle = _atan(this.player.body.GetPosition(), this.body.GetPosition());
  var divisions = 64;
  var offsets = this.orbiter_checks
  var offset = 0;
  while(offset< offsets.length) {

    var guess_angle = orig_angle + (Math.PI * 2) / divisions * offsets[offset] * this.offset_multiplier;


    var tempPt = new b2Vec2(this.player.body.GetPosition().x + Math.cos(guess_angle) * this.safe_distance,
                              this.player.body.GetPosition().y + Math.sin(guess_angle) * this.safe_distance)

    context.moveTo(tempPt.x * draw_factor + 5, tempPt.y *draw_factor)
    context.arc(tempPt.x * draw_factor, tempPt.y * draw_factor, 5, 0, 2* Math.PI)
    offset += 1;
  }
  context.fillStyle = "white"
  context.fill()
}

Orbiter.prototype.additional_processing = function(dt) {
  if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) < this.safe_distance * 1.5) {
    this.pathfinding_delay = this.pathfinding_delay_near;

  } else {
    this.pathfinding_delay = this.pathfinding_delay_far;
  }

  this.check_in_poly_timer -= dt
  if(this.check_in_poly_timer < 0) {
    var in_poly = false
    for(var i = 0; i < this.level.boundary_polygons.length; i++)
    {
      if(pointInPolygon(this.level.boundary_polygons[i], this.body.GetPosition()))
      {
        in_poly = true
      }
    }

    this.in_poly = in_poly
    this.check_in_poly_timer = this.check_in_poly_interval
  }


  if(this.weakened_duration > 0) {
    this.weakened_duration -= dt
    this.lin_damp = 3
  } else {
    this.lin_damp = this.orig_lin_damp
  }

  this.set_heading(this.player.body.GetPosition())

  if(!this.entered_arena && check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.silence(this.entered_arena_delay)
    this.entered_arena = true
  }

  if(this.entered_arena_timer > 0) {
    this.entered_arena_timer -= dt
  }

  if(!check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.entered_arena = false
  }

  this.attack_mode = (this.player.attacking && !this.player.point_in_impulse_angle(this.body.GetPosition())) || this.player.status_duration[0]  > 0 || this.player.status_duration[1] > 0 || this.player.status_duration[4] > 0
  this.charging = this.attack_mode && !this.dying && this.path && this.path.length == 1 && this.path[0] == this.player.body.GetPosition() && (this.status_duration[1] <= 0) && this.entered_arena
}

Orbiter.prototype.get_target_path = function() {

  //console.log("GET PATH AT "+(new Date()).getTime()+" "+this.id)
  //console.log(this.pathfinding_delay)

  if(!this.attack_mode) {
    var orig_angle = _atan(this.player.body.GetPosition(), this.body.GetPosition());
    var divisions = 64;
    var offsets = this.orbiter_checks
    var offset = 0;

    if(this.twitch)
      this.offset_multiplier *= -1;

    var is_valid = false;
    var this_path = null;

    var guesses = 0
    while(!is_valid && offset< offsets.length) {

      //console.log("checking "+offsets[offset])
      var guess_angle = orig_angle + (Math.PI * 2) / divisions * offsets[offset] * this.offset_multiplier;

      is_valid = true;


      var tempPt = new b2Vec2(this.player.body.GetPosition().x + Math.cos(guess_angle) * this.safe_distance,
                              this.player.body.GetPosition().y + Math.sin(guess_angle) * this.safe_distance)
      for(var k = 0; k < this.level.boundary_polygons.length; k++)
      {
        if(pointInPolygon(this.level.boundary_polygons[k], tempPt))
        {
          //console.log("inside boundary polygon")
          is_valid = false
          break;
        }
      }

      if(is_valid) {
        this_path = this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), tempPt, this.level.boundary_polygons, this)

        if(!this_path.path) {
          //console.log("no path to loc")
          is_valid = false;
          guesses += 1
          if(guesses >= this.max_guesses)
            break
        } else if(!path_safe_from_pt(this_path.path, this.player.body.GetPosition(), this.orbit_radius)) {
          //console.log("not safe from player")
          is_valid = false
          guesses += 1
          if(guesses >= this.max_guesses)
            break
        }
      }

      if(is_valid) {
        //console.log("RETURNING default path")
        return this_path;
      }
      offset += 1;
    }


    if(!this.impulse_game_state.is_boss_level) {
      //console.log("RETURNING escape path")
      if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) < this.orbit_radius) 
        return this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), get_safest_spawn_point(this, this.player, this.impulse_game_state.level_name), this.level.boundary_polygons, this)
      else
        return this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), this.player.body.GetPosition(), this.level.boundary_polygons, this)    
    } else {
      //console.log("null path")
      return {path: null, dist: null}
    }
  } else {
    return this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), this.player.body.GetPosition(), this.level.boundary_polygons, this)
  }
}

Orbiter.prototype.move = function() {

  if(this.player.dying) return //stop moving once player dies

  if(this.status_duration[0] > 0) return //locked


  this.pathfinding_counter+=1
  if ((this.path && !this.path[0]) || /*this.pathfinding_counter % 8 == 0 ||*/ this.pathfinding_counter >= this.pathfinding_delay) {

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
      this.pathfinding_counter = Math.floor(Math.random()*.1 * this.pathfinding_delay)
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

Orbiter.prototype.modify_movement_vector = function(dir) {
  
  if(this.charging) {
    dir.Multiply(this.fast_factor)
    dir.Multiply(this.force)
  } else {
    if((this.in_poly && this.cautious && this.in_poly_slow_duration > 0) || this.status_duration[2] > 0 )//move cautiously...isn't very effective in preventing accidental deaths
    {
      dir.Multiply(this.slow_force)
    }
    else
    {
      dir.Multiply(this.force)
    }
  }

  
  //if(this.status_duration[1] > 0) { // if silenced, cannot move
  //  dir.Multiply(0)
  //}
}

Orbiter.prototype.move_to = function(endPt) {

  var dir = new b2Vec2(endPt.x - this.body.GetPosition().x, endPt.y - this.body.GetPosition().y)
  dir.Normalize()

  this.modify_movement_vector(dir)

  this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

}

Orbiter.prototype.player_hit_proc = function() {
  var orbiter_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
  var a = new b2Vec2(this.orbiter_force * Math.cos(orbiter_angle), this.orbiter_force * Math.sin(orbiter_angle))
  this.player.body.ApplyImpulse(new b2Vec2(this.orbiter_force * Math.cos(orbiter_angle), this.orbiter_force * Math.sin(orbiter_angle)), this.player.body.GetWorldCenter())
}

Orbiter.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.weakened_duration = this.weakened_interval

}