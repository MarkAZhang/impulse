HowToPlayState.prototype = new ImpulseGameState

HowToPlayState.prototype.constructor = HowToPlayState

function HowToPlayState(mode) {
  this.level_name = "HOW TO PLAY"
  this.init(0, null, null, true, this.hive_numbers, false)
  this.mode = mode
  this.ready = false
  this.level = this.load_level(imp_params.impulse_level_data["HOW TO PLAY"])
  this.level.no_spawn = true
  this.slide_num = 0
  this.hive_numbers = new HiveNumbers(0, false)
  this.advancing = false
  this.advance_page_timer = 0
  this.delay_after_player_moved = 100
  this.delay_during_player_dying_page = 750
  this.title_screen_delay = 3000
  this.transition_interval = 500
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.cur_rating = calculate_current_rating()
}

HowToPlayState.prototype.load_level = LoaderGameState.prototype.load_level

HowToPlayState.prototype.load_complete = function() {
  this.ready = true
  this.level.impulse_game_state = this
  this.level.reset() //we re-use the level
  this.level_name = this.level.level_name
  this.is_boss_level = false
  this.make_player()
  imp_vars.bg_canvas.setAttribute("style", "display:none")
  imp_vars.bg_ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
  this.level.draw_bg(imp_vars.bg_ctx)
  imp_vars.bg_ctx.translate(-imp_vars.sidebarWidth, 0)

  imp_vars.impulse_music.play_bg(imp_params.songs["Interlude"])

  this.color = this.is_boss_level ? impulse_colors["boss "+this.world_num] : impulse_colors["world "+this.world_num+" lite"]
  this.dark_color = impulse_colors["world "+this.world_num +" dark"];
  this.lite_color = impulse_colors["world "+this.world_num +" lite"];
  this.bright_color = impulse_colors["world "+this.world_num +" bright"];
  this.num_pages = 12
  if (this.mode == "normal_tutorial") {
    this.cur_page = 0
  } else if (this.mode == "first_time_tutorial") {
    this.cur_page = -1
    this.advance_page_timer = this.title_screen_delay
    this.advancing = true
  } else if (this.mode == "ult_tutorial") {
    this.cur_page = 0
    this.advance_page_timer = this.title_screen_delay * 0.5
    this.advancing = true
  }

  this.temp_fragments = null
  this.primary_picture = null
  this.secondary_picture = null

  this.primary_canvas = document.createElement('canvas');
  this.primary_canvas.width = 150
  this.primary_canvas.height = 150
  this.primary_ctx = this.primary_canvas.getContext('2d');

  this.secondary_canvas = document.createElement('canvas');
  this.secondary_canvas.width = 150
  this.secondary_canvas.height = 150
  this.secondary_ctx = this.  secondary_canvas.getContext('2d');

  this.score_colors = ["white", 'silver', 'gold']
  this.score_names = ['GATEWAY SCORE', "SILVER SCORE", "GOLD SCORE"]
  this.score_rewards = ['(UNLOCKS NEXT LEVEL)', "(+1 LIFE)", "(5 LIVES OR +1 LIFE)"]
  this.star_colors =  ["white", "silver", "gold"]

  var _this = this
  /* this.special_buttons = []
  this.easy_mode_button = new SmallButton("NORMAL MODE", 20, imp_vars.levelWidth/2-100, 390, 200, 50, "white", "blue", function(){_this.change_mode("easy")})
  this.special_buttons.push(this.easy_mode_button)
  this.normal_mode_button = new SmallButton("CHALLENGE MODE", 20, imp_vars.levelWidth/2+100, 390, 200, 50, "white", "blue",function(){_this.change_mode("normal")})
  this.special_buttons.push(this.normal_mode_button) */

  this.exit_button = new IconButton("EXIT TUTORIAL", 20, 400, 440, 125, 85, this.lite_color, "white", function(){
    _this.exit_tutorial = true
  }, "quit")

  //this.set_difficulty_button_underline();

  this.has_ult = has_ult()
  this.ult_num = calculate_ult()
  this.ult_page_offset = this.has_ult ? 2 : 0
  this.num_pages += this.ult_page_offset

  if (this.has_ult) {
    this.hive_numbers.ultimates = 99
  }
}

HowToPlayState.prototype.change_mode = function(type) {
  imp_vars.player_data.difficulty_mode = type;
  save_game();
  //this.set_difficulty_button_underline();
}


/*HowToPlayState.prototype.set_difficulty_button_underline = function() {
  this.easy_mode_button.underline = (imp_vars.player_data.difficulty_mode == "easy");
  this.normal_mode_button.underline = (imp_vars.player_data.difficulty_mode == "normal");
}*/

HowToPlayState.prototype.additional_processing = function(dt) {
  if(this.pause || this.zoom != 1) return

  this.player.bulk(1000)
  if (this.advancing) {
    if (this.advance_page_timer <= 0) {
      this.advancing = false
      this.transition_state="out";
      this.transition_timer = this.transition_interval
    } else {
      this.advance_page_timer -= dt
    }
  } 

  this.transition_timer -= dt;
  if(this.transition_timer < 0 && this.transition_state != "none" && this.zoom == 1) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
    }
    else if(this.transition_state == "out") {
      this.setPage(this.cur_page + 1)
     
      if (this.cur_page == 2 && this.mode == "ult_tutorial") {
        this.exit_button.y = 550
      }
      this.transition_state="in";
      this.transition_timer = this.transition_interval
    }
  }
}

