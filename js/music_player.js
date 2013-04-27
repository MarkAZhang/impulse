var MusicPlayer = function() {

  this.sounds = {}
  this.multisounds = {}
  this.cur_song = null
  this.initialize_multisounds();
}

MusicPlayer.prototype.initialize_multisounds = function() {
  for(var multisound in imp_vars.multisounds) {
    this.initialize_sound_set(imp_vars.multisounds[multisound].file, imp_vars.multisounds[multisound].maxnum);
  }
}

MusicPlayer.prototype.play_sound = function(sound) {
  this.play(imp_vars.sounds[sound])
}

MusicPlayer.prototype.play = function(file) {
  if(file in this.multisounds) {
    this.play_multisound(file);
    return;
  }

  if(!(file in this.sounds)) {
    this.sounds[file] = new buzz.sound("audio/"+file+".ogg");
  }
  this.sounds[file].setVolume(50);
  this.sounds[file].play();
}

MusicPlayer.prototype.play_multisound = function(file) {
  
  for(var i = 0; i < this.multisounds[file].length; i++) {
    if(!this.multisounds[file][i]) {
      this.sounds[file+i].play();
      this.multisounds[file][i] = true;
      return;
    }
  }

}

MusicPlayer.prototype.initialize_sound_set = function(file, maxnum) {
  this.multisounds[file] = []
  for(var i = 0; i < maxnum; i++) {
    this.multisounds[file].push(false);
    this.sounds[file+i] = new buzz.sound("audio/"+file+".ogg");
    var _this = this;
    this.sounds[file+i].bind("ended", (function(index, file) {
            return function(e) {
              // unset play flag after done
              _this.multisounds[file][index] = false;
            }
          })(i, file))

  }


}

MusicPlayer.prototype.switch_bg = function(file) {
  if(this.cur_song) {
    this.sounds[this.cur_song].stop();
  }
  this.cur_song = null;
  this.play_bg(file);

}

MusicPlayer.prototype.pause_bg = function() {
  if(this.cur_song)
    this.sounds[this.cur_song].pause();
}

MusicPlayer.prototype.resume_bg = function() {
  if(this.cur_song)
    this.sounds[this.cur_song].play();
}

MusicPlayer.prototype.play_bg = function(file) {
 if(this.cur_song!= null && this.cur_song != file) {
    var _this = this;
    if(this.sounds[this.cur_song].isPaused()) {
      this.switch_bg(file)
      return

    }
    this.sounds[this.cur_song].fadeOut(1000, function() {
       _this.switch_bg(file)
    })
    return
  }
  if(!(file in this.sounds)) {

    if(file in imp_vars.song_repeats) {
      this.sounds[file] = new buzz.sound("audio/"+file+".ogg");
      this.sounds[file].bind("ended", function(e) {
             this.setTime(imp_vars.song_repeats[file]);
             this.play();
          });

    } else {
    this.sounds[file] = new buzz.sound("audio/"+file+".ogg",{
          loop: true
        });
    }
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

MusicPlayer.prototype.stop_bg = function() {
  if(this.cur_song) {
    var _this = this;
    _this.sounds[_this.cur_song].stop()
    _this.cur_song = null;
  }
}
MusicPlayer.prototype.restart = function(file) {

}

MusicPlayer.prototype.getCurrentSong = function() {
  return {
    title: this.cur_song,
    sound: this.sounds[this.cur_song]
  }
}

MusicPlayer.prototype.getCurrentPercent = function() {
  return this.sounds[this.cur_song].getTime()/this.sounds[this.cur_song].getDuration()
}

MusicPlayer.prototype.skip = function(time) {
  this.sounds[this.cur_song].setTime(time)
}

