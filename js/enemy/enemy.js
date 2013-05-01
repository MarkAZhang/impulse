var Enemy = function(world, x, y, id, impulse_game_state) {
  //empty constructor since Enemy should not be constructed
}

Enemy.prototype.init = function(world, x, y, id, impulse_game_state) {
//need to set this.type before calling init

//need to set effective_radius if do_yield = true

  this.impulse_game_state = impulse_game_state
  this.level = impulse_game_state.level
  this.player = impulse_game_state.player
  this.world = world
  for(i in impulse_enemy_stats[this.type]) {
    this[i] = impulse_enemy_stats[this.type][i]
  }

  this.pointer_vertices = []

  this.pointer_vertices.push(new b2Vec2(Math.cos(Math.PI*0), Math.sin(Math.PI*0)))
  this.pointer_vertices.push(new b2Vec2(Math.cos(Math.PI*5/6), Math.sin(Math.PI*5/6)))
  this.pointer_vertices.push(new b2Vec2(Math.cos(Math.PI*7/6), Math.sin(Math.PI*7/6)))

  this.pointer_max_radius = .7

  this.pointer_fadein_duration = 1000

  this.pointer_visibility = 0

  this.open_period = 1500

  this.require_open = true

  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = this.lin_damp
  bodyDef.fixedRotation = true  //polygonShapes do not rotate
  this.body = world.CreateBody(bodyDef)

  this.shapes = []
  this.shape_points = []

  this.is_lightened = false

  for(var i = 0; i < this.shape_polygons.length; i++) {
    var polygon = this.shape_polygons[i]
    var this_shape = null
    if(polygon.type == "circle") {
      this_shape = new b2CircleShape(polygon.r)
      this_shape.SetLocalPosition(new b2Vec2(polygon.x, polygon.y))
    }
    if(polygon.type == "polygon") {
      var vertices = []
      for(var j= 0; j < polygon.vertices.length; j++) {
        vertices.push(new b2Vec2(polygon.x + polygon.r * polygon.vertices[j][0], polygon.y + polygon.r * polygon.vertices[j][1]))
      }
      this_shape = new b2PolygonShape
      this_shape.SetAsArray(vertices, vertices.length)
    }

    var fixDef = new b2FixtureDef;//make the shape
    fixDef.density = this.density;
    fixDef.friction = 0;
    fixDef.restitution = 1.0;
    fixDef.filter.categoryBits = 0x0011
    fixDef.filter.maskBits = 0x0012
    fixDef.shape = this_shape
    this.body.CreateFixture(fixDef).SetUserData(this)
    this.shapes.push(this_shape)
    if(this_shape instanceof b2PolygonShape)
      this.shape_points.push(this_shape.m_vertices)
    else
      this.shape_points.push(null)

    this.default_heading = true
  }

  this.shape_polar_points = []
  this.collision_polygons = []


  if (this.player) {
    for(var j = 0; j < this.shape_points.length; j++) {
      var these_polar_points = []
      if(this.shapes[j] instanceof b2PolygonShape) {
        var these_points = this.shape_points[j]
        for(var i = 0; i < these_points.length; i++) {
          var temp_r = p_dist({x: 0, y: 0}, these_points[i])
          var temp_ang = _atan({x: 0, y: 0}, these_points[i])
          these_polar_points.push({r: temp_r, ang: temp_ang})
        }
        this.collision_polygons.push(getBoundaryPolygon(these_points, (this.player.r + 0.1)))
      }
      else if(this.shapes[j] instanceof b2CircleShape) {
        var this_polygon = this.shape_polygons[j]
        var these_points = [{x: this_polygon.x + Math.cos()}]
        for(var i = 0; i < 4; i++) {
          var point = {x:this_polygon.x + Math.cos(i * Math.PI/2) * this_polygon.r, y: this_polygon.y + Math.sin(i * Math.PI/2) * this_polygon.r}
          var temp_r = p_dist({x: 0, y: 0}, point)
          var temp_ang = _atan({x: 0, y: 0}, point)
          these_polar_points.push({r: temp_r, ang: temp_ang})
        }
        this.collision_polygons.push(null)
      }
      this.shape_polar_points.push(these_polar_points)

    }
  }



  this.path = null
  this.path_dist = null

  this.yield_counter = 0

  this.yield = false
  this.id = id
  this.dying = false
  this.died = false
  this.dying_length = 500
  this.dying_duration = 0

  this.status_duration = [0, 0, 0, 0] //[locked, silenced, gooed, lightened], time left for each status

  this.durations = {}
  this.durations["open"] = 0

  this.is_enemy = true

  this.special_mode = false
  this.special_mode_visibility_timer = 0  //helps with the flashing special_mode appearance
  this.sp_visibility = 0


  //DEFAULTS, CAN BE OVERRIDDEN
  //how often enemy path_finds
  this.pathfinding_delay = 12
  this.pathfinding_counter =  this.pathfinding_delay  //pathfinding_delay and yield are defined in enemy

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.slow_factor = .3

  this.do_yield = false
  this.cautious = true

  this.slow_force = this.force / 3

  this.in_poly = false

  this.in_poly_slow_interval = 2000

  this.in_poly_slow_duration = this.in_poly_slow_interval

  this.death_radius = 2

}

