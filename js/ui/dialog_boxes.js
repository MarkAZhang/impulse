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
DialogBox.prototype.on_mouse_down = function(x, y) {}
DialogBox.prototype.on_mouse_up = function(x, y) {}
DialogBox.prototype.on_click = function(x, y) {}
DialogBox.prototype.on_key_down = function(x, y) {}
DialogBox.prototype.on_key_up = function(x, y) {}

PauseMenu.prototype = new DialogBox()

PauseMenu.prototype.constructor = PauseMenu

function PauseMenu(level, game_numbers, game_state, visibility_graph) {
  this.level = level
  this.game_numbers = game_numbers
  this.game_state = game_state
  this.level_name = this.level.level_name
  this.visibility_graph = visibility_graph
  this.init(400, 300)


  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {
    
    this.buttons.push(new SmallButton("QUIT", 25, this.x + this.w/4, this.y + this.h/2 - 20, 200, 50, function(_this) { return function() {
          switch_game_state(new GameOverState(_this.game_numbers, _this.level, _this.game_state.world_num, _this.visibility_graph))
          clear_dialog_box()
            }}(this)))
    this.buttons.push(new SmallButton("RESTART", 25, this.x - this.w/4, this.y + this.h/2 - 20, 200, 50, function(_this) { return function() {
          switch_game_state(new ImpulseGameState(_this.game_state.world_num, _this.level, _this.visibility_graph))
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
  this.max_enemy_d = 50
  this.special_ability = null
  this.other_notes = null

  this.seen = impulse_enemy_stats[this.enemy_name].seen

  this.w = 600
  var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  var world = new b2World(gravity, doSleep); 

  var temp_enemy = new (impulse_enemy_stats[this.enemy_name].className)(world, 0, 0, 0, 0)

  this.def_value = Math.min(temp_enemy.body.m_mass/5.5, 1)

  this.atk_value = impulse_enemy_stats[this.enemy_name].attack_rating/10

  this.spd_value = ((impulse_enemy_stats[this.enemy_name].force/temp_enemy.body.m_mass)/impulse_enemy_stats[this.enemy_name].lin_damp)/.35

  if(this.enemy_name == "spear") this.spd_value = 1

}

EnemyBox.prototype.additional_draw = function(ctx) {

  if(this.special_ability == null) {
    this.special_ability = getLines(ctx, impulse_enemy_stats[this.enemy_name].special_ability, this.w - 20, '20px Century Gothic')
  }
  if(this.other_notes == null && impulse_enemy_stats[this.enemy_name].other_notes != "") {
    this.other_notes = getLines(ctx, impulse_enemy_stats[this.enemy_name].other_notes, this.w - 20, '20px Century Gothic')
  }

  if(this.special_ability != null && !this.h) {
    this.w = 600
    this.h = 340 + 25 * this.special_ability.length + this.other_notes.length * 25
    this.x = canvasWidth/2
    this.y = 50 + this.h/2
    this.buttons = []
  }


  ctx.beginPath()
  ctx.textAlign = "center"
  ctx.font = '20px Century Gothic'
  ctx.fillStyle = "black"
  ctx.fillText(this.enemy_name.toUpperCase(), this.x, this.y - this.h/2 + 30)

  draw_enemy(ctx, this.enemy_name, this.x, this.y - this.h/2 + 90, this.max_enemy_d)

  ctx.fillStyle = "black"

  ctx.textAlign = 'left'

  ctx.fillText("ATK", this.x - this.w/4, this.y - this.h/2 + 155)

  draw_progress_bar(ctx, this.x, this.y - this.h/2 + 150, this.x/2, 15, this.atk_value, impulse_enemy_stats[this.enemy_name].color)

  ctx.fillStyle = "black"

  ctx.fillText("DEF", this.x - this.w/4, this.y - this.h/2 + 180)


  draw_progress_bar(ctx, this.x, this.y - this.h/2 + 175, this.x/2, 15, this.def_value, impulse_enemy_stats[this.enemy_name].color)
 
  ctx.fillStyle = "black"

  ctx.fillText("SPD", this.x - this.w/4, this.y - this.h/2 + 205)


  draw_progress_bar(ctx, this.x, this.y - this.h/2 + 200, this.x/2, 15, this.spd_value, impulse_enemy_stats[this.enemy_name].color)


  ctx.fillStyle = "black"

  ctx.fillText("DIES UPON PLAYER COLLISION", this.x - this.w * .30, this.y - this.h/2 + 245)

  ctx.textAlign = 'center'

  ctx.fillText("SPECIAL ABILITY", this.x, this.y - this.h/2 + 280)

  if (this.other_notes != null)
    ctx.fillText("OTHER NOTES", this.x, this.y - this.h/2 + 315 + 25 * this.special_ability.length)

  ctx.textAlign = 'right'

  ctx.fillText(impulse_enemy_stats[this.enemy_name].dies_on_impact, this.x + this.w * .30, this.y - this.h/2 + 245)
  

  ctx.beginPath()
  ctx.textAlign = 'center'
  ctx.font = '20px Century Gothic'

  ctx.fillStyle = "black"
  for(var i = 0; i < this.special_ability.length; i++) {
    ctx.fillText(this.special_ability[i], this.x, this.y - this.h/2 + 305 + 25 * i)
  }

  if (this.other_notes != null) {
    for(var i = 0; i < this.other_notes.length; i++) {
      ctx.fillText(this.other_notes[i], this.x, this.y - this.h/2 + 340 + 25 * this.special_ability.length + 25 * i)
    }
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
