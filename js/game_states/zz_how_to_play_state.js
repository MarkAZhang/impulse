HowToPlayState.prototype = new ImpulseGameState

HowToPlayState.prototype.constructor = HowToPlayState

function HowToPlayState() {
  this.hive_numbers = new HiveNumbers(this.world_num, false)
  this.init(0, null, null, true, this.hive_numbers, false)
  this.ready = false
  this.level = this.load_level(imp_params.impulse_level_data["HOW TO PLAY"])
  this.level.no_spawn = true
  this.level.check_enemy_spawn_timers = this.check_enemy_spawn_timers
  this.slide_num = 0

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

  this.color = "white"
  this.lite_color = "#ccc"
  this.dark_color = "black"
  this.check_new_enemies()
  this.num_pages = 12
  this.cur_page = 0

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

  this.special_buttons = []
  var _this = this
  this.easy_mode_button = new SmallButton("EASY MODE", 20, imp_vars.levelWidth/2-100, 390, 200, 50, "white", "blue", function(){_this.change_mode("easy")})
  this.special_buttons.push(this.easy_mode_button)
  this.normal_mode_button = new SmallButton("NORMAL MODE", 20, imp_vars.levelWidth/2+100, 390, 200, 50, "white", "blue",function(){_this.change_mode("normal")})
  this.special_buttons.push(this.normal_mode_button)

  this.exit_button = new SmallButton("EXIT TUTORIAL", 20, 400, 410, 250, 50, "white", "blue", function(){_this.exit_tutorial = true})

  this.set_difficulty_button_underline();

  this.has_ult = has_ult()
  this.ult_num = calculate_ult()
  this.ult_page_offset = this.has_ult ? 3 : 0
  this.num_pages += this.ult_page_offset

}

//replaces the check_enemy_spawn_timers in Level
HowToPlayState.prototype.check_enemy_spawn_timers = function(dt) {
  if(this.no_spawn) return
  for(var k in this.enemy_spawn_timers) {
      //if we haven't reached the initial spawn time
    if(this.impulse_game_state.game_numbers.seconds < this.enemies_data[k][0]) continue
    //increment the spawn_counters
    this.enemy_spawn_counters[k] += dt/1000/60 * this.enemies_data[k][3]

    this.enemy_spawn_timers[k] += dt/1000
    if(this.enemy_spawn_timers[k] >= this.enemies_data[k][1]) {
      this.enemy_spawn_timers[k] -= this.enemies_data[k][1]

      // re-seed for each type of enemy
      var spawn_point_index = 0;
      if(this.spawn_points)
        spawn_point_index = Math.floor(Math.random() * this.spawn_points.length)

      var num_enemies_to_spawn = this.enemy_spawn_counters[k]

      //if(imp_vars.player_data.difficulty_mode == "easy") {
      //  num_enemies_to_spawn = Math.max(1, num_enemies_to_spawn * 0.7)
      //}

      for(var j = 1; j <= num_enemies_to_spawn; j++) {
        this.spawn_queue.push({type: k, spawn_point: spawn_point_index})
        spawn_point_index+=1;

      }
    }
  }
}

HowToPlayState.prototype.change_mode = function(type) {
  imp_vars.player_data.difficulty_mode = type;
  save_game();
  this.set_difficulty_button_underline();
}


HowToPlayState.prototype.set_difficulty_button_underline = function() {
  this.easy_mode_button.underline = (imp_vars.player_data.difficulty_mode == "easy");
  this.normal_mode_button.underline = (imp_vars.player_data.difficulty_mode == "normal");
}

