var DialogBox = function() {
  
}

DialogBox.prototype.init = function(w, h) {
  this.w = w
  this.h = h
  this.x = canvasWidth/2
  this.y = canvasHeight/2
  this.buttons = []
}
DialogBox.prototype.draw = function(ctx) {
  ctx.beginPath()
  ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
  ctx.fillStyle = "white"
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = "black"
  ctx.stroke()
  this.additional_draw(ctx)
}

DialogBox.prototype.additional_draw = function(ctx) {}

DialogBox.prototype.on_mouse_move = function(x, y) {}
DialogBox.prototype.on_click = function(x, y) {}
DialogBox.prototype.on_key_down = function(x, y) {}
DialogBox.prototype.on_key_up = function(x, y) {}

PauseMenu.prototype = new DialogBox()

PauseMenu.prototype.constructor = PauseMenu

function PauseMenu(level, game_numbers, game_state) {
  this.level = level
  this.game_numbers = game_numbers
  this.game_state = game_state
  this.level_name = this.level.level_name
  this.init(400, 300)


  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {
    
    this.buttons.push(new SmallButton("QUIT", 25, this.x + this.w/4, this.y + this.h/2 - 20, 200, 50, function(_this) { return function() {
          switch_game_state(new GameOverState(_this.game_numbers, _this.level, _this.game_state.world_num))
          clear_dialog_box()
            }}(this)))
    this.buttons.push(new SmallButton("RESTART", 25, this.x - this.w/4, this.y + this.h/2 - 20, 200, 50, function(_this) { return function() {
          switch_game_state(new ImpulseGameState(ctx, _this.level_name, _this.game_state.world_num))
          clear_dialog_box()
            }}(this)))
  }
}

PauseMenu.prototype.additional_draw = function(ctx) {
  ctx.beginPath()
  ctx.textAlign = "center"
  ctx.font = '20px Century Gothic'
  ctx.fillStyle = "black"
  ctx.fillText("PAUSED", this.x, this.y - this.h/2 + 30)

  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {
    var temp_colors = ['bronze', 'silver', 'gold']

    var score_color = 0

    while(this.game_numbers.score > impulse_level_data[this.level_name].cutoff_scores[score_color]) {
      score_color+=1
    }



    ctx.fillStyle = score_color > 0 ? impulse_colors[temp_colors[score_color - 1]] : "black"
  }
  else
    ctx.fillStyle = "black"
  ctx.font = '30px Century Gothic'
  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {
    ctx.fillText(this.level_name, this.x, this.y - this.h/2 + 75 )
  }
  else {
    ctx.fillText("HOW TO PLAY", this.x, this.y - this.h/2 + 75 )
  }
  ctx.font = '20px Century Gothic'
  ctx.fillText("CURRENT SCORE: "+ this.game_numbers.score, this.x, this.y - this.h/2 + 125 )

  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {

    for(var i = 0; i < 3; i++) {
      ctx.fillStyle = impulse_colors[temp_colors[i]]
      ctx.fillText(impulse_level_data[this.level_name].cutoff_scores[i], this.x, this.y - this.h/2 + 160 + 25 * i)
    }
    score_color = 0

    while(impulse_level_data[this.level_name].high_score > impulse_level_data[this.level_name].cutoff_scores[score_color]) {
      score_color+=1
    }

    ctx.fillStyle = score_color > 0 ? impulse_colors[temp_colors[score_color - 1]] : "black"
    ctx.fillText("HIGH SCORE: "+impulse_level_data[this.level_name].high_score, this.x, this.y - this.h/2 + 245)
  }
  ctx.font = '25px Century Gothic'
  ctx.fillStyle = "white"
  ctx.fillText("SPACE TO UNPAUSE", this.x, this.y + this.h/2 + 50 )
  
  ctx.fill()


  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
}

PauseMenu.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_mouse_move(x,y)
  }
}

PauseMenu.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
}

PauseMenu.prototype.on_key_down = function(keyCode) {
  if(keyCode == 32) {
    clear_dialog_box()
    this.game_state.pause = false
  }
}

EnemyBox.prototype = new DialogBox()

EnemyBox.prototype.constructor = EnemyBox

function EnemyBox(enemy_name) {
  this.enemy_name = enemy_name
  this.max_enemy_d = 80
  this.phrase_list = null

  this.seen = impulse_enemy_stats[this.enemy_name].seen

  this.init(400, 300)

}

EnemyBox.prototype.additional_draw = function(ctx) {

  if(this.phrase_list == null) {
    this.phrase_list = getLines(ctx, impulse_enemy_stats[this.enemy_name].description, this.w - 20, '20px Century Gothic')
  }

  ctx.beginPath()
  ctx.textAlign = "center"
  ctx.font = '20px Century Gothic'
  ctx.fillStyle = "black"
  ctx.fillText(this.enemy_name.toUpperCase(), this.x, this.y - this.h/2 + 30)

  draw_enemy(ctx, this.enemy_name, this.x, this.y - this.h/2 + 100, this.max_enemy_d)

  ctx.beginPath()
  ctx.font = '20px Century Gothic'

  ctx.fillStyle = "black"
  for(var i = 0; i < this.phrase_list.length; i++) {
    var j = (i - this.phrase_list.length/2)
    ctx.fillText(this.phrase_list[i], this.x, this.y + 75 + 25 * j)
  }
  
  
  ctx.font = '25px Century Gothic'
  ctx.fillStyle = "white"
  ctx.fillText("CLICK TO CONTINUE", this.x, this.y + this.h/2 + 50 )
  
  ctx.fill()

}

EnemyBox.prototype.on_mouse_move = function(x, y) {
}

EnemyBox.prototype.on_click = function(x, y) {
  clear_dialog_box()
}

EnemyBox.prototype.on_key_down = function(keyCode) {
  
}
