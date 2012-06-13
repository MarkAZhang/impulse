GameOverState.prototype = new GameState

GameOverState.prototype.constructor = GameOverState

function GameOverState(final_game_numbers, level, world_num) {
  this.level = level
  this.level_name = this.level.level_name
  this.buttons = []
  this.world_num = world_num
  this.buttons.push(new SmallButton("CLICK TO PLAY AGAIN", 20, canvasWidth/2, canvasHeight/2+160, 300, 50, function(_this){return function(){switch_game_state(new ImpulseGameState(ctx, _this.level.level_name))}}(this)))
  this.buttons.push(new SmallButton("RETURN TO MENU", 20, canvasWidth/2, canvasHeight/2+210, 200, 50, function(_this){return function(){
    if(_this.world_num) {
      switch_game_state(new ClassicSelectState(_this.world_num))
    }
    else {
      switch_game_state(new TitleState(true))
    }
  }}(this)))
  this.game_numbers = final_game_numbers


  if(this.game_numbers.score > impulse_level_data[this.level_name].high_score) {
    this.high_score = true
    impulse_level_data[this.level_name].high_score = this.game_numbers.score
    
    var stars = 0
    while(this.game_numbers.score >= impulse_level_data[this.level_name].cutoff_scores[stars])
    {
      stars+=1
    }
    impulse_level_data[this.level_name].stars = stars
    this.stars = stars
    save_game()
    calculate_stars()
  }
  else {
    this.high_score = false
    var stars = 0
    while(this.game_numbers.score > impulse_level_data[this.level_name].cutoff_scores[stars])
    {
      stars+=1
    }
    this.stars = stars
  }
  this.star_colors = ["bronze", "silver", "gold"]

}

GameOverState.prototype.process = function(dt) {

}

GameOverState.prototype.draw = function(ctx) {

  ctx.beginPath()
  ctx.fillStyle = 'red'
  ctx.font = '30px Century Gothic'
  ctx.textAlign = 'center'

  ctx.fillText("GAME OVER", canvasWidth/2, canvasHeight/2-75)
  ctx.fill()
  ctx.beginPath()
  ctx.font = '20px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.fillText(this.level.level_name, canvasWidth/2, canvasHeight/2-25)
  ctx.fillText("KILLS: "+this.game_numbers.kills, canvasWidth/2, canvasHeight/2+20)
  ctx.fillText("SURVIVED FOR "+this.game_numbers.last_time, canvasWidth/2, canvasHeight/2+50)
  ctx.fillStyle = this.stars > 0 ? impulse_colors[this.star_colors[this.stars - 1]] : "black"
  ctx.fillText("SCORE: "+this.game_numbers.score, canvasWidth/2, canvasHeight/2+80)
  ctx.fillStyle = impulse_level_data[this.level_name]['stars'] > 0 ? impulse_colors[this.star_colors[impulse_level_data[this.level_name]['stars'] - 1]] : "black"
  if(this.high_score)
    ctx.fillText("NEW HIGH SCORE", canvasWidth/2, canvasHeight/2+110)
  else
    ctx.fillText("HIGH SCORE: "+ impulse_level_data[this.level_name].high_score, canvasWidth/2, canvasHeight/2+110)


  if(this.stars > 0)
    draw_star(ctx, canvasWidth/2, 150, 50, this.star_colors[this.stars - 1])
  else
    draw_empty_star(ctx, canvasWidth/2, 150, 50)

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  ctx.fill()
}

GameOverState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

GameOverState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}
