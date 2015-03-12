LevelIntroState.prototype = new LoaderGameState

LevelIntroState.prototype.constructor = LevelIntroState

function LevelIntroState(level_name, world) {


  this.level_name = level_name
  this.buttons = []
  this.world_num = world
  this.bg_drawn = false

  this.color = impulse_colors['world '+ this.world_num + ' lite']
  this.bright_color = impulse_colors['world '+ this.world_num + ' bright']

  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"

  this.buttons.push(new IconButton("BACK", 16, 70, imp_vars.levelHeight/2+260, 60, 65, this.bright_color, "white", function(_this){return function(){
    // When the back button is pressed, draw the world-specific background on the bg_ctx and show it.
    imp_vars.bg_ctx.fillStyle =  impulse_colors["world "+_this.world_num+" dark"]
    imp_vars.bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
    imp_vars.bg_ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
    imp_vars.bg_ctx.globalAlpha *= get_bg_opacity(0);
    draw_bg(imp_vars.bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+_this.world_num)
    imp_vars.bg_ctx.translate(-imp_vars.sidebarWidth, 0)//allows us to have a topbar
    imp_vars.bg_canvas.setAttribute("style", "")


    _this.fader.set_animation("fade_out_to_main", function() {
      if(_this.world_num) {
        switch_game_state(new WorldMapState(_this.world_num, true))
      }
      else {
        switch_game_state(new TitleState(true))
      }
      imp_vars.bg_file = null
      // TODO: transition the bg.
      if (imp_vars.player_data.difficulty_mode == "normal") {
        set_bg("Title Alt" + _this.world_num, get_world_map_bg_opacity(_this.world_num))
      } else {
        set_bg("Hive 0", imp_vars.hive0_bg_opacity)
      }
    });
  }}(this), "back"))

  this.drawn_enemies = null

  if(this.is_boss_level) {
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
    var cur_y = 400 + this.enemy_image_size * h_diff
    this.buttons.push(new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size, impulse_colors["world "+this.world_num+" lite"],
      (function(enemy, _this) { return function() {
        _this.fader.set_animation("fade_out", function() {
          set_dialog_box(new EnemyBox(enemy, _this))
        });
      }})(j, this)
      ))

    i+=1
  }

  this.fader = new Fader({
    "fade_in": 500,
    "fade_out": 250,
    "fade_out_to_main": 250
  });
  this.fader.set_animation("fade_in");
}

LevelIntroState.prototype.process = function(dt) {
  this.fader.process(dt);
  process_and_draw_bg(dt);
}


