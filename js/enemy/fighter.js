Fighter.prototype = new Enemy()

Fighter.prototype.constructor = Fighter

function Fighter(world, x, y, id) {
  this.type = "fighter"

  var s_radius = impulse_enemy_stats[this.type]['effective_radius']

  vertices = []
  var s_radius = 1  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 0), s_radius*Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/4), s_radius*Math.sin(Math.PI * 1/4)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 3/4), s_radius*Math.sin(Math.PI * 3/4)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 5/4), s_radius*Math.sin(Math.PI * 5/4)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 7/4), s_radius*Math.sin(Math.PI * 7/4)))  

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)

  this.init(world, x, y, id)

  this.special_mode = false

  this.death_radius = 5

  this.score_value = 1000

  this.shoot_interval = 750

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

  this.safe_radius = 10

  this.safe_radius_buffer = 2

  this.safe_lines = [{x: -5, y: -5}, {x: -5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: -5}]

  this.bullet_alternater = 0

  this.safe = true

}

Fighter.prototype.additional_processing = function(dt) {

  if(this.safe != p_dist(player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius)
  {
    this.safe = !this.safe
    this.path = null
  }

  if(this.shoot_duration < 0 && this.status_duration[1] <= 0) {
    this.shoot_duration = this.shoot_interval
    if(this.special_mode) {
      var other_angle = this.body.GetAngle() + Math.PI/2 * ((this.bullet_alternater % 2) * 2 - 1)
      var bullet_start_loc_x = this.body.GetPosition().x + this.effective_radius *  Math.cos(other_angle) + this.effective_radius * 3 * Math.cos(this.body.GetAngle())
      var bullet_start_loc_y = this.body.GetPosition().y + this.effective_radius *  Math.sin(other_angle) + this.effective_radius * 3 * Math.sin(this.body.GetAngle())
      level.spawned_enemies.push(new FighterBullet(world, bullet_start_loc_x, bullet_start_loc_y, enemy_counter, (player.body.GetPosition().x - bullet_start_loc_x), (player.body.GetPosition().y - bullet_start_loc_y), this.id))
      enemy_counter += 1
      this.bullet_alternater += 1
    }
  }
  this.shoot_duration -= dt

  this.special_mode = isVisible(player.body.GetPosition(), this.body.GetPosition(), level.obstacle_edges) && this.status_duration[1] <= 0
}

Fighter.prototype.player_hit_proc = function() {
}

Fighter.prototype.get_target_point = function() {
  console.log("FIGHTER TARGET POINT")
  if(!this.safe) {
    var rayOut = new b2Vec2(this.body.GetPosition().x - player.body.GetPosition().x, this.body.GetPosition().y - player.body.GetPosition().y)
    rayOut.Normalize()
    rayOut.Multiply(200)
    var j = this.safe_lines.length - 1
    for(var i = 0; i < this.safe_lines.length; i++)
    {
      var temp = getSegIntersection(player.body.GetPosition(), {x: player.body.GetPosition().x + rayOut.x, y: player.body.GetPosition().y + rayOut.y}, this.safe_lines[i], this.safe_lines[j])

      if(temp!=null)
      {
        console.log("RETURN " + temp.x +" " +temp.y)
        return temp
        
      }

      j = i
    }
  }
  else
    console.log("RETURN " + player.body.GetPosition().x +" " +player.body.GetPosition().y)
    return player.body.GetPosition()
}

Fighter.prototype.enemy_move = Enemy.prototype.move

Fighter.prototype.move = function() {
  if(p_dist(player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius && p_dist(player.body.GetPosition(), this.body.GetPosition()) < this.safe_radius + this.safe_radius_buffer) {
    this.path = null
  }
  else
    this.enemy_move()

  
}

Fighter.prototype.set_heading = function(endPt) {
  var heading = _atan(this.body.GetPosition(), player.body.GetPosition())
  this.body.SetAngle(heading)
}
