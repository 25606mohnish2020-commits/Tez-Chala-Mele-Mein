/* =========================================================================
   तेज़ चला मेले में — Game section
   Figma: 50cpr8RU0OCmDWEJoBKiMn · page "First Flow" · frames Page 19 → Page 35

   Flow, exactly as designed:
     19  map intro            (5 question marks, skateboard on the trail)
     20  skateboard reaches checkpoint 1
     21  Question 1           → 22 celebration → 23 map (sticker 1 won)
     24  Question 2           → 25 celebration → 26 map (sticker 2 won)
     27  Question 3           → 28 celebration → 29 map (sticker 3 won)
     30  Question 4           → 31 celebration → 32 map (sticker 4 won)
     33  Question 5           → 34 celebration → 35 finale (all 5 stickers)

   All geometry below is taken verbatim from the Figma nodes.
   ========================================================================= */

'use strict';

/* ------------------------------------------------------------ embed mode */
/* The game is also the last thing the storybook does: ../story/ ends on the
   आगे button and hands the whole screen over to this file inside an iframe.
   In that mode the start gate never shows — the tap on आगे *was* the start
   gesture, and it happened in the parent — so the book calls TCMMGame.start()
   instead and the flow begins straight away. Nothing else changes: every
   control, key and screen below behaves exactly as it does standalone.

   Fullscreen is the one thing that has to be aimed at the parent: making the
   iframe's own document fullscreen would frame the game inside a page that is
   no longer visible. fsDoc() picks the right document for both modes.       */
const EMBED = /[?&]embed=1/.test(location.search);

function fsDoc(){
  if(!EMBED) return document;
  try{
    if(window.parent && window.parent !== window && window.parent.document){
      return window.parent.document;
    }
  }catch(e){ /* a cross-origin parent — the iframe's own document it is */ }
  return document;
}

/* ---------------------------------------------------------------- assets */

const A = {
  bgm:        'Assets/Audio/TCMM BGM 1.mp3',
  plaquePop:  'Assets/Audio/Question Template pop.mp3',
  stickerPop: 'Assets/Audio/Stickers POP sound.mp3',
  skateboard: 'Assets/Audio/Skateboard.mp3',
  celebration:'Assets/Audio/Celebration 1.mp3',
  leaves:     'Assets/Audio/Shedding leaves.mp3',
  drum:       'Assets/Audio/Drum.mp3',
  /* Said once per question, after the last option has been dealt and named:
     everything is on the table, now choose. It is the line that opens the
     options up — nothing is tappable until it has been heard out.         */
  choose:     'Assets/Audio/सही चित्र चुने.wav',
  /* Every correct answer gets the same clip. Add 'Correct Answer 2.mp3' back
     to this list to go back to alternating between them.                   */
  correct:   ['Assets/Audio/Correct Answer 1.mp3'],
  praise:    ['Assets/Audio/Reinforcement - Shabash.wav',
              'Assets/Audio/Reinforcement - Wah.wav',
              'Assets/Audio/Reinforcement - Sahi Jawab.wav',
              'Assets/Audio/Reinforcement - Hurray.wav'],
  hurray:     'Assets/Audio/Reinforcement - Hurray.wav',

  /* Assets/Audio has no wrong-answer clip, so the "try again" sound is
     synthesised in Audio2.wrongSound(). Drop a file in the folder and put its
     path here to use that instead — nothing else needs changing.          */
  wrong:      null
};

const plate = n => 'Assets/Images/Page ' + n + '.png';

/* ------------------------------------------------------- map checkpoints */

/* "image 170" is offset (-23, -50) inside the 1920x1080 page frame, so the
   numbers below are the child coordinates already shifted to page space.

   Checkpoints 2, 3 and 4 were re-measured off the Page 19 export rather than
   read from Figma: that plate moved those three circles onto the dashed route
   (2 left 60, 3 down 60, 4 right 70 and up 10) and the markers follow them.
   The circle is 184px across, so its centre is what these are aligned to.  */

const CHECKPOINTS = [
  { // 1 · image 172 @ (863,831)  — नदी
    qmark:   { x: 899, y: 816, w:  89, h: 134 },
    sticker: { x: 863, y: 829, w: 160.5, h: 107, src: 'Assets/Stickers/image 226 (1).png', alt: 'नदी' }
  },
  { // 2 · circle centre (1604.5, 688.5) — भेड़िया
    qmark:   { x: 1560, y: 622, w:  89, h: 134 },
    sticker: { x: 1525, y: 644, w: 159, h:  90, src: 'Assets/Stickers/image 230 (1).png', alt: 'भेड़िया' }
  },
  { // 3 · circle centre (1104.5, 531.5) — बत्तखें
    qmark:   { x: 1060, y: 465, w:  89, h: 134 },
    sticker: { x: 1047, y: 477, w: 115, h: 109, src: 'Assets/Stickers/image 247.png', alt: 'बत्तखें' }
  },
  { // 4 · circle centre (352.5, 496.5) — फूलों वाला रास्ता
    qmark:   { x: 308, y: 430, w:  89, h: 134 },
    sticker: { x: 281, y: 449, w: 144, h:  96, src: 'Assets/Stickers/image 266.png', alt: 'फूलों वाला रास्ता' }
  },
  { // 5 · image 198 @ (620,160)  — झूला
    qmark:   { x: 656, y: 145, w:  89, h: 134 },
    sticker: { x: 636, y: 142, w: 130, h: 140, src: 'Assets/Stickers/image 260 (1).png', alt: 'झूला' }
  }
];

const QMARK_SRC = 'Assets/Story elements/Question mark.png';

/* ------------------------------------------------------------- questions */

