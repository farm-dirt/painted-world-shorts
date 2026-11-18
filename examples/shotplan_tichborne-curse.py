#!/usr/bin/env python3
# Builds project.json for "The Tichborne Curse" (painted-world) from timing.json + this shot plan.
# Light script: manor_lawn (dusk, the bread line = today's ritual) -> manor_hall (warm firelight = the past, the deal)
#   -> dusk_field (cold frost, the crawl) -> aerial_field (the glowing loop) -> manor_hall dark (the curse)
#   -> manor_lawn golden (centuries of giving) -> manor_lawn night (the stop, the collapse) -> golden morning (today) -> eerie loop.
# Mood arc: eerie hook -> tense -> warm/normal (the past) -> eerie (crawl) -> dark (curse) -> normal (centuries) -> dark (1796) -> normal -> eerie end.
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

REL = [0.2, 0.15]
HIPS = [0.9, -1.9]
GIVE = [1.4, 0.3]            # arm reaching forward (handing something)
TORCH_UP = [2.5, 0.2]
MANOR = lambda **kw: pr('manor', 560, 1440, 1150, **kw)
TABLE = lambda x=560, **kw: pr('breadtable', x, 1640, 520, **kw)
HEARTH = pr('fire', 1180, 1490, 260)
BED = pr('bed', 300, 1600, 700)
# kneel-crawl: feet sunk below a front 'bank' of ground (hides the shins), body leaning forward, torch held out
def CRAWL(who, x, y0=1600, keys0=None, h=760, facing=1):
    return A(who, [K(0, x=x, y=y0 + h * 0.26, view='side', facing=facing, rot=0.42 * facing, face='angry', armR=[1.5, 0.15], armL=[1.1, 0.3], look=[0.7, 0.3])] + (keys0 or []), h=h)
FROST = lambda y, size=560, **kw: pr('bank', 540, y, size, **kw)
LAWN = lambda y, size=560, **kw: pr('bank', 540, y, size, top='#7d9450', bot='#5f7a44', grass='#9ab06a', **kw)

S = []
def sc(end, loc, mood, desc, camera, actors=(), props=(), fx=(), tr='cut'):
    start = S[-1]['end'] if S else 0
    S.append({'id': f's{len(S)+1}', 'start': start, 'end': end, 'location': loc, 'mood': mood, 'transition': tr,
              'desc': desc, 'camera': camera, 'actors': list(actors), 'props': list(props), 'fx': list(fx)})

# 1 HOOK frame 0 — "This family gives away free food every year." A glowing ghost crawls through the field in front;
#   behind her, the family hands out bread at the lit manor.
sc(2.45, 'manor_lawn', 'eerie', 'FRAME 0: a pale glowing ghost-woman crawls toward us through the dusk grass, torch held out; behind her the lord hands bread to a villager at the lit manor. Slow push = she is coming.',
   cam((0, 540, 1040, 1.05), (2.45, 560, 1030, 1.13)),
   [A('henry', [K(0, x=230, y=1500, view='side', facing=1, face='worried', armR=GIVE, armL=REL, look=[0.8, 0])], h=480),
    A('peas_w', [K(0, x=440, y=1505, view='side', facing=-1, face='happy', armR=[1.3, 0.3])], h=440),
    CRAWL('ghost', 700, 1620, [K(2.45, x=640)], h=760, facing=-1)],
   [pr('manor', 330, 1440, 760, lit=True), pr('breadtable', 335, 1520, 260), pr('torch', 0, 0, 230, hold='ghost.R', ghost=True, rot=0.5),
    LAWN(1840, 600),
    pr('hooktext', 0, 9000, 90, [K(0, pop=1), K(1.9, pop=1), K(2.05, pop=0)], text='FREE FOOD… OR ELSE', sy=640, sx=540)])
