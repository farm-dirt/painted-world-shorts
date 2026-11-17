// The Wedding of the Dead — original cast, props and sets (Romanian Carpathian village)
(function () {
  const PT = window.PT, P = PT.PAINT, tint = PT.tint;
  const CX = -540, CY = -480, CW = 2160, CH = 2880;
  PT.FACES.rest = { brow: 'flat', mouth: 'line', eye: 1.0, lid: 1 };          // eyes closed, at peace
  const R = (s) => PT.noise.rng(s);

  // ---------- a painted fir (used by sets AND the fir prop) ----------
  function fir(c, x, y, s, o) {
    o = o || {}; const col = o.col || '#2f5a44', ls = (PT.LIGHT || PT.DEF_LIGHT).dir || -1, n = o.tiers || 7, w = s * (o.w || 0.42);
    c.save();
    c.fillStyle = tint(o.trunk || '#5a4030', -0.1); c.fillRect(x - s * 0.025, y - s * 0.16, s * 0.05, s * 0.16);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), ty = y - s * (0.98 - u * 0.8), by = ty + s * 0.26, hw = w * (0.12 + u * 0.88) * 0.5;
      const path = () => { c.beginPath(); c.moveTo(x, ty); c.quadraticCurveTo(x + hw * 0.5, ty + s * 0.12, x + hw, by);
        for (let k = 0; k <= 6; k++) { const xx = x + hw - (k / 6) * hw * 2; c.lineTo(xx, by + (k % 2 ? -s * 0.02 : s * 0.01)); }
        c.quadraticCurveTo(x - hw * 0.5, ty + s * 0.12, x, ty); c.closePath(); };
      const g = c.createLinearGradient(x - hw, 0, x + hw, 0);
      const lit = tint(col, 0.35), dk = tint(col, -0.35);
      g.addColorStop(0, ls < 0 ? lit : dk); g.addColorStop(0.55, col); g.addColorStop(1, ls < 0 ? dk : lit);
      path(); c.fillStyle = g; c.fill();
      const g2 = c.createLinearGradient(0, by - s * 0.07, 0, by); g2.addColorStop(0, 'rgba(10,20,25,0)'); g2.addColorStop(1, 'rgba(10,20,25,0.3)');
      path(); c.fillStyle = g2; c.fill();
      if (o.rim !== false) { c.save(); path(); c.clip(); c.fillStyle = 'rgba(255,224,170,0.22)'; c.fillRect(ls < 0 ? x - hw : x + hw * 0.7, ty, hw * 0.3, s * 0.3); c.restore(); }
    }
    c.restore();
  }
  window.FIR = fir;

  const RIB = ['#c8322e', '#f3eee2', '#2f62b0', '#e3b23c', '#c8322e', '#3e8c5a'];
  const PROPS = {
    // the groom. state: ribbons (bool), sway (0-1), bloom (bouquet on top)
    fir(ctx, s, st, t) {
      const sw = (st.sway ?? 0.3) * Math.sin(t * 1.4) * 0.02;
      ctx.save(); ctx.rotate(sw);
      fir(ctx, 0, 0, s, { col: '#2f6048', tiers: 7, w: 0.46 });
      if (st.ribbons) {
        for (let i = 0; i < 14; i++) {
          const u = (i % 7) / 6, side = i < 7 ? -1 : 1, ty = -s * (0.78 - u * 0.62), hw = s * 0.46 * (0.12 + (0.2 + u * 0.8) * 0.88) * 0.5;
          const x0 = side * hw * (0.55 + 0.3 * ((i * 37) % 10) / 10), y0 = ty + s * 0.2;
          const len = s * (0.12 + ((i * 13) % 7) / 50), wav = Math.sin(t * 2.2 + i) * s * 0.012;
          ctx.strokeStyle = RIB[i % RIB.length]; ctx.lineWidth = s * 0.016; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + wav, y0 + len * 0.5, x0 + wav * 2 + side * s * 0.01, y0 + len); ctx.stroke();
        }
      }
      if (st.hat) { // a groom's black hat with a flower bunch, perched on the top
        const hy = -s * 0.93, hw = s * 0.11;
        PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(0, hy, hw, hw * 0.22, 0, 0, 7); }, '#24202a', [-hw, hy - hw * 0.25, hw * 2, hw * 0.5], -1);
        PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-hw * 0.55, hy - hw * 0.62, hw * 1.1, hw * 0.62, hw * 0.12); }, '#2c2832', [-hw * 0.55, hy - hw * 0.62, hw * 1.1, hw * 0.62], -1);
        ctx.fillStyle = '#c8322e'; ctx.fillRect(-hw * 0.55, hy - hw * 0.2, hw * 1.1, hw * 0.12);
        for (let k = 0; k < 6; k++) { ctx.fillStyle = ['#f3eee2', '#e9a1b2', '#e3b23c'][k % 3]; ctx.beginPath(); ctx.arc(hw * 0.45 + Math.cos(k) * hw * 0.16, hy - hw * 0.45 - Math.sin(k * 1.7) * hw * 0.2, hw * 0.1, 0, 7); ctx.fill(); }
        ctx.strokeStyle = '#7a9a52'; ctx.lineWidth = hw * 0.06; ctx.beginPath(); ctx.moveTo(hw * 0.4, hy - hw * 0.4); ctx.quadraticCurveTo(hw * 0.7, hy - hw * 1.1, hw * 0.55, hy - hw * 1.4); ctx.stroke();
      }
      if (st.bloom) { // groom's bouquet on the top
        const by = -s * 0.98; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28; ctx.fillStyle = k % 2 ? '#f3eee2' : '#e9a1b2'; ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.025, by + Math.sin(a) * s * 0.02, s * 0.017, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#e3b23c'; ctx.beginPath(); ctx.arc(0, by, s * 0.014, 0, 7); ctx.fill();
      }
      ctx.restore();
    },
    candle(ctx, s, st, t) {
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.06, -s, s * 0.12, s); }, '#efe6cf', [-s * 0.06, -s, s * 0.12, s], -1);
      const f = 1 + 0.12 * Math.sin(t * 11 + s) + 0.06 * Math.sin(t * 23);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, -s * 1.08, 0, 0, -s * 1.08, s * 0.9 * f); g.addColorStop(0, 'rgba(255,200,120,0.55)'); g.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = g; ctx.fillRect(-s, -s * 2, s * 2, s * 2);
      ctx.restore();
      ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.ellipse(0, -s * 1.07, s * 0.035, s * 0.08 * f, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff8e0'; ctx.beginPath(); ctx.ellipse(0, -s * 1.05, s * 0.016, s * 0.04 * f, 0, 0, 7); ctx.fill();
    },
    bier(ctx, s) { // wooden table under a white embroidered cloth (s = width)
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.46, -s * 0.24, s * 0.05, s * 0.24); ctx.rect(s * 0.41, -s * 0.24, s * 0.05, s * 0.24); }, '#5c4130', [-s / 2, -s * 0.24, s, s * 0.24], -1);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.5, -s * 0.3, s, s * 0.12, s * 0.02); }, '#f1ece2', [-s / 2, -s * 0.3, s, s * 0.12], -1);
      ctx.fillStyle = '#b8322e'; for (let k = 0; k < 18; k++) { const x = -s * 0.47 + k * s * 0.055; ctx.beginPath(); ctx.moveTo(x, -s * 0.2); ctx.lineTo(x + s * 0.02, -s * 0.225); ctx.lineTo(x + s * 0.04, -s * 0.2); ctx.lineTo(x + s * 0.02, -s * 0.185); ctx.closePath(); ctx.fill(); }
    },
    stump(ctx, s, st) {
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.3, 0); ctx.lineTo(-s * 0.24, -s * 0.36); ctx.lineTo(s * 0.24, -s * 0.36); ctx.lineTo(s * 0.3, 0); ctx.closePath(); }, '#6a4a34', [-s * 0.3, -s * 0.36, s * 0.6, s * 0.36], -1);
      ctx.fillStyle = '#d8b88a'; ctx.beginPath(); ctx.ellipse(0, -s * 0.36, s * 0.24, s * 0.07, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(120,80,50,0.55)'; ctx.lineWidth = s * 0.008; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.ellipse(0, -s * 0.36, s * 0.05 * k, s * 0.014 * k, 0, 0, 7); ctx.stroke(); }
      if (st.axe) { ctx.save(); ctx.translate(s * 0.06, -s * 0.38); ctx.rotate(-0.5);
        PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.02, -s * 0.62, s * 0.04, s * 0.62); }, '#8a6440', [-s * 0.02, -s * 0.62, s * 0.04, s * 0.62], -1);
        PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.02, -s * 0.06); ctx.lineTo(s * 0.12, -s * 0.12); ctx.lineTo(s * 0.12, s * 0.06); ctx.lineTo(-s * 0.02, s * 0.02); ctx.closePath(); }, '#9aa3ad', [-s * 0.02, -s * 0.12, s * 0.14, s * 0.18], -1);
        ctx.restore(); }
      if (st.needles) { ctx.fillStyle = 'rgba(120,90,50,0.6)'; const r = R(7); for (let k = 0; k < 40; k++) ctx.fillRect((r() - 0.5) * s * 0.9, -r() * s * 0.04, s * 0.03, s * 0.005); }
    },
    axe(ctx, s) {
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.03, -s, s * 0.06, s); }, '#8a6440', [-s * 0.03, -s, s * 0.06, s], -1);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.03, -s * 0.95); ctx.lineTo(s * 0.22, -s * 1.02); ctx.lineTo(s * 0.22, -s * 0.74); ctx.lineTo(-s * 0.03, -s * 0.8); ctx.closePath(); }, '#9aa3ad', [-s * 0.03, -s * 1.02, s * 0.25, s * 0.3], -1);
    },
    cross(ctx, s, st) { // wooden grave cross with a small roof (Romanian style)
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.05, -s, s * 0.1, s); ctx.rect(-s * 0.32, -s * 0.78, s * 0.64, s * 0.09); }, '#6a4c38', [-s * 0.32, -s, s * 0.64, s], -1);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.98); ctx.lineTo(0, -s * 1.1); ctx.lineTo(s * 0.2, -s * 0.98); ctx.closePath(); }, '#4a3428', [-s * 0.2, -s * 1.1, s * 0.4, s * 0.12], -1);
      if (st.wreath) { ctx.save(); ctx.translate(0, -s * 0.6); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.28; ctx.fillStyle = k % 3 ? '#f3eee2' : '#7a9a52'; ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.12, Math.sin(a) * s * 0.12, s * 0.035, 0, 7); ctx.fill(); }
        ctx.strokeStyle = '#c8322e'; ctx.lineWidth = s * 0.02; ctx.beginPath(); ctx.moveTo(0, s * 0.1); ctx.quadraticCurveTo(s * 0.04, s * 0.25, -s * 0.02, s * 0.36); ctx.stroke(); ctx.restore(); }
      if (st.veil) { ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#f7f3ea'; ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.74); ctx.quadraticCurveTo(-s * 0.4, -s * 0.4, -s * 0.36 + Math.sin(st.t || 0) * 4, -s * 0.2); ctx.lineTo(-s * 0.22, -s * 0.3); ctx.quadraticCurveTo(-s * 0.26, -s * 0.55, -s * 0.18, -s * 0.72); ctx.closePath(); ctx.fill(); ctx.restore(); }
      PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(0, s * 0.02, s * 0.5, s * 0.07, 0, 0, 7); }, '#5d4a3a', [-s * 0.5, -s * 0.05, s, s * 0.1], -1); // grave mound
    },
    ribbon(ctx, s, st, t) { // a red ribbon held in a hand (hangs down)
      ctx.strokeStyle = '#c8322e'; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.sin(t * 2) * s * 0.1, s * 0.5, Math.sin(t * 2.4 + 1) * s * 0.15, s); ctx.stroke();
    },
    gown(ctx, s) { // white bridal gown held up by the shoulders
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.16, 0); ctx.lineTo(s * 0.16, 0); ctx.lineTo(s * 0.2, s * 0.25); ctx.quadraticCurveTo(s * 0.42, s * 0.8, s * 0.44, s); ctx.lineTo(-s * 0.44, s); ctx.quadraticCurveTo(-s * 0.42, s * 0.8, -s * 0.2, s * 0.25); ctx.closePath(); }, '#f4efe6', [-s * 0.44, 0, s * 0.88, s], -1);
      ctx.fillStyle = '#c8322e'; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.arc(k * s * 0.04, s * 0.12, s * 0.012, 0, 7); ctx.fill(); }
      ctx.strokeStyle = '#d9b45a'; ctx.lineWidth = s * 0.012; ctx.beginPath(); ctx.moveTo(-s * 0.2, s * 0.26); ctx.lineTo(s * 0.2, s * 0.26); ctx.stroke();
    },
    gate(ctx, s, st, t) { // carved wooden gate with a little shingle roof (s = width)
      const h = s * 1.15;
      PT.shade(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.5, -h, s * 0.1, h); ctx.rect(s * 0.4, -h, s * 0.1, h); ctx.rect(-s * 0.5, -h, s, s * 0.08); }, '#7a5638', [-s / 2, -h, s, h], -1);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.62, -h); ctx.lineTo(0, -h - s * 0.22); ctx.lineTo(s * 0.62, -h); ctx.closePath(); }, '#4a3428', [-s * 0.62, -h - s * 0.22, s * 1.24, s * 0.22], -1);
      ctx.strokeStyle = 'rgba(60,40,26,0.5)'; ctx.lineWidth = s * 0.008; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(-s * 0.45, -h * (0.2 + k * 0.13), s * 0.02, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(s * 0.45, -h * (0.2 + k * 0.13), s * 0.02, 0, 7); ctx.stroke(); }
      if (st.ribbons) for (let i = 0; i < 9; i++) { const x = -s * 0.4 + i * s * 0.1; ctx.strokeStyle = RIB[i % RIB.length]; ctx.lineWidth = s * 0.018; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, -h + s * 0.08); ctx.quadraticCurveTo(x + Math.sin(t * 2 + i) * s * 0.02, -h + s * 0.2, x + Math.sin(t * 2.3 + i) * s * 0.03, -h + s * (0.28 + (i % 3) * 0.05)); ctx.stroke(); }
    },
  };

  // ---------- cast ----------
  const lad = (o) => Object.assign({ rel: 1.02, build: 'slim', head: 0.23, headW: 0.86, jaw: 0.86, leg: 0.45, shoulder: 0.23, hip: 0.16, limb: 0.036,
    skin: '#e6b48e', blush: '#e48b78', iris: '#5a3a26', brow: '#2a1d18',
    bottom: { type: 'pants', color: '#e9e2d3' }, shoe: '#6b4a32', sole: '#3e2a1e' }, o);
  const cast = {
    ana: { name: 'Ana', rel: 0.95, build: 'slim', head: 0.24, headW: 0.84, jaw: 0.76, leg: 0.45, shoulder: 0.19, hip: 0.16, limb: 0.032,
      skin: '#f0c9a8', blush: '#f08a80', iris: '#5d7a4a', brow: '#3a2219',
      hair: { type: 'long', color: '#4a2a1c', hi: '#94603c' }, hat: { type: 'wreath', color: '#d9a441' },
      top: { type: 'tunic', color: '#f3ead8', inner: '#c8322e', trim: '#c8322e' },
      bottom: { type: 'skirt', color: '#2b2a3a', len: 0.85 }, shoe: '#4a3530', sole: '#2f2320' },
    ana_bride: { name: 'Ana (bride)', rel: 0.95, build: 'slim', head: 0.24, headW: 0.84, jaw: 0.76, leg: 0.45, shoulder: 0.19, hip: 0.16, limb: 0.032,
      skin: '#ead2c2', blush: '#e2a7a0', iris: '#5d7a4a', brow: '#3a2219',
      hair: { type: 'long', color: '#4a2a1c', hi: '#94603c' }, hat: { type: 'veil', color: '#f7f3ea' },
      top: { type: 'robe', color: '#f4efe6', inner: '#f4efe6', trim: '#d9b45a' },
      bottom: { type: 'robe', color: '#f4efe6' }, shoe: '#efe6d6', sole: '#cfc4b0' },
    mama: { name: 'Mama', rel: 0.9, build: 'round', head: 0.26, headW: 0.9, jaw: 0.86, leg: 0.36, shoulder: 0.23, hip: 0.26, limb: 0.04,
      skin: '#e0b090', blush: '#d98a78', iris: '#4a3022', brow: '#3a2a24',
      hair: { type: 'bun', color: '#3a2a24', hi: '#6a5244' }, hat: { type: 'hood', color: '#24212b' },
      top: { type: 'shawl', color: '#2a2632', inner: '#3a3442' },
      bottom: { type: 'skirt', color: '#2e2b38', len: 0.92 }, shoe: '#3a2a22', sole: '#241a15' },
    baba: { name: 'Baba', rel: 0.76, build: 'round', head: 0.28, headW: 0.92, jaw: 0.86, leg: 0.32, shoulder: 0.24, hip: 0.3, limb: 0.042,
      skin: '#d8a888', blush: '#d98272', iris: '#4a3022', brow: '#d8d2d0',
      hair: { type: 'bun', color: '#d8d4dc', hi: '#ffffff' }, hat: { type: 'hood', color: '#ece6da' },
      top: { type: 'shawl', color: '#7a2e2a', inner: '#efe2c8' },
      bottom: { type: 'skirt', color: '#2f2a36', len: 0.92 }, shoe: '#3a2a22', sole: '#241a15' },
    ion: lad({ name: 'Ion', hair: { type: 'messy', color: '#221a18', hi: '#5a4a40' }, 
      top: { type: 'tunic', color: '#f1ead9', inner: '#c8322e', trim: '#c8322e' } }),
    petru: lad({ name: 'Petru', rel: 1.07, build: 'broad', shoulder: 0.28, hip: 0.22, limb: 0.043, jaw: 1.0, skin: '#d9a07a', moustache: '#3a2a20',
      hair: { type: 'buzz', color: '#3a2a20', hi: '#6a5040' }, hat: { type: 'cap', color: '#6a4a32' },
      top: { type: 'jacket', color: '#8a6a48', inner: '#f1ead9' } }),
    vasile: lad({ name: 'Vasile', rel: 0.98, skin: '#efc6a2', iris: '#4f6a86', hair: { type: 'messy', color: '#7a4e2e', hi: '#b07a4e' },
      top: { type: 'tunic', color: '#f1ead9', inner: '#2f62b0', trim: '#2f62b0' } }),
  };

  // ---------- sets ----------
  const DUSK_LIGHT = { dir: -1, rim: '#ffcf96', rimA: 0.9, key: 'rgba(255,220,180,0.35)', shade: 'rgba(60,50,100,0.5)', ao: 'rgba(50,30,44,0.32)' };
  function mountains(c, L, base, cols, seed) {
    P.wash(c, () => P.ridge(c, CX, CX + CW, base, 380, 0.0016, seed), cols[0], cols[1], { span: [base - 500, base + 200] });
    const r = R(seed + 1); for (let i = 0; i < 70; i++) { const x = CX + r() * CW, y = base + 60 + r() * 260; fir(c, x, y, 70 + r() * 70, { col: cols[2], rim: false, tiers: 5 }); }
  }
  function church(c, x, y, s, wall, roof) { // wooden church with a tall spire
    P.wash(c, () => { c.beginPath(); c.rect(x - s * 0.3, y - s * 0.55, s * 0.6, s * 0.55); }, tint(wall, 0.1), tint(wall, -0.2), { span: [y - s * 0.55, y] });
    P.wash(c, () => { c.beginPath(); c.moveTo(x - s * 0.42, y - s * 0.5); c.lineTo(x, y - s * 0.9); c.lineTo(x + s * 0.42, y - s * 0.5); c.closePath(); }, tint(roof, 0.1), tint(roof, -0.2), { span: [y - s * 0.9, y - s * 0.5] });
    P.wash(c, () => { c.beginPath(); c.rect(x - s * 0.08, y - s * 1.15, s * 0.16, s * 0.4); }, tint(wall, 0), tint(wall, -0.2), { span: [y - s * 1.15, y - s * 0.75] });
    P.wash(c, () => { c.beginPath(); c.moveTo(x - s * 0.11, y - s * 1.12); c.lineTo(x, y - s * 1.75); c.lineTo(x + s * 0.11, y - s * 1.12); c.closePath(); }, tint(roof, 0.1), tint(roof, -0.25), { span: [y - s * 1.75, y - s * 1.12] });
    c.fillStyle = tint(roof, -0.3); c.fillRect(x - 3, y - s * 1.88, 6, s * 0.14); c.fillRect(x - s * 0.04, y - s * 1.84, s * 0.08, 5);
  }
  const loc = {
    carp_village: { // Carpathian village: wooden houses, steep dark roofs, wooden church, fir mountains
      light: DUSK_LIGHT, grade: { tint: '#ffcf98', a: 0.22, bloom: 0.3 }, sun: { x: 140, y: 560, r: 55 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#93abc8', '#d6c6c2', '#f6d2a8', '#fbe2c0'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.cloud(c, 820, 300, 280, L, 401); P.cloud(c, -250, 380, 220, L, 402);
        P.rays(c, L.sun.x, L.sun.y, 12, 1400, 1.0, 0.7, 0.09, 4);
        mountains(c, L, 1000, ['#8c94ae', '#a7a6b8', '#6f7f86'], 403);
        P.haze(c, 900, 1350, '#f4d4b2', 0.55);
      },
      mid(c, L) {
        const r = R(404), walls = ['#a07a58', '#8d6a4c', '#b08a66'], roofs = ['#4a3a34', '#3e3230', '#55433a'];
        church(c, 980, 1380, 420, '#8a6a4c', '#3e3230');
        let x = CX + 60; while (x < CX + CW) { if (x > 760 && x < 1220) { x += 100; continue; } const w = 200 + r() * 110, h = 220 + r() * 120;
          P.house(c, x, 1460, w, h, walls[(r() * 3) | 0], roofs[(r() * 3) | 0], L, (r() * 1e4) | 0); x += w + 40 + r() * 60; }
        c.strokeStyle = 'rgba(90,64,44,0.75)'; c.lineWidth = 7; for (let k = 0; k < 60; k++) { const fx = CX + k * 38; c.beginPath(); c.moveTo(fx, 1470); c.lineTo(fx, 1400); c.stroke(); }
        c.lineWidth = 6; c.beginPath(); c.moveTo(CX, 1420); c.lineTo(CX + CW, 1420); c.moveTo(CX, 1445); c.lineTo(CX + CW, 1445); c.stroke();
        P.haze(c, 1100, 1480, '#f2d0ae', 0.22);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, CH); }, '#b8a27c', '#8a7658', { span: [1440, 2400] });
        P.wash(c, () => { c.beginPath(); c.ellipse(540, 1640, 800, 130, 0, 0, 7); }, '#d4bf98', '#bca37f', { span: [1520, 1770], blur: 6 });
        P.grass(c, CX, CX + CW, 1440, 50, '#8a9a5c', 405, 260); P.grass(c, CX, CX + CW, 1780, 500, '#7d8f50', 406, 200);
      },
    },
    fir_mountain: { // dawn on a fir slope, sun rising on the right
      light: { dir: 1, rim: '#ffd7a0', rimA: 0.95, key: 'rgba(255,226,190,0.4)', shade: 'rgba(70,60,120,0.45)', ao: 'rgba(50,30,44,0.3)' },
      grade: { tint: '#ffcf9e', a: 0.22, bloom: 0.38 }, sun: { x: 860, y: 820, r: 60 }, live: 'motes',
      far(c, L) {
        P.sky(c, ['#8fa4c8', '#d9b9c2', '#f8c9a2', '#fde0b8'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r);
        P.cloud(c, 260, 360, 260, L, 501); P.cloud(c, 1350, 420, 240, L, 502);
        P.rays(c, L.sun.x, L.sun.y, 16, 1600, 1.4, 2.4, 0.11, 5);
        mountains(c, L, 1020, ['#9b9cb8', '#c1b3bd', '#7b8a94'], 503);
        P.haze(c, 900, 1300, '#fbd8b4', 0.6);
      },
      mid(c, L) {
        P.wash(c, () => P.ridge(c, CX, CX + CW, 1330, 140, 0.002, 504), '#7f9466', '#5f774e', { span: [1150, 1500] });
        const r = R(505); for (let i = 0; i < 16; i++) { const x = CX + 60 + i * 140 + r() * 60; if (x > 300 && x < 800) continue; fir(c, x, 1420 + r() * 40, 380 + r() * 260, { col: '#2f5a44' }); }
        P.haze(c, 1200, 1480, '#f8d6b2', 0.25);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.moveTo(CX, 1440); for (let x = CX; x <= CX + CW; x += 20) c.lineTo(x, 1440 - (x - 540) * 0.04 + Math.sin(x * 0.005) * 14); c.lineTo(CX + CW, CY + CH); c.lineTo(CX, CY + CH); c.closePath(); }, '#9aac68', '#62773e', { span: [1420, 2300] });
        P.grass(c, CX, CX + CW, 1430, 80, '#8ea35c', 506, 500); P.flowers(c, CX, CX + CW, 1460, 80, ['#fff3d6', '#c9a6e6', '#f6c94a'], 507, 50);
        P.grass(c, CX, CX + CW, 1760, 500, '#6f8846', 508, 400);
      },
    },
    wake_room: { // inside the house at night: wooden walls, embroidered towels, an icon corner, candle light
      light: { dir: 1, rim: '#ffcf8a', rimA: 0.8, key: 'rgba(255,200,140,0.35)', shade: 'rgba(40,30,60,0.55)', ao: 'rgba(30,20,30,0.4)' },
      grade: { tint: '#ffbf80', a: 0.2, bloom: 0.4 }, sun: { x: 800, y: 900, r: 0 }, live: 'motes',
      far(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, CY, CW, CH); }, '#4a3426', '#6a4a34', { span: [CY, 1500], edge: 0 });
        c.strokeStyle = 'rgba(30,18,12,0.35)'; c.lineWidth = 5; for (let y = 0; y < 1500; y += 95) { c.beginPath(); c.moveTo(CX, y); c.lineTo(CX + CW, y + 6); c.stroke(); }
        // window with night outside
        P.wash(c, () => { c.beginPath(); c.rect(80, 420, 280, 360); }, '#1f2650', '#4a5590', { span: [420, 780] });
        c.fillStyle = '#f6f1de'; c.beginPath(); c.arc(270, 500, 32, 0, 7); c.fill();
        c.strokeStyle = '#3a281c'; c.lineWidth = 18; c.strokeRect(80, 420, 280, 360); c.lineWidth = 10; c.beginPath(); c.moveTo(220, 420); c.lineTo(220, 780); c.moveTo(80, 600); c.lineTo(360, 600); c.stroke();
        // embroidered towels (stergare) over the window and on the wall
        for (const [x, y, w] of [[50, 380, 340], [600, 300, 380], [-420, 330, 380], [1260, 330, 380]]) {
          c.fillStyle = '#efe6d2'; c.fillRect(x, y, w, 30); c.fillRect(x, y, 34, 260); c.fillRect(x + w - 34, y, 34, 260);
          c.fillStyle = '#b8322e'; for (let k = 0; k < w / 22; k++) { c.fillRect(x + k * 22 + 4, y + 10, 10, 10); } for (let k = 0; k < 10; k++) { c.fillRect(x + 12, y + 40 + k * 22, 10, 10); c.fillRect(x + w - 22, y + 40 + k * 22, 10, 10); } }
        // icon in the corner, small shelf
        P.wash(c, () => { c.beginPath(); c.rect(700, 360, 180, 230); }, '#d9b45a', '#a8803a', { span: [360, 590] });
        P.wash(c, () => { c.beginPath(); c.ellipse(790, 450, 50, 60, 0, 0, 7); }, '#f3e2b0', '#d9b878', { span: [390, 510] });
      },
      mid(c, L) {
        // warm candle-glow pool on the back wall
        c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(560, 1200, 0, 560, 1200, 700); g.addColorStop(0, 'rgba(255,170,90,0.35)'); g.addColorStop(1, 'rgba(255,150,80,0)'); c.fillStyle = g; c.fillRect(-200, 400, 1500, 1500); c.restore();
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1450, CW, CH); }, '#5a3e2c', '#3a281c', { span: [1450, 2400] });
        c.strokeStyle = 'rgba(25,15,10,0.35)'; c.lineWidth = 4; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(CX, 1460 + k * k * 9); c.lineTo(CX + CW, 1460 + k * k * 9); c.stroke(); }
        P.wash(c, () => { c.beginPath(); c.ellipse(560, 1640, 620, 120, 0, 0, 7); }, '#a8343a', '#7a2428', { span: [1520, 1760], blur: 5 }); // woven rug
        c.strokeStyle = 'rgba(240,220,190,0.4)'; c.lineWidth = 6; c.beginPath(); c.ellipse(560, 1640, 560, 100, 0, 0, 7); c.stroke();
      },
    },
    cemetery: { // village cemetery on a hill at dusk, wooden church behind
      light: { dir: -1, rim: '#f0b890', rimA: 0.85, key: 'rgba(255,200,170,0.3)', shade: 'rgba(40,40,90,0.55)', ao: 'rgba(30,20,40,0.4)' },
      grade: { tint: '#c99ab0', a: 0.22, bloom: 0.34 }, sun: { x: 120, y: 980, r: 50 },
      far(c, L) {
        P.sky(c, ['#3d4370', '#7a6c94', '#d29a9a', '#f0bf9a'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r, 'rgba(255,190,150,0.7)');
        P.cloud(c, 800, 420, 260, L, 601, { lit: '#f0c0b0', mid: '#a88aa8', dark: '#5a5480' });
        mountains(c, L, 1080, ['#4c4d72', '#6a6488', '#3a4a58'], 602);
        P.haze(c, 1000, 1350, '#c79aa8', 0.5);
      },
      mid(c, L) {
        church(c, 860, 1350, 380, '#5a4434', '#2e2428');
        const r = R(603); for (let i = 0; i < 12; i++) { const x = CX + 120 + i * 180 + r() * 50; if (x > 300 && x < 760) continue; const s = 130 + r() * 50, y = 1400 + r() * 50;
          c.fillStyle = '#3e2e26'; c.fillRect(x - 6, y - s, 12, s); c.fillRect(x - s * 0.3, y - s * 0.78, s * 0.6, 10); c.beginPath(); c.moveTo(x - s * 0.18, y - s * 0.96); c.lineTo(x, y - s * 1.08); c.lineTo(x + s * 0.18, y - s * 0.96); c.fill(); }
        fir(c, -260, 1440, 520, { col: '#24423a' }); fir(c, 1250, 1440, 600, { col: '#24423a' });
        P.haze(c, 1250, 1480, '#b890a6', 0.25);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.moveTo(CX, 1450); for (let x = CX; x <= CX + CW; x += 20) c.lineTo(x, 1450 + Math.sin(x * 0.003) * 20); c.lineTo(CX + CW, CY + CH); c.lineTo(CX, CY + CH); c.closePath(); }, '#5f6a4c', '#3a4232', { span: [1440, 2300] });
        P.grass(c, CX, CX + CW, 1440, 80, '#6a7a52', 604, 400); P.grass(c, CX, CX + CW, 1760, 500, '#4f5e3c', 605, 300);
      },
    },
  };

  window.CUSTOM = { cast, props: PROPS, loc };
})();
