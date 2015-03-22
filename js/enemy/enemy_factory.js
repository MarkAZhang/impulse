var EnemyFactory = function () {
  this.enemyMap = {};
};

EnemyFactory.prototype.setEnemyMap = function (map) {
  this.enemyMap = map;
};

EnemyFactory.prototype.getEnemyClassFromType = function (type) {
  return this.enemyMap[type];
};

module.exports = new EnemyFactory();
