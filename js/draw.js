
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
  context.fillText(enemy_name.toUpperCase(), x, y - h * 0.25)

  draw_enemy(context, enemy_name, x, y, 30)

  context.font = "10px MUli"
  context.fillStyle =color
  context.fillText("CLICK FOR INFO", x, y + h * 0.4)
  context.restore()

}


function draw_score_achieved_box(context, x, y, w, h, color, text, text_color, text_size, world_num) {

  context.save()

  context.clearRect(x - w/2, y - h/2, w, h)

  context.shadowBlur = 10
  context.shadowColor = text_color
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
  context.globalAlpha *= 0.5
  if(world_num == 0) {
    context.globalAlpha *= 0.5
  }
  if(text == "GATEWAY UNLOCKED")
    draw_tessellation_sign(context, world_num, x, y, 50)
  context.restore()
  context.textAlign = "center"
  context.font = text_size+"px Muli"
  context.fillStyle = text_color
  context.shadowColor = text_color
  context.fillText(text.split(" ")[0].toUpperCase(), x, y - 10)
  context.fillText(text.split(" ")[1].toUpperCase(), x, y + 10)



  context.restore()

}


function draw_enemy(context, enemy_name, x, y, d, rotate) {

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
      if(imp_params.impulse_enemy_stats[enemy_name].interior_color) {
        draw_shape(context, x, y, this_shape, draw_scale, imp_params.impulse_enemy_stats[enemy_name].color, 1, 0, imp_params.impulse_enemy_stats[enemy_name].interior_color)  
      } else {
        draw_shape(context, x, y, this_shape, draw_scale, imp_params.impulse_enemy_stats[enemy_name].color)  
      }
      
    }
    if(!(typeof imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons === "undefined")) {
      for(var m = 0; m < imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons.length; m++) {
        var this_shape = imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons[m]
        if(imp_params.impulse_enemy_stats[enemy_name].interior_color) {
          draw_shape(context, x, y, this_shape, draw_scale, imp_params.impulse_enemy_stats[enemy_name].color, 1, 0, imp_params.impulse_enemy_stats[enemy_name].interior_color)  
        } else {
          draw_shape(context, x, y, this_shape, draw_scale, imp_params.impulse_enemy_stats[enemy_name].color)  
        }
      }
    }
  context.restore()
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
  context.restore()
}

function draw_enemy_real_size(context, enemy_name, x, y, d, rotate) {

  context.save()
  if(rotate) {
    context.translate(x, y);
    context.rotate(rotate);
    context.translate(-x, -y);
  }

  var draw_scale = d/2
  if(enemy_name.slice(enemy_name.length - 4) == "boss") {
    draw_scale = d/2
  }
  for(var m = 0; m < imp_params.impulse_enemy_stats[enemy_name].shape_polygons.length; m++) {
    var this_shape = imp_params.impulse_enemy_stats[enemy_name].shape_polygons[m]
    draw_shape(context, x, y, this_shape, draw_scale, imp_params.impulse_enemy_stats[enemy_name].color)
  }
  if(!(typeof imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons === "undefined")) {
    for(var m = 0; m < imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons.length; m++) {
      var this_shape = imp_params.impulse_enemy_stats[enemy_name].extra_rendering_polygons[m]
      draw_shape(context, x, y, this_shape, draw_scale, imp_params.impulse_enemy_stats[enemy_name].color)
    }
  }
  context.restore()
}



var tessellation_logo_factor = {
    "0": 1.4,
    "1": 1,
    "2": 1.4,
    "3": 1.4,
    "4": 1.6
}