const QUESTIONS = [
  {
    page: 21, celebPage: 22,
    text: 'सबसे पहले नूरी और तेज़ ने क्या देखा?',
    voice: 'Assets/Audio/Page 21 Question 1.wav',
    tmplY: 118, textY: 267,
    options: [
      { src:'Assets/Stickers/image 278.png', label:'पहाड़', x: 360, y:487, w:514, h:342,
        voice:'Assets/Audio/options/पहाड़.wav' },
      { src:'Assets/Stickers/image 279.png', label:'नदी',  x:1035, y:500, w:489, h:326, correct:true,
        voice:'Assets/Audio/options/नदी.wav' }
    ],
    gif: { src:'Assets/GIF/sprite-max-px-frames-36-rows-6-cols-6 (17).gif', x:745, y:262, w:429, h:556 }
  },
  {
    page: 24, celebPage: 25,
    text: 'नदी के किनारे कौन सो रहा था?',
    voice: 'Assets/Audio/Page 24 Question 2.wav',
    tmplY: 129, textY: 278,
    options: [
      { src:'Assets/Stickers/image 280.png', label:'भालू',    x: 284, y:553, w:422, h:282,
        voice:'Assets/Audio/options/भालू.wav' },
      { src:'Assets/Stickers/image 281.png', label:'भेड़िया', x: 785, y:559, w:414, h:276, correct:true,
        voice:'Assets/Audio/options/भेड़िया.wav' },
      { src:'Assets/Stickers/image 282.png', label:'खरगोश',   x:1272, y:571, w:376, h:251,
        voice:'Assets/Audio/options/खरगोश.wav' }
    ],
    gif: { src:'Assets/GIF/sprite-max-px-frames-36-rows-6-cols-6 (19).gif', x:661, y:275, w:597, h:530 }
  },
  {
    page: 27, celebPage: 28,
    text: 'नदी में कितनी बत्तखें तैर रही थीं?',
    voice: 'Assets/Audio/Page 27 Question 3.wav',
    tmplY: 129, textY: 277,
    options: [
      /* The three recordings spell the ducks with one त and the five with a
         chandrabindu, where the labels here have त्त and an anusvara. The
         path is written out per option rather than built from the label for
         exactly this reason: the spoken files are named as they are named. */
      { src:'Assets/Stickers/image 292 (1).png', label:'दो बत्तखें',   x: 248, y:537, w:430, h:287,
        voice:'Assets/Audio/options/दो बतखें.wav' },
      { src:'Assets/Stickers/image 309.png',     label:'तीन बत्तखें',  x: 726, y:540, w:430, h:287, correct:true,
        voice:'Assets/Audio/options/तीन बतखें.wav' },
      { src:'Assets/Stickers/image 293.png',     label:'पांच बत्तखें', x:1235, y:545, w:412, h:274,
        voice:'Assets/Audio/options/पाँच बतखें.wav' }
    ],
    gif: { src:'Assets/GIF/sprite-max-px-frames-36-rows-6-cols-6 (17).gif', x:733, y:245, w:453, h:588 }
  },
  {
    page: 30, celebPage: 31,
    text: 'नूरी और तेज़ ने कौन-सा रास्ता चुना?',
    voice: 'Assets/Audio/Page 30 Question 4.wav',
    tmplY: 150, textY: 299,
    options: [
      { src:'Assets/Stickers/image 283.png', label:'फूलों वाला रास्ता',   x: 335, y:540, w:547.5, h:365, correct:true,
        voice:'Assets/Audio/options/फूलों वाला रास्ता.wav' },
      { src:'Assets/Stickers/image 284.png', label:'पत्थरों वाला रास्ता', x:1026, y:537, w:528,   h:352,
        voice:'Assets/Audio/options/पत्थरों वाला रास्ता.wav' }
    ],
    gif: { src:'Assets/GIF/sprite-max-px-frames-36-rows-6-cols-6 (19).gif', x:676, y:287, w:568, h:504 }
  },
  {
    page: 33, celebPage: 34,
    text: 'मेले में पहुँचकर तेज़ को क्या भाया?',
    voice: 'Assets/Audio/Page 33 Question 5.wav',
    tmplY: 158, textY: 307,
    options: [
      { src:'Assets/Stickers/image 285.png',     label:'आइसक्रीम', x: 385, y:500, w:263, h:394,
        voice:'Assets/Audio/options/आइसक्रीम.wav' },
      { src:'Assets/Stickers/image 286 (1).png', label:'गुब्बारे', x: 832, y:493, w:272, h:408,
        voice:'Assets/Audio/options/गुब्बारे.wav' },
      { src:'Assets/Stickers/image 308.png',     label:'झूला',     x:1288, y:505, w:259, h:389, correct:true,
        voice:'Assets/Audio/options/झूला.wav' }
    ],
    gif: { src:'Assets/GIF/sprite-max-px-frames-36-rows-6-cols-6 (21).gif', x:621, y:225, w:677, h:629 },
    /* Page 34 is the only celebration whose GIF is playing something — the
       elephant on the drum — so it gets a drum under the cheer. It runs once
       and is a shade quieter than the celebration, to sit behind it.      */
    celebSfx: { src:'Assets/Audio/Drum.mp3', volume: 0.5 }
  }
];

/* -------------------------------------------------------------- the flow */
/* earned = stickers visible · skate = the stop the skateboard ends up on
   (0 = trail start, 1-5 = checkpoints, 6 = the mela)

   Every map screen is drawn on the Page 19 plate. Pages 20/23/26/29/32/35
   have the skateboard painted into the artwork, so using them would leave a
   second, motionless board on the map while the live one rides past. Page 19
   is the only plate exported without it, and it carries the full dashed
   route — which is exactly the line the board now travels.                 */
const MAP_PLATE = plate(19);
const MAP_DWELL = 5000;         // the map is never on screen for less than this

const FLOW = [
  { type:'map', page:19, earned:0, skate:0 },
  { type:'map', page:20, earned:0, skate:1 },
  { type:'q',   qi:0 },
  { type:'celeb', qi:0 },
  { type:'map', page:23, earned:1, skate:2, pop:1 },
  { type:'q',   qi:1 },
  { type:'celeb', qi:1 },
  { type:'map', page:26, earned:2, skate:3, pop:2 },
  { type:'q',   qi:2 },
  { type:'celeb', qi:2 },
  { type:'map', page:29, earned:3, skate:4, pop:3 },
  { type:'q',   qi:3 },
  { type:'celeb', qi:3 },
  { type:'map', page:32, earned:4, skate:5, pop:4 },
  { type:'q',   qi:4 },
  { type:'celeb', qi:4 },
  { type:'map', page:35, earned:5, skate:6, pop:5, finale:true }
];

/* ===================================================================== DOM */

const $ = id => document.getElementById(id);

const elFit       = $('fit');
const elStage     = $('stage');
const elPlate     = $('plate');
const elPlateNext = $('plateNext');
const elMap       = $('mapLayer');
const elQ         = $('qLayer');
const elQTmpl     = $('qTmpl');
const elQText     = $('qText');
const elQOpts     = $('qOpts');
const elCeleb     = $('celebLayer');
const elGif       = $('celebGif');
const elLeaves    = $('leaves');
const elFx        = $('fxLayer');
const elSkate     = $('skate');
const elErase     = $('erase');
const elErasePath = $('erasePath');
const elBackdrop  = $('backdrop');
const elVideo     = $('finaleVideo');
const elReplay    = $('btnReplay');
const elGate      = $('startGate');
const btnStart    = $('btnStart');

/* =================================================================== audio */