HowToPlayState.prototype.additional_draw = function(ctx, bg_ctx) {
  if(this.zoom != 1) {
    return
  }
  ctx.save()
  ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar


  ctx.font = '20px Muli'
  ctx.textAlign = "center"
  ctx.fillStyle = this.color
  if(this.cur_page == 0) {
    draw_logo(ctx, 400, 380, true)
    /*ctx.font = '72px Muli'
    ctx.shadowColor = impulse_colors["impulse_blue"]
    ctx.shadowBlur = 20
    ctx.fillStyle = impulse_colors["impulse_blue"]
    ctx.fillText("IMPULSE", 400, 420)*/
    ctx.font = '36px Muli'
    ctx.fillStyle = "white"
    ctx.shadowColor = "white"
    ctx.fillText("HOW TO PLAY", 400, 500)
  }

  if(this.cur_page == 1) {

    if(imp_vars.player_data.options.control_hand == "right") {
      draw_arrow_keys(ctx, 400, 430, 60, this.color, ["W", "A", "S", "D"])
    }
    if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
      draw_arrow_keys(ctx, 400, 430, 60, this.color)
    }
    ctx.fillText("MOVE", 400, 500)
    ctx.globalAlpha *= 0.5
    ctx.font = '12px Muli'
    ctx.fillText("ALTERNATE CONTROLS AVAILABLE IN PAUSE MENU", 400, 550)
  }

  if(this.cur_page == 2) {
    if(imp_vars.player_data.options.control_scheme == "mouse") {
      draw_mouse(ctx, 400, 400, 83, 125, this.color)
    } else {
      draw_arrow_keys(ctx, 400, 430, 60, this.color)
    }
    ctx.fillText("USE IMPULSE", 400, 500)
    ctx.globalAlpha *= 0.5
    ctx.font = '12px Muli'
    ctx.fillText("HOLD MOUSE TO CONTINUOUSLY IMPULSE", 400, 550)

  }

  if(this.cur_page == 3) {

    ctx.drawImage(this.primary_canvas, 0, 0, 150, 150, 225, 300, 150, 150);
    ctx.drawImage(this.secondary_canvas, 0, 0, 150, 150, 425, 300, 150, 150);

    ctx.save()
    ctx.beginPath()
    ctx.rect(225, 300, 150, 150)
    ctx.rect(425, 300, 150, 150)
    ctx.strokeStyle = this.color
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.shadowBlur = 0

    ctx.beginPath()
    ctx.moveTo(385, 375)
    ctx.lineTo(400, 375)
    ctx.lineWidth = 8
    ctx.strokeStyle = "white"
    ctx.stroke()
    draw_arrow(ctx, 408, 375, 20, "right", this.color, false)

    var polygons = imp_params.impulse_level_data["HOW TO PLAY"].obstacle_v

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
    }
    ctx.shadowBlur = 0

    ctx.fillText("TOUCHING THE HIVELINE WILL KILL YOU", 400, 500)
    //ctx.globalAlpha /= 2
    ctx.shadowBlur = 5
    ctx.shadowColor = "red"
    ctx.fillStyle = "red"
    ctx.clearRect(360, 480, 95, 40)
    ctx.fillText("HIVELINE", 407.5, 500)

    ctx.restore()
  }

   if(this.cur_page == 4) {

    ctx.drawImage(this.primary_canvas, 0, 0, 150, 150, 225, 300, 150, 150);
    ctx.drawImage(this.secondary_canvas, 0, 0, 150, 150, 425, 300, 150, 150);

    ctx.save()
    ctx.beginPath()
    ctx.rect(225, 300, 150, 150)
    ctx.rect(425, 300, 150, 150)
    ctx.strokeStyle = this.color
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
    draw_arrow(ctx, 408, 375, 20, "right", this.color, false)

    ctx.fillStyle = this.color
    ctx.textAlign = "center"
    ctx.fillText("IMPULSE ENEMIES INTO THE HIVELINE", 400, 500)

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
    ctx.font = '20px Muli'
    ctx.textAlign = "center"
    ctx.fillStyle = this.color
    ctx.fillText("GET THE GATEWAY SCORE...", 400, 500)
    ctx.clearRect(345, 475, 173, 28)
    ctx.shadowColor = "red"
    ctx.fillStyle = "red"
    ctx.fillText("GATEWAY SCORE", 433, 500)
  }

  if(this.cur_page == 6) {

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


    ctx.font = '20px Muli'
    ctx.textAlign = "center"
    ctx.fillStyle = this.color
    ctx.shadowBlur = 0
    ctx.fillText("...THEN MOVE ONTO THE UNLOCKED GATEWAY", 400, 360)

    ctx.shadowBlur = 0
    ctx.fillText("AND PRESS", 400, 400)
    ctx.fillText("TO ADVANCE TO THE NEXT LEVEL", 400, 510)
    

    if(imp_vars.player_data.options.control_hand == "right") {
      ctx.shadowColor = this.color
      ctx.shadowBlur = 10

      draw_rounded_rect(ctx, 400, 445, 300, 50, 10, this.color)
      ctx.fillText("SPACEBAR", 400, 451)
    }

    if(imp_vars.player_data.options.control_hand == "left") {
      draw_rounded_rect(ctx, 400, 445, 120, 50, 10, this.color)
      ctx.fillText("ENTER", 400, 451)
    }

    ctx.font = '12px Muli'
    ctx.shadowBlur = 5
    ctx.globalAlpha = 1
    ctx.font = '20px Muli'
    ctx.shadowColor = "red"
    ctx.fillStyle = "red"

    ctx.clearRect(524, 337, 105, 25)
    ctx.fillText("GATEWAY", 576, 360)
    ctx.font = '12px Muli'
    ctx.shadowBlur = 0
    ctx.globalAlpha = 0.5
    ctx.fillStyle = this.color

    ctx.fillText("ALTERNATE CONTROLS AVAILABLE IN PAUSE MENU", 400, 550)

  }

  if(this.cur_page == 7) {
    ctx.fillText("KILLING ENEMIES INCREASES YOUR MULTIPLIER", 400, 400)
    ctx.fillText("GETTING HIT RESETS YOUR MULTIPLIER", 400, 440)

    ctx.beginPath()
    ctx.arc(imp_vars.canvasWidth - imp_vars.sidebarWidth*3/2, imp_vars.canvasHeight/2 - 20, 70, 0, 2 * Math.PI)
    ctx.lineWidth = 8
    ctx.strokeStyle = 'red'
    ctx.stroke()

    ctx.globalAlpha = 1
    ctx.font = '20px Muli'
    ctx.shadowColor = "red"
    ctx.fillStyle = "red"
    ctx.clearRect(515, 380, 115, 25)
    ctx.fillText("MULTIPLIER", 568, 400)
    ctx.font = '12px Muli'
    ctx.fillStyle = this.color
    ctx.globalAlpha /= 2
    ctx.fillText("YOUR MINIMUM MULTIPLIER INCREASES BY 1 EVERY 10 SECONDS", 400, 530)
  }

  if(this.cur_page == 8) {

    ctx.beginPath()
    ctx.arc(this.level.spark_loc.x, this.level.spark_loc.y, 15, 0, 2 * Math.PI)
    ctx.lineWidth = 4
    ctx.strokeStyle = 'red'
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(this.level.multi_loc.x, this.level.multi_loc.y, 15, 0, 2 * Math.PI)
    ctx.stroke()

    draw_spark(ctx, 300, 380)
    ctx.font = '12px Muli'
    ctx.shadowColor = impulse_colors["impulse_blue"]
    ctx.shadowBlur = 10
    ctx.fillStyle = ctx.shadowColor


    ctx.fillText("+10 SPARKS", 300, 410)
    ctx.shadowBlur = 0
    draw_multi(ctx, 500, 380)
    ctx.font = '12px Muli'
    ctx.shadowBlur = 10
    ctx.shadowColor = "white"
    ctx.fillStyle = ctx.shadowColor

    ctx.fillText("+5 MULTIPLIER", 500, 410)

    ctx.font = '20px Muli'
    ctx.shadowBlur = 0
    ctx.fillText("COLLECT SPARKS", 400, 500)
    ctx.globalAlpha = 1
    ctx.font = '20px Muli'
    ctx.shadowColor = "red"
    ctx.fillStyle = "red"
    ctx.clearRect(410, 480, 115, 25)
    ctx.fillText("SPARKS", 446, 500)

    ctx.font = '12px Muli'
    ctx.fillStyle = this.color
    ctx.globalAlpha /= 2
    ctx.fillText("100 SPARKS = 1UP", 400, 530)
    ctx.globalAlpha *= 2

    ctx.beginPath()
    ctx.rect(-160, imp_vars.canvasHeight - 140, 120, 80)
    ctx.strokeStyle = "red"
    ctx.lineWidth = 4
    ctx.stroke()
  }
  if(this.has_ult) {
    if(this.cur_page == 9) {
      if(imp_vars.player_data.options.control_scheme == "mouse") {
        draw_right_mouse(ctx, 400, 400, 83, 125, this.color)
        ctx.fillText("USE ULTIMATE", 400, 500)
      } else {
        draw_rounded_rect(ctx, 400, 400, 55, 55, 10, "white")
        ctx.fillText("E", 400, 406)
        ctx.fillText("USE ULTIMATE", 400, 470)
      }
      
      ctx.globalAlpha *= 0.5
      ctx.font = '12px Muli'
      ctx.fillText("THE ULTIMATE IS A WEAPON OF LAST RESORT", 400, 550)
    }    
    if(this.cur_page == 10) {
      ctx.globalAlpha /= 2
      drawSprite(ctx, 400, 450, 0, 35, 35, "lives_icon")
      drawSprite(ctx,400, 450 , 0, 300, 300, "ultimate_icon")
      ctx.globalAlpha *= 2
      ctx.font = '20px Muli'
      ctx.textAlign = "center"
      ctx.fillStyle = this.color
      ctx.shadowBlur = 0
      ctx.fillText("ULTIMATE WILL BLOW AWAY ALL ENEMIES", 400, 370)
      ctx.fillText("IN A MODERATE DISTANCE AROUND YOU", 400, 400)
      ctx.fillText("ENEMIES KILLED BY ULTIMATE DO NOT GIVE POINTS", 400, 450)
      ctx.fillText("WHILE ULTIMATE IS ACTIVE", 400, 500)
      ctx.fillText("YOU WILL TEMPORARILY BECOME HEAVIER", 400, 530)

    }    
    if(this.cur_page == 11) {
      ctx.globalAlpha /= 2
      drawSprite(ctx, 400, 450, 0, 35, 35, "lives_icon")
      drawSprite(ctx,400, 450 , 0, 300, 300, "ultimate_icon")
      ctx.globalAlpha *= 2
      ctx.font = '20px Muli'
      ctx.textAlign = "center"
      ctx.fillStyle = this.color
      ctx.shadowBlur = 0
      ctx.fillText("YOU HAVE A LIMITED NUMBER OF", 400, 395)
      ctx.fillText("ULTIMATES PER CONTINUE (CURRENTLY "+this.ult_num+")", 400, 425)
      ctx.fillText("IF YOU DIE AFTER USING ULTIMATE", 400, 475)
      ctx.fillText("IT IS REFUNDED", 400, 505)
    }
  }

  if(this.cur_page == 9 + this.ult_page_offset) {
    ctx.font = '20px Muli'
    ctx.fillStyle = "white"
    draw_rounded_rect(ctx, 250, 406, 55, 55, 10, "white")
    ctx.fillText("Q", 250, 412)
    draw_rounded_rect(ctx, 400, 406, 55, 55, 10, "white")
    ctx.fillText("X", 400, 412)
    draw_rounded_rect(ctx, 550, 406, 55, 55, 10, "white")
    ctx.fillText("F", 550, 412)
    ctx.font = '16px Muli'
    ctx.fillText("PAUSE", 250, 462)
    ctx.fillText("MUTE", 400, 462)
    ctx.fillText("FULLSCREEN", 550, 462)
    ctx.font = '12px Muli'
    ctx.globalAlpha /= 2
    ctx.fillText("ENEMY INFO AND GAME OPTIONS IN THE PAUSE MENU", 400, 530)
    ctx.globalAlpha *= 2


    ctx.beginPath()
    ctx.rect(-155, imp_vars.canvasHeight - 40, 120, 37)
    ctx.strokeStyle = "red"
    ctx.lineWidth = 4
    ctx.stroke()
    //redraw

  }

  if(this.cur_page == 10+ this.ult_page_offset) {
    for(var i=0; i < this.special_buttons.length; i++) {
      this.special_buttons[i].draw(ctx)
    }

    ctx.globalAlpha /= 2
    ctx.font = '12px Muli'
    ctx.fillText("FOR CASUAL PLAYERS", 300, 365)
    ctx.fillText("FOR EXPERIENCED PLAYERS", 500, 365)
    ctx.globalAlpha *= 2
    ctx.font = "20px Muli"

    ctx.fillText("SELECT DIFFICULTY MODE", 400, 500)
    ctx.font = '12px Muli'
    ctx.fillStyle = this.color
    ctx.globalAlpha /= 2
    ctx.fillText("CAN BE CHANGED IN MAIN MENU OPTIONS", 400, 520)
  }

  if(this.cur_page == 11+ this.ult_page_offset) {

    this.exit_button.draw(ctx)

    ctx.font = '12px Muli'
    ctx.globalAlpha /= 2
    ctx.fillText("LET'S DO THIS", 400, 430)

  }


  ctx.globalAlpha = 1

  if(this.cur_page > 0) {
    draw_arrow(ctx, 100, 420, 20, "left", this.color)
    ctx.font = '10px Muli'
    ctx.fillStyle = this.color
    ctx.fillText("BACK", 98, 450)
  }
  if(this.cur_page < this.num_pages - 1) {
    draw_arrow(ctx, 700, 420, 20, "right", this.color)
    ctx.font = '10px Muli'
    ctx.fillStyle = this.color
    ctx.fillText("NEXT", 702, 450)
  }

  for(var i = 0; i < this.num_pages; i++) {
    var offset = (this.num_pages-1)/2 - i
    ctx.beginPath()
    ctx.shadowBlur = 5
    ctx.arc(400 - 25 * offset, 580, 4, 0, 2*Math.PI, true)
    ctx.fillStyle = this.color
    if(this.cur_page == i) {
      ctx.fillStyle = this.color
      ctx.shadowColor = ctx.fillStyle
      ctx.fill()
    } else {
      ctx.globalAlpha /= 5
      ctx.shadowColor = ctx.fillStyle
      ctx.fill()
      ctx.globalAlpha *= 5
    }
  }

  ctx.restore()
}

