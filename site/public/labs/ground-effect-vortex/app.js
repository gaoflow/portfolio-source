const canvas = document.querySelector('#vortex-canvas');
const ctx = canvas.getContext('2d');
const toggleButton = document.querySelector('#toggle');
const restartButton = document.querySelector('#restart');

const WIDTH = 720;
const HEIGHT = 405;
const PHASE_DURATION = 5000;
const DURATION = PHASE_DURATION * 2;
const textScale = window.innerWidth < 480 ? 1.65 : 1;
const colours = {
  ink: '#1a1a18',
  muted: '#6b665c',
  grid: '#eeeae1',
  blue: '#1b365d',
  blueTint: 'rgba(27,54,93,.10)',
  teal: '#0f766e',
  orange: '#c2410c',
  orangeTint: 'rgba(194,65,12,.11)',
  white: '#ffffff',
};

let playing = true;
let elapsed = 0;
let lastFrame = performance.now();

function resetCanvas() {
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = colours.white;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = colours.grid;
  ctx.lineWidth = 0.7;
  for (let x = 0; x <= WIDTH; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
  }
}

function text(value, x, y, size = 12, colour = colours.muted, align = 'left') {
  ctx.fillStyle = colour;
  ctx.font = `650 ${size * textScale}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function arrow(x1, y1, x2, y2, colour = colours.ink, width = 1.7, head = 8) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath(); ctx.fill();
}

function quadraticPoint(a, b, c, t) {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    y: u * u * a.y + 2 * u * t * b.y + t * t * c.y,
  };
}

function curvedArrow(a, b, c, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(b.x, b.y, c.x, c.y); ctx.stroke();
  const p = quadraticPoint(a, b, c, 0.94);
  arrow(p.x, p.y, c.x, c.y, colour, 2.2, 7);
}

function particle(point, colour, radius = 3) {
  ctx.fillStyle = colour;
  ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill();
}

function drawPressureFlow(local) {
  ctx.fillStyle = '#e7e5df';
  ctx.strokeStyle = colours.ink;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(142, 184); ctx.lineTo(578, 184); ctx.lineTo(548, 207); ctx.lineTo(172, 207);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = colours.blueTint;
  ctx.fillRect(142, 112, 436, 70);
  ctx.fillStyle = colours.orangeTint;
  ctx.fillRect(142, 209, 436, 76);
  text('LOW PRESSURE', 360, 145, 12, colours.blue, 'center');
  text('HIGH PRESSURE', 360, 258, 12, colours.orange, 'center');

  const left = [{ x: 175, y: 238 }, { x: 95, y: 215 }, { x: 155, y: 158 }];
  const right = [{ x: 545, y: 238 }, { x: 625, y: 215 }, { x: 565, y: 158 }];
  curvedArrow(left[0], left[1], left[2], colours.orange);
  curvedArrow(right[0], right[1], right[2], colours.orange);

  const phase = (local / PHASE_DURATION) * 2;
  for (let i = 0; i < 9; i += 1) {
    const p = (phase + i / 9) % 1;
    particle(quadraticPoint(left[0], left[1], left[2], p), colours.orange, 2.8);
    particle(quadraticPoint(right[0], right[1], right[2], p), colours.orange, 2.8);
  }

  ctx.strokeStyle = colours.teal;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(132, 190, 39, -0.8, 4.7); ctx.stroke();
  arrow(126, 151, 115, 154, colours.teal, 2, 7);
  ctx.beginPath(); ctx.arc(588, 190, 39, Math.PI + 0.8, -1.55, true); ctx.stroke();
  arrow(594, 151, 605, 154, colours.teal, 2, 7);
  text('TIP FLOW', 360, 330, 12, colours.teal, 'center');
}

function helixPoint(side, s, phase) {
  const startX = side < 0 ? 164 : 556;
  const endX = side < 0 ? 92 : 628;
  const centreX = startX + (endX - startX) * s;
  const centreY = 174 + 190 * s;
  const rotation = (s * 5.3 - phase * side) * Math.PI * 2;
  const amplitude = 5 + 10 * s;
  return {
    x: centreX + Math.sin(rotation) * amplitude,
    y: centreY + Math.cos(rotation) * amplitude * 0.48,
  };
}

function drawTrailingWake(local) {
  ctx.fillStyle = '#e7e5df';
  ctx.strokeStyle = colours.ink;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(185, 100); ctx.lineTo(535, 100); ctx.lineTo(570, 168); ctx.lineTo(150, 168);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  const phase = local / PHASE_DURATION;
  for (const side of [-1, 1]) {
    ctx.strokeStyle = side < 0 ? colours.teal : colours.orange;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i <= 180; i += 1) {
      const s = i / 180;
      const p = helixPoint(side, s, phase);
      i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    }
    ctx.stroke();
    for (let i = 0; i < 11; i += 1) {
      const s = (phase * 1.4 + i / 11) % 1;
      particle(helixPoint(side, s, phase), side < 0 ? colours.teal : colours.orange, 2.8);
    }
  }

  for (const x of [300, 360, 420]) arrow(x, 205, x, 292, colours.blue, 1.5, 7);
  text('DOWNWASH', 360, 315, 11, colours.blue, 'center');
  text('TIP VORTICES', 360, 372, 12, colours.muted, 'center');
}

function draw() {
  resetCanvas();
  if (elapsed < PHASE_DURATION) drawPressureFlow(elapsed);
  else drawTrailingWake(elapsed - PHASE_DURATION);
}

function frame(now) {
  if (playing) elapsed = (elapsed + now - lastFrame) % DURATION;
  lastFrame = now;
  draw();
  requestAnimationFrame(frame);
}

toggleButton.addEventListener('click', () => {
  playing = !playing;
  toggleButton.textContent = playing ? 'Ⅱ' : '▶';
  toggleButton.title = playing ? 'Pause animation' : 'Play animation';
  toggleButton.setAttribute('aria-label', toggleButton.title);
});

restartButton.addEventListener('click', () => {
  elapsed = 0;
  playing = true;
  toggleButton.textContent = 'Ⅱ';
  toggleButton.title = 'Pause animation';
  toggleButton.setAttribute('aria-label', toggleButton.title);
});

requestAnimationFrame(frame);
