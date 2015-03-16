MainGameSummaryState.prototype = new GameState

MainGameSummaryState.prototype.constructor = MainGameSummaryState

function MainGameSummaryState(world_num, victory, hive_numbers, level, visibility_graph, save_screen, just_saved) {

  this.just_saved = just_saved
  this.save_screen = save_screen

  this.buttons = []
  this.bg_drawn = false
  this.hive_numbers = hive_numbers
  this.level = level
  this.visibility_graph = visibility_graph
  this.world_num = world_num
  this.victory = victory

  if(save_screen) {
    this.hive_numbers = saveData.savedGame
    saveData.saveGame()
    this.world_num = this.hive_numbers.world
    this.victory = null
  }

  this.transition_interval = 250
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.buttons = []

  this.shift_down_time = 0
  this.ctrl_down_time = 0

  this.color = impulse_colors["world "+this.world_num]
  this.lite_color = impulse_colors["world "+this.world_num+" lite"]
  this.bright_color = impulse_colors["world "+this.world_num+" bright"]
  this.dark_color = impulse_colors["world "+this.world_num+" dark"]

  if (this.world_num > 0) {
    this.total_time = Math.ceil((questData["blitz_hive" + this.world_num].time_cutoff * 1000 - this.hive_numbers.speed_run_countdown) / 1000);
    this.total_deaths = 0;
  }

  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)
    if(this.hive_numbers.game_numbers[title]) {
      this.total_deaths += this.hive_numbers.game_numbers[title].deaths
    }
  }

  if(victory) {
    this.calculate_deaths()
    this.send_logging();
    this.victory_text = levelData.hiveNames[this.world_num]+" DEFEATED";
    if (!saveData.worldRankings[saveData.difficultyMode]["world " + this.world_num]) {
      saveData.worldRankings[saveData.difficultyMode]["world "+this.world_num] =
        {
          "defeated": true,
          "first_victory": true
        }
      saveData.saveGame()
    }
  }

  var _this = this;

  if(this.save_screen && !this.just_saved) {
    this.resume_button = new IconButton("RESUME", 16, 730, dom.levelHeight/2+260, 100, 65, this.bright_color, this.bright_color, function(_this){return function(){
      _this.resume_game()
    }}(this), "start")
    this.resume_button.shadow = false
    /*if(saveData.optionsData.control_hand == "right") {
      this.resume_button.underline_index = 0
    } else {
      this.resume_button.extra_text = "RIGHT ARROW"
      this.resume_button.dim_extra_text = true
    }*/
    this.buttons.push(this.resume_button)

    this.delete_button = new IconButton("DELETE", 16, dom.levelWidth/2, dom.levelHeight/2+260, 100, 65, this.bright_color, this.bright_color, function(_this){return function(){
      _this.delete_game()
    }}(this), "delete_small")
    this.buttons.push(this.delete_button)
    this.delete_button.shadow = false
    /*if(saveData.optionsData.control_hand == "right") {
      this.delete_button.underline_index = 0
    this.delete_button.extra_text= "SHIFT+"
    } else {
      this.delete_button.extra_text = "SHIFT + DOWN ARROW"
      this.delete_button.dim_extra_text = true
    }
    this.delete_button.shift_enabled = true*/

    this.return_to_main_button = new IconButton("EXIT", 16, 70, dom.levelHeight/2 + 260, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
      _this.exit_game()
    }}(this), "back")

    this.buttons.push(this.return_to_main_button)
    /*this.return_to_main_button.shadow = false
    if(saveData.optionsData.control_hand == "right") {
      this.return_to_main_button.underline_index = 0
    } else {
      this.return_to_main_button.extra_text = "LEFT ARROW"
      this.return_to_main_button.dim_extra_text = true

    }*/
  }


  if (this.world_num != 0) {
    music_player.stop_bg()
  }
  this.star_colors = ["bronze", "silver", "gold"]


  if (!this.save_screen && this.victory)
    this.check_quests();
}

