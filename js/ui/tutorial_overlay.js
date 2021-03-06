var constants = require('../data/constants.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');

var Fader = require('../game_states/fader_util.js');
var MessageBox = require('../ui/message_box.js');

var TutorialOverlayManager = function(impulse_game_state) {
  this.overlays = [];
  this.impulse_game_state = impulse_game_state;
    this.initial_delay = 2000;
    if (impulse_game_state.level_name.substring(0, 6) == "HIVE 0")
      this.tutorial_level = parseInt(impulse_game_state.level_name.substring(7)) // Take the X of HIVE 0-X.
    this.add_overlays();
}

TutorialOverlayManager.prototype.on_demand_overlays = [
  {type: "reset_multiplier", class: ResetMultiplierTutorialOverlay}
]

TutorialOverlayManager.prototype.add_overlays = function() {
  if (this.impulse_game_state.is_boss_level && this.impulse_game_state.world_num == 1 && saveData.difficultyMode == "easy" &&
      saveData.hasBeatenLevel(this.impulse_game_state.level_name)) {
    this.overlays.push(new KillBossTutorialOverlay(this.impulse_game_state));
  }

  if (this.tutorial_level == 1) {
    this.overlays.push(new MoveTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new GatewayMoveTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new GatewayEnterTutorialOverlay(this.impulse_game_state));
  } else if (this.tutorial_level == 2) {
    this.overlays.push(new VoidTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new TouchEnemyTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new GatewayMoveTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new GatewayEnterTutorialOverlay(this.impulse_game_state));
  } else if (this.tutorial_level == 3) {
    this.overlays.push(new ImpulseTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new KillEnemyTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new ScorePointsTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new ScorePointsReminderTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new GatewayMoveTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new GatewayEnterTutorialOverlay(this.impulse_game_state));
  } else if (this.tutorial_level == 4) {
    this.overlays.push(new EnemyIncrTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new IncrMultiplierTutorialOverlay(this.impulse_game_state));
    this.overlays.push(new ResetMultiplierTutorialOverlay(this.impulse_game_state));
  } else {
    for (var i = 0; i < this.on_demand_overlays.length; i++) {
      if (saveData.tutorialsShown.indexOf(this.on_demand_overlays[i].type) == -1) {
        this.overlays.push(new this.on_demand_overlays[i].class(this.impulse_game_state));
      }
    }
  }
}

TutorialOverlayManager.prototype.draw = function(ctx) {
  if (this.overlays.length == 0) return;
  this.overlays[0].draw_internal(ctx);
}

TutorialOverlayManager.prototype.process = function(dt) {
  if (this.initial_delay > 0) {
    this.initial_delay -= dt
    return;
  }
  if (this.overlays.length == 0) return;
  this.overlays[0].process_internal(dt);

  // If there's an on-demand overlay that's ready, move it to the front.
  if (!this.overlays[0].is_ready()) {
    for (var i = 1; i < this.overlays.length; i++) {
      if (this.overlays[i].on_demand && this.overlays[i].is_ready()) {
        var on_demand_overlay = this.overlays.splice(i, 1)[0];
        this.overlays.unshift(on_demand_overlay);
        continue;
      }
    }
  }
  // Remove all expired overlays.
  if (this.overlays[0].is_expired()) {
    this.overlays.shift();
    while(this.overlays.length > 0 && this.overlays[0].is_satisfied()) {
      this.overlays.shift();
    }
  }
}

var TutorialOverlay = function() {
  // Should never be constructed.
}

TutorialOverlay.prototype.init = function(impulse_game_state) {
  this.impulse_game_state = impulse_game_state;
  this.fader = new Fader({
      "fade_in": 500,
      "fade_out": 500
  });
  this.expired = false;
  this.duration = null; //null means show until the overlay condition is satisfied.
  this.shown = false;
  this.delay_timer = 0
  this.on_demand = false; // show this out of order if it applies.
}

