
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
var immunitasSprite = loadSprite("art/immunitas_sprite.png")
var consumendiSprite = loadSprite("art/consumendi_sprite.png")
var negligentiaSprite = loadSprite("art/negligentia_sprite.png")
var adrogantiaSprite = loadSprite("art/adrogantia_sprite.png")
var logoSprite = loadSprite("art/logo.png")
var porcelainLogoSprite = loadSprite("art/porcelain_logo.png")

function getTessellationSprite(world) {
  var sprites = [
    playerSprite,
    immunitasSprite,
    consumendiSprite,
    negligentiaSprite,
    adrogantiaSprite,
  ];
  if (world > sprites.length) {
    return null;
  }
  return sprites[world];
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
    ctx.drawImage(imageObject, imp_params.spriteSheetData[spriteName][0],
      imp_params.spriteSheetData[spriteName][1],
      imp_params.spriteSheetData[spriteName][2],
      imp_params.spriteSheetData[spriteName][3],
      -actualWidth/2, -actualHeight/2, actualWidth, actualHeight);
    // restore state
    ctx.restore();
}
