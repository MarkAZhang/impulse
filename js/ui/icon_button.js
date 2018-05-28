var constants = require('../data/constants.js');
var iconRenderUtils = require('../render/icons.js');
var renderUtils = require('../render/utils.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');

var ImpulseButton = require('../ui/impulse_button.js');

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

  if (this.icon.slice(0, 5) == "world" || this.icon == "close") {
    this.underline_on_hover = false;
  }
};

IconButton.prototype.additional_draw = function(context) {
  context.save()
  this.draw_icon(context)
  context.beginPath()
  context.textAlign = 'center'
  context.font = this.size+'px Open Sans';
  if (this.hover && this.underline_on_hover) {
    context.beginPath();
    var textWidth = context.measureText(this.text).width;
    context.moveTo(this.x - textWidth/2, this.y + this.h * 0.4);
    context.lineTo(this.x + textWidth/2, this.y + this.h * 0.4);
    context.strokeStyle = this.hover_color ? this.hover_color : this.color
    context.lineWidth = 2;
    context.stroke();
  }

  if(!this.active && (this.icon.slice(0, 8) == "practice")) {
    context.globalAlpha *= 0.4
  }
  context.fillStyle = this.hover ? this.hover_color : this.color
  if(this.shadow) {
    context.shadowBlur = 5
    context.shadowColor = context.fillStyle
  } else {
    context.shadowBlur = 0
  }

  if (this.icon.slice(0, 8) == "practice") {
    context.fillText(this.text, this.x - 1, this.y + this.h/6)
  } else if (this.icon == "close") {
    context.fillText(this.text, this.x, this.y)
  } else if (this.icon.slice(0, 5) != "world") {
    context.fillText(this.text, this.x, this.y + this.h/3)
  }

  if (this.extra_text) {
    context.font = this.extra_text_size ? this.extra_text_size : this.size * 0.7 +'px Open Sans';
    context.fillText(this.extra_text, this.x, this.y + this.h/3 + 1 * this.size)
  }

  context.fill()
  context.restore()
}

