# Audio — तेज़ चला मेले में

Every sound in this book is a supplied file. No speech synthesis, no
generated tones, no page-turn swish. The recordings in this folder and the
effects in `../SFX/` are played **exactly as delivered** — nothing was cut,
re-encoded, renamed or normalised.

## The flow

The section runs **Cover Page → Page 1 … Page 6 → Page 8 … Page 18**: 18
frames. There is no Page 7 — neither the art export nor the narration folder
has one — so the book is 18 pages, not 19.

Three frames repeat their painting, which is why some pictures appear twice:
Page 2 = Page 3, Page 4 = Page 5, Page 16 = Page 17.

## How the audio is mapped

`SOUND`, `NARRATION`, `SCENE_FX` and `BEDS` at the top of `script.js` are the
whole mapping, and they are keyed by **Figma frame name**, never by position.
That matters here: with Page 7 missing from the flow, a positional key would
be one out from Page 8 onward and every clip after it would land on the wrong
picture.

Each entry is `[ file, from, to ]` — a **window** into the file, in seconds.
The element is told where to start and where to stop; the file itself is never
cut. That is what lets one 36-second poem recording serve seven pages.

| Frame | Narration | Window (s) |
| --- | --- | --- |
| Cover Page | — | |
| Page 1 | — | |
| Page 2 | — | |
| Page 3 | `Page 3.wav` | 0.09 – 2.41 |
| Page 4 | `Page 4.wav` | 0.19 – 5.32 |
| Page 5 | `Page 5.wav` | 0.09 – 4.37 |
| Page 6 | `Page 6.wav` | 0.32 – 3.93 |
| Page 8 | `Page 8.wav` | 0.14 – 4.90 |
| Page 9 | `Page 9 to Page 15 Poem.wav` | 0.28 – 5.91 |
| Page 10 | ″ | 5.91 – 11.74 |
| Page 11 | ″ | 11.74 – 17.90 |
| Page 12 | ″ | 17.90 – 21.29 |
| Page 13 | ″ | 21.29 – 24.42 |
| Page 14 | ″ | 24.42 – 30.28 |
| Page 15 | ″ | 30.28 – 36.10 |
| Page 16 | `Page 16.wav` | 0.22 – 2.98 |
| Page 17 | `Page 17.wav` | 0.20 – 4.24 |
| Page 18 | `Page 18.wav` | 0.21 – 2.75 |

Cover Page, Page 1 and Page 2 have no recording in the folder, so they have no
entry, and the book does not wait on one — the way forward opens as soon as
they are on screen.

### Where the numbers come from

Measured, not estimated. `silencedetect` at −45 dB over each file gives the
speech edges; the window is then pulled **out** to the speech with a 60 ms
lead and a 120 ms tail, so no syllable is clipped and no page opens on dead
air. Every clip in this folder carries 0.15–0.38 s of silence at the head and
0.25–0.43 s at the tail, which is what the windows remove.

### The poem

`Page 9 to Page 15 Poem.wav` is 36.1 s read straight through — one take for
seven pages. Its six internal boundaries are the **six deepest pauses in the
recital**: 0.67 s – 0.90 s of silence, against 0.38 s – 0.60 s at the line
breaks inside a couplet. The recording separates the two cleanly, so the
stanza breaks are not a guess:

```
gap at  5.57 – 6.24   (0.67 s)   → Page 9  ends
gap at 11.37 – 12.11  (0.73 s)   → Page 10 ends
gap at 17.50 – 18.29  (0.78 s)   → Page 11 ends
gap at 20.99 – 21.58  (0.60 s)   → Page 12 ends
gap at 23.96 – 24.87  (0.90 s)   → Page 13 ends
gap at 29.87 – 30.68  (0.80 s)   → Page 14 ends
```

Each boundary is cut at the **midpoint** of its pause, so every page both
begins and ends inside the reader's own breath. Turned at a child's pace the
seven pages read as the single unbroken recital it was recorded as, and the
poem is never restarted mid-verse.

## Effects — `../SFX/`

One effect per frame, `[ file, from, to, gain, delay ms ]`, chosen off what is
actually in that painting. The delay lets the page settle first, so the sound
arrives with the picture rather than under the page turn.

