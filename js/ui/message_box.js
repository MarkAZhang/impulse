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
	if (this.type == "rank_explanation_easy") {
		this.w = 360;
		this.h = 105;
	} else if (this.type == "rank_explanation_normal") {
		this.w = 360;
		this.h = 140;
	} else if (this.type.substring(0, 9) == "beat_hive") {
		this.w = 150;
		this.h = 120;
	} else if (this.type == "first_gold") {
		this.w = 200;
		this.h = 150;
	} else if (this.type == "combo" || this.type == "pacifist" || this.type == "survivor") {
		this.w = 250;
		this.h = 150;
	} else if (this.type == "fast_time") {
		this.w = 220;
		this.h = 150;
	} else if (this.type == "0star") {
		this.w = 250;
		this.h = 120;
	} else if (this.type == "1star" || this.type == "2star" || this.type == "3star") {
		this.w = 250;
		this.h = 150;
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
	} else if (this.type == "option_defeat_screens") {
		this.w = 300;
		this.h = 40;
	} else if (this.type == "tutorial_move") {
		this.w = 220;
		this.h = 40;
	} else if (this.type == "tutorial_impulse") {
		this.w = 220;
		this.h = 40;
	} else if (this.type == "tutorial_pause") {
		this.w = 220;
		this.h = 40;
	} else if (this.type == "tutorial_score_points") {
		this.w = 380;
		this.h = 40;
	} else if (this.type == "tutorial_enter_gateway") {
		this.w = 300;
		this.h = 40;
	} else if (this.type == "tutorial_void") {
		this.w = 300;
		this.h = 40;
	} else if (this.type == "tutorial_kill_enemy") {
		this.w = 300;
		this.h = 40;
	} else if (this.type == "tutorial_incr_multiplier") {
		this.w = 350;
		this.h = 40;
	} else if (this.type == "tutorial_reset_multiplier") {
		this.w = 350;
		this.h = 40;
	} else if (this.type == "tutorial_one_up") {
		this.w = 250;
		this.h = 40;
	} else if (this.type == "lives_and_sparks") {
		this.w = 150;
		this.h = 110;
		this.has_ult = has_ult();
		this.lives = calculate_lives()
	    this.ultimates = calculate_ult()
		this.spark_val = calculate_spark_val()
	} else if (this.type == "god_mode_alert") {
		this.w = 250;
		this.h = 40;
		this.message = "ALL LEVELS UNLOCKED"
		this.message_only = true
	}

	this.opacity = 0;
	this.world_num = world_num
};

