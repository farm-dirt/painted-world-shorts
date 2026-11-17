#!/usr/bin/env python3
# Builds project.json for "The Wedding of the Dead" from the timing + this shot plan.
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(D, 'timing.json')))
P = json.load(open(os.path.join(D, 'project.json')))
DUR = T['dur']
PI2 = 1.5708

def A(who, keys, h=820, **kw):
    d = {'who': who, 'h': h, 'keys': keys}; d.update(kw); return d
def cam(*keys): return [dict(zip(('t', 'x', 'y', 'zoom'), k[:4]), **(k[4] if len(k) > 4 else {})) for k in keys]

bride_lying = lambda: A('ana_bride', [{'t': 0, 'x': 880, 'y': 1268, 'rot': -PI2, 'face': 'rest', 'armL': [0.05, 0.1], 'armR': [0.05, 0.1]}], h=720)
bier = {'type': 'bier', 'x': 540, 'y': 1590, 'size': 820}
candles = [{'type': 'candle', 'x': 90, 'y': 1610, 'size': 300}, {'type': 'candle', 'x': 990, 'y': 1610, 'size': 300}]

S = []
def sc(end, loc, mood, desc, camera, actors=(), props=(), fx=(), tr='cut'):
    start = S[-1]['end'] if S else 0
    S.append({'id': f's{len(S)+1}', 'start': start, 'end': end, 'location': loc, 'mood': mood, 'transition': tr,
              'desc': desc, 'camera': camera, 'actors': list(actors), 'props': list(props), 'fx': list(fx)})

# 1 HOOK — the decorated fir alone in a candle-lit room: the strangest image first
sc(3.2, 'wake_room', 'eerie', 'HOOK frame 0: a fir tree dressed in wedding ribbons standing indoors between candles. Slow push = something is wrong here.',
   cam((0, 560, 690, 1.3), (3.2, 560, 680, 1.42)),
   props=[{'type': 'fir', 'x': 560, 'y': 1600, 'size': 1250, 'ribbons': True, 'hat': True, 'sway': 0.4}] + candles)
# 2 "And technically… it is." — parallax slide past the candles, the fir keeps its secret
sc(6.0, 'wake_room', 'eerie', 'Parallax slide across the room: candles slide past, the groom-tree sits like a guest of honour.',
   cam((0, 380, 1000, 1.15, {'roll': -2}), (2.8, 700, 980, 1.15, {'roll': 0})),
   props=[{'type': 'fir', 'x': 760, 'y': 1600, 'size': 1100, 'ribbons': True, 'hat': True}, {'type': 'candle', 'x': 300, 'y': 1650, 'size': 360}, {'type': 'candle', 'x': 1050, 'y': 1640, 'size': 320}])
# 3 "It's the groom. And the bride is dead." — REVEAL pull-back from the fir's bouquet to the bride on the bier
sc(9.0, 'wake_room', 'dark', 'Reveal: tight on the groom bouquet, pull back on "bride is dead" to show Ana in her veil on the bier beside the fir.',
   cam((0, 960, 560, 2.3), (0.85, 960, 590, 2.2), (2.4, 560, 1080, 1.0, {'ease': 'out'})),
   actors=[bride_lying()], props=[bier, {'type': 'fir', 'x': 960, 'y': 1600, 'size': 1050, 'ribbons': True, 'hat': True}, {'type': 'candle', 'x': 90, 'y': 1610, 'size': 300}],
   )
# 4 "You see, in the mountain villages of old Romania," — establishing wide, golden (contrast)
sc(12.3, 'carp_village', 'normal', 'Establishing wide of the Carpathian village at golden hour; slow push in = "come and see how they do it here".',
   cam((0, 540, 900, 0.95), (3.3, 560, 920, 1.06)),
   actors=[A('baba', [{'t': 0, 'x': 260, 'y': 1590, 'view': 'side', 'facing': 1, 'walk': True}, {'t': 3.3, 'x': 400, 'walk': True}], h=640),
           A('petru', [{'t': 0, 'x': 860, 'y': 1610, 'face': 'neutral', 'look': [-0.4, 0]}], h=760)])
