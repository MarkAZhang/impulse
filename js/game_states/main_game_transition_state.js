MainGameTransitionState.prototype = new LoaderGameState

MainGameTransitionState.prototype.constructor = MainGameTransitionState

function MainGameTransitionState(world_num, level, victory, final_game_numbers, visibility_graph, hive_numbers, loading_game, from_world_map) {

  this.hive_numbers = hive_numbers
  this.victory = victory

  this.game_numbers = final_game_numbers
  this.first_process = false
  this.from_world_map = from_world_map

  this.world_intro_interval = 3700
  this.level_intro_interval = 2200
  this.last_level_summary_interval = 4000
  this.last_level = null
  this.high_score = false
  this.level_loaded = true
  this.has_ult = has_ult()
  this.world_num = world_num
  this.color = impulse_colors["world "+world_num]
  this.lite_color = impulse_colors["world "+world_num+" lite"]
  this.bright_color = impulse_colors["world "+world_num+" bright"]
  this.dark_color = impulse_colors["world "+world_num+" dark"]
  this.visibility_graph = visibility_graph
  this.buttons = []
  this.bg_drawn = false
  this.star_colors = ["bronze", "silver", "gold"]
  this.first_time = false

  this.continued = false
  // If this is the not the initial transition into the world, initialize variables.
  if(level) {
    // Coming in from a level.
    if(this.game_numbers) {
      this.last_level = level
      this.last_level_name = level.level_name

      if(this.victory) {
        this.state = "last_level_summary"
        this.transition_timer = this.last_level_summary_interval
      } else {
        this.state = "level_intro"
        this.transition_timer = imp_vars.player_data.options.show_transition_screens ? this.last_level_summary_interval : this.level_intro_interval
      }
      this.compute_last_level_stats();
    } else {
      //allows us to skip the last level summary if coming from main game summary state
      this.state = "level_intro"
      this.last_level = level
      this.level = level
      this.last_level_name = level.level_name
      this.level_intro_interval /= 2
      this.transition_timer = this.level_intro_interval
      this.continued = true
    }

  } else {
    this.state = "level_intro"
    if(loading_game) {
      this.hive_numbers = hive_numbers
    } else {
      this.hive_numbers = new HiveNumbers(world_num, true)
    }
    this.transition_timer = this.level_intro_interval
  }
  
  if(!this.continued) {
    if(this.victory || !this.last_level) {
      // beat last level or first level

      if(this.last_level && this.last_level.is_boss_level) {
        // do not do the following if we have beat the last level.. will transfer to summary_state later
        return
      }
      if(this.world_num == 0 && this.victory && this.last_level && this.last_level.level_name == "HIVE 0-4") {
        // do not do the following if we have beat the last tutorial level.. will transfer to summary_state later
        return
      }

      // Set the next level to load.
      this.level_loaded = false
      if(loading_game) {
        this.level = this.load_level(imp_params.impulse_level_data[this.hive_numbers.current_level])
      } else {
        this.level = this.load_level(imp_params.impulse_level_data[this.get_next_level_name(this.last_level, this.world_num)])
      }

      this.first_time = !imp_params.impulse_level_data[this.level.level_name].save_state[imp_vars.player_data.difficulty_mode].seen
      imp_params.impulse_level_data[this.level.level_name].save_state[imp_vars.player_data.difficulty_mode].seen = true
      save_game()

      // Set up game numbers for next level.
      if(!this.hive_numbers.game_numbers.hasOwnProperty(this.level.level_name)) {
        this.hive_numbers.game_numbers[this.level.level_name] = {}
        this.hive_numbers.game_numbers[this.level.level_name].visited = true
        this.hive_numbers.game_numbers[this.level.level_name].deaths = 0
      }
      this.hive_numbers.current_level = this.level.level_name
      if (this.world_num > 0) {
        save_player_game(this.hive_numbers);  
      }
    } else {
      this.level = this.last_level
      this.level.impulse_game_state = null
      imp_vars.bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
      this.level.draw_bg(imp_vars.bg_ctx)
      this.bg_drawn = true
      imp_vars.bg_ctx.translate(-imp_vars.sidebarWidth, 0)
    }
    if(this.level.is_boss_level) {
      if(this.victory)
        this.level_intro_interval = 1000
      else
        this.level_intro_interval = 500
    }
  }

  if(this.world_num != 0 && (!this.last_level || !this.last_level.is_boss_level))
    imp_vars.impulse_music.play_bg(imp_params.songs["Hive "+this.world_num])
}

