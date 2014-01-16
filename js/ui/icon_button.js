IconButton.prototype = new ImpulseButton()

IconButton.prototype.constructor = IconButton

function IconButton(text, size, x, y, w, h, color, hcolor, action, icon) {

  this.text = text
  this.size = size
  this.real_size = size
  this.init(x, y, w, h, action, false, color)
  
  this.hover_color = hcolor
  this.shadow = false;
  this.icon = icon
  this.active = true
  this.bg_color = null//"black"
  this.underline_on_hover = true
  //this.border = true
}

IconButton.prototype.additional_draw = function(context) {
  context.save() 
  this.draw_icon(context)
  context.beginPath()
  context.textAlign = 'center'
  context.font = this.size+'px Muli';
  if (this.hover && this.underline_on_hover) {
    context.beginPath();
    var textWidth = context.measureText(this.text).width;
    context.moveTo(this.x - textWidth/2, this.y + this.h * 0.4);
    context.lineTo(this.x + textWidth/2, this.y + this.h * 0.4);
    context.strokeStyle = this.hover_color ? this.hover_color : this.color
    context.lineWidth = 2;
    context.stroke();
  }

  //context.font = this.hover ? (1.25 * this.size)+'px Muli' : this.size+'px Muli'
  
  if(!this.active && (this.icon.slice(0, 8) == "practice")) {
    context.globalAlpha *= 0.4
  }
  //context.fillStyle = this.hover ? this.hover_color : this.color
  context.fillStyle = this.hover ? this.hover_color : this.color
  if(this.shadow) {
    context.shadowBlur = 5
    context.shadowColor = context.fillStyle
  } else {
    context.shadowBlur = 0
  }
  if (this.icon.slice(0, 8) == "practice") {
    context.fillText(this.text, this.x, this.y + this.h/6)  
  } else {
    context.fillText(this.text, this.x, this.y + this.h/3)
  }

  if (this.extra_text) {
    context.font = this.size * 0.7 +'px Muli';
    context.fillText(this.extra_text, this.x, this.y + this.h/3 + 0.9 * this.size)
  }
  
  context.fill()
  /*if(this.hover) {
    context.beginPath();
    var textWidth = context.measureText(this.text).width;
    context.moveTo(this.x - textWidth/2, this.y + this.h/5);
    context.lineTo(this.x + textWidth/2, this.y + this.h/5);
    context.strokeStyle = context.fillStyle;
    context.lineWidth = 1;
    context.stroke();
  }*/
  context.restore()
}