LevelIntroState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
    world_bg_ctx.clearRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight);
    draw_bg(world_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.world_num)
    bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    this.bg_drawn = true
    bg_ctx.translate(-imp_vars.sidebarWidth, 0)
    bg_canvas.setAttribute("style", "display:none")
  }

  if (this.fader.get_current_animation() != "fade_out_to_main") {
    ctx.save()
    ctx.fillStyle = impulse_colors["world "+this.world_num+" dark"]
    ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
    ctx.globalAlpha *= get_bg_opacity(this.world_num);
    ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
    ctx.restore()
  } else {
    ctx.save()
    ctx.globalAlpha *= this.fader.get_animation_progress();
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
    ctx.globalAlpha *= get_bg_opacity(0);
    ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
    ctx.restore()
  }
  ctx.save();
  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out" || this.fader.get_current_animation() == "fade_out_to_main") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }
  if (!this.is_boss_level) {
    ctx.globalAlpha /= 3
    draw_tessellation_sign(ctx, this.world_num, imp_vars.levelWidth/2, 130, 40, true)
    ctx.globalAlpha *= 3

    ctx.fillStyle = "white"
    ctx.font = '18px Muli'
    if (imp_vars.player_data.difficulty_mode == "normal") {
      ctx.fillText("HARD MODE", imp_vars.levelWidth/2, 100)
    }

    ctx.beginPath()
    ctx.fillStyle = impulse_colors['world '+ this.world_num + ' bright']
    ctx.font = '30px Muli'
    ctx.textAlign = 'center'

    ctx.fillText(this.level_name, imp_vars.levelWidth/2, 140)
    ctx.fill()

    for(var i = 0; i < this.buttons.length; i++)
    {
      this.buttons[i].draw(ctx)
    }

    draw_level_obstacles_within_rect(ctx, this.level_name, imp_vars.levelWidth/2, 255, 200, 150, impulse_colors['world '+ this.world_num + ' lite'])
    ctx.beginPath()
    ctx.rect(imp_vars.levelWidth/2 - 100, 100, 250, 150)

    ctx.strokeStyle = "rgba(0, 0, 0, .3)"
    ctx.stroke()

    if (this.load_percentage < 1) {

      ctx.textAlign = 'center'
      draw_loading_icon(ctx, imp_vars.levelWidth - 70, imp_vars.levelHeight - 53, 20, "gray", this.load_percentage)
      ctx.font = '16px Muli'
      ctx.fillStyle = "gray"
      ctx.fillText("LOADING", imp_vars.levelWidth - 70, imp_vars.levelHeight - 19)
    }

    if(this.level_name.slice(0, 11) != "HOW TO PLAY") {

      /*var temp_colors = ["world "+this.world_num+" lite", 'silver', 'gold']
      var score_names = ['GATEWAY SCORE', "SILVER SCORE", "GOLD SCORE"]
      if(!this.is_boss_level) {
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
      }*/

      ctx.fillStyle = this.bright_color
      ctx.font = '12px Muli'
      ctx.fillText("ENEMIES",  imp_vars.levelWidth/2, 370)

      score_color = 0

      while(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score > imp_params.impulse_level_data[this.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][score_color]) {
        score_color += 1;
      }

      ctx.fillStyle = this.bright_color
      ctx.textAlign = 'center'

      ctx.font = '12px Muli'
      ctx.fillText("HIGH SCORE", imp_vars.levelWidth/2 - 100, 480)
      ctx.font = '28px Muli'
      ctx.fillText(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].high_score,
       imp_vars.levelWidth/2 - 100, 505)


      ctx.fillStyle = this.bright_color
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", imp_vars.levelWidth/2 + 100, 480)
      if (imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].best_time < 1000) {
        ctx.font = '28px Muli'
        ctx.fillText(convert_to_time_notation(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].best_time),
         imp_vars.levelWidth/2 + 100, 505)
      } else {
        ctx.font = '24px Muli'
        ctx.fillText("UNDEFEATED", imp_vars.levelWidth/2 + 100, 505)
      }



    }
  } else {

    ctx.fillStyle = impulse_colors['world '+ this.world_num + ' bright']
    ctx.textAlign = 'center'

    ctx.font = '42px Muli'
    ctx.shadowBlur = 0;
    ctx.save();
    ctx.globalAlpha *= 0.3
    draw_tessellation_sign(ctx, this.world_num, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 50, 100)
    ctx.restore();
    ctx.font = '16px Muli'
    ctx.fillText(this.level.level_name, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 60)
    ctx.font = '40px Muli'
    ctx.fillText(imp_params.tessellation_names[this.world_num], imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 20)
    ctx.font = '24px Muli'

    if(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].best_time < 1000) {
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", imp_vars.levelWidth/2, 390)
      ctx.font = '28px Muli'
      ctx.fillText(convert_to_time_notation(imp_params.impulse_level_data[this.level_name].save_state[imp_vars.player_data.difficulty_mode].best_time), imp_vars.levelWidth/2, 415)
    } else {
      ctx.fillStyle = impulse_colors['boss '+ this.world_num]
      ctx.fillText("UNDEFEATED",  imp_vars.levelWidth/2, 400)
    }

    for(var i = 0; i < this.buttons.length; i++)
    {
      this.buttons[i].draw(ctx)
    }
  }
  ctx.restore();
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
  this.buttons.push(new IconButton("START", 16, imp_vars.levelWidth - 70, imp_vars.levelHeight/2 + 260, 100, 65, this.bright_color, "white", function(_this){
    return function(){
      _this.fader.set_animation("fade_out", function() {
        switch_game_state(new ImpulseGameState(_this.world_num, _this.level, _this.visibility_graph, hive_numbers, false /*is_main_game*/, true /*first_time*/))
      });
    }
  }(this), "start"))
}
