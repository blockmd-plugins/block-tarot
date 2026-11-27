/**
 * Midnight Copperplate vector SVG generator for Block Tarot Mode.
 * Faithful ES-module port of Block's internal/tarot/art.go TG-LIB primitives,
 * card back, parchment frame, ornaments, star chart, moon-phase ring, and 22 Major Arcana glyphs.
 */

const PI = Math.PI;

let uidCounter = 0;
function nextUid(prefix = 'tc') {
  uidCounter = (uidCounter + 1) % 1000000;
  return `${prefix}-${uidCounter}`;
}

function tgRound(n) {
  const v = Math.round(n * 100) / 100;
  return Math.abs(v) < 1e-6 ? 0 : v;
}

function tgF(n) {
  return String(tgRound(n));
}

function tgP(x, y) {
  return `${tgF(x)} ${tgF(y)}`;
}

export function tgCirc(cx, cy, r) {
  return `M${tgP(cx - r, cy)}a${tgF(r)} ${tgF(r)} 0 1 0 ${tgF(2 * r)} 0a${tgF(r)} ${tgF(r)} 0 1 0 ${tgF(-2 * r)} 0`;
}

export function tgEll(cx, cy, rx, ry) {
  return `M${tgP(cx - rx, cy)}a${tgF(rx)} ${tgF(ry)} 0 1 0 ${tgF(2 * rx)} 0a${tgF(rx)} ${tgF(ry)} 0 1 0 ${tgF(-2 * rx)} 0`;
}

export function tgLine(...pts) {
  let out = '';
  for (let i = 0; i < pts.length; i++) {
    out += (i === 0 ? 'M' : 'L') + tgP(pts[i][0], pts[i][1]);
  }
  return out;
}

export function tgShape(pts) {
  return `${tgLine(...pts)}Z`;
}

export function tgStar(cx, cy, R, r, n, rot = 0) {
  let out = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -PI / 2 + rot + (i * PI) / n;
    const q = i % 2 === 1 ? r : R;
    out += (i === 0 ? 'M' : 'L') + tgP(cx + q * Math.cos(a), cy + q * Math.sin(a));
  }
  return `${out}Z`;
}

export function tgRays(cx, cy, r1, r2, n, off = 0) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = -PI / 2 + off + (i * 2 * PI) / n;
    out += `M${tgP(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a))}L${tgP(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a))}`;
  }
  return out;
}

export function tgCres(cx, cy, r, k, right = false) {
  const s1 = right ? '0' : '1';
  const s2 = right ? '1' : '0';
  return `M${tgP(cx, cy - r)}A${tgF(r)} ${tgF(r)} 0 1 ${s1} ${tgP(cx, cy + r)}A${tgF(r * k)} ${tgF(r)} 0 1 ${s2} ${tgP(cx, cy - r)}Z`;
}

export function tgWave(x1, x2, y, a, n) {
  const w = (x2 - x1) / n;
  let out = `M${tgP(x1, y)}`;
  for (let i = 0; i < n; i++) {
    const amp = i % 2 === 1 ? a : -a;
    out += `q${tgF(w / 2)} ${tgF(amp)} ${tgF(w)} 0`;
  }
  return out;
}

export function tgDrop(x, y) {
  return `M${tgP(x, y)}q-2.2 3.4 0 4.8q2.2-1.4 0-4.8Z`;
}

export function tgNeedle(cx, cy, r1, r2, n, w, off = 0) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = -PI / 2 + off + (i * 2 * PI) / n;
    out += `M${tgP(cx + r1 * Math.cos(a - w), cy + r1 * Math.sin(a - w))}L${tgP(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a))}L${tgP(cx + r1 * Math.cos(a + w), cy + r1 * Math.sin(a + w))}Z`;
  }
  return out;
}

export function tgSwell(x1, y1, x2, y2, w) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const l = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = ((y1 - y2) / l) * w;
  const ny = ((x2 - x1) / l) * w;
  return `M${tgP(x1, y1)}Q${tgP(mx + nx, my + ny)} ${tgP(x2, y2)}Q${tgP(mx - nx, my - ny)} ${tgP(x1, y1)}Z`;
}

export function tgBox(x1, y1, x2, y2) {
  return [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ];
}

export function tgOval(cx, cy, rx, ry, n = 32) {
  const count = n > 0 ? n : 32;
  const p = [];
  for (let i = 0; i < count; i++) {
    const a = (i * 2 * PI) / count + 0.01;
    p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return p;
}

export function tgSector(cx, cy, r1, r2, a1, a2) {
  const p = [];
  for (let i = 0; i <= 8; i++) {
    const a = ((a1 + ((a2 - a1) * i) / 8.0) * PI) / 180.0;
    p.push([cx + r2 * Math.cos(a), cy + r2 * Math.sin(a)]);
  }
  for (let j = 8; j >= 0; j--) {
    const b = ((a1 + ((a2 - a1) * j) / 8.0) * PI) / 180.0;
    p.push([cx + r1 * Math.cos(b), cy + r1 * Math.sin(b)]);
  }
  return p;
}

function tgClip(polys, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const ts = [];
  for (const p of polys) {
    for (let i = 0; i < p.length; i++) {
      const A = p[i];
      const B = p[(i + 1) % p.length];
      const ex = B[0] - A[0];
      const ey = B[1] - A[1];
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((A[0] - x1) * ey - (A[1] - y1) * ex) / den;
      const u = ((A[0] - x1) * dy - (A[1] - y1) * dx) / den;
      if (u >= 0 && u < 1) ts.push(t);
    }
  }
  ts.sort((a, b) => a - b);
  let out = '';
  for (let k = 0; k + 1 < ts.length; k += 2) {
    const a = Math.max(0, ts[k]);
    const c = Math.min(1, ts[k + 1]);
    if (c - a > 1e-3) {
      out += `M${tgP(x1 + dx * a, y1 + dy * a)}L${tgP(x1 + dx * c, y1 + dy * c)}`;
    }
  }
  return out;
}

export function tgHatch(polys, deg, gap, ph = 0) {
  const a = (deg * PI) / 180.0;
  const c = Math.cos(a);
  const s = Math.sin(a);
  let lo = 1e9;
  let hi = -1e9;
  let ul = 1e9;
  let uh = -1e9;
  for (const p of polys) {
    for (const q of p) {
      const v = q[1] * c - q[0] * s;
      const u = q[0] * c + q[1] * s;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
      if (u < ul) ul = u;
      if (u > uh) uh = u;
    }
  }
  let out = '';
  const start = Math.floor(lo / gap) * gap + ph + gap / 2;
  for (let v = start; v < hi; v += gap) {
    out += tgClip(polys, (ul - 1) * c - v * s, (ul - 1) * s + v * c, (uh + 1) * c - v * s, (uh + 1) * s + v * c);
  }
  return out;
}

export function tgBurst(polys, cx, cy, n, off = 0) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = off + (i * 2 * PI) / n;
    out += tgClip(polys, cx, cy, cx + 240 * Math.cos(a), cy + 240 * Math.sin(a));
  }
  return out;
}

function tgInside(polys, x, y) {
  let k = 0;
  for (const p of polys) {
    for (let i = 0; i < p.length; i++) {
      const A = p[i];
      const B = p[(i + 1) % p.length];
      if ((A[1] > y) !== (B[1] > y) && x < A[0] + ((y - A[1]) * (B[0] - A[0])) / (B[1] - A[1])) {
        k++;
      }
    }
  }
  return k % 2 === 1;
}

export function tgStip(polys, n, r, seed) {
  let s = seed;
  let x1 = 1e9;
  let x2 = -1e9;
  let y1 = 1e9;
  let y2 = -1e9;
  for (const p of polys) {
    for (const q of p) {
      if (q[0] < x1) x1 = q[0];
      if (q[0] > x2) x2 = q[0];
      if (q[1] < y1) y1 = q[1];
      if (q[1] > y2) y2 = q[1];
    }
  }
  let out = '';
  for (let i = 0; i < n; i++) {
    s = (s * 16807) % 2147483647;
    const rnd1 = s / 2147483647.0;
    s = (s * 16807) % 2147483647;
    const rnd2 = s / 2147483647.0;
    const x = x1 + rnd1 * (x2 - x1);
    const y = y1 + rnd2 * (y2 - y1);
    if (tgInside(polys, x, y)) {
      out += tgCirc(x, y, r);
    }
  }
  return out;
}

export function tgQ4(g) {
  const signs = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];
  let out = '';
  for (const [sx, sy] of signs) {
    out += g(
      (x) => 50 + sx * (x - 50),
      (y) => 86 + sy * (y - 86)
    );
  }
  return out;
}

