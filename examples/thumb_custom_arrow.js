// Thumbnail-only props: a big glossy red arrow (copy to project-files/thumb_custom.js). Use: {"type":"arrow","x":..,"y":..,"size":430,"rot":angle} — tail in the lower corner, tip just below the main subject.
window.CUSTOM_THUMB = { props: {
  // big glossy red arrow pointing along +x (rotate with rot). s = length
  arrow(ctx, s, st) {
    const w = s * 0.17, hd = s * 0.36;
    const path = () => { ctx.beginPath(); ctx.moveTo(-s / 2, -w / 2); ctx.lineTo(s / 2 - hd, -w / 2); ctx.lineTo(s / 2 - hd, -w * 1.3);
      ctx.lineTo(s / 2, 0); ctx.lineTo(s / 2 - hd, w * 1.3); ctx.lineTo(s / 2 - hd, w / 2); ctx.lineTo(-s / 2, w / 2); ctx.closePath(); };
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = s * 0.06; ctx.shadowOffsetY = s * 0.02;
    path(); ctx.fillStyle = '#ff2a1a'; ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(0, -w * 1.3, 0, w * 1.3); g.addColorStop(0, 'rgba(255,180,160,0.55)'); g.addColorStop(0.5, 'rgba(255,90,70,0)'); g.addColorStop(1, 'rgba(90,0,0,0.35)');
    path(); ctx.fillStyle = g; ctx.fill();
    path(); ctx.lineWidth = s * 0.03; ctx.strokeStyle = '#ffffff'; ctx.lineJoin = 'round'; ctx.stroke();
  },
} };