MessageBox.prototype.draw = function(ctx) {
	if(!this.visible) return;
	ctx.save()
	ctx.globalAlpha *= 0.9

	ctx.beginPath();
	ctx.strokeStyle = this.color;
	ctx.fillStyle = "black"
	ctx.shadowBlur = 0;
	ctx.lineWidth = 2;
	ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
	ctx.fill();
	ctx.stroke();

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
	if (this.type == "option_defeat_screens") {
		this.option_text = "SHOW DEFEAT SCREEN ON DEATH"
	}

	if (this.type == "tutorial_move") {
		if(imp_vars.player_data.options.control_hand == "right") {
			this.tutorial_text = "WASD TO MOVE";
	    }
	    if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
	    	this.tutorial_text = "ARROW KEYS TO MOVE";
	    }
	}

	if (this.type == "tutorial_impulse") {
	  if(imp_vars.player_data.options.control_scheme == "mouse") {
	  	this.tutorial_text = "CLICK TO IMPULSE";
      } else {
	  	this.tutorial_text = "ARROW KEYS TO IMPULSE";
      }
	}

	if (this.type == "tutorial_pause") {
	  if(imp_vars.player_data.options.control_hand == "right") {
	  	this.tutorial_text = "ESC TO PAUSE";
      } else if(imp_vars.player_data.options.control_hand == "left") {
      	this.tutorial_text = "ENTER TO PAUSE";
      }
	}

	if (this.type == "tutorial_score_points") {
		this.tutorial_text = "SCORE POINTS TO OPEN GATEWAY"
	}

	if (this.type == "tutorial_incr_multiplier") {
		this.tutorial_text = "KILLING ENEMIES INCREASES MULTIPLIER"
	}

	if (this.type == "tutorial_reset_multiplier") {
		this.tutorial_text = "TOUCHING ENEMIES RESETS MULTIPLIER"
	}
	if (this.type == "tutorial_one_up") {
		this.tutorial_text = "100 SPARKS = 1UP"
	}

	if (this.type == "tutorial_void") {
		this.tutorial_text = "DO NOT TOUCH THE VOID"
	}

	if (this.type == "tutorial_kill_enemy") {
		this.tutorial_text = "IMPULSE THE ENEMY INTO THE VOID"
	}

	if (this.type == "tutorial_enter_gateway") {
		if(imp_vars.player_data.options.control_hand == "right") {
			this.tutorial_text = "SPACEBAR TO ENTER GATEWAY";
        }
        if(imp_vars.player_data.options.control_hand == "left") {
        	this.tutorial_text = "SHIFT TO ENTER GATEWAY";
        }
	}

	if (this.type.substring(0, 8) == "tutorial") {
		/*if(imp_vars.player_data.options.control_hand == "right") {
	      draw_arrow_keys(ctx, this.x, this.y, 45, this.color, ["W", "A", "S", "D"])
	    }
	    if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
	      draw_arrow_keys(ctx, this.x, this.y, 45, this.color)
	    }*/
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = this.color;
		ctx.fillText(this.tutorial_text, this.x, this.y - this.h / 2 + 25);
	} else if (this.type == "rank_explanation_normal") {
		var ytop = this.y - this.h/2;
		/*ctx.textAlign = 'center'
		ctx.font = "20px Muli"
		ctx.fillStyle = "white";
	    ctx.fillText("RANK", this.x, ytop + 20);*/
	    var ysep = 30;
	    var ypaddingtop = 30;
	    var xright = this.x + this.w/2 - 10;
	    var xpaddingright = 10;
	    var victorytypeiconleft = 50;
	    var yvictorytypeoffset = 7;

		draw_victory_type_icon(ctx, this.x - this.w/2 + victorytypeiconleft , ytop - yvictorytypeoffset + ypaddingtop, this.world_num, "half", 0.8);
		draw_victory_type_icon(ctx, this.x - this.w/2 + victorytypeiconleft , ytop - yvictorytypeoffset + ypaddingtop + ysep, this.world_num, "basic", 0.8);
		draw_victory_type_icon(ctx, this.x - this.w/2 + victorytypeiconleft , ytop - yvictorytypeoffset + ypaddingtop + 2 * ysep, this.world_num, "silver", 0.8);
		draw_victory_type_icon(ctx, this.x - this.w/2 + victorytypeiconleft , ytop - yvictorytypeoffset + ypaddingtop + 3 * ysep, this.world_num, "gold", 0.8);
		ctx.textAlign = 'right';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
	    ctx.fillText("ONE OR MORE CONTINUES", xright - xpaddingright, ytop + ypaddingtop);
	    ctx.fillText("NO CONTINUES USED", xright - xpaddingright, ytop + ypaddingtop + ysep);
	    ctx.fillText("SILVER SCORE ON EVERY LEVEL", xright - xpaddingright, ytop + ypaddingtop + 2 * ysep);
	    ctx.fillText("GOLD SCORE ON EVERY LEVEL", xright - xpaddingright, ytop + ypaddingtop + 3 * ysep);
	} else if (this.type == "rank_explanation_easy") {
		var ytop = this.y - this.h/2;
		/*ctx.textAlign = 'center'
		ctx.font = "20px Muli"
		ctx.fillStyle = "white";
	    ctx.fillText("RANK", this.x, ytop + 20);*/
	    var ysep = 30;
	    var ypaddingtop = 30;
	    var xright = this.x + this.w/2 - 10;
	    var xpaddingright = 10;
	    var victorytypeiconleft = 50;
	    var yvictorytypeoffset = 7;

		draw_victory_type_icon(ctx, this.x - this.w/2 + victorytypeiconleft , ytop - yvictorytypeoffset + ypaddingtop, this.world_num, "basic", 0.8);
		draw_victory_type_icon(ctx, this.x - this.w/2 + victorytypeiconleft , ytop - yvictorytypeoffset + ypaddingtop + 1 * ysep, this.world_num, "silver", 0.8);
		draw_victory_type_icon(ctx, this.x - this.w/2 + victorytypeiconleft , ytop - yvictorytypeoffset + ypaddingtop + 2 * ysep, this.world_num, "gold", 0.8);
		ctx.textAlign = 'right';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
	    ctx.fillText("DEFEAT HIVE", xright - xpaddingright, ytop + ypaddingtop);
	    ctx.fillText("SILVER SCORE ON EVERY LEVEL", xright - xpaddingright, ytop + ypaddingtop + 1 * ysep);
	    ctx.fillText("GOLD SCORE ON EVERY LEVEL", xright - xpaddingright, ytop + ypaddingtop + 2 * ysep);
	} else if (this.type.substring(0, 6) == "option") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = this.color;
		ctx.fillText(this.option_text, this.x, this.y - this.h / 2 + 25);
	} else if (this.type == "lives_and_sparks") {
		ctx.textAlign = 'center';
		ctx.font = "12px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("STARTING VALUES", this.x, this.y - this.h / 2 + 20);
	  draw_lives_and_sparks(
	      ctx, this.lives, this.spark_val, this.ultimates, 
	      this.x, this.y + 5, 20, {
	        labels: true,
	        starting_values: true,
	        ult: this.has_ult, 
	        sparks: true,
	        lives: true
	      })
	} else if (this.message_only) {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = this.color;
		ctx.fillText(this.message, this.x, this.y - this.h / 2 + 25);
	} else {
		// rewards
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		for (var i = 0; i < imp_params.quest_data[this.type].text.length; i++) {
			var text = imp_params.quest_data[this.type].text[i];
			ctx.fillText(text, this.x, this.y - this.h / 2 + 40 + i * 24);
		}
		this.draw_rewards(ctx, this.type);
	}
	ctx.restore();
};