| Frame | Effect | Why |
| --- | --- | --- |
| Cover Page | `Drum Roll.mp3` | the title's fanfare |
| Page 4 | `Noori sound.mp3` | Noori, first seen in the tree |
| Page 6 | `Noori sound 2.mp3` | Noori speaking on the path |
| Page 9 | `Ducks swimming.mp3` | the river opens up |
| Page 11 | `Ducks swimming 2.mp3` | water under the bridge |
| Page 12 | `Ducks.mp3` | the three ducklings |
| Page 14 | `DUM DUM sound 2.mp3` | the fair announces itself |
| Page 15 | `Drum 2.mp3` | a beat off the big wheel |
| Page 16 | `Noori sound 2.mp3` | Noori has the last word |
| Page 17 | `Drum.mp3` | |
| Page 18 | `Drum Roll.mp3` | the roll that began it |

`Button Tap.mp3` is the interface: every arrow, control and the cover's play
button. The file runs 1.97 s but the tap is the 126 ms at 0.147 s and the rest
is silence, so it is played as a window like everything else.

An effect belongs to the picture, not to the narration: it still plays when
**पढ़कर सुनाओ** is switched off, and it stops the moment its page is left, so a
duck can never quack over the fair. The speaker button silences it along with
everything else.

### The bed

Two looping floors, both far enough down to be a floor rather than a thing you
listen to, and both ducking to a third of themselves while anyone is speaking.

- `TCMM BGM 1.mp3` — the journey, Cover Page through Page 13.
- `DUM DUM sound.mp3` — the mela, from **Page 14** onward. The ground changes
  under the story when they arrive and stays changed, which is the point of
  arriving. The swap is a 520 ms crossfade.

Browsers refuse to start audio before the reader has touched something, so the
bed joins on the first press — already on the right page's ground.

## Playback

`PageAudio` in `script.js` owns the narration, `Sfx` the effects, `Bed` the
floor. Three lanes, one element each, so nothing can ever stack.

- **One `HTMLAudioElement` per lane, deliberately not attached to the
  document.** An `<audio>` added to the DOM here never gets past
  `readyState 0`; detached is the only form that loads. `data-clip`,
  `data-sfx` and `data-bed` on `<html>` expose what is live, so the elements
  stay observable without being touched.
- **Never call `load()` before `play()`.** Assigning `src` already starts the
  load; an explicit `load()` immediately followed by `play()` wedges the
  element at `readyState 0`.
- **Seeking waits for metadata.** A fresh source has no duration yet, so a
  seek to `from` is deferred to `loadedmetadata` once rather than dropped.
  The poem stays loaded across all seven of its pages — only `currentTime`
  changes between them.
- **A window is held by two things**, because neither alone is enough: a timer
  armed the moment playback really starts, which is accurate but cannot see a
  stall, and a `timeupdate` guard, which sees everything but only fires about
  four times a second. Whichever notices first ends the page, once.
- Every entry point calls `stop()` first, and a **token counter** invalidates
  any `play()` promise or timer still in flight, so hammering next/prev cannot
  leave a stale clip running.
- The window is chosen **by frame name**, so a page can only ever say its own
  words.

### Controls

| Control | Does |
| --- | --- |
| **पढ़कर सुनाओ** | narration on/off; on by default, remembered as `tcmm.read` |
| **Speaker button** | mutes narration, effects and bed together, remembered as `tcmm.sound` |

### Autoplay

Browsers block audio until the reader interacts; pressing **चलाओ** is that
interaction, and it is also what starts the first page. If you embed the book
in an **iframe**, add `allow="autoplay"` or nothing will ever start.

### Re-measuring

The windows live in `NARRATION` / `SCENE_FX` / `BEDS` in `script.js`. Edit the
numbers in place — there is nothing to re-cut, because no file is cut. Bump
the `CUT` constant in `PageAudio` afterwards, or a refresh will keep serving
the cached copy.

## Still missing

The frames export as **artwork only** — the Figma text layers are not in the
PNGs — so no page renders words yet, and the read-aloud highlight has nothing
to light up. The audio, effects and pacing are complete and independent of
that; when the text arrives it drops into `text: { hi, en }` on each entry in
`PAGES` and the `SPOTS` table places the column.
