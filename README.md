# painted-world-shorts

Engine + skill for making vertical (1080×1920, 30 fps) YouTube Shorts in a "painted-world" look:
stylised 3D-feature-animation characters inside hand-painted, watercolor-textured, golden-hour
environments. Script → voice-over → browser preview of the real animation → final MP4.

- `SKILL.md` — the workflow Claude follows (with approval checkpoints)
- `reference/` — style, animation, characters, production, content guides
- `engine/` — Canvas 2D character rig (shaded, rim-lit), painted locations (3 parallax layers),
  scene engine + post FX (bloom, grade, paper, grain, vignette), preview page
- `tools/` — timing, audio, build_preview, lint, render, stills, thumb, qa, new_project

Everything is drawn by code (no image generator), so every frame is consistent and the preview is
exactly what renders. It approximates the reference look; it is not a 3D renderer.

Requirements: Node 18+, Playwright with Chromium, FFmpeg, Python 3 + numpy.
Font: Poppins Bold, SIL Open Font License 1.1 (`engine/assets/OFL.txt`).
Music/SFX in `assets/` are the user's own library (same as pastel-toon-shorts).
