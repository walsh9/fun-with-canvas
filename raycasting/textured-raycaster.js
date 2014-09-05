/*  Canvas implementation of raycaster based on examples at
 *  http://lodev.org/cgtutor/raycasting.html and
 *  http://www.permadi.com/tutorial/raycast/index.html
 *
 *  Public Domain textures from rubberduck
 *  http://opengameart.org/content/40-free-metal-textures-from-mtc-sets
 */

var TexturedRaycaster = function () {
    var options =  {
        pleaseDoShading: true
    };
    var textures = [];
    var texWidth = 256;
    var texHeight = 256;
    var init = function (callback) {
        var textureList = [
            'i/m-001.png',
            'i/m-017.png',
            'i/m-023.png',
            'i/m-027.png',
            'i/m-029.png',
            'i/m-030.png',
            'i/m-040.png'
        ];
        var loadedResources = 0;
        var resourceLoaded = function () {
            loadedResources++;
            console.log("Loaded resource. Total: " + loadedResources);
            if(loadedResources == textureList.length) {
                console.log("All resouces loaded.");
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
            callback();
        };
        for (var i = 0; i < textureList.length; i ++) {
            textures[i] = new Image();
            textures[i].onload = resourceLoaded;
            textures[i].src = textureList[i];
        }
    };
    var setOptions = function (newOptions) {
        for (var key in newOptions) {
            if (key in options) {
                options[key] = newOptions[key];
            }
        }
    };
    var drawCeiling = function(ctx, w, h) {
        var color = "rgb(60, 60, 80)";
        ctx.fillStyle = color; 
        ctx.fillRect(0.5,0.5,w,h);
    };
    var drawFloor = function(ctx, w, h) {
        var color = "rgb(90, 90, 90)";
        ctx.fillStyle = color; 
        ctx.fillRect(0.5, h / 2 - 0.5, w, h);
    };
    var shadeColor = function(color, distance) {
        var brightness = Math.min(1, 1/distance * 6);
        color[0] = parseInt(color[0] * brightness);
        color[1] = parseInt(color[1] * brightness);
        color[2] = parseInt(color[2] * brightness);
        return color;
    };
    var debugText = function (ctx, text) {
        ctx.fillStyle = "#ffffff";
        ctx.font      = "normal 10px Verdana";
        ctx.fillText(text, 10, 20);
    };
    var getWallColor = function ( ){

    };
    var drawWalls = function(viewer, map, ctx, w, h) {
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
    buffer = ctx.getImageData(0, 0, w, h);
    for (var x = 0; x < w; x++) {
        cameraX = 2 * x / w - 1;
        rayPosX = viewer.x;
        rayPosY = viewer.y;
        rayDirX = viewer.dirX + viewer.planeX * cameraX;
        rayDirY = viewer.dirY + viewer.planeY * cameraX;
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
            if (map[mapX][mapY] > 0) hit = 1;
        }
        perpWallDist = (side === 0) ?
            Math.abs((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) 
            :
            Math.abs((mapY - rayPosY + (1 - stepY) / 2) / rayDirY);
        lineHeight = parseInt(Math.abs(h / perpWallDist));
        drawStart = parseInt(Math.max(0, -lineHeight / 2 + h / 2));
        drawEnd = parseInt(Math.min(h, lineHeight / 2 + h / 2));
        mapTile = map[mapX][mapY];
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
            var d = y * 256 - h * 128 + lineHeight * 128;  //256 and 128 factors to avoid floats
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
            if (options.pleaseDoShading) {
                brightness = Math.min(1, 1/perpWallDist * 3);
                r = parseInt(r * brightness);
                g = parseInt(g * brightness);
                b = parseInt(b * brightness);
            }
            var canvasOffset = (x + y * buffer.width) * 4;
            buffer.data[canvasOffset + 0] = r;
            buffer.data[canvasOffset + 1] = g;
            buffer.data[canvasOffset + 2] = b;
            buffer.data[canvasOffset + 3] = 255;
          }
      }
    ctx.putImageData(buffer, 0, 0);
    };
    var drawScene = function (ctx, viewer, map) {
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
        ctx.clearRect(0, 0, w, h);
        drawCeiling(ctx, w, h);
        drawFloor(ctx, w, h);
        drawWalls(viewer, map, ctx, w, h);
    };
    return {
        init:       init,
        setOptions: setOptions,
        drawScene:  drawScene,
        debugText:  debugText
    };
}();