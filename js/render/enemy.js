
function draw_enemy_image(context, state, draw_polygons, type, default_color, scale) {

  if (scale === undefined) {
    scale = 1
  }

  context.save()
  context.shadowBlur = 0

  for(var k = 0; k < draw_polygons.length; k++) {

    if(draw_polygons[k].visible === false) continue

    var cur_shape = draw_polygons[k]
    var cur_shape_points = draw_polygons[k].vertices
    var cur_color = draw_polygons[k].color ? draw_polygons[k].color : default_color

    // draw the shape
    context.beginPath()

    if(cur_shape.type == "polygon") {
      //draw polygon shape
      context.moveTo(scale*(cur_shape.x + cur_shape.r*cur_shape_points[0][0])*imp_params.draw_factor, scale*(cur_shape.y + cur_shape.r*cur_shape_points[0][1])*imp_params.draw_factor)
      for(var i = 1; i < cur_shape_points.length; i++)
      {
        context.lineTo(scale*(cur_shape.x + cur_shape.r*cur_shape_points[i][0])*imp_params.draw_factor, scale*(cur_shape.y + cur_shape.r*cur_shape_points[i][1])*imp_params.draw_factor)
      }
    }
    context.closePath()
    var interior_color = enemyData[type].interior_color

    context.fillStyle = cur_color

    if(state == "normal" && interior_color) {
      context.fillStyle = interior_color
    }

    context.fillStyle = "black"

    if(state != "lighten")
      context.fill()


    if(interior_color && state == "normal")
      context.strokeStyle = cur_color
    else
      context.strokeStyle = cur_color//context.fillStyle

    context.lineWidth = 2 * Math.sqrt(scale)

    if(state == "lighten") {
      context.strokeStyle = "black"
      context.lineWidth = 4 * Math.sqrt(scale)
    }
    context.stroke()

  }
  var erase_lines =  enemyData[type].erase_lines

  if(erase_lines) {
    context.beginPath()
    for(var i = 0; i < erase_lines.length; i++) {
      context.moveTo(scale*(erase_lines[i][0][0])*imp_params.draw_factor, scale*(erase_lines[i][0][1])*imp_params.draw_factor)
      context.lineTo(scale*(erase_lines[i][1][0])*imp_params.draw_factor, scale*(erase_lines[i][1][1])*imp_params.draw_factor)
    }
    context.strokeStyle = "black"
    context.lineWidth = 3
    context.globalAlpha = 1
    context.stroke()
  }

  var extra_lines =  enemyData[type].extra_rendering_lines
  var r =  enemyData[type].effective_radius

  if(!(typeof extra_lines === "undefined")) {
      for(var m = 0; m < extra_lines.length; m++) {
        context.beginPath()
        var line = extra_lines[m]
        context.moveTo(scale*(r * line["x1"]) * imp_params.draw_factor, scale*(r * line["y1"]) * imp_params.draw_factor)
        context.lineTo(scale*(r * line["x2"]) * imp_params.draw_factor, scale*(r * line["y2"]) * imp_params.draw_factor)
        context.lineWidth = 2
        context.strokeStyle = cur_color
        context.stroke()
      }
    }

  context.restore()
}



function draw_enemy(context, enemy_name, x, y, d, rotate, status, enemy_color) {
  // if d == null, will draw at default size


  if(enemy_name.slice(enemy_name.length - 4) == "boss") return
  context.save()
  context.translate(x, y);
  if(rotate) {
    context.rotate(rotate);
  }
  if(status === undefined) status = "normal"
  var max_radius = 1.5
  var size = enemyData[enemy_name].effective_radius * imp_params.draw_factor * Enemy.prototype.enemy_canvas_factor
  if(d == null) {
    var draw_scale = size
  } else {
    //var draw_scale = Math.min(1/enemyData[enemy_name].effective_radius, 1) * d/2
    var draw_scale = d * Math.min(enemyData[enemy_name].effective_radius/max_radius, 1)
  }

  draw_enemy_helper(context, enemy_name, draw_scale, status, enemy_color)

  context.restore()
}

