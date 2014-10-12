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
  this.first_time = imp_vars.player_data.first_time // cache the first time variable, since it might change during this game state
  this.victory = args.victory
  this.bg_drawn = false
  this.ult_num_pages = 7
  this.ult_cur_page = 0
  this.current_lives = calculate_lives();
  this.current_sparks = calculate_spark_val();
  this.current_ult = calculate_ult();
  this.stars = 0; // only for practice mode.
  var _this = this;

  this.normal_mode_button = new IconButton("NORMAL MODE", 20, imp_vars.levelWidth/2-150, 300, 250, 125, "white", impulse_colors["impulse_blue"], function(){_this.change_mode("easy")}, "easy_mode")
  this.challenge_mode_button = new IconButton("CHALLENGE MODE", 20, imp_vars.levelWidth/2+150, 300, 250, 125, "white", impulse_colors["impulse_blue"], function(){_this.change_mode("normal")}, "normal_mode")

  this.debug()
  
  this.determine_rewards()
  this.next_reward()
  if(this.rewards.length > 0) {
    imp_vars.impulse_music.stop_bg()  
  }

  this.auto_advance_duration = 3000;
  this.auto_advance_timer = 0;
}

RewardGameState.prototype.change_mode = function(type) {
  if (this.transition_state == "none") {
    imp_vars.player_data.difficulty_mode = type;
    save_game();
    this.adjust_difficulty_button_border()
    this.transition_state="out";
    this.transition_timer = this.transition_interval * 4  
  }
}


