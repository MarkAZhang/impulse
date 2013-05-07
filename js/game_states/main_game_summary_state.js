MainGameSummaryState.prototype = new GameState

MainGameSummaryState.prototype.constructor = MainGameSummaryState

function MainGameSummaryState(world_num, victory, hive_numbers) {

  this.buttons = []
  this.bg_drawn = false
  this.hive_numbers = hive_numbers
  this.world_num = world_num
  this.victory = victory


  this.transition_interval = 1000
  this.transition_timer = this.transition_interval
  this.transition_state = "in"


  if(victory) {
    if(world_num == 1) {
      this.victory_text = "IMMUNITAS DEFEATED"
    }
  }

  this.color = impulse_colors["world "+world_num]
  this.lite_color = impulse_colors["world "+world_num+" lite"]
  this.dark_color = impulse_colors["world "+world_num+" dark"]
  var _this = this;
  this.buttons.push(new SmallButton("MAIN MENU", 20, levelWidth/2, levelHeight - 30, 300, 50, impulse_colors["impulse_blue"], impulse_colors["impulse_blue"], function(){_this.transition_state="out"; _this.transition_timer = _this.transition_interval}))

  impulse_music.stop_bg()
}

MainGameSummaryState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "display:none" )
    this.bg_drawn = true
  }


  ctx.save()
  this.transition_timer -= dt;
  if(this.transition_timer < 0) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
    }
    if(this.transition_state == "out") {
      switch_game_state(new TitleState(true))
    }
  }
  if(this.transition_state == "in") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = 1 - prog
  } else if(this.transition_state == "out") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = Math.max(0, prog)
  }

  ctx.fillStyle = impulse_colors["world "+this.world_num+" dark"]
  ctx.fillRect(0, 0, levelWidth, levelHeight)
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  ctx.shadowBlur = 20;

  ctx.textAlign = 'center'

  ctx.font = '30px Muli'
  if(this.victory) {
    ctx.fillStyle = impulse_colors["impulse_blue_dark"]
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText(this.victory_text , levelWidth/2, 100)
  }
  else {
    ctx.fillStyle = 'red'
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("YOU ARE DEFEATED", levelWidth/2, 100)
  }

  ctx.fillStyle = this.lite_color;
  ctx.shadowColor = ctx.fillStyle
  ctx.font = '40px Muli'
  ctx.fillText(this.hive_numbers.hive_name, levelWidth/2, 150)


  ctx.shadowBlur = 0

  ctx.font = '18px Muli'
  ctx.textAlign = 'center'

  var y = 180

  ctx.fillText("LEVEL",150, y)
  ctx.fillText("SCORE", 270, y)
  ctx.fillText("TIME", 390, y)
  ctx.fillText("COMBO", 510, y)
  ctx.fillText("DEATHS", 630, y)

  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)

    var real_title = title;
    if(i==7 && this.world_num == 1) {
      real_title = "IMMUNITAS";
    }

    var y = 220 + 40 * i;
    ctx.fillText(title,150, y)
    if(this.hive_numbers.game_numbers[title]) {
      var gn = this.hive_numbers.game_numbers[title];
    } else {
      var gn = {}
    }

      if(gn.score != undefined)
        ctx.fillText(gn.score, 270, y)
      else {
        ctx.fillText('---', 270, y)
      }
      if(gn.last_time != undefined)
        ctx.fillText(gn.last_time, 390, y)
      else {
        ctx.fillText('---', 390, y)
      }
      if(gn.combo != undefined)
        ctx.fillText(gn.combo, 510, y)
      else {
        ctx.fillText('---', 510, y)
      }
      if(gn.deaths != undefined)
        ctx.fillText(gn.deaths, 630, y)
      else {
        ctx.fillText('---', 630, y)
      }
  }
  ctx.restore()
}


MainGameSummaryState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

MainGameSummaryState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

MainGameSummaryState.prototype.process = function(dt) {

}