HowToPlayState.prototype.draw_contexts = function() {
  if(this.cur_page == 3) {
    this.primary_ctx.clearRect(0, 0, 150, 150)
    this.secondary_ctx.clearRect(0, 0, 150, 150)
    this.draw_picture_bg_on_canvas(this.primary_ctx)
    this.draw_picture_bg_on_canvas(this.secondary_ctx)

    drawSprite(this.primary_ctx, 75, 75, 0, 60, 60, "player_normal")
    this.temp_fragments.draw(this.secondary_ctx)
  }
  if(this.cur_page == 4) {
    this.primary_ctx.clearRect(0, 0, 150, 150)
    this.secondary_ctx.clearRect(0, 0, 150, 150)
    this.draw_picture_bg_on_canvas(this.primary_ctx)
    this.draw_picture_bg_on_canvas(this.secondary_ctx)

    drawSprite(this.primary_ctx, 30, 75, 0, 60, 60, "player_normal")
    this.primary_ctx.beginPath();
    this.primary_ctx.shadowOffsetX = 0;
    this.primary_ctx.shadowOffsetY = 0;
    this.primary_ctx.shadowBlur = 10;
    this.primary_ctx.shadowColor = impulse_colors["impulse_blue"];
    this.primary_ctx.lineWidth = 5
    this.primary_ctx.strokeStyle = this.primary_ctx.shadowColor
    this.primary_ctx.arc(30, 75, 48, - Math.PI/3,  Math.PI/3);
    this.primary_ctx.shadowBlur = 0
    this.primary_ctx.stroke()
    draw_enemy_real_size(this.primary_ctx, "stunner", 90, 75, 30, Math.PI)

    drawSprite(this.secondary_ctx, 30, 75, 0, 60, 60, "player_normal")

    this.secondary_ctx.globalAlpha = 0.5
    draw_enemy_real_size(this.secondary_ctx, "stunner", 110, 75, 60, Math.PI)
    this.secondary_ctx.globalAlpha = 1
    this.secondary_ctx.beginPath();
    this.secondary_ctx.shadowOffsetX = 0;
    this.secondary_ctx.shadowOffsetY = 0;
    this.secondary_ctx.shadowBlur = 10;
    this.secondary_ctx.shadowColor = impulse_colors["impulse_blue"];
    this.secondary_ctx.lineWidth = 5
    this.secondary_ctx.strokeStyle = this.secondary_ctx.shadowColor
    this.secondary_ctx.arc(30, 75, 75, - Math.PI/3,  Math.PI/3);
    this.secondary_ctx.shadowBlur = 0
    this.secondary_ctx.stroke()
    this.temp_fragments.draw(this.secondary_ctx)
  }

}