IconButton.prototype.draw_icon  = function(context) {
  if(!this.icon) return
	context.save()
  context.shadowBlur = 0
	if(this.icon == "player") {
		if(this.hover) {
		  renderUtils.drawSprite(context, this.x, this.y - this.h/8, 0, 40, 40, "player_normal")
		} else {
		  renderUtils.drawSprite(context, this.x, this.y - this.h/8, 0, 40, 40, "player_white")
		}
	} else if(this.icon == "gear") {

		if(this.hover) {
			iconRenderUtils.drawGearIcon(context, this.x, this.y - this.h/8, 15, constants.colors["impulse_blue"], "#080808", false)
		} else {
			iconRenderUtils.drawGearIcon(context, this.x, this.y - this.h/8, 15, "white", "#080808", false)
		}
	} else if(this.icon == "credit") {
    if(this.hover) {
      iconRenderUtils.drawCreditsIcon(context, this.x, this.y - this.h/8, 15, constants.colors["impulse_blue"], "#080808", false)
    } else {
      iconRenderUtils.drawCreditsIcon(context, this.x, this.y - this.h/8, 15, "white", "#080808", false)
    }
  } else if(this.icon == "tutorial") {
    if(this.hover) {
      iconRenderUtils.drawTutorialIcon(context, this.x, this.y - this.h/8, 13, constants.colors["impulse_blue"], "#080808", false)
    } else {
      iconRenderUtils.drawTutorialIcon(context, this.x, this.y - this.h/8, 13, "white", "#080808", false)
    }
  } else if(this.icon == "note") {
    if(this.hover) {
      iconRenderUtils.drawNoteIcon(context, this.x, this.y - this.h/6, 20, constants.colors["impulse_blue"], "#080808")
    } else {
      iconRenderUtils.drawNoteIcon(context, this.x, this.y - this.h/6, 20, "white", "#080808")
    }
  } else if(this.icon == "texture") {
    if(this.hover) {
      iconRenderUtils.drawTextureIcon(context, this.x, this.y - this.h/4, 20, constants.colors["impulse_blue"])
    } else {
      iconRenderUtils.drawTextureIcon(context, this.x, this.y - this.h/4, 20, "white")
    }
  } else if(this.icon == "physics_engine") {
    if(this.hover) {
      iconRenderUtils.drawPhysicsIcon(context, this.x, this.y - this.h/6, 20, constants.colors["impulse_blue"])
    } else {
      iconRenderUtils.drawPhysicsIcon(context, this.x, this.y - this.h/6, 20, "white")
    }
  } else if(this.icon == "audio") {
    if(this.hover) {
      iconRenderUtils.drawMusicIcon(context, this.x, this.y - this.h/6, 20, constants.colors["impulse_blue"], false, false)
    } else {
      iconRenderUtils.drawMusicIcon(context, this.x, this.y - this.h/6, 20, "white", false, false)
    }
  } else if(this.icon == "back") {
    if(this.hover) {
      iconRenderUtils.drawBackIcon(context, this.x, this.y - this.h/8, 13, this.hover_color, "#080808", false)
    } else {
      iconRenderUtils.drawBackIcon(context, this.x, this.y - this.h/8, 13, this.color, "#080808", false)
    }
  } else if(this.icon == "start") {
    if(this.hover) {
      iconRenderUtils.drawStartIcon(context, this.x, this.y - this.h/8, 20, this.hover_color)
    } else {
      iconRenderUtils.drawStartIcon(context, this.x, this.y - this.h/8, 20, this.color)
    }
  } else if(this.icon == "resume") {
    if(this.hover) {
      iconRenderUtils.drawStartIcon(context, this.x, this.y - this.h/8, 30, this.hover_color)
    } else {
      iconRenderUtils.drawStartIcon(context, this.x, this.y - this.h/8, 30, this.color)
    }
  } else if(this.icon == "retry") {
    if(this.hover) {
      iconRenderUtils.drawRetryIcon(context, this.x, this.y - this.h/8, 13, this.hover_color)
    } else {
      iconRenderUtils.drawRetryIcon(context, this.x, this.y - this.h/8, 13, this.color)
    }
  } else if(this.icon == "options") {
    if(this.hover) {
      iconRenderUtils.drawGearIcon(context, this.x, this.y - this.h/8, 15, this.hover_color, this.bg_color)
    } else {
      iconRenderUtils.drawGearIcon(context, this.x, this.y - this.h/8, 15, this.color, this.bg_color)
    }
  } else if(this.icon == "save") {
    if(this.hover) {
      iconRenderUtils.drawSaveIcon(context, this.x, this.y - this.h/8, 20, this.hover_color)
    } else {
      iconRenderUtils.drawSaveIcon(context, this.x, this.y - this.h/8, 20, this.color)
    }
  } else if (this.icon == "quest") {
    if(this.hover) {
      iconRenderUtils.drawQuestIcon(context, this.x, this.y - this.h/8, 18, this.hover_color)
    } else {
      iconRenderUtils.drawQuestIcon(context, this.x, this.y - this.h/8, 18, this.color)
    }
  } else if(this.icon == "quit") {
    if(this.hover) {
      iconRenderUtils.drawQuitIcon(context, this.x, this.y - this.h/6, 24, this.hover_color)
    } else {
      iconRenderUtils.drawQuitIcon(context, this.x, this.y - this.h/6, 24, this.color)
    }
  } else if(this.icon == "close") {
    if(this.hover) {
      iconRenderUtils.drawQuitIcon(context, this.x, this.y - 6, 18, this.hover_color)
    } else {
      iconRenderUtils.drawQuitIcon(context, this.x, this.y - 6, 18, this.color)
    }
  } else if(this.icon == "delete") {
    if(this.hover) {
      iconRenderUtils.drawDeleteIcon(context, this.x, this.y - this.h/8, 36, this.hover_color)
    } else {
      iconRenderUtils.drawDeleteIcon(context, this.x, this.y - this.h/8, 36, this.color)
    }
  } else if(this.icon == "delete_small") {
    if(this.hover) {
      iconRenderUtils.drawDeleteIcon(context, this.x, this.y - this.h/5, 30, this.hover_color)
    } else {
      iconRenderUtils.drawDeleteIcon(context, this.x, this.y - this.h/5, 30, this.color)
    }
  } else if(this.icon == "close_dialog") {
    if(this.hover) {
      iconRenderUtils.drawQuitIcon(context, this.x, this.y - this.h/6, 36, this.hover_color)
    } else {
      iconRenderUtils.drawQuitIcon(context, this.x, this.y - this.h/6, 36, this.color)
    }
  } else if (this.icon == "mute_in_game") {
    iconRenderUtils.drawMusicIcon(context, this.x, this.y, 15, this.hover ? this.hover_color : this.color, true, saveData.optionsData.bg_music_mute)
  } else if (this.icon == "pause_in_game") {
    iconRenderUtils.drawPauseIcon(context, this.x, this.y, 15, this.hover ? this.hover_color : this.color, true)
  } else if (this.icon == "fullscreen_in_game") {
    iconRenderUtils.drawFullscreenIcon(context, this.x, this.y, 15, this.hover ? this.hover_color : this.color, true)
  } else if (this.icon == "normal_mode") {
    renderUtils.drawSprite(context, this.x, this.y - this.h/8, 0, 40, 40, this.hover ? "blue_flower" : "white_flower")
  } else if(this.icon == "left_mouse") {
    uiRenderUtils.drawBareMouse(context, this.x - this.w * 0.23, this.y - this.h * 0.1, this.w * 0.17, this.h * 0.4, this.hover ? this.hover_color : this.color)
    uiRenderUtils.drawArrowKeys(context, this.x + this.w * 0.17, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
  } else if(this.icon == "keyboard") {
    uiRenderUtils.drawArrowKeys(context, this.x - this.w * 0.23, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
    uiRenderUtils.drawArrowKeys(context, this.x + this.w * 0.23, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
  } else if(this.icon == "right_mouse") {
    uiRenderUtils.drawArrowKeys(context, this.x - this.w * 0.17, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
    uiRenderUtils.drawBareMouse(context, this.x + this.w * 0.23, this.y - this.h * 0.1, this.w * 0.17, this.h * 0.4, this.hover ? this.hover_color : this.color)
  } else if(this.icon == "help_icon") {
    context.beginPath()
    context.arc(this.x, this.y, this.w / 2, -.5* Math.PI, -.5 * Math.PI + 1.999*Math.PI, false)
    context.strokeStyle = this.hover ? this.hover_color : this.color;
    context.lineWidth = 2;
    context.fillStyle = "black"
    context.stroke();
    context.fill();
    context.beginPath();
    context.arc(this.x, this.y - this.w / 8, this.w / 8, -Math.PI, 0, false);
    context.lineTo(this.x, this.y + this.w / 8);
    //context.lineTo(this.x, this.y + this.w * 3 / 8);
    context.stroke();
    context.beginPath();
    context.arc(this.x, this.y + this.w / 2 - 4, 1, 0, 2 * Math.PI);
    context.fillStyle = this.hover ? this.hover_color : this.color;
    context.fill();
  } else if(this.icon == "controls") {
    context.shadowBlur = 0
    if(saveData.optionsData.control_hand == "right" && saveData.optionsData.control_scheme == "mouse") {

      uiRenderUtils.drawArrowKeys(context, this.x - this.w * 0.15, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
      uiRenderUtils.drawBareMouse(context, this.x + this.w * 0.2, this.y - this.h * 0.1, this.w * 0.15, this.h * 0.4, this.hover ? this.hover_color : this.color)
    }
    if(saveData.optionsData.control_hand == "left" && saveData.optionsData.control_scheme == "mouse") {
      uiRenderUtils.drawBareMouse(context, this.x - this.w * 0.2, this.y - this.h * 0.1, this.w * 0.15, this.h * 0.4, this.hover ? this.hover_color : this.color)
      uiRenderUtils.drawArrowKeys(context, this.x + this.w * 0.15, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
    }
    if(saveData.optionsData.control_hand == "right" && saveData.optionsData.control_scheme == "keyboard") {
      uiRenderUtils.drawArrowKeys(context, this.x - this.w * 0.2, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
      uiRenderUtils.drawArrowKeys(context, this.x + this.w * 0.2, this.y, this.h * 0.2, this.hover ? this.hover_color : this.color)
    }
  } else if(this.icon.slice(0, 5) == "world") {
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
      uiRenderUtils.drawGrayTessellationSign(context, world_num, this.x, this.y, this.size * 2, this.hover)
    } else {
      uiRenderUtils.drawTessellationSign(context, world_num, this.x, this.y, this.size * 2, this.hover)
    }
    context.restore()
    context.save()
    if (!this.active) {
      context.globalAlpha *= 0.3
    }
    context.textAlign = 'center'
    context.font = "32px Open Sans"
    context.fillStyle = this.active ? this.color : "gray";
    context.fillText(this.text, this.x, this.y + 10)
    context.restore()
  } else if(this.icon.slice(0, 8) == "practice") {
    var world_num = parseInt(this.icon.slice(8));
    if(!this.active) {
      context.globalAlpha *= 0.3
      uiRenderUtils.drawGrayTessellationSign(context, world_num, this.x, this.y, this.size * 1.4)
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
     uiRenderUtils.drawTessellationSign(context, world_num, this.x, this.y, this.size * 1.4)
    }

  }
  context.restore()
}

module.exports = IconButton;
