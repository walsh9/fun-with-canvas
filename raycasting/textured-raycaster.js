var TexturedRaycaster = (function () {
    'use strict';
    /*globals Promise, Uint32Array, ArrayBuffer, Uint8ClampedArray*/
    var options =  {
        pleaseDoShading: true
    };
    var map;
    var textures = [];
    var textures32 = [];
    var texWidth = 256;
    var texHeight = 256;
    var ctx, w, h, ceilingTex, floorTex;
    var imageData, buffer, buffer8, buffer32;
    var loadImage = function (src) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function () {
                console.log("Image loaded: " + src);
                resolve(image);
            };
            image.onerror = function () {
                reject("Failed Loading Image: " + src);
            };
            image.src = src;
        });
    };
    var loadImages = function (filenames) {
        return Promise.all(filenames.map(loadImage));
    };
    var imageToImageData = function (image) {
        var myCanvas = document.createElement('canvas');
        var myContext = myCanvas.getContext('2d');
        myCanvas.width = texWidth;
        myCanvas.height = texHeight;
        myContext.drawImage(image, 0, 0);
        var myImageData = myContext.getImageData(0, 0, texWidth, texHeight);
        return myImageData.data;
    };
    var imagesToImageData = function (images) {
        return Promise.all(images.map(imageToImageData));
    };
    var stuffTextureArrays = function (imgDataArray) {
        var i;
        for (i = 0; i < imgDataArray.length; i++) {
            textures[i] = imgDataArray[i];
            textures32[i] = new Uint32Array(imgDataArray[i].buffer);
            console.log("Preparing Texture: " + i);
        }
    };
    var init = function (context, stage) {
        ctx = context;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
        imageData = ctx.createImageData(w, h);
        buffer = new ArrayBuffer(w * h * 4);
        buffer8 = new Uint8ClampedArray(buffer);
        buffer32 = new Uint32Array(buffer);
        map = stage.map;
        texHeight = stage.textures.height;
        texWidth = stage.textures.width;
        ceilingTex = stage.textures.ceiling;
        floorTex = stage.textures.floor;
        return loadImages(stage.textures.list)
            .then(imagesToImageData)
            .then(stuffTextureArrays);
    };
    var setOptions = function (newOptions) {
        var key;
        for (key in newOptions) {
            if (newOptions.hasOwnProperty(key) && options[key] !== undefined) {
                options[key] = newOptions[key];
            }
        }
    };
    var shadeColor = (function () {
        // prepare buffers once;
        var buf = new ArrayBuffer(4);
        var col32 = new Uint32Array(buf);
        var col8 = new Uint8ClampedArray(buf);
        return function (color32, brightness) {
            if (options.pleaseDoShading && brightness < 0.9) {
                col32[0] = color32;
                col8[0] *= brightness;
                col8[1] *= brightness;
                col8[2] *= brightness;
                /*jslint bitwise: true */
                return col8[0] /*r*/ | col8[1] /*g*/ << 8 | col8[2] /*b*/ << 16 | 255 /*a*/ << 24;
                /* jslint bitwise: false */
            }
            return color32;
        };
    }());
    var debugText = function (text) {
        ctx.fillStyle = "#ffffff";
        ctx.font      = "normal 10px Verdana";
        ctx.fillText(text, 10, 20);
    };
    var drawWallColumn = function (x, texX, height, dist, side, texture32) {
        var startY = Math.floor(Math.max(0, -height / 2 + h / 2));
        var endY = Math.floor(Math.min(h, height / 2 + h / 2));
        var y, d, texY;
        for (y = startY; y < endY; y++) {
            d = y * 256 - h * 128 + height * 128;  //256 and 128 factors to avoid floats
            texY = Math.floor(((d * texHeight) / height) / 256);
            buffer32[x + y * w] = shadeColor(texture32[texX + texY * texWidth],  Math.min(1, (1 / dist * 3) * (side / -2 + 1)));
        }
    };
    var drawFloorColumn = function (x, viewer, distWall, distPlayer, height, floorXWall, floorYWall, floorTex32, ceilingTex32) {
        var currentDist, weight, currentFloorX, currentFloorY, floorTexX, floorTexY;
        var startY = Math.floor(Math.min(h, height / 2 + h / 2));
        var y;
        var viewX = viewer.x;
        var viewY = viewer.y;
        for (y = startY; y < h; y++) {
            currentDist = h / (2 * y - h);
            weight = (currentDist - distPlayer) / (distWall - distPlayer);
            currentFloorX = weight * floorXWall + (1 - weight) * viewX;
            currentFloorY = weight * floorYWall + (1 - weight) * viewY;
            floorTexX = Math.floor(currentFloorX * texWidth) % texWidth;
            floorTexY = Math.floor(currentFloorY * texHeight) % texHeight;
            buffer32[x + y * w] = shadeColor(floorTex32[floorTexX + floorTexY * texWidth], 1 / currentDist * 3); // floor
            buffer32[x + (h - y) * w] = shadeColor(ceilingTex32[floorTexX + floorTexY * texWidth],  1 / currentDist * 3); // ceiling
        }
    };
    var drawColumns = function (viewer) {
        var cameraX, rayPosX, rayPosY, rayDirX, rayDirY, mapX, mapY,
            deltaDistX, deltaDistY, hit, stepX, stepY, sideDistX, sideDistY, side,
            mapTile, texture32, perpWallDist, lineHeight, wallX, texX,
            ceilingTex32, floorTex32, floorXWall, floorYWall,
            x;
        for (x = 0; x < w; x++) {
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
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }
                if (map[mapX][mapY] > 0) {
                    hit = 1;
                }
            }
            mapTile = map[mapX][mapY];
            texture32 = textures32[mapTile - 1];
            perpWallDist = (side === 0) ?
                Math.abs((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) :
                Math.abs((mapY - rayPosY + (1 - stepY) / 2) / rayDirY);
            lineHeight = Math.floor(Math.abs(h / perpWallDist));
            wallX = (side === 1) ?
                rayPosX + ((mapY - rayPosY + (1 - stepY) / 2) / rayDirY) * rayDirX :
                rayPosY + ((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) * rayDirY;
            wallX -= Math.floor(wallX);
            texX = Math.floor(wallX * texWidth);
            if (side === 0 && rayDirX > 0) {
                texX = texWidth - texX - 1;
            }
            if (side === 1 && rayDirY < 0) {
                texX = texWidth - texX - 1;
            }
            drawWallColumn(x, texX, lineHeight, perpWallDist, side, texture32);
            ceilingTex32 = textures32[ceilingTex];
            floorTex32 = textures32[floorTex];
            if (side === 0 && rayDirX > 0) {
                floorXWall = mapX;
                floorYWall = mapY + wallX;
            } else if (side === 0 && rayDirX < 0) {
                floorXWall = mapX + 1.0;
                floorYWall = mapY + wallX;
            } else if (side === 1 && rayDirY > 0) {
                floorXWall = mapX + wallX;
                floorYWall = mapY;
            } else {
                floorXWall = mapX + wallX;
                floorYWall = mapY + 1;
            }
            drawFloorColumn(x, viewer, perpWallDist, 0, lineHeight, floorXWall, floorYWall, floorTex32, ceilingTex32);
        } // for x
        imageData.data.set(buffer8);
        ctx.putImageData(imageData, 0, 0);
    };
    var drawScene = function (viewer) {
        drawColumns(viewer);
    };
    return {
        init:       init,
        setOptions: setOptions,
        drawScene:  drawScene,
        debugText:  debugText
    };
}());