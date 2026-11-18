#!/usr/bin/env python3
# Builds project.json for "Never Answer the Woods" (painted-world) from timing.json + this shot plan.
# Cast: ren = Toby, tala = little Pip, lola = Nan.
# Light script: ridge_camp (moonlit clearing, campfire = the only warm/safe light) -> deep_woods (the voice)
#               -> tent_in (trapped, dim). Mood arc: eerie hook -> normal (camp) -> tense -> eerie -> dark at the call/twist -> eerie loop.
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(D, 'timing.json')))
P = json.load(open(os.path.join(D, 'project.json')))
DUR = round(T['dur'], 3)
PI2 = 1.5708

def A(who, keys, h=820, **kw):
    d = {'who': who, 'h': h, 'keys': keys}; d.update(kw); return d
def K(t, **kw):
    d = {'t': t}; d.update(kw); return d
def cam(*keys): return [dict(zip(('t', 'x', 'y', 'zoom'), k[:4]), **(k[4] if len(k) > 4 else {})) for k in keys]
def pr(type_, x, y, size, keys=None, **kw):
    d = {'type': type_, 'x': x, 'y': y, 'size': size}; d.update(kw)
    if keys: d['keys'] = keys
    return d
def bubble(x, y, size, text, t_in, color='#ece4ff', tail='down', t_out=None, **kw):
    keys = [K(0, pop=0 if t_in > 0 else 1)]
    if t_in > 0: keys += [K(t_in - 0.01, pop=0), K(t_in + 0.22, pop=1, ease='back')]
    if t_out: keys += [K(t_out, pop=1), K(t_out + 0.15, pop=0)]
    return pr('bubble', x, y, size, keys, text=text, color=color, tail=tail, **kw)
def eyes(x, y, size, t_open=0.0, seed=0.0):
    keys = [K(0, open=0 if t_open > 0 else 1)]
    if t_open > 0: keys += [K(t_open, open=0), K(t_open + 0.25, open=1, ease='out')]
    return pr('eyes', x, y, size, keys, seed=seed)

REL = [0.2, 0.15]
CALL = [1.9, 0.6]          # hand cupped by the mouth, about to call back
FIRE = lambda f=1: pr('campfire', 600, 1610, 120, flame=f)
TENT = lambda x=170, g=1: pr('tent', x, 1600, 600, glow=g)

S = []
def sc(end, loc, mood, desc, camera, actors=(), props=(), fx=(), tr='cut'):
    start = S[-1]['end'] if S else 0
    S.append({'id': f's{len(S)+1}', 'start': start, 'end': end, 'location': loc, 'mood': mood, 'transition': tr,
              'desc': desc, 'camera': camera, 'actors': list(actors), 'props': list(props), 'fx': list(fx)})

# 1 HOOK (frame 0): the woods are calling Toby by name and he is about to answer.
sc(1.84, 'ridge_camp', 'eerie', 'FRAME 0: glowing eyes in the pines + a "Toby...?" bubble; Toby cups a hand to call back, then freezes. Slow push = dread.',
   cam((0, 560, 900, 1.1), (1.84, 570, 880, 1.18)),
   [A('ren', [K(0, x=320, y=1600, view='front', facing=1, face='happy', armR=CALL, armL=REL, look=[1, -0.2]),
              K(0.9, face='shock', hop=14, squash=1.05, ease='back'), K(1.2, hop=0, squash=1, armR=[0.6, 0.3])])],
   [eyes(790, 1060, 160), bubble(720, 900, 150, 'Toby...?', 0, tail='right'),
    pr('hooktext', 0, 9000, 96, [K(0, pop=1), K(1.65, pop=1), K(1.8, pop=0)], text="WHO'S CALLING?", sy=600, sx=500)])
# 2 establishing wide: the camp, warm fire = the one safe light
sc(5.22, 'ridge_camp', 'normal', 'Establishing wide: moonlit Appalachian ridges, tent glowing, campfire, the three campers. Slow push = settling in.',
   cam((0, 540, 1020, 0.95), (1.7, 545, 1025, 0.99), (3.38, 550, 1030, 1.03)),
   [A('lola', [K(0, x=290, y=1610, face='neutral', look=[0.5, 0])]),
    A('tala', [K(0, x=440, y=1615, face='happy', look=[0.5, -0.3]), K(1.2, look=[1, -0.1]), K(2.4, look=[-0.4, -0.2])]),
    A('ren', [K(0, x=760, y=1605, face='happy', look=[-0.6, 0.2], armR=[1.2, 0.6]), K(1.8, face='grin')])],
   [TENT(), FIRE()])