Enemy.prototype.check_death = function() {
  //check if enemy has intersected polygon, if so die

  if (this.durations["open"] <= 0 && this.require_open) {
    return
  }

  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")

      return
    }
  }
}

Enemy.prototype.process_death = function(enemy_index, dt) {
  if(this.died && (this.dying != "hit_player" || this.dying_duration < this.dying_length - 50)) {//the moment the enemy starts to die, give a couple steps to resolve collisions, then remove the body from play
    this.died = false

    this.level.dead_enemies.push(enemy_index)
  }

  if(this.dying && this.dying_duration < 0)
  {//if expired, dispose of it
    this.level.expired_enemies.push(enemy_index)
    return true
  }

  if(this.dying )
  {//if dying, expire
    this.dying_duration -= dt
    return true
  }

  return false
}

Enemy.prototype.process = function(enemy_index, dt) {

  if(this.process_death(enemy_index, dt)) return
  if(this.spawned == false) {
    this.additional_processing(dt)
    return
  }
  if(this.activated) {
    this.activated_processing(dt)
    return
  }//for tank, and potentially other enemies

  if(this.status_duration[0] > 0) {
    this.status_duration[0] -= dt
  }
  if(this.status_duration[1] > 0) {
    this.status_duration[1] -= dt
  } else {
    if(this.color_silenced) {
      this.color_silenced = false;
    }
  }

  if(this.durations["open"] > 0) {
    this.durations["open"] -= dt;
  }
  if(this.status_duration[2] > 0) {
    this.status_duration[2] -= dt
    this.body.SetLinearDamping(this.lin_damp * 3)
  }
  else if (this.status_duration[3] > 0){
    this.status_duration[3] -= dt

    if(!this.is_lightened) {
      this.is_lightened = true
      var fixtures = this.body.GetFixtureList()
      if (fixtures.length === undefined) {
        fixtures = [fixtures]
      }
      for(var i = 0; i < fixtures.length; i++) {
        fixtures[i].SetDensity(this.density/5)
      }
      this.body.ResetMassData()
      this.force = impulse_enemy_stats[this.type].force/5
    }
  }
  else {
    if(this.is_lightened) {
      this.is_lightened = false
      var fixtures = this.body.GetFixtureList()
      if (fixtures.length === undefined) {
        fixtures = [fixtures]
      }
      for(var i = 0; i < fixtures.length; i++) {
        fixtures[i].SetDensity(this.density)
      }
      this.body.ResetMassData()
      this.force = impulse_enemy_stats[this.type].force

    }
    this.body.SetLinearDamping(this.lin_damp)
  }
  if(this.pointer_visibility < 1) {
    this.pointer_visibility = Math.min(this.pointer_visibility + dt/this.pointer_fadein_duration, 1)
  }

  this.special_mode_visibility_timer +=dt
  var leftover = this.special_mode_visibility_timer % 1000
  if(leftover > 500) leftover = 1000 - leftover
  this.sp_visibility = leftover/500

  if(this.in_poly) {
    this.in_poly_slow_duration -= dt
  }
  else {
    this.in_poly_slow_duration = this.in_poly_slow_interval
  }

  this.check_death()

  this.move()

  this.additional_processing(dt)
}

