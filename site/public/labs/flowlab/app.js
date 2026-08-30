import { LBMSolver } from './lbm.js';

const canvas = document.querySelector('#field');
const context = canvas.getContext('2d', { alpha: false });
const reynoldsSelect = document.querySelector('#reynolds');
const displaySelect = document.querySelector('#display');
const toggleButton = document.querySelector('#toggle');
const resetButton = document.querySelector('#reset');
const metrics = document.querySelector('#metrics');
const visual = document.querySelector('.visual');
const legendLow = document.querySelector('#legend-low');
const legendCentre = document.querySelector('#legend-centre');
const legendHigh = document.querySelector('#legend-high');

// High resolution canvas setup
const GRID_W = 96;
const GRID_H = 64;
const offscreen = document.createElement('canvas');
offscreen.width = GRID_W;
offscreen.height = GRID_H;
const offscreenContext = offscreen.getContext('2d', { alpha: false });
const pixels = offscreenContext.createImageData(offscreen.width, offscreen.height);

let solver;
let running = true;
let lastTimestamp = performance.now();
let frameCount = 0;
let framesPerSecond = 0;

// Dynamic Tracer Particles for vibrant 60 FPS fluid flow
const NUM_PARTICLES = 1200;
const particles = new Float32Array(NUM_PARTICLES * 4); // x, y, age, maxAge

function initParticles() {
  for (let i = 0; i < NUM_PARTICLES; i += 1) {
    const idx = i * 4;
    particles[idx] = Math.random() * (GRID_W - 2) + 1;
    particles[idx + 1] = Math.random() * (GRID_H - 2) + 1;
    particles[idx + 2] = Math.random() * 100;
    particles[idx + 3] = 100 + Math.random() * 100;
  }
}

function createSolver() {
  solver = new LBMSolver({
    width: GRID_W + 2,
    height: GRID_H + 2,
    reynolds: Number(reynoldsSelect.value),
    lidVelocity: 0.08,
  });
  initParticles();
}

function updateLegend() {
  const showingVorticity = displaySelect.value === 'vorticity';
  visual.dataset.field = showingVorticity ? 'vorticity' : 'speed';
  legendLow.textContent = showingVorticity ? 'Clockwise rotation' : 'Low speed';
  legendCentre.textContent = showingVorticity ? 'Zero vorticity' : 'Velocity magnitude';
  legendHigh.textContent = showingVorticity ? 'Counter-clockwise rotation' : 'High speed';
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

// Sample interpolated velocity from grid
function sampleVelocity(gx, gy) {
  const x0 = Math.max(1, Math.min(GRID_W, Math.floor(gx)));
  const y0 = Math.max(1, Math.min(GRID_H, Math.floor(gy)));
  const cell = (y0) * solver.width + x0;
  return {
    u: solver.ux[cell],
    v: solver.uy[cell]
  };
}

function updateAndRenderParticles() {
  const scaleX = canvas.width / GRID_W;
  const scaleY = canvas.height / GRID_H;
  
  context.fillStyle = 'rgba(27, 54, 93, 0.24)';
  context.strokeStyle = 'rgba(27, 54, 93, 0.24)';
  context.lineWidth = 0.9;
  context.beginPath();
  
  for (let i = 0; i < NUM_PARTICLES; i += 1) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    let age = particles[idx + 2];
    const maxAge = particles[idx + 3];
    
    // Sample local flow speed
    const vel = sampleVelocity(px, py);
    const speed = Math.hypot(vel.u, vel.v);
    
    // Advect particle along velocity field
    const dt = 6;
    const nx = px + vel.u * dt;
    const ny = py + vel.v * dt;
    
    // Screen coordinates
    const sx = px * scaleX;
    const sy = (GRID_H - py) * scaleY;
    const snx = nx * scaleX;
    const sny = (GRID_H - ny) * scaleY;
    
    context.moveTo(sx, sy);
    context.lineTo(snx, sny);
    
    px = nx;
    py = ny;
    age += 1;
    
    // Respawn if out of bounds or expired
    if (px < 1.5 || px > GRID_W - 1.5 || py < 1.5 || py > GRID_H - 1.5 || age > maxAge || (speed < 0.001 && Math.random() < 0.05)) {
      px = Math.random() * (GRID_W - 4) + 2;
      py = Math.random() * (GRID_H - 4) + 2;
      age = 0;
    }
    
    particles[idx] = px;
    particles[idx + 1] = py;
    particles[idx + 2] = age;
  }
  
  context.stroke();
}