# 3 "Toby," — close, goofy wave
sc(6.02, 'ridge_camp', 'normal', 'Medium close on Toby on his name: big goofy wave (introduce by picture).',
   cam((0, 760, 880, 1.5), (0.8, 762, 875, 1.55)),
   [A('ren', [K(0, x=760, y=1605, face='grin', armR=REL), K(0.1, armR=[2.6, 0.6], ease='back'), K(0.35, armR=[2.3, 1.0]), K(0.6, armR=[2.6, 0.6])])],
   [FIRE()])
# 4 "little Pip, and Nan." — two-shot, Pip hops, camera springs to Nan pushing up her glasses
sc(7.6, 'ridge_camp', 'normal', 'Two-shot Pip + Nan by the fire: Pip hops on her name, camera springs to Nan adjusting her glasses.',
   cam((0, 400, 1240, 1.45), (0.65, 400, 1240, 1.45), (0.95, 330, 1200, 1.55, {'ease': 'spring'})),
   [A('lola', [K(0, x=290, y=1610, face='neutral'), K(0.95, armR=[2.5, 2.6], face='smug'), K(1.45, armR=REL)]),
    A('tala', [K(0, x=470, y=1615, face='happy'), K(0.1, hop=30), K(0.3, hop=0)])],
   [FIRE()])
# 5 "And Nan has one rule out here." — hero low angle on tiny Nan, one finger up
sc(9.85, 'ridge_camp', 'tense', 'Hero low angle on Nan (tiny but in charge): one finger up, stern. Fire glow on her face.',
   cam((0, 420, 1180, 1.75, {'roll': 3}), (2.25, 425, 1170, 1.85, {'roll': 3})),
   [A('lola', [K(0, x=380, y=1610, face='neutral'), K(0.32, armR=[2.8, 0.15], face='angry', ease='back'), K(1.8, face='smug')])],
   [FIRE()])
# 6 "If something in the trees calls your name..." — over Pip's shoulder into the woods; eyes open on "name"
sc(12.18, 'ridge_camp', 'tense', 'Over-the-shoulder: Pip looks at the black tree line; the eyes open on "calls your name"; Pip freezes.',
   cam((0, 600, 1250, 1.35), (2.33, 640, 1240, 1.48)),
   [A('tala', [K(0, x=420, y=1615, view='front', facing=1, face='neutral', look=[1, -0.3]), K(1.6, face='shock', hop=10, ease='back'), K(1.9, hop=0, face='scared')])],
   [eyes(820, 1120, 120, 1.4, 0.4)])
# 7 "...you don't answer." — Nan close, slow head shake
sc(13.62, 'ridge_camp', 'tense', 'Emotional close-up: Nan, firelight, slowly shakes her head. No smile.',
   cam((0, 300, 1160, 2.0), (0.25, 300, 1165, 2.18, {'ease': 'back'}), (1.44, 302, 1160, 2.24)),
   [A('lola', [K(0, x=300, y=1610, face='angry', look=[0, 0.1], lean=0.1, armR=[2.7, 0.2], ease='back'),
               K(0.25, headTilt=-0.14, squash=1.05), K(0.5, headTilt=0.14, squash=1), K(0.75, headTilt=-0.14), K(1.0, headTilt=0.1), K(1.25, headTilt=0)])],
   [FIRE()], [{'type': 'shake', 't': 0.15, 'amp': 14, 'dur': 0.3}])
# 8 "Mountain folks say something out here can copy any voice." — into the woods, rings pulse
sc(17.35, 'deep_woods', 'eerie', 'Slow push into the dark trunks: the eyes, sound rings pulsing out of the dark = the voice.',
   cam((0, 560, 1060, 1.1), (1.3, 560, 1060, 1.18, {'ease': 'linear'}), (2.6, 560, 1062, 1.26, {'ease': 'linear'}), (3.73, 560, 1065, 1.34, {'ease': 'linear'})),
   props=[eyes(560, 1060, 170, 0, 0.9), pr('rings', 560, 1065, 240, [K(0, a=0), K(0.8, a=1)])])
