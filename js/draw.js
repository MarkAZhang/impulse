
function draw_star(context, x, y, r, color) {
  context.beginPath()
  context.moveTo(x + r * Math.cos(Math.PI * 3/2), y + r * Math.sin(Math.PI * 3/2))
  context.lineTo(x + r * Math.cos(Math.PI * 1/6), y + r * Math.sin(Math.PI * 1/6))
  context.lineTo(x + r * Math.cos(Math.PI * 5/6), y + r * Math.sin(Math.PI * 5/6))
  context.closePath()
  context.globalAlpha = 0.5;
  context.fillStyle = impulse_colors[color]

  context.fill()
  context.globalAlpha = 1;
  context.strokeStyle = impulse_colors[color]

  context.lineWidth = Math.ceil(r/7.5)
  context.stroke()

}

function draw_empty_star(context, x, y, r, color) {
  context.beginPath()
  context.moveTo(x + r * Math.cos(Math.PI * 3/2), y + r * Math.sin(Math.PI * 3/2))
  context.lineTo(x + r * Math.cos(Math.PI * 1/6), y + r * Math.sin(Math.PI * 1/6))
  context.lineTo(x + r * Math.cos(Math.PI * 5/6), y + r * Math.sin(Math.PI * 5/6))
  context.closePath()
  context.strokeStyle = color ? color : impulse_colors["impulse_blue"]
  context.lineWidth = Math.ceil(r/7.5)
  context.stroke()
}

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


function draw_new_enemy_button(context, x, y, w, h, color, enemy_name) {

  context.save()
  context.clearRect(x - w/2, y - h/2, w, h)

  context.beginPath()
  context.rect(x - w/2, y - h/2, w, h)
  context.strokeStyle = color
  context.stroke()
  context.globalAlpha *= 0.1
  context.fillStyle =color
  context.fill()

  context.globalAlpha *= 10
  context.textAlign = "center"

  context.font = "10px MUli"
  context.fillText("NEW ENEMY", x, y - h * 0.4)
  context.font = "18px MUli"
  context.fillStyle = imp_params.impulse_enemy_stats[enemy_name].color
  var true_name = enemy_name
  if(imp_params.impulse_enemy_stats[enemy_name].true_name) {
    true_name = imp_params.impulse_enemy_stats[enemy_name].true_name
  }
  context.fillText(true_name.toUpperCase(), x, y - h * 0.25)

  draw_enemy(context, enemy_name, x, y , 30)

  context.fillStyle = color
  context.font = "20px MUli"
  context.fillText("PAUSE", x, y + h * 0.3)
  context.font = "16px MUli"
  context.fillText("FOR INFO", x, y + h * 0.42)
  context.restore()

}


