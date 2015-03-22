var BossFour = require('../enemy/boss_four.js');
var BossFourAttacker = require('../enemy/boss_four_attacker.js');
var BossFourSpawner = require('../enemy/boss_four_spawner.js');
var BossOne = require('../enemy/boss_one.js');
var BossThree = require('../enemy/boss_three.js');
var BossTwo = require('../enemy/boss_two.js');
var DeathRay = require('../enemy/death_ray.js');
var Disabler = require('../enemy/disabler.js');
var DumbStunner = require('../enemy/dumb_stunner.js');
var Fighter = require('../enemy/fighter.js');
var FighterBullet = require('../enemy/fighter_bullet.js');
var Goo = require('../enemy/goo.js');
var Harpoon = require('../enemy/harpoon.js');
var HarpoonHead = require('../enemy/harpoon_head.js');
var Mote = require('../enemy/mote.js');
var Orbiter = require('../enemy/orbiter.js');
var PiercingFighterBullet = require('../enemy/piercing_fighter_bullet.js');
var Slingshot = require('../enemy/slingshot.js');
var Spear = require('../enemy/spear.js');
var Stunner = require('../enemy/stunner.js');
var Tank = require('../enemy/tank.js');
var Troll = require('../enemy/troll.js');

var enemyMap = {
  'dumb_stunner': DumbStunner,
  'stunner': Stunner,
  'spear': Spear,
  'tank': Tank,
  'mote': Mote,
  'goo': Goo,
  'disabler': Disabler,
  'troll': Troll,
  'fighter': Fighter,
  'fighter_bullet': FighterBullet,
  'piercing_fighter_bullet': PiercingFighterBullet,
  'harpoon': Harpoon,
  'harpoonhead': HarpoonHead,
  'orbiter': Orbiter,
  'slingshot': Slingshot,
  'deathray': DeathRay,
  'boss_one': BossOne,
  'boss_two': BossTwo,
  'boss_three': BossThree,
  'boss_four': BossFour,
  'boss_four_attacker': BossFourAttacker,
  'boss_four_spawner': BossFourSpawner
};

module.exports = enemyMap;
