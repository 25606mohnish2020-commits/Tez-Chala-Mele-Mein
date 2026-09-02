# Audio — तेज़ चला मेले में

Every sound in this book is a supplied file. No speech synthesis, no
generated tones, no page-turn swish. The recordings in this folder and the
effects in `../SFX/` are played **exactly as delivered** — nothing was cut,
re-encoded, renamed or normalised.

## The flow

The section runs **Cover Page → Page 1 … Page 6 → Page 8 … Page 18**: 18
frames. There is no Page 7 — neither the art export nor the narration folder
has one.

The **book is 16 pages**, not 18. The section's last three frames are one page
here: Page 16, Page 17 and Page 18 are the same painting with a different
line in the same speech bubble, so they are one picture said three times over
rather than two page turns that change nothing. All three recordings still
play, in order, as the three windows of Page 16 — see the table below.

Two more frames repeat their painting, which is why some pictures appear
twice: Page 2 = Page 3, Page 4 = Page 5.

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
| Page 1 | `Page 1.mp3` † | 0.61 – 2.17 |
| Page 2 | — | |
| Page 3 | `Page 3.wav` | 0.16 – 2.85 |
| Page 4 | `Page 4.wav` | 0.19 – 5.32 |
| Page 5 § | `Page 5.wav` | 0.13 – 1.15 |
| ″ | ″ | 1.15 – 2.68 |
| ″ | ″ | 2.68 – 5.06 |
| Page 6 | `Page 6.wav` | 0.32 – 3.93 |
| Page 8 | `Page 8.wav` | 0.14 – 4.90 |
| Page 9 | `Page 9 to Page 15 Poem.wav` | 0.26 – 7.15 |
| Page 10 | ″ | 7.15 – 12.98 |
| Page 11 | ″ | 12.98 – 19.14 |
| Page 12 | ″ | 19.14 – 25.66 |
| Page 13 | ″ | 25.66 – 31.51 |
| Page 14 | ″ | 31.51 – 34.26 |
| Page 15 | ″ | 34.26 – 37.04 |
| Page 16 § | `Page 16.wav` | 0.22 – 2.98 |
| ″ | `Page 17.wav` | 0.20 – 4.24 |
| ″ | `Page 18.wav` | 0.21 – 2.75 |

§ **Pages 5 and 16 are runs of three windows, not one.** `NARRATION` takes
either a single `[file, from, to]` or a list of them; a list plays back to
back, and the page counts as unfinished until the last has closed. Each
window opening is also what brings the next line of speech on, so the picture
and the voice are the same event and cannot drift apart.

The two are the same shape from opposite directions. **Page 16** has three
separate recordings, one per window — it used to be three pages — and आगे
appears when the third has been said. **Page 5** has one recording cut into
three windows: Tez asks three things, and the bubble now shows them one at a
time instead of all at once.

Page 5's three are **contiguous** — each ends exactly where the next begins,
and the outer edges are the whole recording measured the way every window is,
speech at −45 dB pulled out by the 60 ms lead and 120 ms tail. So nothing is
cut and nothing is skipped, and the needle never jumps: the seek at each
boundary finds itself already there and does not move. The recording plays
straight through as if it were one window. The boundaries only say when the
words in the bubble change.

**`Page 3.wav` and `Page 5.wav` are second takes**, supplied 2 September
2026 in place of the originals. Both say exactly what the first takes said, a
little slower and with longer breaths held between sentences: Page 3 runs
3.08 s where it ran 2.54, Page 5 runs 5.32 s where it ran 4.50. Their windows
and Page 5's word timings were measured again from the new files; nothing
else about either page changed.

They are cut just after each sentence ends rather than at the midpoint of the
pause, which is where the poem's page boundaries fall. A page turn has 780 ms
of its own to hide a boundary in; a line leaving a bubble and the next
arriving has about 480 ms, and cutting early gives that the whole breath to
happen in — so the words are on the page before they are spoken rather than
arriving with them.