HowToPlayState.prototype.additional_draw = function(ctx, bg_ctx) {
  if(this.zoom != 1) {
    return
  }
  ctx.save()
  ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
  if(this.transition_state == "in") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = 1 - prog
  } else if(this.transition_state == "out") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = Math.max(0, prog)
  }

  if(this.mode == "first_time_tutorial") {
    
    ctx.font = '24px Muli'
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    if(this.cur_page == -1) {
      draw_logo(ctx, 400, 380, "MARK ZHANG")
      /*ctx.font = '72px Muli'
      ctx.shadowColor = impulse_colors["impulse_blue"]
      ctx.shadowBlur = 20
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("IMPULSE", 400, 420)*/
      ctx.font = '24px Muli'
      ctx.fillText("INTRO TUTORIAL", 400, 500)
      ctx.font = '18px Muli'
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("PRESS Q TO PAUSE AND QUIT", 400, 535)
    }

    if(this.cur_page == 0) {
       if(imp_vars.player_data.options.control_hand == "right") {
          draw_arrow_keys(ctx, 400, 430, 60, "white", ["W", "A", "S", "D"])
        }
        if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
          draw_arrow_keys(ctx, 400, 430, 60, "white")
        }

      ctx.fillText("MOVE", 400, 500)
    }

    if(this.cur_page == 1) {
      if(imp_vars.player_data.options.control_scheme == "mouse") {
        draw_mouse(ctx, 400, 400, 83, 125, "white")
      } else {
        draw_arrow_keys(ctx, 400, 430, 60, "white")
      }
      ctx.fillText("IMPULSE", 400, 500)
      ctx.save()
      ctx.globalAlpha *= 0.5
      ctx.font = '12px Muli'
      ctx.fillText("HOLD MOUSE TO CONTINUOUSLY IMPULSE", 400, 550)
      ctx.restore()
    }

    if(this.cur_page == 2) {
      this.draw_player_dying_page(ctx)
    }

    if(this.cur_page == 3) {
      this.draw_enemies_dying_page(ctx)
    }

    if (this.cur_page == 4) {
      this.draw_score_points_page(ctx)
    }

    if (this.cur_page == 5) {
      this.draw_multiplier_page(ctx)
    }
    if (this.cur_page == 6) {
      this.draw_multiplier_page_two(ctx)
    }

    if (this.cur_page == 7) {
      this.draw_sparks_page(ctx)
    }

    if (this.cur_page == 8) {
      this.draw_score_points_page(ctx)
    }

    if (this.cur_page == 9) {
      this.draw_enter_gateway_page(ctx)
    }

    if([2, 5, 6, 7].indexOf(this.cur_page) != -1) {
      ctx.save()
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.globalAlpha *= Math.min(1, 1.5 * this.get_flashing_prop())
      ctx.font = "16px Muli"
      ctx.fillText("PRESS SPACEBAR TO CONTINUE", 400, 580)
      ctx.restore()
    } else if (this.cur_page == 0) {
      ctx.save()
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.globalAlpha *= Math.min(1, 1.5 * this.get_flashing_prop())
      ctx.font = "16px Muli"
      ctx.fillText("TRY MOVING NOW", 400, 580)
      ctx.restore()
    } else if (this.cur_page == 1) {
      ctx.save()
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.globalAlpha *= Math.min(1, 1.5 * this.get_flashing_prop())
      ctx.font = "16px Muli"
      ctx.fillText("TRY IMPULSING NOW", 400, 580)
      ctx.restore()
    } else if (this.cur_page == 3) {
      ctx.save()
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.globalAlpha *= Math.min(1, 1.5 * this.get_flashing_prop())
      ctx.font = "16px Muli"
      ctx.fillText("TRY KILLING AN ENEMY NOW", 400, 580)
      ctx.restore()
    } else if (this.cur_page == 4 || this.cur_page == 8) {
      ctx.save()
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.globalAlpha *= Math.min(1, 1.5 * this.get_flashing_prop())
      ctx.font = "16px Muli"
      ctx.fillText("GET THE GATEWAY SCORE", 400, 580)
      ctx.restore()
    }
  }

  if (this.mode == "normal_tutorial") {
    ctx.font = '20px Muli'
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    if(this.cur_page == 0) {
      draw_logo(ctx, 400, 380, "MARK ZHANG")
      /*ctx.font = '72px Muli'
      ctx.shadowColor = impulse_colors["impulse_blue"]
      ctx.shadowBlur = 20
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("IMPULSE", 400, 420)*/
      ctx.font = '24px Muli'
      ctx.fillStyle = "white"
      ctx.fillText("TUTORIAL", 400, 500)
    }

    if(this.cur_page == 1) {

      if(imp_vars.player_data.options.control_hand == "right") {
        draw_arrow_keys(ctx, 400, 430, 60, "white", ["W", "A", "S", "D"])
      }
      if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
        draw_arrow_keys(ctx, 400, 430, 60, "white")
      }
      ctx.fillText("MOVE", 400, 500)
      ctx.globalAlpha *= 0.5
      ctx.font = '12px Muli'
      ctx.fillStyle = "white"
      ctx.fillText("ALTERNATE CONTROLS AVAILABLE IN PAUSE MENU", 400, 550)
    }

    if(this.cur_page == 2) {
      ctx.font = "20px Muli"
      if(imp_vars.player_data.options.control_scheme == "mouse") {
        draw_mouse(ctx, 400, 400, 83, 125, "white")
      } else {
        draw_arrow_keys(ctx, 400, 430, 60, "white")
      }
      ctx.fillText("USE IMPULSE", 400, 500)
      ctx.globalAlpha *= 0.5
      ctx.font = '12px Muli'
      ctx.fillText("HOLD MOUSE TO CONTINUOUSLY IMPULSE", 400, 550)

    }

    if(this.cur_page == 3) {
      this.draw_player_dying_page(ctx)
    }

     if(this.cur_page == 4) {
      this.draw_enemies_dying_page(ctx)
    }

    if(this.cur_page == 5) {
      for(var i = 0; i < 3; i++) {
        ctx.font = '24px Muli';
        ctx.textAlign = "right"
        ctx.fillStyle = impulse_colors[this.score_colors[i]]
        ctx.shadowColor = ctx.fillStyle
        ctx.font = '25px Muli';
        ctx.fillText(imp_params.impulse_level_data["HOW TO PLAY"].cutoff_scores[imp_vars.player_data.difficulty_mode][i], 600, 330 + 40 * i + 7)
        ctx.textAlign = "left"
        ctx.font = '20px Muli';
        ctx.fillText(this.score_names[i], 200, 330 + 40 * i)
        ctx.font = '12px Muli'
        ctx.fillText(this.score_rewards[i], 200, 330 + 40 * i+15)
      }

      ctx.beginPath()
      ctx.rect(190, 308, 420, 45)
      ctx.strokeStyle = "red"
      ctx.lineWidth = 8
      ctx.stroke()

      ctx.beginPath()
      ctx.rect(825, 515, 150, 80)
      ctx.strokeStyle = "red"
      ctx.lineWidth = 6
      ctx.stroke()

      ctx.font = '20px Muli'
      ctx.textAlign = "center"
      ctx.fillStyle = "white"
      ctx.fillText("GET THE GATEWAY SCORE...", 400, 500)
      ctx.shadowColor = "red"
      ctx.fillStyle = "red"
    }

    if(this.cur_page == 6) {
      this.draw_enter_gateway_page(ctx)
    }

    if(this.cur_page == 7 + this.ult_page_offset) {
      this.draw_multiplier_page(ctx)
    }

    if(this.cur_page == 8 + this.ult_page_offset) {
      this.draw_multiplier_page_two(ctx)
    }

    if(this.cur_page == 9 + this.ult_page_offset) {

      this.draw_sparks_page(ctx) 
    }
    if(this.has_ult) {

      ctx.fillStyle = "white"
      ctx.textAlign = 'center'
      if(this.cur_page == 7) {
        this.draw_first_ult_page(ctx)
      }    
      if(this.cur_page == 8) {
       
        this.draw_second_ult_page(ctx)
      }    
    }

    if(this.cur_page == 10 + this.ult_page_offset) {
      ctx.font = '20px Muli'
      ctx.fillStyle = "white"
      if(imp_vars.player_data.options.control_hand == "right") {
        draw_rounded_rect(ctx, 250, 406, 55, 55, 10, "white")
        ctx.fillText("Q", 250, 412)  
      } else if(imp_vars.player_data.options.control_hand == "left") {
        draw_rounded_rect(ctx, 250, 406, 125, 55, 10, "white")
        ctx.fillText("ENTER", 250, 412)  
      }
      
      draw_rounded_rect(ctx, 400, 406, 55, 55, 10, "white")
      ctx.fillText("X", 400, 412)
      draw_rounded_rect(ctx, 550, 406, 55, 55, 10, "white")
      ctx.fillText("C", 550, 412)
      ctx.font = '16px Muli'
      ctx.fillText("PAUSE", 250, 462)
      ctx.fillText("MUTE MUSIC", 400, 462)
      ctx.fillText("FULLSCREEN", 550, 462)
      ctx.font = '12px Muli'
      ctx.fillText("ENEMY INFO AND GAME OPTIONS IN THE PAUSE MENU", 400, 530)
    }

    
     if(this.cur_page == 11 + this.ult_page_offset) {

      this.exit_button.draw(ctx)
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.font = '16px Muli'
      ctx.fillText("THANKS FOR PLAYING IMPULSE!", 400, 335)
      ctx.font = '12px Muli'
      ctx.fillText("- MARK -", 400, 360)
    }

    ctx.globalAlpha = 1

    if(this.cur_page > 0) {
      draw_arrow(ctx, 100, 420, 20, "left", "white")
      ctx.font = '10px Muli'
      ctx.fillStyle = "white"
      ctx.fillText("BACK", 98, 450)
    }
    if(this.cur_page < this.num_pages - 1) {
      draw_arrow(ctx, 700, 420, 20, "right", "white")
      ctx.font = '10px Muli'
      ctx.fillStyle = "white"
      ctx.fillText("NEXT", 702, 450)
    }

    for(var i = 0; i < this.num_pages; i++) {
      var offset = (this.num_pages-1)/2 - i
      ctx.beginPath()
      //ctx.shadowBlur = 5
      ctx.arc(400 - 25 * offset, 580, 4, 0, 2*Math.PI, true)
      ctx.fillStyle = "white"
      if(this.cur_page == i) {
        ctx.fillStyle = "white"
        ctx.shadowColor = ctx.fillStyle
        ctx.fill()
      } else {
        ctx.globalAlpha /= 5
        ctx.shadowColor = ctx.fillStyle
        ctx.fill()
        ctx.globalAlpha *= 5
      }
    }
  } // normal_tutorial

  if (this.mode == "ult_tutorial") {
    ctx.fillStyle = "white"
    ctx.textAlign = 'center'
    if (this.cur_page == 0) {
       draw_logo(ctx, 400, 380, "MARK ZHANG")
      /*ctx.font = '72px Muli'
      ctx.shadowColor = impulse_colors["impulse_blue"]
      ctx.shadowBlur = 20
      ctx.fillStyle = impulse_colors["impulse_blue"]
      ctx.fillText("IMPULSE", 400, 420)*/
      ctx.font = '24px Muli'
      ctx.fillText("ULT TUTORIAL", 400, 500)
    }
    if(this.cur_page == 1) {
      this.draw_first_ult_page(ctx)
    }    
    if(this.cur_page == 2) {
      this.draw_second_ult_page(ctx)
    }    
  }

  ctx.restore()
}

