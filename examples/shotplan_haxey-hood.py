#!/usr/bin/env python3
# Builds project.json for "Two Villages Have Fought Over One Hat for 650 Years" (Haxey Hood).
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(D, 'timing.json')))
P = json.load(open(os.path.join(D, 'project.json')))
DUR = T['dur']

def A(who, keys, h=820, **kw):
    d = {'who': who, 'h': h, 'keys': keys}; d.update(kw); return d
def cam(*keys): return [dict(zip(('t', 'x', 'y', 'zoom'), k[:4]), **(k[4] if len(k) > 4 else {})) for k in keys]

S = []
def sc(end, loc, desc, camera, actors=(), props=(), fx=(), tr='cut', mood=None):
    start = S[-1]['end'] if S else 0
    d = {'id': f's{len(S)+1}', 'start': start, 'end': end, 'location': loc, 'transition': tr,
         'desc': desc, 'camera': camera, 'actors': list(actors), 'props': list(props), 'fx': list(fx)}
    if mood: d['mood'] = mood
    S.append(d)

PUSH = [1.4, 0.35]          # arms forward, shoving
UP = [2.4, 0.3]

def scrum(cx, y, who, h=800, dur=3.0, sway=40, faces='strain', spread=150):
    """A human scrum: players lean in toward cx, arms shoving, the whole pile sways side to side."""
    out, n = [], len(who)
    for i, w in enumerate(who):
        off = (i - (n - 1) / 2) * spread
        side = -1 if off < 0 else 1
        yy = y + (abs(off) < spread * 0.6) * -20 + (i % 2) * 25
        keys = []
        for k in range(0, int(dur / 0.75) + 2):
            t = round(k * 0.75, 2); s = sway * (1 if k % 2 else -1)
            keys.append({'t': t, 'x': cx + off * 0.82 + s, 'y': yy, 'view': 'side', 'facing': -side if off else 1,
                         'face': faces, 'rot': (0.2 * -side if off else 0), 'lean': 0.06, 'armL': PUSH, 'armR': PUSH})
        out.append(A(w, keys, h=h))
    return out

hood_sky = lambda keys, size=150: {'type': 'silkhood', 'flying': True, 'size': size, 'keys': keys}
FIELD_PLAYERS = ['lad2', 'boggin', 'lad1', 'ren', 'dado']

# ---------------- 1. HOOK: the scrum ----------------
# 1 "Every January," — frame 0: a steaming pile of men in a frozen field at sunset
sc(1.26, 'hood_field', 'HOOK frame 0: a wide shot of a steaming human pile in a frosty field at low sun, church tower behind. Strange image first; slow push = "what is going on?".',
   cam((0, 560, 1080, 1.3, {'roll': 4}), (1.26, 560, 1070, 1.4, {'roll': 3})),
   actors=scrum(560, 1620, FIELD_PLAYERS, h=720, dur=1.3, spread=125),
   props=[{'type': 'steam', 'x': 560, 'y': 1020, 'size': 460}, {'type': 'mud', 'x': 300, 'y': 1680, 'size': 300}, {'type': 'mud', 'x': 820, 'y': 1700, 'size': 260}])
# 2 "a hundred grown men in England crush each other…" — hero low angle, Dutch tilt, straining faces
sc(4.55, 'hood_field', 'Hero low angle + Dutch tilt inside the scrum: big straining faces, the pile heaves left and right (shake). Chaos, but funny.',
   cam((0, 540, 1180, 1.45, {'roll': 6}), (3.3, 560, 1160, 1.6, {'roll': 3})),
   actors=scrum(540, 1620, ['lad1', 'boggin', 'lad2', 'dado'], h=840, dur=3.4, sway=55, spread=170),
   props=[{'type': 'steam', 'x': 540, 'y': 900, 'size': 380}],
   fx=[{'type': 'shake', 't': 1.9, 'amp': 10, 'dur': 0.5}])
# 3 "over a hat." — the punch: one hand lifts the 'hood' out of the pile (it's not even a hat)
sc(5.8, 'hood_field', 'Punch line visual: a red-shirted Boggin bursts up out of the pile holding the leather "hood" over his head. Push in on the object.',
   cam((0, 560, 980, 1.5), (1.25, 560, 940, 1.72, {'ease': 'out'})),
   actors=[A('boggin', [{'t': 0, 'x': 560, 'y': 1620, 'face': 'grin', 'armL': UP, 'armR': UP, 'hop': 0}, {'t': 0.25, 'hop': 25, 'ease': 'back'}, {'t': 0.6, 'hop': 0}], h=820)]
          + scrum(560, 1700, ['lad1', 'lad2'], h=760, dur=1.3, spread=420),
   props=[{'type': 'leatherhood', 'hold': 'boggin.R', 'size': 260, 'dx': -110, 'dy': -20, 'glow': True}],
   fx=[{'type': 'sparkle', 't': 0.2, 'x': 450, 'y': 600, 'size': 200, 'dur': 0.9}])

