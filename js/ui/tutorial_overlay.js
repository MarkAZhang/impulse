var TutorialOverlayManager = function(impulse_game_state) {
	this.overlays = [];
	this.impulse_game_state = impulse_game_state;
  	this.add_overlays();
  	this.initial_delay = 3000;
}

TutorialOverlayManager.prototype.add_overlays = function() {
	this.overlays.push(new MoveTutorialOverlay(this.impulse_game_state));
	this.overlays.push(new ImpulseTutorialOverlay(this.impulse_game_state));
	//this.overlays.push(new KillEnemyTutorialOverlay(this.impulse_game_state));
	this.overlays.push(new PauseTutorialOverlay(this.impulse_game_state));
	//this.overlays.push(new ScorePointsTutorialOverlay(this.impulse_game_state));
	this.overlays.push(new GatewayMoveTutorialOverlay(this.impulse_game_state));
	this.overlays.push(new GatewayEnterTutorialOverlay(this.impulse_game_state));
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
	    "fade_in": 1000,
	    "fade_out": 1000
	});
	this.expired = false;
	this.duration = null; //null means show until the overlay condition is satisfied.
	this.shown = false;
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
		var pos = this.impulse_game_state.player.body.GetPosition();
		this.hover_overlay.set_position(pos.x * imp_vars.draw_factor, pos.y * imp_vars.draw_factor);
	}
	this.fader.process(dt);
	this.process(dt);
	var _this = this;
	if(this.is_satisfied()) {
		this.fader.set_animation("fade_out", function() {
			_this.expired = true;
		})
	}
}

// Whether the player has completed the action to satisfy this overlay.
TutorialOverlay.prototype.satisfaction_criteria = function() { 
	return false;
}

// Whether this overlay's condition is satisfied. Can be satisfied by player action, or the duration expiring.
TutorialOverlay.prototype.is_satisfied = function() {
	return this.satisfaction_criteria() || this.duration < 0;
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
	this.hover_overlay = new HoverOverlay("tutorial_move", impulse_game_state.bright_color, impulse_game_state.world_num);
}

MoveTutorialOverlay.prototype.draw = function(ctx) {
}

MoveTutorialOverlay.prototype.process = function(dt) {

}

MoveTutorialOverlay.prototype.satisfaction_criteria = function() {
	return this.impulse_game_state.tutorial_signals["player_moved"];
}

ImpulseTutorialOverlay.prototype = new TutorialOverlay;

ImpulseTutorialOverlay.prototype.constructor = ImpulseTutorialOverlay;

function ImpulseTutorialOverlay(impulse_game_state) {
	this.init(impulse_game_state);
	this.hover_overlay = new HoverOverlay("tutorial_impulse", impulse_game_state.bright_color, impulse_game_state.world_num);
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
}

KillEnemyTutorialOverlay.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.font = "24px Muli";
	ctx.fillStyle = "red";
	ctx.fillText("KILL ENEMY",
		this.impulse_game_state.player.body.GetPosition().x*imp_vars.draw_factor, 
		this.impulse_game_state.player.body.GetPosition().y*imp_vars.draw_factor);
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
	this.hover_overlay = new HoverOverlay("tutorial_pause", impulse_game_state.bright_color, impulse_game_state.world_num);
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
	this.duration = 3000;
	this.hover_overlay = new HoverOverlay("tutorial_score_points", impulse_game_state.bright_color, impulse_game_state.world_num);
}

ScorePointsTutorialOverlay.prototype.draw = function(ctx) {
}

ScorePointsTutorialOverlay.prototype.process = function(dt) {

}

ScorePointsTutorialOverlay.prototype.satisfaction_criteria = function() {
	return this.impulse_game_state.tutorial_signals["gateway_opened"];
}


GatewayMoveTutorialOverlay.prototype = new TutorialOverlay;

GatewayMoveTutorialOverlay.prototype.constructor = GatewayMoveTutorialOverlay;

function GatewayMoveTutorialOverlay(impulse_game_state) {
	this.init(impulse_game_state);
}

GatewayMoveTutorialOverlay.prototype.draw = function(ctx) {
	var loc = {
		x: this.impulse_game_state.level.gateway_loc.x * imp_vars.draw_factor,
		y: this.impulse_game_state.level.gateway_loc.y * imp_vars.draw_factor};	
	var offset = (window.performance.now() % 1500) / 1500;
	var prog = 0;
	if (offset > 2/3) {
		prog = (1 - offset) * 3;
	} else {
		prog = offset * 1.5;
	}
	/*draw_arrow(ctx, loc.x - 45, loc.y, 25, "right", "red", false)
    draw_arrow(ctx, loc.x + 45, loc.y, 25, "left", "red", false)*/
    ctx.beginPath();
    ctx.moveTo(loc.x, loc.y - 75 - prog * 20);
    ctx.lineTo(loc.x, loc.y - 55 - prog * 20);
    ctx.lineWidth = 8
    ctx.strokeStyle = "white"
    ctx.stroke();
    draw_arrow(ctx, loc.x, loc.y - 50 - prog * 20, 25, "down", "white", false)
    //draw_arrow(ctx, loc.x, loc.y + 45, 25, "up", "red", false)
    /*ctx.beginPath()
    ctx.arc(loc.x, loc.y, 50, 0, 2 * Math.PI)
    ctx.lineWidth = 8
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'red'
    ctx.stroke()*/
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
	this.hover_overlay = new HoverOverlay("tutorial_enter_gateway", impulse_game_state.bright_color, impulse_game_state.world_num);
}

GatewayEnterTutorialOverlay.prototype.draw = function(ctx) {
}

GatewayEnterTutorialOverlay.prototype.process = function(dt) {
	if (imp_vars.player_data.first_time) {
		// This marks the end of the tutorial. When this message is shown, we will not show the tutorial again.
		imp_vars.player_data.first_time = false;
		save_game();		
	}
}