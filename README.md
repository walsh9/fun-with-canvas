# Fun Experiments with HTML Canvas

## [Raycaster](https://walsh9.github.io/fun-with-canvas/raycasting/index.html)
![Raycaster](https://cloud.githubusercontent.com/assets/6074785/6063788/f3408b44-ad27-11e4-9328-35b112efbbd9.png)

A canvas implementation of a raycasting engine.

There are textured and untextured versions.

Random map generation from [rot.js](https://ondras.github.io/rot.js/hp/).

The textured raycaster uses public domain [textures](http://opengameart.org/content/40-free-metal-textures-from-mtc-sets) by rubberduck on [opengameart.org](http://opengameart.org/).

Based on the raycasting pages of [Lode Vandevenne's CG Tutorials](http://lodev.org/cgtutor/). With more math from [F. Permadi's Ray-casting Tutorial](http://www.permadi.com/tutorial/raycast/index.html).

For squeezing a few extra frames out of the pixel by pixel rendering, the MDN article by Paul Roget [Faster Canvas Pixel Manipulation with Typed Arrays](https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/) was useful. But ultimately `putImageData` is still terribly slow compared to `drawImage`.

I'd like to make a `drawImage` based renderer at some point.

## [Plasma](https://walsh9.github.io/fun-with-canvas/plasma/plasma.html)
![Plasma](https://cloud.githubusercontent.com/assets/6074785/6063789/f3425af0-ad27-11e4-964e-ab15a134933d.png)

Canvas implementation of an oldschool palette-cycling plasma effect based on math from [Lode Vandevenne's CG Tutorials](http://lodev.org/cgtutor/).

## [Cool Wavy Text](https://walsh9.github.io/fun-with-canvas/wavy/index.html)
![Cool Wavy Text](https://cloud.githubusercontent.com/assets/6074785/6063790/f34370d4-ad27-11e4-8048-e1acc5295dbf.png)

Text that slides up and down along a sine wave.

## Other notes

Glenn Fiedler's article, [Fix Your Timestep!](http://gafferongames.com/game-physics/fix-your-timestep/) was tremendously helpful for coordinating the timing of the rendering and state updates.
