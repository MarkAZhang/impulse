LevelButton.prototype = new ImpulseButton()

LevelButton.prototype.constructor = LevelButton

function LevelButton(level_name, size, x, y, w, h, color, world) {
  this.state = null
  this.world = world
  this.level_name = level_name
  this.size = size

  var action = function() {
    switch_game_state(new LevelIntroState(level_name, world))
  }
  this.init(x, y, w, h, action, true, color)
  if(impulse_level_data[level_name]) {

    if(player_data.stars < impulse_level_data[level_name].star_cutoff) {
      this.set_active(false)
      this.state = "locked"
    }
    else {
      this.state = "unlocked"
    }

  }
  else {
    this.set_active(false)
    this.state = "unavailable"
  }

  this.enemy_image_size = 25
  this.buffer = 5
  this.star_colors = ["bronze", "silver", "gold"]

}

LevelButton.prototype.set_float_panel_loc = function(fx, fy, fw, fh) {
  this.fx = fx
  this.fy = fy
  this.fw = fw
  this.fh = fh
}

LevelButton.prototype.additional_draw = function(context) {

  context.beginPath()
  context.strokeStyle = this.color

  /*if(this.hover)
      context.rect((this.x - this.w/2 * 1.1) + 2, (this.y - this.h/2 * 1.1) + 2, this.w * 1.1 - 4, this.h * 1.1 - 4)
    else
      context.rect(this.x - this.w/2 + 2, this.y - this.h/2 + 2, this.w - 4, this.h - 4)
  context.stroke()*/

  context.beginPath()
  context.textAlign = 'center'
  context.font = this.hover ? (1.25 * this.size) +'px Muli' : this.size +'px Muli'
  context.fillStyle = this.level_name.slice(0, 4) == "BOSS" ? "red" : impulse_colors["world "+(this.world)+" lite"]

  context.fillText(this.level_name, this.x, this.y - this.h/2 + this.size + 10)
  context.fill()

  if(this.state == "unavailable") {
    context.beginPath()
    context.textAlign = "center"
    context.font = this.size +'px Muli'
    context.fillStyle = "gray"
    context.fillText("UNAVAILABLE", this.x, this.y)
    context.fill()
    return
  }
  if(this.state == "locked") {
    context.beginPath()
    draw_empty_star(ctx, this.x + 20, this.y + 20, 15, "gray")
    context.beginPath()
    context.textAlign = "center"
    context.font = this.size +'px Muli'
    context.fillStyle = "gray"
    context.fillText("LOCKED", this.x, this.y)
    context.fillText(impulse_level_data[this.level_name].star_cutoff, this.x - 20, this.y + 25)
    context.fill()
    return
  }

  //draw_level_obstacles_within_rect(ctx, this.level_name, this.x, this.y - this.h * .1, this.h * .4 * canvasWidth/canvasHeight, this.h * .4, "blue")


  if(impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].stars > 0)
    draw_star(ctx, this.x, this.y , 30, this.star_colors[impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].stars - 1])
  else
    draw_empty_star(ctx, this.x, this.y , 30)

  var num_row = Math.floor((this.w - this.buffer * 2) / (this.enemy_image_size))

  var num_enemy_type = 0
  for(var j in impulse_level_data[this.level_name].enemies) {
    num_enemy_type += 1
  }

  var i = 0

  var drawn_enemies = null

  if(this.level_name.slice(0, 4) == "BOSS") {
    drawn_enemies = {}
    drawn_enemies[impulse_level_data[this.level_name].dominant_enemy] = null
    num_enemy_type = 1
  }
  else {
    drawn_enemies = impulse_level_data[this.level_name].enemies
  }

  for(var j in drawn_enemies) {

    var k = 0
    var num_in_this_row = 0

    while(k < i+1 && k < num_enemy_type) {
      k+=num_row
    }

    if(k <= num_enemy_type) {
      num_in_this_row = num_row
    }
    else {
      num_in_this_row = num_enemy_type - (k - num_row)
    }
    var diff = (i - (k - num_row)) - (num_in_this_row - 1)/2

    var h_diff = Math.floor(i/num_row) - (Math.ceil(num_enemy_type/num_row) - 1)/2

    var cur_x = this.x + (this.enemy_image_size) * diff
    var cur_y = this.y + this.h * .28 + this.enemy_image_size * h_diff

    draw_enemy(context, j, cur_x, cur_y, this.enemy_image_size)


    i+=1
  }

  if(this.hover) {
    context.beginPath()
    context.rect(this.fx - this.fw/2, this.fy - this.fh/2, this.fw, this.fh)
    context.lineWidth = 2
    context.strokeStyle = "black"
    context.fillStyle = "white"
    context.fill()
    context.stroke()
    context.beginPath()
    context.textAlign = "left"
    context.font = this.size +'px Muli'
    context.fillStyle = this.color
    context.fillText(this.level_name, this.fx - this.fw/2 + 10, this.fy - this.fh/2 + this.size)
    context.fill()
    context.beginPath()
    context.textAlign = "right"

    for(var i = 0; i < 3; i++) {
      context.fillStyle = impulse_colors[this.star_colors[i]]
      context.fillText(impulse_level_data[this.level_name].cutoff_scores[i], this.fx + this.fw/2 - 10, this.fy - this.fh/2 + this.size + i * (this.size + 3))
    }
    context.fill()
    context.beginPath()
    context.textAlign = "center"

    //draw_level_obstacles_within_rect(ctx, this.level_name, this.fx - this.fw/2 + this.fh * .6 * canvasWidth/canvasHeight, this.fy + this.fh * .15, this.fh * .5 * canvasWidth/canvasHeight, this.fh * .5, "blue")

    context.fillStyle = "black" //impulse_level_data[this.level_name].stars > 0 ? impulse_colors[temp[impulse_level_data[this.level_name].stars - 1]] : "black"
    context.fillText("HIGH SCORE: "+impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].high_score, this.fx, this.fy - this.fh/2 + this.size)

    var star_size = 30

    for(var i = 0; i < 3; i++) {
      if(impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].stars > i) {
        draw_star(context, this.fx - 50 + 50 * i, this.fy + 14, 20, this.star_colors[i])
      }
      else
        draw_empty_star(context, this.fx - 50 + 50 * i, this.fy + 14, 20)

    }
  }

  if(impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].high_score == 0) {
    context.font = "25px Muli"
    context.textAlign = "right"
    context.fillStyle = this.level_name.slice(0, 4) == "BOSS" ? "red" : impulse_colors["world "+(this.world)+" lite"]
    context.fillText("NEW", this.x + this.w/2 - 5, this.y + this.h/2 - 5)

  }
}