MainGameTransitionState.prototype.get_next_level_name = function(level, world_num) {
  if(!level) {
    if (world_num == 0) {
      return "HIVE 0-1"
    }
    return "HIVE "+world_num+"-1"
  } else {
    if(level.level_number < 7) {
      return "HIVE "+world_num+"-"+(level.level_number+1)
    } else {
      return "BOSS "+world_num
    }
  }
}

MainGameTransitionState.prototype.compute_last_level_stats = function() {
  var stars = 0
  if(!this.last_level.is_boss_level) {
    while(this.game_numbers.score > imp_params.impulse_level_data[this.last_level.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][stars])
    {
      stars+=1
    }
  }
  this.stars = stars

  if(!this.last_level.is_boss_level) {
    if (this.stars < 3)
      this.bar_top_score = imp_params.impulse_level_data[this.last_level.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][this.stars]
    else
      this.bar_top_score = imp_params.impulse_level_data[this.last_level.level_name].cutoff_scores[imp_vars.player_data.difficulty_mode][2]
  }

  if(this.victory) {

    
    this.time_sparks_awarded = Math.floor(this.game_numbers.seconds/5)
    this.combo_sparks_awarded = Math.floor(this.game_numbers.combo/2)

    this.target_sparks = this.hive_numbers.sparks + this.time_sparks_awarded + this.combo_sparks_awarded;
    this.target_lives = this.hive_numbers.lives
    while(this.target_sparks >= 100) {
      this.target_sparks -= 100;
      this.target_lives += 1
    }
    this.check_quests_helper(this.last_level.level_name, this.hive_numbers.game_numbers[this.last_level.level_name])
  }
}

MainGameTransitionState.prototype.process = function(dt) {

  this.first_process = true

  //go to summary state
  if(this.hive_numbers.lives < 0) {
    switch_game_state(new MainGameSummaryState(this.world_num, false, this.hive_numbers, this.level, this.visibility_graph))
    return
  }

  // if last level of tutorial, go to summary state.
  if(this.world_num == 0 && this.victory && this.last_level && this.last_level.level_name == "HIVE 0-4") {
    switch_game_state(new MainGameSummaryState(this.world_num, true, this.hive_numbers))
    return
  }

  // if tutorial, skip the transition state. Also, if this is the first time, go directly to impulse game state.
  if(this.world_num == 0) {
    if(this.level_loaded) {
      switch_game_state(new ImpulseGameState(this.world_num, this.level, this.visibility_graph, this.hive_numbers, true, this.victory === null ? true : this.victory, this.first_time))
    }  
    return
  }

  if(this.last_level && this.last_level.is_boss_level && this.last_level.boss_victory) {
    switch_game_state(new MainGameSummaryState(this.world_num, true, this.hive_numbers))
    return
  }

  if(this.last_level && this.last_level.is_boss_level && !this.last_level.boss_victory) {
    switch_game_state(new ImpulseGameState(this.world_num, this.level, this.visibility_graph, this.hive_numbers, true, this.victory === null ? true : this.victory, this.first_time))
    return
  }

  // adjust sparks based on prog
  var prog = (this.transition_timer/this.last_level_summary_interval);

  if(this.state == "last_level_summary" && this.victory && prog > 0.3 &&  prog < 0.7) {
      this.hive_numbers.sparks += (dt)/(0.4 * this.last_level_summary_interval) * (this.time_sparks_awarded+this.combo_sparks_awarded);
      if(this.hive_numbers.sparks >= 100) {
        this.hive_numbers.sparks -= 100;
        this.hive_numbers.lives += 1;
      }
  } else if(this.state == "last_level_summary" && this.victory && prog < 0.3) {
    this.hive_numbers.sparks = Math.floor(this.target_sparks);
    this.hive_numbers.lives = Math.floor(this.target_lives);
    this.hive_numbers.last_sparks = this.hive_numbers.sparks
    this.hive_numbers.last_lives = this.hive_numbers.lives
  }

  // pause in the until level loaded
  if(this.level_loaded || (this.state == "world_intro" && this.transition_timer >= this.world_intro_interval/2) ||
    (this.state == "last_level_summary" && this.transition_timer >= this.last_level_summary_interval/2) ||
    (this.state == "level_intro" && this.transition_timer >= this.level_intro_interval/2)) {
    this.transition_timer -= dt;
  }

  if(this.transition_timer < 0) {

    if(this.state == "world_intro" && this.level_loaded) {
      // If this is the tutorial, do not show the level intro.
      if (this.world_num == 0) {
        switch_game_state(new ImpulseGameState(this.world_num, this.level, this.visibility_graph, this.hive_numbers, true, this.victory === null ? true : this.victory, this.first_time))
      } else {
        this.state = "level_intro"
        this.transition_timer = this.level_intro_interval
      }
    } else if(this.state == "last_level_summary" && this.level_loaded) {

      if(this.victory && this.level.is_boss_level) {
        imp_vars.impulse_music.stop_bg()
      }
      this.state = "level_intro"
      this.transition_timer = this.level_intro_interval
    } else if(this.state == "level_intro") {
      switch_game_state(new ImpulseGameState(this.world_num, this.level, this.visibility_graph, this.hive_numbers, true, this.victory === null ? true : this.victory, this.first_time))
    }
  }
}

