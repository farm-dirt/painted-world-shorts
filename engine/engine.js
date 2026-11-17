// painted-world-shorts — scene engine.  PT.renderFrame(ctx, project, t)
// 100% deterministic: the picture at time t depends only on (project, t).
// That is what lets the browser preview and the final MP4 render be identical,
// and lets the renderer split frames across parallel workers.
(function (G) {
  const PT = G.PT;
  const { W, H, GROUND } = PT;

  // ---------- easing ----------
  const EASE = {
    linear: (x) => x,
    inout: (x) => x * x * (3 - 2 * x),
    in: (x) => x * x * x,
    out: (x) => 1 - Math.pow(1 - x, 3),
    back: (x) => { const c = 1.9; x -= 1; return 1 + (c + 1) * x * x * x + c * x * x; }, // overshoot
    snap: (x) => (x < 1 ? 0 : 1),
  };
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }

  // Interpolate a list of keyframes [{t, ...props, ease}] at time t (seconds, scene-local).
  // Numbers and number-arrays glide; strings/bools switch at the key time.
  function sampleKeys(keys, t, base) {
    const out = Object.assign({}, base || {});
    if (!keys || !keys.length) return out;
    // carry forward discrete values
    let i = 0;
    while (i < keys.length - 1 && keys[i + 1].t <= t) i++;
    for (let k = 0; k <= i; k++) for (const p in keys[k]) if (p !== 't' && p !== 'ease') out[p] = keys[k][p];
    if (t < keys[0].t) { for (const p in keys[0]) if (p !== 't' && p !== 'ease') out[p] = keys[0][p]; return out; }
    const a = keys[i], b = keys[i + 1];
    if (!b || t <= a.t) return out;
    const e = EASE[b.ease || 'inout'] || EASE.inout;
    const u = e(clamp01((t - a.t) / Math.max(1e-6, b.t - a.t)));
    for (const p in b) {
      if (p === 't' || p === 'ease') continue;
      const va = p in out ? out[p] : b[p], vb = b[p];
      if (typeof vb === 'number' && typeof va === 'number') out[p] = lerp(va, vb, u);
      else if (Array.isArray(vb) && Array.isArray(va)) out[p] = vb.map((v, j) => (typeof v === 'number' ? lerp(va[j] ?? v, v, u) : v));
      // discrete values switch at b.t (already handled by carry-forward once t >= b.t)
    }
    return out;
  }

  // ---------- voice envelope (drives mouth flaps) ----------
  function envAt(project, t) {
    const env = project.timing && project.timing.env; if (!env) return 0;
    const fps = project.timing.envFps || 30;
    const f = t * fps, i = Math.floor(f), u = f - i;
    return lerp(env[i] || 0, env[i + 1] || 0, u);
  }

  // ---------- camera ----------
  function cameraAt(scene, lt, project) {
    const cam = sampleKeys(scene.camera, lt, { x: 540, y: 960, zoom: 1, roll: 0 });
    // settle-in: tiny 6% push that eases out in the first 0.25 s of every shot (adds life to cuts)
    if (scene.settle !== false) cam.zoom *= 1 + 0.04 * Math.pow(1 - clamp01(lt / 0.3), 2);
    // slow cinematic float (a camera operator breathing), never a twitch
    if (scene.drift !== false) { cam.x += 4 * Math.sin(lt * 0.45 + 1.3); cam.y += 3 * Math.sin(lt * 0.37); }
    // shakes
    for (const fx of scene.fx || []) {
      if (fx.type !== 'shake') continue;
      const d = lt - fx.t, dur = fx.dur || 0.35;
      if (d >= 0 && d < dur) {
        const a = (fx.amp || 18) * (1 - d / dur);
        cam.x += a * Math.sin(d * 63); cam.y += a * 0.7 * Math.cos(d * 51);
      }
    }
    return cam;
  }
  function applyCamera(ctx, cam) {
    ctx.translate(W / 2, H / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.rotate((cam.roll || 0) * Math.PI / 180);
    ctx.translate(-cam.x, -cam.y);
  }

  // ---------- actors ----------
  function actorPose(project, scene, actor, lt, gt, idx) {
    const seed = idx * 7.31 + (actor.who.length * 3.1);
    const st = sampleKeys(actor.keys, lt, Object.assign({ x: 540, y: GROUND + 60, h: 820 }, actor));
    const pose = {};
    for (const k of ['facing', 'view', 'lean', 'headTilt', 'look', 'face', 'squash', 'armL', 'armR', 'hop', 'legSpread']) if (k in st) pose[k] = st[k];
    // walking: leg phase from distance travelled (feet never skate)
    if (st.walk) {
      const x0 = (actor.keys && actor.keys[0] && actor.keys[0].x) ?? st.x;
      pose.walk = Math.abs(st.x - x0) / (st.h * 0.075);
      pose.hop = (pose.hop || 0) + Math.abs(Math.sin(pose.walk)) * st.h * 0.012;
      pose.facing = pose.facing ?? (st.x >= x0 ? 1 : -1);
      if (!pose.view) pose.view = 'side';
    }
    // idle life: slow breathing + slow head drift (no fast sines -> no twitch)
    pose.squash = (pose.squash || 1) * (1 + 0.012 * Math.sin(gt * 2.1 + seed));
    pose.headTilt = (pose.headTilt || 0) + 0.035 * Math.sin(gt * 1.3 + seed);
    // blinks: ~every 2.5-4.5 s, 0.12 s long
    const period = 2.5 + hash(seed) * 2, ph = (gt + hash(seed + 1) * period) % period;
    pose.blink = ph < 0.12 ? Math.sin((ph / 0.12) * Math.PI) : 0;
    // talking: mouth follows the voice envelope while this actor speaks
    const spk = (actor.speaks || []).some(([a, b]) => lt >= a && lt <= b);
    if (spk) {
      pose.talk = clamp01(envAt(project, gt) * 1.4);
      if (!st.face || st.face === 'neutral' || st.face === 'happy') pose.face = 'talk';
      pose.headTilt += 0.03 * pose.talk;
    }
    return { st, pose };
  }

  // ---------- props ----------
  // Props are drawn at (0,0) = their base, size s. Shaded like the characters (no ink lines).
  const sh = (ctx, fn, col, box, o) => PT.shade(ctx, fn, col, box, (PT.LIGHT || PT.DEF_LIGHT).dir, o);
  const PROPS = {
    coin(ctx, s) { sh(ctx, () => PT.ellipse(ctx, 0, -s * 0.5, s * 0.5, s * 0.5), '#e8b84a', [-s / 2, -s, s, s]); ctx.strokeStyle = 'rgba(120,80,20,0.4)'; ctx.lineWidth = s * 0.04; PT.ellipse(ctx, 0, -s * 0.5, s * 0.34, s * 0.34); ctx.stroke(); },
    box(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.rect(-s / 2, -s * 0.8, s, s * 0.8); }, '#c9965e', [-s / 2, -s * 0.8, s, s * 0.8]); ctx.fillStyle = 'rgba(90,60,30,0.3)'; ctx.fillRect(-s / 2, -s * 0.58, s, s * 0.06); },
    sign(ctx, s, p) {
      sh(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.04, -s * 1.1, s * 0.08, s * 1.1); }, '#8a6a4a', [-s * 0.04, -s * 1.1, s * 0.08, s * 1.1]);
      sh(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.6, -s * 1.3, s * 1.2, s * 0.5, s * 0.04); }, '#efe3c8', [-s * 0.6, -s * 1.3, s * 1.2, s * 0.5]);
      ctx.fillStyle = '#4a3530'; ctx.font = `${Math.round(s * 0.2)}px Cap, Poppins, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text || '', 0, -s * 1.05);
    },
    lantern(ctx, s, p, t) {
      const g = ctx.createRadialGradient(0, -s * 0.45, 0, 0, -s * 0.45, s * 1.6); g.addColorStop(0, 'rgba(255,200,120,0.55)'); g.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = g; ctx.fillRect(-s * 1.6, -s * 2.05, s * 3.2, s * 3.2);
      sh(ctx, () => PT.ellipse(ctx, 0, -s * 0.45, s * 0.3, s * 0.4), p.color || '#e2574a', [-s * 0.3, -s * 0.85, s * 0.6, s * 0.8], { rim: 0.3 });
      ctx.fillStyle = `rgba(255,236,170,${0.75 + 0.2 * Math.sin((t || 0) * 9)})`; PT.ellipse(ctx, 0, -s * 0.45, s * 0.14, s * 0.22); ctx.fill();
      ctx.fillStyle = '#3a2a22'; ctx.fillRect(-s * 0.16, -s * 0.9, s * 0.32, s * 0.07); ctx.fillRect(-s * 0.16, -s * 0.06, s * 0.32, s * 0.07);
    },
    book(ctx, s, p) { sh(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.4, -s * 0.55, s * 0.8, s * 0.55, s * 0.03); }, p.color || '#6b3a2e', [-s * 0.4, -s * 0.55, s * 0.8, s * 0.55]); ctx.fillStyle = '#efe3c8'; ctx.fillRect(-s * 0.36, -s * 0.06, s * 0.72, s * 0.05); ctx.fillStyle = 'rgba(232,184,74,0.8)'; ctx.fillRect(-s * 0.12, -s * 0.42, s * 0.24, s * 0.05); },
    scroll(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.35, -s * 0.9, s * 0.7, s * 0.8); }, '#efe0c0', [-s * 0.35, -s * 0.9, s * 0.7, s * 0.8], { rim: 0.4 }); for (const y of [-s * 0.95, -s * 0.12]) sh(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.42, y, s * 0.84, s * 0.1, s * 0.05); }, '#8a6a4a', [-s * 0.42, y, s * 0.84, s * 0.1]); ctx.strokeStyle = 'rgba(90,60,40,0.4)'; ctx.lineWidth = s * 0.02; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-s * 0.25, -s * 0.75 + i * s * 0.12); ctx.lineTo(s * 0.2, -s * 0.75 + i * s * 0.12); ctx.stroke(); } },
    chest(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.rect(-s / 2, -s * 0.55, s, s * 0.55); }, '#8a5634', [-s / 2, -s * 0.55, s, s * 0.55]); sh(ctx, () => { ctx.beginPath(); ctx.moveTo(-s / 2, -s * 0.55); ctx.quadraticCurveTo(0, -s * 0.95, s / 2, -s * 0.55); ctx.closePath(); }, '#9c6640', [-s / 2, -s * 0.9, s, s * 0.35]); sh(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.08, -s * 0.5, s * 0.16, s * 0.18); }, '#e8b84a', [-s * 0.08, -s * 0.5, s * 0.16, s * 0.18]); },
    phone(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.25, -s * 0.45, s * 0.5, s * 0.9, s * 0.07); }, '#2c2f3e', [-s * 0.25, -s * 0.45, s * 0.5, s * 0.9]); const g = ctx.createLinearGradient(0, -s * 0.37, 0, s * 0.3); g.addColorStop(0, '#bfe6f2'); g.addColorStop(1, '#7fb6d6'); ctx.fillStyle = g; ctx.fillRect(-s * 0.19, -s * 0.37, s * 0.38, s * 0.68); },
    cup(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.6); ctx.lineTo(s * 0.3, -s * 0.6); ctx.lineTo(s * 0.22, 0); ctx.lineTo(-s * 0.22, 0); ctx.closePath(); }, '#f3ece0', [-s * 0.3, -s * 0.6, s * 0.6, s * 0.6]); },
    heart(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.moveTo(0, s * 0.35); ctx.bezierCurveTo(-s * 0.7, -s * 0.1, -s * 0.3, -s * 0.6, 0, -s * 0.25); ctx.bezierCurveTo(s * 0.3, -s * 0.6, s * 0.7, -s * 0.1, 0, s * 0.35); }, '#e2574a', [-s * 0.6, -s * 0.6, s * 1.2, s]); },
    sword(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.05, -s * 0.25); ctx.lineTo(0, -s * 1.2); ctx.lineTo(s * 0.05, -s * 0.25); ctx.closePath(); }, '#c9ccd6', [-s * 0.05, -s * 1.2, s * 0.1, s], { rim: 1 }); sh(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.2, -s * 0.27, s * 0.4, s * 0.05); }, '#b08a3a', [-s * 0.2, -s * 0.27, s * 0.4, s * 0.05]); sh(ctx, () => { ctx.beginPath(); ctx.rect(-s * 0.035, -s * 0.22, s * 0.07, s * 0.22); }, '#5a3a2a', [-s * 0.035, -s * 0.22, s * 0.07, s * 0.22]); },
    staff(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.roundRect(-s * 0.04, -s * 1.6, s * 0.08, s * 1.6, s * 0.04); }, '#7a5a3e', [-s * 0.04, -s * 1.6, s * 0.08, s * 1.6]); },
    basket(ctx, s) { sh(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.45, -s * 0.45); ctx.lineTo(s * 0.45, -s * 0.45); ctx.lineTo(s * 0.35, 0); ctx.lineTo(-s * 0.35, 0); ctx.closePath(); }, '#c99a5e', [-s * 0.45, -s * 0.45, s * 0.9, s * 0.45]); ctx.strokeStyle = 'rgba(110,70,30,0.4)'; ctx.lineWidth = s * 0.025; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-s * 0.45 + i * 0.03 * s, -s * 0.45 + i * s * 0.11); ctx.lineTo(s * 0.45 - i * 0.03 * s, -s * 0.45 + i * s * 0.11); ctx.stroke(); } },
    flower(ctx, s, p) { ctx.strokeStyle = '#5f8a46'; ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.1, -s * 0.4, 0, -s * 0.8); ctx.stroke(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; sh(ctx, () => PT.ellipse(ctx, Math.cos(a) * s * 0.14, -s * 0.8 + Math.sin(a) * s * 0.14, s * 0.12, s * 0.08, a), p.color || '#f6c94a', [-s * 0.3, -s * 1.05, s * 0.6, s * 0.5], { rim: 0.4, edge: 0.1 }); } PT.ellipse(ctx, 0, -s * 0.8, s * 0.07, s * 0.07); ctx.fillStyle = '#8a5634'; ctx.fill(); },
    rock(ctx, s, p) { sh(ctx, () => { ctx.beginPath(); ctx.moveTo(-s * 0.5, 0); ctx.quadraticCurveTo(-s * 0.55, -s * 0.5, -s * 0.1, -s * 0.6); ctx.quadraticCurveTo(s * 0.45, -s * 0.62, s * 0.5, 0); ctx.closePath(); }, p.color || '#9a9088', [-s * 0.55, -s * 0.62, s * 1.1, s * 0.62]); },
  };

  // ---------- FX (drawn in world space unless screen:true) ----------
  function drawFX(ctx, fx, d) {
    const p = clamp01(d / (fx.dur || 0.5));
    const s = fx.size || 120;
    ctx.save(); ctx.translate(fx.x || 540, fx.y || 900);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = PT.INK;
    if (fx.type === 'exclaim' || fx.type === 'question') {
      const k = EASE.back(clamp01(p * 3));
      ctx.scale(k, k); ctx.font = `${s}px Cap, Poppins, sans-serif`; ctx.textAlign = 'center';
      ctx.lineWidth = s * 0.12; ctx.strokeText(fx.type === 'exclaim' ? '!' : '?', 0, 0);
      ctx.fillStyle = fx.type === 'exclaim' ? '#ff6b5a' : '#5ab0ff'; ctx.fillText(fx.type === 'exclaim' ? '!' : '?', 0, 0);
    } else if (fx.type === 'sweat') {
      ctx.translate(0, p * s * 0.6); ctx.globalAlpha = 1 - p * 0.6;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.3); ctx.quadraticCurveTo(s * 0.2, 0, 0, s * 0.12); ctx.quadraticCurveTo(-s * 0.2, 0, 0, -s * 0.3);
      ctx.fillStyle = '#9fdcff'; ctx.fill(); ctx.lineWidth = s * 0.04; ctx.stroke();
    } else if (fx.type === 'sparkle') {
      for (let i = 0; i < 5; i++) {
        const a = i * 1.257 + 0.3, r = s * (0.3 + p * 0.7), k = Math.sin(Math.min(1, p * 1.2) * Math.PI) * s * 0.18;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        ctx.beginPath(); ctx.moveTo(x, y - k); ctx.lineTo(x + k * 0.3, y); ctx.lineTo(x, y + k); ctx.lineTo(x - k * 0.3, y); ctx.closePath();
        ctx.fillStyle = '#fff3a0'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      }
    } else if (fx.type === 'impact') {
      const k = EASE.out(clamp01(p * 2.5)); ctx.globalAlpha = 1 - clamp01((p - 0.5) * 2);
      ctx.beginPath();
      for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = (i % 2 ? 0.45 : 1) * s * k; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fillStyle = '#fff1a0'; ctx.fill(); ctx.lineWidth = s * 0.05; ctx.stroke();
    } else if (fx.type === 'puff') {
      ctx.globalAlpha = 1 - p;
      for (let i = 0; i < 4; i++) { const x = (i - 1.5) * s * 0.35 * (1 + p), y = -p * s * 0.3; PT.ellipse(ctx, x, y, s * 0.2 * (1 + p), s * 0.16 * (1 + p)); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); }
    } else if (fx.type === 'speedlines') {
      ctx.globalAlpha = 0.8 * Math.sin(p * Math.PI); ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff';
      for (let i = 0; i < 9; i++) { const y = (i - 4) * s * 0.25, off = ((i * 53) % 90); ctx.beginPath(); ctx.moveTo(-s * 2 - off, y); ctx.lineTo(-s * 0.6 - off, y); ctx.stroke(); }
    } else if (fx.type === 'hearts') {
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate((i - 1) * s * 0.5, -p * s * (1 + i * 0.3)); ctx.globalAlpha = 1 - p; PROPS.heart(ctx, s * 0.5); ctx.restore(); }
    } else if (fx.type === 'zzz') {
      ctx.font = `${s * 0.5}px Cap, Poppins, sans-serif`; ctx.fillStyle = '#ffffff'; ctx.lineWidth = 8;
      for (let i = 0; i < 3; i++) { const q = (p * 1.5 + i / 3) % 1; ctx.globalAlpha = 1 - q; ctx.strokeText('z', q * s * 0.6, -q * s * 1.2); ctx.fillText('z', q * s * 0.6, -q * s * 1.2); }
    }
    ctx.restore();
  }

  // ---------- one scene into ctx ----------
  function drawScene(ctx, project, scene, gt) {
    const lt = gt - scene.start;
    ctx.save();
    const cam = cameraAt(scene, lt, project);
    applyCamera(ctx, cam);
    PT.drawBG(ctx, scene.location, gt, cam);
    if (project.custom && project.custom.bg && project.custom.bg[scene.location]) project.custom.bg[scene.location](ctx, gt, lt);
    // layers sorted by y so nearer things draw on top
    const items = [], held = [], handsOf = {};
    (scene.actors || []).forEach((a, i) => { const r = actorPose(project, scene, a, lt, gt, i); items.push({ y: r.st.y, kind: 'actor', a, r }); });
    (scene.props || []).forEach((p) => {
      const st = sampleKeys(p.keys, lt, p);
      if (st.hold) held.push({ p, st }); else items.push({ y: st.y ?? GROUND, kind: 'prop', p, st });
    });
    items.sort((A, B) => (A.z ?? A.y) - (B.z ?? B.y));
    for (const it of items) {
      if (it.kind === 'actor') {
        const { st, pose } = it.r;
        if (st.visible === false) continue;
        PT.shadow(ctx, st.x, st.y - (pose.hop || 0) * 0, st.h * PT.CAST[it.a.who].rel * 0.16);
        const r = PT.drawCharacter(ctx, it.a.who, st.x, st.y, st.h, pose);
        handsOf[it.a.who] = r.hands;
        if (r.headBox) PT._heads.push({ who: it.a.who, top: r.headBox[0], bottom: r.headBox[1], x: r.headBox[2] });
      } else {
        const st = it.st; if (st.visible === false) continue;
        const fn = PROPS[it.p.type] || (project.custom && project.custom.props && project.custom.props[it.p.type]);
        if (!fn) continue;
        ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(st.rot || 0); ctx.scale(st.scale || 1, st.scale || 1);
        fn(ctx, st.size || 100, st, lt); ctx.restore();
      }
    }
    // held props: drawn on top, glued to the actor's hand ("hold": "toby.R")
    for (const { p, st } of held) {
      if (st.visible === false) continue;
      const [who, hand] = String(st.hold).split('.');
      const hp = handsOf[who] && handsOf[who][hand || 'R']; if (!hp) continue;
      const fn = PROPS[p.type] || (project.custom && project.custom.props && project.custom.props[p.type]); if (!fn) continue;
      const m = ctx.getTransform(), zoom = Math.hypot(m.a, m.b);
      ctx.save(); ctx.setTransform(zoom, 0, 0, zoom, hp[0], hp[1]);
      ctx.translate(st.dx || 0, st.dy ?? -(st.size || 100) * 0.15); ctx.rotate(st.rot || 0); ctx.scale(st.scale || 1, st.scale || 1);
      fn(ctx, st.size || 100, st, lt); ctx.restore();
    }
    for (const fx of scene.fx || []) {
      if (fx.type === 'shake' || fx.type === 'flash' || fx.screen) continue;
      const d = lt - fx.t; if (d >= 0 && d <= (fx.dur || 0.5)) drawFX(ctx, fx, d);
    }
    ctx.restore();
    // screen-space fx
    for (const fx of scene.fx || []) {
      const d = lt - fx.t, dur = fx.dur || 0.18;
      if (fx.type === 'flash' && d >= 0 && d < dur) { ctx.fillStyle = `rgba(255,255,255,${0.85 * (1 - d / dur)})`; ctx.fillRect(0, 0, W, H); }
    }
  }

  // ---------- transitions ----------
  let OFF = null;
  function offscreen() {
    if (!OFF) OFF = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    return OFF;
  }
  const TRANS = {
    dissolve(ctx, drawA, drawB, u) { // soft cross-dissolve (the default cinematic join)
      drawA(ctx); const o = offscreen(), oc = o.getContext('2d'); oc.setTransform(1, 0, 0, 1, 0, 0); drawB(oc);
      ctx.globalAlpha = EASE.inout(u); ctx.drawImage(o, 0, 0); ctx.globalAlpha = 1;
    },
    fade(ctx, drawA, drawB, u) { // dip through warm light (time skip, dream, memory)
      if (u < 0.5) drawA(ctx); else drawB(ctx);
      ctx.fillStyle = `rgba(255,236,206,${Math.sin(u * Math.PI)})`; ctx.fillRect(0, 0, W, H);
    },
    whip(ctx, drawA, drawB, u) { // fast pan: old slides out left, new slides in from right
      const e = EASE.inout(u);
      ctx.save(); ctx.translate(-W * e, 0); drawA(ctx); ctx.restore();
      ctx.save(); ctx.translate(W * (1 - e), 0); drawB(ctx); ctx.restore();
      ctx.globalAlpha = Math.sin(u * Math.PI) * 0.55; ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 26; i++) ctx.fillRect(0, (i * 197) % H, W, 5 + (i % 3) * 4);
      ctx.globalAlpha = 1;
    },
    iris(ctx, drawA, drawB, u) { // classic cartoon circle wipe: close on old, open on new
      if (u < 0.5) { drawA(ctx); const r = (1 - EASE.in(u * 2)) * H * 0.62; maskCircle(ctx, r); }
      else { drawB(ctx); const r = EASE.out((u - 0.5) * 2) * H * 0.62; maskCircle(ctx, r); }
    },
    pop(ctx, drawA, drawB, u) { // new scene punches in from 112% with a flash
      const k = 1 + 0.12 * (1 - EASE.out(u));
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2); drawB(ctx); ctx.restore();
      ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - u)})`; ctx.fillRect(0, 0, W, H);
    },
    wipe(ctx, drawA, drawB, u) {
      drawA(ctx); const x = W * EASE.inout(u);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, H); ctx.clip(); drawB(ctx); ctx.restore();
      ctx.fillStyle = PT.INK; ctx.fillRect(x - 6, 0, 12, H);
    },
  };
  function maskCircle(ctx, r) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, H * 0.45, Math.max(0, r), 0, Math.PI * 2, true);
    ctx.fillStyle = PT.INK; ctx.fill('evenodd'); ctx.restore();
  }

  // ---------- post: bloom, colour grade, paper texture, film grain, vignette ----------
  // Fast path: only TWO full-frame blend passes per frame.
  //  1) bloom/halation: blurred, contrast-boosted 1/4-size copy, screened on top
  //  2) one soft-light pass with a pre-baked texture = colour grade + paper fibre + vignette + film grain
  //     (4 grain variants baked per grade, cycled per frame)
  const POST = { baked: {} };
  function bake(grade, k) {
    const key = grade.tint + grade.a + '_' + k; if (POST.baked[key]) return POST.baked[key];
    const c = PT.mkCanvas(W, H), x = c.getContext('2d');
    x.fillStyle = 'rgb(128,128,128)'; x.fillRect(0, 0, W, H);                                   // neutral for soft-light
    const g = x.createLinearGradient(0, 0, 0, H); const a = grade.a ?? 0.2;                    // grade, stronger at the top
    g.addColorStop(0, PT.tint(grade.tint, 0, Math.min(1, a * 2.4))); g.addColorStop(1, PT.tint(grade.tint, 0, a * 0.9));
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'overlay'; x.globalAlpha = 0.55; x.fillStyle = x.createPattern(PT.TEX.paperTex(), 'repeat'); x.fillRect(0, 0, W, H);
    x.globalAlpha = 0.16; x.fillStyle = x.createPattern(PT.TEX.grainTex(k + 1), 'repeat'); x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
    const v = x.createRadialGradient(W / 2, H * 0.47, H * 0.3, W / 2, H * 0.5, H * 0.8);       // vignette (darkens in soft-light)
    v.addColorStop(0, 'rgba(40,24,40,0)'); v.addColorStop(1, 'rgba(40,24,40,0.75)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
    return (POST.baked[key] = c);
  }
  function postFX(ctx, t, grade, project) {
    if (project.post === false) return;
    grade = grade || { tint: '#ffd0a0', a: 0.2, bloom: 0.3 };
    if (!POST.small) POST.small = PT.mkCanvas(270, 480);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const s = POST.small.getContext('2d'); s.filter = 'blur(8px) brightness(0.75) contrast(2.4)'; s.drawImage(ctx.canvas, 0, 0, 270, 480); s.filter = 'none';
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (grade.bloom ?? 0.3) * 0.75; ctx.drawImage(POST.small, 0, 0, W, H);
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 1; ctx.drawImage(bake(grade, Math.floor(t * 30) % 4), 0, 0);
    ctx.restore();
  }

  // ---------- captions (top band, approved) ----------
  function drawCaption(ctx, project, t) {
    const caps = project.captions || []; if (project.showCaptions === false) return;
    const c = caps.find((c) => t >= c.s && t < c.e); if (!c) return;
    const y = project.captionY || 400;
    const age = t - c.s, k = 0.82 + 0.18 * EASE.back(clamp01(age / 0.14));
    // words wrapped in *stars* are highlighted
    const words = c.text.split(/\s+/).filter(Boolean);
    let size = 92; ctx.font = `${size}px Cap, Poppins, sans-serif`;
    const plain = words.map((w) => w.replace(/\*/g, '')).join(' ');
    while (ctx.measureText(plain).width > 940 && size > 50) { size -= 4; ctx.font = `${size}px Cap, Poppins, sans-serif`; }
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(k, k);
    ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const space = ctx.measureText(' ').width;
    const widths = words.map((w) => ctx.measureText(w.replace(/\*/g, '')).width);
    let x = -(widths.reduce((a, b) => a + b, 0) + space * (words.length - 1)) / 2;
    words.forEach((w, i) => {
      const hl = /^\*.*\*$/.test(w), txt = w.replace(/\*/g, '');
      ctx.lineWidth = size * 0.22; ctx.strokeStyle = PT.INK; ctx.strokeText(txt, x, 0);
      ctx.fillStyle = hl ? '#ffd23f' : '#ffffff'; ctx.fillText(txt, x, 0);
      x += widths[i] + space;
    });
    ctx.restore();
  }


  // ---------- silent subscribe CTA (project.cta = {s, e, tap, text}) ----------
  // A mid-video button that pops in, gets tapped by a cartoon hand and turns into SUBSCRIBED.
  // Never at the end: the ending must stay a clean loop back to frame 0.
  function drawCTA(ctx, c, t) {
    const lt = t - c.s, dur = c.e - c.s; if (lt < 0 || lt > dur) return;
    const k = lt < 0.25 ? EASE.back(clamp01(lt / 0.25)) : lt > dur - 0.2 ? 1 - clamp01((lt - (dur - 0.2)) / 0.2) : 1;
    const tap = c.tap ?? 0.9, done = lt >= tap, press = Math.abs(lt - tap) < 0.08 ? 0.92 : 1;
    const y = c.y || 1440, label = c.text || 'Subscribe for more';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2, y); ctx.scale(k * press, k * press);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.font = '44px Cap, Poppins, sans-serif'; ctx.lineWidth = 12; ctx.strokeStyle = PT.INK; ctx.strokeText(label, 0, -105);
    ctx.fillStyle = '#ffffff'; ctx.fillText(label, 0, -105);
    const w = 470, h = 116;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    ctx.fillStyle = done ? '#8a8a96' : '#e53935'; ctx.fill(); ctx.lineWidth = 9; ctx.stroke();
    ctx.font = '58px Cap, Poppins, sans-serif'; ctx.fillStyle = '#ffffff';
    ctx.fillText(done ? 'SUBSCRIBED' : 'SUBSCRIBE', done ? 0 : 30, 4);
    if (!done) { ctx.beginPath(); ctx.moveTo(-205, -24); ctx.lineTo(-163, 0); ctx.lineTo(-205, 24); ctx.closePath(); ctx.fill(); ctx.lineWidth = 5; ctx.stroke(); }
    ctx.restore();
    if (lt > 0.3 && lt < dur - 0.2) { // cartoon mitten hand taps the button
      const a = clamp01((lt - 0.3) / (tap - 0.3)), b = clamp01((lt - tap - 0.35) / 0.4);
      const hx = lt < tap ? 820 - 300 * EASE.back(a) : 520 + 300 * b;
      const hy = y + 120 - (lt < tap ? 70 * a : 70 * (1 - b));
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      PT.limb(ctx, [[hx + 120, hy + 220], [hx + 10, hy + 30]], '#e9b33b', 30, 6);
      PT.ellipse(ctx, hx, hy, 38, 38); PT.fillStroke(ctx, '#f7d3b2', 6);
      PT.ellipse(ctx, hx - 22, hy - 40, 13, 28, -0.4); PT.fillStroke(ctx, '#f7d3b2', 5);
      ctx.restore();
    }
  }

  // ---------- public: one full frame ----------
  function sceneAt(project, t) {
    const S = project.scenes; let i = S.findIndex((s) => t >= s.start && t < s.end);
    if (i < 0) i = t < S[0].start ? 0 : S.length - 1;
    return i;
  }
  function renderFrame(ctx, project, t) {
    PT._heads = [];
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const S = project.scenes, i = sceneAt(project, t), sc = S[i];
    const tr = sc.transition && sc.transition !== 'cut' && i > 0 ? sc.transition : null;
    const td = sc.transitionDur || (tr === 'iris' || tr === 'fade' ? 0.5 : tr === 'dissolve' ? 0.4 : 0.3);
    if (tr && t - sc.start < td && TRANS[tr]) {
      const u = clamp01((t - sc.start) / td), prev = S[i - 1];
      const drawA = (c) => drawScene(c, project, prev, Math.min(t, prev.end - 1e-3));
      const drawB = (c) => drawScene(c, project, sc, t);
      TRANS[tr](ctx, drawA, drawB, u);
    } else drawScene(ctx, project, sc, t);
    postFX(ctx, t, (PT.LOC[sc.location] || (project.custom && project.custom.loc && project.custom.loc[sc.location]) || {}).grade, project);
    drawCaption(ctx, project, t);
    if (project.cta) drawCTA(ctx, project.cta, t);
    ctx.restore();
  }

  // ---------- lint: find caption/face overlaps and faces cut off by the frame ----------
  function lint(ctx, project, step) {
    step = step || 0.1; const issues = [], y = project.captionY || 400, dur = project.timing.dur;
    for (let t = 0; t < dur; t += step) {
      renderFrame(ctx, project, t);
      const cap = (project.captions || []).some((c) => t >= c.s && t < c.e) && project.showCaptions !== false;
      const sc = project.scenes[sceneAt(project, t)];
      for (const h of PT._heads) {
        if (h.x < -50 || h.x > W + 50 || h.bottom < 0 || h.top > H) continue; // fully off-screen (entering/leaving): fine
        if (cap && h.top < y + 70 && h.bottom > y - 70) issues.push({ scene: sc.id, t: +t.toFixed(2), who: h.who, problem: 'caption covers face' });
        else if (h.top < 0 && h.bottom > 0) issues.push({ scene: sc.id, t: +t.toFixed(2), who: h.who, problem: 'head cut off at top' });
        if (h.bottom > H * 0.8 && h.top < H) issues.push({ scene: sc.id, t: +t.toFixed(2), who: h.who, problem: 'face inside bottom YouTube UI zone' });
      }
    }
    // merge consecutive samples
    const out = [];
    for (const i of issues) {
      const l = out[out.length - 1];
      if (l && l.scene === i.scene && l.who === i.who && l.problem === i.problem && i.t - l.to <= step * 1.5) l.to = i.t;
      else out.push({ scene: i.scene, who: i.who, problem: i.problem, from: i.t, to: i.t });
    }
    return out;
  }

  Object.assign(PT, { lint, EASE, sampleKeys, renderFrame, sceneAt, PROPS, drawFX, envAt });
})(typeof window !== 'undefined' ? window : globalThis);
