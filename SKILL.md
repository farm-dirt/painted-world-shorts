---
name: painted-world-shorts
description: Personal animation studio for vertical YouTube Shorts in a cinematic painted-world style (3D-shaded characters in hand-painted golden-hour worlds, original cast). Use when the user wants to make, script, preview or render a Short in this style.
---

# painted-world-shorts — script → voice-over → browser preview → final MP4

A reusable production workflow, separate from `pastel-toon-shorts` and `paper-diorama-shorts` (never
edit those skills or reuse their art). The look was analysed once from an animated short film:
stylised 3D animated-film characters inside hand-painted, watercolor-textured environments, lit by
hazy golden-hour light with rim light, big sculptural clouds and a soft film finish. Only the visual
language was taken: **never copy the reference film's characters, designs or scenes**. Use the
original cast in `reference/characters.md`, or new original characters built with the same rig.
Everything is drawn by code (no image generator), so it approximates the look rather than matching
a 3D render; say so honestly if the user asks.

## 0. Setup (silent, every time)
1. Get the engine: `git clone --depth 1 https://github.com/farm-dirt/painted-world-shorts ~/pws`
   (if the folder exists: `git -C ~/pws pull`). If GitHub is unreachable or the repo doesn't exist yet,
   ask the user to attach `painted-world-shorts.zip` and unzip it so the engine is at `~/pws`.
2. Check tools, never assume: `node -v`, `ffmpeg -version`, `python3 -c "import numpy"`,
   `node -e "require('playwright')"` (use `NODE_PATH=$(npm root -g)` for a global install).
   If something is missing, explain in one plain sentence what it is and why, and ask before installing.
3. Read `~/pws/reference/style-guide.md`, `animation-guide.md`, `characters.md` before planning
   scenes; `production-guide.md` before audio/render steps; `content-playbook.md` for ideas and scripts.

The user is a beginner: simple words, define terms, say WHY, push back honestly on weak ideas,
warn before anything that deletes/overwrites. Keep each checkpoint message short.

## The workflow — phases in order, never skip a ⛔ checkpoint

### Phase 1 — Start (automatic, no question)
Do NOT ask "What would you like to create?". Assume **"I want a new script"** and go to Phase 2.
Exception: if the user's message already includes a script, use it and go to Phase 4 (tighten it, keep their voice).

