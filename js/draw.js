function draw_star(context, x, y, r, color) {
  context.beginPath()
  context.moveTo(x + r * Math.cos(Math.PI * 3/2), y + r * Math.sin(Math.PI * 3/2))
  context.lineTo(x + r * Math.cos(Math.PI * 1/6), y + r * Math.sin(Math.PI * 1/6))
  context.lineTo(x + r * Math.cos(Math.PI * 5/6), y + r * Math.sin(Math.PI * 5/6))
  context.closePath()
  context.globalAlpha /=2
  context.fillStyle = impulse_colors[color]
  context.fill()
  context.globalAlpha = 1
  context.strokeStyle = "black"
  context.globalAlpha = 1
  context.lineWidth = Math.ceil(r/7.5)
  context.stroke()
 
}

function draw_empty_star(context, x, y, r, color) {
  context.beginPath()
  context.moveTo(x + r * Math.cos(Math.PI * 3/2), y + r * Math.sin(Math.PI * 3/2))
  context.lineTo(x + r * Math.cos(Math.PI * 1/6), y + r * Math.sin(Math.PI * 1/6))
  context.lineTo(x + r * Math.cos(Math.PI * 5/6), y + r * Math.sin(Math.PI * 5/6))
  context.closePath()
  context.strokeStyle = color ? color : "black"
  context.lineWidth = Math.ceil(r/7.5)
  context.stroke()
}

function draw_enemy(context, enemy_name, x, y, d) {
  var draw_scale = Math.min(1/impulse_enemy_stats[enemy_name].effective_radius, 1) * d/2
   if(enemy_name.slice(enemy_name.length - 4) == "boss") {
      draw_scale = 2/impulse_enemy_stats[enemy_name].effective_radius * d/2
   }
   for(var m = 0; m < impulse_enemy_stats[enemy_name].shape_polygons.length; m++) {
      var this_shape = impulse_enemy_stats[enemy_name].shape_polygons[m]
      
      context.beginPath()
      
      if(this_shape.type == "circle") {
        
        context.arc(x + this_shape.x, y + this_shape.y, draw_scale * this_shape.r, 0, 2 * Math.PI, true)
       
      }
      else if(this_shape.type == "polygon") {
        context.moveTo(x + (this_shape.x + this_shape.vertices[0][0] * this_shape.r) * draw_scale, 
          y + (this_shape.y + this_shape.vertices[0][1]  * this_shape.r) * draw_scale)
        for(var n = 1; n < this_shape.vertices.length; n++)
        {
          context.lineTo(x + (this_shape.x + this_shape.vertices[n][0] * this_shape.r) * draw_scale, 
            y + (this_shape.y + this_shape.vertices[n][1]  * this_shape.r) * draw_scale)
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
}

function draw_level_obstacles_within_rect(context, level_name, x, y, w, h, border_color) {
  
  var polygons = impulse_level_data[level_name].obstacle_v
  if(!polygons) return
  for(var i = 0; i < polygons.length; i++) {
    context.beginPath()
    context.moveTo(x - w/2 + polygons[i][0][0]/canvasWidth * w, y - h/2 + polygons[i][0][1]/canvasHeight * h)
    for(var j = 1; j < polygons[i].length; j++) {
      context.lineTo(x - w/2 + polygons[i][j][0]/canvasWidth * w, y -h/2 +  polygons[i][j][1]/canvasHeight * h)
    }
    context.closePath()
    context.fillStyle = "black"
    context.fill()
    context.strokeStyle = border_color
    context.lineWidth = 2
    context.stroke()
  }

}