# 2 "every year." — wide: the long line of villagers at the manor gate, lit windows
sc(4.2, 'manor_lawn', 'eerie', 'Wide: the manor with lit windows, a long line of villagers waiting with baskets. The same ritual, every year.',
   cam((0, 540, 1000, 0.92), (1.75, 540, 990, 0.98)),
   [A('peas_m', [K(0, x=180, y=1640, view='side', facing=1)], h=640), A('peas_k', [K(0, x=290, y=1650, view='side', facing=1, face='happy')], h=560),
    A('peas_w', [K(0, x=380, y=1645, view='side', facing=1)], h=620), A('henry', [K(0, x=820, y=1640, view='side', facing=-1, face='neutral', armR=GIVE)], h=660)],
   [MANOR(lit=True), pr('breadtable', 650, 1660, 380), pr('basket', 300, 1600, 90, hold='peas_w.R')])
# 3 "If they stop," — close: he pulls the loaf back (testing it) — tense
sc(5.55, 'manor_lawn', 'tense', 'Close-up: the lord slowly pulls the loaf back to his chest, sly… what if he just didn\'t?',
   cam((0, 470, 890, 1.9), (1.35, 470, 880, 2.05)),
   [A('henry', [K(0, x=470, y=1600, view='side', facing=1, face='neutral', armR=GIVE, look=[0.6, 0]), K(0.5, face='smug', armR=[0.9, 1.5], look=[0.9, 0.1])])],
   [pr('loaf', 0, 0, 110, hold='henry.R')])
# 4 "bad things happen." — the manor cracks and shakes, the field torch flares — dark
sc(7.45, 'manor_lawn', 'dark', 'The house shudders: a crack races down the wall, windows go dark, the ghost torch flares in the field. He drops the loaf.',
   cam((0, 540, 1000, 1.0, {'roll': -3}), (2.0, 540, 1010, 1.08, {'roll': -6})),
   [A('henry', [K(0, x=300, y=1640, view='front', face='shock', hop=20, armL=[2.3, 0.3], armR=[2.3, 0.3], ease='back'), K(0.4, hop=0, face='scared')], h=640),
    CRAWL('ghost', 820, 1440, None, h=300, facing=-1)],
   [MANOR(keys=[K(0, crack=0), K(1.4, crack=1)]), pr('bank', 820, 1530, 220, top='#7d9450', bot='#5f7a44', grass='#9ab06a', w=1.6), pr('loaf', 380, 1650, 80), pr('torch', 0, 0, 120, hold='ghost.R', ghost=True, rot=0.5, keys=[K(0, burn=1), K(0.6, burn=2.2), K(1.6, burn=1.4)])],
   [{'type': 'shake', 't': 0.3, 'amp': 14, 'dur': 1.2}])
# 5 "You see, a rich man's wife is dying." — back in time: the great hall, she lies in the four-poster, candle
sc(10.4, 'manor_hall', 'normal', 'Dissolve to long ago: firelit great hall, the old lady lies in a four-poster bed, eyes half closed. Slow push.',
   cam((0, 360, 1180, 1.3), (2.95, 330, 1180, 1.45)),
   [A('mabella', [K(0, x=620, y=1322, rot=-PI2, face='sad', armL=[0.1, 0.1], armR=[0.1, 0.1])], h=560)],
   [BED, pr('quilt', 330, 1400, 640), pr('candle', 720, 1560, 170), HEARTH], tr='dissolve')
# 6 "Her husband hates sharing." — the dry joke: he hugs his coin pile, glares at the camera
sc(12.3, 'manor_hall', 'normal', 'Dry joke: the husband hunches over a glittering coin pile, hugs it closer and glares at us.',
   cam((0, 560, 980, 1.55), (1.9, 560, 970, 1.68, {'ease': 'out'})),
   [A('roger', [K(0, x=560, y=1640, view='front', face='smug', armL=[1.3, 1.0], armR=[1.3, 1.0], look=[0.3, 0.4]), K(1.0, face='angry', look=[0, 0], lean=0.06)])],
   [pr('coins', 560, 1660, 360, shine=True), HEARTH])
# 7 "She wants free food for poor people," — close on her, reaching out from the bed
sc(14.45, 'manor_hall', 'normal', 'Close-up: she lifts a shaky hand toward him, pleading, eyes wet.',
   cam((0, 250, 1120, 2.0), (2.15, 250, 1115, 2.15)),
   [A('mabella', [K(0, x=620, y=1322, rot=-PI2, face='worried', armL=[0.1, 0.1], armR=[0.1, 0.1], look=[0.6, 0]), K(0.6, armR=[1.5, 0.4])], h=560)],
   [BED, pr('quilt', 330, 1400, 640)])
