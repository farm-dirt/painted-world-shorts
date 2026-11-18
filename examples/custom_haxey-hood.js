// Haxey Hood — original cast, props and sets (Isle of Axholme, Lincolnshire, England)
(function () {
  const PT = window.PT, P = PT.PAINT, tint = PT.tint;
  const CX = -540, CY = -480, CW = 2160, CH = 2880;
  const R = (s) => PT.noise.rng(s);
  PT.FACES.shy = { brow: 'worried', mouth: 'smile', eye: 1.0, lid: 0.25, lidLow: 0.2 };
  PT.FACES.cough = { brow: 'angry', mouth: 'O', eye: 0.9, lid: 0.65 };
  PT.FACES.strain = { brow: 'angry', mouth: 'grin', eye: 0.85, lid: 0.45 };
  const LS = () => ((PT.LIGHT || PT.DEF_LIGHT).dir || -1);

  // ---------- helpers ----------
  function bareTree(c, x, y, s, col, seed) { // winter tree: trunk + forking branches
    const r = R(seed); c.strokeStyle = col; c.lineCap = 'round';
    function br(x0, y0, len, a, w, d) {
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + (r() - 0.5) * len * 0.3, (y0 + y1) / 2, x1, y1); c.stroke();
      if (d > 0) { br(x1, y1, len * 0.72, a - 0.35 - r() * 0.3, w * 0.62, d - 1); br(x1, y1, len * 0.72, a + 0.35 + r() * 0.3, w * 0.62, d - 1); if (r() > 0.5) br(x1, y1, len * 0.6, a + (r() - 0.5) * 0.4, w * 0.5, d - 1); }
    }
    br(x, y, s * 0.36, -Math.PI / 2 + (r() - 0.5) * 0.15, s * 0.05, 5);
  }
  function church(c, x, y, s, stone, roof, L) { // English stone church: square crenellated tower + nave
    P.wash(c, () => { c.beginPath(); c.rect(x - s * 0.05, y - s * 0.42, s * 0.85, s * 0.42); }, tint(stone, 0.12), tint(stone, -0.2), { span: [y - s * 0.42, y] });
    P.wash(c, () => { c.beginPath(); c.moveTo(x - s * 0.08, y - s * 0.4); c.lineTo(x + s * 0.37, y - s * 0.62); c.lineTo(x + s * 0.83, y - s * 0.4); c.closePath(); }, tint(roof, 0.12), tint(roof, -0.22), { span: [y - s * 0.62, y - s * 0.4] });
    P.wash(c, () => { c.beginPath(); c.rect(x - s * 0.36, y - s * 1.05, s * 0.32, s * 1.05); }, tint(stone, 0.18), tint(stone, -0.22), { span: [y - s * 1.05, y] });
    c.fillStyle = tint(stone, 0.05); for (let k = 0; k < 4; k++) c.fillRect(x - s * 0.36 + k * s * 0.085, y - s * 1.1, s * 0.05, s * 0.06);
    c.fillStyle = 'rgba(40,30,30,0.55)'; c.beginPath(); c.moveTo(x - s * 0.24, y - s * 0.72); c.lineTo(x - s * 0.24, y - s * 0.84); c.quadraticCurveTo(x - s * 0.2, y - s * 0.9, x - s * 0.16, y - s * 0.84); c.lineTo(x - s * 0.16, y - s * 0.72); c.fill();
    for (let k = 0; k < 4; k++) { c.beginPath(); const wx = x + s * 0.06 + k * s * 0.18; c.moveTo(wx, y - s * 0.12); c.lineTo(wx, y - s * 0.26); c.quadraticCurveTo(wx + s * 0.035, y - s * 0.31, wx + s * 0.07, y - s * 0.26); c.lineTo(wx + s * 0.07, y - s * 0.12); c.fill(); }
  }
  function brickRow(c, L, y, seed, skip) {
    const r = R(seed), walls = ['#a0624a', '#8f5844', '#b27a5c', '#c9b49a'], roofs = ['#4a3a38', '#5a4038', '#3e3634'];
    let x = CX + 40; while (x < CX + CW) { if (skip && x > skip[0] && x < skip[1]) { x += 90; continue; } const w = 210 + r() * 120, h = 220 + r() * 110;
      P.house(c, x, y, w, h, walls[(r() * 4) | 0], roofs[(r() * 3) | 0], L, (r() * 1e4) | 0); x += w + 30 + r() * 60; }
  }
  function steamPuff(c, x, y, s, t, seed, col, st0) { st0 = st0 || {}; // rising breath / smoke wisps (time-driven)
    const r = R(seed); c.save();
    for (let i = 0; i < 9; i++) {
      const ph = ((t * (0.35 + r() * 0.2) + r()) % 1), px = x + (r() - 0.5) * s * 0.9 + Math.sin(t * 1.3 + i) * s * 0.08, py = y - ph * s * 1.6;
      const rr = s * (0.12 + ph * 0.35); const g = c.createRadialGradient(px, py, 0, px, py, rr);
      g.addColorStop(0, `rgba(${col},${(st0.a || 0.32) * (1 - ph)})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(px - rr, py - rr, rr * 2, rr * 2);
    }
    c.restore();
  }

  // ---------- props ----------
  const PROPS = {
    // the lady's silk riding hood, fluttering (flying: true = billowing in the wind)
    silkhood(ctx, s, st, t) { ctx.translate(0, st.oy || 0);
      const f = st.flying ? Math.sin(t * 9) * 0.18 : Math.sin(t * 2) * 0.05;
      if (st.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(s * 0.2, 0, 0, s * 0.2, 0, s * 1.1); gg.addColorStop(0, 'rgba(255,214,150,0.55)'); gg.addColorStop(0.5, 'rgba(255,200,130,0.2)'); gg.addColorStop(1, 'rgba(255,190,120,0)'); ctx.fillStyle = gg; ctx.fillRect(-s * 1.2, -s * 1.2, s * 2.8, s * 2.4); ctx.restore(); }
      ctx.save(); ctx.rotate(f * 0.5);
      const p = () => { ctx.beginPath(); ctx.moveTo(-s * 0.32, s * 0.1); ctx.quadraticCurveTo(-s * 0.42, -s * 0.42, 0, -s * 0.44); ctx.quadraticCurveTo(s * 0.4, -s * 0.42, s * 0.34, s * 0.08);
        ctx.quadraticCurveTo(s * 0.62, s * (0.25 + f), s * 0.95, s * (0.12 + f * 1.5)); ctx.quadraticCurveTo(s * 0.62, s * (0.42 + f), s * 0.22, s * 0.3);
        ctx.quadraticCurveTo(0, s * 0.18, -s * 0.32, s * 0.1); ctx.closePath(); };
      PT.shade(ctx, p, st.color || '#2f62b0', [-s * 0.42, -s * 0.44, s * 1.37, s * 0.8], LS(), { rim: 1 });
      ctx.strokeStyle = '#e3b23c'; ctx.lineWidth = s * 0.035; ctx.beginPath(); ctx.moveTo(-s * 0.3, s * 0.08); ctx.quadraticCurveTo(0, s * 0.16, s * 0.32, s * 0.06); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-s * 0.1, -s * 0.24, s * 0.12, s * 0.06, -0.5, 0, 7); ctx.fill();
      ctx.restore();
    },
    // today's "hood": a stitched leather tube
    leatherhood(ctx, s, st) { ctx.translate(0, (arguments[2]&&arguments[2].oy)||0);
      const w = s, h = s * 0.26;
      const p = () => { ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); };
      PT.shade(ctx, p, st.wet ? '#5a3a22' : '#7a5232', [-w / 2, -h / 2, w, h], LS(), { rim: 1 });
      const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, 'rgba(255,230,190,0.35)'); g.addColorStop(0.35, 'rgba(255,230,190,0)'); g.addColorStop(1, 'rgba(30,15,10,0.35)');
      p(); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(240,220,180,0.55)'; ctx.lineWidth = s * 0.012; ctx.setLineDash([s * 0.025, s * 0.02]);
      for (const xx of [-0.32, 0.32]) { ctx.beginPath(); ctx.moveTo(w * xx, -h / 2 + 3); ctx.lineTo(w * xx, h / 2 - 3); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-w * 0.32, 0); ctx.lineTo(w * 0.32, 0); ctx.stroke(); ctx.setLineDash([]);
      if (st.wet) { ctx.fillStyle = 'rgba(255,240,200,0.5)'; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(-w * 0.4 + k * w * 0.13, h * 0.1 + (k % 2) * h * 0.2, s * 0.012, s * 0.02, 0, 0, 7); ctx.fill(); } }
      if (st.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.8); gg.addColorStop(0, 'rgba(255,210,140,0.35)'); gg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = gg; ctx.fillRect(-s, -s, s * 2, s * 2); ctx.restore(); }
    },
    // a chestnut horse, side view, walking when st.walk
    horse(ctx, s, st, t) {
      const ph = st.walk ? t * 6 : 0, sw = (k) => Math.sin(ph + k) * 0.35;
      const col = '#8a5232', dk = tint(col, -0.3), ls = LS();
      const leg = (x, k, near) => { ctx.save(); ctx.translate(x, -s * 0.5); ctx.rotate(sw(k));
        PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.035, 0, s * 0.07, s * 0.47, s * 0.03); }, near ? col : dk, [-s * 0.035, 0, s * 0.07, s * 0.47], ls, { rim: near ? 1 : 0.3 });
        ctx.fillStyle = '#2e2420'; ctx.fillRect(-s * 0.04, s * 0.43, s * 0.08, s * 0.05); ctx.restore(); };
      leg(-s * 0.3, 0, false); leg(s * 0.26, Math.PI, false);
      // tail
      ctx.strokeStyle = '#3e2a1e'; ctx.lineWidth = s * 0.06; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-s * 0.42, -s * 0.78); ctx.quadraticCurveTo(-s * 0.58, -s * 0.6 + Math.sin(t * 3) * s * 0.03, -s * 0.52, -s * 0.38); ctx.stroke();
      PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -s * 0.66, s * 0.45, s * 0.2, 0, 0, 7); }, col, [-s * 0.45, -s * 0.86, s * 0.9, s * 0.4], ls, { rim: 1 });
      // neck + head
      const nb = st.walk ? Math.sin(ph * 2) * s * 0.015 : 0;
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(s * 0.28, -s * 0.8); ctx.quadraticCurveTo(s * 0.42, -s * 1.12 + nb, s * 0.52, -s * 1.18 + nb); ctx.lineTo(s * 0.62, -s * 1.0 + nb); ctx.quadraticCurveTo(s * 0.48, -s * 0.8, s * 0.4, -s * 0.58); ctx.closePath(); }, col, [s * 0.28, -s * 1.18, s * 0.34, s * 0.6], ls, { rim: 1 });
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(s * 0.48, -s * 1.2 + nb); ctx.quadraticCurveTo(s * 0.6, -s * 1.26 + nb, s * 0.78, -s * 1.02 + nb); ctx.quadraticCurveTo(s * 0.8, -s * 0.94 + nb, s * 0.72, -s * 0.94 + nb); ctx.lineTo(s * 0.56, -s * 1.02 + nb); ctx.closePath(); }, col, [s * 0.48, -s * 1.26, s * 0.32, s * 0.32], ls, { rim: 1 });
      ctx.fillStyle = '#3e2a1e'; ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.82); ctx.quadraticCurveTo(s * 0.4, -s * 1.12 + nb, s * 0.5, -s * 1.2 + nb); ctx.lineTo(s * 0.46, -s * 1.1 + nb); ctx.quadraticCurveTo(s * 0.38, -s * 1.0, s * 0.26, -s * 0.8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.53, -s * 1.22 + nb); ctx.lineTo(s * 0.55, -s * 1.3 + nb); ctx.lineTo(s * 0.58, -s * 1.21 + nb); ctx.fill();
      ctx.fillStyle = '#1e1614'; ctx.beginPath(); ctx.arc(s * 0.62, -s * 1.12 + nb, s * 0.016, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * 0.625, -s * 1.125 + nb, s * 0.006, 0, 7); ctx.fill();
      // saddle cloth (cobalt + gold)
      PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.16, -s * 0.84, s * 0.3, s * 0.14, s * 0.03); }, '#2f62b0', [-s * 0.16, -s * 0.84, s * 0.3, s * 0.14], ls, { rim: 1 });
      ctx.fillStyle = '#e3b23c'; ctx.fillRect(-s * 0.16, -s * 0.71, s * 0.3, s * 0.02);
      leg(-s * 0.22, Math.PI, true); leg(s * 0.32, 0, true);
    },
    // a small modern hatchback, side view
    car(ctx, s, st) {
      const ls = LS(), body = '#4f6a86';
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.1); ctx.lineTo(-s * 0.5, -s * 0.28); ctx.quadraticCurveTo(-s * 0.48, -s * 0.33, -s * 0.36, -s * 0.34); ctx.lineTo(-s * 0.22, -s * 0.5); ctx.lineTo(s * 0.2, -s * 0.5); ctx.lineTo(s * 0.34, -s * 0.34); ctx.quadraticCurveTo(s * 0.5, -s * 0.32, s * 0.5, -s * 0.22); ctx.lineTo(s * 0.5, -s * 0.1); ctx.closePath(); }, body, [-s * 0.5, -s * 0.5, s, s * 0.4], ls, { rim: 1 });
      ctx.fillStyle = '#a9c0d4'; ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.47); ctx.lineTo(-s * 0.32, -s * 0.35); ctx.lineTo(-s * 0.02, -s * 0.35); ctx.lineTo(-s * 0.02, -s * 0.47); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.02, -s * 0.47); ctx.lineTo(s * 0.02, -s * 0.35); ctx.lineTo(s * 0.3, -s * 0.35); ctx.lineTo(s * 0.18, -s * 0.47); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-s * 0.15, -s * 0.46, s * 0.05, s * 0.1);
      ctx.fillStyle = '#ffe6a0'; ctx.fillRect(s * 0.46, -s * 0.28, s * 0.04, s * 0.04); ctx.fillStyle = '#d24a3a'; ctx.fillRect(-s * 0.5, -s * 0.28, s * 0.03, s * 0.05);
      for (const wx of [-0.3, 0.3]) { ctx.fillStyle = '#2a2628'; ctx.beginPath(); ctx.arc(wx * s, -s * 0.1, s * 0.1, 0, 7); ctx.fill(); ctx.fillStyle = '#9aa3ad'; ctx.beginPath(); ctx.arc(wx * s, -s * 0.1, s * 0.045, 0, 7); ctx.fill(); }
    },
    // the old mounting stone outside the church
    stone(ctx, s) { PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.5, 0); ctx.lineTo(-s * 0.44, -s * 0.36); ctx.lineTo(s * 0.4, -s * 0.38); ctx.lineTo(s * 0.5, 0); ctx.closePath(); }, '#a29a8c', [-s * 0.5, -s * 0.38, s, s * 0.38], LS(), { rim: 1 }); },
    // damp straw burning with thick smoke (smoke grows with st.smoke 0..1)
    strawfire(ctx, s, st, t) {
      const r = R(11); ctx.fillStyle = '#c9a050';
      for (let k = 0; k < 40; k++) { ctx.save(); ctx.translate((r() - 0.5) * s * 0.8, -r() * s * 0.12); ctx.rotate((r() - 0.5) * 1.2); ctx.fillRect(-s * 0.08, -2, s * 0.16, 4); ctx.restore(); }
      const fl = 1 + 0.15 * Math.sin(t * 13) + 0.08 * Math.sin(t * 29);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, -s * 0.12, 0, 0, -s * 0.12, s * 0.5 * fl); g.addColorStop(0, 'rgba(255,170,80,0.6)'); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(-s, -s, s * 2, s * 1.2); ctx.restore();
      for (let k = 0; k < 5; k++) { const fx = (k - 2) * s * 0.12, fh = s * (0.18 + 0.1 * Math.sin(t * 9 + k * 2)) * fl;
        ctx.fillStyle = k % 2 ? '#f7a23a' : '#ffd36a'; ctx.beginPath(); ctx.moveTo(fx - s * 0.05, -s * 0.05); ctx.quadraticCurveTo(fx, -s * 0.05 - fh * 1.3, fx + s * 0.02, -s * 0.05 - fh); ctx.quadraticCurveTo(fx + s * 0.03, -s * 0.05 - fh * 0.4, fx + s * 0.05, -s * 0.05); ctx.fill(); }
      const sm = st.smoke ?? 0.6; if (sm > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, sm * 1.3); steamPuff(ctx, 0, -s * 0.2, s * (1 + sm * 1.4), t, 21, '214,206,196'); steamPuff(ctx, s * 0.1, -s * 0.3, s * (0.8 + sm), t + 0.5, 22, '190,182,174'); ctx.restore(); }
    },
    // breath / sweat steam rising off the scrum
    steam(ctx, s, st, t) { steamPuff(ctx, 0, 0, s, t, 31, '244,240,234', {a: 0.5}); steamPuff(ctx, s * 0.3, s * 0.1, s * 0.8, t + 0.7, 32, '236,232,226', {a: 0.45}); },
    // thick grey smoke cloud (st.d 0..1 density), billowing around whatever stands at x
    smoke(ctx, s, st, t) { // cartoon billows of grey smoke rising in a widening column
      const d = st.d ?? 1, r = R(61); ctx.save();
      const n = Math.round(10 + 22 * d);
      for (let i = 0; i < n; i++) {
        const sp = 0.22 + r() * 0.12, ph = (t * sp + i / n) % 1, wob = Math.sin(t * 1.3 + i * 2.1);
        const px = (r() - 0.5) * s * (0.2 + ph * 0.7) + wob * s * 0.04, py = -ph * s * 1.25;
        const rr = s * (0.07 + ph * 0.17) * (0.8 + r() * 0.4);
        const a = 0.82 * Math.min(1, ph * 6) * (1 - Math.pow(ph, 2.2));
        const base = i % 3 ? [150, 144, 140] : [118, 112, 110];
        const g = ctx.createRadialGradient(px - rr * 0.3, py - rr * 0.35, rr * 0.1, px, py, rr);
        g.addColorStop(0, `rgba(${base[0] + 60},${base[1] + 58},${base[2] + 54},${a})`); g.addColorStop(0.7, `rgba(${base},${a * 0.95})`); g.addColorStop(1, `rgba(${base},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rr, 0, 7); ctx.fill();
      }
      ctx.restore(); },
    // mud splat on the ground
    mud(ctx, s) { const r = R(41); ctx.fillStyle = 'rgba(70,48,30,0.85)'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.12, 0, 0, 7); ctx.fill(); for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.arc((r() - 0.5) * s * 1.2, -r() * s * 0.15, s * (0.02 + r() * 0.04), 0, 7); ctx.fill(); } },
    // the bar counter (drawn in front of the landlady)
    bar(ctx, s) {
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.5, -s * 0.36, s, s * 0.36); }, '#6a4428', [-s * 0.5, -s * 0.36, s, s * 0.36], LS(), { rim: 0.6 });
      PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.52, -s * 0.4, s * 1.04, s * 0.05, 6); }, '#8a5a34', [-s * 0.52, -s * 0.4, s * 1.04, s * 0.05], LS(), { rim: 1 });
      ctx.strokeStyle = 'rgba(30,18,10,0.35)'; ctx.lineWidth = 4; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-s * 0.5 + k * s / 6, -s * 0.34); ctx.lineTo(-s * 0.5 + k * s / 6, 0); ctx.stroke(); }
    },
    pint(ctx, s) { ctx.translate(0, (arguments[2]&&arguments[2].oy)||0);
      ctx.fillStyle = 'rgba(220,150,50,0.85)'; ctx.beginPath(); ctx.moveTo(-s * 0.22, -s); ctx.lineTo(s * 0.22, -s); ctx.lineTo(s * 0.17, 0); ctx.lineTo(-s * 0.17, 0); ctx.fill();
      ctx.fillStyle = '#fbf3e0'; ctx.beginPath(); ctx.ellipse(0, -s, s * 0.23, s * 0.08, 0, 0, 7); ctx.fill(); ctx.fillRect(-s * 0.22, -s, s * 0.44, s * 0.12);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-s * 0.14, -s * 0.85, s * 0.05, s * 0.7);
    },
    // a jug held by its handle, tilting and pouring (st.pour 0..1)
    jug(ctx, s, st, t) { ctx.translate(0, (arguments[2]&&arguments[2].oy)||0);
      const pr = st.pour || 0; ctx.save(); ctx.rotate(pr * 1.4);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.5); ctx.lineTo(s * 0.25, -s * 0.5); ctx.lineTo(s * 0.32, -s * 0.58); ctx.lineTo(s * 0.24, -s * 0.42); ctx.quadraticCurveTo(s * 0.3, 0, s * 0.18, s * 0.05); ctx.lineTo(-s * 0.18, s * 0.05); ctx.quadraticCurveTo(-s * 0.3, 0, -s * 0.2, -s * 0.5); ctx.closePath(); }, '#d8cdb8', [-s * 0.3, -s * 0.58, s * 0.62, s * 0.63], LS(), { rim: 1 });
      ctx.strokeStyle = '#d8cdb8'; ctx.lineWidth = s * 0.06; ctx.beginPath(); ctx.arc(-s * 0.26, -s * 0.25, s * 0.13, 1.6, 4.7); ctx.stroke();
      ctx.restore();
      if (pr > 0.5) { // beer stream from the lip, falling down
        const lx = Math.cos(pr * 1.4) * s * 0.32 + Math.sin(pr * 1.4) * s * 0.58, ly = Math.sin(pr * 1.4) * s * 0.32 - Math.cos(pr * 1.4) * s * 0.58;
        ctx.strokeStyle = 'rgba(232,170,60,0.9)'; ctx.lineWidth = s * 0.05; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.quadraticCurveTo(lx + s * 0.08, ly + s * 0.4, lx + s * 0.06 + Math.sin(t * 20) * 2, ly + (st.fall || s * 1.2)); ctx.stroke();
      }
    },
    // two iron hooks on the back wall (the hood hangs here)
    hooks(ctx, s) { ctx.strokeStyle = '#3a3230'; ctx.lineWidth = s * 0.04; ctx.lineCap = 'round'; for (const hx of [-0.35, 0.35]) { ctx.beginPath(); ctx.moveTo(hx * s, -s * 0.2); ctx.lineTo(hx * s, 0); ctx.quadraticCurveTo(hx * s, s * 0.12, hx * s + s * 0.1, s * 0.06); ctx.stroke(); } },
    // splash drops (beer)
    drops(ctx, s, st, t) { ctx.translate(0, (arguments[2]&&arguments[2].oy)||0); const r = R(51); ctx.fillStyle = 'rgba(240,180,70,0.85)'; for (let k = 0; k < 12; k++) { const a = -Math.PI * r(), sp = s * (0.3 + r() * 0.7), ph = (t * 2 + r()) % 1; ctx.beginPath(); ctx.arc(Math.cos(a) * sp * ph, Math.sin(a) * sp * ph + ph * ph * s * 0.6, s * 0.03, 0, 7); ctx.fill(); } },
  };

  // ---------- cast ----------
  const base = (o) => Object.assign({ rel: 1.0, build: 'slim', head: 0.23, headW: 0.86, jaw: 0.88, leg: 0.44, shoulder: 0.24, hip: 0.18, limb: 0.038,
    skin: '#e6b48e', blush: '#e48b78', iris: '#5a3a26', brow: '#2a1d18', bottom: { type: 'pants', color: '#6a5a48' }, shoe: '#4a3428', sole: '#2e2018' }, o);
  const ladyBase = { name: 'Lady', rel: 0.96, build: 'slim', head: 0.24, headW: 0.84, jaw: 0.76, leg: 0.45, shoulder: 0.2, hip: 0.17, limb: 0.032,
    skin: '#f2cdb0', blush: '#f08a80', iris: '#4f6a86', brow: '#5a3020',
    top: { type: 'robe', color: '#2f62b0', inner: '#f3ead8', trim: '#e3b23c' }, bottom: { type: 'robe', color: '#2f62b0' }, shoe: '#3a2a22', sole: '#241a15' };
  const cast = {
    lady: Object.assign({}, ladyBase, { hair: { type: 'bun', color: '#8a4a26', hi: '#c4804a' }, hat: { type: 'hood', color: '#2f62b0' } }),
    lady_bare: Object.assign({}, ladyBase, { name: 'Lady (hood gone)', hair: { type: 'long', color: '#8a4a26', hi: '#c4804a' } }),
    // the shy farmhand who caught it = the first Fool
    wat: base({ name: 'Wat', rel: 0.97, skin: '#f0c6a4', iris: '#5d7a4a', freckles: true, hair: { type: 'messy', color: '#b0562a', hi: '#e08a4e' },
      top: { type: 'tunic', color: '#7d8f50', inner: '#e9e0cc', trim: '#5e6e3a' }, bottom: { type: 'pants', color: '#7a6450' } }),
    // his confident buddy = the first Lord
    hob: base({ name: 'Hob', rel: 1.08, build: 'broad', shoulder: 0.29, hip: 0.22, limb: 0.044, jaw: 1.0, skin: '#d9a07a', moustache: '#4a3020',
      hair: { type: 'buzz', color: '#4a3020', hi: '#7a5030' }, hat: { type: 'cap', color: '#6a4a32' },
      top: { type: 'tunic', color: '#b0884a', inner: '#e9e0cc', trim: '#7a5a30' }, bottom: { type: 'pants', color: '#5e4c3a' } }),
    hand1: base({ name: 'Farmhand', skin: '#e0aa82', hair: { type: 'bob', color: '#3a2a20', hi: '#6a5040' }, top: { type: 'tunic', color: '#8a6a4c', inner: '#e3d8c2', trim: '#6a4a30' } }),
    hand2: base({ name: 'Farmhand 2', rel: 1.04, skin: '#c98e68', hair: { type: 'messy', color: '#221a18', hi: '#5a4a40' }, hat: { type: 'hood', color: '#7a6a58' }, top: { type: 'tunic', color: '#9a8a6a', inner: '#e3d8c2', trim: '#6a5a40' } }),
    // 1800s player
    old1: base({ name: 'Victorian player', rel: 1.02, skin: '#e2b08a', moustache: '#5a3a22', hair: { type: 'buzz', color: '#5a3a22', hi: '#8a6040' }, hat: { type: 'cap', color: '#4a4a52' },
      top: { type: 'jacket', color: '#5a5a48', inner: '#e8e0cc' }, bottom: { type: 'pants', color: '#4a4440' } }),
    // modern players
    boggin: base({ name: 'Boggin', rel: 1.05, build: 'broad', shoulder: 0.28, hip: 0.21, limb: 0.043, skin: '#e8b090', hair: { type: 'buzz', color: '#6a4a30', hi: '#9a7050' },
      top: { type: 'shirt', color: '#c8322e', inner: '#c8322e' }, bottom: { type: 'pants', color: '#2e3442' }, shoe: '#2a2a2a', sole: '#181818' }),
    lad1: base({ name: 'Player', rel: 1.03, skin: '#f0c4a0', iris: '#4f6a86', hair: { type: 'messy', color: '#c89a5a', hi: '#f0c890' },
      top: { type: 'hoodie', color: '#3e5a4a' }, bottom: { type: 'pants', color: '#3a3a44' }, shoe: '#e8e4dc', sole: '#bbb' }),
    lad2: base({ name: 'Player 2', rel: 1.06, build: 'broad', shoulder: 0.28, limb: 0.043, skin: '#8a5a3e', blush: '#b8705a', hair: { type: 'buzz', color: '#1e1614', hi: '#4a3a30' },
      top: { type: 'jacket', color: '#4a4f5c', inner: '#d8d2c6' }, bottom: { type: 'pants', color: '#2e2e36' } }),
    // today's Fool: patched red-and-yellow costume, soot-smudged, feathered cap
    fool: base({ name: 'The Fool', rel: 1.0, skin: '#c8a088', blush: '#c87a6a', iris: '#4a3022', moustache: '#2a2220', hair: { type: 'messy', color: '#2a2220', hi: '#5a4a40' },
      hat: { type: 'crown', color: '#c8322e', gem: '#e3b23c' }, top: { type: 'tunic', color: '#c8322e', inner: '#e3b23c', trim: '#e3b23c' }, bottom: { type: 'pants', color: '#e3b23c' } }),
    landlady: base({ name: 'Landlady', rel: 0.92, build: 'round', head: 0.25, shoulder: 0.23, hip: 0.25, limb: 0.04, skin: '#f0c2a2', iris: '#5d7a4a', brow: '#6a3a20',
      hair: { type: 'bob', color: '#a8482a', hi: '#d87a4e' }, top: { type: 'shirt', color: '#e9e0cc', inner: '#e9e0cc' }, bottom: { type: 'skirt', color: '#2e3442', len: 0.8 } }),
  };

  // ---------- sets ----------
  const WINTER = { dir: -1, rim: '#ffd29a', rimA: 0.95, key: 'rgba(255,224,186,0.38)', shade: 'rgba(60,64,110,0.5)', ao: 'rgba(40,30,44,0.35)' };
  const loc = {
    hood_field: { // Haxey in January: low gold sun, cold blue sky, muddy field, stone church, bare trees
      light: WINTER, grade: { tint: '#ffcf9a', a: 0.2, bloom: 0.34 }, sun: { x: 120, y: 820, r: 55 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#7f97b8', '#b9bccb', '#f0cfa8', '#fbe0bc'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.cloud(c, 860, 360, 300, L, 701); P.cloud(c, -300, 470, 220, L, 702);
        P.rays(c, L.sun.x, L.sun.y, 12, 1500, 1.1, 0.3, 0.08, 7);
        P.wash(c, () => P.ridge(c, CX, CX + CW, 1180, 60, 0.002, 703), '#8a90a8', '#a6a2b0', { span: [1100, 1400] });
        P.haze(c, 1000, 1360, '#f2d4b6', 0.5);
      },
      mid(c, L) {
        church(c, 930, 1400, 520, '#b8a890', '#5a4a44', L);
        brickRow(c, L, 1440, 704, [620, 1400]);
        for (const [x, s, k] of [[-300, 700, 1], [280, 560, 2], [1450, 760, 3], [1180, 460, 4]]) bareTree(c, x, 1450, s, 'rgba(70,56,60,0.85)', 705 + k);
        c.strokeStyle = 'rgba(80,60,46,0.7)'; c.lineWidth = 6; c.beginPath(); c.moveTo(CX, 1440); c.lineTo(CX + CW, 1446); c.stroke(); // hedge line
        P.haze(c, 1150, 1480, '#f0d0b0', 0.25);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, CH); }, '#8a8a62', '#5e5a3e', { span: [1440, 2400] });
        const r = R(706); for (let k = 0; k < 26; k++) { const x = CX + r() * CW, y = 1500 + r() * 700, w = 80 + r() * 240;
          P.wash(c, () => { c.beginPath(); c.ellipse(x, y, w, w * 0.16, 0, 0, 7); }, '#6a5236', '#4e3a26', { span: [y - w * 0.16, y + w * 0.16], blur: 4 }); }
        c.fillStyle = 'rgba(235,240,248,0.35)'; for (let k = 0; k < 300; k++) c.fillRect(CX + r() * CW, 1450 + r() * 900, 3 + r() * 6, 2); // frost
        P.grass(c, CX, CX + CW, 1440, 50, '#8a9468', 707, 220); P.grass(c, CX, CX + CW, 1800, 400, '#6e7850', 708, 160);
      },
    },
    haxey_street: { // village street at winter dusk: brick houses, the pub with a lit door, a lamp, wet road
      light: { dir: 1, rim: '#ffcf96', rimA: 0.85, key: 'rgba(255,214,170,0.32)', shade: 'rgba(50,50,100,0.55)', ao: 'rgba(30,24,40,0.4)' },
      grade: { tint: '#f6b98a', a: 0.22, bloom: 0.38 }, sun: { x: 980, y: 900, r: 40 },
      far(c, L) {
        P.sky(c, ['#4a5880', '#8a7f9c', '#e0a88a', '#f4c49a'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r, 'rgba(255,190,140,0.7)');
        P.cloud(c, 300, 380, 280, L, 801, { lit: '#f2c0a0', mid: '#a090a8', dark: '#5a5a80' });
        P.haze(c, 1000, 1360, '#d8a898', 0.45);
      },
      mid(c, L) {
        brickRow(c, L, 1440, 802, [-60, 760]);
        // the pub: wide brick front, warm windows, door, hanging sign with a painted hood
        P.wash(c, () => { c.beginPath(); c.rect(-40, 840, 780, 600); }, '#a8644a', '#7a4434', { span: [840, 1440] });
        P.wash(c, () => { c.beginPath(); c.moveTo(-80, 850); c.lineTo(350, 640); c.lineTo(780, 850); c.closePath(); }, '#4a3a38', '#2e2626', { span: [640, 850] });
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const wx of [20, 520]) { const g = c.createRadialGradient(wx + 90, 1080, 0, wx + 90, 1080, 260); g.addColorStop(0, 'rgba(255,190,110,0.45)'); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(wx - 200, 800, 600, 600); }
        c.restore();
        for (const wx of [20, 520]) { c.fillStyle = '#ffcf80'; c.fillRect(wx, 960, 180, 220); c.strokeStyle = '#3e2a22'; c.lineWidth = 10; c.strokeRect(wx, 960, 180, 220); c.beginPath(); c.moveTo(wx + 90, 960); c.lineTo(wx + 90, 1180); c.moveTo(wx, 1070); c.lineTo(wx + 180, 1070); c.stroke(); }
        c.fillStyle = '#ffd890'; c.fillRect(280, 1100, 140, 340); c.strokeStyle = '#2e2018'; c.lineWidth = 12; c.strokeRect(280, 1100, 140, 340);
        c.fillStyle = '#2e2018'; c.fillRect(170, 870, 12, 120); c.fillRect(170, 870, 150, 10);
        P.wash(c, () => { c.beginPath(); c.roundRect(200, 890, 120, 150, 8); }, '#2e4a3a', '#1e3428', { span: [890, 1040] });
        c.fillStyle = '#e3b23c'; c.beginPath(); c.roundRect(222, 950, 76, 22, 11); c.fill(); // the hood on the sign
        // street lamp
        c.fillStyle = '#2a2628'; c.fillRect(1060, 900, 14, 560); c.fillRect(1030, 880, 74, 30);
        c.save(); c.globalCompositeOperation = 'lighter'; const g2 = c.createRadialGradient(1067, 930, 0, 1067, 930, 240); g2.addColorStop(0, 'rgba(255,214,140,0.6)'); g2.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g2; c.fillRect(800, 680, 540, 500); c.restore();
        P.haze(c, 1250, 1470, '#c89a90', 0.2);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, CH); }, '#5a5660', '#3a3842', { span: [1440, 2400] });
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, 40); }, '#8a8078', '#6a625c', { span: [1440, 1480] }); // kerb / pavement
        c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,200,120,0.12)'; c.fillRect(250, 1480, 220, 600); c.fillRect(980, 1480, 180, 600); c.restore(); // wet reflections
        c.fillStyle = 'rgba(240,236,220,0.6)'; for (let k = 0; k < 10; k++) c.fillRect(CX + k * 240, 1720, 120, 10); // road line
      },
    },
    pub_inside: { // cosy pub: dark beams, bottles, fire glow, two hooks behind the bar
      light: { dir: -1, rim: '#ffc880', rimA: 0.85, key: 'rgba(255,206,150,0.38)', shade: 'rgba(50,34,50,0.5)', ao: 'rgba(30,20,20,0.4)' },
      grade: { tint: '#ffbf80', a: 0.22, bloom: 0.42 }, sun: { x: 100, y: 1000, r: 0 }, live: 'motes',
      far(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, CY, CW, CH); }, '#5a3a28', '#7a5034', { span: [CY, 1450], edge: 0 });
        c.fillStyle = '#2e1e16'; for (let y = 120; y < 1450; y += 380) c.fillRect(CX, y, CW, 34); // beams
        for (let x = CX + 100; x < CX + CW; x += 420) c.fillRect(x, 0, 26, 1450);
        // shelves of bottles
        for (const sy of [760, 960]) { c.fillStyle = '#3a2618'; c.fillRect(-120, sy, 1320, 18); const r = R(sy); for (let k = 0; k < 22; k++) { const bx = -100 + k * 60, bh = 70 + r() * 50; c.fillStyle = ['#3e7a4a', '#7a3a2a', '#c8a050', '#4a5a7a'][(r() * 4) | 0]; c.fillRect(bx, sy - bh, 30, bh); c.fillRect(bx + 10, sy - bh - 26, 10, 26); } }
        // fireplace glow on the left
        P.wash(c, () => { c.beginPath(); c.rect(-520, 1080, 380, 370); }, '#2a1a14', '#1a100c', { span: [1080, 1450] });
        c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(-330, 1350, 0, -330, 1350, 600); g.addColorStop(0, 'rgba(255,150,60,0.55)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(-1000, 700, 1300, 900); c.restore();
      },
      mid(c, L) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(560, 1050, 0, 560, 1050, 760); g.addColorStop(0, 'rgba(255,190,110,0.28)'); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(-300, 300, 1700, 1400); c.restore(); },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1450, CW, CH); }, '#5a3e2c', '#3a281c', { span: [1450, 2400] });
        c.strokeStyle = 'rgba(25,15,10,0.35)'; c.lineWidth = 4; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(CX, 1460 + k * k * 9); c.lineTo(CX + CW, 1460 + k * k * 9); c.stroke(); }
      },
    },
  };

  window.CUSTOM = { cast, props: PROPS, loc };
})();
