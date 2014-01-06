RewardGameState.prototype = new GameState

RewardGameState.prototype.constructor = RewardGameState

function RewardGameState(hive_numbers, main_game, args) {
  this.hive_numbers = hive_numbers
  this.main_game = main_game
  this.args = args
  this.rewards = []
  this.debug()
  this.cur_reward_index = 0
  this.transition_interval = 250
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.victory = args.victory
  this.bg_drawn = false
  this.ult_num_pages = 7
  this.ult_cur_page = 0
  var _this = this;

  this.normal_mode_button = new IconButton("NORMAL MODE", 20, imp_vars.levelWidth/2-150, 300, 250, 125, "white", impulse_colors["impulse_blue"], function(){_this.change_mode("easy")}, "easy_mode")
  this.challenge_mode_button = new IconButton("CHALLENGE MODE", 20, imp_vars.levelWidth/2+150, 300, 250, 125, "white", impulse_colors["impulse_blue"], function(){_this.change_mode("normal")}, "normal_mode")

  this.text_width = 500
  this.pages = ["use ultimate","ULTIMATE IS A WEAPON OF LAST RESORT",
    "ULTIMATE WILL BLOW AWAY all enemies # in a moderate distance around you",
    "Enemies killed by ultimate do not give points",
    "while ultimate is active, # you will temporarily become much heavier",
    "you have a limited number of # ultimates per continue # (currently 1)",
    "If you die after using ultimate, # it is refunded"
  ]
  
  this.determine_rewards()
  imp_vars.impulse_music.stop_bg()
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
  ctx.globalAlpha /= 5
  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  ctx.restore()
  ctx.save()


  // change transparency for transition
  if(this.transition_state == "in") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = 1 - prog
  } else if(this.transition_state == "out") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = Math.max(0, prog)
  }
  // draw tessellation if applicable
  if (cur_reward.type != "ult_tutorial" && cur_reward.type != "select_difficulty") {
    var tessellation_num = cur_reward.type == "world_victory" ? cur_reward.data + 1 : 0
    ctx.save()
    ctx.globalAlpha *= 0.2
    draw_tessellation_sign(ctx, tessellation_num, imp_vars.levelWidth/2, 250, 100)
    ctx.restore()
  }    var main_message = ""
    var main_message_teaser = ""
    var main_reward_text_y = 250
    var new_values_text_y = 430
    var message_size = 48

    if(cur_reward.type == "world_victory") {
      message_size = 24
      main_message = "NEW HIVE UNLOCKED"
      ctx.fillStyle = impulse_colors["world "+(cur_reward.data+1)+ " bright"]
      ctx.textAlign = "center"
      ctx.font = "48px Muli"
      ctx.fillText("HIVE "+imp_params.tessellation_names[cur_reward.data+1], imp_vars.levelWidth/2, 270)
    }


    if(cur_reward.type == "rating") {

      main_message = "YOUR SKILL RATING WENT UP"
      main_message_teaser = "CONGRATULATIONS!"
      message_size = 40
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
      main_message = "INTRO TUTORIAL COMPLETE"

      message_size = 30
      draw_tutorial_icon(ctx, imp_vars.levelWidth/2, main_reward_text_y, 30, "white" , false)
      ctx.font = "24px Muli"
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.fillText("REVISIT THE TUTORIAL FOR MORE ADVANCED TIPS", imp_vars.levelWidth/2, new_values_text_y)
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
        ctx.fillStyle = "white"
      } else {
        ctx.fillStyle = impulse_colors["impulse_blue"]  
      }
      
      ctx.fillText(main_message, imp_vars.levelWidth/2, 120)
    }

    if (cur_reward.type != "select_difficulty") {
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.font = "16px Muli"
      ctx.fillText("PRESS ANY KEY TO CONTINUE", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)
      ctx.restore()  
    } else {
      ctx.font = "16px Muli"
      ctx.textAlign = "center"
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("YOU CAN SWITCH DIFFICULTY ON THE TITLE SCREEN OPTIONS MENU", imp_vars.levelWidth/2, imp_vars.levelHeight - 75)
    }
}

RewardGameState.prototype.adjust_difficulty_button_border = function() {
  this.normal_mode_button.border = imp_vars.player_data.difficulty_mode == "easy"
  this.challenge_mode_button.border = imp_vars.player_data.difficulty_mode == "normal"
}

