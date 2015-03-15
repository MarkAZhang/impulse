function draw_level_obstacles_within_rect(context, level_name, x, y, w, h, border_color) {

  context.save()
  context.shadowBlur = 0
  context.beginPath()
  context.rect(x - w/2, y - h/2, w, h)
  context.clip()
  context.beginPath()
  context.rect(x - w/2, y - h/2, w, h)
  context.save();
  context.globalAlpha *= 0.3
  context.fillStyle = border_color
  context.fill()
  context.restore();
  var polygons = null
  if (saveData.difficultyMode == "easy") {
    polygons = imp_params.impulse_level_data[level_name].obstacle_v_easy
  }
  if (!polygons) {
    polygons = imp_params.impulse_level_data[level_name].obstacle_v
  }

  if(!polygons) return
  for(var i = 0; i < polygons.length; i++) {
    context.beginPath()
    context.moveTo(x - w/2 + polygons[i][0][0]/imp_params.levelWidth * w, y - h/2 + polygons[i][0][1]/(imp_params.levelHeight) * h)
    for(var j = 1; j < polygons[i].length; j++) {
      context.lineTo(x - w/2 + polygons[i][j][0]/imp_params.levelWidth * w, y -h/2 +  polygons[i][j][1]/(imp_params.levelHeight) * h)
    }
    context.closePath()
    context.fillStyle = "black"
    context.strokeStyle = border_color
    context.lineWidth = 2
    context.stroke()
    context.fill()
  }

  context.restore()
  context.save()
  context.beginPath()
  context.shadowBlur = 0
  context.rect(x - w/2, y - h/2, w, h)
  context.lineWidth = 2
  context.strokeStyle = border_color
  context.stroke()
  context.restore()
}