function buildAssets() {
  // 1. Card back lattice pattern (viewBox 0 0 100 172)
  let latticeLines = '';
  let latticeDots = '';
  for (let col = 1; col <= 15; col++) {
    const x = 2.0 + col * 6.0;
    for (let row = 0; row <= 16; row++) {
      const y = 3.44 + row * 10.32;
      latticeLines += `M${tgP(x + 3, y)}L${tgP(x + 6, y + 5.16)}L${tgP(x + 3, y + 10.32)}L${tgP(x, y + 5.16)}Z`;
      latticeDots += tgCirc(x + 3, y + 5.16, 0.32);
    }
  }

  const fan = tgQ4((X, Y) => {
    let out = '';
    for (let k = 1; k < 8; k++) {
      const a = (k * PI) / 16.0;
      out += `M${tgP(X(10.5 + 3.2 * Math.cos(a)), Y(10.5 + 3.2 * Math.sin(a)))}L${tgP(X(10.5 + 9.2 * Math.cos(a)), Y(10.5 + 9.2 * Math.sin(a)))}`;
    }
    for (let k = 0; k <= 6; k++) {
      const a = (k * PI) / 12.0;
      out += (k === 0 ? 'M' : 'L') + tgP(X(10.5 + 12 * Math.cos(a)), Y(10.5 + 12 * Math.sin(a)));
    }
    return out;
  });

  let beads = '';
  for (let i = 0; i < 24; i++) {
    const a = (i * PI) / 12.0;
    beads += tgCirc(50 + 24.45 * Math.cos(a), 86 + 24.45 * Math.sin(a), 0.5);
  }

  const backLine =
    'M8.6 4.6H91.4A4 4 0 0 1 95.4 8.6V163.4A4 4 0 0 1 91.4 167.4H8.6A4 4 0 0 1 4.6 163.4V8.6A4 4 0 0 1 8.6 4.6Z' +
    'M10.5 10.5H89.5V161.5H10.5ZM50 20L85 86L50 152L15 86Z' +
    tgCirc(50, 86, 27) +
    tgCirc(50, 86, 20) +
    tgStar(50, 86, 18.2, 7.2, 8, 0) +
    'M10.5 20.5A10 10 0 0 0 20.5 10.5M79.5 10.5A10 10 0 0 0 89.5 20.5M89.5 151.5A10 10 0 0 0 79.5 161.5M20.5 161.5A10 10 0 0 0 10.5 151.5' +
    'M50 47.5V57.5M50 114.5V124.5';

  const backThin =
    'M6.3 6.3H93.7V165.7H6.3ZM11.8 11.8H88.2V160.2H11.8ZM50 24.6L82.55 86L50 147.4L17.45 86Z' +
    tgCirc(50, 86, 25.4) +
    tgCirc(50, 86, 23.5) +
    tgRays(50, 86, 20, 22, 72, 0) +
    tgRays(50, 86, 3.4, 18.2, 8, 0) +
    tgRays(50, 86, 3.4, 7.2, 8, PI / 8) +
    fan;

  const backGilt =
    tgStar(50, 86, 10.6, 4.2, 8, PI / 8) +
    tgCirc(50, 86, 3.4) +
    tgCirc(50, 86, 1.3) +
    beads +
    tgCres(50, 39.5, 5.6, 0.5, true) +
    tgCres(50, 132.5, 5.6, 0.5, false) +
    tgStar(50, 28.6, 1.8, 0.7, 4, 0) +
    tgStar(50, 143.4, 1.8, 0.7, 4, 0) +
    tgStar(19.6, 86, 1.8, 0.7, 4, 0) +
    tgStar(80.4, 86, 1.8, 0.7, 4, 0) +
    tgStar(50, 52.5, 1.5, 1, 2, 0) +
    tgStar(50, 119.5, 1.5, 1, 2, 0) +
    tgQ4((X, Y) => tgStar(X(27), Y(40), 3, 1.1, 4, 0) + tgStar(X(20), Y(61), 2, 0.75, 4, 0) + tgCirc(X(34), Y(29.5), 0.7));

  // 2. Card frame & laid paper texture
  let laidH = '';
  for (let y = 0.75; y < 172; y += 1.5) {
    laidH += `M0 ${tgF(y)}H100`;
  }
  let laidV = '';
  for (let x = 4.5; x < 100; x += 9.0) {
    laidV += `M${tgF(x)} 0V172`;
  }

  const frameLine = 'M8.5 4.5H91.5A4 4 0 0 0 95.5 8.5V163.5A4 4 0 0 0 91.5 167.5H8.5A4 4 0 0 0 4.5 163.5V8.5A4 4 0 0 0 8.5 4.5Z';
  const frameThin = 'M10.09 6.4H89.91A5.9 5.9 0 0 0 93.6 10.09V161.91A5.9 5.9 0 0 0 89.91 165.6H10.09A5.9 5.9 0 0 0 6.4 161.91V10.09A5.9 5.9 0 0 0 10.09 6.4Z';
  const frameGilt =
    tgQ4((X, Y) => tgCirc(X(5.7), Y(5.7), 0.7) + tgStar(X(10.9), Y(10.9), 1.8, 0.62, 4, 0)) +
    tgStar(50, 5.45, 1.45, 2.1, 2, 0) +
    tgStar(50, 166.55, 1.45, 2.1, 2, 0) +
    tgStar(5.45, 86, 2.1, 1.45, 2, 0) +
    tgStar(94.55, 86, 2.1, 1.45, 2, 0) +
    tgCirc(45.6, 5.45, 0.5) +
    tgCirc(54.4, 5.45, 0.5) +
    tgCirc(45.6, 166.55, 0.5) +
    tgCirc(54.4, 166.55, 0.5);

  // 3. Slot placeholder
  const slotSolid =
    'M7 20V7H20M80 7H93V20M93 152V165H80M20 165H7V152' +
    'M50 78L51.7 84.3L58 86L51.7 87.7L50 94L48.3 87.7L42 86L48.3 84.3Z';
  const slotRing = tgCirc(50, 86, 12);

  // 4. Corner flourish, fleuron, compass, mystic eye
  const corner =
    'M3 25V3H25M3 14A11 11 0 0 0 14 3M3 18.5A15.5 15.5 0 0 0 18.5 3' +
    'M18 14.5L18.9 17.1L21.5 18L18.9 18.9L18 21.5L17.1 18.9L14.5 18L17.1 17.1Z' +
    'M3 26.2L4.5 28.2L3 30.2L1.5 28.2ZM26.2 3L28.2 1.5L30.2 3L28.2 4.5Z' +
    tgCirc(7.2, 7.2, 1.6);

  const fleuron =
    'M0 5H29M55 5H84M42 1L46.5 5L42 9L37.5 5ZM42 3.4L43.8 5L42 6.6L40.2 5ZM33 3.3L34.9 5L33 6.7L31.1 5ZM51 3.3L52.9 5L51 6.7L49.1 5Z';

  const compassLine =
    tgCirc(60, 60, 52) +
    tgCirc(60, 60, 49.5) +
    tgCirc(60, 60, 31) +
    tgCirc(60, 60, 6) +
    tgRays(60, 60, 49.5, 52, 72, 0) +
    tgNeedle(60, 60, 7, 46, 4, 0.36, 0) +
    tgNeedle(60, 60, 7, 34, 4, 0.3, PI / 4) +
    tgRays(60, 60, 36, 44, 8, PI / 8);

  let compassGilt = tgStar(60, 5.2, 2.6, 1, 4, 0);
  for (let i = 0; i < 4; i++) {
    const a = -PI / 2 + (i * PI) / 2;
    compassGilt += tgShape([
      [60 + 7 * Math.cos(a - 0.36), 60 + 7 * Math.sin(a - 0.36)],
      [60 + 46 * Math.cos(a), 60 + 46 * Math.sin(a)],
      [60 + 6.5 * Math.cos(a), 60 + 6.5 * Math.sin(a)],
    ]);
  }

  const eyeOutline = 'M2 14Q22 -4 42 14Q22 32 2 14Z' + tgCirc(22, 14, 5.5);
  const eyePupil = tgCirc(22, 14, 1.6);

  // 5. Star chart (viewBox 0 0 800 800)
  const chartTicks = tgRays(400, 400, 362, 384, 72, 0) + tgRays(400, 400, 372, 384, 72, PI / 72);
  const chartFineD = tgRays(400, 400, 362, 367, 360, 0) + tgRays(400, 400, 196, 290, 12, PI / 12);
  const constellations =
    'M128 232L176 196L236 214L268 166L330 150' +
    'M520 640L572 606L640 622L676 580' +
    'M600 150L644 196L702 206' +
    'M110 560L150 600L132 652';
  const chartMain = tgCirc(400, 400, 384) + tgCirc(400, 400, 362) + tgCirc(400, 400, 196) + chartTicks + constellations;
  const chartFine = tgCirc(400, 400, 330) + chartFineD;
  const chartDash = tgCirc(400, 400, 290);
  const chartCross = 'M400 16V784M16 400H784';
  const chartEllipse = tgEll(400, 400, 290, 118);
  const chartStars =
    tgCirc(128, 232, 3) +
    tgCirc(176, 196, 2.4) +
    tgCirc(236, 214, 3.2) +
    tgCirc(268, 166, 2.2) +
    tgCirc(330, 150, 2.8) +
    tgCirc(520, 640, 2.6) +
    tgCirc(572, 606, 3.2) +
    tgCirc(640, 622, 2.2) +
    tgCirc(676, 580, 2.8) +
    tgCirc(600, 150, 2.4) +
    tgCirc(644, 196, 3) +
    tgCirc(702, 206, 2.2) +
    tgCirc(110, 560, 2.6) +
    tgCirc(150, 600, 2.2) +
    tgCirc(132, 652, 3) +
    tgStar(236, 214, 8, 2.4, 4, 0) +
    tgStar(572, 606, 8, 2.4, 4, 0) +
    tgStar(644, 196, 7, 2.1, 4, 0) +
    tgStar(132, 652, 7, 2.1, 4, 0);

  // 6. Moon phase ring (viewBox 0 0 760 760)
  let phaseRing = tgCirc(380, 380, 372);
  let phaseFill = '';
  for (let i = 0; i < 8; i++) {
    const a = -PI / 2 + (i * PI) / 4;
    const x = 380 + 351 * Math.cos(a);
    const y = 380 + 351 * Math.sin(a);
    const r = 13.0;
    phaseRing += tgCirc(x, y, r);
    if (i === 1) {
      phaseFill += tgCres(x, y, r, 0.55, false);
    } else if (i === 2) {
      phaseFill += `M${tgP(x, y - r)}A${tgF(r)} ${tgF(r)} 0 0 1 ${tgP(x, y + r)}Z`;
    } else if (i === 3) {
      phaseFill += `M${tgP(x, y - r)}A${tgF(r)} ${tgF(r)} 0 0 1 ${tgP(x, y + r)}A${tgF(r * 0.5)} ${tgF(r)} 0 0 1 ${tgP(x, y - r)}Z`;
    } else if (i === 4) {
      phaseFill += tgCirc(x, y, r);
    } else if (i === 5) {
      phaseFill += `M${tgP(x, y - r)}A${tgF(r)} ${tgF(r)} 0 0 0 ${tgP(x, y + r)}A${tgF(r * 0.5)} ${tgF(r)} 0 0 0 ${tgP(x, y - r)}Z`;
    } else if (i === 6) {
      phaseFill += `M${tgP(x, y - r)}A${tgF(r)} ${tgF(r)} 0 0 0 ${tgP(x, y + r)}Z`;
    } else if (i === 7) {
      phaseFill += tgCres(x, y, r, 0.55, true);
    }
    const bAng = a + PI / 8;
    phaseFill += tgStar(380 + 351 * Math.cos(bAng), 380 + 351 * Math.sin(bAng), 5, 1.7, 4, 0);
  }
  phaseRing += tgRays(380, 380, 364, 372, 96, 0) + tgRays(380, 380, 331, 336, 120, 0);
  const phaseDash = tgCirc(380, 380, 330);

  // 7. Small vector icons (viewBox 0 0 24 24)
  const icons = {
    moon: { type: 'stroke', d: 'M20 14.5A8.5 8.5 0 1 1 9.5 4A7 7 0 0 0 20 14.5Z' },
    star4: { type: 'stroke', d: 'M12 2L13.8 10.2L22 12L13.8 13.8L12 22L10.2 13.8L2 12L10.2 10.2Z' },
    chevron_left: { type: 'stroke', d: 'M14.5 6L8.5 12L14.5 18' },
    quill: { type: 'stroke', d: 'M4 20L5 15L15.5 4.5L19.5 8.5L9 19ZM13.5 6.5L17.5 10.5' },
    save: { type: 'stroke', d: 'M12 4V15M7 10.5L12 15.5L17 10.5M5 19.5H19' },
    check: { type: 'stroke', d: 'M5 12.5L10 17L19 7.5' },
    close: { type: 'stroke', d: 'M6 6L18 18M18 6L6 18' },
    stop: { type: 'fill', d: 'M6 4.5H18A1.5 1.5 0 0 1 19.5 6V18A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5Z' },
  };

  // 8. All 22 Major Arcana glyphs (viewBox 0 0 100 140)
  const plate = 'M2 2H98V138H2Z';
  const ground = tgHatch([tgBox(5, 129, 95, 135)], 0, 1.5, 0);
  const veil = [
    [28.6, 44.6],
    [39, 49.3],
    [50, 51.2],
    [61, 49.3],
    [71.4, 44.6],
    [71.4, 73],
    [28.6, 73],
  ];
  let floorB = '';
  const fy = [120, 125.5, 133];
  const fx = (y, u) => 50 + (u - 0.5) * (76 + y - 120);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 0) {
        const u0 = c / 8.0;
        const u1 = (c + 1) / 8.0;
        floorB += tgShape([
          [fx(fy[r], u0), fy[r]],
          [fx(fy[r], u1), fy[r]],
          [fx(fy[r + 1], u1), fy[r + 1]],
          [fx(fy[r + 1], u0), fy[r + 1]],
        ]);
      }
    }
  }
  const nightSky = [
    [5, 5],
    [95, 5],
    [95, 128],
    [94, 128],
    [82, 106],
    [74, 114],
    [54, 88],
    [36, 112],
    [26, 102],
    [6, 128],
    [5, 128],
  ];
  let rimB = '';
  for (let k = 0; k < 4; k++) {
    rimB += tgHatch([tgSector(50, 66, 25.6, 33.4, k * 90 + 31, k * 90 + 59)], k * 90 + 135, 1.2, 0);
  }
  const gallows = [
    [5, 5],
    [95, 5],
    [95, 128],
    [77.5, 128],
    [77.5, 22],
    [83.5, 22],
    [83.5, 13.5],
    [16.5, 13.5],
    [16.5, 22],
    [22.5, 22],
    [22.5, 128],
    [5, 128],
  ];
  const hill = [
    [24.6, 104],
    [31, 100.6],
    [37, 99.4],
    [43, 99.6],
    [50, 100.6],
    [57, 99.6],
    [63, 99.4],
    [69, 100.6],
    [75.4, 104],
    [75.4, 123],
    [24.6, 123],
  ];
  const lane = [
    [48, 102],
    [52, 102],
    [53.6, 110],
    [55.2, 121.6],
    [44.8, 121.6],
    [46.4, 110],
  ];
  let laurelB = '';
  for (let i = 0; i < 36; i++) {
    const t = (i / 36.0) * 2 * PI;
    const x = 50 + 24 * Math.cos(t);
    const y = 70 + 38 * Math.sin(t);
    const ta = Math.atan2(38 * Math.cos(t), -24 * Math.sin(t));
    laurelB += tgSwell(x, y, x + 5.6 * Math.cos(ta + 0.55), y + 5.6 * Math.sin(ta + 0.55), 1.5);
    laurelB += tgSwell(x, y, x + 5.6 * Math.cos(ta - 0.55), y + 5.6 * Math.sin(ta - 0.55), 1.5);
  }
  const globe = [];
  for (let i = 0; i <= 10; i++) {
    const a = ((-40 + 16 * i) * PI) / 180.0;
    globe.push([50 + 11 * Math.cos(a), 70 + 11 * Math.sin(a)]);
  }

  const glyphs = {
    magician: {
      tone:
        plate +
        tgBurst([tgBox(5, 5, 95, 84), tgOval(50, 30, 20, 23, 32)], 50, 40, 64, 0.02) +
        tgHatch([tgBox(26, 113.4, 74, 119)], 90, 2, 0) +
        tgHatch([[[27, 92.6], [33.4, 92.6], [32.6, 98.6], [27, 102.4]]], 60, 1.3, 0) +
        ground,
      fill: tgSwell(62, 86, 62, 108.6, 1.5),
      gilt: tgNeedle(50, 40, 4.6, 12.5, 8, 0.3, PI / 8) + tgStar(39, 103, 3.6, 1.4, 5, 0) + tgCirc(50, 98, 1.5),
      ink:
        'M13 109H87V113H13ZM20 113V128M23 113V128M77 113V128M80 113V128M26 113V119M74 113V119' +
        tgWave(26, 74, 119, 1.3, 8) +
        'M49.2 44V95M50.8 44V95M20 92H34Q34 102 27 103Q20 102 20 92ZM27 103V108M23 108H31' +
        tgCirc(39, 103, 5) +
        'M58 92H66' +
        tgCirc(62, 85, 1) +
        tgLine([72, 90], [78, 108]) +
        'M74.5 96l-3.5-2M76.5 102l3.5-2M5 128H95M8 128q4-7 8 0M84 128q4-7 8 0',
      gold:
        'M50 22C56 13 67 13 67 22C67 31 56 31 50 22C44 13 33 13 33 22C33 31 44 31 50 22Z' +
        tgCirc(50, 40, 3.2) +
        tgCirc(50, 98, 3) +
        tgRays(50, 40, 6, 13, 8, 0),
    },
    priestess: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 29), tgBox(29, 10, 71, 26)], 0, 1.6, 0) +
        tgHatch([tgBox(16.6, 34.6, 27.4, 117.4)], 45, 1.5, 0) +
        tgHatch([tgBox(16.6, 34.6, 27.4, 117.4)], -45, 1.5, 0) +
        tgHatch([tgBox(80, 34.6, 83.4, 117.4)], 45, 1.3, 0) +
        'M75 36V116M78 36V116' +
        tgHatch([veil, tgOval(36, 52, 2.8, 2.8, 12), tgOval(50, 57, 2.8, 2.8, 12), tgOval(64, 52, 2.8, 2.8, 12), tgOval(43, 61, 2.8, 2.8, 12), tgOval(57, 61, 2.8, 2.8, 12)], 90, 1.5, 0),
      fill: floorB,
      gilt:
        tgCres(37, 18, 6, 0.5, false) +
        tgCres(63, 18, 6, 0.5, true) +
        tgCirc(36, 52, 1.6) +
        tgCirc(50, 57, 1.6) +
        tgCirc(64, 52, 1.6) +
        tgCirc(43, 61, 1.6) +
        tgCirc(57, 61, 1.6) +
        tgCres(50, 112, 5.5, 0.5, true),
      ink:
        'M16 34H28V118H16ZM72 34H84V118H72Z' +
        tgLine([13, 34], [31, 34]) +
        tgLine([69, 34], [87, 34]) +
        tgLine([13, 30], [31, 30]) +
        tgLine([69, 30], [87, 30]) +
        tgLine([13, 118], [31, 118]) +
        tgLine([69, 118], [87, 118]) +
        'M28 44Q50 58 72 44M28 52Q50 66 72 52' +
        tgWave(28, 72, 73, 1.4, 10) +
        'M42 76H58V100H42ZM42 76Q38 76 38 80Q38 84 42 84M58 100Q62 100 62 96Q62 92 58 92M46 84H54M46 90H54' +
        'M12 120H88M9.25 125.5H90.75M5.5 133H94.5M12 120L5.5 133M88 120L94.5 133',
      gold: tgCirc(50, 18, 6) + tgCirc(50, 18, 3.4),
    },
    hermit: {
      tone:
        plate +
        tgHatch([nightSky, tgOval(58, 62, 18, 18, 32)], 0, 1.6, 0) +
        tgHatch([tgBox(5, 5, 95, 30)], 0, 1.6, 0.8) +
        tgHatch([[[26, 102], [36, 112], [36, 128], [29, 128]]], 62, 1.4, 0) +
        tgHatch([[[54, 88], [74, 114], [74, 128], [58, 128]]], 62, 1.4, 0) +
        tgHatch([[[82, 106], [94, 128], [84, 128]]], 62, 1.4, 0) +
        ground,
      fill: tgSwell(30, 18, 30, 128, 1.6),
      gilt:
        tgNeedle(58, 62, 13, 17.5, 12, 0.09, PI / 12) +
        tgStar(58, 62, 5.5, 2.2, 6, 0) +
        tgStar(82, 22, 2.6, 1, 4, 0) +
        tgStar(14, 60, 2.2, 0.9, 4, 0) +
        tgStar(88, 46, 1.8, 0.8, 4, 0) +
        tgStar(44, 16, 1.6, 0.7, 4, 0) +
        tgStar(68, 12, 1.4, 0.6, 4, 0) +
        tgStar(12, 30, 1.5, 0.6, 4, 0),
      ink:
        tgCirc(30, 17, 1.6) +
        'M30 42Q44 34 58 42' +
        tgLine([58, 42], [58, 48]) +
        'M52 48H64L68 54V70L64 76H52L48 70V54ZM48 54H68M48 70H68' +
        tgLine([58, 76], [58, 80]) +
        'M6 128L26 102L36 112L54 88L74 114L82 106L94 128M48 96L51 93.5L54 96.5L57 93.5L60 96M5 128H95',
      gold: tgRays(58, 62, 13, 17.5, 12, 0),
    },
    wheel: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 112), tgOval(50, 66, 43, 43, 48)], 0, 1.6, 0) +
        rimB +
        tgWave(26, 74, 126.5, 1.2, 8) +
        tgWave(30, 70, 130, 1, 6),
      fill: tgNeedle(50, 66, 6.2, 25, 8, 0.16, 0) + tgCirc(50, 66, 2),
      gilt:
        tgNeedle(50, 66, 35.5, 42, 16, 0.035, 0) +
        tgStar(50, 13, 3.4, 1.3, 4, 0) +
        tgStar(14, 20, 4.5, 1.6, 4, 0) +
        tgStar(86, 20, 4.5, 1.6, 4, 0) +
        tgStar(14, 122, 4.5, 1.6, 4, 0) +
        tgStar(86, 122, 4.5, 1.6, 4, 0),
      ink:
        tgCirc(50, 66, 34) +
        tgCirc(50, 66, 25) +
        tgCirc(50, 66, 6) +
        tgRays(50, 66, 25, 34, 8, PI / 8) +
        tgCirc(50, 36.5, 2) +
        tgCirc(79.5, 66, 2) +
        tgCirc(50, 95.5, 2) +
        tgCirc(20.5, 66, 2) +
        tgWave(22, 78, 122, 2, 6),
      gold:
        tgRays(50, 66, 35, 37.5, 64, 0) +
        tgRays(14, 20, 5.6, 7.6, 4, PI / 4) +
        tgRays(86, 20, 5.6, 7.6, 4, PI / 4) +
        tgRays(14, 122, 5.6, 7.6, 4, PI / 4) +
        tgRays(86, 122, 5.6, 7.6, 4, PI / 4),
    },
    hanged: {
      tone:
        plate +
        tgHatch([gallows], 45, 2.2, 0) +
        'M26.6 24V124M74.6 24V124' +
        tgHatch([[[44, 62], [56, 62], [54, 84], [46, 84]]], 135, 1.3, 0) +
        ground,
      fill:
        tgSwell(24, 50, 19.5, 45.5, 1.6) +
        tgSwell(28, 74, 32.5, 69.5, 1.6) +
        tgSwell(76, 44, 80.5, 39.5, 1.6) +
        tgSwell(72, 86, 67.5, 81.5, 1.6),
      gilt: tgNeedle(50, 92, 13, 19.5, 12, 0.1, PI / 12),
      ink:
        'M18 15H82V20H18ZM24 20V128M28 20V128M72 20V128M76 20V128' +
        tgLine([50, 20], [50, 62]) +
        tgLine([50, 38], [62, 48], [53, 60]) +
        'M44 62H56L54 84H46Z' +
        tgLine([46, 82], [38, 72], [46, 64]) +
        tgLine([54, 82], [62, 72], [54, 64]) +
        tgCirc(50, 92, 7) +
        'M5 128H95',
      gold: tgCirc(50, 92, 12) + tgRays(50, 92, 13, 18, 12, 0),
    },
    star: {
      tone:
        plate +
        tgBurst([tgBox(5, 5, 95, 78), tgOval(50, 38, 23, 23, 32)], 50, 38, 72, 0.02) +
        tgWave(12, 88, 118, 1, 14) +
        tgWave(20, 80, 126, 0.9, 10) +
        tgWave(10, 90, 130, 0.8, 14) +
        'M46 104H54M44.5 107.5H55.5M47 110.5H53' +
        tgHatch([[[8, 100], [38, 100], [34, 105], [8, 105]]], 0, 1.2, 0) +
        tgHatch([[[62, 100], [92, 100], [92, 105], [66, 105]]], 0, 1.2, 0) +
        tgHatch([[[28, 86.6], [35.4, 86.6], [34.6, 93], [32, 97.4], [28, 98.4]]], 60, 1.2, 0) +
        tgHatch([[[72, 86.6], [79.4, 86.6], [78.6, 93], [76, 97.4], [72, 98.4]]], 60, 1.2, 0),
      fill: '',
      gilt:
        tgStar(50, 38, 8, 3.5, 8, 0) +
        tgNeedle(50, 38, 9, 22, 8, 0.1, PI / 8) +
        tgStar(18, 18, 4, 1.5, 8, 0) +
        tgStar(82, 18, 4, 1.5, 8, 0) +
        tgStar(14, 46, 4, 1.5, 8, 0) +
        tgStar(86, 46, 4, 1.5, 8, 0) +
        tgStar(24, 68, 4, 1.5, 8, 0) +
        tgStar(76, 68, 4, 1.5, 8, 0) +
        tgStar(50, 72, 3.4, 1.3, 8, 0),
      ink:
        'M20 86Q20 99 28 99Q36 99 36 86ZM24 86L26 80H30L32 86M31 81Q44 88 46 112' +
        'M64 86Q64 99 72 99Q80 99 80 86ZM68 86L70 80H74L76 86M69 81Q56 88 54 112' +
        tgLine([8, 100], [38, 100]) +
        tgLine([62, 100], [92, 100]) +
        tgWave(8, 92, 114, 2.5, 8) +
        tgWave(16, 84, 122, 2, 6),
      gold: tgStar(50, 38, 20, 6, 8, 0),
    },
    moon: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 76), tgOval(50, 36, 29, 29, 40)], 0, 1.6, 0) +
        tgHatch([tgBox(19.5, 82.6, 23.4, 121.4)], 45, 1.2, 0) +
        tgHatch([tgBox(85.5, 82.6, 89.4, 121.4)], 45, 1.2, 0) +
        'M11.5 88h4M12.5 104h5M11.5 112h4M77.5 88h4M78.5 104h5M77.5 112h4' +
        tgHatch([hill, lane], 0, 1.5, 0) +
        tgWave(12, 88, 130.5, 1, 12),
      fill: 'M15.5 92h3v6h-3ZM81.5 92h3v6h-3Z' + tgStip([lane], 26, 0.32, 7),
      gilt:
        tgCres(46, 36, 10, 0.5, false) +
        tgNeedle(50, 36, 18.5, 27.5, 16, 0.045, 0) +
        tgDrop(38, 58) +
        tgDrop(50, 62) +
        tgDrop(62, 58) +
        tgDrop(44, 70) +
        tgDrop(56, 70),
      ink:
        tgCirc(50, 36, 15) +
        'M10 122V82H24V122M10 82V77H13V80H16V77H18V80H21V77H24V82' +
        'M76 122V82H90V122M76 82V77H79V80H82V77H84V80H87V77H90V82' +
        'M44 128Q47 108 50 92M56 128Q53 108 50 92M24 104Q37 96 50 100Q63 96 76 104' +
        tgWave(8, 92, 126, 2, 8),
      gold: tgRays(50, 36, 19, 23, 16, PI / 16),
    },
    sun: {
      tone:
        plate +
        tgBurst([tgBox(5, 5, 95, 73), tgOval(50, 40, 31.5, 31.5, 40)], 50, 40, 90, 0.017) +
        tgHatch([tgBox(8, 106.7, 92, 112)], 45, 1.8, 0) +
        tgHatch([tgBox(5, 125, 95, 135)], 0, 1.7, 0),
      fill:
        tgCirc(28, 81, 2.2) +
        tgCirc(72, 81, 2.2) +
        tgCirc(14, 87, 1.7) +
        tgCirc(86, 87, 1.7) +
        tgSwell(28, 92, 22.5, 88.5, 1.8) +
        tgSwell(72, 92, 77.5, 88.5, 1.8) +
        tgStip([tgBox(8, 113.5, 92, 123)], 40, 0.3, 11),
      gilt:
        tgNeedle(50, 40, 17, 30, 12, 0.11, 0) +
        tgNeedle(28, 81, 3.2, 7.5, 10, 0.26, 0) +
        tgNeedle(72, 81, 3.2, 7.5, 10, 0.26, 0) +
        tgNeedle(14, 87, 2.5, 5.8, 8, 0.3, 0) +
        tgNeedle(86, 87, 2.5, 5.8, 8, 0.3, 0),
      ink:
        'M45 38h2M53 38h2M46 44q4 3 8 0M8 96H92M8 101.3H92M8 106.7H92M8 112H92' +
        'M20 96V101.3M36 96V101.3M52 96V101.3M68 96V101.3M84 96V101.3' +
        'M12 101.3V106.7M28 101.3V106.7M44 101.3V106.7M60 101.3V106.7M76 101.3V106.7' +
        'M20 106.7V112M36 106.7V112M52 106.7V112M68 106.7V112M84 106.7V112' +
        'M28 84V96M72 84V96M14 89.5V96M86 89.5V96' +
        tgCirc(28, 81, 3) +
        tgCirc(72, 81, 3) +
        'M5 124H95',
      gold: tgCirc(50, 40, 14) + tgRays(50, 40, 17, 25, 12, PI / 12),
    },
    world: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 135), tgOval(50, 70, 31, 45, 48)], 0, 1.8, 0) +
        tgHatch([globe], 130, 1.1, 0),
      fill: laurelB,
      gilt:
        tgSwell(44, 28, 56, 36, 1.6) +
        tgSwell(56, 28, 44, 36, 1.6) +
        tgSwell(44, 104, 56, 112, 1.6) +
        tgSwell(56, 104, 44, 112, 1.6) +
        tgStar(14, 16, 5, 1.8, 4, 0) +
        tgStar(86, 16, 5, 1.8, 4, 0) +
        tgStar(14, 124, 5, 1.8, 4, 0) +
        tgStar(86, 124, 5, 1.8, 4, 0) +
        tgStip([tgOval(50, 70, 18.5, 31.5, 32), tgOval(50, 70, 14.5, 14.5, 24)], 70, 0.3, 5),
      ink:
        tgEll(50, 70, 24, 38) +
        tgCirc(50, 70, 11.4) +
        tgEll(50, 70, 4.6, 11.4) +
        tgEll(50, 70, 8.4, 11.4) +
        'M38.6 70H61.4M40.2 64.3Q50 67 59.8 64.3M40.2 75.7Q50 73 59.8 75.7',
      gold:
        tgCirc(50, 70, 13.2) +
        tgRays(14, 16, 6.2, 8.2, 4, PI / 4) +
        tgRays(86, 16, 6.2, 8.2, 4, PI / 4) +
        tgRays(14, 124, 6.2, 8.2, 4, PI / 4) +
        tgRays(86, 124, 6.2, 8.2, 4, PI / 4),
    },
    fool: {
      tone:
        plate +
        tgBurst([tgBox(5, 5, 95, 78), tgOval(76, 24, 16, 16, 32)], 76, 24, 56, 0.02) +
        tgHatch([[[5, 76], [44, 76], [50, 128], [5, 128]]], 65, 1.5, 0) +
        tgHatch([[[5, 76], [44, 76], [38, 92], [5, 92]]], -25, 1.6, 0) +
        ground,
      fill:
        tgSwell(24, 42, 68, 72, 1.3) +
        tgShape([[45, 90], [52, 86], [56, 90], [53, 94], [47, 94]]) +
        tgCirc(22, 40, 2.1),
      gilt:
        tgNeedle(76, 24, 9, 17, 10, 0.14, PI / 10) +
        tgStar(28, 22, 3.8, 1.4, 6, 0) +
        tgStar(48, 16, 2.2, 0.9, 4, 0) +
        tgStar(16, 56, 2.0, 0.8, 4, 0),
      ink:
        'M5 76H44L50 128M16 76L22 98L14 128M30 76L36 106L34 128' +
        'M52 58Q57 52 63 58Q65 65 58 68Q51 66 52 58Z' +
        'M54 62L62 62M46 82Q54 78 60 84' +
        tgWave(52, 94, 114, 2.2, 5) +
        tgWave(56, 92, 121, 1.8, 4) +
        'M5 128H95',
      gold: tgCirc(76, 24, 7.2) + tgRays(76, 24, 9, 14, 10, 0) + tgCirc(28, 22, 5.2) + tgRays(24, 42, 4, 7, 4, PI / 4),
    },
    empress: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 42), tgOval(50, 32, 32, 22, 32)], 0, 1.7, 0) +
        tgHatch([[[5, 86], [36, 86], [36, 128], [5, 128]]], 45, 1.6, 0) +
        tgHatch([[[64, 86], [95, 86], [95, 128], [64, 128]]], -45, 1.6, 0) +
        ground,
      fill:
        tgSwell(20, 56, 26, 63, 1.4) +
        tgSwell(20, 66, 26, 73, 1.4) +
        tgSwell(20, 76, 26, 83, 1.4) +
        tgSwell(80, 56, 74, 63, 1.4) +
        tgSwell(80, 66, 74, 73, 1.4) +
        tgSwell(80, 76, 74, 83, 1.4) +
        tgCirc(50, 94, 1.8),
      gilt:
        tgStar(50, 15, 2.6, 1.0, 4, 0) +
        tgStar(39, 17, 2.3, 0.9, 4, 0) +
        tgStar(61, 17, 2.3, 0.9, 4, 0) +
        tgStar(29, 23, 2.3, 0.9, 4, 0) +
        tgStar(71, 23, 2.3, 0.9, 4, 0) +
        tgStar(21, 32, 2.1, 0.8, 4, 0) +
        tgStar(79, 32, 2.1, 0.8, 4, 0) +
        tgCres(50, 54, 7, 0.55, true),
      ink:
        'M16 42Q50 18 84 42M20 50V116M80 50V116M34 86H66L62 114Q50 124 38 114Z' +
        tgWave(6, 36, 118, 1.8, 5) +
        tgWave(64, 94, 118, 1.8, 5) +
        tgWave(38, 62, 124, 1.4, 4) +
        'M5 128H95',
      gold: tgCirc(50, 94, 8.5) + 'M50 102.5V115M44 109H56' + tgCirc(50, 54, 10) + tgRays(50, 54, 12, 17, 8, PI / 8),
    },
    emperor: {
      tone:
        plate +
        tgHatch([[[5, 5], [95, 5], [95, 58], [78, 42], [62, 58], [50, 40], [38, 58], [22, 42], [5, 58]]], 0, 1.6, 0) +
        tgHatch([tgBox(26, 44, 74, 112)], 45, 1.7, 0) +
        tgHatch([tgBox(26, 44, 74, 112)], -45, 1.7, 0) +
        ground,
      fill: tgShape([[42, 22], [46, 15], [50, 20], [54, 15], [58, 22]]) + tgSwell(64, 68, 64, 102, 1.4),
      gilt: tgNeedle(50, 26, 8, 14, 7, 0.14, 0) + tgStar(18, 18, 3.2, 1.2, 4, 0) + tgStar(82, 18, 3.2, 1.2, 4, 0) + tgCirc(36, 80, 2.2),
      ink:
        'M5 58L22 42L38 58L50 40L62 58L78 42L95 58' +
        'M22 44H78V122H22ZM16 122H84V128H16Z' +
        'M22 48Q12 46 14 36Q16 30 22 34M78 48Q88 46 86 36Q84 30 78 34' +
        'M28 112H72M5 128H95',
      gold: tgCirc(64, 58, 5.5) + 'M64 63.5V98M57 71H71' + tgCirc(36, 80, 7.5) + 'M36 69V72.5M32.5 70.5H39.5M38 26H62',
    },
    hierophant: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 34), tgOval(50, 32, 22, 20, 32)], 0, 1.6, 0) +
        tgHatch([tgBox(14, 34, 22, 118)], 45, 1.4, 0) +
        tgHatch([tgBox(78, 34, 86, 118)], -45, 1.4, 0) +
        tgHatch([tgBox(26, 118, 74, 128)], 0, 1.5, 0) +
        ground,
      fill: tgShape([[34, 96], [38, 92], [44, 98], [40, 102]]) + tgSwell(50, 44, 50, 74, 1.3),
      gilt:
        tgCirc(50, 88, 2.2) +
        tgNeedle(50, 24, 10, 15, 8, 0.12, PI / 8) +
        tgStar(26, 20, 3.0, 1.1, 4, 0) +
        tgStar(74, 20, 3.0, 1.1, 4, 0) +
        'M62 76L40 98M38 94L44 100',
      ink:
        'M14 34H22V118H14ZM78 34H86V118H78ZM11 34H25M75 34H89M11 118H89M18 118L12 128M82 118L88 128' +
        'M50 40V76M44 46H56M41 53H59M38 60H62' +
        tgLine([36, 76], [62, 102]) +
        tgCirc(64.5, 104.5, 4) +
        'M36 76L32 80L35 83L39 79M5 128H95',
      gold:
        'M42 28H58L55 22H45ZM40 34H60L58 28H42ZM50 12V22M46 16H54' +
        tgCirc(35.5, 104.5, 4) +
        tgLine([64, 76], [38, 102]) +
        'M64 76L68 80L65 83L61 79',
    },
    lovers: {
      tone:
        plate +
        tgBurst([tgBox(5, 5, 95, 76), tgOval(50, 24, 15, 15, 32)], 50, 24, 60, 0.02) +
        tgHatch([[[30, 128], [50, 92], [70, 128]]], 60, 1.4, 0) +
        ground,
      fill:
        tgSwell(20, 82, 20, 124, 1.6) +
        tgSwell(80, 82, 80, 124, 1.6) +
        tgSwell(77, 114, 83, 98, 1.1) +
        tgSwell(83, 98, 76, 86, 1.1),
      gilt:
        tgNeedle(50, 24, 8, 16, 12, 0.1, PI / 12) +
        tgDrop(16, 62) +
        tgDrop(24, 62) +
        tgDrop(20, 54) +
        tgDrop(14, 72) +
        tgDrop(26, 72) +
        tgStar(50, 76, 3.6, 1.4, 4, 0),
      ink:
        'M50 30Q32 24 12 36Q24 44 40 40Q26 48 16 54Q32 54 46 44' +
        'M50 30Q68 24 88 36Q76 44 60 40Q74 48 84 54Q68 54 54 44' +
        'M10 74Q20 50 30 74Q20 82 10 74ZM70 74Q80 50 90 74Q80 82 70 74Z' +
        'M28 128L50 90L72 128M5 128H95',
      gold: tgCirc(50, 24, 6.5) + tgRays(50, 24, 8, 14, 8, 0) + tgCirc(44, 76, 9) + tgCirc(56, 76, 9),
    },
    chariot: {
      tone:
        plate +
        tgHatch([tgBox(18, 16, 82, 34)], 0, 1.5, 0) +
        tgHatch([tgBox(30, 50, 70, 96)], 90, 1.7, 0) +
        tgHatch([[[5, 116], [95, 116], [95, 128], [5, 128]]], 0, 1.6, 0) +
        ground,
      fill:
        tgShape([[14, 126], [22, 108], [32, 108], [36, 126]]) +
        tgCirc(25, 104, 3.5) +
        tgCirc(22, 82, 2.2) +
        tgCirc(78, 82, 2.2),
      gilt:
        tgShape([[64, 126], [68, 108], [78, 108], [86, 126]]) +
        tgCirc(75, 104, 3.5) +
        tgStar(50, 24, 3.6, 1.4, 8, 0) +
        tgStar(30, 22, 2.2, 0.8, 4, 0) +
        tgStar(70, 22, 2.2, 0.8, 4, 0) +
        tgStar(24, 29, 1.8, 0.7, 4, 0) +
        tgStar(76, 29, 1.8, 0.7, 4, 0) +
        tgCres(34, 60, 4.2, 0.55, false) +
        tgCres(66, 60, 4.2, 0.55, true),
      ink:
        'M16 16H84V34H16ZM20 34V98M80 34V98M30 50H70V98H30Z' +
        tgCirc(22, 82, 14) +
        tgRays(22, 82, 3, 14, 8, 0) +
        tgCirc(78, 82, 14) +
        tgRays(78, 82, 3, 14, 8, 0) +
        'M10 116H90M5 128H95',
      gold:
        tgCirc(50, 72, 6.5) +
        'M43 70Q34 64 28 70Q35 74 43 73M57 70Q66 64 72 70Q65 74 57 73' +
        tgCirc(50, 24, 6) +
        'M40 34Q50 42 60 34',
    },
    strength: {
      tone:
        plate +
        tgBurst([tgBox(5, 5, 95, 52), tgOval(50, 22, 22, 12, 32)], 50, 22, 48, 0.03) +
        tgHatch([[[5, 108], [95, 108], [95, 128], [5, 128]]], 0, 1.6, 0) +
        tgHatch([tgOval(50, 74, 24, 24, 32)], 45, 1.8, 0) +
        ground,
      fill:
        tgSwell(24, 88, 34, 96, 1.5) +
        tgSwell(76, 88, 66, 96, 1.5) +
        tgSwell(20, 74, 26, 84, 1.4) +
        tgSwell(80, 74, 74, 84, 1.4) +
        tgShape([[47, 74], [53, 74], [50, 79]]),
      gilt:
        tgNeedle(50, 70, 18, 28, 12, 0.11, PI / 12) +
        tgStar(22, 54, 2.8, 1.0, 4, 0) +
        tgStar(78, 54, 2.8, 1.0, 4, 0) +
        tgStar(50, 104, 3.2, 1.2, 4, 0),
      ink:
        tgCirc(50, 70, 17) +
        'M43 66H46M54 66H57M45 81Q50 84 55 81M42 54L39 48L46 52M58 54L61 48L54 52' +
        'M20 56Q14 78 28 96Q50 112 72 96Q86 78 80 56' +
        'M12 114Q34 104 50 108Q66 104 88 114M5 128H95',
      gold:
        'M50 22C56 13 67 13 67 22C67 31 56 31 50 22C44 13 33 13 33 22C33 31 44 31 50 22Z' +
        tgCirc(50, 70, 21) +
        tgRays(50, 70, 17, 25, 12, 0),
    },
    justice: {
      tone:
        plate +
        tgHatch([tgBox(20, 24, 80, 114)], 90, 1.8, 0) +
        tgHatch([tgBox(12, 24, 19, 118)], 45, 1.4, 0) +
        tgHatch([tgBox(81, 24, 88, 118)], -45, 1.4, 0) +
        ground,
      fill: floorB + tgSwell(50, 28, 50, 96, 1.3),
      gilt:
        tgShape([[20, 82], [36, 82], [33, 88], [23, 88]]) +
        tgShape([[64, 82], [80, 82], [77, 88], [67, 88]]) +
        tgStar(50, 22, 3.2, 1.2, 4, 0),
      ink:
        'M12 24H19V118H12ZM81 24H88V118H81ZM9 24H22M78 24H91M9 118H91' +
        'M19 28Q50 38 81 28' +
        'M50 16L53 28V98H47V28ZM40 98H60M50 98V114M46 114H54' +
        'M28 52H72M28 52L20 82M28 52L36 82M72 52L64 82M72 52L80 82' +
        'M12 120H88M9.25 125.5H90.75M5.5 133H94.5M12 120L5.5 133M88 120L94.5 133',
      gold:
        tgCirc(50, 22, 7.5) +
        'M38 14L44 20L50 12L56 20L62 14' +
        tgCirc(28, 52, 2.2) +
        tgCirc(72, 52, 2.2) +
        'M20 82H36M64 82H80M40 98H60',
    },
    death: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 76), tgOval(50, 42, 16, 16, 32)], 0, 1.5, 0) +
        tgHatch([tgBox(26, 82, 36, 114)], 45, 1.3, 0) +
        tgHatch([tgBox(64, 82, 74, 114)], -45, 1.3, 0) +
        ground,
      fill: tgSwell(24, 24, 78, 122, 1.5) + tgShape([[14, 126], [18, 119], [22, 123], [26, 119], [30, 126]]),
      gilt: tgNeedle(50, 102, 10, 18, 9, 0.1, PI / 9) + tgStar(50, 42, 7.5, 3.2, 5, 0) + tgStar(18, 20, 2.4, 0.9, 4, 0) + tgStar(80, 24, 2.2, 0.8, 4, 0),
      ink:
        'M24 24Q58 14 78 40Q52 28 30 34' +
        'M26 114V82H36V114M26 82V78H29V80H33V78H36V82' +
        'M64 114V82H74V114M64 82V78H67V80H71V78H74V82' +
        'M5 114H26M36 114H64M74 114H95' +
        tgWave(8, 92, 122, 2.0, 7) +
        'M5 128H95',
      gold: tgCirc(50, 42, 12) + tgCirc(50, 42, 3) + 'M40 102A10 10 0 0 1 60 102' + tgRays(50, 102, 11, 16, 7, -PI / 12),
    },
    temperance: {
      tone:
        plate +
        tgBurst([tgBox(5, 5, 95, 68), tgOval(50, 28, 16, 16, 32)], 50, 28, 56, 0.02) +
        tgHatch([[[5, 110], [95, 110], [95, 128], [5, 128]]], 0, 1.5, 0) +
        ground,
      fill:
        tgSwell(20, 118, 16, 100, 1.4) +
        tgSwell(20, 118, 25, 102, 1.2) +
        tgSwell(80, 118, 84, 100, 1.4) +
        tgSwell(80, 118, 75, 102, 1.2),
      gilt: tgShape([[50, 21], [57, 34], [43, 34]]) + tgDrop(46, 62) + tgDrop(52, 69) + tgDrop(58, 75) + tgStar(80, 24, 3.2, 1.2, 4, 0),
      ink:
        'M12 22Q28 32 36 46M10 34Q26 40 34 50' +
        'M88 22Q72 32 64 46M90 34Q74 40 66 50' +
        'M20 46H34Q34 56 27 57Q20 56 20 46ZM27 57V63M23 63H31' +
        'M66 82H80Q80 92 73 93Q66 92 66 82ZM73 93V99M69 99H77' +
        'M32 54C48 60 52 76 68 84M30 58C45 64 49 80 66 88' +
        tgWave(12, 88, 114, 1.8, 8) +
        tgWave(18, 82, 121, 1.4, 6) +
        'M5 128H95',
      gold: 'M40 18H60V38H40ZM34 52C48 58 52 78 66 86' + tgCirc(80, 24, 6) + tgRays(80, 24, 7, 11, 8, 0),
    },
    devil: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 128)], 45, 2.2, 0) +
        tgHatch([tgBox(5, 5, 95, 128)], -45, 2.2, 0) +
        tgHatch([tgBox(28, 82, 72, 110)], 90, 1.4, 0) +
        ground,
      fill:
        tgShape([[50, 48], [14, 42], [10, 62], [26, 68], [42, 64]]) +
        tgShape([[50, 48], [86, 42], [90, 62], [74, 68], [58, 64]]) +
        tgShape([[28, 82], [72, 82], [72, 110], [28, 110]]),
      gilt: tgStar(50, 28, 10, 4.2, 5, PI) + tgDrop(24, 66) + tgDrop(76, 66) + tgCirc(50, 96, 2.5),
      ink:
        'M38 22Q30 14 26 20M62 22Q70 14 74 20' +
        'M14 42L10 62L26 68L42 64M86 42L90 62L74 68L58 64' +
        'M28 82H72V110H28ZM22 110H78' +
        'M46 96L36 108L28 118M54 96L64 108L72 118' +
        tgCirc(26, 121, 3.8) +
        tgCirc(74, 121, 3.8) +
        'M5 128H95',
      gold: tgStar(50, 28, 12.5, 5.0, 5, PI) + tgCirc(50, 28, 13.5) + tgCirc(50, 96, 5) + tgRays(50, 28, 14, 18, 10, PI / 10),
    },
    tower: {
      tone:
        plate +
        tgHatch([tgBox(5, 5, 95, 128)], 68, 2.0, 0) +
        tgHatch([tgBox(36, 42, 64, 126)], 0, 2.2, 0) +
        ground,
      fill:
        tgShape([[36, 42], [64, 42], [66, 126], [34, 126]]) +
        tgShape([[60, 24], [66, 14], [71, 20], [77, 13], [79, 25]]) +
        tgCirc(50, 62, 2.5),
      gilt:
        'M12 12L38 30L30 34L52 44L34 40L40 35Z' +
        tgDrop(20, 56) +
        tgDrop(26, 74) +
        tgDrop(16, 92) +
        tgDrop(76, 52) +
        tgDrop(82, 70) +
        tgDrop(74, 88) +
        tgDrop(86, 102) +
        tgDrop(22, 108),
      ink:
        'M36 42H64L66 126H34ZM34 42V36H40V40H46V36H54V40H60V36H66V42' +
        'M35 58H65M35 74H65M34 90H66M34 106H66' +
        'M46 66V58A4 4 0 0 1 54 58V66ZM46 98V90A4 4 0 0 1 54 90V98Z' +
        'M10 18Q18 12 26 18Q34 12 42 18M64 14Q74 8 84 14Q90 12 94 18' +
        'M5 128L22 114L34 126M66 126L78 114L95 128M5 128H95',
      gold: 'M12 12L38 30L30 34L52 44M59 26L66 14L71 20L77 13L80 26Z' + tgRays(50, 38, 6, 16, 8, PI / 8),
    },
    judgement: {
      tone:
        plate +
        tgBurst([tgBox(5, 5, 95, 76), tgOval(50, 32, 26, 20, 32)], 50, 26, 60, 0.02) +
        tgHatch([tgBox(28, 100, 72, 118)], 45, 1.5, 0) +
        tgHatch([[[5, 116], [95, 116], [95, 128], [5, 128]]], 0, 1.6, 0) +
        ground,
      fill:
        tgShape([[34, 98], [66, 98], [68, 114], [32, 114]]) +
        tgShape([[5, 112], [18, 94], [28, 112]]) +
        tgShape([[72, 112], [82, 94], [95, 112]]),
      gilt:
        tgShape([[47, 14], [53, 14], [58, 38], [42, 38]]) +
        'M48 44H52V60H48ZM41 50H59V54H41Z' +
        tgNeedle(50, 38, 14, 28, 7, 0.06, PI) +
        tgStar(50, 74, 3.6, 1.4, 4, 0),
      ink:
        'M47 14H53L58 38H42ZM38 42H62V62H38Z' +
        'M14 20Q28 12 42 20M58 20Q72 12 86 20' +
        'M38 82L50 92L62 82M50 78V98' +
        'M28 98H72L75 118H25ZM24 98L18 110' +
        tgWave(8, 92, 122, 1.8, 8) +
        'M5 128H95',
      gold: 'M42 38H58M47 14H53M34 66Q50 74 66 66M28 72Q50 82 72 72' + tgRays(50, 38, 10, 22, 7, PI),
    },
  };

  return {
    latticeLines,
    latticeDots,
    backShield: 'M50 20L85 86L50 152L15 86Z',
    backDash: 'M8.4 8.4H91.6V163.6H8.4Z',
    backThin,
    backLine,
    backGilt,
    laidH,
    laidV,
    frameLine,
    frameThin,
    frameGilt,
    slotSolid,
    slotRing,
    corner,
    fleuron,
    compassLine,
    compassGilt,
    eyeOutline,
    eyePupil,
    chartMain,
    chartFine,
    chartDash,
    chartCross,
    chartEllipse,
    chartStars,
    phaseRing,
    phaseDash,
    phaseFill,
    icons,
    glyphs,
  };
}

