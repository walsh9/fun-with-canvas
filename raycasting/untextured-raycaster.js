/*  Canvas implementation of raycaster based on examples at
 *  http://lodev.org/cgtutor/raycasting.html and
 *  http://www.permadi.com/tutorial/raycast/index.html
 */

(function (canvas) {

var pleaseShowFps = false;
var pleaseDoShading = true;
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var map1 = [
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
  ];
var currentMap = map1;
var player = {
    x: 22, 
    y: 12, 
    dirX: -1,
    dirY: 0,
    planeX: 0,
    planeY: 0.67
};


var getWallColor = function (tile, side) {
    var wallColors = [    
        [255,255,255], // default 
        [255,220,116], // 1
        [153,229,104], // 2
        [228,104,148], // 3
        [102,102,190]  // 4
    ];
    var color = [];
    if (tile > 0 && tile < wallColors.length) {
        color = wallColors[tile].slice(0);
    } else {
        color = wallColors[0].slice(0);
    }
    if (side === 1) {
        color[0] = parseInt(color[0] / 2);
        color[1] = parseInt(color[1] / 2);
        color[2] = parseInt(color[2] / 2);
    }
    return color;
};

var shadeColor = function(color, distance) {
    var brightness = Math.min(1, 1/distance * 6);
    color[0] = parseInt(color[0] * brightness);
    color[1] = parseInt(color[1] * brightness);
    color[2] = parseInt(color[2] * brightness);
    return color;
};

var drawCeiling = function(ctx) {
    var color = "rgb( 83, 83,101)";
    ctx.fillStyle = color; 
    ctx.fillRect(0.5,0.5,canvasWidth,canvasHeight);
};

var drawFloor = function(ctx) {
    var color = "rgb(121,121,174)";
    ctx.fillStyle = color; 
    ctx.fillRect(0.5,canvasHeight / 2 - 0.5,canvasWidth,canvasHeight);
};

var drawWalls = function (ctx, viewer, map) {
    var perpWallDist, lineHeight, drawStart, drawEnd, colorRGB, oldColor, color;
    ctx.beginPath();
    for (var x = 0.5; x < canvasWidth; x++) {
        var cameraX = 2 * x / canvasWidth - 1,
            rayPosX = viewer.x,
            rayPosY = viewer.y,
            rayDirX = viewer.dirX + viewer.planeX * cameraX,
            rayDirY = viewer.dirY + viewer.planeY * cameraX,
            mapX = parseInt(rayPosX),
            mapY = parseInt(rayPosY),
            deltaDistX = Math.sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX)),
            deltaDistY = Math.sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY)),
            hit = 0,
            stepX = (rayDirX < 0) ? -1 : 1,
            stepY = (rayDirY < 0) ? -1 : 1,
            sideDistX = (rayDirX < 0) ? (rayPosX - mapX) * deltaDistX : (mapX + 1 - rayPosX) * deltaDistX,
            sideDistY = (rayDirY < 0) ? (rayPosY - mapY) * deltaDistY : (mapY + 1 - rayPosY) * deltaDistY;
        while (hit === 0) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            if (map[mapX][mapY] > 0) hit = 1;
        }
        perpWallDist = (side === 0) ?
            Math.abs((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) 
            :
            Math.abs((mapY - rayPosY + (1 - stepY) / 2) / rayDirY);
        lineHeight = Math.abs(parseInt(canvasHeight / perpWallDist));
        drawStart = Math.max(0, -lineHeight / 2 + canvasHeight / 2);
        drawEnd = Math.min(canvasHeight - 1, lineHeight / 2 + canvasHeight / 2);
        colorRGB = getWallColor(map[mapX][mapY], side);
        if (pleaseDoShading) {
            colorRGB = shadeColor(colorRGB, perpWallDist);
        }
        color = "rgb(" + colorRGB.join(",") + ")";
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
};

