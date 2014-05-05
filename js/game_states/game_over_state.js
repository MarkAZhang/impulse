GameOverState.prototype = new GameState

GameOverState.prototype.constructor = GameOverState

function GameOverState(final_game_numbers, level, world_num, visibility_graph, args) {
  this.level = level
  this.level_name = this.level.level_name
  this.buttons = []
  this.world_num = world_num
  this.visibility_graph = visibility_graph
  this.bg_drawn = false
  this.victory = args.victory
  this.color = impulse_colors['world '+ this.world_num + ' bright']
  this.restart_button = new IconButton("RETRY", 16, imp_vars.levelWidth - 70, imp_vars.levelHeight - 40, 60, 65, this.color, this.color, function(_this){
    return function(){
      var hive_numbers = new HiveNumbers(_this.world_num, false)
      _this.fader.set_animation("fade_out", function() {
        switch_game_state(new ImpulseGameState(_this.world_num, _this.level, _this.visibility_graph, hive_numbers, false, false))
      });
    }
  }(this), "start")
  this.buttons.push(this.restart_button);

  this.restart_button.keyCode = imp_params.keys.RESTART_KEY;
  if(imp_vars.player_data.options.control_hand == "right") {
    this.restart_button.extra_text = "R KEY"
  } else {
    this.restart_button.extra_text = "SHIFT KEY"
  }

 this.buttons.push(new IconButton("MENU", 16, 70, imp_vars.levelHeight/2+260, 60, 65, this.color, this.color, function(_this){return function(){
    if(_this.world_num) {
      _this.fader.set_animation("fade_out", function() {
        switch_game_state(new WorldMapState(_this.world_num))
      });
    }
    else {
      _this.fader.set_animation("fade_out", function() {
        switch_game_state(new TitleState(true))
      });
    }
  }}(this), "back"))

  this.game_numbers = final_game_numbers

  if(!this.level.is_boss_level) {
    this.high_score = args.high_score
    this.stars = args.stars ? args.stars : 0

    if (this.stars < 3)
        this.bar_top_score = imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][this.stars]
      else
        this.bar_top_score = imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][2]

    this.stars_gained = 0
  } else {
    this.best_time = args.best_time ? args.best_time : 0
    this.stars = args.stars ? args.stars : 0
  }

  imp_vars.player_data.total_kills += this.game_numbers.kills

  save_game()
  calculate_stars(imp_vars.player_data.difficulty_mode)

  var closest_enemy_type = null
  var closest_prop = -1

  this.drawn_enemies = null

  if(this.level.is_boss_level) {
    this.drawn_enemies = {}
    //this.drawn_enemies[imp_params.impulse_level_data[this.level_name].dominant_enemy] = null
    //this.num_enemy_type = 1
  }
  else {
    this.drawn_enemies = imp_params.impulse_level_data[this.level_name].enemies
    this.num_enemy_type = 0
    for(var j in imp_params.impulse_level_data[this.level_name].enemies) {
      this.num_enemy_type += 1
    }
  }
  this.enemy_image_size = 40

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
    var cur_y = 490 + this.enemy_image_size * h_diff
    this.buttons.push(new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size, impulse_colors["world "+this.world_num+" lite"],
      (function(enemy, _this) { return function() {
        _this.fader.set_animation("fade_out", function() {
          set_dialog_box(new EnemyBox(enemy, _this))
        });
      }})(j, this)
      ))

    i+=1
  }

  /*if(calculate_current_rating() > this.game_numbers.original_rating) {
    this.higher_rating = true
    this.rating_diff = calculate_current_rating() - this.game_numbers.original_rating
  }*/

  this.star_colors = ["world "+this.world_num+" bright", "silver", "gold"]
  this.star_text = ["GATEWAY", "SILVER", "GOLD"]

  imp_vars.impulse_music.stop_bg()

  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
}

GameOverState.prototype.process = function(dt) {
  this.fader.process(dt);
}

