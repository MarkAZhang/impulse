
// NOT an enemy. Does not have a box2d body. Cannot be killed.
var BossTwoSpawner = function(x, y, boss, impulse_game_state) {
  this.x = x
  this.y = y
  this.boss = boss
  this.color = this.boss.color
  this.world = this.boss.world
  this.impulse_game_state = impulse_game_state
  this.level = this.impulse_game_state.level
  this.player = this.impulse_game_state.player
  this.size = 60
  this.visibility = 0

  this.enemies_to_spawn = {
    "stunner": 1,
    "spear": 1,
    "tank": 2,
    "mote": 1,
    "goo": 1,
    "harpoon": 1
  }

  this.enemies_to_spawn_easy = {
    "stunner": 3,
    "spear": 3,
    "tank": 2,
    "mote": 2,
    "goo": 1,
    "harpoon": 1
  }

  this.high_gravity_factor = 0.75//1.5
  this.low_gravity_factor = 1.5//3

  this.high_gravity_force = .8
  this.low_gravity_force = .2
}

BossTwoSpawner.prototype.draw = function(context, draw_factor, prop, next_enemy_type) {

  context.save()
  context.globalAlpha *= .5
  renderUtils.drawSprite(context, this.x, this.y, Math.PI/4, this.size * 2, this.size * 2, "consumendi_glow", sprites.consumendiSprite)
  renderUtils.drawSprite(context, this.x, this.y, Math.PI/4, this.size, this.size, "consumendi_mini", sprites.consumendiSprite)

  if(prop > 0) {
    context.beginPath()
    context.arc(this.x, this.y, this.size * 0.75, -.5* Math.PI, -.5 * Math.PI - 2*Math.PI * (1-prop), true)
    context.lineWidth = 4
    context.strokeStyle = enemyData[next_enemy_type].color
    context.stroke()
  }
  context.restore()
}

BossTwoSpawner.prototype.process = function(dt) {

  for(var i = 0; i < this.level.enemies.length; i++) {
      if (this.level.enemies[i].id == this.id) continue
      var boss_angle = utils.atan(this.level.enemies[i].body.GetPosition(), {x: this.x/imp_params.draw_factor, y: this.y/imp_params.draw_factor}) + Math.PI
      var gravity_force = this.get_gravity_force(this.level.enemies[i].body.GetPosition())
      if(gravity_force > 0)
        this.level.enemies[i].body.ApplyImpulse(new b2Vec2(gravity_force * Math.cos(boss_angle), gravity_force * Math.sin(boss_angle)), this.level.enemies[i].body.GetWorldCenter())
    }
    var boss_angle = utils.atan(this.player.body.GetPosition(), {x: this.x/imp_params.draw_factor, y: this.y/imp_params.draw_factor}) + Math.PI

    var gravity_force = this.get_gravity_force(this.player.body.GetPosition())

    if(gravity_force > 0)
      this.player.body.ApplyImpulse(new b2Vec2(gravity_force *  Math.cos(boss_angle), gravity_force * Math.sin(boss_angle)), this.player.body.GetWorldCenter())

}

BossTwoSpawner.prototype.get_gravity_force = function(loc) {
var dist =  utils.pDist(loc, {x: this.x/imp_params.draw_factor, y: this.y/imp_params.draw_factor})
  var inside = false

  if (dist <= this.size/imp_params.draw_factor * this.high_gravity_factor) {
    return this.high_gravity_force
  }
  else if (dist <= this.size/imp_params.draw_factor * this.low_gravity_factor) {
    return this.low_gravity_force
  }

  return 0
}

BossTwoSpawner.prototype.spawn_enemies = function(enemy_type) {
  var exit_points = 6

  var enemy_num = this.enemies_to_spawn[enemy_type]

  if (saveData.difficultyMode == "easy") {
    enemy_num = this.enemies_to_spawn_easy[enemy_type]
  }
  var j = 0;

  if(this.level.enemy_numbers[enemy_type] + 1 <= this.level.enemies_data[enemy_type][6]) {

    for(var i = 0; i < enemy_num; i++) {
      // coordinates in box2d world, not canvas.
      var world_x =  this.x/imp_params.draw_factor;
      var world_y =  this.y/imp_params.draw_factor;
      var ray_angle = utils.atan({x: world_x, y: world_y}, this.boss.body.GetPosition())
       // find a direction that isn't close to the wall
      var angle = ray_angle + Math.PI * 2 * (j + (1/((j - (j % exit_points))/exit_points + 1)))/exit_points
      while(!utils.isVisible({x: world_x, y: world_y},
        {x: world_x + 10 * Math.cos(angle),
          y: world_y + 10 * Math.sin(angle)},
          this.level.obstacle_edges
        ))
      {
          j += 1
          angle = ray_angle + Math.PI * 2 * (j + (1/((j - (j % exit_points))/exit_points + 1)))/exit_points
      }


      var loc = [(this.x + this.size/2 * Math.cos(angle))/imp_params.draw_factor,
      (this.y + this.size/2 * Math.sin(angle))/imp_params.draw_factor]

      var temp_enemy = new (enemyData[enemy_type].className)(this.world, loc[0], loc[1],
      this.level.enemy_counter, this.impulse_game_state)
      temp_enemy.set_heading(angle);

      if(temp_enemy.type == "harpoon") {
        temp_enemy.dire_harpoon = true
      }
      this.level.spawned_enemies.push(temp_enemy)

      this.level.enemy_counter +=1

      j += 1;
    }
  }
}
