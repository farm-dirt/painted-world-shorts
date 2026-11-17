# Characters — original cast and consistency rules

All characters are original and drawn by code (`engine/characters.js`), identical in every frame.
Never imitate the reference film's characters (no ginger girl in a blue hoodie with headphones etc.).

## Design DNA (every character, new ones too)
- Stylised feature-animation proportions: head 21-31 % of height, slender neck and limbs, long legs for
  teens/adults; kids and elders get bigger heads and shorter legs.
- Big eyes: light-to-mid iris with a radial gradient, dark pupil, **two catchlights** (big one on the
  light side), lash line + outer flick, thin arched brows. Rosy blush on every character.
- Hair in **chunky clumped locks** with a sheen band and a few **flyaway strands** catching the rim light.
- No outlines. Every shape gets form shading (warm light side → cool shadow side), ambient occlusion at
  the bottom and a golden rim on the sun side. The location decides the light.
- **One signature colour block** per character (the costume), never the location's own colour.
- `view:'side'` is a **three-quarter view** (both eyes, the far one narrower).

## Cast (`CAST` ids)
| id | Name | Role / personality | Look |
|---|---|---|---|
| `mara` | Mara | Lead. Curious, brave, talks fast, gets into trouble. | Long dark-brown wavy hair, mustard-yellow rain jacket over cream, slate trousers, white sneakers. |
| `ren` | Ren | Lanky friend. Dry humour, overthinks, panics late. | Tall (1.1), messy black hair, sage-green bomber, navy trousers, grey-blue eyes. |
| `lola` | Lola Ising | Tiny sharp grandmother who knows every legend. | Small round (0.7), silver bun, round glasses, terracotta shawl, plum skirt. |
| `dado` | Mang Dado | Big gentle vendor / driver / guard. Deadpan. | Broad, flat cap, moustache, cobalt work shirt, brown trousers. |
| `tala` | Tala | Kid sidekick. Fearless, asks the obvious question. | Small (0.62), black bob, freckles, coral-red tee, denim shorts, yellow shoes. |
Standard size `h: 820`; scale with camera zoom, not with `h`.

## New characters for a story (myths, history) — in the project's custom.js
```js
window.CUSTOM = { cast: { bathala: {
  name: 'Sky King', rel: 1.15, build: 'broad',            // slim | round | broad
  head: 0.22, headW: 0.9, jaw: 0.92, leg: 0.4, shoulder: 0.28, hip: 0.22, limb: 0.04,
  skin: '#c48660', blush: '#d97a66', iris: '#e8b84a', brow: '#e8e4ea',
  hair: { type: 'long', color: '#e8e4ea', hi: '#ffffff' },   // long | bob | ponytail | messy | bun | buzz
  hat: { type: 'crown', color: '#e8b84a', gem: '#2f62b0' },  // cap | crown | wreath | helmet(+crest) | hood | veil
  top: { type: 'robe', color: '#2f62b0', inner: '#f1ead8', trim: '#e8b84a' }, // jacket | hoodie | shirt | tee | shawl | robe | tunic
  bottom: { type: 'robe', color: '#2f62b0' },               // pants | shorts | skirt(len) | robe
  shoe: '#6b4f3a', moustache: null, glasses: null, freckles: false,
} } };
```
Then render a model sheet before using it:
`node engine/shot.js engine/modelsheet.html out.png 2400 2000` (copy custom.js next to modelsheet.html, or open
`modelsheet.html?ids=bathala,mara`). Show the user; save the PNG in the project's `characters/`.
Historical/cultural costumes: keep silhouette and key details accurate, simplified into bold shapes.

## Expressions (`face`)
neutral · happy · grin · shock · angry · worried · sad (tears) · smug · awe · scared · sleepy · talk (auto while speaking).

## Pose controls
`armL`/`armR` = `[shoulder, elbow]` radians (0 = hanging). relaxed `[0.2,0.15]` · hands on hips `[0.9,-1.9]` ·
shrug `[0.5,1.7]` · arms up `[2.4,0.3]` · reach forward (3/4 view, near arm) armR `[1.4,0.3]` ·
hold item up armR `[2.6,0.2]` · run swing armL `[-0.9,0.4]` armR `[1.0,0.6]` · hands to face `[1.2,1.4]`.
Other: `view` front/side, `facing` 1/-1, `lean`, `headTilt`, `look [x,y]`, `squash`, `hop`, `walk`.