GameOverState.prototype.draw = function(ctx, bg_ctx) {

  if(!this.bg_drawn) {
    this.level.impulse_game_state= null
    bg_canvas.setAttribute("style", "display:none" )

    bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
    draw_bg(world_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.world_num)
    this.bg_drawn = true
    bg_ctx.translate(-imp_vars.sidebarWidth, 0)
    this.bg_drawn = true
  }
  ctx.save()
  ctx.globalAlpha *= get_bg_opacity(this.world_num);
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  ctx.restore()
  
  ctx.save();
  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  if(!this.level.is_boss_level) {
    ctx.globalAlpha /= 3
    draw_tessellation_sign(ctx, this.world_num, imp_vars.levelWidth/2, 60, 40, true)
    ctx.globalAlpha *= 3

    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.font = '30px Muli'
    ctx.textAlign = 'center'

    ctx.fillText(this.level_name, imp_vars.levelWidth/2, 70)
    ctx.fill() 
    ctx.font = '20px Muli'
    if(this.stars > 0 && this.victory) {
      ctx.fillStyle = impulse_colors[this.star_colors[this.stars - 1]]
      ctx.fillText(this.star_text[this.stars - 1] + " SCORE ACHIEVED", imp_vars.levelWidth/2, 110)
    } else {
      ctx.fillStyle = "red"
      ctx.fillText("GAME OVER", imp_vars.levelWidth/2, 110)
    }

    ctx.fillStyle = this.color
    ctx.font = '12px Muli'
    ctx.fillText("GAME TIME ", imp_vars.levelWidth/2, 140)
    ctx.font = '28px Muli'
    ctx.fillText(this.game_numbers.last_time, imp_vars.levelWidth/2, 165)
    ctx.fillStyle = this.stars > 0 ? impulse_colors[this.star_colors[this.stars - 1]] : this.color
    ctx.font = '12px Muli'
    ctx.fillText("SCORE", imp_vars.levelWidth/2, 185)

    ctx.font = '28px Muli'
    ctx.fillText(this.game_numbers.score, imp_vars.levelWidth/2, 210)

    ctx.font = '12px Muli'
    ctx.fillStyle = this.stars < 3 ? impulse_colors[this.star_colors[this.stars]] : impulse_colors[this.star_colors[2]]
    if (this.stars < 3) {
      ctx.fillText("PROGRESS TO "+this.star_text[Math.max(this.stars, 0)] + " SCORE", imp_vars.levelWidth/2, 235)
    }
    draw_progress_bar(ctx, imp_vars.levelWidth/2, 250, 200, 15, Math.min(this.game_numbers.score/this.bar_top_score, 1), (this.stars < 3 ? impulse_colors[this.star_colors[this.stars]] : impulse_colors[this.star_colors[2]]), impulse_colors["world "+this.world_num+" lite"], false, 0.6)


    if(this.high_score) {
      ctx.fillStyle = this.stars > 0 ? impulse_colors[this.star_colors[this.stars - 1]] : this.color
      ctx.font = '24px Muli'
      ctx.fillText("NEW HIGH SCORE!", imp_vars.levelWidth/2, 425)
    } else {
      var temp_stars = imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].stars
      ctx.fillStyle = temp_stars > 0 ? impulse_colors[this.star_colors[temp_stars - 1]] : this.color
      ctx.font = '12px Muli'
      ctx.fillText("HIGH SCORE", imp_vars.levelWidth/2, 400)
      ctx.font = '28px Muli'
      ctx.fillText(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score, imp_vars.levelWidth/2, 425)
    }
    var temp_colors = ["world "+this.world_num+" lite", 'silver', 'gold']
    var score_names = ['GATEWAY SCORE', "SILVER SCORE", "GOLD SCORE"]
    for(var i = 0; i < 3; i++) {
          ctx.font = '24px Muli';
          ctx.textAlign = "right"
          ctx.fillStyle = impulse_colors[temp_colors[i]]
          ctx.shadowColor = ctx.fillStyle
          ctx.font = '20px Muli';
          ctx.fillText(imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][i], imp_vars.levelWidth/2 + 160, 290 + 35 * i + 7)
          ctx.textAlign = "left"
          ctx.font = '20px Muli';
          ctx.fillText(score_names[i], imp_vars.levelWidth/2 - 160, 290 + 35 * i + 7)
        }

  } else {

    ctx.textAlign = 'center'

    ctx.shadowBlur = 0;
    ctx.save()
    ctx.globalAlpha *= 0.3
    draw_tessellation_sign(ctx, this.world_num, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 50, 100)
    ctx.restore()

    ctx.font = '24px Muli'
    if (this.level.boss_victory) {
      ctx.fillStyle = impulse_colors["gold"]
      ctx.fillText("VICTORY", imp_vars.levelWidth/2, 140)
    } else {
      ctx.fillStyle = "red"
      ctx.fillText("DEFEAT", imp_vars.levelWidth/2, 140)
    }

    ctx.fillStyle = impulse_colors['world ' + this.world_num + ' bright']
    ctx.font = '16px Muli'
    ctx.fillText(this.level.level_name, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 60)
    ctx.font = '40px Muli'
    ctx.fillText(imp_params.tessellation_names[this.world_num], imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 20)
    ctx.font = '24px Muli'

    ctx.fillStyle = this.stars > 0 ? impulse_colors[this.star_colors[this.stars - 1]] : this.color
    ctx.font = '12px Muli'
    ctx.fillText("GAME TIME",imp_vars.levelWidth/2, 355)
    ctx.font = '28px Muli'
    ctx.fillText(convert_to_time_notation(this.game_numbers.seconds), imp_vars.levelWidth/2, 380)

    if(this.best_time) {
      ctx.fillStyle = this.stars > 0 ? impulse_colors[this.star_colors[this.stars - 1]] : this.color
      ctx.font = '12px Muli'
      ctx.fillText("NEW BEST TIME!", imp_vars.levelWidth/2, 400)
    } else {
      if (imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].stars == 3) {
        var temp_stars = imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].stars
        ctx.fillStyle = temp_stars > 0 ? impulse_colors[this.star_colors[temp_stars - 1]] : this.color
        ctx.font = '12px Muli'
        ctx.fillText("BEST TIME", imp_vars.levelWidth/2, 405)
        ctx.font = '28px Muli'
        ctx.fillText(convert_to_time_notation(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].best_time), imp_vars.levelWidth/2, 430)
      } else {
        ctx.fillStyle = this.color
        ctx.font = '12px Muli'
        ctx.fillText("BEST TIME", imp_vars.levelWidth/2, 405)
        ctx.font = '28px Muli'
        ctx.fillText("UNDEFEATED", imp_vars.levelWidth/2, 430)

      }
    }
  }

  /*if(this.higher_rating) {
    ctx.fillStyle = 'black'
    ctx.font = "16px Muli"
    ctx.fillText("RATING", imp_vars.levelWidth/2, 400)
    ctx.font = "48px Muli"
    ctx.fillText("+"+this.rating_diff, imp_vars.levelWidth/2, 450)
  }*/

  if (!this.level.is_boss_level) {
    ctx.textAlign = 'center' 
    ctx.fillStyle = impulse_colors['world '+ this.world_num + ' lite']
    ctx.font = '12px Muli'
    ctx.fillText("ENEMIES",  imp_vars.levelWidth/2, 460)
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  ctx.restore();
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

GameOverState.prototype.on_key_down = function(keyCode) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_key_down(keyCode)
  }
}
