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

function draw_gear_icon(context, x, y, scale, color, center_color, center_glow) {
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
  context.arc(x, y, scale, Math.PI * 7/6, Math.PI * 11/6)
  context.lineWidth = Math.ceil(scale / 6)
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

function draw_delete_icon(context, x, y, scale, color) {
  context.save()
  context.shadowBlur = 0
  context.beginPath()
  context.moveTo(x - scale * 3/8, y - scale/4)
  context.lineTo(x + scale * 3/8, y - scale/4)
  context.moveTo(x - scale/4, y - scale/4)
  context.lineTo(x - scale/4, y + scale/2)
  context.lineTo(x + scale/4, y + scale/2)
  context.lineTo(x + scale/4, y - scale/4)
  context.moveTo(x - scale/8, y - scale/8)
  context.lineTo(x - scale/8, y + 3 * scale/8)
  context.moveTo(x, y - scale/8)
  context.lineTo(x, y + 3 * scale/8)
  context.moveTo(x + scale/8, y - scale/8)
  context.lineTo(x + scale/8, y + 3 * scale/8)
  context.moveTo(x - scale/8, y - scale/4)
  context.lineTo(x - scale/8, y - 3 * scale/8)
  context.lineTo(x + scale/8, y - 3 * scale/8)
  context.lineTo(x + scale/8, y - scale/4)
  context.strokeStyle = color
  context.lineWidth = 2
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
  /*if(key_display) {
    context.font = "10px Muli"
    context.textAlign = "center"
    context.fillText("X", x+scale, y+scale)
  }*/
  context.restore()
}

function draw_fullscreen_icon(context, x, y, scale, color, key_display) {
  context.save()
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
  /* if(key_display) {
    context.font = "10px Muli"
    context.textAlign = "center"
    context.fillText("C", x+scale, y+scale)
  } */
  context.restore()
}
