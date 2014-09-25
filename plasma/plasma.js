/*  Canvas plasma generator based on
 *  http://lodev.org/cgtutor/plasma.html
 *
 */

(function (canvas) {
    'use strict';
    var w = canvas.width;
    var h = canvas.height;
    var ctx = canvas.getContext("2d");
    // var keysDown = {};
    var mouseX = 0;
    var mouseY = 0;
    var paletteOffset = 0;

    /*jslint unparam: true*/
    var plasmaFn = [
        function (x, y, s) {
            return 128 + (128 * Math.sin(x / s));
        },
        function (x, y, s) {
            return 128 + (128 * Math.sin(y / s));
        },
        function (x, y, s) {
            return 128 + (128 * Math.sin((x + y) / s));
        },
        function (x, y, s) {
            return (128 + (128 * Math.sin(
                Math.sqrt(((x - w / 2) * (x - w / 2) + (y - h / 2) * (y - h / 2))) / s
            )));
        },
        function (x, y, s) {
            return 128 + (128 * Math.sin(Math.sqrt((x * x + y * y)) / s));
        },
        function (x, y, s) {
            return 128 + (128 * Math.sin(Math.sqrt(((x - mouseX % w) * (x - mouseX % w) + (y - mouseY % h) * (y - mouseY % h))) / s));
        },
        function (x, y, s) {
            return (128 + (128 * Math.sin(
                Math.sqrt(((x - w / 2) * (x - w / 2) + (y - h / 2) * (y - h / 2))) / s
            )));
        },
    ];
    /*jslint unparam: false*/

    var render = function () {
        var imgData = ctx.createImageData(w, h);
        var palette = [];
        var rx = Math.pow(2, Math.floor(Math.random() * 9)); //factors of 256 will loop nice
        var gx = Math.pow(2, Math.floor(Math.random() * 9));
        var bx = Math.pow(2, Math.floor(Math.random() * 9));
        var s = Math.floor(Math.random() * 120 + 8);

        var i, r, g, b, plasmas;
        for (i = 0; i < 256; i++) {
            r = Math.floor(128 + 128 * Math.sin(3.1415 * i / rx));
            g = Math.floor(128 + 128 * Math.sin(3.1415 * i / gx));
            b = Math.floor(128 + 128 * Math.sin(3.1415 * i / bx));
            palette.push([r, g, b]);
        }
        return function () {
            var x, y, c,
                p, color, offset;
            plasmas = [plasmaFn[0], plasmaFn[1], plasmaFn[5]];
            for (x = 0; x < w; x++) {
                for (y = 0; y < h; y++) {
                    c = 0;
                    for (p = 0; p < plasmas.length; p++) {
                        c += plasmas[p](x, y, s);
                    }
                    c = Math.floor(c / plasmas.length);
                    color = palette[(c + Math.floor(paletteOffset)) % 255];
                    offset = (x + y * w) * 4;
                    imgData.data[offset + 0] = color[0];
                    imgData.data[offset + 1] = color[1];
                    imgData.data[offset + 2] = color[2];
                    imgData.data[offset + 3] = 255; //opaque
                }
            }
            ctx.putImageData(imgData, 0, 0);
        };
    };
    var draw = render();

    var requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame;

    canvas.addEventListener("mousemove", function (e) {
        e = e || window.event; // IE-ism
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, false);

    canvas.addEventListener("click", function (e) {
        draw = render();
    }, false);

    var timeStep = (1 / 60) * 1000;
    var speed = 0.3333333333;
    var update = function (delta) {
        var step = ((delta * 60) / 1000) * speed;
        paletteOffset += step;
    };

    var currentTime = Date.now();
    var main = function () {
        var newTime = Date.now();
        var frameTime = newTime - currentTime;
        var delta;
        currentTime = newTime;
        while (frameTime > 0) {
            delta = Math.min(frameTime, timeStep);
            update(delta);
            frameTime -= delta;
        }
        draw();
        requestAnimationFrame(main);
    };

    main();
}(canvas));