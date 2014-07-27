QuestButton.prototype = new ImpulseButton()

QuestButton.prototype.constructor = QuestButton

function QuestButton(type, x, y, r) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.r = r;
}

QuestButton.prototype.draw = function(ctx, bg_ctx) {
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
	ctx.fillStyle = "#000"
	ctx.fill();
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r - 8, 0, 2 * Math.PI, false);
	ctx.lineWidth = 4;
	ctx.strokeStyle = "white";
	ctx.stroke();
	if (this.type == "beat_hive1") {
		draw_tessellation_sign(ctx, 1, this.x, this.y, this.r * 0.6, true, 0);
	}
	if (this.type == "beat_hive2") {
		draw_tessellation_sign(ctx, 2, this.x, this.y, this.r * 0.6, true, 0);
	}
	if (this.type == "beat_hive3") {
		draw_tessellation_sign(ctx, 3, this.x, this.y, this.r * 0.6, true, 0);
	}
	if (this.type == "beat_hive4") {
		draw_tessellation_sign(ctx, 4, this.x, this.y, this.r * 0.6, true, 0);
	}
	if (this.type == "first_gold") {
		ctx.save()
		ctx.globalAlpha *= 0.2
		drawSprite(ctx, this.x, this.y, 0, this.r * 1.2, this.r * 1.2, "white_glow")
		ctx.restore()
		drawSprite(ctx, this.x, this.y, 0, this.r * 0.8, this.r * 0.8, "gold_trophy")

		ctx.font = "15px Muli"
		ctx.fillStyle = impulse_colors["gold"]
		ctx.fillText("1", this.x, this.y - 1)
	}

	if (this.type == "combo") {
		ctx.save()
		ctx.globalAlpha *= 0.2
		drawSprite(ctx, this.x, this.y, 0, this.r * 1.2, this.r * 1.2, "white_glow")
		ctx.restore()

		drawSprite(ctx, this.x, this.y - this.r/4, 0, this.r * 0.4, this.r * 0.4, "player_normal")

		
		ctx.beginPath()
		ctx.arc(this.x, this.y - this.r/2, this.r * 0.75, Math.PI/3, 2 * Math.PI/3, false);
		ctx.strokeStyle = impulse_colors["impulse_blue"]
		ctx.stroke();
		var angles_to_draw = [Math.PI/2, Math.PI * 0.36, Math.PI * 0.64, Math.PI * 0.57, Math.PI * 0.43]
		for(var i = 0; i < angles_to_draw.length; i++) {
			var angle = angles_to_draw[i];
			drawImageWithRotation(ctx, 
				this.x + this.r * 0.9 * Math.cos(angle), 
				this.y - this.r / 2 + this.r * 0.9 * Math.sin(angle),
			angle, 10, 10, imp_params.impulse_enemy_stats["stunner"].images["normal"]);
		}
	}

	if (this.type == "survivor") {
		ctx.save()
		ctx.globalAlpha *= 0.2
		drawSprite(ctx, this.x, this.y, 0, this.r * 1.2, this.r * 1.2, "white_glow")
		ctx.restore()
		drawSprite(ctx, this.x, this.y, 0, this.r * 0.4, this.r * 0.4, "player_normal")
		for(var i = 0; i < 8; i++) {
			var angle = Math.PI * 2 * i / 4 + Math.PI/4;
			drawImageWithRotation(ctx, 
				this.x + this.r * 0.5 * Math.cos(angle), 
				this.y + this.r * 0.5 * Math.sin(angle),
			Math.PI/2 + angle, 15, 15, imp_params.impulse_enemy_stats["spear"].images["normal"]);
		}	
	}

	if (this.type == "fast_time") {
		ctx.save()
		ctx.globalAlpha *= 0.2
		drawSprite(ctx, this.x, this.y, 0, this.r * 1.2, this.r * 1.2, "white_glow")
		ctx.restore()
		drawSprite(ctx, this.x, this.y, 0, this.r * 0.7, this.r * 0.7, "timer_icon")
	}

	if (this.type == "pacifist") {
		ctx.save()
		ctx.globalAlpha *= 0.2
		drawSprite(ctx, this.x, this.y, 0, this.r * 1.2, this.r * 1.2, "white_glow")
		ctx.restore()
		drawSprite(ctx, this.x, this.y + this.r * 0.2, 0, this.r * 0.4, this.r * 0.4, "player_normal")
		ctx.save();
		ctx.lineWidth = 3
		draw_ellipse(ctx, this.x, this.y - this.r * 0.2, this.r/6, this.r/12, impulse_colors["gold"])
	}

	if (this.type.substring(1, 5) == "star") {
		ctx.save()
		ctx.globalAlpha *= 0.2
		drawSprite(ctx, this.x, this.y, 0, this.r * 1.2, this.r * 1.2, "white_glow")
		ctx.restore()
		var stars = parseInt(this.type.substring(0, 1));
		var angles_to_draw = [Math.PI * 1.25, Math.PI * 3/2, Math.PI * 1.75];
		for(var i = 0; i < angles_to_draw.length; i++) {
			var angle = angles_to_draw[i];
			drawSprite(ctx, 
				this.x + this.r * 0.6 * Math.cos(angle), 
				this.y + this.r * 0.1 + this.r * 0.6 * Math.sin(angle), 
				0, 20, 20, i < stars ? "world"+(stars+1)+"_star" : "world"+(stars+1)+"_starblank")
		}
		drawSprite(ctx, this.x, this.y + this.r / 4, 0, this.r * 0.7, this.r * 0.7, "ultimate_icon")
	}
}

QuestButton.prototype.process = function(dt) {

}