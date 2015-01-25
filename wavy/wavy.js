(function () {
    "use strict";
    var textcanvas = document.getElementById("textcanvas");
    var scrollcanvas = document.getElementById("scrollcanvas");
    var w = scrollcanvas.width;
    var h = scrollcanvas.height;
    var textctx = textcanvas.getContext("2d");
    var scrollctx = scrollcanvas.getContext("2d");
    var xoffset = 0;
    var updateText = function() {
        var message = document.getElementById("message").value; 
        textctx.font = "bold 100px impact";
        textcanvas.width = Math.floor(textctx.measureText(message).width) + w * 2;
        textctx.fillStyle = "rgba(0, 0, 0, 0)";
        textctx.fillRect(0, 0, textcanvas.width, textcanvas.height);
        textctx.fillStyle = "#eeeeee";
        textctx.font = "bold 100px impact";
        textctx.fillText(message, w, 150); 
    };
    var palette;
    var randomizePalette = function () {
        palette = [];
        var rx = Math.pow(2, Math.floor(Math.random() * 4) + 5); //factors of 256 will loop nice
        var gx = Math.pow(2, Math.floor(Math.random() * 4) + 5);
        var bx = Math.pow(2, Math.floor(Math.random() * 4) + 5);
        var i, r, g, b;
        for (i = 0; i < 512; i++) {
            r = Math.floor(128 + 128 * Math.sin(3.1415 * i / rx));
            g = Math.floor(128 + 128 * Math.sin(3.1415 * i / gx));
            b = Math.floor(128 + 128 * Math.sin(3.1415 * i / bx));
            palette.push([r, g, b]);
        }
    };
    var init = function() {
        document.getElementById("message").addEventListener("change", updateText, false);
        document.getElementById("palette").addEventListener("click", randomizePalette, false);
        randomizePalette();
        updateText();       
    };
    var draw = function () {
        var realxoffset = Math.floor(xoffset) % (textcanvas.width - w);
        var sourceData = textctx.getImageData(realxoffset, 0, w, h).data;
        var scrollData = scrollctx.createImageData(w, h);
        var freq = document.getElementById('freq').value;
        var amp = document.getElementById('amp').value;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var yoffset = Math.floor((amp * 2 * Math.sin(x / freq)) - amp);
                var point = (x + y * w) * 4;
                if (y + yoffset > 0 && y + yoffset < scrollcanvas.height) {
                    scrollData.data[point + 0] = (sourceData[point + yoffset * w * 4 + 0] === 0) ? 
                        scrollData.data[point + 2] : 
                        palette[y % 255][0];
                    scrollData.data[point + 1] = (sourceData[point + yoffset * w * 4 + 1] === 0) ? 
                        scrollData.data[point + 2] : 
                        palette[y % 255][1];
                    scrollData.data[point + 2] = (sourceData[point + yoffset * w * 4 + 2] === 0) ? 
                        scrollData.data[point + 2] : 
                        palette[y % 255][2];
                    scrollData.data[point + 3] = 255; //opaque
                }
                else { 
                    scrollData.data[point + 3] = 255; //opaque
                }
            }
        }
        scrollctx.putImageData(scrollData, 0, 0);
    };
    var timeStep = (1 / 60) * 1000;
    var update = function (delta) {
    var speed = document.getElementById("speed").value;
        var step = ((delta * 60) / 1000) * speed;
        xoffset += step;
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
    init();
    main();
}());