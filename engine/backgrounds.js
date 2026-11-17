// painted-world-shorts — painted locations (Canvas 2D, deterministic)
// Look: hand-painted matte-painting environments. Watercolor/gouache washes, paper grain, soft
// pigment-pooled edges, heavy golden-hour haze, big sculptural cumulus clouds, light shafts.
// Each location is painted ONCE into 3 cached layers and drawn with PARALLAX:
//   far  (depth 0.25: sky, sun, clouds, distant mountains/skyline)
//   mid  (depth 0.7 : hills, buildings, trees)  - keep its shapes running down behind the ground
//   near (depth 1.0 : ground the characters stand on, foreground plants/props)
// World = 1080 x 1920, ground line around y = 1500 (feet at y 1480-1620).
// drawBG(ctx, id, t, cam) is called with the world camera already applied.
(function (G) {
  const W = 1080, H = 1920, GROUND = 1500;
  const CX = -540, CY = -480, CW = 2160, CH = 2880; // cached region in world px

  // ---------- deterministic noise / random ----------
  function hash2(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { let t = 0, a = 0.5, f = 1; for (let i = 0; i < (o || 4); i++) { t += a * vnoise(x * f, y * f, s + i * 17); f *= 2; a *= 0.5; } return t; }
  function rng(seed) { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function mk(w, h) { return (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h }); }
  const lerp = (a, b, t) => a + (b - a) * t;
  const tint = (h, k, a) => G.PT.tint(h, k, a);
  const PT_tint = (c, k, a) => c.startsWith('#') ? G.PT.tint(c, k, a) : c;

  // ---------- textures (made once) ----------
  const TEX = {};
  function washTex() { // big soft blotches + granulation, alpha only
    if (TEX.wash) return TEX.wash;
    const S = 640, c = mk(S, S), x = c.getContext('2d'), img = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const n = fbm(i / 90, j / 90, 3, 4), g = hash2(i, j, 9);
      const v = Math.max(0, (n - 0.45) * 2.2) * 0.8 + g * 0.25;
      const k = (j * S + i) * 4; img.data[k] = 70; img.data[k + 1] = 48; img.data[k + 2] = 66; img.data[k + 3] = Math.min(255, v * 255);
    }
    x.putImageData(img, 0, 0); return (TEX.wash = c);
  }
  function streakTex() { // vertical watercolor streaks/drips for skies and walls
    if (TEX.streak) return TEX.streak;
    const c = mk(1024, 1024), x = c.getContext('2d'), R = rng(77);
    x.filter = 'blur(2px)';
    for (let i = 0; i < 260; i++) { const px = R() * 1024, w = 1 + R() * 6, a = 0.04 + R() * 0.1, y0 = R() * 400, len = 300 + R() * 700;
      const g = x.createLinearGradient(0, y0, 0, y0 + len); g.addColorStop(0, `rgba(255,255,255,0)`); g.addColorStop(0.3, `rgba(255,252,245,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(px, y0, w, len); }
    x.filter = 'none'; return (TEX.streak = c);
  }
  function grainTex(seed) { // paper / film grain tile (used by engine post)
    const key = 'grain' + seed; if (TEX[key]) return TEX[key];
    const S = 512, c = mk(S, S), x = c.getContext('2d'), img = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const k = (j * S + i) * 4, v = hash2(i, j, seed) * 255; img.data[k] = img.data[k + 1] = img.data[k + 2] = v; img.data[k + 3] = 255; }
    x.putImageData(img, 0, 0); return (TEX[key] = c);
  }
  function paperTex() { // low-frequency paper fibre texture (used by engine post)
    if (TEX.paper) return TEX.paper;
    const S = 768, c = mk(S, S), x = c.getContext('2d'), img = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const k = (j * S + i) * 4, v = 128 + (fbm(i / 6, j / 6, 41, 3) - 0.5) * 120 + (fbm(i / 40, j / 40, 43, 3) - 0.5) * 60; img.data[k] = img.data[k + 1] = img.data[k + 2] = v; img.data[k + 3] = 255; }
    x.putImageData(img, 0, 0); return (TEX.paper = c);
  }

  // ---------- painter's toolkit (also for custom locations) ----------
  const P = {
    // fill a path like a watercolor wash: vertical colour gradient, pigment pooled at the edge
    wash(ctx, pathFn, top, bot, o) {
      o = o || {}; const [y0, y1] = o.span || [0, H];
      const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot || top);
      pathFn(); ctx.fillStyle = g; ctx.fill();
      if (o.edge !== 0) { ctx.save(); pathFn(); ctx.clip(); ctx.filter = `blur(${o.blur || 3}px)`; pathFn(); ctx.lineWidth = o.edgeW || 7; ctx.strokeStyle = o.edgeCol || 'rgba(60,40,60,0.16)'; ctx.stroke(); ctx.filter = 'none'; ctx.restore(); }
    },
    // noisy ridge line from x0..x1 around baseY (hills, mountains, treelines). Closes to bottom.
    ridge(ctx, x0, x1, baseY, amp, freq, seed, bottom) {
      ctx.beginPath(); ctx.moveTo(x0, bottom ?? baseY + 2000);
      for (let x = x0; x <= x1; x += 8) ctx.lineTo(x, baseY - amp * (fbm(x * freq, seed, seed, 4) - 0.35) * 2);
      ctx.lineTo(x1, bottom ?? baseY + 2000); ctx.closePath();
    },
    sky(ctx, stops, L) {
      const g = ctx.createLinearGradient(0, CY, 0, GROUND);
      stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
      ctx.fillStyle = g; ctx.fillRect(CX, CY, CW, CH);
    },
    sun(ctx, x, y, r, col) {
      let g = ctx.createRadialGradient(x, y, 0, x, y, r * 9);
      g.addColorStop(0, 'rgba(255,250,230,0.95)'); g.addColorStop(0.08, col || 'rgba(255,226,170,0.75)'); g.addColorStop(0.35, 'rgba(255,200,150,0.22)'); g.addColorStop(1, 'rgba(255,190,150,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r * 9, y - r * 9, r * 18, r * 18);
      g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, '#fffdf4'); g.addColorStop(0.7, 'rgba(255,248,225,0.95)'); g.addColorStop(1, 'rgba(255,240,210,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    },
    rays(ctx, x, y, n, len, spread, a0, alpha, seed) { // light shafts fanning from (x,y) around angle a0
      const R = rng(seed || 5); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(10px)';
      for (let i = 0; i < n; i++) { const a = a0 + (R() - 0.5) * spread, w = 0.02 + R() * 0.05, l = len * (0.6 + R() * 0.4);
        const g = ctx.createLinearGradient(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l); g.addColorStop(0, `rgba(255,226,170,${alpha * (0.5 + R() * 0.5)})`); g.addColorStop(1, 'rgba(255,220,160,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - w) * l, y + Math.sin(a - w) * l); ctx.lineTo(x + Math.cos(a + w) * l, y + Math.sin(a + w) * l); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    },
    // big sculptural cumulus: lit tops toward the sun, cool blue-grey bellies, soft edges
    cloud(ctx, x, y, s, L, seed, o) {
      // one cohesive mass: union silhouette in the belly colour, then sunlit cauliflower tops
      // painted puff by puff toward the sun, then a cool shadowed underside across the whole cloud.
      o = o || {}; const R = rng(seed);
      const lit = o.lit || L.cloudLit || '#fff3e0', mid = o.mid || L.cloudMid || '#efd6c6', dark = o.dark || L.cloudDark || '#a7aec6';
      const puffs = [], n = o.n || 34;
      for (let i = 0; i < n; i++) { const u = (R() - 0.5) * 2, h = Math.pow(1 - u * u, 0.8) * s * 0.85; const py = y - Math.pow(R(), 0.7) * h;
        puffs.push([x + u * s * 1.0, py, s * (0.1 + R() * 0.16) * (1.15 - Math.abs(u) * 0.45) * (1 + (y - py) / s * 0.25)]); }
      puffs.sort((a, b) => b[1] - a[1]);
      const sx = L.sun ? L.sun.x : x - 600, sy = L.sun ? L.sun.y : y - 900;
      const out = ctx, ox = x - s * 1.5, oy = y - s * 1.3, tw = Math.ceil(s * 3), th = Math.ceil(s * 1.7);
      const tmp = mk(tw, th); ctx = tmp.getContext('2d'); ctx.translate(-ox, -oy);
      const sil = () => { ctx.beginPath(); for (const [px, py, r] of puffs) { ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, 7); } ctx.rect(x - s * 0.95, y - s * 0.12, s * 1.9, s * 0.16); };
      ctx.save();
      sil(); ctx.fillStyle = mid; ctx.fill();
      ctx.save(); sil(); ctx.clip(); ctx.filter = 'blur(6px)';
      for (const [px, py, r] of puffs) { const dx = sx - px, dy = sy - py, d = Math.hypot(dx, dy) || 1;
        const hx = px + dx / d * r * 0.35, hy = py + dy / d * r * 0.35 - r * 0.15;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.95); g.addColorStop(0, lit); g.addColorStop(0.6, PT_tint(lit, 0, 0.5)); g.addColorStop(1, PT_tint(lit, 0, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, r * 0.95, 0, 7); ctx.fill(); }
      ctx.filter = 'blur(4px)';
      const g = ctx.createLinearGradient(0, y - s * 0.5, 0, y + s * 0.08); g.addColorStop(0, PT_tint(dark, 0, 0)); g.addColorStop(0.55, PT_tint(dark, 0, 0.45)); g.addColorStop(1, PT_tint(dark, 0, 0.85));
      ctx.fillStyle = g; ctx.fillRect(x - s * 1.4, y - s * 0.5, s * 2.8, s * 0.7);
      ctx.restore();
      // rim glow on the sun side edge
      ctx.restore();
      out.save(); out.filter = `blur(${o.blur ?? Math.max(2, s * 0.012)}px)`; out.drawImage(tmp, ox, oy);
      out.globalCompositeOperation = 'lighter'; out.filter = `blur(${s * 0.04}px)`; out.globalAlpha = 0.12; out.drawImage(tmp, ox - (L.light ? L.light.dir : -1) * s * 0.02, oy - s * 0.02);
      out.restore();
    },
    haze(ctx, y0, y1, col, a) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, tint(col, 0, 0)); g.addColorStop(0.6, tint(col, 0, a)); g.addColorStop(1, tint(col, 0, a * 0.6)); ctx.fillStyle = g; ctx.fillRect(CX, y0, CW, y1 - y0); },
    // painted tree: trunk + clumps lit on the sun side
    tree(ctx, x, y, s, L, seed, o) {
      o = o || {}; const R = rng(seed), leaf = o.leaf || '#6f8f4e', trunk = o.trunkCol || '#5a4636', ls = L.light.dir;
      ctx.save();
      if (o.trunk !== false) P.wash(ctx, () => { ctx.beginPath(); ctx.moveTo(x - s * 0.07, y); ctx.quadraticCurveTo(x - s * 0.03, y - s * 0.5, x - s * 0.02 + (R() - 0.5) * s * 0.1, y - s * 0.95); ctx.lineTo(x + s * 0.04, y - s * 0.95); ctx.quadraticCurveTo(x + s * 0.05, y - s * 0.5, x + s * 0.08, y); ctx.closePath(); }, tint(trunk, 0.1), tint(trunk, -0.3), { span: [y - s, y] });
      const clumps = []; for (let i = 0; i < (o.n || 11); i++) { const a = R() * Math.PI * 2, rr = R() * s * 0.38; clumps.push([x + Math.cos(a) * rr * 1.2, y - s * 0.95 + Math.sin(a) * rr * 0.8, s * (0.16 + R() * 0.14)]); }
      clumps.sort((a, b) => a[1] - b[1]);
      // foliage as ONE painted mass (no balloon clumps): silhouette, sunlit tops, shaded underside
      const ox = x - s * 0.9, oy = y - s * 1.55, tw = Math.ceil(s * 1.8), th = Math.ceil(s * 1.2);
      const tmp = mk(tw, th), t = tmp.getContext('2d'); t.translate(-ox, -oy);
      const sil = () => { t.beginPath(); for (const [px, py, r] of clumps) { for (let k = 0; k <= 36; k++) { const a = k / 36 * Math.PI * 2, rr = r * (0.82 + 0.25 * fbm(Math.cos(a) * 1.5 + px * 0.01, Math.sin(a) * 1.5, seed, 3)); const X = px + Math.cos(a) * rr, Y = py + Math.sin(a) * rr * 0.85; if (k === 0) t.moveTo(X, Y); else t.lineTo(X, Y); } t.closePath(); } };
      sil(); t.fillStyle = leaf; t.fill();
      t.save(); sil(); t.clip(); t.filter = `blur(${s * 0.02}px)`;
      for (const [px, py, r] of clumps) { const hx = px + ls * r * 0.35, hy = py - r * 0.35; const g = t.createRadialGradient(hx, hy, 0, hx, hy, r * 0.8); g.addColorStop(0, tint(leaf, 0.42, 0.9)); g.addColorStop(1, tint(leaf, 0.42, 0)); t.fillStyle = g; t.fillRect(hx - r, hy - r, r * 2, r * 2); }
      const g = t.createLinearGradient(0, y - s * 1.2, 0, y - s * 0.55); g.addColorStop(0, tint(leaf, -0.5, 0)); g.addColorStop(1, tint(leaf, -0.5, 0.75)); t.fillStyle = g; t.fillRect(ox, y - s * 1.2, tw, s * 0.8);
      t.filter = 'none'; t.fillStyle = tint(L.light.rim || '#ffdca6', 0, 0.4);
      for (let i = 0; i < 26; i++) { const [px, py, r] = clumps[(R() * clumps.length) | 0]; t.beginPath(); t.arc(px + ls * r * (0.1 + R() * 0.6), py - r * R() * 0.7, r * 0.04 + R() * r * 0.05, 0, 7); t.fill(); }
      t.restore();
      ctx.filter = `blur(${Math.max(1, s * 0.004)}px)`; ctx.drawImage(tmp, ox, oy); ctx.filter = 'none';
      ctx.restore();
    },
    grass(ctx, x0, x1, y, h, col, seed, n) { // painted grass tufts + dabs
      const R = rng(seed); ctx.save(); ctx.lineCap = 'round';
      for (let i = 0; i < (n || 160); i++) { const x = lerp(x0, x1, R()), yy = y + R() * h, l = 14 + R() * 30, a = -Math.PI / 2 + (R() - 0.5) * 0.7;
        ctx.strokeStyle = tint(col, (R() - 0.5) * 0.6, 0.7); ctx.lineWidth = 2 + R() * 3; ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.4, yy + Math.sin(a) * l * 0.6, x + Math.cos(a) * l, yy + Math.sin(a) * l); ctx.stroke(); }
      ctx.restore();
    },
    flowers(ctx, x0, x1, y, h, cols, seed, n) {
      const R = rng(seed); for (let i = 0; i < (n || 40); i++) { const x = lerp(x0, x1, R()), yy = y + R() * h, r = 3 + R() * 6 * (yy - y + h * 0.3) / h; ctx.fillStyle = cols[(R() * cols.length) | 0]; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(x, yy, r, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,250,235,0.7)'; ctx.beginPath(); ctx.arc(x - r * 0.3, yy - r * 0.3, r * 0.35, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
    },
    // stylised building block with window grid and an optional vertical sign
    building(ctx, x, y, w, h, wall, L, seed, o) {
      o = o || {}; const R = rng(seed), ls = L.light.dir;
      P.wash(ctx, () => { ctx.beginPath(); ctx.rect(x, y, w, h); }, tint(wall, 0.15), tint(wall, -0.15), { span: [y, y + h] });
      // lit side strip
      const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(ls < 0 ? 0 : 1, 'rgba(255,225,180,0.35)'); g.addColorStop(0.5, 'rgba(255,225,180,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      const cols = o.cols || Math.max(2, Math.round(w / 70)), rows = Math.floor((h - 40) / (o.rowH || 80));
      const cw = (w - 30) / cols;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const lit = R() < (o.litP ?? 0.25), wx = x + 15 + c * cw + cw * 0.15, wy = y + 30 + r * (o.rowH || 80);
        ctx.fillStyle = lit ? (o.litCol || 'rgba(255,226,170,0.85)') : tint(wall, -0.35, 0.75); ctx.fillRect(wx, wy, cw * 0.7, (o.rowH || 80) * 0.55);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(wx, wy, cw * 0.7, 4);
      }
      if (o.sign) { const sx = ls < 0 ? x + w - 10 : x - 50, sh = Math.min(h * 0.5, 460), sy = y + 80;
        P.wash(ctx, () => { ctx.beginPath(); ctx.rect(sx, sy, 60, sh); }, o.sign, tint(o.sign, -0.2), { span: [sy, sy + sh] });
        ctx.fillStyle = 'rgba(255,248,230,0.85)'; for (let k = 0; k < 5; k++) { const yy = sy + 30 + k * sh / 5.5; ctx.fillRect(sx + 16, yy, 28, 10); ctx.fillRect(sx + 26, yy - 8, 8, 30); } }
    },
    house(ctx, x, y, w, h, wall, roof, L, seed) { // village house: timber/plaster walls, tiled roof
      const R = rng(seed), ls = L.light.dir;
      P.wash(ctx, () => { ctx.beginPath(); ctx.rect(x, y - h, w, h); }, tint(wall, 0.15), tint(wall, -0.2), { span: [y - h, y] });
      const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(ls < 0 ? 0 : 1, 'rgba(255,220,170,0.35)'); g.addColorStop(0.6, 'rgba(255,220,170,0)'); ctx.fillStyle = g; ctx.fillRect(x, y - h, w, h);
      const ov = w * 0.12, rh = h * 0.55;
      P.wash(ctx, () => { ctx.beginPath(); ctx.moveTo(x - ov, y - h + 4); ctx.lineTo(x + w / 2, y - h - rh); ctx.lineTo(x + w + ov, y - h + 4); ctx.closePath(); }, tint(roof, 0.15), tint(roof, -0.25), { span: [y - h - rh, y - h] });
      ctx.strokeStyle = tint(roof, -0.45, 0.4); ctx.lineWidth = 3;
      for (let k = 1; k < 6; k++) { const t = k / 6; ctx.beginPath(); ctx.moveTo(lerp(x - ov, x + w / 2, t), lerp(y - h + 4, y - h - rh, t)); ctx.lineTo(lerp(x + w + ov, x + w / 2, t), lerp(y - h + 4, y - h - rh, t)); ctx.stroke(); }
      ctx.fillStyle = tint(wall, -0.5, 0.8); ctx.fillRect(x + w * 0.38, y - h * 0.48, w * 0.24, h * 0.48); // door
      for (const wx of [x + w * 0.1, x + w * 0.72]) { ctx.fillStyle = R() < 0.5 ? 'rgba(255,214,150,0.85)' : tint(wall, -0.45, 0.8); ctx.fillRect(wx, y - h * 0.75, w * 0.18, h * 0.22); }
    },
  };

  // ---------- LOCATIONS ----------
  // light: dir (-1 = sun on the left of frame, +1 right), rim colour, key/shade tints for characters.
  // grade: post-process colour (soft-light), bloom strength, haze colour for the depth fog.
  const SUNSET_LIGHT = { dir: -1, rim: '#ffd59a', rimA: 0.95, key: 'rgba(255,226,180,0.4)', shade: 'rgba(70,52,110,0.5)', ao: 'rgba(60,30,44,0.32)' };
  const LOC = {
    meadow: {
      light: SUNSET_LIGHT, grade: { tint: '#ffcf9a', a: 0.22, bloom: 0.32 }, sun: { x: 180, y: 640, r: 60 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#9fb6d0', '#d9c9c4', '#f6d7b0', '#fbe6c6'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.cloud(c, 820, 360, 300, L, 3); P.cloud(c, 120, 230, 220, L, 8); P.cloud(c, 1500, 520, 260, L, 11); P.cloud(c, -360, 460, 240, L, 14);
        P.rays(c, L.sun.x, L.sun.y, 14, 1500, 1.1, 0.75, 0.10, 3);
        P.wash(c, () => P.ridge(c, CX, CX + CW, 1150, 120, 0.003, 21), '#c7b8c3', '#d9c2b9', { span: [1000, 1300] });
        P.haze(c, 950, 1400, '#f7d8b6', 0.45);
      },
      mid(c, L) {
        P.wash(c, () => P.ridge(c, CX, CX + CW, 1290, 160, 0.0024, 31), '#8fa36a', '#6f8a52', { span: [1150, 1500] });
        P.haze(c, 1150, 1330, '#f4d3ae', 0.35);
        P.tree(c, 860, 1380, 420, L, 4, { leaf: '#71904f' }); P.tree(c, 1180, 1360, 360, L, 9, { leaf: '#6a8a4d' }); P.tree(c, -120, 1370, 460, L, 12, { leaf: '#6f8d4f' });
        P.grass(c, CX, CX + CW, 1330, 120, '#7e9a5a', 5, 300);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.moveTo(CX, 1430); for (let x = CX; x <= CX + CW; x += 20) c.lineTo(x, 1430 + Math.sin(x * 0.004) * 18); c.lineTo(CX + CW, CY + CH); c.lineTo(CX, CY + CH); c.closePath(); }, '#a5b56f', '#6c7f45', { span: [1430, 2300] });
        // worn path where characters stand
        P.wash(c, () => { c.beginPath(); c.ellipse(560, 1640, 760, 120, 0, 0, 7); }, '#d9c39a', '#c3a97f', { span: [1520, 1760], blur: 6 });
        P.grass(c, CX, CX + CW, 1420, 80, '#93a85f', 6, 500); P.grass(c, CX, CX + CW, 1760, 500, '#6f8846', 7, 400);
        P.flowers(c, CX, CX + CW, 1440, 60, ['#fff3d6', '#f6c94a', '#e9a1b2'], 8, 70); P.flowers(c, CX, CX + CW, 1760, 600, ['#fff3d6', '#f6c94a', '#c9a6e6'], 9, 90);
      },
    },
    city: {
      light: { ...SUNSET_LIGHT, dir: 1 }, grade: { tint: '#ffc8a8', a: 0.22, bloom: 0.3 }, sun: { x: 600, y: 1050, r: 55 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#a8b9d6', '#e9c9c8', '#fbd9b8', '#fde8cc'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.cloud(c, 260, 260, 240, L, 21, { n: 12 }); P.cloud(c, 1080, 380, 280, L, 22, { n: 12 });
        const R = rng(30); for (let i = 0; i < 26; i++) { const w = 70 + R() * 120, h = 200 + R() * 520, x = CX + i * 85; P.wash(c, () => { c.beginPath(); c.rect(x, 1260 - h, w, h + 400); }, '#cdb9c6', '#e1c8c0', { span: [1260 - h, 1300], edge: 0 }); }
        P.haze(c, 800, 1400, '#fadcc0', 0.6);
      },
      mid(c, L) {
        const R = rng(31), walls = ['#b98a7a', '#9e8e9c', '#c4a28a', '#8d8aa0', '#b39484'], signs = ['#c8414a', '#2f62b0', '#e3b23c', '#3e8c7a'];
        let x = CX; while (x < 300) { const w = 200 + R() * 140, h = 900 + R() * 900; P.building(c, x, 1450 - h, w, h + 200, walls[(R() * 5) | 0], L, (R() * 1e4) | 0, { sign: R() < 0.6 ? signs[(R() * 4) | 0] : null }); x += w - 10; }
        x = 900; while (x < CX + CW) { const w = 200 + R() * 140, h = 900 + R() * 900; P.building(c, x, 1450 - h, w, h + 200, walls[(R() * 5) | 0], L, (R() * 1e4) | 0, { sign: R() < 0.6 ? signs[(R() * 4) | 0] : null }); x += w - 10; }
        P.haze(c, 900, 1500, '#f8d4b6', 0.3);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, CH); }, '#b7a9a6', '#8e8590', { span: [1440, 2400] });
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, 40); }, '#d8c9bd', '#c2b2a6', { span: [1440, 1480] }); // kerb
        c.fillStyle = 'rgba(255,240,215,0.5)'; for (let i = 0; i < 6; i++) c.fillRect(500, 1560 + i * 140, 70, 60); // lane marks toward the sun
        const g = c.createLinearGradient(0, 1440, 0, 2000); g.addColorStop(0, 'rgba(255,215,170,0.45)'); g.addColorStop(1, 'rgba(255,215,170,0)'); c.fillStyle = g; c.fillRect(300, 1440, 560, 700); // sun glare on road
      },
    },
    hall: { // grand interior: arched glowing windows, columns, polished floor (station, palace, temple)
      light: { dir: 1, rim: '#fff0d0', rimA: 0.9, key: 'rgba(255,238,210,0.35)', shade: 'rgba(70,70,120,0.45)', ao: 'rgba(50,40,60,0.3)' },
      grade: { tint: '#ffe0c0', a: 0.18, bloom: 0.42 }, sun: { x: 900, y: 700, r: 0 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#8d9bb4', '#b7bfd0', '#e9e2dc'], L);
        c.drawImage(streakTex(), CX, CY, CW, 1400);
        // vaulted ceiling ribs
        for (let i = 0; i < 8; i++) { const x = CX + 80 + i * 320 + 115; // vault ribs springing from the columns
          c.strokeStyle = 'rgba(66,74,108,0.4)'; c.lineWidth = 34; c.beginPath(); c.moveTo(x - 160, 420); c.quadraticCurveTo(x, -120, x + 160, 420); c.stroke();
          c.strokeStyle = 'rgba(255,240,220,0.25)'; c.lineWidth = 8; c.beginPath(); c.moveTo(x - 150, 410); c.quadraticCurveTo(x, -110, x + 150, 410); c.stroke(); }
        c.strokeStyle = 'rgba(66,74,108,0.3)'; c.lineWidth = 22; c.beginPath(); c.moveTo(CX, 440); c.lineTo(CX + CW, 440); c.stroke();
      },
      mid(c, L) {
        for (let i = 0; i < 7; i++) { const x = CX + 80 + i * 320, w = 230, top = 520, bot = 1500;
          const g = c.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#fff6e6'); g.addColorStop(0.7, '#fde9cf'); g.addColorStop(1, '#f2d6bb');
          c.fillStyle = g; c.beginPath(); c.moveTo(x, bot); c.lineTo(x, top + w / 2); c.arc(x + w / 2, top + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, bot); c.closePath(); c.fill();
          c.strokeStyle = 'rgba(150,140,150,0.45)'; c.lineWidth = 6; c.stroke(); c.lineWidth = 4;
          for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + w * k / 4, top + 20); c.lineTo(x + w * k / 4, bot); c.stroke(); }
          for (let k = 1; k < 8; k++) { c.beginPath(); c.moveTo(x, top + w / 2 + k * 120); c.lineTo(x + w, top + w / 2 + k * 120); c.stroke(); }
          P.wash(c, () => { c.beginPath(); c.rect(x + w + 10, 380, 70, 1300); }, '#c9c3cb', '#9d97a6', { span: [380, 1600] }); // column
        }
        P.rays(c, 1300, 300, 10, 1800, 0.5, 2.3, 0.12, 9);
        P.haze(c, 1000, 1550, '#fbe8d4', 0.3);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1450, CW, CH); }, '#d9cfc8', '#a99fa6', { span: [1450, 2400] });
        // reflections of the windows on the polished floor
        c.save(); c.globalAlpha = 0.35; c.filter = 'blur(8px)'; for (let i = 0; i < 7; i++) { const x = CX + 80 + i * 320; const g = c.createLinearGradient(0, 1450, 0, 1900); g.addColorStop(0, '#fff3df'); g.addColorStop(1, 'rgba(255,243,223,0)'); c.fillStyle = g; c.fillRect(x, 1450, 230, 450); } c.restore();
        c.strokeStyle = 'rgba(120,110,120,0.2)'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(CX, 1500 + i * i * 14); c.lineTo(CX + CW, 1500 + i * i * 14); c.stroke(); }
      },
    },
    village: { // old town / market: tiled roofs, plaster walls, a big tree, far mountains
      light: SUNSET_LIGHT, grade: { tint: '#ffcf98', a: 0.22, bloom: 0.3 }, sun: { x: 120, y: 520, r: 55 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#9db4cc', '#d8cdc4', '#f8d9b2', '#fbe5c5'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.cloud(c, 760, 300, 280, L, 41); P.cloud(c, 1550, 420, 230, L, 42); P.cloud(c, -300, 340, 200, L, 43);
        P.rays(c, L.sun.x, L.sun.y, 12, 1400, 1.0, 0.7, 0.09, 4);
        P.wash(c, () => P.ridge(c, CX, CX + CW, 1050, 260, 0.0022, 44), '#a9a6bd', '#cbbcbf', { span: [800, 1250] });
        P.haze(c, 900, 1350, '#f6d6b2', 0.6);
      },
      mid(c, L) {
        const R = rng(45), walls = ['#e7d2b4', '#d9b996', '#efdcc2', '#cfae8e'], roofs = ['#b0573d', '#9a4c3c', '#a8634a'];
        P.tree(c, 980, 1350, 560, L, 46, { leaf: '#6e8c4c' });
        let x = CX + 100; while (x < CX + CW) { if (x > 650 && x < 1250) { x += 120; continue; } const w = 220 + R() * 120, h = 260 + R() * 160; P.house(c, x, 1460, w, h, walls[(R() * 4) | 0], roofs[(R() * 3) | 0], L, (R() * 1e4) | 0); x += w + 20 + R() * 40; }
        // market awning
        P.wash(c, () => { c.beginPath(); c.moveTo(560, 1180); c.lineTo(900, 1180); c.lineTo(930, 1260); c.lineTo(530, 1260); c.closePath(); }, '#e9e1cf', '#d4c7ae', { span: [1180, 1260] });
        c.fillStyle = 'rgba(200,65,74,0.75)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(560 + k * 57, 1180); c.lineTo(588 + k * 57, 1180); c.lineTo(600 + k * 63, 1260); c.lineTo(570 + k * 63, 1260); c.closePath(); c.fill(); }
        P.wash(c, () => { c.beginPath(); c.rect(570, 1260, 340, 200); }, '#9b7754', '#6f5238', { span: [1260, 1460] });
        const fr = ['#f19a3e', '#e2574a', '#f4d35e', '#8fb35a']; for (let k = 0; k < 30; k++) { c.fillStyle = fr[k % 4]; c.beginPath(); c.arc(590 + (k % 10) * 32, 1290 + Math.floor(k / 10) * 30, 13, 0, 7); c.fill(); }
        P.haze(c, 1100, 1480, '#f6d4b0', 0.25);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, CH); }, '#d6bf9c', '#a88f72', { span: [1440, 2400] });
        const R = rng(47); c.strokeStyle = 'rgba(110,80,60,0.18)'; c.lineWidth = 3; // cobbles
        for (let i = 0; i < 260; i++) { const x = CX + R() * CW, y = 1470 + R() * 900; c.beginPath(); c.ellipse(x, y, 26 + R() * 18, 10 + R() * 6, 0, 0, 7); c.stroke(); }
        P.grass(c, CX, CX + CW, 1440, 30, '#8a9a5c', 48, 120);
      },
    },
    shore: { // sea, beach, cliffs, sunset path on the water
      light: { ...SUNSET_LIGHT, dir: 1, rim: '#ffcf96' }, grade: { tint: '#ffc79a', a: 0.24, bloom: 0.38 }, sun: { x: 820, y: 1060, r: 60 }, live: 'glitter',
      far(c, L) {
        P.sky(c, ['#8ea7c8', '#d6bcc4', '#f8c9a4', '#fde1bf'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.cloud(c, 300, 420, 320, L, 51); P.cloud(c, 1350, 300, 280, L, 52); P.cloud(c, 820, 760, 200, L, 53, { n: 10 });
        P.rays(c, L.sun.x, L.sun.y, 12, 1300, 1.4, -1.7, 0.08, 6);
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1110, CW, CH); }, '#9fb0c4', '#6f87a6', { span: [1110, 1600], edge: 0 }); // sea
        const g = c.createLinearGradient(L.sun.x - 120, 0, L.sun.x + 120, 0); g.addColorStop(0, 'rgba(255,220,170,0)'); g.addColorStop(0.5, 'rgba(255,226,180,0.75)'); g.addColorStop(1, 'rgba(255,220,170,0)');
        c.fillStyle = g; for (let i = 0; i < 40; i++) { const y = 1115 + i * i * 0.35, w = 30 + i * 6; c.fillRect(L.sun.x - w + Math.sin(i * 7) * 20, y, w * 2, 3 + i * 0.15); }
        P.haze(c, 1000, 1180, '#fbd8b8', 0.5);
      },
      mid(c, L) {
        P.wash(c, () => { c.beginPath(); c.moveTo(CX, 1500); c.lineTo(CX, 700); c.quadraticCurveTo(-200, 640, 60, 900); c.quadraticCurveTo(160, 1100, 260, 1500); c.closePath(); }, '#8c7a78', '#5f5363', { span: [700, 1500] });
        P.tree(c, -120, 760, 300, L, 54, { leaf: '#6f8a54' });
        c.strokeStyle = 'rgba(255,248,235,0.6)'; c.lineWidth = 5; c.lineCap = 'round'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(CX, 1330 + i * 32); for (let x = CX; x <= CX + CW; x += 30) c.lineTo(x, 1330 + i * 32 + Math.sin(x * 0.02 + i) * 6); c.stroke(); }
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.moveTo(CX, 1460); for (let x = CX; x <= CX + CW; x += 20) c.lineTo(x, 1450 + Math.sin(x * 0.006) * 16); c.lineTo(CX + CW, CY + CH); c.lineTo(CX, CY + CH); c.closePath(); }, '#ecd2ac', '#c9a77f', { span: [1450, 2400] });
        const g = c.createLinearGradient(0, 1440, 0, 1500); g.addColorStop(0, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(CX, 1440, CW, 60); // foam line
        const R = rng(55); c.fillStyle = 'rgba(140,110,90,0.25)'; for (let i = 0; i < 300; i++) { c.beginPath(); c.arc(CX + R() * CW, 1500 + R() * 900, 1 + R() * 3, 0, 7); c.fill(); }
      },
    },
    forest: { // tall trunks, canopy, strong light shafts, ferns
      light: { dir: -1, rim: '#ffe4a6', rimA: 0.95, key: 'rgba(255,232,180,0.38)', shade: 'rgba(40,60,70,0.5)', ao: 'rgba(30,40,30,0.35)' },
      grade: { tint: '#e8d08c', a: 0.2, bloom: 0.36 }, sun: { x: 120, y: 200, r: 40 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#c9d6b4', '#e7e0bd', '#d7d6b0'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r, 'rgba(255,240,190,0.8)');
        const R = rng(61); for (let i = 0; i < 22; i++) { const x = CX + R() * CW, w = 40 + R() * 50; P.wash(c, () => { c.beginPath(); c.rect(x, CY, w, CH); }, '#b8c1a0', '#c5c7a6', { edge: 0 }); }
        P.haze(c, 200, 1600, '#efe6c2', 0.35);
      },
      mid(c, L) {
        const R = rng(62);
        for (let i = 0; i < 9; i++) { const x = CX + 100 + i * 250 + R() * 80, w = 70 + R() * 70;
          P.wash(c, () => { c.beginPath(); c.moveTo(x, CY); c.lineTo(x + w, CY); c.lineTo(x + w * 1.15, 1520); c.lineTo(x - w * 0.15, 1520); c.closePath(); }, '#7b6a5a', '#4f4440', { span: [CY, 1520] });
          const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(255,220,160,0.45)'); g.addColorStop(0.35, 'rgba(255,220,160,0)'); c.fillStyle = g; c.fillRect(x - 10, CY, w + 20, 2000);
          c.strokeStyle = 'rgba(40,30,30,0.22)'; c.lineWidth = 4; for (let k = 0; k < 6; k++) { const bx = x + w * (0.15 + k * 0.14); c.beginPath(); c.moveTo(bx, CY); for (let y = CY; y < 1520; y += 60) c.lineTo(bx + Math.sin(y * 0.01 + k) * 4, y); c.stroke(); } }
        const cg = c.createLinearGradient(0, CY, 0, 500); cg.addColorStop(0, '#3f5a36'); cg.addColorStop(1, 'rgba(63,90,54,0)'); c.fillStyle = cg; c.fillRect(CX, CY, CW, 980);
        for (let i = 0; i < 26; i++) P.tree(c, CX + i * 90 + R() * 60, 420 + R() * 260, 420, L, 63 + i, { leaf: R() < 0.5 ? '#5f7f48' : '#6d8a4e', n: 8, trunk: false }); // canopy clumps
        P.rays(c, -200, -300, 16, 2600, 0.6, 1.05, 0.16, 7);
        P.haze(c, 1100, 1550, '#f0e2b8', 0.3);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, CH); }, '#7f8f55', '#4f5e38', { span: [1440, 2400] });
        P.wash(c, () => { c.beginPath(); c.ellipse(540, 1620, 640, 110, 0, 0, 7); }, '#a7966d', '#8a7a55', { span: [1520, 1730], blur: 8 });
        P.grass(c, CX, CX + CW, 1430, 60, '#6f8a4a', 64, 400);
        const R = rng(65); for (let i = 0; i < 14; i++) { const x = CX + R() * CW, y = 1760 + R() * 500; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.32; c.strokeStyle = tint('#5f8a46', (R() - 0.3) * 0.5, 0.85); c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * 80, y + Math.sin(a) * 120, x + Math.cos(a) * 160, y + Math.sin(a) * 120 + 40); c.stroke(); } }
      },
    },
    sky: { // up among the clouds (flying, falling, heavens). Ground line is not used.
      light: { dir: -1, rim: '#fff0c8', rimA: 0.95, key: 'rgba(255,240,210,0.38)', shade: 'rgba(70,90,140,0.45)', ao: 'rgba(60,60,90,0.25)' },
      grade: { tint: '#ffe2bc', a: 0.18, bloom: 0.45 }, sun: { x: 360, y: 520, r: 70 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#6f97c6', '#9fbcdc', '#d9e2ea', '#f2e6da'], L); c.globalAlpha = 0.6; c.drawImage(streakTex(), CX, CY, CW, CH); c.globalAlpha = 1;
        P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.rays(c, L.sun.x, L.sun.y, 20, 1800, 6.28, 0, 0.07, 8);
        P.cloud(c, 1400, 900, 340, L, 71); P.cloud(c, -300, 1200, 320, L, 72); P.cloud(c, 700, 1500, 300, L, 73);
      },
      mid(c, L) { P.cloud(c, -60, 700, 380, L, 74); P.cloud(c, 1250, 1500, 420, L, 75); P.cloud(c, 420, 2200, 460, L, 76); },
      near(c, L) { P.cloud(c, 1000, 2500, 520, L, 77); P.cloud(c, -200, 2450, 480, L, 78); },
    },
    night: { // moonlit village: cool blue light, warm lanterns and windows
      light: { dir: 1, rim: '#bcd4ff', rimA: 0.85, key: 'rgba(255,200,140,0.28)', shade: 'rgba(20,24,70,0.55)', ao: 'rgba(10,12,40,0.4)' },
      grade: { tint: '#7d8fd0', a: 0.2, bloom: 0.45 }, sun: { x: 860, y: 420, r: 70 }, live: 'fireflies', night: true,
      far(c, L) {
        P.sky(c, ['#1f2650', '#34407a', '#58639a', '#8a86ad'], L);
        const R = rng(81); c.fillStyle = '#fff6dc'; for (let i = 0; i < 160; i++) { c.globalAlpha = 0.3 + R() * 0.7; c.beginPath(); c.arc(CX + R() * CW, CY + R() * 1500, 0.8 + R() * 2.2, 0, 7); c.fill(); } c.globalAlpha = 1;
        const g = c.createRadialGradient(860, 420, 0, 860, 420, 600); g.addColorStop(0, 'rgba(220,230,255,0.55)'); g.addColorStop(1, 'rgba(200,210,255,0)'); c.fillStyle = g; c.fillRect(260, -180, 1200, 1200);
        c.fillStyle = '#f6f1de'; c.beginPath(); c.arc(860, 420, 70, 0, 7); c.fill();
        P.cloud(c, 300, 600, 260, L, 82, { lit: '#c9cfe8', mid: '#8f97c2', dark: '#4a527f' }); P.cloud(c, 1500, 500, 240, L, 83, { lit: '#c9cfe8', mid: '#8f97c2', dark: '#4a527f' });
        P.wash(c, () => P.ridge(c, CX, CX + CW, 1150, 200, 0.0025, 84), '#3d4775', '#4c5583', { span: [900, 1300] });
        P.haze(c, 950, 1400, '#6d73a6', 0.5);
      },
      mid(c, L) {
        const R = rng(85), walls = ['#5d5f86', '#6a6a8e', '#55587e'], roofs = ['#3f3a5e', '#47405f'];
        let x = CX + 60; while (x < CX + CW) { const w = 220 + R() * 120, h = 260 + R() * 160; P.house(c, x, 1460, w, h, walls[(R() * 3) | 0], roofs[(R() * 2) | 0], { light: L.light }, (R() * 1e4) | 0); x += w + 30 + R() * 50; }
        c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const lx = CX + 150 + i * 240, ly = 1180 + (i % 3) * 40; const g = c.createRadialGradient(lx, ly, 0, lx, ly, 120); g.addColorStop(0, 'rgba(255,190,110,0.7)'); g.addColorStop(1, 'rgba(255,160,80,0)'); c.fillStyle = g; c.fillRect(lx - 120, ly - 120, 240, 240); c.fillStyle = '#ffd68a'; c.beginPath(); c.ellipse(lx, ly, 14, 20, 0, 0, 7); c.fill(); } c.restore();
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, CH); }, '#4a4f78', '#2c3058', { span: [1440, 2400] });
        const g = c.createLinearGradient(0, 1440, 0, 1700); g.addColorStop(0, 'rgba(255,180,110,0.25)'); g.addColorStop(1, 'rgba(255,180,110,0)'); c.fillStyle = g; c.fillRect(CX, 1440, CW, 260);
        P.grass(c, CX, CX + CW, 1430, 40, '#3e4d6a', 86, 200);
      },
    },
  };

  // ---------- cache + parallax ----------
  const CACHE = {};
  const DEPTH = { far: 0.25, mid: 0.7, near: 1 };
  function getLoc(id) {
    const L = LOC[id] || (G.CUSTOM && G.CUSTOM.loc && G.CUSTOM.loc[id]);
    if (!L) throw new Error('unknown location ' + id);
    L.light = L.light || SUNSET_LIGHT; L.grade = L.grade || { tint: '#ffd0a0', a: 0.2, bloom: 0.3 };
    return L;
  }
  function paint(id) {
    if (CACHE[id]) return CACHE[id];
    const L = getLoc(id), out = {};
    const prev = G.PT.LIGHT; G.PT.LIGHT = L.light;
    for (const layer of ['far', 'mid', 'near']) {
      if (!L[layer]) continue;
      const cv = mk(CW, CH), c = cv.getContext('2d');
      c.translate(-CX, -CY); L[layer](c, L); c.setTransform(1, 0, 0, 1, 0, 0);
      // watercolor treatment on painted pixels only
      c.globalCompositeOperation = 'source-atop';
      c.globalAlpha = L.night ? 0.18 : 0.12; c.drawImage(washTex(), 0, 0, CW, CH);
      c.globalAlpha = L.night ? 0.12 : 0.35; c.drawImage(streakTex(), 0, 0, CW, CH);
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      out[layer] = cv;
    }
    G.PT.LIGHT = prev;
    return (CACHE[id] = out);
  }

  function live(ctx, L, t) { // light, deterministic life on top of the painting (world space)
    if (!L.live) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (L.live === 'motes' || L.live === 'fireflies') {
      const n = L.live === 'motes' ? 40 : 26, col = L.live === 'motes' ? '255,236,190' : '255,214,120';
      for (let i = 0; i < n; i++) {
        const sx = hash2(i, 1, 7) * 1500 - 210, sy = hash2(i, 2, 7) * 1700 + 100, sp = 6 + hash2(i, 3, 7) * 14;
        const x = sx + Math.sin(t * 0.3 + i) * 40 + t * sp * 0.6, y = sy - t * sp * 0.4 + Math.sin(t * 0.5 + i * 2) * 25;
        const tw = 0.5 + 0.5 * Math.sin(t * (L.live === 'motes' ? 1.3 : 2.6) + i * 3.1), r = (L.live === 'motes' ? 2 : 4) + hash2(i, 4, 7) * 3;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, `rgba(${col},${0.55 * tw})`); g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
      }
    } else if (L.live === 'glitter') {
      for (let i = 0; i < 50; i++) { const x = L.sun.x + (hash2(i, 5, 3) - 0.5) * (200 + hash2(i, 6, 3) * 500), y = 1120 + hash2(i, 7, 3) * 330; const a = Math.max(0, Math.sin(t * 3 + i * 1.7)) * 0.8;
        ctx.fillStyle = `rgba(255,240,200,${a})`; ctx.fillRect(x - 10, y, 20, 2); }
    }
    ctx.restore();
  }

  function drawBG(ctx, id, t, cam) {
    const L = getLoc(id), layers = paint(id);
    cam = cam || { x: 540, y: 960, zoom: 1 };
    G.PT.LIGHT = L.light; G.PT.GRADE = L.grade;
    // fallback colours beyond the painted region
    ctx.fillStyle = L.night ? '#1f2650' : '#e9d6c0'; ctx.fillRect(CX - 3000, CY - 3000, CW + 6000, CH + 6000);
    for (const layer of ['far', 'mid', 'near']) {
      const cv = layers[layer]; if (!cv) continue;
      const d = DEPTH[layer], k = Math.pow(cam.zoom || 1, d - 1);
      const cpx = 540 + d * (cam.x - 540), cpy = 960 + d * (cam.y - 960);
      ctx.save(); ctx.translate(cam.x, cam.y); ctx.scale(k, k); ctx.translate(-cpx, -cpy);
      ctx.drawImage(cv, CX, CY);
      if (layer === 'mid') live(ctx, L, t || 0);
      ctx.restore();
    }
  }
  // soft contact shadow under a character
  function shadow(ctx, x, y, w) {
    const g = ctx.createRadialGradient(x, y + 4, 0, x, y + 4, w);
    g.addColorStop(0, 'rgba(50,30,40,0.38)'); g.addColorStop(0.6, 'rgba(50,30,40,0.14)'); g.addColorStop(1, 'rgba(50,30,40,0)');
    ctx.save(); ctx.translate(x, y + 4); ctx.scale(1, 0.18); ctx.translate(-x, -y - 4); ctx.fillStyle = g; ctx.fillRect(x - w, y + 4 - w, w * 2, w * 2); ctx.restore();
  }

  G.PT = G.PT || {};
  Object.assign(G.PT, { W, H, GROUND, LOC, drawBG, shadow, PAINT: P, TEX: { grainTex, paperTex, washTex, streakTex }, noise: { hash2, fbm, rng }, mkCanvas: mk, preloadBG: paint });
})(typeof window !== 'undefined' ? window : globalThis);
