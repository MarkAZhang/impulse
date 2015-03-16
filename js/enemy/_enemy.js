var Enemy = function(world, x, y, id, impulse_game_state) {
  //empty constructor since Enemy should not be constructed
}

Enemy.prototype.enemy_canvas_factor = 1.5

Enemy.prototype.init = function(world, x, y, id, impulse_game_state) {
//need to set this.type before calling init

//need to set effective_radius if do_yield = true


  this.original_spawn_point = new b2Vec2(x, y);

  this.impulse_game_state = impulse_game_state
  this.image_enemy_type = this.type
  if(impulse_game_state) {
    this.level = impulse_game_state.level
    this.player = impulse_game_state.player
  }
  this.world = world
  for(i in enemyData[this.type]) {
    this[i] = enemyData[this.type][i]
  }


  this.pointer_vertices = []

  this.pointer_vertices.push(new b2Vec2(Math.cos(Math.PI*0), Math.sin(Math.PI*0)))
  this.pointer_vertices.push(new b2Vec2(Math.cos(Math.PI*5/6), Math.sin(Math.PI*5/6)))
  this.pointer_vertices.push(new b2Vec2(Math.cos(Math.PI*7/6), Math.sin(Math.PI*7/6)))

  this.pointer_max_radius = .7

  this.pointer_fadein_duration = 1000

  this.gooed_lin_damp_factor = 3

  this.destroyable_timer =

  this.pointer_visibility = 0

  this.open_period = 1500

  this.require_open = true

  this.lighten_factor = 1.5

  this.impulsed_color = impulse_colors["impulse_blue"]

  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = this.lin_damp
  bodyDef.fixedRotation = this.torqueRotate ? false : true  //polygonShapes do not rotate
  if(!bodyDef.fixedRotation) {
    bodyDef.angularDamping = 50
  }
  if(world) {
    this.body = world.CreateBody(bodyDef)
  }

  this.shapes = []
  this.shape_points = []

  this.has_lightened_properties = false

  this.impulsed_duration = 500

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
    fixDef.restitution = 0.7;
    fixDef.filter.categoryBits = this.categoryBits ? this.categoryBits : imp_params.ENEMY_BIT
    fixDef.filter.maskBits = this.maskBits ? this.maskBits : imp_params.ENEMY_BIT | imp_params.PLAYER_BIT | imp_params.BOSS_BITS
    fixDef.shape = this_shape
    if(this.body)
      this.body.CreateFixture(fixDef).SetUserData({"owner": this, "body": this.body, "self":this})
    this.shapes.push(this_shape)
    if(this_shape instanceof b2PolygonShape)
      this.shape_points.push(this_shape.m_vertices)
    else
      this.shape_points.push(null)

  }
  this.default_heading = true

  this.generate_collision_polygons()

  this.path = null
  this.path_dist = null

  this.yield_counter = 0

  this.yield = false
  this.id = id
  this.dying = false
  this.died = false
  this.default_dying_length = 500;
  this.dying_length = 500;
  this.dying_duration = 0;

  this.status_duration = [0, 0, 0, 0] //[locked, silenced, gooed, lightened], time left for each status

  this.durations = {}
  this.durations["open"] = 0
  this.durations["impulsed"] = 0
  this.durations["invincible"] = 0
  this.durations["disabled"] = 0

  this.is_enemy = true

  this.special_mode = false
  this.special_mode_visibility_timer = 0  //helps with the flashing special_mode appearance
  this.sp_visibility = 0



  //DEFAULTS, CAN BE OVERRIDDEN
  //how often enemy path_finds

  this.die_on_player_collision = true
  this.pathfinding_delay = 40
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

  this.last_lighten = 0

  this.statuses = ["normal", "impulsed", "stunned", "silenced", "gooed", "lighten", "white", "world1", "world2", "world3", "world4", "black"]
  this.additional_statuses = []

  this.adjust_position_counter = 0
  this.adjust_position_freq = 4
  this.adjust_position_polygon = false
  this.adjust_position_angle = null
  this.adjust_position_factor = 0.5
  this.adjust_position_enabled = true

  this.has_bulk_draw = false
  this.bulk_draw_nums = 0
  this.extra_adjust = false

  this.hit_proc_on_silenced = false // for spears, since they cannot charge while silenced but still cause knockback

  this.no_death_on_open = false

  this.heading_gap = 4
  this.heading_timer = 0
  this.actual_heading = null

  if (this.silence_outside_arena) {
    this.entered_arena = false
    this.entered_arena_timer = this.entered_arena_delay
    this.recovery_interval = this.entered_arena_delay
    this.recovery_timer = this.entered_arena_delay
  }
}

