/*  Canvas plasma generator based on
 *  http://lodev.org/cgtutor/plasma.html
 *
 */

(function (canvas) {
var w = canvas.width;
var h = canvas.height;
var ctx = canvas.getContext("2d");

var render = function () {
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
                Math.sqrt(((x - w / 2) * (x - w / 2) + (y - h / 2) * (y - h / 2))) / 
                s)));
        },
        function (x, y, s) {
            return 128 + (128 * Math.sin(Math.sqrt((x * x + y * y)) / s));
        },
        function (x, y, s) {
            return 128 + (128 * Math.sin(Math.sqrt(((x - mouseX % w) * (x - mouseX % w) + (y - mouseY % h) * (y - mouseY % h))) / s));
        },
        function (x, y, s) {
            return (128 + (128 * Math.sin(
                Math.sqrt(((x - w / 2) * (x - w / 2) + (y - h / 2) * (y - h / 2))) / 
                s)));
        },
    ];
    var imgData = ctx.createImageData(w, h);
    var palette = [];
    var rx = Math.pow(2, parseInt(Math.random() * 9)); //factors of 256 will loop nice
    var gx = Math.pow(2, parseInt(Math.random() * 9));
    var bx = Math.pow(2, parseInt(Math.random() * 9));
    var s = parseInt(Math.random() * 120 + 8);
    for(var i = 0; i < 256; i++) {
        var r = parseInt(128 + 128 * Math.sin(3.1415 * i / rx ));
        var g = parseInt(128 + 128 * Math.sin(3.1415 * i / gx ));
        var b = parseInt(128 + 128 * Math.sin(3.1415 * i / bx ));
        palette.push([r,g,b]);
    }
    var paletteOffset = 0;
    return function () {
        plasmas = [plasmaFn[0], plasmaFn[1], plasmaFn[5]];
        for(var x = 0; x < w; x++) {
            for(var y = 0; y < h; y++) {
                var c = 0;
                for (var p = 0; p < plasmas.length; p++) {
                          c += plasmas[p](x, y, s);
                }
                c = parseInt(c / plasmas.length);
                color = palette[(c + paletteOffset) % 255];
                var offset = (x + y * w) * 4;
                imgData.data[offset + 0] = color[0];
                imgData.data[offset + 1] = color[1];
                imgData.data[offset + 2] = color[2];
                imgData.data[offset + 3] = 255; //opaque
        }
                  }
                  paletteOffset++; 
        ctx.putImageData(imgData, 0, 0);
    };
};

var requestAnimationFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.oRequestAnimationFrame;

var keysDown = {};
var mouseX = 0;
var mouseY = 0;

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

canvas.addEventListener("mousemove", function (e) {
        e = e || window.event; // IE-ism
        mouseX = e.clientX;
        mouseY = e.clientY;
}, false);

canvas.addEventListener("click", function (e) {
    draw = render();
}, false);

var update = function(modifier) {
    if (38 in keysDown) { // up

    }
    if (40 in keysDown) { // down

    }
    if (39 in keysDown) { // right

    }
    if (37 in keysDown) { // left

    }
};
var draw = render();

var main = function () {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    draw();
    then = now;
    requestAnimationFrame(main);
};
var then = Date.now();
main();

}(canvas));