# 8 "every year." — double-take: Roger's shocked face
sc(16.0, 'manor_hall', 'normal', 'Double-take: the husband looks over, freezes… then SHOCK, hop, arms up. Every YEAR?',
   cam((0, 600, 860, 1.7), (1.55, 600, 850, 1.9, {'ease': 'back'})),
   [A('roger', [K(0, x=600, y=1600, view='side', facing=-1, face='neutral', look=[-0.6, 0]), K(0.35, view='front', face='shock', hop=24, squash=1.07, armL=[2.4, 0.3], armR=[2.4, 0.3], ease='back'), K(0.7, hop=0, squash=1)])],
   [HEARTH])
# 9 "He grabs a burning stick," — he pulls a burning stick from the hearth, sly grin (he has a trick)
sc(17.55, 'manor_hall', 'normal', 'At the hearth he yanks a burning stick out of the fire and grins: he has a trick.',
   cam((0, 900, 960, 1.4), (1.55, 860, 950, 1.5)),
   [A('roger', [K(0, x=800, y=1610, view='side', facing=1, face='smug', armR=[1.3, 0.2]), K(0.5, armR=TORCH_UP, face='grin', ease='back')])],
   [HEARTH, pr('torch', 0, 0, 230, hold='roger.R')])
# 10 "any land she goes around before it burns out feeds the poor," — the frosty field, he waves at the whole field
sc(21.05, 'dusk_field', 'tense', 'The frosty field at dusk: he hands her the torch and sweeps his arm across the huge field. Smug: she can barely stand.',
   cam((0, 540, 1050, 1.0), (3.5, 580, 1060, 1.12)),
   [A('roger', [K(0, x=700, y=1600, view='side', facing=-1, face='smug', armL=[1.8, 0.2], armR=HIPS), K(1.6, armL=[2.2, 0.1], look=[1, -0.2], view='front'), K(2.8, face='grin')], h=760),
    A('mabella', [K(0, x=330, y=1610, view='side', facing=1, face='worried', armR=[1.4, 0.3], look=[0.6, 0]), K(2.2, look=[0.3, -0.3], face='sad')], h=700)],
   [pr('torch', 0, 0, 220, hold='mabella.R')])
# 11 "she's too sick to walk," — she tries to stand, wobbles, sinks to her knees
sc(23.0, 'dusk_field', 'eerie', 'Medium: she takes one step, wobbles and sinks to her knees in the frost. The torch dips.',
   cam((0, 440, 1150, 1.45), (1.95, 440, 1190, 1.55)),
   [A('mabella', [K(0, x=440, y=1600, view='side', facing=1, face='worried', armR=[1.4, 0.3]), K(0.8, lean=0.12, face='sad', headTilt=0.15), K(1.4, y=1600 + 700 * 0.26, rot=0.3, lean=0, face='sad', ease='in')], h=700)],
   [pr('torch', 0, 0, 220, hold='mabella.R'), FROST(1800, 500)])
# 12 "so she crawls." — HERO low angle: on her knees she drags forward through the frost, torch held out, jaw set
sc(24.2, 'dusk_field', 'eerie', 'Hero low angle: on her knees she pushes forward through the frost, torch held out, jaw set. The sun dies behind her.',
   cam((0, 480, 1250, 1.3, {'roll': 4}), (1.2, 560, 1240, 1.4, {'roll': 3})),
   [CRAWL('mabella', 380, 1600, [K(1.2, x=500)], h=760)],
   [pr('torch', 0, 0, 230, hold='mabella.R'), FROST(1820, 560)])
# 13 "Then she puts…" — AERIAL show-don't-narrate: a glowing torch trail closes a giant loop around the field
sc(25.6, 'aerial_field', 'eerie', 'Aerial straight down: a glowing trail of torchlight finishes a giant loop around the whole field (23 acres).',
   cam((0, 540, 960, 0.95), (1.4, 540, 960, 1.02)),
   props=[pr('trail', 540, 960, 1200, [K(0, p=0.62), K(1.35, p=1, ease='out')])])