HowToPlayState.prototype.draw_picture_bg_on_canvas = function(ctx) {
  var boundary_x = 75
  if(this.cur_page == 4) {
    boundary_x = 100
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, boundary_x, 150)
  ctx.fillStyle = impulse_colors['world 0 bright']
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(boundary_x, 0)
  ctx.lineTo(boundary_x, 150)
  ctx.lineWidth = 6
  ctx.strokeStyle = impulse_colors['world 0 bright']
  ctx.stroke()
  ctx.beginPath()
  ctx.rect(boundary_x, 0, 150-boundary_x, 150)
  ctx.fillStyle = this.dark_color
  ctx.shadowColor = this.lite_color
  ctx.shadowBlur = 20
  ctx.fill()
  if(this.cur_page == 3) {
    ctx.beginPath()
    ctx.moveTo(boundary_x, 0)
    ctx.lineTo(boundary_x, 150)
    ctx.lineWidth = 4
    ctx.strokeStyle = "red"
    ctx.stroke()
  }
  ctx.restore()
}

HowToPlayState.prototype.on_mouse_move = function(x, y) {
  if(!this.pause && this.ready && this.zoom == 1) {
    if(this.cur_page == 10+ this.ult_page_offset) {
      for(var i=0; i < this.special_buttons.length; i++) {
        this.special_buttons[i].on_mouse_move(x - imp_vars.sidebarWidth, y)
      }
    }
    if(this.cur_page == 11+ this.ult_page_offset) {
      this.exit_button.on_mouse_move(x - imp_vars.sidebarWidth, y)
    }
    this.player.mouseMove(this.transform_to_zoomed_space({x: x - imp_vars.sidebarWidth, y: y}))
  }
}

