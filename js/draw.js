
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

function draw_enemy(context, enemy_name, x, y, d) {

  context.save()
  /*context.translate(x, y);
  context.rotate(Math.PI);
  context.translate(-x, -y);*/


  var draw_scale = Math.min(1/impulse_enemy_stats[enemy_name].effective_radius, 1) * d/2
   if(enemy_name.slice(enemy_name.length - 4) == "boss") {
      draw_scale = 2/impulse_enemy_stats[enemy_name].effective_radius * d/2
   }
   for(var m = 0; m < impulse_enemy_stats[enemy_name].shape_polygons.length; m++) {
      var this_shape = impulse_enemy_stats[enemy_name].shape_polygons[m]
      draw_shape(context, x, y, this_shape, draw_scale, impulse_enemy_stats[enemy_name].color)
    }
    if(impulse_enemy_stats[enemy_name].hasOwnProperty("extra_rendering_polygons")) {
      for(var m = 0; m < impulse_enemy_stats[enemy_name].extra_rendering_polygons.length; m++) {
        var this_shape = impulse_enemy_stats[enemy_name].extra_rendering_polygons[m]
        draw_shape(context, x, y, this_shape, draw_scale, impulse_enemy_stats[enemy_name].color)
      }
    }
  context.restore()
}


var tessellation_logo_factor = {
    "1": 1,
    "2": 1.4
}

function draw_tessellation_sign(context, tessellation, x, y, size, extra_factor) {
  if(tessellation == 0) {
    context.beginPath()
    context.lineWidth = 2
    context.rect(x-size/2, y-size/2, size, size)
    context.rect(x-size/2+5, y-size/2+5, size-10, size-10)
    context.strokeStyle = "#eee"

    context.stroke()
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
    context.rotate(Math.PI/4);
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


// shape is {type: circle/ polygon, r: radius_factor, vertices: [[0-1, 0-1], [0-1, 0-1]]}
function draw_shape(context, x, y, shape, scale, color, alpha, rotate) {

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
    context.arc(x + shape.x, y + shape.y, scale * shape.r, 0, 2 * Math.PI, true)
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
  context.strokeStyle = color
  context.lineWidth = 2
  context.stroke()
  context.fillStyle = color
  context.globalAlpha /=2
  context.fill()
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

function draw_arrow(context, x, y, size, dir, color) {

  ctx.save();
  ctx.translate(x, y);

  if(dir == "left") {
    ctx.rotate(Math.PI);
  } else if(dir == "up") {
    ctx.rotate(3*Math.PI/2);
  } else if(dir == "down") {
    ctx.rotate(Math.PI/2);
  }

  context.beginPath()
  context.moveTo( Math.cos(0) * size/2,  Math.sin(0) * size/2)
  context.lineTo( Math.cos(Math.PI*2/3) * size/2,  Math.sin(Math.PI*2/3) * size/2)
  context.lineTo( Math.cos(Math.PI*4/3) * size/2,  Math.sin(Math.PI*4/3) * size/2)
  context.closePath()
  context.fillStyle = color
  context.shadowBlur = 10
  context.shadowColor = color
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
  var polygons = impulse_level_data[level_name].obstacle_v
  if(!polygons) return
  for(var i = 0; i < polygons.length; i++) {
    context.beginPath()
    context.moveTo(x - w/2 + polygons[i][0][0]/levelWidth * w, y - h/2 + polygons[i][0][1]/(levelHeight) * h)
    for(var j = 1; j < polygons[i].length; j++) {
      context.lineTo(x - w/2 + polygons[i][j][0]/levelWidth * w, y -h/2 +  polygons[i][j][1]/(levelHeight) * h)
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
  context.beginPath()
  var player_loc = player.body.GetPosition()
  context.arc(x - w/2 + player_loc.x*draw_factor/levelWidth * w-1, y - h/2 + player_loc.y*draw_factor/levelHeight * h -1, 2, 0, 2 * Math.PI, true)
  context.fillStyle = impulse_colors["impulse_blue"]
  context.shadowBlur = 2
  context.shadowColor = context.fillStyle
  context.fill()

  for(var i = 0; i < level.enemies.length; i++) {
    var enemy_loc = level.enemies[i].body.GetPosition()
    context.beginPath()
    context.arc(x - w/2 + enemy_loc.x*draw_factor/levelWidth * w-1, y - h/2 + enemy_loc.y*draw_factor/levelHeight * h-1, 2, 0, 2 * Math.PI, true)
    context.fillStyle = level.enemies[i].color
    context.shadowBlur = 2
    context.shadowColor = context.fillStyle
    context.fill()
  }

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
  "player_normal": [60, 0, 60, 60],
  "player_red": [0, 0, 60, 60],
  "player_yellow": [120, 0, 60, 60],
  "player_gray": [180, 0, 60, 60],
  "player_green": [240, 0, 60, 60],
  "spark": [0, 60, 30, 30],
  "multi": [30, 60, 30, 30],
  "key": [60, 60, 60, 60],

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

  "consumendi_head": [0, 0, 180, 180],
  "consumendi_head_red": [720, 136, 135, 135],
  "consumendi_aura": [180, 0, 270, 270],
  "consumendi_aura_filled": [450, 0, 270, 270],
  "consumendi_mini": [0, 180, 64, 64],
  "consumendi_small_arrow": [64, 180, 50, 32],
  "consumendi_long_arrow": [64, 210, 50, 80],
  "consumendi_small_arrow_filled": [120, 180, 50, 32],
  "consumendi_glow": [720, 0, 135, 135],
}

var immunitasSprite = loadSprite("art/immunitas_sprite.png")
var consumendiSprite = loadSprite("art/consumendi_sprite.png")

var tessellation_glow_map = {
  "1": "immunitas_glow",
  "2": "consumendi_glow"
}
var tessellation_logo_map = {
  "1": "immunitas_arm",
  "2": "consumendi_mini"
}
var tessellation_sprite_map = {
  "1": immunitasSprite,
  "2": consumendiSprite
}

var impulse_bg_images = {}

for(var bg in imp_vars.bg) {
  impulse_bg_images[bg] = loadSprite("art/"+imp_vars.bg[bg]+".png");
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