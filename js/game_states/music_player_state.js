MusicPlayerState.prototype = new GameState

MusicPlayerState.prototype.constructor = MusicPlayerState

function MusicPlayerState() {
  this.songs = {
    "Kickit HomeBoy": "kickit",
    "Driven": "driven"
  }
  this.buttons = []

  this.first_column = canvasWidth*3/8;
  this.second_column = canvasWidth*5/8;
  this.column_top = 300;
  this.column_space = 50;
  this.setup_ui()

  this.cur_song = null
}

MusicPlayerState.prototype.draw = function(context, bg_ctx) {

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  this.slider.draw(ctx)

  if(this.cur_song != null) {
    context.beginPath()
    context.textAlign = "center"
    context.font = "12px Century Gothic"
    context.fillStyle = "gray"
    ctx.fillText("Currently Playing: " + this.cur_song, canvasWidth/2, 175)
  }

}

MusicPlayerState.prototype.setup_ui = function() {

  this.slider = new Slider(canvasWidth/2, 200, canvasWidth/2, 5, "gray") 
  this.slider.value = 0
  this.slider.active = false


  this.buttons.push(new SmallButton("PLAY", 20, canvasWidth/2 - 50, 250, 100, 50,
        
        function() {
          console.log("START")
        }))

  this.buttons.push(new SmallButton("PAUSE", 20, canvasWidth/2 + 50, 250, 100, 50,
        
        function() {
          console.log("PAUSE")
        }))
  this.setup_music_buttons()

}


MusicPlayerState.prototype.setup_music_buttons = function() {

  var index = 0;
  for(song in this.songs) {
    var x = (index%2 == 0) ? this.first_column : this.second_column;
    var _this = this;
    this.buttons.push(new SmallButton(song, 20, x, this.column_top + Math.floor(index/2) * this.column_space, 200, 50,
          (function(this_song) {
          return function() {
            _this.cur_song = this_song;
            impulse_bg_music.play(_this.songs[_this.cur_song])
          }})(song)
          
          ))

    index++

  }
}

MusicPlayerState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
  this.slider.on_mouse_move(x,y)
}

MusicPlayerState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

MusicPlayerState.prototype.on_mouse_down = function(x,y) {
  this.slider.on_mouse_down(x,y)
}


MusicPlayerState.prototype.on_mouse_up = function(x,y) {
  this.slider.on_mouse_up(x,y)
}
