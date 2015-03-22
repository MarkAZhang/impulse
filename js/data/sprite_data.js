var spriteData = {};

spriteData.spriteSheetData = {
  //x, y, w, h
  //"player_normal": [60, 0, 60, 60],
  "player_normal": [0, 0, 40, 40],
  // not sure why this offset is necessary...
  "player_red": [40, -1, 40, 40],
  "player_yellow": [80, 0, 41, 41],
  "player_gray": [120, 0, 41, 41],
  "player_green": [160, 0, 41, 41],
  "player_white": [200, 0, 40, 40],
  "spark": [0, 41, 40, 40],
  "multi": [0, 81, 40, 40],
  "white_glow": [40, 40, 100, 100],
  "white_gateway": [148, 41, 150, 150],
  "lives_icon": [0, 0, 40, 40],
  "sparks_icon": [0, 41, 40, 40],
  "white_flower": [0, 155, 42, 42],
  "blue_flower": [43, 155, 42, 42],
  "world1_starblank": [85, 199, 41, 38],
  "world1_starhalf": [127, 199, 19, 38],
  "world1_star": [127, 199, 41, 38],
  "world2_starblank": [85, 237, 41, 38],
  "world2_starhalf": [127, 237, 19, 38],
  "world2_star": [127, 237, 41, 38],
  "world3_starblank": [0, 199, 41, 38],
  "world3_starhalf": [42, 199, 19, 38],
  "world3_star": [42, 199, 41, 38],
  "world4_starblank": [0, 237, 41, 38],
  "world4_starhalf": [42, 237, 19, 38],
  "world4_star": [42, 237, 41, 38],
  "silver_trophy": [0, 277, 90, 78],
  "gold_trophy": [89, 277, 90, 78],
  "world1_timer": [189, 211, 48, 61],
  "world2_timer": [241, 211, 48, 61],
  "world3_timer": [189, 277, 48, 62],
  "world4_timer": [241, 277, 48, 62],
  "spark_powerup": [310, 6, 37, 36],
  "multi_powerup": [310, 58, 37, 36],
  "ult_powerup": [304, 105, 49, 48],
  "pink_one": [300, 201, 40, 40],
  "dark_one": [301, 240, 40, 41],
  "dark_aura": [300, 299, 100, 101],

  "immunitas_arm": [0, 0, 90, 90],
  "immunitas_arm_red": [150, 135, 90, 90],
  "immunitas_hand": [90, 0, 90, 90],
  "immunitas_hand_red": [240, 135, 90, 90],
  "immunitas_logo_gray": [330, 135, 90, 90],
  "immunitas_head": [0, 90, 108, 108],
  "immunitas_head_red": [450, 123, 108, 108],
  "immunitas_glow": [180, 0, 135, 135],
  "immunitas_red_glow": [315, 0, 135, 135],
  "immunitas_aura": [450, 0, 123, 123],
  "immunitas_aura_red": [573, 0, 123, 123],
  "immunitas_arrow": [0, 200, 70, 70],
  "immunitas_lockon" : [573, 123, 120, 120],

  "consumendi_head": [0, 0, 180, 180],
  "consumendi_head_red": [720, 136, 135, 135],
  "consumendi_aura": [181, 0, 269, 269],
  "consumendi_small_diamond": [94, 180, 30, 56],
  "consumendi_small_diamond_filled": [64, 180, 30, 56],
  "consumendi_small_arrow": [124, 180, 30, 16],
  "consumendi_glow": [720, 0, 135, 135],
  "consumendi_logo": [450, 0, 120, 119],
  "consumendi_mini": [450, 119, 120, 120],
  "consumendi_mini_gray": [570, 0, 120, 120],

  "negligentia_head": [0, 0, 180, 180],
  "negligentia_head_red": [0, 180, 180, 180],
  "negligentia_arm_striking": [180, 0, 244, 100],
  "negligentia_arm_striking_red": [180, 100, 244, 100],
  "negligentia_wheel": [424, 0, 134, 134],
  "negligentia_wheel_red": [424, 270, 134, 134],
  "negligentia_wheel_complete": [423, 135, 135, 135],
  "negligentia_glow": [560, 0, 115, 115],
  "negligentia_glow_red": [560, 115, 115, 115],
  "negligentia_aura": [559, 270, 39, 65],
  "negligentia_aura_open": [598, 270, 39, 65],
  "negligentia_arm_ring": [180, 200, 180, 180],
  "negligentia_logo": [680, 0, 120, 120],
  "negligentia_logo_gray": [680, 120, 120, 120],

  "adrogantia_attack_bud": [0, 0, 80, 80],
  "adrogantia_spawner": [0, 80, 80, 80],
  "adrogantia_body_bud": [80, 0, 80, 80],
  "adrogantia_attack_bud_firing": [80, 80, 80, 80],
  "adrogantia_body_bud_red": [80, 160, 80, 80],
  "adrogantia_head": [181, 1, 160, 160],
  "adrogantia_head_red": [181, 161, 160, 160],
  "adrogantia_glow": [340, 0, 135, 135],
  "adrogantia_logo": [476, 0, 125, 125],
  "adrogantia_logo_gray": [476, 125, 125, 125],
}

spriteData.tessellationGlowMap = {
  "0": "white_glow",
  "1": "immunitas_glow",
  "2": "consumendi_glow",
  "3": "negligentia_glow",
  "4": "adrogantia_glow"
}
spriteData.tessellationLogoMap = {
  "0": "white_gateway",
  "1": "immunitas_arm",
  "2": "consumendi_logo",
  "3": "negligentia_logo",
  "4": "adrogantia_logo"
}
spriteData.tessellationGrayLogoMap = {
  "0": "world_logo",
  "1": "immunitas_logo_gray",
  "2": "consumendi_mini_gray",
  "3": "negligentia_logo_gray",
  "4": "adrogantia_logo_gray"
}

spriteData.bgFiles = {
  "Hive 0": "bg/hive0",
  "Title Alt1": "bg/titlebg_alt1",
  "Title Alt2": "bg/titlebg_alt2",
  "Title Alt3": "bg/titlebg_alt3",
  "Title Alt4": "bg/titlebg_alt4",
  "Hive 1": "bg/hive1",
  "Hive 2": "bg/hive2",
  "Hive 3": "bg/hive3",
  "Hive 4": "bg/hive4",
};

spriteData.tessellationLogoFactor = {
  "0": 1.4,
  "1": 1,
  "2": 1.4,
  "3": 1.4,
  "4": 1.6
};

spriteData.bg_opacity = 0.3;
spriteData.hive0_bg_opacity = 0.6; /* hive0 gets rendered differently, needs to be brighter */

module.exports = spriteData;
