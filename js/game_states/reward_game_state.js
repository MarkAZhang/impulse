// Currently responsible only for first time tutorial and final victory scores after hive 4. Also
// Also might stil take user to ult tutorial, but that will soon be deprecated.

RewardGameState.prototype = new GameState

RewardGameState.prototype.constructor = RewardGameState

function RewardGameState(hive_numbers, main_game, args) {
  this.hive_numbers = hive_numbers
  this.main_game = main_game
  this.args = args
  this.rewards = []
  this.cur_reward_index = -1
  this.transition_interval = 250
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.first_time = saveData.firstTime // cache the first time variable, since it might change during this game state
  this.victory = args.victory
  this.bg_drawn = false
  this.ult_num_pages = 7
  this.ult_cur_page = 0
  this.hard_mode_just_unlocked = false;
  var _this = this;
  this.initial_difficulty_mode = saveData.difficultyMode;

  this.normal_mode_button = new IconButton("NORMAL MODE", 20, dom.levelWidth/2-150, 300, 250, 125, "white", impulse_colors["impulse_blue"], function(){_this.change_mode("easy")}, "easy_mode")
  this.challenge_mode_button = new IconButton("CHALLENGE MODE", 20, dom.levelWidth/2+150, 300, 250, 125, "white", impulse_colors["impulse_blue"], function(){_this.change_mode("normal")}, "normal_mode")

  this.debug()

  this.determine_rewards()
  this.next_reward()
  if(this.rewards.length > 0) {
    music_player.stop_bg()
  }

  this.auto_advance_duration = 3000;
  this.auto_advance_timer = 0;
}

RewardGameState.prototype.change_mode = function(type) {
  if (this.transition_state == "none") {
    saveData.difficultyMode = type;
    saveData.saveGame();
    this.adjust_difficulty_button_border()
    this.transition_state="out";
    this.transition_timer = this.transition_interval * 4
  }
}