# 5 "dying single meant your life wasn't finished." — Ana alive, the life that got cut short
sc(15.6, 'fir_mountain', 'normal', 'Memory: Ana alive in a flower meadow at dawn, laughing, spinning with arms out. Show-don\'t-narrate: the life that was cut short.',
   cam((0, 540, 1060, 1.25), (3.3, 560, 1020, 1.4)),
   actors=[A('ana', [{'t': 0, 'x': 520, 'y': 1600, 'face': 'happy', 'armL': [1.4, 0.2], 'armR': [1.4, 0.2]},
                     {'t': 1.0, 'view': 'side', 'facing': 1, 'face': 'grin'}, {'t': 1.6, 'view': 'front', 'face': 'happy', 'headTilt': 0.12},
                     {'t': 2.4, 'view': 'side', 'facing': -1, 'face': 'grin'}, {'t': 3.0, 'view': 'front', 'face': 'happy'}])],
   fx=[{'type': 'sparkle', 't': 0.6, 'x': 640, 'y': 820, 'size': 160, 'dur': 1.2}])
# 6 "So when a girl like Ana dies at nineteen," — close-up, she looks up; light fades out
sc(18.5, 'fir_mountain', 'normal', 'Emotional close-up: Ana looks up into the sun, smile softening. Fade out = her life ends.',
   cam((0, 540, 1000, 2.0), (2.9, 540, 990, 2.15)),
   actors=[A('ana', [{'t': 0, 'x': 540, 'y': 1600, 'face': 'happy', 'look': [0.3, -0.5]}, {'t': 1.8, 'face': 'neutral', 'look': [0.2, -0.7]}])],
   tr='dissolve')
# 7 "the village does what any normal village would do." — the dry joke: they look at each other, then nod
sc(22.1, 'carp_village', 'tense', 'Dry beat: Mama, Baba and Petru in the square glance at each other... then Mama sets her jaw and nods. Hold the deadpan.',
   cam((0, 540, 990, 1.3), (3.6, 540, 975, 1.36)),
   actors=[A('baba', [{'t': 0, 'x': 250, 'y': 1610, 'face': 'sad', 'view': 'side', 'facing': 1}, {'t': 1.2, 'face': 'neutral', 'look': [0.6, 0]}], h=640),
           A('mama', [{'t': 0, 'x': 540, 'y': 1620, 'face': 'sad'}, {'t': 1.0, 'look': [-0.6, 0]}, {'t': 1.6, 'look': [0.6, 0]}, {'t': 2.3, 'face': 'smug', 'look': [0, 0], 'armL': [0.9, -1.9], 'armR': [0.9, -1.9], 'ease': 'snap'}], h=760),
           A('petru', [{'t': 0, 'x': 840, 'y': 1610, 'face': 'sad', 'view': 'side', 'facing': -1}, {'t': 2.4, 'face': 'neutral', 'view': 'front'}], h=820)],
   fx=[{'type': 'question', 't': 0.9, 'x': 540, 'y': 700, 'size': 120, 'dur': 0.8}])
# 8 "They throw her a wedding anyway." — pop: the gate bursts into ribbons
sc(23.8, 'carp_village', 'normal', 'Pop cut: the carved gate is dressed in wedding ribbons, Vasile hangs the last one, arms up. Absurd cheer.',
   cam((0, 540, 1150, 1.05), (1.7, 540, 1140, 1.12)),
   actors=[A('vasile', [{'t': 0, 'x': 330, 'y': 1610, 'face': 'grin', 'armR': [2.6, 0.2], 'armL': [0.3, 0.2]}]),
           A('baba', [{'t': 0, 'x': 790, 'y': 1610, 'face': 'happy', 'armL': [2.0, 0.6]}], h=640)],
   props=[{'type': 'gate', 'x': 560, 'y': 1500, 'size': 700, 'ribbons': True}],
   fx=[{'type': 'sparkle', 't': 0.1, 'x': 560, 'y': 760, 'size': 200, 'dur': 1.0}], tr='pop')
