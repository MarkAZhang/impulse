draw_quest_button = function(ctx, x, y, r, type) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#000"
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r - 8, 0, 2 * Math.PI, false);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "white";
  ctx.stroke();
  if (type == "beat_hive") {
    draw_tessellation_sign(ctx, 1, x, y, r * 0.6, true, 0);
    ctx.beginPath()
    ctx.lineWidth = 6
    ctx.moveTo(x - r * 0.4, y - r * 0.4)
    ctx.lineTo(x + r * 0.4, y + r * 0.4)
    ctx.moveTo(x + r * 0.4, y - r * 0.4)
    ctx.lineTo(x - r * 0.4, y + r * 0.4)
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
  }
  if (type == "final_boss") {
    draw_tessellation_sign(ctx, 4, x, y, r * 0.6, true, 0);
    ctx.beginPath()
    ctx.lineWidth = 6
    ctx.moveTo(x - r * 0.4, y - r * 0.4)
    ctx.lineTo(x + r * 0.4, y + r * 0.4)
    ctx.moveTo(x + r * 0.4, y - r * 0.4)
    ctx.lineTo(x - r * 0.4, y + r * 0.4)
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
  }
  if (type == "first_gold") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.8, r * 0.8, "gold_trophy")
  }

  if (type == "combo") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()

    drawSprite(ctx, x, y - r/4, 0, r * 0.4, r * 0.4, "player_normal")


    ctx.beginPath()
    ctx.arc(x, y - r/2, r * 0.75, Math.PI/3, 2 * Math.PI/3, false);
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
    var angles_to_draw = [Math.PI/2, Math.PI * 0.36, Math.PI * 0.64, Math.PI * 0.57, Math.PI * 0.43]
    for(var i = 0; i < angles_to_draw.length; i++) {
      var angle = angles_to_draw[i];
      drawImageWithRotation(ctx,
        x + r * 0.9 * Math.cos(angle),
        y - r / 2 + r * 0.9 * Math.sin(angle),
      angle, 10, 10, enemyData["stunner"].images["normal"]);
    }
  }

  if (type == "combo") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()

    drawSprite(ctx, x, y - r/4, 0, r * 0.4, r * 0.4, "player_normal")


    ctx.beginPath()
    ctx.arc(x, y - r/2, r * 0.75, Math.PI/3, 2 * Math.PI/3, false);
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
    var angles_to_draw = [Math.PI/2, Math.PI * 0.36, Math.PI * 0.64, Math.PI * 0.57, Math.PI * 0.43]
    for(var i = 0; i < angles_to_draw.length; i++) {
      var angle = angles_to_draw[i];
      drawImageWithRotation(ctx,
        x + r * 0.9 * Math.cos(angle),
        y - r / 2 + r * 0.9 * Math.sin(angle),
      angle, 10, 10, enemyData["stunner"].images["normal"]);
    }
  }

  if (type == "high_roller") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()

    drawSprite(ctx, x, y - r/4, 0, r * 0.4, r * 0.4, "player_normal")

    ctx.beginPath()
    ctx.arc(x, y - r/2, r * 0.65, Math.PI/3, 2 * Math.PI/3, false);
    ctx.strokeStyle = impulse_colors["impulse_blue"]
    ctx.stroke();
    var angles_to_draw = [Math.PI/2, Math.PI * 0.36, Math.PI * 0.64, Math.PI * 0.57, Math.PI * 0.43]
    ctx.fillStyle = impulse_colors["gold"]
    ctx.textAlign = "center"
    ctx.font = "12px Muli"
    ctx.fillText("250K", x, y + r/2)

  }

  if (type.substring(0, 10) == "blitz_hive") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    var world = type.substring(10);
    if (world == "1") {
      drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "immunitas_glow", immunitasSprite)
    } else if (world == "2") {
      drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "consumendi_glow", consumendiSprite)
    } else if (world == "3") {
      drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "negligentia_glow", negligentiaSprite)
    } else if (world == "4") {
      drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "adrogantia_glow", adrogantiaSprite)
    }
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.8, r * 0.8, "world"+type.substring(10)+"_timer")
  }

  if (type == "survivor") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.4, r * 0.4, "player_normal")
    for(var i = 0; i < 8; i++) {
      var angle = Math.PI * 2 * i / 4 + Math.PI/4;
      drawImageWithRotation(ctx,
        x + r * 0.5 * Math.cos(angle),
        y + r * 0.5 * Math.sin(angle),
      Math.PI/2 + angle, 15, 15, enemyData["spear"].images["normal"]);
    }
  }

  if (type == "fast_time") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.7, r * 0.7, "timer_icon")
  }

  if (type == "pacifist") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y + r * 0.2, 0, r * 0.4, r * 0.4, "player_normal")
    ctx.save();
    ctx.lineWidth = 3
    draw_ellipse(ctx, x, y - r * 0.2, r/6, r/12, impulse_colors["gold"])
    ctx.restore();
  }

  if (type == "beat_hard") {
    ctx.save()
    ctx.globalAlpha *= 0.1
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r, r, "white_flower")
  }

  if (type == "untouchable") {
    ctx.save()
    ctx.globalAlpha *= 0.2
    drawSprite(ctx, x, y, 0, r * 1.2, r * 1.2, "white_glow")
    ctx.restore()
    drawSprite(ctx, x, y, 0, r * 0.4, r * 0.4, "player_normal")
    ctx.save();
    ctx.lineWidth = 3
    draw_ellipse(ctx, x, y, r * 0.45, r * 0.45, impulse_colors["gold"])
    draw_ellipse(ctx, x, y, r * 0.55, r * 0.55, impulse_colors["gold"])
    ctx.restore();
  }
}