export const ART_ASSETS = buildAssets();

function foilLightGradDef(id) {
  return `<linearGradient id="${id}" x1="15%" y1="0%" x2="85%" y2="100%">
    <stop offset="0%" stop-color="#a47e3a"/>
    <stop offset="30%" stop-color="#d2ad62"/>
    <stop offset="50%" stop-color="#f3dfa8"/>
    <stop offset="72%" stop-color="#c9a25a"/>
    <stop offset="100%" stop-color="#93702f"/>
  </linearGradient>`;
}

function foilDarkGradDef(id) {
  return `<linearGradient id="${id}" x1="15%" y1="0%" x2="85%" y2="100%">
    <stop offset="0%" stop-color="#7c5b1d"/>
    <stop offset="35%" stop-color="#b89146"/>
    <stop offset="52%" stop-color="#d2ae68"/>
    <stop offset="72%" stop-color="#9c7935"/>
    <stop offset="100%" stop-color="#6d4f16"/>
  </linearGradient>`;
}

function cardBackGradDef(id) {
  return `<radialGradient id="${id}" cx="50%" cy="42%" r="72%">
    <stop offset="0%" stop-color="#1a2e4f"/>
    <stop offset="55%" stop-color="#13233d"/>
    <stop offset="100%" stop-color="#0e1b31"/>
  </radialGradient>`;
}