HowToPlayState.prototype.draw_score_points_page = function(ctx) {
  ctx.beginPath()
  ctx.rect(825, 515, 150, 80)
  ctx.strokeStyle = "red"
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.font = '24px Muli'
  ctx.textAlign = "center"
  ctx.fillStyle = "white"
  ctx.fillText("GET THE GATEWAY SCORE TO BEAT THE LEVEL", 400, 420)

  ctx.save()
  ctx.globalAlpha *= this.get_flashing_prop();
  this.draw_arrow_with_base(ctx, 735, 555, 50, "red")
  ctx.restore()

}

HowToPlayState.prototype.draw_arrow_with_base = function(ctx, x, y, size, color, orient) {
  ctx.save()
  if (orient) {
    ctx.translate(x, y);
    if (orient == "left") {
      ctx.rotate(Math.PI);
    }
    if (orient == "up") {
      ctx.rotate(3 * Math.PI/2);
    }
    if (orient == "down") {
      ctx.rotate(Math.PI/2);
    }
    ctx.translate(-x, -y);
  }

  ctx.beginPath()
  ctx.moveTo(x - size/2, y)
  // This is some random number that doesn't cause the arrow stem to overlap with the head.
  ctx.lineTo(x + size * 0.355, y)
  ctx.lineWidth = size/5
  ctx.strokeStyle = color
  ctx.stroke()
  draw_arrow(ctx, x + size/2, y, size * 0.6, "right", color, false)
  ctx.restore();
}

