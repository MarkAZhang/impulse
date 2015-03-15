function draw_multi_powerup(context, x, y, prog) {
  drawSprite(context, x + 1, y, 0, 20, 20, "multi_powerup")
  context.strokeStyle = "white"
  context.lineWidth = 2;
  context.save();
  context.globalAlpha *= 0.5;
  context.beginPath();
  context.arc(x, y, 15, -.5* Math.PI, -.5 * Math.PI + 0.001, true)
  context.stroke();
  context.restore();
  context.beginPath();
  context.arc(x, y, 15, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * 0.999 * (1 - prog), true)
  context.stroke();
}

function draw_multi(context, x, y, angle) {

  drawSprite(context, x, y, angle, 25, 25, "multi")
}

function draw_multi_fragment(context, x, y, angle) {
  drawSprite(context, x, y, angle, 12, 12, "multi")
}
