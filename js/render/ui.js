var constants = require('../data/constants.js');
var enemyRenderUtils = require('../render/enemy.js');
var renderUtils = require('../render/utils.js');
var sprites = require('../render/sprites.js');
var spriteData = require('../data/sprite_data.js');

var uiRenderUtils = {};

uiRenderUtils.drawEnemyButton = function(ctx, x, y, r, type) {
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
  renderUtils.drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
  ctx.restore();
  enemyRenderUtils.drawEnemy(ctx, type, x, y, 30)
}

uiRenderUtils.getBgOpacity = function(world) {
  // Return opacity for the background in world menus.
  var opacity_array = [
    0.3,
    0.3,
    0.8,
    0.4,
    0.3
  ];
  return opacity_array[world];
}

uiRenderUtils.getLevelBgOpacity = function(world) {
  // Return opacity for the background in world menus.
  var opacity_array = [
    0.3,
    0.3,
    1,
    0.5,
    0.5
  ];
  return opacity_array[world];
};

uiRenderUtils.getWorldMapBgOpacity = function(world) {
  // Return opacity for the background in world-map state.
  var opacity_array = [
    spriteData.hive0_bg_opacity,
    0.05,
    0.1,
    0.1,
    0.1,
  ];
  return opacity_array[world];
}

