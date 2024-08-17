// Requires Three.js version 0.137.0 or later
import * as THREE from './node_modules/three/build/three.module.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a group to hold all cubes
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

// Function to create a cube with red edges
function createCube(x, y, z, color) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);

    // Add red edges
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cube.add(edges);

    return cube;
}

// Create floor (5x5 grid of green cubes)
for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
        const cube = createCube(x, -0.5, z, 0x00FF00); // Green color
        cubeGroup.add(cube);
    }
}

// Set initial camera position
const cameraRadius = 6;
let cameraHorizontalAngle = 0;
let cameraVerticalAngle = 0;
updateCameraPosition();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Camera movement
let horizontalSpeed = 0;
let verticalSpeed = 0;
document.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'A') horizontalSpeed = 0.02;
    if (event.key === 'd' || event.key === 'D') horizontalSpeed = -0.02;
    if (event.key === 'w' || event.key === 'W') verticalSpeed = 0.02;
    if (event.key === 's' || event.key === 'S') verticalSpeed = -0.02;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'A' || event.key === 'd' || event.key === 'D') horizontalSpeed = 0;
    if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') verticalSpeed = 0;
});

function updateCameraPosition() {
    // Calculate camera position using spherical coordinates
    camera.position.x = cameraRadius * Math.sin(cameraVerticalAngle) * Math.cos(cameraHorizontalAngle);
    camera.position.y = cameraRadius * Math.cos(cameraVerticalAngle);
    camera.position.z = cameraRadius * Math.sin(cameraVerticalAngle) * Math.sin(cameraHorizontalAngle);
    camera.lookAt(0, 0, 0); // Look at the center of the scene
}

function updateCamera() {
    // Update camera angles based on user input
    cameraHorizontalAngle += horizontalSpeed;
    cameraVerticalAngle += verticalSpeed;
    
    // Normalize horizontal angle to keep it within 0 to 2π range
    cameraHorizontalAngle = ((cameraHorizontalAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Clamp vertical angle to avoid flipping, allowing full vertical rotation
    cameraVerticalAngle = Math.max(0.01, Math.min(Math.PI - 0.01, cameraVerticalAngle));
    
    updateCameraPosition();
    requestAnimationFrame(updateCamera);
}

animate();
updateCamera();

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add a brown dirt cube on top of the center green cube
const dirtCube = createCube(0, 0.5, 0, 0x8B4513); // Brown color
cubeGroup.add(dirtCube);