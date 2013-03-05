impulse_colors = {}
impulse_colors['bronze'] = "rgb(205, 127, 50)"
impulse_colors['silver'] = "rgb(175, 175, 175)"
//impulse_colors['impulse_silver'] = "rgba(175, 175, 175, 0.4)"
impulse_colors['impulse_target_blue'] = "rgba(0, 128, 255, 0.2)"
impulse_colors['impulse_blue'] = "rgb(0, 128, 255)"
impulse_colors['gold'] = "rgb(238, 201, 0)"
impulse_colors['world 1'] = "rgb(50, 205, 50)"
impulse_colors['world 2'] = "rgb(0, 206, 209)"
impulse_colors['world 3'] = "rgb(186, 85, 211)"
impulse_colors['world 4'] = "rgb(255, 0, 0)"
impulse_colors["player_color"] = "rgb(32, 140, 231)"

function draw_star(context, x, y, r, color) {
  context.beginPath()
  context.moveTo(x + r * Math.cos(Math.PI * 3/2), y + r * Math.sin(Math.PI * 3/2))
  context.lineTo(x + r * Math.cos(Math.PI * 1/6), y + r * Math.sin(Math.PI * 1/6))
  context.lineTo(x + r * Math.cos(Math.PI * 5/6), y + r * Math.sin(Math.PI * 5/6))
  context.closePath()
  context.fillStyle = impulse_colors[color]
  context.fill()
  context.strokeStyle = "black"
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
      draw_shape(context, x, y, this_shape, draw_scale, impulse_enemy_stats[enemy_name].color)
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

function draw_progress_bar(context, x, y, w, h, prop, color) {
  context.beginPath()
  context.rect(x - w * .5, y - h * .5, w * prop, h)
  context.fillStyle = color
  context.fill()

  context.beginPath()
  context.rect(x - w * .5, y - h * .5, w , h)
  context.strokeStyle = "black"
  context.lineWidth = 2
  context.stroke()
}

function draw_level_obstacles_within_rect(context, level_name, x, y, w, h, border_color) {

  var polygons = impulse_level_data[level_name].obstacle_v
  if(!polygons) return
  for(var i = 0; i < polygons.length; i++) {
    context.beginPath()
    context.moveTo(x - w/2 + polygons[i][0][0]/canvasWidth * w, y - h/2 + polygons[i][0][1]/(canvasHeight-topbarHeight) * h)
    for(var j = 1; j < polygons[i].length; j++) {
      context.lineTo(x - w/2 + polygons[i][j][0]/canvasWidth * w, y -h/2 +  polygons[i][j][1]/(canvasHeight-topbarHeight) * h)
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

mainSprite = loadSprite("art/sprites.png")

spriteSheetData = {
  //x, y, w, h
  "player_normal": [31, 0, 20, 20],
  "player_red": [0, 0, 20, 20]

}

function drawSprite(ctx, x, y, rotation, actualWidth, actualHeight, spriteName, imageObject)
{

    imageObject = typeof imageObject !== 'undefined' ? imageObject: mainSprite;
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