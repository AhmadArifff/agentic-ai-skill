// Shared runtime helpers and design tokens for the agentic-ai-intro motlab prototype.
const q = new URLSearchParams(location.search);
const S = parseFloat(q.get('scale') || '1');
const W = 1920, H = 1080;
const cv = document.getElementById('c');
cv.width = Math.round((W * S) / 2) * 2;
cv.height = Math.round((H * S) / 2) * 2;
const ctx = cv.getContext('2d');

const PALETTE = {
  ink: '#111318',
  paper: '#F4F1EA',
  surface: '#1B1F2A',
  border: '#2B3245',
  muted: '#64748B',
  mutedLight: '#94A3B8',
  primary: '#2563EB',
  verified: '#10B981',
  amber: '#F59E0B',
  white: '#F8FAFC'
};

const FONT_HEAD = '"Segoe UI", system-ui, -apple-system, sans-serif';
const FONT_MONO = '"Cascadia Code", "Consolas", monospace';
const TAU = Math.PI * 2;

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const outCubic = k => 1 - Math.pow(1 - clamp(k), 3);
const outExpo = k => (clamp(k) >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(k)));
const inOutCubic = k => {
  k = clamp(k);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};
const bump = k => Math.sin(clamp(k) * Math.PI);

function drawSubtleGrid(g, t, strokeColor) {
  const cell = 120;
  const shiftX = (t * 18) % cell;
  const shiftY = (t * 9) % cell;
  g.save();
  g.strokeStyle = strokeColor;
  g.lineWidth = 2;
  g.beginPath();
  for (let x = shiftX - cell; x < W + cell; x += cell) {
    g.moveTo(x, 0);
    g.lineTo(x, H);
  }
  for (let y = shiftY - cell; y < H + cell; y += cell) {
    g.moveTo(0, y);
    g.lineTo(W, y);
  }
  g.stroke();
  g.restore();
}

function drawMaskedWords(g, text, t, opts) {
  const {
    at = 0.2,
    y = 540,
    size = 96,
    weight = 700,
    color = PALETTE.ink,
    gap = 0.08,
    rise = 0.34,
    tracking = -0.025
  } = opts;
  g.save();
  g.font = `${weight} ${size}px ${FONT_HEAD}`;
  g.letterSpacing = `${Math.round(tracking * size)}px`;
  g.textBaseline = 'alphabetic';
  const words = text.split(' ');
  const widths = words.map(w => g.measureText(w).width);
  const space = g.measureText(' ').width;
  let x = (W - widths.reduce((a, b) => a + b, 0) - space * (words.length - 1)) / 2;
  words.forEach((word, i) => {
    const k = outCubic(prog(t, at + i * gap, at + i * gap + rise));
    if (k > 0.001) {
      g.save();
      g.beginPath();
      g.rect(x - 16, y - size * 1.1, widths[i] + 32, size * 1.45);
      g.clip();
      g.globalAlpha = clamp(k * 1.25);
      g.fillStyle = color;
      g.fillText(word, x, y + (1 - k) * (size * 0.55));
      g.restore();
    }
    x += widths[i] + space;
  });
  g.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load ' + src));
    img.src = src;
  });
}

function mountScene({ total, events = [], preload = [], draw }) {
  window.TOTAL = total;
  window.EVENTS = events;
  let assets = [];
  window.renderAt = t => {
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.globalAlpha = 1;
    draw(ctx, t, assets);
  };
  window.ready = Promise.all([
    document.fonts.ready.catch(() => {}),
    ...preload.map(p => loadImage(p))
  ]).then(results => {
    assets = results.slice(1);
    if (q.has('t') || window.top !== window) {
      window.renderAt(parseFloat(q.get('t') || '0'));
    } else {
      requestAnimationFrame(function loop(ms) {
        window.renderAt((ms / 1000) % total);
        requestAnimationFrame(loop);
      });
    }
    return true;
  });
}