HowToPlayState.prototype.draw_multiplier_page = function(ctx) {
  
  ctx.font = '24px Muli'
  ctx.fillStyle = "white"
  ctx.fillText("YOUR MULTIPLIER INCREASES THE POINTS", 400, 340)
  ctx.fillText("YOU GET FROM KILLING ENEMIES", 400, 375)

  
  var y_value = 450

  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.font = '48px Muli'  
  ctx.fillText('100', 250, y_value)

  ctx.fillStyle = "white"
  ctx.font = '12px Muli'
  ctx.fillText('BASE POINT VALUE', 250, y_value + 30)
  ctx.fillText('OF ENEMY', 250, y_value + 50)

  this.draw_arrow_with_base(ctx, 325, y_value - 15, 30, "white")

  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.font = '48px Muli'
  ctx.textAlign = 'center'
  ctx.fillText('x5', 400, y_value)
  ctx.fillStyle = "white"
  ctx.font = '12px Muli'
  ctx.fillText("YOUR CURRENT", 400, y_value + 30)
  ctx.fillText("MULTIPLIER", 400, y_value + 50)

  this.draw_arrow_with_base(ctx, 475, y_value - 15, 30, "white")

  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.font = '48px Muli'
  ctx.fillText('+500', 565, y_value)
  ctx.fillStyle = "white"
  ctx.font = '12px Muli'
  ctx.fillText("TOTAL POINTS", 565, y_value + 30)
  ctx.fillText("GAINED", 565, y_value + 50)

  // Mark the multiplier.
  ctx.beginPath()
  ctx.rect(825, 225, 150, 100)
  ctx.strokeStyle = "red"
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.save();
  ctx.globalAlpha *= this.get_flashing_prop();
  this.draw_arrow_with_base(ctx, 735, 280, 50, "red")
  ctx.restore();
}

HowToPlayState.prototype.draw_multiplier_page_two = function(ctx) {

  ctx.fillStyle = "white"
  ctx.font = '16px Muli'
  ctx.fillText("KILLING ENEMIES", 250, 360)
  ctx.fillStyle = impulse_colors["impulse_blue"]  
  ctx.font = '36px Muli'
  ctx.fillText("INCREASES", 250, 400)
  ctx.fillStyle = "white"
  ctx.font = '16px Muli'
  ctx.fillText("YOUR MULTIPLIER", 250, 430)

  
  ctx.fillText("TOUCHING ENEMIES", 550, 360)
  ctx.fillStyle = "red"
  ctx.font = '36px Muli'
  ctx.fillText("RESETS", 550, 400)
  ctx.fillStyle = "white"
  ctx.font = '16px Muli'
  ctx.fillText("YOUR MULTIPLIER", 550, 430)

  /* ctx.font = '20px Muli'
  ctx.fillStyle = "white"
  ctx.fillText("KILLING ENEMIES INCREASES YOUR MULTIPLIER", 400, 400)
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.clearRect(335, 380, 125, 25)
  ctx.fillText("INCREASES", 397, 400)

  ctx.fillStyle = "white"
  ctx.fillText("COLLIDING WITH ENEMIES RESETS YOUR MULTIPLIER", 400, 450)
  ctx.fillStyle = "red"
  ctx.clearRect(410, 430, 80, 25)
  ctx.fillText("RESETS", 450, 450)

  ctx.beginPath()
  ctx.arc(imp_vars.canvasWidth - imp_vars.sidebarWidth*3/2, imp_vars.canvasHeight/2 - 20, 70, 0, 2 * Math.PI)
  ctx.lineWidth = 8
  ctx.strokeStyle = 'red'
  ctx.stroke() */


  ctx.fillStyle = "white"
  ctx.save()
  ctx.globalAlpha *= 0.5
  ctx.font = '12px Muli'
  ctx.fillText("MULTIPLIER PERMANENTLY +1 EVERY 10 SECONDS", 400, 500)
  ctx.restore()
}

