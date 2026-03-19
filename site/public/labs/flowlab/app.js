import { LBMSolver } from './lbm.js';

const canvas = document.querySelector('#field');
const context = canvas.getContext('2d', { alpha: false });
const reynoldsSelect = document.querySelector('#reynolds');
const displaySelect = document.querySelector('#display');
const toggleButton = document.querySelector('#toggle');
const resetButton = document.querySelector('#reset');
const metrics = document.querySelector('#metrics');
const offscreen = document.createElement('canvas');
offscreen.width = 96;
offscreen.height = 64;
const offscreenContext = offscreen.getContext('2d', { alpha: false });
const pixels = offscreenContext.createImageData(offscreen.width, offscreen.height);
let solver;
let running = true;
let lastTimestamp = performance.now();
let frameCount = 0;
let framesPerSecond = 0;

function createSolver() {
  solver = new LBMSolver({
    width: offscreen.width + 2,
    height: offscreen.height + 2,
    reynolds: Number(reynoldsSelect.value),
    lidVelocity: 0.08,
  });
}

function colour(value, signed) {
  const normalised = Math.max(signed ? -1 : 0, Math.min(1, value));
  if (!signed) {
    // Speed: 0 is ivory/paper (#faf9f5), mid is ink-teal (#0f766e), high is warm amber (#c2410c)
    if (normalised < 0.5) {
      const t = normalised * 2;
      return [
        Math.round(250 + (15 - 250) * t),
        Math.round(249 + (118 - 249) * t),
        Math.round(245 + (110 - 245) * t)
      ];
    } else {
      const t = (normalised - 0.5) * 2;
      return [
        Math.round(15 + (194 - 15) * t),
        Math.round(118 + (65 - 118) * t),
        Math.round(110 + (12 - 110) * t)
      ];
    }
  }
  // Signed vorticity: <0 is cool blue (#0284c7), 0 is ivory (#faf9f5), >0 is crimson (#dc2626)
  if (normalised < 0) {
    const t = -normalised;
    return [
      Math.round(250 + (2 - 250) * t),
      Math.round(249 + (132 - 249) * t),
      Math.round(245 + (199 - 245) * t)
    ];
  } else {
    const t = normalised;
    return [
      Math.round(250 + (220 - 250) * t),
      Math.round(249 + (38 - 249) * t),
      Math.round(245 + (38 - 245) * t)
    ];
  }
}

function render() {
  const vorticity = displaySelect.value === 'vorticity' ? solver.vorticity() : null;
  const signed = vorticity !== null;
  const scale = signed ? 55 : 1 / solver.lidVelocity;
  for (let y = 0; y < offscreen.height; y += 1) {
    for (let x = 0; x < offscreen.width; x += 1) {
      const cell = (y + 1) * solver.width + x + 1;
      let red, green, blue;
      if (solver.solid[cell]) {
        red = 41; green = 37; blue = 36; // solid obstacle (#292524)
      } else {
        const raw = signed ? vorticity[cell] : Math.hypot(solver.ux[cell], solver.uy[cell]);
        [red, green, blue] = colour(raw * scale, signed);
      }
      const pixel = ((offscreen.height - 1 - y) * offscreen.width + x) * 4;
      pixels.data[pixel] = red;
      pixels.data[pixel + 1] = green;
      pixels.data[pixel + 2] = blue;
      pixels.data[pixel + 3] = 255;
    }
  }
  offscreenContext.putImageData(pixels, 0, 0);
  context.imageSmoothingEnabled = false;
  context.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
  
  // Draw top moving lid indicator arrow
  context.strokeStyle = '#dc2626';
  context.lineWidth = 2.5;
  context.beginPath();
  context.moveTo(24, 14);
  context.lineTo(canvas.width - 24, 14);
  context.lineTo(canvas.width - 36, 8);
  context.moveTo(canvas.width - 24, 14);
  context.lineTo(canvas.width - 36, 20);
  context.stroke();
}

function animate(timestamp) {
  if (running) solver.step(5);
  render();
  frameCount += 1;
  if (timestamp - lastTimestamp >= 1_000) {
    framesPerSecond = Math.round((frameCount * 1_000) / (timestamp - lastTimestamp));
    frameCount = 0;
    lastTimestamp = timestamp;
  }
  metrics.textContent = `Re ${solver.reynolds} · τ ${solver.relaxationTime.toFixed(4)} · ${solver.iteration.toLocaleString()} it · ${framesPerSecond} fps`;
  requestAnimationFrame(animate);
}
// Mouse / touch drag to draw obstacles
let drawing = false;
function addObstacle(e) {
  const rect = canvas.getBoundingClientRect();
  const px = Math.floor(((e.clientX - rect.left) / rect.width) * offscreen.width);
  const py = Math.floor((1 - (e.clientY - rect.top) / rect.height) * offscreen.height);
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const gx = px + dx;
      const gy = py + dy;
      if (gx > 1 && gx < offscreen.width - 1 && gy > 1 && gy < offscreen.height - 2) {
        const cell = (gy + 1) * solver.width + gx + 1;
        solver.solid[cell] = 1;
        solver.ux[cell] = 0;
        solver.uy[cell] = 0;
      }
    }
  }
}

canvas.addEventListener('pointerdown', (e) => {
  drawing = true;
  addObstacle(e);
});
canvas.addEventListener('pointermove', (e) => {
  if (drawing) addObstacle(e);
});
window.addEventListener('pointerup', () => {
  drawing = false;
});

reynoldsSelect.addEventListener('change', createSolver);
displaySelect.addEventListener('change', render);
toggleButton.addEventListener('click', () => {
  running = !running;
  toggleButton.textContent = running ? 'Pause' : 'Resume';
});
resetButton.addEventListener('click', createSolver);

createSolver();
requestAnimationFrame(animate);