# 9 "But there's a problem." — back inside, Mama worried at the bier
sc(25.5, 'wake_room', 'eerie', 'Back in the candle room: Mama stands by the bier, worried, looking at the empty side. Lower angle, quiet.',
   cam((0, 600, 1150, 1.25, {'roll': 3}), (1.7, 620, 1140, 1.32)),
   actors=[bride_lying(), A('mama', [{'t': 0, 'x': 920, 'y': 1660, 'face': 'worried', 'view': 'side', 'facing': -1, 'look': [-0.6, 0.3]}], h=760)],
   props=[bier, {'type': 'candle', 'x': 90, 'y': 1610, 'size': 300}])
# 10 "Ana has no groom." — the empty place beside her (show, don't narrate)
sc(27.0, 'wake_room', 'eerie', 'Close on the EMPTY space on the floor beside the bride, one candle; slow push into nothing.',
   cam((0, 860, 1300, 1.7), (1.5, 880, 1320, 1.85)),
   actors=[bride_lying()], props=[bier, {'type': 'candle', 'x': 1080, 'y': 1610, 'size': 300}])
# 11 "So at dawn, the young men climb the mountain" — golden dawn, three lads climb (CTA over this calm beat)
sc(29.7, 'fir_mountain', 'normal', 'Wide golden dawn: Ion, Petru and Vasile walk uphill among the firs. Calm beat for the subscribe button.',
   cam((0, 540, 1000, 0.95), (2.7, 600, 980, 1.02)),
   actors=[A('vasile', [{'t': 0, 'x': -40, 'y': 1610, 'walk': True}, {'t': 2.7, 'x': 330, 'walk': True}], h=700),
           A('ion', [{'t': 0, 'x': 110, 'y': 1620, 'walk': True}, {'t': 2.7, 'x': 480, 'walk': True}], h=720),
           A('petru', [{'t': 0, 'x': 250, 'y': 1630, 'walk': True}, {'t': 2.7, 'x': 620, 'walk': True}], h=760)],
   props=[{'type': 'axe', 'hold': 'petru.R', 'size': 300}])
# 12 "and find the fir" — Ion holds Ana's red ribbon up against a young fir: does it look like her?
sc(32.2, 'fir_mountain', 'normal', 'Show-don\'t-narrate: Ion holds Ana\'s red ribbon up next to a slim young fir, squinting, comparing; the others lean in.',
   cam((0, 600, 1050, 1.35), (2.5, 640, 1030, 1.45)),
   actors=[A('ion', [{'t': 0, 'x': 430, 'y': 1610, 'view': 'side', 'facing': 1, 'face': 'neutral', 'armR': [2.0, 0.3]}, {'t': 1.4, 'face': 'awe'}]),
           A('vasile', [{'t': 0, 'x': 200, 'y': 1620, 'view': 'side', 'facing': 1, 'face': 'neutral', 'lean': 0.06}], h=780)],
   props=[{'type': 'fir', 'x': 820, 'y': 1610, 'size': 1000}, {'type': 'ribbon', 'hold': 'ion.R', 'size': 220}])
# 13 "that looks the most like her." — hero low angle on the chosen fir, rays
sc(34.7, 'fir_mountain', 'normal', 'Hero low angle up the chosen fir, sun rays behind it: this is the groom.',
   cam((0, 540, 1150, 1.15, {'roll': 4}), (2.5, 540, 1100, 1.28, {'roll': 3})),
   actors=[A('ion', [{'t': 0, 'x': 180, 'y': 1660, 'view': 'side', 'facing': 1, 'face': 'awe', 'look': [0.4, -0.6]}], h=820)],
   props=[{'type': 'fir', 'x': 640, 'y': 1620, 'size': 1300, 'sway': 0.6}],
   fx=[{'type': 'sparkle', 't': 0.4, 'x': 640, 'y': 600, 'size': 200, 'dur': 1.4}])
