// There are exactly four cases that bring us to this game state:
// - We win through ImpulseGameState.
// - We start a new hive through WorldMapState
// - We load an old game through MainGameSummaryState
// - We go automatically to the next hive through RewardGameState.
// Pre-condition: If we pass in a level, we are assumed to have beaten it.

MainGameTransitionState.prototype = new LoaderGameState

MainGameTransitionState.prototype.constructor = MainGameTransitionState

function MainGameTransitionState(world_num, level, visibility_graph, hive_numbers, loading_saved_game) {

  this.hive_numbers = hive_numbers

  if (hive_numbers && level) {
    this.game_numbers = this.hive_numbers.game_numbers[level.level_name];
  }
  this.has_processed_once = false

  this.level_intro_interval = 2200
  this.last_level_summary_interval = 4000
  this.last_level = null
  this.level_loaded = true
  this.world_num = world_num
  this.color = impulse_colors["world "+world_num]
  this.lite_color = impulse_colors["world "+world_num+" lite"]
  this.bright_color = impulse_colors["world "+world_num+" bright"]
  this.dark_color = impulse_colors["world "+world_num+" dark"]
  this.visibility_graph = visibility_graph
  this.buttons = []
  this.bg_drawn = false
  this.first_time = false
  this.going_to_level_zero = false;

  // Set the next game state.
  if(level && !this.is_level_zero(level.level_name)) {
    this.last_level = level
    this.last_level_name = level.level_name

    this.state = "last_level_summary"
    this.transition_timer = this.last_level_summary_interval
    this.compute_last_level_stats();
  } else if (level && this.is_level_zero(level.level_name)) {
    this.state = "level_intro"
    this.transition_timer = this.level_intro_interval
  } else {
    this.state = "level_intro"
    if(loading_saved_game) {
      this.hive_numbers = hive_numbers
    } else {
      this.hive_numbers = new HiveNumbers(world_num, true)
      this.hive_numbers.current_level = this.get_first_level_name(world_num);
    }
    this.transition_timer = this.level_intro_interval
  }

  if(this.last_level && this.last_level.is_boss_level) {
    // do not do the following if we have beat the last level.. will transfer to summary_state later
    return
  }
  if(this.world_num == 0 && this.last_level && this.last_level.level_name == levelData.lastTutorialLevel) {
    // do not do the following if we have beat the last tutorial level.. will transfer to summary_state later
    return
  }

  this.load_next_level(loading_saved_game);

  this.first_time = !saveData.getLevelData(this.level_name).seen
  if (this.first_time) {
    saveData.getLevelData(this.level_name).seen = true
    saveData.saveGame()
  }

  if(this.level.is_boss_level) {
    // Still give the player a moment before the BOSS, but we won't display anything in draw().
    this.level_intro_interval = 1000
  }


  if(this.world_num != 0 && (!this.last_level || !this.last_level.is_boss_level) &&
      !(loading_saved_game && this.hive_numbers.current_level &&
      this.hive_numbers.current_level.substring(0, 4) == "BOSS")) {
    if (this.is_level_zero(this.level.level_name)) {
      imp_params.impulse_music.play_bg(audioData.songs["Menu"])
    } else {
      imp_params.impulse_music.play_bg(audioData.songs["Hive "+this.world_num])
    }
  }
}

MainGameTransitionState.prototype.get_next_level_name = function(level, world_num) {
  if(!level) {
    return this.get_first_level_name(world_num);
  } else {
    if(level.level_number < 7) {
      return "HIVE "+world_num+"-"+(level.level_number+1)
    } else {
      return "BOSS "+world_num
    }
  }
}
MainGameTransitionState.prototype.get_first_level_name = function (world_num) {
  if (world_num == 0) {
    return "HIVE 0-1"
  }
  if (imp_params.debug.show_zero_level && saveData.shouldShowLevelZero(world_num)) {
      this.going_to_level_zero = true;
      return "HIVE "+world_num+"-0"
  }
  return "HIVE "+world_num+"-1"
}

MainGameTransitionState.prototype.load_next_level = function () {
  // Set the next level to load.
  this.level_loaded = false
  this.level = this.load_level(levelData[this.hive_numbers.current_level]);
  this.level_name = this.level.level_name;
}

MainGameTransitionState.prototype.compute_last_level_stats = function() {
  this.check_completed_quests(this.last_level.level_name, this.hive_numbers.game_numbers[this.last_level.level_name])
}

MainGameTransitionState.prototype.should_skip_transition_state = function () {
  // Should skip the transition state entirely as soon as the level is loaded.
  return this.world_num == 0 || this.going_to_level_zero;
}

