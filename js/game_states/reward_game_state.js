RewardGameState.prototype = new GameState

RewardGameState.prototype.constructor = RewardGameState



function RewardGameState(hive_numbers, main_game, args) {
  this.hive_numbers = hive_numbers
  this.main_game = main_game
  this.args = args
  this.rewards = []
  this.determine_rewards()
  this.cur_reward_index = 0
  this.transition_interval = 250
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.bg_drawn = false
  this.ult_num_pages = 7
  this.ult_cur_page = 0

  this.text_width = 500
  this.pages = ["use ultimate","ULTIMATE IS A WEAPON OF LAST RESORT",
  "ULTIMATE WILL BLOW AWAY all enemies # in a moderate distance around you",
  "Enemies killed by ultimate do not give points",
  "while ultimate is active, # you will temporarily become much heavier",
  "you have a limited number of # ultimates per continue # (currently 1)",
  "If you die after using ultimate, # it is refunded"
  ]

}

RewardGameState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "#080808"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }



    if(this.rewards.length == 0) return
    ctx.save()
    if(this.transition_state == "in") {
      var prog = (this.transition_timer/this.transition_interval);
      ctx.globalAlpha = 1 - prog
    } else if(this.transition_state == "out") {
      var prog = (this.transition_timer/this.transition_interval);
      ctx.globalAlpha = Math.max(0, prog)
    }
    var cur_reward = this.rewards[this.cur_reward_index]

    if(cur_reward.type == "world_victory") {
        draw_tessellation_sign(ctx, cur_reward.data +1, imp_vars.levelWidth/2, imp_vars.levelHeight/2, 150)
        ctx.fillStyle = impulse_colors["world "+(cur_reward.data+1)+ " bright"]
        ctx.textAlign = "center"
        ctx.font = "24px Muli"
        ctx.fillText("YOU HAVE UNLOCKED", imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 30)
        ctx.font = "48px Muli"
        ctx.fillText("HIVE "+imp_params.tessellation_names[cur_reward.data+1], imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 30)
    }

    if(cur_reward.type == "rating") {
        ctx.globalAlpha *= 0.5
        draw_tessellation_sign(ctx, 0, imp_vars.levelWidth/2, imp_vars.levelHeight/2, 150)
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.globalAlpha *= 2

        ctx.font = "24px Muli"
        ctx.fillText("YOUR RATING HAS INCREASED!", imp_vars.levelWidth/2, imp_vars.levelHeight/2)
        ctx.font = "72px Muli"
        ctx.fillText("+"+cur_reward.data, imp_vars.levelWidth/2, imp_vars.levelHeight/2+100)
    }
    if(cur_reward.type == "lives") {
      ctx.globalAlpha *= 0.5
      draw_tessellation_sign(ctx, 0, imp_vars.levelWidth/2, imp_vars.levelHeight/2, 150)
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.globalAlpha *= 2
      ctx.font = "24px Muli"
      ctx.fillText("YOU HAVE EARNED AN UPGRADE!", imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 200)

      ctx.font = "24px Muli"
      ctx.fillText("EXTRA LIFE", imp_vars.levelWidth/2, imp_vars.levelHeight/2)  
      
      drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 50 , 0, 60, 60, "lives_icon")
      ctx.font = "72px Muli"
      ctx.fillText(cur_reward.data.new_lives, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 150)
      
    }
    if(cur_reward.type == "ult") {
      ctx.globalAlpha *= 0.5
      draw_tessellation_sign(ctx, 0, imp_vars.levelWidth/2, imp_vars.levelHeight/2, 150)
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.globalAlpha *= 2
      ctx.font = "24px Muli"
      ctx.fillText("YOU HAVE EARNED AN UPGRADE!", imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 200)

      ctx.font = "24px Muli"
      ctx.fillText("EXTRA ULTIMATE", imp_vars.levelWidth/2, imp_vars.levelHeight/2)  
      
      drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 50 , 0, 35, 35, "lives_icon")
      drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 50 , 0, 150, 150, "ultimate_icon")
      ctx.font = "72px Muli"
      ctx.fillText(cur_reward.data.new_ult, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 150)
    }

    if(cur_reward.type == "spark_val") {
      ctx.globalAlpha *= 0.5
      draw_tessellation_sign(ctx, 0, imp_vars.levelWidth/2, imp_vars.levelHeight/2, 150)
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.globalAlpha *= 2

      ctx.font = "24px Muli"
      ctx.fillText("YOU HAVE EARNED AN UPGRADE!", imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 200)

      ctx.font = "24px Muli"
      ctx.fillText("BRIGHTER SPARKS", imp_vars.levelWidth/2, imp_vars.levelHeight/2)  
      
      drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 50 , 0, 60, 60, "spark")
      ctx.font = "72px Muli"
      ctx.fillText("+"+cur_reward.data.new_spark_val, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 150)
    }

    if(cur_reward.type == "ult_tutorial") {
      if(this.current_lines == null) {
        this.current_lines = getLines(ctx, this.pages[this.ult_cur_page].toUpperCase(), this.text_width, '20px Muli')
      }

      ctx.globalAlpha *= 0.3
      draw_tessellation_sign(ctx, 0, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 100, 100)
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.globalAlpha /= 0.3
      ctx.font = "24px Muli"
      ctx.fillText("ULTIMATE TUTORIAL", imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 200)

      drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 100 , 0, 35, 35, "lives_icon")
      drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 100 , 0, 150, 150, "ultimate_icon")

      
      

      draw_arrow(ctx, imp_vars.levelWidth/2 - 300, 420, 20, "left", "white")
      draw_arrow(ctx, imp_vars.levelWidth/2 + 300, 420, 20, "right", "white")
      ctx.font = '10px Muli'
      ctx.fillStyle = this.color
      ctx.fillText("NEXT", imp_vars.levelWidth/2 + 302, 450)
      ctx.fillText("PREV", imp_vars.levelWidth/2 - 302, 450)

      ctx.font = '20px Muli'

      if(this.ult_cur_page == 0) {
        if(imp_vars.player_data.options.control_scheme == "mouse") {
          draw_right_mouse(ctx, imp_vars.levelWidth/2, 370, 83, 125, "white")
        } else {
          draw_rounded_rect(ctx, imp_vars.levelWidth/2, 400, 55, 55, 10, "white")
          ctx.fillText("E", imp_vars.levelWidth/2, 406)
        }
        for(var i = 0; i < this.current_lines.length; i++) {
          var offset = i - (this.current_lines.length-1)/2
          ctx.fillText(this.current_lines[i], imp_vars.levelWidth/2, 467 + 25 * offset)
        }

      } else {
        for(var i = 0; i < this.current_lines.length; i++) {
          var offset = i - (this.current_lines.length-1)/2
          ctx.fillText(this.current_lines[i], imp_vars.levelWidth/2, 427 + 25 * offset)
        }
      }

      for(var i = 0; i < this.ult_num_pages; i++) {
        var offset = (this.ult_num_pages - 1)/2 - i
        ctx.beginPath()
        ctx.shadowBlur = 5
        ctx.arc(imp_vars.levelWidth/2 - 25 * offset, 515, 4, 0, 2*Math.PI, true)
        ctx.fillStyle = this.color
        if(this.ult_cur_page == i) {
          ctx.fillStyle = "white"
          ctx.shadowColor = ctx.fillStyle
          ctx.fill()
        } else {
          ctx.globalAlpha /= 2.5
          ctx.shadowColor = ctx.fillStyle
          ctx.fill()
          ctx.globalAlpha *= 2.5
        }

      }

    }

    if(cur_reward.type == "ult_tutorial_notice") {
        ctx.globalAlpha *= 0.3
        draw_tessellation_sign(ctx, 0, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 100, 100)
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.globalAlpha /= 0.3
        ctx.font = "24px Muli"
        ctx.fillText("ULTIMATE TUTORIAL", imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 200)

        drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 100 , 0, 35, 35, "lives_icon")
        drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 100 , 0, 150, 150, "ultimate_icon")
        
        ctx.font = "20px Muli"
        ctx.fillText("INFO ABOUT THE ULTIMATE HAS BEEN ADDED", imp_vars.levelWidth/2, 425)
        ctx.fillText("TO THE MAIN TUTORIAL", imp_vars.levelWidth/2, 455)
         
    }

    if(cur_reward.type != "ult_tutorial") {
      ctx.font = "20px Muli"
      ctx.fillText("PRESS ANY KEY TO CONTINUE", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)
      ctx.restore()  
    } else {
      ctx.font = "20px Muli"
      ctx.fillText("PRESS ENTER TO CONTINUE", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)
      ctx.restore()  
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
      this.cur_reward_index += 1
      if(this.cur_reward_index >= this.rewards.length) {
        this.advance_game_state()
      } else {
        this.transition_state="in";
        this.transition_timer = this.transition_interval
      }
    }
  }

}