# 9 triplet: copied voices
sc(20.46, 'deep_woods', 'eerie', "Three bubbles pop out of the dark in other people's colours: Sweetie? / Duuude! / Toby-boy? (the copying, shown).",
   cam((0, 560, 1040, 1.2), (1.0, 580, 1040, 1.24, {'ease': 'spring'}), (2.1, 540, 1050, 1.3, {'ease': 'spring'}), (3.11, 545, 1050, 1.34)),
   props=[eyes(560, 1120, 140, 0, 1.7),
          bubble(380, 860, 150, 'Sweetie?', 0.18, color='#ffd9e0', tail='right'),
          bubble(760, 980, 150, 'Duuude!', 1.07, color='#d2f3e2', tail='left'),
          bubble(420, 1250, 150, 'Toby-boy?', 2.18, color='#ece4ff', tail='right')])
# 10 "Toby rolls his eyes." — close on Toby, slow eye roll
sc(22.0, 'ridge_camp', 'normal', 'Close on Toby, warm fire light: slow, huge eye roll, smug head tilt (the doubter).',
   cam((0, 760, 860, 1.85), (1.54, 760, 855, 1.93)),
   [A('ren', [K(0, x=760, y=1605, face='smug'), K(0.3, look=[0.3, -1], headTilt=-0.15), K(0.9, look=[-0.6, -0.6]), K(1.3, look=[0, 0], headTilt=-0.05)])],
   [FIRE()])
# 11 the taunt — the picture adds the beak joke
sc(24.64, 'ridge_camp', 'normal', 'Two-shot: Toby flaps his hand like a beak on "parrot"; Nan is NOT impressed. The one dry joke.',
   cam((0, 540, 1010, 1.2), (2.64, 545, 1000, 1.25)),
   [A('lola', [K(0, x=380, y=1610, view='front', facing=1, face='neutral'), K(1.8, face='smug')]),
    A('ren', [K(0, x=680, y=1605, view='front', facing=-1, face='grin', armR=REL)] +
             [K(1.2 + i * 0.14, armR=[1.15, 2.4 if i % 2 == 0 else 1.8], ease='snap') for i in range(8)] + [K(2.35, armR=REL)])],
   [FIRE(), dict(bubble(470, 2600, 120, 'Relax, Nan!', 0.25, color='#e6f2e0', tail='right', ink='#2e3a2a'), dy=-1830)])
# 12 "But Pip isn't laughing." — close on Pip staring at the woods
sc(26.42, 'ridge_camp', 'tense', 'Close on Pip staring at the woods, worried, sweat bead. The fire dims behind her.',
   cam((0, 470, 1240, 1.95), (1.78, 478, 1245, 2.05)),
   [A('tala', [K(0, x=460, y=1615, view='front', facing=1, face='scared', look=[1, -0.2], armL=[1.2, 1.4], armR=[1.2, 1.4], lean=-0.06),
               K(0.6, x=440, lean=-0.1, squash=0.97), K(1.0, look=[1, 0.1]), K(1.4, squash=1)])],
   [FIRE(0.8)], [{'type': 'sweat', 't': 0.3, 'dur': 1.2, 'x': 540, 'y': 1130, 'size': 80}, {'type': 'shake', 't': 0.05, 'amp': 5, 'dur': 1.6}])
# 13 "Lights out." — tent glow + fire die
sc(27.4, 'ridge_camp', 'eerie', 'Wide on the tent: lantern and campfire go out on "Lights out." The warm light is gone.',
   cam((0, 400, 1200, 1.15),),
   props=[TENT(330, 1) | {'keys': [K(0, glow=1), K(0.12, glow=1), K(0.16, glow=0, ease='snap')]},
          pr('campfire', 760, 1610, 120, [K(0, flame=0.8), K(0.2, flame=0, ease='out')])])
# 14 "Then, from the dark, someone calls Toby's name." — the woods; bubble on the name
sc(31.0, 'deep_woods', 'dark', 'Black woods, slow push: the eyes open, then a lilac bubble: "Toby...?" on his name.',
   cam((0, 560, 1080, 1.05), (1.2, 560, 1077, 1.18, {'ease': 'linear'}), (2.4, 558, 1072, 1.32, {'ease': 'linear'}), (3.6, 556, 1070, 1.45, {'ease': 'linear'})),
   props=[eyes(560, 1080, 160, 0.9, 0.2), bubble(440, 900, 150, 'Toby...?', 2.5, tail='right')])
