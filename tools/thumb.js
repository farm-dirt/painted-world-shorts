#!/usr/bin/env node
// Thumbnail composer (never a video frame): renders a one-scene JSON with the real engine, then adds a title.
// usage: node thumb.js PROJECT_DIR --thumb project-files/thumb_A.json --title "2-5 WORDS" [--hl WORD] [--out final/thumbnail_A.png] [--wide]
//   --wide  also/only makes a 1280x720 version (centre crop of the same art, title kept inside the frame)
// Thumbnail-only props go in a thumb_custom.js next to the JSON (window.CUSTOM_THUMB = {props:{...}, bg:{...}}).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const a = process.argv.slice(2), P = path.resolve(a[0]);
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const thumbFile = path.resolve(P, opt('--thumb', 'project-files/thumb_A.json'));
const scene = JSON.parse(fs.readFileSync(thumbFile, 'utf8'));
const title = (opt('--title', '') || '').toUpperCase(), hl = (opt('--hl', '') || '').toUpperCase();
const wide = a.includes('--wide');
const out = path.resolve(P, opt('--out', wide ? 'final/thumbnail_16x9.png' : 'final/thumbnail.png'));
const tc = path.join(path.dirname(thumbFile), 'thumb_custom.js');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.join(P, 'preview', 'index.html') + '?render=1'); await p.evaluate(() => window.READY);
  if (fs.existsSync(tc)) await p.addScriptTag({ content: fs.readFileSync(tc, 'utf8') });
  const url = await p.evaluate(({ scene, title, hl, wide }) => {
    const base = window.PROJECT, custom = Object.assign({}, window.CUSTOM || {});
    if (window.CUSTOM_THUMB) for (const k of ['props', 'bg', 'cast', 'loc']) custom[k] = Object.assign({}, custom[k] || {}, window.CUSTOM_THUMB[k] || {});
    if (custom.cast) { window.CUSTOM = window.CUSTOM || {}; window.CUSTOM.cast = custom.cast; window.CUSTOM.loc = custom.loc; }
    const proj = { scenes: [Object.assign({ id: 'thumb', start: 0, end: 2, settle: false, drift: false }, scene)], captions: [], showCaptions: false, timing: { dur: 2, env: [], envFps: 30 }, custom };
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; const ctx = cv.getContext('2d');
    PT.renderFrame(ctx, proj, scene.t ?? 1.0);
    let o = cv, W = 1080, H = 1920;
    if (wide) { o = document.createElement('canvas'); o.width = 1280; o.height = 720; W = 1280; H = 720; const cy = scene.wideCenterY ?? 860, h = 1080 * 720 / 1280;
      o.getContext('2d').drawImage(cv, 0, cy - h / 2, 1080, h, 0, 0, 1280, 720); }
    const c = o.getContext('2d');
    if (title) {
      const words = title.split(/\s+/), maxW = W * 0.86; let size = wide ? 120 : 150, lines;
      const fit = () => { c.font = `${size}px Cap, Poppins, sans-serif`; lines = [[]]; for (const w of words) { const l = lines[lines.length - 1]; const t = [...l, w].join(' '); if (c.measureText(t).width > maxW && l.length) lines.push([w]); else l.push(w); } };
      fit(); while ((lines.length > 2 || lines.some((l) => c.measureText(l.join(' ')).width > maxW)) && size > 60) { size -= 6; fit(); }
      const y0 = wide ? H * 0.2 : H * 0.17; c.textBaseline = 'middle'; c.lineJoin = 'round';
      lines.forEach((l, i) => {
        const y = y0 + i * size * 1.05, total = c.measureText(l.join(' ')).width, sp = c.measureText(' ').width; let x = (W - total) / 2;
        for (const w of l) { const ww = c.measureText(w).width;
          c.lineWidth = size * 0.2; c.strokeStyle = '#2a1f24'; c.strokeText(w, x, y);
          c.fillStyle = hl && w.replace(/[^A-Z0-9]/g, '') === hl.replace(/[^A-Z0-9]/g, '') ? '#ffd23f' : '#ffffff'; c.fillText(w, x, y); x += ww + sp; }
      });
    }
    return o.toDataURL('image/png');
  }, { scene, title, hl, wide });
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log('thumbnail:', out); await b.close();
})();
