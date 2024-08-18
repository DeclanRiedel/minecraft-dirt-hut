// Import Three.js library
import * as THREE from './node_modules/three/build/three.module.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xfffaf0, 0.4); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfff5e6, 0.8); // Warm sunlight
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Texture loading function
const textureLoader = new THREE.TextureLoader();
function loadTexture(path) {
    const texture = textureLoader.load(path);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
}

// Load Minecraft textures
const textures = {
    grassTop: loadTexture('textures/grass_top.png'),
    grassSide: loadTexture('textures/grass_side.png'),
    dirt: loadTexture('textures/dirt.png'),
    signPost: loadTexture('textures/oak_side.png'),
    signBoard: loadTexture('textures/oak_planks.png'),
    sun: loadTexture('textures/sun.png'),
    bedrock: loadTexture('textures/bedrock.png')
};

// Create sun
const sunGeometry = new THREE.PlaneGeometry(3, 3);
const sunMaterial = new THREE.MeshBasicMaterial({
    map: textures.sun,
    transparent: true,
    side: THREE.DoubleSide
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(10, 8, -10);
scene.add(sun);

// Add sun light
const sunLight = new THREE.PointLight(0xFFFFFF, 1.5, 100); // Bright white light
sunLight.position.copy(sun.position);
scene.add(sunLight);

// Function to create a Minecraft-style cube
function createMinecraftCube(x, y, z, isGrass) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = [
        new THREE.MeshStandardMaterial({ map: isGrass ? textures.grassSide : textures.dirt, color: 0xFFFFFF }), // White
        new THREE.MeshStandardMaterial({ map: isGrass ? textures.grassSide : textures.dirt, color: 0xFFFFFF }), // White
        new THREE.MeshStandardMaterial({ map: isGrass ? textures.grassTop : textures.dirt, color: 0xFFFFFF }), // White
        new THREE.MeshStandardMaterial({ map: textures.dirt, color: 0xFFFFFF }), // White
        new THREE.MeshStandardMaterial({ map: isGrass ? textures.grassSide : textures.dirt, color: 0xFFFFFF }), // White
        new THREE.MeshStandardMaterial({ map: isGrass ? textures.grassSide : textures.dirt, color: 0xFFFFFF }) // White
    ];
    
    materials.forEach(material => {
        material.roughness = 0.8;
        material.metalness = 0.0;
        material.envMapIntensity = 1.0;
    });

    const cube = new THREE.Mesh(geometry, materials);
    cube.position.set(x, y, z);
    return cube;
}

// Create a group to hold all cubes
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

// Create floor (5x5 grid of grass blocks with bedrock in the center)
for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
        if (x === 0 && z === 0) {
            const bedrockMaterial = new THREE.MeshStandardMaterial({ map: textures.bedrock, color: 0xFFFFFF }); // White
            const bedrockCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bedrockMaterial);
            bedrockCube.position.set(x, 0, z);
            cubeGroup.add(bedrockCube);
        } else {
            cubeGroup.add(createMinecraftCube(x, 0, z, true));
        }
    }
}

// Create 3x3 dirt hut with 2-block open center and 2-block door
for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
        if (x === 0 && z >= 0) continue;
        cubeGroup.add(createMinecraftCube(x, 1, z, false));
        cubeGroup.add(createMinecraftCube(x, 2, z, false));
    }
}

// Create roof
for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
        cubeGroup.add(createMinecraftCube(x, 3, z, false));
    }
}

// Function to create a texture with text
async function createTextTexture(text, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    const woodImg = new Image();
    woodImg.src = 'textures/oak_planks.png';
    
    await new Promise(resolve => woodImg.onload = resolve);
    context.drawImage(woodImg, 0, 0, width, height);

    context.fillStyle = 'black'; // Black text
    context.font = 'bold 28px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const lines = text.split('\n');
    const lineHeight = 35;

    lines.forEach((line, index) => {
        const y = (height / 2) - ((lines.length - 1) * lineHeight / 2) + (index * lineHeight);
        context.fillText(line, width / 2, y);
    });

    return new THREE.CanvasTexture(canvas);
}

