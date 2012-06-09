CreditsState.prototype = new GameState

CreditsState.prototype.constructor = CreditsState

function CreditsState() {
  this.start_clicked = false
  this.buttons = []
  var _this = this
  this.buttons.push(new ImpulseButton("RETURN", 20, canvasWidth/2, canvasHeight/2+150, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
}

CreditsState.prototype.process = function(dt) {

}

CreditsState.prototype.draw = function(ctx) {
  ctx.beginPath()
  ctx.font = '30px Century Gothic'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText("IMPULSE", canvasWidth/2, canvasHeight/2)
  ctx.font = '20px Century Gothic'
  ctx.fillStyle = 'blue'
  ctx.fillText("Impulse was conceived, designed, and coded by Mark Zhang", canvasWidth/2, canvasHeight/2 + 50)
  ctx.fillText("Impulse is based on the Box2D physics engine.", canvasWidth/2, canvasHeight/2 + 75)
  
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
}

CreditsState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].onMouseMove(x, y)
  }
}

CreditsState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].onClick(x, y)
  }
}