function draw_tessellation_sign(context, tessellation, x, y, size, extra_factor, rotate) {

  if(tessellation > 4) {
    context.save()
    if(rotate) {
      context.translate(x, y)
      context.rotate(rotate)
      context.translate(-x, -y)
    }
    context.beginPath()
    context.lineWidth = 2
    context.rect(x-size/2, y-size/2, size, size)
    context.rect(x-size/2+5, y-size/2+5, size-10, size-10)
    context.strokeStyle = impulse_colors["world "+tessellation+" dark"]

    context.stroke()
    context.restore()
    return
  }


  size *= tessellation_logo_factor[tessellation]

    context.save()
    context.globalAlpha *= 0.5
    if(extra_factor)
      context.globalAlpha = Math.min(1, context.globalAlpha * extra_factor)

    if(tessellation == 1) {
      drawSprite(context, x, y, (Math.PI/4), size * 2, size * 2, tessellation_glow_map[tessellation], tessellation_sprite_map[tessellation])
    }
    drawSprite(context, x, y, (Math.PI/4), size * 1.5, size * 1.5, tessellation_glow_map[tessellation], tessellation_sprite_map[tessellation])


    context.restore()
    context.save()
    context.globalAlpha /= 6
    if(extra_factor)
      context.globalAlpha = Math.min(1, context.globalAlpha * extra_factor)

    // set screen position
    context.translate(x, y);
    // set rotation
    if(rotate)
      context.rotate(rotate);
    else if(tessellation != 4)
      context.rotate(Math.PI/4)
    drawSprite(context, 0, 0, 0, size, size, tessellation_logo_map[tessellation], tessellation_sprite_map[tessellation])
    if(tessellation == 1) {
      context.beginPath()
      context.rect(-size/2-10, -size/2-10, size+20, size+20)
      context.lineWidth = 5
      context.strokeStyle = impulse_colors["boss "+tessellation]
      context.stroke()
    }
    context.restore()


}



function draw_arrow_keys(context, x, y, size, color, keysArray) {
  context.save()

  context.shadowColor = color
  context.shadowBlur = 10
  //drawSprite(context, x, y - size, 0, size, size, "key")
  //drawSprite(context, x - size, y, 0, size, size, "key")
  //drawSprite(context, x, y , 0, size, size, "key")
  //drawSprite(context, x + size, y , 0, size, size, "key")
  draw_rounded_rect(context, x, y-size, size-5, size-5, 10, color)
  draw_rounded_rect(context, x - size, y, size-5, size-5, 10, color)
  draw_rounded_rect(context, x, y, size-5, size-5, 10, color)
  draw_rounded_rect(context, x + size, y, size-5, size-5, 10, color)

  context.fillStyle = color;
  context.font = '20px Muli'
  context.textAlign = "center"
  if(keysArray) {
    context.fillText(keysArray[0], x, y - size * 2/3)
    context.fillText(keysArray[1], x - size, y + size * 1/3)
    context.fillText(keysArray[2], x, y + size * 1/3)
    context.fillText(keysArray[3], x + size, y + size * 1/3)
    draw_arrow(context, x, y - size - 8, 20, "up", color)
    draw_arrow(context, x - size, y - 8, 20, "left", color)
    draw_arrow(context, x, y - 10, 20, "down", color)
    draw_arrow(context, x + size, y - 8, 20, "right", color)
  } else {
    draw_arrow(context, x, y - size , 20, "up", color)
    draw_arrow(context, x - size, y , 20, "left", color)
    draw_arrow(context, x, y - 2, 20, "down", color)
    draw_arrow(context, x + size, y, 20, "right", color)
  }
  context.restore()
}

function draw_mouse(context, x, y, w, h, color) {
  context.save()
  context.shadowColor = color
  context.fillStyle = color
  context.font = "10px Muli"
  context.textAlign = "center"
  context.fillText("LEFT CLICK", x, y - w/2 - 30)
  context.shadowBlur = 10
  draw_rounded_rect(context, x, y, w, h, 10, color)
  context.clip()
  context.beginPath()
  context.rect(x - w/2, y - h/2, w/2, h/3)
  context.globalAlpha = 0.5
  
  context.fill()
  context.restore()
  context.save()
  context.globalAlpha = 1
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
  context.font = "10px Muli"
  context.textAlign = "center"
  context.fillText("RIGHT CLICK", x, y - w/2 - 30)
  context.shadowBlur = 10
  draw_rounded_rect(context, x, y, w, h, 10, color)
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
  context.shadowBlur = 10
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
      context.fillText("SHIFT", x+scale, y+scale)
    } else {
      context.fillText("Q", x+scale, y+scale)
    }
  }

  context.restore()
}

