var MusicPlayer = function() {

  this.sounds = {}
  this.multisounds = {}
  this.cur_song = null
  this.initialize_multisounds();

  this.playing = {}
  this.mute = saveData.optionsData.bg_music_mute
  this.effects_mute = saveData.optionsData.effects_mute
}

MusicPlayer.prototype.initialize_multisounds = function() {
  for(var multisound in imp_params.multisounds) {
    this.initialize_sound_set(imp_params.multisounds[multisound].file, imp_params.multisounds[multisound].maxnum);
  }
}

MusicPlayer.prototype.play_sound = function(sound, volume) {
  this.play(imp_params.sounds[sound], volume)
}

MusicPlayer.prototype.play = function(file, volume) {
  if(this.effects_mute) return
  if(file in this.multisounds) {
    this.play_multisound(file);
    return;
  }

  if(!(file in this.sounds)) {
    this.sounds[file] = new buzz.sound("audio/"+file+".ogg");
  }

  this.sounds[file].play();
  //this.sounds[file].setVolume(1);//saveData.optionsData.effects_volume);
  if (volume) {
    this.sounds[file].setVolume(volume);
  } else {
    this.sounds[file].setVolume(saveData.optionsData.effects_volume);
  }
}

MusicPlayer.prototype.mute_effects = function(mute) {
  this.effects_mute = mute
  saveData.optionsData.effects_mute = mute
  saveData.saveGame()
}

MusicPlayer.prototype.play_multisound = function(file) {

  for(var i = 0; i < this.multisounds[file].length; i++) {
    if(!this.multisounds[file][i]) {

      this.sounds[file+i].play();
      this.sounds[file+i].setVolume(saveData.optionsData.effects_volume);
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
  saveData.optionsData.bg_music_mute = true
  saveData.saveGame()
  if(this.cur_song) {
    this.sounds[this.cur_song].setVolume(0);
    this.playing[this.cur_song] = false
  }
}

MusicPlayer.prototype.unmute_bg = function() {
  this.mute = false
  saveData.optionsData.bg_music_mute = false
  saveData.saveGame()
  if(this.cur_song) {
    this.sounds[this.cur_song].setVolume(saveData.optionsData.bg_music_volume);
    this.playing[this.cur_song] = true
  }
}

MusicPlayer.prototype.change_bg_volume = function(volume, save) {
  saveData.optionsData.bg_music_volume = volume
  if(this.cur_song && !this.mute) {
    this.sounds[this.cur_song].setVolume(saveData.optionsData.bg_music_volume);
  }
  if (save) {
    saveData.saveGame()
  }
}

MusicPlayer.prototype.change_effects_volume = function(volume) {
  saveData.optionsData.effects_volume = volume
  saveData.saveGame()
}

MusicPlayer.prototype.bg_is_playing = function() {
  return this.playing[this.cur_song]
}

MusicPlayer.prototype.play_bg = function(file) {
  // if a song is playing and it is different from 'file'
  if(this.cur_song != null && this.cur_song != file) {
    var _this = this;

    // if the song is already paused, just switch it immediately
    if(this.sounds[this.cur_song].isPaused()) {
      this.switch_bg(file)
      return
    }

    this.playing[this.cur_song] = false
    this.playing[file] = true

    // switch the song after fading out for 500ms
    this.sounds[this.cur_song].fadeOut(500, function() {
       _this.switch_bg(file)
    })
    return
  }

  // if the file is not loaded yet, load the sound
  if(!(file in this.sounds)) {

    // if the file needs to loop from mid-way through the song, add a listener
    if(file in imp_params.song_repeats) {
      this.sounds[file] = new buzz.sound("audio/"+file+".ogg");
      this.sounds[file].bind("ended", function(e) {
             this.setTime(imp_params.song_repeats[file]);
             this.play();
          });
    // otherwise, just loop it.
    } else {
      this.sounds[file] = new buzz.sound("audio/"+file+".ogg",{
        loop: true
      });
    }
  }

  // stop the file if it is already playing
  //if(!this.playing[file]) {
  //  this.sounds[file].stop()
  //}
  if(!this.mute) {
    this.sounds[file].setVolume(saveData.optionsData.bg_music_volume);
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
    var current_song = this.cur_song
    _this.sounds[_this.cur_song].fadeOut(300, function() {
        if(_this.cur_song && !_this.playing[_this.cur_song]) {
          _this.sounds[_this.cur_song].stop();
         _this.cur_song = null;
        // in this case, start_bg was called again on the same song before the fade_out happened.
        // in this case, set the volume back to full.
        } else if (_this.cur_song == current_song && _this.playing[_this.cur_song]) {
          _this.sounds[_this.cur_song].setVolume(saveData.optionsData.bg_music_volume)
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

