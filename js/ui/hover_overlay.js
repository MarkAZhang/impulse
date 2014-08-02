var HoverOverlay = function(type, color, world_num) {
  if(!color) return
  this.init(type, color, world_num)
};

HoverOverlay.prototype.init = function(type, color, world_num) {
	this.type = type;
	this.color = color;
	this.x = 0;
	this.y = 0;
	this.visible = false;
	if (this.type == "rank_explanation") {
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
	}
	this.opacity = 0;
	this.world_num = world_num
};

HoverOverlay.prototype.draw = function(ctx) {
	if(!this.visible) return;
	ctx.save()
	ctx.globalAlpha *= 0.9

	ctx.beginPath();
	ctx.strokeStyle = this.color;
	ctx.fillStyle = "black"
	ctx.lineWidth = 4;
	ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
	ctx.stroke();
	ctx.fill();

	if (this.type == "rank_explanation") {
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
	} else if (this.type == "beat_hive1") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("DEFEAT HIVE 1", this.x, this.y - this.h/2 + 40);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "beat_hive2") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("DEFEAT HIVE 2", this.x, this.y - this.h/2 + 40);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "beat_hive3") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("DEFEAT HIVE 3", this.x, this.y - this.h/2 + 40);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "beat_hive4") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("DEFEAT HIVE 4", this.x, this.y - this.h/2 + 40);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "first_gold") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("GET A GOLD SCORE", this.x, this.y - this.h/2 + 40);
		ctx.fillText("ON ANY LEVEL", this.x, this.y - this.h/2 + 64);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "combo") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("BEAT A LEVEL IN HIVE 2", this.x, this.y - this.h/2 + 40);
		ctx.fillText("WITH 150 COMBO OR MORE", this.x, this.y - this.h/2 + 64);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "pacifist") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("BEAT ANY LEVEL", this.x, this.y - this.h/2 + 40);
		ctx.fillText("WITHOUT USING IMPULSE", this.x, this.y - this.h/2 + 64);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "survivor") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("BEAT A LEVEL IN HIVE 3", this.x, this.y - this.h/2 + 40);
		ctx.fillText("AFTER 2.5 MINUTES", this.x, this.y - this.h/2 + 64);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "fast_time") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";

		ctx.fillText("BEAT A LEVEL IN HIVE 1", this.x, this.y - this.h/2 + 40);
		ctx.fillText("IN UNDER 30 SECONDS", this.x, this.y - this.h/2 + 64);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "0star") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("DEFEAT CHALLENGE MODE", this.x, this.y - this.h/2 + 40);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "1star") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("GET 1 STAR ON ALL HIVES", this.x, this.y - this.h/2 + 40);
		ctx.fillText("IN CHALLENGE MODE", this.x, this.y - this.h/2 + 64);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "2star") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("GET 2 STAR ON ALL HIVES", this.x, this.y - this.h/2 + 40);
		ctx.fillText("IN CHALLENGE MODE", this.x, this.y - this.h/2 + 64);
		this.draw_rewards(ctx, this.type)
	} else if (this.type == "3star") {
		ctx.textAlign = 'center';
		ctx.font = "16px Muli";
		ctx.fillStyle = "white";
		ctx.fillText("GET 3 STAR ON ALL HIVES", this.x, this.y - this.h/2 + 40);
		ctx.fillText("IN CHALLENGE MODE", this.x, this.y - this.h/2 + 64);
		this.draw_rewards(ctx, this.type)
	}
	ctx.restore();
};

HoverOverlay.prototype.draw_rewards = function(ctx, type) {
	ctx.font = "12px Muli";
	var reward_y = this.y + this.h / 2 - 20
	ctx.beginPath();
	ctx.moveTo(this.x - this.w/2 + 10, reward_y - 40);
	ctx.lineTo(this.x + this.w/2 - 10, reward_y - 40);
	ctx.strokeStyle = "white"
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.fillText("REWARD", this.x, reward_y - 20);
	
	var reward_gap = 45
	var rewards = imp_params.quest_data[this.type]["rewards"];
	for (var i = 0; i < rewards.length; i++) {
		reward = rewards[i];
		this.draw_reward(ctx, this.x - reward_gap * ((rewards.length - 1) / 2 - i), reward_y, reward);
	}
}

HoverOverlay.prototype.draw_reward = function(ctx, x, y, type) {
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

HoverOverlay.prototype.set_visible = function(visibility) {
	this.visible = visibility;
}

// Mouse x and y are passed in. The actual x, y position is also based on type, w, and h.
HoverOverlay.prototype.set_position = function(mx, my) {
	this.x = mx;
	this.y = my + this.h/2;
}