# 14 "…a curse on the family." — close-up in torchlight: she points, eyes burning; flash
sc(27.95, 'dusk_field', 'dark', 'Close-up, night falling: she raises the dying torch and points straight at him, furious. The flame gutters out on "family".',
   cam((0, 420, 990, 2.0), (2.35, 430, 980, 2.2)),
   [A('mabella', [K(0, x=430, y=1640, view='side', facing=1, face='angry', armL=[1.6, 0.1], armR=TORCH_UP, look=[1, 0])], h=720)],
   [pr('torch', 0, 0, 200, hold='mabella.R', keys=[K(0, burn=1), K(1.6, burn=1), K(2.3, burn=0.05)])],
   [{'type': 'flash', 't': 1.25, 'dur': 0.18}])
# 15 "If they stop, they get seven boys," — dark hall: seven cradles with blue blankets pop in, one by one, rocking
CR = [(170, 1420), (420, 1420), (670, 1420), (920, 1420), (295, 1620), (545, 1620), (795, 1620)]
sc(29.95, 'manor_hall', 'dark', 'Dark hall: seven cradles with blue blankets and ribbons pop in, one by one, rocking. Seven boys.',
   cam((0, 550, 1240, 1.2), (2.0, 550, 1230, 1.27)),
   props=[pr('cradle', x, y, 290, [K(0, pop=0), K(0.55 + i * 0.16, pop=0), K(0.75 + i * 0.16, pop=1, ease='back')], ribbon='#3f78d0', blanket='#a9c6f0', seed=i) for i, (x, y) in enumerate(CR)])
# 16 "then seven girls." — seven more cradles, all pink
sc(30.9, 'manor_hall', 'dark', 'Hard cut: seven cradles again — now every blanket and ribbon is pink.',
   cam((0, 550, 1240, 1.27), (0.95, 550, 1235, 1.33)),
   props=[pr('cradle', x, y, 290, [K(0, pop=0), K(0.04 * i, pop=0), K(0.04 * i + 0.15, pop=1, ease='back')], ribbon='#e5689a', blanket='#f6bfd3', seed=i + 3) for i, (x, y) in enumerate(CR)])
# 17 "Then no boys to keep the name." — the family crest cracks and fades away
sc(32.85, 'manor_hall', 'dark', 'The blue family crest above the hearth cracks… and fades to nothing. The name is gone.',
   cam((0, 540, 1050, 1.5), (1.95, 540, 1060, 1.65)),
   props=[HEARTH, pr('crest', 540, 1150, 420, [K(0, crack=0, fade=0), K(0.7, crack=1), K(1.3, fade=0), K(1.9, fade=1)])],
   fx=[{'type': 'shake', 't': 0.7, 'amp': 6, 'dur': 0.35}])
# 18 "For hundreds of years, they keep giving." — golden day, fade = time skip; generations hand out bread (CTA here)
sc(36.2, 'manor_lawn', 'normal', 'Fade (time skip) to golden day: the family hands out bread to a happy line of villagers. Calm beat for the subscribe button.',
   cam((0, 540, 1050, 1.02), (3.35, 560, 1040, 1.1)),
   [A('heir', [K(0, x=760, y=1620, view='side', facing=-1, face='happy', armR=GIVE)], h=720),
    A('peas_w', [K(0, x=470, y=1640, view='side', facing=1, face='happy', armR=[1.3, 0.3])], h=680),
    A('peas_k', [K(0, x=330, y=1650, view='side', facing=1, face='grin', hop=0), K(1.6, hop=18), K(1.9, hop=0)], h=520),
    A('peas_m', [K(0, x=170, y=1650, view='side', facing=1, face='happy')], h=700)],
   [MANOR(lit=False), TABLE(600), pr('loaf', 0, 0, 90, hold='heir.R')], tr='fade')
