var Boss = function(world, x, y, id, impulse_game_state) {
  //empty constructor since Enemy should not be constructed
}
Boss.prototype = new Enemy()

Boss.prototype.constructor = Boss
Boss.prototype.init = function(world, x, y, id, impulse_game_state) {

  this.enemy_init(world, x, y, id, impulse_game_state)
  this.spawn_interval = 1000
  this.impulse_extra_factor = 10
  if(this.impulse_game_state.first_time && this.impulse_game_state.level.main_game)
    this.spawn_interval = 6600
  this.require_open = false;
  this.default_dying_length = 5000

  this.spawn_duration = this.spawn_interval
  this.aura_radius = 600;

  this.initial_dark_aura_ratio = 0;
  this.initial_dark_aura_inflection_prop = 0.95;

  if (this.type == "fourth boss") {
    this.initial_dark_aura_inflection_prop = 0.9;
  }

  this.spawn_particles = [];
  this.spawn_particle_num = 10;
  this.spawn_particle_timer = 0;
  this.spawn_particle_radius = 30;
  this.spawn_particle_radius_max = 60;
  this.spawn_particle_duration = 1500 * this.spawn_interval / 6600;
  this.spawn_particle_interval = 250 * this.spawn_interval / 6600;
  this.spawn_particle_travel_prop = 0.6;
}

Boss.prototype.enemy_init = Enemy.prototype.init


Boss.prototype.is_boss = true

Boss.prototype.getLife = function() {
  if(this.dying) {
    return 0
  }
  var dist = Math.min(775/imp_vars.draw_factor - this.body.GetPosition().x, this.body.GetPosition().x - 25/imp_vars.draw_factor)
  var dist2 = Math.min(575/imp_vars.draw_factor - this.body.GetPosition().y, this.body.GetPosition().y - 25/imp_vars.draw_factor)
  return Math.min(dist, dist2)/(275/imp_vars.draw_factor)
}

Boss.prototype.should_show_aura_and_particles = function() {
  return this.impulse_game_state.first_time && this.impulse_game_state.main_game;
}

Boss.prototype.additional_processing = function (dt) {

  if(this.spawn_duration > 0) {
    this.spawn_duration = Math.max(this.spawn_duration - dt, 0)
    var ratio = 1 - this.spawn_duration / this.spawn_interval
    this.visibility = bezier_interpolate(0.15, 0.3, ratio);

    // If this is the first time, show the dark aura and the particles.
    if (this.should_show_aura_and_particles()) {
      if (ratio < this.initial_dark_aura_inflection_prop) {
        this.initial_dark_aura_ratio =
          bezier_interpolate(0.7, 0.85, ratio / this.initial_dark_aura_inflection_prop);
      } else {
        this.initial_dark_aura_ratio = 1 + 2 * (ratio - this.initial_dark_aura_inflection_prop) /
          (1 - this.initial_dark_aura_inflection_prop);
      }

      this.spawn_particle_timer -= dt;
      this.process_spawn_particles(dt);
      if (this.spawn_particle_timer < 0) {
        this.generate_spawn_particles(this.body.GetPosition());
        this.spawn_particle_timer = this.spawn_particle_interval;
      }
    }
    return
  }
  else if(this.spawned == false) {
    this.spawned = true
    this.visibility = 1
  }

  this.boss_specific_additional_processing(dt);
}

Boss.prototype.generate_spawn_particles = function (loc) {
  for (var i = 0; i < this.spawn_particle_num; i++) {
    var r = this.aura_radius / imp_vars.draw_factor * this.initial_dark_aura_ratio * 0.5 + 5;
    var angle = Math.PI * 2 * i / this.spawn_particle_num + (Math.random() - 0.5) * Math.PI * 2 / this.spawn_particle_num
    this.spawn_particles.push({
      start_x: Math.cos(angle) * r + loc.x,
      start_y: Math.sin(angle) * r + loc.y,
      prop: 0
    });
  }
}

Boss.prototype.process_spawn_particles = function (dt) {
  for (var i = 0; i < this.spawn_particles.length; i++) {
    var particle = this.spawn_particles[i];
    particle.prop += dt / this.spawn_particle_duration;
  }
  for (var i = this.spawn_particles.length - 1; i >= 0; i--) {
    var particle = this.spawn_particles[i];
    if (particle.prop > 1) {
      this.spawn_particles.splice(i, 1);
    }
  }
}

