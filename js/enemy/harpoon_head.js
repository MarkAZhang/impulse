HarpoonHead.prototype = new Enemy()

HarpoonHead.prototype.constructor = HarpoonHead

function HarpoonHead(world, x, y, id, impulse_game_state, harpoon) {

  this.harpoon = harpoon

  this.type="harpoonhead"

  this.init(world, x, y, id, impulse_game_state)

  this.require_open = false

}

HarpoonHead.prototype.collide_with = function(other) {
  if(other === this.player){
    if(this.harpoon.harpoon_state != "engaged" && !this.dying) {
      this.harpoon.engage_harpoon()
    }
  } else if(other != this.harpoon && this.harpoon.harpoon_state != "inactive"){
    other.open(1000)
  }
}

HarpoonHead.prototype.additional_processing = function(other) {
  this.status_duration = this.harpoon.status_duration
}