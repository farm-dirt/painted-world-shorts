#!/usr/bin/env node
// Render still frames of the REAL preview: node stills.js PROJECT_DIR T1 T2 ... [--out DIR] [--sheet]
// Writes <out>/still_<t>.png (default PROJECT_DIR/scenes/). --sheet also writes a contact sheet.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const { execFileSync } = require('child_process');
(async () => {
  const a = process.argv.slice(2), P = path.resolve(a[0]);
  const oi = a.indexOf('--out'), out = path.resolve(oi >= 0 ? a[oi + 1] : path.join(P, 'scenes'));
  const ts = a.slice(1).filter((x, i, arr) => !x.startsWith('--') && arr[i - 1] !== '--out' && a[a.indexOf(x) - 1] !== '--out').map(Number).filter((x) => !isNaN(x));
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.join(P, 'preview', 'index.html') + '?render=1');
  await p.evaluate(() => window.READY);
  const files = [];
  for (const t of ts) {
    const u = await p.evaluate((t) => window.renderAt(t, 'image/png'), t);
    const f = path.join(out, `still_${t.toFixed(2)}.png`); fs.writeFileSync(f, Buffer.from(u.split(',')[1], 'base64')); files.push(f); console.log(f);
  }
  await b.close();
  if (a.includes('--sheet') && files.length) {
    const cols = Math.min(4, files.length), rows = Math.ceil(files.length / cols);
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex',
      files.map((_, i) => `[${i}:v]scale=360:640[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:fill=black:layout=` +
      files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|') + (files.length === 1 ? '' : '') , path.join(out, 'stills_sheet.jpg')]);
    console.log(path.join(out, 'stills_sheet.jpg'));
  }
})();