HowToPlayState.prototype.draw_sparks_page = function(ctx) {
  ctx.beginPath()
  ctx.arc(this.level.spark_loc.x, this.level.spark_loc.y, 25, 0, 2 * Math.PI)
  ctx.lineWidth = 4
  ctx.strokeStyle = 'red'
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(this.level.multi_loc.x, this.level.multi_loc.y, 25, 0, 2 * Math.PI)
  ctx.stroke()

  draw_spark(ctx, 300, 440)
  ctx.font = '16px Muli'
  //ctx.shadowColor = impulse_colors["impulse_blue"]
  //ctx.shadowBlur = 10
  ctx.fillStyle = impulse_colors["impulse_blue"]


  ctx.fillText("+10 SPARKS", 300, 475)
  //ctx.shadowBlur = 0
  draw_multi(ctx, 500, 440)
  ctx.font = '16px Muli'
  //ctx.shadowBlur = 10
  //ctx.shadowColor = "white"
  ctx.fillStyle = "white"

  ctx.fillText("+5 MULTIPLIER", 500, 475)

  ctx.font = '24px Muli'
  //ctx.shadowBlur = 0
  ctx.fillText("POWERUPS", 400, 350)
  /*ctx.font = '24px Muli'
  ctx.shadowColor = "red"
  ctx.fillStyle = "red"
  ctx.clearRect(415, 480, 115, 25)
  ctx.fillText("SPARKS", 458, 500)*/

  ctx.font = '12px Muli'
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.fillText("100 SPARKS = EXTRA LIFE", 300, 495)

  ctx.beginPath()
  ctx.rect(-160, imp_vars.canvasHeight - 140, 120, 80)
  ctx.strokeStyle = "red"
  ctx.lineWidth = 4
  ctx.stroke()
}

HowToPlayState.prototype.draw_first_ult_page = function(ctx) {
  if(imp_vars.player_data.options.control_scheme == "mouse") {
    draw_right_mouse(ctx, 400, 400, 83, 125, "white")
    ctx.font = '20px Muli'
    ctx.fillText("USE ULTIMATE", 400, 500)
  } else {
    draw_rounded_rect(ctx, 400, 400, 55, 55, 10, "white")
    ctx.font = '20px Muli'
    ctx.fillText("E", 400, 406)
    ctx.fillText("USE ULTIMATE", 400, 470)
  }
}

HowToPlayState.prototype.draw_second_ult_page = function(ctx) {
  drawSprite(ctx, 400, 330, 0, 60, 60, "ultimate")
  ctx.font = '16px Muli'
  ctx.textAlign = "center"
  ctx.fillStyle = "white"
  ctx.shadowBlur = 0
  ctx.fillText("YOU GET NO POINTS FOR KILLING ENEMIES WITH YOUR ULTIMATE", 400, 430)
  ctx.fillText("WHILE USING YOUR ULTIMATE, YOU ARE INVINCIBLE", 400, 480)
  if (this.mode == "ult_tutorial")
    this.exit_button.draw(ctx)
}

HowToPlayState.prototype.get_flashing_prop = function() {
  return Math.abs(((new Date()).getTime() % 2000 - 1000) / 1000)

}

HowToPlayState.prototype.draw_enemies_dying_page = function(ctx) {
 ctx.drawImage(this.primary_canvas, 0, 0, 150, 150, 225, 300, 150, 150);
 ctx.drawImage(this.secondary_canvas, 0, 0, 150, 150, 425, 300, 150, 150);

 ctx.save()
 ctx.beginPath()
 ctx.rect(225, 300, 150, 150)
 ctx.rect(425, 300, 150, 150)
 ctx.strokeStyle = "white"
 ctx.lineWidth = 2
 ctx.stroke()
 ctx.restore()
 ctx.shadowBlur = 0

 ctx.beginPath()
 ctx.moveTo(385, 375)
 ctx.lineTo(400, 375)
 ctx.lineWidth = 8
 ctx.strokeStyle = "white"
 ctx.stroke()
 draw_arrow(ctx, 408, 375, 20, "right", "white", false)

 ctx.font = "20px Muli"
 ctx.fillStyle = "white"
 ctx.textAlign = "center"
 ctx.fillText("IMPULSE ENEMIES INTO THE VOID TO KILL THEM", 400, 500)

 // draw circle around first enemy
 if (this.level.enemies.length > 0) {
    ctx.save();
    ctx.globalAlpha *= this.get_flashing_prop();
    ctx.beginPath()
    ctx.arc(this.level.enemies[0].body.GetPosition().x * imp_vars.draw_factor,
            this.level.enemies[0].body.GetPosition().y * imp_vars.draw_factor, 25, 0, 2 * Math.PI)
    ctx.lineWidth = 6
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke()
    ctx.beginPath();
    ctx.moveTo(this.level.enemies[0].body.GetPosition().x * imp_vars.draw_factor,
      this.level.enemies[0].body.GetPosition().y * imp_vars.draw_factor - 25);
    ctx.lineTo(this.level.enemies[0].body.GetPosition().x * imp_vars.draw_factor,
      66);
    ctx.lineWidth = 6
    ctx.stroke();
    draw_arrow(ctx, this.level.enemies[0].body.GetPosition().x * imp_vars.draw_factor, 60, 25, "up", impulse_colors["impulse_blue"], false)
    ctx.restore();
  }
}