MainGameSummaryState.prototype.send_logging = function () {
  // Logging for world 0 occurs in Reward Game State, since user can quit tutorial with pause menu.
  if (this.world_num === 0) return;
  // Determine first-victory by checking world_rankings.
  var first_victory =
    saveData.worldRankings[saveData.difficultyMode]["world "+this.world_num] === undefined;

  game_engine.send_logging_to_server('BEAT WORLD ' + this.world_num, {
    first_victory: first_victory,
    difficulty_mode: saveData.difficultyMode,
    hive_numbers: this.hive_numbers
  });
};

MainGameSummaryState.prototype.calculate_deaths = function() {
  var deaths = 0;
  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)

    if(this.hive_numbers.game_numbers[title]) {
      deaths += this.hive_numbers.game_numbers[title].deaths;
    }
  }
  this.total_deaths = deaths
}

MainGameSummaryState.prototype.draw = function(ctx, bg_ctx) {
  if (this.world_num == 0 && !this.save_screen) {
    return;
  }
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "display:none")
    this.bg_drawn = true
    uiRenderUtils.tessellateBg(layers.worldMenuBgCanvas.getContext('2d'), 0, 0, dom.levelWidth, dom.levelHeight, "Hive "+this.world_num)
  }

  ctx.save()
  this.transition_timer -= dt;
  if(this.transition_timer < 0) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
    }
    if(this.transition_state == "out") {
      this.go_to_next_state();
    }
  }

  ctx.fillStyle = this.dark_color
  ctx.fillRect(0, 0, dom.levelWidth, dom.levelHeight)

  if(this.transition_state == "in") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = 1 - prog
  } else if(this.transition_state == "out") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = Math.max(0, prog)
  }

  ctx.save()
  ctx.globalAlpha *= uiRenderUtils.getBgOpacity(this.world_num);

  ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, dom.levelWidth, dom.levelHeight, 0, 0, dom.levelWidth, dom.levelHeight)

  ctx.restore();
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  ctx.shadowBlur = 0;

  ctx.textAlign = 'center'


  ctx.font = '20px Muli'
  if(this.victory) {
    ctx.globalAlpha *= 0.3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, dom.levelWidth/2, 100, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = this.bright_color
    ctx.font = '40px Muli'
    ctx.fillText(this.victory_text, dom.levelWidth/2, 130)
  }
  else if(this.save_screen) {
    ctx.globalAlpha *= 0.3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, dom.levelWidth/2, 220, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = "white"
    ctx.fillText("GAME SAVED" , dom.levelWidth/2, 210)
    ctx.fillStyle = this.bright_color;
    ctx.font = '40px Muli'
    ctx.fillText(this.hive_numbers.hive_name, dom.levelWidth/2, 250)
    ctx.font = '24px Muli'
    ctx.fillText(this.hive_numbers.current_level, dom.levelWidth/2, 280);

    ctx.textAlign = 'center'

    var score_y = 380;
    var score_label_y = 420;

    ctx.fillStyle = this.bright_color
    ctx.font = '20px Muli'
    ctx.fillText("TOTAL TIME ", dom.levelWidth/2 - 100, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(utils.convertSecondsToTimeString(this.total_time), dom.levelWidth/2 - 100, score_label_y)
    ctx.fillStyle = this.bright_color
    ctx.font = '20px Muli'
    ctx.fillText("DEATHS", dom.levelWidth/2 + 100, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(this.total_deaths, dom.levelWidth/2 + 100, score_label_y)

  } else {
    ctx.globalAlpha *= 0.3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, dom.levelWidth/2, 100, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = 'red'
    ctx.fillText("GAME OVER", dom.levelWidth/2, 80)
    ctx.fillStyle = this.bright_color
    if(this.hive_numbers.continues > 0) {
      ctx.font = '18px Muli'
      ctx.fillText("CONTINUES: "+this.hive_numbers.continues, dom.levelWidth/2, 175)
    }
    ctx.font = '40px Muli'
    ctx.fillText(this.hive_numbers.hive_name, dom.levelWidth/2, 130)
  }

  if(this.victory && this.hive_numbers.continues) {
    ctx.fillStyle = this.bright_color
    ctx.font = '18px Muli'
    ctx.fillText("CONTINUES: "+this.hive_numbers.continues, dom.levelWidth/2, 250)
  }

  if(this.victory) {
    ctx.fillStyle = this.bright_color
    ctx.font = '14px Muli'
    ctx.fillText("TOTAL TIME", dom.levelWidth/2, 167)
    ctx.font = '24px Muli'
    ctx.fillText(utils.convertSecondsToTimeString(this.total_time), dom.levelWidth/2, 190)

  }

  if(!this.save_screen) {
    ctx.shadowBlur = 0

    ctx.font = '18px Muli'
    ctx.textAlign = 'center'

    var start_y = 250
    ctx.fillStyle = this.bright_color;

    ctx.fillText("LEVEL",260, start_y)
    //ctx.fillText("SCORE", 270, start_y)
    ctx.fillText("TIME", 400, start_y)
    //ctx.fillText("COMBO", 510, start_y)
    ctx.fillText("DEATHS", 540, start_y)

    for(var i = 0; i < 8; i++) {
      var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)

      var real_title = title;
      if(i==7) {
        real_title = this.hive_numbers.boss_name;
      }
      var gn;
      if(this.hive_numbers.game_numbers[title]) {
        gn = this.hive_numbers.game_numbers[title];
      } else {
        gn = {}
      }
      ctx.fillStyle = gn.visited ? this.bright_color : "#666";
      var y = start_y + 30 + 27 * i;
      ctx.fillText(real_title,260, y)

      ctx.fillStyle = gn.visited ? this.bright_color : "#666";
      if(this.hive_numbers.total_time[title] != undefined)
        ctx.fillText(utils.convertSecondsToTimeString(Math.floor(this.hive_numbers.total_time[title] / 1000)), 400, y)
      else {
        ctx.fillText('---', 400, y)
      }

      if(gn.deaths != undefined)
        ctx.fillText(gn.deaths, 540, y)
      else {
        ctx.fillText('---', 540, y)
      }
    }
  }

  ctx.font = '16px Muli'
  ctx.fillStyle = this.lite_color
  if(this.save_screen) {
    if(this.just_saved)
      ctx.fillText("PRESS ANY KEY FOR MAIN MENU", dom.levelWidth/2, dom.levelHeight - 30)
  } else if(this.victory) {
    ctx.fillText("PRESS ANY KEY FOR MAIN MENU", dom.levelWidth/2, dom.levelHeight - 30)
  /* else if(this.level) {
    ctx.fillText("PRESS ANY KEY TO CONTINUE", dom.levelWidth/2, dom.levelHeight - 30)*/
  } else {
    ctx.fillText("PRESS ANY KEY FOR MAIN MENU", dom.levelWidth/2, dom.levelHeight - 30)
  }

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].post_draw(ctx)
  }
  ctx.restore()

}