MainGameTransitionState.prototype.maybe_switch_states = function () {
  // if last level of tutorial, go to summary state.
  if(this.world_num == 0 && this.last_level && this.last_level.level_name == levelData.lastTutorialLevel) {
    game_engine.switch_game_state(new MainGameSummaryState(this.world_num, true, this.hive_numbers))
    return true;
  }

  // if tutorial, skip the transition state. Also, if this is the first time, go directly to impulse game state.
  if(this.should_skip_transition_state()) {
    if(this.level_loaded) {
      game_engine.switch_game_state(new ImpulseGameState(this.world_num, this.level, this.visibility_graph, this.hive_numbers, true))
    }
    return true;
  }

  if(this.last_level && this.last_level.is_boss_level) {
    game_engine.switch_game_state(new MainGameSummaryState(this.world_num, true, this.hive_numbers))
    return true;
  }

  return false;
}

MainGameTransitionState.prototype.process = function(dt) {
  if (this.maybe_switch_states()) {
    return;
  }
  this.has_processed_once = true

  // Pause in the middle of the current state until the level is loaded.
  if(this.level_loaded ||
    (this.state == "last_level_summary" && this.transition_timer >= this.last_level_summary_interval/2) ||
    (this.state == "level_intro" && this.transition_timer >= this.level_intro_interval/2)) {
    this.transition_timer -= dt;
  }

  if(this.transition_timer < 0) {
    if(this.state == "last_level_summary" && this.level_loaded) {
      if(this.level.is_boss_level) {
        imp_params.impulse_music.stop_bg()
      }
      this.state = "level_intro"
      this.transition_timer = this.level_intro_interval
    } else if(this.state == "level_intro") {
      game_engine.switch_game_state(new ImpulseGameState(this.world_num, this.level, this.visibility_graph, this.hive_numbers, true))
    }
  }
}