Enemy.prototype.additional_processing = function(dt) {

}

Enemy.prototype.activated_processing = function(dt) {

}

Enemy.prototype.get_target_point = function() {
  return this.player.body.GetPosition()

}

Enemy.prototype.move = function() {

  if(this.player.dying) return //stop moving once player dies

  if(this.status_duration[0] > 0) return //locked

  this.pathfinding_counter+=1
  if (this.pathfinding_counter % 8 == 0 || this.pathfinding_counter >= this.pathfinding_delay) {
    //only update path every four frames. Pretty expensive operation
    var target_point = this.get_target_point()

    if(!target_point) return
    if((this.path && this.path.length == 0) || (this.path && this.path.length == 1 && target_point == this.player.body.GetPosition()) || this.pathfinding_counter >= this.pathfinding_delay || (this.path && !isVisible(this.body.GetPosition(), this.path[0], this.level.obstacle_edges)))
    //if this.path.length == 1, there is nothing in between the enemy and the player. In this case, it's not too expensive to check every frame to make sure the enemy doesn't kill itself
    {
      var new_path = this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), target_point, this.level.boundary_polygons, this)


      if(new_path.path!=null) {
        this.path = new_path.path
        this.path_dist = new_path.dist
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

    if(isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges) && target_point == this.player.body.GetPosition()) {//if we can see the player directly, immediately make that the path
      this.path = [this.player.body.GetPosition()]
      endPt = this.path[0]
    }
  }

  //check if yielding
  if(this.do_yield) {
    if(this.yield_counter == this.yield_delay)
    {
      var nearby_enemies = getObjectsWithinRadius(this.body.GetPosition(), this.effective_radius*4, this.level.enemies, function(enemy) {return enemy.body.GetPosition()})
      this.yield = false
      for(var i = 0; i < nearby_enemies.length; i++)
      {//move if the highest id enemy
        if(nearby_enemies[i].id > this.id && nearby_enemies[i].type!="fighter_bullet")
        {
          this.yield = true
          break
        }
      }
      this.yield_counter = 0
    }
    this.yield_counter++
  }

  if((!this.do_yield || !this.yield) && endPt)
  {//move if not yielding
    this.move_to(endPt)
  }
}

Enemy.prototype.move_to = function(endPt) {



  var dir = new b2Vec2(endPt.x - this.body.GetPosition().x, endPt.y - this.body.GetPosition().y)
  dir.Normalize()

  this.modify_movement_vector(dir)  //primarily for Spear

  this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

  //if(this.shape instanceof b2PolygonShape) {
  if (this.default_heading) {
    this.set_heading(endPt)
  }
  //}
}

