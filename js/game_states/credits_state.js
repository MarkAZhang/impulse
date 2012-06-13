CreditsState.prototype = new GameState

CreditsState.prototype.constructor = CreditsState

function CreditsState() {
  this.start_clicked = false
  this.buttons = []
  var _this = this
  this.buttons.push(new SmallButton("RETURN", 20, canvasWidth/2, canvasHeight/2+270, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
  this.image = new Image()

  this.image.src = 'impulse_logo.png'
}

CreditsState.prototype.process = function(dt) {

}

CreditsState.prototype.draw = function(ctx) {
  ctx.globalAlpha = .3
  ctx.drawImage(this.image, canvasWidth/2 - this.image.width/2, canvasHeight/2 - 100 - this.image.height/2 - 15)
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.font = '40px Century Gothic'
  ctx.fillStyle = 'blue'
  ctx.textAlign = 'center'
  ctx.fillText("IMPULSE", canvasWidth/2, canvasHeight/2 - 100)
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
    this.buttons[i].on_mouse_move(x, y)
  }
}

CreditsState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