# ---------------- 2. THE LEGEND ----------------
LADY_Y = 1600 - 330
def lady_on_horse(x0, x1, dur, who='lady', face='happy', extra=None, hs=700):
    k0 = {'t': 0, 'x': x0, 'y': 1600 - 330 * hs / 700, 'view': 'side', 'facing': 1, 'face': face, 'armL': [0.9, 0.9], 'armR': [0.9, 0.9]}
    keys = [k0, {'t': dur, 'x': x1}] + (extra or [])
    return [A(who, sorted(keys, key=lambda k: k['t']), h=700 * hs / 700)], \
           [{'type': 'horse', 'walk': x1 != x0, 'size': hs, 'keys': [{'t': 0, 'x': x0 + 20 * hs / 700, 'y': 1600}, {'t': dur, 'x': x1 + 20 * hs / 700}]}]

# 4 "You see, over 650 years ago," — dissolve to a golden 14th-century hillside, establishing wide
a, p = lady_on_horse(180, 380, 2.86, hs=420)
sc(8.66, 'meadow', 'Dissolve back in time: golden-hour hillside, a lady in cobalt rides a chestnut horse across the crest, tiny in a huge sky. Establishing wide.',
   cam((0, 540, 980, 0.95), (2.86, 560, 990, 1.05)), actors=a, props=p, tr='dissolve')
# 5 "a rich lady rides over a hill…" — medium parallax slide alongside her
a, p = lady_on_horse(300, 560, 2.06)
sc(10.72, 'meadow', 'Medium parallax slide alongside the rich lady: proud, happy, silk hood on. Camera travels with her.',
   cam((0, 420, 930, 1.25), (2.06, 640, 920, 1.3)), actors=a, props=p)
# 6 "and the wind steals her silk hood." — close-up: a gust rips the hood off, she gasps
a1, p = lady_on_horse(460, 500, 2.38, extra=[{'t': 0.78, 'visible': True}, {'t': 0.8, 'visible': False}])
a2, _ = lady_on_horse(460, 500, 2.38, who='lady_bare', face='shock', extra=[{'t': 0, 'visible': False}, {'t': 0.8, 'visible': True, 'armL': [2.0, 0.6], 'armR': [2.2, 0.4]}])
sc(13.1, 'meadow', 'Close-up on the lady: at "wind" a gust rips the hood off her head and it flies up and away; her hair falls loose, she gasps and reaches for it.',
   cam((0, 520, 790, 1.9), (2.38, 560, 790, 2.0)), actors=a1 + a2, props=p + [
       hood_sky([{'t': 0, 'visible': False, 'x': 540, 'y': 760}, {'t': 0.8, 'visible': True, 'x': 545, 'y': 770}, {'t': 2.38, 'x': 980, 'y': 420, 'rot': 0.9, 'ease': 'out'}], 170)],
   fx=[{'type': 'speedlines', 't': 0.7, 'x': 540, 'y': 800, 'size': 420, 'dur': 0.6}])
# 7 "Basically, a fancy hat." — the WOW shot: the silk hood tumbling through a huge painted sky
sc(15.0, 'sky', 'Wow shot: the cobalt silk hood tumbles across a giant golden sky full of sculptural clouds. Camera drifts with it.',
   cam((0, 500, 900, 1.15), (1.9, 640, 840, 1.25)),
   props=[hood_sky([{'t': 0, 'x': 360, 'y': 980, 'rot': -0.3}, {'t': 1.9, 'x': 740, 'y': 780, 'rot': 0.6}], 230)],
   fx=[{'type': 'sparkle', 't': 0.4, 'x': 560, 'y': 880, 'size': 220, 'dur': 1.3}])
# 8 "thirteen farmhands chase it through the mud." — slapstick chase, one faceplants
run = lambda w, x0, x1, h=780, fall=None, d=2.4: A(w, [{'t': 0, 'x': x0, 'y': 1610, 'walk': True, 'view': 'side', 'facing': 1, 'face': 'shock', 'armL': [-0.9, 0.4], 'armR': [1.0, 0.6]}, {'t': d, 'x': x1, 'walk': True}] +
                                    ([{'t': fall, 'rot': 1.4, 'walk': False, 'face': 'scared', 'y': 1640}] if fall else []), h=h)
