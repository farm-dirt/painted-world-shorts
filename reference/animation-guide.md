# Animation guide — acting, timing, camera, scene file

## How the reference moves (and how we adapt it for Shorts)
- **Cinematic, not TV-cartoon**: every shot is "lensed". Mix extreme low angles, top-down aerials,
  over-the-shoulder, tight emotional close-ups and wide shots with tiny figures and lots of sky.
- Big readable acting (wide-eyed panic, sly smirk, teary worry), held a beat longer than feels natural.
- Action reads through **diagonals and depth**, not motion blur: tilt the camera (`roll` ±6-10°),
  push in, let the parallax layers do the work.
- **Shorts pacing: one shot per 1.5-3 s**, first cut within 2 s; silence before a reveal (`music.stops`).

## Shot recipes (camera keys; parallax makes them feel 3D automatically)
| Shot | Recipe |
|---|---|
| Establishing wide | zoom 0.9-1.0, small figures, slow push 1.0 → 1.08 over the shot |
| Hero low angle | camera y LOWER than the face (e.g. y 1250 for feet at 1600), zoom 1.4, `roll` 4° |
| Emotional close-up | zoom 2.0-2.6 on the face, slow push +0.1, hold the expression |
| Reveal | start tight on a face (zoom 2.2), pull back to 1.0 with `ease:'out'` over 1.5 s |
| Parallax slide | pan x by 200-300 px at constant zoom — far layers move slower = depth |
| Dutch chaos | `roll` 8-10° + `shake` fx |
| Aerial / falling | location `sky`, characters with arms up, camera roll + slow rotate |

## Acting recipes (use these keys)
| Beat | Recipe |
|---|---|
| Double-take | neutral look → 0.15 s later `face:'shock'`, `hop:20`, `squash:1.06`, arms up, `ease:'back'` + push-in + `impact_hit`/`suspense_sting` sfx |
| Realisation | slow push-in (zoom +0.2 over 1.5 s) + `look` toward object + `sparkle` |
| Smug reply | `face:'smug'`, hands on hips, switch with `ease:'snap'` exactly on the word |
| Panic | `worried` + `sweat` fx + small `shake` |
| Defeat | `sad`, `squash:0.94`, `headTilt:0.2`, arms hanging, slow pull-back, music stop |
| Wonder | `awe`, `look:[0,-0.6]`, slow push-in, `sparkle` fx, `magic_sparkle` sfx (with dur + fadeOut) |
| Fear | `scared`, step back (x −60), `lean:-0.08`, camera low + `roll`, `heartbeat` sfx |
| Entrance | walk in from off-screen (x −150 → target) with `walk:true`; feet never slide (phase follows distance) |
| Talking | add `speaks:[[from,to]]` (scene-local s) — mouth follows the real voice |

Motion rules (the twitch lesson from the earlier `short-v1` skill): no fast wiggles. Head sway,
breathing and a slow camera float (`drift`, on by default; `"drift": false` to lock a shot) are built in;
never add per-word nods. Everything is a pure
function of time (no hidden state), so scenes can be previewed and rendered in any order.

## Camera
Keys `{t, x, y, zoom, roll, ease}` in scene-local seconds; (x,y) = world point at frame centre.
Backgrounds are 3 parallax layers (far 0.25 / mid 0.7 / near 1.0): pans and zooms automatically
show depth. Every shot gets a 4 % settle-in over 0.3 s. Variety rules:
- Never two similar framings back to back. Mix: wide (zoom 1), medium (1.3-1.5), close-up (1.7-2.0), push-in, Dutch tilt (`roll` ±6°) on chaos.
- **Lint must pass**: in close-ups, frame the face below the caption band (keep head top > y 520 on screen). If lint flags a scene, lower the camera `y` (smaller y = subject lower on screen) or reduce zoom/hop.
- Use `shake` fx for impacts, `flash` for magic/lightning (max 2 per video).
- A location keeps its light. The **mood dial** (`"mood"` in project.json for the whole video, or per scene)
  changes how dark the picture feels on top of it — see style-guide "Mood dial". Change location
  (`village` → `night`) for a change of time; change mood for a change of feeling.