RewardGameState.prototype.debug = function() {
  if (false) {

     this.rewards.push({
      type: "first_time_tutorial"
     })
     /*this.rewards.push({
      type: "select_difficulty"
     })*/
     this.rewards.push({
      type: "rating",
      data: {
        diff: 500,
        new_rating: 1000
      }
    })
     this.rewards.push({
      type: "lives",
      data: {
        diff: 2,
        new_lives: 5
      }
    })
    this.rewards.push({
      type: "ult",
      data: {
        diff: 1,
        new_ult: 2
      }
    })
    this.to_tutorial = true
    this.rewards.push({
      type: "spark_val",
      data: {
        diff: 1,
        new_spark_val: 15
      }
    })

    for (var i = 1; i < 4; i++) {
      this.rewards.push({
        type: "world_victory",
        data: i
      })  
    }
  }
}

RewardGameState.prototype.process = function(dt) {

  if(this.rewards.length == 0) {
    this.advance_game_state()
    
  }

  this.transition_timer -= dt;
  if(this.transition_timer < 0) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
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
  this.cur_reward_index += 1

  if (this.cur_reward_index < this.rewards.length) { 
    var reward = this.rewards[this.cur_reward_index]

  }
}

RewardGameState.prototype.advance_game_state = function() {
  if(this.to_tutorial) {
    switch_game_state(new HowToPlayState("ult_tutorial"))
  }
  else if(this.main_game || this.args.is_tutorial)
      switch_game_state(new TitleState(true))
  else {
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
    if(this.args.tutorial_first_time) {
      this.rewards.push({
        type: "first_time_tutorial"
      })
      /*this.rewards.push({
        type: "select_difficulty"
      })*/
    }
    return
  }

  if(!this.main_game) {
    if(!this.args.level.is_boss_level) {
      if(this.victory) {
        var ans = update_high_score_for_level(this.args.level.level_name, this.args.game_numbers.score, imp_vars.player_data.difficulty_mode)
        this.high_score = ans.high_score
        this.stars = ans.stars
      } else {
        this.stars = get_stars_for_score_on_level(this.args.level.level_name, this.args.game_numbers.score, imp_vars.player_data.difficulty_mode)
        this.high_score = false
      }
      
    } else if(this.args.level.boss_victory){
      if (this.victory) {
        var ans = update_best_time_for_boss_level(this.args.level.level_name, this.args.game_numbers.seconds, imp_vars.player_data.difficulty_mode)
        this.best_time = ans.best_time
        this.stars = ans.stars  
      } else {
        this.best_time = false
        this.stars = 0
      }
      
    }
  }

  var rating = calculate_current_rating()
  if(rating > this.hive_numbers.original_rating) {
    this.rewards.push({
      type: "rating",
      data: {
        diff: rating - this.hive_numbers.original_rating,
        new_rating: rating
      }
    })
  }
  if(imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.hive_numbers.world] && imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.hive_numbers.world]["first_victory"]) {
    this.rewards.push({
      type: "world_victory",
      data: this.hive_numbers.world
    })
    imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.hive_numbers.world]["first_victory"] = false
  }
  if(calculate_lives(this.hive_numbers.original_rating) < calculate_lives()) {
    var diff = calculate_lives() - calculate_lives(this.hive_numbers.original_rating)
    var new_lives = calculate_lives()
    this.rewards.push({
      type: "lives",
      data: {
        diff: diff,
        new_lives: new_lives
      }
    })
  }

  if(calculate_ult(this.hive_numbers.original_rating) < calculate_ult()) {
    var diff = calculate_ult() - calculate_ult(this.hive_numbers.original_rating)
    var new_ult = calculate_ult()
    this.rewards.push({
      type: "ult",
      data: {
        diff: diff,
        new_ult: new_ult
      }
    })
    if(new_ult == 1)  {
      this.to_tutorial = true
    }
  }

  if(calculate_spark_val(this.hive_numbers.original_rating) < calculate_spark_val()) {
    var diff = calculate_spark_val() - calculate_spark_val(this.hive_numbers.original_rating)
    var new_spark_val = calculate_spark_val()
    this.rewards.push({
      type: "spark_val",
      data: {
        diff: diff,
        new_spark_val: new_spark_val
      }
    })
  }
}

RewardGameState.prototype.on_key_down = function(keyCode) {
  if(this.transition_state=="none" && this.rewards[this.cur_reward_index].type != "select_difficulty") {
    this.transition_state="out";
    this.transition_timer = this.transition_interval
  }  
}

RewardGameState.prototype.on_click = function(x, y) {
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
  if (this.rewards[this.cur_reward_index].type == "select_difficulty") {
    this.normal_mode_button.on_mouse_move(x, y)
    this.challenge_mode_button.on_mouse_move(x, y)
  }
}
