QuestButton.prototype = new ImpulseButton()

QuestButton.prototype.constructor = QuestButton

function QuestButton(type, x, y, r) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.r = r;
  this.w = 2 * r;
  this.h = 2 * r;
  this.normal_canvas = document.createElement('canvas');
  this.normal_canvas.width = this.w
  this.normal_canvas.height = this.h
  var normal_canvas_ctx = this.normal_canvas.getContext('2d');
  draw_quest_button(normal_canvas_ctx, this.r, this.r, this.r, this.type);
  this.gray_canvas = convert_canvas_to_grayscale(this.normal_canvas, 255)

  this.quest_completed = imp_params.player_data.quests.indexOf(type) != -1;
  this.add_hover_overlay(new MessageBox(this.type, "white", 0, this.quest_completed));
}

QuestButton.prototype.draw = function(ctx, bg_ctx) {
  if (!this.quest_completed) {
    ctx.save();
    ctx.globalAlpha *= 0.4;
    ctx.drawImage(this.gray_canvas, 0, 0, this.w, this.h, this.x - this.r, this.y - this.r, this.w, this.h);
    ctx.restore();
  } else {
    ctx.drawImage(this.normal_canvas, 0, 0, this.w, this.h, this.x - this.r, this.y - this.r, this.w, this.h);
  }

	if (this.mouseOver)	 {
		ctx.save();
		ctx.globalAlpha *= 0.2;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
		ctx.fillStyle = "#fff"
		ctx.fill();
		ctx.beginPath();
		ctx.restore();
	}
}

QuestButton.prototype.process = function(dt) {

}
