
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
  context.globalAlpha = alpha
  context.strokeStyle = color
  context.lineWidth = 2
  context.stroke()
  context.fillStyle = color
  context.globalAlpha /=2
  context.fill()
  context.globalAlpha = 1
  context.restore()
}

function draw_vprogress_bar(context, x, y, w, h, prop, color, up) {

  context.shadowBlur = 20;
  context.shadowColor = color

  context.save();

  context.globalAlpha /= 10
  context.rect(x - w * .5, y - h * .5, w , h)
  context.strokeStyle = color
  context.lineWidth = 2
  context.stroke()

  context.restore()
  context.beginPath()

  if(up) {
    context.rect(x - w * .5, y + h * .5 - prop * h, w, h * prop)
  } else {
    context.rect(x - w * .5, y - h * .5, w, h * prop)
  }

  context.shadowColor = color
  context.fillStyle = color
  context.fill()
  context.shadowBlur = 0;
}

function draw_progress_bar(context, x, y, w, h, prop, color, bcolor) {
  context.beginPath()
  context.rect(x - w * .5, y - h * .5, w * prop, h)
  context.fillStyle = color
  context.fill()

  context.beginPath()
  context.rect(x - w * .5, y - h * .5, w , h)
  context.strokeStyle = bcolor ? bcolor : "black"
  context.lineWidth = 2
  context.stroke()
}

function draw_level_obstacles_within_rect(context, level_name, x, y, w, h, border_color) {

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
    context.fill()
    context.strokeStyle = border_color
    context.lineWidth = 2
    context.stroke()
  }

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

  "immunitas_arm": [0, 0, 90, 90],
  "immunitas_hand": [90, 0, 90, 90],
  "immunitas_head": [0, 90, 108, 108],
  "immunitas_glow": [180, 0, 270, 270],
  "immunitas_aura": [450, 0, 245, 245]
}

immunitasSprite = loadSprite("art/immunitas_sprite.png")



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

  ctx.rect(xLow, yLow, xHigh - xLow, yHigh - yLow)
  ctx.clip()
  for(var x = xLow; x < xHigh; x+=w) {
    for(var y = yLow; y < yHigh; y+=h) {
      ctx.drawImage(bg, 0, 0, w, h, x, y, w, h)
    }
  }

}