Enemy.prototype.check_death = function() {

  // if the enemy does not die on open, return it to its original spawn point.

  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(utils.pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {

      if(this.durations["open"] <= 0 && this.no_death_on_open) {
        this.body.SetPosition(this.original_spawn_point)
        return
      }
      if (this.durations["open"] <= 0 && this.require_open) {
        this.start_death("accident")
      } else {
        if (this.impulse_game_state.show_tutorial) {
          this.impulse_game_state.add_tutorial_signal("enemy_killed")
        }
        this.start_death("kill")
      }

      return
    }
  }
}

Enemy.prototype.generate_collision_polygons = function() {
  this.shape_polar_points = []
  this.collision_polygons = []


  if (this.player) {
    var cur_fixture = this.body.GetFixtureList()

    while(cur_fixture != null) {
      var cur_shape = cur_fixture.m_shape
      var these_polar_points = []
      if(cur_shape instanceof b2PolygonShape) {
        var these_points = cur_shape.m_vertices
        for(var i = 0; i < these_points.length; i++) {
          var temp_r = utils.pDist({x: 0, y: 0}, these_points[i])
          var temp_ang = utils.atan({x: 0, y: 0}, these_points[i])
          these_polar_points.push({r: temp_r, ang: temp_ang})
        }
        this.collision_polygons.push(utils.getBoundaryPolygon(these_points, (this.player.r + 0.1)))
      }
      /*else if(cur_shape instanceof b2CircleShape) {
        var this_polygon = this.body // not actually right, but we don't have any objects where this matters
        var these_points = [{x: this_polygon.x + Math.cos()}]
        for(var i = 0; i < 4; i++) {
          var point = {x:this_polygon.x + Math.cos(i * Math.PI/2) * cur_shape.r, y: this_polygon.y + Math.sin(i * Math.PI/2) * cur_shape.r}
          var temp_r = utils.pDist({x: 0, y: 0}, point)
          var temp_ang = utils.atan({x: 0, y: 0}, point)
          these_polar_points.push({r: temp_r, ang: temp_ang})
        }
        this.collision_polygons.push(null)
      }*/
      this.shape_polar_points.push(these_polar_points)
      cur_fixture = cur_fixture.GetNext()
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

  for(status in this.durations) {
    if(this.durations[status] > 0) {
      this.durations[status] -= dt
    }
  }

  if(this.status_duration[2] > 0) {
    this.status_duration[2] -= dt
    this.body.SetLinearDamping(this.lin_damp * this.gooed_lin_damp_factor)
  } else {
    this.body.SetLinearDamping(this.lin_damp)
  }
  if (this.status_duration[3] > 0){
    this.status_duration[3] -= dt

    if(!this.has_lightened_properties) {
      this.has_lightened_properties = true

      var fixtures = this.body.GetFixtureList()
      if (fixtures.length === undefined) {
        fixtures = [fixtures]
      }


      for(var i = 0; i < fixtures.length; i++) {
        var vertices = this.body.GetFixtureList().m_shape.m_vertices
        for(var j = 0; j < vertices.length; j++)
        {
          vertices[j] = new b2Vec2(vertices[j].x/this.lighten_factor, vertices[j].y/this.lighten_factor)
        }

        //fixtures[i].SetDensity(this.density/5)
      }
      this.body.ResetMassData()
      this.force = enemyData[this.type].force/this.lighten_factor/this.lighten_factor
    }
  }
  else {
    if(this.has_lightened_properties) {
      this.has_lightened_properties = false
      var fixtures = this.body.GetFixtureList()
      if (fixtures.length === undefined) {
        fixtures = [fixtures]
      }
       for(var i = 0; i < fixtures.length; i++) {
        var vertices = this.body.GetFixtureList().m_shape.m_vertices
        for(var j = 0; j < vertices.length; j++)
        {
          vertices[j] = new b2Vec2(vertices[j].x*this.lighten_factor, vertices[j].y*this.lighten_factor)
        }
        //fixtures[i].SetDensity(this.density)
      }
      this.body.ResetMassData()
      this.force = enemyData[this.type].force
    }
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

  this.adjust_position()

  this.process_entered_arena()

  this.move()

  this.additional_processing(dt)
}

Enemy.prototype.process_entered_arena = function() {

  if(!this.silence_outside_arena) return
  if(!this.entered_arena && utils.checkBounds(0, this.body.GetPosition(), imp_params.draw_factor)) {
    this.silence(this.entered_arena_delay)
    this.recovery_interval = this.entered_arena_delay
    this.recovery_timer = this.entered_arena_delay
    this.entered_arena = true
  }

  if(this.entered_arena_timer > 0) {
    this.entered_arena_timer -= dt
  }

  if(!utils.checkBounds(0, this.body.GetPosition(), imp_params.draw_factor)) {
    this.entered_arena = false
    this.silence(100, true)
    this.recovery_timer = 0
  }

  if (this.recovery_timer > 0) {
    this.recovery_timer -= dt;
    this.silence(100, true)
  }
}

Enemy.prototype.adjust_position = function() {
  this.adjust_position_counter += 1

  if(!this.adjust_position_enabled || (this.durations["open"] > 0 && this.type == "tank") || this.is_silenced()) return
  if(this.adjust_position_counter > this.adjust_position_freq) {
    this.adjust_position_counter = 0

    var in_polygon = false
    var polygons = this.level.boundary_polygons
    var angle = null

    for(var i = 0; i < polygons.length; i++) {
      if(utils.pointInPolygon(polygons[i], this.body.GetPosition())) {
        var closest_edge = utils.closestPolygonEdgeToPoint(polygons[i], this.body.GetPosition())
        if(closest_edge.dist != null) {
          var angle = utils.atan({x: 0, y: 0}, {x: closest_edge.p2.x - closest_edge.p1.x, y: closest_edge.p2.y - closest_edge.p1.y})  - Math.PI/2
          in_polygon = true
        } else {
          var closest_vertex = utils.closestPolygonVertexToPoint(polygons[i], this.body.GetPosition())
          if(closest_vertex.dist < levelData[this.level.level_name].buffer_radius) {
            var angle = utils.atan(closest_vertex.v, this.body.GetPosition())
            in_polygon = true
          }
        }
        break
      }
    }
    this.adjust_position_polygon = in_polygon
    if(in_polygon)
      this.adjust_position_angle = angle
    else
      this.adjust_position_angle = null
  }

  if(this.adjust_position_angle != null) {
    var dir = new b2Vec2(Math.cos(this.adjust_position_angle), Math.sin(this.adjust_position_angle))
    dir.Multiply(this.force * this.adjust_position_factor)
    if(this.durations["open"] > 0 && saveData.difficultyMode == "normal" && this.extra_adjust) {
      dir.Multiply(1.5)
    } else if((this.type == "goo" || this.type == "disabler") && this.durations["open"] > 0) {
      dir.Multiply(0)
    } else if (this.type == "harpoon" && this.durations["open"] > 0) {
      dir.Multiply(0.6)
    }
    this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

  }
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

  if(this.is_locked()) return;

  this.pathfinding_counter+=1
  if (this.pathfinding_counter % 4 == 0 || this.pathfinding_counter >= this.pathfinding_delay) {
    //this first loop only checks whether the first point is still reachable (see below for loop)
    var target_point = this.get_target_point()

    if(!target_point) return
    if((this.path && this.path.length == 0) || (this.path && this.path.length == 1 && target_point == this.player.body.GetPosition()) || this.pathfinding_counter >= this.pathfinding_delay || (this.path && !utils.isVisible(this.body.GetPosition(), this.path[0], this.level.obstacle_edges)))
    //if this.path.length == 1, there is nothing in between the enemy and the player. In this case, it's not too expensive to check every frame to make sure the enemy doesn't kill itself
    {
      var new_path = this.impulse_game_state.visibility_graph.query(this.body.GetPosition(), target_point, this.impulse_game_state.level.pick_alt_path)
      if(new_path.path!=null) {
        this.path = new_path.path
        this.path_dist = new_path.dist
      } else {
        this.path = null
        this.path_dist = null
      }
      this.pathfinding_counter = Math.floor(Math.random()*.25 * this.pathfinding_delay)
    }

  }

  if(!this.path)
  {
    return
  }

  var endPt = this.path[0]
  if ( this.pathfinding_counter % 4 == 0) {
    while(this.path.length > 0 && utils.pDist(endPt, this.body.GetPosition())<1)
    //get rid of points that are too close
    {
      this.path = this.path.slice(1)
      endPt = this.path[0]
    }

    if(!endPt || !utils.isVisible(this.body.GetPosition(), endPt, this.level.obstacle_edges))
    //if it's not possible to reach the point
    {
      return
    }

    if(target_point == this.player.body.GetPosition() &&
       utils.isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)) {//if we can see the player directly, immediately make that the path
      this.path = [this.player.body.GetPosition()]
      endPt = this.path[0]
    }
  }

  //check if yielding
  if(this.do_yield) {
    if(this.yield_counter == this.yield_delay)
    {
      var nearby_enemies = utils.getObjectsWithinRadius(this.body.GetPosition(), this.effective_radius*4, this.level.enemies, function(enemy) {return enemy.body.GetPosition()})
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
    this.set_heading_to(endPt)
  }
  //}
}

Enemy.prototype.modify_movement_vector = function(dir) {
  dir.Multiply(this.force)
}

Enemy.prototype.set_heading_to = function(point) {
  this.set_heading(utils.atan(this.body.GetPosition(), point))
}

Enemy.prototype.set_heading = function(heading) {
  this.heading_timer -= 1
  if(this.heading_timer <= 0) {
    this.body.SetAngle(heading)
    this.heading_timer = this.heading_gap
  }
  this.actual_heading = heading
}

Enemy.prototype.start_death = function(death) {
  if (this.durations["invincible"] > 0 && death == "hit_player") {
    return;
  }
  this.dying = death
  this.dying_length = (death == "fade") ? 500 : this.default_dying_length;
  this.dying_duration = this.dying_length;
  this.died = true
  if(this.dying == "kill" && !this.player.dying) {
    //if the player hasn't died and this was a kill, increase score
    this.impulse_game_state.game_numbers.kills +=1
    if(enemyData[this.type].proxy)
      saveData.numEnemiesKilled[enemyData[this.type].proxy] += 1;
    else
      saveData.numEnemiesKilled[this.type] += 1;
    if(!this.level.is_boss_level) {
      var score_value = this.impulse_game_state.game_numbers.combo * this.score_value
      if(saveData.optionsData.score_labels)
        this.impulse_game_state.addScoreLabel(score_value, this.color, this.body.GetPosition().x, this.body.GetPosition().y, 20)
      this.impulse_game_state.game_numbers.score += score_value
      this.impulse_game_state.increment_combo()
      this.impulse_game_state.check_cutoffs()
      if (score_value > questData["high_roller"].score_cutoff) {
        saveData.setQuestCompleted("high_roller");
      }
    }
  }

  if(this.dying != "accident" && this.dying != "fade" && this.dying != "absorbed") {
    if (this.type == "tank") {
      imp_params.impulse_music.play_sound("tdeath")
    } else if (this.is_boss) {
      imp_params.impulse_music.play_sound("tdeath")
      setTimeout(function() {
        imp_params.impulse_music.play_sound("tdeath")
      }, 150);
      setTimeout(function() {
        imp_params.impulse_music.play_sound("tdeath")
      }, 300);
    } else if (this.type == "troll" && this.dying == "hit_player" && !this.is_silenced()) {
      // do nothing if it's a troll hitting a player. there's a different sound.
    } else {
      imp_params.impulse_music.play_sound("sdeath")
    }
  }
  if (this.dying != "fade") {
    this.level.add_fragments(this.type, this.body.GetPosition(), this.body.GetLinearVelocity())
    this.additional_death_prep(death)
  }
}

Enemy.prototype.additional_death_prep = function(death) {

}

Enemy.prototype.collide_with = function(other) {
//function for colliding with the player

  if(this.dying)//ensures the collision effect only activates once
    return

    var transfer_factor = 0.2
    if(this.durations["open"] > 0) {
      if(other.type=="mote" || other.type == "troll") {
        var magnitude = this.body.m_linearVelocity
        var ratio = this.body.GetMass()/other.body.GetMass()
        other.body.ApplyImpulse(new b2Vec2(magnitude.x*transfer_factor*ratio, magnitude.y* transfer_factor*ratio), other.body.GetPosition())
        this.body.SetLinearVelocity(new b2Vec2(magnitude.x * (ratio)/(1+ratio), magnitude.y * (ratio)/(1+ratio)))
      }/* else if(this.body.GetLinearVelocity().Length() > 40 && other !== this.player) {
        var magnitude = this.body.GetLinearVelocity()
        var ratio = this.body.GetMass()/other.body.GetMass()
        other.body.ApplyImpulse(new b2Vec2(magnitude.x* transfer_factor*ratio, magnitude.y* transfer_factor*ratio), other.body.GetPosition())
        this.body.SetLinearVelocity(new b2Vec2(magnitude.x * (ratio)/(1+ratio), magnitude.y * (ratio)/(1+ratio)))
      }*/
    }

    if(other === this.player) {
      if(this.impulse_game_state.is_boss_level && !this.is_lightened()) {
        if(this.body.GetLinearVelocity().Length() > 50) {
          var player_transfer_factor = 0.5
          var magnitude = this.body.GetLinearVelocity()
          var ratio = this.body.GetMass()/other.body.GetMass()
          other.body.ApplyImpulse(new b2Vec2(magnitude.x*ratio * player_transfer_factor, magnitude.y*ratio* player_transfer_factor), other.body.GetPosition())
          this.body.SetLinearVelocity(new b2Vec2(magnitude.x * (ratio)/(1+ratio), magnitude.y * (ratio)/(1+ratio)))
        }
      }
      if (this.die_on_player_collision) {
        this.start_death("hit_player");
      }
      if(!this.is_silenced() || this.hit_proc_on_silenced) {//do not proc if silenced
        this.player_hit_proc()
      }
      // Always reset combo on contact, even when silenced. However, do not reset when inside disabler.
      if (!this.is_disabled()) {
        this.impulse_game_state.reset_combo()
      }
      if (this.impulse_game_state.show_tutorial) {
        this.impulse_game_state.add_tutorial_signal("enemy_touched")
      }
    } else if(other instanceof Enemy) {
        if(other.durations["open"] > 0) {
          this.open(other.durations["open"])
        }
      this.enemy_hit_proc(other);
    }
}

Enemy.prototype.enemy_hit_proc = function(other) {

}

Enemy.prototype.player_hit_proc = function() {
  //what happens when hits player
  if(saveData.difficultyMode == "easy") {
    this.player.stun(300)
  }
  if(saveData.difficultyMode == "normal") {
    this.player.stun(500)
  }
}

// draw a pointer if the enemy is off-screen
/*Enemy.prototype.uiRenderUtils.drawArrow = function(context, draw_factor) {
  if(!utils.checkBounds(-this.effective_radius, this.body.GetPosition(), draw_factor)) {//if outside bounds, need to draw an arrow

    var pointer_point = get_pointer_point(this)
    var pointer_angle = utils.atan(pointer_point, this.body.GetPosition())
    context.save();
    context.translate(pointer_point.x * draw_factor, pointer_point.y * draw_factor);
    context.rotate(pointer_angle);
    context.translate(-(pointer_point.x) * draw_factor, -(pointer_point.y) * draw_factor);

    context.beginPath()
    context.globalAlpha = this.pointer_visibility
    context.strokeStyle = this.color
    context.lineWidth = 2
    var pointer_radius = this.pointer_max_radius * Math.max(Math.min(1, (15 - (utils.pDist(this.body.GetPosition(), pointer_point) - 3))/15), 0)
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
    return true
  }
  return false;
}*/

Enemy.prototype.draw = function(context, draw_factor) {
  if(this.spawned == false && this.spawn_duration > .9 * this.spawn_interval) return

  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0

  //rotate enemy

  //if(this.shape instanceof b2PolygonShape) {
    //if polygon shape, need to rotate
    var tp = this.body.GetPosition()
    context.save();
    context.translate(tp.x * draw_factor, tp.y * draw_factor);
    context.rotate(this.actual_heading);
    /*context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);*/
  //}
  //var latest_color = this.get_current_color_with_status()

  var size = enemyData[this.type].images["normal"].height;
  if (this.dying)
    context.globalAlpha *= (1 - prog)
  else
    context.globalAlpha *= this.visibility ? this.visibility : 1

   var radius_factor = this.dying && this.dying != "fade"? (1 + this.death_radius * prog) : 1; // if dying, will expand

   var my_size = size
   if(this.is_lightened()) {

      var prog = this.status_duration[3]/this.last_lighten
      var lighten_factor = 1
      if(prog < .1)
      {
        var transition = 1 - prog/.1
        lighten_factor = (this.lighten_start) * transition + (this.lighten_finish) * (1-transition)
      } else if(prog > .9) {
        var transition = (prog - .9)/.1
        lighten_factor = (this.lighten_start) * transition + (this.lighten_finish) * (1-transition)
      } else {
        lighten_factor = this.lighten_finish
      }
      my_size *= lighten_factor
    }
  my_size *= radius_factor

  context.drawImage(enemyData[this.type].images[this.get_current_status()], 0, 0, size, size, -my_size/2, -my_size/2, my_size, my_size);

  context.restore()

  this.additional_drawing(context, draw_factor)
}


Enemy.prototype.additional_drawing = function(context, draw_factor) {
}

Enemy.prototype.pre_draw = function(context, draw_factor) {
//things that should be drawn before anything else in the world

}

Enemy.prototype.final_draw = function(context, draw_factor) {
//things that should be drawn after anything else in the world

}

Enemy.prototype.bulk_draw_start = function(context, draw_factor, num) {

}

Enemy.prototype.bulk_draw = function(context, draw_factor, num) {

}

Enemy.prototype.bulk_draw_end = function(context, draw_factor, num) {

}

Enemy.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  this.open(this.open_period)
  this.durations["impulsed"] += this.impulsed_duration
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

Enemy.prototype.invincible = function(dur) {
  this.durations["invincible"] = Math.max(dur, this.durations["invincible"])
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
  this.last_lighten = this.status_duration[3]
  this.lighten_start = 1
  this.lighten_finish = 1/this.lighten_factor
}

Enemy.prototype.open = function(dur) {
  this.durations["open"] = Math.max(dur, this.durations["open"])
}

Enemy.prototype.disable = function(dur) {
  this.durations["disabled"] = Math.max(dur, this.durations["disabled"])
}

Enemy.prototype.is_locked = function() {
  return this.status_duration[0] > 0;
};

Enemy.prototype.is_silenced = function() {
  return this.status_duration[1] > 0 || this.durations["disabled"] > 0;
}

Enemy.prototype.is_disabled = function() {
  return this.durations["disabled"] > 0;
}

Enemy.prototype.is_gooed = function() {
  return this.status_duration[2] > 0;
}

Enemy.prototype.is_lightened = function() {
  return this.status_duration[3] > 0;
}

Enemy.prototype.is_opened = function() {
  return this.durations["open"] > 0;
}

Enemy.prototype.is_invincible = function() {
  return this.durations["invincible"] > 0;
}

/*Enemy.prototype.check_player_intersection = function(other) {
  for(var i = 0; i < this.shapes.length; i++) {

    if(this.shapes[i] instanceof b2PolygonShape) {
      var collision_polygon = this.collision_polygons[i]
      var temp_vec = {x: other.body.GetPosition().x - this.body.GetPosition().x, y: other.body.GetPosition().y - this.body.GetPosition().y}
      var temp_ang = utils.atan({x:0, y:0}, temp_vec)
      var temp_mag = Math.sqrt(Math.pow(temp_vec.x, 2) + Math.pow(temp_vec.y, 2))
      var rotated_vec = {x: temp_mag * Math.cos(temp_ang - this.body.GetAngle()), y: temp_mag * Math.sin(temp_ang - this.body.GetAngle())}
      if(utils.pointInPolygon(collision_polygon, rotated_vec))
        return true
    }
    else if(this.shapes[i] instanceof b2CircleShape)
    {
      var temp_vec = {x: other.body.GetPosition().x - this.body.GetPosition().x, y: other.body.GetPosition().y - this.body.GetPosition().y}
      var temp_ang = utils.atan({x:0, y:0}, temp_vec)
      var temp_mag = Math.sqrt(Math.pow(temp_vec.x, 2) + Math.pow(temp_vec.y, 2))
      var rotated_vec = {x: temp_mag * Math.cos(temp_ang - this.body.GetAngle()), y: temp_mag * Math.sin(temp_ang - this.body.GetAngle())}

      if (utils.pDist(rotated_vec, {x: this.shape_polygons[i].x, y: this.shape_polygons[i].y}) <= other.shape.GetRadius() + this.shape_polygons[i].r + 0.1)
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

  var cur_ang = this.shape_type == "polygon" ? this.current_heading : 0

  for(var k = 0; k < this.shape_polar_points.length; k++) {
    var these_polar_points = this.shape_polar_points[k]

    var j = these_polar_points.length - 1
    for(var i = 0; i < these_polar_points.length; i++)
    {
      var loc_i = {x: this.body.GetPosition().x + these_polar_points[i].r * Math.cos(these_polar_points[i].ang + cur_ang),
       y: this.body.GetPosition().y + these_polar_points[i].r * Math.sin(these_polar_points[i].ang + cur_ang)}
      var loc_j = {x: this.body.GetPosition().x + these_polar_points[j].r * Math.cos(these_polar_points[j].ang + cur_ang),
       y: this.body.GetPosition().y + these_polar_points[j].r * Math.sin(these_polar_points[j].ang + cur_ang)}
      var temp_point = utils.getSegIntersection(loc_i, loc_j, seg_s, seg_f)
      if(temp_point == null) continue
      var temp_d = utils.pDist(temp_point, seg_s)
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

Enemy.prototype.set_up_images = function() {
  var normal_canvas = document.createElement('canvas');
  normal_canvas.width = enemyData[this.type].effective_radius * 2 * imp_params.draw_factor
  normal_canvas.height = enemyData[this.type].effective_radius * 2 * imp_params.draw_factor

  var normal_canvas_ctx = normal_canvas.getContext('2d');

  this.enemyRenderUtils.drawEnemyImage(normal_canvas_ctx);
  this.enemy_images = {}
  this.enemy_images["normal"] = normal_canvas
}

Enemy.prototype.draw_additional_image = function(context, color) {

}

Enemy.prototype.get_current_status = function() {

  if(!this.dying) {
      if(this.durations["impulsed"] > 0) {
        return "impulsed"
      }
      if(this.is_locked()) {
        return 'stunned';
      } else if(this.color_silenced) {
        return 'silenced'
      } else if(this.is_gooed()) {
        return "gooed"
      } else if (this.is_disabled()) {
        return 'silenced';
      }
    }

    return this.get_additional_current_status()
}

Enemy.prototype.get_additional_current_status = function() {
  return "normal"
}

Enemy.prototype.get_current_color_with_status = function(orig_color) {

  var cur_color = this.get_color_for_status(this.get_current_status())

  if(cur_color == this.color && orig_color) return orig_color

  return cur_color
}


Enemy.prototype.get_color_for_status = function(status) {
  if(status == "normal") {
    return this.color ? this.color : null
  } else if(status == "stunned") {
    return 'gray';
  } else if(status == "silenced") {
    return 'gray'
  } else if(status == "gooed") {
    return "#e6c43c"
  } else if(status == "impulsed") {
    return this.impulsed_color
  } else if(status == "white") {
    return "white"
  } else if(status == "black") {
    return "black"
  } else if(status.slice(0, 5) == "world") {
    return impulse_colors["world "+status.slice(5,6)+" lite"]
  }

  return this.get_additional_color_for_status(status)
}

Enemy.prototype.get_additional_color_for_status = function(status) {

}

Enemy.prototype.generate_images = function() {

  var images = {};
  var draw_polygons = this.shape_polygons
  var all_status = this.statuses.concat(this.additional_statuses)
  for(index in all_status) {
    var status = all_status[index]
    var normal_canvas = document.createElement('canvas');
    normal_canvas.width = enemyData[this.type].effective_radius * 2 * this.enemy_canvas_factor * imp_params.draw_factor
    normal_canvas.height = enemyData[this.type].effective_radius * 2 * this.enemy_canvas_factor * imp_params.draw_factor

    var normal_canvas_ctx = normal_canvas.getContext('2d');

    var cur_color = this.get_color_for_status(status)
    if (!cur_color) cur_color = this.color

    var tp = {x: enemyData[this.type].effective_radius * Enemy.prototype.enemy_canvas_factor, y: enemyData[this.type].effective_radius * Enemy.prototype.enemy_canvas_factor}
    normal_canvas_ctx.translate(tp.x * imp_params.draw_factor, tp.y * imp_params.draw_factor)

    enemyRenderUtils.drawEnemyImage(normal_canvas_ctx, status, draw_polygons, this.type, cur_color);
    normal_canvas_ctx.translate(-tp.x * imp_params.draw_factor, -tp.y * imp_params.draw_factor)
    images[status] = normal_canvas

  }

  return images

}

Enemy.prototype.dispose = function () {

};
