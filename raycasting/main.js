/***********************************************
 *  Useful resources and references
 ***********************************************
 *  http://lodev.org/cgtutor/raycasting.html 
 *  http://www.permadi.com/tutorial/raycast/index.html
 *  http://gafferongames.com/game-physics/fix-your-timestep/
 *  https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
 *
 *  Public Domain textures from rubberduck
 *  http://opengameart.org/content/40-free-metal-textures-from-mtc-sets
 */

(function (canvas) {
    'use strict';
    var options =  {
        pleaseShowFps: false,
        pleaseDoShading: true
    };
    var createMap = function (stage) {
        var map = new ROT.Map.Digger(stage.width, stage.height, {dugPercentage: 0.4});
        var mapArray = [];
        var i, j, k, rooms, room, color;
        for (i = 0; i < stage.height; i++) {
            mapArray.push([]);
        }
        map.create(function (x, y, wall) {
            mapArray[x][y] = wall ? 1 : 0;
        });
        rooms = map.getRooms();
        for (i = 0; i < rooms.length; i++) {
            color = Math.floor(ROT.RNG.getUniform() * (stage.textures.list.length - 1) + 1);
            room = rooms[i];
            for (j = room.getLeft() - 1; j <= room.getRight() + 1; j++) {
                for (k = room.getTop() - 1; k <= room.getBottom() + 1; k++) {
                    if (mapArray[j][k] !== 0) {
                        mapArray[j][k] = color;
                    }
                }
            }
        }
        return mapArray;
    };
    var placeInEmptySpace = function (entity, stage) {
        var x, y;
        do {
            x = Math.floor(Math.random() * stage.width);
            y = Math.floor(Math.random() * stage.height);
        } while (stage.map[x][y] !== 0);
        entity.x = x + 0.5;
        entity.y = y + 0.5;
    };
    var renderer = TexturedRaycaster;
    var stopRender = false;
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var ctx = canvas.getContext("2d");
    var stage1 = {};
    stage1.width = 100;
    stage1.height = 100;
    stage1.textures = {};
    stage1.colors = {};
    stage1.textures.height = 256;
    stage1.textures.width = 256;
    stage1.textures.list = [
        'i/m-001.png',
        'i/m-017.png',
        'i/m-023.png',
        'i/m-027.png',
        'i/m-029.png',
        'i/m-030.png',
        'i/m-040.png'
    ];
    stage1.textures.ceiling = 0;
    stage1.textures.floor = 1;
    stage1.colors.walls = [
        [255,255,255], // default 
        [255,220,116], // 1
        [153,229,104], // 2
        [228,104,148], // 3
        [102,102,190]  // 4
    ];
    stage1.map = createMap(stage1);
    stage1.colors.ceiling = "rgb( 83, 83, 101)";
    stage1.colors.floor = "rgb(121,121,174)";
    var currentStage = stage1;
    var player = {
        x: 22,
        y: 12,
        dirX: -1,
        dirY: 0,
        planeX: 0,
        planeY: 0.67
    };
    placeInEmptySpace(player, currentStage);
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
    var actions = {
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
            var oldDirX, oldPlaneX;
            oldDirX = actor.dirX;
            actor.dirX = actor.dirX * Math.cos(rotSpeed) - actor.dirY * Math.sin(rotSpeed);
            actor.dirY = oldDirX * Math.sin(rotSpeed) + actor.dirY * Math.cos(rotSpeed);
            oldPlaneX = actor.planeX;
            actor.planeX = actor.planeX * Math.cos(rotSpeed) - actor.planeY * Math.sin(rotSpeed);
            actor.planeY = oldPlaneX * Math.sin(rotSpeed) + actor.planeY * Math.cos(rotSpeed);
        },
        toggleOption: function (optionName) {
            options[optionName] = !options[optionName];
            renderer.setOptions(options);
        },
        swapRenderer: function() {
            stopRender = true;
            if (renderer == UntexturedRaycaster) {
                renderer = TexturedRaycaster;
            } else {
                renderer = UntexturedRaycaster;
            }
            stopRender = false;
            renderer.setOptions(options);
            renderer.init(ctx, currentStage);
        }
    };
    var update = function(time) {
        var moveSpeed =  time * 5;
        var rotSpeed =  time * 3;
        if (38 in keysDown) { // up
            actions.moveForward(player, currentStage.map, moveSpeed);
        }
        if (40 in keysDown) { // down
            actions.moveBackward(player, currentStage.map, moveSpeed);
        }
        if (39 in keysDown) { // right
            actions.turnRight(player, rotSpeed);
        }
        if (37 in keysDown) { // left
            actions.turnLeft(player, rotSpeed);
        }
        if (70 in keysDown) { // f
          actions.toggleOption("pleaseShowFps");
          delete keysDown[70];
        }
        if (83 in keysDown) { // s
          actions.toggleOption("pleaseDoShading");
          delete keysDown[83];
        }
        if (84 in keysDown) { // t
          actions.swapRenderer();
          delete keysDown[84];
        }
    };

    var runTime = 0;
    var timeStep = 1 / 30; 
    var currentTime = Date.now();
    var main = function () {
            var newTime = Date.now();
            var frameTime = newTime - currentTime;
            var fps =  1000 / frameTime;
            currentTime = newTime;
            while (frameTime > 0) {
                var delta = Math.min(frameTime, timeStep);
                update(delta / 1000);
                frameTime -= delta;
                runTime += delta;
            }
            renderer.drawScene(player);
            if (options.pleaseShowFps) {
                renderer.debugText(fps.toFixed(2) + " fps");
            }
        if (!stopRender) {
            requestAnimationFrame(main, canvas);
        }
    };
    renderer.init(ctx, currentStage).then(main);
}(canvas));