function parchmentGradDef(id) {
  return `<radialGradient id="${id}" cx="50%" cy="40%" r="74%">
    <stop offset="0%" stop-color="#f4ecd9"/>
    <stop offset="56%" stop-color="#eee4cd"/>
    <stop offset="100%" stop-color="#e5d9bc"/>
  </radialGradient>`;
}

export function renderCardBackSvg({ className = '', strokeScale = 1, idPrefix } = {}) {
  const uid = idPrefix || nextUid('cb');
  const bgId = `${uid}-bg`;
  const fgId = `${uid}-foil`;
  const clipId = `${uid}-clip`;
  const sw = tgF(strokeScale);
  return `<svg class="${className}" viewBox="0 0 100 172" fill="none" aria-hidden="true">
    <defs>
      ${cardBackGradDef(bgId)}
      ${foilLightGradDef(fgId)}
      <clipPath id="${clipId}"><rect x="10.5" y="10.5" width="79" height="151"/></clipPath>
    </defs>
    <rect x="0" y="0" width="100" height="172" rx="6" fill="url(#${bgId})"/>
    <g clip-path="url(#${clipId})">
      <path d="${ART_ASSETS.latticeLines}" stroke="rgba(201,162,90,0.28)" stroke-width="0.22" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${ART_ASSETS.latticeDots}" fill="rgba(201,162,90,0.4)"/>
    </g>
    <path d="${ART_ASSETS.backShield}" fill="rgba(12,24,48,0.72)"/>
    <path d="${ART_ASSETS.backDash}" stroke="rgba(201,162,90,0.7)" stroke-width="0.5" stroke-dasharray="0.01 2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.backThin}" stroke="rgba(201,162,90,0.62)" stroke-width="0.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.backLine}" stroke="url(#${fgId})" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.backGilt}" fill="url(#${fgId})" fill-rule="evenodd"/>
  </svg>`;
}

