var sprites = require('../render/sprites.js');
var spriteData = require('../data/sprite_data.js');

var renderUtils = {};

renderUtils.drawRoundedRect = function(context, x, y, w, h, r, color) {
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
renderUtils.drawShape = function(context, x, y, shape, scale, color, alpha, rotate, interior_color) {

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

renderUtils.drawImageWithRotation = function(ctx, x, y, rotation, actualWidth, actualHeight, image) {
  var w = image.width;
  var h = image.height;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.drawImage(image, 0, 0, w, h, -actualWidth/2, -actualHeight/2, actualWidth, actualHeight);
  ctx.restore();
}

renderUtils.drawEllipse = function(ctx, cx, cy, rx, ry, style) {
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

renderUtils.convertCanvasToGrayscale = function(canvas, opacity) {
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

renderUtils.drawSprite = function(ctx, x, y, rotation, actualWidth, actualHeight, spriteName, imageObject) {

    imageObject = typeof imageObject !== 'undefined' ? imageObject: sprites.playerSprite;
    var w = imageObject.width;
    var h = imageObject.height;

    ctx.save();
    // set screen position
    ctx.translate(x, y);
    // set rotation
    ctx.rotate(rotation);
    // set scale value

    // draw image to screen drawImage(imageObject, sourceX, sourceY, sourceWidth, sourceHeight,
    // destinationX, destinationY, destinationWidth, destinationHeight)
    ctx.drawImage(imageObject, spriteData.spriteSheetData[spriteName][0],
      spriteData.spriteSheetData[spriteName][1],
      spriteData.spriteSheetData[spriteName][2],
      spriteData.spriteSheetData[spriteName][3],
      -actualWidth/2, -actualHeight/2, actualWidth, actualHeight);
    ctx.restore();
}

module.exports = renderUtils;
