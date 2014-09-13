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
    var renderer = TexturedRaycaster;
    var stopRender = false;
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
    var map2 =  [
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
            renderer.init(ctx, main);
        }
    };
    var update = function(time) {
        var moveSpeed =  time * 5;
        var rotSpeed =  time * 3;
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

            renderer.drawScene(player, currentMap, frameTime);
            if (options.pleaseShowFps) {
                renderer.debugText(fps.toFixed(2) + " fps");
            }
        if (!stopRender) {
            requestAnimationFrame(main, canvas);
        }
    };
    renderer.init(ctx).then(main);
}(canvas));