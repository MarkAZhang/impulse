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
  this.restart_button = new IconButton("RETRY", 16, imp_params.levelWidth - 70, imp_params.levelHeight - 40, 60, 65, this.color, "white", function(_this){
    return function(){
      var hive_numbers = new HiveNumbers(_this.world_num, false)
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new ImpulseGameState(_this.world_num, _this.level, _this.visibility_graph, hive_numbers, false, false))
      });
    }
  }(this), "start")
  this.buttons.push(this.restart_button);

  this.restart_button.keyCode = imp_params.keys.RESTART_KEY;
  if(saveData.optionsData.control_hand == "right") {
    this.restart_button.extra_text = "R KEY"
  } else {
    this.restart_button.extra_text = "SHIFT KEY"
  }

 this.buttons.push(new IconButton("MENU", 16, 70, imp_params.levelHeight/2+260, 60, 65, this.color, "white", function(_this){return function(){
    if(_this.world_num) {
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new WorldMapState(_this.world_num, true))
        if (saveData.difficultyMode == "normal") {
          set_bg("Title Alt" + _this.world_num, get_world_map_bg_opacity(_this.world_num))
        } else {
          set_bg("Hive 0", imp_params.hive0_bg_opacity)
        }
      });
    }
    else {
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new TitleState(true))
        set_bg("Hive 0", imp_params.hive0_bg_opacity)
      });
    }
  }}(this), "back"))

  this.game_numbers = final_game_numbers

  if(!this.level.is_boss_level) {
    this.high_score = args.high_score
    this.best_time = args.best_time ? args.best_time : 0
  } else {
    this.best_time = args.best_time ? args.best_time : 0
  }

  saveData.totalKills += this.game_numbers.kills

  saveData.saveGame()

  var closest_enemy_type = null
  var closest_prop = -1

  /* this.drawn_enemies = null

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

    var cur_x =  imp_params.levelWidth/2 + (this.enemy_image_size+10) * diff
    var cur_y = 380 + this.enemy_image_size * h_diff
    this.buttons.push(new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size, impulse_colors["world "+this.world_num+" lite"],
      (function(enemy, _this) { return function() {
        _this.fader.set_animation("fade_out", function() {
          game_engine.set_dialog_box(new EnemyBox(enemy, _this))
        });
      }})(j, this)
      ))

    i+=1
  } */

  this.star_colors = ["world "+this.world_num+" bright", "silver", "gold"]
  this.star_text = ["GATEWAY", "SILVER", "GOLD"]

  imp_params.impulse_music.stop_bg()

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

    bg_ctx.translate(imp_params.sidebarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    var world_bg_ctx = imp_params.world_menu_bg_canvas.getContext('2d')
    draw_bg(world_bg_ctx, 0, 0, imp_params.levelWidth, imp_params.levelHeight, "Hive "+this.world_num)
    this.bg_drawn = true
    bg_ctx.translate(-imp_params.sidebarWidth, 0)
    this.bg_drawn = true
  }
  ctx.save()
  ctx.fillStyle = impulse_colors["world "+this.world_num+" dark"]
  ctx.fillRect(0, 0, imp_params.levelWidth, imp_params.levelHeight)
  ctx.globalAlpha *= get_bg_opacity(this.world_num);
  ctx.drawImage(imp_params.world_menu_bg_canvas, 0, 0, imp_params.levelWidth, imp_params.levelHeight, 0, 0, imp_params.levelWidth, imp_params.levelHeight)
  ctx.restore()

  ctx.save();
  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  if(!this.level.is_boss_level) {
    ctx.globalAlpha /= 3
    draw_tessellation_sign(ctx, this.world_num, imp_params.levelWidth/2, 230, 80, true)
    ctx.globalAlpha *= 3

    ctx.save();
    ctx.globalAlpha *= 0.5;
    ctx.fillStyle = "white"
    ctx.font = '20px Muli'
    if (saveData.difficultyMode == "normal") {
      ctx.textAlign = 'center'
      ctx.fillText("HARD MODE", imp_params.levelWidth/2, 180)
    }
    ctx.restore();

    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.font = '42px Muli'
    ctx.textAlign = 'center'

    ctx.fillText(this.level_name, imp_params.levelWidth/2, 240)
    ctx.fill()
    ctx.font = '36px Muli';
    if(this.victory) {
      ctx.fillStyle = "white"
      ctx.fillText("VICTORY", imp_params.levelWidth/2, 300)
    } else {
      ctx.fillStyle = "red"
      ctx.fillText("GAME OVER", imp_params.levelWidth/2, 300)
    }

    var score_y = 380;
    var score_label_y = 420;

    ctx.fillStyle = this.color
    ctx.font = '20px Muli'
    ctx.fillText("GAME TIME ", imp_params.levelWidth/2 + 100, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(this.game_numbers.last_time, imp_params.levelWidth/2 + 100, score_label_y)
    ctx.fillStyle = this.color
    ctx.font = '20px Muli'
    ctx.fillText("SCORE", imp_params.levelWidth/2 - 100, score_y)

    ctx.font = '42px Muli'
    ctx.fillText(this.game_numbers.score, imp_params.levelWidth/2 - 100, score_label_y)

    var line_y = 440
    if (!this.high_score) {
      ctx.beginPath();
      ctx.moveTo(250, line_y);
      ctx.lineTo(350, line_y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }

    if (!this.best_time) {
      ctx.beginPath();
      ctx.moveTo(450, line_y);
      ctx.lineTo(550, line_y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }

    var high_score_y = 445;
    var best_score_y = 500;
    var best_score_label_y = 470;

    if(this.high_score) {
      ctx.fillStyle = this.color
      ctx.font = '16px Muli'
      ctx.fillText("NEW HIGH SCORE!", imp_params.levelWidth/2 - 100, high_score_y)
    } else {
      ctx.save();
      ctx.globalAlpha *= 0.6;
      ctx.fillStyle = this.color
      ctx.font = '12px Muli'
      ctx.fillText("HIGH SCORE", imp_params.levelWidth/2  - 100, best_score_label_y)
      ctx.font = '28px Muli'
      ctx.fillText(saveData.getLevelData(this.level_name).high_score,
       imp_params.levelWidth/2 - 100, best_score_y)
      ctx.restore();
    }

    if(this.best_time) {
      ctx.fillStyle = this.color
      ctx.font = '16px Muli'
      ctx.fillText("NEW BEST TIME!", imp_params.levelWidth/2 + 100, high_score_y)
    } else {
      ctx.save();
      ctx.globalAlpha *= 0.6;
      ctx.fillStyle = this.color
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", imp_params.levelWidth/2 + 100, best_score_label_y)
      ctx.font = '28px Muli'
      if (saveData.getLevelData(this.level_name).best_time < 1000) {
        ctx.font = '28px Muli'
        ctx.fillText(convert_to_time_notation(saveData.getLevelData(this.level_name).best_time),
          imp_params.levelWidth/2 + 100, best_score_y)
      } else {
        ctx.font = '24px Muli'
        ctx.fillText("UNDEFEATED",
          imp_params.levelWidth/2 + 100, best_score_y)
      }
      ctx.restore();
    }
  } else {


    ctx.globalAlpha /= 3
    draw_tessellation_sign(ctx, this.world_num, imp_params.levelWidth/2, 230, 80, true)
    ctx.globalAlpha *= 3

    ctx.save();
    ctx.globalAlpha *= 0.5;
    ctx.fillStyle = "white"
    ctx.font = '20px Muli'
    if (saveData.difficultyMode == "normal") {
      ctx.textAlign = 'center';
      ctx.fillText("HARD MODE", imp_params.levelWidth/2, 180)
    }
    ctx.restore();

    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.textAlign = 'center'

    ctx.font = '32px Muli'
    ctx.fillText(imp_params.tessellation_names[this.world_num], imp_params.levelWidth/2, 240)

    ctx.fill()
    ctx.font = '48px Muli';
    if (this.level.boss_victory) {
      ctx.fillStyle = "white"
      ctx.fillText("VICTORY", imp_params.levelWidth/2, 300)
    } else {
      ctx.fillStyle = "red"
      ctx.fillText("GAME OVER", imp_params.levelWidth/2, 300)
    }

    var score_y = 380;
    var score_label_y = 420;

    ctx.fillStyle = this.color
    ctx.font = '20px Muli'
    ctx.fillText("GAME TIME ", imp_params.levelWidth/2, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(this.game_numbers.last_time, imp_params.levelWidth/2, score_label_y)

    var line_y = 440

    if (!this.best_time) {
      ctx.beginPath();
      ctx.moveTo(350, line_y);
      ctx.lineTo(450, line_y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }

    var high_score_y = 445;
    var best_score_y = 500;
    var best_score_label_y = 470;

    if(this.best_time) {
      ctx.fillStyle = this.color
      ctx.font = '16px Muli'
      ctx.fillText("NEW BEST TIME!", imp_params.levelWidth/2, high_score_y)
    } else {
      ctx.save();
      ctx.globalAlpha *= 0.6;
      ctx.fillStyle = this.color
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", imp_params.levelWidth/2, best_score_label_y)
      ctx.font = '28px Muli'
      if (saveData.getLevelData(this.level_name).best_time < 1000) {
        ctx.font = '28px Muli'
        ctx.fillText(convert_to_time_notation(saveData.getLevelData(this.level_name).best_time),
          imp_params.levelWidth/2, best_score_y)
      } else {
        ctx.font = '24px Muli'
        ctx.fillText("UNDEFEATED",
          imp_params.levelWidth/2, best_score_y)
      }
      ctx.restore();
    }
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