export function renderCardFrameSvg({ className = '', idPrefix } = {}) {
  const uid = idPrefix || nextUid('cf');
  const bgId = `${uid}-bg`;
  const fgId = `${uid}-foil`;
  return `<svg class="${className}" viewBox="0 0 100 172" fill="none" aria-hidden="true">
    <defs>
      ${parchmentGradDef(bgId)}
      ${foilDarkGradDef(fgId)}
    </defs>
    <rect x="0" y="0" width="100" height="172" rx="6" fill="url(#${bgId})"/>
    <path d="${ART_ASSETS.laidH}" stroke="rgba(110,90,48,0.15)" stroke-width="0.24" stroke-linecap="round"/>
    <path d="${ART_ASSETS.laidV}" stroke="rgba(110,90,48,0.07)" stroke-width="0.24" stroke-linecap="round"/>
    <path d="${ART_ASSETS.frameLine}" stroke="url(#${fgId})" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.frameThin}" stroke="rgba(167,132,63,0.6)" stroke-width="0.45" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.frameGilt}" fill="url(#${fgId})"/>
  </svg>`;
}

export function renderArcanaGlyphSvg(arcanaKey, { className = '', strokeWidth = 1.25, idPrefix } = {}) {
  const g = ART_ASSETS.glyphs[arcanaKey] || ART_ASSETS.glyphs.magician;
  const uid = idPrefix || nextUid('ag');
  const fgId = `${uid}-foil`;
  const sw = tgF(strokeWidth);
  return `<svg class="${className}" viewBox="0 0 100 140" fill="none" aria-hidden="true">
    <defs>${foilDarkGradDef(fgId)}</defs>
    ${g.tone ? `<path d="${g.tone}" stroke="rgba(42,36,27,0.55)" stroke-width="0.32" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    ${g.fill ? `<path d="${g.fill}" fill="#2a241b"/>` : ''}
    ${g.gilt ? `<path d="${g.gilt}" fill="url(#${fgId})"/>` : ''}
    ${g.ink ? `<path d="${g.ink}" stroke="#2a241b" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    ${g.gold ? `<path d="${g.gold}" stroke="url(#${fgId})" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
  </svg>`;
}

export function renderSlotPlaceholderSvg({ className = '' } = {}) {
  return `<svg class="${className}" viewBox="0 0 100 172" fill="none" aria-hidden="true">
    <path d="${ART_ASSETS.slotSolid}" stroke="rgba(201,162,90,0.5)" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.slotRing}" stroke="rgba(201,162,90,0.5)" stroke-width="0.7" stroke-dasharray="0.55 1.65" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function renderCornerFlourishSvg({ className = '', strokeWidth = 1.1 } = {}) {
  return `<svg class="${className}" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <path d="${ART_ASSETS.corner}" stroke="currentColor" stroke-width="${tgF(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function renderFleuronSvg({ className = '', strokeWidth = 1.2 } = {}) {
  return `<svg class="${className}" viewBox="0 0 84 10" fill="none" aria-hidden="true">
    <path d="${ART_ASSETS.fleuron}" stroke="currentColor" stroke-width="${tgF(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function renderCompassSvg({ className = '' } = {}) {
  return `<svg class="${className}" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <path d="${ART_ASSETS.compassLine}" stroke="rgba(201,162,90,0.42)" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.compassGilt}" fill="rgba(201,162,90,0.42)"/>
  </svg>`;
}