var render = function (ctx, viewer, map) {
    var cameraX,
        rayPosX, rayPosY,
        rayDirX, rayDirY,
        mapX, mapY,
        sideDistX, sideDistY,
        deltaDistX, deltaDistY,
        perpWallDist,
        stepX, stepY,
        hit, side, mapTile,
        lineHeight, brightness,
        drawStart, drawEnd,
        color, oldColor;
    ctx.save();
    ctx.lineCaps = "square";
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    drawCeiling(ctx);
    drawFloor(ctx);
    drawWalls(ctx, viewer, map);
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

actions = {
    moveForward: function (actor, map, moveSpeed) {
        if (map[parseInt(actor.x + actor.dirX * moveSpeed)][parseInt(actor.y)] === 0) {
            actor.x += actor.dirX * moveSpeed;
        }
        if(map[parseInt(actor.x)][parseInt(actor.y + actor.dirY * moveSpeed)] === 0) {
             actor.y += actor.dirY * moveSpeed;
        }
    },
    moveBackward: function (actor, map, moveSpeed) {
        if (map[parseInt(actor.x - actor.dirX * moveSpeed)][parseInt(actor.y)] === 0) {
            actor.x -= actor.dirX * moveSpeed;
        }
        if(map[parseInt(actor.x)][parseInt(actor.y - actor.dirY * moveSpeed)] === 0) {
             actor.y -= actor.dirY * moveSpeed;
        }
    },
    turnRight: function(actor, rotSpeed) {
        var oldDirX, oldPlaneX;
        oldDirX = actor.dirX;
        actor.dirX = actor.dirX * Math.cos(-rotSpeed) - actor.dirY * Math.sin(-rotSpeed);
        actor.dirY = oldDirX * Math.sin(-rotSpeed) + actor.dirY * Math.cos(-rotSpeed);
        oldPlaneX = actor.planeX;
        actor.planeX = actor.planeX * Math.cos(-rotSpeed) - actor.planeY * Math.sin(-rotSpeed);
        actor.planeY = oldPlaneX * Math.sin(-rotSpeed) + actor.planeY * Math.cos(-rotSpeed);
    },
    turnLeft: function(actor, rotSpeed) {
        oldDirX = actor.dirX;
        actor.dirX = actor.dirX * Math.cos(rotSpeed) - actor.dirY * Math.sin(rotSpeed);
        actor.dirY = oldDirX * Math.sin(rotSpeed) + actor.dirY * Math.cos(rotSpeed);
        oldPlaneX = actor.planeX;
        actor.planeX = actor.planeX * Math.cos(rotSpeed) - actor.planeY * Math.sin(rotSpeed);
        actor.planeY = oldPlaneX * Math.sin(rotSpeed) + actor.planeY * Math.cos(rotSpeed);
    }
};


var update = function(modifier) {
    var moveSpeed =  modifier * 5;
    var rotSpeed =  modifier * 3;
    var oldDirX, oldPlaneX;
    if (38 in keysDown) { // up
        actions.moveForward(player, currentMap, moveSpeed);
    }
    if (40 in keysDown) { // down
        actions.moveBackward(player, currentMap, moveSpeed);
    }
    if (39 in keysDown) { // right
        actions.turnRight(player, rotSpeed);
    }
    if (37 in keysDown) { // left
        actions.turnLeft(player, rotSpeed);
    }
    if (70 in keysDown) { // f
      pleaseShowFps = !pleaseShowFps;
      delete keysDown[70];
    }
    if (83 in keysDown) { // s
      pleaseDoShading = !pleaseDoShading;
      delete keysDown[83];
    }
};

var showFps = function (ctx, fps) {
    ctx.fillStyle = "#ffffff";
    ctx.font      = "normal 10px Verdana";
    ctx.fillText(fps.toFixed(2) + " fps", 10, 20);
};

var main = function () {
    var now = Date.now();
    var delta = now - then;
    var fps = (1000/delta);

    update(delta / 1000);
    render(ctx, player, currentMap);
    if (pleaseShowFps) {
        showFps(ctx, fps);
    }
    then = now;
    requestAnimationFrame(main, canvas);
};
var then = Date.now();
main();

}(canvas));