const Audio2 = (() => {
  const cache = new Map();
  let unlocked = false;
  let musicOn  = true;
  let bgm = null;
  let voice = null;           // currently playing narration
  let voiceCut = null;        // tears down the line in flight without reporting it
  let bgmHushed = false;      // the finale film owns the sound while it runs

  /* The one place the music loop's level is decided. Both numbers carry the
     same +20% — 0.264 was 0.22, and the ducked 0.096 was 0.08 — so the track
     is louder without changing how far it drops under a voice. */
  const bgmLevel = duck => (!musicOn || bgmHushed) ? 0 : (duck ? 0.096 : 0.264);
  let actx = null;            // Web Audio, for the generated wrong-answer tone

  const url = p => encodeURI(p);

  function get(path){
    let a = cache.get(path);
    if(!a){
      a = new Audio(url(path));
      a.preload = 'auto';
      cache.set(path, a);
    }
    return a;
  }

  const nudging = new Set();

  function play(path, { volume = 1, restart = true, loop = false } = {}){
    if(!unlocked) return null;
    const a = get(path);
    nudging.delete(a);            // a real play cancels any pending unlock-nudge
    try{
      if(restart) a.currentTime = 0;
      a.loop = loop;              // the elements are cached, so set it every time
      a.volume = volume;
      const p = a.play();
      if(p && p.catch) p.catch(() => {});
    }catch(e){ /* ignore */ }
    return a;
  }

  function stop(a){
    if(!a) return;
    try{ a.pause(); a.currentTime = 0; }catch(e){}
  }

  return {
    preload(){
      const all = [A.bgm, A.plaquePop, A.stickerPop, A.skateboard, A.celebration,
                   A.leaves, A.drum, A.choose, ...A.correct, ...A.praise];
      if(A.wrong) all.push(A.wrong);
      QUESTIONS.forEach(q => {
        all.push(q.voice);
        // Each option names itself as it is dealt, and the naming is what
        // paces the dealing — a clip still loading would hold its card on the
        // table with nothing being said over it, so they come in here too.
        q.options.forEach(o => { if(o.voice) all.push(o.voice); });
      });
      all.forEach(get);
    },
    unlock(){
      unlocked = true;
      // Open Web Audio here, inside the start gesture, so the generated
      // wrong-answer tone is ready to fire without a warm-up later.
      try{
        if(!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        if(actx.state === 'suspended') actx.resume();
      }catch(e){ actx = null; }
      // Nudge every clip once so mobile browsers allow later programmatic play.
      // The BGM is left out — startBgm() plays it inside the same gesture.
      cache.forEach((a, path) => {
        if(path === A.bgm) return;
        nudging.add(a);
        const v = a.volume;
        a.volume = 0;
        const settle = () => {
          if(!nudging.has(a)) return;           // something asked to play it for real
          nudging.delete(a);
          a.pause(); a.currentTime = 0; a.volume = v;
        };
        const p = a.play();
        if(p && p.then) p.then(settle).catch(() => { nudging.delete(a); a.volume = v; });
        else settle();
      });
    },
    sfx(path, volume){ return play(path, { volume: volume == null ? 1 : volume }); },
    /* Same as sfx(), but on its own element, so repeats a fraction of a second
       apart overlap instead of cutting each other off — the option cards pop
       in one after another and every pop needs to be heard in full.        */
    pop(path, volume){
      if(!unlocked) return null;
      const a = get(path).cloneNode();
      a.volume = volume == null ? 1 : volume;
      try{
        const p = a.play();
        if(p && p.catch) p.catch(() => {});
      }catch(e){ /* ignore */ }
      return a;
    },
    /* A bed that keeps running under an animation until something stops it. */
    loopSfx(path, volume){ return play(path, { volume: volume == null ? 1 : volume, loop: true }); },
    stopSfx(path){ stop(cache.get(path)); },
    /* Rides an effect down to silence rather than chopping it off. The leaves
       clip runs 6s, longer than a celebration, so it is faded out with the
       fall instead of trailing over onto the map page.                     */
    fadeSfx(path, ms = 400){
      const a = cache.get(path);
      if(!a || a.paused) return;
      const from = a.volume, t0 = performance.now();
      const tick = () => {
        if(a.paused) return;                    // something else took it over
        const p = (performance.now() - t0) / ms;
        if(p >= 1){ stop(a); a.volume = from; return; }
        a.volume = from * (1 - p);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },

    /* A soft two-note "uh-oh" for a wrong tap. Kept gentle on purpose — this
       is a nudge to try again, not a buzzer. Uses a real file if A.wrong is
       set, otherwise synthesises it so no extra asset is needed.           */
    wrongSound(){
      if(!unlocked) return;
      if(A.wrong){ play(A.wrong, { volume: 0.8 }); return; }
      try{
        if(!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        if(actx.state === 'suspended') actx.resume();
        const now = actx.currentTime;
        const out = actx.createGain();
        out.gain.value = 0.18;
        out.connect(actx.destination);
        [[330, 0], [247, 0.13]].forEach(([hz, at]) => {
          const osc = actx.createOscillator(), g = actx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(hz, now + at);
          g.gain.setValueAtTime(0.0001, now + at);
          g.gain.linearRampToValueAtTime(1, now + at + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.17);
          osc.connect(g); g.connect(out);
          osc.start(now + at);
          osc.stop(now + at + 0.19);
        });
      }catch(e){ /* no Web Audio — the glow and wobble still carry it */ }
    },

    /* narration — only one voice line at a time */
    say(path, { volume = 1, onend } = {}){
      this.hush();
      const a = play(path, { volume });
      if(!a) { if(onend) onend(); return null; }
      voice = a;

      let over = false, guard = 0;
      const finish = fire => {
        if(over) return;
        over = true;
        clearTimeout(guard);
        a.removeEventListener('ended', ended);
        a.removeEventListener('error', ended);
        a.removeEventListener('loadedmetadata', arm);
        a.removeEventListener('timeupdate', arm);
        if(voice === a) voice = null;
        if(voiceCut === cut) voiceCut = null;
        if(fire && onend) onend();
      };
      const ended = () => finish(true);   // the line reached its end
      const cut   = () => finish(false);  // something talked over it
      /* Whatever is waiting on this line — the options wait on the question
         being read — must not be stranded if the clip never reports 'ended'.
         A stalled or undecodable file times out just past its own length
         instead, so the question can always be answered. Re-armed on every
         timeupdate, so the deadline trails wherever playback has actually
         got to and can never cut a slow-starting line short.              */
      const arm = () => {
        clearTimeout(guard);
        const secs = (isFinite(a.duration) && a.duration > 0) ? a.duration : 15;
        guard = setTimeout(ended, Math.max(0, secs - (a.currentTime || 0)) * 1000 + 1500);
      };
      a.addEventListener('ended', ended);
      a.addEventListener('error', ended);
      a.addEventListener('loadedmetadata', arm);
      a.addEventListener('timeupdate', arm);
      voiceCut = cut;
      arm();
      return a;
    },
    hush(){
      if(voiceCut) voiceCut();          // a line that is cut short never reports back
      stop(voice); voice = null;
    },

    /* Answers whether the music actually started, so a caller that is not
       certain it is inside a user gesture can find out and do something about
       it. Standalone it always is — the gate's button is the gesture. */
    startBgm(){
      if(!unlocked) return Promise.reject(new Error('locked'));
      bgm = get(A.bgm);
      bgm.loop = true;
      bgm.volume = bgmLevel(false);
      let p = null;
      try{ p = bgm.play(); }catch(e){ return Promise.reject(e); }
      return (p && p.then) ? p : Promise.resolve();
    },
    duckBgm(on){ if(bgm) bgm.volume = bgmLevel(on); },
    /* The finale film brings its own soundtrack, so the loop stands down
       altogether for it rather than merely ducking. Held in a flag of its own
       so the music button cannot bring the loop back up over the film.    */
    hushBgm(on){ bgmHushed = on; if(bgm) bgm.volume = bgmLevel(false); },
    toggleMusic(){
      musicOn = !musicOn;
      if(bgm) bgm.volume = bgmLevel(false);
      return musicOn;
    },
    get musicOn(){ return musicOn; }
  };
})();

/* ============================================================ sleep / skip */

let stepToken = 0;
let pendingWaits = [];
/* True for exactly as long as the board is travelling. The ride is the one
   thing on a map page that is not a wait to be got through — it is the page's
   whole content, the picture of the journey being made — so nothing hurries it
   along and nothing lands in the middle of it. See skipWaits().             */
let riding = false;

function sleep(ms){
  return new Promise(resolve => {
    const t = setTimeout(() => { done(); resolve(); }, ms);
    const entry = { resolve, t };
    const done = () => {
      clearTimeout(entry.t);
      pendingWaits = pendingWaits.filter(w => w !== entry);
    };
    entry.skip = () => { done(); resolve(); };
    pendingWaits.push(entry);
  });
}
/* Hurry the current screen along. Every pause the flow is sitting in gives
   way at once — but never while the board is riding: the sticker it earns
   lands on a sleep timed to the middle of that ride, and cutting the ride's
   waits short would drop it into the circle before the board has left it.
   A tap during the ride is simply watched, not obeyed.                      */
function skipWaits(){
  if(riding) return;
  const list = pendingWaits.slice();
  pendingWaits = [];
  list.forEach(w => { clearTimeout(w.t); w.resolve(); });
}
const alive = my => my === stepToken;

/* ============================================================ layout / fit */

/* Two ways to put the 16:9 artboard on a screen that is not 16:9:
     fit  — the whole frame is visible; the gap is filled with the page art
            itself, blurred, so no bare letterbox is ever on screen.
     fill — the frame covers every pixel of the window; the overhanging edge
            of the background art is cropped.
   A tiny amount of non-uniform stretch (up to STRETCH) is allowed in fit mode,
   which is enough to close the gap on most laptop windows without any visible
   distortion, so in practice the frame really does reach the screen edges.   */
const STRETCH = 1.06;
let fillMode = false;

function fitStage(){
  const sx = window.innerWidth / 1920;
  const sy = window.innerHeight / 1080;
  const base = fillMode ? Math.max(sx, sy) : Math.min(sx, sy);
  const cap  = base * STRETCH;
  const x = fillMode ? base : Math.min(sx, cap);
  const y = fillMode ? base : Math.min(sy, cap);
  const root = document.documentElement.style;
  root.setProperty('--scale-x', x);
  root.setProperty('--scale-y', y);
  elFit.classList.toggle('fill', fillMode);
}
window.addEventListener('resize', fitStage);
window.addEventListener('orientationchange', () => setTimeout(fitStage, 120));
document.addEventListener('fullscreenchange', () => setTimeout(fitStage, 60));
/* embedded, the fullscreen change happens on the book's document, not ours —
   our own window does get a resize out of it, but the listener is cheap and
   guarantees the refit even where the resize is coalesced away */
if(EMBED && fsDoc() !== document){
  fsDoc().addEventListener('fullscreenchange', () => setTimeout(fitStage, 60));
}

/* ============================================================ plate swaps */

const imgCache = [];
function preloadImages(){
  const list = [MAP_PLATE];
  FLOW.forEach(s => {
    if(s.type === 'q')     list.push(plate(QUESTIONS[s.qi].page));
    if(s.type === 'celeb') list.push(plate(QUESTIONS[s.qi].celebPage));
  });
  list.push(QMARK_SRC,
            'Assets/Story elements/Question Template.png',
            'Assets/Story elements/image 228.png',
            'Assets/Story elements/Skateboard.png');
  CHECKPOINTS.forEach(c => list.push(c.sticker.src));
  QUESTIONS.forEach(q => q.options.forEach(o => list.push(o.src)));
  [...new Set(list)].forEach(src => { const i = new Image(); i.src = encodeURI(src); imgCache.push(i); });
}

let plateSrc = '';
function setPlate(src, crossfade = true){
  src = encodeURI(src);
  if(src === plateSrc) return Promise.resolve();
  plateSrc = src;
  if(!crossfade){ elPlate.src = src; elBackdrop.src = src; return Promise.resolve(); }

  return new Promise(resolve => {
    elPlateNext.onload = () => {
      elPlateNext.classList.add('show');
      setTimeout(() => {
        elPlate.src = src;
        elBackdrop.src = src;                   // keep the surround in step
        elPlateNext.classList.remove('show');
        resolve();
      }, 460);
    };
    elPlateNext.onerror = () => { elPlate.src = src; elBackdrop.src = src; resolve(); };
    elPlateNext.src = src;
  });
}

/* =============================================================== map layer */

function px(v){ return v + 'px'; }

function renderMap(step){
  elMap.innerHTML = '';
  CHECKPOINTS.forEach((cp, i) => {
    const n = i + 1;
    const won = n <= step.earned;
    const hasSkate = n === step.skate;
    if(!won && hasSkate) return;                 // the skateboard occupies it

    const d = document.createElement('div');
    if(won){
      const g = cp.sticker;
      d.className = 'cp sticker';
      d.dataset.cp = n;
      d.style.cssText = `left:${px(g.x)};top:${px(g.y)};width:${px(g.w)};height:${px(g.h)}`;
      d.innerHTML = `<img src="${encodeURI(g.src)}" alt="${g.alt}">`;
      if(step.pop === n) d.style.visibility = 'hidden';   // revealed by popSticker()
    }else{
      const g = cp.qmark;
      d.className = 'cp qmark';
      d.style.cssText = `left:${px(g.x)};top:${px(g.y)};width:${px(g.w)};height:${px(g.h)};` +
                        `animation-delay:${(i * 0.22).toFixed(2)}s`;
      d.innerHTML = `<img src="${encodeURI(QMARK_SRC)}" alt="?">`;
    }
    elMap.appendChild(d);
  });
}

/* ======================================================== skateboard ride */
/* Figma "Vector 6" (node 183:33) is the dashed route. Its box sits at
   (307.694, 263) inside "image 170", which is itself at (-23, -50) in the
   page; the exported SVG is inset a further ~2.45 / 2.48 px to make room for
   the 5px stroke. Adding that up puts SVG (0,0) at page (282.24, 210.52).   */
const TRAIL_OFF = { x: 282.24, y: 210.52 };

/* Where the board rests at each stop: 0 = trail start, 1-5 = the checkpoint
   circle centres, 6 = the mela (Figma page 35 places image 201 there).      */
const STOP_PARK = [
  null,                       // 0 — on the trail itself
  { x:  944, y: 883 },        // 1
  { x: 1605, y: 689 },        // 2   (circle moved left 60 on the new plate)
  { x: 1105, y: 532 },        // 3   (circle moved down 60)
  { x:  353, y: 497 },        // 4   (circle moved right 70, up 10)
  { x:  701, y: 212 },        // 5
  { x: 1635, y: 283 }         // 6 — arrived at the fair. This is where the
];                            //     Page 35 export actually paints the board
                              //     (measured: x 1560-1710, y 238-328), which
                              //     is also where the last un-erasable scrap
                              //     of trail sits, so he parks right over it.

let trailEl = null, trailLen = 0, stopDist = [];

function measureTrail(){
  trailEl  = document.getElementById('trailPath');
  trailLen = trailEl.getTotalLength();

  // Sample the route once, then snap each checkpoint to its nearest point on
  // it, so the stops are real arc-length positions rather than guesses.
  const N = 1600, pts = [];
  for(let i = 0; i <= N; i++){
    const d = trailLen * i / N;
    const q = trailEl.getPointAtLength(d);
    pts.push({ d, x: q.x + TRAIL_OFF.x, y: q.y + TRAIL_OFF.y });
  }
  stopDist = STOP_PARK.map((park, idx) => {
    if(idx === 0) return 0;
    if(idx === STOP_PARK.length - 1) return trailLen;
    let best = 0, bestD = Infinity;
    for(const p of pts){
      const dd = (p.x - park.x) ** 2 + (p.y - park.y) ** 2;
      if(dd < bestD){ bestD = dd; best = p.d; }
    }
    return best;
  });
}

function pointAt(d){
  const q = trailEl.getPointAtLength(Math.max(0, Math.min(trailLen, d)));
  return { x: q.x + TRAIL_OFF.x, y: q.y + TRAIL_OFF.y };
}

/* Hide the first `d` units of the dashed route — the part already ridden.
   The eraser path is a translated copy of the same geometry, so the same
   arc-length numbers apply. Only redraw when it has actually moved.        */
let erasedAt = -1;
function setErase(d){
  d = Math.max(0, Math.min(trailLen, d));
  if(Math.abs(d - erasedAt) < 5) return;
  erasedAt = d;
  elErasePath.setAttribute('stroke-dasharray', d + ' 99999');
}

function placeSkate(x, y, tilt, flip){
  elSkate.style.transform =
    `translate(${(x - 74.5).toFixed(2)}px, ${(y - 25).toFixed(2)}px) ` +
    `rotate(${tilt.toFixed(2)}deg) scaleX(${flip ? -1 : 1})`;
}

function parkSkate(stop){
  const p = STOP_PARK[stop] || pointAt(stopDist[stop]);
  placeSkate(p.x, p.y, 0, false);
  setErase(stopDist[stop]);
}

const easeInOut = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/* Roll from one stop to the next: a short hop out of the circle onto the
   trail, the ride itself with the board banking into the tangent, then a hop
   back into the destination circle.                                        */
function rideSkate(from, to, ms, my){
  return new Promise(resolve => {
    const d0 = stopDist[from], d1 = stopDist[to];
    const p0 = STOP_PARK[from] || pointAt(d0);
    const p1 = STOP_PARK[to]   || pointAt(d1);
    const LEAD = 0.09, TAIL = 0.11;
    const dir  = d1 >= d0 ? 1 : -1;
    const t0   = performance.now();

    /* the flag is raised for the whole journey and lowered however it ends,
       including the step being abandoned under it — a ride left believing it
       was still running would lock the rest of the game out of skipping */
    riding = true;
    const done = () => { riding = false; resolve(); };

    function frame(now){
      if(!alive(my)){ done(); return; }
      const t = Math.min(1, (now - t0) / ms);

      let x, y, tilt = 0, flip = false;
      if(t < LEAD){                                   // hop onto the trail
        const k = easeInOut(t / LEAD), a = pointAt(d0);
        x = p0.x + (a.x - p0.x) * k;
        y = p0.y + (a.y - p0.y) * k;
      }else if(t > 1 - TAIL){                         // hop into the circle
        const k = easeInOut((t - (1 - TAIL)) / TAIL), b = pointAt(d1);
        x = b.x + (p1.x - b.x) * k;
        y = b.y + (p1.y - b.y) * k;
      }else{                                          // along the route
        const k = easeInOut((t - LEAD) / (1 - LEAD - TAIL));
        const d = d0 + (d1 - d0) * k;
        const c = pointAt(d), c2 = pointAt(d + dir * 6);
        x = c.x; y = c.y;
        setErase(d);                                  // the trail goes with him
        const a = Math.atan2(c2.y - c.y, c2.x - c.x) * 180 / Math.PI;
        flip = Math.abs(a) > 90;                      // keep the wheels down
        tilt = flip ? (a > 0 ? a - 180 : a + 180) : a;
        tilt = Math.max(-32, Math.min(32, tilt));     // bank, never cartwheel
      }
      placeSkate(x, y, tilt, flip);

      if(t < 1) requestAnimationFrame(frame);
      else { placeSkate(p1.x, p1.y, 0, false); setErase(d1); done(); }
    }
    requestAnimationFrame(frame);
  });
}

function popSticker(n){
  const node = elMap.querySelector(`.cp.sticker[data-cp="${n}"]`);
  if(!node) return;
  const cp = CHECKPOINTS[n - 1].sticker;

  const halo = document.createElement('div');
  const size = Math.max(cp.w, cp.h) * 2.1;
  halo.className = 'cp-halo';
  halo.style.cssText = `left:${px(cp.x + cp.w / 2 - size / 2)};top:${px(cp.y + cp.h / 2 - size / 2)};` +
                       `width:${px(size)};height:${px(size)}`;
  elMap.appendChild(halo);
  setTimeout(() => halo.remove(), 1200);

  node.style.visibility = 'visible';
  node.classList.add('pop');
  Audio2.sfx(A.stickerPop, 0.9);
  sparkle(cp.x + cp.w / 2, cp.y + cp.h / 2, 14);
}

/* ================================================================ sparkles */

/* ====================================================== shedding leaves */
/* Figma dresses the five celebration pages (22 / 25 / 28 / 31 / 34) with
   "image 228": a flat 1920x1080 sheet of leaves banked down the left and
   right edges, the middle deliberately clear so the board and the GIF read.
   The Page NN.png exports leave that sheet out, so instead of pasting it back
   on we shed it — the leaves fall past the GIF and the sheet's composition is
   what they fall through.

   Below are 15 individual leaves inside image 228.png, as x / y / w / h.
   They were measured off the file's own alpha channel (connected components,
   alpha > 40) and are the boxes that hold exactly one whole uncropped leaf —
   a good spread of the sheet's shapes, two maples included. Each falling leaf
   is the sheet shown through one of these windows.                        */
const LEAF_SPRITES = [
  [   5, 294,  94,  90], [   2, 861, 138, 153], [   2, 583, 111,  73],
  [ 195, 790,  81,  85], [1819, 100,  94, 121], [1827, 401,  89,  87],
  [1765, 828,  77,  77], [1830, 722,  82,  83], [ 277, 918,  68,  62],
  [ 158, 100,  60,  64], [ 204, 260,  69,  59], [1691, 207,  54,  55],
  [ 128, 372,  61,  54], [ 351, 142,  58,  49], [1740, 514,  55,  34]
];

const LEAF_COUNT = 84;          // roughly the density image 228 itself carries
const LEAF_SEED  = 34;          // of those, how many open the page mid-fall

const rnd = (a, b) => a + Math.random() * (b - a);

let leafClear = 0;
function clearLeaves(){ clearTimeout(leafClear); leafClear = 0; elLeaves.textContent = ''; }

/* Leaving a celebration page, the leaves go out with the layer's own .35s
   fade rather than blinking off a frame ahead of it. */
function retireLeaves(){
  if(!elLeaves.firstChild || leafClear) return;
  leafClear = setTimeout(clearLeaves, 450);
}

/* Sheds a fall of leaves AROUND the GIF this page is showing. The two bands
   are image 228's own clearing, re-measured against whichever sprite is on
   screen — the five pages frame their GIF at different sizes — so the
   character is never rained on and the leaves land where Figma put them. */
function shedLeaves(gif){
  clearLeaves();

  const GAP = 40;               // breathing room between the GIF and the fall
  /* Each band runs from the frame edge inwards to the GIF. Leaves are dealt
     along it on a squared curve, so they bank up against the outer edge and
     thin out as they near the character — which is how image 228 is drawn. */
  const bands = [
    { edge: -70,  inner: gif.x - GAP            },
    { edge: 1990, inner: gif.x + gif.w + GAP    }
  ];

  const frag = document.createDocumentFragment();

  for(let i = 0; i < LEAF_COUNT; i++){
    const spr  = LEAF_SPRITES[(Math.random() * LEAF_SPRITES.length) | 0];
    const band = bands[i % 2];                  // alternate, so both sides fill
    const fall = rnd(2600, 4800);
    const t    = Math.pow(Math.random(), 1.8);  // hug the outer edge
    const x    = band.edge + (band.inner - band.edge) * t;

    /* The first LEAF_SEED leaves start on a negative delay: they are already
       partway down on the very first frame, so the page opens looking like
       the Figma still instead of an empty board filling up. The rest are
       dealt out evenly across the celebration so the fall never thins.    */
    const delay = i < LEAF_SEED
      ? -rnd(0.05, 0.8) * fall
      : Math.max(0, ((i - LEAF_SEED) / (LEAF_COUNT - LEAF_SEED)) * 2600 + rnd(-160, 160));

    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.style.cssText =
      `left:${px(Math.round(x))};` +
      `--fall:${fall | 0}ms;` +
      `--drift:${px(Math.round(rnd(-120, 120)))};` +
      `--rest:${px(Math.round(rnd(-40, 980)))};` +   // reduced-motion resting spot
      `animation-delay:${delay | 0}ms;`;

    /* Big leaves at the frame edge, small ones nearest the character — the
       same falling-off image 228 has, and it keeps the GIF's surroundings
       quiet while the corners stay lush.                                  */
    const k = rnd(0.42, 0.85) + (1 - t) * 0.42;
    const s = document.createElement('i');
    s.style.cssText =
      `width:${px(spr[2])};height:${px(spr[3])};` +
      `background-position:${px(-spr[0])} ${px(-spr[1])};` +
      `--k:${k.toFixed(3)};` +
      `--flip:${Math.random() < 0.5 ? -1 : 1};` +
      `--sway:${px(Math.round(rnd(18, 64)))};` +
      `--rot0:${(Math.random() * 360) | 0}deg;` +
      `--tilt:${(rnd(14, 40)) | 0}deg;` +
      `animation-duration:${rnd(1200, 2700) | 0}ms;` +
      `animation-delay:${-rnd(0, 1400) | 0}ms;` +  // desync the flutter
      `opacity:${Math.min(1, 0.72 + k * 0.22).toFixed(2)};`;  // far ones sit back

    leaf.appendChild(s);
    frag.appendChild(leaf);
  }

  elLeaves.appendChild(frag);
}

function sparkle(cx, cy, count = 18){
  for(let i = 0; i < count; i++){
    const s = document.createElement('div');
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 130 + Math.random() * 190;
    s.className = 'spark';
    s.style.cssText =
      `left:${px(cx - 13)};top:${px(cy - 13)};` +
      `--dx:${px(Math.cos(ang) * dist)};--dy:${px(Math.sin(ang) * dist - 40)};` +
      `--dur:${800 + Math.random() * 700}ms`;
    elFx.appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }
}

/* ========================================================== question layer */

let answering = false;
let currentVoice = null;

/* How far the options have got: 'idle' while the question is still being
   read, 'naming' while they are being dealt and said one by one, 'live' once
   "सही चित्र चुने" has been heard and they may be tapped. `namingAt` is the
   card the naming is on, so an interrupted introduction can be picked up
   where it stopped rather than started again or abandoned. */
let optsPhase = 'idle';
let namingAt  = 0;

/* The fallback beat between one option arriving and the next, for an option
   with no recording of its own. With one, the naming is the beat. */
const OPT_STAGGER = 160;        // ms

/* The pause between the question being read out and the first option
   arriving. A question and the answers to it are two different things being
   said, and running them together gives a child no moment to hold the
   question in their head before the choices start talking. Nothing happens
   in it at all: no card, no name, nothing to tap. */
const AFTER_QUESTION = 1000;    // ms
let namingTimer = 0;

function renderQuestion(q){
  elQTmpl.style.top  = px(q.tmplY);
  elQText.style.top  = px(q.textY);
  elQText.textContent = q.text;

  elQTmpl.classList.remove('in'); void elQTmpl.offsetWidth; elQTmpl.classList.add('in');
  elQText.classList.remove('in'); void elQText.offsetWidth; elQText.classList.add('in');

  elQOpts.innerHTML = '';
  elQOpts.classList.remove('live');    // nothing is tappable on a fresh question
  clearTimeout(namingTimer);           // and the last page's beat is not owed
  optsPhase = 'idle';
  namingAt  = 0;
  q.options.forEach((o, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt';
    b.dataset.i = i;
    b.setAttribute('aria-label', o.label);
    b.style.cssText = `left:${px(o.x)};top:${px(o.y)};width:${px(o.w)};height:${px(o.h)};` +
                      `animation-delay:${(i * OPT_STAGGER / 1000).toFixed(2)}s`;
    // stagger the idle pulse so the options breathe out of step
    b.innerHTML = `<img src="${encodeURI(o.src)}" alt="${o.label}" ` +
                  `style="animation-delay:${(i * 0.33).toFixed(2)}s">`;
    b.addEventListener('click', ev => { ev.stopPropagation(); pick(i); });
    elQOpts.appendChild(b);
    // No 'in' class yet: .opt sits at opacity 0 until revealOptions() lets it
    // arrive, so the child hears the whole question before there is anything
    // to tap. The handoff below is armed now and fires when that happens.
    b.addEventListener('animationend', () => {
      // hand off to a static class so :hover transforms are not blocked
      // by the entrance animation's fill state
      b.classList.remove('in');
      b.classList.add('shown');
    }, { once: true });
  });
}

/* Dealing the options, a beat after the question has been read out.

   They are introduced rather than simply put on the table: AFTER_QUESTION of
   silence first, then one card at a time, each named aloud as it lands, and
   when the last of them has been named, "सही चित्र चुने" — everything is
   here, now choose. Only then do they begin to breathe and become tappable.
   A child who cannot read the labels has heard every one of them before being
   asked to pick, and none of them can be picked by accident while that is
   still going on.

   The pacing is the naming itself: a card waits for the one before it to
   finish being said, so a slow-loading clip holds its card with it rather
   than being talked over by the next. An option with no recording falls back
   to the old fixed beat, so a missing file cannot strand the question.

   Resumable on purpose. Audio2.say() cuts the line in flight without
   reporting it, so anything that speaks over the middle of this — the सुनो
   key is the only thing that can — would otherwise break the chain and leave
   the options half-dealt and forever untappable. `namingAt` remembers where
   it had got to and a second call picks it up there. A card already on the
   table is not re-animated or re-popped, only re-named.                    */
function revealOptions(my){
  if(!alive(my) || optsPhase === 'live') return;
  optsPhase = 'naming';
  /* The beat is taken here rather than at the call sites, because every way
     in is the same situation: a line has just finished being said and the
     options follow it. Re-arming the one timer rather than adding a second
     is what keeps a repeated call — सुनो pressed twice — from dealing the
     cards twice over. */
  clearTimeout(namingTimer);
  namingTimer = setTimeout(() => introduce(my, namingAt), AFTER_QUESTION);
}

function introduce(my, i){
  if(!alive(my) || optsPhase !== 'naming') return;
  namingAt = i;

  const cards = elQOpts.querySelectorAll('.opt');
  if(i >= cards.length){ callToAnswer(my); return; }

  const b = cards[i];
  if(!b.classList.contains('in') && !b.classList.contains('shown')){
    void b.offsetWidth;
    b.classList.add('in');
    Audio2.pop(A.stickerPop, 0.7);       // the card landing, under its name
  }

  const next = () => introduce(my, i + 1);
  const name = QUESTIONS[currentQi].options[i].voice;
  if(name) Audio2.say(name, { onend: next });
  else setTimeout(() => { if(alive(my)) next(); }, OPT_STAGGER);
}

/* Every option is on the table and has been named: ask for the answer, and
   open them up when that has been said. The music stays ducked all the way
   through the introduction and comes back up here, because until now
   something has been talking the whole time. */
function callToAnswer(my){
  if(!alive(my)) return;
  Audio2.say(A.choose, {
    onend: () => {
      if(!alive(my)) return;
      optsPhase = 'live';
      elQOpts.classList.add('live');     // they breathe, and they can be tapped
      Audio2.duckBgm(false);
      answering = true;
    }
  });
}

let correctTurn = 0;

function pick(i){
  if(!answering) return;
  const my = stepToken;
  const q = QUESTIONS[currentQi];
  const opt = q.options[i];
  const node = elQOpts.querySelector(`.opt[data-i="${i}"]`);
  if(!node || node.classList.contains('locked')) return;

  Audio2.hush();

  if(opt.correct){
    answering = false;
    elQOpts.querySelectorAll('.opt').forEach(n => {
      n.classList.add('locked');
      if(n !== node) n.classList.add('faded');
    });
    node.classList.remove('wrong');
    node.classList.add('correct');
    sparkle(opt.x + opt.w / 2, opt.y + opt.h / 2, 22);

    Audio2.sfx(A.correct[correctTurn % A.correct.length], 0.85);
    correctTurn++;
    setTimeout(() => {
      Audio2.say(A.praise[currentQi % A.praise.length]);
    }, 650);

    setTimeout(() => { if(alive(my)) nextStep(); }, 2300);
  }else{
    // Red glow, a short wobble and an "uh-oh", then put every option back the
    // way it was — nothing is eliminated, so the whole question is open again.
    // The question voice-over is NOT repeated; it plays once per question and
    // after that only if the child asks for it with the सुनो button.
    answering = false;                              // locked only while it reacts
    Audio2.wrongSound();
    node.classList.remove('wrong'); void node.offsetWidth;
    node.classList.add('wrong');

    setTimeout(() => {
      if(!alive(my)) return;
      node.classList.remove('wrong');               // glow fades, pulse resumes
      answering = true;
      Audio2.duckBgm(false);                        // the narration is done with
    }, 640);
  }
}

function replayVoice(){
  const step = FLOW[stepIndex];
  if(step && step.type === 'q'){
    // Tapping सुनो cuts whatever is being said short — the first reading, or
    // the middle of the options being named — so this one takes over getting
    // the introduction going again when it finishes. revealOptions() resumes
    // from the card the naming had reached; once they are live it does
    // nothing, and this is only a re-reading of the question.
    const my = stepToken;
    Audio2.duckBgm(true);
    currentVoice = Audio2.say(QUESTIONS[step.qi].voice, {
      onend: () => {
        if(optsPhase === 'live'){ Audio2.duckBgm(false); return; }
        revealOptions(my);
      }
    });
  }
}

/* ================================================================== screens */

function showLayer(which){
  const onMap = (which === 'map');
  elQ.classList.toggle('on', which === 'q');
  elCeleb.classList.toggle('on', which === 'celeb');
  if(which !== 'celeb') retireLeaves();
  elMap.style.opacity   = onMap ? '1' : '0';
  elSkate.style.opacity = onMap ? '1' : '0';
  elErase.style.opacity = onMap ? '1' : '0';
}

let stepIndex = 0;
let currentQi = 0;
let prevType = null;
let lastSkate = 0;              // the stop the board is parked on
const voicePlayed = new Set();  // questions whose voice-over has been heard

async function runStep(i){
  const prev = prevType;
  stepIndex = i;
  const my = ++stepToken;
  const step = FLOW[i];
  if(!step) return;
  prevType = step.type;

  elFx.innerHTML = '';
  elReplay.classList.add('hidden');
  // a tap-to-skip must not leave a celebration's sounds ringing over the map
  Audio2.stopSfx(A.leaves);
  Audio2.stopSfx(A.drum);
  if(elVideo.classList.contains('on')){         // never restart behind the film
    elVideo.classList.remove('on');
    try{ elVideo.pause(); }catch(e){}
    Audio2.hushBgm(false);
  }

  /* ----------------------------------------------------------- MAP pages */
  if(step.type === 'map'){
    const first = (i === 0);
    // 19 → 20 stays continuous; arriving from a question/celebration page the
    // overlay waits for the plate crossfade so it never sits on the old art.
    const continuous = first || prev === 'map';
    const from = lastSkate, to = step.skate;

    if(continuous){ showLayer('map'); renderMap(step); parkSkate(from); }
    else { showLayer('none'); }

    await setPlate(MAP_PLATE, !first);
    if(!alive(my)) return;

    if(!continuous){ renderMap(step); parkSkate(from); showLayer('map'); }

    if(first){ lastSkate = to; return; }        // page 19 waits for the start gate

    const shownAt = performance.now();

    await sleep(300);
    if(!alive(my)) return;

    // The board pulls away first; the sticker it just earned lands in the
    // circle behind it, so the two never share the same spot.
    // The rolling sound runs under the ride and nowhere else: it starts as the
    // board pulls away and is cut the moment it lands on the checkpoint.
    Audio2.loopSfx(A.skateboard, 0.7);
    const ride = rideSkate(from, to, 3400, my);
    if(step.pop){
      await sleep(600);
      if(!alive(my)) return;
      popSticker(step.pop);
    }
    await ride;
    Audio2.stopSfx(A.skateboard);
    if(!alive(my)) return;
    lastSkate = to;

    if(step.finale){
      await sleep(700);
      if(!alive(my)) return;
      Audio2.sfx(A.celebration, 0.85);
      burstConfetti();
      await sleep(900);
      if(!alive(my)) return;
      // The journey is over and every answer is in. Once the cheer has had its
      // say, the Happy Ending film closes the story, and only then is the
      // replay button offered — it must never sit on top of the film.
      await new Promise(done => Audio2.say(A.hurray, { onend: done }));
      if(!alive(my)) return;
      await sleep(450);
      if(!alive(my)) return;

      await playFinale();
      if(!alive(my)) return;

      elReplay.classList.remove('hidden');
      return;                                   // journey complete
    }

    // The map stays up for at least MAP_DWELL before the question replaces it.
    await sleep(Math.max(300, MAP_DWELL - (performance.now() - shownAt)));
    if(!alive(my)) return;
    nextStep();
    return;
  }

  /* ------------------------------------------------------ QUESTION pages */
  if(step.type === 'q'){
    currentQi = step.qi;
    const q = QUESTIONS[step.qi];
    answering = false;
    Audio2.stopSfx(A.skateboard);               // never let it run under a question
    showLayer('none');
    await setPlate(plate(q.page));
    if(!alive(my)) return;

    renderQuestion(q);
    showLayer('q');
    Audio2.sfx(A.plaquePop, 0.8);
    Audio2.duckBgm(true);

    await sleep(950);
    if(!alive(my)) return;
    // Each question reads itself out exactly once. A wrong tap never repeats
    // it; the सुनो button is the only way to hear it again.
    // The options are only dealt once the question has been read out in full,
    // so nothing is tappable while the child is still listening.
    // The music stays ducked straight through into the introduction of the
    // options: from here until "सही चित्र चुने" has been said there is a
    // voice going almost the whole time, and callToAnswer() brings it back up.
    if(!voicePlayed.has(step.qi)){
      voicePlayed.add(step.qi);
      currentVoice = Audio2.say(q.voice, { onend: () => revealOptions(my) });
    }else{
      revealOptions(my);        // already heard once — straight to the options
    }
    return;                                     // waits for the player
  }

  /* --------------------------------------------------- CELEBRATION pages */
  if(step.type === 'celeb'){
    const q = QUESTIONS[step.qi];
    showLayer('none');
    await setPlate(plate(q.celebPage));
    if(!alive(my)) return;
    showLayer('celeb');

    elGif.classList.remove('in');
    elGif.style.cssText = `left:${px(q.gif.x)};top:${px(q.gif.y)};width:${px(q.gif.w)};height:${px(q.gif.h)}`;
    elGif.removeAttribute('src');               // restart the sprite loop
    elGif.src = encodeURI(q.gif.src);
    void elGif.offsetWidth;
    elGif.classList.add('in');

    // The leaves let go as the GIF pops in, and the shedding clip starts on
    // the same beat so the sound is the fall the player is watching.
    shedLeaves(q.gif);

    Audio2.sfx(A.celebration, 0.8);
    Audio2.sfx(A.leaves, 0.55);
    if(q.celebSfx) Audio2.sfx(q.celebSfx.src, q.celebSfx.volume);
    Audio2.duckBgm(false);

    await sleep(3200);
    if(!alive(my)) return;
    Audio2.fadeSfx(A.leaves, 400);              // the fall settles with the page
    await sleep(400);
    if(!alive(my)) return;
    nextStep();
    return;
  }
}

function nextStep(){
  if(stepIndex + 1 < FLOW.length) runStep(stepIndex + 1);
}

/* ============================================================ happy ending */

/* The closing film. The board has reached the fair, every answer is in and
   the confetti has gone up; this plays the story out over the whole frame.

   Nothing a child does cuts it short. It is ten seconds, it is the ending
   they have answered five questions to earn, and a hand resting on a tablet
   should not be able to take it away — so the film is watched, not dismissed,
   and the replay button waits until it has finished saying what it says.

   It still always settles, whatever happens: the film reaching its end, a
   decode or autoplay refusal, or a stall that trips the watchdog all land in
   the same teardown — the replay button must never be stranded behind a
   frozen frame.                                                            */
function playFinale(){
  return new Promise(resolve => {
    let over = false, guard = 0;

    const finish = () => {
      if(over) return;
      over = true;
      clearTimeout(guard);
      elVideo.removeEventListener('ended', finish);
      elVideo.removeEventListener('error', finish);
      elVideo.classList.remove('on');
      Audio2.hushBgm(false);                    // the music loop comes back up
      // stop the film only once it has faded, so the last frame does not cut
      setTimeout(() => { try{ elVideo.pause(); }catch(e){} }, 700);
      resolve();
    };

    elVideo.addEventListener('ended', finish);
    elVideo.addEventListener('error', finish);

    Audio2.hush();                              // nothing talks over the film
    Audio2.hushBgm(true);
    try{ elVideo.currentTime = 0; }catch(e){ /* not seekable yet — starts at 0 */ }
    elVideo.classList.add('on');

    const p = elVideo.play();
    if(p && p.catch) p.catch(finish);           // refused or undecodable

    const secs = (isFinite(elVideo.duration) && elVideo.duration > 0)
      ? elVideo.duration : 12;
    guard = setTimeout(finish, secs * 1000 + 2500);
  });
}

function burstConfetti(){
  for(let k = 0; k < 5; k++){
    setTimeout(() => {
      sparkle(300 + Math.random() * 1320, 200 + Math.random() * 520, 16);
    }, k * 260);
  }
}

/* ============================================ fullscreen, fit and the keys */

function toggleFullscreen(){
  const d = fsDoc();
  if(!d.fullscreenElement && !d.webkitFullscreenElement){
    goFullscreen();
  }else{
    try{ (d.exitFullscreen || d.webkitExitFullscreen || (() => {})).call(d); }
    catch(e){ /* refused — fit/fill still covers the screen */ }
  }
}

/* Real fullscreen is the only way the 16:9 frame reaches every screen edge
   exactly. It needs a user gesture, so this is only ever called from one.   */
function goFullscreen(){
  try{
    const d = fsDoc();
    if(d.fullscreenElement || d.webkitFullscreenElement) return;
    const el = d.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if(!req) return;
    const p = req.call(el);
    if(p && p.catch) p.catch(() => {});
  }catch(err){ /* fullscreen refused — the fit/fill modes still cover it */ }
}

/* The four wooden buttons that used to sit in the bottom-right corner are
   gone. What they did is not: the keys below still reach all four, which is
   why toggling music and the fit mode are functions here rather than the
   button click handlers they used to be. */
function toggleMusic(){ Audio2.toggleMusic(); }
function toggleFit(){ fillMode = !fillMode; fitStage(); }

/* Tap anywhere on a non-question screen to hurry things along — a celebration
   already seen, a map already read. What it may not hurry is anything the
   child is meant to be watching: a question, the closing film, and the
   board's ride, which skipWaits() holds on to for itself.                   */
elFit.addEventListener('click', () => {
  const step = FLOW[stepIndex];
  if(!step) return;
  if(step.type === 'q') return;                 // never skip a question
  if(step.finale) return;                       // nor the arrival and the film
  if(stepIndex === 0) return;                   // start gate handles this
  skipWaits();
});

document.addEventListener('keydown', e => {
  const step = FLOW[stepIndex];
  const k = e.key.toLowerCase();
  if(k === 'm'){ toggleMusic(); return; }
  if(k === 'f'){ toggleFullscreen(); return; }
  if(k === 'v'){ toggleFit(); return; }
  if(k === 'r'){ replayVoice(); return; }
  if(step && step.type === 'q' && answering && /^[1-9]$/.test(k)){
    pick(parseInt(k, 10) - 1);
    return;
  }
  if(e.key === ' ' || e.key === 'Enter'){
    if(!elGate.classList.contains('gone')){ btnStart.click(); e.preventDefault(); return; }
    if(step && step.type !== 'q' && !step.finale){ skipWaits(); e.preventDefault(); }
  }
});

elReplay.addEventListener('click', e => {
  e.stopPropagation();
  Audio2.hush();
  Audio2.stopSfx(A.skateboard);
  correctTurn = 0;
  prevType = null;
  lastSkate = 0;
  voicePlayed.clear();          // a fresh run reads the questions out again
  parkSkate(0);
  elFx.innerHTML = '';
  runStep(1);
});

/* =================================================================== boot */

let gameStarted = false;

/* The one way in, whichever door was used: the gate's own button standalone,
   or the storybook's आगे button through TCMMGame.start(). Both are real user
   gestures, which is what unlock() and startBgm() need to be inside of.

   `wantFullscreen` is false only when the caller has already asked for it on
   the gesture that reached us — the book does, on its own document, because
   asking again a frame later would be outside the gesture and be refused.   */
function beginGame(wantFullscreen){
  if(gameStarted) return;
  gameStarted = true;

  if(wantFullscreen) goFullscreen();

  /* the frame may have been sized while it was still hidden behind the story */
  fitStage();
  if(!trailLen) measureTrail();

  Audio2.unlock();
  /* Embedded, the gesture that got us here happened in the book's document
     rather than this one. Browsers do carry it across to a same-origin frame,
     so this is all but always allowed — but a game that came up silent would
     be a broken game, and there would be nothing the child could do about it.
     So if the music is refused, the gate comes back and one tap fixes it. */
  Audio2.startBgm().catch(() => { if(EMBED) openGate(); });
  closeGate();
  runStep(1);
}

function closeGate(){
  elGate.classList.add('gone');
  setTimeout(() => { if(elGate.classList.contains('gone')) elGate.classList.add('hidden'); }, 500);
}
function openGate(){
  elGate.classList.remove('gone', 'hidden');
}

btnStart.addEventListener('click', e => {
  e.stopPropagation();
  if(gameStarted){
    /* the gate is only ever back for one reason: sound was refused. This tap
       is the gesture that was missing — the game itself is already running. */
    Audio2.unlock();
    Audio2.startBgm().catch(() => {});
    closeGate();
    return;
  }
  beginGame(true);
});

/* What the storybook talks to. Kept deliberately small: the book only ever
   needs to know that the game is loaded and to say "go". */
window.TCMMGame = {
  start(){ beginGame(false); },
  get started(){ return gameStarted; },
  refit(){ fitStage(); if(!trailLen) measureTrail(); }
};

(function init(){
  /* embedded there is no gate to show: the book's आगे button already asked
     the question this screen asks, and it is answered before we are seen */
  if(EMBED) elGate.classList.add('gone', 'hidden');
  fitStage();
  measureTrail();
  preloadImages();
  Audio2.preload();
  parkSkate(0);
  showLayer('map');
  runStep(0);
})();
