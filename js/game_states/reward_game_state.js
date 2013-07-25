RewardGameState.prototype = new GameState

RewardGameState.prototype.constructor = RewardGameState



function RewardGameState(hive_numbers) {
  this.hive_numbers = hive_numbers
  this.rewards = []
  this.determine_rewards()
  this.cur_reward_index = 0
  this.transition_interval = 250
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.bg_drawn = false

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
      
      drawSprite(ctx, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 50 , 0, 60, 60, "ultimate_icon")
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

    ctx.font = "20px Muli"
    ctx.fillText("PRESS ANY KEY TO CONTINUE", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)
    ctx.restore()

}

RewardGameState.prototype.process = function(dt) {

  if(this.rewards.length == 0) {
      switch_game_state(new TitleState(true))
  }
  this.transition_timer -= dt;
  if(this.transition_timer < 0) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
    }
    if(this.transition_state == "out") {
      this.cur_reward_index += 1
      if(this.cur_reward_index >= this.rewards.length) {
        switch_game_state(new TitleState(true))
      } else {
        this.transition_state="in";
        this.transition_timer = this.transition_interval
      }
      //stuff
    }
  }

}

RewardGameState.prototype.determine_rewards = function() {
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

  if(this.transition_state=="none") {
    this.transition_state="out";
    this.transition_timer = this.transition_interval
  }
  
}