Enemy.prototype.modify_movement_vector = function(dir) {
  //apply impulse to move enemy
  var in_poly = false
  for(var i = 0; i < this.level.boundary_polygons.length; i++)
  {
    if(pointInPolygon(this.level.boundary_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }

  this.in_poly = in_poly

  if(this.in_poly && this.cautious && this.in_poly_slow_duration > 0)//move cautiously...isn't very effective in preventing accidental deaths
  {
    dir.Multiply(this.slow_force)
  }
  else
  {
    dir.Multiply(this.force)
  }
}

Enemy.prototype.set_heading = function(endPt) {
  var heading = _atan(this.body.GetPosition(), endPt)
  this.body.SetAngle(heading)
}

Enemy.prototype.start_death = function(death) {
  this.dying = death
  this.dying_duration = this.dying_length
  this.died = true
  if(this.dying == "kill" && !this.player.dying) {
    //if the player hasn't died and this was a kill, increase score
    this.impulse_game_state.game_numbers.kills +=1
    if(impulse_enemy_stats[this.type].proxy)
      impulse_enemy_stats[impulse_enemy_stats[this.type].proxy].kills += 1
    else
      impulse_enemy_stats[this.type].kills += 1
    if(this.is_boss) {
      var score_value = this.impulse_game_state.level.boss_kills >= this.score_value.length ? this.score_value[this.score_value.length - 1] : this.score_value[this.impulse_game_state.level.boss_kills]
    }
    else {
      var score_value = this.impulse_game_state.game_numbers.combo * this.score_value
    }
    this.impulse_game_state.addScoreLabel(score_value, this.color, this.body.GetPosition().x, this.body.GetPosition().y, 20)
    this.impulse_game_state.game_numbers.score += score_value
    this.impulse_game_state.increment_combo()
    this.impulse_game_state.check_cutoffs()
  }

  impulse_music.play_sound("sdeath")

  this.level.add_fragments(this.type, this.body.GetPosition(), this.body.GetLinearVelocity())

  this.additional_death_prep(death)

}

Enemy.prototype.additional_death_prep = function(death) {

}

Enemy.prototype.collide_with = function(other) {
//function for colliding with the player

  if(this.dying)//ensures the collision effect only activates once
    return

  if(other === this.player) {

    this.start_death("hit_player")
    if(this.status_duration[1] <= 0) {//do not proc if silenced
      this.player_hit_proc()
      this.impulse_game_state.reset_combo()
    }
  } else if(other instanceof Enemy) {
      if(other.durations["open"] > 0) {
        this.open(other.durations["open"])
      }
  }
}

Enemy.prototype.player_hit_proc = function() {
  //what happens when hits player
  this.player.stun(500)
}

Enemy.prototype.draw = function(context, draw_factor) {

  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) return

  /*if(!check_bounds(-this.effective_radius, this.body.GetPosition(), draw_factor)) {//if outside bounds, need to draw an arrow

    var pointer_point = get_pointer_point(this)
    var pointer_angle = _atan(pointer_point, this.body.GetPosition())
    context.save();
    context.translate(pointer_point.x * draw_factor, pointer_point.y * draw_factor);
    context.rotate(pointer_angle);
    context.translate(-(pointer_point.x) * draw_factor, -(pointer_point.y) * draw_factor);

    context.beginPath()
    context.globalAlpha = this.pointer_visibility
    context.strokeStyle = this.color
    context.lineWidth = 2
    var pointer_radius = this.pointer_max_radius * Math.max(Math.min(1, (15 - (p_dist(this.body.GetPosition(), pointer_point) - 3))/15), 0)
    context.moveTo((pointer_point.x+this.pointer_vertices[0].x*pointer_radius)*draw_factor, (pointer_point.y+this.pointer_vertices[0].y*pointer_radius)*draw_factor)


    for(var i = 1; i < this.pointer_vertices.length; i++)
    {
      context.lineTo((pointer_point.x+this.pointer_vertices[i].x*pointer_radius)*draw_factor, (pointer_point.y+this.pointer_vertices[i].y*pointer_radius)*draw_factor)
    }
    context.closePath()
    context.stroke()
    context.restore()
    context.globalAlpha = 1
    this.additional_drawing(context, draw_factor)
    return
  }*/

  if(!impulse_enemy_stats[this.type].seen) {
    impulse_enemy_stats[this.type].seen = true
    save_game()
  }

  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0


  //rotate enemy

  //if(this.shape instanceof b2PolygonShape) {
    //if polygon shape, need to rotate
    var tp = this.body.GetPosition()
    context.save();
    context.translate(tp.x * draw_factor, tp.y * draw_factor);
    context.rotate(this.body.GetAngle());
    context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
  //}
  var latest_color = null;

  for(var k = 0; k < this.shapes.length; k++) {

    if(this.shape_polygons[k].visible === false) continue

    // fade out if dying
    if (this.dying)
      context.globalAlpha = (1 - prog)
    else
      context.globalAlpha = this.visibility ? this.visibility : 1


    var cur_shape = this.shapes[k]
    var cur_shape_points = this.shape_points[k]
    var cur_color = this.shape_polygons[k].color ? this.shape_polygons[k].color : this.color


    // draw the shape
    context.beginPath()

    var radius_factor = this.dying ? (1 + this.death_radius * prog) : 1; // if dying, will expand
    if(cur_shape instanceof b2CircleShape) {
      //draw circle shape
        context.arc((this.body.GetPosition().x+ cur_shape.GetLocalPosition().x)*draw_factor, (this.body.GetPosition().y+ cur_shape.GetLocalPosition().y)*draw_factor, (cur_shape.GetRadius()*draw_factor) * (radius_factor), 0, 2*Math.PI, true)
    }
    if(cur_shape instanceof b2PolygonShape) {
      //draw polygon shape
      context.moveTo((tp.x+cur_shape_points[0].x*(1 + this.death_radius * prog))*draw_factor, (tp.y+cur_shape_points[0].y*(radius_factor))*draw_factor)
      for(var i = 1; i < cur_shape_points.length; i++)
      {
        context.lineTo((tp.x+cur_shape_points[i].x*(1 + this.death_radius * prog))*draw_factor, (tp.y+cur_shape_points[i].y*(radius_factor))*draw_factor)
      }
    }
    context.closePath()

    if (!this.interior_color ) {
      context.globalAlpha *= 0.7;
    }
    context.fillStyle = this.interior_color ? this.interior_color : cur_color

    if(!this.dying) {
      /*if (this.durations["open"] > 0) {
        context.fillStyle = impulse_colors["impulse_blue"]
      } else */if(this.status_duration[0] > 0) {
        context.fillStyle = 'gray';
      } if(this.color_silenced) {
        context.fillStyle = 'gray';
      } else if(this.status_duration[2] > 0) {
        context.fillStyle = "#e6c43c"
      } else if(this.status_duration[3] > 0) {
        context.fillStyle = 'cyan'
      }

    }
    latest_color = context.fillStyle

    context.fill()

    // revert transparency
    if (!this.interior_color ) {
      context.globalAlpha /= 0.7;
    }


    if(this.interior_color && context.fillStyle == this.interior_color)
      context.strokeStyle = cur_color
    else
      context.strokeStyle = context.fillStyle

    context.lineWidth = this.dying ? (1 - prog) * 2 : 2
    context.stroke()

    // give enemies a tiny of the level color
    /*context.strokeStyle = this.level.color;
    context.fillStyle = this.level.color;
    context.globalAlpha = .3;
    context.stroke();
    context.fill();
    context.globalAlpha = 1;*/

    if(this.special_mode && !this.dying) {
      context.globalAlpha = this.sp_visibility
      context.beginPath()
      if(this.shape instanceof b2CircleShape) {
        context.arc((this.body.GetPosition().x+ 2*cur_shape.GetLocalPosition().x)*draw_factor, (this.body.GetPosition().y+ 2*cur_shape.GetLocalPosition().y)*draw_factor, 0, 2*Math.PI, true)
      }

      if(this.shape instanceof b2PolygonShape) {
        context.moveTo((tp.x+cur_shape_points[0].x * 2)*draw_factor, (tp.y+cur_shape_points[0].y * 2)*draw_factor)
        for(var i = 1; i < cur_shape_points.length; i++) {
          context.lineTo((tp.x+cur_shape_points[i].x * 2)*draw_factor, (tp.y+cur_shape_points[i].y * 2)*draw_factor)
        }
        context.closePath()
      }
      context.lineWidth = 1
      context.strokeStyle = cur_color
      context.stroke()
    }
    context.globalAlpha = 1
  }
  context.restore()

  this.additional_drawing(context, draw_factor, latest_color)
}

Enemy.prototype.additional_drawing = function(context, draw_factor) {
}

Enemy.prototype.pre_draw = function(context, draw_factor) {
//things that should be drawn before anything else in the world

}

Enemy.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  this.open(this.open_period)
  this.body.ApplyImpulse(new b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
  this.process_impulse_specific(attack_loc, impulse_force, hit_angle)

}

Enemy.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {

}


Enemy.prototype.stun = function(dur) {
this.status_duration[0] = Math.max(dur, this.status_duration[0]) //so that a short stun does not shorten a long stun
this.status_duration[1] = Math.max(dur, this.status_duration[1])
}

Enemy.prototype.silence = function(dur, color_silence) {
  if(color_silence)
    this.color_silenced = color_silence
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
}

Enemy.prototype.lock = function(dur) {
this.status_duration[0] = Math.max(dur, this.status_duration[0])
}

Enemy.prototype.goo = function(dur) {
this.status_duration[2] = Math.max(dur, this.status_duration[2])
}

Enemy.prototype.lighten = function(dur) {
this.status_duration[3] = Math.max(dur, this.status_duration[3])
}

Enemy.prototype.open = function(dur) {
this.durations["open"] = Math.max(dur, this.durations["open"])
}

/*Enemy.prototype.check_player_intersection = function(other) {
  for(var i = 0; i < this.shapes.length; i++) {

    if(this.shapes[i] instanceof b2PolygonShape) {
      var collision_polygon = this.collision_polygons[i]
      var temp_vec = {x: other.body.GetPosition().x - this.body.GetPosition().x, y: other.body.GetPosition().y - this.body.GetPosition().y}
      var temp_ang = _atan({x:0, y:0}, temp_vec)
      var temp_mag = Math.sqrt(Math.pow(temp_vec.x, 2) + Math.pow(temp_vec.y, 2))
      var rotated_vec = {x: temp_mag * Math.cos(temp_ang - this.body.GetAngle()), y: temp_mag * Math.sin(temp_ang - this.body.GetAngle())}
      if(pointInPolygon(collision_polygon, rotated_vec))
        return true
    }
    else if(this.shapes[i] instanceof b2CircleShape)
    {
      var temp_vec = {x: other.body.GetPosition().x - this.body.GetPosition().x, y: other.body.GetPosition().y - this.body.GetPosition().y}
      var temp_ang = _atan({x:0, y:0}, temp_vec)
      var temp_mag = Math.sqrt(Math.pow(temp_vec.x, 2) + Math.pow(temp_vec.y, 2))
      var rotated_vec = {x: temp_mag * Math.cos(temp_ang - this.body.GetAngle()), y: temp_mag * Math.sin(temp_ang - this.body.GetAngle())}

      if (p_dist(rotated_vec, {x: this.shape_polygons[i].x, y: this.shape_polygons[i].y}) <= other.shape.GetRadius() + this.shape_polygons[i].r + 0.1)
        return true
    }
  }
  return false

}*/

Enemy.prototype.get_segment_intersection = function(seg_s, seg_f) {
  //checks if the segment intersects this enemy
  //returns the closest intersection to seg_s
  var ans = null
  var ans_d = null

  var cur_ang = this.shape_type == "polygon" ? this.body.GetAngle() : 0

  for(var k = 0; k < this.shape_polar_points.length; k++) {
    var these_polar_points = this.shape_polar_points[k]

    var j = these_polar_points.length - 1
    for(var i = 0; i < these_polar_points.length; i++)
    {
      var loc_i = {x: this.body.GetPosition().x + these_polar_points[i].r * Math.cos(these_polar_points[i].ang + cur_ang),
       y: this.body.GetPosition().y + these_polar_points[i].r * Math.sin(these_polar_points[i].ang + cur_ang)}
      var loc_j = {x: this.body.GetPosition().x + these_polar_points[j].r * Math.cos(these_polar_points[j].ang + cur_ang),
       y: this.body.GetPosition().y + these_polar_points[j].r * Math.sin(these_polar_points[j].ang + cur_ang)}
      var temp_point = getSegIntersection(loc_i, loc_j, seg_s, seg_f)
      if(temp_point == null) continue
      var temp_d = p_dist(temp_point, seg_s)
      if(ans_d == null || temp_d < ans_d)
      {
        ans = temp_point
        ans_d = temp_d
      }
      j = i
    }
  }
  return {point: ans, dist: ans_d}

}

Enemy.prototype.get_impulse_sensitive_pts = function() {
  return [this.body.GetPosition()]
}
