# Minecraft-style Three.js Scene

This project creates a simple Minecraft-inspired scene using Three.js, featuring a grid of cubes with orbital camera controls.

## Setup

1. Ensure you have Node.js installed (version 14.x or later recommended).
2. Clone this repository or download the source code.
3. Open a terminal in the project directory and run:
   ```
   npm install
   ```

## Dependencies

- Three.js (version 0.137.0 or later)

## Development Server

We use Python's built-in HTTP server for local development. To start the server:

1. Open a terminal in the project directory.
2. Run one of the following commands:
   - For Python 3: `python -m http.server 8000`
   - For Python 2: `python -m SimpleHTTPServer 8000`
3. Open a web browser and navigate to `http://localhost:8000`

## Controls

- A/D: Rotate camera horizontally around the center (full 360-degree rotation)
- W/S: Rotate camera vertically (full 180-degree rotation, from bottom to top)

## Changelog

### [Date] - Initial Setup
- Created basic Three.js scene with a 5x5 grid of green cubes as the floor
- Implemented orbital camera controls (horizontal only)
- Added red edge indicators to all cubes

### [Date] - Vertical Camera Movement
- Added vertical camera rotation using W/S keys
- Updated README with setup instructions and controls
- Documented dependencies and development server setup

### [Current Date] - Full Spherical Camera Control
- Modified camera controls to allow full 360-degree horizontal rotation
- Adjusted vertical rotation to allow full 180-degree movement (from bottom to top)
- Updated camera positioning calculation using spherical coordinates
- Added comments to explain each part of the code
- Revised README to reflect new camera control behavior

## Next Steps

- [List any planned features or improvements]