| | sentence | speech | window |
| --- | --- | --- | --- |
| 1 | मेला! | 0.187 – 1.033 | 0.13 – 1.15 |
| 2 | कहाँ? | 1.782 – 2.562 | 1.15 – 2.68 |
| 3 | और वहाँ पहुँचना कैसे है? | 2.919 – 4.941 | 2.68 – 5.06 |

Cover Page and Page 2 have no recording in the folder, so they have no entry,
and the book does not wait on one — their beat begins as soon as they are on
screen.

† **Page 1 is a hum, and the only clip here that is not a wav.**
`Page 1.mp3` is 2.66 s holding a single sustained sound — 1.38 s of it,
swelling and falling with no syllable in it at all, which is the हम्ममममम the
page already draws over Tez rather than a narrator describing him. Its silence
is longer than the other clips carry, 0.67 s at the head and 0.61 s at the
tail, and the window takes both off.

It replaced `Page 1.wav`, which ran 10.4 s in two read sentences with a 0.47 s
breath between them at 4.5 s. That page was held to the first five seconds by
choice — the one window in the book that stopped before its own speech did,
with the second sentence never heard anywhere. **The cap went with the file it
was made for**, and every window in the book is measured now.

The page is held for much less time than it was: about 1.6 s of sound where
there were 5, and the beat before the turn is unchanged at 1.5 s.

### Where the numbers come from

Measured, not estimated. `silencedetect` at −45 dB over each file gives the
speech edges; the window is then pulled **out** to the speech with a 60 ms lead
and a 120 ms tail, so no syllable is clipped and no page opens on dead air.
Every clip in this folder carries 0.09–0.33 s of silence at the head and
0.25–0.47 s at the tail — bar Page 1's hum, which carries rather more of both
— and that is what the windows remove.

### The poem

`Page 9 to Page 15 Poem.wav` is 37.3 s read straight through — one take for
seven pages. The reader's own breathing says where its joints are. Five
pauses run 0.67 s to 0.89 s; every other gap in the recital is 0.31 s to
0.45 s. The recording separates the two cleanly, so the stanza breaks are not
a guess:

```
gap at  6.82 –  7.48   (0.67 s)   → joint
gap at 12.62 – 13.34   (0.73 s)   → joint
gap at 18.75 – 19.53   (0.78 s)   → joint
gap at 22.37 – 22.82   (0.45 s)   line break, inside the ducklings couplet
gap at 25.22 – 26.11   (0.89 s)   → joint
gap at 31.11 – 31.92   (0.80 s)   → joint
gap at 34.06 – 34.46   (0.40 s)   line break, inside the closing couplet
```

Those five joints cut the recital into **six couplets**, and a couplet is the
unit a page gets — both its lines or neither, because half a couplet on a
picture is half a thought on the wrong picture. The ducklings are the case in
point: the 0.45 s gap is a line break, not a joint, and cutting there would
send `एक, दो और तीन हैं सारी` onto the flower path.

Six couplets across seven pages means exactly one must be shared, and it is
the last: Page 14 arrives at the mela and Page 15 rides the wheel, two halves
of one arrival, so the closing couplet gives a line to each. That cut is at
34.26 s — the one boundary that falls inside a couplet rather than between
two.

Each boundary is cut at the **midpoint** of its pause, so every page both
begins and ends inside the reader's own breath. Turned at a child's pace the
seven pages read as the single unbroken recital it was recorded as, and the
poem is never restarted mid-verse.

## Effects — `../SFX/`

One effect per frame, `[ file, from, to, gain, delay ms, loop, [in, out] ]`,
chosen off what is actually in that painting. The delay lets the page settle
first, so the sound arrives with the picture rather than under the page turn.

| Frame | Effect | Why |
| --- | --- | --- |
| Page 2 ‡ | `DUM DUM sound.mp3` | the fair, heard from far off |
| Page 4 | `Noori sound.mp3` | Noori, first seen in the tree |
| Page 6 | `Noori sound 2.mp3` | Noori speaking on the path |
| Page 9 | `Ducks swimming.mp3` | the river opens up |
| Page 11 | `Ducks swimming 2.mp3` | water under the bridge |
| Page 12 | `Ducks.mp3` | the three ducklings |
| Page 13 ‡ | `DUM DUM sound.mp3` | the fair answers the couplet |
| Page 14 | `DUM DUM sound 2.mp3` | the fair announces itself |
| Page 15 | `Drum 2.mp3` | a beat off the big wheel |
| Page 16 | `Noori sound 2.mp3` | Noori has the last word |