HowToPlayState.prototype.on_key_down = function(keyCode) {
  if(!this.ready || this.zoom != 1) return

  if(keyCode == imp_params.keys.PAUSE) {
    this.pause = !this.pause
    if(this.pause) {
      set_dialog_box(new PauseMenu(this.level, this.world_num, this.game_numbers, this, this.visibility_graph))
    }
  } else if(keyCode == imp_params.keys.GATEWAY_KEY && this.hive_numbers && this.gateway_unlocked && p_dist(this.level.gateway_loc, this.player.body.GetPosition()) < this.level.gateway_size) {
    this.victory = true
  } else {
    this.player.keyDown(keyCode)  //even if paused, must still process
  }
}

HowToPlayState.prototype.setPage = function(page) {

  if(page >= 4) {
    this.level.no_spawn = false
  }

  if(page == 3 && this.cur_page != 3) {

    this.temp_fragments = new FragmentGroup("player", {x: 75/imp_vars.draw_factor, y: 75/imp_vars.draw_factor}, {x:0, y:0}, false)
    this.temp_fragments.process(300)
  }

  if(page == 4 && this.cur_page != 4) {

    this.temp_fragments = new FragmentGroup("stunner", {x: 110/imp_vars.draw_factor, y: 75/imp_vars.draw_factor}, {x: 5, y:0}, false)
    this.temp_fragments.process(300)
  }

  this.cur_page = page
  this.draw_contexts()
}

HowToPlayState.prototype.on_mouse_down = function(x, y) {
  console.log(x+" "+ y)

  if(this.new_enemy_type != null && Math.abs(x - imp_vars.sidebarWidth/2) < 120 && Math.abs(y - (imp_vars.canvasHeight/2 + 60)) < 160) {
    return
  }
  if(!this.pause && this.ready && this.zoom == 1) {

    if(x > imp_vars.sidebarWidth && (x < imp_vars.canvasWidth - imp_vars.sidebarWidth && y > 400 || (this.cur_page == 10 + this.ult_page_offset && y > 350))) {

      if(this.cur_page == 10+ this.ult_page_offset) {
        for(var i=0; i < this.special_buttons.length; i++) {
          this.special_buttons[i].on_click(x - imp_vars.sidebarWidth, y)
        }
      }

      if(this.cur_page == 11+ this.ult_page_offset) {
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
}



HowToPlayState.prototype.game_over = function() {
  if(this.exit_tutorial) {
    switch_game_state(new TitleState(true))
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