uiRenderUtils.tessellateBg = function(ctx, xLow, yLow, xHigh, yHigh, spriteName) {
  var bg = sprites.bgImages[spriteName]
  var w = bg.width;
  var h = bg.height;
  ctx.save()
  ctx.beginPath();
  ctx.rect(xLow, yLow, xHigh - xLow, yHigh - yLow)
  if (spriteName.substring(0, 4) === "Hive" &&
      parseInt(spriteName.substring(5, 6)) !== 0) {
    ctx.fillStyle = "#111"//constants.colors['world ' + parseInt(spriteName.substring(5, 6))];
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

uiRenderUtils.drawLogo = function(context, x, y, text, scale) {
  context.save()

  context.shadowColor = constants.colors["impulse_blue"]
  context.shadowBlur = 0
  context.fillStyle = "white"//constants.colors["impulse_blue"]

  var logoScale = scale ? scale : 1;
  context.drawImage(sprites.logoSprite, x - sprites.logoSprite.width/2 * logoScale, y - sprites.logoSprite.height * 0.75 * logoScale, sprites.logoSprite.width * logoScale, sprites.logoSprite.height * logoScale)

  if(text) {
    context.globalAlpha /= 2
    if (text === "BETA") {
      context.font = '18px Open Sans'
      context.textAlign = "right"
      context.fillText(text, x + sprites.logoSprite.width/2 * logoScale - 35, y + 40)
    } else {
      context.font = '20px Open Sans'
      context.textAlign = "center"
      context.fillText(text, x, y + 40)
    }
  }
  context.restore()
}

uiRenderUtils.drawPorcelainLogo = function(context, x, y, scale) {
  context.save()

  var logoScale = scale ? scale : 1;
  context.drawImage(sprites.porcelainLogoSprite, x - sprites.porcelainLogoSprite.width/2 * logoScale, y - sprites.porcelainLogoSprite.height * 0.75 * logoScale, sprites.porcelainLogoSprite.width * logoScale, sprites.porcelainLogoSprite.height * logoScale)

  context.restore()
}

uiRenderUtils.drawTessellationSign = function(context, tessellation, x, y, size, glow, rotate) {

  size *= spriteData.tessellationLogoFactor[tessellation]

  context.save()
  if(glow) {
    context.globalAlpha *= 0.5
    if(tessellation == 1) {
      renderUtils.drawSprite(context, x, y, (Math.PI/4), size * 2, size * 2,
        spriteData.tessellationGlowMap[tessellation], sprites.getTessellationSprite(parseInt(tessellation)))
    }
    renderUtils.drawSprite(context, x, y, (Math.PI/4), size * 1.5, size * 1.5,
      spriteData.tessellationGlowMap[tessellation], sprites.getTessellationSprite(parseInt(tessellation)))
  }

  context.restore()
  context.save()

  // set screen position
  context.translate(x, y);
  // set rotation
  var offset = (tessellation != 4 && tessellation != 2) ? Math.PI/4 : 0
  var angle = rotate ? rotate : 0
  context.rotate(angle + offset)
  renderUtils.drawSprite(context, 0, 0, 0, size, size, spriteData.tessellationLogoMap[tessellation], sprites.getTessellationSprite(parseInt(tessellation)))
  if(tessellation == 1) {
    context.beginPath()
    context.rect(-size/2*1.2, -size/2*1.2, size*1.2, size*1.2)
    context.lineWidth = Math.ceil(size/20)
    context.strokeStyle = constants.colors["boss "+tessellation]
    context.stroke()
  }
  context.restore()
}

uiRenderUtils.drawGrayTessellationSign = function(context, tessellation, x, y, size, glow, rotate) {

    size *= spriteData.tessellationLogoFactor[tessellation]

    context.save()

    // set screen position
    context.translate(x, y);
    // set rotation
    if(tessellation != 4 && tessellation != 2)
    context.rotate(Math.PI/4)
    renderUtils.drawSprite(context, 0, 0, 0, size, size, spriteData.tessellationGrayLogoMap[tessellation], sprites.getTessellationSprite(parseInt(tessellation)))
    if(tessellation == 1) {
      context.beginPath()
      context.rect(-size/2*1.2, -size/2*1.2, size*1.2, size*1.2)
      context.lineWidth = Math.ceil(size/20)
      context.strokeStyle = "gray"
      context.stroke()
    }
    context.restore()
}


uiRenderUtils.drawArrowKeys = function(context, x, y, size, color, keysArray) {
  context.save()

  context.shadowColor = color
  context.shadowBlur = 0
  renderUtils.drawRoundedRect(context, x, y-size, size * 0.9, size * 0.9, size * 0.2, color)
  renderUtils.drawRoundedRect(context, x - size, y, size * 0.9, size * 0.9, size * 0.2, color)
  renderUtils.drawRoundedRect(context, x, y, size * 0.9, size * 0.9, size * 0.2, color)
  renderUtils.drawRoundedRect(context, x + size, y, size * 0.9, size * 0.9, size * 0.2, color)

  context.fillStyle = color;
  context.font = (size * 0.4) + 'px Open Sans'
  context.textAlign = "center"
  if(keysArray) {
    context.fillText(keysArray[0], x, y - size * 1)
    context.fillText(keysArray[1], x - size, y + size * 0)
    context.fillText(keysArray[2], x, y + size * 0)
    context.fillText(keysArray[3], x + size, y + size * 0)
    uiRenderUtils.drawArrow(context, x, y - size * 0.8, size * 0.3, "up", color)
    uiRenderUtils.drawArrow(context, x - size, y + size * 0.2, size * 0.3, "left", color)
    uiRenderUtils.drawArrow(context, x, y + size * 0.2, size * 0.3, "down", color)
    uiRenderUtils.drawArrow(context, x + size, y + size * 0.2, size * 0.3, "right", color)
  } else {
    uiRenderUtils.drawArrow(context, x, y - size , size * 0.5, "up", color)
    uiRenderUtils.drawArrow(context, x - size, y , size * 0.5, "left", color)
    uiRenderUtils.drawArrow(context, x, y - 2, size * 0.5, "down", color)
    uiRenderUtils.drawArrow(context, x + size, y, size * 0.5, "right", color)
  }
  context.restore()
}

uiRenderUtils.drawBareMouse = function(context, x, y, w, h, color) {
  context.save()

  context.fillStyle = color
  renderUtils.drawRoundedRect(context, x, y, w, h, h*0.25, color)

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

uiRenderUtils.drawMouse = function(context, x, y, w, h, color) {
  context.save()
  context.shadowColor = color
  context.fillStyle = color
  /*context.font = "10px Open Sans"
  context.textAlign = "center"
  context.fillText("LEFT CLICK", x, y - w/2 - 30)*/
  context.shadowBlur = 0
  renderUtils.drawRoundedRect(context, x, y, w, h, h*0.2, color)
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

uiRenderUtils.drawVProgressBar = function(context, x, y, w, h, prop, color, up) {


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

uiRenderUtils.drawFullArrow = function(context, x, y, scale, color, dir) {
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

uiRenderUtils.drawArrow = function(context, x, y, size, dir, color, shadowed) {

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

uiRenderUtils.drawProgressBar = function(context, x, y, w, h, prop, color, bcolor, noborder, alpha) {
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


uiRenderUtils.drawProgCircle = function(context, x, y, r, prog, color, width) {
  context.beginPath()
  context.arc(x*constants.drawFactor, y*constants.drawFactor, (r*constants.drawFactor) * 2, -.5* Math.PI, -.5 * Math.PI + 1.999*Math.PI * prog, true)
  context.lineWidth = width ? width : 2
  context.strokeStyle = color
  context.stroke()
}

uiRenderUtils.bulkDrawProgCircle = function(context, x, y, r, prog) {
  context.moveTo(x*constants.drawFactor, y*constants.drawFactor - (r*constants.drawFactor) * 2)
  context.arc(x*constants.drawFactor,
              y*constants.drawFactor,
              (r*constants.drawFactor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * 0.999 * (prog), true)
}

module.exports = uiRenderUtils;
