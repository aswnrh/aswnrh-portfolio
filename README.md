# Aswin's Portfolio

A highly interactive, developer-focused portfolio featuring custom canvas animations, retro game integration, and dynamic particle effects.

## 🛠️ Built With

The site is built with a modern, high-performance web stack:
- **Core Framework**: [Next.js 16.2](https://nextjs.org/) & [React 19](https://react.dev/) for server-rendered page efficiency and component-driven architecture.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for robust static typing and maintainable codebases.
- **Styling**: [TailwindCSS v4.0](https://tailwindcss.com/) with PostCSS for high-performance utility-first styling.
- **Interactivity**: Native **HTML5 Canvas API** for low-level, high-framerate rendering of interactive animations.
- **Pre-rendering Tools**: [node-canvas](https://github.com/Automattic/node-canvas) (`canvas` npm package) to pre-process images/illustrations into lightweight dot JSON vectors.

---

## ⚡ Particle Motion & Physics Simulation

The interactive particle/text scattering throughout the site (e.g., in [ScatterText.tsx](file:///Users/aswnrh/Projects/aswnrh-portfolio/components/ScatterText.tsx) and [RobotCollector.tsx](file:///Users/aswnrh/Projects/aswnrh-portfolio/components/RobotCollector.tsx)) runs on a real-time 2D physics engine built on top of the Canvas API.

### How it Works:
Each dot is defined by a data structure tracking:
- `x`, `y`: Current 2D canvas coordinates.
- `originX`, `originY`: The particle's default/anchor coordinates.
- `vx`, `vy`: Current horizontal and vertical velocities.

Every frame in the `requestAnimationFrame` loop applies the following forces:

1. **Mouse Repulsion**:
   When the mouse cursor moves within a threshold radius (e.g., `RADIUS = 50px` or `60px`), a repulsive force is calculated:
   $$\text{force} = \frac{\text{RADIUS} - \text{distance}}{\text{RADIUS}} \times \text{STRENGTH}$$
   This force accelerates the particle away from the cursor along the mouse-to-particle angle:
   ```typescript
   dot.vx += Math.cos(angle) * force * 4;
   dot.vy += Math.sin(angle) * force * 4;
   ```
2. **Hooke's Law Spring Force**:
   A spring-back effect constantly pulls the particle back to its original target position:
   ```typescript
   dot.vx += (dot.originX - dot.x) * SPRING;
   dot.vy += (dot.originY - dot.y) * SPRING;
   ```
   *(where `SPRING = 0.085`)*
3. **Damping (Friction)**:
   Velocity is multiplied by a damping coefficient to simulate resistance, dissipate energy, and prevent infinite oscillation:
   ```typescript
   dot.vx *= DAMPING;
   dot.vy *= DAMPING;
   ```
   *(where `DAMPING = 0.86`)*
4. **Velocity Clamping**:
   To prevent excessive speed from large cursor movements, velocities are capped at `MAX_VELOCITY = 42`.

### Performance Optimization:
To prevent idle CPU consumption, the rendering loop dynamically pauses when the particles settle (i.e., all velocities fall below a tiny threshold `0.01` and offsets from their origins are `< 0.1` px). The loop automatically restarts upon detecting mouse activity near the canvas area.

---

## 🎨 Creation of Dotted Images

The project illustrations and icons are represented as structured JSON arrays containing dot coordinates and hex color values (e.g., `public/project-dots-webrtc.json`). This keeps asset delivery extremely lightweight and allows instant integration with the physics system.

They are created using two preprocessing scripts in the [scripts](file:///Users/aswnrh/Projects/aswnrh-portfolio/scripts) directory:

### 1. Procedural Illustrations ([generate-project-dots.mjs](file:///Users/aswnrh/Projects/aswnrh-portfolio/scripts/generate-project-dots.mjs))
- Uses `node-canvas` on the server/developer side to programmatically draw scenes (e.g., a WebRTC conference window layout, a food delivery map with pins, or an auction platform bids graph).
- Once drawn onto an offscreen canvas, the script samples the pixels on a high-resolution grid (e.g., $120 \times 80$).
- Every non-transparent pixel (alpha > 30) is recorded into an array of dots containing normalized `{ x, y, color: hex }` values and output to a JSON file.

### 2. Image Raster to Dot Vector ([img-to-dots.js](file:///Users/aswnrh/Projects/aswnrh-portfolio/scripts/img-to-dots.js))
- Loads any standard raster PNG/JPG file (e.g., a pixel art drawing).
- Samples pixel coordinates using a specified grid resolution (default: 100 columns).
- Filters out background/transparent pixels based on brightness and alpha thresholds.
- Converts the sampled colors to hexadecimal string hashes (`#ffffff`) and writes the coordinate map to a JSON file.

At runtime, these JSON lists are loaded and rendered dynamically using [ProjectDotImage](file:///Users/aswnrh/Projects/aswnrh-portfolio/components/Projects.tsx#L188) components, inheriting the cursor interaction and spring animations.