# 14 "They ask it to forgive them." — heads bowed, axe lowered
sc(36.75, 'fir_mountain', 'tense', 'Three lads bow their heads to the fir, Petru lowers the axe. Wide, still, respectful.',
   cam((0, 560, 1100, 1.1), (2.0, 560, 1080, 1.16)),
   actors=[A('vasile', [{'t': 0, 'x': 170, 'y': 1620, 'view': 'side', 'facing': 1, 'face': 'sad', 'look': [0.3, 0.8], 'lean': 0.08}], h=740),
           A('ion', [{'t': 0, 'x': 330, 'y': 1630, 'view': 'side', 'facing': 1, 'face': 'sad', 'look': [0.3, 0.8], 'lean': 0.08}], h=760),
           A('petru', [{'t': 0, 'x': 480, 'y': 1640, 'view': 'side', 'facing': 1, 'face': 'sad', 'look': [0.3, 0.8], 'lean': 0.08}], h=800)],
   props=[{'type': 'fir', 'x': 820, 'y': 1620, 'size': 1150}, {'type': 'axe', 'x': 610, 'y': 1650, 'size': 300, 'rot': 0.5}])
# 15 "Then they tell it the lie." — Ion leans in and whispers, sly
sc(38.5, 'fir_mountain', 'eerie', 'Close-up: Ion leans to the trunk, hand at his mouth, sly guilty smirk, eyes sliding to camera.',
   cam((0, 640, 960, 2.0), (1.75, 660, 950, 2.15)),
   actors=[A('ion', [{'t': 0, 'x': 520, 'y': 1610, 'view': 'side', 'facing': 1, 'face': 'smug', 'lean': 0.1, 'armR': [1.2, 1.4]}, {'t': 1.0, 'look': [-0.6, 0]}])],
   props=[{'type': 'fir', 'x': 820, 'y': 1610, 'size': 1100}])
# 16 "That it's going to a wedding." — the fir "perks up", Ion grins
sc(40.65, 'fir_mountain', 'normal', 'The fir sways happily as if it heard; sparkle; Ion grins at camera. A tiny joke in a sad story.',
   cam((0, 640, 1050, 1.3), (2.1, 640, 1030, 1.4, {'ease': 'back'})),
   actors=[A('ion', [{'t': 0, 'x': 380, 'y': 1620, 'face': 'grin', 'look': [-0.2, 0]}])],
   props=[{'type': 'fir', 'x': 760, 'y': 1610, 'size': 1100, 'sway': 2.5}],
   fx=[{'type': 'sparkle', 't': 0.3, 'x': 760, 'y': 760, 'size': 240, 'dur': 1.4}])
# 17 "And it does." — whip: the fir, now in ribbons, framed in the wedding gate
sc(42.0, 'carp_village', 'normal', 'Whip cut: the fir, now in ribbons, stands framed inside the decorated gate. Payoff of the lie.',
   cam((0, 540, 1080, 1.15), (1.35, 540, 1060, 1.22)),
   props=[{'type': 'gate', 'x': 540, 'y': 1560, 'size': 760, 'ribbons': True}, {'type': 'fir', 'x': 540, 'y': 1570, 'size': 800, 'ribbons': True, 'hat': True}],
   tr='whip')
# 18 "They carry it down singing," — the lads carry the fir down the slope on their shoulders
sc(43.6, 'fir_mountain', 'normal', 'Procession: the three lads walk downhill to the left, the fir on their shoulders, mouths open singing.',
   cam((0, 600, 1050, 1.0), (1.6, 500, 1050, 1.05)),
   actors=[A('vasile', [{'t': 0, 'x': 380, 'y': 1610, 'walk': True, 'facing': -1, 'face': 'talk', 'armR': [2.3, 0.6]}, {'t': 1.6, 'x': 200, 'walk': True}], h=760, speaks=[[0, 1.6]]),
           A('ion', [{'t': 0, 'x': 640, 'y': 1610, 'walk': True, 'facing': -1, 'face': 'talk', 'armR': [2.3, 0.6]}, {'t': 1.6, 'x': 460, 'walk': True}], h=760, speaks=[[0, 1.6]]),
           A('petru', [{'t': 0, 'x': 900, 'y': 1610, 'walk': True, 'facing': -1, 'face': 'talk', 'armR': [2.3, 0.6]}, {'t': 1.6, 'x': 720, 'walk': True}], h=780, speaks=[[0, 1.6]])],
   props=[{'type': 'fir', 'size': 900, 'ribbons': True, 'keys': [{'t': 0, 'x': 1100, 'y': 800, 'rot': -1.5}, {'t': 1.6, 'x': 920, 'y': 800, 'rot': -1.5}]}])
