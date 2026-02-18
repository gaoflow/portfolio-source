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
    return [Math.round(15 + 220 * normalised), Math.round(118 + 112 * normalised), Math.round(110 - 75 * normalised)];
  }
  const magnitude = Math.abs(normalised);
  return normalised < 0
    ? [Math.round(30 + 210 * magnitude), Math.round(90 - 55 * magnitude), Math.round(120 - 40 * magnitude)]
    : [Math.round(30 + 210 * magnitude), Math.round(105 + 100 * magnitude), Math.round(130 + 80 * magnitude)];
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
  context.imageSmoothingEnabled = false;
  context.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#1b365d';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(24, 16);
  context.lineTo(canvas.width - 24, 16);
  context.lineTo(canvas.width - 38, 9);
  context.moveTo(canvas.width - 24, 16);
  context.lineTo(canvas.width - 38, 23);
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

reynoldsSelect.addEventListener('change', createSolver);
displaySelect.addEventListener('change', render);
toggleButton.addEventListener('click', () => {
  running = !running;
  toggleButton.textContent = running ? 'Pause' : 'Resume';
});
resetButton.addEventListener('click', createSolver);

createSolver();
requestAnimationFrame(animate);