RewardGameState.prototype.draw = function(ctx, bg_ctx) {
  if(this.rewards.length == 0) {
    return
  }

  // draw the background
  var cur_reward = this.rewards[this.cur_reward_index]
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "display:none")
    var world_bg_ctx = layers.worldMenuBgCanvas.getContext('2d')
    if (cur_reward.type == "world_victory") {
      uiRenderUtils.tessellateBg(world_bg_ctx, 0, 0, dom.levelWidth, dom.levelHeight, "Hive "+(cur_reward.data+1))
    } else if (cur_reward.type == "final_victory") {
      uiRenderUtils.tessellateBg(world_bg_ctx, 0, 0, dom.levelWidth, dom.levelHeight, "Title Alt4")
    } else {
      uiRenderUtils.tessellateBg(world_bg_ctx, 0, 0, dom.levelWidth, dom.levelHeight, "Hive 0")
    }
    this.bg_drawn = true
  }
  ctx.save()
  if (cur_reward.type == "world_victory") {
    ctx.globalAlpha *= uiRenderUtils.getBgOpacity(cur_reward.data + 1);
  } else if (cur_reward.type == "final_victory") {
    ctx.globalAlpha *= uiRenderUtils.getBgOpacity(0) / 2;
  } else {
    ctx.globalAlpha *= uiRenderUtils.getBgOpacity(0);
  }
  ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, dom.levelWidth, dom.levelHeight, 0, 0, dom.levelWidth, dom.levelHeight)
  ctx.restore()
  ctx.save();
  // change transparency for transition
  if(this.transition_state == "in") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = 1 - prog
    /*if (cur_reward.type == "share") {
      document.getElementById("addthis-inline").style.opacity = ctx.globalAlpha;
    }*/
  } else if(this.transition_state == "out") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = Math.max(0, prog)
    //document.getElementById("addthis-inline").style.opacity = ctx.globalAlpha;
  }
  // draw tessellation if applicable
  if (cur_reward.type != "quest" && cur_reward.type != "ult_tutorial" && cur_reward.type != "select_difficulty" &&
       cur_reward.type != "share") {
    var tessellation_num = cur_reward.type == "world_victory" ? cur_reward.data + 1 : 0
    ctx.save()
    ctx.globalAlpha *= 0.2
    uiRenderUtils.drawTessellationSign(ctx, tessellation_num, dom.levelWidth/2, 250, 100)
    ctx.restore()
  }
  var main_message = ""
    var main_message_teaser = ""
    var main_reward_text_y = 250
    var new_values_text_y = 430
    var message_size = 32

    if(cur_reward.type == "world_victory") {
      ctx.fillStyle = impulse_colors["world "+(cur_reward.data+1)+ " bright"]
      message_size = 24
      main_message = "NEW HIVE UNLOCKED"
      main_message_teaser = this.initial_difficulty_mode == "easy" ? "STANDARD MODE" : "CHALLENGE MODE"
      ctx.textAlign = "center"
      ctx.font = "48px Muli"
      ctx.fillText(levelData.hiveNames[cur_reward.data+1], dom.levelWidth/2, 270)
    }

    if(cur_reward.type == "final_victory") {

      final_message = this.initial_difficulty_mode == "easy" ? "HARD MODE UNLOCKED FOR ALL HIVES" : "HARD MODE COMPLETED"
      final_message_teaser = this.initial_difficulty_mode == "easy" ? "THE REAL GAME BEGINS" : ""

      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.font = "24px Muli"
      ctx.fillText(final_message, dom.levelWidth/2, 240)
      ctx.font = "20px Muli"
      ctx.fillStyle = "red"
      ctx.fillText(final_message_teaser, dom.levelWidth/2, 280)

      ctx.font = "16px Muli"
      ctx.fillStyle = "white"
      if (this.initial_difficulty_mode == "easy") {
      } else {
        ctx.fillText("THANKS FOR PLAYING IMPULSE", dom.levelWidth/2, 320)
        // TODO: add sharing
      }
    }

    if(cur_reward.type == "rating") {

      main_message = "YOUR SKILL RATING WENT UP"
      main_message_teaser = "CONGRATULATIONS!"
      message_size = 32
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.font = "60px Muli"
      ctx.fillText("+"+cur_reward.data.diff, dom.levelWidth/2, main_reward_text_y + 20)

      ctx.textAlign = 'center'
      ctx.font = '12px Muli'
      ctx.fillStyle = 'white'
      ctx.fillText("NEW SKILL RATING", dom.levelWidth/2, new_values_text_y - 25)
      ctx.font = '48px Muli'
      ctx.fillText(cur_reward.data.new_rating, dom.levelWidth/2, new_values_text_y + 25)
    }

    if(cur_reward.type == "quest") {
      var tessellation_num = 0
      ctx.save()
      uiRenderUtils.drawTessellationSign(ctx, tessellation_num, dom.levelWidth/2, 250, 150)
      ctx.restore()
      ctx.textAlign = "center"
      ctx.fillStyle = impulse_colors["impulse_blue"]

      ctx.font = '32px Muli'
      ctx.fillText("CHALLENGE COMPLETE!", dom.levelWidth/2, 120)


      questRenderUtils.draw_quest_button(ctx, dom.levelWidth/2, main_reward_text_y, 60, cur_reward.data.type);

      ctx.font = '24px Muli'
      ctx.fillStyle = "white"
      for (var i = 0; i < questData[cur_reward.data.type].text.length; i++) {
        var text = questData[cur_reward.data.type].text[i];
        ctx.fillText(text, dom.levelWidth / 2, main_reward_text_y + 150 + i * 36);
      }

    }

    if(cur_reward.type == "first_time_tutorial") {
      ctx.font = "30px Muli"
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.fillText("INTRO TUTORIAL COMPLETE", dom.levelWidth/2, 250)
      ctx.fillStyle = "white"
      ctx.font = "16px Muli"
      ctx.fillText("INITIALIZING MAIN GAME...", dom.levelWidth/2, 550)
    }

    if(cur_reward.type == "select_difficulty") {
      main_message_teaser = "LET'S DO THIS"
      message_size = 36
      main_message = "SELECT DIFFICULTY"

      this.normal_mode_button.draw(ctx)
      this.challenge_mode_button.draw(ctx)
    }

    // write a main message if it applies
    if (main_message) {
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.font = "16px Muli"
      ctx.fillText(main_message_teaser, dom.levelWidth/2, 70)
      ctx.font = message_size + "px Muli"
      if (cur_reward.type == "world_victory") {
        ctx.fillStyle = impulse_colors["world "+(cur_reward.data+1)+ " bright"]
      } else {
        ctx.fillStyle = impulse_colors["impulse_blue"]
      }
      ctx.fillText(main_message, dom.levelWidth/2, 120)
    }

    if (cur_reward.type != "select_difficulty") {
      ctx.textAlign = "center"
      ctx.fillStyle = cur_reward.type == "world_victory" ? impulse_colors["world "+(cur_reward.data+1)+ " bright"] : "white"
      ctx.font = "16px Muli"
      if (cur_reward.type != "first_time_tutorial") {
        if (cur_reward.type != "ult")
          ctx.fillText("PRESS ANY KEY TO CONTINUE", dom.levelWidth/2, dom.levelHeight - 30)
        else
          ctx.fillText("PRESS ANY KEY FOR ULT TUTORIAL", dom.levelWidth/2, dom.levelHeight - 30)
      }
    } else {
      ctx.font = "16px Muli"
      ctx.textAlign = "center"
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("YOU CAN SWITCH DIFFICULTY ON THE TITLE SCREEN OPTIONS MENU", dom.levelWidth/2, dom.levelHeight - 75)
    }
    ctx.restore();
}

