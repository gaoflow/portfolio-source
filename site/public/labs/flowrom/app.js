const data = await fetch('./data.json').then((response) => {
  if (!response.ok) throw new Error(`field data request failed: ${response.status}`);
  return response.json();
});

const elements = {
  actual: document.querySelector('#actual'),
  reconstructed: document.querySelector('#reconstructed'),
  frame: document.querySelector('#frame'),
  toggle: document.querySelector('#toggle'),
  buttons: document.querySelector('#rank-buttons'),
  status: document.querySelector('#status'),
  rankLabel: document.querySelector('#rank-label'),
  error: document.querySelector('#error'),
  phase: document.querySelector('#phase'),
};
let rank = 2;
let frame = 0;
let running = true;
let previousTime = 0;
elements.frame.max = data.actual.length - 1;

for (const value of data.ranks) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = value;
  button.dataset.rank = value;
  button.classList.toggle('active', value === rank);
  button.addEventListener('click', () => {
    rank = value;
    for (const candidate of elements.buttons.children) candidate.classList.toggle('active', Number(candidate.dataset.rank) === rank);
    draw();
  });
  elements.buttons.append(button);
}

const stops = [
  [0, 5, 18], [23, 27, 59], [35, 59, 112], [43, 106, 130],
  [82, 171, 126], [180, 215, 74], [253, 231, 37],
];
function colour(value) {
  const position = Math.max(0, Math.min(1, value / data.maximumSpeed)) * (stops.length - 1);
  const lower = Math.floor(position);
  const upper = Math.min(stops.length - 1, lower + 1);
  const blend = position - lower;
  return stops[lower].map((channel, index) => Math.round(channel + (stops[upper][index] - channel) * blend));
}

function drawField(canvas, values) {
  const context = canvas.getContext('2d');
  const [width, height] = data.grid;
  const image = context.createImageData(width, height);
  for (let i = 0; i < values.length; i += 1) {
    const [red, green, blue] = colour(values[i]);
    const row = height - 1 - Math.floor(i / width);
    const column = i % width;
    const offset = (row * width + column) * 4;
    image.data[offset] = red;
    image.data[offset + 1] = green;
    image.data[offset + 2] = blue;
    image.data[offset + 3] = 255;
  }
  const buffer = new OffscreenCanvas(width, height);
  buffer.getContext('2d').putImageData(image, 0, 0);
  context.imageSmoothingEnabled = false;
  context.drawImage(buffer, 0, 0, canvas.width, canvas.height);
}

function draw() {
  drawField(elements.actual, data.actual[frame]);
  drawField(elements.reconstructed, data.reconstructed[rank][frame]);
  const snapshot = frame * data.frameStrideSnapshots;
  const heldOut = snapshot >= data.trainingEndsAtSnapshot;
  elements.frame.value = frame;
  elements.rankLabel.textContent = `POD rank ${rank}`;
  elements.error.textContent = `${(data.frameRelativeErrors[rank][frame] * 100).toFixed(3)}%`;
  elements.phase.textContent = heldOut ? 'Held-out interval' : 'Training interval';
  elements.phase.previousElementSibling.classList.toggle('training', !heldOut);
  elements.status.textContent = `Snapshot ${snapshot} / 472`;
}

function animate(time) {
  if (running && time - previousTime > 95) {
    frame = (frame + 1) % data.actual.length;
    previousTime = time;
    draw();
  }
  requestAnimationFrame(animate);
}
elements.frame.addEventListener('input', () => { frame = Number(elements.frame.value); draw(); });
elements.toggle.addEventListener('click', () => {
  running = !running;
  elements.toggle.textContent = running ? 'Pause' : 'Resume';
});
draw();
requestAnimationFrame(animate);