The Cover Page has no effect: it opens on the bed and nothing else, so the
first drum a reader hears is the far-off one on Page 2 — which is the one the
story is actually about.

‡ **Pages 2 and 13 hold for their drums.** Both are `coda` entries on the page
rather than arrival effects: the page is not finished until the five-second
window is, so the drums are heard in full before the book moves on. Page 2
hears the fair coming; Page 13 is answered by it. Page 2 has no narration, so
without this it would turn before the drums had been heard at all.

**Page 2's drums are faded out, and are the only effect that is.** `[in, out]`
is how many ms of a window's own head and tail are spent on a fade, and it is
left off everywhere the recording already begins and ends in silence — which
is everywhere else, because the windows were measured to the speech and the
quiet either side does the job. `DUM DUM sound.mp3` has no quiet in it: over
its first nine seconds it never falls below about −18 dB, and at the 5.00 s
edge of Page 2's window it is at −5.6 dB, all but its loudest. Pausing there
is a click, and moving the edge only moves the click, so the last 600 ms are
given to a fade instead and the fair goes back to being far off. The window
itself does not move — the fade is taken out of the sound, not added to the
page — so what Page 2 is held for is exactly what it was.

`DUM DUM sound 2.mp3` on Page 14 and `Ducks.mp3` on Page 12 close the same
hard way and have not been given a fade, because nobody has reported hearing
them do it. If they ever click, they take `[0, 600]` too.

`Button Tap.mp3` is the interface: every control and the cover's play
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
- A frame may hold **a run of windows** rather than one. Only Page 16 does.
  Moving from one to the next deliberately does *not* bump the token: it is
  the same reading carrying on, not a new one starting, so nothing in flight
  is invalidated and the page-turn gate is not told the page has finished
  until the last window closes.

### Word timings — `SAID`

`SAID` in `script.js` holds one `[from, to]` per **word**, in the file's own
seconds and in reading order across a frame. As the narrator goes, the script
marks the word being said on the word itself. **Page 5 is the only frame
measured so far**; any other page joins by having its own row added, and
nothing else has to change.

**Nothing draws the marks.** Two treatments were tried and both came off:
holding the words yet to come at half opacity read as unfinished text rather
than unread text, and colouring the word in hand pulled it out of the line the
designer set. The speech in this book is artwork with a voice over it. What
the highlight was for is done by the page instead — Page 5 says its three
questions one at a time, each with its own window, so the thing being said is
the thing on the screen. The marking is kept because it is measured, correct
and free; see *the recital, deliberately undrawn* in `style.css`, which is
where a treatment would go.

Measured the same way the windows were: `silencedetect` at −45 dB for the
pauses between sentences, −25 dB for the joins between words inside one
breath, then read against a 20 ms RMS envelope so a fricative is not mistaken
for a gap. That last part matters — the /s/ of `कैसे` sits at −42 dB, quiet
enough for the detector to call it silence and split one word in two.

The table holds times only; the words themselves stay in `SCENES`, and the two
are matched by counting. If a frame's painted words and its measured times
ever disagree in number, the recital leaves that page alone rather than
marking everything after the mismatch on the wrong syllable.

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

## The words

The frames export as **artwork only** — the Figma text layers are not in the
PNGs — so every word above the paint is rebuilt in `SCENES` in `script.js`,
from the design's own coordinates. Each page's words are then read back off
those layers into `text: { hi }`, which is what the live region announces, so
the book cannot caption a page with anything but what is painted on it.

Those layers are drawn exactly as the design sets them and nothing recolours
or fades a word of them while they are being read — see *Word timings* above
for what is marked and why none of it is painted.
