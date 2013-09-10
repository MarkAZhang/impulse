var BackgroundAnimation = function(width, height) {
  this.canvas_width = width
  this.canvas_height = height
  this.row_gap = 50;
  this.col_gap = 50;
  this.num_rows = this.canvas_height/this.row_gap
  this.num_cols = this.canvas_width/this.col_gap

  this.animation_period = 30;
  this.animation_timer = 0
  this.impulse_centers = []

  this.enemies = ["stunner", "spear", "tank", "mote", "goo", "harpoon",
                "fighter", "disabler", "troll", "slingshot", "orbiter", "deathray"]
}

BackgroundAnimation.prototype.draw_title_bg = function(ctx) {
  for(var i = 0; i < this.num_cols; i++) {
    for(var j = 0; j < this.num_rows; j++) {
      draw_enemy(ctx, this.enemies[(j+i+8)%12], (i+0.5)*this.col_gap, (j+0.5)*this.row_gap, 20, Math.PI/2, "white");
    }
  }
}

BackgroundAnimation.prototype.draw = function(ctx, style) {

  var cur_style = style ? style : "impulsed"
  for(var i = 0; i < this.impulse_centers.length; i++) {
    ctx.save()
    ctx.globalAlpha *= 0.2
    var pt = this.impulse_centers[i]
    draw_enemy(ctx, this.enemies[(pt.x+pt.y+8)%12], (pt.x+0.5)*this.col_gap, (pt.y+0.5)*this.row_gap, 20, Math.PI/2, cur_style);
    if(pt.y > 0) {
      ctx.globalAlpha *= 0.5
      draw_enemy(ctx, this.enemies[(pt.x+pt.y-1+8)%12], (pt.x+0.5)*this.col_gap, (pt.y-1+0.5)*this.row_gap, 20, Math.PI/2, cur_style);
      if(pt.y > 1) {
        ctx.globalAlpha *= 0.3
        draw_enemy(ctx, this.enemies[(pt.x+pt.y-2+8)%12], (pt.x+0.5)*this.col_gap, (pt.y-2+0.5)*this.row_gap, 20, Math.PI/2, cur_style);
      }
    }
    ctx.restore()
  }
}

BackgroundAnimation.prototype.process = function(dt) {
  if(this.animation_timer < this.animation_period) {
    this.animation_timer += dt
    return
  }
  this.animation_timer -= this.animation_period

  for(var i = this.impulse_centers.length - 1; i >= 0; i--) {
    var pt = this.impulse_centers[i]
    pt.y += 1
    if(pt.y > this.num_rows) {
      this.impulse_centers.splice(i, 1)
    }
  }
  if(Math.random() < 0.5)
  this.impulse_centers.push({x: Math.floor(Math.random() * this.num_cols), y: 0})
}

BackgroundAnimation.prototype.clear = function() {
  this.impulse_centers = []
}