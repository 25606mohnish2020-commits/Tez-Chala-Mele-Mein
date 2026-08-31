/* ============================================================================
   तेज़ चला मेले में · Tez Chala Mele Mein — interactive picture book
   ----------------------------------------------------------------------------
   The flow is the Figma section, frame for frame: Cover Page, Page 1 … Page 6,
   Page 8 … Page 18. Eighteen frames — there is no Page 7 in the section, which
   is why every sound is keyed by frame name and never by position.

   Modules, in order:
     PAGES      the story itself (art + what lives in each scene)
     SOUND      the whole audio mapping: NARRATION, SCENE_FX, BEDS
     PageAudio  the supplied narration, one window per frame
     Sfx        the supplied effects, one per frame
     Bed        the looping floor: music for the road, drums at the fair
     Tap        the supplied Button Tap, on the controls but not the nav
     Ambience   builds the dust motes and puffs each page carries
     Book       page rendering + the page-turn transition
     UI         buttons, keyboard, swipe, visibility
   ========================================================================== */
(() => {
  "use strict";

  /* ── PAGES ──────────────────────────────────────────────────────────────
     scene keys
       motion  "breathe" (default) | "sway"     subtle life in the artwork
       dust    floating motes
       puffs   [{x,y,size}] % coordinates, a soft breath of air
     Coordinates are % of the picture, which is always 1600×900, so they
     stay correct at every screen size.

     The book is Hindi: only the `hi` half of every text and alt is read. The
     `en` translations are kept here rather than deleted — they are finished
     translation work and cost nothing sitting unused — but nothing renders
     them, and there is no language switch any more.
     -------------------------------------------------------------------- */
  const PAGES = [
    {
      frame: "Cover Page", cover: true,
      alt: {
        hi: "तेज़ कछुआ स्केटबोर्ड पर और नूरी उल्लू छड़ी लिए मेले के मैदान में — कहानी का आवरण-चित्र।",
        en: "Tez the tortoise on his skateboard and Noori the owl with her stick, on the fairground — the cover picture."
      },
      motion: "sway", dust: 5
    },
    {
      frame: "Page 1",
      alt: {
        hi: "तेज़ कछुआ पेड़ के नीचे आराम से लेटा है, उसका लाल स्केटबोर्ड पास रखा है।",
        en: "Tez the tortoise lounging under a tree, his red skateboard beside him."
      },
      motion: "sway", dust: 6
    },
    {
      frame: "Page 2",
      alt: {
        hi: "दूर मेले से डम-डम की आवाज़ सुनकर तेज़ सिर खुजाता है — यह आवाज़ कैसी?",
        en: "Tez scratches his head at the far-off dum-dum of drums — whatever can it be?"
      },
      motion: "sway", dust: 6
    },
    {
      frame: "Page 3",
      alt: {
        hi: "तेज़ खड़ा होकर सिर खुजाता है — कुछ सोच में पड़ा है।",
        en: "Tez standing and scratching his head, puzzled about something."
      },
      motion: "sway", dust: 7
    },
    {
      frame: "Page 4",
      alt: {
        hi: "पेड़ की डाल पर बैठी नूरी उल्लू को तेज़ ऊपर देखकर पुकारता है।",
        en: "Tez looking up at Noori the owl perched on a branch."
      },
      dust: 5
    },
    {
      frame: "Page 5",
      alt: {
        hi: "पेड़ की डाल पर बैठी नूरी उल्लू को तेज़ ऊपर देखकर पुकारता है।",
        en: "Tez looking up at Noori the owl perched on a branch."
      },
      dust: 6
    },
    {
      frame: "Page 6",
      alt: {
        hi: "जंगल की पगडंडी पर तेज़ स्केटबोर्ड पर और नूरी हाथ उठाकर कुछ कहती है।",
        en: "On the forest path, Tez on his skateboard and Noori talking with a raised wing."
      },
      motion: "sway", dust: 7
    },
    {
      frame: "Page 8",
      alt: {
        hi: "तेज़ और नूरी पगडंडी पर आगे बढ़ते हुए, पीछे से दिखते हैं।",
        en: "Tez and Noori setting off together up the path, seen from behind."
      },
      motion: "sway", dust: 7
    },
    {
      frame: "Page 9",
      alt: {
        hi: "नदी के किनारे पहुँचकर तेज़ और नूरी दूर तक फैली नीली नदी देखते हैं।",
        en: "Reaching the riverbank, Tez and Noori look out over the winding blue river."
      },
      motion: "sway", dust: 5
    },
    {
      frame: "Page 10",
      alt: {
        hi: "पगडंडी पर सोए भेड़िये को देखकर तेज़ और नूरी डर से ठिठक जाते हैं।",
        en: "Tez and Noori freeze in fright at the wolf asleep across the path."
      },
      dust: 8
    },
    {
      frame: "Page 11",
      alt: {
        hi: "लकड़ी के पुल पर से तेज़ और नूरी नदी पार करते हैं।",
        en: "Tez and Noori crossing the river on a wooden bridge."
      },
      motion: "sway", dust: 5
    },
    {
      frame: "Page 12",
      alt: {
        hi: "नदी में तीन बत्तख के बच्चे तैर रहे हैं और किनारे से तेज़ और नूरी उन्हें देखते हैं।",
        en: "Three ducklings swimming in the river while Tez and Noori watch from the bank."
      },
      motion: "sway", dust: 5
    },
    {
      frame: "Page 13",
      alt: {
        hi: "फूलों से घिरी चढ़ाई वाली पगडंडी पर तेज़ और नूरी ऊपर बढ़ते हैं।",
        en: "Tez and Noori climbing a flower-lined path."
      },
      /* This page says the drums came again — so it waits, and then they do.
         The couplet is read out first; only when the reader's voice has
         finished does the fair answer, the डम-डम coming up over the trees
         with the sound and holding for five seconds before the way forward
         opens. It is the only page in the book that is not finished when its
         own voice is, which is why `coda` exists at all. The window sets the
         length: five seconds of drum, five seconds of drumming picture. */
      coda: { fx: ["DUM DUM sound.mp3", 0, 5.00, 0.34, 0] },
      motion: "sway", dust: 6
    },
    {
      frame: "Page 14",
      alt: {
        hi: "मेला सामने है — चरखी, घोड़ों वाला झूला और रंगीन दुकानें; तेज़ और नूरी पहुँच जाते हैं।",
        en: "The fair at last — the ferris wheel, the carousel and the striped stalls, with Tez and Noori arriving."
      },
      motion: "sway", dust: 7
    },
    {
      frame: "Page 15",
      alt: {
        hi: "चरखी की डोली में बैठा तेज़ ख़ुशी से ऊपर से नीचे देखता है।",
        en: "Tez riding high in a ferris-wheel car, delighted."
      },
      motion: "sway", dust: 4
    },
    {
      frame: "Page 16",
      alt: {
        hi: "मेले के मैदान में नूरी अकेली खड़ी होकर पंख फैलाए कुछ कहती है।",
        en: "Noori standing alone on the fairground, saying something with a wing outstretched."
      },
      motion: "sway", dust: 6
    },
    {
      frame: "Page 17",
      alt: {
        hi: "मेले के मैदान में नूरी अकेली खड़ी होकर पंख फैलाए कुछ कहती है।",
        en: "Noori standing alone on the fairground, saying something with a wing outstretched."
      },
      motion: "sway", dust: 6
    },
    {
      frame: "Page 18", last: true,
      alt: {
        hi: "मेले के मैदान से नूरी मुस्कुराकर कहानी पूरी करती है।",
        en: "Noori smiling from the fairground as the story closes."
      },
      motion: "sway", dust: 6
    }
  ];

  /* The Figma frames are exported under their own names, spaces and all, and
     are left exactly as delivered — the path is encoded rather than the file
     renamed, so a re-export drops straight in. */
  const art = (frame) => "assets/images/" + encodeURIComponent(frame) + ".png";
  PAGES.forEach((p) => { p.img = art(p.frame); });

  /* ── The Figma section, laid over the paintings ─────────────────────────
     Every frame in the Figma file is a 1920 × 1080 artboard: the painting,
     and on top of it the speech, the verse and the few moving things. The
     PNGs in assets/images are the paintings alone — the text layers are not
     baked into them — so everything above the paint is rebuilt here.

     Coordinates are written in Figma's own pixels, exactly as the file
     reports them, and divided by the artboard at the end. Keeping the raw
     numbers means any line here can be checked against the design without
     arithmetic in between; `pc`/`pr` do the conversion once, so the whole
     overlay scales with the picture at every screen size.

     Two of Figma's numbers cannot be taken at face value. A node the
     designer flipped horizontally is reported mirrored, so its true left
     edge is `1920 − (reported left + width)` — that is why Page 4 and Page 5
     read further right here than the file's own export suggests. Both were
     confirmed by rendering the frame and measuring where the ink actually
     falls, not by trusting the number.

     The डम-डम and the हम्ममममम are cut straight out of the Figma render
     rather than set as live text. They are drawn in Geist, which carries no
     Devanagari at all, so the glyphs a browser would choose are whatever the
     reader's machine falls back to — never the shapes in the design. Cut as
     images they are exact everywhere. The speech and the verse are Baloo
     Bhai 2, which does cover Devanagari, so those stay live text: they scale
     cleanly, they can be read aloud, and they can be selected.
     -------------------------------------------------------------------- */
  const FW = 1920, FH = 1080;                 /* the Figma artboard */
  const FIG = "assets/figma/";
  const pc = (v) => (v / FW) * 100 + "%";     /* across */
  const pr = (v) => (v / FH) * 100 + "%";     /* down */
  /* Type has to be measured against the picture itself, not against whatever
     the parent's font-size happens to be — a percentage would do the latter
     and quietly compound. cqw is % of the container, and .fx is the picture. */
  const cq = (v) => (v / FW) * 100 + "cqw";

  /* a picture laid over the painting: x/y its top-left, w its width, h left
     out where the file lets the height follow the artwork's own proportion */
  const lay = (src, x, y, w, h, more) =>
    Object.assign({ kind: "img", src: FIG + src, x, y, w, h }, more);

  /* a speech box. Kept apart from the other pictures because on a phone it
     leaves with its words: see the caption fallback in style.css. */
  const bub = (src, x, y, w) => lay(src, x, y, w, 0, { bubble: true });

  /* words. cx is the centre line the design centres them on, not the left
     edge — Figma positions every text layer that way and so does this.
     `nw` holds a line together: a verse line is set to its own measured
     width with no slack at all, so a hair's difference in rendering would
     fold a couplet into three lines. Speech wraps inside its box instead,
     which is how the design wraps it. */
  const words = (lines, cx, y, w, size, lh, weight, tint, nw) =>
    ({ kind: "text", lines, cx, y, w, size, lh, weight, tint, nw });

  /* the two voices of the book: speech inside a box, and the recital that
     runs bare across the sky from Page 9 to Page 15 */
  const say   = (lines, cx, y, w, size) =>
    words(lines, cx, y, w, size, 70, 600, "#773300", false);
  const verse = (lines, cx, y, w, nw = true) =>
    words(lines, cx, y, w, 70, 87.5, 500, "#572701", nw);

  const SCENES = {
    /* The design puts an आगे button in the title page's bottom-right corner,
       and it is deliberately not here. That corner already holds this book's
       "कहानी चलाओ" — the same control, in the same place, doing the same job
       and rather more of it, since it starts the reading aloud as well as
       turning the page. Two buttons there would overlap and one of them
       would be a lie. It is kept on Page 18, where the design also has it
       and nothing else is competing for the corner. */
    "Page 1":  [lay("hmm-p1.png", 565, 405, 440, 130, { fade: 1 })],

    /* the fair, heard long before it is seen — cut from the render with its
       sound-arcs, and beating in time with the drum (see cueScene) */
    "Page 2":  [lay("dum-p2.png", 1145, 25, 760, 410, { dum: true })],

    "Page 3":  [bub("bubble-p3.png",  763.02, 245, 394.83),
                say(["अरे! ये कैसी आवाज़ है?"], 973.5, 283, 339, 60)],

    /* flipped in Figma: reported at 562, actually at 840 */
    "Page 4":  [bub("bubble-p4.png",  835.96, 100, 526.10),
                say(["अरे! तुम्हें नहीं पता? आज मेला लगा है।"], 1135, 159, 390, 55)],

    /* flipped too — and three separate text layers, not one wrapped block,
       so the question keeps the designer's own line breaks */
    "Page 5":  [bub("bubble-p5.png", 1336.98, 149, 498.20),
                say(["मेला!"],                    1624, 168, 414, 55),
                say(["कहाँ?"],                    1624, 241, 414, 55),
                say(["और वहाँ पहुँचना कैसे है?"], 1624, 314, 414, 55)],

    "Page 6":  [bub("bubble-p6.png", 1286.99, 230, 458.70),
                say(["चलो मेरे साथ, रास्ता मैं बताती हूँ।"], 1537.5, 285, 357, 55)],

    /* Page 8 carries no words in the design — the picture walks them on */

    /* the recital. Page 9 sets its two lines as separate layers, the rest as
       one block of two, which is how the file has them. */
    "Page 9":  [verse(["चलते-चलते नदी नज़र आई,"], 1431,   88, 680),
                verse(["नीले पानी में लहरें छाईं।"], 1430.5, 212, 567)],
    "Page 10": [verse(["नदी किनारे भेड़िया सोया,", "उसे देखकर चैन खोया।"], 1568.5, 106, 565)],
    "Page 11": [verse(["दूर देखा, पुल था आगे,", "उस पर चढ़कर झटपट भागे।"], 907, 53, 866)],
    "Page 12": [verse(["छप-छप करती बत्तखें प्यारी,", "एक, दो और तीन हैं सारी।"], 465, 70, 866)],

    /* The drums come back, smaller and further off than on Page 2 — and
       `late`, because on this page they are not there when the reader
       arrives. The couplet promises them; the coda brings them. */
    "Page 13": [verse(["फूलों वाली राह अपनाई,", "डम-डम की आवाज़ फिर से आई।"], 467.5, 120, 873),
                lay("dum-p13.png", 1340, 15, 580, 330, { dum: "late" })],

    /* the elephant is a 36-frame drumming loop; the design flips him to face
       Tez and Noori, and lays a soft ellipse under his feet */
    "Page 14": [verse(["खेल-खिलौनों का मेला आया,"], 1315.5, 85, 873),
                lay("elephant-shadow.svg", 1187, 713, 395, 165),
                lay("elephant.gif", 1177, 477, 395, 339, { flip: true })],

    "Page 15": [verse(["पर तेज़ को झूला ही भाया।"], 401.5, 195, 737, false)],

    "Page 16": [bub("bubble-p16.png", 743.98, 304, 498.40),
                say(["अरे! तुम कहाँ रह गए?"], 1015, 370, 322, 55)],
    "Page 17": [bub("bubble-p16.png", 737.98, 284, 498.40),
                say(["हाँ-हाँ, तुम! अब तुम्हारी बारी है।"], 1012.5, 350, 414, 55)],
    /* The last page, and the आगे on it is the way out of the book: press it
       and the story stops where it stands and the game takes the screen. */
    "Page 18": [bub("bubble-p16.png", 733.98, 300, 498.40),
                say(["चलो, अब तुम भी मेले तक आओ।"], 1008.5, 366, 414, 55),
                lay("badge.png", 1473, 850, 269, 161,
                    { lift: true, cta: true, label: "आगे — खेल शुरू करो" })]
  };

  /* Hang each frame's layers on its page, and let the words in them be the
     page's words everywhere else too — the strip under the picture and the
     line the screen reader announces both read from here, so the book can
     never caption a page with anything but what is painted on it. */
  PAGES.forEach((p) => {
    const layers = SCENES[p.frame];
    if (!layers) return;
    p.layersFx = layers;
    const spoken = layers.filter((l) => l.kind === "text")
                         .flatMap((l) => l.lines).join(" ");
    if (spoken) p.text = { hi: spoken };
  });

  /* ── tiny helpers ─────────────────────────────────────────────────────── */
  const $  = (s, r = document) => r.querySelector(s);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ── halted ─────────────────────────────────────────────────────────────
     The book runs until आगे on Page 18 is pressed, and from that moment it is
     over: the game has the screen and nothing of the story may make a sound,
     turn a page or answer a key ever again in this session.

     One flag, read at every door into the book rather than at one of them —
     the narration, the effects, the bed, the button tap, the page turn and
     the keyboard each check it for themselves, so a timer already in flight
     when आगे was pressed, or a key held down through the handover, cannot
     find a way back in behind the game.
     -------------------------------------------------------------------- */
  let halted = false;

  /* ── Story text → one sentence per line ───────────────────────────────────
     A new reader should never have to hunt for where one thought ends and
     the next begins, so every sentence starts its own line. A sentence too
     long for the column still wraps; CSS gives the wrapped part a hanging
     indent so it reads as a continuation, not as a new sentence.

     Speech is kept whole: a terminator inside “quotes” must not break the
     line, or “वाह! तुमने दूध बचा लिया।” would land on two of them with a
     dangling opening quote. The sneezes are <em>elements</em>, so the split
     walks nodes rather than the raw string and never cuts a tag in half.
     --------------------------------------------------------------------- */
  const SENT_END = /[।.?!][”’"')\]]*\s*$/;
  const quotesClosed = (s) =>
    (s.match(/“/g) || []).length === (s.match(/”/g) || []).length;

  function sentenceLines(html) {
    const src = document.createElement("div");
    src.innerHTML = html || "";

    const out = document.createDocumentFragment();
    let line = null;
    const open  = () => { line = document.createElement("span"); line.className = "ln"; };
    const close = () => { if (line && line.textContent.trim()) out.append(line); line = null; };

    open();
    for (const node of [...src.childNodes]) {
      /* text splits after each terminator; an element rides along whole */
      const chunks = node.nodeType === 3
        ? (node.data.match(/[^।.?!]*[।.?!]+[”’"')\]]*\s*|[^।.?!]+/g) || [])
        : [node];
      for (let chunk of chunks) {
        /* the space that followed the previous full stop belongs to no line */
        if (!line.hasChildNodes() && typeof chunk === "string") {
          chunk = chunk.replace(/^\s+/, "");
          if (!chunk) continue;
        }
        line.append(chunk);
        const so_far = line.textContent;
        if (SENT_END.test(so_far) && quotesClosed(so_far)) { close(); open(); }
      }
    }
    close();
    return out;
  }

  const calmMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const calm = () => calmMedia.matches;

  const cssMs = (name, fallback) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? (raw.endsWith("ms") ? n : n * 1000) : fallback;
  };

  /* ── Cover ──────────────────────────────────────────────────────────────
     A layered title page: a background with the hero and the title painted
     out, plus each of those as a cut-out, so the hero can ride in and the
     title pop with a flash before settling back into the original artwork
     pixel for pixel.

     **Inert for this book.** The Figma cover exports as one flat PNG with its
     title already painted in, so no entry in PAGES carries `layers` and this
     never runs — `paint()` takes the flat path and calls `hide()`. It is kept
     whole and unchanged for the day cut-outs are exported: give the cover a
     `layers` block and the entrance comes back on its own.
     -------------------------------------------------------------------- */
  const Cover = (() => {
    const ok = typeof CSS !== "undefined" && !!CSS.supports &&
      (CSS.supports("mask-image", "url(a)") || CSS.supports("-webkit-mask-image", "url(a)"));

    const HERO_MS  = 1020;   /* the hero rides in */
    const TITLE_AT = 830;    /* the title waits for him to arrive */
    const TITLE_MS = 720;

    function place(el, box) {
      el.style.left = box.x; el.style.top = box.y;
      el.style.width = box.w; el.style.height = box.h;
      el.style.backgroundImage = `url("${box.img}")`;
      el.style.webkitMaskImage = `url("${box.mask}")`;
      el.style.maskImage = `url("${box.mask}")`;
    }

    return {
      ok,
      get span() { return TITLE_AT + TITLE_MS; },

      /* point the layers at their images and put them where they belong */
      dress(host, layers) {
        place(host.querySelector(".cover__hero"), layers.hero);
        place(host.querySelector(".cover__title"), layers.title);
        const t = layers.title;
        const f = host.querySelector(".cover__flash");
        f.style.setProperty("--fx", `calc(${t.x} + ${t.w} / 2)`);
        f.style.setProperty("--fy", `calc(${t.y} + ${t.h} / 2)`);
        f.style.setProperty("--fs", layers.flash || "60%");
        host.hidden = false;
      },

      hide(host) { host.hidden = true; host.classList.remove("is-settled"); },

      /* Returns a promise that settles when the entrance has landed. The
         cover is the one page with no recording, so this is what "the first
         one has finished playing" means for it, and the page-turn gate waits
         on it exactly as it waits on a clip's `ended`. */
      play(host) {
        if (!host || host.hidden) return Promise.resolve();
        const hero  = host.querySelector(".cover__hero");
        const title = host.querySelector(".cover__title");
        const flash = host.querySelector(".cover__flash");
        host.classList.remove("is-settled");

        if (calm()) { host.classList.add("is-settled"); return Promise.resolve(); }

        const runs = [];

        runs.push(hero.animate([
          { transform: "translate3d(-72%, 4%, 0) scale(.965) rotate(-2.2deg)", opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.16 },
          { transform: "translate3d(2.2%, -1.1%, 0) scale(1.008) rotate(.7deg)", opacity: 1, offset: 0.74 },
          { transform: "translate3d(-.6%, .3%, 0) scale(.999) rotate(-.2deg)", opacity: 1, offset: 0.89 },
          { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)", opacity: 1, offset: 1 }
        ], { duration: HERO_MS, easing: "cubic-bezier(.22,.72,.24,1)", fill: "both" }));

        flash.animate([
          { transform: "scale(.2)",  opacity: 0 },
          { transform: "scale(.85)", opacity: .8, offset: 0.35 },
          { transform: "scale(1.35)", opacity: 0 }
        ], { duration: 620, delay: TITLE_AT + 40, easing: "ease-out" });

        const pop = title.animate([
          { transform: "translate3d(0, 6%, 0) scale(.24) rotate(-11deg)", opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.18 },
          { transform: "translate3d(0, -1.5%, 0) scale(1.16) rotate(3.5deg)", opacity: 1, offset: 0.55 },
          { transform: "translate3d(0, .6%, 0) scale(.965) rotate(-1.4deg)", opacity: 1, offset: 0.78 },
          { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)", opacity: 1, offset: 1 }
        ], {
          duration: TITLE_MS, delay: TITLE_AT,
          easing: "cubic-bezier(.34,1.1,.3,1)", fill: "both"
        });
        runs.push(pop);

        /* every run ends on an identity transform, which is also the resting
           state, so they can simply be dropped and the CSS idle motion picked
           up without a jump */
        let landed = false;
        return new Promise((done) => {
          const settle = () => {
            if (landed) return;
            landed = true;
            runs.forEach((a) => { try { a.cancel(); } catch { /* already gone */ } });
            host.classList.add("is-settled");
            done();
          };
          if (pop.finished) pop.finished.then(settle).catch(settle);
          /* the timer is only here in case the animation is lost — settle()
             runs once either way, so the promise always resolves */
          setTimeout(settle, TITLE_AT + TITLE_MS + 140);
        });
      },

      /* the sound of it: a whoosh as he arrives, a pop as the title lands */
      cue() {
        if (calm()) return;
      }
    };
  })();

  /* ── The sound table ────────────────────────────────────────────────────
     Everything the book plays, keyed by **Figma frame name** rather than by
     position. The flow has a gap in it — the section runs Cover Page, Page 1
     … Page 6, Page 8 … Page 18, with no Page 7 — so a positional key would
     be one out from Page 8 onward and every clip after it would land on the
     wrong picture. The frame name cannot drift.

     Each entry is [ file, from, to ]: a **window** into the file, in seconds,
     never a cut of it. The recordings are left exactly as supplied and the
     element is simply told where to start and where to stop, which is what
     lets the one poem recording serve seven pages without being chopped into
     seven files.

     from/to were measured, not estimated: ffmpeg silencedetect at -45 dB over
     each file, then the window pulled out to the speech with a 60 ms lead and
     a 120 ms tail, so no syllable is clipped and no page opens on dead air.
     -------------------------------------------------------------------- */
  const SOUND = "assets/audio/", FX = "assets/SFX/";
  const url = (dir, file) => dir + encodeURIComponent(file);

  /* The one recording that spans pages: 36.1 s of poem read straight through,
     for Page 9 to Page 15.

     The reader's own breathing says where the poem's joints are. Five pauses
     run 0.67 s to 0.89 s; every other gap is 0.22 s to 0.54 s. Those five cut
     the recital into six couplets, and a couplet is the unit a page gets —
     both its lines or neither, because half a couplet on a picture is half a
     thought on the wrong picture. The ducklings are the case in point: the
     0.54 s at 21.29 s is a line break inside the fourth couplet, not a joint,
     and cutting there sent `एक, दो और तीन हैं सारी` onto the flower path.

     Six couplets across seven pages means exactly one must be shared, and it
     is the last: Page 14 arrives at the mela and Page 15 rides the wheel, two
     halves of one arrival, so the closing couplet gives a line to each. That
     cut is at 33.02 s, the midpoint of its 0.41 s line break — the one
     boundary here that falls inside a couplet rather than between two.

     Every window is cut at the midpoint of its pause, so each page both
     begins and ends inside the reader's own breath, and turned at a child's
     pace the seven read as the unbroken recital they were recorded as. */
  const POEM = "Page 9 to Page 15 Poem.wav";

  const NARRATION = {
    "Page 3":  ["Page 3.wav",  0.09, 2.41],
    "Page 4":  ["Page 4.wav",  0.19, 5.32],
    "Page 5":  ["Page 5.wav",  0.09, 4.37],
    "Page 6":  ["Page 6.wav",  0.32, 3.93],
    "Page 8":  ["Page 8.wav",  0.14, 4.90],
    "Page 9":  [POEM,  0.28,  5.91],
    "Page 10": [POEM,  5.91, 11.74],
    "Page 11": [POEM, 11.74, 17.90],
    "Page 12": [POEM, 17.90, 24.42],
    "Page 13": [POEM, 24.42, 30.28],
    "Page 14": [POEM, 30.28, 33.02],
    "Page 15": [POEM, 33.02, 36.10],
    "Page 16": ["Page 16.wav", 0.22, 2.98],
    "Page 17": ["Page 17.wav", 0.20, 4.24],
    "Page 18": ["Page 18.wav", 0.21, 2.75]
  };

  /* Cover Page, Page 1 and Page 2 have no recording in the folder, so they
     get no entry and the book does not wait on one — the way forward opens as
     soon as they are on screen. */

  /* One effect per frame, chosen off what is actually in that painting:
     [ file, from, to, gain, delay ms, loop ]. The delay lets the page settle
     first, so the sound arrives with the picture rather than under the page
     turn. `loop` is for the one effect that is a background rather than a
     hit: it runs under its page until the page is left, instead of closing
     at the far edge of its window. */
  const SCENE_FX = {
    /* The cover has no effect. It opens on the bed and nothing else, so the
       first drum a reader hears is the far-off one on Page 2 — which is the
       one the story is actually about. */
    /* Page 2 is the page that hears the fair. The drums are not an event on
       it, they are the whole question the page asks — so the mela's own
       DUM DUM plays under it, quietly and without end, the way a sound
       carried across fields actually arrives. It is the same recording the
       book stands on from Page 14, heard here from much further away. */
    "Page 2":     ["DUM DUM sound.mp3",    0,   53.00, 0.22,   0, true],
    "Page 4":     ["Noori sound.mp3",      0.30, 1.80, 0.70, 260],  /* Noori, first seen        */
    "Page 6":     ["Noori sound 2.mp3",    0.08, 1.09, 0.60, 200],  /* Noori speaks on the path */
    "Page 9":     ["Ducks swimming.mp3",   0.12, 22.0, 0.22, 220],  /* the river opens up       */
    "Page 11":    ["Ducks swimming 2.mp3", 0,    0.95, 0.55, 320],  /* water under the bridge   */
    "Page 12":    ["Ducks.mp3",            0,    5.04, 0.15, 260],  /* the three ducklings      */
    "Page 14":    ["DUM DUM sound 2.mp3",  0,    8.32, 0.40, 150],  /* the fair announces itself*/
    "Page 15":    ["Drum 2.mp3",           0.14, 1.28, 0.55, 200],  /* a beat off the big wheel */
    "Page 16":    ["Noori sound 2.mp3",    0.08, 1.09, 0.60, 220]   /* Noori has the last word  */
    /* Nothing on Page 17 or Page 18, and no bed under any of the last three
       (see HUSH_AT). From Page 16 Noori turns away from the fair and speaks
       to the reader — "अब तुम्हारी बारी है", "चलो, अब तुम भी मेले तक आओ" —
       and the drums would only be talking over her. The book ends on her
       voice and nothing else. */
  };

  /* The bed. Music for the journey, and the fair's own drums once they get
     there — the ground changes under the story at Page 14, which is the whole
     point of arriving. Both loop, and both sit far enough down to be a floor
     rather than a thing you listen to. */
  const BEDS = {
    music: ["TCMM BGM 1.mp3",    0.29, 69.50, 0.16],
    mela:  ["DUM DUM sound.mp3", 0,    53.00, 0.13]
  };
  const FAIR_AT = 13;      /* index of Page 14 — from here on, the mela bed  */
  /* index of Page 16, where the drums stop. From here Noori turns away from
     the fair and speaks to the reader — "अरे! तुम कहाँ रह गए?" — and those
     last three pages stand on nothing at all, so that nothing is playing
     underneath the one moment the book asks the child a question. */
  const HUSH_AT = 15;

  /* Seeking needs the duration, which needs metadata. A fresh source has none
     yet, so the seek waits for it once rather than being dropped. */
  function seek(a, at, then) {
    const go = () => {
      try { if (Math.abs(a.currentTime - at) > 0.02) a.currentTime = at; }
      catch { /* not seekable: it starts from the top instead */ }
      then();
    };
    if (a.readyState >= 1) go();
    else a.addEventListener("loadedmetadata", go, { once: true });
  }

  /* ── PageAudio ──────────────────────────────────────────────────────────
     The narrator, and the one thing the page-turn gate waits on.

     Every frame that has a recording maps to a window in NARRATION, and a
     frame can therefore only ever say its own words: the lookup is by frame
     name, so the Page 7 gap in the flow cannot slide a clip onto the wrong
     picture.

     One HTMLAudioElement exists for the whole session and is reused, so a
     second clip can never start on top of a first. Every entry point goes
     through stop() first, which pauses and rewinds. A monotonically
     increasing token invalidates any play() promise or timer still in flight,
     which is what makes hammering the next/prev buttons safe.

     A window is held by two things at once, because neither alone is enough:
     a timer armed the moment playback really starts, which is accurate but
     cannot see a stall, and a timeupdate guard, which sees everything but
     only fires about four times a second. Whichever notices first ends the
     page, once.
     -------------------------------------------------------------------- */
  const PageAudio = (() => {
    const KEY  = "tcmm.read";
    const MUTE = "tcmm.sound";
    /* ?v= bumps whenever the windows in NARRATION are re-measured — the
       filenames stay the same, so without it a refresh would quietly serve
       the previously cached copy */
    const CUT = 1;

    let on    = localStorage.getItem(KEY)  !== "off";   /* narration on by default */
    let muted = localStorage.getItem(MUTE) === "off";

    let el = null;              /* the single audio element — never a second */
    let token = 0;              /* invalidates anything still in flight */
    let seq = 0;                /* which page in the flow is bound */
    let spec = null;            /* its [file, from, to], or null */
    let stopAt = 0, timer = 0, playing = false;
    const listeners = [];   /* told when sound starts and stops */
    const enders = [];      /* told when a clip is done for good */

    /* --- the single element, wired once so listeners never accumulate ---- */
    function element() {
      if (el) return el;
      el = new Audio();
      el.preload = "auto";
      el.muted = muted;
      /* Deliberately NOT added to the document. An <audio> attached to the
         DOM here never gets past readyState 0 — detached is the only form
         that loads. data-clip on <html> exposes which window is live, so the
         element stays inspectable without touching it. */

      el.addEventListener("playing", () => announce(true));
      el.addEventListener("ended", finish);
      /* the far edge of the window, for a clip that stalls or runs long */
      el.addEventListener("timeupdate", () => {
        if (stopAt && el.currentTime >= stopAt) finish();
      });
      el.addEventListener("error", () => {
        if (!el.getAttribute("src")) return;    /* our own teardown, not a fault */
        finish();
      });
      return el;
    }

    function announce(v) {
      if (v === playing) return;
      playing = v;
      Bed.duck(v);
      listeners.forEach((fn) => fn(v));
    }

    /* The window has closed and nothing more is coming. Everything that
       reaches here means exactly that — the real ended event, the far edge of
       the window, a clip that failed to load, and a play() the browser
       refused before the first gesture — which is why the page-turn gate
       listens here and not to ended alone: a reader must never be left
       waiting on a clip that is never going to end. stop() deliberately does
       NOT come through here, because a page being left behind has not
       finished, it has been abandoned. */
    function finish() {
      if (!stopAt && !playing) return;      /* already done, or never started */
      stopAt = 0;
      clearTimeout(timer); timer = 0;
      if (el) { try { el.pause(); } catch { /* not started */ } }
      announce(false);
      const page = seq;
      enders.forEach((fn) => fn(page));
    }

    function stop() {
      token++;
      stopAt = 0;
      clearTimeout(timer); timer = 0;
      /* Pause and rewind only. Tearing the source down here (removeAttribute
         + load) leaves a teardown in flight that collides with the next
         clip's load and wedges it at readyState 0. The element holds one
         buffer, which the next src replaces, so nothing accumulates. */
      if (el) { try { el.pause(); } catch { /* not started */ } }
      delete document.documentElement.dataset.clip;
      announce(false);
    }

    function start() {
      stop();                        /* always from silence */
      if (halted) return;            /* the book is over; the game has the screen */
      if (!spec) return;             /* a frame with no recording */

      const [file, from, to] = spec;
      const mine = token;
      const a = element();
      a.muted = muted;
      /* Assigning src is enough to start the load; an explicit load() adds
         nothing and only risks aborting it. The poem stays loaded across all
         seven of its pages, because only currentTime changes between them. */
      const want = url(SOUND, file) + "?v=" + CUT;
      if (a.getAttribute("src") !== want) a.src = want;
      document.documentElement.dataset.clip = file;

      seek(a, from, () => {
        if (mine !== token) return;
        stopAt = to;
        const p = a.play();
        if (p && p.catch) p.catch(() => {
          /* blocked before the first gesture, or the clip is missing —
             either way stay silent rather than half-playing */
          if (mine === token) finish();
        });
        /* armed off the real start of playback, not off the request */
        const arm = () => {
          if (mine !== token) return;
          clearTimeout(timer);
          timer = setTimeout(() => { if (mine === token) finish(); },
                             Math.max(120, (to - a.currentTime) * 1000 + 90));
        };
        if (playing) arm(); else a.addEventListener("playing", arm, { once: true });
      });
    }

    return {
      get on() { return on; },
      get muted() { return muted; },
      get playing() { return playing; },

      /* whether the frame now bound has a recording at all. Cover Page,
         Page 1 and Page 2 do not, and that is the difference between a page
         the reader must wait out and one with nothing to wait for. */
      get hasClip() { return !!spec; },

      /* called on every page change. The page object carries the frame name,
         which is the key into NARRATION; the sequence number comes along
         because onEnded has to be able to name the page it belongs to. */
      bind(page, n) {
        stop();
        seq = n || 0;
        spec = (page && NARRATION[page.frame]) || null;
      },

      stop,
      play()   { if (on) start(); },   /* auto-play when a page arrives */
      replay() { start(); },           /* tapping the words */

      toggle() {
        on = !on;
        localStorage.setItem(KEY, on ? "on" : "off");
        if (on) start(); else stop();
        return on;
      },

      setMuted(v) {
        muted = !!v;
        localStorage.setItem(MUTE, muted ? "off" : "on");
        if (el) el.muted = muted;
        Sfx.muted(muted);
        Bed.muted(muted);
        return muted;
      },

      onState(fn) { listeners.push(fn); },

      /* fn(seq) when that page's window is done for good. The number comes
         with it because a turn can start while a clip is still finishing, and
         a late ended from the page just left must not be read as the new page
         having finished. */
      onEnded(fn) { enders.push(fn); }
    };
  })();

  /* ── Sfx ────────────────────────────────────────────────────────────────
     The scene effects, one at a time. A lane of its own rather than part of
     PageAudio, because an effect belongs to the picture and not to the
     narration: it still plays when पढ़कर सुनाओ is switched off, and it stops
     the moment its page is left, so a duck can never quack over the fair.
     -------------------------------------------------------------------- */
  const Sfx = (() => {
    let el = null, timer = 0, token = 0;
    let ring = null;        /* [from, to] while a looping effect runs */

    /* One element, wired once, so the guard below cannot accumulate a
       listener per page. The browser's own loop returns to 0 and would drag
       in whatever sits before `from`, so a looping effect is held inside its
       window here — the same way a bed is. */
    function element() {
      if (el) return el;
      el = new Audio();
      el.preload = "auto";
      el.addEventListener("timeupdate", () => {
        if (!ring) return;
        if (el.currentTime >= ring[1] || el.currentTime < ring[0] - 0.05) {
          try { el.currentTime = ring[0]; } catch { /* not seekable yet */ }
        }
      });
      return el;
    }

    function stop() {
      token++;
      ring = null;
      clearTimeout(timer); timer = 0;
      if (el) { try { el.pause(); } catch { /* not started */ } }
      delete document.documentElement.dataset.sfx;
    }

    /* Fire one effect: [ file, from, to, gain, delay ms, loop ]. Taken as a
       spec rather than a frame name, because not every effect belongs to the
       arrival of a page — Page 13's drums answer its own last line, long
       after the picture has landed. */
    function play(fx) {
        stop();
        if (halted) return;
        if (!fx || PageAudio.muted) return;
        const [file, from, to, gain, delay, loop] = fx;
        const mine = token;

        timer = setTimeout(() => {
          if (mine !== token) return;
          const a = element();
          a.muted = PageAudio.muted;
          a.volume = gain;
          a.loop = !!loop;
          const want = url(FX, file);
          if (a.getAttribute("src") !== want) a.src = want;
          document.documentElement.dataset.sfx = file;

          seek(a, from, () => {
            if (mine !== token) return;
            ring = loop ? [from, to] : null;
            const p = a.play();
            if (p && p.catch) p.catch(() => { /* blocked before a gesture */ });
            clearTimeout(timer);
            /* a hit closes on its own at the far edge of its window, and a
               page turn closes it sooner. A background has no far edge:
               only leaving the page ends it. */
            if (!loop) {
              timer = setTimeout(() => {
                if (mine === token) { try { a.pause(); } catch { /* gone */ } }
              }, Math.max(60, (to - from) * 1000));
            }
          });
        }, delay || 0);
    }

    return {
      stop,
      play,
      muted(v) { if (el) el.muted = v; if (v) stop(); },

      /* fire this frame's arrival effect, if it has one */
      cue(frame) { play(SCENE_FX[frame]); }
    };
  })();

  /* ── Bed ────────────────────────────────────────────────────────────────
     The looping floor under everything. One element per bed, so a swap is a
     crossfade rather than a gap, and it ducks to a third of itself while
     anyone is speaking — the only way a bed and a narrator can share a pair
     of ears.

     It cannot begin before the reader has touched something, because browsers
     refuse, so wake() is called from the first press and the bed joins then,
     already on the right page's ground.
     -------------------------------------------------------------------- */
  const Bed = (() => {
    const FADE = 520;               /* ms, both directions */
    const els = {};
    let want = null, ducked = false, awake = false, held = false, fader = 0;

    function make(key) {
      if (els[key]) return els[key];
      const [file, from, to, gain] = BEDS[key];
      const a = new Audio(url(FX, file));
      a.preload = "auto";
      a.loop = true;
      a.volume = 0;
      a.muted = PageAudio.muted;
      /* loop returns to 0 rather than to `from`, and would otherwise creep
         past `to` into whatever tail the file has, so the window is kept here */
      a.addEventListener("timeupdate", () => {
        if (a.currentTime >= to || a.currentTime < from - 0.05) {
          try { a.currentTime = from; } catch { /* not seekable yet */ }
        }
      });
      return (els[key] = { a, gain, from });
    }

    /* one shared ramp: every bed moves toward its own target together, so a
       crossfade and a duck are the same piece of code */
    function ramp() {
      clearInterval(fader);
      const t0 = Date.now();
      const from = {};
      Object.keys(els).forEach((k) => { from[k] = els[k].a.volume; });

      fader = setInterval(() => {
        const k = Math.min(1, (Date.now() - t0) / FADE);
        Object.keys(els).forEach((key) => {
          const bed = els[key];
          const target = (awake && !held && key === want)
            ? bed.gain * (ducked ? 0.34 : 1)
            : 0;
          bed.a.volume = clamp(from[key] + (target - from[key]) * k, 0, 1);
          if (k === 1 && target === 0) { try { bed.a.pause(); } catch { /* gone */ } }
        });
        if (k === 1) { clearInterval(fader); fader = 0; }
      }, 40);
    }

    const api = {
      /* the first press: the bed may legally begin */
      wake() {
        if (awake) return;
        awake = true;
        api.resume();
      },

      muted(v) {
        Object.values(els).forEach((b) => { b.a.muted = v; });
      },

      /* which bed this frame stands on */
      to(key) {
        if (key === want) return;
        want = key;
        api.resume();
      },

      /* nothing plays into a hidden tab, but a bed that was silenced for that
         reason has not ended — it is waiting, and comes back on return */
      hold(v) {
        v = !!v;
        if (v === held) return;
        held = v;
        if (!awake) return;
        if (held) ramp(); else api.resume();
      },

      resume() {
        if (halted) return;
        if (!awake || held) return;
        /* A page can stand on nothing at all, and that is a floor too — it
           still has to be reached by the same fade as any other, or whatever
           was playing simply carries on underneath it. */
        if (!want) {
          delete document.documentElement.dataset.bed;
          ramp();
          return;
        }
        /* which ground the story is standing on, exposed the same way the
           live clip is, so the swap at the fair is observable */
        document.documentElement.dataset.bed = want;
        const bed = make(want);
        if (bed.a.paused) {
          seek(bed.a, bed.from, () => {
            const p = bed.a.play();
            if (p && p.catch) p.catch(() => { /* not yet allowed */ });
          });
        }
        ramp();
      },

      /* down while the narrator speaks, back up after */
      duck(v) {
        v = !!v;
        if (v === ducked) return;
        ducked = v;
        if (awake) ramp();
      },

      stop() { awake = false; ramp(); }
    };
    return api;
  })();

  /* ── Tap ────────────────────────────────────────────────────────────────
     The supplied Button Tap, so a press answers back. It is interface
     feedback rather than part of the story, and it obeys the same mute
     switch, so silencing the book silences this too.

     Not on Forward and Back: those already answer with a page turn, and a pop
     over it is one sound too many. They call Bed.wake() directly instead, for
     the unlock this carries as a side effect.

     The file runs 1.97 s but the tap itself is the 126 ms at 0.147 s and the
     rest is silence, so it is played as a window like everything else. Two
     elements alternate: a second press arriving before the first has finished
     must sound, not cut its predecessor short.
     -------------------------------------------------------------------- */
  const Tap = (() => {
    const AT = 0.13, END = 0.34;
    let pool = null, turn = 0;

    return {
      play() {
        if (halted) return;
        Bed.wake();                       /* a press is the gesture audio waits for */
        if (PageAudio.muted) return;
        if (!pool) {
          const src = url(FX, "Button Tap.mp3");
          pool = [new Audio(src), new Audio(src)];
          pool.forEach((a) => { a.preload = "auto"; a.volume = 0.85; });
        }
        const a = pool[turn = 1 - turn];
        seek(a, AT, () => {
          const p = a.play();
          if (p && p.catch) p.catch(() => { /* not yet allowed: stay silent */ });
          setTimeout(() => { try { a.pause(); } catch { /* gone */ } },
                     (END - AT) * 1000);
        });
      }
    };
  })();

  /* ── Ambience ───────────────────────────────────────────────────────────
     Rebuilt from scratch on every page so each scene gets its own, fresh,
     never-quite-repeating choreography. Pure CSS animation once built.
     -------------------------------------------------------------------- */
  const Ambience = (() => {
    const host = {
      dust:   $("#dust"),
      puffs:  $("#puffs")
    };

    /* track → swing → body : see the comment block in style.css */
    function nest(cls, bodyHTML) {
      const track = document.createElement("div");
      track.className = cls;
      track.innerHTML =
        `<div class="track"><div class="swing"><div class="body">${bodyHTML}</div></div></div>`;
      return track;
    }

    function dust(n) {
      const f = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const el = nest("mote", "");
        Object.entries({
          "--size":  rnd(0.18, 0.5).toFixed(2) + "cqw",
          "--x":     rnd(3, 96).toFixed(1) + "%",
          "--top":   rnd(45, 96).toFixed(1) + "%",
          "--dx":    rnd(-6, 6).toFixed(1) + "%",
          "--dur":   rnd(13, 26).toFixed(1) + "s",
          "--delay": (-rnd(0, 22)).toFixed(1) + "s"
        }).forEach(([k, v]) => el.style.setProperty(k, v));
        f.appendChild(el);
      }
      return f;
    }

    /* the soft breaths of air pinned to a point in the artwork */
    function pinned(page) {
      const f = document.createDocumentFragment();

      if (!calm()) (page.puffs || []).forEach((p, i) => {
        const el = document.createElement("div");
        el.className = "puff";
        Object.entries({
          "--x": p.x + "%", "--y": p.y + "%",
          "--size": (p.size || 16) + "cqw",
          "--dur": rnd(6.5, 9).toFixed(1) + "s",
          "--delay": (i * 1.4 + rnd(0.5, 2.5)).toFixed(1) + "s"
        }).forEach(([k, v]) => el.style.setProperty(k, v));
        f.appendChild(el);
      });

      return f;
    }

    return {
      build(page) {
        const quiet = calm();
        /* calm mode holds the picture still: only the puffs remain */
        host.dust.replaceChildren(...(quiet ? [] : [dust(page.dust || 0)]));
        host.puffs.replaceChildren(pinned(page));
      }
    };
  })();

  /* ── Book ───────────────────────────────────────────────────────────────
     Holds the current index and owns the page-turn transition.
     -------------------------------------------------------------------- */
  const Book = (() => {
    const slots   = [...document.querySelectorAll(".slot")];
    const arts    = slots.map((s) => s.querySelector(".slot__art"));
    const mat     = $(".book__mat");
    const sheet   = $("#turnSheet");
    const caption = $("#storyText");
    const covers  = slots.map((s) => s.querySelector(".cover"));
    const ambience = $("#ambience");
    const hint    = $("#liveHint");

    let index = 0;
    let live = 0;          // which slot is showing
    let busy = false;      // the double-click guard
    const listeners = [];

    function paint(slot, art, page) {
      /* the cover is layered where masks work, flat everywhere else */
      const cov = slot.querySelector(".cover");
      if (page.layers && Cover.ok) { art.src = page.layers.bg; Cover.dress(cov, page.layers); }
      else { art.src = page.img; Cover.hide(cov); }

      art.alt = page.alt.hi;
      slot.dataset.motion = page.motion || "breathe";

      /* Everything the design puts above the paint. Built fresh for each
         page rather than shown and hidden, because no two frames carry the
         same layers and a stale one left behind would sit on the next
         picture. Dressed here but not started: the turn is still running,
         and a beat belongs to the moment the page lands, which is where
         cueScene() picks it up. */
      const fx = slot.querySelector(".fx");
      fx.replaceChildren();
      for (const l of page.layersFx || []) fx.append(buildLayer(l));

      /* The overlay is decoration and stays out of the accessibility tree —
         the words on it are announced through the live region instead, once,
         rather than twice. A page that carries a control is the exception:
         a focusable button inside an aria-hidden subtree is unreachable to a
         screen reader that can still tab to it. So the page opens up and
         everything on it except the control is hidden one by one. */
      const cta = fx.querySelector(".fx__cta");
      fx.setAttribute("aria-hidden", cta ? "false" : "true");
      if (cta) {
        for (const node of fx.children) {
          if (node !== cta) node.setAttribute("aria-hidden", "true");
        }
      }
      return fx;
    }

    /* One layer of the overlay, placed in the picture's own proportions so
       it holds at every size. Figma's pixels went in; percentages come out. */
    function buildLayer(l) {
      if (l.kind === "img") {
        const im = document.createElement("img");
        im.className = "fx__art";
        im.src = l.src;
        im.alt = "";
        im.decoding = "async";
        im.style.left = pc(l.x);
        im.style.top  = pr(l.y);
        im.style.width = pc(l.w);
        /* a height only where the design fixes one; otherwise the artwork
           keeps its own proportion rather than being stretched to a box */
        if (l.h) im.style.height = pr(l.h);
        if (l.flip)   im.classList.add("is-flipped");
        if (l.dum)    im.classList.add("fx__dum");
        if (l.dum === "late") im.classList.add("is-late");
        if (l.fade)   im.classList.add("is-fading-in");
        if (l.lift)   im.classList.add("fx__badge");
        if (l.bubble) im.classList.add("fx__bubble");

        /* A layer that does something. The button takes the picture's place
           and its exact box, and the picture fills it — so a layer becoming
           pressable moves nothing by a pixel, and the design is still the
           only thing deciding where it sits. */
        if (l.cta) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "fx__cta";
          if (l.label) b.setAttribute("aria-label", l.label);
          b.style.left  = im.style.left;
          b.style.top   = im.style.top;
          b.style.width = im.style.width;
          if (l.h) b.style.height = im.style.height;
          im.style.left = im.style.top = im.style.width = im.style.height = "";
          b.append(im);
          return b;
        }
        return im;
      }

      /* words. The design centres every text layer on a line rather than
         setting a left edge, so the box is placed by its middle. */
      const p = document.createElement("p");
      p.className = "fx__say";
      p.style.left = pc(l.cx);
      p.style.top  = pr(l.y);
      p.style.width = pc(l.w);
      p.style.fontSize = cq(l.size);
      p.style.lineHeight = cq(l.lh);
      p.style.fontWeight = String(l.weight);
      p.style.color = l.tint;
      if (l.nw) p.classList.add("is-nowrap");
      /* the designer's own line breaks, kept as breaks — this verse is
         written in couplets and must not re-wrap to the reader's window */
      l.lines.forEach((line, i) => {
        if (i) p.append(document.createElement("br"));
        p.append(line);
      });
      return p;
    }

    /* pages without a `text` block (the cover) simply show nothing */
    function writeCaption(page) {
      caption.replaceChildren(sentenceLines(page.text ? page.text.hi : ""));
      const words = page.text ? caption.textContent : page.alt.hi;
      hint.textContent = `पन्ना ${index + 1} / ${PAGES.length} — ${words}`;
    }

    /* Hand the narrator this page and put the right bed under it. The page
       object goes in rather than its words, because a frame's recording is
       looked up by frame name — the Page 7 gap in the flow means position
       cannot be trusted, and these frames carry no text of their own to look
       at. The sequence number rides along for onEnded to name. */
    function bindAudio() {
      const page = PAGES[index];
      PageAudio.bind(page, index + 1);
      Bed.to(index >= HUSH_AT ? null : index >= FAIR_AT ? "mela" : "music");
    }

    /* the effect that belongs to this painting. Separate from bindAudio
       because arriving at a page cues it and merely binding one does not: the
       book is painted before the reader has pressed anything. */
    function cueScene() {
      Sfx.cue(PAGES[index].frame);
      cueBeat();
    }

    /* The डम-डम keeps time with the drum, so it starts when the drum does.
       Removing the class and forcing a reflow before re-adding it is what
       makes the beat run again on a second visit — without the reflow the
       browser coalesces the two changes and the animation never restarts.

       Kept apart from cueScene() because the two are wanted in different
       places: the sound waits for the reader to press something, but the
       picture must never wait for anything. A page opened straight at its
       own address has landed without a turn to announce it, and a डम-डम
       still sitting at zero opacity would simply be a missing word. */
    function cueBeat(late) {
      const which = late ? ".fx__dum.is-late" : ".fx__dum:not(.is-late)";
      for (const dum of slots[live].querySelectorAll(which)) {
        dum.classList.remove("is-on");
        void dum.offsetWidth;
        dum.classList.add("is-on");
      }
    }

    function preload(i) {
      const p = PAGES[i];
      if (!p) return;
      const urls = p.layers && Cover.ok
        ? [p.layers.bg, p.layers.hero.img, p.layers.hero.mask,
           p.layers.title.img, p.layers.title.mask]
        : [p.img];
      for (const u of urls) {
        const im = new Image();
        im.decoding = "async";
        im.src = u;
      }
    }

    /* the entrance only looks right once the cut-outs can actually be drawn */
    function waitForLayers(layers) {
      const urls = [layers.hero.img, layers.hero.mask, layers.title.img, layers.title.mask];
      return Promise.all(urls.map((u) => new Promise((done) => {
        const im = new Image();
        im.onload = im.onerror = () => done();
        im.src = u;
      })));
    }

    /* ── has this page finished saying its piece? ──────────────────────────
       One signal, three sources, because what a reader waits for is not the
       same on every page: a page with a recording ends on its narration, a
       layered cover ends on its entrance, and a page whose clip is switched
       off, missing or refused has nothing to wait for at all — which is the
       case for Cover Page, Page 1 and Page 2 here.
       Whichever it is, it arrives here once per visit, and the button gate
       upstream is the only thing that listens.
       -------------------------------------------------------------------- */
    const readyListeners = [];
    let announced = false;          /* reset on every arrival */

    function announceReady() {
      if (announced) return;        /* once per visit, whoever gets here first */
      announced = true;
      readyListeners.forEach((fn) => fn(index));
    }

    /* A late `ended` belongs to the page it names, not to wherever we are
       now — otherwise a clip finishing during a turn would mark the page just
       arrived at as read. */
    PageAudio.onEnded((page) => {
      if (page === index + 1 && !runCoda()) announceReady();
    });

    /* The page that answers itself. Page 13 reads "डम-डम की आवाज़ फिर से आई"
       and then the fair actually answers — so its voice ending is not the
       end of the page. The drums come up with the डम-डम over the trees and
       hold for the length of the window, and only then does the way forward
       open and Page 14 become reachable. Answers whether it took the page
       over, so its two callers know not to announce for themselves.

       The page it started on is remembered: leaving mid-coda must not mark
       whatever page is on screen five seconds later as read. */
    let codaTimer = 0;
    function runCoda() {
      const coda = PAGES[index].coda;
      if (!coda) return false;
      const [, from, to, , delay] = coda.fx;
      const mine = index;

      Sfx.play(coda.fx);
      cueBeat(true);                  /* the late डम-डम, in time with it */

      clearTimeout(codaTimer);
      codaTimer = setTimeout(() => {
        if (mine === index) announceReady();
      }, (delay || 0) + (to - from) * 1000);
      return true;
    }

    /* Decide what this page's arrival is waiting on. Called with whether the
       cover entrance is running, since that one announces for itself. */
    function awaitPresentation(coverRunning) {
      if (coverRunning) return;                        /* Cover.play announces */
      if (PageAudio.on && PageAudio.hasClip) return;   /* onEnded announces */
      /* no voice to wait for — a coda page still owes its drums */
      if (runCoda()) return;
      announceReady();                                 /* nothing to wait for */
    }

    /* run the cover entrance, if the page we just landed on has one.
       Answers whether it is actually running. */
    function playCover() {
      const host = covers[live];
      if (!PAGES[index].layers || !Cover.ok || host.hidden) return false;
      const mine = index;
      Cover.play(host).then(() => { if (mine === index) announceReady(); });
      Cover.cue();
      return true;
    }

    /* Turning pages deliberately does NOT write the page into the URL, so a
       refresh always brings the reader back to the cover — a fresh start for
       the next child. An explicit #p7 typed or shared still opens page 7. */
    function emit() {
      listeners.forEach((fn) => fn(index, PAGES.length));
    }

    /* the page turn ------------------------------------------------------ */
    function go(target, dir) {
      if (halted) return false;      /* the book is over; the game has the screen */
      target = clamp(target, 0, PAGES.length - 1);
      if (busy || target === index) return false;   /* the double-click guard */
      dir = dir || (target > index ? 1 : -1);
      busy = true;
      announced = false;       /* the page we are going to has not been read */

      const page = PAGES[target];
      const out = slots[live];
      const inn = slots[1 - live];
      const D = cssMs("--turn-ms", 780);
      const ease = "cubic-bezier(.42,.03,.22,1)";
      const quiet = calm();

      index = target;          /* button states update at once */
      emit();
      PageAudio.stop();        /* the leaving page goes silent at once */
      Sfx.stop();              /* and takes its ducks and drums with it */

      paint(inn, arts[1 - live], page);
      inn.removeAttribute("aria-hidden");
      out.setAttribute("aria-hidden", "true");

      caption.classList.add("is-out");

      /* stack order: the leaving page rides on top as it peels away */
      out.classList.add("is-leaving");
      inn.classList.add("is-active");

      /* anims are cancelled once the turn lands; soft ones self-revert */
      const anims = [];
      if (quiet) {
        anims.push(out.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D, fill: "both" }));
        anims.push(inn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: D, fill: "both" }));
      } else {
        /* A real sheet of paper, hinged at the spine down the left edge.
           Going forward, the page you are on lifts its free right edge toward
           you and swings left off the book, uncovering the next one lying
           underneath. Going back is the very same movement played backwards —
           the previous page comes down out of the left and settles flat — so
           one set of frames and `direction: reverse` describes both, which is
           also why the two directions cannot drift apart.

           rotateY runs negative because that is the way the free edge comes
           towards the reader. */
        const mover = dir > 0 ? out : inn;   /* the page that actually turns */
        const under = dir > 0 ? inn : out;   /* the one it uncovers, or covers */
        const play  = dir > 0 ? "normal" : "reverse";

        mover.style.transformOrigin = "left center";
        /* the turning page rides above the still one, whichever way we go */
        mover.style.zIndex = "4";
        under.style.zIndex = "2";
        mover.classList.add("is-turning");     /* lights its free edge */

        /* These angles are shaped, not evenly spaced, and the timing is
           linear on purpose — the shape lives in the numbers.

           Perspective is why. The free edge of the sheet does not travel with
           the angle: a page swung toward the reader is magnified, so its edge
           barely leaves the right-hand side for the first 25 degrees and then
           races to the spine, and by roughly 78 degrees there is no page left
           on screen at all. Fed an even sweep of angles, the whole turn would
           be over in two thirds of the time and the last third would be a
           held picture. So the angles below hold back early and open out
           late, which is what makes the edge cross the picture at a steady
           pace. They were read off the projection at perspective: 2400px;
           change that and these want re-reading.

           No opacity anywhere in here: past 78 degrees the sheet projects
           past its own hinge and the frame's overflow has already taken it
           away, so there is nothing left to fade out. */
        anims.push(mover.animate([
          { transform: "rotateY(0deg) translateZ(0px)",    filter: "brightness(1)",
            offset: 0, easing: "cubic-bezier(.4,.08,.68,.62)" },   /* the lift */
          { transform: "rotateY(-26deg) translateZ(16px)", filter: "brightness(.98)", offset: 0.18 },
          { transform: "rotateY(-40deg) translateZ(22px)", filter: "brightness(.95)", offset: 0.38 },
          { transform: "rotateY(-50deg) translateZ(22px)", filter: "brightness(.92)", offset: 0.52 },
          { transform: "rotateY(-60deg) translateZ(18px)", filter: "brightness(.88)", offset: 0.66 },
          { transform: "rotateY(-70deg) translateZ(11px)", filter: "brightness(.82)", offset: 0.82 },
          { transform: "rotateY(-80deg) translateZ(0px)",  filter: "brightness(.74)", offset: 1 }
        ], { duration: D, easing: "linear", fill: "both", direction: play }));

        /* the page below only lies there: it lightens as the shadow leaves it
           and rises the last thread of a percent into place */
        anims.push(under.animate([
          { transform: "scale(.994)", filter: "brightness(.84)" },
          { transform: "scale(1)",    filter: "brightness(1)" }
        ], { duration: D, easing: ease, fill: "both", direction: play }));

        /* the shade gathering along the bend of the turning sheet */
        anims.push(mover.querySelector(".slot__fold").animate([
          { opacity: 0,   transform: "scaleX(1)" },
          { opacity: .45, transform: "scaleX(1.5)", offset: 0.5 },
          { opacity: .9,  transform: "scaleX(2.4)" }
        ], { duration: D, easing: ease, fill: "both", direction: play }));

        /* The shadow the standing page throws onto the one it is uncovering.
           It has to stay beside that free edge, so it is keyed to the very
           same offsets as the rotation above, at the positions those angles
           project the edge to: 100%, 100%, 87%, 71%, 50%, 23%, 0% of the
           picture — divided by the band's own 30% width, which is what
           translateX is a percentage of. Same offsets, same linear timing, so
           the shadow cannot drift off the fold. */
        anims.push(sheet.animate([
          { transform: "translate3d(333%,0,0)", opacity: 0,    offset: 0 },
          { transform: "translate3d(333%,0,0)", opacity: 0.34, offset: 0.18 },
          { transform: "translate3d(290%,0,0)", opacity: 0.5,  offset: 0.38 },
          { transform: "translate3d(237%,0,0)", opacity: 0.54, offset: 0.52 },
          { transform: "translate3d(167%,0,0)", opacity: 0.55, offset: 0.66 },
          { transform: "translate3d(77%,0,0)",  opacity: 0.5,  offset: 0.82 },
          { transform: "translate3d(0%,0,0)",   opacity: 0,    offset: 1 }
        ], { duration: D, easing: "linear", fill: "both", direction: play }));

        /* the whole book settles, like a real sheet dropping into place */
        mat.animate([
          { transform: "scale(1)" },
          { transform: "scale(.988)", offset: 0.4 },
          { transform: "scale(1)" }
        ], { duration: D * 1.1, easing: "ease-in-out" });

        /* the ambient layer dips so the swap reads as a single movement */
        ambience.animate([
          { opacity: 1 }, { opacity: 0.12, offset: 0.45 }, { opacity: 1 }
        ], { duration: D, easing: "ease-in-out" });
      }

      /* text and scenery change over at the midpoint of the turn */
      setTimeout(() => {
        writeCaption(page);
        Ambience.build(page);
        caption.classList.remove("is-out");
      }, Math.round(D * 0.42));

      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        out.classList.remove("is-active", "is-leaving", "is-turning");
        inn.classList.remove("is-turning");
        anims.forEach((a) => { try { a.cancel(); } catch { /* already gone */ } });
        out.style.transformOrigin = "";
        inn.style.transformOrigin = "";
        /* hand the stacking back to the CSS classes */
        out.style.zIndex = "";
        inn.style.zIndex = "";
        live = 1 - live;
        busy = false;
        preload(index + 1); preload(index - 1);
        bindAudio();
        PageAudio.play();               /* this page's clip, and only this one */
        cueScene();                     /* and the sound of what is in it */
        awaitPresentation(playCover());
        emit();
      };

      if (anims[0] && anims[0].finished) anims[0].finished.then(settle).catch(settle);
      /* belt and braces: never leave the book locked if an animation is lost */
      setTimeout(settle, D + 120);

      return true;
    }

    return {
      get index() { return index; },
      get total() { return PAGES.length; },
      get busy()  { return busy; },
      next() { return go(index + 1, 1); },
      prev() { return go(index - 1, -1); },
      jump(i) { return go(i, i > index ? 1 : -1); },
      onChange(fn) { listeners.push(fn); },

      /* fn(index) once per visit, when that page has finished presenting
         itself and the reader may reasonably go on */
      onReady(fn) { readyListeners.push(fn); },

      /* "चलाओ": show this page from the top. The cover rides in again, a
         story page starts its clip over, and either way the page counts as
         unfinished until that presentation ends — which is what makes Play
         the thing that starts the first page rather than a page that has
         quietly already finished before the reader pressed anything. */
      present() {
        announced = false;
        const coverRunning = playCover();
        if (!coverRunning) { PageAudio.stop(); PageAudio.play(); }
        cueScene();          /* a page cues its effect on arrival, not on load */
        awaitPresentation(coverRunning);
      },

      /* tapping the words reads that page again, whatever the toggle says */
      replay() { PageAudio.replay(); },

      start() {
        /* #p7 opens the book at page 7 — handy for sharing a favourite page */
        const fromHash = parseInt((location.hash.match(/^#p(\d+)$/) || [])[1], 10);
        if (Number.isFinite(fromHash)) index = clamp(fromHash - 1, 0, PAGES.length - 1);

        const first = PAGES[index];
        paint(slots[0], arts[0], first);
        cueBeat();               /* the picture is whole from the first frame */
        writeCaption(first);
        Ambience.build(first);
        bindAudio();

        const reveal = () => {
          document.documentElement.classList.add("is-ready");
          /* the entrance is worth waiting for the cut-outs to decode */
          if (PAGES[index].layers && Cover.ok) {
            waitForLayers(PAGES[index].layers).then(() => Cover.play(covers[live]));
          }
        };
        if (arts[0].complete) reveal();
        else {
          arts[0].addEventListener("load", reveal, { once: true });
          arts[0].addEventListener("error", reveal, { once: true });
        }
        preload(1);
        emit();
      }
    };
  })();

  /* ── PlayMode ───────────────────────────────────────────────────────────
     "चलाओ" hands the screen over to the picture: the top bar lifts out of
     flow and fades, and the book grows to fill the page.

     The growth is a FLIP. We measure the book, switch to the play-mode
     layout, measure again, then animate a transform from the old box to the
     new one. Layout is recalculated exactly once; everything the reader sees
     in between is a compositor transform, so the zoom stays smooth and —
     because it ends on real layout, not a held scale — the artwork and text
     are crisp at the end rather than a stretched bitmap.

     Nothing here touches the page-turn: the book keeps its own size rules,
     play mode only changes what those rules resolve to.
     -------------------------------------------------------------------- */
  const PlayMode = (() => {
    const root  = document.documentElement;
    const book  = $("#book");
    const bar   = $(".topbar");
    const ZOOM  = 700;                       /* inside the 500-800ms brief */
    const EASE  = "cubic-bezier(.45,.05,.2,1)";
    const IDLE  = 2600;

    let on = false, zoom = null, idle = 0;

    /* measure -> relayout -> animate the difference away */
    function flip(change) {
      const first = book.getBoundingClientRect();
      change();
      const last = book.getBoundingClientRect();

      if (calm() || !first.width || !last.width) return;
      const scale = first.width / last.width;
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (!isFinite(scale) || scale <= 0) return;

      if (zoom) { try { zoom.cancel(); } catch { /* already gone */ } }
      book.style.willChange = "transform";
      zoom = book.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transform: "translate(0px, 0px) scale(1)" }
      ], { duration: ZOOM, easing: EASE, fill: "none", composite: "replace" });
      book.style.transformOrigin = "top left";

      const done = () => {
        zoom = null;
        book.style.willChange = "";
        book.style.transformOrigin = "";
      };
      zoom.finished.then(done).catch(done);
    }

    /* the exit button and the arrows rest when the reader is still */
    function stir() {
      root.classList.add("is-stirring");
      clearTimeout(idle);
      idle = setTimeout(() => root.classList.remove("is-stirring"), IDLE);
    }

    const onKey = (e) => {
      if (e.key === "Escape") { exit(); return; }
      stir();
    };

    function listen(add) {
      const fn = add ? "addEventListener" : "removeEventListener";
      window[fn]("pointermove", stir, { passive: true });
      window[fn]("pointerdown", stir, { passive: true });
      window[fn]("keydown", onKey);
    }

    function enter() {
      if (on) return;
      on = true;
      /* only rescue focus for keyboard users: the bar is about to go inert,
         but a mouse click shouldn't leave a focus ring on an arrow */
      const el = document.activeElement;
      const byKeyboard = !!(el && el.matches && el.matches(":focus-visible"));

      flip(() => root.classList.add("is-play"));
      bar.inert = true;                      /* keep hidden controls off the tab order */
      listen(true);
      stir();
      if (byKeyboard) $("#nextBtn").focus({ preventScroll: true });
    }

    function exit() {
      if (!on) return;
      on = false;
      flip(() => root.classList.remove("is-play"));
      bar.inert = false;
      listen(false);
      clearTimeout(idle);
      root.classList.remove("is-stirring");
      const el = document.activeElement;
      if (el && el.matches && el.matches(":focus-visible")) {
        $("#playBtn").focus({ preventScroll: true });
      }
    }

    return {
      get on() { return on; },
      enter, exit,
      toggle() { on ? exit() : enter(); },

      /* Leaving for good, rather than stepping back out to the book. exit()
         would animate the shrink and re-arm the top bar for a page nobody is
         going to look at again; this only lets go of the window: the roaming
         listeners, the idle timer and the class they set. */
      halt() {
        on = false;
        listen(false);
        clearTimeout(idle);
        root.classList.remove("is-stirring");
        if (zoom) { try { zoom.cancel(); } catch { /* already gone */ } }
      }
    };
  })();

  /* ── UI ─────────────────────────────────────────────────────────────── */
  const UI = (() => {
    const prev = $("#prevBtn");
    const next = $("#nextBtn");
    const soundBtn = $("#soundBtn");
    const readBtn = $("#readBtn");
    const readLabel = $("#readLabel");
    const playBtn = $("#playBtn");
    const playLabel = $("#playLabel");
    const startBtn = $("#startBtn");
    const exitBtn = $("#exitBtn");
    const frame = $("#frame");

    /* The book is Hindi. There is no second label set and nothing switches
       between them: <html lang="hi"> is the whole of it. */
    const L = {
      prev: "पिछला पन्ना", next: "अगला पन्ना",
      mute: "आवाज़ बंद करें", unmute: "आवाज़ चालू करें",
      read: "पढ़कर सुनाओ", reading: "पढ़ना रोको",
      play: "चलाओ", playHint: "कहानी बड़ी करके देखो",
      start: "कहानी चलाओ", exit: "बाहर आओ"
    };

    /* ── the arrow gate ───────────────────────────────────────────────────
       Which arrow the reader can see is a question about two things and no
       others: whether there is a page behind them, and whether the page they
       are on has finished playing.

       Back exists as soon as there is something to go back to. Forward
       exists only once this page has said its piece — and once earned it is
       never taken away again, because a page already heard is still heard
       when you come back to it later. That is why this is a set of pages
       rather than a single flag, and it is what makes moving backward safe:
       there is no way for going back to remove the way forward.
       ------------------------------------------------------------------- */
    const heard = new Set();       /* pages that have finished presenting */

    const canForward = () =>
      Book.index < Book.total - 1 && heard.has(Book.index);

    /* every forward move in the book goes through here — the arrow, the
       keyboard and a swipe alike, so the rule cannot be sidestepped by
       reaching for a different input */
    const forward = () => { if (canForward()) Book.next(); };

    /* ── the idle hand ────────────────────────────────────────────────────
       A child who has stopped touching the screen has usually stopped because
       they do not know what to touch. After a few still seconds a hand appears
       and taps whatever the way onward is, and vanishes the moment they move.

       It is deliberately built on top of the gate above rather than beside it:
       the hand points at the forward arrow only when the gate has actually
       opened it, so it can never invite a tap that does nothing. And while a
       page is still being read aloud there is nothing to point at, so it stays
       away instead of nagging over the narration.
       ------------------------------------------------------------------- */
    const HandHint = (() => {
      const el = $("#handHint");
      const WAIT = 4200;                  /* long enough not to nag a reader */
      let timer = 0;

      /* what the reader is waiting to be told to press, if anything */
      function where() {
        if (Book.busy) return null;                       /* mid-turn */
        const cover = document.documentElement.classList.contains("at-cover");
        if (cover && !PlayMode.on) return "start";        /* press Play */
        if (canForward()) return "next";                  /* the gate is open */
        return null;
      }

      function hide() {
        el.classList.remove("is-showing");
        next.classList.remove("is-hinted");
      }

      function show() {
        const at = where();
        if (!at) return;
        el.dataset.at = at;
        el.classList.add("is-showing");
        /* so the arrow does not sit dimmed under the hand telling you to press it */
        if (at === "next") next.classList.add("is-hinted");
      }

      function restart() {
        hide();
        clearTimeout(timer);
        timer = setTimeout(show, WAIT);
      }

      const WAKERS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"];

      return {
        start() {
          /* every sign of life resets the wait; passive, so none of this can
             slow a scroll or a swipe down */
          WAKERS.forEach((ev) =>
            window.addEventListener(ev, restart, { passive: true }));
          document.addEventListener("visibilitychange", restart);
          restart();
        },
        /* the page changed, or the gate opened: the hand's target may be
           somewhere else now, so begin the wait again from here */
        refresh: restart,

        /* the book is over: take the hand away and stop listening for the
           stillness that would bring it back over the game */
        stop() {
          clearTimeout(timer);
          hide();
          WAKERS.forEach((ev) => window.removeEventListener(ev, restart));
          document.removeEventListener("visibilitychange", restart);
        }
      };
    })();

    function arrow(btn, visible) {
      btn.classList.toggle("is-hidden", !visible);
      /* what is hidden is also disabled, and so is anything mid-turn: a
         stray click, a held-down key or a second tap on a button already on
         its way out cannot start a turn the reader cannot see coming */
      btn.disabled = !visible || Book.busy;
    }

    function sync(i, total) {
      arrow(prev, i > 0);
      arrow(next, i < total - 1 && heard.has(i));
      prev.setAttribute("aria-label", L.prev);
      next.setAttribute("aria-label", L.next);
      /* the big Play invitation belongs to the title page only */
      document.documentElement.classList.toggle("at-cover", i === 0);
      /* wherever the hand was pointing may not be the way onward any more */
      HandHint.refresh();
    }

    function syncPlayLabels() {
      playLabel.textContent = L.play;
      playBtn.setAttribute("aria-label", `${L.play} — ${L.playHint}`);
      startBtn.setAttribute("aria-label", L.start);
      exitBtn.setAttribute("aria-label", L.exit);
    }

    function syncReadLabel() {
      const on = PageAudio.on;
      /* The recording is Hindi and so is the book, so there is no longer a
         state where the narration does not match the words: the button used
         to disable itself under English text. */
      readBtn.setAttribute("aria-pressed", on ? "true" : "false");
      /* the label names the feature; whether it is on is carried by
         aria-pressed, the pause icon and the colour. It used to read
         "stop reading" even when nothing was playing. */
      readLabel.textContent = L.read;
      readBtn.setAttribute("aria-label", on ? L.reading : L.read);
    }

    function syncSoundLabel() {
      const audible = !PageAudio.muted;
      soundBtn.setAttribute("aria-pressed", audible ? "true" : "false");
      soundBtn.setAttribute("aria-label", audible ? L.mute : L.unmute);
    }

    function bind() {
      /* nav ------------------------------------------------------------- */
      /* These two turn the page, and the turn is answer enough — a pop on top
         of it only lands under the page-turn sound. They still have to wake
         the bed, though: a press is the gesture the browser wants before any
         audio may begin, and a reader who reaches Next without having pressed
         anything else must not leave the book silent. That is the whole of
         what Tap.play() did here besides making a noise. */
      prev.addEventListener("click", () => { Bed.wake(); Book.prev(); });
      next.addEventListener("click", () => { Bed.wake(); forward(); });

      /* keyboard -------------------------------------------------------- */
      document.addEventListener("keydown", (e) => {
        if (halted) return;         /* the keys belong to the game now */
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        /* the target can be the document itself, which has no .closest */
        const el = e.target instanceof Element ? e.target : null;
        const onButton = el ? el.closest("button") : null;
        let handled = true;
        switch (e.key) {
          case "ArrowRight": case "PageDown": forward(); break;
          case "ArrowLeft":  case "PageUp":   Book.prev(); break;
          case "Home": Book.jump(0); break;
          case "End":  Book.jump(Book.total - 1); break;
          case " ":
            if (onButton) { handled = false; break; }   // let the button click
            forward(); break;
          default: handled = false;
        }
        if (handled) e.preventDefault();
      });

      /* swipe ----------------------------------------------------------- */
      let sx = 0, sy = 0, id = null;
      frame.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse") return;
        id = e.pointerId; sx = e.clientX; sy = e.clientY;
      });
      frame.addEventListener("pointerup", (e) => {
        if (e.pointerId !== id) return;
        id = null;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
        dx < 0 ? forward() : Book.prev();
      });
      frame.addEventListener("pointercancel", () => { id = null; });

      /* controls -------------------------------------------------------- */
      soundBtn.addEventListener("click", () => {
        Tap.play();
        PageAudio.setMuted(!PageAudio.muted);
        syncSoundLabel();
      });

      /* Play mode: both entry points, one behaviour. Play hands the screen
         over to the picture AND starts this page from the top, which is what
         makes the first page a page that plays rather than one that finished
         quietly while the reader was still looking at the title. The page
         counts as unheard again from this moment, so Forward goes away until
         the page has played itself out. */
      const play = () => {
        heard.delete(Book.index);
        sync(Book.index, Book.total);
        PlayMode.enter();
        Book.present();
      };

      playBtn.addEventListener("click", () => { Tap.play(); play(); });

      /* The cover's play button answers the touch before it acts on it.
         The tap sounds on pointerdown — the moment the finger lands, and
         the gesture Web Audio wants to unlock on — while the springy release
         is a CSS animation driven by .is-pop. Entering play mode waits one
         short beat so that release is seen and heard, not swallowed by the
         zoom; the class is cleared on animationend so a second tap replays
         it, and re-added after a reflow so the restart actually takes. */
      startBtn.addEventListener("pointerdown", () => Tap.play(), { passive: true });
      startBtn.addEventListener("click", (e) => {
        /* Enter/Space raise a click with no pointer behind it (detail 0), so
           the keyboard gets its pop here rather than going silent */
        if (!e.detail) Tap.play();
        startBtn.classList.remove("is-pop");
        void startBtn.offsetWidth;
        startBtn.classList.add("is-pop");
        setTimeout(play, calm() ? 0 : 140);
      });
      /* both the squash and the ring run .44s, so whichever end arrives first
         is the end of the whole thing — the pulse ring never reports here,
         an infinite animation has no end */
      startBtn.addEventListener("animationend", (e) => {
        if (e.animationName === "startPop" || e.animationName === "startBurst") {
          startBtn.classList.remove("is-pop");
        }
      });
      exitBtn.addEventListener("click", () => { Tap.play(); PlayMode.exit(); });

      /* read aloud, with word-by-word highlighting */
      readBtn.addEventListener("click", () => {
        Tap.play();
        PageAudio.toggle();
        syncReadLabel();
      });

      PageAudio.onState((speaking) =>
        readBtn.classList.toggle("is-speaking", speaking));

      /* what a tap on the picture itself means: आगे leads out of the book,
         and the words read their page again */
      frame.addEventListener("click", (e) => {
        const el = e.target instanceof Element ? e.target : null;
        if (!el) return;
        if (el.closest(".fx__cta")) { Tap.play(); Handoff.go(); return; }
        if (el.closest(".fx__say")) Book.replay();
      });
      $(".caption").addEventListener("click", () => Book.replay());

      /* stop the world when the tab is hidden --------------------------- */
      document.addEventListener("visibilitychange", () => {
        const hidden = document.hidden;
        document.documentElement.classList.toggle("is-hidden", hidden);
        /* nothing plays into a hidden tab. The narration and the effect are
           abandoned; the bed is only held, and fades back in on return. */
        if (hidden) { PageAudio.stop(); Sfx.stop(); }
        Bed.hold(hidden);
      });

      /* rebuild the scene if the visitor flips reduced-motion on/off ---- */
      calmMedia.addEventListener("change", () => Ambience.build(PAGES[Book.index]));
    }

    return {
      start() {
        bind();
        Book.onChange(sync);

        /* the only thing that opens the way forward */
        Book.onReady((i) => {
          heard.add(i);
          if (i === Book.index) sync(Book.index, Book.total);
        });

        sync(Book.index, Book.total);
        HandHint.start();
        syncSoundLabel();
        syncReadLabel();
        syncPlayLabels();
      },

      /* the book's controls, put down for good */
      halt() {
        HandHint.stop();
        [prev, next, soundBtn, readBtn, playBtn, startBtn, exitBtn]
          .forEach((b) => { if (b) b.disabled = true; });
      }
    };
  })();

  /* ── Handoff ────────────────────────────────────────────────────────────
     आगे, on Page 18, and what is on the other side of it.

     The story ends and the game begins — Figma pages 19 → 35, the map, the
     five questions, the stickers and the film at the end. The game is its own
     finished application and it is given its own document to be it in: it
     brings a 1920×1080 artboard, a reset that claims `*`, an audio engine, a
     `.layer` class of its own and a keyboard bound to `document`, and every
     one of those would land on top of the book's if the two shared a page.
     In a frame it keeps all of it, unchanged and entire, exactly as it
     behaves when it is opened on its own.

     Two things make the handover feel like one movement rather than a link
     being followed:

       arm()  loads the game while the reader is still on the last pages, so
              its art and its sound are ready before आगे is ever pressed and
              there is nothing to wait for when it is.

       go()   is inside the press itself. That matters for more than speed:
              fullscreen and the first sound both need a real user gesture,
              and this is it. The frame is same-origin, so the gesture reaches
              the game with the call — a second "start" screen inside the
              frame would only be asking again a question the child has just
              answered, which is why the game hides its own gate when it is
              embedded and waits to be told to begin.

     If the frame never answers — served from somewhere the relative path does
     not reach — the game is opened in this tab instead. It loses the fade and
     it loses the gesture, so the game's own start gate takes over; the child
     still gets the game.
     -------------------------------------------------------------------- */
  const Handoff = (() => {
    /* the game lives beside the book, not inside it; the folder is named with
       spaces and is left that way, so the path is encoded rather than renamed */
    const GAME = "../TCMM%20My%20Dev%20Game/index.html";
    const portal = $("#gamePortal");
    const frame  = $("#gameFrame");

    let armed = false, going = false, settled = false;

    function arm() {
      if (armed || !frame) return;
      armed = true;
      /* `settled` is the difference between "not loaded yet" and "loaded, and
         it is not the game" — a 404 in the frame, say. The first is worth
         waiting for; the second never will be. */
      frame.addEventListener("load",  () => { settled = true; }, { once: true });
      frame.addEventListener("error", () => { settled = true; }, { once: true });
      frame.src = GAME + "?embed=1";
    }

    /* the game's own front door, once its document is up */
    function api() {
      try { return (frame.contentWindow && frame.contentWindow.TCMMGame) || null; }
      catch { return null; }         /* not this origin — the fallback covers it */
    }

    /* Stop the book. Sound first, because that is what a child notices; then
       the controls and the roaming listeners, so nothing can be started again
       behind the game; and last the shell itself, taken out of the layout
       once it has faded — which is what actually ends the ambience, since a
       display:none subtree runs no animation. */
    function stopStory() {
      halted = true;

      PageAudio.stop();
      Sfx.stop();
      Bed.stop();
      Bed.hold(true);

      UI.halt();
      PlayMode.halt();

      const root = document.documentElement;
      root.classList.add("is-handing-over");

      const app   = $(".app");
      const grain = $(".grain");
      setTimeout(() => {
        if (app)   app.style.display = "none";
        if (grain) grain.style.display = "none";
      }, calm() ? 0 : 420);
    }

    /* Reveal the frame and ask the game to begin. It may not have finished
       loading — a reader who reaches आगे unusually fast, or a slow disk — so
       this waits for it rather than giving up, and gives up only after a long
       enough silence to mean the frame is never going to answer. */
    function launch(tries) {
      const game = api();
      if (game && game.start) {
        game.refit && game.refit();
        game.start();
        frame.focus({ preventScroll: true });
        return;
      }
      /* still on its way — but a frame that has finished loading and still has
         no game in it is not going to grow one */
      if (tries > 0 && !settled) { setTimeout(() => launch(tries - 1), 100); return; }
      /* the frame is not going to answer: let the game have the whole tab */
      location.href = GAME;
    }

    function go() {
      if (going) return;
      going = true;

      /* nowhere to put it: the whole tab, then */
      if (!portal || !frame) { location.href = GAME; return; }

      arm();                          /* not armed yet? then it loads now */

      /* Inside the press, so it counts as the gesture. It is asked for on
         this document rather than inside the frame: the frame is what fills
         the screen, and making the frame's own document fullscreen would put
         the game inside a page that is no longer visible. */
      try {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req && !document.fullscreenElement) {
          const p = req.call(el);
          if (p && p.catch) p.catch(() => { /* refused; the frame still fills the window */ });
        }
      } catch { /* refused; the frame still fills the window */ }

      portal.classList.add("is-live");
      portal.setAttribute("aria-hidden", "false");

      stopStory();
      launch(80);                     /* eight seconds before the tab is handed over */
    }

    return {
      arm,
      go,
      get going() { return going; }
    };
  })();

  /* ── go ─────────────────────────────────────────────────────────────── */
  Book.start();
  UI.start();

  /* Load the game as the book comes within sight of its last page, so आगे has
     nothing left to load when it is pressed. */
  Book.onChange((i, total) => { if (i >= total - 2) Handoff.arm(); });
})();