sc(17.4, 'meadow', 'Wide slapstick chase: farmhands sprint after the low-flying hood across the muddy field, one trips flat on his face, mud puffs.',
   cam((0, 480, 1060, 1.0), (2.4, 680, 1060, 1.05)),
   actors=[A('hand1', [{'t': 0, 'x': 120, 'y': 1520, 'walk': True, 'facing': 1, 'view': 'side'}, {'t': 2.4, 'x': 400, 'walk': True}], h=430),
           A('hand2', [{'t': 0, 'x': 20, 'y': 1525, 'walk': True, 'facing': 1, 'view': 'side'}, {'t': 2.4, 'x': 300, 'walk': True}], h=440),
           run('hob', -60, 560), run('hand2', 120, 600, h=760, fall=1.1), run('wat', 280, 880, h=760), run('hand1', -200, 360, h=770)],
   props=[hood_sky([{'t': 0, 'x': 700, 'y': 900}, {'t': 2.4, 'x': 1100, 'y': 980}], 150), {'type': 'mud', 'x': 520, 'y': 1650, 'size': 300}],
   fx=[{'type': 'shake', 't': 1.15, 'amp': 6, 'dur': 0.3}])
# 9 "One guy catches it…" — the leap: the shy farmhand snatches it out of the air
sc(18.85, 'meadow', 'The leap: the freckled farmhand jumps and snags the hood mid-air, lands grinning. Low angle, push in.',
   cam((0, 560, 960, 1.35, {'roll': -4}), (1.45, 560, 940, 1.5)),
   actors=[A('wat', [{'t': 0, 'x': 470, 'y': 1610, 'view': 'side', 'facing': 1, 'face': 'shock', 'armR': [2.6, 0.2], 'hop': 0}, {'t': 0.3, 'hop': 140, 'ease': 'out'}, {'t': 0.65, 'hop': 0, 'face': 'grin', 'ease': 'in'}, {'t': 0.8, 'squash': 0.94}, {'t': 1.0, 'squash': 1}])],
   props=[hood_sky([{'t': 0, 'x': 820, 'y': 640}, {'t': 0.42, 'x': 600, 'y': 720}, {'t': 0.44, 'visible': False}], 150),
          {'type': 'silkhood', 'hold': 'wat.R', 'size': 130, 'keys': [{'t': 0, 'visible': False}, {'t': 0.44, 'visible': True}]}],
   fx=[{'type': 'shake', 't': 0.66, 'amp': 6, 'dur': 0.25}])
# 10 "but he's too shy to give it back." — show-don't-narrate: he hides it behind his back, blushing
sc(21.15, 'meadow', 'Close-up: he glances at the lady off-screen, blushes and hides the hood behind his back, shuffling. Tiny shy smile.',
   cam((0, 560, 900, 2.0), (2.3, 560, 905, 2.15)),
   actors=[A('wat', [{'t': 0, 'x': 560, 'y': 1610, 'face': 'happy', 'look': [-0.6, -0.2]}, {'t': 0.6, 'face': 'shy', 'look': [-0.7, 0.2], 'headTilt': -0.12, 'armR': [0.7, 1.9], 'armL': [0.6, 1.9]}, {'t': 1.6, 'look': [0.1, 0.5]}])],
   props=[{'type': 'silkhood', 'hold': 'wat.R', 'size': 110, 'dx': 30}])
# 11 "So his buddy does." — the big buddy plucks it from him and strides over
sc(22.8, 'meadow', 'Two-shot: his broad buddy plucks the hood out of his hands and strides off toward the lady, chest out. Wat is left empty-handed.',
   cam((0, 520, 970, 1.3), (1.65, 600, 970, 1.36)),
   actors=[A('wat', [{'t': 0, 'x': 360, 'y': 1610, 'face': 'shy', 'view': 'side', 'facing': 1}, {'t': 0.4, 'face': 'shock'}, {'t': 1.0, 'face': 'worried'}], h=760),
           A('hob', [{'t': 0, 'x': 560, 'y': 1620, 'view': 'side', 'facing': -1, 'face': 'smug', 'armR': [1.3, 0.3]}, {'t': 0.45, 'facing': 1, 'armR': [2.2, 0.3], 'walk': True}, {'t': 1.65, 'x': 860, 'walk': True}])],
   props=[{'type': 'silkhood', 'hold': 'hob.R', 'size': 140, 'keys': [{'t': 0, 'visible': False}, {'t': 0.35, 'visible': True}]}])
# 12 "She calls the buddy a Lord." — hero low angle on the buddy bowing, she points at him
a, p = lady_on_horse(760, 760, 2.0, who='lady_bare', extra=[{'t': 0.6, 'armR': [1.6, 0.2], 'face': 'happy'}])
sc(24.8, 'meadow', 'Hero low angle: the buddy offers the hood up with a bow; the lady (on her horse, right) points at him, delighted: "a Lord". Sparkle.',
   cam((0, 520, 920, 1.2, {'roll': 3}), (2.0, 540, 890, 1.32, {'roll': 2})),
   actors=a + [A('hob', [{'t': 0, 'x': 400, 'y': 1640, 'view': 'side', 'facing': 1, 'face': 'happy', 'armR': [2.0, 0.3], 'lean': 0.12}, {'t': 1.0, 'face': 'smug', 'lean': 0, 'armL': [0.9, -1.9]}], h=860)],
   props=p + [{'type': 'silkhood', 'hold': 'hob.R', 'size': 140}],
   fx=[{'type': 'sparkle', 't': 1.0, 'x': 400, 'y': 760, 'size': 260, 'dur': 1.0}])
