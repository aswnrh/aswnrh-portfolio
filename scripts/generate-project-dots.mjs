/**
 * Generate scatter-dot JSON files for the 3 project card illustrations.
 * Uses node-canvas to draw rich scenes, then samples pixels → dot arrays.
 * Run: node scripts/generate-project-dots.mjs
 */
import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

const W = 120; // grid columns
const H = 80;  // grid rows
const CELL = 1; // 1px per cell on offscreen canvas

function sampleToDots(canvas, cols, rows) {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, cols, rows);
  const dots = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const r = imgData.data[idx];
      const g = imgData.data[idx + 1];
      const b = imgData.data[idx + 2];
      const a = imgData.data[idx + 3];
      if (a > 30) {
        const hex = "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
        dots.push({ x: x + 0.5, y: y + 0.5, color: hex });
      }
    }
  }
  return dots;
}

// ---------- WEBRTC CONFERENCE ----------
function drawWebrtc() {
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");

  // dark background panel
  ctx.fillStyle = "#181e25";
  ctx.fillRect(8, 4, 104, 72);

  // top bar
  ctx.fillStyle = "#222a33";
  ctx.fillRect(8, 4, 104, 6);

  // traffic lights
  ctx.fillStyle = "#ff5f56";
  ctx.fillRect(12, 6, 2, 2);
  ctx.fillStyle = "#ffbd2e";
  ctx.fillRect(16, 6, 2, 2);
  ctx.fillStyle = "#27c93f";
  ctx.fillRect(20, 6, 2, 2);

  // 4 participant video panels
  const panels = [[12, 14, 44, 28], [64, 14, 44, 28], [12, 46, 44, 28], [64, 46, 44, 28]];
  for (const [px, py, pw, ph] of panels) {
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(px, py, pw, ph);
    // border
    ctx.strokeStyle = "#2a3540";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

    // person silhouette - head
    const cx = px + pw / 2;
    const cy = py + ph * 0.35;
    ctx.fillStyle = "#00ff88";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // shoulders
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 10, 6, 0, Math.PI, 0, true);
    ctx.fill();
  }

  // user names under each panel
  const names = [[22, 40], [74, 40], [22, 72], [74, 72]];
  for (const [nx, ny] of names) {
    ctx.fillStyle = "#3a4550";
    ctx.fillRect(nx, ny, 20, 2);
  }

  // bottom controls bar
  ctx.fillStyle = "#222a33";
  ctx.fillRect(8, 74, 104, 2);

  // mic icon
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(50, 74, 2, 2);
  // camera icon
  ctx.fillRect(56, 74, 3, 2);
  // end call
  ctx.fillStyle = "#ff5f56";
  ctx.fillRect(62, 74, 4, 2);

  return sampleToDots(c, W, H);
}