# 19 "dress it in ribbons, and stand it beside the bride." — Mama ties the last ribbon beside the bier
sc(45.1, 'wake_room', 'eerie', 'Inside: the fir stands beside the bride; Mama reaches up and ties the last red ribbon. Bride and groom, side by side.',
   cam((0, 700, 1150, 1.15), (1.5, 680, 1130, 1.22)),
   actors=[bride_lying(), A('mama', [{'t': 0, 'x': 1080, 'y': 1660, 'view': 'side', 'facing': -1, 'face': 'sad', 'armR': [2.2, 0.4]}], h=760)],
   props=[bier, {'type': 'fir', 'x': 960, 'y': 1600, 'size': 1050, 'ribbons': True, 'hat': True}, {'type': 'candle', 'x': 90, 'y': 1610, 'size': 300}])
# 20 "The whole village cries at the party." — ribbons everywhere, everyone in tears
sc(47.95, 'carp_village', 'tense', 'Wedding colours, funeral faces: villagers under the ribboned gate, all crying. Slow pull back.',
   cam((0, 540, 1050, 1.25), (2.85, 540, 1080, 1.05, {'ease': 'out'})),
   actors=[A('baba', [{'t': 0, 'x': 160, 'y': 1620, 'face': 'sad'}], h=640), A('vasile', [{'t': 0, 'x': 330, 'y': 1610, 'face': 'sad'}], h=760),
           A('mama', [{'t': 0, 'x': 540, 'y': 1630, 'face': 'sad', 'armL': [1.2, 1.4], 'armR': [1.2, 1.4]}], h=760),
           A('ion', [{'t': 0, 'x': 750, 'y': 1610, 'face': 'sad'}], h=780), A('petru', [{'t': 0, 'x': 920, 'y': 1620, 'face': 'sad'}], h=800)],
   props=[{'type': 'gate', 'x': 540, 'y': 1500, 'size': 800, 'ribbons': True}])
# 21 "But there's an old reason the groom has to be a fir." — cemetery at dusk, the fir planted by her cross
sc(50.8, 'cemetery', 'eerie', 'Dusk cemetery: the ribboned fir planted beside Ana\'s wooden cross with a bridal wreath. Mama walks away. Slow push = the open question.',
   cam((0, 560, 1050, 1.1), (2.85, 600, 1020, 1.25)),
   actors=[A('mama', [{'t': 0, 'x': 260, 'y': 1620, 'view': 'side', 'facing': -1, 'walk': True, 'face': 'sad'}, {'t': 2.85, 'x': 80, 'walk': True}], h=700)],
   props=[{'type': 'cross', 'x': 520, 'y': 1600, 'size': 520, 'wreath': True}, {'type': 'fir', 'x': 760, 'y': 1610, 'size': 950, 'ribbons': True}],
   tr='fade')
# 22 "Cut one down…" — the stump, the axe still in it (silence)
sc(52.45, 'fir_mountain', 'dark', 'Silence. Close on a fresh stump on the mountain, the axe still in it. Hard, still frame.',
   cam((0, 540, 1380, 1.7), (1.65, 540, 1400, 1.8)),
   props=[{'type': 'stump', 'x': 540, 'y': 1600, 'size': 520, 'axe': True}])
# 23 "and it never grows back." — same stump, empty, needles on the ground; push in
sc(54.3, 'fir_mountain', 'dark', 'The axe is gone; dry needles around the stump; slow push. Nothing will grow here.',
   cam((0, 540, 1420, 1.5), (1.85, 540, 1440, 1.75)),
   props=[{'type': 'stump', 'x': 540, 'y': 1600, 'size': 520, 'needles': True}])