# 15 "In Nan's voice. Soft. Worried." — tent: Toby wakes, shock on "Nan's"
sc(34.05, 'tent_in', 'eerie', 'Dark tent: Toby wakes; shock on "Nan\'s voice"; worried + sweat on "Worried". Bubble at the door flap.',
   cam((0, 580, 880, 1.5), (3.05, 585, 870, 1.58)),
   [A('ren', [K(0, x=660, y=1600, face='sleepy', look=[-0.5, 0.3]), K(0.3, face='shock', hop=12, ease='back'), K(0.55, hop=0), K(1.1, look=[-1, 0]), K(2.6, face='worried')])],
   [bubble(420, 1060, 120, 'Toby...?', 0.15, tail='left')],
   [{'type': 'sweat', 't': 2.6, 'dur': 0.9, 'x': 740, 'y': 760, 'size': 80}])
# 16 "Toby grabs the flashlight." — click, beam to the door
sc(35.73, 'tent_in', 'eerie', 'Toby grabs the flashlight, click, the beam swings to the door.',
   cam((0, 590, 940, 1.3), (1.68, 570, 935, 1.35)),
   [A('ren', [K(0, x=660, y=1600, view='front', facing=-1, face='worried', armR=REL), K(0.5, armR=[1.5, 0.25], face='angry', ease='back')])],
   [pr('flashlight', 0, 0, 72, [K(0, visible=False), K(0.45, visible=True, beam=0), K(0.85, beam=0), K(0.9, beam=1, ease='snap')], hold='ren.R', rot=3.14, len=650)])
# 17 "One step outside. Two." — low Dutch angle, steps toward the woods
sc(37.8, 'ridge_camp', 'eerie', 'Outside, low Dutch angle: Toby steps toward the woods, beam on the trunks. Step... step.',
   cam((0, 520, 980, 1.25, {'roll': -5}), (2.07, 560, 975, 1.33, {'roll': -6})),
   [A('ren', [K(0, x=330, y=1605, view='front', facing=1, face='worried', armR=[1.5, 0.25]),
              K(0.1, x=330, walk=True), K(0.5, x=450, walk=True), K(0.55, walk=False),
              K(1.35, x=450, walk=True), K(1.75, x=560, walk=True), K(1.8, walk=False)])],
   [TENT(180, 0), pr('flashlight', 0, 0, 72, hold='ren.R', beam=1, len=800, rot=-0.05), eyes(760, 1050, 110, 1.6, 0.6)])
# 18 "Pip pulls him back. Listen to the tent." — yank, then both turn; camera swings to the tent
sc(40.34, 'ridge_camp', 'eerie', 'Pip runs in and yanks Toby back. On "Listen to the tent" both turn; the camera swings to the dark tent.',
   cam((0, 480, 1070, 1.08), (1.4, 470, 1070, 1.08), (1.7, 400, 1065, 1.12, {'ease': 'spring'}), (2.54, 395, 1062, 1.15)),
   [A('ren', [K(0, x=560, y=1605, view='front', facing=1, face='worried', armR=[1.5, 0.25]), K(0.3, x=560),
              K(0.5, x=480, lean=-0.2, face='shock', ease='back'), K(0.9, lean=0), K(1.5, facing=-1, look=[-1, 0], face='worried')]),
    A('tala', [K(0, x=230, y=1615, view='front', facing=1, face='angry', walk=True), K(0.3, x=400, walk=True), K(0.32, walk=False, armR=[1.6, 0.2]),
               K(1.0, armR=REL), K(1.5, facing=-1, look=[-1, 0], face='worried')])],
   [TENT(180, 0), pr('flashlight', 0, 0, 72, hold='ren.R', beam=1, len=600, rot=0)])