MainGameTransitionState.prototype.draw = function(ctx, bg_ctx) {
  // When we should_skip_transition_state, we still need these lines so that the bg_canvas is set to
  // invisible. At the start of this state, the bgcanvas may still have a bg, if we don't hide this,
  // there will be a flicker while in this state.
  if(!this.bg_drawn && this.level) {
    this.bg_drawn = true

    bg_canvas.setAttribute("style", "display:none")
    uiRenderUtils.tessellateBg(layers.worldMenuBgCanvas.getContext('2d'), 0, 0, dom.levelWidth, dom.levelHeight, "Hive "+this.world_num)
  }

  ctx.fillStyle = impulse_colors["world "+this.world_num+" dark"]
  ctx.fillRect(0, 0, dom.levelWidth, dom.levelHeight)

  if (this.should_skip_transition_state()) {
    return;
  }

  ctx.save()

  ctx.globalAlpha *= uiRenderUtils.getBgOpacity(this.world_num);
  if (this.state == "level_intro") {
    var prog = (this.transition_timer/this.level_intro_interval);
    if (prog < 0.5) {
      ctx.globalAlpha *= Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)
    }
  } else if (this.state == "last_level_summary") {
    var prog = (this.transition_timer/this.last_level_summary_interval);
    if (prog > 0.5) {
      ctx.globalAlpha *= Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)
    }
  }
  ctx.drawImage(layers.worldMenuBgCanvas, 0, 0, dom.levelWidth, dom.levelHeight, 0, 0, dom.levelWidth, dom.levelHeight)
  ctx.restore()
  if(!this.has_processed_once) return

  if(this.state == "level_intro") {

    if(!this.level.is_boss_level) {
      ctx.save()
      var prog = (this.transition_timer/this.level_intro_interval);

      ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)


      ctx.fillStyle = this.bright_color;
      ctx.textAlign = 'center'


      ctx.shadowBlur = 0;
      ctx.shadowColor = "black"

      ctx.save()
      ctx.globalAlpha *= 0.3
      uiRenderUtils.drawTessellationSign(ctx,this.world_num, dom.levelWidth/2, 300, 100)
      ctx.restore()
      ctx.font = '24px Muli'
      ctx.save();
      ctx.globalAlpha *= 0.5;
      ctx.fillText(this.hive_numbers.hive_name, dom.levelWidth/2, 250)
      ctx.restore();
      ctx.font = '56px Muli'
      ctx.fillText(this.level.level_name, dom.levelWidth/2, 320)

      ctx.shadowBlur = 0
      ctx.fillStyle = this.lite_color;
      ctx.shadowColor = ctx.fillStyle
      ctx.font = '12px Muli'
      ctx.fillText("PRESS ANY KEY TO SKIP", dom.levelWidth/2, dom.levelHeight/2 + 270)
      ctx.restore()
    }
  }
  else if(this.state == "last_level_summary") {
    ctx.save()
    var prog = (this.transition_timer/this.last_level_summary_interval);

    ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)
    ctx.globalAlpha /= 3
    uiRenderUtils.drawTessellationSign(ctx, this.world_num, dom.levelWidth/2, 230, 80, true)
    ctx.globalAlpha *= 3

    ctx.save();
    ctx.globalAlpha *= 0.5;
    ctx.fillStyle = "white"
    ctx.font = '20px Muli'
    if (saveData.difficultyMode == "normal") {
      ctx.fillText("HARD MODE", dom.levelWidth/2, 180)
    }
    ctx.restore();

    ctx.beginPath()
    ctx.fillStyle = this.bright_color
    ctx.font = '42px Muli'
    ctx.textAlign = 'center'

    ctx.fillText(this.last_level_name, dom.levelWidth/2, 240)
    ctx.fill()
    ctx.font = '36px Muli';
    ctx.fillStyle = "white"
    ctx.fillText("VICTORY", dom.levelWidth/2, 300)

    var score_y = 380;
    var score_label_y = 420;

    ctx.fillStyle = this.bright_color
    ctx.font = '20px Muli'
    ctx.fillText("GAME TIME ", dom.levelWidth/2 + 100, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(this.game_numbers.last_time, dom.levelWidth/2 + 100, score_label_y)
    ctx.fillStyle = this.bright_color
    ctx.font = '20px Muli'
    ctx.fillText("SCORE", dom.levelWidth/2 - 100, score_y)

    ctx.font = '42px Muli'
    ctx.fillText(this.game_numbers.score, dom.levelWidth/2 - 100, score_label_y)

    var line_y = 440
    if (!this.game_numbers.high_score) {
      ctx.beginPath();
      ctx.moveTo(250, line_y);
      ctx.lineTo(350, line_y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.bright_color;
      ctx.stroke();
    }

    if (!this.game_numbers.best_time) {
      ctx.beginPath();
      ctx.moveTo(450, line_y);
      ctx.lineTo(550, line_y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.bright_color;
      ctx.stroke();
    }

    var high_score_y = 445;
    var best_score_y = 500;
    var best_score_label_y = 470;

    if(this.game_numbers.high_score) {
      ctx.fillStyle = this.bright_color
      ctx.font = '16px Muli'
      ctx.fillText("NEW HIGH SCORE!", dom.levelWidth/2 - 100, high_score_y)
    } else {
      ctx.save();
      ctx.globalAlpha *= 0.6;
      ctx.fillStyle = this.bright_color
      ctx.font = '12px Muli'
      ctx.fillText("HIGH SCORE", dom.levelWidth/2  - 100, best_score_label_y)
      ctx.font = '28px Muli'
      ctx.fillText(saveData.getLevelData(this.last_level_name).high_score,
       dom.levelWidth/2 - 100, best_score_y)
      ctx.restore();
    }

    if(this.game_numbers.best_time) {
      ctx.fillStyle = this.bright_color
      ctx.font = '16px Muli'
      ctx.fillText("NEW BEST TIME!", dom.levelWidth/2 + 100, high_score_y)
    } else {
      ctx.save();
      ctx.globalAlpha *= 0.6;
      ctx.fillStyle = this.bright_color
      ctx.font = '12px Muli'
      ctx.fillText("BEST TIME", dom.levelWidth/2 + 100, best_score_label_y)
      ctx.font = '28px Muli'
      if (saveData.getLevelData(this.last_level_name) < 1000) {
        ctx.font = '28px Muli'
        ctx.fillText(utils.convertSecondsToTimeString(saveData.getLevelData(this.last_level_name).best_time),
          dom.levelWidth/2 + 100, best_score_y)
      } else {
        ctx.font = '24px Muli'
        ctx.fillText("UNDEFEATED",
          dom.levelWidth/2 + 100, best_score_y)
      }
      ctx.restore();

      ctx.shadowBlur = 0

      ctx.fillStyle = this.lite_color;
      ctx.font = '12px Muli'
      ctx.fillText("PRESS ANY KEY TO SKIP", dom.levelWidth/2, dom.levelHeight/2 + 270)
    }
    ctx.restore();

  }
}

MainGameTransitionState.prototype.on_key_down = function(keyCode) {
  if(this.level_loaded) {
    this.level_intro_interval /=4
    this.last_level_summary_interval /=4
    this.transition_timer /=4
    }
}

MainGameTransitionState.prototype.on_click = function(keyCode) {
  if(this.level_loaded) {
    this.level_intro_interval /= 4
    this.last_level_summary_interval /= 4
    this.transition_timer /= 4
  }
}

MainGameTransitionState.prototype.load_complete = function() {
  this.level_loaded = true
  // Hide the bg_canvas and draw the level on it.
  bg_canvas.setAttribute("style", "display:none")
  layers.bgCtx.translate(dom.sideBarWidth, 0)
  this.level.draw_bg(layers.bgCtx)
  layers.bgCtx.translate(-dom.sideBarWidth, 0)
}

MainGameTransitionState.prototype.is_level_zero = function(level_name) {
  return (parseInt(level_name.substring(7, 8)) === 0);
}

MainGameTransitionState.prototype.check_completed_quests = function(level_name, game_numbers) {
  var world = parseInt(level_name.substring(5, 6))

  if (world != 0 && !this.is_level_zero(level_name) && game_numbers.impulsed == false) {
    saveData.setQuestCompleted("pacifist")
  }
}