Boss.prototype.draw_spawn_particles = function(ctx, draw_factor) {
  var particle_shape = imp_params.impulse_enemy_stats[this.type].death_polygons[0];
  for(var i = 0; i < this.spawn_particles.length; i++) {
    var particle = this.spawn_particles[i];
    ctx.save()
    if (particle.prop < 0.25) {
      ctx.globalAlpha *= particle.prop * 4
    } else {
      var temp = (1 - particle.prop) / (0.75)
      ctx.globalAlpha *= temp
    }
    if (this.black_hole_timer >= 0) {
      ctx.globalAlpha *= 0.5;
    }
    ctx.globalAlpha *= this.get_dark_aura_opacity();
    var x = (particle.start_x * (1 - particle.prop * this.spawn_particle_travel_prop) +
      this.body.GetPosition().x * particle.prop * (this.spawn_particle_travel_prop));
    var y = (particle.start_y * (1 - particle.prop * this.spawn_particle_travel_prop) +
      this.body.GetPosition().y * particle.prop * (this.spawn_particle_travel_prop));
    var ratio = 1 - this.spawn_duration / this.spawn_interval
    var r = this.spawn_particle_radius * (1 - ratio) + this.spawn_particle_radius_max * ratio;
    drawSprite(ctx, x * draw_factor,
      y * draw_factor,
      0, r * Math.min(particle.prop * 2, 1),
      r * Math.min(particle.prop * 2, 1), "dark_aura");

    ctx.restore()
  }
}

Boss.prototype.boss_specific_additional_processing = function(dt) {

}

Boss.prototype.get_dark_aura_opacity = function () {
  if (this.spawned) return 0;
  var ratio = 1 - this.spawn_duration / this.spawn_interval
  if (ratio > this.initial_dark_aura_inflection_prop) {
    return 1 - (ratio - this.initial_dark_aura_inflection_prop) /
      (1 - this.initial_dark_aura_inflection_prop);
  }
  return 1;
}

Boss.prototype.final_draw = function(context, draw_factor) {
  if (!this.spawned && this.should_show_aura_and_particles()) {
    context.save();
    this.draw_spawn_particles(context, draw_factor);
    // Draw the spawning animation.
    var loc = this.body.GetPosition();
    context.globalAlpha *= this.get_dark_aura_opacity();

    drawSprite(context, loc.x * draw_factor,
      loc.y * draw_factor,
      0, this.aura_radius * this.initial_dark_aura_ratio,
      this.aura_radius * this.initial_dark_aura_ratio, "dark_aura")
    context.restore();
  }

  this.boss_specific_final_draw(context, draw_factor);
}

Boss.prototype.boss_specific_final_draw = function(context, draw_factor) {

}

Boss.prototype.additional_death_prep = function () {
  var data = this.impulse_game_state.level.dark_ones_data[0];
  var dark_one = new DarkOne(this.body.GetPosition().x * imp_vars.draw_factor,
   this.body.GetPosition().y * imp_vars.draw_factor,
   this.impulse_game_state, data.msg, data.size, false)
  this.impulse_game_state.level.add_dark_one(dark_one);
  dark_one.move_to(data.x, data.y, 4000);
  dark_one.opacity = 0.7;
  dark_one.explode = true;
  this.additional_death_prep_specific();
}

Boss.prototype.additional_death_prep_specific = function () {}

Boss.prototype.get_impulse_extra_factor = function() {
  return this.impulse_extra_factor;
}

Boss.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  if(this.spawned)  {
    this.body.ApplyImpulse(new b2Vec2(this.get_impulse_extra_factor() * impulse_force * Math.cos(hit_angle), this.get_impulse_extra_factor() * impulse_force * Math.sin(hit_angle)),
      this.body.GetWorldCenter())
    this.process_impulse_specific(attack_loc, impulse_force, hit_angle)
  }
}

Boss.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.knockback_red_duration = this.knockback_red_interval
}


Boss.prototype.stun = function(dur) {}

Boss.prototype.silence = function(dur, color_silence)  {}

Boss.prototype.lock = function(dur)  {}

Boss.prototype.goo = function(dur)  {}

Boss.prototype.lighten = function(dur)  {}

Boss.prototype.open = function(dur)  {}
