/*  Canvas implementation of raycaster based on example at
 *  http://lodev.org/cgtutor/raycasting.html
 */
(function (canvas) {
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
world = {
    ceilColor: "rgb(9,9,59)",        
    floorColor: "rgb(128,128,179)", 
    wallColors: [
    [170, 142, 57],   // default 
    [52, 52, 119],     // 1
    [41, 79, 109],     // 2
    [75, 45, 115],     // 3
    [86, 86, 149]  // 4
  ],
  map: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
};
var player = {
    x: 22, 
    y: 12, 
    dirX: -1,
    dirY: 0,
};
var camera = {
    planeX: 0,
    planeY: 0.67
};

var render = function () {
    var cameraX,
        rayPosX, rayPosY,
        rayDirX, rayDirY,
        mapX, mapY,
        sideDistX, sideDistY,
        deltaDistX, deltaDistY,
        perpWallDist,
        stepX, stepY,
        hit, side, mapTile,
        lineHeight,
        drawStart, drawEnd,
        color, oldColor;
    ctx.save();
    ctx.lineWidth = 1.1; // fix subpixel glitches;
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    ctx.fillStyle = world.ceilColor; //ceiling
    ctx.fillRect(0,0,canvasWidth,canvasHeight / 2);
    ctx.fillStyle = world.floorColor; //floor
    ctx.fillRect(0,canvasHeight / 2,canvasWidth,canvasHeight);
    ctx.beginPath();
    for (var x = 0.5; x < canvasWidth; x++) {
        cameraX = 2 * x / canvasWidth - 1;
        rayPosX = player.x;
        rayPosY = player.y;
        rayDirX = player.dirX + camera.planeX * cameraX;
        rayDirY = player.dirY + camera.planeY * cameraX;
        mapX = parseInt(rayPosX);
        mapY = parseInt(rayPosY);
        deltaDistX = Math.sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX));
        deltaDistY = Math.sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY));
        hit = 0;
        stepX = (rayDirX < 0) ? -1 : 1;
        stepY = (rayDirY < 0) ? -1 : 1;
        sideDistX = (rayDirX < 0) ? (rayPosX - mapX) * deltaDistX : (mapX + 1 - rayPosX) * deltaDistX;
        sideDistY = (rayDirY < 0) ? (rayPosY - mapY) * deltaDistY : (mapY + 1 - rayPosY) * deltaDistY;
        while (hit === 0) {
            if (sideDistX < sideDistY)
            {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            }
            else
            {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            if (world.map[mapX][mapY] > 0) hit = 1;
        }
        perpWallDist = (side === 0) ?
            Math.abs((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) :
            Math.abs((mapY - rayPosY + (1 - stepY) / 2) / rayDirY);
        lineHeight = Math.abs(parseInt(canvasHeight / perpWallDist));
        drawStart = Math.max(0, -lineHeight / 2 + canvasHeight / 2);
        drawEnd = Math.min(canvasHeight - 1, lineHeight / 2 + canvasHeight / 2);
        mapTile = world.map[mapX][mapY];
        if (mapTile > 0 && mapTile < world.wallColors.length) {
            color = world.wallColors[mapTile].slice(0);
        } else {
            color = world.wallColors[0].slice(0);
        }
        if (side === 1) {
            color[0] = parseInt(color[0] / 2);
            color[1] = parseInt(color[1] / 2);
            color[2] = parseInt(color[2] / 2);
        }
        color = "rgb(" + color.join(",") + ")";
        if (oldColor && color !== oldColor) {
            ctx.strokeStyle = oldColor;
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
        }
        ctx.moveTo(x, drawStart);
        ctx.lineTo(x, drawEnd);
        oldColor = color;
    }
    ctx.strokeStyle = color; 
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
};

var w = window;
var keysDown = {};
var requestAnimationFrame = w.requestAnimationFrame || 
    w.webkitRequestAnimationFrame || 
    w.msRequestAnimationFrame || 
    w.mozRequestAnimationFrame || 
    w.oRequestAnimationFrame;

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

var update = function(modifier) {
    var moveSpeed =  modifier * 5;
    var rotSpeed =  modifier * 3;
    var oldDirX, oldPlaneX;
    if (38 in keysDown) { // up
        if (world.map[parseInt(player.x + player.dirX * moveSpeed)][parseInt(player.y)] === 0) {
            player.x += player.dirX * moveSpeed;
        }
        if(world.map[parseInt(player.x)][parseInt(player.y + player.dirY * moveSpeed)] === 0) {
             player.y += player.dirY * moveSpeed;
        }
    }
    if (40 in keysDown) { // down
        if (world.map[parseInt(player.x - player.dirX * moveSpeed)][parseInt(player.y)] === 0) {
            player.x -= player.dirX * moveSpeed;
        }
        if(world.map[parseInt(player.x)][parseInt(player.y - player.dirY * moveSpeed)] === 0) {
             player.y -= player.dirY * moveSpeed;
        }
    }
    if (39 in keysDown) { // right
      oldDirX = player.dirX;
      player.dirX = player.dirX * Math.cos(-rotSpeed) - player.dirY * Math.sin(-rotSpeed);
      player.dirY = oldDirX * Math.sin(-rotSpeed) + player.dirY * Math.cos(-rotSpeed);
      oldPlaneX = camera.planeX;
      camera.planeX = camera.planeX * Math.cos(-rotSpeed) - camera.planeY * Math.sin(-rotSpeed);
      camera.planeY = oldPlaneX * Math.sin(-rotSpeed) + camera.planeY * Math.cos(-rotSpeed);
    }
    if (37 in keysDown) { // left
      oldDirX = player.dirX;
      player.dirX = player.dirX * Math.cos(rotSpeed) - player.dirY * Math.sin(rotSpeed);
      player.dirY = oldDirX * Math.sin(rotSpeed) + player.dirY * Math.cos(rotSpeed);
      oldPlaneX = camera.planeX;
      camera.planeX = camera.planeX * Math.cos(rotSpeed) - camera.planeY * Math.sin(rotSpeed);
      camera.planeY = oldPlaneX * Math.sin(rotSpeed) + camera.planeY * Math.cos(rotSpeed);
    }
};

var main = function () {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();
    then = now;
    requestAnimationFrame(main);
};
var then = Date.now();
main();

}(canvas));