function draw_score_achieved_box(context, x, y, w, h, color, text, text_color, text_size, world_num) {

  context.save()

  context.clearRect(x - w/2, y - h/2, w, h)

  context.shadowBlur = 0
  //context.shadowColor = text_color
  context.beginPath()
  context.rect(x - w/2, y - h/2, w, h)
  context.lineWidth = 4
  context.strokeStyle = text_color
  context.stroke()
  context.globalAlpha *= 0.1
  context.fillStyle = text_color
  context.fill()

  context.globalAlpha *= 10
  context.save()
  context.globalAlpha *= 0.4
  if(world_num == 0) {
    context.globalAlpha *= 0.5
  }
  if(text == "GATEWAY UNLOCKED")
    draw_tessellation_sign(context, world_num, x, y, 50)
  if(text == "SILVER SCORE") {
    drawSprite(context, x, y, 0, 50, 50, "silver_trophy")
  }
  if(text == "GOLD SCORE") {
    drawSprite(context, x, y, 0, 50, 50, "gold_trophy")
  }
  context.restore()
  context.textAlign = "center"
  context.font = text_size+"px Muli"
  context.fillStyle = text_color
  context.shadowColor = text_color
  context.fillText(text.split(" ")[0].toUpperCase(), x, y - 15)
  context.fillText(text.split(" ")[1].toUpperCase(), x, y + 15)

  context.restore()

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



var tessellation_logo_factor = {
    "0": 1.4,
    "1": 1,
    "2": 1.4,
    "3": 1.4,
    "4": 1.6
}

function draw_tessellation_sign(context, tessellation, x, y, size, glow, rotate) {

  // if(tessellation > 4) {
  //   context.save()
  //   if(rotate) {
  //     context.translate(x, y)
  //     context.rotate(rotate)
  //     context.translate(-x, -y)
  //   }
  //   context.beginPath()
  //   context.lineWidth = 2
  //   context.rect(x-size/2, y-size/2, size, size)
  //   context.rect(x-size/2+5, y-size/2+5, size-10, size-10)
  //   context.strokeStyle = impulse_colors["world "+tessellation+" dark"]

  //   context.stroke()
  //   context.restore()
  //   return
  // }
    size *= tessellation_logo_factor[tessellation]

    context.save()
    if(glow) {
      context.globalAlpha *= 0.5
      if(tessellation == 1) {
        drawSprite(context, x, y, (Math.PI/4), size * 2, size * 2, tessellation_glow_map[tessellation], tessellation_sprite_map[tessellation])
      }
      drawSprite(context, x, y, (Math.PI/4), size * 1.5, size * 1.5, tessellation_glow_map[tessellation], tessellation_sprite_map[tessellation])
    }
    
    context.restore()
    context.save()

    // set screen position
    context.translate(x, y);
    // set rotation
    var offset = (tessellation != 4 && tessellation != 2) ? Math.PI/4 : 0
    var angle = rotate ? rotate : 0
    context.rotate(angle + offset)
    drawSprite(context, 0, 0, 0, size, size, tessellation_logo_map[tessellation], tessellation_sprite_map[tessellation])
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

    size *= tessellation_logo_factor[tessellation]

    context.save()

    // set screen position
    context.translate(x, y);
    // set rotation
    if(tessellation != 4 && tessellation != 2)
    context.rotate(Math.PI/4)
    drawSprite(context, 0, 0, 0, size, size, tessellation_gray_logo_map[tessellation], tessellation_sprite_map[tessellation])
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
  //drawSprite(context, x, y - size, 0, size, size, "key")
  //drawSprite(context, x - size, y, 0, size, size, "key")
  //drawSprite(context, x, y , 0, size, size, "key")
  //drawSprite(context, x + size, y , 0, size, size, "key")
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
  /*context.font = "10px Muli"
  context.textAlign = "center"
  context.fillText("RIGHT CLICK", x, y - w/2 - 30)*/
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

function draw_fb_icon(context, x, y, scale, color) {
  context.save()
  context.beginPath()
  context.rect(x - scale/2, y - scale/2, scale, scale)
  context.lineWidth = 4
  context.strokeStyle = color
  context.stroke()
  context.fillStyle = color
  context.font = "20px Muli"
  context.fillText("f", x, y + scale/4);
  context.restore()  
}

function draw_pause_icon(context, x, y, scale, color, key_display) {

  context.save()
  context.clearRect(x - scale, y - scale, 3 * scale, 3 * scale)
  context.beginPath()
  context.rect(x - scale * 3/8, y - scale/2, scale * 1/4, scale)
  context.rect(x + scale * 1/8, y - scale/2, scale * 1/4, scale)
  context.fillStyle = color
  context.fill()

  if(key_display) {
    context.font = "10px Muli"
    context.textAlign = "center"
    if(imp_vars.player_data.options.control_hand == "left") {
      context.fillText("ENTER", x+scale, y+scale)
    } else {
      context.fillText("Q", x+scale, y+scale)
    }
  }

  context.restore()
}

function draw_gear(context, x, y, scale, color, center_color, center_glow) {
  context.save()
  //context.shadowBlur = 5
  var spokes = 6
  var unit = 2 * Math.PI / (spokes * 4)
  var offset = -0.4
  context.beginPath()
  for(var i = 0; i < spokes; i++) {

    if(i == 0) {
      context.moveTo(x - Math.cos(unit * (4 * i+ offset)) * scale, y - Math.sin(unit * (4 * i + offset)) * scale)
    } else {
      context.lineTo(x - Math.cos(unit * (4 * i+ offset)) * scale, y - Math.sin(unit * (4 * i+ offset)) * scale)
    }
    context.lineTo(x - Math.cos(unit * (4 * i + 1+ offset)) * scale, y - Math.sin(unit * (4 * i + 1+ offset)) * scale)
    context.lineTo(x - Math.cos(unit * (4 * i + 2+ offset)) * scale * 0.75, y - Math.sin(unit * (4 * i + 2+ offset)) * scale * 0.75)
    context.lineTo(x - Math.cos(unit * (4 * i + 3+ offset)) * scale * 0.75, y - Math.sin(unit * (4 * i + 3+ offset)) * scale * 0.75)
  }
  context.closePath()
  context.fillStyle = color
  context.fill()
  if(center_glow)
    context.globalAlpha /= 2
  context.beginPath()
  context.arc(x, y, scale * 0.5, 0, 2 * Math.PI * 0.999)
  context.fillStyle = center_color
  context.fill()
  context.restore()
}

function draw_credits_icon(context, x, y, scale, color) {
  context.save()
  context.beginPath()
  context.arc(x, y - scale/3, scale/3, 0, 2 * Math.PI, true)
  context.moveTo(x, y + scale*5/6)
  context.arc(x, y + scale*5/6, scale * 2/3, 0, Math.PI, true)
  context.fillStyle = color
  context.fill()
  context.restore()
}

function draw_tutorial_icon(context, x, y, scale, color) {
  context.save()
  context.beginPath()
  context.moveTo(x, y - scale * 1/3)
  context.lineTo(x - scale, y - scale * 2/3)
  context.lineTo(x - scale, y + scale * 2/3)
  context.lineTo(x, y + scale)
  context.moveTo(x, y + scale)
  context.lineTo(x, y - scale * 1/3)
  context.lineTo(x + scale, y - scale * 2/3)
  context.lineTo(x + scale, y + scale * 2/3)
  context.lineTo(x, y + scale)
  //context.rect(x - scale*2/3, y - scale*5/6, scale * 4/3, scale*5/3)
  context.lineWidth = 4
  context.strokeStyle = color
  context.stroke()
  //context.fillStyle = color
  //context.fill()
  context.restore()
}

function draw_retry_icon(context, x, y, scale, color) {
  context.save()
  context.beginPath()
  context.arc(x, y, scale * 3/4,  Math.PI * 2/5, Math.PI)
  context.lineWidth = 4
  context.strokeStyle = color
  context.stroke()
  context.beginPath()
  context.arc(x, y, scale * 3/4, Math.PI * 7/5, Math.PI * 2)
  context.lineWidth = 4
  context.strokeStyle = color
  context.stroke()

  context.beginPath()
  context.moveTo(x - scale * 3/16, y)
  context.lineTo(x - scale * 19/16, y)
  context.lineTo(x - scale * 11/16, y - scale/2)
  context.moveTo(x + scale * 3/16, y)
  context.lineTo(x + scale * 19/16, y)
  context.lineTo(x + scale * 11/16, y + scale/2)
  context.fillStyle = color
  context.fill()
  context.restore()
}

function draw_back_icon(context, x, y, scale, color) {
  context.save()
  context.beginPath()
  context.arc(x, y, scale * 3/4, 3*Math.PI/2, Math.PI * 3/4)
  context.lineWidth = 4
  context.strokeStyle = color
  context.stroke()
  context.beginPath()
  context.moveTo(x, y - scale * 3/16)
  context.lineTo(x, y - scale * 19/16)
  context.lineTo(x - scale/2, y - scale * 11/16)
  context.fillStyle = color
  context.fill()
  context.restore()
}

function draw_start_icon(context, x, y, scale, color) {
  context.save()
  draw_player_icon(context, x, y, scale/2, color)
    
  
  context.beginPath()
  context.arc(x, y, scale * 3/4, Math.PI * 7/6, Math.PI * 11/6)
  context.lineWidth = 2
  context.strokeStyle = color
  context.stroke()
  context.restore()
  
}

function draw_player_icon(context, x, y, scale, color) {
  context.beginPath()
  context.arc(x, y, scale, Math.PI * 3/2, Math.PI * 3/2 + Math.PI * 1.999)
  context.fillStyle = color
  context.fill()
  context.beginPath()
  context.arc(x, y, scale * 4/5, Math.PI * 3/2, Math.PI * 3/2 + Math.PI * 1.999 )
  context.fillStyle = "black"
  context.fill()
  context.beginPath()
  context.arc(x, y, scale * 11/20, Math.PI * 3/2, Math.PI * 3/2 + Math.PI * 1.999)
  context.fillStyle = color
  context.fill()
}

function draw_loading_icon(context, x, y, scale, color, prog) {
  context.save()
  draw_player_icon(context, x, y, scale/2, color)
  context.beginPath()
  context.arc(x, y, scale * 3/4, Math.PI * 3/2, Math.PI * 3/2 + Math.PI * 1.999 * prog)
  context.lineWidth = 2
  context.strokeStyle = color
  context.stroke()
  context.restore()
  
}

function draw_save_icon(context, x, y, scale, color) {
  context.save()
  context.shadowBlur = 0
  context.beginPath()
  context.fillStyle = color
  context.strokeStyle = color
  context.moveTo(x - scale * 0.6, y - scale * 0.6)
  context.lineTo(x - scale * 0.6, y + scale * 0.6)
  context.lineTo(x + scale * 0.6, y + scale * 0.6)
  context.lineTo(x + scale * 0.6, y - scale * 0.6)
  context.lineTo(x, y - scale * 0.6)
  context.lineTo(x, y)
  context.lineWidth = 5
  context.stroke()
  context.beginPath()
  context.moveTo(x - scale * 0.35, y - scale * 0.15)  
  context.lineTo(x + scale * 0.35, y - scale * 0.15)
  context.lineTo(x, y + scale * 0.2)
  context.fill()
  context.restore()
  
}
function draw_quest_icon(context, x, y, scale, color) {
  context.save()
  context.shadowBlur = 0
  context.beginPath()
  context.fillStyle = color
  context.strokeStyle = color
  context.arc(x, y, scale * 0.7, 0, 2 * Math.PI, true)
  context.lineWidth = 3
  context.stroke()
  context.beginPath()
  context.lineWidth = 4
  context.moveTo(x, y - scale * 0.4)  
  context.lineTo(x, y + scale * 0.2)
  context.moveTo(x, y + scale * 0.3)
  context.lineTo(x, y + scale * 0.4)
  context.stroke()
  context.restore()
  
}

function draw_quit_icon(context, x, y, scale, color) {
  context.save()
  context.shadowBlur = 0
  context.beginPath()
  context.moveTo(x - scale/2, y - scale/2)
  context.lineTo(x + scale/2, y + scale/2)
  context.moveTo(x - scale/2, y + scale/2)
  context.lineTo(x + scale/2, y - scale/2)
  context.strokeStyle = color
  context.lineWidth = 5
  context.stroke()
  context.restore()
}

function draw_texture_icon(context, x, y, scale, color) {
  context.save()
  context.translate(x, y)
  context.transform(1,-0.35,0,1,0,0);
  context.translate(-x, -y)
  context.beginPath()
  context.moveTo(x - scale/2, y)
  context.lineTo(x + scale/2, y)
  context.moveTo(x - scale/2, y + scale/2)
  context.lineTo(x + scale/2, y + scale/2)
  context.lineWidth = 6
  context.strokeStyle = color
  context.stroke()
  context.restore()
}

function draw_physics_icon(context, x, y, scale, color) {
  context.save()
  context.beginPath()
  context.rect(x - scale/4, y - scale/2, scale/2, scale/2)
  context.rect(x - scale/2, y, scale/2, scale/2)
  context.rect(x, y, scale/2, scale/2)
  context.strokeStyle = color
  context.lineWidth = 4
  context.stroke()
  context.restore()
}

function draw_note_icon(context, x, y, scale, color) {
  context.save()
  context.translate(scale/3, 0)
  context.beginPath()
  context.moveTo(x - scale/3, y + scale/2)
  context.lineTo(x - scale/3, y - scale * 1/6)
  context.lineTo(x + scale/3, y - scale * 2/6)
  context.lineTo(x + scale/3, y + scale * 2/6)
  context.lineWidth = 4
  context.strokeStyle = color
  context.stroke()
  //context.beginPath()
  //context.moveTo(x + scale/2, y + scale * 2/3)
  //context.lineTo(x + scale/2, y - scale * 2/3)
  //context.stroke()

  var x1 = x - scale/2
  var y1 = y + scale/2
  context.save();
  context.translate(x1, y1)
  context.scale(1.3, 1);
  context.translate(-x1, -y1)
  context.beginPath()
  context.arc(x1, y1, scale/6, 0, 2 * Math.PI, true)
  context.fillStyle = color
  context.fill()

  context.restore()

  var x2 = x + scale/6
  var y2 = y + scale/3
  context.save();
  context.translate(x2, y2)
  context.scale(1.3, 1);
  context.translate(-x2, -y2)
  context.beginPath()
  context.arc(x2, y2, scale/6, 0, 2 * Math.PI, true)
  context.fillStyle = color
  context.fill()
  context.restore()
  context.restore()
}

function draw_music_icon(context, x, y, scale, color, key_display, mute) {
  context.save()
  context.clearRect(x - scale, y - scale, 3 * scale, 3 * scale)

  context.beginPath()
  context.moveTo(x - scale * 0.3- scale/2 * 0.75, y - scale/2 * 0.6)
  context.lineTo(x- scale * 0.3, y - scale/2 * 0.6)
  context.lineTo(x - scale * 0.3+ scale/2 * 0.75, y - scale * 0.6)
  context.lineTo(x- scale * 0.3 + scale/2  * 0.75, y + scale * 0.6)
  context.lineTo(x- scale * 0.3, y + scale/2* 0.6)
  context.lineTo(x- scale * 0.3 - scale/2 * 0.75, y + scale/2  * 0.6)
  context.fillStyle = color
  context.fill()
  if(mute) {
    context.beginPath()
    context.arc(x - scale * 0.3+ scale * 0.75, y, scale/2 * 0.45, 0, 2 * Math.PI, true)
    context.moveTo(x - scale * 0.3+ scale  * 0.75- Math.cos(Math.PI/4) * scale/2 * 0.45, y - Math.cos(Math.PI/4) * scale/2 * 0.45)
    context.lineTo(x - scale * 0.3+ scale* 0.75+ Math.cos(Math.PI/4) * scale/2 * 0.45, y + Math.cos(Math.PI/4) * scale/2 * 0.405)
    context.lineWidth = 2
    context.strokeStyle = color
    context.stroke()
  } else {
    context.beginPath()
    context.arc(x - scale * 0.3+ scale * 0.4, y, scale/2 * 0.6, -Math.PI/3,Math.PI/3, false)
    context.lineWidth = 2
    context.strokeStyle = color
    context.stroke()
    context.beginPath()
    context.arc(x- scale * 0.3 + scale * 0.4, y, scale/2, -Math.PI/3,Math.PI/3, false)
    context.stroke()
  }
  if(key_display) {
    context.font = "10px Muli"
    context.textAlign = "center"
    context.fillText("X", x+scale, y+scale)
  }
  context.restore()
}

function draw_fullscreen_icon(context, x, y, scale, color, key_display) {
  context.save()
  context.clearRect(x - scale, y - scale, 3 * scale, 3 * scale)
  context.beginPath()
  context.globalAlpha /= 2
  context.rect(x - scale * 3/4, y - scale * 3/4, scale * 3/2, scale * 3/2)
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = 2
  context.stroke()
  context.globalAlpha *= 2
  context.beginPath()
  context.moveTo(x - scale * 1/2, y - scale * 1/2)
  context.lineTo(x - scale * 0/8, y - scale * 1/2)
  context.lineTo(x - scale * 1/2, y - scale * 0/8)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(x + scale * 1/2, y + scale * 1/2)
  context.lineTo(x + scale * 0/8, y + scale * 1/2)
  context.lineTo(x + scale * 1/2, y + scale * 0/8)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(x - scale * 1/2, y - scale * 1/2)
  context.lineTo(x + scale * 1/2, y + scale * 1/2)
  context.stroke()
  if(key_display) {
    context.font = "10px Muli"
    context.textAlign = "center"
    context.fillText("C", x+scale, y+scale)
  }
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
  context.rect(x - w * .5 - 60, y - h * .5 - 20, w+120 , h+40)
  context.fillStyle ="black"
  context.fill()

  context.restore();
  context.save();
  context.beginPath()
  context.shadowBlur = 20;
  context.shadowColor = color

  context.globalAlpha /= 10
  context.rect(x - w * .5, y - h * .5, w , h)
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = 2
  context.fill()
  context.stroke()

  context.globalAlpha *= 10
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

function draw_spark(context, x, y, angle) {

  drawSprite(context, x, y, angle, 25, 25, "spark")

}

function draw_spark_fragment(context, x, y, angle) {

  drawSprite(context, x, y, angle, 12, 12, "spark")

}


function draw_multi(context, x, y, angle) {

  drawSprite(context, x, y, angle, 25, 25, "multi")

}

function draw_multi_fragment(context, x, y, angle) {

  drawSprite(context, x, y, angle, 12, 12, "multi")

}

function draw_logo(context, x, y, text, scale) {

  context.save()
  context.textAlign = "center"
  context.shadowColor = impulse_colors["impulse_blue"]
  context.shadowBlur = 0
  context.fillStyle = "white"//impulse_colors["impulse_blue"]

/*  context.font = '72px Muli'
  context.fillText("IMPULSE", x, y)*/
  var logoScale = scale ? scale : 0.85;
  context.drawImage(logoSprite, x - logoSprite.width/2 * logoScale, y - logoSprite.height * 0.75 * logoScale, logoSprite.width * logoScale, logoSprite.height * logoScale)

  if(text) {
    context.font = '16px Muli'
  //context.globalAlpha /= 2
  context.fillText(text, x, y + 40)
  //context.globalAlpha *= 2
  }
  context.restore()

}

function draw_lives_and_sparks(context, lives, sparks, ultimates, x, y, size, args) {
  context.save()

  var x_offset = size * 0.9
  if(args.ult) {
    x_offset = 0
  }
  context.font = size+'px Muli'
  context.fillStyle = "white"
  context.shadowBlur = 0
  
  drawSprite(context, x - size * 1.8 + x_offset , y, 0, 1.3 * size, 1.3 * size, "lives_icon")
  drawSprite(context, x + x_offset + size * 0.05, y + size * 0.05, 0, 0.8 * size, 0.8 * size, "spark")
  if(args.shadow) {
    context.shadowBlur = 10
    context.shadowColor = context.fillStyle
  }
  context.textAlign = 'center'
  context.fillText(lives, x - size * 1.8 + x_offset , y + size * 1.6)
   if(args.starting_values)
    context.fillText(sparks, x + x_offset , y+ size * 1.6)
  else 
    context.fillText(sparks, x + x_offset , y+ size * 1.6)
  
  if(args.labels) {
    context.font = Math.max(8, (size/3))+'px Muli'
    context.fillText("LIVES", x - size * 1.8 + x_offset , y - size * 0.8)

    if(args.starting_values) {
      context.fillText("SPARK", x + x_offset , y - size * 1.4)  
      context.fillText("VALUE", x + x_offset , y - size * 0.8)  
    } else
      context.fillText("SPARKS", x + x_offset , y - size * 0.8)

  }
  context.font = size+'px Muli'
  if(args.ult) {
    context.fillStyle = "white"
    context.shadowColor = context.fillStyle
    drawSprite(context, x + size * 1.8 , y, 0, 1.2 * size, 1.2 * size, "ultimate_icon")
    context.fillText(ultimates, x + size * 1.8, y+ size * 1.6)
  }

  if(args.labels && args.ult) {
    context.font = Math.max(8, (size/3))+'px Muli'
    context.fillText("ULT", x + size * 1.8, y - size * 0.8)
  }
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

function get_ultimate_canvas() {
  var ult_canvas = document.createElement('canvas');
  ult_canvas.width = 400
  ult_canvas.height = 400

  var ult_canvas_ctx = ult_canvas.getContext('2d');
  ult_canvas_ctx.globalAlpha = 0.2
  drawSprite(ult_canvas_ctx, ult_canvas.width/2, ult_canvas.height/2, 0, ult_canvas.width * 0.7, ult_canvas.height * 0.7, "ultimate")
  ult_canvas_ctx.globalAlpha = 1
  // Commented out section is a more intricate Ultimate design which seems out of place in the art style.
  /*for ( var i = 0; i < 16; i++) {
    drawSprite(ult_canvas_ctx, ult_canvas.width/2 + ult_canvas.width * 0.25 * Math.cos(i * Math.PI * 2 / 16), 
                               ult_canvas.height/2 + ult_canvas.width * 0.25 * Math.sin(i * Math.PI * 2 / 16),
                               Math.PI * 2 / 16 * i, 18, 32, "ultimate")    
  }*/
  var number_shards = 48
  for ( var i = 0; i < number_shards; i++) {
    var radius = i % 2 ? ult_canvas.width * 0.4 : ult_canvas.width * 0.42
    drawSprite(ult_canvas_ctx, ult_canvas.width/2 + radius * Math.cos(i * Math.PI * 2 / number_shards), 
                               ult_canvas.height/2 + radius * Math.sin(i * Math.PI * 2 / number_shards),
                               Math.PI * 2 / number_shards * i, 32, 18, "ultimate_shard")
    /*drawSprite(ult_canvas_ctx, ult_canvas.width/2 + ult_canvas.width * 0.33 * Math.cos(i * Math.PI * 2 / 32), 
                               ult_canvas.height/2 + ult_canvas.width * 0.33 * Math.sin(i * Math.PI * 2 / 32),
                               Math.PI * 2 / 32 * i, 18, 32, "ultimate_shard")    */
  }

  /*for ( var i = 0; i < 32; i++) {
    drawSprite(ult_canvas_ctx, ult_canvas.width/2 + ult_canvas.width * 0.4 * Math.cos(i * Math.PI * 2 / 32), 
                               ult_canvas.height/2 + ult_canvas.width * 0.4 * Math.sin(i * Math.PI * 2 / 32),
                               Math.PI * 2 / 32 * i, 36, 64, "ultimate")    
  }*/
  return ult_canvas

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


function loadSprite(imageName)
{
    // create new image object
    var image = new Image();
    // load image
    image.src = imageName;
    // return image object
    return image;
}

var playerSprite = loadSprite("art/sprites.png")

var spriteSheetData = {
  //x, y, w, h
  //"player_normal": [60, 0, 60, 60],
  "player_normal": [0, 0, 40, 40],
  // not sure why this offset is necessary...
  "player_red": [40, -1, 40, 40],
  "player_yellow": [80, 0, 41, 41],
  "player_gray": [120, 0, 41, 41],
  "player_green": [160, 0, 41, 41],
  "player_white": [200, 0, 40, 40],
  "spark": [0, 41, 40, 40],
  "multi": [0, 81, 40, 40],
  "white_glow": [40, 40, 100, 100],
  "ultimate": [148, 41, 150, 150],
  "lives_icon": [0, 0, 40, 40],
  "sparks_icon": [0, 41, 40, 40],
  "ultimate_icon": [0, 155, 42, 42],
  "ultimate_icon_blue": [43, 155, 42, 42],
  "ultimate_shard": [0, 121, 18, 32],
  "world1_starblank": [85, 199, 41, 38],
  "world1_star": [127, 199, 41, 38],
  "world2_starblank": [85, 237, 41, 38],
  "world2_star": [127, 237, 41, 38],
  "world3_starblank": [0, 199, 41, 38],
  "world3_star": [42, 199, 41, 38],
  "world4_starblank": [0, 237, 41, 38],
  "world4_star": [42, 237, 41, 38],
  "silver_trophy": [0, 277, 90, 78],
  "gold_trophy": [89, 277, 90, 78],
  "timer_icon": [169, 197, 61, 77],

  "immunitas_arm": [0, 0, 90, 90],
  "immunitas_arm_red": [150, 135, 90, 90],
  "immunitas_hand": [90, 0, 90, 90],
  "immunitas_hand_red": [240, 135, 90, 90],
  "immunitas_logo_gray": [330, 135, 90, 90],
  "immunitas_head": [0, 90, 108, 108],
  "immunitas_head_red": [450, 123, 108, 108],
  "immunitas_glow": [180, 0, 135, 135],
  "immunitas_red_glow": [315, 0, 135, 135],
  "immunitas_aura": [450, 0, 123, 123],
  "immunitas_aura_red": [573, 0, 123, 123],
  "immunitas_arrow": [0, 200, 70, 70],
  "immunitas_lockon" : [573, 123, 120, 120],

  "consumendi_head": [0, 0, 180, 180],
  "consumendi_head_red": [720, 136, 135, 135],
  "consumendi_aura": [181, 0, 269, 269],
  "consumendi_small_diamond": [94, 180, 30, 56],
  "consumendi_small_diamond_filled": [64, 180, 30, 56],
  "consumendi_small_arrow": [124, 180, 30, 16],
  "consumendi_glow": [720, 0, 135, 135],
  "consumendi_logo": [450, 0, 120, 119],
  "consumendi_mini": [450, 119, 120, 120],
  "consumendi_mini_gray": [570, 0, 120, 120],

  "negligentia_head": [0, 0, 180, 180],
  "negligentia_head_red": [0, 180, 180, 180],
  "negligentia_arm_striking": [180, 0, 244, 100],
  "negligentia_arm_striking_red": [180, 100, 244, 100],
  "negligentia_wheel": [424, 0, 134, 134],
  "negligentia_wheel_red": [424, 270, 134, 134],
  "negligentia_wheel_complete": [423, 135, 135, 135],
  "negligentia_glow": [560, 0, 115, 115],
  "negligentia_glow_red": [560, 115, 115, 115],
  "negligentia_aura": [559, 270, 39, 65],
  "negligentia_aura_open": [598, 270, 39, 65],
  "negligentia_arm_ring": [180, 200, 180, 180],
  "negligentia_logo": [680, 0, 120, 120],
  "negligentia_logo_gray": [680, 120, 120, 120],

  "adrogantia_attack_bud": [0, 0, 80, 80],
  "adrogantia_spawner": [0, 80, 80, 80],
  "adrogantia_body_bud": [80, 0, 80, 80],
  "adrogantia_attack_bud_firing": [80, 80, 80, 80],
  "adrogantia_head": [181, 1, 160, 160],
  "adrogantia_glow": [340, 0, 135, 135],
  "adrogantia_logo": [476, 0, 125, 125],
  "adrogantia_logo_gray": [476, 125, 125, 125],

  "generated_ultimate": [0, 0, 400, 400]
}

var immunitasSprite = loadSprite("art/immunitas_sprite.png")
var consumendiSprite = loadSprite("art/consumendi_sprite.png")
var negligentiaSprite = loadSprite("art/negligentia_sprite.png")
var adrogantiaSprite = loadSprite("art/adrogantia_sprite.png")
var logoSprite = loadSprite("art/logo.png")

var tessellation_glow_map = {
  "0": "white_glow",
  "1": "immunitas_glow",
  "2": "consumendi_glow",
  "3": "negligentia_glow",
  "4": "adrogantia_glow"
}
var tessellation_logo_map = {
  "0": "ultimate",
  "1": "immunitas_arm",
  "2": "consumendi_logo",
  "3": "negligentia_logo",
  "4": "adrogantia_logo"
}
var tessellation_gray_logo_map = {
  "0": "world_logo",
  "1": "immunitas_logo_gray",
  "2": "consumendi_mini_gray",
  "3": "negligentia_logo_gray",
  "4": "adrogantia_logo_gray"
}
var tessellation_sprite_map = {
  "0": playerSprite,
  "1": immunitasSprite,
  "2": consumendiSprite,
  "3": negligentiaSprite,
  "4": adrogantiaSprite,
}

var impulse_bg_images = {}

for(var bg in imp_params.bg) {
  impulse_bg_images[bg] = loadSprite("art/"+imp_params.bg[bg]+".png");
}

function drawSprite(ctx, x, y, rotation, actualWidth, actualHeight, spriteName, imageObject)
{

    imageObject = typeof imageObject !== 'undefined' ? imageObject: playerSprite;
    var w = imageObject.width;
    var h = imageObject.height;

    // save state
    ctx.save();
    // set screen position
    ctx.translate(x, y);
    // set rotation
    ctx.rotate(rotation);
    // set scale value

    //ctx.scale(actualWidth/imageObject.width)

    // draw image to screen drawImage(imageObject, sourceX, sourceY, sourceWidth, sourceHeight,
    // destinationX, destinationY, destinationWidth, destinationHeight)
    ctx.drawImage(imageObject, spriteSheetData[spriteName][0], spriteSheetData[spriteName][1], spriteSheetData[spriteName][2], spriteSheetData[spriteName][3], -actualWidth/2, -actualHeight/2, actualWidth, actualHeight);
    // restore state
    ctx.restore();
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

  ctx.rect(xLow, yLow, xHigh - xLow, yHigh - yLow)
  ctx.clip()

  
  for(var x = xLow; x < xHigh; x+=w) {
    for(var y = yLow; y < yHigh; y+=h) {
      ctx.drawImage(bg, 0, 0, w, h, x, y, w, h)
    }
  }
  /*ctx.rect(xLow + 5, yLow + 5, xHigh - xLow - 10, yHigh - yLow - 10)
  ctx.strokeStyle = "white"
  ctx.lineWidth = 10
  ctx.stroke();*/
  ctx.restore()

}

function draw_image_on_bg_ctx(bg_ctx, image, alpha) {
  bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
  bg_ctx.fillStyle = "#000"
  bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
  bg_ctx.globalAlpha = alpha
  bg_ctx.drawImage(image, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight);
  bg_ctx.globalAlpha = 1
}

function draw_victory_type_icon(ctx, x, y, world_num, victory_type, scale) {
  if (victory_type == "half") {
    drawSprite(ctx, x - 30 * scale, y, 0, 25 * scale, 25 * scale, "world" + world_num + "_starblank")
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
  if (type == "beat_hive1") {
    draw_tessellation_sign(ctx, 1, x, y, r * 0.6, true, 0);
  }
  if (type == "beat_hive2") {
    draw_tessellation_sign(ctx, 2,  x, y, r * 0.6, true, 0);
  }
  if (type == "beat_hive3") {
    draw_tessellation_sign(ctx, 3, x, y, r * 0.6, true, 0);
  }
  if (type == "beat_hive4") {
    draw_tessellation_sign(ctx, 4, x, y, r * 0.6, true, 0);
  }
  if (type == "first_gold") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.8, r * 0.8, "gold_trophy")

    ctx.font = "15px Muli"
    ctx.textAlign = 'center'
    ctx.fillStyle = impulse_colors["gold"]
    ctx.fillText("1", x, y - 1)
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
  }

  if (type.substring(1, 5) == "star") {
    ctx.save()
    ctx.globalAlpha *= 0.1
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    var stars = parseInt(type.substring(0, 1));
    var angles_to_draw = [Math.PI * 1.25, Math.PI * 3/2, Math.PI * 1.75];
    for(var i = 0; i < angles_to_draw.length; i++) {
      var angle = angles_to_draw[i];
      drawSprite(ctx, 
        x + r * 0.6 * Math.cos(angle), 
        y + r * 0.1 + r * 0.6 * Math.sin(angle), 
        0, 20, 20, i < stars ? "world"+(stars+1)+"_star" : "world"+(stars+1)+"_starblank")
    }
    drawSprite(ctx, x, y + r / 4, 0, r * 0.7, r * 0.7, "ultimate_icon")
  }
}