function draw_gear(context, x, y, scale, color, center_color) {
  context.save()
  context.shadowBlur = 5
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
  context.globalAlpha /= 2
  context.beginPath()
  context.arc(x, y, scale * 0.5, 0, 2 * Math.PI * 0.999)
  context.fillStyle = center_color
  context.fill()
  context.restore()
}

function draw_music_icon(context, x, y, scale, color, key_display) {
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
  if(imp_vars.player_data.options.music_mute) {
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
    if(imp_vars.player_data.options.control_hand == "left") {
      context.fillText("M", x+scale, y+scale)
    } else {
      context.fillText("X", x+scale, y+scale)
    }
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
    if(imp_vars.player_data.options.control_hand == "left") {
      context.fillText("N", x+scale, y+scale)
    } else {
      context.fillText("F", x+scale, y+scale)
    }
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
  if(interior_color) {
    context.fillStyle = interior_color  
  } else {
    context.globalAlpha /= 2
  }

  context.fill()
  if(!interior_color)
    context.globalAlpha *= 2
  context.strokeStyle = color
  context.lineWidth = 2
  context.stroke()
  context.restore()
}

function draw_vprogress_bar(context, x, y, w, h, prop, color, up) {


  context.save();
  context.shadowBlur = 0

  context.globalAlpha = 1
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

  shadowed = shadowed == undefined ? true : shadowed
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

function draw_progress_bar(context, x, y, w, h, prop, color, bcolor, noborder) {
  context.beginPath()
  context.rect(x - w * .5, y - h * .5, w * prop, h)
  context.fillStyle = color
  context.fill()

  if(!noborder) {
    context.beginPath()
    context.rect(x - w * .5, y - h * .5, w , h)
    context.strokeStyle = bcolor ? bcolor : "black"
    context.lineWidth = 2
    context.stroke()
  }
}

function draw_spark(context, x, y) {

  drawSprite(context, x, y, 0, 30, 30, "spark")

}

function draw_spark_fragment(context, x, y) {

  drawSprite(context, x, y, 0, 15, 15, "spark")

}


function draw_multi(context, x, y) {

  drawSprite(context, x, y, 0, 30, 30, "multi")

}

function draw_multi_fragment(context, x, y) {

  drawSprite(context, x, y, 0, 15, 15, "multi")

}

function draw_logo(context, x, y, name) {
  context.textAlign = "center"
  context.shadowColor = impulse_colors["impulse_blue"]
  context.shadowBlur = 20
  context.fillStyle = impulse_colors["impulse_blue"]

  context.font = '72px Muli'
  context.fillText("IMPULSE", x, y)

  if(name) {
    context.font = '24px Muli'
  context.globalAlpha /= 2
  context.fillText("MARK ZHANG", x, y + 50)
  context.globalAlpha *= 2
  }


}

function draw_lives_and_sparks(context, lives, sparks, ultimates, x, y, size, args) {


  context.save()

  var x_offset = size * 0.9
  if(args.ult) {
    x_offset = 0
  }
  context.font = size+'px Muli'
  context.fillStyle = impulse_colors["impulse_blue"]
  context.shadowBlur = 0
  
  drawSprite(context, x - size * 1.8 + x_offset , y, 0, 1.3 * size, 1.3 * size, "lives_icon")
  if(args.starting_values)
    drawSprite(context, x + x_offset , y, 0, 1.5 * size, 1.5 * size, "spark")
  else 
    drawSprite(context, x + x_offset , y, 0, 1.5 * size, 1.5 * size, "sparks_icon")
  context.shadowBlur = 10
  context.shadowColor = context.fillStyle
  context.textAlign = 'center'
  context.fillText(lives, x - size * 1.8 + x_offset , y + size * 1.6)
   if(args.starting_values)
    context.fillText(sparks, x + x_offset , y+ size * 1.6)
  else 
    context.fillText(sparks, x + x_offset , y+ size * 1.6)
  
  if(args.labels) {
    context.font = (size/3)+'px Muli'
    context.fillText("LIVES", x - size * 1.8 + x_offset , y - size * 0.8)

    if(args.starting_values) {
      context.fillText("SPARK", x + x_offset , y - size * 1.2)  
      context.fillText("VALUE", x + x_offset , y - size * 0.8)  
    } else
      context.fillText("SPARKS", x + x_offset , y - size * 0.8)

  }
  context.font = size+'px Muli'
  if(args.ult) {
    context.fillStyle = "white"
    context.shadowColor = context.fillStyle
    drawSprite(context, x + size * 1.8 , y, 0, 1.7 * size, 1.7 * size, "ultimate_icon")
    context.fillText(ultimates, x + size * 1.8, y+ size * 1.6)
  }

  if(args.labels && args.ult) {
    context.font = (size/3)+'px Muli'
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
  context.globalAlpha = 0.3
  context.fillStyle = border_color
  context.fill()
  context.globalAlpha = 1
  var polygons = imp_params.impulse_level_data[level_name].obstacle_v
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


function loadSprite(imageName)
{
    // create new image object
    var image = new Image();
    // load image
    image.src = imageName;
    // return image object
    return image;
}

playerSprite = loadSprite("art/sprites.png")

spriteSheetData = {
  //x, y, w, h
  //"player_normal": [60, 0, 60, 60],
  "player_normal": [0, 0, 41, 41],
  "player_red": [40, 0, 41, 41],
  "player_yellow": [80, 0, 41, 41],
  "player_gray": [120, 0, 41, 41],
  "player_green": [160, 0, 41, 41],
  "spark": [0, 60, 30, 30],
  "multi": [30, 60, 30, 30],
  "white_glow": [100, 80, 100, 100],
  "world_logo": [200, 80, 100, 100],
  "lives_icon": [0, 0, 41, 41],
  "sparks_icon": [35, 90, 35, 35],
  "ultimate_icon": [0, 125, 35, 35],


  "immunitas_arm": [0, 0, 90, 90],
  "immunitas_arm_red": [180, 135, 90, 90],
  "immunitas_hand": [90, 0, 90, 90],
  "immunitas_hand_red": [270, 135, 90, 90],
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
  "consumendi_aura": [180, 0, 270, 270],
  "consumendi_aura_filled": [450, 0, 270, 270],
  "consumendi_mini": [0, 180, 64, 64],
  "consumendi_small_arrow": [64, 180, 50, 32],
  "consumendi_long_arrow": [64, 210, 50, 80],
  "consumendi_small_arrow_filled": [120, 180, 50, 32],
  "consumendi_glow": [720, 0, 135, 135],

  "negligentia_head": [0, 0, 180, 180],
  "negligentia_head_red": [0, 180, 180, 180],
  "negligentia_arm_striking": [180, 0, 244, 100],
  "negligentia_arm_striking_red": [180, 100, 244, 100],
  "negligentia_wheel": [424, 0, 134, 134],
  "negligentia_wheel_red": [424, 270, 134, 134],
  "negligentia_wheel_complete": [423, 135, 135, 135],
  "negligentia_glow": [559, 0, 135, 135],
  "negligentia_glow_red": [559, 135, 135, 135],
  "negligentia_aura": [559, 270, 39, 65],
  "negligentia_aura_open": [598, 270, 39, 65],
  "negligentia_arm_ring": [180, 200, 180, 180],
  "negligentia_logo": [670, 275, 130, 130],

  "adrogantia_attack_bud": [0, 0, 80, 80],
  "adrogantia_spawner": [0, 80, 80, 80],
  "adrogantia_body_bud": [80, 0, 80, 80],
  "adrogantia_attack_bud_firing": [80, 80, 80, 80],
  "adrogantia_head": [180, 0, 160, 160],
  "adrogantia_glow": [340, 0, 135, 135],
  "adrogantia_logo": [475, 0, 125, 125]
}

var immunitasSprite = loadSprite("art/immunitas_sprite.png")
var consumendiSprite = loadSprite("art/consumendi_sprite.png")
var negligentiaSprite = loadSprite("art/negligentia_sprite.png")
var adrogantiaSprite = loadSprite("art/adrogantia_sprite.png")

var tessellation_glow_map = {
  "0": "white_glow",
  "1": "immunitas_glow",
  "2": "consumendi_glow",
  "3": "negligentia_glow",
  "4": "adrogantia_glow"
}
var tessellation_logo_map = {
  "0": "world_logo",
  "1": "immunitas_arm",
  "2": "consumendi_mini",
  "3": "negligentia_logo",
  "4": "adrogantia_logo"
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
  ctx.restore()

}