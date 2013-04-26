var MusicPlayer = function() {

  this.sounds = {}
  this.cur_song = null
}

MusicPlayer.prototype.play = function(file) {

  if(this.cur_song!= null && this.cur_song != file) {
    var _this = this;
    this.sounds[this.cur_song].fadeOut(1000, function() {
      if(_this.cur_song) {
        _this.sounds[_this.cur_song].stop();
      }
      _this.cur_song = null;
      _this.play(file);

    })
    return
  }
  if(!(file in this.sounds)) {
    this.sounds[file] = new buzz.sound("audio/"+file+".ogg");
  }
  this.sounds[file].setVolume(100);
  this.sounds[file].play();
  this.cur_song = file;

}

MusicPlayer.prototype.pause = function(file) {

  if(file in this.sounds) {
    this.sounds[file].pause();
  } 

}
MusicPlayer.prototype.restart = function(file) {

}

MusicPlayer.prototype.getCurrentSong = function() {
  return {
    song: cur_song,

  }
}