## Transitions (scene `transition`)
`cut` (default; most cuts should be cuts) · `dissolve` 0.4 s soft cross-dissolve (place/time change) ·
`fade` 0.5 s dip through warm light (memory, dream, time skip, ending) · `whip` 0.3 s fast pan ("meanwhile", chases) ·
`pop` 0.3 s punch-in + flash (sudden arrival) · `iris`, `wipe` (rare in this style). Max ~1 non-cut per 3 scenes.

## FX (`fx` list, scene-local `t`)
`sparkle` (magic), `puff` (dust), `impact`, `speedlines`, `hearts`, `sweat`, `exclaim`, `question`, `zzz`
(world x,y,size,dur). Use the cartoon marks (`exclaim`, `question`, `zzz`) sparingly: this style acts with faces.
· `shake` {amp, dur} · `flash` {dur}.

## Scene file — `project-files/project.json`
```json
{
  "id": "slug", "slug": "slug", "title": "Title", "fps": 30, "voice": "voice.mp3", "captionY": 400,
  "music": {"on": true, "track": "calm_ambient", "start": 0, "stops": [[8.82, 9.6]]},
  "mix": {"music": 0.08, "musicPause": 0.14, "sfx": 0.35},
  "sfx": [{"t": 2.02, "name": "boing"}, {"t": 3.2, "name": "whoosh", "gain": 0.8}],
  "captions": [{"s": 0.36, "e": 1.48, "text": "mara found one"}, {"s": 1.48, "e": 2.47, "text": "shiny *coin*"}],
  "scenes": [{
    "id": "s1", "start": 0, "end": 3.2, "location": "meadow", "transition": "cut",
    "desc": "Wide meadow at sunset. Mara strolls in, spots a coin, double-take (push-in = realisation).",
    "camera": [{"t": 0, "x": 540, "y": 860, "zoom": 1}, {"t": 2.4, "x": 560, "y": 940, "zoom": 1.3, "ease": "back"}],
    "actors": [{"who": "mara", "h": 820, "speaks": [[0.4, 2.9]], "keys": [
      {"t": 0, "x": 120, "y": 1560, "walk": true, "face": "happy"},
      {"t": 1.5, "x": 470, "walk": true},
      {"t": 1.6, "walk": false, "view": "front", "look": [0.4, 0.6]},
      {"t": 2.05, "face": "shock", "hop": 25, "squash": 1.08, "armL": [2.3, 0.3], "armR": [2.3, 0.3], "ease": "back"},
      {"t": 2.4, "hop": 0, "squash": 1}]}],
    "props": [{"type": "coin", "x": 700, "y": 1540, "size": 70},
              {"type": "lantern", "hold": "mara.R", "size": 90, "dy": -10}],
    "fx": [{"type": "exclaim", "t": 2.05, "dur": 0.9, "x": 620, "y": 700, "size": 180}]
  }]
}
```
Notes: scene times are absolute seconds and must tile 0 → voice duration (build_preview fixes
tiny gaps and warns). Inside a scene every `t` is scene-local. Numbers glide between keys with
`ease` (inout default, out, in, back = overshoot, snap = instant, linear); text values (face,
view) switch at their key. `visible:false` hides an actor/prop. Props (shaded, no outlines): coin, box,
sign (`text`), lantern (`color`, glows), book (`color`), scroll, chest, phone, cup, heart, sword, staff,
basket, flower (`color`), rock (`color`) — or custom ones in `custom.js` (draw with `PT.shade`, never ink lines):
`window.CUSTOM = { props: { shovel(ctx, size, state, t) { /* draw at 0,0 */ } } }`.
`hold: "who.L|R"` glues a prop to a hand (drawn on top). Sizes are world px.

Top-level `"cta": {"s", "e", "tap", "text", "y"}` = the silent subscribe button (screen space, drawn after
captions): pops in at `s`, a hand taps it `tap` s later and it reads SUBSCRIBED, gone at `e`. Default
text "Subscribe for more", y 1440 (above the bottom YouTube UI). Place it mid-video, never at the end.
