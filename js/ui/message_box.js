var constants = require('../data/constants.js');
var enemyData = require('../data/enemy_data.js');
var iconRenderUtils = require('../render/icons.js');
var questData = require('../data/quest_data.js');
var questRenderUtils = require('../render/quest.js');
var renderUtils = require('../render/utils.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');

var MessageBox = function(type, color, world_num, completed) {
  if(!color) return
  this.init(type, color, world_num, completed)
};

MessageBox.prototype.init = function(type, color, world_num, completed) {
	this.type = type;
	this.color = color;
	this.completed = completed;
	this.x = 0;
	this.y = 0;
	this.visible = false;
	this.message_only = false;
	this.show_box = true
	if (this.type == "fullscreen_msg") {
		this.w = 230;
		this.h = 40;
	} else if (this.type == "mute_msg") {
		this.w = 130;
		this.h = 40;
	} else if (this.type == "final_boss") {
		this.w = 220;
		this.h = 50;
	} else if (this.type.substring(0, 10) == "blitz_hive") {
		this.w = 250;
		this.h = 75;
	} else if (this.type.substring(0, 9) == "beat_hive") {
		this.w = 150;
		this.h = 50;
	} else if (this.type == "high_roller") {
		this.w = 250;
		this.h = 75;
	} else if (this.type == "untouchable") {
		this.w = 200;
		this.h = 75;
	} else if (this.type == "combo" || this.type == "pacifist" || this.type == "survivor") {
		this.w = 250;
		this.h = 75;
	} else if (this.type == "fast_time") {
		this.w = 220;
		this.h = 150;
	} else if (this.type == "0star") {
		this.w = 250;
		this.h = 75;
	} else if (this.type == "beat_hard") {
		this.w = 180;
		this.h = 75;
	} else if (this.type == "option_game_music") {
		this.w = 300;
		this.h = 40;
	} else if (this.type == "option_sound_effects") {
		this.w = 250;
		this.h = 40;
	} else if (this.type == "option_fullscreen") {
		this.w = 150;
		this.h = 40;
	} else if (this.type == "option_particle_effects") {
		this.w = 250;
		this.h = 40;
	} else if (this.type == "option_score_labels") {
		this.w = 350;
		this.h = 40;
	} else if (this.type == "option_multiplier_display") {
		this.w = 300;
		this.h = 40;
	} else if (this.type == "option_impulse_shadow") {
		this.w = 350;
		this.h = 40;
	} else if (this.type == "option_speed_run") {
		this.w = 500;
		this.h = 40;
	} else if (this.type == "tutorial_move") {
		this.w = 200;
		this.h = 150;
	} else if (this.type == "tutorial_impulse") {
		this.w = 180;
		this.h = 150;
	} else if (this.type == "tutorial_pause") {
		this.w = 220;
		this.h = 40;
	} else if (this.type == "tutorial_gateway_move") {
		this.w = 220;
		this.h = 80;
	} else if (this.type == "tutorial_score_points") {
		this.w = 450;
		this.h = 40;
	} else if (this.type == "tutorial_enemy_incr") {
		this.w = 420;
		this.h = 40;
	} else if (this.type == "tutorial_enemy_touch") {
		this.w = 350;
		this.h = 40;
	} else if (this.type == "tutorial_enter_gateway") {
		this.w = 200;
		this.h = 120;
	} else if (this.type == "tutorial_void") {
		this.w = 350;
		this.h = 40;
	} else if (this.type == "tutorial_kill_enemy") {
		this.w = 300;
		this.h = 40;
	} else if (this.type == "tutorial_incr_multiplier") {
		this.w = 400;
		this.h = 40;
	} else if (this.type == "tutorial_reset_multiplier") {
		this.w = 400;
		this.h = 40;
	} else if (this.type == "tutorial_one_up") {
		this.w = 250;
		this.h = 40;
	} else if (this.type == "tutorial_kill_boss") {
		this.w = 300;
		this.h = 40;
	} else if (this.type == "god_mode_alert") {
		this.w = 250;
		this.h = 40;
		this.message = "ALL LEVELS UNLOCKED"
		this.message_only = true
	} else if (this.type == "saved_alert") {
		this.w = 250;
		this.h = 75;
		this.show_box = false;
	} else if (this.type.substring(0, 6) == "quest_") {
		this.w = 420;
		this.h = 90;
		this.show_box = false;
	} else if (this.type.substring(0, 6) == "enemy_") {
		this.w = 420;
		this.h = 90;
		this.show_box = false;
	}

	this.opacity = 0;
	this.world_num = world_num
};

