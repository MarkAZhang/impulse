var sprites = {};

function loadSprite(imageName)
{
    // create new image object
    var image = new Image();
    // load image
    image.src = imageName;
    // return image object
    return image;
}

sprites.playerSprite = loadSprite("art/sprites.png")
sprites.immunitasSprite = loadSprite("art/immunitas_sprite.png")
sprites.consumendiSprite = loadSprite("art/consumendi_sprite.png")
sprites.negligentiaSprite = loadSprite("art/negligentia_sprite.png")
sprites.adrogantiaSprite = loadSprite("art/adrogantia_sprite.png")
sprites.logoSprite = loadSprite("art/logo.png")
sprites.porcelainLogoSprite = loadSprite("art/porcelain_logo.png")

sprites.getTessellationSprite = function (world) {
  var spriteArray = [
    sprites.playerSprite,
    sprites.immunitasSprite,
    sprites.consumendiSprite,
    sprites.negligentiaSprite,
    sprites.adrogantiaSprite,
  ];
  if (world > spriteArray.length) {
    return null;
  }
  return spriteArray[world];
}

sprites.bgImages = {};

for(var bg in spriteData.bgFiles) {
  sprites.bgImages[bg] = loadSprite("art/"+spriteData.bgFiles[bg]+".png");
}