// Check whether the quest is already complete. If it isn't, show the reward screen.
RewardGameState.prototype.quest_complete = function(type) {
  if (!is_quest_completed(type)) {
    set_quest_completed(type)
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
    var world_bg_ctx = imp_vars.world_menu_bg_canvas.getContext('2d')
    if (cur_reward.type == "world_victory") {
      draw_bg(world_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+(cur_reward.data+1))
    } else {
      draw_bg(world_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive 0")
    }
    this.bg_drawn = true
  }
  ctx.save()
  if (cur_reward.type == "world_victory") {
    ctx.globalAlpha *= get_bg_opacity(cur_reward.data + 1);
  } else {
    ctx.globalAlpha *= get_bg_opacity(0);
  }
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
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
    draw_tessellation_sign(ctx, tessellation_num, imp_vars.levelWidth/2, 250, 100)
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
      main_message_teaser = imp_vars.player_data.difficulty_mode == "easy" ? "STANDARD MODE" : "CHALLENGE MODE"
      ctx.textAlign = "center"
      ctx.font = "48px Muli"
      ctx.fillText("HIVE "+imp_params.tessellation_names[cur_reward.data+1], imp_vars.levelWidth/2, 270)
    }

    if(cur_reward.type == "final_victory") {
      message_size = 32
            
      final_message = imp_vars.player_data.difficulty_mode == "easy" ? "STANDARD MODE COMPLETED" : "CHALLENGE MODE COMPLETED"
      final_message_teaser = imp_vars.player_data.difficulty_mode == "easy" ? "WELL DONE" : "WICKED SICK"

      ctx.textAlign = "center"
      ctx.fillStyle = impulse_colors["impulse_blue"]  
      ctx.font = "32px Muli"
      ctx.fillText(final_message, imp_vars.levelWidth/2, 240)
      ctx.font = "20px Muli"
      ctx.fillStyle = "white"
      ctx.fillText(final_message_teaser, imp_vars.levelWidth/2, 280)

      ctx.font = "16px Muli"
      ctx.fillStyle = "white"
      if (imp_vars.player_data.difficulty_mode == "easy") {
        ctx.fillText("BUT CAN YOU CONQUER CHALLENGE MODE?", imp_vars.levelWidth/2, 400)
      } else {
        ctx.fillText("THANKS FOR PLAYING IMPULSE", imp_vars.levelWidth/2, 450)
        // TODO: add sharing
      }
    }

    /*if(cur_reward.type == "share") {
      ctx.textAlign = "center"
      ctx.font = "24px Muli"
      ctx.fillStyle = "white"
      draw_logo(ctx,imp_vars.levelWidth/2, 200, "")
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.font = "20px Muli"
      ctx.fillStyle = "white"
      ctx.fillText("IF YOU'RE ENJOYING THE GAME", imp_vars.levelWidth/2, 300)
      ctx.fillText("PLEASE HELP SPREAD THE WORD", imp_vars.levelWidth/2, 340)
      //draw_spark(ctx, 230, 467, 0)
      //draw_spark(ctx, 570, 467, 0)
    }*/


    if(cur_reward.type == "rating") {

      main_message = "YOUR SKILL RATING WENT UP"
      main_message_teaser = "CONGRATULATIONS!"
      message_size = 32
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.font = "60px Muli"
      ctx.fillText("+"+cur_reward.data.diff, imp_vars.levelWidth/2, main_reward_text_y + 20)

      ctx.textAlign = 'center'
      ctx.font = '12px Muli'
      ctx.fillStyle = 'white'
      ctx.fillText("NEW SKILL RATING", imp_vars.levelWidth/2, new_values_text_y - 25)
      ctx.font = '48px Muli'
      ctx.fillText(cur_reward.data.new_rating, imp_vars.levelWidth/2, new_values_text_y + 25)
    } 

    if(cur_reward.type == "lives") {
      main_message_teaser = "YOU HAVE EARNED AN UPGRADE!"
      main_message = "EXTRA LIFE"

      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.font = "60px Muli"
      ctx.fillText("+"+cur_reward.data.diff, imp_vars.levelWidth/2 - 25, main_reward_text_y + 20)
      
      drawSprite(ctx, imp_vars.levelWidth/2 + 35, main_reward_text_y, 0, 40, 40, "lives_icon")
      ctx.font = "72px Muli"

      ctx.font = '12px Muli'
      ctx.fillStyle = "white"
      var x_separation = 50
      ctx.fillText("LIVES", imp_vars.levelWidth/2 - x_separation, new_values_text_y - 30)
      drawSprite(ctx, imp_vars.levelWidth/2 - x_separation, new_values_text_y - 8, 0, 30, 30, "lives_icon")
      ctx.fillText("LIVES", imp_vars.levelWidth/2 + x_separation, new_values_text_y - 30)
      drawSprite(ctx, imp_vars.levelWidth/2 + x_separation, new_values_text_y - 8, 0, 30, 30, "lives_icon")

      ctx.font = '36px Muli'
      ctx.fillText(cur_reward.data.new_lives - cur_reward.data.diff, imp_vars.levelWidth/2 - x_separation, new_values_text_y + 40)
      draw_arrow(ctx, imp_vars.levelWidth/2, new_values_text_y, 20, "right", "white", false)

      ctx.fillText(cur_reward.data.new_lives, imp_vars.levelWidth/2 + x_separation, new_values_text_y + 40)
    }

    if(cur_reward.type == "ult") {
      ctx.textAlign = "center"
      main_message_teaser = "YOU HAVE EARNED AN UPGRADE!"
      main_message = "EXTRA ULTIMATE"
      
      ctx.fillStyle = "white"
      ctx.font = "60px Muli"
      ctx.fillText("+"+cur_reward.data.diff, imp_vars.levelWidth/2 - 25, main_reward_text_y + 20)
      
      drawSprite(ctx, imp_vars.levelWidth/2 + 35, main_reward_text_y, 0, 40, 40, "ultimate_icon")
      ctx.font = "72px Muli"

      ctx.font = '12px Muli'
      ctx.fillStyle = 'white'
      var x_separation = 50
      ctx.fillText("ULT", imp_vars.levelWidth/2 - x_separation, new_values_text_y - 30)
      drawSprite(ctx, imp_vars.levelWidth/2 - x_separation, new_values_text_y - 8, 0, 30, 30, "ultimate_icon")
      ctx.fillText("ULT", imp_vars.levelWidth/2 + x_separation, new_values_text_y - 30)
      drawSprite(ctx, imp_vars.levelWidth/2 + x_separation, new_values_text_y - 8, 0, 30, 30, "ultimate_icon")

      ctx.font = '36px Muli'
      ctx.fillText(cur_reward.data.new_ult - cur_reward.data.diff, imp_vars.levelWidth/2 - x_separation, new_values_text_y + 40)
      draw_arrow(ctx, imp_vars.levelWidth/2, new_values_text_y, 20, "right", "white", false)

      ctx.fillText(cur_reward.data.new_ult, imp_vars.levelWidth/2 + x_separation, new_values_text_y + 40)
    }

    if(cur_reward.type == "quest") {
      var tessellation_num = 0
      ctx.save()
      draw_tessellation_sign(ctx, tessellation_num, imp_vars.levelWidth/2, 250, 150)
      ctx.restore()
      ctx.textAlign = "center"
      ctx.fillStyle = impulse_colors["impulse_blue"]

      ctx.font = '32px Muli'
      ctx.fillText("CHALLENGE COMPLETE!", imp_vars.levelWidth/2, 120)

      
      //drawSprite(ctx, imp_vars.levelWidth/2 + 35, main_reward_text_y, 0, 40, 40, "ultimate_icon")
      draw_quest_button(ctx, imp_vars.levelWidth/2, main_reward_text_y, 60, cur_reward.data.type);

      ctx.font = '24px Muli'
      ctx.fillStyle = "white"      
      for (var i = 0; i < imp_params.quest_data[cur_reward.data.type].text.length; i++) {
        var text = imp_params.quest_data[cur_reward.data.type].text[i];
        ctx.fillText(text, imp_vars.levelWidth / 2, main_reward_text_y + 150 + i * 36);
      }

    }

    if(cur_reward.type == "spark_val") {
      main_message_teaser = "YOU HAVE EARNED AN UPGRADE!"
      main_message = "SPARK VALUE INCREASED"

      ctx.textAlign = 'center'
      ctx.fillStyle = "white"
      ctx.font = "60px Muli"
      ctx.fillText("+"+cur_reward.data.diff, imp_vars.levelWidth/2 - 25, main_reward_text_y + 20)
      
      drawSprite(ctx, imp_vars.levelWidth/2 + 35, main_reward_text_y, 0, 40, 40, "sparks_icon")
      ctx.font = "72px Muli"

      ctx.font = '12px Muli'
      ctx.fillStyle = 'white'
      var x_separation = 50
      ctx.fillStyle = "white"
      ctx.fillText("SPARK", imp_vars.levelWidth/2 - x_separation, new_values_text_y - 40)
      ctx.fillText("VALUE", imp_vars.levelWidth/2 - x_separation, new_values_text_y - 25)
      drawSprite(ctx, imp_vars.levelWidth/2 - x_separation, new_values_text_y - 6, 0, 22, 22, "sparks_icon")

      ctx.fillText("SPARK", imp_vars.levelWidth/2 + x_separation, new_values_text_y - 40)
      ctx.fillText("VALUE", imp_vars.levelWidth/2 + x_separation, new_values_text_y - 25)
      drawSprite(ctx, imp_vars.levelWidth/2 + x_separation, new_values_text_y - 6, 0, 22, 22, "sparks_icon")

      ctx.font = '36px Muli'
      ctx.fillText(cur_reward.data.new_spark_val - cur_reward.data.diff, imp_vars.levelWidth/2 - x_separation, new_values_text_y + 40)
      draw_arrow(ctx, imp_vars.levelWidth/2, new_values_text_y, 20, "right", "white", false)

      ctx.fillText(cur_reward.data.new_spark_val, imp_vars.levelWidth/2 + x_separation, new_values_text_y + 40)
    }

    if(cur_reward.type == "first_time_tutorial") {
      ctx.font = "30px Muli"
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.fillText("INTRO TUTORIAL COMPLETE", imp_vars.levelWidth/2, 250)
      ctx.fillStyle = "white"
      ctx.font = "16px Muli"
      ctx.fillText("INITIALIZING MAIN GAME...", imp_vars.levelWidth/2, 550)
      //draw_logo(ctx,imp_vars.levelWidth/2, 250, "", 0.5)
    }

    if(cur_reward.type == "select_difficulty") {
      main_message_teaser = "LET'S DO THIS"
      message_size = 36
      main_message = "SELECT DIFFICULTY"

      this.normal_mode_button.draw(ctx)
      this.challenge_mode_button.draw(ctx)

      //draw_tutorial_icon(ctx, imp_vars.levelWidth/2, main_reward_text_y, 30, "white" , false)
      //ctx.font = "24px Muli"
      //ctx.textAlign = "center"
      //ctx.fillStyle = "white"
      
    }

    // write a main message if it applies
    if (main_message) {
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.font = "16px Muli"
      ctx.fillText(main_message_teaser, imp_vars.levelWidth/2, 70)
      ctx.font = message_size + "px Muli"
      if (cur_reward.type == "world_victory") {
        ctx.fillStyle = impulse_colors["world "+(cur_reward.data+1)+ " bright"]
      } else {
        ctx.fillStyle = impulse_colors["impulse_blue"]  
      }
      ctx.fillText(main_message, imp_vars.levelWidth/2, 120)
    }

    if (cur_reward.type != "select_difficulty") {
      ctx.textAlign = "center"
      ctx.fillStyle = cur_reward.type == "world_victory" ? impulse_colors["world "+(cur_reward.data+1)+ " bright"] : "white"
      ctx.font = "16px Muli"
      if (cur_reward.type != "first_time_tutorial") {
        if (cur_reward.type != "ult")
          ctx.fillText("PRESS ANY KEY TO CONTINUE", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)
        else
          ctx.fillText("PRESS ANY KEY FOR ULT TUTORIAL", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)  
      }
    } else {
      ctx.font = "16px Muli"
      ctx.textAlign = "center"
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("YOU CAN SWITCH DIFFICULTY ON THE TITLE SCREEN OPTIONS MENU", imp_vars.levelWidth/2, imp_vars.levelHeight - 75)
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

RewardGameState.prototype.advance_game_state = function() {
  if(this.to_tutorial) {
    switch_game_state(new HowToPlayState("ult_tutorial"))
  }
  else if (this.main_game) {
    if (this.victory && this.hive_numbers.world >= 1 && this.hive_numbers.world <= 3) {
      // Immediately move to the next world.
      switch_game_state(new MainGameTransitionState(this.hive_numbers.world + 1, null, null, null, null))    
    } else if (this.victory && this.hive_numbers.world == 0 && this.first_time) {
      switch_game_state(new MainGameTransitionState(this.hive_numbers.world + 1, null, null, null, null))    
    } else {
      switch_game_state(new TitleState(true))
    }
  } else if (this.args.is_tutorial) {
      if (this.args.tutorial_type == "ult_tutorial") {
        // They MUST have come from world 2. Take them to world 2.
        switch_game_state(new MainGameTransitionState(2, null, null, null, null))    
      } else {
        switch_game_state(new TitleState(true))  
      }
  } else {
    switch_game_state(new GameOverState(this.args.game_numbers, this.args.level, this.args.world_num, this.args.visibility_graph, {
      best_time: this.best_time,
      high_score: this.high_score,
      stars: this.stars,
      victory: this.victory
    }))
  }

}

RewardGameState.prototype.determine_rewards = function() {
  if(this.args.is_tutorial) {
    if(this.args.tutorial_type == "first_time_tutorial" || this.args.first_time_tutorial) {
      this.rewards.push({
        type: "first_time_tutorial"
      })
      imp_vars.player_data.first_time = false;
      save_game();
    }
    return
  }

  if (this.main_game) {
    if(imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.hive_numbers.world] 
      && imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.hive_numbers.world]["first_victory"]) {

      if (this.hive_numbers.world == 4) {
        set_quest_completed("final_boss")
        this.rewards.push({
          type: "final_victory",
        })
      }

      imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.hive_numbers.world]["first_victory"] = false
      save_game();
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