TutorialOverlay.prototype.draw_internal = function(ctx) {
  ctx.save();
  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  } else if (!this.shown) {
    ctx.globalAlpha = 0;
  }
  ctx.globalAlpha *= 0.8
  if (this.hover_overlay) {
    this.hover_overlay.draw(ctx);
  }
  this.draw(ctx);
  ctx.restore();
}

// Whether we need to wait for an event before showing this overlay.
TutorialOverlay.prototype.is_ready = function() {
  return true;
}

TutorialOverlay.prototype.draw = function(ctx) {}

TutorialOverlay.prototype.process_internal = function(dt) {
  if (!this.is_ready()) return;
  if (!this.shown) {
    if (this.is_satisfied()) {
      this.expired = true;
    } else if (this.delay_timer > 0) {
      this.delay_timer -= dt;
      return;
    } else {
      this.shown = true;
      this.fader.set_animation("fade_in");
      if (this.hover_overlay) {
        this.hover_overlay.set_visible(true);
      }
    }
  }
  if (this.duration > 0) {
    this.duration -= dt;
  }
  if (this.hover_overlay) {
    var pos_x = this.impulse_game_state.player.body.GetPosition().x * constants.drawFactor;
    var pos_y = this.impulse_game_state.player.body.GetPosition().y * constants.drawFactor;
    if (pos_x < this.hover_overlay.w / 2 + 5) {
      pos_x = this.hover_overlay.w / 2 + 5;
    } else if (pos_x > constants.levelWidth - this.hover_overlay.w / 2 - 5) {
      pos_x = constants.levelWidth - this.hover_overlay.w / 2 - 5;
    }

    if (pos_y < this.hover_overlay.h + 55) {
      pos_y += (this.hover_overlay.h + 100);
    }
    this.hover_overlay.set_position(pos_x, pos_y);
  }
  this.fader.process(dt);
  this.process(dt);
  var _this = this;
  if(this.is_satisfied()) {
    this.fader.set_animation("fade_out", function() {
      _this.expired = true;
      _this.on_expire();
    })
  }
}

// Called when the overlay expires.
TutorialOverlay.prototype.on_expire = function() {}

// Whether the player has completed the action to satisfy this overlay.
TutorialOverlay.prototype.satisfaction_criteria = function() {
  return false;
}

// Whether this overlay's condition is satisfied. Can be satisfied by player action, or the duration expiring.
TutorialOverlay.prototype.is_satisfied = function() {
  return this.satisfaction_criteria() || (this.duration != null && this.duration <= 0);
}

// Whether it's time to remove the overlay. This occurs after the fade-out has occurred.
TutorialOverlay.prototype.is_expired = function() {
  return this.expired;
}

TutorialOverlay.prototype.process = function(dt) {}

MoveTutorialOverlay.prototype = new TutorialOverlay;

MoveTutorialOverlay.prototype.constructor = MoveTutorialOverlay;

function MoveTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.hover_overlay = new MessageBox("tutorial_move", impulse_game_state.bright_color, impulse_game_state.world_num);
}

MoveTutorialOverlay.prototype.draw = function(ctx) {
}

MoveTutorialOverlay.prototype.process = function(dt) {

}

MoveTutorialOverlay.prototype.satisfaction_criteria = function() {
  return this.impulse_game_state.tutorial_signals["player_moved"];
}

VoidTutorialOverlay.prototype = new TutorialOverlay;

VoidTutorialOverlay.prototype.constructor = VoidTutorialOverlay;

function VoidTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.hover_overlay = new MessageBox("tutorial_void", impulse_game_state.bright_color, impulse_game_state.world_num);
  this.duration = 3000
}

VoidTutorialOverlay.prototype.draw = function(ctx) {
}

TouchEnemyTutorialOverlay.prototype = new TutorialOverlay;

TouchEnemyTutorialOverlay.prototype.constructor = TouchEnemyTutorialOverlay;

function TouchEnemyTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.hover_overlay = new MessageBox("tutorial_enemy_touch", impulse_game_state.bright_color, impulse_game_state.world_num);
  this.duration = 3000
}

TouchEnemyTutorialOverlay.prototype.draw = function(ctx) {
}

TouchEnemyTutorialOverlay.prototype.process = function(dt) {
}

TouchEnemyTutorialOverlay.prototype.is_ready = function() {
  return this.impulse_game_state.tutorial_signals["enemy_touched"] == "fresh" ||  this.shown;
}

ImpulseTutorialOverlay.prototype = new TutorialOverlay;

ImpulseTutorialOverlay.prototype.constructor = ImpulseTutorialOverlay;

function ImpulseTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.hover_overlay = new MessageBox("tutorial_impulse", impulse_game_state.bright_color, impulse_game_state.world_num);
}

ImpulseTutorialOverlay.prototype.draw = function(ctx) {
}

ImpulseTutorialOverlay.prototype.process = function(dt) {

}

ImpulseTutorialOverlay.prototype.satisfaction_criteria = function() {
  return this.impulse_game_state.tutorial_signals["player_impulsed"];
}

KillEnemyTutorialOverlay.prototype = new TutorialOverlay;

KillEnemyTutorialOverlay.prototype.constructor = KillEnemyTutorialOverlay;

function KillEnemyTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.hover_overlay = new MessageBox("tutorial_kill_enemy", impulse_game_state.bright_color, impulse_game_state.world_num);
  this.delay_timer = 4000
}

KillEnemyTutorialOverlay.prototype.draw = function(ctx) {
}

KillEnemyTutorialOverlay.prototype.process = function(dt) {

}

KillEnemyTutorialOverlay.prototype.satisfaction_criteria = function() {
  return this.impulse_game_state.tutorial_signals["enemy_killed"];
}

PauseTutorialOverlay.prototype = new TutorialOverlay;

PauseTutorialOverlay.prototype.constructor = PauseTutorialOverlay;

function PauseTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.duration = 3000;
  this.hover_overlay = new MessageBox("tutorial_pause", impulse_game_state.bright_color, impulse_game_state.world_num);
}

PauseTutorialOverlay.prototype.is_ready = function() {
  return this.impulse_game_state.tutorial_signals["enemy_killed"];
}

PauseTutorialOverlay.prototype.draw = function(ctx) {
}

PauseTutorialOverlay.prototype.process = function(dt) {

}



ScorePointsTutorialOverlay.prototype = new TutorialOverlay;

ScorePointsTutorialOverlay.prototype.constructor = ScorePointsTutorialOverlay;

function ScorePointsTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.duration = 5000;
  this.hover_overlay = new MessageBox("tutorial_score_points", impulse_game_state.bright_color, impulse_game_state.world_num);
}

ScorePointsTutorialOverlay.prototype.is_ready = function() {
  return this.impulse_game_state.tutorial_signals["enemy_killed"];
}

ScorePointsTutorialOverlay.prototype.draw = function(ctx) {
  ctx.fillStyle = "cyan";
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.textAlign = "center"
  var rw = 120;
  var rh = 80;
  ctx.rect(constants.levelWidth + constants.sideBarWidth/2 - rw/2, 75 - rh/2 - 20, rw, rh);
  ctx.stroke();
  ctx.font = '21px Open Sans'
    ctx.fillText("GOAL", constants.levelWidth + constants.sideBarWidth/2, 45)
    ctx.font = '42px Open Sans'
    ctx.fillText(this.impulse_game_state.level.cutoff_scores[0], constants.levelWidth + constants.sideBarWidth/2, 85)
}

ScorePointsReminderTutorialOverlay.prototype = new TutorialOverlay;

ScorePointsReminderTutorialOverlay.prototype.constructor = ScorePointsReminderTutorialOverlay;

function ScorePointsReminderTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.hover_overlay = new MessageBox("tutorial_score_points", impulse_game_state.bright_color, impulse_game_state.world_num);
  this.delay_timer = 5000
}

ScorePointsReminderTutorialOverlay.prototype.draw = function(ctx) {
  ctx.fillStyle = "cyan";
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.textAlign = "center"
  var rw = 120;
  var rh = 80;
  ctx.rect(constants.levelWidth + constants.sideBarWidth/2 - rw/2, 75 - rh/2 - 20, rw, rh);
  ctx.stroke();
  ctx.font = '21px Open Sans'
    ctx.fillText("GOAL", constants.levelWidth + constants.sideBarWidth/2, 45)
    ctx.font = '42px Open Sans'
    ctx.fillText(this.impulse_game_state.level.cutoff_scores[0], constants.levelWidth + constants.sideBarWidth/2, 85)
}

ScorePointsReminderTutorialOverlay.prototype.satisfaction_criteria = function() {
  return this.impulse_game_state.tutorial_signals["gateway_opened"];
}

EnemyIncrTutorialOverlay.prototype = new TutorialOverlay;

EnemyIncrTutorialOverlay.prototype.constructor = EnemyIncrTutorialOverlay;

function EnemyIncrTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.on_demand = true;
  this.duration = 3000;
  this.hover_overlay = new MessageBox("tutorial_enemy_incr", impulse_game_state.bright_color, impulse_game_state.world_num);
}

EnemyIncrTutorialOverlay.prototype.draw = function(ctx) {

  ctx.textAlign = "center"
  ctx.fillStyle = "cyan";
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 8;
  ctx.beginPath();
  var rw = 120;
  var rh = 70;
  ctx.rect(-constants.sideBarWidth / 2 - rw / 2, constants.canvasHeight/2 - 20 - rh / 2, rw, rh);
  ctx.stroke();
  ctx.font = '16px Open Sans';
  ctx.fillText("LEVEL TIME",  -constants.sideBarWidth/2, constants.canvasHeight/2 - 30);
  ctx.font = '32px Open Sans';
  ctx.fillText(this.impulse_game_state.game_numbers.last_time, -constants.sideBarWidth/2, constants.canvasHeight/2 + 2);
}

EnemyIncrTutorialOverlay.prototype.process = function(dt) {

}

IncrMultiplierTutorialOverlay.prototype = new TutorialOverlay;

IncrMultiplierTutorialOverlay.prototype.constructor = IncrMultiplierTutorialOverlay;

function IncrMultiplierTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.duration = 3000;
  this.hover_overlay = new MessageBox("tutorial_incr_multiplier", impulse_game_state.bright_color, impulse_game_state.world_num);
}

IncrMultiplierTutorialOverlay.prototype.is_ready = function() {
  return this.impulse_game_state.tutorial_signals["enemy_killed"] == "fresh" ||  this.shown;
}

IncrMultiplierTutorialOverlay.prototype.draw = function(ctx) {
  ctx.textAlign = "center"
  ctx.fillStyle = "cyan";
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 8;
  ctx.beginPath();
  var rw = 100;
  var rh = 100;
  ctx.rect(constants.levelWidth + constants.sideBarWidth/2 - rw/2, constants.canvasHeight/2 - rh/2 - 20, rw, rh);
  ctx.stroke();
    ctx.font = '72px Open Sans';
    ctx.fillText("x"+this.impulse_game_state.game_numbers.combo, constants.levelWidth + constants.sideBarWidth/2, constants.canvasHeight/2)
}

IncrMultiplierTutorialOverlay.prototype.process = function(dt) {
}

ResetMultiplierTutorialOverlay.prototype = new TutorialOverlay;

ResetMultiplierTutorialOverlay.prototype.constructor = ResetMultiplierTutorialOverlay;

function ResetMultiplierTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.duration = 3000;
  this.on_demand = true;
  this.hover_overlay = new MessageBox("tutorial_reset_multiplier", impulse_game_state.bright_color, impulse_game_state.world_num);
}

