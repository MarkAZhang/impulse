WorldButton.prototype = new ImpulseButton()

WorldButton.prototype.constructor = WorldButton

function WorldButton(world, size, x, y, w, h, color, action) {
  if(!world) return

  this.level_name = "WORLD "+world
  this.world = world
  this.size = size
  this.init(x, y, w, h, action, true, color)

  var stars = 0
  var max_stars = 0
  var available = false
  for(var i = 1; i <= 7; i++) {
    if(imp_params.impulse_level_data["HIVE "+world+"-"+i].save_state[imp_vars.player_data.difficulty_mode]) {
      available = true
      stars += imp_params.impulse_level_data["HIVE "+world+"-"+i].save_state[imp_vars.player_data.difficulty_mode].stars
      max_stars +=3
    }
  }
  if(imp_params.impulse_level_data["BOSS "+world].save_state[imp_vars.player_data.difficulty_mode]) {
    available = true
    stars += imp_params.impulse_level_data["BOSS "+world].save_state[imp_vars.player_data.difficulty_mode].stars
    max_stars +=3
  }

  if(available) {
    if(!imp_params.impulse_level_data["HIVE "+this.world+"-1"].save_state[imp_vars.player_data.difficulty_mode].seen && !imp_vars.dev){
      this.set_active(false)
      this.state = "locked"
    }
    else {
      this.stars = stars
      this.max_stars = max_stars
      this.set_active(true)
      this.state = "unlocked"
    }
  }
  else {
    this.set_active(false)
    this.state = "unavailable"
  }

  this.new_world = true
  for(var i = 1; i <= 7; i++) {
    if(imp_params.impulse_level_data["HIVE "+world+"-"+i].save_state[imp_vars.player_data.difficulty_mode].high_score > 0) {
      this.new_world = false
    }
  }
  if(imp_params.impulse_level_data["BOSS "+world].save_state[imp_vars.player_data.difficulty_mode].high_score > 0) {
    this.new_world = false
  }


}

WorldButton.prototype.additional_draw = function(context) {
  context.beginPath()
  context.strokeStyle = this.color

  /*if(this.hover)
      context.rect((this.x - this.w/2 * 1.1) + 2, (this.y - this.h/2 * 1.1) + 2, this.w * 1.1 - 4, this.h * 1.1 - 4)
    else
      context.rect(this.x - this.w/2 + 2, this.y - this.h/2 + 2, this.w - 4, this.h - 4)*/

  context.lineWidth = 2
  context.stroke()

  context.beginPath()
  context.textAlign = 'center'
  context.fillStyle = impulse_colors["world "+this.world+" lite"]
  context.font = this.hover ? (1.56 * this.size) +'px Muli' : 1.25*this.size +'px Muli'
  context.fillText(this.level_name, this.x, this.y - this.h/2 + this.size + 10)
  context.fill()
  if(this.state == "locked") {
    context.beginPath()
    context.textAlign = "center"
    context.font = this.size +'px Muli'
    context.fillStyle = "gray"
    context.fillText("LOCKED", this.x, this.y)
    context.fill()
  }
  else if(this.state == "unavailable") {
    context.beginPath()
    context.textAlign = "center"
    context.font = this.size +'px Muli'
    context.fillStyle = "gray"
    context.fillText("UNAVAILABLE", this.x, this.y)
    context.fill()
    return
  }
  else {
    context.beginPath()
    draw_empty_star(context, this.x + 30, this.y + 20, 15, impulse_colors["world "+this.world] + " lite")
    context.beginPath()
    context.textAlign = "center"
    context.font = this.size +'px Muli'
    context.fillStyle = impulse_colors["world "+this.world + ""]
    context.fillText(this.stars+"/"+this.max_stars, this.x - 20, this.y + 25)

    context.fill()

    draw_progress_bar(context,this.x, this.y +this.h * .25 - 5, this.w * 2/3, 10, this.stars/this.max_stars, impulse_colors["world "+this.world], impulse_colors["world "+this.world+" lite"])

    /*if(this.new_world) {
      context.font = "25px Muli"
      context.textAlign = "right"
      context.fillStyle = impulse_colors["world "+(this.world)+ " lite"]
      context.fillText("NEW", this.x + this.w/2 - 5, this.y + this.h/2 - 5)
    }*/

  }
}