# 13 "The guy who caught it…" — the real catcher, hopeful, mud on him
sc(26.0, 'meadow', 'Medium: the real catcher waits his turn, hopeful smile, looking up at her. Hold the hope.',
   cam((0, 540, 940, 1.7), (1.2, 540, 935, 1.8)),
   actors=[A('wat', [{'t': 0, 'x': 540, 'y': 1610, 'face': 'happy', 'look': [0.5, -0.5], 'armL': [1.2, 1.4], 'armR': [1.2, 1.4]}])],
   props=[{'type': 'mud', 'x': 540, 'y': 1620, 'size': 300}])
# 14 "a Fool." — pop punch-in: his face drops
sc(27.0, 'meadow', 'Pop punch-in on his face as it falls: deflated, shoulders sag. The dry joke lands on his face, not on a sound.',
   cam((0, 540, 900, 2.2), (1.0, 540, 905, 2.35)),
   actors=[A('wat', [{'t': 0, 'x': 540, 'y': 1610, 'face': 'shock', 'look': [0.5, -0.4]}, {'t': 0.35, 'face': 'sad', 'squash': 0.95, 'headTilt': 0.15, 'look': [0, 0.5]}])],
   tr='pop')
# 15 "She loves it so much, she gives them land." — wide golden: she laughs, sweeps an arm over the fields, everyone cheers (CTA beat)
a, p = lady_on_horse(560, 560, 3.05, who='lady_bare', extra=[{'t': 0.2, 'face': 'grin', 'armL': [1.2, 1.4], 'armR': [1.2, 1.4]}, {'t': 1.4, 'face': 'happy', 'armR': [2.0, 0.1], 'armL': [0.9, 0.9]}], hs=560)
sc(30.05, 'meadow', 'Wide golden field: she laughs into her hands, then sweeps an arm across the land; the farmhands cheer with arms up. Calm beat for the subscribe button.',
   cam((0, 540, 1040, 1.05), (3.05, 560, 1030, 1.12)),
   actors=a + [A('hob', [{'t': 0, 'x': 180, 'y': 1640, 'face': 'happy'}, {'t': 1.5, 'face': 'grin', 'armL': UP, 'armR': UP}], h=700),
               A('wat', [{'t': 0, 'x': 900, 'y': 1650, 'face': 'sad'}, {'t': 1.7, 'face': 'happy', 'armL': UP, 'armR': UP, 'hop': 20}], h=680),
               A('hand1', [{'t': 0, 'x': 330, 'y': 1560, 'face': 'happy', 'armL': UP}], h=520)],
   props=p, fx=[{'type': 'sparkle', 't': 1.5, 'x': 560, 'y': 820, 'size': 260, 'dur': 1.2}])
# 16 "On one condition." — close: a sly finger raised
a, p = lady_on_horse(540, 540, 1.57, who='lady_bare', face='smug', extra=[{'t': 0.3, 'armR': [2.7, 0.15]}])
sc(31.62, 'meadow', 'Close-up on the lady: sly smirk, one finger raised. The teaser before the twist.',
   cam((0, 560, 745, 2.0), (1.57, 560, 745, 2.2)), actors=a, props=p)
# 17 "Do it again." — she flings the hood back into the air; the farmhands look up in horror
sc(32.75, 'meadow', 'She flings the hood back into the sky; three farmhands crane their heads up, horrified. Low angle on them.',
   cam((0, 540, 990, 1.3, {'roll': -3}), (1.13, 540, 970, 1.38)),
   actors=[A('hand1', [{'t': 0, 'x': 260, 'y': 1620, 'face': 'shock', 'look': [0.3, -0.9]}], h=780),
           A('wat', [{'t': 0, 'x': 540, 'y': 1640, 'face': 'scared', 'look': [0.2, -0.9]}], h=800),
           A('hob', [{'t': 0, 'x': 820, 'y': 1630, 'face': 'shock', 'look': [-0.2, -0.9], 'armL': [0.5, 1.7], 'armR': [0.5, 1.7]}], h=840)],
   props=[hood_sky([{'t': 0, 'x': 900, 'y': 900}, {'t': 1.13, 'x': 620, 'y': 360, 'rot': 1.2, 'ease': 'out'}], 160)])