# 19 "Then one man stops." — 1796: he nails up a notice NO MORE BREAD and shoos people off, smug; dusk
sc(38.15, 'manor_lawn', 'tense', 'Then Sir Henry: arms crossed by a notice "NO MORE FREE BREAD", the empty table, villagers walk away sad.',
   cam((0, 470, 1080, 1.4), (1.95, 470, 1070, 1.5)),
   [A('henry', [K(0, x=560, y=1620, view='front', face='smug', armL=HIPS, armR=HIPS)], h=800),
    A('peas_w', [K(0, x=180, y=1640, view='side', facing=-1, face='sad', walk=True), K(1.95, x=40, walk=True)], h=700)],
   [pr('notice', 300, 1660, 420, text='NO MORE|FREE BREAD'), pr('breadtable', 800, 1660, 400, empty=True)])
# 20 "Part of his house falls down." — night: the right wing collapses, dust, shake
sc(39.55, 'manor_lawn', 'dark', 'Night. After a silent beat the whole right wing of the manor tears off and crashes down in dust.',
   cam((0, 560, 1020, 0.98, {'roll': -2}), (1.4, 560, 1060, 1.05, {'roll': -5})),
   [A('henry', [K(0, x=180, y=1680, view='front', face='scared', armL=[1.2, 1.4], armR=[1.2, 1.4])], h=560)],
   [MANOR(keys=[K(0, crack=1, fall=0), K(0.15, fall=0), K(0.9, fall=1, ease='in')]), pr('dust', 760, 1440, 520, [K(0, a=0), K(0.55, a=0), K(0.8, a=1), K(1.4, a=0.8)])],
   [{'type': 'shake', 't': 0.55, 'amp': 20, 'dur': 0.8}])
# 21 "He has seven boys," — seven little boys pop into a line in front of a stunned Henry
sc(41.05, 'manor_hall', 'eerie', 'Seven little boys pop into a line in front of a stunned Henry. The first part of the curse.',
   cam((0, 520, 1110, 1.3), (1.5, 520, 1105, 1.36)),
   [A('henry', [K(0, x=860, y=1600, view='side', facing=-1, face='shock')], h=780)] +
   [A(['boy1', 'boy2', 'boy3'][i % 3], [K(0, x=150 + i * 95, y=1640 + (i % 2) * 20, visible=False), K(0.12 + i * 0.12, visible=True, face='happy', hop=16), K(0.32 + i * 0.12, hop=0)], h=470) for i in range(7)])
# 22 "his oldest boy has seven girls." — the oldest, grown up, with seven girls
sc(43.45, 'manor_hall', 'eerie', 'Time jump: the oldest son, grown up, stands proudly… then seven little girls pop in beside him.',
   cam((0, 520, 1030, 1.28), (2.4, 520, 1040, 1.3)),
   [A('heir', [K(0, x=860, y=1600, view='front', face='happy'), K(1.6, view='side', facing=-1, face='worried')], h=800)] +
   [A(['girl1', 'girl2', 'girl3'][i % 3], [K(0, x=150 + i * 95, y=1640 + (i % 2) * 20, visible=False), K(0.5 + i * 0.13, visible=True, face='happy', hop=16), K(0.7 + i * 0.13, hop=0)], h=450) for i in range(7)])
# 23 "No boys," — tight close-up, he realises (horror)
sc(44.15, 'manor_hall', 'dark', 'Tight close-up: the oldest son\'s face drains — no boys. Push in.',
   cam((0, 540, 900, 2.2), (0.7, 540, 895, 2.45)),
   [A('heir', [K(0, x=540, y=1600, view='front', face='scared', armL=[1.2, 1.4], armR=[1.2, 1.4])])],
   fx=[{'type': 'sweat', 't': 0.1, 'x': 640, 'y': 880, 'size': 70, 'dur': 0.6}])
