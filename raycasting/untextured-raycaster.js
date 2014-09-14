var UntexturedRaycaster = (function () {
    'use strict';
    var map, ctx, w, h;
    var wallColors, floorColor, ceilingColor;
    var options = {
        pleaseDoShading: true
    };
    var init = function (context, stage) {
        ctx = context;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
        map = stage.map;
        wallColors = stage.colors.walls;
        floorColor = stage.colors.floor;
        ceilingColor = stage.colors.ceiling;
        // no resources to load
    };
    var setOptions = function (newOptions) {
        var key;
        for (key in newOptions) {
            if (newOptions.hasOwnProperty(key) && options[key] !== undefined) {
                options[key] = newOptions[key];
            }
        }
    };
    var getWallColor = function (tile, side) {
        var color = [];
        if (tile > 0 && tile < wallColors.length) {
            color = wallColors[tile].slice(0);
        } else {
            color = wallColors[0].slice(0);
        }
        if (side === 1) {
            color[0] = Math.floor(color[0] / 2);
            color[1] = Math.floor(color[1] / 2);
            color[2] = Math.floor(color[2] / 2);
        }
        return color;
    };
    var shadeColor = function (color, distance) {
        var brightness = Math.min(1, 1 / distance * 6);
        color[0] = Math.floor(color[0] * brightness);
        color[1] = Math.floor(color[1] * brightness);
        color[2] = Math.floor(color[2] * brightness);
        return color;
    };
    var debugText = function (text) {
        ctx.fillStyle = "#ffffff";
        ctx.font      = "normal 10px Verdana";
        ctx.fillText(text, 10, 20);
    };
    var drawCeiling = function () {
        ctx.fillStyle = ceilingColor;
        ctx.fillRect(0.5, 0.5, w, h);
    };
    var drawFloor = function () {
        ctx.fillStyle = floorColor;
        ctx.fillRect(0.5, h / 2 - 0.5, w, h);
    };
    var drawWalls = function (viewer) {
        var perpWallDist, lineHeight, drawStart, drawEnd, colorRGB, oldColor, color, side;
        var x;
        ctx.beginPath();
        for (x = 0.5; x < w; x++) {
            var cameraX = 2 * x / w - 1,
                rayPosX = viewer.x,
                rayPosY = viewer.y,
                rayDirX = viewer.dirX + viewer.planeX * cameraX,
                rayDirY = viewer.dirY + viewer.planeY * cameraX,
                mapX = Math.floor(rayPosX),
                mapY = Math.floor(rayPosY),
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
                if (map[mapX][mapY] > 0) {
                    hit = 1;
                }
            }
            perpWallDist = (side === 0) ?
                Math.abs((mapX - rayPosX + (1 - stepX) / 2) / rayDirX) 
                :
                Math.abs((mapY - rayPosY + (1 - stepY) / 2) / rayDirY);
            lineHeight = Math.abs(Math.floor(h / perpWallDist));
            drawStart = Math.max(0, -lineHeight / 2 + h / 2);
            drawEnd = Math.min(h - 1, lineHeight / 2 + h / 2);
            colorRGB = getWallColor(map[mapX][mapY], side);
            if (options.pleaseDoShading) {
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
    var drawScene = function (viewer) {
        ctx.save();
        ctx.lineCaps = "square";
        ctx.clearRect(0, 0, w, h);
        drawCeiling();
        drawFloor();
        drawWalls(viewer);
        ctx.restore();
    };
    return {
        init:       init,
        setOptions: setOptions,
        drawScene:  drawScene,
        debugText:  debugText
    };
}());
