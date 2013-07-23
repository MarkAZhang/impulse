GameOverState.prototype = new GameState

GameOverState.prototype.constructor = GameOverState

function GameOverState(final_game_numbers, level, world_num, visibility_graph) {
  this.level = level
  this.level_name = this.level.level_name
  this.buttons = []
  this.world_num = world_num
  this.visibility_graph = visibility_graph
  this.bg_drawn = false
  this.buttons.push(new SmallButton("ONCE AGAIN", 20, imp_vars.levelWidth - 150, imp_vars.levelHeight - 30, 300, 50, "blue", "black", function(_this){return function(){switch_game_state(new ImpulseGameState(_this.world_num, _this.level, _this.visibility_graph, false))}}(this)))
  this.buttons.push(new SmallButton("LEVEL SELECT", 20, 150, imp_vars.levelHeight - 30, 200, 50, "blue", "black", function(_this){return function(){
    if(_this.world_num) {
      switch_game_state(new ClassicSelectState(_this.world_num))
    }
    else {
      switch_game_state(new TitleState(true))
    }
  }}(this)))

  this.game_numbers = final_game_numbers

  if(!this.level.is_boss_level) {
    if(this.game_numbers.score > imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score) {
      this.high_score = true
      imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score = this.game_numbers.score

      var stars = 0
      while(this.game_numbers.score >= imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][stars])
      {
        stars+=1
      }
      imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].stars = stars
      this.stars = stars

    }
    else {
      this.high_score = false
      var stars = 0
      while(this.game_numbers.score > imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][stars])
      {
        stars+=1
      }
      this.stars = stars

    }

    if (this.stars < 3)
        this.bar_top_score = imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][this.stars]
      else
        this.bar_top_score = imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][2]

    this.stars_gained = 0
  }

  imp_vars.player_data.total_kills += this.game_numbers.kills

  save_game()
  calculate_stars(imp_vars.player_data.difficulty_mode)

  var closest_enemy_type = null
  var closest_prop = -1

  var drawn_enemies = {}

  if(this.level_name.slice(0, 4) == "BOSS") {
    drawn_enemies = imp_params.impulse_level_data[this.level_name].enemies
  }
  else {
    drawn_enemies = imp_params.impulse_level_data[this.level_name].enemies
  }

  for(j in drawn_enemies) {

    var i = j

    if (imp_params.impulse_enemy_stats[j].className.prototype.is_boss) continue

    if (imp_params.impulse_enemy_stats[j].proxy) {
      i = imp_params.impulse_enemy_stats[j].proxy
    }

    if(imp_params.impulse_enemy_stats[i].kills < impulse_enemy_kills_star_cutoffs[i]) {
      if(imp_params.impulse_enemy_stats[i].kills/impulse_enemy_kills_star_cutoffs[i] > closest_prop ) {
        closest_prop = imp_params.impulse_enemy_stats[i].kills/impulse_enemy_kills_star_cutoffs[i]
        closest_enemy_type = i
      }
    }
  }

  this.closest_enemy_type = closest_enemy_type


  this.star_colors = ["bronze", "silver", "gold"]

  imp_vars.impulse_music.stop_bg()
}

GameOverState.prototype.process = function(dt) {

}

