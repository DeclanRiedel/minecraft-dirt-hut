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

// Improve texture loading
const textureLoader = new THREE.TextureLoader();
function loadTexture(path) {
    return textureLoader.load(path, texture => {
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });
}

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

// Simplify cube creation
function createMinecraftCube(x, y, z, isGrass) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materialOptions = {
        color: 0xFFFFFF,
        roughness: 0.8,
        metalness: 0.0,
        envMapIntensity: 1.0
    };
    const materials = [
        new THREE.MeshStandardMaterial({ ...materialOptions, map: isGrass ? textures.grassSide : textures.dirt }),
        new THREE.MeshStandardMaterial({ ...materialOptions, map: isGrass ? textures.grassSide : textures.dirt }),
        new THREE.MeshStandardMaterial({ ...materialOptions, map: isGrass ? textures.grassTop : textures.dirt }),
        new THREE.MeshStandardMaterial({ ...materialOptions, map: textures.dirt }),
        new THREE.MeshStandardMaterial({ ...materialOptions, map: isGrass ? textures.grassSide : textures.dirt }),
        new THREE.MeshStandardMaterial({ ...materialOptions, map: isGrass ? textures.grassSide : textures.dirt })
    ];

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

// Simplify hut creation
for (let y = 1; y <= 2; y++) {
    for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
            if (x === 0 && z >= 0) continue;
            cubeGroup.add(createMinecraftCube(x, y, z, false));
        }
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

// Improve sign creation
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
    const boardMaterial = new THREE.MeshStandardMaterial({ map: textures.signBoard });
    const boardMaterials = Array(6).fill(boardMaterial);
    boardMaterials[4] = new THREE.MeshStandardMaterial({ map: boardTexture });
    
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
let cameraRadius = 8; // Initial radius for orbiting
const minRadius = 5;
const maxRadius = 12;
const centerPoint = new THREE.Vector3(0, 1, 0); // Center on the first empty block above the structure
let cameraTheta = Math.PI / 2; // Horizontal angle
let cameraPhi = Math.PI / 2; // Vertical angle (start at equator)

// Function to update camera position
function updateCameraPosition() {
    const x = centerPoint.x + cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
    const y = centerPoint.y + cameraRadius * Math.cos(cameraPhi);
    const z = centerPoint.z + cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
    
    camera.position.set(x, y, z);
    camera.lookAt(centerPoint);
}

// Simplify key handling
const keyState = { rotateLeft: false, rotateRight: false, orbitUp: false, orbitDown: false, zoomIn: false, zoomOut: false };
const keyMap = { 
    KeyA: 'rotateLeft', 
    KeyD: 'rotateRight', 
    KeyW: 'orbitUp', 
    KeyS: 'orbitDown',
    KeyQ: 'zoomIn',
    KeyE: 'zoomOut'
};

function handleKey(event, isKeyDown) {
    const key = keyMap[event.code];
    if (key) keyState[key] = isKeyDown;
}

document.addEventListener('keydown', (e) => handleKey(e, true));
document.addEventListener('keyup', (e) => handleKey(e, false));

// Update animation loop
function animate() {
    requestAnimationFrame(animate);

    if (keyState.rotateLeft) cameraTheta += 0.02;
    if (keyState.rotateRight) cameraTheta -= 0.02;
    if (keyState.orbitUp) cameraPhi = Math.max(0.01, cameraPhi - 0.02);
    if (keyState.orbitDown) cameraPhi = Math.min(Math.PI - 0.01, cameraPhi + 0.02);
    if (keyState.zoomIn) cameraRadius = Math.max(minRadius, cameraRadius - 0.1);
    if (keyState.zoomOut) cameraRadius = Math.min(maxRadius, cameraRadius + 0.1);

    updateCameraPosition();

    sun.position.set(camera.position.x + 10, camera.position.y + 8, camera.position.z - 10);
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

// Improve gradient creation
function createGradientCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 2);
    
    const colorStops = [
        { stop: 0, color: '#4A90E2' },
        { stop: 0.3, color: '#81C3FF' },
        { stop: 0.6, color: '#B3E5FC' },
        { stop: 0.8, color: '#4A5D80' },
        { stop: 1, color: '#2C3E50' }
    ];
    
    colorStops.forEach(({ stop, color }) => gradient.addColorStop(stop, color));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return canvas;
}

// Create a subtle background gradient
const bgTexture = new THREE.CanvasTexture(createGradientCanvas());
scene.background = bgTexture;

// Update renderer settings
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.gammaFactor = 2.2;
renderer.physicallyCorrectLights = true;