# 19 the clue: unzip, lift the blanket, light on her face
sc(45.37, 'tent_in', 'tense', "Inside: Pip slips in through the flap, lifts the blanket, then the beam lands on Nan's face (spring push-in).",
   cam((0, 560, 1170, 1.12), (2.0, 560, 1172, 1.15), (3.85, 540, 1175, 1.18), (4.15, 330, 1250, 1.7, {'ease': 'spring'}), (5.03, 330, 1248, 1.8)),
   [A('lola', [K(0, x=330, y=1680, face='snore', headTilt=0.22, armL=[0.05, 0.1], armR=[0.05, 0.1])]),
    A('tala', [K(0, x=680, y=1730, visible=False), K(0.8, visible=True, x=680, face='worried', facing=-1, view='front'),
               K(0.9, x=680, walk=True), K(1.7, x=610, walk=True), K(1.75, walk=False, facing=-1),
               K(2.2, armL=[1.7, 0.3], ease='back'), K(2.8, armL=REL), K(3.5, armR=[1.25, 0.2]), K(3.86, visible=False)])],
   [pr('blanket', 330, 1720, 470, [K(0, lift=0), K(2.25, lift=0), K(2.6, lift=1, ease='back')], hk=1.3),
    pr('flashlight', 0, 0, 62, [K(0, beam=0.5), K(3.55, beam=0.5), K(3.6, beam=1), K(3.86, visible=False)], hold='tala.R', rot=3.3, len=420),
    pr('spot', 330, 1220, 240, [K(0, a=0), K(3.6, a=0), K(3.8, a=0.6)])])
# 20 "Eyes shut. Mouth open. Snoring." — extreme close-up on Nan, comic relief
sc(48.45, 'tent_in', 'tense', "Extreme close-up of Nan asleep in the beam: punch on 'Eyes shut', 'Mouth open', zzz on 'Snoring'. Comic relief before the drop.",
   cam((0, 330, 1235, 2.3), (3.08, 330, 1232, 2.42)),
   [A('lola', [K(0, x=330, y=1680, face='snore', headTilt=0.22, armL=[0.05, 0.1], armR=[0.05, 0.1]), K(1.0, headTilt=0.28), K(2.2, headTilt=0.2)])],
   [pr('blanket', 330, 1720, 470, lift=0.0, hk=0.55), pr('spot', 330, 1220, 260, a=0.6)],
   [{'type': 'shake', 't': 0.22, 'amp': 6, 'dur': 0.2}, {'type': 'shake', 't': 1.22, 'amp': 6, 'dur': 0.2},
    {'type': 'zzz', 't': 2.3, 'dur': 0.9, 'x': 450, 'y': 1080, 'size': 110}])
# 21 "Nan never left the tent." — double take, turn to the open flap
sc(50.33, 'tent_in', 'dark', 'Toby and Pip look at Nan, then at each other: double take, then slowly turn to the open flap.',
   cam((0, 560, 1040, 1.08), (1.88, 555, 1035, 1.12)),
   [A('tala', [K(0, x=420, y=1615, view='front', facing=1, face='worried', look=[0.8, 0])]),
    A('ren', [K(0, x=700, y=1605, view='front', facing=-1, face='worried', look=[-0.8, 0.3]),
              K(0.6, face='shock', hop=0, squash=1.06, ease='back'), K(0.9, squash=1), K(1.4, look=[-1, -0.2])])],
   [pr('flashlight', 0, 0, 62, hold='tala.R', beam=1, len=360, rot=0.4)])
# 22 "And out in the trees... the voice calls again. Closer." — eyes snap closer
sc(54.18, 'deep_woods', 'dark', 'Woods, darker: bubble "Tobyyy..."; on "Closer." the eyes snap BIG and the camera punches in.',
   cam((0, 560, 1070, 1.15), (0.9, 562, 1070, 1.19), (1.9, 560, 1070, 1.24), (3.15, 560, 1070, 1.3), (3.22, 560, 1070, 1.85, {'ease': 'snap'}), (3.85, 560, 1070, 1.92)),
   props=[pr('eyes', 560, 1070, 170, [K(0, open=1)], seed=0.7), bubble(430, 890, 150, 'Tobyyy...?', 1.5, tail='right', t_out=3.1)],
   fx=[{'type': 'shake', 't': 3.22, 'amp': 18, 'dur': 0.35}])
