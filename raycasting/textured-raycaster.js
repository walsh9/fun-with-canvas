/*  Canvas implementation of raycaster based on examples at
 *  http://lodev.org/cgtutor/raycasting.html and
 *  http://www.permadi.com/tutorial/raycast/index.html
 *
 *  Public Domain textures from rubberduck
 *  http://opengameart.org/content/40-free-metal-textures-from-mtc-sets
 */

(function (canvas) {


var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
world = {
    ceilColor:  "rgb( 0, 0, 0)",        
    floorColor: "rgb(128,128,128)", 
  map: [
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,7,7,7,7,7,7,7,7],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,7],
  [4,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
  [4,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
  [4,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,7],
  [4,0,4,0,0,0,0,5,5,5,5,5,5,5,5,5,7,7,0,7,7,7,7,7],
  [4,0,5,0,0,0,0,5,0,5,0,5,0,5,0,5,7,0,0,0,7,7,7,1],
  [4,0,6,0,0,0,0,5,0,0,0,0,0,0,0,5,7,0,0,0,0,0,0,8],
  [4,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,1],
  [4,0,8,0,0,0,0,5,0,0,0,0,0,0,0,5,7,0,0,0,0,0,0,8],
  [4,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,7,0,0,0,7,7,7,1],
  [4,0,0,0,0,0,0,5,5,5,5,0,5,5,5,5,7,7,7,7,7,7,7,1],
  [6,6,6,6,6,6,6,6,6,6,6,0,6,6,6,6,6,6,6,6,6,6,6,6],
  [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [6,6,6,6,6,6,0,6,6,6,6,0,6,6,6,6,6,6,6,6,6,6,6,6],
  [4,4,4,4,4,4,0,4,4,4,6,0,6,2,2,2,2,2,2,2,3,3,3,3],
  [4,0,0,0,0,0,0,0,0,4,6,0,6,2,0,0,0,0,0,2,0,0,0,2],
  [4,0,0,0,0,0,0,0,0,0,0,0,6,2,0,0,5,0,0,2,0,0,0,2],
  [4,0,0,0,0,0,0,0,0,4,6,0,6,2,0,0,0,0,0,2,2,0,2,2],
  [4,0,6,0,6,0,0,0,0,4,6,0,0,0,0,0,5,0,0,0,0,0,0,2],
  [4,0,0,5,0,0,0,0,0,4,6,0,6,2,0,0,0,0,0,2,2,0,2,2],
  [4,0,6,0,6,0,0,0,0,4,6,0,6,2,0,0,5,0,0,2,0,0,0,2],
  [4,0,0,0,0,0,0,0,0,4,6,0,6,2,0,0,0,0,0,2,0,0,0,2],
  [4,4,4,4,4,4,4,4,4,4,1,1,1,2,2,2,2,2,2,3,3,3,3,3]
  ]
};
var player = {
    x: 22, 
    y: 11.5, 
    dirX: -1,
    dirY: 0,
};
var camera = {
    planeX: 0,
    planeY: 0.66
};
var texWidth = 256;
var texHeight = 256;
var textures = [];
var buffer;
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
        lineHeight, brightness,
        wallX, texX, texNum, 
        drawStart, drawEnd;
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    ctx.fillStyle = world.ceilColor; //ceiling
    ctx.fillRect(0,0,canvasWidth,canvasHeight / 2);
    ctx.fillStyle = world.floorColor; //floor
    ctx.fillRect(0,canvasHeight / 2,canvasWidth,canvasHeight - 1);
    buffer = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    for (var x = 0; x < canvasWidth; x++) {
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
            Math.abs((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) 
            :
            Math.abs((mapY - rayPosY + (1 - stepY) / 2) / rayDirY);
        lineHeight = parseInt(Math.abs(canvasHeight / perpWallDist));
        drawStart = parseInt(Math.max(0, -lineHeight / 2 + canvasHeight / 2));
        drawEnd = parseInt(Math.min(canvasHeight, lineHeight / 2 + canvasHeight / 2));
        mapTile = world.map[mapX][mapY];
        texNum = mapTile - 1;
        wallX = (side === 1) ?
            rayPosX + ((mapY - rayPosY + (1 - stepY) / 2) / rayDirY) * rayDirX
            :
            rayPosY + ((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) * rayDirY;
        wallX -= Math.floor((wallX));
        texX = parseInt(wallX * texWidth);
        if(side === 0 && rayDirX > 0) {
            texX = texWidth - texX - 1;
        }
        if(side === 1 && rayDirY < 0) {
            texX = texWidth - texX - 1;
        }
          for(var y = drawStart; y < drawEnd; y++) {
            
            var d = y * 256 - canvasHeight * 128 + lineHeight * 128;  //256 and 128 factors to avoid floats
            var texY = parseInt(((d * texHeight) / lineHeight) / 256);
            var texOffset = (texWidth * texY + texX) * 4;
            var r = textures[texNum][texOffset];
            var g = textures[texNum][texOffset + 1];
            var b = textures[texNum][texOffset + 2];
            if (side === 1) {
                r = parseInt(r / 2);
                g = parseInt(g / 2);
                b = parseInt(b / 2);
            }
            brightness = Math.min(1, 1/perpWallDist * 3);
            r = parseInt(r * brightness);
            g = parseInt(g * brightness);
            b = parseInt(b * brightness);
            var canvasOffset = (x + y * buffer.width) * 4;
            buffer.data[canvasOffset + 0] = r;
            buffer.data[canvasOffset + 1] = g;
            buffer.data[canvasOffset + 2] = b;
            buffer.data[canvasOffset + 3] = 255;
          }
      }
    ctx.putImageData(buffer, 0, 0);
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


var init = function () {
    textures[0] = new Image();
    textures[1] = new Image();
    textures[2] = new Image();
    textures[3] = new Image();
    textures[4] = new Image();
    textures[5] = new Image();
    textures[6] = new Image();
    textures[7] = new Image();
    textures[0].onload = isLoaded;
    textures[1].onload = isLoaded;
    textures[2].onload = isLoaded;
    textures[3].onload = isLoaded;
    textures[4].onload = isLoaded;
    textures[5].onload = isLoaded;
    textures[6].onload = isLoaded;
    textures[7].onload = isLoaded;
    textures[0].src = 'i/m-001.png';
    textures[1].src = 'i/m-009.png';
    textures[2].src = 'i/m-017.png';
    textures[3].src = 'i/m-023.png';
    textures[4].src = 'i/m-027.png';
    textures[5].src = 'i/m-029.png';
    textures[6].src = 'i/m-030.png';
    textures[7].src = 'i/m-040.png';
};
var curResources = 0;
var isLoaded = function () {
    curResources++;
    console.log("Loaded resource! Total: " + curResources);
    if(curResources == 8) {
        console.log("All loaded up! Moving on!");
        setup();
    }
};

var setup = function () {
    var canvas = document.createElement('canvas');
    canvas.width = texWidth;
    canvas.height = texHeight;
    var ctx    = canvas.getContext('2d');
    for (var i = 0; i < textures.length; i++) {
        ctx.drawImage(textures[i], 0, 0 );
        var imgdata = ctx.getImageData(0,0,texWidth,texHeight);
        textures[i] = imgdata.data;
    console.log("Preparing Texture: " + i);
    }
    console.log("Textures ready!");
    main();
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
init();

}(canvas));