IconButton.prototype.draw_icon  = function(context) {
  if(!this.icon) return
	context.save()
  context.shadowBlur = 0
	if(this.icon == "player") {
		if(this.hover) {
		  drawSprite(context, this.x, this.y - this.h/8, 0, 40, 40, "player_normal")
		} else {
		  drawSprite(context, this.x, this.y - this.h/8, 0, 40, 40, "player_white")
		}
	} else if(this.icon == "gear") {

		if(this.hover) {
			draw_gear(context, this.x, this.y - this.h/8, 15, impulse_colors["impulse_blue"], "#080808", false)	
		} else {
			draw_gear(context, this.x, this.y - this.h/8, 15, "white", "#080808", false)	
		} 
	} else if(this.icon == "credit") {
    if(this.hover) {
      draw_credits_icon(context, this.x, this.y - this.h/8, 15, impulse_colors["impulse_blue"], "#080808", false)   
    } else {
      draw_credits_icon(context, this.x, this.y - this.h/8, 15, "white", "#080808", false)   
    }
  } else if(this.icon == "tutorial") {
    if(this.hover) {
      draw_tutorial_icon(context, this.x, this.y - this.h/8, 13, impulse_colors["impulse_blue"], "#080808", false)   
    } else {
      draw_tutorial_icon(context, this.x, this.y - this.h/8, 13, "white", "#080808", false)   
    }
  } else if(this.icon == "back") {
    if(this.hover) {
      draw_back_icon(context, this.x, this.y - this.h/8, 13, this.hover_color, "#080808", false)   
    } else {
      draw_back_icon(context, this.x, this.y - this.h/8, 13, this.color, "#080808", false)   
    }
  } else if(this.icon == "start") {
    if(this.hover) {
      draw_start_icon(context, this.x, this.y - this.h/8, 20, this.hover_color)   
    } else {
      draw_start_icon(context, this.x, this.y - this.h/8, 20, this.color)   
    }
  } else if(this.icon == "retry") {
    if(this.hover) {
      draw_retry_icon(context, this.x, this.y - this.h/8, 13, this.hover_color)   
    } else {
      draw_retry_icon(context, this.x, this.y - this.h/8, 13, this.color)   
    }
  } else if(this.icon == "options") {
    if(this.hover) {
      draw_gear(context, this.x, this.y - this.h/8, 15, this.hover_color, this.bg_color)
    } else {
      draw_gear(context, this.x, this.y - this.h/8, 15, this.color, this.bg_color)
    }
  } else if(this.icon == "save") {
    if(this.hover) {
      draw_save_icon(context, this.x, this.y - this.h/8, 20, this.hover_color)   
    } else {
      draw_save_icon(context, this.x, this.y - this.h/8, 20, this.color)   
    }
  } else if(this.icon == "quit") {
    if(this.hover) {
      draw_quit_icon(context, this.x, this.y - this.h/6, 24, this.hover_color)   
    } else {
      draw_quit_icon(context, this.x, this.y - this.h/6, 24, this.color)   
    }
  } else if (this.icon == "mute_in_game") {
    draw_music_icon(context, this.x, this.y, 15, this.hover ? this.hover_color : this.color, true)
  } else if (this.icon == "pause_in_game") {
    draw_pause_icon(context, this.x, this.y, 15, this.hover ? this.hover_color : this.color, true)
  } else if (this.icon == "fullscreen_in_game") {
    draw_fullscreen_icon(context, this.x, this.y, 15, this.hover ? this.hover_color : this.color, true)
  } else if (this.icon == "easy_mode") {

    draw_enemy(context, "goo", this.x, this.y - this.h/8, 30, Math.PI/2, this.hover ? "ulted" : "white", this.hover ? impulse_colors["impulse_blue"] : "white")

    //draw_start_icon(context, this.x, this.y - this.h/8, 20, this.hover ? this.hover_color : this.color)   
  } else if (this.icon == "normal_mode") {

    //draw_enemy(context, "deathray", this.x, this.y - this.h/8, 30, Math.PI/2, this.hover ? "ulted" : "white", this.hover ? impulse_colors["impulse_blue"] : "white")
    drawSprite(context, this.x, this.y - this.h/8, 0, 40, 40, this.hover ? "ultimate_icon_blue" : "ultimate_icon")

  } else if(this.icon == "left_mouse") {
    draw_bare_mouse(context, this.x - this.w * 0.23, this.y - this.h * 0.1, this.w * 0.17, this.h * 0.4, this.hover ? this.hover_color : this.color)
    draw_arrow_keys(context, this.x + this.w * 0.17, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
  } else if(this.icon == "keyboard") {
    draw_arrow_keys(context, this.x - this.w * 0.23, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
    draw_arrow_keys(context, this.x + this.w * 0.23, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
  } else if(this.icon == "right_mouse") {
    draw_arrow_keys(context, this.x - this.w * 0.17, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
    draw_bare_mouse(context, this.x + this.w * 0.23, this.y - this.h * 0.1, this.w * 0.17, this.h * 0.4, this.hover ? this.hover_color : this.color)
  } else if(this.icon == "controls") {
    context.shadowBlur = 0
    if(imp_vars.player_data.options.control_hand == "right" && imp_vars.player_data.options.control_scheme == "mouse") {
      
      draw_arrow_keys(context, this.x - this.w * 0.15, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
      draw_bare_mouse(context, this.x + this.w * 0.2, this.y - this.h * 0.1, this.w * 0.15, this.h * 0.4, this.hover ? this.hover_color : this.color)
    }
    if(imp_vars.player_data.options.control_hand == "left" && imp_vars.player_data.options.control_scheme == "mouse") {
      draw_bare_mouse(context, this.x - this.w * 0.2, this.y - this.h * 0.1, this.w * 0.15, this.h * 0.4, this.hover ? this.hover_color : this.color)
      draw_arrow_keys(context, this.x + this.w * 0.15, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
    }
    if(imp_vars.player_data.options.control_hand == "right" && imp_vars.player_data.options.control_scheme == "keyboard") {
      draw_arrow_keys(context, this.x - this.w * 0.2, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
      draw_arrow_keys(context, this.x + this.w * 0.2, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
    }
  } else if(this.icon.slice(0, 5) == "world") {
    var text = ["I", "II","III", "IV"]
    var world_num = parseInt(this.icon.slice(5));
    context.save()
    if(this.hover && this.active) {
      context.globalAlpha *= 0.5
    } else if (this.active) {
      context.globalAlpha *= 0.3
    } else {
      context.globalAlpha *= 0.15
    }
    if(!this.active) {
      draw_gray_tessellation_sign(context, world_num, this.x, this.y, this.size * 2, this.hover)  
    } else {
      draw_tessellation_sign(context, world_num, this.x, this.y, this.size * 2, this.hover)  
    }
    context.restore()
    context.save()
    if (!this.active) {
      context.globalAlpha *= 0.3
    }
    context.textAlign = 'center'
    context.font = "32px Muli"
    context.fillStyle = this.color;
    context.fillText(text[world_num-1], this.x, this.y + 10)
    context.restore()
  } else if(this.icon.slice(0, 8) == "practice") {
    var text = ["I", "II","III", "IV"]
    var world_num = parseInt(this.icon.slice(8));
    if(!this.active) {
      context.globalAlpha *= 0.3
      draw_gray_tessellation_sign(context, world_num, this.x, this.y, this.size * 1.4)
    } else {
      if(this.hover) {
        if(world_num == 3) {
          context.globalAlpha *= 0.6
        } else {
          context.globalAlpha *= 0.7
        }
      } else {
        context.globalAlpha *= 0.3
      }
     draw_tessellation_sign(context, world_num, this.x, this.y, this.size * 1.4) 
    }
    
  }
  context.restore()
}