# 23 "Because whatever is out there... just learned a new voice. Pip's." — the one big hit
sc(58.5, 'tent_in', 'dark', "Tent: Toby and Pip clutch each other facing the open flap. On \"Pip's.\" a violet bubble pops at the door; Pip claps hands over her own mouth. Big hit.",
   cam((0, 540, 1090, 1.0), (1.8, 540, 1082, 1.03, {'ease': 'linear'}), (3.6, 540, 1075, 1.05, {'ease': 'linear'})),
   [A('tala', [K(0, x=300, y=1615, face='scared', look=[0.4, -0.3], armR=[0.9, 1.2]), K(1.2, look=[0.6, 0.2]),
               K(3.6, face='shock', armL=[1.2, 1.4], armR=[1.2, 1.4], squash=1.06, ease='snap'), K(3.9, squash=1)]),
    A('ren', [K(0, x=740, y=1605, face='worried', look=[-0.3, -0.3], armL=[0.9, 1.2]), K(2.4, look=[-0.6, 0.2]), K(3.65, face='shock', armL=[2.4, 0.3], armR=[2.4, 0.3])])],
   [pr('eyes', 540, 1150, 110, [K(0, open=0), K(1.7, open=0), K(1.95, open=1)], seed=0.3),
    dict(bubble(610, 2700, 150, "Toby? It's Pip!", 3.6, color='#ddcbff', tail='down'), dy=-1430)],
   [{'type': 'shake', 't': 3.62, 'amp': 50, 'dur': 0.45}, {'type': 'flash', 't': 3.6, 'dur': 0.18}])
# 24 loop back to frame 0
sc(DUR, 'ridge_camp', 'eerie', "Back outside: Toby faces the woods again, hand cupped to answer; the camera settles on frame 0's framing (loop).",
   cam((0, 540, 940, 0.98), (1.5, 550, 920, 1.04), (2.4, 556, 910, 1.07), (round(DUR - 58.5, 3), 560, 900, 1.1)),
   [A('ren', [K(0, x=320, y=1600, view='front', facing=1, face='worried', armR=REL, look=[1, -0.2]),
              K(0.8, look=[1, 0]), K(1.6, face='happy', armR=CALL, ease='inout')])],
   [eyes(790, 1060, 160, 0.5, 0.0)])

P['scenes'] = S
P['title'] = 'Never Answer the Woods'
P['mood'] = 'eerie'
P['music'] = {'on': True, 'track': 'dark_mystery_piano', 'start': 0, 'stops': [[57.39, 57.79]],
              'then': [{'t': 27.4, 'track': 'horror_atmosphere', 'xfade': 1.2}]}
