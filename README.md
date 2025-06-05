# Drift Game

A simple 3D car drifting demo built with [Three.js](https://threejs.org/).
The camera now stays fixed above the car and buildings are placed around
the map so you can gauge movement.

## How to Play

1. Open `index.html` in a modern web browser.
2. Use the arrow keys to drive the car:
   - Up Arrow: Accelerate
   - Down Arrow: Brake/Reverse
   - Left/Right Arrow: Steer

The camera is fixed above the car so turning won't rotate your view. The
car will drift as you steer at speed. Buildings are scattered around the
level so you can see how fast you're moving.

## Development

All game logic is contained in `src/script.js`. Styles are defined in
`style.css`.
