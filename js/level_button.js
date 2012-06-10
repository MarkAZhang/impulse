LevelButton.prototype = new WorldButton()

LevelButton.prototype.constructor = LevelButton

function LevelButton(level_name, size, x, y, w, h, color) {
  if(!level_name) return
  this.state = null
  if(impulse_level_data[level_name]) {
    
    if(player_data.stars < impulse_level_data[level_name].star_cutoff) {
      this.init(level_name, size, x, y, w, h, color, null)
      this.setActive(false)
      this.state = "locked"
    }
    else {
      var this_action = function() {
        switch_game_state(new ImpulseGameState(ctx, level_name))
      }
      this.init(level_name, size, x, y, w, h, color, this_action)
      this.state = "unlocked"
    }
    
  }
  else {
    this.init(level_name, size, x, y, w, h, color, null)
    this.setActive(false)
    this.state = "unavailable"
  }

  this.enemy_image_size = 20
  this.buffer = 10
  this.star_colors =  ["bronze", "silver", "gold"]

}

LevelButton.prototype.set_float_panel_loc = function(fx, fy, fw, fh) {
  this.fx = fx
  this.fy = fy
  this.fw = fw
  this.fh = fh
}

LevelButton.prototype.additional_draw = function(context) {
  if(this.state == "unavailable") {
    context.beginPath()
    context.textAlign = "center"
    context.font = this.size +'px Century Gothic'
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
    context.font = this.size +'px Century Gothic'
    context.fillStyle = "gray"
    context.fillText("LOCKED", this.x, this.y)
    context.fillText(impulse_level_data[this.level_name].star_cutoff, this.x - 20, this.y + 25)
    context.fill()
    return
  }


  if(impulse_level_data[this.level_name].stars > 0)
    draw_star(ctx, this.x, this.y + 20, 15, this.star_colors[impulse_level_data[this.level_name].stars - 1])
  else
    draw_empty_star(ctx, this.x, this.y + 20, 15)

  var num_enemy_type = impulse_level_data[this.level_name].enemies.length
  var num_row = Math.floor((this.w - this.buffer * 2) / this.enemy_image_size)
  
  var i = 0

  for(var j in impulse_level_data[this.level_name].enemies) {
    var temp_r = impulse_enemy_stats[j].effective_radius/2 * this.enemy_image_size/2
    var cur_x = this.x - this.w/2 + this.buffer + this.enemy_image_size/2 + this.enemy_image_size * (i % num_row)
    var cur_y = this.y + this.h/2 - this.buffer - this.enemy_image_size * 1.5 + this.enemy_image_size * Math.floor(i / num_row)
    context.beginPath()
    if(impulse_enemy_stats[j].shape_type == "circle") {
      
      context.arc(cur_x, cur_y, temp_r, 0, 2 * Math.PI, true)
     
    }
    else if(impulse_enemy_stats[j].shape_type == "polygon") {
      context.moveTo(cur_x+impulse_enemy_stats[j].shape_vertices[0][0]*temp_r, cur_y+impulse_enemy_stats[j].shape_vertices[0][1]*temp_r)
      for(var k = 1; k < impulse_enemy_stats[j].shape_vertices.length; k++)
      {
        context.lineTo(cur_x+impulse_enemy_stats[j].shape_vertices[k][0]*temp_r, cur_y+impulse_enemy_stats[j].shape_vertices[k][1]*temp_r)
      }
      context.closePath()
    }
    context.fillStyle = impulse_enemy_stats[j].color
    context.strokeStyle = impulse_enemy_stats[j].color
    context.lineWidth = 2
    context.stroke()
    context.globalAlpha /=2
    context.fill()
    context.globalAlpha = 1
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
    context.font = this.size +'px Century Gothic'
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
    
    context.fillStyle = "black" //impulse_level_data[this.level_name].stars > 0 ? impulse_colors[temp[impulse_level_data[this.level_name].stars - 1]] : "black"
    context.fillText("HIGH SCORE: "+impulse_level_data[this.level_name].high_score, this.fx, this.fy - this.fh/2 + this.size)
  
    var star_size = 30
    
    for(var i = 0; i < 3; i++) {
      if(impulse_level_data[this.level_name].stars > i) {
        draw_star(context, this.fx - 50 + 50 * i, this.fy + 14, 20, this.star_colors[i])
      }
      else
        draw_empty_star(context, this.fx - 50 + 50 * i, this.fy + 14, 20)

    }
  }
}
