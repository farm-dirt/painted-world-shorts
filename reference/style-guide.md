# Style guide — the painted-world look

Derived from analysing an animated short (stills across the whole film): stylised 3D animated-film
characters placed inside hand-painted environments, lit by hazy golden-hour light. We keep its
*visual language*, never its characters, designs or scenes.

## The 8 rules that make it recognisable
| # | Rule | How the engine does it |
|---|---|---|
| 1 | **Two halves together**: 3D-shaded characters + painted, textured world | `characters.js` shades every shape (no ink lines); `backgrounds.js` paints with washes, pooled edges, paper streaks |
| 2 | **Same light everywhere**: low sun, warm backlight, golden RIM light on the sun side | each location's `light` (dir, rim, key, shade); characters read it automatically |
| 3 | **Atmosphere**: haze between depth layers, light shafts, bloom, dust motes | `P.haze`, `P.rays`, post bloom, `live: 'motes'` |
| 4 | **Soft painted backgrounds, more saturated characters** | backgrounds are muted + lifted; characters wear one strong colour block |
| 5 | **One accent colour per shot** | cobalt `#2f62b0`, signal red `#e2574a`, taxi yellow `#e3b23c`, ginger `#d9783a` — pick one, keep the rest muted |
| 6 | **Never pure black** | shadows go warm brown / cool slate; post lifts blacks |
| 7 | **Big sculptural cumulus clouds**, lit tops, cool bellies | `P.cloud` |
| 8 | **Film finish**: paper fibre, fine grain, gentle vignette, slight halation | post pass in `engine.js` (baked per location) |

## Palette
- Light: peach `#f6d7b0`, cream `#fbe6c6`, honey `#e8b84a`, sage `#8fa36a`
- Cool: powder blue `#9fb6d0`, slate `#6f87a6`, haze violet `#c7b8c3`
- Night: indigo `#1f2650 → #58639a`, moon cream `#f6f1de`, lantern `#ffd68a`
- Skin tones are warm mid-tones with rosy blush; eyes always have two catchlights.

## Locations (`LOC` in `engine/backgrounds.js`)
| id | Use for | Light |
|---|---|---|
| `meadow` | countryside, hills, roads, open-air stories | sun low left, golden |
| `city` | modern streets, tall buildings with vertical signs | sun at the end of the street |
| `hall` | grand interiors: station, palace, temple, museum (arched glowing windows) | bright window backlight |
| `village` | old towns, markets, historical settlements | sun low left |
| `shore` | sea, beach, cliffs, harbour | sun on the horizon, glitter on water |
| `forest` | woods, jungles, enchanted places (light shafts) | dappled, from top-left |
| `sky` | flying, falling, heavens, gods above the clouds | bright sun, clouds below |
| `night` | moonlit village, lanterns, spooky/legend scenes | cool moon rim + warm lanterns |

### Adding a location (custom.js)
```js
window.CUSTOM = { loc: { temple_ruins: {
  light: { dir: -1, rim: '#ffd59a', rimA: 0.95, key: 'rgba(255,226,180,0.4)', shade: 'rgba(70,52,110,0.5)', ao: 'rgba(60,30,44,0.32)' },
  grade: { tint: '#ffcf9a', a: 0.22, bloom: 0.32 }, sun: { x: 200, y: 600, r: 60 }, live: 'motes',
  far(c, L) { const P = PT.PAINT; P.sky(c, ['#9fb6d0', '#f6d7b0', '#fbe6c6'], L); P.sun(c, L.sun.x, L.sun.y, L.sun.r); P.cloud(c, 800, 380, 300, L, 1); P.haze(c, 950, 1400, '#f7d8b6', 0.45); },
  mid(c, L) { /* columns, walls, trees: P.wash, P.tree, P.building, P.house, P.ridge */ },
  near(c, L) { /* ground from y≈1430 down to 2400, opaque */ },
} } };
```
Toolkit `PT.PAINT`: `sky, sun, rays, cloud, haze, wash(pathFn, top, bottom, {span}), ridge, tree, grass,
flowers, building, house`. Rules: far = sky + distant shapes, mid = scenery that may extend below the
ground line (it slides behind the near layer during parallax), near = opaque ground from y≈1430 down.
Keep ≤ 8 big shapes per layer, haze between layers, one accent colour.

## Mood dial — the picture follows the story's tone
`"mood"` at the top of project.json sets the whole video; `"mood"` on a scene overrides it for that shot.
| mood | Looks like | Use for |
|---|---|---|
| `normal` (default) | the golden painted look, untouched | wonder, funny, warm, everyday stories |
| `tense` | warmth dimmed a little, slightly drained | worry, a problem building, "something is off" |
| `eerie` | cold blue, colour drained, deeper vignette, thin low mist | mystery, folklore creepiness, death customs |
| `dark` | night-blue multiply, strong vignette, heavy desaturation, mist | horror beats, death, tragedy, the scariest reveal |
Fine-tune with an object: `"mood": {"base": "dark", "sat": 0.4, "mist": 0.2}` (keys: sat, bright, con,
mul, tint, a, bloom, vig, mist). The centre of frame is dimmed less, so faces stay the brightest thing.
Rules: pick the video's mood from the story (not from the topic's label); a dark story still opens on
its strangest image, and may start `normal`/`tense` and sink to `dark` at the turn (contrast makes the
dark beat hit harder); a happy ending can climb back to `normal`. `night` + `dark` stays readable;
check a still. Music follows the same dial (normal → calm/celtic, eerie → dark_mystery_piano/dark_ambient,
dark → horror_atmosphere/dark_fantasy_synth).

## Frame layout (1080 × 1920)
- **Caption band** centre y = 400. Faces never inside y 330-470 while a caption shows (lint enforces).
- **YouTube Shorts safe box**: keep faces, the key object, hook text and CTA inside x 48-888, y 180-1500.
  Treat y 1250-1500 as a caution strip.
- Standing characters: feet at world y ≈ 1560-1620; at zoom 1 the ground is ~78 % down.

## Captions
Poppins Bold 92 px (auto-shrinks), white with a dark outline, 1-3 words, key word in yellow via `*word*`.