# ---------------- 3. EVERY. SINGLE. YEAR. (the same chase through the centuries) ----------------
# 18 "Every," — medieval: the farmhands chase the hood across the winter field
sc(33.85, 'hood_field', 'Every: the medieval farmhands chase the hood across the January field (same field as the hook). Fast parallax.',
   cam((0, 420, 1080, 1.1), (1.1, 620, 1080, 1.1)),
   actors=[run('wat', 200, 620, h=760, d=1.1), run('hob', 0, 420, h=800, d=1.1), run('hand1', -150, 260, h=760, d=1.1)],
   props=[hood_sky([{'t': 0, 'x': 700, 'y': 960}, {'t': 1.1, 'x': 940, 'y': 1000}], 150)], tr='whip')
# 19 "single," — 1800s: caps and moustaches, a scrum over the leather hood
sc(34.5, 'hood_field', 'Single: the same field, 1800s players in caps and jackets heave a scrum. Same framing, new century.',
   cam((0, 540, 1080, 1.1), (0.65, 560, 1080, 1.14)),
   actors=scrum(540, 1610, ['old1', 'dado', 'old1', 'hand2'], h=760, dur=0.7, spread=170), props=[{'type': 'steam', 'x': 540, 'y': 1000, 'size': 360}])
# 20 "year." / "Today," — modern players in hoodies and red shirts, same field
sc(35.55, 'hood_field', 'Year: today — hoodies, red Boggin shirts, the same pile in the same field. Holds into "Today".',
   cam((0, 540, 1080, 1.1), (1.05, 560, 1070, 1.2)),
   actors=scrum(540, 1610, ['lad1', 'boggin', 'lad2', 'ren'], h=780, dur=1.1, spread=170), props=[{'type': 'steam', 'x': 540, 'y': 980, 'size': 380}])

# ---------------- 4. THE MODERN GAME ----------------
# 21 "the hat is a leather tube." — reveal: a Boggin holds up the leather tube, his mate shrugs at camera
sc(37.25, 'hood_field', 'Show-don\'t-narrate: a Boggin proudly holds the leather tube up like a trophy; next to him a player shrugs at camera ("that\'s the hat"). Push in.',
   cam((0, 540, 960, 1.5), (1.7, 560, 930, 1.7)),
   actors=[A('boggin', [{'t': 0, 'x': 420, 'y': 1610, 'face': 'grin', 'armR': [2.6, 0.2]}], h=820),
           A('lad1', [{'t': 0, 'x': 760, 'y': 1620, 'face': 'neutral', 'look': [-0.6, -0.4]}, {'t': 0.8, 'face': 'smug', 'look': [0, 0], 'armL': [0.5, 1.7], 'armR': [0.5, 1.7]}], h=800)],
   props=[{'type': 'leatherhood', 'hold': 'boggin.R', 'size': 240, 'glow': True}])
# 22 "No running, no throwing." — he tries to run; blocked. He winds up to throw; the Boggin glares
sc(39.12, 'hood_field', 'Gag: the player bolts with the tube (No running) — the Boggin\'s arm blocks him; he winds up to throw (No throwing) — the Boggin glares, finger raised.',
   cam((0, 540, 970, 1.35), (1.87, 560, 960, 1.42)),
   actors=[A('lad1', [{'t': 0, 'x': 440, 'y': 1620, 'view': 'side', 'facing': 1, 'face': 'grin', 'walk': True}, {'t': 0.45, 'x': 560, 'walk': False, 'face': 'shock', 'lean': -0.1},
                      {'t': 0.95, 'face': 'smug', 'lean': 0, 'armR': [2.8, 1.6]}, {'t': 1.25, 'face': 'worried'}], h=800),
           A('boggin', [{'t': 0, 'x': 780, 'y': 1630, 'view': 'side', 'facing': -1, 'face': 'neutral'}, {'t': 0.35, 'armR': [1.5, 0.1], 'face': 'angry'}, {'t': 1.15, 'armR': [2.6, 0.3]}], h=860)],
   props=[{'type': 'leatherhood', 'hold': 'lad1.R', 'size': 200}],
   fx=[{'type': 'exclaim', 't': 0.4, 'x': 780, 'y': 760, 'size': 150, 'dur': 0.6}])
# 23 "Just a giant scrum, shoving it to their favorite pub." — wide street: the pile crawls toward the glowing pub
sc(42.7, 'haxey_street', 'Wide street at dusk: the steaming scrum inches toward the glowing pub door. Parallax pan with the pile.',
   cam((0, 300, 1080, 1.0), (3.58, 520, 1080, 1.05)),
   actors=[{**a, 'keys': [{**k, 'x': k['x'] + k['t'] * 60} for k in a['keys']]} for a in scrum(160, 1640, ['lad2', 'boggin', 'lad1', 'ren', 'dado', 'boggin'], h=660, dur=3.6, spread=110)],
   props=[{'type': 'steam', 'keys': [{'t': 0, 'x': 160, 'y': 1150}, {'t': 3.58, 'x': 380}], 'size': 400}])