MessageBox.prototype.draw_rewards = function(ctx, type) {
	ctx.font = "12px Muli";
	var reward_y = this.y + this.h / 2 - 20
	ctx.beginPath();
	ctx.moveTo(this.x - this.w/2 + 10, reward_y - 40);
	ctx.lineTo(this.x + this.w/2 - 10, reward_y - 40);
	ctx.strokeStyle = "white"
	ctx.lineWidth = 1;
	ctx.stroke();
	if (this.completed) {
		ctx.fillText("COMPLETED", this.x, reward_y - 20);
	} else {
		ctx.fillText("REWARD", this.x, reward_y - 20);
	}
	var rewards = imp_params.quest_data[this.type].rewards;
	if (rewards.length > 0) {
		var reward_gap = 45
		for (var i = 0; i < rewards.length; i++) {
			reward = rewards[i];
			this.draw_reward(ctx, this.x - reward_gap * ((rewards.length - 1) / 2 - i), reward_y, reward);
		}
	} else {
		ctx.font = "12px Muli";
		ctx.fillStyle = impulse_colors["impulse_blue"];
		ctx.textAlign = 'center';	
		ctx.fillText("NEW UPCOMING GAME MODE", this.x, reward_y)
	}
}

MessageBox.prototype.draw_reward = function(ctx, x, y, type) {
	var size = 18;
	ctx.font = "15px Muli";
	ctx.fillStyle = "white";
	ctx.textAlign = 'center';
	ctx.fillText("+1", x - size/2, y + 5);
	if (type == "spark") {
		drawSprite(ctx, x + size/2, y, 0, 0.8 * size, 0.8 * size, "sparks_icon")
	}
	if (type == "life") {
		drawSprite(ctx, x + size/2, y, 0, size, size, "lives_icon")
	}
	if (type == "ult") {
		drawSprite(ctx, x + size/2, y, 0, size, size, "ultimate_icon")
	}
}

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