// The Tichborne Curse (painted-world) — original cast, props and sets:
// frosty English field at dusk, medieval great hall with a hearth, manor lawn (manor is a prop so it can collapse),
// top-down aerial field for the torch trail.
(function () {
  const PT = window.PT, P = PT.PAINT, tint = PT.tint;
  const CX = -540, CY = -480, CW = 2160, CH = 2880;
  const R = (s) => PT.noise.rng(s);
  const LS = () => ((PT.LIGHT || PT.DEF_LIGHT).dir || -1);
  PT.FACES.rest = PT.FACES.rest || { brow: 'flat', mouth: 'line', eye: 1.0, lid: 1 };

  function glow(ctx, x, y, r, rgb, a) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }
  function flame(ctx, x, y, s, t, k) { // teardrop flame, k = size 0..1
    if (k <= 0.02) return;
    const f = (1 + 0.14 * Math.sin(t * 13 + x) + 0.07 * Math.sin(t * 29)) * k;
    glow(ctx, x, y - s * 0.3 * f, s * 2.2 * f, '255,170,80', 0.55);
    for (const [c, sc] of [['#e8692e', 1], ['#ffb347', 0.7], ['#fff1b8', 0.38]]) {
      ctx.fillStyle = c; ctx.beginPath();
      ctx.moveTo(x - s * 0.32 * sc * f, y);
      ctx.quadraticCurveTo(x - s * 0.36 * sc * f, y - s * 0.6 * sc * f, x + Math.sin(t * 7) * s * 0.08, y - s * 1.25 * sc * f);
      ctx.quadraticCurveTo(x + s * 0.36 * sc * f, y - s * 0.6 * sc * f, x + s * 0.32 * sc * f, y);
      ctx.quadraticCurveTo(x, y + s * 0.22 * sc * f, x - s * 0.32 * sc * f, y); ctx.fill();
    }
  }

  const PROPS = {
    // burning stick. burn 0..1 = flame size; ghost = pale blue spirit flame
    torch(ctx, s, st, t) {
      ctx.save(); ctx.rotate(st.tilt || 0);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.03, 0); ctx.lineTo(-s * 0.045, -s * 0.85); ctx.lineTo(s * 0.045, -s * 0.85); ctx.lineTo(s * 0.03, 0); ctx.closePath(); }, '#6a4a32', [-s * 0.05, -s * 0.85, s * 0.1, s * 0.85], LS());
      ctx.fillStyle = '#2a1c16'; ctx.beginPath(); ctx.ellipse(0, -s * 0.85, s * 0.06, s * 0.05, 0, 0, 7); ctx.fill();
      const k = st.burn ?? 1;
      if (st.ghost) { glow(ctx, 0, -s * 1.0, s * 1.4 * k, '150,200,255', 0.5); }
      flame(ctx, 0, -s * 0.86, s * 0.28, t, k);
      if (k < 0.15 && k > 0) { ctx.fillStyle = 'rgba(200,200,210,0.35)'; for (let i = 0; i < 4; i++) { const q = (t * 0.6 + i / 4) % 1; ctx.beginPath(); ctx.arc(Math.sin(q * 6 + i) * s * 0.05, -s * (0.9 + q * 0.5), s * 0.03 * (1 + q), 0, 7); ctx.fill(); } }
      ctx.restore();
    },
    // hearth fire glow (flickers) — place over the fireplace painted in manor_hall
    fire(ctx, s, st, t) {
      for (let i = -2; i <= 2; i++) flame(ctx, i * s * 0.16, 0, s * (0.32 - Math.abs(i) * 0.05), t + i * 0.7, st.k ?? 1);
      glow(ctx, 0, -s * 0.3, s * 2.6, '255,150,70', 0.25 * (1 + 0.15 * Math.sin(t * 9)));
    },
    candle(ctx, s, st, t) {
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.06, -s, s * 0.12, s); }, '#efe6cf', [-s * 0.06, -s, s * 0.12, s], -1);
      flame(ctx, 0, -s * 1.0, s * 0.12, t, st.k ?? 1);
    },
    // four-poster bed (s = width), quilt colour
    bed(ctx, s, st) {
      const ls = LS();
      for (const x of [-0.48, 0.44]) PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(s * x, -s * 1.05, s * 0.05, s * 1.05); }, '#5a3a28', [s * x, -s * 1.05, s * 0.05, s * 1.05], ls);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.52, -s * 1.1, s * 1.04, s * 0.09); }, '#4a2e22', [-s * 0.52, -s * 1.1, s * 1.04, s * 0.09], ls);
      ctx.fillStyle = '#7a2a3a'; ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 1.01); ctx.quadraticCurveTo(-s * 0.36, -s * 0.6, -s * 0.44, -s * 0.28); ctx.lineTo(-s * 0.5, -s * 0.28); ctx.closePath(); ctx.fill();
      PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.5, -s * 0.3, s, s * 0.22, s * 0.03); }, '#6a4430', [-s * 0.5, -s * 0.3, s, s * 0.22], ls);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.42, -s * 0.37, s * 0.18, s * 0.08, s * 0.04); }, '#f3ece0', [-s * 0.42, -s * 0.37, s * 0.18, s * 0.08], ls);
    },
    quilt(ctx, s, st) { // drawn in front of the lying lady
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.5, 0); ctx.quadraticCurveTo(-s * 0.48, -s * 0.13, -s * 0.2, -s * 0.12); ctx.quadraticCurveTo(s * 0.2, -s * 0.16, s * 0.5, -s * 0.08); ctx.lineTo(s * 0.5, 0); ctx.closePath(); }, st.color || '#c9a24a', [-s * 0.5, -s * 0.16, s, s * 0.16], LS());
      ctx.strokeStyle = 'rgba(120,80,30,0.35)'; ctx.lineWidth = s * 0.006; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-s * 0.5 + k * s * 0.17, -s * 0.13); ctx.lineTo(-s * 0.5 + k * s * 0.17, 0); ctx.stroke(); }
    },
    // pile of gold coins (s = width)
    coins(ctx, s, st, t) {
      const r = R(11), ls = LS();
      for (let i = 0; i < 26; i++) { const row = Math.floor(Math.sqrt(i * 2)), x = (r() - 0.5) * s * (0.9 - row * 0.12), y = -row * s * 0.06 - r() * s * 0.02;
        PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(x, y, s * 0.075, s * 0.03, 0, 0, 7); }, '#e8b84a', [x - s * 0.075, y - s * 0.03, s * 0.15, s * 0.06], ls, { rim: 1 }); }
      if (st.shine) glow(ctx, 0, -s * 0.15, s * 0.6, '255,220,120', 0.25 + 0.1 * Math.sin(t * 5));
    },
    loaf(ctx, s) {
      PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -s * 0.22, s * 0.5, s * 0.24, 0, 0, 7); }, '#c8853e', [-s * 0.5, -s * 0.46, s, s * 0.46], LS(), { rim: 1 });
      ctx.strokeStyle = 'rgba(250,220,170,0.6)'; ctx.lineWidth = s * 0.04; for (const x of [-0.2, 0, 0.2]) { ctx.beginPath(); ctx.moveTo(s * x - s * 0.06, -s * 0.36); ctx.lineTo(s * x + s * 0.06, -s * 0.16); ctx.stroke(); }
    },
    // trestle table piled with loaves (s = width)
    breadtable(ctx, s, st) {
      const ls = LS();
      for (const x of [-0.42, 0.38]) PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(s * x, -s * 0.28, s * 0.04, s * 0.28); }, '#5a3a28', [s * x, -s * 0.28, s * 0.04, s * 0.28], ls);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.5, -s * 0.33, s, s * 0.06); }, '#7a5236', [-s * 0.5, -s * 0.33, s, s * 0.06], ls);
      if (st.empty) return;
      const r = R(21); for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(-s * 0.4 + i * s * 0.1 + (r() - 0.5) * 10, -s * 0.33 - (i % 3 === 1 ? s * 0.06 : 0)); PROPS.loaf(ctx, s * 0.13); ctx.restore(); }
    },
    // sack of flour (modern day), text optional
    sack(ctx, s, st) {
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.32, 0); ctx.quadraticCurveTo(-s * 0.4, -s * 0.5, -s * 0.22, -s * 0.85); ctx.lineTo(s * 0.22, -s * 0.85); ctx.quadraticCurveTo(s * 0.4, -s * 0.5, s * 0.32, 0); ctx.closePath(); }, '#efe6d2', [-s * 0.4, -s * 0.9, s * 0.8, s * 0.9], LS(), { rim: 1 });
      ctx.fillStyle = '#c8b28a'; ctx.beginPath(); ctx.ellipse(0, -s * 0.88, s * 0.18, s * 0.06, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(47,98,176,0.85)'; ctx.fillRect(-s * 0.2, -s * 0.5, s * 0.4, s * 0.06);
    },
    // wooden cradle. ribbon colour shows boy (blue) / girl (pink). pop 0..1
    cradle(ctx, s, st, t) {
      const pop = st.pop ?? 1; if (pop <= 0.01) return;
      ctx.save(); ctx.scale(pop, pop); ctx.rotate(Math.sin(t * 2.2 + (st.seed || 0)) * 0.05);
      const ls = LS();
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.15); ctx.lineTo(s * 0.5, -s * 0.15); ctx.quadraticCurveTo(s * 0.45, s * 0.3, 0, s * 0.3); ctx.quadraticCurveTo(-s * 0.45, s * 0.3, -s * 0.5, -s * 0.15); ctx.closePath(); }, '#8a5e3c', [-s * 0.5, -s * 0.15, s, s * 0.45], ls);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(-s * 0.05, -s * 0.18, s * 0.38, s * 0.12, 0, 0, 7); }, st.blanket || '#f3ece0', [-s * 0.43, -s * 0.3, s * 0.76, s * 0.24], ls);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.arc(-s * 0.22, -s * 0.24, s * 0.12, 0, 7); }, '#f0c9a8', [-s * 0.34, -s * 0.36, s * 0.24, s * 0.24], ls);
      ctx.fillStyle = st.ribbon || '#5a8fd6'; ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.2); ctx.lineTo(s * 0.45, -s * 0.32); ctx.lineTo(s * 0.45, -s * 0.08); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.2); ctx.lineTo(s * 0.15, -s * 0.32); ctx.lineTo(s * 0.15, -s * 0.08); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(s * 0.3, -s * 0.2, s * 0.04, 0, 7); ctx.fill();
      ctx.restore();
    },
    // stone manor (s = width). lit windows, crack 0..1, fall 0..1 (right wing collapses)
    manor(ctx, s, st, t) {
      const ls = LS(), H = s * 0.42, wall = st.wall || '#b9a88c', roof = st.roof || '#4a3c3a';
      const win = (x, y, w, h) => { ctx.fillStyle = st.lit ? 'rgba(255,214,140,0.95)' : '#3a3440'; ctx.beginPath(); ctx.roundRect(x, y, w, h, [w * 0.5, w * 0.5, 0, 0]); ctx.fill(); if (st.lit) glow(ctx, x + w / 2, y + h / 2, w * 1.6, '255,190,110', 0.25); ctx.strokeStyle = 'rgba(40,30,30,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke(); };
      // left + centre block
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.5, -H, s * 0.62, H); }, wall, [-s * 0.5, -H, s * 0.62, H], ls, { rim: 0.6 });
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.53, -H); ctx.lineTo(-s * 0.36, -H - s * 0.2); ctx.lineTo(-s * 0.2, -H); ctx.closePath(); ctx.moveTo(-s * 0.22, -H); ctx.lineTo(-s * 0.05, -H - s * 0.24); ctx.lineTo(s * 0.13, -H); ctx.closePath(); }, roof, [-s * 0.53, -H - s * 0.24, s * 0.66, s * 0.24], ls);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.46, -H - s * 0.24, s * 0.05, s * 0.12); ctx.rect(s * 0.02, -H - s * 0.3, s * 0.05, s * 0.14); }, '#8a7a68', [-s * 0.46, -H - s * 0.3, s * 0.53, s * 0.18], ls);
      for (const x of [-0.44, -0.3, -0.16]) win(s * x, -H * 0.8, s * 0.06, H * 0.26);
      for (const x of [-0.44, -0.3]) win(s * x, -H * 0.42, s * 0.06, H * 0.26);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.13, -H * 0.42, s * 0.1, H * 0.42, [s * 0.05, s * 0.05, 0, 0]); }, '#5a3a28', [-s * 0.13, -H * 0.42, s * 0.1, H * 0.42], ls);
      // right wing (can fall)
      const fall = st.fall || 0;
      ctx.save();
      if (fall > 0) { ctx.translate(s * 0.5, 0); ctx.rotate(fall * 0.55); ctx.translate(-s * 0.5, fall * s * 0.12); ctx.globalAlpha = 1 - Math.max(0, fall - 0.75) * 4; }
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(s * 0.12, -H * 0.9, s * 0.38, H * 0.9); }, tint(wall, -0.05), [s * 0.12, -H * 0.9, s * 0.38, H * 0.9], ls, { rim: 0.6 });
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(s * 0.09, -H * 0.9); ctx.lineTo(s * 0.31, -H * 0.9 - s * 0.2); ctx.lineTo(s * 0.53, -H * 0.9); ctx.closePath(); }, roof, [s * 0.09, -H * 0.9 - s * 0.2, s * 0.44, s * 0.2], ls);
      for (const x of [0.17, 0.29, 0.41]) { win(s * x, -H * 0.72, s * 0.06, H * 0.24); win(s * x, -H * 0.36, s * 0.06, H * 0.24); }
      ctx.restore();
      // crack running down where the wing joins
      const c = st.crack || 0;
      if (c > 0) { ctx.strokeStyle = '#1e1618'; ctx.lineWidth = s * 0.008; ctx.lineJoin = 'round'; ctx.beginPath(); const pts = [[0.12, -1.1], [0.14, -0.9], [0.1, -0.72], [0.15, -0.55], [0.11, -0.36], [0.16, -0.18], [0.12, 0]]; const n = Math.max(1, Math.round(c * (pts.length - 1)));
        ctx.moveTo(s * pts[0][0], H * pts[0][1]); for (let i = 1; i <= n; i++) ctx.lineTo(s * pts[i][0], H * pts[i][1]); ctx.stroke(); }
      // rubble after the fall
      if (fall > 0.5) { const r = R(31), k = Math.min(1, (fall - 0.5) * 2); for (let i = 0; i < 26; i++) { const x = s * (0.15 + r() * 0.5), y = -r() * s * 0.05 * k; PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(x, y, s * (0.015 + r() * 0.03) * k, s * 0.015 * k, r(), 0, 7); }, tint(wall, -0.1 - r() * 0.2), [x - 30, y - 20, 60, 40], ls); } }
    },
    // rising dust cloud. a 0..1, t drives billow
    dust(ctx, s, st, t) {
      const a = st.a ?? 1; if (a <= 0) return; const r = R(41);
      for (let i = 0; i < 14; i++) { const x = (r() - 0.5) * s, y = -r() * s * 0.5 - (t * 40) * r(), rr = s * (0.12 + r() * 0.15) * (1 + t * 0.2);
        ctx.fillStyle = `rgba(190,175,160,${0.45 * a})`; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill(); }
    },
    // family crest on a post: the name that dies. fade 0..1, crack 0..1
    crest(ctx, s, st) {
      const a = 1 - (st.fade || 0); if (a <= 0.01) return; ctx.save(); ctx.globalAlpha = a;
      const ls = LS();
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.4, -s); ctx.lineTo(s * 0.4, -s); ctx.lineTo(s * 0.4, -s * 0.5); ctx.quadraticCurveTo(s * 0.38, -s * 0.12, 0, 0); ctx.quadraticCurveTo(-s * 0.38, -s * 0.12, -s * 0.4, -s * 0.5); ctx.closePath(); }, '#2f62b0', [-s * 0.4, -s, s * 0.8, s], ls, { rim: 1 });
      ctx.fillStyle = '#e3b23c'; ctx.font = `${Math.round(s * 0.55)}px Cap, Poppins, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('T', 0, -s * 0.52);
      if (st.crack) { ctx.strokeStyle = '#140e10'; ctx.lineWidth = s * 0.03; ctx.beginPath(); ctx.moveTo(-s * 0.05, -s); const n = st.crack; ctx.lineTo(s * 0.08 * n, -s * (1 - 0.3 * n)); ctx.lineTo(-s * 0.06 * n, -s * (1 - 0.6 * n)); ctx.lineTo(s * 0.05 * n, -s * (1 - 0.95 * n)); ctx.stroke(); }
      ctx.restore();
    },
    // glowing trail drawn around a big loop (aerial). p 0..1 progress; tiny torch dot at the head
    trail(ctx, s, st, t) {
      const p = st.p ?? 1, n = 140, rx = s * 0.5, ry = s * 0.42, wob = (u) => 1 + 0.08 * Math.sin(u * 5 + 1) + 0.05 * Math.sin(u * 11);
      const pt = (u) => { const a = -Math.PI / 2 + u * Math.PI * 2; return [Math.cos(a) * rx * wob(u), Math.sin(a) * ry * wob(u)]; };
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'lighter';
      for (const [w, col] of [[s * 0.09, 'rgba(255,130,50,0.3)'], [s * 0.035, 'rgba(255,180,90,0.85)'], [s * 0.012, 'rgba(255,240,200,0.95)']]) {
        ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= n * p; i++) { const [x, y] = pt(i / n); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
      const [hx, hy] = pt(p); glow(ctx, hx, hy, s * 0.12, '255,200,120', 0.9); ctx.fillStyle = '#fff4d0'; ctx.beginPath(); ctx.arc(hx, hy, s * 0.012, 0, 7); ctx.fill();
      ctx.restore();
    },
    bank(ctx, s, st) {
      const top = st.top || '#9aa0b4', bot = st.bot || '#6a6e84', grassCol = st.grass || '#c9cfd6', r = R(st.seed || 71), w = s * (st.w || 2.4);
      const g = ctx.createLinearGradient(0, -s * 0.4, 0, s); g.addColorStop(0, top); g.addColorStop(1, bot);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w / 2, s); ctx.lineTo(-w / 2, -s * 0.36);
      for (let x = -w / 2; x <= w / 2; x += 20) ctx.lineTo(x, -s * 0.4 + Math.sin(x * 0.02) * s * 0.02); ctx.lineTo(w / 2, s); ctx.closePath(); ctx.fill();
      ctx.lineCap = 'round';
      for (let i = 0; i < 90; i++) { const x = (r() - 0.5) * w, y = -s * 0.4 + r() * s * 0.25, l = s * (0.08 + r() * 0.12), a = -Math.PI / 2 + (r() - 0.5) * 0.8;
        ctx.strokeStyle = r() < 0.5 ? grassCol : tint(grassCol, -0.25); ctx.lineWidth = 3 + r() * 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.4, y + Math.sin(a) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
    },
    // frosty grass tuft in front of an actor (hides legs for the crawl)
    tuft(ctx, s) {
      const r = R(61); ctx.lineCap = 'round';
      for (let i = 0; i < 46; i++) { const x = (r() - 0.5) * s, l = s * (0.18 + r() * 0.22), a = -Math.PI / 2 + (r() - 0.5) * 0.8;
        ctx.strokeStyle = r() < 0.5 ? '#c9cfd6' : '#8f9a88'; ctx.lineWidth = 4 + r() * 5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.4, Math.sin(a) * l * 0.6, x + Math.cos(a) * l, Math.sin(a) * l); ctx.stroke(); }
    },
    // screen-space hook text (camera ignored)
    hooktext(ctx, s, st) {
      const pop = st.pop ?? 1; if (pop <= 0.01) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(st.sx || 470, st.sy || 600); ctx.scale(pop, pop); ctx.rotate(-0.03);
      ctx.font = `${Math.round(s)}px Cap, Poppins, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = s * 0.2; ctx.strokeStyle = '#1c1630'; ctx.strokeText(st.text, 0, 0); ctx.fillStyle = st.color || '#ffd23f'; ctx.fillText(st.text, 0, 0);
      ctx.restore();
    },
    notice(ctx, s, st) { // wooden notice board on a post
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.03, -s * 0.9, s * 0.06, s * 0.9); }, '#5a3a28', [-s * 0.03, -s * 0.9, s * 0.06, s * 0.9], LS());
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.45, -s * 1.05, s * 0.9, s * 0.4); }, '#c8a476', [-s * 0.45, -s * 1.05, s * 0.9, s * 0.4], LS());
      ctx.fillStyle = '#7a2420'; ctx.font = `${Math.round(s * 0.13)}px Cap, Poppins, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      String(st.text || '').split('|').forEach((ln, i, a) => ctx.fillText(ln, 0, -s * 0.85 + (i - (a.length - 1) / 2) * s * 0.15));
    },
  };

  // ---------- cast ----------
  const kid = (o) => Object.assign({ rel: 0.56, build: 'slim', head: 0.31, headW: 0.9, jaw: 0.78, leg: 0.38, shoulder: 0.2, hip: 0.16, limb: 0.04,
    skin: '#f0caa8', blush: '#f08a80', iris: '#4f6a86', brow: '#4a3022', shoe: '#3a2a22', sole: '#241a15' }, o);
  const boy = (n, hair, hc, top) => kid({ name: n, hair: { type: hair, color: hc, hi: tint(hc, 0.4) }, top: { type: 'jacket', color: top, inner: '#f3ece0' }, bottom: { type: 'pants', color: '#e8e0cc' } });
  const girl = (n, hair, hc, dress) => kid({ name: n, hair: { type: hair, color: hc, hi: tint(hc, 0.4) }, top: { type: 'tunic', color: dress, inner: '#f6efe4', trim: '#f6efe4' }, bottom: { type: 'skirt', color: dress, len: 0.85 } });
  const cast = {
    mabella: { name: 'Lady Mabella', rel: 0.94, build: 'slim', head: 0.25, headW: 0.86, jaw: 0.82, leg: 0.42, shoulder: 0.2, hip: 0.18, limb: 0.034,
      skin: '#eccaae', blush: '#e49a8a', iris: '#5f7fa6', brow: '#cfc8cc',
      hair: { type: 'long', color: '#d8d2d6', hi: '#ffffff' }, hat: { type: 'veil', color: '#f2ece0' },
      top: { type: 'robe', color: '#2f62b0', inner: '#efe6d2', trim: '#e3b23c' }, bottom: { type: 'robe', color: '#2f62b0' }, shoe: '#4a3530', sole: '#2f2320' },
    ghost: { name: 'Mabella (ghost)', rel: 0.94, build: 'slim', head: 0.25, headW: 0.86, jaw: 0.82, leg: 0.42, shoulder: 0.2, hip: 0.18, limb: 0.034,
      skin: '#c9d8ea', blush: '#a8b8d8', iris: '#e8f2ff', brow: '#e8eef6',
      hair: { type: 'long', color: '#e6eef8', hi: '#ffffff' }, hat: { type: 'veil', color: '#eef4fb' },
      top: { type: 'robe', color: '#8fb0d8', inner: '#e6eef8', trim: '#cfe0f4' }, bottom: { type: 'robe', color: '#8fb0d8' }, shoe: '#8fa0b8', sole: '#6f80a0' },
    roger: { name: 'Sir Roger', rel: 1.06, build: 'slim', head: 0.23, headW: 0.8, jaw: 1.02, leg: 0.45, shoulder: 0.22, hip: 0.17, limb: 0.034,
      skin: '#e0ae8a', blush: '#d98a78', iris: '#4a3a2a', brow: '#2a1c16', moustache: '#2a1c16',
      hair: { type: 'messy', color: '#2a1c16', hi: '#5a4036' }, hat: { type: 'cap', color: '#7a2228' },
      top: { type: 'tunic', color: '#8a2a2e', inner: '#e8d9b8', trim: '#e3b23c' }, bottom: { type: 'pants', color: '#3a3040' }, shoe: '#3a2a22', sole: '#241a15' },
    henry: { name: 'Sir Henry (1796)', rel: 1.0, build: 'round', head: 0.24, headW: 0.92, jaw: 0.95, leg: 0.4, shoulder: 0.25, hip: 0.26, limb: 0.042,
      skin: '#eab896', blush: '#e2826e', iris: '#5a6a7a', brow: '#cfc8c4',
      hair: { type: 'ponytail', color: '#ece8e4', hi: '#ffffff' },
      top: { type: 'jacket', color: '#2a3a5c', inner: '#f3ece0' }, bottom: { type: 'pants', color: '#e6dcc4' }, shoe: '#1e1a1e', sole: '#141014' },
    heir: { name: 'the oldest son', rel: 1.02, build: 'slim', head: 0.23, headW: 0.86, jaw: 0.9, leg: 0.45, shoulder: 0.22, hip: 0.17, limb: 0.035,
      skin: '#eebd9a', blush: '#e48a78', iris: '#5a6a7a', brow: '#5a3a24',
      hair: { type: 'ponytail', color: '#7a4e2e', hi: '#b07a4e' },
      top: { type: 'jacket', color: '#3e5a3a', inner: '#f3ece0' }, bottom: { type: 'pants', color: '#e6dcc4' }, shoe: '#1e1a1e', sole: '#141014' },
    peas_w: { name: 'village woman', rel: 0.9, build: 'round', head: 0.26, headW: 0.9, jaw: 0.86, leg: 0.36, shoulder: 0.22, hip: 0.25, limb: 0.04,
      skin: '#dcaa86', blush: '#d98a78', iris: '#4a3022', brow: '#3a2a24',
      hair: { type: 'bun', color: '#5a3a28', hi: '#8a6040' }, hat: { type: 'hood', color: '#8a7a5a' },
      top: { type: 'shawl', color: '#6a5a44', inner: '#d8ccb0' }, bottom: { type: 'skirt', color: '#5a4a3a', len: 0.92 }, shoe: '#3a2a22', sole: '#241a15' },
    peas_m: { name: 'village man', rel: 1.0, build: 'broad', head: 0.24, headW: 0.9, jaw: 0.98, leg: 0.42, shoulder: 0.26, hip: 0.2, limb: 0.042,
      skin: '#d49a74', blush: '#d98a78', iris: '#4a3022', brow: '#3a2a20', moustache: null,
      hair: { type: 'messy', color: '#6a4a30', hi: '#9a7050' }, hat: { type: 'cap', color: '#6a5a40' },
      top: { type: 'tunic', color: '#7f8f5a', inner: '#d8ccb0', trim: '#5a6a3a' }, bottom: { type: 'pants', color: '#5a4a3a' }, shoe: '#3a2a22', sole: '#241a15' },
    peas_k: kid({ name: 'village kid', skin: '#e2b08c', hair: { type: 'messy', color: '#a0703a', hi: '#d0a060' }, top: { type: 'tunic', color: '#a8865a', inner: '#e8dcc0', trim: '#7a5a3a' }, bottom: { type: 'pants', color: '#6a5a44' } }),
    squire: { name: 'today\'s squire', rel: 1.0, build: 'slim', head: 0.23, headW: 0.86, jaw: 0.92, leg: 0.45, shoulder: 0.23, hip: 0.18, limb: 0.036,
      skin: '#eebd9a', blush: '#e48a78', iris: '#5a6a7a', brow: '#8a7a6a',
      hair: { type: 'buzz', color: '#9a8a7a', hi: '#c8b8a8' }, hat: { type: 'cap', color: '#6a6a4a' },
      top: { type: 'jacket', color: '#6b6a3e', inner: '#e8e0cc' }, bottom: { type: 'pants', color: '#4a4a3a' }, shoe: '#4a3020', sole: '#2a1c14' },
    boy1: boy('boy', 'messy', '#6a4428', '#3a5a8a'), boy2: boy('boy', 'buzz', '#d8b060', '#4a6a9a'), boy3: boy('boy', 'messy', '#2a1c16', '#2f4f7a'),
    girl1: girl('girl', 'ponytail', '#7a4e2e', '#e9a1b2'), girl2: girl('girl', 'bob', '#d8b060', '#f0c8d6'), girl3: girl('girl', 'long', '#2a1c16', '#d98aa8'),
  };

  // ---------- sets ----------
  const loc = {
    dusk_field: { // a huge frosty English field at dusk; a far manor on the hill; bare hedgerow trees
      light: { dir: 1, rim: '#ffc48a', rimA: 0.95, key: 'rgba(255,210,170,0.32)', shade: 'rgba(50,50,110,0.55)', ao: 'rgba(40,30,50,0.35)' },
      grade: { tint: '#e8a8a0', a: 0.2, bloom: 0.36 }, sun: { x: 900, y: 1180, r: 52 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#2c3462', '#5f5f92', '#b4889e', '#f2b48c', '#fbd2a2'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r, 'rgba(255,190,140,0.75)');
        P.cloud(c, 160, 420, 280, L, 701, { lit: '#ffd0b0', mid: '#a88aa8', dark: '#4a4a7a' }); P.cloud(c, 1250, 300, 240, L, 702, { lit: '#ffd0b0', mid: '#9a7ea0', dark: '#4a4a7a' });
        P.rays(c, L.sun.x, L.sun.y, 10, 1200, 1.2, Math.PI * 1.15, 0.07, 7);
        P.wash(c, () => P.ridge(c, CX, CX + CW, 1250, 120, 0.0018, 703), '#5e5a7c', '#4a4864', { span: [1100, 1400] });
        // distant manor silhouette with lit windows
        c.fillStyle = '#3a3450'; c.fillRect(-120, 1120, 260, 110); c.beginPath(); c.moveTo(-140, 1120); c.lineTo(-40, 1050); c.lineTo(60, 1120); c.lineTo(160, 1060); c.lineTo(170, 1120); c.fill(); c.fillRect(-70, 1035, 18, 40);
        c.fillStyle = 'rgba(255,210,140,0.9)'; for (const x of [-95, -55, -15, 25, 70, 110]) c.fillRect(x, 1150, 12, 18);
        P.haze(c, 1050, 1420, '#d8a8b0', 0.45);
      },
      mid(c, L) {
        const r = R(704);
        for (let i = 0; i < 12; i++) { const x = CX + 80 + i * 190 + r() * 60, y = 1400 + r() * 30, s = 220 + r() * 140; // bare winter trees
          c.strokeStyle = '#3a3048'; c.lineCap = 'round';
          const br = (x0, y0, a, l, w, d) => { if (d > 4 || l < 10) return; const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); br(x1, y1, a - 0.45 - r() * 0.2, l * 0.68, w * 0.62, d + 1); br(x1, y1, a + 0.4 + r() * 0.2, l * 0.66, w * 0.62, d + 1); };
          br(x, y, -Math.PI / 2, s * 0.42, 14, 0); }
        c.fillStyle = '#4a4458'; c.beginPath(); c.moveTo(CX, 1420); for (let x = CX; x <= CX + CW; x += 30) c.lineTo(x, 1400 - Math.abs(Math.sin(x * 0.02)) * 24); c.lineTo(CX + CW, 1440); c.lineTo(CX, 1440); c.fill(); // hedgerow
        P.haze(c, 1250, 1460, '#d0a4b0', 0.25);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1430, CW, CH); }, '#8a8aa0', '#5a5a70', { span: [1430, 2400] });
        c.strokeStyle = 'rgba(230,236,245,0.35)'; c.lineWidth = 6; for (let k = 0; k < 16; k++) { const y = 1450 + k * k * 4.5; c.beginPath(); c.moveTo(CX, y); c.quadraticCurveTo(540, y - 10, CX + CW, y + 4); c.stroke(); } // frosty furrows
        P.grass(c, CX, CX + CW, 1440, 60, '#a8b0bc', 705, 400); P.grass(c, CX, CX + CW, 1760, 500, '#8a92a0', 706, 300);
      },
    },
    manor_hall: { // medieval great hall: stone walls, tapestry, big hearth on the right
      light: { dir: 1, rim: '#ffbf7a', rimA: 0.9, key: 'rgba(255,190,130,0.4)', shade: 'rgba(40,30,60,0.55)', ao: 'rgba(30,20,30,0.4)' },
      grade: { tint: '#ffb070', a: 0.2, bloom: 0.4 }, sun: { x: 900, y: 1200, r: 0 }, live: 'motes',
      far(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, CY, CW, CH); }, '#3e3236', '#6a5448', { span: [CY, 1500], edge: 0 });
        const r = R(801); c.strokeStyle = 'rgba(20,14,16,0.35)'; c.lineWidth = 4;
        for (let y = -400; y < 1460; y += 70) { c.beginPath(); c.moveTo(CX, y); c.lineTo(CX + CW, y); c.stroke(); for (let x = CX + ((y / 70) % 2) * 60; x < CX + CW; x += 120) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 70); c.stroke(); } }
        // tall window (dusk outside)
        P.wash(c, () => { c.beginPath(); c.roundRect(-260, 300, 240, 600, [120, 120, 0, 0]); }, '#3a3a6a', '#c48a8a', { span: [300, 900] });
        c.strokeStyle = '#2a2026'; c.lineWidth = 16; c.beginPath(); c.roundRect(-260, 300, 240, 600, [120, 120, 0, 0]); c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(-140, 300); c.lineTo(-140, 900); c.moveTo(-260, 600); c.lineTo(-20, 600); c.stroke();
        // tapestry with a gold border
        P.wash(c, () => { c.beginPath(); c.rect(80, 260, 420, 560); }, '#7a2a34', '#5a1e28', { span: [260, 820] });
        c.strokeStyle = '#d9a441'; c.lineWidth = 12; c.strokeRect(96, 276, 388, 528);
        c.fillStyle = '#d9a441'; c.beginPath(); c.moveTo(290, 420); c.lineTo(370, 520); c.lineTo(290, 660); c.lineTo(210, 520); c.closePath(); c.fill();
        // hearth (right)
        P.wash(c, () => { c.beginPath(); c.rect(860, 800, 640, 700); }, '#8a7a6a', '#6a5a4c', { span: [800, 1500] });
        P.wash(c, () => { c.beginPath(); c.roundRect(940, 1060, 480, 440, [200, 200, 0, 0]); }, '#1e1414', '#3a2018', { span: [1060, 1500] });
        P.wash(c, () => { c.beginPath(); c.rect(820, 760, 720, 60); }, '#9a8a78', '#7a6a5a', { span: [760, 820] });
      },
      mid(c, L) {
        c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(1180, 1350, 0, 1180, 1350, 900); g.addColorStop(0, 'rgba(255,150,70,0.4)'); g.addColorStop(1, 'rgba(255,130,60,0)'); c.fillStyle = g; c.fillRect(200, 400, 1800, 1500); c.restore();
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1450, CW, CH); }, '#5a4636', '#3a2c22', { span: [1450, 2400] });
        c.strokeStyle = 'rgba(25,15,10,0.35)'; c.lineWidth = 4; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(CX, 1460 + k * k * 9); c.lineTo(CX + CW, 1460 + k * k * 9); c.stroke(); }
        P.wash(c, () => { c.beginPath(); c.ellipse(500, 1660, 640, 120, 0, 0, 7); }, '#2f62b0', '#24488a', { span: [1540, 1780], blur: 5 }); // blue rug
        c.strokeStyle = 'rgba(227,178,60,0.5)'; c.lineWidth = 6; c.beginPath(); c.ellipse(500, 1660, 580, 100, 0, 0, 7); c.stroke();
      },
    },
    manor_lawn: { // in front of the manor: sky, far trees, lawn and a gravel drive (the manor itself is a prop)
      light: { dir: -1, rim: '#ffd59a', rimA: 0.95, key: 'rgba(255,226,180,0.38)', shade: 'rgba(70,52,110,0.48)', ao: 'rgba(60,30,44,0.32)' },
      grade: { tint: '#ffcf9a', a: 0.2, bloom: 0.34 }, sun: { x: 120, y: 900, r: 58 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#7f97c0', '#d9b9c2', '#f8c9a2', '#fde0b8'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.cloud(c, 820, 330, 300, L, 901); P.cloud(c, -300, 420, 220, L, 902);
        P.rays(c, L.sun.x, L.sun.y, 12, 1500, 1.0, 0.2, 0.08, 9);
        P.wash(c, () => P.ridge(c, CX, CX + CW, 1240, 120, 0.002, 903), '#8a94ae', '#a7a6b8', { span: [1100, 1400] });
        P.haze(c, 950, 1380, '#f4d4b2', 0.5);
      },
      mid(c, L) {
        const r = R(904); for (let i = 0; i < 9; i++) { const x = CX + 40 + i * 260 + r() * 80; if (x > -200 && x < 1300) continue; P.tree(c, x, 1440, 420 + r() * 180, L, 905 + i, { leaf: '#6f7f4e' }); }
        P.haze(c, 1200, 1460, '#f2d0ae', 0.2);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1430, CW, CH); }, '#8aa062', '#5f7a44', { span: [1430, 2400] });
        P.wash(c, () => { c.beginPath(); c.moveTo(420, 1430); c.lineTo(660, 1430); c.lineTo(1100, 2400); c.lineTo(-20, 2400); c.closePath(); }, '#cdb894', '#a8946e', { span: [1430, 2400] }); // gravel drive
        P.grass(c, CX, CX + CW, 1440, 60, '#7d9450', 906, 300); P.grass(c, CX, CX + CW, 1760, 500, '#6a8444', 907, 260);
      },
    },
    aerial_field: { // straight down on the frosty field at dusk: hedgerows, furrows, the manor roof in a corner
      light: { dir: 1, rim: '#ffc48a', rimA: 0.6, key: 'rgba(255,210,170,0.3)', shade: 'rgba(50,50,110,0.5)', ao: 'rgba(40,30,50,0.3)' },
      grade: { tint: '#c8a0b8', a: 0.2, bloom: 0.45 }, sun: { x: 1300, y: 300, r: 0 },
      far(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, CY, CW, CH); }, '#5a5e78', '#4a4e66', { span: [CY, CY + CH], edge: 0 });
        const r = R(1001);
        for (let i = 0; i < 9; i++) { const y = CY + i * 330; P.wash(c, () => { c.beginPath(); c.rect(CX, y, CW, 320); }, i % 2 ? '#6a6e86' : '#60647c', i % 2 ? '#5e627a' : '#585c74', { span: [y, y + 320], edge: 0 }); }
        c.strokeStyle = 'rgba(220,226,240,0.25)'; c.lineWidth = 5; for (let y = CY; y < CY + CH; y += 34) { c.beginPath(); c.moveTo(CX, y + r() * 6); c.lineTo(CX + CW, y + r() * 6); c.stroke(); }
        // hedgerow border (dark, dotted trees seen from above)
        for (const [x0, y0, x1, y1] of [[-300, -200, 1400, -260], [-300, 2080, 1400, 2140], [-330, -200, -280, 2140], [1380, -260, 1420, 2140]]) { for (let k = 0; k <= 40; k++) { const u = k / 40, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; c.fillStyle = '#2e3446'; c.beginPath(); c.arc(x + (r() - 0.5) * 20, y + (r() - 0.5) * 20, 36 + r() * 24, 0, 7); c.fill(); } }
        // manor roof corner (lit windows seen from above as warm squares)
        c.fillStyle = '#3a3040'; c.fillRect(1000, -480, 600, 300); c.fillStyle = 'rgba(255,210,140,0.85)'; for (let k = 0; k < 5; k++) c.fillRect(1040 + k * 100, -200, 40, 16);
      },
      mid(c, L) {}, near(c, L) {},
    },
  };

  window.CUSTOM = { cast, props: PROPS, loc };
})();
