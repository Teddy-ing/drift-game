const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
// Sky blue background so motion is easier to see
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const carGeo = new THREE.BoxGeometry(1, 0.5, 2);
const carMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const carMesh = new THREE.Mesh(carGeo, carMat);
carMesh.position.y = 0.25;
scene.add(carMesh);

// Simple buildings scattered around the ground to show movement
const buildingMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
for (let i = 0; i < 20; i++) {
  const height = Math.random() * 4 + 2;
  const bGeo = new THREE.BoxGeometry(2, height, 2);
  const building = new THREE.Mesh(bGeo, buildingMat);
  building.position.set(
    (Math.random() - 0.5) * 180,
    height / 2,
    (Math.random() - 0.5) * 180
  );
  scene.add(building);
}

class Car {
  constructor(mesh) {
    this.mesh = mesh;
    this.x = 0;
    this.z = 0;
    this.angle = 0;
    this.speed = 0;
    this.vx = 0;
    this.vz = 0;
  }

  update(input, dt) {
    const accel = 30; // acceleration in units per second^2
    const maxSpeed = 20;
    const drift = 0.96; // velocity decay for drifting feel
    const turnSpeed = 2.5;

    const forwardX = Math.sin(this.angle);
    const forwardZ = Math.cos(this.angle);

    // Apply acceleration based on input
    if (input.up) {
      this.vx += forwardX * accel * dt;
      this.vz += forwardZ * accel * dt;
    }
    if (input.down) {
      this.vx -= forwardX * accel * dt;
      this.vz -= forwardZ * accel * dt;
    }

    // Turning controls
    if (input.left) this.angle += turnSpeed * dt;
    if (input.right) this.angle -= turnSpeed * dt;

    // Limit overall velocity
    let speed = Math.sqrt(this.vx * this.vx + this.vz * this.vz);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.vx *= scale;
      this.vz *= scale;
      speed = maxSpeed;
    }

    // Apply simple drift/friction
    this.vx *= drift;
    this.vz *= drift;

    // Update position
    this.x += this.vx * dt;
    this.z += this.vz * dt;

    this.mesh.position.set(this.x, 0.25, this.z);
    this.mesh.rotation.y = -this.angle;
  }
}

const input = { up: false, down: false, left: false, right: false };
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') input.up = true;
  if (e.key === 'ArrowDown') input.down = true;
  if (e.key === 'ArrowLeft') input.left = true;
  if (e.key === 'ArrowRight') input.right = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') input.up = false;
  if (e.key === 'ArrowDown') input.down = false;
  if (e.key === 'ArrowLeft') input.left = false;
  if (e.key === 'ArrowRight') input.right = false;
});

const car = new Car(carMesh);

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);

let lastTime = performance.now();
function gameLoop(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  car.update(input, dt);

  // Camera fixed at a 45 degree angle above the car
  const camHeight = 10;
  const offset = camHeight / Math.SQRT2; // horizontal distance for ~45deg
  camera.position.set(car.x + offset, camHeight, car.z + offset);
  camera.lookAt(car.x, 0.25, car.z);

  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
