// Requires Three.js version 0.137.0 or later
import * as THREE from './node_modules/three/build/three.module.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adjust the lighting
const ambientLight = new THREE.AmbientLight(0xfffaf0, 0.4); // Reduced intensity
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfff5e6, 0.8); // Reduced intensity
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Load Minecraft textures
const textureLoader = new THREE.TextureLoader();
function loadTexture(path) {
    const texture = textureLoader.load(path);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
}

const grassTopTexture = loadTexture('textures/grass_top.png');
const grassSideTexture = loadTexture('textures/grass_side.png');
const dirtTexture = loadTexture('textures/dirt.png');
const signPostTexture = loadTexture('textures/oak_side.png');
const signBoardTexture = loadTexture('textures/oak_planks.png');
const sunTexture = loadTexture('textures/sun.png');
const bedrockTexture = loadTexture('textures/bedrock.png');

// Create sun sprite
const sunGeometry = new THREE.PlaneGeometry(3, 3); // Increased from 2 to 3
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    transparent: true,
    side: THREE.DoubleSide
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(10, 8, -10);
scene.add(sun);

// Add a point light at the sun's position
const sunLight = new THREE.PointLight(0xFFFFFF, 1.5, 100); // Increased intensity
sunLight.position.copy(sun.position);
scene.add(sunLight);

// Function to create a cube with Minecraft textures
function createMinecraftCube(x, y, z, isGrass) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = [
        new THREE.MeshStandardMaterial({ map: isGrass ? grassSideTexture : dirtTexture, color: 0xFFFFFF }), // right
        new THREE.MeshStandardMaterial({ map: isGrass ? grassSideTexture : dirtTexture, color: 0xFFFFFF }), // left
        new THREE.MeshStandardMaterial({ map: isGrass ? grassTopTexture : dirtTexture, color: 0xFFFFFF }),  // top
        new THREE.MeshStandardMaterial({ map: dirtTexture, color: 0xFFFFFF }), // bottom
        new THREE.MeshStandardMaterial({ map: isGrass ? grassSideTexture : dirtTexture, color: 0xFFFFFF }), // front
        new THREE.MeshStandardMaterial({ map: isGrass ? grassSideTexture : dirtTexture, color: 0xFFFFFF })  // back
    ];
    
    // Adjust material properties for more vibrant appearance
    materials.forEach(material => {
        material.roughness = 0.8; // Adjust for desired shininess
        material.metalness = 0.0; // Non-metallic appearance
        material.envMapIntensity = 1.0; // Enhance environment map effect if used
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
            // Create bedrock block in the center
            const bedrockMaterial = new THREE.MeshStandardMaterial({ map: bedrockTexture, color: 0xFFFFFF });
            const bedrockCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bedrockMaterial);
            bedrockCube.position.set(x, 0, z);
            cubeGroup.add(bedrockCube);
        } else {
            const cube = createMinecraftCube(x, 0, z, true); // true for grass blocks
            cubeGroup.add(cube);
        }
    }
}

// Create 3x3 dirt hut with 2-block open center and 2-block door
// Create walls
for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
        // Skip center blocks
        if (x === 0 && z >= 0) continue;
        
        // Create first layer of walls
        cubeGroup.add(createMinecraftCube(x, 1, z, false)); // false for dirt blocks
        
        // Create second layer of walls
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
function createTextTexture(text, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // Draw wood texture background
    const woodImg = new Image();
    woodImg.src = 'textures/oak_planks.png';
    
    return new Promise((resolve) => {
        woodImg.onload = () => {
            context.drawImage(woodImg, 0, 0, width, height);

            // Set text properties
            context.fillStyle = 'black';
            context.font = 'bold 28px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            // Split text into lines
            const lines = text.split('\n');
            const lineHeight = 35;

            // Draw each line of text
            lines.forEach((line, index) => {
                const y = (height / 2) - ((lines.length - 1) * lineHeight / 2) + (index * lineHeight);
                context.fillText(line, width / 2, y);
            });

            resolve(new THREE.CanvasTexture(canvas));
        };
    });
}