RewardGameState.prototype.debug = function() {
  if (false) {
  }
}

RewardGameState.prototype.process = function(dt) {

  if(this.rewards.length == 0) {
    this.advance_game_state()
  }
  if (this.cur_reward_index < this.rewards.length && this.cur_reward_index >= 0) {
    var cur_reward = this.rewards[this.cur_reward_index]
    if (cur_reward.type == "first_time_tutorial") {
      this.auto_advance_timer -= dt;
      if (this.auto_advance_timer <= 0 && this.transition_state == "none") {
        this.transition_state = "out"
        this.transition_timer = this.transition_interval
      }
    }
  }

  this.transition_timer -= dt;
  if(this.transition_timer < 0) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
      this.auto_advance_timer = this.auto_advance_duration;
    }
    if(this.transition_state == "out") {
      this.next_reward()

      if(this.cur_reward_index >= this.rewards.length) {
        this.advance_game_state()
      } else {
        this.transition_state="in";
        this.transition_timer = this.transition_interval
        this.bg_drawn = false
      }
    }
  }
}

RewardGameState.prototype.next_reward = function() {
  /*if (this.cur_reward_index >= 0 && this.cur_reward_index < this.rewards.length && this.rewards[this.cur_reward_index].type == "share") {
    document.getElementById("addthis-inline").style.display = "none"
  }*/
  this.cur_reward_index += 1

  if (this.cur_reward_index < this.rewards.length) {
    var cur_reward = this.rewards[this.cur_reward_index]
    /*if (cur_reward.type == "share") {
      document.getElementById("addthis-inline").style.display = "block"
    }*/
  }
}

RewardGameState.prototype.switch_to_world_map = function(is_practice_mode) {
  // If we just unlocked hard mode, go to 1.
  var go_to_world_num = this.hard_mode_just_unlocked ? 1 : this.hive_numbers.world;

  if (saveData.difficultyMode == "normal" && !saveData.firstTime && go_to_world_num !== 0) {
    game_engine.setBg("Title Alt" + go_to_world_num, uiRenderUtils.getWorldMapBgOpacity(go_to_world_num))
  } else {
    game_engine.setBg("Hive 0", spriteData.hive0_bg_opacity)
  }

  game_engine.switch_game_state(new WorldMapState(go_to_world_num, is_practice_mode));
}

