LevelIntroState.prototype = new LoaderGameState

LevelIntroState.prototype.constructor = LevelIntroState

function LevelIntroState(level_name, world) {


  this.level_name = level_name
  this.buttons = []
  this.world_num = world
  this.bg_drawn = false

  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"
  this.buttons.push(new SmallButton("LEVEL SELECT", 20, 150, imp_vars.levelHeight - 30, 200, 50, "black", "blue", function(_this){return function(){
    if(_this.world_num) {
      switch_game_state(new ClassicSelectState(_this.world_num))
    }
    else {
      switch_game_state(new TitleState(true))
    }
  }}(this)))

  this.star_colors = ['bronze', 'silver', 'gold']
  this.stars = imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score.stars

  this.drawn_enemies = null

  if(this.is_boss_level) {
    this.drawn_enemies = {}
    this.drawn_enemies[imp_params.impulse_level_data[this.level_name].dominant_enemy] = null
    this.num_enemy_type = 1
  }
  else {
    this.drawn_enemies = imp_params.impulse_level_data[this.level_name].enemies
    this.num_enemy_type = 0
    for(var j in imp_params.impulse_level_data[this.level_name].enemies) {
      this.num_enemy_type += 1
    }
  }
  this.enemy_image_size = 40

  this.level = this.load_level(imp_params.impulse_level_data[this.level_name])

  var num_row = 12

  var i = 0

  for(var j in this.drawn_enemies) {

    var k = 0
    var num_in_this_row = 0

    while(k < i+1 && k < this.num_enemy_type) {
      k+=num_row
    }

    if(k <= this.num_enemy_type) {
      num_in_this_row = num_row
    }
    else {
      num_in_this_row = this.num_enemy_type - (k - num_row)
    }
    var diff = (i - (k - num_row)) - (num_in_this_row - 1)/2

    var h_diff = Math.floor(i/num_row) - (Math.ceil(this.num_enemy_type/num_row) - 1)/2

    var cur_x =  imp_vars.levelWidth/2 + (this.enemy_image_size+10) * diff
    var cur_y = 525 + this.enemy_image_size * h_diff
    this.buttons.push(new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size, "rgba(0, 0, 0, 0.3)"))

    i+=1
  }
}

LevelIntroState.prototype.process = function(dt) {

}

LevelIntroState.prototype.draw = function(ctx, bg_ctx) {

  if(!this.bg_drawn) {
    bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    this.bg_drawn = true
    bg_ctx.translate(-imp_vars.sidebarWidth, 0)
    bg_canvas.setAttribute("style", "display:none")
  }
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)

  ctx.beginPath()
  ctx.fillStyle = impulse_colors['world '+ this.world_num]
  ctx.font = '30px Muli'
  ctx.textAlign = 'center'

  ctx.fillText(this.level_name, imp_vars.levelWidth/2, 80)
  ctx.fill()

  impulse_colors['world 2']

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  draw_level_obstacles_within_rect(ctx, this.level_name, imp_vars.levelWidth/2, 175, 200, 150, impulse_colors['world '+ this.world_num])
  ctx.beginPath()
  ctx.rect(imp_vars.levelWidth/2 - 100, 100, 200, 150)

  ctx.strokeStyle = "rgba(0, 0, 0, .3)"
  ctx.stroke()

  if (this.load_percentage < 1) {
    ctx.textAlign = 'center'
    draw_progress_bar(ctx, imp_vars.levelWidth - 150, imp_vars.levelHeight - 40, 200, 25, this.load_percentage, impulse_colors['world '+ this.world_num])
    ctx.font = '20px Muli'
    ctx.fillStyle = 'black'
    ctx.fillText("LOADING", imp_vars.levelWidth - 150, imp_vars.levelHeight - 33)
  }

  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {

    if(!this.is_boss_level) {
      for(var i = 0; i < 3; i++) {
        ctx.textAlign = 'right'
        ctx.font = '25px Muli'
        ctx.fillStyle = impulse_colors[this.star_colors[i]]
        ctx.fillText(imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][i],  imp_vars.levelWidth/2 + 100, 300 + 35 * i)
        draw_star(ctx,  imp_vars.levelWidth/2 - 80, 295 + 35 * i, 20, this.star_colors[i])
      }
    }
    score_color = 0

    if(!this.is_boss_level) {

      while(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score > imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][score_color]) {
        score_color+=1
      }
    }

    ctx.fillStyle = score_color > 0 ? impulse_colors[this.star_colors[score_color - 1]] : "black"
    ctx.textAlign = 'center'

    /*if(this.stars > 0)
      draw_star(ctx, 400, 420, 30, this.star_colors[this.stars - 1])
    else
    draw_empty_star(ctx, 400, 420, 30)*/
    ctx.font = '30px Muli'
    if(this.is_boss_level) {
      if(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].stars == 3) {
        ctx.fillText("BEST TIME: "+convert_to_time_notation(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].best_time),  imp_vars.levelWidth/2, 420)
      } else {
        ctx.fillStyle = impulse_colors['boss '+ this.world_num]
        ctx.fillText("UNDEFEATED",  imp_vars.levelWidth/2, 420)
      }
    } else 
      ctx.fillText("HIGH SCORE: "+imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score,  imp_vars.levelWidth/2, 420)

    ctx.fillStyle = "black"
    ctx.font = '20px Muli'
    ctx.fillText("ENEMIES",  imp_vars.levelWidth/2, 470)



  }
}


LevelIntroState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}


LevelIntroState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}



LevelIntroState.prototype.load_complete = function() {
  var hive_numbers = new HiveNumbers(this.world_num, false)
  this.buttons.push(new SmallButton("START LEVEL", 20, imp_vars.levelWidth - 150, imp_vars.levelHeight - 30, 300, 50, "black", "blue", function(_this){return function(){switch_game_state(new ImpulseGameState(_this.world_num, _this.level, _this.visibility_graph, hive_numbers, false, true))}}(this)))
}
