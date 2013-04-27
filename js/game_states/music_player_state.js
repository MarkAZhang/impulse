MusicPlayerState.prototype = new GameState

MusicPlayerState.prototype.constructor = MusicPlayerState

function MusicPlayerState() {
  this.buttons = []

  this.first_column = canvasWidth*3/8;
  this.second_column = canvasWidth*5/8;
  this.column_top = 300;
  this.column_space = 50;
  this.setup_ui()

  this.cur_song = null
  impulse_music.stop_bg()
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
    var duration = Math.round(impulse_music.getCurrentSong().sound.getDuration())
    var curTime = Math.round(impulse_music.getCurrentSong().sound.getTime())
    var durSecondsString = Math.floor(duration%60)
    if(durSecondsString < 10) durSecondsString = "0"+durSecondsString
    var curSecondsString = Math.floor(curTime%60)
    if(curSecondsString < 10) curSecondsString = "0"+curSecondsString

    ctx.fillText(Math.floor(curTime/60)+":"+curSecondsString, canvasWidth*1/4, 220)
    ctx.fillText(Math.floor(duration/60)+":"+durSecondsString, canvasWidth*3/4, 220)

  }
}

MusicPlayerState.prototype.setup_ui = function() {

  this.slider = new Slider(canvasWidth/2, 200, canvasWidth/2, 5, "gray") 
  this.slider.value = 0
  this.slider.active = false


  this.buttons.push(new SmallButton("PLAY", 20, canvasWidth/2 - 50, 250, 100, 50,
        
        function() {
          impulse_music.resume_bg();
        }))

  this.buttons.push(new SmallButton("PAUSE", 20, canvasWidth/2 + 50, 250, 100, 50,
        
        function() {
          impulse_music.pause_bg();
        }))
  this.setup_music_buttons()

    this.buttons.push(new SmallButton("MAIN MENU", 20, canvasWidth/2, canvasHeight/2+270, 200, 50, function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
}

MusicPlayerState.prototype.setup_music_buttons = function() {

  var index = 0;
  for(song in imp_vars.songs) {
    var x = (index%2 == 0) ? this.first_column : this.second_column;
    var _this = this;
    this.buttons.push(new SmallButton(song, 20, x, this.column_top + Math.floor(index/2) * this.column_space, 200, 50,
          (function(this_song) {
          return function() {
            _this.cur_song = this_song;
            impulse_music.play_bg(imp_vars.songs[_this.cur_song])
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
  if(impulse_music.getCurrentSong().sound != null && this.slider.drag) {
    impulse_music.skip(impulse_music.getCurrentSong().sound.getDuration() * this.slider.value)
  }
  this.slider.on_mouse_up(x,y)
}

MusicPlayerState.prototype.process = function(dt) {
  if(this.cur_song != null && !this.slider.drag) {
    var value = impulse_music.getCurrentPercent()
    this.slider.value = value
  }
}