// ---------- FOOD DELIVERY (wide dashboard) ----------
function drawDelivery() {
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");

  // browser panel (same size as webrtc and auction)
  ctx.fillStyle = "#181e25";
  ctx.fillRect(8, 4, 104, 72);

  // top bar
  ctx.fillStyle = "#222a33";
  ctx.fillRect(8, 4, 104, 6);

  // traffic lights
  ctx.fillStyle = "#ff5f56";
  ctx.fillRect(12, 6, 2, 2);
  ctx.fillStyle = "#ffbd2e";
  ctx.fillRect(16, 6, 2, 2);
  ctx.fillStyle = "#27c93f";
  ctx.fillRect(20, 6, 2, 2);

  // LEFT PANEL: food item showcase
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(12, 14, 48, 58);

  // plate circle
  ctx.strokeStyle = "#2a3540";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(36, 34, 14, 0, Math.PI * 2);
  ctx.stroke();

  // burger bun top (arc)
  ctx.fillStyle = "#ffbd2e";
  ctx.beginPath();
  ctx.ellipse(36, 28, 10, 5, 0, Math.PI, 0, true);
  ctx.fill();
  // lettuce
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(26, 30, 20, 2);
  // patty
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(27, 33, 18, 3);
  // cheese
  ctx.fillStyle = "#ffbd2e";
  ctx.fillRect(26, 32, 20, 1);
  // bun bottom
  ctx.fillStyle = "#e09030";
  ctx.fillRect(27, 37, 18, 3);

  // price and label
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(16, 52, 14, 2);
  ctx.fillStyle = "#3a4550";
  ctx.fillRect(16, 56, 24, 2);
  ctx.fillRect(16, 60, 18, 2);

  // order button
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(16, 66, 36, 3);

  // RIGHT PANEL: delivery map + tracking
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(64, 14, 44, 58);

  // grid roads
  ctx.strokeStyle = "#1a2530";
  ctx.lineWidth = 1;
  for (let x = 68; x < 108; x += 8) {
    ctx.beginPath(); ctx.moveTo(x, 14); ctx.lineTo(x, 72); ctx.stroke();
  }
  for (let y = 18; y < 72; y += 8) {
    ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(108, y); ctx.stroke();
  }

  // delivery path
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(70, 64);
  ctx.lineTo(78, 54);
  ctx.lineTo(86, 42);
  ctx.lineTo(92, 36);
  ctx.lineTo(100, 24);
  ctx.stroke();
  ctx.setLineDash([]);

  // start pin (restaurant)
  ctx.fillStyle = "#ffbd2e";
  ctx.beginPath();
  ctx.arc(70, 64, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d1117";
  ctx.beginPath();
  ctx.arc(70, 64, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // end pin (customer)
  ctx.fillStyle = "#ff5f56";
  ctx.beginPath();
  ctx.arc(100, 24, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d1117";
  ctx.beginPath();
  ctx.arc(100, 24, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // rider dot on path
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.arc(86, 42, 2.5, 0, Math.PI * 2);
  ctx.fill();

  return sampleToDots(c, W, H);
}

// ---------- AUCTION PLATFORM ----------
function drawAuction() {
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");

  // browser panel
  ctx.fillStyle = "#181e25";
  ctx.fillRect(8, 4, 104, 72);

  // top bar
  ctx.fillStyle = "#222a33";
  ctx.fillRect(8, 4, 104, 6);

  // traffic lights
  ctx.fillStyle = "#ff5f56";
  ctx.fillRect(12, 6, 2, 2);
  ctx.fillStyle = "#ffbd2e";
  ctx.fillRect(16, 6, 2, 2);
  ctx.fillStyle = "#27c93f";
  ctx.fillRect(20, 6, 2, 2);

  // left panel: car image area
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(12, 14, 48, 32);

  // car body
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(18, 38);
  ctx.lineTo(22, 30);
  ctx.lineTo(30, 26);
  ctx.lineTo(38, 22);
  ctx.lineTo(46, 22);
  ctx.lineTo(50, 26);
  ctx.lineTo(54, 30);
  ctx.lineTo(56, 38);
  ctx.stroke();

  // car bottom
  ctx.beginPath();
  ctx.moveTo(18, 38);
  ctx.lineTo(56, 38);
  ctx.stroke();

  // wheels
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.arc(26, 38, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(48, 38, 3, 0, Math.PI * 2);
  ctx.fill();

  // wheel centers
  ctx.fillStyle = "#0d1117";
  ctx.beginPath();
  ctx.arc(26, 38, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(48, 38, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // windows
  ctx.strokeStyle = "#2a7a55";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 26);
  ctx.lineTo(30, 30);
  ctx.lineTo(38, 30);
  ctx.lineTo(38, 23);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(40, 23);
  ctx.lineTo(40, 30);
  ctx.lineTo(50, 30);
  ctx.lineTo(50, 26);
  ctx.stroke();

  // price labels under car
  ctx.fillStyle = "#3a4550";
  ctx.fillRect(14, 42, 20, 2);
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(14, 46, 14, 2);

  // right panel: bid info
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(64, 14, 44, 32);

  // bid chart — rising line
  ctx.strokeStyle = "#ff5f56";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(68, 40);
  ctx.lineTo(74, 36);
  ctx.lineTo(80, 38);
  ctx.lineTo(86, 30);
  ctx.lineTo(92, 28);
  ctx.lineTo(98, 20);
  ctx.lineTo(104, 18);
  ctx.stroke();

  // chart dots
  for (const [dx, dy] of [[68,40],[74,36],[80,38],[86,30],[92,28],[98,20],[104,18]]) {
    ctx.fillStyle = "#ff5f56";
    ctx.beginPath();
    ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // highest bid marker
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.arc(104, 18, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // bottom section: bid history
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(12, 50, 96, 22);

  // gavel icon
  ctx.fillStyle = "#ffbd2e";
  ctx.beginPath();
  ctx.moveTo(20, 56);
  ctx.lineTo(28, 52);
  ctx.lineTo(30, 54);
  ctx.lineTo(22, 58);
  ctx.closePath();
  ctx.fill();
  // handle
  ctx.strokeStyle = "#ffbd2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(26, 57);
  ctx.lineTo(32, 64);
  ctx.stroke();
  // base
  ctx.fillStyle = "#3a4550";
  ctx.fillRect(28, 66, 10, 2);

  // bid rows
  for (let row = 0; row < 3; row++) {
    const ry = 53 + row * 6;
    ctx.fillStyle = "#2a3540";
    ctx.fillRect(44, ry, 24, 2);
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(72, ry, 16, 2);
    // status dot
    ctx.fillStyle = row === 0 ? "#00ff88" : "#3a4550";
    ctx.beginPath();
    ctx.arc(92, ry + 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  return sampleToDots(c, W, H);
}

// Generate and write all 3 files
const files = [
  { name: "project-dots-webrtc.json", gen: drawWebrtc },
  { name: "project-dots-delivery.json", gen: drawDelivery },
  { name: "project-dots-auction.json", gen: drawAuction },
];

for (const { name, gen } of files) {
  const dots = gen();
  const data = { columns: W, rows: H, dotCount: dots.length, dots };
  writeFileSync(`public/${name}`, JSON.stringify(data));
  console.log(`✓ ${name}: ${dots.length} dots`);
}
