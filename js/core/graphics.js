var enemyData = require('../data/enemy_data.js');

var Background = require('../render/background.js');
var EnemyFactory = require('../enemy/enemy_factory.js');

var graphics = {};

graphics.generateEnemyBufferImages = function () {
  for(var i in enemyData) {
    if(enemyData[i].batch_enemy_image) {
      var temp_enemy = new (EnemyFactory.getEnemyClassFromType(i))(null, 0, 0, 0, null)
      enemyData[i].images = temp_enemy.generate_images();
    }
  }
};

graphics.generateBackgrounds = function () {
    graphics.menuBackground = new Background("#231f20");
}

module.exports = graphics;
