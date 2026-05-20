// Script to convert PNG image to scatter dot JSON data
// Samples the image on a grid and outputs dot positions + colors

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const INPUT = '/Users/aswnrh/.gemini/antigravity/brain/11837faf-278e-45b7-aec6-0de8b0a08400/robot_pixel_art_1779262704197.png';
const OUTPUT = path.join(__dirname, 'scatter-dots.json');

const COLUMNS = 100; // grid resolution
const BG_THRESHOLD = 30; // skip pixels darker than this (background)
const DOT_RADIUS = 0.95;

async function main() {
  const img = await loadImage(INPUT);
  const w = img.width;
  const h = img.height;
  
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;
  
  const cellSize = w / COLUMNS;
  const rows = Math.floor(h / cellSize);
  
  const dots = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      // Sample center of cell
      const px = Math.floor(col * cellSize + cellSize / 2);
      const py = Math.floor(row * cellSize + cellSize / 2);
      
      if (px >= w || py >= h) continue;
      
      const idx = (py * w + px) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];
      
      // Skip transparent or very dark background pixels
      if (a < 128) continue;
      const brightness = (r + g + b) / 3;
      if (brightness < BG_THRESHOLD) continue;
      
      // Convert to hex color
      const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
      
      dots.push({
        x: col + 0.5,
        y: row + 0.5,
        color: hex
      });
    }
  }
  
  console.log(`Generated ${dots.length} dots from ${COLUMNS}x${rows} grid`);
  
  const output = {
    columns: COLUMNS,
    rows,
    dotCount: dots.length,
    dots
  };
  
  fs.writeFileSync(OUTPUT, JSON.stringify(output));
  console.log(`Written to ${OUTPUT}`);
}

main().catch(console.error);