# 24 "Just like her." — night, the fir by her cross, ribbons in the wind; pull back -> loops to frame 0 (the fir)
sc(round(DUR, 3), 'cemetery', 'dark', 'Night: the fir stands by her cross, the veil on the cross stirs. Pull back slowly; loops into the opening fir.',
   cam((0, 640, 1000, 1.45), (1.2, 640, 1020, 1.32)),
   props=[{'type': 'cross', 'x': 480, 'y': 1600, 'size': 560, 'wreath': True, 'veil': True}, {'type': 'fir', 'x': 760, 'y': 1610, 'size': 1100, 'ribbons': True, 'sway': 0.8}])

P['scenes'] = S
P['title'] = 'The Wedding of the Dead'
P['mood'] = 'eerie'
P['music'] = {'on': True, 'track': 'dark_mystery_piano', 'start': 0, 'stops': [[23.85, 24.7], [50.55, 52.5]]}
P['mix'] = {'music': 0.08, 'musicPause': 0.14, 'sfx': 0.35}
cta_s = 27.6
P['cta'] = {'s': cta_s, 'e': cta_s + 2.6, 'tap': 0.95, 'text': 'More strange customs'}
P['sfx'] = [
    {'t': 0.0, 'name': 'wind', 'dur': 3.0, 'fadeOut': 1.2, 'gain': 0.6},
    {'t': 6.85, 'name': 'suspense_sting', 'dur': 2.0, 'fadeOut': 1.0, 'gain': 0.8},
    {'t': 9.1, 'name': 'bell', 'dur': 2.6, 'fadeOut': 1.4, 'gain': 0.5},
    {'t': 22.12, 'name': 'sparkle_whoosh', 'dur': 1.2, 'fadeOut': 0.8, 'gain': 0.7},
    {'t': 23.9, 'name': 'low_hit', 'dur': 1.2, 'fadeOut': 0.8, 'gain': 0.7},
    {'t': 27.1, 'name': 'footsteps_gravel', 'dur': 2.5, 'fadeOut': 0.9, 'gain': 0.5},
    {'t': cta_s + 0.02, 'name': 'pop'}, {'t': cta_s + 0.95 + 0.1, 'name': 'ding'},
    {'t': 34.8, 'name': 'low_hit', 'dur': 1.0, 'fadeOut': 0.8, 'gain': 0.45},
    {'t': 36.8, 'name': 'riser', 'dur': 1.6, 'fadeOut': 0.8, 'gain': 0.5},
    {'t': 38.6, 'name': 'magic_sparkle', 'dur': 1.5, 'fadeOut': 0.9, 'gain': 0.7},
    {'t': 40.66, 'name': 'whoosh_cinematic', 'dur': 1.0, 'fadeOut': 0.6, 'gain': 0.7},
    {'t': 42.0, 'name': 'footsteps_gravel', 'dur': 1.6, 'fadeOut': 0.8, 'gain': 0.45},
    {'t': 45.15, 'name': 'bell', 'dur': 2.4, 'fadeOut': 1.3, 'gain': 0.4},
    {'t': 47.98, 'name': 'wind_howl', 'dur': 2.6, 'fadeOut': 1.3, 'gain': 0.45},
    {'t': 51.1, 'name': 'impact_hit', 'dur': 1.0, 'fadeOut': 0.8, 'gain': 0.9},
    {'t': 54.35, 'name': 'bell', 'dur': 1.1, 'fadeOut': 0.8, 'gain': 0.45},
]
# captions: timing drafts, star the key words, restore capitals
STAR = {'tree', 'wedding', 'groom', 'dead', 'romania', 'single', 'nineteen', 'anyway', 'problem', 'fir', 'forgive', 'lie', 'ribbons', 'cries', 'never', 'her'}
caps = []
for c in T['captions']:
    words = []
    for w in c['text'].split():
        bare = re.sub(r'[^a-z\']', '', w.lower())
        if bare == 'ana': w = w.replace('ana', 'Ana')
        if bare == 'romania': w = w.replace('romania', 'Romania')
        words.append(f'*{w}*' if bare in STAR else w)
    caps.append({'s': c['s'], 'e': c['e'], 'text': ' '.join(words)})
P['captions'] = caps
json.dump(P, open(os.path.join(D, 'project.json'), 'w'), indent=1)
print(len(S), 'scenes,', len(caps), 'captions, ends', S[-1]['end'])
