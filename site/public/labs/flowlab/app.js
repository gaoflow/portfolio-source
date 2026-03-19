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

// Kami warm paper fluid color ramp
function colour(value, signed) {
  const normalised = Math.max(signed ? -1 : 0, Math.min(1, value));
  if (!signed) {
    // Speed mode: 0 is ivory/paper (#faf9f5), mid is deep oceanic teal (#0f766e), high is warm amber (#c2410c)
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
  
  // Signed vorticity mode: negative is calm sky blue (#0284c7), zero is clean ivory (#faf9f5), positive is vivid crimson (#dc2626)
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
      const raw = signed ? vorticity[cell] : Math.hypot(solver.ux[cell], solver.uy[cell]);
      const [red, green, blue] = colour(raw * scale, signed);
      const pixel = ((offscreen.height - 1 - y) * offscreen.width + x) * 4;
      pixels.data[pixel] = red;
      pixels.data[pixel + 1] = green;
      pixels.data[pixel + 2] = blue;
      pixels.data[pixel + 3] = 255;
    }
  }
  
  offscreenContext.putImageData(pixels, 0, 0);
  
  // High quality smooth image scaling on canvas
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
  
  // Top wall moving lid indicator arrow
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
  metrics.textContent = `Re ${solver.reynolds} · 粘性系数 ${(solver.viscosity * 1000).toFixed(2)} · ${solver.iteration.toLocaleString()} 迭代 · ${framesPerSecond} FPS`;
  requestAnimationFrame(animate);
}

// ==========================================
// INTERACTIVE FLUID STIRRING (MOMENTUM INJECTION)
// ==========================================
let isDragging = false;
let lastPointerX = 0;
let lastPointerY = 0;

function stirFluid(e) {
  const rect = canvas.getBoundingClientRect();
  const currGridX = ((e.clientX - rect.left) / rect.width) * offscreen.width;
  const currGridY = (1 - (e.clientY - rect.top) / rect.height) * offscreen.height;
  
  if (lastPointerX !== 0 && lastPointerY !== 0) {
    const deltaX = currGridX - lastPointerX;
    const deltaY = currGridY - lastPointerY;
    const dragSpeed = Math.hypot(deltaX, deltaY);
    
    if (dragSpeed > 0.1) {
      const pushMagnitude = Math.min(0.12, dragSpeed * 0.04);
      const pushUx = (deltaX / dragSpeed) * pushMagnitude;
      const pushUy = (deltaY / dragSpeed) * pushMagnitude;
      
      const radius = 4;
      const cx = Math.round(currGridX);
      const cy = Math.round(currGridY);
      
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const gx = cx + dx;
          const gy = cy + dy;
          if (gx >= 1 && gx < offscreen.width - 1 && gy >= 1 && gy < offscreen.height - 1) {
            const distSq = dx * dx + dy * dy;
            if (distSq <= radius * radius) {
              const weight = Math.exp(-distSq / (2 * 1.8 * 1.8));
              const cell = (gy + 1) * solver.width + gx + 1;
              
              solver.ux[cell] = Math.max(-0.15, Math.min(0.15, solver.ux[cell] + pushUx * weight));
              solver.uy[cell] = Math.max(-0.15, Math.min(0.15, solver.uy[cell] + pushUy * weight));
              
              // Smoothly re-equilibrate distributions locally
              const u2 = solver.ux[cell] * solver.ux[cell] + solver.uy[cell] * solver.uy[cell];
              for (let i = 0; i < 9; i += 1) {
                solver.f[i * solver.size + cell] = solver.equilibrium(i, solver.rho[cell], solver.ux[cell], solver.uy[cell]);
              }
            }
          }
        }
      }
    }
  }
  
  lastPointerX = currGridX;
  lastPointerY = currGridY;
}

canvas.addEventListener('pointerdown', (e) => {
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  lastPointerX = ((e.clientX - rect.left) / rect.width) * offscreen.width;
  lastPointerY = (1 - (e.clientY - rect.top) / rect.height) * offscreen.height;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (isDragging) {
    stirFluid(e);
  }
});

canvas.addEventListener('pointerup', (e) => {
  isDragging = false;
  lastPointerX = 0;
  lastPointerY = 0;
  try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
});

canvas.addEventListener('pointercancel', () => {
  isDragging = false;
  lastPointerX = 0;
  lastPointerY = 0;
});

// UI Event Listeners
reynoldsSelect.addEventListener('change', createSolver);
displaySelect.addEventListener('change', render);
toggleButton.addEventListener('click', () => {
  running = !running;
  toggleButton.textContent = running ? '暂停 Pause' : '继续 Resume';
});
resetButton.addEventListener('click', createSolver);

// Initialize
createSolver();
requestAnimationFrame(animate);
