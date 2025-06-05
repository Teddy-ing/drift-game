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
    const accel = 10;
    const maxSpeed = 20;
    const friction = 0.98;
    const drift = 0.92;
    const turnSpeed = 2;

    if (input.up) this.speed += accel * dt;
    if (input.down) this.speed -= accel * dt;
    this.speed = Math.max(-maxSpeed, Math.min(maxSpeed, this.speed));

    if (input.left) this.angle += turnSpeed * dt * (this.vx !== 0 || this.vz !== 0 ? 1 : 0);
    if (input.right) this.angle -= turnSpeed * dt * (this.vx !== 0 || this.vz !== 0 ? 1 : 0);

    const forwardX = Math.sin(this.angle);
    const forwardZ = Math.cos(this.angle);
    this.vx += forwardX * this.speed * dt;
    this.vz += forwardZ * this.speed * dt;
    this.speed = 0;

    this.vx *= friction;
    this.vz *= friction;

    const rightX = forwardZ;
    const rightZ = -forwardX;
    const sideSpeed = this.vx * rightX + this.vz * rightZ;
    this.vx -= sideSpeed * (1 - drift) * rightX;
    this.vz -= sideSpeed * (1 - drift) * rightZ;

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

  // Overhead camera that stays fixed above the car
  const camHeight = 10;
  camera.position.set(car.x, camHeight, car.z);
  camera.lookAt(car.x, 0.25, car.z);

  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
