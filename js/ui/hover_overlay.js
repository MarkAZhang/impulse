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
	}
	this.opacity = 0;
	this.world_num = world_num
};

HoverOverlay.prototype.draw = function(ctx) {
	if(!this.visible) return;
	ctx.save()
	ctx.globalAlpha *= 0.8

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
	}
	ctx.restore();
};

HoverOverlay.prototype.set_visible = function(visibility) {
	this.visible = visibility;
}

// Mouse x and y are passed in. The actual x, y position is also based on type, w, and h.
HoverOverlay.prototype.set_position = function(mx, my) {
	this.x = mx;
	this.y = my + this.h/2;
}