MainGameTransitionState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn && this.level) {
    this.bg_drawn = true

    bg_canvas.setAttribute("style", "display:none")
    bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    bg_ctx.translate(-imp_vars.sidebarWidth, 0)
    draw_bg(imp_vars.world_menu_bg_canvas.getContext('2d'), 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.world_num)
  }

  ctx.fillStyle = impulse_colors["world "+this.world_num+" dark"]
  ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)

  if(this.world_num == 0) {
    return
  }

  ctx.save()
  /*if(this.state == "last_level_summary" && this.transition_timer >= this.last_level_summary_interval * 3 / 4) {
    ctx.globalAlpha = (this.last_level_summary_interval - this.transition_timer) / (this.last_level_summary_interval / 4)
  } else if(this.state == "level_intro" && this.transition_timer <= this.level_intro_interval * 1 / 4) {
    ctx.globalAlpha = this.transition_timer / (this.level_intro_interval / 4)
  } else if(this.last_level && !this.victory && this.state == "level_intro" && this.transition_timer >= this.level_intro_interval * 3 / 4) {
    ctx.globalAlpha = (this.level_intro_interval - this.transition_timer) / (this.level_intro_interval / 4)
  }*/
  
  ctx.globalAlpha *= get_bg_opacity(this.world_num);
  if (this.state == "world_intro" && !this.from_world_map) {
    var prog = (this.transition_timer/this.world_intro_interval);
    if (prog > 0.5) {
      ctx.globalAlpha *= Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)  
    }
  } else if (this.state == "level_intro") {
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
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  ctx.restore()
  if(!this.first_process) return



  if(this.state == "world_intro") {

    var prog = (this.transition_timer/this.world_intro_interval);

    ctx.save()
    ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)


    ctx.textAlign = 'center'
    ctx.shadowBlur = 0;

    /*ctx.font = '24px Muli'

    ctx.fillStyle = impulse_colors["impulse_blue_dark"]
    ctx.shadowColor = ctx.fillColor
    ctx.fillText("IMPULSE", imp_vars.levelWidth/2, 100)*/

    

    ctx.fillStyle = this.bright_color;
    ctx.shadowColor = "black"


    ctx.save()
    ctx.globalAlpha *= 0.3
    draw_tessellation_sign(ctx,this.world_num,imp_vars.levelWidth/2, imp_vars.levelHeight/2, 130)
    ctx.restore()
    ctx.font = '54px Muli'
    ctx.fillText(this.hive_numbers.hive_name, imp_vars.levelWidth/2, imp_vars.levelHeight/2+25)
    ctx.shadowBlur = 0
    ctx.fillStyle = this.lite_color;
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '12px Muli'
    if(!this.level_loaded) {
      ctx.fillText("LOADING LEVEL", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 270)
    } else {
      ctx.fillText("PRESS ANY KEY TO SKIP", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 270)
    }
    ctx.restore()

  } else if(this.state == "level_intro") {

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
      draw_tessellation_sign(ctx,this.world_num, imp_vars.levelWidth/2, 300, 100)
      ctx.restore()
      ctx.font = '24px Muli'
      ctx.save();
      ctx.globalAlpha *= 0.5;
      ctx.fillText(this.hive_numbers.hive_name, imp_vars.levelWidth/2, 250)
      ctx.restore();
      ctx.font = '56px Muli'
      ctx.fillText(this.level.level_name, imp_vars.levelWidth/2, 320)

      /*draw_lives_and_sparks(ctx, 
        Math.floor(this.hive_numbers.lives), Math.floor(this.hive_numbers.sparks), this.hive_numbers.ultimates, 
        imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 180, 24, {
          labels: true, 
          ult: this.has_ult,
          sparks: false, //imp_vars.player_data.difficulty_mode == "normal",
          lives: false, //imp_vars.player_data.difficulty_mode == "normal",
        })*/

      ctx.shadowBlur = 0
      ctx.fillStyle = this.lite_color;
      ctx.shadowColor = ctx.fillStyle
      ctx.font = '12px Muli'
      ctx.fillText("PRESS ANY KEY TO SKIP", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 270)
      ctx.restore()

    }
  }
   else if(this.state == "last_level_summary") {
    var prog = (this.transition_timer/this.last_level_summary_interval);

    ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)

    ctx.shadowBlur = 0;

    ctx.textAlign = 'center'

    ctx.font = '30px Muli'
    if(this.victory) {
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.shadowColor = ctx.fillStyle
      ctx.fillText("LEVEL CONQUERED", imp_vars.levelWidth/2, 100)
    }
    else {
      ctx.fillStyle = 'red'
      ctx.shadowColor = ctx.fillStyle
      ctx.fillText("LEVEL FAILED", imp_vars.levelWidth/2, 100)
    }



    ctx.fillStyle = this.bright_color;
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '40px Muli'
    ctx.fillText(this.last_level.level_name, imp_vars.levelWidth/2, 150)

    ctx.font = '18px Muli'

    ctx.fillStyle = this.bright_color;
    ctx.shadowColor = ctx.fillStyle

    if(!this.last_level.is_boss_level) {
      ctx.fillText("FINAL COMBO", imp_vars.levelWidth/2 + 100, 190)
      ctx.fillText("LEVEL TIME", imp_vars.levelWidth/2 - 100, 190)
    } else {
      ctx.fillText("LEVEL TIME", imp_vars.levelWidth/2, 190)
    }
    ctx.font = '54px Muli'

    if(!this.last_level.is_boss_level) {
      ctx.fillText(this.game_numbers.combo, imp_vars.levelWidth/2 + 100, 240)
      ctx.fillText(this.game_numbers.last_time, imp_vars.levelWidth/2 - 100, 240)
    } else {
      ctx.fillText(this.game_numbers.last_time, imp_vars.levelWidth/2, 240)
    }

    ctx.fillStyle = impulse_colors["impulse_blue"]
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '24px Muli'
    if(this.victory) {

      ctx.textAlign = "left"
      

      if(this.combo_sparks_awarded < 10) {
        ctx.fillText(" + "+this.combo_sparks_awarded, imp_vars.levelWidth/2 + 85, 275)
        drawSprite(ctx, imp_vars.levelWidth/2 + 75, 267, 0, 20, 20, "spark")
      } else {
        ctx.fillText(" + "+this.combo_sparks_awarded, imp_vars.levelWidth/2 + 79, 275)
        drawSprite(ctx, imp_vars.levelWidth/2 + 69, 267, 0, 20, 20, "spark")
      }

      if(this.time_sparks_awarded < 10) {
        ctx.fillText(" + "+this.time_sparks_awarded, imp_vars.levelWidth/2 - 108, 275)
        drawSprite(ctx, imp_vars.levelWidth/2 - 118, 267, 0, 20, 20, "spark")
      } else {
        ctx.fillText(" + "+this.time_sparks_awarded, imp_vars.levelWidth/2 - 114, 275)
        drawSprite(ctx, imp_vars.levelWidth/2 - 124, 267, 0, 20, 20, "spark")
      }

    } else {

    }

    ctx.textAlign = "center"

    if(!this.last_level.is_boss_level) {
      ctx.fillStyle = this.bright_color;
      ctx.shadowColor = ctx.fillStyle
      ctx.font = '24px Muli'
      //ctx.fillStyle = (this.stars > 0) ? impulse_colors[this.star_colors[this.stars-1]] : this.color
      ctx.fillText("SCORE", imp_vars.levelWidth/2, 320)
      ctx.font = '72px Muli'
      ctx.fillText(this.game_numbers.score, imp_vars.levelWidth/2, 390)
      //var color = (this.stars < 3) ? impulse_colors[this.star_colors[this.stars]] : impulse_colors[this.star_colors[2]]
      var color = this.bright_color
      draw_progress_bar(ctx, imp_vars.levelWidth/2, 420, 300, 15,
       Math.min(this.game_numbers.score/this.bar_top_score, 1), color, color)

      if(this.high_score) {
        ctx.font = '18px Muli'
        ctx.fillStyle = this.bright_color
        ctx.shadowColor = ctx.fillStyle
        ctx.fillText("HIGH SCORE", imp_vars.levelWidth/2, 455)
      }
      
    }

    //draw_lives_and_sparks(ctx, Math.floor(this.hive_numbers.lives), Math.floor(this.hive_numbers.sparks), this.hive_numbers.ultimates, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 200, 24, {labels: true, ult: this.has_ult})

    ctx.shadowBlur = 0

    ctx.fillStyle = this.lite_color;
    ctx.font = '12px Muli'
    ctx.fillText("PRESS ANY KEY TO SKIP", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 270)

  }
}

