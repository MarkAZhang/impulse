function draw_star(context, x, y, r, color) {
  context.beginPath()
  context.moveTo(x + r * Math.cos(Math.PI * 3/2), y + r * Math.sin(Math.PI * 3/2))
  context.lineTo(x + r * Math.cos(Math.PI * 1/6), y + r * Math.sin(Math.PI * 1/6))
  context.lineTo(x + r * Math.cos(Math.PI * 5/6), y + r * Math.sin(Math.PI * 5/6))
  context.closePath()
  context.strokeStyle = impulse_colors[color]
  context.globalAlpha = 1
  context.lineWidth = 2
  context.stroke()
  context.globalAlpha /=2
  context.fillStyle = impulse_colors[color]
  context.fill()
  context.globalAlpha = 1
}

function draw_empty_star(context, x, y, r, color) {
  context.beginPath()
  context.moveTo(x + r * Math.cos(Math.PI * 3/2), y + r * Math.sin(Math.PI * 3/2))
  context.lineTo(x + r * Math.cos(Math.PI * 1/6), y + r * Math.sin(Math.PI * 1/6))
  context.lineTo(x + r * Math.cos(Math.PI * 5/6), y + r * Math.sin(Math.PI * 5/6))
  context.closePath()
  context.strokeStyle = color ? color : "black"
  context.lineWidth = 1
  context.stroke()
}
