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

function draw_enemy(context, enemy_name, x, y, d) {
  var r = impulse_enemy_stats[enemy_name].effective_radius/2 * d/2
  context.beginPath()
  if(impulse_enemy_stats[enemy_name].shape_type == "circle") {
    
    context.arc(x, y, r, 0, 2 * Math.PI, true)
   
  }
  else if(impulse_enemy_stats[enemy_name].shape_type == "polygon") {
    context.moveTo(x+impulse_enemy_stats[enemy_name].shape_vertices[0][0]*r, y+impulse_enemy_stats[enemy_name].shape_vertices[0][1]*r)
    for(var k = 1; k < impulse_enemy_stats[enemy_name].shape_vertices.length; k++)
    {
      context.lineTo(x+impulse_enemy_stats[enemy_name].shape_vertices[k][0]*r, y+impulse_enemy_stats[enemy_name].shape_vertices[k][1]*r)
    }
    context.closePath()
  }
  context.fillStyle = impulse_enemy_stats[enemy_name].color
  context.strokeStyle = impulse_enemy_stats[enemy_name].color
  context.lineWidth = 2
  context.stroke()
  context.globalAlpha /=2
  context.fill()
  context.globalAlpha = 1
}
