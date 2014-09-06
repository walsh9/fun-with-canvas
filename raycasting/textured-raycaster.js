var TexturedRaycaster = function () {
    var options =  {
        pleaseDoShading: true
    };
    var textures = [];
    var textures32 = [];
    var texWidth = 256;
    var texHeight = 256;
    var ctx, w, h;
    var imageData, buffer, buffer8, buffer32;
    var init = function (context, callback) {
        ctx = context;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
        imageData = ctx.createImageData(w, h);
        buffer = new ArrayBuffer(w * h * 4);
        buffer8 = new Uint8ClampedArray(buffer);
        buffer32 = new Uint32Array(buffer);
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
                var imageData = ctx.getImageData(0,0,texWidth,texHeight);
                textures[i] = imageData.data;
                textures32[i] = new Uint32Array(imageData.data.buffer);
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
    var shadeColor = (function () {
        var buf = new ArrayBuffer(4);
        var col32 = new Uint32Array(buf);
        var col8 = new Uint8ClampedArray(buf);
        return function (color32, darkness) {
            col32[0] = color32;
            col8[0] *= darkness;
            col8[1] *= darkness;
            col8[2] *= darkness;
            return /*r*/ col8[0] | /*g*/ col8[1] << 8 | /*b*/ col8[2] << 16 | /*a*/ 255 << 24;
        };
    }());
    var debugText = function (text) {
        ctx.fillStyle = "#ffffff";
        ctx.font      = "normal 10px Verdana";
        ctx.fillText(text, 10, 20);
    };
    var drawWalls = function(viewer, map) {
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
            wallX, texX, texture32, color,
            drawStart, drawEnd,
            d, texY, texOffset, r, g, b;
        for (var x = 0; x < w; x++) {
            cameraX = 2 * x / w - 1;
            rayPosX = viewer.x;
            rayPosY = viewer.y;
            rayDirX = viewer.dirX + viewer.planeX * cameraX;
            rayDirY = viewer.dirY + viewer.planeY * cameraX;
            mapX = Math.floor(rayPosX);
            mapY = Math.floor(rayPosY);
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
            lineHeight = Math.floor(Math.abs(h / perpWallDist));
            drawStart = Math.floor(Math.max(0, -lineHeight / 2 + h / 2));
            drawEnd = Math.floor(Math.min(h, lineHeight / 2 + h / 2));
            mapTile = map[mapX][mapY];
            texture32 = textures32[mapTile - 1];
            wallX = (side === 1) ?
                rayPosX + ((mapY - rayPosY + (1 - stepY) / 2) / rayDirY) * rayDirX
                :
                rayPosY + ((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) * rayDirY;
            wallX -= Math.floor((wallX));
            texX = Math.floor(wallX * texWidth);
            if(side === 0 && rayDirX > 0) {
                texX = texWidth - texX - 1;
            }
            if(side === 1 && rayDirY < 0) {
                texX = texWidth - texX - 1;
            }
            //drawwalls
            for(var y = drawStart; y < drawEnd; y++) {     
                d = y * 256 - h * 128 + lineHeight * 128;  //256 and 128 factors to avoid floats
                texY = Math.floor(((d * texHeight) / lineHeight) / 256);
                color = texture32[texX + texY * texWidth];
                if (side === 1) {
                    color = shadeColor(color, 0.5);
                }
                if (options.pleaseDoShading) {
                    brightness = Math.min(1, 1/perpWallDist * 3);
                    color = shadeColor(color, brightness);
                }
                buffer32[x + y * w] = color;
            }
            //drawceiling
            for(y = 0; y < drawStart + 1; y++) {
                buffer32[x + y * w] = /*r*/ 60 | /*g*/ 60 << 8 | /*b*/ 80 << 16 | /*a*/ 255 << 24;
            }
            //drawfloor
            for(y = drawEnd; y < h; y++) {
                buffer32[x + y * w] = /*r*/ 90 | /*g*/ 90 << 8 | /*b*/ 90 << 16 | /*a*/ 255 << 24;
            }
        } // for x
    imageData.data.set(buffer8);
    ctx.putImageData(imageData, 0, 0);
    };
    var drawScene = function (viewer, map) {
        drawWalls(viewer, map);
    };
    return {
        init:       init,
        setOptions: setOptions,
        drawScene:  drawScene,
        debugText:  debugText
    };
}();