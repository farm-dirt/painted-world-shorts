// painted-world-shorts — character rig (Canvas 2D, deterministic)
// drawCharacter(ctx, charId, x, y, heightPx, pose)
//   x,y = point between the feet (ground contact). heightPx = full standing height.
// Look: stylized 3D feature-animation characters. NO ink outlines. Every shape is shaded:
// warm key light, cool shadow side, ambient occlusion at the bottom, and a golden RIM LIGHT on
// the side facing the sun (PT.LIGHT, set per location). Big eyes with irises + catchlights,
// rosy cheeks, hair in chunky clumped locks with a few flyaway strands.
(function (G) {
  const INK = '#2a1f24';
  const DEF_LIGHT = { dir: -1, rim: '#ffdca6', rimA: 0.9, key: 'rgba(255,233,196,0.38)', shade: 'rgba(54,44,98,0.5)', ao: 'rgba(48,26,40,0.30)' };
  const LIGHT = () => (G.PT && G.PT.LIGHT) || DEF_LIGHT;

  // ---------- colour helpers ----------
  function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgb(c, a) { return a === undefined ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
  function tint(h, k, a) { // k>0 lighten toward warm white, k<0 darken toward cool violet-brown
    const c = hex2rgb(h);
    const o = k >= 0 ? c.map((v, i) => v + ([255, 246, 228][i] - v) * k) : c.map((v, i) => v + ([46, 30, 52][i] - v) * -k);
    return rgb(o, a);
  }
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------- ORIGINAL CAST ----------
  // Proportions are fractions of the character's own height H. Signature colour = one clear block.
  const CAST = {
    mara: { // lead: curious, brave, talks fast. Long dark wavy hair, mustard-yellow rain jacket.
      name: 'Mara', rel: 1.0, build: 'slim',
      head: 0.235, headW: 0.86, jaw: 0.78, leg: 0.45, shoulder: 0.2, hip: 0.16, limb: 0.034,
      skin: '#e2a982', blush: '#ef8d7a', iris: '#7b4a26', brow: '#3a2219',
      hair: { type: 'long', color: '#3d2418', hi: '#8a5634' },
      top: { type: 'jacket', color: '#e3b23c', inner: '#f3ece0' },
      bottom: { type: 'pants', color: '#3f4a5c' }, shoe: '#f2efe8', sole: '#c9c2b6',
    },
    ren: { // lanky friend: dry humour, overthinks. Messy black hair, sage-green bomber jacket.
      name: 'Ren', rel: 1.1, build: 'slim',
      head: 0.215, headW: 0.84, jaw: 0.8, leg: 0.47, shoulder: 0.21, hip: 0.15, limb: 0.032,
      skin: '#f0c9a6', blush: '#eb9a88', iris: '#5c6f86', brow: '#1f1a20',
      hair: { type: 'messy', color: '#1f1b22', hi: '#4f4a5e' },
      top: { type: 'jacket', color: '#7f9c74', inner: '#2f3446' },
      bottom: { type: 'pants', color: '#2c3550' }, shoe: '#5a3c2c', sole: '#3a2a22',
    },
    lola: { // tiny sharp-eyed grandmother, knows every legend. Silver bun, terracotta shawl.
      name: 'Lola Ising', rel: 0.7, build: 'round',
      head: 0.29, headW: 0.92, jaw: 0.86, leg: 0.3, shoulder: 0.24, hip: 0.3, limb: 0.042,
      skin: '#b97c58', blush: '#d97764', iris: '#4a2f22', brow: '#c9c3c8', glasses: '#8a5a3a',
      hair: { type: 'bun', color: '#d8d4dc', hi: '#ffffff' },
      top: { type: 'shawl', color: '#c4573c', inner: '#efe2c8' },
      bottom: { type: 'skirt', color: '#5d3d63', len: 0.9 }, shoe: '#4a3530', sole: '#2f2320',
    },
    dado: { // big gentle vendor/driver/guard. Moustache, cobalt work shirt, flat cap.
      name: 'Mang Dado', rel: 1.05, build: 'broad',
      head: 0.255, headW: 0.96, jaw: 1.0, leg: 0.41, shoulder: 0.3, hip: 0.27, limb: 0.045,
      skin: '#c48660', blush: '#d97a66', iris: '#3d2a20', brow: '#3b2b26', moustache: '#4a3a34',
      hair: { type: 'buzz', color: '#3b2b26', hi: '#6e5a52' }, hat: { type: 'cap', color: '#6d6458' },
      top: { type: 'shirt', color: '#2f62b0', inner: '#f1ead8' },
      bottom: { type: 'pants', color: '#6b4f3a' }, shoe: '#3a2a22', sole: '#241a15',
    },
    tala: { // kid sidekick: fearless, asks the obvious question. Black bob, coral-red tee.
      name: 'Tala', rel: 0.62, build: 'slim',
      head: 0.31, headW: 0.92, jaw: 0.82, leg: 0.33, shoulder: 0.19, hip: 0.17, limb: 0.04,
      skin: '#d49a70', blush: '#ef8878', iris: '#5a3420', brow: '#241b1c', freckles: true,
      hair: { type: 'bob', color: '#221b1f', hi: '#5c4a58' },
      top: { type: 'tee', color: '#e2574a', inner: '#ffffff' },
      bottom: { type: 'shorts', color: '#4f6f9a' }, shoe: '#f4d35e', sole: '#c9a93c',
    },
  };

  // ---------- EXPRESSIONS ----------
  const FACES = {
    neutral: { brow: 'flat', mouth: 'line', eye: 1.0 },
    happy: { brow: 'up', mouth: 'smile', eye: 1.0 },
    grin: { brow: 'up', mouth: 'grin', eye: 0.92, lidLow: 0.25 },
    shock: { brow: 'high', mouth: 'O', eye: 1.18, pupil: 0.7 },
    angry: { brow: 'angry', mouth: 'frown', eye: 0.9, lid: 0.25 },
    worried: { brow: 'worried', mouth: 'wobble', eye: 1.06 },
    sad: { brow: 'worried', mouth: 'frown', eye: 1.0, lid: 0.3, tears: true },
    smug: { brow: 'smug', mouth: 'smirk', eye: 0.9, lid: 0.42 },
    awe: { brow: 'high', mouth: 'open', eye: 1.12, pupil: 1.1 },
    talk: { brow: 'up', mouth: 'talk', eye: 1.0 },
    sleepy: { brow: 'flat', mouth: 'line', eye: 1.0, lid: 0.7 },
    scared: { brow: 'worried', mouth: 'O', eye: 1.15, pupil: 0.6 },
  };

  const DEF_POSE = {
    facing: 1, view: 'front', lean: 0, headTilt: 0, look: [0, 0], blink: 0,
    face: 'neutral', talk: 0, squash: 1,
    armL: [0.2, 0.15], armR: [0.2, 0.15], walk: null, legSpread: 0.05, hop: 0,
  };

  // ---------- primitives ----------
  function ellipse(ctx, x, y, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2); }
  // kept for engine/props compatibility: fill + soft (non-ink) edge
  function fillStroke(ctx, fill, lw) {
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.lineWidth = Math.max(1.5, (lw || 4) * 0.6); ctx.strokeStyle = 'rgba(42,31,36,0.35)'; ctx.stroke();
  }

  // Shade the path drawn by pathFn. box = [x, y, w, h] (local space), ls = +1/-1 = side the light comes from.
  // o: {rim (0..1), flat (0..1 less form shading), edge (soft dark edge alpha)}
  function shade(ctx, pathFn, base, box, ls, o) {
    o = o || {}; const L = LIGHT(); const [bx, by, bw, bh] = box;
    pathFn(); ctx.fillStyle = base; ctx.fill();
    ctx.save(); pathFn(); ctx.clip();
    const k = 1 - (o.flat || 0);
    const lx = ls > 0 ? bx + bw : bx, sx = ls > 0 ? bx : bx + bw;
    let g = ctx.createLinearGradient(lx, 0, sx, 0); // form: warm light side -> cool shadow side
    g.addColorStop(0, L.key); g.addColorStop(0.38, 'rgba(255,240,215,0)'); g.addColorStop(0.52, 'rgba(50,40,90,0)'); g.addColorStop(1, L.shade);
    ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
    g = ctx.createLinearGradient(0, by, 0, by + bh); // top light + ambient occlusion
    g.addColorStop(0, 'rgba(255,244,222,0.16)'); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, L.ao);
    ctx.fillStyle = g; ctx.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
    ctx.globalAlpha = 1;
    const rim = o.rim ?? 1;
    if (rim > 0) { // golden rim light hugging the lit edge
      const rw = Math.max(2, Math.min(bw, bh) * 0.09);
      g = ctx.createLinearGradient(lx, 0, lx - ls * bw * 0.5, 0);
      g.addColorStop(0, rgb(hex2rgb(L.rim), L.rimA * rim)); g.addColorStop(0.35, rgb(hex2rgb(L.rim), 0.15 * rim)); g.addColorStop(1, rgb(hex2rgb(L.rim), 0));
      pathFn(); ctx.lineWidth = rw * 2; ctx.strokeStyle = g; ctx.stroke();
    }
    ctx.restore();
    const e = o.edge ?? 0.22;
    if (e > 0) { pathFn(); ctx.lineWidth = Math.max(1.2, Math.min(bw, bh) * 0.012); ctx.strokeStyle = `rgba(40,24,34,${e})`; ctx.stroke(); }
  }

  // cylinder-shaded tube along a polyline (limbs)
  function tube(ctx, pts, color, w, ls) {
    const L = LIGHT();
    const line = (dx, width, style, alpha) => {
      ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.strokeStyle = style;
      ctx.beginPath(); ctx.moveTo(pts[0][0] + dx, pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + dx, pts[i][1]);
      ctx.stroke();
    };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    line(0, w + Math.max(1.5, w * 0.06), 'rgba(40,24,34,0.25)', 1);
    line(0, w, color, 1);
    line(-ls * w * 0.2, w * 0.45, tint(color, -0.45), 0.35);
    line(ls * w * 0.16, w * 0.4, tint(color, 0.35), 0.45);
    line(ls * w * 0.4, w * 0.13, L.rim, L.rimA * 0.8);
    ctx.globalAlpha = 1;
  }
  // legacy name (CTA hand uses it)
  function limb(ctx, pts, color, w) { tube(ctx, pts, color, w, LIGHT().dir); }

  function headPath(ctx, w, h, top, bot, n) {
    ctx.beginPath(); const N = 64;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      const y = Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * h / 2;
      const u = (y / h) + 0.5, k = lerp(top, bot, u * u);
      const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * w / 2 * k;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  // ---------- hair ----------
  // Drawn in head space (centre 0,0; w,h = head size): sheen gradient, clump separation lines,
  // highlight strokes, then a few flyaway strands catching the rim light.
  function hairPaint(ctx, C, pathFn, w, h, ls, box, seed) {
    const col = C.hair.color, hi = C.hair.hi || tint(col, 0.4);
    shade(ctx, pathFn, col, box, ls, { rim: 1, edge: 0.15 });
    ctx.save(); pathFn(); ctx.clip();
    const g = ctx.createLinearGradient(0, -h * 0.55, 0, -h * 0.1);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, hi); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 0.28; ctx.fillStyle = g; ctx.fillRect(box[0], -h * 0.55, box[2], h * 0.45); ctx.globalAlpha = 1;
    ctx.lineCap = 'round';
    const n = 6;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, x = box[0] + box[2] * u, sw = Math.sin(seed + i * 1.7) * w * 0.06;
      ctx.beginPath(); ctx.moveTo(x * 0.5, box[1] + box[3] * 0.06); ctx.quadraticCurveTo(x * 1.1 + sw, box[1] + box[3] * 0.45, x * 1.08 + sw, box[1] + box[3]);
      ctx.strokeStyle = tint(col, -0.55, 0.3); ctx.lineWidth = w * 0.022; ctx.filter = `blur(${Math.max(0.5, w * 0.006)}px)`; ctx.stroke(); ctx.filter = 'none';
      ctx.beginPath(); ctx.moveTo(x * 0.6 + w * 0.03, box[1] + box[3] * 0.08); ctx.quadraticCurveTo(x + sw + w * 0.03, box[1] + box[3] * 0.4, x * 1.02 + sw + w * 0.02, box[1] + box[3] * 0.62);
      ctx.strokeStyle = hi; ctx.globalAlpha = 0.22; ctx.lineWidth = w * 0.016; ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function flyaways(ctx, C, w, h, list) {
    ctx.lineCap = 'round';
    for (const [col, lwk, a] of [[C.hair.color, 0.008, 1], [LIGHT().rim, 0.005, 0.6]]) {
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, w * lwk); ctx.globalAlpha = a;
      for (const [x0, y0, cx, cy, x1, y1] of list) { ctx.beginPath(); ctx.moveTo(x0 * w, y0 * h); ctx.quadraticCurveTo(cx * w, cy * h, x1 * w, y1 * h); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  // wavy clumped edge from (x0,y) to (x1,y)
  function scallop(ctx, x0, x1, y, n, depth, seed) {
    for (let i = 1; i <= n; i++) {
      const xa = lerp(x0, x1, (i - 0.5) / n), xb = lerp(x0, x1, i / n);
      ctx.quadraticCurveTo(xa, y + depth * (0.8 + 0.5 * Math.sin(seed + i * 2.1)), xb, y + depth * 0.1 * Math.sin(i + seed));
    }
  }

  function backHair(ctx, C, w, h, ls, side) {
    const t = C.hair.type, ox = side ? -w * 0.1 : 0;
    if (t === 'long') {
      const p = () => { ctx.beginPath(); ctx.moveTo(ox - w * 0.52, -h * 0.1); ctx.bezierCurveTo(ox - w * 0.62, -h * 0.75, ox + w * 0.62, -h * 0.75, ox + w * 0.52, -h * 0.1);
        ctx.quadraticCurveTo(ox + w * 0.66, h * 0.7, ox + w * 0.6, h * 1.45); scallop(ctx, ox + w * 0.6, ox - w * 0.6, h * 1.45, 6, h * 0.12, 3); ctx.quadraticCurveTo(ox - w * 0.66, h * 0.7, ox - w * 0.52, -h * 0.1); ctx.closePath(); };
      hairPaint(ctx, C, p, w, h, ls, [ox - w * 0.66, -h * 0.6, w * 1.32, h * 2.1], 1);
    } else if (t === 'bob') {
      const p = () => { ctx.beginPath(); ctx.moveTo(ox - w * 0.55, -h * 0.05); ctx.bezierCurveTo(ox - w * 0.62, -h * 0.78, ox + w * 0.62, -h * 0.78, ox + w * 0.55, -h * 0.05);
        ctx.quadraticCurveTo(ox + w * 0.6, h * 0.3, ox + w * 0.56, h * 0.48); scallop(ctx, ox + w * 0.56, ox - w * 0.56, h * 0.48, 5, h * 0.06, 2); ctx.quadraticCurveTo(ox - w * 0.6, h * 0.3, ox - w * 0.55, -h * 0.05); ctx.closePath(); };
      hairPaint(ctx, C, p, w, h, ls, [ox - w * 0.62, -h * 0.6, w * 1.24, h * 1.1], 2);
    } else if (t === 'ponytail') {
      const p = () => { ctx.beginPath(); ctx.moveTo(-w * 0.1, -h * 0.42); ctx.bezierCurveTo(-w * 0.75, -h * 0.4, -w * 0.85, h * 0.4, -w * 0.62, h * 0.95);
        ctx.quadraticCurveTo(-w * 0.5, h * 0.5, -w * 0.3, -h * 0.2); ctx.closePath(); };
      hairPaint(ctx, C, p, w, h, ls, [-w * 0.85, -h * 0.45, w * 0.8, h * 1.4], 4);
    } else if (t === 'bun') {
      const p = () => { ellipse(ctx, side ? -w * 0.32 : 0, -h * 0.52, w * 0.22, h * 0.17); };
      hairPaint(ctx, C, p, w, h, ls, [-w * 0.3, -h * 0.7, w * 0.6, h * 0.36], 5);
    }
  }

  function frontHair(ctx, C, w, h, ls, side) {
    const t = C.hair.type, fx = side ? w * 0.06 : 0;
    if (t === 'long' || t === 'bob' || t === 'ponytail') {
      const p = () => {
        ctx.beginPath(); ctx.moveTo(-w * 0.53, h * 0.05);
        ctx.bezierCurveTo(-w * 0.6, -h * 0.72, w * 0.6, -h * 0.72, w * 0.53, h * 0.05);
        if (t !== 'ponytail') { ctx.quadraticCurveTo(w * 0.52, h * 0.38, w * 0.44, h * (t === 'bob' ? 0.42 : 0.6)); ctx.quadraticCurveTo(w * 0.38, h * 0.1, w * 0.4, -h * 0.12); }
        else ctx.quadraticCurveTo(w * 0.45, -h * 0.05, w * 0.4, -h * 0.12);
        ctx.quadraticCurveTo(w * 0.22 + fx, -h * 0.02, fx - w * 0.02, -h * 0.2);
        ctx.quadraticCurveTo(fx - w * 0.06, -h * 0.28, fx - w * 0.12, -h * 0.3);
        ctx.quadraticCurveTo(-w * 0.28 + fx, -h * 0.12, -w * 0.4, -h * 0.05);
        if (t !== 'ponytail') { ctx.quadraticCurveTo(-w * 0.4, h * 0.25, -w * 0.46, h * (t === 'bob' ? 0.42 : 0.62)); ctx.quadraticCurveTo(-w * 0.55, h * 0.35, -w * 0.53, h * 0.05); }
        ctx.closePath();
      };
      hairPaint(ctx, C, p, w, h, ls, [-w * 0.58, -h * 0.6, w * 1.16, h * 1.2], 6);
      flyaways(ctx, C, w, h, [[0.02, -0.52, 0.1, -0.72, 0.2, -0.66], [-0.3, -0.42, -0.45, -0.55, -0.52, -0.5], [0.5, 0.2, 0.62, 0.35, 0.58, 0.5]]);
    } else if (t === 'messy') {
      const p = () => {
        ctx.beginPath(); ctx.moveTo(-w * 0.52, h * 0.02);
        ctx.quadraticCurveTo(-w * 0.62, -h * 0.4, -w * 0.4, -h * 0.55);
        const tips = [[-0.44, -0.62], [-0.24, -0.66], [-0.04, -0.72], [0.16, -0.68], [0.34, -0.66], [0.5, -0.5], [0.6, -0.36]];
        let px = -0.4;
        for (const [x, y] of tips) { ctx.quadraticCurveTo((px + x) / 2 * w, (y - 0.1) * h, x * w, y * h); px = x; ctx.quadraticCurveTo((x + 0.05) * w, (y + 0.06) * h, (x + 0.07) * w, (y + 0.05) * h); }
        ctx.quadraticCurveTo(w * 0.58, -h * 0.25, w * 0.52, h * 0.02);
        ctx.quadraticCurveTo(w * 0.42, -h * 0.2, w * 0.3, -h * 0.18);
        ctx.lineTo(w * 0.2, -h * 0.06); ctx.lineTo(w * 0.1, -h * 0.2); ctx.lineTo(-w * 0.02, -h * 0.04); ctx.lineTo(-w * 0.14, -h * 0.2); ctx.lineTo(-w * 0.28, -h * 0.08); ctx.lineTo(-w * 0.36, -h * 0.2);
        ctx.quadraticCurveTo(-w * 0.46, -h * 0.12, -w * 0.52, h * 0.02); ctx.closePath();
      };
      hairPaint(ctx, C, p, w, h, ls, [-w * 0.62, -h * 0.82, w * 1.24, h * 0.84], 7);
      flyaways(ctx, C, w, h, [[-0.04, -0.72, 0.02, -0.86, 0.1, -0.84]]);
    } else if (t === 'bun') {
      const p = () => { ctx.beginPath(); ctx.moveTo(-w * 0.5, h * 0.02); ctx.bezierCurveTo(-w * 0.58, -h * 0.66, w * 0.58, -h * 0.66, w * 0.5, h * 0.02);
        ctx.quadraticCurveTo(w * 0.42, -h * 0.26, 0, -h * 0.3); ctx.quadraticCurveTo(-w * 0.42, -h * 0.26, -w * 0.5, h * 0.02); ctx.closePath(); };
      hairPaint(ctx, C, p, w, h, ls, [-w * 0.56, -h * 0.55, w * 1.12, h * 0.6], 8);
      flyaways(ctx, C, w, h, [[0.3, -0.44, 0.42, -0.6, 0.5, -0.56]]);
    } else if (t === 'buzz') {
      const p = () => { ctx.beginPath(); ctx.moveTo(-w * 0.5, -h * 0.02); ctx.bezierCurveTo(-w * 0.55, -h * 0.64, w * 0.55, -h * 0.64, w * 0.5, -h * 0.02);
        ctx.quadraticCurveTo(w * 0.4, -h * 0.3, 0, -h * 0.33); ctx.quadraticCurveTo(-w * 0.4, -h * 0.3, -w * 0.5, -h * 0.02); ctx.closePath(); };
      shade(ctx, p, C.hair.color, [-w * 0.55, -h * 0.5, w * 1.1, h * 0.5], ls, { rim: 0.8, edge: 0.1 });
    }
  }

  function hat(ctx, C, w, h, ls) {
    const T = C.hat; if (!T) return;
    if (T.type === 'cap') { // flat cap
      const p = () => { ctx.beginPath(); ctx.moveTo(-w * 0.54, -h * 0.18); ctx.bezierCurveTo(-w * 0.6, -h * 0.66, w * 0.62, -h * 0.68, w * 0.6, -h * 0.2);
        ctx.quadraticCurveTo(w * 0.72, -h * 0.12, w * 0.5, -h * 0.1); ctx.quadraticCurveTo(0, -h * 0.2, -w * 0.54, -h * 0.18); ctx.closePath(); };
      shade(ctx, p, T.color, [-w * 0.6, -h * 0.62, w * 1.3, h * 0.55], ls, { rim: 1 });
    } else if (T.type === 'crown') {
      const p = () => { ctx.beginPath(); ctx.moveTo(-w * 0.38, -h * 0.38); for (let i = 0; i <= 6; i++) { const x = lerp(-0.38, 0.38, i / 6) * w; ctx.lineTo(x, -h * (i % 2 ? 0.58 : 0.72)); } ctx.lineTo(w * 0.38, -h * 0.38); ctx.quadraticCurveTo(0, -h * 0.33, -w * 0.38, -h * 0.38); ctx.closePath(); };
      shade(ctx, p, T.color || '#e8b84a', [-w * 0.4, -h * 0.74, w * 0.8, h * 0.4], ls, { rim: 1 });
      ctx.fillStyle = T.gem || '#c8414a'; ellipse(ctx, 0, -h * 0.47, w * 0.05, w * 0.05); ctx.fill();
    } else if (T.type === 'wreath') {
      for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * 0.1); ctx.save(); ctx.translate(Math.cos(a) * w * 0.5, Math.sin(a) * h * 0.45 - h * 0.08); ctx.rotate(a + 1.2);
        const p = () => ellipse(ctx, 0, 0, w * 0.08, w * 0.035); shade(ctx, p, T.color || '#7a9a52', [-w * 0.08, -w * 0.04, w * 0.16, w * 0.08], ls, { rim: 0.6, edge: 0.1 }); ctx.restore(); }
    } else if (T.type === 'helmet') {
      const p = () => { ctx.beginPath(); ctx.moveTo(-w * 0.56, -h * 0.02); ctx.bezierCurveTo(-w * 0.62, -h * 0.78, w * 0.62, -h * 0.78, w * 0.56, -h * 0.02); ctx.quadraticCurveTo(0, -h * 0.14, -w * 0.56, -h * 0.02); ctx.closePath(); };
      shade(ctx, p, T.color || '#9a8f80', [-w * 0.6, -h * 0.62, w * 1.2, h * 0.62], ls, { rim: 1 });
      if (T.crest) { const q = () => { ctx.beginPath(); ctx.moveTo(-w * 0.05, -h * 0.58); ctx.quadraticCurveTo(w * 0.1, -h * 1.0, w * 0.6, -h * 0.75); ctx.quadraticCurveTo(w * 0.2, -h * 0.72, w * 0.08, -h * 0.55); ctx.closePath(); }; shade(ctx, q, T.crest, [-w * 0.05, -h, w * 0.65, h * 0.5], ls, { rim: 1 }); }
    } else if (T.type === 'hood' || T.type === 'veil') {
      const p = () => { ctx.beginPath(); ctx.moveTo(-w * 0.6, h * 0.6); ctx.quadraticCurveTo(-w * 0.72, -h * 0.75, 0, -h * 0.72); ctx.quadraticCurveTo(w * 0.72, -h * 0.75, w * 0.6, h * 0.6);
        ctx.lineTo(w * 0.46, h * 0.5); ctx.quadraticCurveTo(w * 0.52, -h * 0.46, 0, -h * 0.5); ctx.quadraticCurveTo(-w * 0.52, -h * 0.46, -w * 0.46, h * 0.5); ctx.closePath(); };
      shade(ctx, p, T.color, [-w * 0.72, -h * 0.75, w * 1.44, h * 1.35], ls, { rim: 1 });
    }
  }

  // ---------- face ----------
  function drawEye(ctx, C, F, P, rx, ry, ls, outer) {
    const lid = Math.max(F.lid || 0, P.blink), low = F.lidLow || 0;
    ellipse(ctx, 0, 0, rx, ry); ctx.fillStyle = '#fbf6f0'; ctx.fill();
    ctx.save(); ellipse(ctx, 0, 0, rx, ry); ctx.clip();
    let g = ctx.createLinearGradient(0, -ry, 0, ry * 0.2); g.addColorStop(0, 'rgba(90,60,70,0.45)'); g.addColorStop(1, 'rgba(90,60,70,0)');
    ctx.fillStyle = g; ctx.fillRect(-rx, -ry, rx * 2, ry * 2);
    const ir = Math.min(rx, ry) * 0.68;
    const ix = P.look[0] * rx * 0.38, iy = P.look[1] * ry * 0.35 + ry * 0.06;
    g = ctx.createRadialGradient(ix, iy + ir * 0.3, ir * 0.1, ix, iy, ir);
    g.addColorStop(0, tint(C.iris, 0.45)); g.addColorStop(0.65, C.iris); g.addColorStop(1, tint(C.iris, -0.6));
    ellipse(ctx, ix, iy, ir, ir * 1.04); ctx.fillStyle = g; ctx.fill();
    const pk = F.pupil || 1;
    ellipse(ctx, ix, iy, ir * 0.48 * pk, ir * 0.5 * pk); ctx.fillStyle = '#1b1216'; ctx.fill();
    ellipse(ctx, ix + ls * ir * 0.38, iy - ir * 0.4, ir * 0.28, ir * 0.24); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
    ellipse(ctx, ix - ls * ir * 0.35, iy + ir * 0.38, ir * 0.11, ir * 0.1); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
    if (lid > 0.01) { ctx.fillStyle = C.skin; ctx.fillRect(-rx - 2, -ry - 2, rx * 2 + 4, ry * 2 * lid + 2); }
    if (low > 0.01) { ctx.fillStyle = C.skin; ellipse(ctx, 0, ry * (1.9 - low * 1.6), rx * 1.2, ry); ctx.fill(); }
    ctx.restore();
    // lash line follows the lid
    ctx.lineCap = 'round'; ctx.strokeStyle = '#2a1a1e'; ctx.lineWidth = Math.max(1.5, ry * 0.17);
    ctx.beginPath();
    if (lid < 0.9) ctx.ellipse(0, ry * lid, rx * 1.02, ry * (1 - lid * 0.92), 0, Math.PI * 1.04, Math.PI * 1.96);
    else { ctx.moveTo(-rx, ry * (2 * lid - 1)); ctx.quadraticCurveTo(0, ry * (2 * lid - 0.75), rx, ry * (2 * lid - 1)); }
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(outer * rx * 0.88, -ry * 0.45 + ry * lid); ctx.lineTo(outer * rx * 1.2, -ry * 0.72 + ry * lid); ctx.lineWidth = Math.max(1.2, ry * 0.12); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.92, ry * 0.98, 0, Math.PI * 0.25, Math.PI * 0.75); ctx.lineWidth = Math.max(0.8, ry * 0.05); ctx.strokeStyle = 'rgba(120,60,60,0.35)'; ctx.stroke();
  }

  function drawFace(ctx, C, F, P, w, h, ls, side) {
    const fx = side ? w * 0.17 : 0;
    const eyeY = h * 0.06, rx = w * 0.135 * F.eye, ry = h * 0.125 * F.eye;
    // [x, scaleX, outer direction]
    // three-quarter view: the eye on the facing side is foreshortened (narrow) and sits near the face edge;
    // the eye nearer the viewer is full size and sits closer to the middle of the head.
    const eyes = side ? [[fx + w * 0.2, 0.6, 1], [fx - w * 0.12, 1, -1]] : [[-w * 0.2, 1, -1], [w * 0.2, 1, 1]];
    for (const [ex, sc] of eyes) { // blush
      const cx = ex * 1.15, cy = eyeY + h * 0.17, r = w * 0.13 * sc;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgb(hex2rgb(C.blush), 0.6)); g.addColorStop(1, rgb(hex2rgb(C.blush), 0));
      ctx.fillStyle = g; ellipse(ctx, cx, cy, r, r * 0.7); ctx.fill();
      if (C.freckles) { ctx.fillStyle = tint(C.skin, -0.45, 0.6); for (let k = 0; k < 4; k++) { ellipse(ctx, cx - r * 0.4 + k * r * 0.27, cy - r * 0.15 + (k % 2) * r * 0.2, w * 0.008, w * 0.008); ctx.fill(); } }
    }
    for (const [ex, sc, out] of eyes) { ctx.save(); ctx.translate(ex, eyeY); ctx.scale(sc, 1); drawEye(ctx, C, F, P, rx, ry, ls, out); ctx.restore(); }
    if (C.glasses) {
      ctx.lineWidth = Math.max(2, w * 0.018); ctx.strokeStyle = C.glasses;
      for (const [ex, sc] of eyes) { ellipse(ctx, ex, eyeY, rx * 1.3 * sc, ry * 1.2); ctx.stroke(); }
      if (!side) { ctx.beginPath(); ctx.moveTo(-w * 0.2 + rx * 1.3, eyeY); ctx.quadraticCurveTo(0, eyeY - ry * 0.4, w * 0.2 - rx * 1.3, eyeY); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1, w * 0.008);
      for (const [ex, sc] of eyes) { ctx.beginPath(); ctx.arc(ex + ls * rx * 0.5 * sc, eyeY - ry * 0.3, rx * 0.6 * sc, -1.2, -0.4); ctx.stroke(); }
    }
    // brows: thin arched strokes; inner end moves with the emotion
    ctx.lineCap = 'round'; ctx.strokeStyle = C.brow; ctx.lineWidth = Math.max(2, h * 0.026);
    for (const [ex, sc, out] of eyes) {
      let dy = 0, inner = 0, outerDy = 0;
      if (F.brow === 'up') dy = -ry * 0.18;
      if (F.brow === 'high') dy = -ry * 0.5;
      if (F.brow === 'angry') { inner = ry * 0.45; outerDy = -ry * 0.1; }
      if (F.brow === 'worried') { inner = -ry * 0.4; outerDy = ry * 0.12; }
      if (F.brow === 'smug') { const up = out > 0; dy = up ? -ry * 0.38 : 0; }
      const by = eyeY - ry * 1.45 + dy, bw = rx * 0.95 * sc;
      ctx.beginPath(); ctx.moveTo(ex - out * bw, by + inner); ctx.quadraticCurveTo(ex, by - ry * 0.2 + (inner + outerDy) * 0.3, ex + out * bw, by + ry * 0.12 + outerDy); ctx.stroke();
    }
    // nose: soft shadow + highlight, no outline
    const nx = fx + (side ? w * 0.1 : 0), ny = eyeY + h * 0.17;
    ctx.fillStyle = tint(C.skin, -0.35, 0.55); ellipse(ctx, nx - ls * w * 0.012, ny + h * 0.012, w * 0.05, h * 0.02); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,225,0.65)'; ellipse(ctx, nx + ls * w * 0.012, ny - h * 0.012, w * 0.018, h * 0.012); ctx.fill();
    if (side) { ctx.strokeStyle = tint(C.skin, -0.3, 0.6); ctx.lineWidth = Math.max(1, w * 0.01); ctx.beginPath(); ctx.moveTo(nx + w * 0.03, ny - h * 0.08); ctx.quadraticCurveTo(nx + w * 0.07, ny, nx + w * 0.02, ny + h * 0.02); ctx.stroke(); }
    const my = eyeY + h * (C.moustache ? 0.31 : 0.28), mx = fx + (side ? w * 0.07 : 0);
    if (C.moustache) {
      const p = () => { ctx.beginPath(); ctx.moveTo(mx - w * 0.2, my + h * 0.01); ctx.quadraticCurveTo(mx - w * 0.12, my - h * 0.08, mx, my - h * 0.045); ctx.quadraticCurveTo(mx + w * 0.12, my - h * 0.08, mx + w * 0.2, my + h * 0.01); ctx.quadraticCurveTo(mx + w * 0.1, my - h * 0.015, mx, my - h * 0.005); ctx.quadraticCurveTo(mx - w * 0.1, my - h * 0.015, mx - w * 0.2, my + h * 0.01); ctx.closePath(); };
      shade(ctx, p, C.moustache, [mx - w * 0.2, my - h * 0.08, w * 0.4, h * 0.1], ls, { rim: 0.7, edge: 0.1 });
    }
    // mouth
    const mw = w * 0.15; let m = F.mouth; const open = m === 'talk' ? P.talk : 0;
    if (m === 'talk' && open < 0.12) m = 'smile';
    const lip = tint(C.blush, -0.35), dark = '#5e2028';
    ctx.lineCap = 'round'; ctx.strokeStyle = lip; ctx.lineWidth = Math.max(2, h * 0.02);
    const openShape = (top, bot, wid) => {
      ctx.beginPath(); ctx.moveTo(mx - wid, my + top); ctx.quadraticCurveTo(mx, my + top - h * 0.015, mx + wid, my + top);
      ctx.quadraticCurveTo(mx + wid * 0.6, my + bot, mx, my + bot); ctx.quadraticCurveTo(mx - wid * 0.6, my + bot, mx - wid, my + top); ctx.closePath();
      ctx.fillStyle = dark; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#fbf3ea'; ctx.fillRect(mx - wid, my + top - h * 0.02, wid * 2, (bot - top) * 0.28 + h * 0.012);
      ctx.fillStyle = '#d0626a'; ellipse(ctx, mx, my + bot, wid * 0.6, (bot - top) * 0.4); ctx.fill();
      ctx.restore();
    };
    ctx.beginPath();
    if (m === 'line') { ctx.moveTo(mx - mw * 0.55, my); ctx.quadraticCurveTo(mx, my + h * 0.008, mx + mw * 0.55, my); ctx.stroke(); }
    else if (m === 'smile') { ctx.moveTo(mx - mw, my - h * 0.02); ctx.quadraticCurveTo(mx, my + h * 0.055, mx + mw, my - h * 0.02); ctx.stroke(); }
    else if (m === 'frown') { ctx.moveTo(mx - mw * 0.7, my + h * 0.025); ctx.quadraticCurveTo(mx, my - h * 0.03, mx + mw * 0.7, my + h * 0.025); ctx.stroke(); }
    else if (m === 'smirk') { ctx.moveTo(mx - mw * 0.55, my + h * 0.01); ctx.quadraticCurveTo(mx + mw * 0.35, my + h * 0.025, mx + mw * 0.95, my - h * 0.035); ctx.stroke(); }
    else if (m === 'wobble') { ctx.moveTo(mx - mw * 0.8, my); for (let i = 1; i <= 4; i++) ctx.quadraticCurveTo(mx - mw * 0.8 + (i - 0.5) * mw * 0.4, my + (i % 2 ? -1 : 1) * h * 0.018, mx - mw * 0.8 + i * mw * 0.4, my); ctx.stroke(); }
    else if (m === 'grin') openShape(-h * 0.02, h * 0.07, mw * 1.35);
    else if (m === 'O') { ellipse(ctx, mx, my + h * 0.02, mw * 0.42, h * 0.055); ctx.fillStyle = dark; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#d0626a'; ellipse(ctx, mx, my + h * 0.07, mw * 0.4, h * 0.03); ctx.fill(); ctx.restore(); }
    else if (m === 'open') openShape(-h * 0.01, h * 0.06, mw * 0.8);
    else if (m === 'talk') openShape(-h * 0.015, h * (0.015 + 0.065 * open), mw * (0.75 + 0.25 * open));
    if (F.tears) for (const [ex] of eyes) { const g = ctx.createLinearGradient(0, eyeY + ry, 0, eyeY + ry * 2.4); g.addColorStop(0, 'rgba(200,230,255,0.85)'); g.addColorStop(1, 'rgba(200,230,255,0)'); ctx.fillStyle = g; ellipse(ctx, ex + rx * 0.4, eyeY + ry * 1.6, rx * 0.12, ry * 0.7); ctx.fill(); }
  }

  function drawHead(ctx, C, F, P, w, h, ls, side) {
    for (const s of side ? [-1] : [-1, 1]) {
      const ex = side ? -w * 0.22 : s * w * 0.47, ey = h * 0.08;
      const p = () => ellipse(ctx, ex, ey, w * 0.07, h * 0.1, s * 0.15);
      shade(ctx, p, C.skin, [ex - w * 0.07, ey - h * 0.1, w * 0.14, h * 0.2], ls, { rim: 1, edge: 0.15 });
      ctx.fillStyle = tint(C.blush, -0.1, 0.35); ellipse(ctx, ex, ey, w * 0.035, h * 0.055); ctx.fill();
    }
    const p = () => headPath(ctx, w, h, 1.0, C.jaw, 2.3);
    shade(ctx, p, C.skin, [-w / 2, -h / 2, w, h], ls, { rim: 1, edge: 0.18 });
    ctx.save(); p(); ctx.clip(); // subsurface warmth at the edges
    const g = ctx.createRadialGradient(0, h * 0.05, w * 0.25, 0, h * 0.05, w * 0.62);
    g.addColorStop(0, 'rgba(255,150,120,0)'); g.addColorStop(1, 'rgba(255,120,95,0.22)'); ctx.fillStyle = g; ctx.fillRect(-w, -h, w * 2, h * 2);
    ctx.restore();
    drawFace(ctx, C, F, P, w, h, ls, side);
    frontHair(ctx, C, w, h, ls, side);
    hat(ctx, C, w, h, ls);
  }

  // ---------- body ----------
  function drawCharacter(ctx, id, x, y, heightPx, poseIn) {
    const C = CAST[id] || (G.CUSTOM && G.CUSTOM.cast && G.CUSTOM.cast[id]);
    if (!C) throw new Error('unknown character ' + id);
    const P = Object.assign({}, DEF_POSE, poseIn || {});
    const F = Object.assign({}, FACES[P.face] || FACES.neutral);
    const H = heightPx * (C.rel || 1);
    const side = P.view === 'side';
    const ls = (LIGHT().dir || -1) * (P.facing < 0 ? -1 : 1);
    const headH = C.head * H, headW = headH * C.headW;
    const legLen = C.leg * H, torsoH = H - headH * 0.88 - legLen, limbW = C.limb * H * 1.18;
    const T = C.top || { type: 'tee', color: '#888888' }, B = C.bottom || { type: 'pants', color: '#555555' };
    const build = C.build || 'slim';
    const hands = {}; let headBox = null;

    ctx.save();
    ctx.translate(x, y - P.hop);
    ctx.scale(P.facing < 0 ? -1 : 1, 1);
    ctx.scale(1 / Math.sqrt(P.squash), P.squash);

    const hipY = -legLen, shY = -torsoH;
    const sw = C.shoulder * H * (side ? 0.66 : 1), hw = C.hip * H * (side ? 0.72 : 1);
    const neckX = side ? sw * 0.08 : 0;
    const headT = () => { ctx.translate(0, hipY); ctx.rotate(P.lean); ctx.translate(neckX, shY - headH * 0.04); ctx.rotate(P.headTilt); ctx.translate(0, -headH * 0.46); };

    ctx.save(); headT(); backHair(ctx, C, headW, headH, ls, side); ctx.restore();

    const armPts = (sgn, arm) => {
      const sx = side ? sgn * sw * 0.12 : sgn * sw * 0.47;
      const L1 = H * 0.17, L2 = H * 0.16, a1 = arm[0], a2 = arm[0] + arm[1], dx = side ? 1 : sgn;
      const s0 = [sx * 0.94, shY + limbW * 1.15];
      const ex = s0[0] + dx * Math.sin(a1) * L1, ey = s0[1] + Math.cos(a1) * L1;
      return [s0, [ex, ey], [ex + dx * Math.sin(a2) * L2, ey + Math.cos(a2) * L2]];
    };
    const sleeve = T.sleeve || T.color;
    const drawArm = (sgn, arm) => {
      const p = armPts(sgn, arm);
      const m = ctx.getTransform(), hp = m.transformPoint(new DOMPoint(p[2][0], p[2][1]));
      hands[sgn < 0 ? 'L' : 'R'] = [hp.x, hp.y];
      const short = T.type === 'tee' || T.type === 'tunic';
      if (short) { tube(ctx, p, C.skin, limbW * 0.9, ls); const mid = [lerp(p[0][0], p[1][0], 0.55), lerp(p[0][1], p[1][1], 0.55)]; tube(ctx, [p[0], mid], sleeve, limbW * 1.3, ls); }
      else tube(ctx, p, sleeve, limbW * 1.15, ls);
      { const r = limbW * (short ? 0.66 : 0.6), q = () => ellipse(ctx, p[0][0] * 0.96, p[0][1] + r * 0.55, r, r * 1.1);
        shade(ctx, q, sleeve, [p[0][0] - r, p[0][1] - r, r * 2, r * 2.1], ls, { rim: 1, edge: 0.12 }); }
      const [hx, hy] = p[2], [ex, ey] = p[1], a = Math.atan2(hy - ey, hx - ex);
      if (!short) { ctx.save(); ctx.translate(hx - Math.cos(a) * limbW * 0.5, hy - Math.sin(a) * limbW * 0.5); ctx.rotate(a);
        const q = () => { ctx.beginPath(); ctx.roundRect(-limbW * 0.3, -limbW * 0.68, limbW * 0.6, limbW * 1.36, limbW * 0.3); };
        shade(ctx, q, tint(sleeve, -0.15), [-limbW * 0.3, -limbW * 0.68, limbW * 0.6, limbW * 1.36], ls, { rim: 0.6, edge: 0.15 }); ctx.restore(); }
      ctx.save(); ctx.translate(hx + Math.cos(a) * limbW * 0.35, hy + Math.sin(a) * limbW * 0.35); ctx.rotate(a - Math.PI / 2);
      const hand = () => ellipse(ctx, 0, limbW * 0.25, limbW * 0.56, limbW * 0.7);
      shade(ctx, hand, C.skin, [-limbW * 0.6, -limbW * 0.45, limbW * 1.2, limbW * 1.4], ls, { rim: 1, edge: 0.2 });
      const th = () => ellipse(ctx, -sgn * limbW * 0.42, limbW * 0.05, limbW * 0.2, limbW * 0.36, 0.5 * sgn);
      shade(ctx, th, C.skin, [-limbW * 0.7, -limbW * 0.35, limbW * 1.4, limbW * 0.8], ls, { rim: 0.5, edge: 0.2 });
      ctx.restore();
    };

    // legs + shoes
    const hipX = hw * 0.26;
    const lw = limbW * (build === 'broad' ? 1.35 : build === 'round' ? 1.1 : 1.15);
    for (const sgn of [-1, 1]) {
      let ang, knee;
      if (P.walk !== null && P.walk !== undefined) { const ph = P.walk + (sgn > 0 ? 0 : Math.PI); ang = 0.42 * Math.sin(ph); knee = Math.max(0, -Math.cos(ph)) * 0.6; }
      else { ang = sgn * P.legSpread * (side ? 0.3 : 1); knee = 0; }
      const hx = side ? sgn * hipX * 0.3 : sgn * hipX, L1 = legLen * 0.52, L2 = legLen * 0.48;
      const kx = hx + Math.sin(ang) * L1, ky = hipY + Math.cos(ang) * L1, a2 = ang - knee;
      const shoeK = Math.max(1, H * 0.042 / lw);
      const fx = kx + Math.sin(a2) * L2, fy = Math.min(-lw * 0.45 * shoeK, ky + Math.cos(a2) * L2);
      if (B.type === 'shorts') { tube(ctx, [[hx, hipY], [kx, ky], [fx, fy]], C.skin, lw * 0.82, ls); tube(ctx, [[hx, hipY], [lerp(hx, kx, 0.6), lerp(hipY, ky, 0.6)]], B.color, lw * 1.3, ls); }
      else if (B.type === 'skirt' || B.type === 'robe' || T.type === 'robe') tube(ctx, [[hx, hipY], [kx, ky], [fx, fy]], B.legs || C.skin, lw * 0.85, ls);
      else tube(ctx, [[hx, hipY], [kx, ky], [fx, fy]], B.color, lw, ls);
      const fd = side ? 1 : sgn * 0.35;
      ctx.save(); ctx.translate(fx, fy); ctx.scale(shoeK, shoeK);
      const sh = () => { ctx.beginPath(); ctx.moveTo(-lw * 0.72, lw * 0.45); ctx.quadraticCurveTo(-lw * 0.75, -lw * 0.7, fd * lw * 0.3, -lw * 0.55); ctx.quadraticCurveTo(fd * lw * 1.5 + lw * 0.1, -lw * 0.25, fd * lw * 1.4 + lw * 0.2, lw * 0.45); ctx.closePath(); };
      shade(ctx, sh, C.shoe, [-lw * 0.8, -lw * 0.7, lw * 2.4, lw * 1.15], ls, { rim: 1, edge: 0.25 });
      ctx.fillStyle = C.sole || tint(C.shoe, -0.3); ctx.fillRect(-lw * 0.72, lw * 0.3, fd * lw * 1.4 + lw * 0.92, lw * 0.18);
      ctx.restore();
    }

    // lean frame
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(P.lean);
    if (side) drawArm(-1, P.armL);
    if (B.type === 'skirt' || T.type === 'robe' || B.type === 'robe') {
      const robe = T.type === 'robe' || B.type === 'robe';
      const len = robe ? legLen * 0.9 : legLen * (B.len || 0.55), col = T.type === 'robe' ? T.color : B.color;
      const p = () => { ctx.beginPath(); ctx.moveTo(-hw * 0.5, -torsoH * 0.12); ctx.lineTo(hw * 0.5, -torsoH * 0.12); ctx.quadraticCurveTo(hw * 0.75, len * 0.6, hw * 0.8, len); scallop(ctx, hw * 0.8, -hw * 0.8, len, 5, len * 0.025, 1); ctx.quadraticCurveTo(-hw * 0.75, len * 0.6, -hw * 0.5, -torsoH * 0.12); ctx.closePath(); };
      shade(ctx, p, col, [-hw * 0.8, -torsoH * 0.12, hw * 1.6, len], ls, { rim: 1 });
      ctx.save(); p(); ctx.clip(); ctx.strokeStyle = tint(col, -0.4, 0.35); ctx.lineWidth = Math.max(1.5, hw * 0.02);
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * hw * 0.16, len * 0.1); ctx.quadraticCurveTo(i * hw * 0.22, len * 0.6, i * hw * 0.3, len * 0.98); ctx.stroke(); }
      ctx.restore();
    }
    const belly = build === 'round' ? 1.25 : build === 'broad' ? 1.08 : 0.92;
    const flare = T.type === 'hoodie' ? 1.12 : 1;
    const tp = () => {
      ctx.beginPath(); const r = sw * 0.34, wy = -torsoH * 0.38, ww = Math.max(hw * 0.5, sw * 0.4) * belly;
      ctx.moveTo(0, shY - torsoH * 0.04);
      ctx.quadraticCurveTo(sw * 0.3, shY - torsoH * 0.03, sw / 2 - r * 0.25, shY + r * 0.12);
      ctx.quadraticCurveTo(sw / 2 + r * 0.05, shY + r * 0.3, sw / 2, shY + r);
      ctx.bezierCurveTo(sw / 2, shY + torsoH * 0.45, ww, wy - torsoH * 0.05, ww, wy);
      ctx.quadraticCurveTo(ww * 1.02, -torsoH * 0.15, hw * 0.5 * flare, 0);
      ctx.quadraticCurveTo(0, torsoH * 0.05, -hw * 0.5 * flare, 0);
      ctx.quadraticCurveTo(-ww * 1.02, -torsoH * 0.15, -ww, wy);
      ctx.bezierCurveTo(-ww, wy - torsoH * 0.05, -sw / 2, shY + torsoH * 0.45, -sw / 2, shY + r);
      ctx.quadraticCurveTo(-sw / 2 - r * 0.05, shY + r * 0.3, -sw / 2 + r * 0.25, shY + r * 0.12);
      ctx.quadraticCurveTo(-sw * 0.3, shY - torsoH * 0.03, 0, shY - torsoH * 0.04); ctx.closePath();
    };
    const tcol = T.color;
    shade(ctx, tp, tcol, [-sw / 2, shY, sw, torsoH], ls, { rim: 1 });
    const cx = side ? sw * 0.14 : 0;
    ctx.save(); tp(); ctx.clip();
    const fold = (x0, y0, x1, y1, a) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2 + sw * 0.05, (y0 + y1) / 2, x1, y1); ctx.strokeStyle = tint(tcol, -0.5, a || 0.3); ctx.lineWidth = Math.max(1.5, sw * 0.018); ctx.stroke(); };
    if (T.type === 'jacket') {
      const p = () => { ctx.beginPath(); ctx.moveTo(cx - sw * 0.12, shY); ctx.lineTo(cx + sw * 0.12, shY); ctx.lineTo(cx + sw * 0.06, 0); ctx.lineTo(cx - sw * 0.06, 0); ctx.closePath(); };
      shade(ctx, p, T.inner, [cx - sw * 0.12, shY, sw * 0.24, torsoH], ls, { rim: 0, edge: 0.2 });
      fold(-sw * 0.3, -torsoH * 0.35, -sw * 0.15, -torsoH * 0.1); fold(sw * 0.3, -torsoH * 0.4, sw * 0.2, -torsoH * 0.12);
      ctx.fillStyle = tint(tcol, -0.3); ctx.fillRect(-hw * 0.7, -torsoH * 0.09, hw * 1.4, torsoH * 0.09);
    } else if (T.type === 'hoodie') {
      ctx.fillStyle = tint(tcol, -0.25, 0.6); ctx.fillRect(-hw * 0.7, -torsoH * 0.1, hw * 1.4, torsoH * 0.12);
      ctx.strokeStyle = tint(tcol, -0.45, 0.5); ctx.lineWidth = Math.max(1.5, sw * 0.016);
      ctx.beginPath(); ctx.moveTo(cx - sw * 0.24, -torsoH * 0.12); ctx.lineTo(cx - sw * 0.17, -torsoH * 0.38); ctx.lineTo(cx + sw * 0.17, -torsoH * 0.38); ctx.lineTo(cx + sw * 0.24, -torsoH * 0.12); ctx.stroke();
      ctx.strokeStyle = T.inner || '#ffffff';
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * sw * 0.07, shY + torsoH * 0.04); ctx.lineTo(cx + s * sw * 0.08, shY + torsoH * 0.32); ctx.stroke(); }
    } else if (T.type === 'shirt') {
      ctx.strokeStyle = tint(tcol, -0.5, 0.45); ctx.lineWidth = Math.max(1.5, sw * 0.014);
      ctx.beginPath(); ctx.moveTo(cx, shY + torsoH * 0.1); ctx.lineTo(cx, 0); ctx.stroke();
      ctx.fillStyle = tint(tcol, 0.4); for (let i = 0; i < 4; i++) { ellipse(ctx, cx + sw * 0.03, shY + torsoH * (0.2 + i * 0.2), sw * 0.015, sw * 0.015); ctx.fill(); }
      ctx.strokeStyle = tint(tcol, -0.5, 0.35); ctx.beginPath(); ctx.ellipse(cx + sw * 0.22, shY + torsoH * 0.3, sw * 0.09, torsoH * 0.07, 0, 0, Math.PI); ctx.stroke();
      fold(-sw * 0.35, -torsoH * 0.5, -sw * 0.2, -torsoH * 0.2);
    } else if (T.type === 'tee') {
      ctx.fillStyle = T.inner || '#ffffff'; ctx.globalAlpha = 0.9; ellipse(ctx, cx + sw * 0.1, shY + torsoH * 0.45, sw * 0.1, sw * 0.1); ctx.fill(); ctx.globalAlpha = 1;
      fold(-sw * 0.3, -torsoH * 0.4, -sw * 0.12, -torsoH * 0.12);
    } else if (T.type === 'shawl') {
      ctx.fillStyle = T.inner; ctx.fillRect(-sw, shY, sw * 2, torsoH * 1.2);
      const q = () => { ctx.beginPath(); ctx.moveTo(-sw * 0.6, shY - torsoH * 0.05); ctx.quadraticCurveTo(0, shY + torsoH * 0.15, sw * 0.6, shY - torsoH * 0.05); ctx.lineTo(sw * 0.55, shY + torsoH * 0.5); ctx.quadraticCurveTo(0, shY + torsoH * 0.85, -sw * 0.55, shY + torsoH * 0.5); ctx.closePath(); };
      shade(ctx, q, tcol, [-sw * 0.6, shY, sw * 1.2, torsoH * 0.85], ls, { rim: 1 });
      ctx.fillStyle = tint(tcol, 0.35, 0.7); for (let i = -3; i <= 3; i++) { ellipse(ctx, i * sw * 0.13, shY + torsoH * 0.66 - Math.abs(i) * torsoH * 0.04, sw * 0.02, sw * 0.035); ctx.fill(); }
    } else if (T.type === 'robe' || T.type === 'tunic') {
      ctx.fillStyle = T.inner || tint(tcol, 0.3); ctx.beginPath(); ctx.moveTo(cx - sw * 0.15, shY); ctx.lineTo(cx, shY + torsoH * 0.32); ctx.lineTo(cx + sw * 0.15, shY); ctx.closePath(); ctx.fill();
      const belt = () => { ctx.beginPath(); ctx.rect(-hw, -torsoH * 0.28, hw * 2, torsoH * 0.11); };
      shade(ctx, belt, T.trim || tint(tcol, -0.35), [-hw * 0.6, -torsoH * 0.28, hw * 1.2, torsoH * 0.11], ls, { rim: 0.6, edge: 0.2 });
      fold(-sw * 0.25, shY + torsoH * 0.3, -sw * 0.18, -torsoH * 0.3); fold(sw * 0.25, shY + torsoH * 0.3, sw * 0.15, -torsoH * 0.3);
    }
    ctx.restore();
    if (T.type === 'tunic') {
      const len = legLen * 0.3, p = () => { ctx.beginPath(); ctx.moveTo(-hw * 0.55, -torsoH * 0.02); ctx.lineTo(hw * 0.55, -torsoH * 0.02); ctx.lineTo(hw * 0.65, len); scallop(ctx, hw * 0.65, -hw * 0.65, len, 4, len * 0.05, 2); ctx.closePath(); };
      shade(ctx, p, tcol, [-hw * 0.65, 0, hw * 1.3, len], ls, { rim: 1 });
    }
    if (T.type === 'hoodie') { const q = () => ellipse(ctx, cx * 0.5, shY + torsoH * 0.02, sw * 0.32, torsoH * 0.09); shade(ctx, q, tint(tcol, -0.1), [-sw * 0.32, shY - torsoH * 0.07, sw * 0.64, torsoH * 0.18], ls, { rim: 1 }); }
    { const nw = headW * 0.26, nh = headH * 0.2, q = () => { ctx.beginPath(); ctx.roundRect(neckX - nw / 2, shY - nh, nw, nh + torsoH * 0.05, nw * 0.3); };
      shade(ctx, q, C.skin, [neckX - nw / 2, shY - nh, nw, nh], ls, { rim: 0.7, edge: 0.12 });
      ctx.fillStyle = tint(C.skin, -0.5, 0.35); ctx.fillRect(neckX - nw / 2, shY - nh, nw, nh * 0.45); }
    if (T.type === 'shirt' || T.type === 'jacket') {
      for (const s of [-1, 1]) { const q = () => { ctx.beginPath(); ctx.moveTo(neckX + s * headW * 0.02, shY + torsoH * 0.12); ctx.lineTo(neckX + s * headW * 0.22, shY - torsoH * 0.03); ctx.lineTo(neckX + s * headW * 0.08, shY - torsoH * 0.06); ctx.closePath(); };
        shade(ctx, q, T.type === 'shirt' ? tint(tcol, 0.12) : tint(tcol, 0.1), [neckX - headW * 0.22, shY - torsoH * 0.06, headW * 0.44, torsoH * 0.18], ls, { rim: 0.6, edge: 0.25 }); }
    }
    ctx.save(); ctx.translate(neckX, shY - headH * 0.04); ctx.rotate(P.headTilt); ctx.translate(0, -headH * 0.46);
    { const m = ctx.getTransform(); const a = m.transformPoint(new DOMPoint(0, -headH * 0.6)), b = m.transformPoint(new DOMPoint(0, headH * 0.5)); headBox = [a.y, b.y, m.transformPoint(new DOMPoint(0, 0)).x]; }
    drawHead(ctx, C, F, P, headW, headH, ls, side);
    ctx.restore();
    if (side) drawArm(1, P.armR); else { drawArm(-1, P.armL); drawArm(1, P.armR); }
    ctx.restore();
    ctx.restore();
    return { hands, headBox };
  }

  G.PT = G.PT || {};
  Object.assign(G.PT, { INK, CAST, FACES, drawCharacter, ellipse, fillStroke, limb, tube, shade, tint, hex2rgb, rgb, scallop, DEF_LIGHT });
})(typeof window !== 'undefined' ? window : globalThis);