MessageBox.prototype.draw = function(ctx) {
	if(!this.visible) return;
	ctx.save()

	if (this.show_box) {
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		if (this.type.substring(0, 8) == "tutorial") {
			ctx.fillStyle = "#111"
		} else {
			ctx.fillStyle = "black"
		}

		ctx.shadowBlur = 0;
		ctx.lineWidth = 2;
		ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
		ctx.fill();
		ctx.stroke();
	}

	if (this.type == "option_game_music") {
		this.option_text = "BACKGROUND MUSIC VOLUME"
	}
	if (this.type == "option_sound_effects") {
		this.option_text = "SOUND EFFECTS VOLUME"
	}
	if (this.type == "option_fullscreen") {
		this.option_text = "GO FULLSCREEN"
	}
	if (this.type == "option_particle_effects") {
		this.option_text = "SHOW PARTICLE EFFECTS"
	}
	if (this.type == "option_score_labels") {
		this.option_text = "SHOW SCORE VALUE WHEN ENEMIES DIE"
	}
	if (this.type == "option_multiplier_display") {
		this.option_text = "SHOW MULTIPLIER BELOW PLAYER"
	}
	if (this.type == "option_impulse_shadow") {
		this.option_text = "SHOW AIMING SHADOW FOR IMPULSE"
	}
	if (this.type == "option_speed_run") {
		this.option_text = "SHOW COUNTDOWN FOR BEATING SPEED RUN CHALLENGE"
	}

	if (this.type == "tutorial_move") {
		if(saveData.optionsData.control_hand == "right" && saveData.optionsData.control_scheme == "mouse") {
          uiRenderUtils.drawArrowKeys(ctx, this.x, this.y, 40, "white", ["W", "A", "S", "D"])
        }
		if(saveData.optionsData.control_hand == "right" && saveData.optionsData.control_scheme == "keyboard") {
          uiRenderUtils.drawArrowKeys(ctx, this.x, this.y, 40, "white")
        }
        if(saveData.optionsData.control_hand == "left" && saveData.optionsData.control_scheme == "mouse") {
          uiRenderUtils.drawArrowKeys(ctx, this.x, this.y, 40, "white")
        }
		this.tutorial_text = "MOVE";
	}

	if (this.type == "tutorial_impulse") {
		if(saveData.optionsData.control_scheme == "mouse") {
			uiRenderUtils.drawMouse(ctx, this.x, this.y - 20, 56, 82, "white")
		} else {
            uiRenderUtils.drawArrowKeys(ctx, this.x, this.y, 40, "white", ["W", "A", "S", "D"])
		}
		this.tutorial_text = "IMPULSE";
	}

	if (this.type == "tutorial_pause") {
	  if(saveData.optionsData.control_hand == "right") {
	  	this.tutorial_text = "ESC TO PAUSE";
      } else if(saveData.optionsData.control_hand == "left") {
      	this.tutorial_text = "ENTER TO PAUSE";
      }
	}

	if (this.type == "tutorial_score_points") {
		this.tutorial_text = "GET THE GOAL SCORE TO OPEN THE GATEWAY"
	}

	if (this.type == "tutorial_incr_multiplier") {
		this.tutorial_text = "KILLING ENEMIES INCREASES YOUR MULTIPLIER"
	}

	if (this.type == "tutorial_reset_multiplier") {
		this.tutorial_text = "TOUCHING ENEMIES RESETS YOUR MULTIPLIER"
	}

	if (this.type == "tutorial_enemy_incr") {
		this.tutorial_text = "ENEMIES SPAWN FASTER OVER TIME"
	}

	if (this.type == "tutorial_enemy_touch") {
		this.tutorial_text = "TOUCHING THIS ENEMY WILL STUN YOU"
	}

	if (this.type == "tutorial_kill_boss") {
		this.tutorial_text = "PUSH THE BOSS INTO THE VOID"
	}

	if (this.type == "tutorial_void") {
		this.tutorial_text = "TOUCHING THE VOID WILL KILL YOU"
	}

	if (this.type == "tutorial_kill_enemy") {
		this.tutorial_text = "IMPULSE THE ENEMY INTO THE VOID"
	}

	if (this.type == "tutorial_enter_gateway") {
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans";
		ctx.fillStyle = this.color;
		if(saveData.optionsData.control_hand == "right") {
	        renderUtils.drawRoundedRect(ctx, this.x, this.y - 10, 160, 34, 7, "white")
	        ctx.fillText("SPACEBAR", this.x, this.y - 4)
	    }

	    if(saveData.optionsData.control_hand == "left") {
	        renderUtils.drawRoundedRect(ctx, this.x, this.y - 10, 80, 34, 7, "white")
	        ctx.fillText("SHIFT", this.x, this.y - 4)
	    }
		this.tutorial_text = "ENTER GATEWAY";
	}

	if (this.type == "tutorial_gateway_move") {
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans";
		ctx.fillStyle = this.color;
		ctx.fillText("MOVE TO THE GATEWAY", this.x, this.y - this.h / 2 + 25);
		uiRenderUtils.drawFullArrow(ctx, this.x, this.y + 12, 1, "white", "down");
	}

	if (this.type == "fullscreen_msg") {
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans";
		ctx.fillStyle = this.color;
		ctx.fillText("TOGGLE FULLSCREEN (F)", this.x, this.y - this.h / 2 + 25);
	} else if (this.type == "mute_msg") {
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans";
		ctx.fillStyle = this.color;
		ctx.fillText("MUTE (M)", this.x, this.y - this.h / 2 + 25);
	} else if (this.type.substring(0, 8) == "tutorial") {
		/*if(saveData.optionsData.control_hand == "right") {
	      uiRenderUtils.drawArrowKeys(ctx, this.x, this.y, 45, this.color, ["W", "A", "S", "D"])
	    }
	    if(saveData.optionsData.control_hand == "left" && saveData.optionsData.control_scheme == "mouse") {
	      uiRenderUtils.drawArrowKeys(ctx, this.x, this.y, 45, this.color)
	    }*/
	    if (this.tutorial_text) {
			ctx.textAlign = 'center';
			ctx.font = "16px Open Sans";
			ctx.fillStyle = this.color;
			ctx.fillText(this.tutorial_text, this.x, this.y + this.h / 2 - 15);
		}
	} else if (this.type.substring(0, 6) == "option") {
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans";
		ctx.fillStyle = this.color;
		ctx.fillText(this.option_text, this.x, this.y - this.h / 2 + 25);
	} else if (this.message_only) {
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans";
		ctx.fillStyle = this.color;
		ctx.fillText(this.message, this.x, this.y - this.h / 2 + 25);
	} else if (this.type == "saved_alert") {

		ctx.globalAlpha *= 0.5
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans"
		ctx.fillStyle = this.color;
		ctx.save()
		ctx.globalAlpha *= 0.5
	    iconRenderUtils.drawSaveIcon(ctx, this.x, this.y - this.h / 2 + 10, 20, this.color)
		ctx.restore()
		ctx.fillText("GAME SAVED", this.x, this.y + this.h / 2 - 33);
	} else if (this.type.substring(0, 6) == "quest_")  {
		ctx.beginPath();
		ctx.fillStyle = "black"
		ctx.shadowBlur = 0;
		ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
		ctx.fill();
		ctx.beginPath();
		var x_left_edge = this.x - this.w/2 + 75;
		ctx.moveTo(this.x + this.w/2, this.y - this.h/2)
		ctx.lineTo(this.x + this.w/2, this.y + this.h/2)
		ctx.lineTo(x_left_edge, this.y + this.h/2)
		ctx.moveTo(this.x + this.w/2, this.y - this.h/2)
		ctx.lineTo(x_left_edge, this.y - this.h/2)
		ctx.strokeStyle = "white"
		ctx.lineWidth = 2;
		ctx.stroke()
		var x_shift = 50;

		var type = this.type.substring(6);
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans"
		ctx.fillStyle = "white";
		ctx.fillText("NEW ACHIEVEMENT", this.x + x_shift, this.y - this.h / 2 + 30);

		/*ctx.beginPath();
		ctx.strokeStyle = "white"
		ctx.moveTo(this.x - this.w/2 + 10, this.y - this.h / 2 + 25);
		ctx.lineTo(this.x + this.w/2 - 10, this.y - this.h / 2 + 25);
		ctx.lineWidth = 1;
		ctx.stroke();*/

		ctx.font = "12px Open Sans"
		var quest_text = ""
		if (questData[type]) {
			for (var i = 0; i < questData[type].text.length; i++) {
				quest_text += questData[type].text[i] + " ";
			}
		}

		ctx.fillText(quest_text, this.x + x_shift, this.y + this.h / 2 - 20);

		questRenderUtils.draw_quest_button(ctx, this.x - this.w / 2 + 40, this.y, 60, type)

		//questRenderUtils.draw_quest_button = function(ctx, x, y, r, type) {
	} else if (this.type.substring(0, 6) == "enemy_")  {
		ctx.beginPath();
		ctx.fillStyle = "black"
		ctx.shadowBlur = 0;
		ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
		ctx.fill();
		ctx.beginPath();
		var x_left_edge = this.x - this.w/2 + 75;
		ctx.moveTo(this.x + this.w/2, this.y - this.h/2)
		ctx.lineTo(this.x + this.w/2, this.y + this.h/2)
		ctx.lineTo(x_left_edge, this.y + this.h/2)
		ctx.moveTo(this.x + this.w/2, this.y - this.h/2)
		ctx.lineTo(x_left_edge, this.y - this.h/2)
		ctx.strokeStyle = "white"
		ctx.lineWidth = 2;
		ctx.stroke()
		var x_shift = 50;


		var type = this.type.substring(6);
		var true_name = type;
	    if(enemyData[type].true_name) {
	      true_name = enemyData[type].true_name
		}
		ctx.textAlign = 'center';
		ctx.font = "12px Open Sans"
		ctx.fillStyle = "white";
		ctx.fillText("NEW ENEMY", this.x + x_shift, this.y - this.h / 2 + 20);
		ctx.fillStyle = enemyData[type].color
		ctx.font = "24px Open Sans"
		ctx.fillText(true_name.toUpperCase(), this.x + x_shift, this.y - this.h / 2 + 45);
		ctx.fillStyle = "white";;
		ctx.font = "16px Open Sans"
		ctx.fillText(enemyData[type].snippet.toUpperCase(), this.x + x_shift, this.y + this.h / 2 - 15);
		uiRenderUtils.drawEnemyButton(ctx, this.x - this.w / 2 + 40, this.y, 60, type)
	} else {
		// rewards
		ctx.textAlign = 'center';
		ctx.font = "16px Open Sans";
		ctx.fillStyle = "white";
		for (var i = 0; i < questData[this.type].text.length; i++) {
			var text = questData[this.type].text[i];
			ctx.fillText(text, this.x, this.y - this.h / 2 + 30 + i * 24);
		}
	}
	ctx.restore();
};

MessageBox.prototype.set_visible = function(visibility) {
	this.visible = visibility;
}

// Mouse x and y are passed in. The actual x, y position is also based on type, w, and h.
MessageBox.prototype.set_position = function(mx, my) {
	this.x = mx;
	this.y = my + this.h/2;

	if (this.type.substring(0, 6) == "option") {
		this.y += 20
	}

	if (this.type.substring(0, 8) == "tutorial") {
		this.x = mx;
		this.y = my - this.h/2 - 50;
	}
}

module.exports = MessageBox;