RewardGameState.prototype.advance_game_state = function() {
  if (this.main_game) {
    if (this.victory && this.hive_numbers.world >= 1 && this.hive_numbers.world <= 3) {
      // Immediately move to the next world.
      game_engine.switch_game_state(new MainGameTransitionState(this.hive_numbers.world + 1, null, null, null, false))
    } else if (this.victory && this.hive_numbers.world == 0 && this.first_time) {
      game_engine.switch_game_state(new MainGameTransitionState(this.hive_numbers.world + 1, null, null, null, false))
    } else if (this.victory && this.hive_numbers.world == 4) {
      this.switch_to_world_map(false);
    } else if (this.args.just_saved) {
      game_engine.switch_game_state(new TitleState(this));
    } else {
      this.switch_to_world_map(false);
    }
  } else {
    if (this.victory) {
      game_engine.switch_game_state(new GameOverState(this.args.game_numbers, this.args.level, this.args.world_num, this.args.visibility_graph, {
        best_time: this.args.game_numbers.best_time,
        high_score: this.args.game_numbers.high_score,
        victory: this.victory
      }));
    } else {
      this.switch_to_world_map(true);
    }
  }
}

RewardGameState.prototype.determine_rewards = function() {
  if(this.args.is_tutorial) {
    if(this.args.tutorial_type == "first_time_tutorial" || this.args.first_time_tutorial) {
      game_engine.send_logging_to_server('COMPLETED TUTORIAL', {skipped: this.args.skipped});
      this.rewards.push({
        type: "first_time_tutorial"
      })
      saveData.firstTime = false;
      saveData.saveGame();
    }
    return
  }

  if (this.main_game) {
    if(saveData.worldRankings[this.initial_difficulty_mode]["world "+this.hive_numbers.world]
      && saveData.worldRankings[this.initial_difficulty_mode]["world "+this.hive_numbers.world]["first_victory"]) {

      if (this.hive_numbers.world == 4) {
        this.rewards.push({
          type: "final_victory",
        })
        if (this.initial_difficulty_mode == "easy") {
          saveData.hardModeUnlocked = true;
          this.hard_mode_just_unlocked = true;
          saveData.difficultyMode = "normal";
          saveData.saveGame();
        }
      }

      saveData.worldRankings[this.initial_difficulty_mode]["world "+this.hive_numbers.world]["first_victory"] = false
      saveData.saveGame();
    }
  }
}

RewardGameState.prototype.on_key_down = function(keyCode) {
  if(this.rewards.length == 0) {
    return
  }
  if(this.transition_state=="none" && this.rewards[this.cur_reward_index].type != "select_difficulty" &&
    this.rewards[this.cur_reward_index].type != "first_time_tutorial") {
    this.transition_state="out";
    this.transition_timer = this.transition_interval
  }
}

RewardGameState.prototype.on_click = function(x, y) {
  if(this.rewards.length == 0 ||
    (this.cur_reward_index >= 0 && this.cur_reward_index < this.rewards.length && this.rewards[this.cur_reward_index].type == "share") ||
     this.rewards[this.cur_reward_index].type == "first_time_tutorial" ||
     this.cur_reward_index >= this.rewards.length) {
    return
  }
  if (this.rewards[this.cur_reward_index].type == "select_difficulty") {
    this.normal_mode_button.on_click(x, y)
    this.challenge_mode_button.on_click(x, y)
  }

  if(this.transition_state=="none" && this.rewards[this.cur_reward_index].type != "select_difficulty") {
    this.transition_state="out";
    this.transition_timer = this.transition_interval
  }
}


RewardGameState.prototype.on_mouse_move = function(x, y) {
  if(this.rewards.length == 0) {
    return
  }
  if (this.rewards[this.cur_reward_index].type == "select_difficulty") {
    this.normal_mode_button.on_mouse_move(x, y)
    this.challenge_mode_button.on_mouse_move(x, y)
  }
}
