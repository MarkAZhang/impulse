Fighter.prototype = new Enemy()

Fighter.prototype.constructor = Fighter

function Fighter(world, x, y, id) {
  
  vertices = []
  var s_radius = 1  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 0), s_radius*Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/4), s_radius*Math.sin(Math.PI * 1/4)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 3/4), s_radius*Math.sin(Math.PI * 3/4)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 5/4), s_radius*Math.sin(Math.PI * 5/4)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 7/4), s_radius*Math.sin(Math.PI * 7/4)))  
//  this.shape = new b2CircleShape(.5)

  this.effective_radius =  s_radius//an approximation of the radius of this shape

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.collision_polygon = getBoundaryPolygon(vertices, (player.r + 0.1))
  this.color = "rgb(30, 144, 255)"
  this.density = 1
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99

  this.init(world, x, y, id)

  //this.fast_lin_damp = 1.5

  //how fast enemies move
  this.force = .7

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.special_mode = false

  this.tank_force = 100 //force that the spear impulses the player

  this.death_radius = 5

  this.score_value = 1000

  this.shoot_interval = 750

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

}

Fighter.prototype.additional_processing = function(dt) {
  if(this.shoot_duration < 0) {
    this.shoot_duration = this.shoot_interval
    if(isVisible(this.body.GetPosition(), player.body.GetPosition(), level.obstacle_edges)) {
      spawned_enemies.push(new FighterBullet(world, this.body.GetPosition().x + this.effective_radius * 3 * Math.cos(this.body.GetAngle()), this.body.GetPosition().y + this.effective_radius * 3 * Math.sin(this.body.GetAngle()), enemy_counter, (player.body.GetPosition().x - this.body.GetPosition().x), (player.body.GetPosition().y - this.body.GetPosition().y), this.id))
      enemy_counter += 1
    }
  }
  this.shoot_duration -= dt

}

Fighter.prototype.player_hit_proc = function() {
}