### Phase 2 — Category  ⛔ (one quick question)
This channel has no fixed niche yet (user's choice, 15 Nov 2026: "decide later"). If the user's
message already names a topic or category, use it and go on. Otherwise ask ONE AskUserQuestion with
the categories from `content-playbook.md` that suit this look (World mythology & folklore ·
Weird-but-true history · Origin stories · Small human adventures), with your pick marked
"(Recommended)" and a one-line reason. Don't pitch a topic the user already made in the pastel
(Philippine creatures) or paper (Greek god drama) channels. Once the user has made 3+ shorts in one
category, suggest making it the channel's fixed niche (they decide).

### Phase 3 — 10 ideas  ⛔
10 original ideas, each with **title, 1-2 line description, the hook (first 2 seconds), storytelling
potential (★1-5 + why), entertainment (★1-5: would a teen laugh, gasp or say "wait, what?"), why it
suits the painted look (which locations, the light, the one "wow" shot), format (Legend card 20-30 s
or Story 40-55 s), audience fit (teen/adult tone)**. Flag your top 2 (both high on entertainment).
Facts must be true: search the web for every idea before pitching, name the source, and say
"accounts differ" when they do. Check each idea on YouTube Shorts with web search (never vidIQ) and
say how recent the latest similar Short is; famous topics are fine if the angle is fresh ("Fresh
angle:" line). Wait for the user to pick.

### Phase 4 — Script + voice-over (ONE checkpoint)  ⛔
Use the template in `content-playbook.md`. Target 30-55 s (≈ 80-140 words) for a Story, 20-30 s
(≈ 50-75 words) for a Legend card.
**Retention + clarity rules (check every script):**
- Write the ending first, then build backwards. One main character, one goal, one problem.
- **Hook = first spoken line + first image together**: start in the strangest moment; 2-4 word hook text on screen 0-2 s.
- **Introduce every person** in one plain sentence (name + who they are). Every action says its reason. No riddle lines.
- Link beats with "but" / "so", never "and then". Re-hook every ~8-10 s.
- **Show, don't narrate**: mark at least 2 moments where the picture says something the narration doesn't.
- **Narration only — one voice, no dialogue** (no quoted speech, no second speaker). Characters act with faces, gestures and sound.
- No "like and subscribe" outro: end on the twist or a line that loops into the first. The CTA is the silent mid-video button.
- Teen/adult tone ("legend explained", witty or eerie), not a children's moral lesson.
**Voice + settings (user is on FREE ElevenLabs):**
- Narrator: chosen once for this series (see "Series identity"); until then suggest a calm, warm storyteller voice with a low steady tone.
- Settings table with a one-line why each: Speed ≈ 0.90 · Stability ≈ 40-45 % · Similarity ≈ 75 % · Style Exaggeration 0-10 % · Speaker Boost on.
- No audio tags; emotion comes from the writing ("…" for a pause, CAPS on at most one word per line, short sentences).
- Keep it short enough to regenerate 2-3 times; the user may regenerate one bad sentence and upload both files (you splice it in).
Save `script/script.md` (full) and `script/script.txt` (narration only, exactly as spoken). Send ONE
message: the script, the narration in a code block, the voice settings. End with:
"Record it and upload the file, or tell me what to change in the script."
Uploading the voice-over counts as approving the script. If the user changed words while recording, update script.txt.

### Phase 5 — Process the voice-over (starts as soon as the upload arrives)
Never build animation before the voice-over arrives. Then, without asking:
```bash
python3 ~/pws/tools/new_project.py ~/shorts <slug> "<Title>"
cp <upload> ~/shorts/<slug>/voice-over/voice.<ext>            # set "voice" in project.json
python3 ~/pws/tools/timing.py ~/shorts/<slug>/voice-over/voice.<ext> ~/shorts/<slug>/project-files/timing.json --script ~/shorts/<slug>/script/script.txt
```
Report in 3-4 lines: duration, sentences matched to pauses, any sentence ≥ 40 % off its word-count
estimate (misread/skipped line → tell the user). The voice-over is the master clock.

### Phase 6 — Build the animation
1. **Characters first.** Pick cast members and/or create the story's characters in
   `project-files/custom.js` (`window.CUSTOM.cast`, schema in `characters.md`: robes, tunics, crowns,
   helmets, veils, hair types). Render a model sheet of every NEW character and LOOK at it before use.
2. **Shot plan** (`project-files/project.json`, schema in `animation-guide.md`): one scene per
   phrase/sentence, cut on pauses, 1.5-3 s per shot, emphasis keyed to `timing.words` minus 0.08 s.
   **Directing rules (this style):**
   - **Frame 0 is the hook**: the strangest moment already on screen at t = 0; hook text 0-2 s.
   - **Every shot is lensed**: use the shot recipes (establishing wide, hero low angle, emotional
     close-up, reveal pull-back, parallax slide, Dutch chaos, aerial). Never two similar framings in a
     row; say in the scene `desc` WHY the camera does what it does.
   - **Light script**: pick locations by story beat (warm `meadow`/`village` = safe, `forest` = mystery,
     `night` = danger/legend, `sky` = wonder, `hall` = grandeur). Write it in one line before building.
     For a place the 8 locations don't cover, paint a custom location in custom.js (`window.CUSTOM.loc`,
     toolkit in `style-guide.md`) and render a still of it before using it.
   - **One accent colour per shot**; characters are the brightest, most saturated thing in frame.
   - **YouTube Shorts safe box**: faces, key object, hook text and CTA inside x 48-888, y 180-1500
     on screen; y 1250-1500 is a caution strip. Only scenery, ground, feet may run into the no-go areas.
   - Something visibly changes at least every 1.5 s (expression, pose, camera, light FX). No face held > ~2.5 s.
     Hold key reactions ~0.3 s longer than feels natural.
   - **Sound for every visible action**; a silence beat (`music.stops`) right before the reveal.
3. **Captions**: start from `timing.captions`, fix names/casing, wrap 1-2 key words in `*stars*`.
4. **Music & SFX** (`python3 ~/pws/tools/audio.py --list`): always a recorded track, never the synth
   cartoon bed. Mood guide: `calm_ambient` (wonder, gentle), `celtic_harp` (tender/sad),
   `medieval_ambient` (old villages, royalty), `dark_mystery_piano` (mystery), `cinematic_tension`,
   `epic_action`, `dark_fantasy_synth`, `dark_ambient`, `horror_atmosphere` (creature legends),
   `greek_folk`. Recorded SFX always get `dur` + `fadeOut` (0.8-1.6 s) — many files are long; check
   unfamiliar ones with ffprobe. Never use `dark_click`.
   **Subscribe CTA (every short):** `"cta": {"s": S, "e": S + 2.6, "tap": 0.95, "text": "More <series name>"}`
   at 45-60 % of the video over a calm beat; sfx `pop` at S + 0.02, `ding` at S + tap + 0.1.
5. Build & check:
```bash
python3 ~/pws/tools/audio.py ~/shorts/<slug>
python3 ~/pws/tools/build_preview.py ~/shorts/<slug>
NODE_PATH=$(npm root -g) node ~/pws/tools/lint.js ~/shorts/<slug>      # must say OK
NODE_PATH=$(npm root -g) node ~/pws/tools/stills.js ~/shorts/<slug> 0 T1 T2 T3 T4 --sheet --out /tmp/<slug>-stills
```
Fix every lint line (in close-ups a SMALLER camera `y` moves the face DOWN the screen), rebuild, re-lint.
LOOK at the stills sheet yourself (always include t = 0), plus close-ups at full size. **Audience-eye review**:
(1) would a stranger stop at frame 0? (2) any stretch > 1.5 s with no change? (3) any shot that only
illustrates the narration literally? (4) same face held too long? (5) does the end loop cleanly into
the start? (6) anything important under the YouTube buttons/title? (7) is the picture too milky, or
is any face darker/duller than the background? Fix what fails, then publish.

### Phase 7 — Browser preview  ⛔ approval required
Copy the preview folder into the working directory, then publish with the Artifact tool's
publish-from-files: `index.html` (= preview/index.html), characters.js, backgrounds.js, engine.js,
data.js, custom.js (if any), audio/mix.mp3, assets/Poppins-Bold.ttf (same paths). **Right after the
FIRST publish**, declare `{"db": {}, "user": {}}` on it so the preview's buttons can save. Republish the
SAME artifact (slug + base_version) on every revision so the link never changes. Also copy the
preview folder to the user's computer if a folder is connected.
Tell the user: press ▶ (it loops), ⛶ Full screen, "Play this scene" to loop one scene, ⏱ Mark / M
to mark moments, type notes, then **Send notes to Claude** or **✓ Approve**, and type **"check"** in
the chat. When they say "check": read `feedback/latest` (db_get on the preview's slug); `notes` →
revise (render a still at each marked time and LOOK before changing it); `approve` → Phase 8. If
missing/older than their last message, ask them to paste the text.
**Thumbnails (made at the same time):** 2 NEW compositions, never a video frame.
A = the "impossible" image (the creature/god/miracle, huge); B = the strongest emotion (a big
reaction + the key object). Never give away the twist. Write one-scene JSONs
`project-files/thumb_A.json` / `thumb_B.json` (zoom 1.2-1.6, 1-2 actors with `h` ~1000, extreme
face, key prop large, simple background; faces below y ≈ 700 on screen so the title doesn't cover
them; thumbnail-only props in `project-files/thumb_custom.js` as `window.CUSTOM_THUMB`). Then:
`NODE_PATH=$(npm root -g) node ~/pws/tools/thumb.js ~/shorts/<slug> --thumb project-files/thumb_A.json --title "2-5 WORDS" --hl KEYWORD --out final/thumbnail_A.png`
Scale each to ~200 px wide and LOOK: the idea must read in under a second. Send both with
SendUserFile together with the preview link and ask: "Which thumbnail, A or B? (or tell me what to change)".
Revisions: change only the scenes named; rebuild → lint → stills → republish. Quick moving check of one
scene: `node ~/pws/tools/render.js DIR --from S --to S --out /tmp/<slug>-scene<N>.mp4`.

### Phase 8 — Final render (only after explicit approval)
Tell the user it takes a few minutes (≈ 5-7 s of rendering per second of video on 2 CPUs), then:
```bash
NODE_PATH=$(npm root -g) node ~/pws/tools/render.js ~/shorts/<slug>      # → final/<slug>.mp4
```
1080×1920, 30 fps, H.264 yuv420p, AAC 192k, -14 LUFS.

### Phase 9 — QA, then deliver
`python3 ~/pws/tools/qa.py ~/shorts/<slug> ~/shorts/<slug>/final/<slug>.mp4` — all lines PASS. Open
`scenes/contact_sheet.jpg`: same character designs in every shot, captions readable and off faces,
nothing cut off. Fix → re-render → re-QA. Re-render the chosen thumbnail as
`final/<slug>_thumbnail.png` plus `--wide` → `final/<slug>_thumbnail_16x9.png`.
Deliver: SendUserFile the MP4 and thumbnail(s); one line on using the thumbnail (YouTube app → upload
→ tap the cover → add from gallery); copy the project to the user's connected folder if there is one.
**Upload text** (each in its own code block, also saved to `final/<slug>_upload.txt`):
- **Title = a hook**: strangest idea in the first 3-5 words, ≤ 45 characters (60 max), searchable
  name in the first 40 characters when it doesn't spoil the twist. 5 options using at least 3
  patterns (Warning · Wrong assumption · Second person · Impossible fact · Mini-story · Precise question),
  at most one CAPS word and one emoji, no twist reveal, never misleading. Score each /10 (stops the
  scroll · clear in 1 s · need the answer · honest) in a table; mark your pick and say why.
- **Description**: 1-2 hook lines, 2-3 lines of true context (source or "versions differ"), one
  "your version" comment question, 3-5 hashtags (always #shorts).
- **Pinned comment**: the same comment question, its own code block. Remind: reply to first comments within the hour.
- **Upload settings**: Audience — this series is written for teens/adults, so normally "No, it's not
  made for kids"; Altered/synthetic content = No (fully animated); only the library music.
- Suggest cross-posting to Facebook Reels.
Growth notes (only when useful): after 8-10 shorts offer a long-form compilation; at the start of a new
short ask once for the last one's "Stayed to watch" %.

## Series identity (set once, then reuse)
The first time this section is used, propose 2-3 series names fitting the chosen category and let
the user pick; then keep the same name, narrator voice, hook-text style and thumbnail look on every
short (series end-tag only if the title stays ≤ 60 characters, otherwise in the description).

## Avoid "inauthentic / mass-produced" content (YouTube policy, July 2025)
Every short gets its own story shape, new scenes, at least one new location/character/prop and a
fresh ending — never reuse a previous short's scene list with names swapped.

## Hard rules
1. Phases in order; never skip ⛔ approvals; never animate before the voice-over; never final-render before preview approval.
2. Original characters and sets only; nothing from the reference film, pastel-toon-shorts or paper-diorama-shorts.
3. Preview and final come from the same engine; never fake the preview with stills.
4. Music/SFX never compete with the voice (levels in production-guide).
5. Automate: the user never types terminal commands.
6. No new installs without asking. Keep it simple, buildable, testable.
7. **Engine changes must reach GitHub in the same session.** Every new short downloads the engine fresh,
   so a change made only in this session's copy is lost. After any engine change: commit as farm-dirt,
   attach `farm-dirt/painted-world-shorts` with add_repo (access: push), push, and verify with a fresh
   `git clone --depth 1`. If pushing isn't possible, send the user an updated `painted-world-shorts.zip`
   and say plainly that GitHub still has the old version. Edits to this SKILL.md go through propose_skills.