MainGameTransitionState.prototype.on_key_down = function(keyCode) {
    if(this.level_loaded) {
      this.world_intro_interval /=4
      this.level_intro_interval /=4
      this.last_level_summary_interval /=4
      this.transition_timer /=4
    }
}

MainGameTransitionState.prototype.on_click = function(keyCode) {
    if(this.level_loaded) {
      this.world_intro_interval /= 4
      this.level_intro_interval /= 4
      this.last_level_summary_interval /= 4
      this.transition_timer /= 4
    }
}

MainGameTransitionState.prototype.load_complete = function() {
  bg_canvas.setAttribute("style", "display:none")
  this.level_loaded = true
  imp_vars.bg_ctx.translate(imp_vars.sidebarWidth, 0)
  this.level.draw_bg(imp_vars.bg_ctx)
  imp_vars.bg_ctx.translate(-imp_vars.sidebarWidth, 0)
  draw_bg(imp_vars.world_menu_bg_canvas.getContext('2d'), 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.world_num)
}

MainGameTransitionState.prototype.check_quests_helper = function(level, game_numbers) {
  var world = parseInt(level.substring(5, 6))
  // Check if this game_number is a gold score. Bosses don't count.
  if ((game_numbers.stars == 3 || this.stars == 3) && level.substring(0, 4) != "BOSS") {
    // Completed the first gold quest.
    set_quest_completed("first_gold")
  }
  if (game_numbers.impulsed == false) {
    set_quest_completed("pacifist")
  }
}

MainGameTransitionState.prototype.get_combo_color = function(combo) {
  var tcombo = 100;
  var hperiod = 400;
  if(combo < tcombo) {
    var prog = combo/tcombo;
    var red = Math.round(190*(1-prog) + 0*prog);
    var green = Math.round(190*(1-prog) + 128*prog);
    var blue= Math.round(190*(1-prog) + 255*prog);

    return "rgb("+red+","+green+","+blue+")";
  }
  return this.get_combo_color((tcombo-0.01)*(Math.abs(hperiod - this.game_numbers.game_length%(2*hperiod))/hperiod))
}
