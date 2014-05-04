// A class that helps keep track of the visibility for game states that want to fade in and out.
// Also keeps track of the animation so that game states can have multiple different fade in/ out animations.
// Only allows a single animation at a timer.

/*
 * param {Object} animation_durations Map of fade animations to the length of that animation in milliseconds.
 */
var Fader = function(animation_durations) {
  this.animation_durations = animation_durations;
  this.animation = null;
  this.timer = 0;
};

Fader.prototype.set_animation = function(animation, opt_callback) {
  if (this.animation == null) {
    this.animation = animation;
    this.timer = this.animation_durations[animation];
    this.callback = opt_callback;
  }
}

Fader.prototype.process = function(dt) {
  if (this.animation != null && this.timer > 0) {
    this.timer -= dt;
  }
  if (this.animation != null && this.timer <= 0) {
    if (this.callback) {
      this.callback();
    }
    this.animation = null;
  }
}

Fader.prototype.get_animation_progress = function() {
  if (this.animation) {
    return 1 - this.timer / this.animation_durations[this.animation];
  }
  return 0;
}

Fader.prototype.get_current_animation = function() {
  return this.animation;
}
