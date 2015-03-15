
function draw_prog_circle(context, x, y, r, prog, color, width) {
  context.beginPath()
  context.arc(x*imp_vars.draw_factor, y*imp_vars.draw_factor, (r*imp_vars.draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 1.999*Math.PI * prog, true)
  context.lineWidth = width ? width : 2
  context.strokeStyle = color
  context.stroke()
}

function bulk_draw_prog_circle(context, x, y, r, prog) {
  context.moveTo(x*imp_vars.draw_factor, y*imp_vars.draw_factor - (r*imp_vars.draw_factor) * 2)
  context.arc(x*imp_vars.draw_factor,
              y*imp_vars.draw_factor,
              (r*imp_vars.draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * 0.999 * (prog), true)
}

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
      context.moveTo(scale*(cur_shape.x + cur_shape.r*cur_shape_points[0][0])*imp_vars.draw_factor, scale*(cur_shape.y + cur_shape.r*cur_shape_points[0][1])*imp_vars.draw_factor)
      for(var i = 1; i < cur_shape_points.length; i++)
      {
        context.lineTo(scale*(cur_shape.x + cur_shape.r*cur_shape_points[i][0])*imp_vars.draw_factor, scale*(cur_shape.y + cur_shape.r*cur_shape_points[i][1])*imp_vars.draw_factor)
      }
    }
    context.closePath()
    var interior_color = imp_params.impulse_enemy_stats[type].interior_color

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
  var erase_lines =  imp_params.impulse_enemy_stats[type].erase_lines

  if(erase_lines) {
    context.beginPath()
    for(var i = 0; i < erase_lines.length; i++) {
      context.moveTo(scale*(erase_lines[i][0][0])*imp_vars.draw_factor, scale*(erase_lines[i][0][1])*imp_vars.draw_factor)
      context.lineTo(scale*(erase_lines[i][1][0])*imp_vars.draw_factor, scale*(erase_lines[i][1][1])*imp_vars.draw_factor)
    }
    context.strokeStyle = "black"
    context.lineWidth = 3
    context.globalAlpha = 1
    context.stroke()
  }

  var extra_lines =  imp_params.impulse_enemy_stats[type].extra_rendering_lines
  var r =  imp_params.impulse_enemy_stats[type].effective_radius

  if(!(typeof extra_lines === "undefined")) {
      for(var m = 0; m < extra_lines.length; m++) {
        context.beginPath()
        var line = extra_lines[m]
        context.moveTo(scale*(r * line["x1"]) * imp_vars.draw_factor, scale*(r * line["y1"]) * imp_vars.draw_factor)
        context.lineTo(scale*(r * line["x2"]) * imp_vars.draw_factor, scale*(r * line["y2"]) * imp_vars.draw_factor)
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
  var size = imp_params.impulse_enemy_stats[enemy_name].effective_radius * imp_vars.draw_factor * Enemy.prototype.enemy_canvas_factor
  if(d == null) {
    var draw_scale = size
  } else {
    //var draw_scale = Math.min(1/imp_params.impulse_enemy_stats[enemy_name].effective_radius, 1) * d/2
    var draw_scale = d * Math.min(imp_params.impulse_enemy_stats[enemy_name].effective_radius/max_radius, 1)
  }

  draw_enemy_helper(context, enemy_name, draw_scale, status, enemy_color)

  context.restore()
}

function draw_enemy_helper(context, enemy_name, draw_scale, status, enemy_color) {
  if(enemy_name.slice(enemy_name.length - 4) == "boss") {
     //draw_scale = 2/imp_params.impulse_enemy_stats[enemy_name].effective_radius * d/2
  }

  if (enemy_color === undefined) {
    var enemy_color = (imp_params.impulse_enemy_stats[enemy_name].className).prototype.get_color_for_status(status)
    if(!enemy_color) {
      enemy_color = imp_params.impulse_enemy_stats[enemy_name].color
    }
  }

  //context.translate(-draw_scale, -draw_scale)
  var draw_polygons = imp_params.impulse_enemy_stats[enemy_name].draw_polygons

  if(!draw_polygons) {
    draw_polygons = imp_params.impulse_enemy_stats[enemy_name].shape_polygons
  }

  var scale = draw_scale / (Enemy.prototype.enemy_canvas_factor * imp_params.impulse_enemy_stats[enemy_name].effective_radius * imp_vars.draw_factor)
  draw_enemy_image(context, status, draw_polygons, enemy_name, enemy_color, scale)

  //context.translate(draw_scale, draw_scale)
  //context.drawImage(imp_params.impulse_enemy_stats[enemy_name].images[status], 0, 0, size, size, -draw_scale, -draw_scale, draw_scale * 2, draw_scale * 2);

   /*for(var m = 0; m < imp_params.impulse_enemy_stats[enemy_name].shape_polygons.length; m++) {
      var this_shape = imp_params.impulse_enemy_stats[enemy_name].shape_polygons[m]
      if(imp_params.impulse_enemy_stats[enemy_name].interior_color) {
        draw_shape(context, x, y, this_shape, draw_scale, imp_params.impulse_enemy_stats[enemy_name].color, 1, 0, imp_params.impulse_enemy_stats[enemy_name].interior_color)
      } else {
        draw_shape(context, x, y, this_shape, draw_scale, imp_params.impulse_enemy_stats[enemy_name].color)
      }

    }*/

    var this_color = (imp_params.impulse_enemy_stats[enemy_name].className).prototype.get_color_for_status(status)
    if(!this_color) {
      this_color = imp_params.impulse_enemy_stats[enemy_name].color
    }
    if(!(typeof imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons === "undefined")) {
      for(var m = 0; m < imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons.length; m++) {
        var this_shape = imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons[m]
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

  var draw_scale = Math.min(1/imp_params.impulse_enemy_stats[enemy_name].effective_radius, 1) * d/2
   if(enemy_name.slice(enemy_name.length - 4) == "boss") {
      draw_scale = 2/imp_params.impulse_enemy_stats[enemy_name].effective_radius * d/2
   }
   for(var m = 0; m < imp_params.impulse_enemy_stats[enemy_name].shape_polygons.length; m++) {
      var this_shape = imp_params.impulse_enemy_stats[enemy_name].shape_polygons[m]
      draw_shape(context, x, y, this_shape, draw_scale, color)

    }
    if(!(typeof imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons === "undefined")) {
      for(var m = 0; m < imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons.length; m++) {
        var this_shape = imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons[m]
        draw_shape(context, x, y, this_shape, draw_scale, color)
      }
    }

    var extra_lines =  imp_params.impulse_enemy_stats[enemy_name].extra_rendering_lines
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

  var size = imp_params.impulse_enemy_stats[enemy_name].images["normal"].height

  draw_enemy_helper(context, enemy_name, size * factor/2, "normal")
  context.restore()
}


function draw_tessellation_sign(context, tessellation, x, y, size, glow, rotate) {

  size *= imp_params.tessellation_logo_factor[tessellation]

  context.save()
  if(glow) {
    context.globalAlpha *= 0.5
    if(tessellation == 1) {
      drawSprite(context, x, y, (Math.PI/4), size * 2, size * 2,
        imp_params.tessellation_glow_map[tessellation], getTessellationSprite(parseInt(tessellation)))
    }
    drawSprite(context, x, y, (Math.PI/4), size * 1.5, size * 1.5,
      imp_params.tessellation_glow_map[tessellation], getTessellationSprite(parseInt(tessellation)))
  }

  context.restore()
  context.save()

  // set screen position
  context.translate(x, y);
  // set rotation
  var offset = (tessellation != 4 && tessellation != 2) ? Math.PI/4 : 0
  var angle = rotate ? rotate : 0
  context.rotate(angle + offset)
  drawSprite(context, 0, 0, 0, size, size, imp_params.tessellation_logo_map[tessellation], getTessellationSprite(parseInt(tessellation)))
  if(tessellation == 1) {
    context.beginPath()
    context.rect(-size/2*1.2, -size/2*1.2, size*1.2, size*1.2)
    context.lineWidth = Math.ceil(size/20)
    context.strokeStyle = impulse_colors["boss "+tessellation]
    context.stroke()
  }
  context.restore()
}

function draw_gray_tessellation_sign(context, tessellation, x, y, size, glow, rotate) {

    size *= imp_params.tessellation_logo_factor[tessellation]

    context.save()

    // set screen position
    context.translate(x, y);
    // set rotation
    if(tessellation != 4 && tessellation != 2)
    context.rotate(Math.PI/4)
    drawSprite(context, 0, 0, 0, size, size, imp_params.tessellation_gray_logo_map[tessellation], getTessellationSprite(parseInt(tessellation)))
    if(tessellation == 1) {
      context.beginPath()
      context.rect(-size/2*1.2, -size/2*1.2, size*1.2, size*1.2)
      context.lineWidth = Math.ceil(size/20)
      context.strokeStyle = "gray"
      context.stroke()
    }
    context.restore()
}

function draw_arrow_keys(context, x, y, size, color, keysArray) {
  context.save()

  context.shadowColor = color
  context.shadowBlur = 0
  draw_rounded_rect(context, x, y-size, size * 0.9, size * 0.9, size * 0.2, color)
  draw_rounded_rect(context, x - size, y, size * 0.9, size * 0.9, size * 0.2, color)
  draw_rounded_rect(context, x, y, size * 0.9, size * 0.9, size * 0.2, color)
  draw_rounded_rect(context, x + size, y, size * 0.9, size * 0.9, size * 0.2, color)

  context.fillStyle = color;
  context.font = (size * 0.4) + 'px Muli'
  context.textAlign = "center"
  if(keysArray) {
    context.fillText(keysArray[0], x, y - size * 1)
    context.fillText(keysArray[1], x - size, y + size * 0)
    context.fillText(keysArray[2], x, y + size * 0)
    context.fillText(keysArray[3], x + size, y + size * 0)
    draw_arrow(context, x, y - size * 0.8, size * 0.3, "up", color)
    draw_arrow(context, x - size, y + size * 0.2, size * 0.3, "left", color)
    draw_arrow(context, x, y + size * 0.2, size * 0.3, "down", color)
    draw_arrow(context, x + size, y + size * 0.2, size * 0.3, "right", color)
  } else {
    draw_arrow(context, x, y - size , size * 0.5, "up", color)
    draw_arrow(context, x - size, y , size * 0.5, "left", color)
    draw_arrow(context, x, y - 2, size * 0.5, "down", color)
    draw_arrow(context, x + size, y, size * 0.5, "right", color)
  }
  context.restore()
}

function draw_bare_mouse(context, x, y, w, h, color) {
  context.save()

  context.fillStyle = color
  draw_rounded_rect(context, x, y, w, h, h*0.25, color)

  context.beginPath()
  context.moveTo(x - w/2, y - h/6)
  context.lineTo(x + w/2, y - h/6)
  context.moveTo(x, y - h/6)
  context.lineTo(x, y - h/2)

  context.lineWidth = 2
  context.strokeStyle = color
  context.stroke()
  context.restore()
}

function draw_mouse(context, x, y, w, h, color) {
  context.save()
  context.shadowColor = color
  context.fillStyle = color
  /*context.font = "10px Muli"
  context.textAlign = "center"
  context.fillText("LEFT CLICK", x, y - w/2 - 30)*/
  context.shadowBlur = 0
  draw_rounded_rect(context, x, y, w, h, h*0.2, color)
  context.clip()
  context.beginPath()
  context.rect(x - w/2, y - h/2, w/2, h/3)
  context.globalAlpha *= 0.5

  context.fill()
  context.restore()
  context.save()
  context.beginPath()
  context.moveTo(x - w/2, y - h/6)
  context.lineTo(x + w/2, y - h/6)
  context.moveTo(x, y - h/6)
  context.lineTo(x, y - h/2)

  context.lineWidth = 2
  context.strokeStyle = color
  context.stroke()
  context.restore()
}

function draw_right_mouse(context, x, y, w, h, color) {
  context.save()
  context.shadowColor = color
  context.fillStyle = color
  context.shadowBlur = 0
  draw_rounded_rect(context, x, y, w, h, h * 0.2, color)
  context.clip()
  context.beginPath()
  context.rect(x, y - h/2, w/2, h/3)
  context.globalAlpha *= 0.5

  context.fill()
  context.restore()
  context.save()
  context.beginPath()
  context.moveTo(x - w/2, y - h/6)
  context.lineTo(x + w/2, y - h/6)
  context.moveTo(x, y - h/6)
  context.lineTo(x, y - h/2)

  context.lineWidth = 2
  context.strokeStyle = color
  context.stroke()
  context.restore()
}

function draw_rounded_rect(context, x, y, w, h, r, color) {
  context.save()
  context.shadowColor = color
  context.shadowBlur = 0
  context.beginPath();
  context.moveTo(x - w/2 + r, y - h/2);
  context.arcTo(x+w/2, y - h/2,   x+w/2, y+h/2, r);
  context.arcTo(x+w/2, y + h/2, x - w/2,   y+h/2, r);
  context.arcTo(x - w/2,   y+h/2, x - w/2,   y - h/2,   r);
  context.arcTo(x - w/2,   y - h/2,   x+w/2, y - h/2,   r);
  context.closePath();
  context.strokeStyle = color
  context.lineWidth = 2
  context.stroke()
  context.restore()
}

// shape is {type: circle/ polygon, r: radius_factor, vertices: [[0-1, 0-1], [0-1, 0-1]]}
function draw_shape(context, x, y, shape, scale, color, alpha, rotate, interior_color) {

  alpha = typeof alpha !== 'undefined' ? alpha: 1;
  rotate = typeof rotate !== 'undefined' ? rotate: 0;

  context.beginPath()
  context.save()
  if (rotate != 0) {
    context.translate(x, y);
    context.rotate(rotate);
    context.translate(-x, -y);
  }
  if(shape.type == "circle") {
    context.arc(x + shape.x, y + shape.y, scale * shape.r, 0, 2 * Math.PI * 0.999)
  }

  if(shape.type == "polygon") {
    context.moveTo(x + (shape.x + shape.vertices[0][0] * shape.r) * scale,
      y + (shape.y + shape.vertices[0][1]  * shape.r) * scale)
    for(var n = 1; n < shape.vertices.length; n++)
    {
      context.lineTo(x + (shape.x + shape.vertices[n][0] * shape.r) * scale,
        y + (shape.y + shape.vertices[n][1]  * shape.r) * scale)
    }
    context.closePath()
  }
  context.globalAlpha *= alpha

  context.fillStyle = color
  if(interior_color && interior_color != "none") {
    context.fillStyle = interior_color
  } else {
    context.globalAlpha /= 3
  }
  if(interior_color != "none")
    context.fill()
  if(!interior_color || interior_color == "none")
    context.globalAlpha *= 3
  context.strokeStyle = color
  context.lineWidth = 2
  context.stroke()
  context.restore()
}

function draw_vprogress_bar(context, x, y, w, h, prop, color, up) {


  context.save();
  context.shadowBlur = 0

  context.beginPath()
  context.rect(x - w * .5, y - h * .5, w, h)
  context.fillStyle ="black"
  context.fill()

  context.restore();
  context.save();
  context.beginPath()
  //context.shadowBlur = 20;
  //context.shadowColor = color
  context.rect(x - w * .5, y - h * .5, w , h)
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = 4
  context.save();
  context.globalAlpha /= 10
  context.fill()
  context.restore();
  context.stroke()
  context.beginPath()

  if(up) {
    context.rect(x - w * .5, y + h * .5 - prop * h, w, h * prop)
  } else {
    context.rect(x - w * .5, y - h * .5, w, h * prop)
  }

  context.fillStyle = color
  context.fill()
  context.restore()
}

function draw_full_arrow(context, x, y, scale, color, dir) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  if(dir == "left") {
    context.rotate(Math.PI/2);
  } else if(dir == "up") {
    context.rotate(2*Math.PI/2);
  } else if(dir == "right") {
    context.rotate(3*Math.PI/2);
  }
  context.beginPath();
  context.moveTo(-8, -12);
  context.lineTo(8, -12);
  context.lineTo(8, -2);
  context.lineTo(16, -2);
  context.lineTo(0, 13);
  context.lineTo(-16, -2);
  context.lineTo(-8, -2);
  context.closePath()

  context.fillStyle = color;
  context.fill();
  context.restore();
}

function draw_arrow(context, x, y, size, dir, color, shadowed) {

  shadowed = shadowed == undefined ? false : shadowed
  context.save();
  context.translate(x, y);

  if(dir == "left") {
    context.rotate(Math.PI);
  } else if(dir == "up") {
    context.rotate(3*Math.PI/2);
  } else if(dir == "down") {
    context.rotate(Math.PI/2);
  }

  context.beginPath()
  context.moveTo( Math.cos(0) * size/2,  Math.sin(0) * size/2)
  context.lineTo( Math.cos(Math.PI*2/3) * size/2,  Math.sin(Math.PI*2/3) * size/2)
  context.lineTo( Math.cos(Math.PI*4/3) * size/2,  Math.sin(Math.PI*4/3) * size/2)
  context.closePath()
  context.fillStyle = color
  if(shadowed) {
    context.shadowBlur = 10
    context.shadowColor = color
  } else {
    context.shadowBlur = 0
  }
  context.fill()

  context.restore()
}

function draw_progress_bar(context, x, y, w, h, prop, color, bcolor, noborder, alpha) {
  context.save()
  if (alpha) context.globalAlpha *= alpha
  context.beginPath()
  context.rect(x - w * .5, y - h * .5, w * prop, h)
  context.fillStyle = color
  context.fill()
  context.restore()

  if(!noborder) {
    context.beginPath()
    context.rect(x - w * .5, y - h * .5, w , h)
    context.strokeStyle = bcolor ? bcolor : "black"
    context.lineWidth = 2
    context.stroke()
  }
}

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

function draw_logo(context, x, y, text, scale) {
  context.save()

  context.shadowColor = impulse_colors["impulse_blue"]
  context.shadowBlur = 0
  context.fillStyle = "white"//impulse_colors["impulse_blue"]

  var logoScale = scale ? scale : 0.85;
  context.drawImage(logoSprite, x - logoSprite.width/2 * logoScale, y - logoSprite.height * 0.75 * logoScale, logoSprite.width * logoScale, logoSprite.height * logoScale)

  if(text) {
    context.globalAlpha /= 2
    if (text === "BETA") {
      context.font = '24px Muli'
      context.textAlign = "right"
      context.fillText(text, x + logoSprite.width/2 * logoScale - 20, y + 40)
    } else {
      context.font = '20px Muli'
      context.textAlign = "center"
      context.fillText(text, x, y + 40)
    }
  }
  context.restore()
}

function draw_porcelain_logo(context, x, y, scale) {
  context.save()

  var logoScale = scale ? scale : 1;
  context.drawImage(porcelainLogoSprite, x - porcelainLogoSprite.width/2 * logoScale, y - porcelainLogoSprite.height * 0.75 * logoScale, porcelainLogoSprite.width * logoScale, porcelainLogoSprite.height * logoScale)

  context.restore()
}

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
  if (imp_vars.player_data.difficulty_mode == "easy") {
    polygons = imp_params.impulse_level_data[level_name].obstacle_v_easy
  }
  if (!polygons) {
    polygons = imp_params.impulse_level_data[level_name].obstacle_v
  }

  if(!polygons) return
  for(var i = 0; i < polygons.length; i++) {
    context.beginPath()
    context.moveTo(x - w/2 + polygons[i][0][0]/imp_vars.levelWidth * w, y - h/2 + polygons[i][0][1]/(imp_vars.levelHeight) * h)
    for(var j = 1; j < polygons[i].length; j++) {
      context.lineTo(x - w/2 + polygons[i][j][0]/imp_vars.levelWidth * w, y -h/2 +  polygons[i][j][1]/(imp_vars.levelHeight) * h)
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

function draw_agents_within_rect(context, player, level, x, y, w, h, border_color) {

  context.save()
  context.beginPath()
  context.rect(x - w/2, y - h/2, w, h)
  context.clip()

  //draw player
  for(var i = 0; i < level.enemies.length; i++) {
    var enemy_loc = level.enemies[i].body.GetPosition()
    context.beginPath()
    context.arc(x - w/2 + enemy_loc.x*imp_vars.draw_factor/imp_vars.levelWidth * w-1, y - h/2 + enemy_loc.y*imp_vars.draw_factor/imp_vars.levelHeight * h-1, 2, 0, 2 * Math.PI, true)
    context.fillStyle = level.enemies[i].color
    context.shadowBlur = 2
    context.shadowColor = context.fillStyle
    context.fill()
  }

  context.beginPath()
  var player_loc = player.body.GetPosition()
  context.arc(x - w/2 + player_loc.x*imp_vars.draw_factor/imp_vars.levelWidth * w-1, y - h/2 + player_loc.y*imp_vars.draw_factor/imp_vars.levelHeight * h -1, 2, 0, 2 * Math.PI, true)
  context.fillStyle = impulse_colors["impulse_blue"]
  context.shadowBlur = 2
  context.shadowColor = context.fillStyle
  context.fill()
  context.beginPath()
  context.arc(x - w/2 + player_loc.x*imp_vars.draw_factor/imp_vars.levelWidth * w-1, y - h/2 + player_loc.y*imp_vars.draw_factor/imp_vars.levelHeight * h -1, 4, 0, 2 * Math.PI, true)
  context.strokeStyle = impulse_colors["impulse_blue"]
  context.lineWidth = 1
  context.stroke()

  context.restore()
  context.save()
  context.beginPath()
  context.rect(x - w/2, y - h/2, w, h)
  context.lineWidth = 2
  context.strokeStyle = border_color
  context.stroke()
  context.restore()
}

function drawImageWithRotation(ctx, x, y, rotation, actualWidth, actualHeight, image) {
  var w = image.width;
  var h = image.height;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.drawImage(image, 0, 0, w, h, -actualWidth/2, -actualHeight/2, actualWidth, actualHeight);
  ctx.restore();
}

function draw_bg(ctx, xLow, yLow, xHigh, yHigh, spriteName) {
  var bg = impulse_bg_images[spriteName]
  var w = bg.width;
  var h = bg.height;
  ctx.save()
  ctx.beginPath();
  ctx.rect(xLow, yLow, xHigh - xLow, yHigh - yLow)
  if (spriteName.substring(0, 4) === "Hive" &&
      parseInt(spriteName.substring(5, 6)) !== 0) {
    ctx.fillStyle = "#111"//impulse_colors['world ' + parseInt(spriteName.substring(5, 6))];
    ctx.fill();
    ctx.globalAlpha *= 0.5;
  }
  ctx.clip()
  var widthTiles = Math.ceil((xHigh - xLow) / w);
  var heightTiles = Math.ceil((yHigh - yLow) / h);
  for(var x = 0; x < widthTiles; x+=1) {
    for(var y = 0; y < heightTiles; y+=1) {
      var startX = (xHigh + xLow) / 2 - widthTiles * w / 2;
      var startY = (yHigh + yLow) / 2 - heightTiles * h / 2;
      ctx.drawImage(bg, 0, 0, w, h, startX + x * w, startY + y * h, w, h)
    }
  }
  ctx.restore()
}

function draw_victory_type_icon(ctx, x, y, world_num, victory_type, scale) {
  if (victory_type == "half") {
    drawSprite(ctx, x - 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_starblank")
    drawSprite(ctx, x - 36 * scale, y, 0, 12 * scale, 25 * scale, "world" + world_num + "_starhalf")
    drawSprite(ctx, x, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_starblank")
    drawSprite(ctx, x + 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_starblank")
  } else if (victory_type == "basic") {
    drawSprite(ctx, x - 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_star")
    drawSprite(ctx, x, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_starblank")
    drawSprite(ctx, x + 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_starblank")
  } else if (victory_type == "silver") {
    drawSprite(ctx, x - 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_star")
    drawSprite(ctx, x, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_star")
    drawSprite(ctx, x + 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_starblank")
  } else if (victory_type == "gold") {
    drawSprite(ctx, x - 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_star")
    drawSprite(ctx, x, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_star")
    drawSprite(ctx, x + 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_star")
  }
}

function draw_ellipse(ctx, cx, cy, rx, ry, style) {
  ctx.save(); // save state
  ctx.beginPath();
  ctx.translate(cx-rx, cy-ry);
  ctx.scale(rx, ry);
  ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);
  ctx.restore(); // restore to original state
  ctx.save();
  if(style)
    ctx.strokeStyle=style;
  ctx.stroke();
  ctx.restore();
}

function convert_canvas_to_grayscale(canvas, opacity) {
  var canvasContext = canvas.getContext('2d');
  var imgPixels = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

  for(var y = 0; y < imgPixels.height; y++){
       for(var x = 0; x < imgPixels.width; x++){
            var i = (y * 4) * imgPixels.width + x * 4;
            var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
            imgPixels.data[i] = avg;
            imgPixels.data[i + 1] = avg;
            imgPixels.data[i + 2] = avg;
            imgPixels.data[i + 3] = imgPixels.data[i + 3] ? opacity : 0;
       }
  }
  var gray_canvas = document.createElement('canvas');
  gray_canvas.width = imgPixels.width
  gray_canvas.height = imgPixels.height
  var gray_canvas_ctx = gray_canvas.getContext('2d');
  gray_canvas_ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
  return gray_canvas;
}

draw_enemy_button = function(ctx, x, y, r, type) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#000"
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r - 8, 0, 2 * Math.PI, false);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "white";
  ctx.stroke();
  ctx.save();
  ctx.globalAlpha *= 0.2;
  drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
  ctx.restore();
  draw_enemy(ctx, type, x, y, 30)
}

draw_quest_button = function(ctx, x, y, r, type) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#000"
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r - 8, 0, 2 * Math.PI, false);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "white";
  ctx.stroke();
  if (type == "beat_hive") {
    draw_tessellation_sign(ctx, 1, x, y, r * 0.6, true, 0);
    ctx.beginPath()
    ctx.lineWidth = 6
    ctx.moveTo(x - r * 0.4, y - r * 0.4)
    ctx.lineTo(x + r * 0.4, y + r * 0.4)
    ctx.moveTo(x + r * 0.4, y - r * 0.4)
    ctx.lineTo(x - r * 0.4, y + r * 0.4)
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
  }
  if (type == "final_boss") {
    draw_tessellation_sign(ctx, 4, x, y, r * 0.6, true, 0);
    ctx.beginPath()
    ctx.lineWidth = 6
    ctx.moveTo(x - r * 0.4, y - r * 0.4)
    ctx.lineTo(x + r * 0.4, y + r * 0.4)
    ctx.moveTo(x + r * 0.4, y - r * 0.4)
    ctx.lineTo(x - r * 0.4, y + r * 0.4)
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
  }
  if (type == "first_gold") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.8, r * 0.8, "gold_trophy")
  }

  if (type == "combo") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()

    drawSprite(ctx, x, y - r/4, 0, r * 0.4, r * 0.4, "player_normal")


    ctx.beginPath()
    ctx.arc(x, y - r/2, r * 0.75, Math.PI/3, 2 * Math.PI/3, false);
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
    var angles_to_draw = [Math.PI/2, Math.PI * 0.36, Math.PI * 0.64, Math.PI * 0.57, Math.PI * 0.43]
    for(var i = 0; i < angles_to_draw.length; i++) {
      var angle = angles_to_draw[i];
      drawImageWithRotation(ctx,
        x + r * 0.9 * Math.cos(angle),
        y - r / 2 + r * 0.9 * Math.sin(angle),
      angle, 10, 10, imp_params.impulse_enemy_stats["stunner"].images["normal"]);
    }
  }

  if (type == "combo") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()

    drawSprite(ctx, x, y - r/4, 0, r * 0.4, r * 0.4, "player_normal")


    ctx.beginPath()
    ctx.arc(x, y - r/2, r * 0.75, Math.PI/3, 2 * Math.PI/3, false);
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
    var angles_to_draw = [Math.PI/2, Math.PI * 0.36, Math.PI * 0.64, Math.PI * 0.57, Math.PI * 0.43]
    for(var i = 0; i < angles_to_draw.length; i++) {
      var angle = angles_to_draw[i];
      drawImageWithRotation(ctx,
        x + r * 0.9 * Math.cos(angle),
        y - r / 2 + r * 0.9 * Math.sin(angle),
      angle, 10, 10, imp_params.impulse_enemy_stats["stunner"].images["normal"]);
    }
  }

  if (type == "high_roller") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()

    drawSprite(ctx, x, y - r/4, 0, r * 0.4, r * 0.4, "player_normal")

    ctx.beginPath()
    ctx.arc(x, y - r/2, r * 0.65, Math.PI/3, 2 * Math.PI/3, false);
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
    var angles_to_draw = [Math.PI/2, Math.PI * 0.36, Math.PI * 0.64, Math.PI * 0.57, Math.PI * 0.43]
    ctx.fillStyle = impulse_colors["gold"]
    ctx.textAlign = "center"
    ctx.font = "12px Muli"
    ctx.fillText("250K", x, y + r/2)

  }

  if (type.substring(0, 10) == "blitz_hive") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    var world = type.substring(10);
    if (world == "1") {
      drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "immunitas_glow", immunitasSprite)
    } else if (world == "2") {
      drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "consumendi_glow", consumendiSprite)
    } else if (world == "3") {
      drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "negligentia_glow", negligentiaSprite)
    } else if (world == "4") {
      drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "adrogantia_glow", adrogantiaSprite)
    }
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.8, r * 0.8, "world"+type.substring(10)+"_timer")
  }

  if (type == "survivor") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.4, r * 0.4, "player_normal")
    for(var i = 0; i < 8; i++) {
      var angle = Math.PI * 2 * i / 4 + Math.PI/4;
      drawImageWithRotation(ctx,
        x + r * 0.5 * Math.cos(angle),
        y + r * 0.5 * Math.sin(angle),
      Math.PI/2 + angle, 15, 15, imp_params.impulse_enemy_stats["spear"].images["normal"]);
    }
  }

  if (type == "fast_time") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.7, r * 0.7, "timer_icon")
  }

  if (type == "pacifist") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y + r * 0.2, 0, r * 0.4, r * 0.4, "player_normal")
    ctx.save();
    ctx.lineWidth = 3
    draw_ellipse(ctx, x, y - r * 0.2, r/6, r/12, impulse_colors["gold"])
    ctx.restore();
  }

  if (type == "beat_hard") {
    ctx.save()
    ctx.globalAlpha *= 0.1
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r, r, "white_flower")
  }

  if (type == "untouchable") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.4, r * 0.4, "player_normal")
    ctx.save();
    ctx.lineWidth = 3
    draw_ellipse(ctx, x, y, r * 0.45, r * 0.45, impulse_colors["gold"])
    draw_ellipse(ctx, x, y, r * 0.55, r * 0.55, impulse_colors["gold"])
    ctx.restore();
  }
}
