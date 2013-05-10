MainGameSummaryState.prototype = new GameState

MainGameSummaryState.prototype.constructor = MainGameSummaryState

MainGameSummaryState.prototype.rank_cutoffs = {
    "D": 10,
    "D+": 11,
    "C-": 13,
    "C": 14,
    "C+": 15,
    "B-": 16,
    "B": 17,
    "B+": 18,
    "A-": 20,
    "A": 21,
    "A+": 22,
    "S": 24
  }

function MainGameSummaryState(world_num, victory, hive_numbers) {

  this.buttons = []
  this.bg_drawn = false
  this.hive_numbers = hive_numbers
  this.world_num = world_num
  this.victory = victory


  this.transition_interval = 1000
  this.transition_timer = this.transition_interval
  this.transition_state = "in"

  this.rank = "F"

  this.rank_color = "red"

  if(victory) {
    if(world_num == 1) {
      this.victory_text = "IMMUNITAS DEFEATED"
    }

    var total_stars = 0
    for(level in hive_numbers.game_numbers) {
      total_stars += hive_numbers.game_numbers[level].stars
    }


    for(rank in this.rank_cutoffs) {
      if(this.rank_cutoffs[rank] <= this.stars){
        this.rank = rank;
      } else {
        break
      }
    }
    this.rank_color = this.get_rank_color(total_stars, world_num)

    if(this.rank_cutoffs[this.rank] > this.rank_cutoffs[player_data.world_rankings[player_data.difficulty_mode]["world "+this.world_num]]) {
      player_data.world_rankings[player_data.difficulty_mode]["world "+this.world_num] = this.rank
      save_game()
    }

  }

  this.color = impulse_colors["world "+world_num]
  this.lite_color = impulse_colors["world "+world_num+" lite"]
  this.dark_color = impulse_colors["world "+world_num+" dark"]
  var _this = this;


  impulse_music.stop_bg()
  this.star_colors = ["bronze", "silver", "gold"]
}

MainGameSummaryState.prototype.get_rank_color = function(stars, world_num) {
    if(stars >= this.rank_cutoffs["S"]) {
      return impulse_colors["impulse_blue"]
    }
    if(stars >= this.rank_cutoffs["B-"]) {
      return impulse_colors["world "+world_num+" list"]
    }

    if(stars >= this.rank_cutoffs["C-"]) {
      return impulse_colors["world "+world_num]
    }
    return "red"

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

  ctx.fillStyle = this.dark_color
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
    ctx.fillText(this.victory_text , levelWidth/2, 90)
  }
  else {
    ctx.fillStyle = 'red'
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("YOU ARE DEFEATED", levelWidth/2, 90)
  }

  ctx.fillStyle = this.lite_color;
  ctx.shadowColor = ctx.fillStyle
  ctx.font = '40px Muli'
  ctx.fillText(this.hive_numbers.hive_name, levelWidth/2, 140)


  if(this.victory) {
    ctx.fillStyle = this.lite_color
    ctx.font = '18px Muli'
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("RANK", levelWidth/2, 180)
    ctx.fillStyle = this.rank_color
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '84px Muli'
    ctx.fillText(this.rank, levelWidth/2, 250)
  }


  ctx.shadowBlur = 0

  ctx.font = '18px Muli'
  ctx.textAlign = 'center'

  var y = 290
  ctx.fillStyle = this.lite_color;

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
    if(this.hive_numbers.game_numbers[title]) {
      var gn = this.hive_numbers.game_numbers[title];
    } else {
      var gn = {}
    }
    ctx.fillStyle = gn.visited ? this.lite_color : "#333";
    var y = 320 + 30 * i;
    ctx.fillText(real_title,150, y)

    if(gn.score != undefined) {
      if(gn.stars > 0) {
        ctx.fillStyle = impulse_colors[this.star_colors[gn.stars - 1]]
      }
      ctx.fillText(gn.score, 270, y)
    } else {
      ctx.fillText('---', 270, y)
    }
    ctx.fillStyle = gn.visited ? this.lite_color : "#333";
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

  ctx.font = '24px Muli'
  ctx.fillStyle = this.lite_color
  ctx.fillText("PRESS SPACE TO CONTINUE", levelWidth/2, levelHeight - 30, 300)
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

MainGameSummaryState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

MainGameSummaryState.prototype.on_key_down = function(keyCode) {

  if(keyCode == 32) {
    if(this.transition_state=="none") {
      this.transition_state="out"; this.transition_timer = this.transition_interval
    }
  }
}

MainGameSummaryState.prototype.process = function(dt) {

}