// Function to create a Minecraft-style sign
async function createSign(x, y, z, text) {
    const signGroup = new THREE.Group();

    const postGeometry = new THREE.BoxGeometry(0.08, 0.9, 0.05);
    const postMaterial = new THREE.MeshStandardMaterial({
        map: textures.signPost,
        repeat: new THREE.Vector2(1/6, 0.9),
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping
    });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 0.45;
    signGroup.add(post);

    const boardGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.05);
    const boardTexture = await createTextTexture(text, 256, 128);
    const boardMaterials = [
        new THREE.MeshStandardMaterial({ map: textures.signBoard }),
        new THREE.MeshStandardMaterial({ map: textures.signBoard }),
        new THREE.MeshStandardMaterial({ map: textures.signBoard }),
        new THREE.MeshStandardMaterial({ map: textures.signBoard }),
        new THREE.MeshStandardMaterial({ map: boardTexture }),
        new THREE.MeshStandardMaterial({ map: textures.signBoard })
    ];
    const board = new THREE.Mesh(boardGeometry, boardMaterials);
    board.position.y = 1.15;
    signGroup.add(board);

    signGroup.position.set(x, y, z);
    return signGroup;
}

// Add the sign on the surface of a grass block
const signX = -1;
const signY = 0;
const signZ = 2;
const sign = await createSign(signX, signY, signZ, "My Glorious\nEstate");
cubeGroup.add(sign);

// Camera setup
const originalCameraRadius = 5.1;
let cameraRadius = originalCameraRadius;
const minRadius = originalCameraRadius - 2;
const maxRadius = originalCameraRadius + 2;
const cameraHeight = 1.5;
const centerHeight = 1.5;
let cameraAngle = Math.PI / 2;

// Set initial camera position
updateCameraPosition();

// Function to update camera position
function updateCameraPosition() {
    camera.position.x = cameraRadius * Math.cos(cameraAngle);
    camera.position.y = cameraHeight;
    camera.position.z = cameraRadius * Math.sin(cameraAngle);
    
    camera.lookAt(0, centerHeight, 0);
}

// Camera movement
let rotateLeft = false;
let rotateRight = false;
let zoomIn = false;
let zoomOut = false;

// Event listeners for key presses
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyA': rotateLeft = true; break;
        case 'KeyD': rotateRight = true; break;
        case 'KeyW': zoomIn = true; break;
        case 'KeyS': zoomOut = true; break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyA': rotateLeft = false; break;
        case 'KeyD': rotateRight = false; break;
        case 'KeyW': zoomIn = false; break;
        case 'KeyS': zoomOut = false; break;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (rotateLeft) cameraAngle += 0.02;
    if (rotateRight) cameraAngle -= 0.02;

    if (zoomIn) cameraRadius = Math.max(minRadius, cameraRadius - 0.1);
    if (zoomOut) cameraRadius = Math.min(maxRadius, cameraRadius + 0.1);

    updateCameraPosition();

    sun.position.x = camera.position.x + 10;
    sun.position.y = camera.position.y + 8;
    sun.position.z = camera.position.z - 10;

    sun.lookAt(camera.position);

    sunLight.position.copy(sun.position);

    renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create a subtle background gradient
const bgTexture = new THREE.CanvasTexture(createGradientCanvas());
scene.background = bgTexture;

function createGradientCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 2);
    
    gradient.addColorStop(0, '#4A90E2'); // Light blue
    gradient.addColorStop(0.3, '#81C3FF'); // Lighter blue
    gradient.addColorStop(0.6, '#B3E5FC'); // Pastel blue
    
    gradient.addColorStop(0.6, '#B3E5FC'); // Pastel blue
    gradient.addColorStop(0.8, '#4A5D80'); // Darker blue
    gradient.addColorStop(1, '#2C3E50'); // Dark blue
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return canvas;
}

// Update renderer settings
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.gammaFactor = 2.2;
renderer.physicallyCorrectLights = true;