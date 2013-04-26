LevelIntroState.prototype = new GameState

LevelIntroState.prototype.constructor = LevelIntroState

function LevelIntroState(level_name, world) {


  this.level_name = level_name
  this.buttons = []
  this.world_num = world
  this.bg_drawn = false
  this.buttons.push(new SmallButton("LEVEL SELECT", 20, 150, canvasHeight - 30, 200, 50, function(_this){return function(){
    if(_this.world_num) {
      switch_game_state(new ClassicSelectState(_this.world_num))
    }
    else {
      switch_game_state(new TitleState(true))
    }
  }}(this)))

  this.star_colors = ['bronze', 'silver', 'gold']
  this.stars = impulse_level_data[this.level_name].stars

  this.drawn_enemies = null

  if(this.level_name.slice(0, 4) == "BOSS") {
    this.drawn_enemies = {}
    this.drawn_enemies[impulse_level_data[this.level_name].dominant_enemy] = null
    this.num_enemy_type = 1
  }
  else {
    this.drawn_enemies = impulse_level_data[this.level_name].enemies
    this.num_enemy_type = 0
    for(var j in impulse_level_data[this.level_name].enemies) {
      this.num_enemy_type += 1
    }
  }
  this.enemy_image_size = 40

  this.level = new Level(impulse_level_data[this.level_name], this)

  this.level.generate_obstacles()

  var visibility_graph_worker = new Worker("js/lib/visibility_graph_worker.js")

  visibility_graph_worker.postMessage({polygons: this.level.boundary_polygons, obstacle_edges: this.level.obstacle_edges})

  visibility_graph_worker.onmessage = function(_this) {
    return function(event) {
      console.log("Worker has generated visibility graph")
      if (event.data.percentage) {
        _this.load_percentage = event.data.percentage

      }
      else if(event.data.poly_edges)
        _this.visibility_graph = new VisibilityGraph(_this.level.boundary_polygons, _this.level, event.data.poly_edges, event.data.vertices, event.data.edges, event.data.edge_list, event.data.shortest_paths)
        _this.load_percentage = 1
        _this.load_complete()
    }

  }(this)

  var num_row = 12

  var i = 0

  for(var j in this.drawn_enemies) {

    var k = 0
    var num_in_this_row = 0

    while(k < i+1 && k < this.num_enemy_type) {
      k+=num_row
    }

    if(k <= this.num_enemy_type) {
      num_in_this_row = num_row
    }
    else {
      num_in_this_row = this.num_enemy_type - (k - num_row)
    }
    var diff = (i - (k - num_row)) - (num_in_this_row - 1)/2

    var h_diff = Math.floor(i/num_row) - (Math.ceil(this.num_enemy_type/num_row) - 1)/2

    var cur_x = 400 + (this.enemy_image_size+10) * diff
    var cur_y = 525 + this.enemy_image_size * h_diff
    this.buttons.push(new SmallEnemyButton(j, this.enemy_image_size, cur_x, cur_y, this.enemy_image_size, this.enemy_image_size, "rgba(0, 0, 0, 0.3)"))

    i+=1
  }


}

LevelIntroState.prototype.process = function(dt) {

}

LevelIntroState.prototype.draw = function(ctx, bg_ctx) {

  if(!this.bg_drawn) {
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "white"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }

  ctx.beginPath()
  ctx.fillStyle = impulse_colors['world '+ this.world_num]
  ctx.font = '30px Century Gothic'
  ctx.textAlign = 'center'

  ctx.fillText(this.level_name, canvasWidth/2, 80)
  ctx.fill()

  impulse_colors['world 2']

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  draw_level_obstacles_within_rect(ctx, this.level_name, 400, 175, 200, 150, impulse_colors['world '+ this.world_num])
  ctx.beginPath()
  ctx.rect(300, 100, 200, 150)

  ctx.strokeStyle = "rgba(0, 0, 0, .3)"
  ctx.stroke()

  if (this.load_percentage < 1) {
    ctx.textAlign = 'center'
    draw_progress_bar(ctx, canvasWidth - 150, canvasHeight - 40, 200, 25, this.load_percentage, impulse_colors['world '+ this.world_num])
    ctx.font = '20px Century Gothic'
    ctx.fillStyle = 'black'
    ctx.fillText("LOADING", canvasWidth - 150, canvasHeight - 33)
  }

  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {

    for(var i = 0; i < 3; i++) {
      ctx.textAlign = 'right'
      ctx.font = '25px Century Gothic'
      ctx.fillStyle = impulse_colors[this.star_colors[i]]
      ctx.fillText(impulse_level_data[this.level_name].cutoff_scores[i], 500, 300 + 35 * i)
      draw_star(ctx, 320, 295 + 35 * i, 20, this.star_colors[i])
    }
    score_color = 0

    while(impulse_level_data[this.level_name].high_score > impulse_level_data[this.level_name].cutoff_scores[score_color]) {
      score_color+=1
    }

    ctx.fillStyle = score_color > 0 ? impulse_colors[this.star_colors[score_color - 1]] : "black"
    ctx.textAlign = 'center'

    /*if(this.stars > 0)
      draw_star(ctx, 400, 420, 30, this.star_colors[this.stars - 1])
    else
    draw_empty_star(ctx, 400, 420, 30)*/
    ctx.fillText("HIGH SCORE: "+impulse_level_data[this.level_name].high_score, 400, 420)

    ctx.fillStyle = "black"
    ctx.font = '20px Century Gothic'
    ctx.fillText("ENEMIES", 400, 470)



  }
}


LevelIntroState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}


LevelIntroState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}



LevelIntroState.prototype.load_complete = function() {
  this.buttons.push(new SmallButton("START LEVEL", 20, canvasWidth - 150, canvasHeight - 30, 300, 50, function(_this){return function(){switch_game_state(new ImpulseGameState(_this.world_num, _this.level, _this.visibility_graph))}}(this)))
}