function render() {
  const vorticity = displaySelect.value === 'vorticity' ? solver.vorticity() : null;
  const signed = vorticity !== null;
  const scale = signed ? 55 : 1 / solver.lidVelocity;
  
  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const cell = (y + 1) * solver.width + x + 1;
      const raw = signed ? vorticity[cell] : Math.hypot(solver.ux[cell], solver.uy[cell]);
      const [red, green, blue] = colour(raw * scale, signed);
      const pixel = ((GRID_H - 1 - y) * GRID_W + x) * 4;
      pixels.data[pixel] = red;
      pixels.data[pixel + 1] = green;
      pixels.data[pixel + 2] = blue;
      pixels.data[pixel + 3] = 255;
    }
  }
  
  offscreenContext.putImageData(pixels, 0, 0);
  
  // Smooth canvas scaling
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
  
  // Render animated flow tracer particles
  if (running) {
    updateAndRenderParticles();
  }
  
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
  if (running) solver.step(1);
  render();
  frameCount += 1;
  if (timestamp - lastTimestamp >= 1_000) {
    framesPerSecond = Math.round((frameCount * 1_000) / (timestamp - lastTimestamp));
    frameCount = 0;
    lastTimestamp = timestamp;
  }
  metrics.textContent = `Re ${solver.reynolds} · viscosity ${(solver.viscosity * 1000).toFixed(2)} · ${solver.iteration.toLocaleString()} iterations · ${framesPerSecond} FPS`;
  requestAnimationFrame(animate);
}

// ==========================================
// ROBUST POINTER / MOUSE / TOUCH INTERACTION
// ==========================================
let isDragging = false;
let lastPointerX = 0;
let lastPointerY = 0;

function handlePointerStart(clientX, clientY) {
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  lastPointerX = Math.max(0, Math.min(GRID_W - 1, ((clientX - rect.left) / rect.width) * GRID_W));
  lastPointerY = Math.max(0, Math.min(GRID_H - 1, (1 - (clientY - rect.top) / rect.height) * GRID_H));
}

function handlePointerMove(clientX, clientY) {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const currGridX = Math.max(0, Math.min(GRID_W - 1, ((clientX - rect.left) / rect.width) * GRID_W));
  const currGridY = Math.max(0, Math.min(GRID_H - 1, (1 - (clientY - rect.top) / rect.height) * GRID_H));
  const deltaX = currGridX - lastPointerX;
  const deltaY = currGridY - lastPointerY;
  const dragSpeed = Math.hypot(deltaX, deltaY);

  if (dragSpeed > 0.05) {
    const pushMagnitude = Math.min(0.07, dragSpeed * 0.025);
    const pushUx = (deltaX / dragSpeed) * pushMagnitude;
    const pushUy = (deltaY / dragSpeed) * pushMagnitude;
    const sampleCount = Math.min(64, Math.max(1, Math.ceil(dragSpeed / 1.25)));
    const radius = 5;
    const particlesPerSample = Math.max(1, Math.ceil(20 / sampleCount));

    // Fill the entire pointer path so quick drags cannot skip most of the fluid.
    for (let sample = 1; sample <= sampleCount; sample += 1) {
      const progress = sample / sampleCount;
      const sampleX = lastPointerX + deltaX * progress;
      const sampleY = lastPointerY + deltaY * progress;
      const cx = Math.round(sampleX);
      const cy = Math.round(sampleY);

      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const gx = cx + dx;
          const gy = cy + dy;
          if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
            const distSq = dx * dx + dy * dy;
            if (distSq <= radius * radius) {
              const weight = Math.exp(-distSq / 12.5);
              const cell = (gy + 1) * solver.width + gx + 1;
              const velocityX = Math.max(-0.1, Math.min(0.1, solver.ux[cell] + pushUx * weight));
              const velocityY = Math.max(-0.1, Math.min(0.1, solver.uy[cell] + pushUy * weight));
              solver.setVelocityAt(gx + 1, gy + 1, velocityX, velocityY);
            }
          }
        }
      }

      for (let i = 0; i < particlesPerSample; i += 1) {
        const pIdx = Math.floor(Math.random() * NUM_PARTICLES) * 4;
        particles[pIdx] = sampleX + (Math.random() - 0.5) * 3;
        particles[pIdx + 1] = sampleY + (Math.random() - 0.5) * 3;
        particles[pIdx + 2] = 0;
      }
    }
  }

  lastPointerX = currGridX;
  lastPointerY = currGridY;
}

function handlePointerEnd() {
  isDragging = false;
  lastPointerX = 0;
  lastPointerY = 0;
}

// Mouse events
canvas.addEventListener('mousedown', (e) => handlePointerStart(e.clientX, e.clientY));
window.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
window.addEventListener('mouseup', handlePointerEnd);

// Touch events for mobile/tablets
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (isDragging && e.touches.length > 0) {
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('touchend', handlePointerEnd);
window.addEventListener('touchcancel', handlePointerEnd);

// UI Event Listeners
reynoldsSelect.addEventListener('change', createSolver);
displaySelect.addEventListener('change', () => {
  updateLegend();
  render();
});
toggleButton.addEventListener('click', () => {
  running = !running;
  toggleButton.textContent = running ? 'Pause' : 'Resume';
});
resetButton.addEventListener('click', createSolver);

// Initialize
updateLegend();
createSolver();
requestAnimationFrame(animate);
