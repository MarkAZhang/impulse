GameOverState.prototype = new GameState

GameOverState.prototype.constructor = GameOverState

function GameOverState(final_game_numbers, level) {
  this.level = level
  this.buttons = []
  this.buttons.push(new ImpulseButton("CLICK TO PLAY AGAIN", 20, canvasWidth/2, canvasHeight/2+160, 300, 50, function(_this){return function(){switch_game_state(new ImpulseGameState(ctx, _this.level.level_name))}}(this)))
  this.buttons.push(new ImpulseButton("RETURN TO MAIN MENU", 20, canvasWidth/2, canvasHeight/2+210, 200, 50, function(){switch_game_state(new TitleState(true))}))
  this.game_numbers = final_game_numbers
}

GameOverState.prototype.process = function(dt) {

}

GameOverState.prototype.draw = function(ctx) {
  ctx.beginPath()
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
  ctx.fillText("KILLS: "+this.game_numbers.kills, canvasWidth/2, canvasHeight/2+25)
  ctx.fillText("SURVIVED FOR "+this.game_numbers.last_time, canvasWidth/2, canvasHeight/2+60)
  ctx.fillText("SCORE: "+this.game_numbers.score, canvasWidth/2, canvasHeight/2+95)

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  ctx.fill()
}

GameOverState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].onMouseMove(x, y)
  }
}

GameOverState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].onClick(x, y)
  }
}