# 24 "so they start giving again." — whip: he frantically hands out bread, loaves flying
sc(45.85, 'manor_lawn', 'normal', 'Whip: he frantically shoves loaves at every villager, sweating. Relief and comedy.',
   cam((0, 540, 960, 1.25), (1.7, 560, 950, 1.3)),
   [A('heir', [K(0, x=640, y=1620, view='side', facing=-1, face='worried', armR=GIVE), K(0.3, armR=[0.6, 0.4]), K(0.6, armR=GIVE), K(0.9, armR=[0.6, 0.4]), K(1.2, armR=GIVE)], h=760),
    A('peas_m', [K(0, x=330, y=1640, view='side', facing=1, face='happy', armR=[1.3, 0.3])], h=740)],
   [MANOR(fall=1, lit=False), TABLE(780), pr('loaf', 0, 0, 90, hold='heir.R')],
   [{'type': 'sweat', 't': 0.2, 'x': 700, 'y': 850, 'size': 60, 'dur': 0.6}, {'type': 'sweat', 't': 0.9, 'x': 600, 'y': 860, 'size': 60, 'dur': 0.6}], tr='whip')
# 25 "They still do it today." — golden modern morning: the squire hands flour sacks to modern villagers
sc(48.0, 'manor_lawn', 'normal', 'Today, golden morning: a squire in a tweed jacket hands a flour sack to modern villagers (Mara, Tala).',
   cam((0, 540, 1080, 1.15), (2.15, 560, 1070, 1.22)),
   [A('squire', [K(0, x=700, y=1620, view='side', facing=-1, face='happy', armR=GIVE)], h=780),
    A('mara', [K(0, x=380, y=1630, view='side', facing=1, face='happy', armR=[1.3, 0.3])], h=740),
    A('tala', [K(0, x=200, y=1640, view='side', facing=1, face='grin')], h=500)],
   [MANOR(fall=0, lit=False), pr('sack', 0, 0, 170, hold='squire.R'), pr('sack', 900, 1650, 220), pr('sack', 980, 1660, 200)], tr='fade')
# 26 "Just in case." — he glances over his shoulder: far off in the dusk field, a little torch glow is crawling (loops to frame 0)
sc(DUR, 'manor_lawn', 'eerie', 'He glances nervously over his shoulder… far off in the field a tiny torch glow is crawling. Loops into the opening.',
   cam((0, 640, 930, 1.6), (1.1, 680, 920, 1.7)),
   [A('squire', [K(0, x=560, y=1620, view='side', facing=-1, face='happy', look=[-0.3, 0]), K(0.25, view='side', facing=1, face='worried', look=[1, -0.2])], h=780),
    CRAWL('ghost', 900, 1450, [K(1.1, x=870)], h=260, facing=-1)],
   [pr('torch', 0, 0, 90, hold='ghost.R', ghost=True, rot=0.5), pr('bank', 900, 1530, 200, top='#7d9450', bot='#5f7a44', grass='#9ab06a', w=1.6)])

P['scenes'] = S
P['title'] = 'The Family That Can\'t Stop Giving'
P['mood'] = 'eerie'
P['music'] = {'on': True, 'track': 'dark_mystery_piano', 'start': 0, 'stops': [[38.0, 38.55]],
              'switch': [{'t': 7.45, 'track': 'medieval_ambient', 'start': 0, 'xfade': 0.6},
                         {'t': 21.0, 'track': 'dark_mystery_piano', 'start': 20, 'xfade': 0.8},
                         {'t': 25.6, 'track': 'horror_atmosphere', 'start': 0, 'xfade': 0.5},
                         {'t': 32.85, 'track': 'medieval_ambient', 'start': 30, 'xfade': 0.8},
                         {'t': 36.2, 'track': 'cinematic_tension', 'start': 0, 'xfade': 0.6},
                         {'t': 45.85, 'track': 'calm_ambient', 'start': 0, 'xfade': 0.6},
                         {'t': 48.0, 'track': 'dark_mystery_piano', 'start': 0, 'xfade': 0.4}]}