GameOverState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "display:none" )
    this.bg_drawn = true
  }


  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)

  ctx.beginPath()

  ctx.font = '30px Muli'
  ctx.textAlign = 'center'

  if(this.level.is_boss_level) {
    if(this.level.boss_victory) {
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("VICTORY", imp_vars.levelWidth/2, 80)

    }
    else {
      ctx.fillStyle = 'red'
      ctx.fillText("DEFEAT", imp_vars.levelWidth/2, 80)
    }
  } else {
    ctx.fillStyle = 'red'
    ctx.fillText("GAME OVER", imp_vars.levelWidth/2, 80)
  }

  ctx.fill()
  ctx.beginPath()
  ctx.font = '20px Muli'
  ctx.fillStyle = 'black'
  ctx.fillText(this.level.level_name, imp_vars.levelWidth/2, 110)


  ctx.fillText("GAME TIME "+this.game_numbers.last_time, imp_vars.levelWidth/2, 140)
  ctx.strokeStyle = "black"

  var first_rect_y = 160
  ctx.rect(imp_vars.levelWidth/2 - 200, first_rect_y, 400, 180)
  ctx.lineWidth = 2
  ctx.stroke()


  if(!this.level.is_boss_level) {

    if(this.stars > 0)
      draw_star(ctx, imp_vars.levelWidth/2, first_rect_y + 50, 30, this.star_colors[this.stars - 1])
    else
      draw_empty_star(ctx, imp_vars.levelWidth/2, first_rect_y + 50, 30)

    draw_progress_bar(ctx, imp_vars.levelWidth/2, first_rect_y + 90, 200, 10, Math.min(this.game_numbers.score/this.bar_top_score, 1), (this.stars < 3 ? impulse_colors[this.star_colors[this.stars]] : impulse_colors[this.star_colors[2]]))

    draw_star(ctx, imp_vars.levelWidth/2 - 100, first_rect_y + 93, 15, this.star_colors[this.stars < 3 ? this.stars : 2])

    ctx.fillStyle = this.stars > 0 ? impulse_colors[this.star_colors[this.stars - 1]] : "black"

    ctx.fillText("SCORE: "+this.game_numbers.score, imp_vars.levelWidth/2, first_rect_y + 130)
    ctx.fillStyle = imp_params.impulse_level_data[this.level_name]['stars'] > 0 ? impulse_colors[this.star_colors[imp_params.impulse_level_data[this.level_name]['stars'] - 1]] : "black"
    if(this.high_score)
      ctx.fillText("NEW HIGH SCORE", imp_vars.levelWidth/2, first_rect_y + 160)
    else
      ctx.fillText("HIGH SCORE: "+ imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score, imp_vars.levelWidth/2, first_rect_y + 160)
  } else {
    if(this.level.boss_victory) {
      draw_star(ctx, imp_vars.levelWidth/2, first_rect_y + 50, 30, "gold")
      draw_progress_bar(ctx, imp_vars.levelWidth/2, first_rect_y + 90, 200, 10, 1, "gold")
      draw_star(ctx, imp_vars.levelWidth/2 - 100, first_rect_y + 93, 15, "gold")
    } else {
      draw_empty_star(ctx, imp_vars.levelWidth/2, first_rect_y + 50, 30)
      draw_progress_bar(ctx, imp_vars.levelWidth/2, first_rect_y + 90, 200, 10, 0, "gold")
      draw_star(ctx, imp_vars.levelWidth/2 - 100, first_rect_y + 93, 15, "gold")
    }


  }
  var second_rest_y = 370

  ctx.strokeStyle = 'black'
  ctx.rect(imp_vars.levelWidth/2 - 200, second_rest_y, 400, 110)
  ctx.stroke()

  ctx.fillStyle = 'black'

  ctx.fillText("KILLS: "+this.game_numbers.kills, imp_vars.levelWidth/2, second_rest_y + 30)

  if (this.closest_enemy_type != null) {
    var kills_text = (impulse_enemy_kills_star_cutoffs[this.closest_enemy_type] - imp_params.impulse_enemy_stats[this.closest_enemy_type].kills) == 1 ? "" : "S"

    draw_progress_bar(ctx, imp_vars.levelWidth/2, second_rest_y + 50, 200, 10,  imp_params.impulse_enemy_stats[this.closest_enemy_type].kills/impulse_enemy_kills_star_cutoffs[this.closest_enemy_type], imp_params.impulse_enemy_stats[this.closest_enemy_type].color)


    draw_enemy(ctx, this.closest_enemy_type, imp_vars.levelWidth/2 - 100, second_rest_y + 50, 35)

    ctx.fillStyle = "black"
    ctx.fillText("KILL "+(impulse_enemy_kills_star_cutoffs[this.closest_enemy_type] - imp_params.impulse_enemy_stats[this.closest_enemy_type].kills)+" MORE TO EARN A STAR", imp_vars.levelWidth/2, second_rest_y + 90)

  }
  else {
    ctx.fillStyle = "green"
    ctx.fillText("EARNED ALL BONUS SLAYER STARS" , imp_vars.levelWidth/2, second_rest_y + 60)
    ctx.fillText("FOR ENEMIES IN THIS LEVEL" , imp_vars.levelWidth/2, second_rest_y + 90)


  }


  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  ctx.fill()
}

GameOverState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

GameOverState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}