HowToPlayState.prototype.draw_player_dying_page = function(ctx) {
  ctx.drawImage(this.primary_canvas, 0, 0, 150, 150, 225, 300, 150, 150);
  ctx.drawImage(this.secondary_canvas, 0, 0, 150, 150, 425, 300, 150, 150);

  ctx.save()
  ctx.beginPath()
  ctx.rect(225, 300, 150, 150)
  ctx.rect(425, 300, 150, 150)
  ctx.strokeStyle = "white"
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.shadowBlur = 0

  this.draw_arrow_with_base(ctx, 400, 375, 25, "white")

  var polygons = imp_params.impulse_level_data["HOW TO PLAY"].obstacle_v

/*
  ctx.beginPath()
  ctx.rect(0, 0, 800, 600)
  ctx.clip()
  for(var i = 0; i < polygons.length; i++) {
    ctx.beginPath()
    ctx.moveTo(polygons[i][0][0], polygons[i][0][1])
    for(var j = 1; j < polygons[i].length; j++) {
      ctx.lineTo(polygons[i][j][0], polygons[i][j][1])
    }
    ctx.closePath()
    ctx.strokeStyle = "red"
    ctx.lineWidth = 4
    ctx.stroke()
  }*/
  ctx.shadowBlur = 0
  ctx.font = "20px Muli"

  ctx.fillText("TOUCHING THE BLACK VOID WILL KILL YOU", 400, 500)

  for ( var i = 0; i < 6; i ++) {

    this.draw_arrow_with_base(ctx, 150 + i * 100, 220, 35,  "red", "down")
    this.draw_arrow_with_base(ctx, 150 + i * 100, 120, 35,  "red", "up")
  }
  //ctx.globalAlpha /= 2
  ctx.restore()
}

HowToPlayState.prototype.draw_enter_gateway_page  = function(ctx) {
  // draw reticle
      draw_arrow(ctx, 355, 170, 25, "right", "red", false)
      draw_arrow(ctx, 445, 170, 25, "left", "red", false)
      draw_arrow(ctx, 400, 125, 25, "down", "red", false)
      draw_arrow(ctx, 400, 215, 25, "up", "red", false)
      ctx.beginPath()
      ctx.arc(400, 170, 50, 0, 2 * Math.PI)
      ctx.lineWidth = 8
      ctx.shadowBlur = 0
      ctx.strokeStyle = 'red'
      ctx.stroke()


      if (this.mode == "first_time_tutorial") {
        ctx.font = '20px Muli'
        ctx.textAlign = "center"
        ctx.fillStyle = "white"
        ctx.shadowBlur = 0
        ctx.fillText("MOVE ONTO THE UNLOCKED GATEWAY", 400, 360)

        ctx.shadowBlur = 0
        ctx.fillText("AND PRESS", 400, 400)
        ctx.fillText("TO ADVANCE TO THE NEXT LEVEL", 400, 510)
        ctx.font = '20px Muli'
        ctx.shadowColor = "red"
        ctx.fillStyle = "red"
      }
      
      if (this.mode == "normal_tutorial") {
        ctx.font = '20px Muli'
        ctx.textAlign = "center"
        ctx.fillStyle = "white"
        ctx.shadowBlur = 0
        ctx.fillText("...THEN MOVE ONTO THE UNLOCKED GATEWAY", 400, 360)

        ctx.shadowBlur = 0
        ctx.fillText("AND PRESS", 400, 400)
        ctx.fillText("TO ADVANCE TO THE NEXT LEVEL", 400, 510)
        ctx.font = '20px Muli'
        ctx.shadowColor = "red"
        ctx.fillStyle = "red"

      }
      
      ctx.fillStyle = "white"
      //ctx.shadowColor = "white"
      //ctx.shadowBlur = 10
      if(imp_vars.player_data.options.control_hand == "right") {
        draw_rounded_rect(ctx, 400, 445, 300, 50, 10, "white")
        ctx.fillText("SPACEBAR", 400, 451)
      }

      if(imp_vars.player_data.options.control_hand == "left") {
        draw_rounded_rect(ctx, 400, 445, 120, 50, 10, "white")
        ctx.fillText("SHIFT", 400, 451)
      }
}