ResetMultiplierTutorialOverlay.prototype.is_ready = function() {
  return this.impulse_game_state.tutorial_signals["multiplier_reset"] == "fresh" ||  this.shown;
}

ResetMultiplierTutorialOverlay.prototype.draw = function(ctx) {
}

ResetMultiplierTutorialOverlay.prototype.process = function(dt) {
}

ResetMultiplierTutorialOverlay.prototype.on_expire = function() {
  if(saveData.tutorialsShown.indexOf("reset_multiplier") == -1) {
    saveData.tutorialsShown.push("reset_multiplier");
    saveData.saveGame();
  }
}

GatewayMoveTutorialOverlay.prototype = new TutorialOverlay;

GatewayMoveTutorialOverlay.prototype.constructor = GatewayMoveTutorialOverlay;

function GatewayMoveTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.gateway_loc = {
    x: this.impulse_game_state.level.gateway_loc.x * constants.drawFactor,
    y: this.impulse_game_state.level.gateway_loc.y * constants.drawFactor};
  this.message_box = new MessageBox("tutorial_gateway_move", impulse_game_state.bright_color, impulse_game_state.world_num);
  this.message_box.set_position(this.gateway_loc.x, this.gateway_loc.y - 30);
  this.message_box.set_visible(true);

}

GatewayMoveTutorialOverlay.prototype.draw = function(ctx) {

    this.message_box.draw(ctx);
  return;

  // draws an error but we no longer use it.
  ctx.globalAlpha *= 0.5
  var offset = (window.performance.now() % 1500) / 1500;
  var prog = 0;
  if (offset > 1/2) {
    prog = (1 - offset) * 2;
  } else {
    prog = offset * 2;
  }
    ctx.beginPath();
    ctx.moveTo(this.gateway_loc.x + 16, this.gateway_loc.y - 82 - prog * 50);
    ctx.lineTo(this.gateway_loc.x, this.gateway_loc.y - 50 - prog * 50);
    ctx.lineTo(this.gateway_loc.x - 16, this.gateway_loc.y - 82 - prog * 50);
    ctx.closePath()
    ctx.lineWidth = 4
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.strokeStyle = "white"
    ctx.stroke();
}

GatewayMoveTutorialOverlay.prototype.process = function(dt) {

}

// Whether we need to wait for an event before showing this overlay.
GatewayMoveTutorialOverlay.prototype.is_ready = function() {
  return this.impulse_game_state.tutorial_signals["gateway_opened"];
}

GatewayMoveTutorialOverlay.prototype.satisfaction_criteria = function() {
  return this.impulse_game_state.tutorial_signals["moved_to_gateway"];
}

GatewayEnterTutorialOverlay.prototype = new TutorialOverlay;

GatewayEnterTutorialOverlay.prototype.constructor = GatewayEnterTutorialOverlay;

function GatewayEnterTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.duration = 3000;
  this.hover_overlay = new MessageBox("tutorial_enter_gateway", impulse_game_state.bright_color, impulse_game_state.world_num);
}

GatewayEnterTutorialOverlay.prototype.draw = function(ctx) {
}

GatewayEnterTutorialOverlay.prototype.process = function(dt) {
}

KillBossTutorialOverlay.prototype = new TutorialOverlay;

KillBossTutorialOverlay.prototype.constructor = KillBossTutorialOverlay;

function KillBossTutorialOverlay(impulse_game_state) {
  this.init(impulse_game_state);
  this.duration = 3000;
  this.hover_overlay = new MessageBox("tutorial_kill_boss", impulse_game_state.bright_color, impulse_game_state.world_num);
}

KillBossTutorialOverlay.prototype.draw = function(ctx) {
}

KillBossTutorialOverlay.prototype.process = function(dt) {
}

var tutorialOverlays = {
  Manager: TutorialOverlayManager,
};

module.exports = tutorialOverlays;
