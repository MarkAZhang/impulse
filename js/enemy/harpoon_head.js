HarpoonHead.prototype = new Enemy()

HarpoonHead.prototype.constructor = HarpoonHead

function HarpoonHead(world, x, y, id, impulse_game_state, harpoon) {

  this.harpoon = harpoon

  this.type="harpoonhead"

  this.init(world, x, y, id, impulse_game_state)

  this.require_open = false

}

HarpoonHead.prototype.collide_with = function(other) {
  if(other === this.player && this.harpoon.harpoon_state != "engaged" && !this.dying) {
    this.harpoon.engage_harpoon()
  } else if(other != this.harpoon){
    other.open(1000)
  }
}