function draw_enemy_helper(context, enemy_name, draw_scale, status, enemy_color) {
  if(enemy_name.slice(enemy_name.length - 4) == "boss") {
     //draw_scale = 2/enemyData[enemy_name].effective_radius * d/2
  }

  if (enemy_color === undefined) {
    var enemy_color = (enemyData[enemy_name].className).prototype.get_color_for_status(status)
    if(!enemy_color) {
      enemy_color = enemyData[enemy_name].color
    }
  }

  //context.translate(-draw_scale, -draw_scale)
  var draw_polygons = enemyData[enemy_name].draw_polygons

  if(!draw_polygons) {
    draw_polygons = enemyData[enemy_name].shape_polygons
  }

  var scale = draw_scale / (Enemy.prototype.enemy_canvas_factor * enemyData[enemy_name].effective_radius * imp_params.draw_factor)
  draw_enemy_image(context, status, draw_polygons, enemy_name, enemy_color, scale)

  //context.translate(draw_scale, draw_scale)
  //context.drawImage(enemyData[enemy_name].images[status], 0, 0, size, size, -draw_scale, -draw_scale, draw_scale * 2, draw_scale * 2);

   /*for(var m = 0; m < enemyData[enemy_name].shape_polygons.length; m++) {
      var this_shape = enemyData[enemy_name].shape_polygons[m]
      if(enemyData[enemy_name].interior_color) {
        draw_shape(context, x, y, this_shape, draw_scale, enemyData[enemy_name].color, 1, 0, enemyData[enemy_name].interior_color)
      } else {
        draw_shape(context, x, y, this_shape, draw_scale, enemyData[enemy_name].color)
      }

    }*/

    var this_color = (enemyData[enemy_name].className).prototype.get_color_for_status(status)
    if(!this_color) {
      this_color = enemyData[enemy_name].color
    }
    if(!(typeof enemyData[enemy_name].extra_rendering_polygons === "undefined")) {
      for(var m = 0; m < enemyData[enemy_name].extra_rendering_polygons.length; m++) {
        var this_shape = enemyData[enemy_name].extra_rendering_polygons[m]
        if(!this_shape.colored) {
          draw_shape(context, 0, 0, this_shape, draw_scale, this_color, 1, 0, "black")
        } else {
          draw_shape(context, 0, 0, this_shape, draw_scale, this_color)
        }
      }
    }
}

function draw_enemy_colored(context, enemy_name, x, y, d, rotate, color) {

  context.save()
  if(rotate) {
    context.translate(x, y);
    context.rotate(rotate);
    context.translate(-x, -y);
  }

  var draw_scale = Math.min(1/enemyData[enemy_name].effective_radius, 1) * d/2
   if(enemy_name.slice(enemy_name.length - 4) == "boss") {
      draw_scale = 2/enemyData[enemy_name].effective_radius * d/2
   }
   for(var m = 0; m < enemyData[enemy_name].shape_polygons.length; m++) {
      var this_shape = enemyData[enemy_name].shape_polygons[m]
      draw_shape(context, x, y, this_shape, draw_scale, color)

    }
    if(!(typeof enemyData[enemy_name].extra_rendering_polygons === "undefined")) {
      for(var m = 0; m < enemyData[enemy_name].extra_rendering_polygons.length; m++) {
        var this_shape = enemyData[enemy_name].extra_rendering_polygons[m]
        draw_shape(context, x, y, this_shape, draw_scale, color)
      }
    }

    var extra_lines =  enemyData[enemy_name].extra_rendering_lines
    if(!(typeof extra_lines === "undefined")) {
      for(var m = 0; m < extra_lines.length; m++) {
        context.beginPath()
        var line = extra_lines[m]
        context.moveTo(x + draw_scale*line["x1"], y + draw_scale*line["y1"])
        context.lineTo(x + draw_scale*line["x2"], y + draw_scale*line["y2"])
        context.lineWidth = 2
        context.strokeStyle = color
        context.stroke()
      }
    }
  context.restore()
}

function draw_enemy_real_size(context, enemy_name, x, y, factor, rotate) {

  context.save()
  context.translate(x, y);
  if(rotate) {
    context.rotate(rotate);
  }

  var size = enemyData[enemy_name].images["normal"].height

  draw_enemy_helper(context, enemy_name, size * factor/2, "normal")
  context.restore()
}