# 24 "It can take hours." — dissolve to night: the same pile, now exhausted under the moon
sc(44.4, 'night', 'Time skip: night, the same pile under the moon and lanterns, players drooping with sleepy faces, still shoving. Slow drift.',
   cam((0, 540, 1080, 1.15), (1.7, 540, 1080, 1.2)),
   actors=scrum(540, 1620, ['lad1', 'boggin', 'lad2', 'ren'], h=780, dur=1.8, sway=15, faces='sleepy', spread=170),
   fx=[{'type': 'zzz', 't': 0.3, 'x': 700, 'y': 760, 'size': 150, 'dur': 1.3}], tr='dissolve')
# 25 "Once, they shoved a car ten feet down the road." — Dutch chaos: the pile hits a parked car and it slides
sc(47.55, 'haxey_street', 'Dutch chaos: the scrum slams into a parked hatchback and it skids sideways down the road; shake; players\' shocked faces.',
   cam((0, 520, 1150, 1.15, {'roll': -7}), (3.15, 640, 1150, 1.2, {'roll': -9})),
   actors=[{**a, 'keys': [{**k, 'x': k['x'] + min(k['t'], 2.6) * 110, 'face': 'shock' if k['t'] >= 1.5 else k['face']} for k in a['keys']]} for a in scrum(220, 1660, ['lad2', 'boggin', 'lad1', 'dado'], h=720, dur=3.2, spread=120)],
   props=[{'type': 'car', 'size': 520, 'keys': [{'t': 0, 'x': 780, 'y': 1700}, {'t': 1.5, 'x': 780}, {'t': 2.7, 'x': 1060, 'rot': 0.04, 'ease': 'out'}]}],
   fx=[{'type': 'shake', 't': 1.5, 'amp': 16, 'dur': 0.6}, {'type': 'impact', 't': 1.5, 'x': 560, 'y': 1450, 'size': 260, 'dur': 0.5}, {'type': 'speedlines', 't': 1.6, 'x': 900, 'y': 1500, 'size': 380, 'dur': 0.8}])

# ---------------- 5. THE FOOL ----------------
FOOL_ON_STONE = 1600 - 110
# 26 "And the Fool?" — whip: today's Fool grins on the old stone by the church
sc(48.55, 'hood_field', 'Whip to today\'s Fool: red-and-yellow patched costume, standing on the old mounting stone by the church, grinning at camera. Teaser.',
   cam((0, 540, 890, 1.55), (1.0, 540, 880, 1.65)),
   actors=[A('fool', [{'t': 0, 'x': 540, 'y': FOOL_ON_STONE, 'face': 'grin', 'armL': [0.9, -1.9], 'armR': [0.9, -1.9]}])],
   props=[{'type': 'stone', 'x': 540, 'y': 1600, 'size': 380}], tr='whip')
# 27 "First, they hold him over burning straw…" — wide: crowd watches, the straw at his feet catches, smoke climbs
sc(51.37, 'hood_field', 'Wide by the church: the Fool keeps up his speech (mouth moving), damp straw at his feet catches and the smoke climbs up around him; players watch. Slow push.',
   cam((0, 540, 980, 1.1), (2.82, 540, 930, 1.3)),
   actors=[A('fool', [{'t': 0, 'x': 540, 'y': FOOL_ON_STONE, 'face': 'talk', 'armR': [2.2, 0.4]}, {'t': 1.6, 'armR': [1.2, 0.9], 'armL': [1.4, 0.6]}], speaks=[[0, 2.8]]),
           A('boggin', [{'t': 0, 'x': 140, 'y': 1660, 'view': 'side', 'facing': 1, 'face': 'grin'}], h=760),
           A('lad2', [{'t': 0, 'x': 950, 'y': 1660, 'view': 'side', 'facing': -1, 'face': 'happy'}], h=780)],
   props=[{'type': 'stone', 'x': 540, 'y': 1600, 'size': 380}, {'type': 'strawfire', 'x': 540, 'y': 1660, 'size': 360, 'smoke': 0}, {'type': 'smoke', 'x': 540, 'y': 1650, 'size': 820, 'keys': [{'t': 0, 'd': 0.1}, {'t': 2.8, 'd': 0.7}]}])
# 28 "and smoke him." — silence beat, then close-up: the Fool in a cloud of smoke, coughing… then grinning
sc(52.62, 'hood_field', 'Close-up after the music drops: the Fool engulfed in smoke, squinting and coughing — then a proud grin through the smoke.',
   cam((0, 540, 900, 1.5), (1.25, 540, 890, 1.6)),
   actors=[A('fool', [{'t': 0, 'x': 540, 'y': FOOL_ON_STONE, 'face': 'cough', 'squash': 0.97, 'armL': [1.2, 1.4]}, {'t': 0.7, 'face': 'grin', 'squash': 1, 'armL': [0.9, -1.9], 'armR': [0.9, -1.9]}])],
   props=[{'type': 'stone', 'x': 540, 'y': 1600, 'size': 380}, {'type': 'strawfire', 'x': 540, 'y': 1640, 'size': 420, 'smoke': 0}, {'type': 'smoke', 'x': 540, 'y': 1650, 'size': 1000, 'd': 1.0}])

