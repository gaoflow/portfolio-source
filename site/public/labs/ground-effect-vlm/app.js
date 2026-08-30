const response = await fetch('./data.json');
if (!response.ok) throw new Error(`Ground-effect data request failed: ${response.status}`);
const data = await response.json();
const elements = {
  height: document.querySelector('#height'), alpha: document.querySelector('#alpha'),
  heightLabel: document.querySelector('#height-label'), alphaLabel: document.querySelector('#alpha-label'),
  cl: document.querySelector('#cl'), cdi: document.querySelector('#cdi'), amp: document.querySelector('#amp'),
  efficiency: document.querySelector('#efficiency'), clDelta: document.querySelector('#cl-delta'),
  caseLabel: document.querySelector('#case-label'), reset: document.querySelector('#reset'),
};
const scene = document.querySelector('#scene');
const chart = document.querySelector('#chart');
let currentCase = data.cases[Number(elements.height.value)];

function canvasContext(canvas) {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  }
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}

function drawScene() {
  const { context: ctx, width, height } = canvasContext(scene);
  ctx.clearRect(0, 0, width, height);
  const groundY = height * 0.64;
  const heightFraction = (Math.log10(currentCase.height) - Math.log10(0.25)) / (Math.log10(50) - Math.log10(0.25));
  const wingY = groundY - 42 - heightFraction * height * 0.33;
  const imageY = groundY + (groundY - wingY);
  const centreX = width * 0.47;
  const halfSpan = width * 0.31;
  const chord = Math.max(18, width * 0.055);

  ctx.strokeStyle = '#eef1f5'; ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 42) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 0; y < height; y += 42) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

  ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(width, groundY); ctx.stroke();
  ctx.fillStyle = 'rgba(194,65,12,.08)'; ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = '#57534a'; ctx.font = '13px ui-monospace, monospace'; ctx.fillText('z = 0 / GROUND PLANE', 10, groundY - 12);

  function wing(y, colour, alpha, image = false) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = colour; ctx.strokeStyle = colour; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(centreX - halfSpan, y + chord * .18); ctx.lineTo(centreX + halfSpan, y + chord * .18);
    ctx.lineTo(centreX + halfSpan * .92, y - chord * .45); ctx.lineTo(centreX - halfSpan * .92, y - chord * .45); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(centreX - halfSpan * .94, y); ctx.lineTo(centreX + halfSpan * .94, y); ctx.stroke();
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(centreX + side * halfSpan * .94, y); ctx.lineTo(width * .98, y + (image ? 36 : -36)); ctx.stroke(); }
    ctx.fillStyle = colour; ctx.font = '14px ui-monospace, monospace'; ctx.fillText(image ? '−Γ IMAGE VORTEX' : '+Γ REAL WING', centreX - 58, y - chord - 7);
    ctx.restore();
  }
  wing(wingY, '#1b365d', 0.95, false); wing(imageY, '#c2410c', 0.26, true);

  const dimensionY = wingY - chord * 1.35;
  ctx.strokeStyle = '#57534a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(centreX - halfSpan, dimensionY); ctx.lineTo(centreX + halfSpan, dimensionY); ctx.stroke();
  for (const x of [centreX - halfSpan, centreX + halfSpan]) {
    ctx.beginPath(); ctx.moveTo(x, dimensionY - 5); ctx.lineTo(x, dimensionY + 5); ctx.stroke();
  }
  ctx.fillStyle = '#57534a'; ctx.font = '14px ui-monospace, monospace'; ctx.fillText('b = 4c', centreX - 28, dimensionY - 8);
  ctx.font = '12px ui-monospace, monospace'; ctx.fillText('BOUND VORTEX · x/c = 0.25', centreX - halfSpan, wingY + chord * .45);

  ctx.setLineDash([5, 5]); ctx.strokeStyle = '#57534a'; ctx.beginPath(); ctx.moveTo(centreX, wingY); ctx.lineTo(centreX, groundY); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#1a1a18'; ctx.font = '15px ui-monospace, monospace'; ctx.fillText(`h/c ${currentCase.height.toFixed(currentCase.height < 1 ? 2 : 1)}`, centreX + 9, (wingY + groundY) / 2);
  ctx.fillStyle = '#57534a'; ctx.font = '12px ui-monospace, monospace'; ctx.fillText('SCHEMATIC — NOT TO SCALE', 10, height - 12);
}

function drawChart() {
  const { context: ctx, width, height } = canvasContext(chart);
  ctx.clearRect(0, 0, width, height);
  const margin = { left: 62, right: 24, top: 24, bottom: 48 };
  const plotWidth = width - margin.left - margin.right; const plotHeight = height - margin.top - margin.bottom;
  ctx.strokeStyle = '#e5e3d8'; ctx.lineWidth = 1; ctx.fillStyle = '#57534a'; ctx.font = '13px ui-monospace, monospace';
  for (let i = 0; i <= 4; i++) {
    const y = margin.top + plotHeight * i / 4; ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(width - margin.right, y); ctx.stroke();
    ctx.fillText((1 - i / 4).toFixed(2), 7, y + 3);
  }
  for (const tick of [-0.5, -0.25, 0, 0.25, 0.5]) {
    const x = margin.left + (tick + .5) * plotWidth; ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, height - margin.bottom); ctx.stroke();
    ctx.fillText(tick.toFixed(2), x - 18, height - 16);
  }
  ctx.strokeStyle = '#1b365d'; ctx.lineWidth = 2.2; ctx.beginPath();
  currentCase.span.forEach((span, index) => {
    const x = margin.left + (span + .5) * plotWidth;
    const y = margin.top + (1 - currentCase.circulation[index]) * plotHeight;
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }); ctx.stroke();
  ctx.fillStyle = '#57534a'; ctx.fillText('y/b', margin.left + plotWidth / 2 - 10, height - 2); ctx.save(); ctx.translate(17, height * .58); ctx.rotate(-Math.PI / 2); ctx.fillText('Γ / Γmax', 0, 0); ctx.restore();
}

function update() {
  currentCase = data.cases[Number(elements.height.value)];
  const alpha = Number(elements.alpha.value); const scale = alpha / data.basisAlphaDegrees;
  const cl = currentCase.clAtFourDegrees * scale; const cdi = currentCase.cdiAtFourDegrees * scale ** 2;
  elements.heightLabel.textContent = `h/c ${currentCase.height.toFixed(currentCase.height < 1 ? 2 : 1)}`;
  elements.alphaLabel.textContent = `α ${alpha >= 0 ? '+' : ''}${alpha.toFixed(1)}°`;
  elements.cl.textContent = cl.toFixed(3); elements.cdi.textContent = cdi.toFixed(4);
  elements.amp.textContent = `${currentCase.amplification.toFixed(2)}×`; elements.efficiency.textContent = currentCase.efficiency.toFixed(2);
  elements.clDelta.textContent = alpha === 0 ? 'Zero-incidence state' : `${((currentCase.amplification - 1) * 100).toFixed(1)}% vs free air`;
  elements.caseLabel.textContent = elements.heightLabel.textContent;
  drawScene(); drawChart();
}
elements.height.addEventListener('input', update); elements.alpha.addEventListener('input', update);
elements.reset.addEventListener('click', () => { elements.height.value = 6; elements.alpha.value = 4; update(); });
new ResizeObserver(update).observe(document.body);
update();
