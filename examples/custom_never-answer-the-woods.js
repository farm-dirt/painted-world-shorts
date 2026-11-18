// Never Answer the Woods (painted-world) — original sets + props: Appalachian ridge campsite at night,
// the dark tree line, inside the tent. Painted with PT.PAINT / PT.shade (no ink lines).
(function () {
  const PT = window.PT, P = PT.PAINT, tint = PT.tint;
  const CX = -540, CY = -480, CW = 2160, CH = 2880;
  const R = (s) => PT.noise.rng(s);
  const LS = () => ((PT.LIGHT || PT.DEF_LIGHT).dir || 1);
  PT.FACES.snore = { brow: 'flat', mouth: 'O', eye: 1.0, lid: 1 };   // eyes shut, mouth open

  // painted pine (layered tiers, lit on the moon side)
  function pine(c, x, y, s, col, o) {
    o = o || {}; const ls = LS(), n = o.tiers || 6, w = s * (o.w || 0.4);
    c.fillStyle = tint(col, -0.25); c.fillRect(x - s * 0.02, y - s * 0.14, s * 0.04, s * 0.14);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), ty = y - s * (0.98 - u * 0.8), by = ty + s * 0.26, hw = w * (0.14 + u * 0.86) * 0.5;
      const path = () => { c.beginPath(); c.moveTo(x, ty); c.quadraticCurveTo(x + hw * 0.5, ty + s * 0.12, x + hw, by);
        for (let k = 0; k <= 6; k++) c.lineTo(x + hw - (k / 6) * hw * 2, by + (k % 2 ? -s * 0.02 : s * 0.01));
        c.quadraticCurveTo(x - hw * 0.5, ty + s * 0.12, x, ty); c.closePath(); };
      const g = c.createLinearGradient(x - hw, 0, x + hw, 0), lit = tint(col, 0.3), dk = tint(col, -0.35);
      g.addColorStop(0, ls < 0 ? lit : dk); g.addColorStop(0.55, col); g.addColorStop(1, ls < 0 ? dk : lit);
      path(); c.fillStyle = g; c.fill();
      if (o.rim) { c.save(); path(); c.clip(); c.fillStyle = o.rim; c.fillRect(ls > 0 ? x + hw * 0.6 : x - hw, ty, hw * 0.4, s * 0.3); c.restore(); }
    }
  }
  function stars(c, seed, n, y1) { const r = R(seed); c.fillStyle = '#fff4d8'; for (let i = 0; i < n; i++) { c.globalAlpha = 0.3 + r() * 0.7; c.beginPath(); c.arc(CX + r() * CW, CY + r() * (y1 - CY), 0.8 + r() * 2.4, 0, 7); c.fill(); } c.globalAlpha = 1; }
  function moon(c, x, y, r) {
    const g = c.createRadialGradient(x, y, 0, x, y, r * 7); g.addColorStop(0, 'rgba(220,230,255,0.5)'); g.addColorStop(1, 'rgba(200,210,255,0)');
    c.fillStyle = g; c.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
    c.fillStyle = '#f6f1de'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.fillStyle = 'rgba(200,196,180,0.35)'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, 7); c.arc(x + r * 0.3, y + r * 0.3, r * 0.15, 0, 7); c.fill();
  }
  const NIGHT_LIGHT = { dir: -1, rim: '#bcd4ff', rimA: 0.9, key: 'rgba(255,190,130,0.32)', shade: 'rgba(20,24,70,0.55)', ao: 'rgba(10,12,40,0.4)' };

  const LOCS = {
    // Appalachian ridges under the moon, a clearing with pines; the dark woods thicken to the right
    ridge_camp: {
      light: NIGHT_LIGHT, grade: { tint: '#7d8fd0', a: 0.2, bloom: 0.45 }, sun: { x: 250, y: 380, r: 70 }, live: 'fireflies', night: true,
      far(c, L) {
        P.sky(c, ['#1c2250', '#2f3a72', '#4f5a92', '#7d7ba6'], L); stars(c, 301, 170, 1000); moon(c, 250, 380, 70);
        P.cloud(c, 820, 560, 230, L, 302, { lit: '#b9c1e2', mid: '#7d86b6', dark: '#454c7a' });
        // the long rolling Appalachian ridges, layer after layer, fading into haze
        const rid = [[980, 120, 0.0021, 303, '#465186', '#525c90'], [1080, 110, 0.0027, 304, '#3d477a', '#48528a'], [1190, 100, 0.0032, 305, '#343e6e', '#3e4880']];
        for (const [y, a, f, sd, t1, t2] of rid) { P.wash(c, () => P.ridge(c, CX, CX + CW, y, a, f, sd), t1, t2, { span: [y - a, 1500] }); P.haze(c, y - 40, y + 120, '#7c80b0', 0.35); }
      },
      mid(c, L) {
        const r = R(306);
        for (const [x, s] of [[-420, 900], [-240, 760], [-60, 640]]) pine(c, x, 1470, s, '#2c3f5c', { rim: 'rgba(190,210,255,0.18)' });
        // dense woods on the right (where the voice lives)
        for (let i = 0; i < 9; i++) pine(c, 640 + i * 150 + r() * 60, 1480, 820 + r() * 380, i % 2 ? '#202f4a' : '#24344f', { rim: 'rgba(190,210,255,0.12)' });
        P.haze(c, 1200, 1500, '#5c6396', 0.45);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1440, CW, CH); }, '#3c4a62', '#252d48', { span: [1440, 2400] });
        P.grass(c, CX, CX + CW, 1440, 40, '#34465c', 307, 220);
      },
    },
    // close on the tree line: tall dark trunks, mist, moon glow through the gaps
    deep_woods: {
      light: NIGHT_LIGHT, grade: { tint: '#6f84c8', a: 0.22, bloom: 0.42 }, sun: { x: 820, y: 300, r: 0 }, live: 'motes', night: true,
      far(c, L) {
        P.sky(c, ['#182046', '#25305e', '#36417a', '#4a5288'], L); stars(c, 311, 60, 600);
        const g = c.createRadialGradient(820, 300, 0, 820, 300, 700); g.addColorStop(0, 'rgba(200,215,255,0.35)'); g.addColorStop(1, 'rgba(200,215,255,0)'); c.fillStyle = g; c.fillRect(100, -400, 1500, 1400);
        const r = R(312); for (let i = 0; i < 20; i++) { const x = CX + r() * CW, w = 40 + r() * 60; P.wash(c, () => { c.beginPath(); c.rect(x, CY, w, CH); }, '#2e3866', '#36406e', { edge: 0 }); }
        P.haze(c, 600, 1500, '#5b6398', 0.4);
      },
      mid(c, L) {
        const r = R(313);
        for (let i = 0; i < 9; i++) { const x = CX + 80 + i * 250 + r() * 80, w = 70 + r() * 70; P.wash(c, () => { c.beginPath(); c.rect(x, CY, w, CH); }, '#1d2442', '#252d50', { edge: 0 });
          c.fillStyle = 'rgba(180,200,255,0.10)'; c.fillRect(x + w * 0.72, CY, w * 0.28, CH); }
        for (let i = 0; i < 4; i++) pine(c, CX + 200 + i * 520, 1480, 1300, '#1b2742');
        P.haze(c, 1150, 1500, '#6a70a2', 0.5);
      },
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1450, CW, CH); }, '#2e3a54', '#1c2238', { span: [1450, 2400] });
        P.grass(c, CX, CX + CW, 1450, 50, '#2b3a50', 314, 260);
      },
    },
    // inside the tent at night: orange canvas walls lit dim, the door flap in the middle (night outside)
    tent_in: {
      light: { dir: 1, rim: '#ffcf8a', rimA: 0.6, key: 'rgba(255,190,130,0.28)', shade: 'rgba(40,24,50,0.55)', ao: 'rgba(30,16,26,0.45)' },
      grade: { tint: '#d98a5a', a: 0.18, bloom: 0.35 }, sun: { x: 540, y: 400, r: 0 }, live: 'motes',
      far(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, CY, CW, CH); }, '#5a3428', '#7a4630', { span: [CY, 1500], edge: 0 });
        // back wall triangle (lit canvas) with seams
        P.wash(c, () => { c.beginPath(); c.moveTo(-500, 1600); c.lineTo(540, 60); c.lineTo(1580, 1600); c.closePath(); }, '#a85e36', '#c87a48', { span: [60, 1600] });
        c.strokeStyle = 'rgba(70,34,22,0.35)'; c.lineWidth = 5; for (const x of [140, 940]) { c.beginPath(); c.moveTo(540, 60); c.lineTo(x, 1600); c.stroke(); }
        // door: night outside (trees, moonlight), zipper down the middle
        c.save(); c.beginPath(); c.moveTo(300, 1520); c.lineTo(540, 620); c.lineTo(780, 1520); c.closePath(); c.clip();
        P.sky(c, ['#1a2148', '#2c3668', '#3c467c'], L);
        for (const x of [380, 520, 660]) { P.wash(c, () => { c.beginPath(); c.rect(x, 600, 46, 1000); }, '#141a34', '#1c2440', { edge: 0 }); }
        P.haze(c, 1200, 1520, '#4a5288', 0.5); c.restore();
        c.strokeStyle = 'rgba(60,30,20,0.6)'; c.lineWidth = 10; c.beginPath(); c.moveTo(300, 1520); c.lineTo(540, 620); c.lineTo(780, 1520); c.stroke();
        // rolled flaps on both sides
        for (const sx of [-1, 1]) { const x = 540 + sx * 250; P.wash(c, () => { c.beginPath(); c.ellipse(x, 1100, 40, 420, sx * -0.26, 0, 7); }, '#b86a3c', '#8a4a2a', { span: [680, 1520] }); }
        // hanging lantern (off)
        c.strokeStyle = '#3a2418'; c.lineWidth = 4; c.beginPath(); c.moveTo(540, 60); c.lineTo(540, 300); c.stroke();
        PT.shade(c, () => { c.beginPath(); c.roundRect(505, 300, 70, 90, 14); }, '#6a6070', [505, 300, 70, 90], 1);
      },
      mid(c, L) {},
      near(c, L) {
        P.wash(c, () => { c.beginPath(); c.rect(CX, 1480, CW, CH); }, '#4a2e28', '#2e1c1a', { span: [1480, 2400] });
        // two sleeping bags on the floor
        for (const [x, col] of [[-80, '#3f6a5e'], [1100, '#7a4a6a']]) P.wash(c, () => { c.beginPath(); c.roundRect(x - 230, 1560, 460, 110, 50); }, tint(col, 0.15), col, { span: [1560, 1670] });
      },
    },
  };

  const PROPS = {
    // two glowing eyes. open 0..1, auto-blink, look -1..1
    eyes(ctx, s, st, t) {
      const open = st.open ?? 1, ph = ((t || 0) + (st.seed || 0)) % 2.7;
      const bl = ph < 0.08 ? 1 - ph / 0.08 : ph < 0.2 ? (ph - 0.08) / 0.12 : 1, k = open * bl; if (k <= 0.02) return;
      const look = (st.look || 0) * s * 0.06;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.9); g.addColorStop(0, `rgba(255,220,110,${0.3 * k})`); g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g; ctx.fillRect(-s, -s, s * 2, s * 2); ctx.restore();
      for (const sx of [-1, 1]) {
        ctx.save(); ctx.translate(sx * s * 0.3, 0);
        const eg = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.19); eg.addColorStop(0, '#fff8c8'); eg.addColorStop(0.6, '#ffd65a'); eg.addColorStop(1, '#e8a030');
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.18, s * 0.14 * k, sx * -0.2, 0, 7); ctx.fillStyle = eg; ctx.fill();
        ctx.beginPath(); ctx.ellipse(look, 0, s * 0.035, s * 0.12 * k, 0, 0, 7); ctx.fillStyle = '#16122a'; ctx.fill();
        ctx.restore();
      }
    },
    // soft painted speech bubble. text, color, tail 'down'|'left'|'right', pop 0..1, dy (draw offset)
    bubble(ctx, s, st, t) {
      const pop = st.pop ?? 1; if (pop <= 0.01) return;
      const wob = Math.sin((t || 0) * 8) * 0.02;
      ctx.save(); ctx.translate(0, st.dy || 0); ctx.scale(pop * (1 + wob), pop * (1 - wob));
      const txt = st.text || '...'; ctx.font = `${Math.round(s * 0.34)}px Cap, Poppins, sans-serif`;
      const w = Math.max(s * 1.2, ctx.measureText(txt).width + s * 0.55), h = s * 0.72, col = st.color || '#ece4ff';
      const tx = st.tail === 'left' ? -w * 0.3 : st.tail === 'right' ? w * 0.3 : 0, tip = st.tail === 'left' ? -s * 0.3 : st.tail === 'right' ? s * 0.3 : 0;
      const path = () => { ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.45); ctx.moveTo(tx - s * 0.14, h / 2 - 2); ctx.lineTo(tx + tip, h / 2 + s * 0.32); ctx.lineTo(tx + s * 0.14, h / 2 - 2); ctx.closePath(); };
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.8); g.addColorStop(0, 'rgba(190,170,255,0.25)'); g.addColorStop(1, 'rgba(190,170,255,0)'); ctx.fillStyle = g; ctx.fillRect(-w, -w, w * 2, w * 2); ctx.restore();
      PT.shade(ctx, path, col, [-w / 2, -h / 2, w, h + s * 0.3], -1, { rim: 0.5 });
      ctx.fillStyle = st.ink || '#3a2f5c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, s * 0.02);
      ctx.restore();
    },
    // screen-space hook text (camera ignored)
    hooktext(ctx, s, st) {
      const pop = st.pop ?? 1; if (pop <= 0.01) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(st.sx || 470, st.sy || 600); ctx.scale(pop, pop); ctx.rotate(-0.03);
      ctx.font = `${Math.round(s)}px Cap, Poppins, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = s * 0.2; ctx.strokeStyle = '#1c1630'; ctx.strokeText(st.text, 0, 0); ctx.fillStyle = st.color || '#ffd23f'; ctx.fillText(st.text, 0, 0);
      ctx.restore();
    },
    // expanding sound rings out of the dark
    rings(ctx, s, st, t) {
      const a = st.a ?? 1; if (a <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { const q = (((t || 0) * 0.7) + i / 3) % 1; ctx.globalAlpha = a * (1 - q) * 0.6;
        ctx.beginPath(); ctx.ellipse(0, 0, s * (0.3 + q), s * (0.2 + q * 0.6), 0, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = st.color || '#c8bcff'; ctx.stroke(); }
      ctx.restore();
    },
    // A-frame canvas tent (s = width). glow 0..1 = lantern light inside
    tent(ctx, s, st) {
      const w = s, h = s * 0.72, glow = st.glow ?? 0, ls = LS();
      if (glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -h * 0.35, 0, 0, -h * 0.35, w * 0.9); g.addColorStop(0, `rgba(255,190,110,${0.35 * glow})`); g.addColorStop(1, 'rgba(255,170,90,0)'); ctx.fillStyle = g; ctx.fillRect(-w, -h * 1.4, w * 2, h * 1.6); ctx.restore(); }
      const body = () => { ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(0, -h); ctx.lineTo(w / 2, 0); ctx.closePath(); };
      PT.shade(ctx, body, glow > 0.5 ? '#e0904e' : '#a8643c', [-w / 2, -h, w, h], ls, { rim: 0.8 });
      const door = () => { ctx.beginPath(); ctx.moveTo(-w * 0.17, 0); ctx.lineTo(0, -h * 0.64); ctx.lineTo(w * 0.17, 0); ctx.closePath(); };
      ctx.fillStyle = glow > 0.5 ? `rgba(255,214,140,${0.6 + 0.4 * glow})` : '#2a2238'; door(); ctx.fill();
      ctx.strokeStyle = 'rgba(40,24,20,0.5)'; ctx.lineWidth = s * 0.008; ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(0, -h - s * 0.05); ctx.stroke();
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * w * 0.5, 0); ctx.lineTo(sx * w * 0.62, 6); ctx.stroke(); }
    },
    // campfire: stones, logs, flames, warm glow. flame 0..1
    campfire(ctx, s, st, t) {
      const f = st.flame ?? 1, tt = t || 0;
      if (f > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -s * 0.4, 0, 0, -s * 0.4, s * 3.2); g.addColorStop(0, `rgba(255,160,70,${0.45 * f})`); g.addColorStop(1, 'rgba(255,140,60,0)'); ctx.fillStyle = g; ctx.fillRect(-s * 3.2, -s * 3.6, s * 6.4, s * 6.4); ctx.restore(); }
      for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI; PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(Math.cos(a) * s * 0.55, s * 0.05 + Math.sin(a) * -s * 0.05, s * 0.14, s * 0.09, 0, 0, 7); }, '#6c6a78', [-s * 0.7, -s * 0.1, s * 1.4, s * 0.25], LS()); }
      for (const r of [-0.35, 0.35]) { ctx.save(); ctx.rotate(r); PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.5, -s * 0.09, s, s * 0.18, s * 0.09); }, '#6a4630', [-s * 0.5, -s * 0.09, s, s * 0.18], LS()); ctx.restore(); }
      if (f <= 0.02) return;
      const fl = (k, c1, c2, sc) => { const a = Math.sin(tt * 11 + k) * 0.08, hh = s * (1 + 0.16 * Math.sin(tt * 7.3 + k * 2)) * sc * f;
        const g = ctx.createLinearGradient(0, 0, 0, -hh); g.addColorStop(0, c1); g.addColorStop(1, c2);
        ctx.beginPath(); ctx.moveTo(-s * 0.3 * sc, -s * 0.04); ctx.quadraticCurveTo(-s * 0.4 * sc, -hh * 0.55, a * s, -hh); ctx.quadraticCurveTo(s * 0.4 * sc, -hh * 0.55, s * 0.3 * sc, -s * 0.04); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); };
      fl(0, '#ff7a2e', 'rgba(255,190,80,0.2)', 1); fl(2, '#ffd25a', 'rgba(255,240,180,0.3)', 0.6);
    },
    // flashlight (held). beam 0..1, len; points along +x
    flashlight(ctx, s, st) {
      const b = st.beam ?? 0;
      if (b > 0) { const L = (st.len || 700) * b; ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(s * 0.5, 0, L, 0); g.addColorStop(0, 'rgba(255,244,200,0.55)'); g.addColorStop(1, 'rgba(255,244,200,0)');
        ctx.beginPath(); ctx.moveTo(s * 0.45, -s * 0.12); ctx.lineTo(L, -L * 0.26); ctx.lineTo(L, L * 0.26); ctx.lineTo(s * 0.45, s * 0.12); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.restore(); }
      PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.35, -s * 0.1, s * 0.62, s * 0.2, s * 0.06); }, '#c94a3e', [-s * 0.35, -s * 0.1, s * 0.62, s * 0.2], -1);
      PT.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(s * 0.25, -s * 0.14); ctx.lineTo(s * 0.48, -s * 0.2); ctx.lineTo(s * 0.48, s * 0.2); ctx.lineTo(s * 0.25, s * 0.14); ctx.closePath(); }, '#b9bccb', [s * 0.25, -s * 0.2, s * 0.23, s * 0.4], -1);
      ctx.fillStyle = b > 0 ? '#fff6c8' : '#8c90a6'; ctx.beginPath(); ctx.ellipse(s * 0.48, 0, s * 0.035, s * 0.18, 0, 0, 7); ctx.fill();
    },
    // pool of flashlight light (screen 'lighter' glow)
    spot(ctx, s, st) {
      const a = st.a ?? 0.5; if (a <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s); g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, s, 0, 7); ctx.fill(); ctx.restore();
    },
    // blanket over a lying sleeper (s = width). lift 0..1 = pulled up and away
    blanket(ctx, s, st) {
      const up = st.lift || 0; if (up >= 0.98) return;
      ctx.save(); ctx.globalAlpha = 1 - up; ctx.translate(up * s * 0.1, -up * s * 0.5); ctx.rotate(-up * 0.3);
      const hk = st.hk || 0.3;
      PT.shade(ctx, () => { ctx.beginPath(); ctx.roundRect(-s / 2, -s * hk, s, s * hk + s * 0.08, s * 0.16); }, '#4f8a7c', [-s / 2, -s * hk, s, s * hk + s * 0.08], 1, { rim: 0.6 });
      ctx.strokeStyle = 'rgba(30,60,55,0.3)'; ctx.lineWidth = s * 0.012; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-s / 2 + i * s / 4, -s * hk + s * 0.04); ctx.lineTo(-s / 2 + i * s / 4, s * 0.06); ctx.stroke(); }
      ctx.restore();
    },
    pillow(ctx, s) { PT.shade(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -s * 0.15, s * 0.5, s * 0.2, 0, 0, 7); }, '#efe6d6', [-s * 0.5, -s * 0.35, s, s * 0.4], 1); },
  };

  window.CUSTOM = Object.assign(window.CUSTOM || {}, { loc: LOCS, props: PROPS });
})();