# ---------------- 6. THE PUB ----------------
BAR = {'type': 'bar', 'x': 540, 'y': 1660, 'size': 1100}
# 29 "The winning pub pours beer on the hat…" — the landlady pours a jug over the tube on the bar
sc(54.75, 'pub_inside', 'Warm pub: the landlady tips a jug of beer over the leather tube lying on the bar; drops splash. Slow push.',
   cam((0, 500, 1060, 1.45), (2.13, 520, 1060, 1.58)),
   actors=[A('landlady', [{'t': 0, 'x': 300, 'y': 1560, 'face': 'grin', 'armR': [1.0, 0.5], 'look': [0.5, 0.6]}], h=780)],
   props=[{'type': 'hooks', 'x': 880, 'y': 1000, 'size': 260}, BAR,
          {'type': 'leatherhood', 'x': 765, 'y': 1661, 'oy': -455, 'size': 260, 'wet': False, 'keys': [{'t': 0, 'wet': False}, {'t': 0.9, 'wet': True}]},
          {'type': 'jug', 'hold': 'landlady.R', 'size': 200, 'dx': 10, 'dy': -40, 'keys': [{'t': 0, 'pour': 0}, {'t': 0.6, 'pour': 1}], 'fall': 95},
          {'type': 'drops', 'x': 765, 'y': 1662, 'oy': -470, 'size': 180, 'keys': [{'t': 0, 'visible': False}, {'t': 0.8, 'visible': True}]},
          {'type': 'pint', 'x': 120, 'y': 1663, 'oy': -440, 'size': 120}])
# 30 "and hangs it behind the bar…" — she hangs it on the two hooks; pull back, muddy players raise pints
sc(56.4, 'pub_inside', 'She hangs the dripping tube on its two hooks behind the bar; camera pulls back to show muddy players cheering with pints in front.',
   cam((0, 700, 1000, 1.5), (1.65, 560, 1080, 1.1, {'ease': 'out'})),
   actors=[A('landlady', [{'t': 0, 'x': 700, 'y': 1560, 'view': 'side', 'facing': 1, 'face': 'happy', 'armR': [2.6, 0.3]}, {'t': 0.8, 'armR': [0.3, 0.2], 'view': 'front'}], h=780),
           A('boggin', [{'t': 0, 'x': 220, 'y': 1760, 'face': 'grin', 'armR': [2.5, 0.3]}], h=760),
           A('lad1', [{'t': 0, 'x': 900, 'y': 1770, 'face': 'happy', 'armL': [2.4, 0.3]}], h=760)],
   props=[{'type': 'hooks', 'x': 880, 'y': 1000, 'size': 260}, BAR,
          {'type': 'leatherhood', 'hold': 'landlady.R', 'size': 240, 'wet': True, 'keys': [{'t': 0, 'visible': True}, {'t': 0.8, 'visible': False}]},
          {'type': 'leatherhood', 'x': 880, 'y': 1040, 'size': 240, 'wet': True, 'glow': True, 'keys': [{'t': 0, 'visible': False}, {'t': 0.8, 'visible': True}]},
          {'type': 'pint', 'hold': 'boggin.R', 'size': 110}, {'type': 'pint', 'hold': 'lad1.L', 'size': 110}])
# 31 "until next January." — push in on the hood on its hooks… loops back to the field
sc(round(DUR, 3), 'pub_inside', 'Slow push into the hood hanging on its hooks, glowing in the firelight — waiting for next January (loops into the hook\'s scrum).',
   cam((0, 860, 1060, 1.6), (1.64, 870, 1050, 1.9)),
   props=[{'type': 'hooks', 'x': 880, 'y': 1000, 'size': 260}, {'type': 'leatherhood', 'x': 880, 'y': 1040, 'size': 240, 'wet': True, 'glow': True}])

P['scenes'] = S
P['title'] = 'Two Villages Have Fought Over One Hat for 650 Years'
P['mood'] = 'normal'
P['music'] = {'on': True, 'track': 'medieval_ambient', 'start': 0, 'stops': [[51.3, 51.95]],
              'switch': [{'t': 35.0, 'track': 'epic_action', 'start': 0, 'xfade': 0.8}]}
