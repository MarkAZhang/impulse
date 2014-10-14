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
	if (this.type == "rank_explanation") {
		this.w = 360;
		this.h = 105;
	} else if (this.type == "rank_explanation_normal") {
		this.w = 360;
		this.h = 140;
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
	} else if (this.type == "tutorial_enter_gateway") {
		this.w = 200;
		this.h = 120;
	} else if (this.type == "tutorial_void") {
		this.w = 300;
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
	} else if (this.type == "saved_alert") {
		this.w = 250;
		this.h = 75;
		this.show_box = false;
	} else if (this.type.substring(0, 14) == "level_preview_") {
		this.w = 200;
		this.h = 150;
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
			ctx.fillStyle = "#222"
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
		if(imp_vars.player_data.options.control_hand == "right" && imp_vars.player_data.options.control_scheme == "mouse") {
          draw_arrow_keys(ctx, this.x, this.y, 40, "white", ["W", "A", "S", "D"])
        }
		if(imp_vars.player_data.options.control_hand == "right" && imp_vars.player_data.options.control_scheme == "keyboard") {
          draw_arrow_keys(ctx, this.x, this.y, 40, "white")
        }
        if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
          draw_arrow_keys(ctx, this.x, this.y, 40, "white")
        }
		this.tutorial_text = "MOVE";
	}

	if (this.type == "tutorial_impulse") {
		if(imp_vars.player_data.options.control_scheme == "mouse") {
			draw_mouse(ctx, this.x, this.y - 20, 56, 82, "white")
		} else {
            draw_arrow_keys(ctx, this.x, this.y, 40, "white", ["W", "A", "S", "D"])
		}
		this.tutorial_text = "IMPULSE";
	}

	if (this.type == "tutorial_pause") {
	  if(imp_vars.player_data.options.control_hand == "right") {
	  	this.tutorial_text = "ESC TO PAUSE";
      } else if(imp_vars.player_data.options.control_hand == "left") {
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
		this.tutorial_text = "LEVELS GET HARDER OVER TIME"
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
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = this.color;
		if(imp_vars.player_data.options.control_hand == "right") {
	        draw_rounded_rect(ctx, this.x, this.y - 10, 160, 34, 7, "white")
	        ctx.fillText("SPACEBAR", this.x, this.y - 4)
	    }

	    if(imp_vars.player_data.options.control_hand == "left") {
	        draw_rounded_rect(ctx, this.x, this.y - 10, 80, 34, 7, "white")
	        ctx.fillText("SHIFT", this.x, this.y - 4)
	    }
		this.tutorial_text = "ENTER GATEWAY";
	}

	if (this.type == "tutorial_gateway_move") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = this.color;
		ctx.fillText("MOVE TO THE GATEWAY", this.x, this.y - this.h / 2 + 25);
		draw_full_arrow(ctx, this.x, this.y + 12, 1, "white", "down");
	}

	if (this.type.substring(0, 8) == "tutorial") {
		/*if(imp_vars.player_data.options.control_hand == "right") {
	      draw_arrow_keys(ctx, this.x, this.y, 45, this.color, ["W", "A", "S", "D"])
	    }
	    if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
	      draw_arrow_keys(ctx, this.x, this.y, 45, this.color)
	    }*/
	    if (this.tutorial_text) {
			ctx.textAlign = 'center';
			ctx.font = "16px Muli";
			ctx.fillStyle = this.color;
			ctx.fillText(this.tutorial_text, this.x, this.y + this.h / 2 - 15);
		}
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
	} else if (this.type == "rank_explanation") {
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
	} else if (this.type == "saved_alert") {

		ctx.globalAlpha *= 0.5
		ctx.textAlign = 'center';
		ctx.font = "16px Muli"
		ctx.fillStyle = this.color;
		ctx.save()
		ctx.globalAlpha *= 0.5
	    draw_save_icon(ctx, this.x, this.y - this.h / 2 + 10, 20, this.color)   
		ctx.restore()
		ctx.fillText("GAME SAVED", this.x, this.y + this.h / 2 - 33);
	} else if (this.type.substring(0, 14) == "level_preview_") {
		draw_level_obstacles_within_rect(ctx, this.type.substring(14), this.x, this.y, 200, 150, 
			impulse_colors['world '+ this.world_num + ' lite'])
		ctx.beginPath();
		ctx.rect(this.x - this.w/2, this.y - this.h / 2, this.w, this.h);
		ctx.lineWidth = 6;
		ctx.strokeStyle = impulse_colors['world '+ this.world_num + ' lite'];
		ctx.stroke();
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
		ctx.font = "16px Muli"
		ctx.fillStyle = "white";
		ctx.fillText("NEW ACHIEVEMENT", this.x + x_shift, this.y - this.h / 2 + 30);

		/*ctx.beginPath();
		ctx.strokeStyle = "white"
		ctx.moveTo(this.x - this.w/2 + 10, this.y - this.h / 2 + 25);
		ctx.lineTo(this.x + this.w/2 - 10, this.y - this.h / 2 + 25);
		ctx.lineWidth = 1;
		ctx.stroke();*/

		ctx.font = "12px Muli"
		var quest_text = ""
		for (var i = 0; i < imp_params.quest_data[type].text.length; i++) {
			quest_text += imp_params.quest_data[type].text[i] + " ";
		}
		ctx.fillText(quest_text, this.x + x_shift, this.y + this.h / 2 - 20);

		/* var rewards = imp_params.quest_data[type].rewards;
		if (rewards.length > 0) {
			var reward_gap = 45
			for (var i = 0; i < rewards.length; i++) {
				reward = rewards[i];
				this.draw_reward(ctx, this.x + x_shift - reward_gap * ((rewards.length - 1) / 2 - i), this.y + this.h / 2 - 25, reward);
			}
		}
		ctx.save()
		if (rewards.length > 1 || (rewards.length == 1 && rewards[0] != "ult")) {
			ctx.globalAlpha *= 0.5
			ctx.font = "10px Muli"
			ctx.fillText("(HARD MODE ONLY)", this.x + x_shift, this.y + this.h / 2 - 5);
		}
		ctx.restore()*/
		
		draw_quest_button(ctx, this.x - this.w / 2 + 40, this.y, 60, type)

		//draw_quest_button = function(ctx, x, y, r, type) {
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
	    if(imp_params.impulse_enemy_stats[type].true_name) {
	      true_name = imp_params.impulse_enemy_stats[type].true_name
		}
		ctx.textAlign = 'center';
		ctx.font = "12px Muli"
		ctx.fillStyle = "white";
		ctx.fillText("NEW ENEMY", this.x + x_shift, this.y - this.h / 2 + 20);
		ctx.fillStyle = imp_params.impulse_enemy_stats[type].color
		ctx.font = "24px Muli"
		ctx.fillText(true_name.toUpperCase(), this.x + x_shift, this.y - this.h / 2 + 45);
		ctx.fillStyle = "white";;
		ctx.font = "16px Muli"
		ctx.fillText(imp_params.impulse_enemy_stats[type].snippet.toUpperCase(), this.x + x_shift, this.y + this.h / 2 - 15);
		draw_enemy_button(ctx, this.x - this.w / 2 + 40, this.y, 60, type)
	} else {
		// rewards
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		for (var i = 0; i < imp_params.quest_data[this.type].text.length; i++) {
			var text = imp_params.quest_data[this.type].text[i];
			ctx.fillText(text, this.x, this.y - this.h / 2 + 30 + i * 24);
		}
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