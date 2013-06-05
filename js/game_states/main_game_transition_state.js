MainGameTransitionState.prototype = new LoaderGameState

MainGameTransitionState.prototype.constructor = MainGameTransitionState

function MainGameTransitionState(world_num, level, victory, final_game_numbers, visibility_graph, hive_numbers, loading_game) {

  this.hive_numbers = hive_numbers
  this.victory = victory

  this.game_numbers = final_game_numbers
  this.first_process = false

  this.world_intro_interval = 3700
  this.level_intro_interval = 2200
  this.last_level_summary_interval = 4000
  this.last_level = null
  this.high_score = false
  this.level_loaded = true

  this.continued = false
  if(level) {
    if(this.game_numbers) {
      this.last_level = level
      this.last_level_name = level.level_name
      this.state = "last_level_summary"
      this.transition_timer = this.last_level_summary_interval
      this.compute_last_level_stats()
      if(!this.victory) {
        this.last_level_summary_interval /= 2
        this.transition_timer /= 2
        this.level_intro_interval /= 2

      }
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
    this.state = "world_intro"
    if(loading_game) {
      this.hive_numbers = hive_numbers
    } else {
      this.hive_numbers = new HiveNumbers(world_num)
    }
    this.transition_timer = this.world_intro_interval
  }

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
  if(!this.continued) {
    if(this.victory || !this.last_level) {
      // beat last level

      if(this.last_level && this.last_level.is_boss_level) {
        return
      }

      this.level_loaded = false
      if(loading_game) {
        this.level = this.load_level(impulse_level_data[this.hive_numbers.current_level])
      } else {
        this.level = this.load_level(impulse_level_data[this.get_next_level_name(this.last_level)])
      }

      this.first_time = !impulse_level_data[this.level.level_name].save_state[player_data.difficulty_mode].seen

      impulse_level_data[this.level.level_name].save_state[player_data.difficulty_mode].seen = true
      save_game()

      this.hive_numbers.game_numbers[this.level.level_name] = {}
      this.hive_numbers.game_numbers[this.level.level_name]["visited"] = true
      this.hive_numbers.game_numbers[this.level.level_name]["deaths"] = 0
      this.hive_numbers.current_level = this.level.level_name
    } else {
      // died at last level
      if(!this.hive_numbers.game_numbers.hasOwnProperty(this.last_level.level_name))
        this.hive_numbers.game_numbers[this.last_level.level_name] = {}
      if(!this.hive_numbers.game_numbers[this.last_level.level_name].hasOwnProperty("deaths"))
        this.hive_numbers.game_numbers[this.last_level.level_name]["deaths"] = 0

      this.hive_numbers.game_numbers[this.last_level.level_name]["deaths"] += 1

      this.hive_numbers.lives -= 1
      this.level = this.last_level
      this.level.impulse_game_state = null
      bg_ctx.translate(sidebarWidth, 0)//allows us to have a topbar
      this.level.draw_bg(bg_ctx)
      this.bg_drawn = true
      bg_ctx.translate(-sidebarWidth, 0)

    }
    if(this.level.is_boss_level) {
      if(this.victory)
        this.level_intro_interval = 1000
      else
        this.level_intro_interval = 500
    }
  }


  if(!this.last_level || !this.last_level.is_boss_level)
    impulse_music.play_bg(imp_vars.songs["Hive "+this.world_num])
}

MainGameTransitionState.prototype.get_next_level_name = function(level) {
  if(!level) {
    return "HIVE "+this.world_num+"-1";
  } else {
    if(level.level_number < 7) {
      return "HIVE "+this.world_num+"-"+(level.level_number+1)
    } else {
      return "BOSS "+this.world_num
    }
  }
}

MainGameTransitionState.prototype.compute_last_level_stats = function() {
  var stars = 0
  if(!this.last_level.is_boss_level) {
    while(this.game_numbers.score > impulse_level_data[this.last_level.level_name].cutoff_scores[player_data.difficulty_mode][stars])
    {
      stars+=1
    }
  }
  this.stars = stars

  if(!this.last_level.is_boss_level) {
    if (this.stars < 3)
      this.bar_top_score = impulse_level_data[this.last_level.level_name].cutoff_scores[player_data.difficulty_mode][this.stars]
    else
      this.bar_top_score = impulse_level_data[this.last_level.level_name].cutoff_scores[player_data.difficulty_mode][2]
  }

  if(!this.last_level.is_boss_level) {
    if(this.game_numbers.score > impulse_level_data[this.last_level.level_name].save_state[player_data.difficulty_mode].high_score) {

        this.high_score = true
        impulse_level_data[this.last_level.level_name].save_state[player_data.difficulty_mode].high_score = this.game_numbers.score

        var stars = 0
        while(this.game_numbers.score >= impulse_level_data[this.last_level.level_name].cutoff_scores[player_data.difficulty_mode][stars])
        {
          stars+=1
        }
        impulse_level_data[this.last_level.level_name].save_state[player_data.difficulty_mode].stars = stars
        this.stars = stars
        save_game()
      }

    } else {
      impulse_level_data[this.last_level.level_name].save_state[player_data.difficulty_mode].stars = 3
      save_game()
    }

  if(this.victory) {
    if(!this.hive_numbers.game_numbers.hasOwnProperty(this.last_level.level_name)) {
      this.hive_numbers.game_numbers[this.last_level.level_name] = {}
      this.hive_numbers.game_numbers[this.last_level.level_name]["deaths"] = 0
    }
    if(!this.last_level.is_boss_level) {
      for(var attribute in this.game_numbers)
        this.hive_numbers.game_numbers[this.last_level.level_name][attribute] = this.game_numbers[attribute]
      var stars = 0
      while(this.game_numbers.score > impulse_level_data[this.last_level.level_name].cutoff_scores[player_data.difficulty_mode][stars])
      {
        stars+=1
      }
      this.hive_numbers.game_numbers[this.last_level.level_name]["stars"]  = stars
      if(!this.hive_numbers.game_numbers[this.last_level.level_name].hasOwnProperty("deaths"))
        this.hive_numbers.game_numbers[this.last_level.level_name]["deaths"] = 0

    } else {
      this.hive_numbers.game_numbers[this.last_level.level_name]["score"] = "WIN"
      this.hive_numbers.game_numbers[this.last_level.level_name]["stars"] = 3
      this.hive_numbers.game_numbers[this.last_level.level_name]["last_time"] = this.game_numbers["last_time"]
    }

    this.time_sparks_awarded = Math.floor(this.game_numbers.seconds/5)
    this.combo_sparks_awarded = Math.floor(this.game_numbers.combo/2)

    this.target_sparks = this.hive_numbers.sparks + this.time_sparks_awarded + this.combo_sparks_awarded;
    this.target_lives = this.hive_numbers.lives
    while(this.target_sparks >= 100) {
      this.target_sparks -= 100;
      this.target_lives += 1
    }


  }
}

MainGameTransitionState.prototype.process = function(dt) {

  this.first_process = true

  if(this.hive_numbers.lives < 0) {
    switch_game_state(new MainGameSummaryState(this.world_num, false, this.hive_numbers, this.level, this.visibility_graph))
    return
  }
  if(this.last_level && this.last_level.is_boss_level && this.last_level.boss_victory) {
    switch_game_state(new MainGameSummaryState(this.world_num, true, this.hive_numbers))
    return
  }

  var prog = (this.transition_timer/this.last_level_summary_interval);

  if(this.state == "last_level_summary" && this.victory && prog > 0.3 &&  prog < 0.7) {
      this.hive_numbers.sparks += (dt)/(0.4 * this.last_level_summary_interval) * (this.time_sparks_awarded+this.combo_sparks_awarded);
      if(this.hive_numbers.sparks >= 100) {
        this.hive_numbers.sparks -= 100;
        this.hive_numbers.lives += 1;
      }
  } else if(this.state == "last_level_summary" && this.victory && prog < 0.3) {
    console.log("SET "+this.hive_numbers.sparks+" "+this.hive_numbers.lives)
      this.hive_numbers.sparks = Math.floor(this.target_sparks);
      this.hive_numbers.lives = Math.floor(this.target_lives);
      this.hive_numbers.last_sparks = this.hive_numbers.sparks
      this.hive_numbers.last_lives = this.hive_numbers.lives
  }

  if(this.level_loaded || (this.state == "world_intro" && this.transition_timer >= this.world_intro_interval/2) ||
    (this.state == "last_level_summary" && this.transition_timer >= this.last_level_summary_interval/2)) {
    this.transition_timer -= dt;
  }

  if(this.transition_timer < 0) {

    if(this.state == "world_intro" && this.level_loaded) {
      this.state = "level_intro"
      this.transition_timer = this.level_intro_interval
    } else if(this.state == "last_level_summary" && this.level_loaded) {

      if(this.victory && this.level.is_boss_level) {
        impulse_music.stop_bg()
      }
      this.state = "level_intro"
      this.transition_timer = this.level_intro_interval
    } else if(this.state == "level_intro") {
      switch_game_state(new ImpulseGameState(this.world_num, this.level, this.visibility_graph, this.victory, this.hive_numbers, this.first_time))
    }
  }
}

MainGameTransitionState.prototype.draw = function(ctx, bg_ctx) {
  ctx.fillStyle = impulse_colors["world "+this.world_num+" dark"]
  ctx.fillRect(0, 0, levelWidth, levelHeight)
  if(!this.first_process) return

  if(!this.bg_drawn && this.level) {
    bg_ctx.translate(sidebarWidth, 0)//allows us to have a topbar
    this.level.draw_bg(bg_ctx)
    this.bg_drawn = true
    bg_ctx.translate(-sidebarWidth, 0)
   bg_canvas.setAttribute("style", "display:none")
  }

  if(this.state == "world_intro") {

    var prog = (this.transition_timer/this.world_intro_interval);

    ctx.save()
    ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)


    ctx.textAlign = 'center'
    ctx.shadowBlur = 20;

    /*ctx.font = '24px Muli'

    ctx.fillStyle = impulse_colors["impulse_blue_dark"]
    ctx.shadowColor = ctx.fillColor
    ctx.fillText("IMPULSE", levelWidth/2, 100)*/

    ctx.font = '54px Muli'

    ctx.fillStyle = this.bright_color;
    ctx.shadowColor = "black"


    ctx.save()
    ctx.globalAlpha *= 0.8
    draw_tessellation_sign(ctx,this.world_num,levelWidth/2, levelHeight/2, 150)
    ctx.restore()
    ctx.fillText(this.hive_numbers.hive_name, levelWidth/2, levelHeight/2+25)
    ctx.shadowBlur = 0
    ctx.fillStyle = this.lite_color;
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '12px Muli'
    if(!this.level_loaded) {
      ctx.fillText("LOADING LEVEL", levelWidth/2, levelHeight/2 + 270)
    } else {
      ctx.fillText("PRESS SPACE TO SKIP", levelWidth/2, levelHeight/2 + 270)
    }
    ctx.restore()

  } else if(this.state == "level_intro") {

    if(!this.level.is_boss_level) {
      ctx.save()
      var prog = (this.transition_timer/this.level_intro_interval);

      ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)


      ctx.fillStyle = this.bright_color;
      ctx.textAlign = 'center'

      ctx.font = '42px Muli'
      ctx.shadowBlur = 20;
      ctx.shadowColor = "black"

      ctx.globalAlpha *= 0.8
      draw_tessellation_sign(ctx,this.world_num, levelWidth/2, levelHeight/2 - 100, 100)
      ctx.fillText(this.hive_numbers.hive_name, levelWidth/2, levelHeight/2-100)
      ctx.font = '32px Muli'
      ctx.fillText(this.level.level_name, levelWidth/2, levelHeight/2-50)

      ctx.font = '20px Muli'
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("LIVES: "+Math.floor(this.hive_numbers.lives), levelWidth/2, levelHeight/2+200)
      ctx.fillText("SPARKS: "+Math.floor(this.hive_numbers.sparks), levelWidth/2, levelHeight/2+230)
      ctx.shadowBlur = 0
      ctx.fillStyle = this.lite_color;
      ctx.shadowColor = ctx.fillStyle
      ctx.font = '12px Muli'
      ctx.fillText("PRESS SPACE TO SKIP", levelWidth/2, levelHeight/2 + 270)
      ctx.restore()

    }

  }

   else if(this.state == "last_level_summary") {
    var prog = (this.transition_timer/this.last_level_summary_interval);

    ctx.globalAlpha = Math.min(1, (1 - 2*Math.abs(prog-0.5))/.5)

    ctx.shadowBlur = 20;

    ctx.textAlign = 'center'

    ctx.font = '30px Muli'
    if(this.victory) {
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.shadowColor = ctx.fillStyle
      ctx.fillText("LEVEL CONQUERED", levelWidth/2, 100)
    }
    else {
      ctx.fillStyle = 'red'
      ctx.shadowColor = ctx.fillStyle
      ctx.fillText("LEVEL FAILED", levelWidth/2, 100)
    }



    ctx.fillStyle = this.bright_color;
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '40px Muli'
    ctx.fillText(this.last_level.level_name, levelWidth/2, 150)

    ctx.font = '18px Muli'

    ctx.fillStyle = this.lite_color;
    ctx.shadowColor = ctx.fillStyle

    if(!this.last_level.is_boss_level) {
      ctx.fillText("FINAL COMBO", levelWidth/2 + 100, 190)
      ctx.fillText("LEVEL TIME", levelWidth/2 - 100, 190)
    } else {
      ctx.fillText("LEVEL TIME", levelWidth/2, 190)
    }
    ctx.font = '54px Muli'

    if(!this.last_level.is_boss_level) {
      ctx.fillText(this.game_numbers.combo, levelWidth/2 + 100, 240)
      ctx.fillText(this.game_numbers.last_time, levelWidth/2 - 100, 240)
    } else {
      ctx.fillText(this.game_numbers.last_time, levelWidth/2, 240)
    }

    ctx.fillStyle = impulse_colors["impulse_blue"]
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '18px Muli'
    if(this.victory) {
      ctx.fillText("(+"+this.time_sparks_awarded+" sparks)", levelWidth/2 - 100, 270)
      ctx.fillText("(+"+this.combo_sparks_awarded+" sparks)", levelWidth/2 + 100, 270)
    } else {

    }

    if(!this.last_level.is_boss_level) {
      ctx.fillStyle = this.lite_color;
      ctx.shadowColor = ctx.fillStyle
      ctx.font = '24px Muli'
      //ctx.fillStyle = (this.stars > 0) ? impulse_colors[this.star_colors[this.stars-1]] : this.color
      ctx.fillText("SCORE", levelWidth/2, 320)
      ctx.font = '72px Muli'
      ctx.fillText(this.game_numbers.score, levelWidth/2, 390)
      //var color = (this.stars < 3) ? impulse_colors[this.star_colors[this.stars]] : impulse_colors[this.star_colors[2]]
      var color = this.lite_color
      draw_progress_bar(ctx, levelWidth/2, 420, 300, 15,
       Math.min(this.game_numbers.score/this.bar_top_score, 1), color, color)

      if(this.high_score) {
        ctx.font = '18px Muli'
        ctx.fillStyle = impulse_colors["impulse_blue_dark"]
        ctx.fillText("HIGH SCORE", levelWidth/2, 450)
      }
    }


    ctx.fillStyle = this.lite_color;
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '12px Muli'
    ctx.fillText("LIVES: "+Math.floor(this.hive_numbers.lives), levelWidth/2, levelHeight/2+200)
    ctx.fillText("SPARKS: "+Math.floor(this.hive_numbers.sparks), levelWidth/2, levelHeight/2+230)
    ctx.shadowBlur = 0

    ctx.fillText("PRESS SPACE TO SKIP", levelWidth/2, levelHeight/2 + 270)

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

MainGameTransitionState.prototype.load_complete = function() {
  this.level_loaded = true
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