P['mix'] = {'music': 0.08, 'musicPause': 0.14, 'sfx': 0.35}
cta_s = 27.3
P['cta'] = {'s': cta_s, 'e': cta_s + 2.6, 'tap': 0.95, 'text': 'More strange traditions'}
P['sfx'] = [
    {'t': 0.0, 'name': 'wind', 'dur': 1.4, 'fadeOut': 0.8, 'gain': 0.5},
    {'t': 1.4, 'name': 'impact_hit', 'dur': 0.8, 'fadeOut': 0.6, 'gain': 0.55},
    {'t': 3.2, 'name': 'impact_hit', 'dur': 0.8, 'fadeOut': 0.6, 'gain': 0.6},
    {'t': 4.6, 'name': 'pop', 'gain': 0.6},
    {'t': 4.75, 'name': 'sparkle_whoosh', 'dur': 1.0, 'fadeOut': 0.7, 'gain': 0.6},
    {'t': 5.8, 'name': 'whoosh_cinematic', 'dur': 1.2, 'fadeOut': 0.8, 'gain': 0.5},
    {'t': 6.0, 'name': 'footsteps_gravel', 'dur': 2.5, 'fadeOut': 1.0, 'gain': 0.35},
    {'t': 11.4, 'name': 'wind_howl', 'dur': 1.8, 'fadeOut': 1.0, 'gain': 0.7},
    {'t': 13.2, 'name': 'magic_sparkle', 'dur': 1.4, 'fadeOut': 0.9, 'gain': 0.5},
    {'t': 15.0, 'name': 'footsteps_gravel', 'dur': 2.2, 'fadeOut': 0.9, 'gain': 0.6},
    {'t': 16.1, 'name': 'water_splash', 'dur': 0.9, 'fadeOut': 0.6, 'gain': 0.55},
    {'t': 17.7, 'name': 'whoosh', 'gain': 0.6},
    {'t': 18.05, 'name': 'thud', 'gain': 0.5},
    {'t': 21.2, 'name': 'whoosh', 'gain': 0.45},
    {'t': 23.8, 'name': 'sparkle', 'gain': 0.5},
    {'t': 26.0, 'name': 'low_hit', 'dur': 0.9, 'fadeOut': 0.6, 'gain': 0.45},
    {'t': cta_s + 0.02, 'name': 'pop'}, {'t': cta_s + 0.95 + 0.1, 'name': 'ding'},
    {'t': 31.7, 'name': 'whoosh_cinematic', 'dur': 1.0, 'fadeOut': 0.6, 'gain': 0.5},
    {'t': 32.8, 'name': 'whoosh', 'gain': 0.5}, {'t': 33.87, 'name': 'impact_hit', 'dur': 0.6, 'fadeOut': 0.4, 'gain': 0.45}, {'t': 34.52, 'name': 'impact_hit', 'dur': 0.6, 'fadeOut': 0.4, 'gain': 0.5},
    {'t': 35.6, 'name': 'tada', 'gain': 0.35},
    {'t': 37.6, 'name': 'record_scratch', 'gain': 0.4},
    {'t': 39.2, 'name': 'footsteps_gravel', 'dur': 3.3, 'fadeOut': 1.0, 'gain': 0.45},
    {'t': 42.75, 'name': 'night_ambience', 'dur': 1.7, 'fadeOut': 0.8, 'gain': 0.5},
    {'t': 45.9, 'name': 'impact_boom', 'dur': 1.2, 'fadeOut': 0.8, 'gain': 0.7},
    {'t': 46.0, 'name': 'slide_up', 'gain': 0.4},
    {'t': 47.6, 'name': 'whoosh', 'gain': 0.5},
    {'t': 48.7, 'name': 'fire_crackle', 'dur': 3.9, 'fadeOut': 1.2, 'gain': 0.6},
    {'t': 52.75, 'name': 'water_splash', 'dur': 1.4, 'fadeOut': 0.8, 'gain': 0.5},
    {'t': 55.55, 'name': 'thud', 'gain': 0.4},
    {'t': 55.7, 'name': 'bell', 'dur': 1.6, 'fadeOut': 1.0, 'gain': 0.35},
]
# captions: timing drafts, star the key words, restore capitals
STAR = {'hat', 'crush', 'wind', 'silk', 'thirteen', 'mud', 'catches', 'shy', 'buddy', 'lord', 'fool', 'land', 'condition', 'again', 'every', 'single', 'year',
        'leather', 'running', 'throwing', 'scrum', 'pub', 'hours', 'car', 'straw', 'smoke', 'beer', 'bar', 'january'}
CAPS = {'england': 'England', 'lord': 'Lord', 'fool': 'Fool', 'january': 'January'}
caps = []
for c in T['captions']:
    words = []
    for w in c['text'].split():
        bare = re.sub(r'[^a-z0-9\']', '', w.lower())
        if bare in CAPS: w = w.lower().replace(bare, CAPS[bare])
        words.append(f'*{w}*' if bare in STAR else w)
    caps.append({'s': c['s'], 'e': c['e'], 'text': ' '.join(words)})
P['captions'] = caps
json.dump(P, open(os.path.join(D, 'project.json'), 'w'), indent=1)
print(len(S), 'scenes,', len(caps), 'captions, ends', S[-1]['end'])