// Draw anything that needs to be on the contexts.
HowToPlayState.prototype.draw_contexts = function() {
  if((this.mode == "normal_tutorial" && this.cur_page == 3) ||
      (this.mode == "first_time_tutorial" && this.cur_page == 2)) {
    this.primary_ctx.clearRect(0, 0, 150, 150)
    this.secondary_ctx.clearRect(0, 0, 150, 150)
    this.draw_picture_bg_on_canvas(this.primary_ctx)
    this.draw_picture_bg_on_canvas(this.secondary_ctx)

    this.draw_arrow_with_base(this.primary_ctx, 30, 110, 35,  "red", "up")
    this.draw_arrow_with_base(this.primary_ctx, 120, 110, 35,  "red", "up")
    this.draw_arrow_with_base(this.secondary_ctx, 30, 110, 35,  "red", "up")
    this.draw_arrow_with_base(this.secondary_ctx, 120, 110, 35,  "red", "up")

    drawSprite(this.primary_ctx, 75, 75, 0, 30, 30, "player_normal")
    this.primary_ctx.beginPath()
    this.primary_ctx.moveTo(75, 55)
    this.primary_ctx.lineTo(75, 40)
    this.primary_ctx.lineWidth = 4
    this.primary_ctx.strokeStyle = impulse_colors["impulse_blue"]
    this.primary_ctx.stroke()
    draw_arrow(this.primary_ctx, 75, 40, 13, "up", impulse_colors["impulse_blue"], false)

    this.temp_fragments.draw(this.secondary_ctx)
  }
  if((this.mode == "normal_tutorial" && this.cur_page == 4) ||
      (this.mode == "first_time_tutorial" && this.cur_page == 3)) {
    this.primary_ctx.clearRect(0, 0, 150, 150)
    this.secondary_ctx.clearRect(0, 0, 150, 150)
    this.draw_picture_bg_on_canvas(this.primary_ctx)
    this.draw_picture_bg_on_canvas(this.secondary_ctx)

    drawSprite(this.primary_ctx, 75, 120, 0, 30, 30, "player_normal")
    this.primary_ctx.beginPath();
    this.primary_ctx.shadowOffsetX = 0;
    this.primary_ctx.shadowOffsetY = 0;
    //this.primary_ctx.shadowBlur = 10;
    //this.primary_ctx.shadowColor = impulse_colors["impulse_blue"];
    this.primary_ctx.lineWidth = 5
    this.primary_ctx.strokeStyle = impulse_colors["impulse_blue"]
    this.primary_ctx.arc(75, 120, 40, 7*Math.PI/6,  11*Math.PI/6);
    this.primary_ctx.shadowBlur = 0
    this.primary_ctx.stroke()
    draw_enemy_real_size(this.primary_ctx, "stunner", 75, 77, 1, Math.PI/2)

    this.primary_ctx.beginPath()
    this.primary_ctx.moveTo(75, 58)
    this.primary_ctx.lineTo(75, 43)
    this.primary_ctx.lineWidth = 4
    this.primary_ctx.strokeStyle = "cyan"
    this.primary_ctx.stroke()
    draw_arrow(this.primary_ctx, 75, 40, 13, "up", "cyan", false)

    drawSprite(this.secondary_ctx, 75, 120, 0, 30, 30, "player_normal")

    this.secondary_ctx.globalAlpha = 0.5
    this.secondary_ctx.globalAlpha = 1
    this.secondary_ctx.beginPath();
    this.secondary_ctx.shadowOffsetX = 0;
    this.secondary_ctx.shadowOffsetY = 0;
    //this.secondary_ctx.shadowBlur = 10;
    //this.secondary_ctx.shadowColor = impulse_colors["impulse_blue"];
    this.secondary_ctx.lineWidth = 5
    this.secondary_ctx.strokeStyle = this.secondary_ctx.shadowColor
    this.secondary_ctx.arc(75, 120, 50, 7*Math.PI/6,  11*Math.PI/6);
    this.secondary_ctx.shadowBlur = 0
    this.secondary_ctx.stroke()
    this.temp_fragments.draw(this.secondary_ctx)
  }

}

HowToPlayState.prototype.draw_picture_bg_on_canvas = function(ctx) {
  var boundary_y = 75
  ctx.save()
  
  ctx.beginPath()
  ctx.rect(0, 0, 150, boundary_y)
  ctx.fillStyle = this.dark_color
  ctx.fill()
  draw_bg(ctx, 0, boundary_y, 150, 150, "Hive 0") 
  ctx.beginPath()
  ctx.moveTo(0, boundary_y)
  ctx.lineTo(150, boundary_y)
  ctx.lineWidth = 6
  ctx.strokeStyle = impulse_colors['world 0 lite']
  ctx.stroke()
  
  ctx.restore()
}

HowToPlayState.prototype.on_mouse_move = function(x, y) {
  if(!this.pause && this.ready && this.zoom == 1) {
    if (this.mode == "normal_tutorial") {
      if(this.cur_page == this.num_pages - 1) {
        this.exit_button.on_mouse_move(x - imp_vars.sidebarWidth, y)
      }
    }
    this.player.mouseMove(this.transform_to_zoomed_space({x: x - imp_vars.sidebarWidth, y: y}))

    if (this.mode == "ult_tutorial") {
      if (this.cur_page == 2) {
        this.exit_button.on_mouse_move(x - imp_vars.sidebarWidth, y)
      }
    }
  }
}

HowToPlayState.prototype.on_key_down = function(keyCode) {
  if(!this.ready || this.zoom != 1) return

  if(keyCode == imp_params.keys.PAUSE || keyCode == imp_params.keys.SECONDARY_PAUSE) {
    this.pause = !this.pause
    if(this.pause) {
      set_dialog_box(new PauseMenu(this.level, this.world_num, this.game_numbers, this, this.visibility_graph))
    }
  } else if(keyCode == imp_params.keys.GATEWAY_KEY && this.hive_numbers && this.gateway_unlocked && p_dist(this.level.gateway_loc, this.player.body.GetPosition()) < this.level.gateway_size) {
    if (this.mode == "first_time_tutorial" && this.cur_page < 9) {
      // Prevent entering gateway in this specific instance
    } else {
      this.victory = true
    }
  } else {
    this.player.keyDown(keyCode)  //even if paused, must still process
  }
  // SPACEBAR
  if(keyCode == 32 && [2, 5, 6, 7].indexOf(this.cur_page) != -1 && this.mode == "first_time_tutorial" && this.advancing == false && this.transition_state == "none") {
    this.advance_page_timer = 0
    this.advancing = true
  }
}