// Function to create a Minecraft-style sign
async function createSign(x, y, z, text) {
    const signGroup = new THREE.Group();

    // Create the sign post (using 1/6 of the texture width)
    const postGeometry = new THREE.BoxGeometry(0.08, 0.9, 0.05);
    const postMaterial = new THREE.MeshStandardMaterial({ 
        map: signPostTexture,
        repeat: new THREE.Vector2(1/6, 0.9), // Changed to 1/6
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping
    });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 0.45; // Half of the post height
    signGroup.add(post);

    // Create the sign board
    const boardGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.05);
    const boardTexture = await createTextTexture(text, 256, 128);
    const boardMaterials = [
        new THREE.MeshStandardMaterial({ map: signBoardTexture }),
        new THREE.MeshStandardMaterial({ map: signBoardTexture }),
        new THREE.MeshStandardMaterial({ map: signBoardTexture }),
        new THREE.MeshStandardMaterial({ map: signBoardTexture }),
        new THREE.MeshStandardMaterial({ map: boardTexture }),
        new THREE.MeshStandardMaterial({ map: signBoardTexture })
    ];
    const board = new THREE.Mesh(boardGeometry, boardMaterials);
    board.position.y = 1.15; // Post height (0.9) + half of board height (0.5/2) = 1.15
    signGroup.add(board);

    signGroup.position.set(x, y, z);
    return signGroup;
}

// Add the sign on the surface of a grass block
const signX = -1; // X-coordinate of the chosen grass block
const signY = 0; // Just above the surface of the block
const signZ = 2; // Z-coordinate of the chosen grass block
const sign = await createSign(signX, signY, signZ, "My Glorious\nEstate");
cubeGroup.add(sign);
console.log("Sign added to cubeGroup");

// In your animation loop or after adding the sign
console.log("CubeGroup children:", cubeGroup.children);
console.log("Sign position:", sign.position);
console.log("Camera position:", camera.position);

// Camera setup
const originalCameraRadius = 5.1; // Slightly further out than before
let cameraRadius = originalCameraRadius;
const minRadius = originalCameraRadius - 2;
const maxRadius = originalCameraRadius + 2;
const cameraHeight = 1.5; // Height of camera (1.5 units above surface)
const centerHeight = 1.5; // Height of the point the camera looks at
let cameraAngle = Math.PI / 2; // Start at 90 degrees (π/2 radians)

// Set initial camera position
updateCameraPosition();

// Function to update camera position
function updateCameraPosition() {
    // Calculate camera position
    camera.position.x = cameraRadius * Math.cos(cameraAngle);
    camera.position.y = cameraHeight;
    camera.position.z = cameraRadius * Math.sin(cameraAngle);
    
    // Set camera to look at the center point at height 1.5
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

    // Update camera position based on user input
    if (rotateLeft) cameraAngle += 0.02;
    if (rotateRight) cameraAngle -= 0.02; // Changed to subtract, moving in opposite direction
    
    // Zoom in/out
    if (zoomIn) cameraRadius = Math.max(minRadius, cameraRadius - 0.1);
    if (zoomOut) cameraRadius = Math.min(maxRadius, cameraRadius + 0.1);

    updateCameraPosition();

    // Update sun position
    sun.position.x = camera.position.x + 10;
    sun.position.y = camera.position.y + 8;
    sun.position.z = camera.position.z - 10;

    // Make sun always face the camera
    sun.lookAt(camera.position);

    // Update sunLight position
    sunLight.position.copy(sun.position);

    // Render the scene
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
    
    // Sky gradient (top 60%)
    gradient.addColorStop(0, '#4A90E2');    // Deeper Sky Blue
    gradient.addColorStop(0.3, '#81C3FF');  // Lighter Sky Blue
    gradient.addColorStop(0.6, '#B3E5FC');  // Very Light Blue
    
    // Darker gradient (bottom 40%)
    gradient.addColorStop(0.6, '#B3E5FC');  // Very Light Blue (repeated for smooth transition)
    gradient.addColorStop(0.8, '#4A5D80');  // Darker blue-gray
    gradient.addColorStop(1, '#2C3E50');    // Even darker blue-gray (almost black)
    
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

// Add logging for debugging
console.log("Scene children:", scene.children);
console.log("Sign position:", sign.position);
console.log("Camera position:", camera.position);