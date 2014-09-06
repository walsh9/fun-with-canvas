var UntexturedRaycaster = function(){
    var options =  {
        pleaseDoShading: true
    };
    var init = function (context, callback){
        ctx = context;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
        // no resources to load
        callback();
    };
    var setOptions = function (newOptions) {
        for (var key in newOptions) {
            if (key in options) {
                options[key] = newOptions[key];
            }
        }
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
    var debugText = function (text) {
        ctx.fillStyle = "#ffffff";
        ctx.font      = "normal 10px Verdana";
        ctx.fillText(text, 10, 20);
    };
    var drawCeiling = function() {
        var color = "rgb( 83, 83, 101)";
        ctx.fillStyle = color; 
        ctx.fillRect(0.5, 0.5, w, h);
    };
    var drawFloor = function() {
        var color = "rgb(121,121,174)";
        ctx.fillStyle = color; 
        ctx.fillRect(0.5, h / 2 - 0.5, w, h);
    };
    var drawWalls = function (viewer, map) {
        var perpWallDist, lineHeight, drawStart, drawEnd, colorRGB, oldColor, color;
        ctx.beginPath();
        for (var x = 0.5; x < w; x++) {
            var cameraX = 2 * x / w - 1,
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
            lineHeight = Math.abs(parseInt(h / perpWallDist));
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
    var drawScene = function (viewer, map) {
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
        ctx.clearRect(0, 0, w, h);
        drawCeiling();
        drawFloor();
        drawWalls(viewer, map);
        ctx.restore();
    };
    return {
        init:       init,
        setOptions: setOptions,
        drawScene:  drawScene,
        debugText:  debugText
    };
}();
