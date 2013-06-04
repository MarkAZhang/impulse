var MusicPlayer = function() {

  this.sounds = {}
  this.multisounds = {}
  this.cur_song = null
  this.initialize_multisounds();

  this.playing = {}
  this.mute = player_data.options.music_mute
  this.bg_music_volume = 100
  this.effects_volume = 100
  this.effects_mute = player_data.options.effects_mute
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
  if(this.effects_mute) return
  if(file in this.multisounds) {
    this.play_multisound(file);
    return;
  }

  if(!(file in this.sounds)) {
    this.sounds[file] = new buzz.sound("audio/"+file+".ogg");
  }
  this.sounds[file].setVolume(this.effects_volume);
  this.sounds[file].play();
}

MusicPlayer.prototype.mute_effects = function(mute) {
  this.effects_mute = mute
  player_data.options.effects_mute = mute
  save_game()
}

MusicPlayer.prototype.play_multisound = function(file) {

  for(var i = 0; i < this.multisounds[file].length; i++) {
    if(!this.multisounds[file][i]) {
      this.sounds[file+i].play();
      this.sounds[file+i].setVolume(this.effects_volume);
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

MusicPlayer.prototype.mute_bg = function() {
  this.mute = true
  player_data.options.music_mute = true
  save_game()
  if(this.cur_song) {
    this.sounds[this.cur_song].setVolume(0);
    this.playing[this.cur_song] = false
  }
}

MusicPlayer.prototype.unmute_bg = function() {
  this.mute = false
  player_data.options.music_mute = false
  save_game()
  if(this.cur_song) {
    this.sounds[this.cur_song].setVolume(this.bg_music_volume);
    this.playing[this.cur_song] = true
  }
}

MusicPlayer.prototype.change_bg_volume = function(volume) {
  this.bg_music_volume = volume
  if(this.cur_song && !this.mute) {
    this.sounds[this.cur_song].setVolume(this.bg_music_volume);
  }
}

MusicPlayer.prototype.change_effects_volume = function(volume) {
  this.effects_volume = volume
}

MusicPlayer.prototype.bg_is_playing = function() {
  return this.playing[this.cur_song]
}

MusicPlayer.prototype.play_bg = function(file) {


  if(this.cur_song!= null && this.cur_song != file) {
    var _this = this;
    if(this.sounds[this.cur_song].isPaused()) {
      this.switch_bg(file)
      return

    }
    this.playing[this.cur_song] = false
    this.playing[file] = true
    this.sounds[this.cur_song].fadeOut(500, function() {
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
  if(!this.playing[file]) {
    this.sounds[file].stop()
  }
  if(!this.mute) {
    this.sounds[file].setVolume(this.bg_music_volume);
  } else {
    this.sounds[file].setVolume(0);
  }
  this.sounds[file].play();

  this.playing[file] = true
  this.cur_song = file;
}

MusicPlayer.prototype.pause_bg = function() {

  if(this.cur_song in this.sounds) {
    this.sounds[this.cur_song].pause();
  }

}

MusicPlayer.prototype.stop_bg = function() {
  if(this.cur_song) {
    this.playing[this.cur_song] = false
    var _this = this;
    _this.sounds[_this.cur_song].fadeOut(300, function() {
        if(!_this.playing[_this.cur_song]) {

          _this.sounds[_this.cur_song].stop();
         _this.cur_song = null;
        }
    })
  }
}

MusicPlayer.prototype.resume_bg = function() {
  if(this.cur_song in this.sounds) {
    this.sounds[this.cur_song].play();
  }
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