HowToPlayState.prototype.setPage = function(page) {

  if(this.mode == "normal_tutorial" && page >= 4 || this.mode == "first_time_tutorial" && page == 3) {
    this.level.no_spawn = false
  }

  if(this.mode == "first_time_tutorial" && page == 4) {
    this.level.no_spawn = false
  }

  if (this.mode == "ult_tutorial" && page == 1) {
    this.level.no_spawn = false
    this.level.double_spawn = true
  }

  if(this.mode == "first_time_tutorial" && page == 5) {
    this.level.no_spawn = true
  }
  if(this.mode == "first_time_tutorial" && page == 8) {
    this.level.no_spawn = false
    this.level.double_spawn = true
    if (this.gateway_unlocked) {
      // Set the page to the next one.
      this.setPage(page + 1)
      return
    }
  }

  if((this.mode == "normal_tutorial" && page == 3 && this.cur_page != 3) ||
      (this.mode == "first_time_tutorial" && page == 2)) {
  
    this.temp_fragments = new FragmentGroup("player", {x: 75/imp_vars.draw_factor, y: 73/imp_vars.draw_factor}, {x:0, y:0}, false)
    this.temp_fragments.process(300)
  }

  if((this.mode == "normal_tutorial" && page == 4 && this.cur_page != 4) ||
      (this.mode == "first_time_tutorial" && page == 3)) {

    this.temp_fragments = new FragmentGroup("stunner", {x: 75/imp_vars.draw_factor, y: 60/imp_vars.draw_factor}, {x: 0, y: -5}, false)
    this.temp_fragments.process(100)
  }

  this.cur_page = page
  this.draw_contexts()
}

HowToPlayState.prototype.on_mouse_down = function(x, y) {

  if(this.new_enemy_type != null && Math.abs(x - imp_vars.sidebarWidth/2) < 120 && Math.abs(y - (imp_vars.canvasHeight/2 + 60)) < 160) {
    return
  }
  if(!this.pause && this.ready && this.zoom == 1) {

    if(this.mode == "normal_tutorial" && x > imp_vars.sidebarWidth && (x < imp_vars.canvasWidth - imp_vars.sidebarWidth && y > 400 || (this.cur_page == 10 + this.ult_page_offset && y > 350))) {

      if(this.cur_page == this.num_pages - 1) {
        this.exit_button.on_click(x - imp_vars.sidebarWidth, y)
      }


      if(x < 400) {
        if(this.cur_page > 0) {
          this.setPage(this.cur_page - 1)
        }
      }
      if(x > 800) {
        if(this.cur_page < this.num_pages - 1) {
          this.setPage(this.cur_page + 1)
        }
      }
      if(y > 565 && y < 595) {
        var index = Math.round((this.num_pages-1)/2 - (600 - x)/25)

        if(index >= 0 && index < this.num_pages)
          this.setPage(index)
      }

    } else {
      this.player.mouse_down(this.transform_to_zoomed_space({x: x - imp_vars.sidebarWidth, y: y}))
    }
  }
  if (this.mode == "ult_tutorial") {
    if (this.cur_page == 2) {
      this.exit_button.on_click(x - imp_vars.sidebarWidth, y)
    }
  }
}



HowToPlayState.prototype.game_over = function() {

  if((this.mode == "first_time_tutorial" && this.victory) || this.exit_tutorial) {
    switch_game_state(new RewardGameState(this.hive_numbers, this.main_game, {
      game_numbers: this.game_numbers,
      level: this.level,
      world_num: this.world_num,
      visibility_graph: this.visibility_graph,
      is_tutorial: true,
      tutorial_type: this.mode,
    }))
  } else {
    this.zoom_start_scale = 0.1
    this.zoom_target_scale = 1
    this.zoom = 0.1
    this.zoom_bg_switch = true;
    this.zoom_in({x:imp_vars.levelWidth/2, y:imp_vars.levelHeight/2}, 1, 1000)

    this.fade_state = "in"
    this.ready = true
    this.hive_numbers = new HiveNumbers(this.world_num, false)
    this.level.reset()
    this.reset()
    this.make_player()
    this.level.main_game = false
  }
}

HowToPlayState.prototype.player_moved = function() {
  if (this.cur_page == 0 && this.mode == "first_time_tutorial" && this.advancing == false && this.transition_state == "none") {
    this.advance_page_timer = this.delay_after_player_moved
    this.advancing = true
  }
}

HowToPlayState.prototype.player_impulsed = function() {
  if (this.cur_page == 1 && this.mode == "first_time_tutorial" && this.advancing == false && this.transition_state == "none") {
    this.advance_page_timer = this.delay_after_player_moved
    this.advancing = true
  }
}

HowToPlayState.prototype.player_ulted = function() {
  if (this.cur_page == 1 && this.mode == "ult_tutorial" && this.advancing == false && this.transition_state == "none") {
    this.advance_page_timer = this.delay_after_player_moved
    this.advancing = true
  }
}

HowToPlayState.prototype.enemy_killed = function() {
  if (this.cur_page == 3 && this.mode == "first_time_tutorial" && this.advancing == false && this.transition_state == "none") {
    this.advance_page_timer = this.delay_after_player_moved
    this.advancing = true
  }
  if (this.cur_page == 4 && this.mode == "first_time_tutorial" && this.advancing == false && this.transition_state == "none") {
    this.advance_page_timer = this.delay_after_player_moved
    this.advancing = true
  }
}

HowToPlayState.prototype.gateway_opened = function() {
  // If we don't have transition_state = "none", it's possible for the page to be advanced again while the transition is happening
  if (this.cur_page == 8 && this.mode == "first_time_tutorial" && this.advancing == false && this.transition_state == "none") {
    this.advance_page_timer = this.delay_after_player_moved
    this.advancing = true
  }
}