MainGameSummaryState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

MainGameSummaryState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  /*if(this.transition_state=="none" && (!this.save_screen || this.just_saved)) {
      this.transition_state="out";
      this.transition_timer = this.transition_interval
    }*/
}

MainGameSummaryState.prototype.on_key_down = function(keyCode) {

  /*if(this.save_screen && !this.just_saved) {
    if(keyCode == controls.keys.EXIT_GAME_KEY) {
      this.exit_game()
    } else if(keyCode == controls.keys.DELETE_GAME_KEY && this.shift_down()) {
      this.delete_game()
    } else if(keyCode == controls.keys.RESUME_GAME_KEY && !this.ctrl_down()) {
      this.resume_game()
    }
  } else{*/
  if(this.transition_state=="none" && (!this.save_screen || this.just_saved)) {
    this.transition_state="out";
    this.transition_timer = this.transition_interval
  }
  /*}
  if(keyCode == 16) {
    this.shift_down_time = (new Date()).getTime()
  }
  if(keyCode == 17) {
    this.ctrl_down_time = (new Date()).getTime()
  }*/
}
MainGameSummaryState.prototype.on_key_up = function(keyCode) {
  if(keyCode == 16) {
    this.shift_held= false
  }
  if(keyCode == 17) {
    this.ctrl_held = false
  }
}