P['mix'] = {'music': 0.08, 'musicPause': 0.14, 'sfx': 0.35}
CS = 33.0
P['cta'] = {'s': CS, 'e': CS + 2.6, 'tap': 0.95, 'text': 'More Strange Legends'}
sf = []
def s_(t, name, **kw): d = {'t': round(t, 3), 'name': name}; d.update(kw); sf.append(d)
s_(0.0, 'night_ambience', gain=0.3, dur=23, fadeOut=1.0); s_(22.0, 'night_ambience', gain=0.3, dur=22, fadeIn=1.0, fadeOut=1.0); s_(43.0, 'night_ambience', gain=0.3, dur=18.8, fadeIn=1.0)
s_(0.02, 'suspense_sting', gain=0.55, dur=1.6, fadeOut=0.6)
s_(0.9, 'low_hit', gain=0.45, dur=0.9, fadeOut=0.4)
s_(1.9, 'fire_crackle', gain=0.35, dur=5.5, fadeIn=0.4, fadeOut=0.8)
s_(5.35, 'pop', gain=0.4, dur=0.4, fadeOut=0.2); s_(6.15, 'pop', gain=0.35, dur=0.4, fadeOut=0.2)
s_(7.95, 'whoosh', gain=0.35)
s_(11.0, 'door_creak', gain=0.45, dur=1.0, fadeOut=0.4); s_(11.4, 'low_hit', gain=0.35, dur=0.8, fadeOut=0.4)
s_(12.4, 'heartbeat', gain=0.35, dur=1.2, fadeOut=0.4)
s_(13.7, 'horror_drone', gain=0.35, dur=3.6, fadeIn=0.4, fadeOut=1.0)
s_(17.53, 'pop', gain=0.55, dur=0.5, fadeOut=0.2); s_(18.42, 'pop', gain=0.55, dur=0.5, fadeOut=0.2); s_(19.53, 'pop', gain=0.55, dur=0.5, fadeOut=0.2)
s_(20.6, 'fire_crackle', gain=0.3, dur=5.6, fadeIn=0.3, fadeOut=0.8)
s_(23.35, 'boing', gain=0.4)
s_(24.9, 'heartbeat', gain=0.4, dur=1.6, fadeOut=0.5)
s_(26.6, 'tick', gain=0.7)
s_(27.5, 'horror_drone', gain=0.3, dur=3.4, fadeIn=0.5, fadeOut=0.8)
s_(28.3, 'door_creak', gain=0.4, dur=1.0, fadeOut=0.4)
s_(29.95, 'pop', gain=0.35, dur=0.4, fadeOut=0.2)
s_(31.3, 'low_hit', gain=0.5, dur=0.8, fadeOut=0.4)
s_(32.3, 'heartbeat', gain=0.35, dur=1.4, fadeOut=0.5)
s_(CS + 0.02, 'pop', gain=0.5, dur=0.5, fadeOut=0.2); s_(CS + 0.95 + 0.1, 'ding', gain=0.4)
s_(34.95, 'tick', gain=0.7)
s_(35.85, 'footsteps_gravel', gain=0.7, dur=0.5, fadeOut=0.2); s_(37.1, 'footsteps_gravel', gain=0.7, dur=0.5, fadeOut=0.2)
s_(38.3, 'whoosh', gain=0.6)
s_(40.6, 'paper_rip', gain=0.5, dur=0.8, fadeOut=0.3)
s_(42.6, 'paper_rustle', gain=0.5, dur=0.7, fadeOut=0.3)
s_(44.0, 'whoosh_cinematic', gain=0.4, dur=1.0, fadeOut=0.4)
s_(45.6, 'pop', gain=0.3, dur=0.3, fadeOut=0.1); s_(46.6, 'pop', gain=0.3, dur=0.3, fadeOut=0.1)
s_(47.7, 'slide_down', gain=0.45)
s_(49.05, 'impact_hit', gain=0.45, dur=0.8, fadeOut=0.4)
s_(50.4, 'heartbeat', gain=0.45, dur=3.6, fadeIn=0.3, fadeOut=0.6)
s_(51.85, 'pop', gain=0.35, dur=0.4, fadeOut=0.2)
s_(53.53, 'monster_growl', gain=0.3, dur=1.0, fadeOut=0.5); s_(53.55, 'low_hit', gain=0.5, dur=0.8, fadeOut=0.4)
s_(54.5, 'riser', gain=0.45, dur=2.9, fadeIn=0.5, fadeOut=0.3)
s_(57.39, 'heartbeat', gain=0.5, dur=0.4, fadeOut=0.1)
s_(57.8, 'impact_hit', gain=0.8, dur=1.2, fadeOut=0.6); s_(57.8, 'low_hit', gain=0.6, dur=1.0, fadeOut=0.5)
s_(58.6, 'horror_drone', gain=0.3, dur=3.2, fadeIn=0.6, fadeOut=0.0)
P['sfx'] = sorted(sf, key=lambda d: d['t'])

# captions: timing drafts, names fixed, key words starred
NAMES = {'toby': 'Toby', "toby's": "Toby's", 'pip': 'Pip', "pip's": "Pip's", 'nan': 'Nan', "nan's": "Nan's", 'west': 'West', 'virginia': 'Virginia'}
STAR = {'woods', 'rule', "don't", 'answer', 'voice', 'parrot', 'laughing', 'out', 'flashlight', 'listen', 'snoring', 'never', 'closer', "pip's", 'say'}
caps = []
for c in T['captions']:
    out, starred = [], 0
    for w in c['text'].split():
        bare = re.sub(r"[^a-z']", '', w.lower())
        w2 = NAMES.get(bare, w) if bare in NAMES else w
        if bare in STAR and starred < 2: w2 = f'*{w2}*'; starred += 1
        out.append(w2)
    caps.append({'s': c['s'], 'e': c['e'], 'text': ' '.join(out)})
P['captions'] = caps
json.dump(P, open(os.path.join(D, 'project.json'), 'w'), indent=1)
print(len(S), 'scenes,', len(caps), 'captions, ends', S[-1]['end'])