RewardGameState.prototype.advance_game_state = function() {
  if(this.main_game)
      switch_game_state(new TitleState(true))
    else {
      switch_game_state(new GameOverState(this.args.game_numbers, this.args.level, this.args.world_num, this.args.visibility_graph, {
        best_time: this.best_time,
        high_score: this.high_score,
        stars: this.stars
      }))
    }

}

RewardGameState.prototype.determine_rewards = function() {

  if(!this.main_game) {
    if(!this.args.level.is_boss_level) {
      var ans = update_high_score_for_level(this.args.level.level_name, this.args.game_numbers.score, imp_vars.player_data.difficulty_mode)
      this.high_score = ans.high_score
      this.stars = ans.stars
      
    } else if(this.args.level.boss_victory){
      var ans = update_best_time_for_boss_level(this.args.level.level_name, this.args.game_numbers.seconds, imp_vars.player_data.difficulty_mode)
      this.best_time = ans.best_time
      this.stars = ans.stars
    }
  }

  var rating = calculate_current_rating()
  if(rating > this.hive_numbers.original_rating) {
    this.rewards.push({
      type: "rating",
      data: rating - this.hive_numbers.original_rating 
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
      this.rewards.push({
        type: "ult_tutorial"
      })
      this.rewards.push({
        type: "ult_tutorial_notice"
      })
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
  if(this.rewards[this.cur_reward_index].type != "ult_tutorial") {
    if(this.transition_state=="none") {
      this.transition_state="out";
      this.transition_timer = this.transition_interval
    }  
  } else if(keyCode == 13) {
    if(this.transition_state=="none") {
      this.transition_state="out";
      this.transition_timer = this.transition_interval
    }  
  }
  
  
}

RewardGameState.prototype.on_click = function(x, y) {
  if(x < imp_vars.levelWidth/2 - this.text_width/2) {
    this.set_page(this.ult_cur_page - 1)
  } else if(x > imp_vars.levelWidth/2 + this.text_width/2) {
    this.set_page(this.ult_cur_page + 1)
  }

  if(y > 500 && y < 530) {
    var index = Math.round((this.ult_num_pages-1)/2 - (imp_vars.levelWidth/2 - x)/25)

    if(index >= 0 && index < this.ult_num_pages)
      this.set_page(index)
  }
}

RewardGameState.prototype.set_page = function(page) {
  this.ult_cur_page = page
  if(this.ult_cur_page < 0) {
    this.ult_cur_page += this.ult_num_pages
  }
  if(this.ult_cur_page >= this.ult_num_pages) {
    this.ult_cur_page -= this.ult_num_pages
  }
  this.current_lines = null
}