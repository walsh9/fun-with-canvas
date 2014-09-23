# Fun Experiments with Html Canvas

## Raycaster

A canvas implementation of a raycasting engine.

There are textured and untextured versions.

Random map generation from [rot.js](https://ondras.github.io/rot.js/hp/).

The textured raycaster uses public domain [textures](http://opengameart.org/content/40-free-metal-textures-from-mtc-sets) by rubberduck on [opengameart.org](http://opengameart.org/).

Based on the raycasting pages of [Lode Vandevenne's CG Tutorials](http://lodev.org/cgtutor/). With more math from [F. Permadi's Ray-casting Tutorial](http://www.permadi.com/tutorial/raycast/index.html).

For squeezing a few extra frames out of the pixel by pixel rendering, the MDN article by Paul Roget [Faster Canvas Pixel Manipulation with Typed Arrays](https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/) was useful. But ultimately `putImageData` is still terribly slow compared to `drawImage`.

I'd like to make a `drawImage` based renderer at some point.

## Plasma

Canvas implementation of an oldschool palette-cycling plasma effect based on math from [Lode Vandevenne's CG Tutorials](http://lodev.org/cgtutor/).

## Other notes

Glenn Fiedler's article, [Fix Your Timestep!](http://gafferongames.com/game-physics/fix-your-timestep/) was tremendously helpful for coordinating the timing of the rendering and state updates.