P['mix'] = {'music': 0.08, 'musicPause': 0.14, 'sfx': 0.35}
cta_s = 33.3
P['cta'] = {'s': cta_s, 'e': cta_s + 2.6, 'tap': 0.95, 'text': 'More strange traditions'}
P['sfx'] = [
    {'t': 0.0, 'name': 'wind', 'dur': 2.4, 'fadeOut': 1.0, 'gain': 0.5},
    {'t': 0.1, 'name': 'fire_crackle', 'dur': 2.2, 'fadeOut': 1.0, 'gain': 0.45},
    {'t': 4.25, 'name': 'suspense_sting', 'dur': 1.4, 'fadeOut': 0.8, 'gain': 0.6},
    {'t': 5.85, 'name': 'deep_boom', 'dur': 1.4, 'fadeOut': 0.9, 'gain': 0.8},
    {'t': 6.0, 'name': 'rocks', 'dur': 1.3, 'fadeOut': 0.8, 'gain': 0.5},
    {'t': 7.5, 'name': 'fire_crackle', 'dur': 2.8, 'fadeOut': 1.2, 'gain': 0.4},
    {'t': 10.5, 'name': 'pop', 'gain': 0.0},
    {'t': 14.8, 'name': 'impact_hit', 'dur': 0.8, 'fadeOut': 0.5, 'gain': 0.6},
    {'t': 16.4, 'name': 'fire_crackle', 'dur': 1.6, 'fadeOut': 0.8, 'gain': 0.7},
    {'t': 17.6, 'name': 'wind', 'dur': 3.2, 'fadeOut': 1.2, 'gain': 0.5},
    {'t': 22.6, 'name': 'thud', 'gain': 0.5},
    {'t': 24.2, 'name': 'sparkle_whoosh', 'dur': 1.3, 'fadeOut': 0.8, 'gain': 0.6},
    {'t': 26.85, 'name': 'impact_boom', 'dur': 1.2, 'fadeOut': 0.8, 'gain': 0.7},
    {'t': 28.4, 'name': 'pop'}, {'t': 28.6, 'name': 'pop'}, {'t': 28.8, 'name': 'pop'},
    {'t': 29.95, 'name': 'low_hit', 'dur': 0.8, 'fadeOut': 0.5, 'gain': 0.6},
    {'t': 31.55, 'name': 'rocks', 'dur': 0.8, 'fadeOut': 0.5, 'gain': 0.4},
    {'t': cta_s + 0.02, 'name': 'pop'}, {'t': cta_s + 0.95 + 0.1, 'name': 'ding'},
    {'t': 36.3, 'name': 'thud', 'gain': 0.6},
    {'t': 38.6, 'name': 'impact_boom', 'dur': 1.6, 'fadeOut': 1.0, 'gain': 0.9},
    {'t': 38.7, 'name': 'rocks', 'dur': 1.6, 'fadeOut': 1.0, 'gain': 0.7},
    {'t': 39.7, 'name': 'pop'}, {'t': 40.1, 'name': 'pop'},
    {'t': 42.0, 'name': 'pop'}, {'t': 42.4, 'name': 'pop'},
    {'t': 43.5, 'name': 'suspense_sting', 'dur': 1.0, 'fadeOut': 0.6, 'gain': 0.6},
    {'t': 44.15, 'name': 'whoosh', 'gain': 0.6},
    {'t': 46.0, 'name': 'sparkle', 'gain': 0.4},
    {'t': 48.15, 'name': 'wind', 'dur': 1.0, 'fadeOut': 0.6, 'gain': 0.5},
]
P['sfx'] = [s for s in P['sfx'] if s.get('gain', 1) > 0]
# captions: timing drafts, star the key words
STAR = {'free', 'food', 'stop', 'bad', 'dying', 'sharing', 'poor', 'year', 'burning', 'stick', 'land', 'walk', 'crawls', 'curse', 'seven', 'boys', 'girls', 'name', 'hundreds', 'one', 'house', 'oldest', 'again', 'today', 'case'}
caps = []
for c in T['captions']:
    words = []
    for w in c['text'].split():
        bare = re.sub(r'[^a-z\']', '', w.lower())
        words.append(f'*{w}*' if bare in STAR else w)
    caps.append({'s': c['s'], 'e': c['e'], 'text': ' '.join(words)})
P['captions'] = caps
json.dump(P, open(os.path.join(D, 'project.json'), 'w'), indent=1)
print(len(S), 'scenes,', len(caps), 'captions, ends', S[-1]['end'])