export function renderMysticEyeSvg({ className = '' } = {}) {
  return `<svg class="${className}" viewBox="0 0 44 28" fill="none" aria-hidden="true">
    <path d="${ART_ASSETS.eyeOutline}" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.eyePupil}" fill="currentColor"/>
  </svg>`;
}

export function renderStarChartSvg({ className = '' } = {}) {
  return `<svg class="${className}" viewBox="0 0 800 800" fill="none" aria-hidden="true">
    <path d="${ART_ASSETS.chartMain}" stroke="rgba(201,162,90,0.16)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.chartFine}" stroke="rgba(201,162,90,0.16)" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.chartDash}" stroke="rgba(201,162,90,0.16)" stroke-width="1" stroke-dasharray="2 7" stroke-linecap="round"/>
    <path d="${ART_ASSETS.chartCross}" stroke="rgba(201,162,90,0.16)" stroke-width="1" stroke-dasharray="1 8" stroke-linecap="round"/>
    <g transform="rotate(-23.5 400 400)">
      <path d="${ART_ASSETS.chartEllipse}" stroke="rgba(201,162,90,0.16)" stroke-width="0.8" stroke-dasharray="3 6" stroke-linecap="round"/>
    </g>
    <path d="${ART_ASSETS.chartStars}" fill="rgba(201,162,90,0.16)"/>
  </svg>`;
}

export function renderMoonPhaseRingSvg({ className = '' } = {}) {
  return `<svg class="${className}" viewBox="0 0 760 760" fill="none" aria-hidden="true">
    <path d="${ART_ASSETS.phaseRing}" stroke="rgba(201,162,90,0.20)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ART_ASSETS.phaseDash}" stroke="rgba(201,162,90,0.20)" stroke-width="1" stroke-dasharray="1 6" stroke-linecap="round"/>
    <path d="${ART_ASSETS.phaseFill}" fill="rgba(201,162,90,0.11)"/>
  </svg>`;
}

export function renderIconSvg(kind, { className = '' } = {}) {
  const icon = ART_ASSETS.icons[kind];
  if (!icon) return '';
  if (icon.type === 'fill') {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="${icon.d}" fill="currentColor"/>
    </svg>`;
  }
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="${icon.d}" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