MainGameSummaryState.prototype.shift_down = function() {
  return (new Date()).getTime() - this.shift_down_time < 1000
}

MainGameSummaryState.prototype.ctrl_down = function() {
  return (new Date()).getTime() - this.ctrl_down_time < 1000
}

MainGameSummaryState.prototype.process = function(dt) {
  if (this.world_num == 0 && !this.save_screen) {
    this.go_to_next_state();
  }
}

MainGameSummaryState.prototype.resume_game = function() {
  saveData.clearSavedPlayerGame();
  game_engine.switch_game_state(new MainGameTransitionState(this.world_num, null, null, this.hive_numbers, true))
}

MainGameSummaryState.prototype.delete_game = function() {
  saveData.clearSavedPlayerGame();
  game_engine.switch_game_state(new WorldMapState(this.world_num))
}

MainGameSummaryState.prototype.check_quests = function() {
  if (this.world_num <= 0) return;

  if (saveData.difficultyMode == "normal" && this.hive_numbers.speed_run_countdown > 0) {
    saveData.setQuestCompleted("blitz_hive" + this.world_num);
  }

  if (!this.hive_numbers.hit) {
    saveData.setQuestCompleted("untouchable");
  }

  if(saveData.worldRankings[saveData.difficultyMode]["world "+this.hive_numbers.world]
    && saveData.worldRankings[saveData.difficultyMode]["world "+this.hive_numbers.world]["first_victory"]) {
    if (this.hive_numbers.world < 4) {
      saveData.setQuestCompleted("beat_hive")

      /*this.rewards.push({
        type: "world_victory",
        data: this.hive_numbers.world
      })*/
      // Completed the quest for beating this world.
    }

    if (this.hive_numbers.world == 4) {
      saveData.setQuestCompleted("final_boss")
    }

    /*if (this.hive_numbers.world == 4 || (this.hive_numbers.world == 1 && saveData.difficultyMode == "easy")) {
      this.rewards.push({
        type: "share"
      });
    }*/
  }
}

MainGameSummaryState.prototype.exit_game = function() {
  game_engine.switch_game_state(new TitleState(true))
}

MainGameSummaryState.prototype.go_to_next_state = function() {
  if(this.victory) {
    if (this.world_num === 4 &&
        saveData.worldRankings[saveData.difficultyMode]["world 4"] &&
        saveData.worldRankings[saveData.difficultyMode]["world 4"]["first_victory"]) {
      game_engine.switch_game_state(new CreditsState(true, this.hive_numbers,
        {victory: true,
          is_tutorial: this.world_num == 0,
          first_time_tutorial: saveData.firstTime,
          skipped: false,
          just_saved: this.just_saved}))
    } else {
      game_engine.switch_game_state(new RewardGameState(this.hive_numbers, true,
        {victory: true,
          is_tutorial: this.world_num == 0,
          first_time_tutorial: saveData.firstTime,
          skipped: false,
          just_saved: this.just_saved}))
    }
  } else {
    game_engine.switch_game_state(new RewardGameState(this.hive_numbers, true,
      {victory: false,
        is_tutorial: this.world_num == 0,
        first_time_tutorial: saveData.firstTime,
        skipped: false,
        just_saved: this.just_saved}))
  }
}
