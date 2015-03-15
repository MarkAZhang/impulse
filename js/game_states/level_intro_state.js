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

  this.buttons.push(new IconButton("BACK", 16, 70, imp_params.levelHeight/2+260, 60, 65, this.bright_color, "white", function(_this){return function(){
    // When the back button is pressed, draw the world-specific background on the bg_ctx and show it.
    imp_params.bg_ctx.fillStyle =  impulse_colors["world "+_this.world_num+" dark"]
    imp_params.bg_ctx.translate(imp_params.sidebarWidth, 0)//allows us to have a topbar
    imp_params.bg_ctx.fillRect(0, 0, imp_params.levelWidth, imp_params.levelHeight)
    imp_params.bg_ctx.globalAlpha *= get_bg_opacity(0);
    draw_bg(imp_params.bg_ctx, 0, 0, imp_params.levelWidth, imp_params.levelHeight, "Hive "+_this.world_num)
    imp_params.bg_ctx.translate(-imp_params.sidebarWidth, 0)//allows us to have a topbar
    imp_params.bg_canvas.setAttribute("style", "")


    _this.fader.set_animation("fade_out_to_main", function() {
      if(_this.world_num) {
        game_engine.switch_game_state(new WorldMapState(_this.world_num, true))
      }
      else {
        game_engine.switch_game_state(new TitleState(true))
      }
      imp_params.bg_file = null
      // TODO: transition the bg.
      if (saveData.difficultyMode == "normal") {
        set_bg("Title Alt" + _this.world_num, get_world_map_bg_opacity(_this.world_num))
      } else {
        set_bg("Hive 0", imp_params.hive0_bg_opacity)
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

    var cur_x =  imp_params.levelWidth/2 + (this.enemy_image_size+10) * diff
    var cur_y = 400 + this.enemy_image_size * h_diff
    this.buttons.push(new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size, impulse_colors["world "+this.world_num+" lite"],
      (function(enemy, _this) { return function() {
        _this.fader.set_animation("fade_out", function() {
          game_engine.set_dialog_box(new EnemyBox(enemy, _this))
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
    var world_bg_ctx = imp_params.world_menu_bg_canvas.getContext('2d')
    world_bg_ctx.clearRect(0, 0, imp_params.levelWidth, imp_params.levelHeight);
    draw_bg(world_bg_ctx, 0, 0, imp_params.levelWidth, imp_params.levelHeight, "Hive "+this.world_num)
    bg_ctx.translate(imp_params.sidebarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    this.bg_drawn = true
    bg_ctx.translate(-imp_params.sidebarWidth, 0)
    bg_canvas.setAttribute("style", "display:none")
  }

  if (this.fader.get_current_animation() != "fade_out_to_main") {
    ctx.save()
    ctx.fillStyle = impulse_colors["world "+this.world_num+" dark"]
    ctx.fillRect(0, 0, imp_params.levelWidth, imp_params.levelHeight)
    ctx.globalAlpha *= get_bg_opacity(this.world_num);
    ctx.drawImage(imp_params.world_menu_bg_canvas, 0, 0, imp_params.levelWidth, imp_params.levelHeight, 0, 0, imp_params.levelWidth, imp_params.levelHeight)
    ctx.restore()
  } else {
    ctx.save()
    ctx.globalAlpha *= this.fader.get_animation_progress();
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, imp_params.levelWidth, imp_params.levelHeight)
    ctx.globalAlpha *= get_bg_opacity(0);
    ctx.drawImage(imp_params.world_menu_bg_canvas, 0, 0, imp_params.levelWidth, imp_params.levelHeight, 0, 0, imp_params.levelWidth, imp_params.levelHeight)
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
    draw_tessellation_sign(ctx, this.world_num, imp_params.levelWidth/2, 130, 40, true)
    ctx.globalAlpha *= 3

    ctx.fillStyle = "white"
    ctx.font = '18px Muli'
    if (saveData.difficultyMode == "normal") {
      ctx.fillText("HARD MODE", imp_params.levelWidth/2, 100)
    }

    ctx.beginPath()
    ctx.fillStyle = impulse_colors['world '+ this.world_num + ' bright']
    ctx.font = '30px Muli'
    ctx.textAlign = 'center'

    ctx.fillText(this.level_name, imp_params.levelWidth/2, 140)
    ctx.fill()

    for(var i = 0; i < this.buttons.length; i++)
    {
      this.buttons[i].draw(ctx)
    }

    draw_level_obstacles_within_rect(ctx, this.level_name, imp_params.levelWidth/2, 255, 200, 150, impulse_colors['world '+ this.world_num + ' lite'])
    ctx.beginPath()
    ctx.rect(imp_params.levelWidth/2 - 100, 100, 250, 150)

    ctx.strokeStyle = "rgba(0, 0, 0, .3)"
    ctx.stroke()

    if (this.load_percentage < 1) {

      ctx.textAlign = 'center'
      draw_loading_icon(ctx, imp_params.levelWidth - 70, imp_params.levelHeight - 53, 20, "gray", this.load_percentage)
      ctx.font = '16px Muli'
      ctx.fillStyle = "gray"
      ctx.fillText("LOADING", imp_params.levelWidth - 70, imp_params.levelHeight - 19)
    }

    ctx.fillStyle = this.bright_color
    ctx.font = '12px Muli'
    ctx.fillText("ENEMIES",  imp_params.levelWidth/2, 370)

    ctx.fillStyle = this.bright_color
    ctx.textAlign = 'center'

    ctx.font = '12px Muli'
    ctx.fillText("HIGH SCORE", imp_params.levelWidth/2 - 100, 480)
    ctx.font = '28px Muli'
    ctx.fillText(saveData.getLevelData(this.level_name).high_score,
     imp_params.levelWidth/2 - 100, 505)


    ctx.fillStyle = this.bright_color
    ctx.font = '12px Muli'
    ctx.fillText("BEST TIME", imp_params.levelWidth/2 + 100, 480)
    if (saveData.getLevelData(this.level_name).best_time < 1000) {
      ctx.font = '28px Muli'
      ctx.fillText(convert_to_time_notation(saveData.getLevelData(this.level_name).best_time),
       imp_params.levelWidth/2 + 100, 505)
    } else {
      ctx.font = '24px Muli'
      ctx.fillText("UNDEFEATED", imp_params.levelWidth/2 + 100, 505)
    }
  } else {

    ctx.fillStyle = impulse_colors['world '+ this.world_num + ' bright']
    ctx.textAlign = 'center'

    ctx.font = '42px Muli'
    ctx.shadowBlur = 0;
    ctx.save();
    ctx.globalAlpha *= 0.3
    draw_tessellation_sign(ctx, this.world_num, imp_params.levelWidth/2, imp_params.levelHeight/2 - 50, 100)
    ctx.restore();
    ctx.font = '16px Muli'
    ctx.fillText(this.level.level_name, imp_params.levelWidth/2, imp_params.levelHeight/2 - 60)
    ctx.font = '40px Muli'
    ctx.fillText(imp_params.tessellation_names[this.world_num], imp_params.levelWidth/2, imp_params.levelHeight/2 - 20)
    ctx.font = '24px Muli'

    if(saveData.getLevelData(this.level_name).best_time < 1000) {
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", imp_params.levelWidth/2, 390)
      ctx.font = '28px Muli'
      ctx.fillText(convert_to_time_notation(saveData.getLevelData(this.level_name).best_time), imp_params.levelWidth/2, 415)
    } else {
      ctx.fillStyle = impulse_colors['boss '+ this.world_num]
      ctx.fillText("UNDEFEATED",  imp_params.levelWidth/2, 400)
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
  this.buttons.push(new IconButton("START", 16, imp_params.levelWidth - 70, imp_params.levelHeight/2 + 260, 100, 65, this.bright_color, "white", function(_this){
    return function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new ImpulseGameState(_this.world_num, _this.level, _this.visibility_graph, hive_numbers, false /*is_main_game*/, true /*first_time*/))
      });
    }
  }(this), "start"))
}
