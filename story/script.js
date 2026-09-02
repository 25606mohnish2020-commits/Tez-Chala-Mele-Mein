/* ============================================================================
   तेज़ चला मेले में · Tez Chala Mele Mein — interactive picture book
   ----------------------------------------------------------------------------
   The flow is the Figma section: Cover Page, Page 1 … Page 6, Page 8 … Page
   16. Sixteen pages — there is no Page 7 in the section, which is why every
   sound is keyed by frame name and never by position, and the section's last
   three frames are one page here, because they are one painting said three
   times over (see Page 16 in SCENES).

   Modules, in order:
     PAGES      the story itself (art + what lives in each scene)
     SOUND      the whole audio mapping: NARRATION, SCENE_FX, BEDS
     PageAudio  the supplied narration, one window per frame
     Sfx        the supplied effects, one per frame
     Bed        the looping floor: music for the road, drums at the fair
     Tap        the supplied Button Tap, on the controls
     Ambience   builds the dust motes and puffs each page carries
     Book       page rendering + the page-turn transition
     UI         the turn-itself timer, controls, keyboard, swipe, visibility
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
      /* The page that hears the fair. The drums are not an event on it, they
         are the whole question it asks — so the page is held for them: five
         seconds of the mela's own DUM DUM, carried from far enough off to be
         quiet, and only then does the book move on. Page 2 has no narration,
         so without this it would turn before the drums had been heard at all.
         It is the same recording the book stands on from Page 14.

         The last 600 ms of the five seconds are a fade. This recording is a
         continuous drum loop with no silence anywhere in it — measured over
         the first nine seconds it never falls below about −18 dB, and at the
         5.00 s edge it is at −5.6 dB, all but its loudest — so there is no
         quiet spot to cut on and moving the edge only moves the click. Faded
         instead, the fair goes back to being far off, which is where it was
         when the page began. */
      coda: { fx: ["DUM DUM sound.mp3", 0, 5.00, 0.286, 0, false, [0, 600]] },   /* 0.22 + 30% */
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
         opens. It is one of the two pages the drums hold open — Page 2 is
         the other, and hears them coming — which is what `coda` is for. The
         window sets the length: five seconds of drum, five seconds of
         drumming picture. */
      coda: { fx: ["DUM DUM sound.mp3", 0, 5.00, 0.442, 0] },   /* 0.34 + 30% */
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
      /* The last page, and the end of the book. It was three — Page 16,
         Page 17 and Page 18 — on one painting the export repeats, and it is
         one page with three moments now: see SCENES. The flow is therefore
         Cover Page, Page 1 … Page 6, Page 8 … Page 16, which is 16 pages,
         and Page 17 and Page 18 no longer name anything the reader reaches.
         Their paintings are left in assets/images rather than deleted; they
         are the same picture as this one. */
      frame: "Page 16", last: true,
      alt: {
        hi: "मेले के मैदान में नूरी पंख फैलाए खड़ी है और मुस्कुराकर कहानी पूरी करती है।",
        en: "Noori on the fairground with a wing outstretched, smiling as she closes the story."
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

  /* One moment of a page that has more than one. Everything handed in is
     tagged with the moment it belongs to, and the page then shows them a
     moment at a time instead of all at once — see Page 16, which is three
     things Noori says to the reader on one picture rather than three pages
     of the same picture. Written as a run of moments rather than as a flat
     list with a number repeated down it, so the scene reads the way it
     plays. */
  const moment = (n, ...layers) =>
    layers.map((l) => Object.assign(l, { step: n }));

  /* words. cx is the centre line the design centres them on, not the left
     edge — Figma positions every text layer that way and so does this.
     `nw` holds a line together: a verse line is set to its own measured
     width with no slack at all, so a hair's difference in rendering would
     fold a couplet into three lines. Speech wraps inside its box instead,
     which is how the design wraps it. */
  const words = (lines, cx, y, w, size, lh, weight, tint, nw) =>
    ({ kind: "text", lines, cx, y, w, size, lh, weight, tint, nw });

  /* How far the poem sits below where the design puts it, in the artboard's
     own units — 40 of 1080, so a shade under 4% of the picture's height, or
     just under half a line of the verse. It is a deliberate departure from
     the file and the only one in this table, which is why it is a named
     number rather than six edited coordinates: see the recital below. */
  const VERSE_DROP = 40;

  /* the two voices of the book: speech inside a box, and the recital that
     runs bare across the sky from Page 8 to Page 15 */
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
       would be a lie. It is kept on Page 16, where the design also has it
       and nothing else is competing for the corner. */
    "Page 1":  [lay("hmm-p1.png", 565, 405, 440, 130, { fade: 1 })],

    /* The fair, heard long before it is seen, beating in time with the drum
       (see cueScene). The picture is whole: the export it came from was cut
       too tight and took the tops off the upper डम-डम's "!!" and the tails
       off the lower one's sound-waves, so on the page they stopped mid-stroke.
       Nothing had to be redrawn — the file already held a whole copy of each
       piece in the other of the two cries — see tools/uncut-dum-p2.ps1. The
       box is taller by exactly what was put back, and starts at the top of
       the page because that is as far up as the artwork ever reached.

       The cry itself now reads डम-डम! rather than डम-डम.!!, reset from the
       supplied artwork into the render's own arcs at the render's own glyph
       height, tilt and leading edge — see tools/reword-dum.ps1. The box is
       the one the design gives, to the pixel; only the lettering changed. */
    "Page 2":  [lay("dum-p2-cry.png", 1145, 0, 760, 497, { dum: true })],

    "Page 3":  [bub("bubble-p3.png",  763.02, 245, 394.83),
                say(["अरे! ये कैसी आवाज़ है?"], 973.5, 283, 339, 60)],

    /* flipped in Figma: reported at 562, actually at 840 */
    "Page 4":  [bub("bubble-p4.png",  835.96, 100, 526.10),
                say(["अरे! तुम्हें नहीं पता? आज मेला लगा है।"], 1135, 159, 390, 55)],

    /* Flipped too — and three separate text layers, not one wrapped block,
       which is what lets the question be asked a piece at a time.

       Tez asks three things here and the recording says them one after
       another, so they arrive one after another: each line comes, is said,
       and leaves before the next, the same shape the end of the book has.

       The bubble itself is not part of any moment and so never leaves. It is
       one speech bubble — one animal, drawing one breath, asking three things
       in four seconds — and popping it in and out three times in that space
       would read as a fault rather than as speech. What changes inside it is
       the words; the box that holds them stays.

       All three sit at 241, the design's own y for the middle of the three.
       Set at 55 on a 70 line, the block the designer drew runs 168 to 378 and
       is centred on 273 — which is where one line placed at 241 lands, so a
       single line falls exactly where the middle of the three used to be
       rather than high in an otherwise empty bubble. */
    "Page 5":  [bub("bubble-p5.png", 1336.98, 149, 498.20),
                ...moment(0, say(["मेला!"],                    1624, 241, 414, 55)),
                ...moment(1, say(["कहाँ?"],                    1624, 241, 414, 55)),
                ...moment(2, say(["और वहाँ पहुँचना कैसे है?"], 1624, 241, 414, 55))],

    "Page 6":  [bub("bubble-p6.png", 1286.99, 230, 458.70),
                say(["चलो मेरे साथ, रास्ता मैं बताती हूँ।"], 1537.5, 285, 357, 55)],

    /* the recital, which opens here: Page 8 is where the two of them set off
       and where the poem's first couplet is spoken. Page 9 sets its two lines
       as separate layers, the rest as one block of two, which is how the file
       has them.

       Page 8's painting is centred — a tree either side and the path up the
       middle — and the design centres the couplet on the frame with it, which
       is why its cx is 960 where every other page's is measured off to one
       side. Its box is the design's own 554 (the layer is 721 in the text
       export, which is drawn at 2500 across rather than 1920).

       Every y from Page 8 to Page 13 is the design's own plus VERSE_DROP:
       the recital sat too near the top edge of the picture, hardest on
       Page 11 where the design starts it 53 units down — under 5% of the
       frame — and it reads as though it is falling off. The drop is applied
       to all six as one number rather than page by page, because the poem
       is one recital and the six screens have to sit on the same line as
       each other; to move it again, move this and nothing else. Page 14 and
       Page 15 are left where the design puts them: they are the arrival at
       the fair, and their words are placed against that painting rather
       than against the run of the river.

       The design sets Page 8's couplet about a seventh larger than the rest
       of the recital's. It is set here at the recital's own size, because the
       poem reads as one voice and a line that changes size mid-poem reads as
       a different one. To follow the file instead, this is the page to give
       its own size and line-height to. */
    "Page 8":  [verse(["नूरी और तेज़ मेले को चले,", "गाते-गाते आगे बढ़े।"], 960, 70 + VERSE_DROP, 554)],

    "Page 9":  [verse(["चलते-चलते नदी नज़र आई,"], 1431,   88 + VERSE_DROP, 680),
                verse(["नीले पानी में लहरें छाईं।"], 1430.5, 212 + VERSE_DROP, 567)],
    "Page 10": [verse(["नदी किनारे भेड़िया सोया,", "उसे देखकर चैन खोया।"], 1568.5, 106 + VERSE_DROP, 565)],
    "Page 11": [verse(["दूर देखा, पुल था आगे,", "उस पर चढ़कर झटपट भागे।"], 907, 53 + VERSE_DROP, 866)],
    "Page 12": [verse(["छप-छप करती बत्तखें प्यारी,", "एक, दो और तीन हैं सारी।"], 465, 70 + VERSE_DROP, 866)],

    /* The drums come back, smaller and further off than on Page 2 — and
       `late`, because on this page they are not there when the reader
       arrives. The couplet promises them; the coda brings them. */
    "Page 13": [verse(["फूलों वाली राह अपनाई,", "डम-डम की आवाज़ फिर से आई।"], 467.5, 120 + VERSE_DROP, 873),
                lay("dum-p13-cry.png", 1340, 15, 580, 330, { dum: "late" })],

    /* the elephant is a 36-frame drumming loop; the design flips him to face
       Tez and Noori, and lays a soft ellipse under his feet */
    "Page 14": [verse(["खेल-खिलौनों का मेला आया,"], 1315.5, 85, 873),
                lay("elephant-shadow.svg", 1187, 713, 395, 165),
                lay("elephant.gif", 1177, 477, 395, 339, { flip: true })],

    "Page 15": [verse(["पर तेज़ को झूला ही भाया।"], 401.5, 195, 737, false)],

    /* The end of the book: one picture, and three things said on it in turn.

       It used to be three pages — Page 16, Page 17 and Page 18 — and the
       three paintings were the same painting; Page 16 and Page 17 export
       byte for byte identical. So the reader was being turned through two
       page turns that changed nothing but the words in the bubble, and the
       book counted a picture three times. It is one page now, and what were
       three turns are three moments of it: each line arrives, is said, and
       leaves before the next one comes, which is the shape the speech had
       anyway. The three recordings still play in the order they were made —
       see NARRATION, where Page 16 is now a run of three windows.

       आगे is held back until all three have been said. It is the way out of
       the book, and offering it while Noori is still speaking would invite
       the reader to leave in the middle of being spoken to.

       The badge's box is its whole canvas, and the badge carries transparent
       margin of its own — 1478x886 of oval inside 1536x1024 — so the numbers
       are worked back from where the oval has to land rather than read off
       the design. The blue badge is a rounder picture than the orange one it
       replaces, and this keeps the oval the same 256 across and on the same
       centre; only the box around it grew and rose to hold it. */
    "Page 16": [
      ...moment(0, bub("bubble-p16.png", 743.98, 304, 498.40),
                   say(["अरे! तुम कहाँ रह गए?"], 1015, 370, 322, 55)),
      ...moment(1, bub("bubble-p16.png", 737.98, 284, 498.40),
                   say(["हाँ-हाँ, तुम! अब तुम्हारी बारी है।"], 1012.5, 350, 414, 55)),
      ...moment(2, bub("bubble-p16.png", 733.98, 300, 498.40),
                   say(["चलो, अब तुम भी मेले तक आओ।"], 1008.5, 366, 414, 55)),
      lay("badge.png?v=2", 1473, 838, 266, 177.33,
          { lift: true, cta: true, hold: true, label: "आगे — खेल शुरू करो" })
    ]
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
     The book runs until आगे on Page 16 is pressed, and from that moment it is
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
     … Page 6, Page 8 … Page 16, with no Page 7 — so a positional key would
     be one out from Page 8 onward and every clip after it would land on the
     wrong picture. The frame name cannot drift. It also survives the section's
     last three frames becoming one page: Page 17.wav and Page 18.wav are
     still the recordings they always were, and they are still named, they
     simply play as the second and third windows of Page 16's run.

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

  /* The one recording that spans pages: 37.3 s of poem read straight through,
     for Page 9 to Page 15.

     The reader's own breathing says where the poem's joints are. Five pauses
     run 0.67 s to 0.89 s; every other gap is 0.31 s to 0.45 s. Those five cut
     the recital into six couplets, and a couplet is the unit a page gets —
     both its lines or neither, because half a couplet on a picture is half a
     thought on the wrong picture. The ducklings are the case in point: the
     0.45 s at 22.60 s is a line break inside the fourth couplet, not a joint,
     and cutting there sends `एक, दो और तीन हैं सारी` onto the flower path.

     Six couplets across seven pages means exactly one must be shared, and it
     is the last: Page 14 arrives at the mela and Page 15 rides the wheel, two
     halves of one arrival, so the closing couplet gives a line to each. That
     cut is at 34.26 s, the midpoint of its 0.40 s line break — the one
     boundary here that falls inside a couplet rather than between two.

     Every window is cut at the midpoint of its pause, so each page both
     begins and ends inside the reader's own breath, and turned at a child's
     pace the seven read as the unbroken recital they were recorded as. */
  const POEM = "Page 9 to Page 15 Poem.wav";

  const NARRATION = {
    "Page 1":  ["Page 1.mp3", 0.61,  2.17],
    "Page 3":  ["Page 3.wav",  0.09,  2.41],
    "Page 4":  ["Page 4.wav",  0.19,  5.32],
    /* Three windows into one recording, because Tez asks three things and
       the page now shows them one at a time — see SCENES.

       They are contiguous: each ends exactly where the next begins, and the
       outer edges are the 0.09 and 4.37 this frame has always had. So nothing
       is cut and nothing is skipped, and the needle never jumps — the seek at
       each boundary finds itself already there and does not move. The
       recording plays straight through exactly as it did when it was one
       window; the boundaries only say when the words in the bubble change.

       Each is cut just after its sentence ends rather than at the midpoint of
       the pause the way the poem's pages are. A page turn has 780 ms of its
       own to hide a boundary in; a line leaving a bubble and the next
       arriving has about 480 ms, and cutting early gives that the whole
       breath to happen in, so the words are on the page before they are
       spoken rather than arriving with them. */
    "Page 5":  [["Page 5.wav", 0.09, 1.01],     /* मेला!    — speech 0.153–0.885 */
                ["Page 5.wav", 1.01, 2.19],     /* कहाँ?    — speech 1.561–2.065 */
                ["Page 5.wav", 2.19, 4.37]],    /* और वहाँ… — speech 2.465–4.246 */
    "Page 6":  ["Page 6.wav",  0.32,  3.93],
    "Page 8":  ["Page 8.wav",  0.14,  4.90],
    "Page 9":  [POEM,  0.26,  7.15],
    "Page 10": [POEM,  7.15, 12.98],
    "Page 11": [POEM, 12.98, 19.14],
    "Page 12": [POEM, 19.14, 25.66],
    "Page 13": [POEM, 25.66, 31.51],
    "Page 14": [POEM, 31.51, 34.26],
    "Page 15": [POEM, 34.26, 37.04],
    /* The other frame with a run of windows, and the one that shows what the
       shape is for: three things said on one picture — see SCENES — so its
       three recordings play back to back, in the order they were made, and
       the page is not finished until the last of them is. Where Page 5 cuts
       one recording into three, this one has three recordings; the run does
       not care which, because a window names its own file. Each window
       opening is what brings the next bubble on, so the picture cannot get
       ahead of the voice or fall behind it: they are the same event. */
    "Page 16": [["Page 16.wav", 0.22, 2.98],
                ["Page 17.wav", 0.20, 4.24],
                ["Page 18.wav", 0.21, 2.75]]
  };

  /* Cover Page and Page 2 have no recording in the folder, so they get no
     entry and the book does not wait on one — their beat begins as soon as
     they are on screen.

     Page 1 used to be the one window here that was not the whole of its
     recording: `Page 1.wav` ran 10.4 s in two read sentences and the page was
     held to the first five of them, a deliberate cap rather than a
     measurement, and the second sentence was never heard anywhere. That
     recording has been replaced. `Page 1.mp3` is 2.66 s carrying a single
     sustained hum — 1.38 s of it, swelling and falling with no syllable in it
     at all, which is the हम्ममममम the page already draws over Tez rather
     than a narrator describing him. So the cap is gone with the file it was
     made for, and every window in the book is now measured: this one to the
     same −45 dB edges as the rest, 0.674 s and 2.050 s, pulled out by the
     usual 60 ms lead and 120 ms tail.

     It is much shorter than what it replaces, and the page is therefore held
     for much less time — about 1.6 s of sound where there were 5. */

  /* ── When each word is said ─────────────────────────────────────────────
     One [from, to] per word, in the file's own seconds — the same clock as
     NARRATION above, so nothing has to be rebased — and in reading order
     across the whole frame. The recital walks this against the needle and
     lights the word that is being said, and the line it is in.

     Measured the same way the windows were: `silencedetect` over the file,
     at −45 dB for the pauses between the sentences and −25 dB for the joins
     between words inside one breath, then read against a 20 ms RMS envelope
     so a fricative is not mistaken for a gap. That last part matters here —
     the /s/ of "कैसे" sits at −42 dB, quiet enough for the detector to call
     it silence and split one word into two.

     There is no text in this table, only times. The words themselves stay in
     SCENES where the design put them, and the two are matched by counting:
     if a frame's painted words and its measured times ever disagree in
     number, the recital leaves that page alone rather than lighting up
     everything after the mismatch on the wrong syllable.

     Page 5 is the only frame measured so far. Any other page joins by having
     its own row added here — nothing else has to change.
     -------------------------------------------------------------------- */
  const SAID = {
    /* "मेला! कहाँ? और वहाँ पहुँचना कैसे है?" — three sentences, seven words,
       across the 0.09–4.37 the frame runs to. The three are far apart: 0.68 s
       of held breath after "मेला!" and 0.45 s after "कहाँ?", which is the
       pause a child needs to take in one question before the next arrives —
       and which is also the room the page uses to change the words in the
       bubble, since those same two pauses are where its three windows are
       cut.

       These stay one unbroken list of seven in reading order even though the
       page is now shown in three parts, because they are times in the file
       and the file did not change. The recital counts the words painted on
       the page against them, and all seven are painted — only one line of
       them is on screen at a time. */
    "Page 5": [
      [0.14, 0.89],                                   /* मेला!    */
      [1.56, 2.01],                                   /* कहाँ?    */
      [2.46, 2.72],                                   /* और       */
      [2.86, 3.16],                                   /* वहाँ     */
      [3.30, 3.78],                                   /* पहुँचना   */
      [3.80, 4.10],                                   /* कैसे     */
      [4.10, 4.26]                                    /* है?      */
    ]
  };

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
    /* Page 2 has no entry here either: its DUM DUM is a coda on the page
       rather than an arrival effect, because that page is held for the
       length of it — see PAGES. Page 13 is the same, for the same reason. */
    "Page 4":     ["Noori sound.mp3",      0.30, 1.80, 0.70, 260],  /* Noori, first seen        */
    "Page 6":     ["Noori sound 2.mp3",    0.08, 1.09, 0.60, 200],  /* Noori speaks on the path */
    "Page 9":     ["Ducks swimming.mp3",   0.12, 22.0, 0.22, 220],  /* the river opens up       */
    "Page 11":    ["Ducks swimming 2.mp3", 0,    0.95, 0.55, 320],  /* water under the bridge   */
    "Page 12":    ["Ducks.mp3",            0,    5.04, 0.15, 260],  /* the three ducklings      */
    "Page 14":    ["DUM DUM sound 2.mp3",  0,    8.32, 0.40, 150],  /* the fair announces itself*/
    "Page 15":    ["Drum 2.mp3",           0.14, 1.28, 0.55, 200],  /* a beat off the big wheel */
    "Page 16":    ["Noori sound 2.mp3",    0.08, 1.09, 0.60, 220]   /* Noori has the last word  */
    /* One effect for the whole of the last page, on its arrival, and no bed
       under it at all (see HUSH_AT). Noori turns away from the fair there and
       speaks to the reader — "अब तुम्हारी बारी है", "चलो, अब तुम भी मेले तक
       आओ" — and the drums would only be talking over her. The book ends on
       her voice and nothing else. */
  };

  /* The bed. Music for the journey, and the fair's own drums once they get
     there — the ground changes under the story at Page 14, which is the whole
     point of arriving. Both loop, and both sit far enough down to be a floor
     rather than a thing you listen to. */
  const BEDS = {
    music: ["TCMM BGM 1.mp3",    0.29, 69.50, 0.192],   /* 0.16 + 20% */
    mela:  ["DUM DUM sound.mp3", 0,    53.00, 0.13]
  };
  const FAIR_AT = 13;      /* index of Page 14 — from here on, the mela bed  */
  /* index of Page 16, where the drums stop — and, since the section's last
     three frames are one page now, the last page of the book. Noori turns
     away from the fair there and speaks to the reader — "अरे! तुम कहाँ रह
     गए?" — and the page stands on nothing at all, so that nothing is playing
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
     which is what makes a run of fast page turns safe.

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
    const CUT = 2;

    let on    = localStorage.getItem(KEY)  !== "off";   /* narration on by default */
    let muted = localStorage.getItem(MUTE) === "off";

    let el = null;              /* the single audio element — never a second */
    let token = 0;              /* invalidates anything still in flight */
    let seq = 0;                /* which page in the flow is bound */
    let runs = null;            /* its windows, in order, or null */
    let leg = 0;                /* which of them is playing */
    let stopAt = 0, timer = 0, playing = false;
    const listeners = [];   /* told when sound starts and stops */
    const enders = [];      /* told when a clip is done for good */
    const steppers = [];    /* told which window of a run has begun */

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
      el.addEventListener("ended", close);
      /* the far edge of the window, for a clip that stalls or runs long */
      el.addEventListener("timeupdate", () => {
        if (stopAt && el.currentTime >= stopAt) close();
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

    /* One window has run out. A frame with another behind it carries straight
       on into it and is not finished yet — only the last window of a run ends
       the page, which is what keeps the turn gate honest about a frame that
       has three things to say rather than one. */
    function close() {
      if (!stopAt && !playing) return;      /* already done, or never started */
      if (runs && leg + 1 < runs.length) { open(leg + 1); return; }
      finish();
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

    /* Open one window of the bound frame. Called with 0 by start(), and with
       the next one by close() as each runs out — the token is deliberately
       not bumped in between, because moving from one window of a page to the
       next is the same reading carrying on, not a new one starting. */
    function open(n) {
      if (halted) return;            /* the book is over; the game has the screen */
      if (!runs || !runs[n]) { finish(); return; }

      leg = n;
      stopAt = 0;
      clearTimeout(timer); timer = 0;

      const [file, from, to] = runs[n];
      const mine = token;
      const a = element();
      a.muted = muted;
      /* Assigning src is enough to start the load; an explicit load() adds
         nothing and only risks aborting it. The poem stays loaded across all
         seven of its pages, because only currentTime changes between them. */
      const want = url(SOUND, file) + "?v=" + CUT;
      const swapped = a.getAttribute("src") !== want;
      if (swapped) a.src = want;
      document.documentElement.dataset.clip = file;
      steppers.forEach((fn) => fn(n, seq));

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
          timer = setTimeout(() => { if (mine === token) close(); },
                             Math.max(120, (to - a.currentTime) * 1000 + 90));
        };
        /* Sound already running and the same file underneath it: the needle
           has only moved, so the clock can start now. Anything else has a
           load in front of it and must wait to be told playback has really
           begun — armed on the request instead, a window that spent a moment
           buffering would be timed out before its last syllable. */
        if (playing && !swapped) arm();
        else a.addEventListener("playing", arm, { once: true });
      });
    }

    function start() {
      stop();                        /* always from silence */
      if (halted) return;            /* the book is over; the game has the screen */
      if (!runs) return;             /* a frame with no recording */
      open(0);                       /* and a run of windows starts at its first */
    }

    return {
      get on() { return on; },
      get muted() { return muted; },
      get playing() { return playing; },

      /* where the needle is, in the file's own seconds. The recital reads the
         words off this rather than off a clock of its own, so a clip that
         stalls or is seeked drags the highlight with it instead of walking
         on without the voice. */
      get at() { return el ? el.currentTime : 0; },

      /* whether the frame now bound has a recording at all. Cover Page and
         Page 2 do not, and that is the difference between a page the reader
         must wait out and one with nothing to wait for. */
      get hasClip() { return !!runs; },

      /* how many windows this frame has: one for almost every page, three for
         Page 16, and none for a page with no recording. What paces a page
         that has to run its own moments in silence reads this. */
      get legs() { return runs ? runs.length : 0; },

      /* the windows themselves, in ms, for the same reason */
      get spans() { return (runs || []).map(([, f, t]) => (t - f) * 1000); },

      /* called on every page change. The page object carries the frame name,
         which is the key into NARRATION; the sequence number comes along
         because onEnded has to be able to name the page it belongs to. */
      bind(page, n) {
        stop();
        seq = n || 0;
        leg = 0;
        const spec = (page && NARRATION[page.frame]) || null;
        /* A frame is written either as one window or as a run of them. The
           first element says which: a filename means the entry is the window
           itself, an array means it is a list of them. */
        runs = !spec ? null : (typeof spec[0] === "string" ? [spec] : spec);
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
      onEnded(fn) { enders.push(fn); },

      /* fn(n, seq) as each window of a run opens. This is what a page made of
         moments is paced by: the bubble and the voice are the same event, so
         a recording that takes a moment to load holds its picture back with
         it rather than being spoken over by the next one. */
      onStep(fn) { steppers.push(fn); }
    };
  })();

  /* ── Sfx ────────────────────────────────────────────────────────────────
     The scene effects, one at a time. A lane of its own rather than part of
     PageAudio, because an effect belongs to the picture and not to the
     narration: it still plays when पढ़कर सुनाओ is switched off, and it stops
     the moment its page is left, so a duck can never quack over the fair.
     -------------------------------------------------------------------- */
  const Sfx = (() => {
    let el = null, timer = 0, token = 0, fader = 0;
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
      clearInterval(fader); fader = 0;
      if (el) { try { el.pause(); } catch { /* not started */ } }
      delete document.documentElement.dataset.sfx;
    }

    /* Walk the effect's volume somewhere over `ms`, on the same 40 ms step
       the bed's crossfade runs on. `then` fires on arrival, which is where a
       one-shot's pause belongs: faded to nothing first, paused second. */
    function ramp(a, target, ms, then) {
      clearInterval(fader);
      const t0 = Date.now(), was = a.volume, mine = token;
      fader = setInterval(() => {
        if (mine !== token) { clearInterval(fader); fader = 0; return; }
        const k = Math.min(1, (Date.now() - t0) / ms);
        a.volume = clamp(was + (target - was) * k, 0, 1);
        if (k === 1) { clearInterval(fader); fader = 0; if (then) then(); }
      }, 40);
    }

    /* Fire one effect: [ file, from, to, gain, delay ms, loop, [in, out] ].
       Taken as a spec rather than a frame name, because not every effect
       belongs to the arrival of a page — Page 13's drums answer its own last
       line, long after the picture has landed.

       `[in, out]` is how many ms of the window's own head and tail are given
       over to a fade. It is left off wherever the recording already begins
       and ends in silence, which is most of them — the windows were measured
       to the speech and the quiet either side is the fade. It is needed where
       the recording has no quiet to end on: see Page 2. */
    function play(fx) {
        stop();
        if (halted) return;
        if (!fx || PageAudio.muted) return;
        const [file, from, to, gain, delay, loop, fade] = fx;
        const fadeIn  = (fade && fade[0]) || 0;
        const fadeOut = (fade && fade[1]) || 0;
        const mine = token;

        timer = setTimeout(() => {
          if (mine !== token) return;
          const a = element();
          a.muted = PageAudio.muted;
          a.volume = fadeIn ? 0 : gain;
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
            if (fadeIn) ramp(a, gain, fadeIn);
            /* a hit closes on its own at the far edge of its window, and a
               page turn closes it sooner. A background has no far edge:
               only leaving the page ends it.

               Where the recording is still sounding at that far edge, pausing
               on the spot is a click rather than an ending, so the last
               `fadeOut` ms of the window are spent falling to nothing and the
               pause lands on silence. The window itself does not move — the
               fade is taken out of the sound, not added to the page — so what
               the page is held for is exactly what it was. */
            if (!loop) {
              const span = Math.max(60, (to - from) * 1000);
              const out  = Math.min(fadeOut, span);
              timer = setTimeout(() => {
                if (mine !== token) return;
                const shut = () => { try { a.pause(); } catch { /* gone */ } };
                if (out) ramp(a, 0, out, shut); else shut();
              }, span - out);
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

     Not on a page turn: the book turns itself, and a pop over the page-turn
     sound would be one sound too many. Every control that does make a noise
     wakes the bed here as a side effect, which is the unlock the browser
     wants before any audio may begin.

     The file runs 1.97 s but the tap itself is the 126 ms at 0.147 s and the
     rest is silence, so it is played as a window like everything else. Two
     elements alternate: a second press arriving before the first has finished
     must sound, not cut its predecessor short.
     -------------------------------------------------------------------- */
  const Tap = (() => {
    const AT = 0.13, END = 0.34;
    let pool = null, turn = 0;

    /* Built ahead of the first press rather than inside it, in the same
       spirit as the game being armed before आगे is pressed: the cover's
       कहानी चलाओ is the first press of the whole session, and it should not
       be the one that has to wait for a file. */
    function arm() {
      if (pool) return pool;
      const src = url(FX, "Button Tap.mp3");
      pool = [new Audio(src), new Audio(src)];
      pool.forEach((a) => { a.preload = "auto"; a.volume = 0.85; a.load(); });
      return pool;
    }

    return {
      arm,
      play() {
        if (halted) return;
        Bed.wake();                       /* a press is the gesture audio waits for */
        if (PageAudio.muted) return;
        const a = arm()[turn = 1 - turn];

        /* play() first and seek second, both inside the press. The other way
           round, an element with no metadata yet has to wait for
           loadedmetadata and call play() from that event — a media callback,
           outside the gesture, which is exactly where a browser refuses it,
           and iOS refuses it for good by never counting the element as
           unlocked. On the cover that is the first press of the session and
           the one press that went silent every time.

           Nothing is lost by starting at the top: the file opens with 0.13 s
           of silence, so the handful of frames that run before the seek lands
           cannot be heard. The window is timed from the seek rather than from
           the press, so a slow load still gets the whole 210 ms of pop
           instead of a stub. */
        const p = a.play();
        if (p && p.catch) p.catch(() => { /* not yet allowed: stay silent */ });
        seek(a, AT, () => {
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
      /* a frame whose narration has been measured word by word gets its words
         split into spans for the recital to light; every other frame keeps
         the plain text node it has always had */
      const timed = !!SAID[page.frame];
      for (const l of page.layersFx || []) {
        const el = buildLayer(l, timed);
        /* which moment of the page this belongs to, and whether it is held
           back until the page has finished speaking — the two things the
           sequence reads off the painting rather than being told twice */
        if (l.step !== undefined) el.dataset.step = l.step;
        if (l.hold) el.classList.add("is-held");
        fx.append(el);
      }
      Sequence.bind(fx);

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

    /* One <span> per word, so the recital has something to light, with the
       spacing between them kept exactly as it was — the split captures its
       separators and puts them back, so the line the browser lays out is
       character for character the line it laid out before. */
    function wordSpans(line) {
      const f = document.createDocumentFragment();
      for (const bit of line.split(/(\s+)/)) {
        if (!bit) continue;
        if (/^\s+$/.test(bit)) { f.append(bit); continue; }
        const s = document.createElement("span");
        s.className = "fx__word";
        s.textContent = bit;
        f.append(s);
      }
      return f;
    }

    /* One layer of the overlay, placed in the picture's own proportions so
       it holds at every size. Figma's pixels went in; percentages come out. */
    function buildLayer(l, timed) {
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
        p.append(timed ? wordSpans(line) : line);
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
       case for Cover Page and Page 2 here.
       Whichever it is, it arrives here once per visit, and the gate that
       turns the page upstream is the only thing that listens.
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
      if (page !== index + 1) return;
      Sequence.done();          /* every window of it has now been said */
      if (!runCoda()) announceReady();
    });

    /* The page that answers itself, or waits to be answered. Page 13 reads
       "डम-डम की आवाज़ फिर से आई" and then the fair actually answers, so its
       voice ending is not the end of the page; Page 2 has no voice at all
       and is simply held for the drums it hears coming. Either way the page
       is not finished until the window is, and only then does the next one
       become reachable. Answers whether it took the page over, so its two
       callers know not to announce for themselves.

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
      /* onEnded announces, and onStep walks a page made of moments */
      if (PageAudio.on && PageAudio.hasClip) return;
      /* No voice, so a page made of moments has to walk itself — and the page
         is not finished until it has. This is the only place that knows there
         will not be a voice. The page it started on is remembered for the
         same reason a coda's is: leaving mid-sequence must not mark whatever
         is on screen when it ends as read. */
      const mine = index;
      if (Sequence.run(() => { if (mine === index) announceReady(); })) return;
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

  /* ── Sequence ───────────────────────────────────────────────────────────
     A page that is said in more than one breath, and shows one of them at a
     time. Two pages have moments: Page 5, where Tez asks three things in one
     bubble, and Page 16, three things Noori says to the reader that used to
     be three pages of the same painting.

     What belongs to a moment is tagged and what does not is left alone, so a
     page can keep something on screen throughout — Page 5's bubble stays put
     while only the words inside it change.

     The voice paces it. Each window of the run opening is what brings the
     next line on, so the picture and the recording are the same event and
     cannot drift apart — a recording that takes a moment to load holds its
     bubble back with it rather than being spoken over. With the narration
     switched off there is no voice to follow, so it walks itself instead, on
     the lengths those same windows would have taken: the same three moments,
     the same shape, in silence.

     The last moment stays. It is the line the book ends on and आगे appears
     beside it, which is the picture the design draws — everything before it
     leaves to make room for what comes next, but nothing follows the last.
     -------------------------------------------------------------------- */
  const Sequence = (() => {
    /* the breath between one moment and the next when nothing is speaking.
       With a voice the gap is the CSS one below and the load in front of the
       next recording; this is what stands in for that. */
    const GAP = 420;

    let moments = [];    /* the layers of each moment, in order */
    let cta = null;      /* the way out, held back until the last is said */
    let at = -1, timer = 0;

    function clear() { clearTimeout(timer); timer = 0; }

    /* Bound as each page is painted, whether it has moments or not — a page
       without them still has to put the last page's down. The layers are left
       as the CSS draws them, out of sight: nothing is shown until there is a
       reason to show it, so all three arrive the same way rather than the
       first one being already there when the page lands. */
    function bind(fx) {
      clear();
      moments = []; cta = null; at = -1;
      if (!fx) return;
      for (const el of fx.children) {
        if (el.classList.contains("fx__cta")) { cta = el; continue; }
        const n = el.dataset.step;
        if (n === undefined) continue;
        (moments[n] = moments[n] || []).push(el);
      }
    }

    /* one moment, and only it. आगे goes back into hiding whenever the page is
       speaking again, which is what makes tapping the words replay the whole
       sequence rather than leaving the way out standing over the first line */
    function show(n) {
      if (n === at) return;
      at = n;
      moments.forEach((group, i) => {
        for (const el of group) el.classList.toggle("is-here", i === n);
      });
      if (cta) cta.classList.add("is-held");
    }

    function done() {
      clear();
      if (!moments.length) return;
      show(moments.length - 1);
      if (cta) cta.classList.remove("is-held");
    }

    PageAudio.onStep((n) => { if (moments.length) show(n); });

    return {
      bind, done,

      /* No voice to follow. The moments take the lengths their recordings
         would have taken, so a reader with the narration off is shown the
         same things for the same time rather than all of them at once —
         these lines sit on top of one another and could not be.

         Answers whether it has taken the page over, the way a coda does, and
         says when it is done. A page that has not shown all its moments has
         not finished presenting itself: without this the turn would be armed
         the instant the page landed and Page 5 would be turned away from
         after a second and a half, having asked only the first of its three
         questions. Page 16 never noticed, being the page nothing follows. */
      run(then) {
        clear();
        if (!moments.length) return false;
        const spans = PageAudio.spans;
        let i = 0;
        const next = () => {
          show(i);
          const held = (spans[i] || 2600) + GAP;
          i += 1;
          timer = setTimeout(
            i < moments.length ? next : () => { done(); if (then) then(); },
            held);
        };
        next();
        return true;
      }
    };
  })();

  /* ── Recital ────────────────────────────────────────────────────────────
     Which word is being said, marked on the word itself as the narrator goes:
     is-saying on the one in hand, is-said behind the reader, is-waiting on a
     line not yet reached, is-live on the sentence in hand.

     Nothing draws any of it. Both treatments that have been tried — holding
     the words yet to come at half opacity, and colouring the word in hand —
     were taken off again, and the speech now reads exactly as the design drew
     it whether or not anyone is reading it aloud. See "the recital,
     deliberately undrawn" in style.css, which is where a treatment would go.

     This is kept rather than deleted because it is measured, correct and
     costs nothing to be right: the classes land on the right words at the
     right moment, and the table behind them is real measurement that would
     have to be done again. What the highlight was for is done elsewhere now
     — Page 5 says its three questions one at a time, so the thing being said
     is the thing on the screen.

     It reads the needle, never a clock of its own. A timer started when the
     voice started would be right for exactly as long as nothing went wrong;
     PageAudio.at is where the sound actually is, so a clip that stalls, is
     paused by a hidden tab, or is replayed from the top drags the light with
     it rather than running on without the voice.

     It draws only while there is a voice to follow — bound when the narration
     starts, taken down when it stops — so a page nobody is reading aloud
     looks exactly as it always has, and a page with no measured words is
     never touched at all.
     -------------------------------------------------------------------- */
  const Recital = (() => {
    let marks = [];     /* [from, to] per word, in the file's own seconds */
    let words = [];     /* the spans they belong to, in the same order     */
    let lines = [];     /* { el, first, last } — one per painted line      */
    let raf = 0, atWord = -2, atDone = -2;

    /* everything back to the page as it is drawn when no one is reading */
    function clear() {
      for (const w of words) w.classList.remove("is-saying", "is-said");
      for (const l of lines) l.el.classList.remove("is-live", "is-waiting");
      atWord = atDone = -2;
    }

    /* The words on the page that is actually on screen. Bound when the voice
       starts rather than when the page lands: settle() takes is-active off
       the leaving slot before it starts the clip, so by the time there is
       anything to follow there is exactly one page to follow it on. */
    function bind() {
      clear();
      marks = []; words = []; lines = [];

      const page = PAGES[Book.index];
      const fx = document.querySelector(".slot.is-active .fx");
      if (!page || !fx) return;

      const m = SAID[page.frame];
      if (!m) return;

      const all = [...fx.querySelectorAll(".fx__word")];
      /* The table and the painting have to agree exactly. One word out and
         every word after it lights on the wrong syllable, which is worse for
         a child following along than no light at all — so a frame that does
         not tally is simply left alone. */
      if (all.length !== m.length) return;

      marks = m;
      words = all;
      let n = 0;
      for (const p of fx.querySelectorAll(".fx__say")) {
        const own = p.querySelectorAll(".fx__word").length;
        if (!own) continue;
        lines.push({ el: p, first: n, last: n + own - 1 });
        n += own;
      }
    }

    function draw() {
      const t = PageAudio.at;

      /* the word being said now, or none at all — the gaps between the three
         questions on Page 5 run over half a second, and holding the last word
         lit across one of those would say the reader is still on it */
      let saying = -1;
      for (let i = 0; i < marks.length; i++) {
        if (t >= marks[i][0] && t < marks[i][1]) { saying = i; break; }
      }
      /* and how many are behind us, which is what makes a word stay read */
      let done = 0;
      while (done < marks.length && t >= marks[done][1]) done++;

      if (saying === atWord && done === atDone) return;
      atWord = saying; atDone = done;

      words.forEach((w, i) => {
        w.classList.toggle("is-saying", i === saying);
        w.classList.toggle("is-said", i < done);
      });
      for (const l of lines) {
        const live = saying >= l.first && saying <= l.last;
        l.el.classList.toggle("is-live", live);
        /* a line not yet reached sits back; one already read stays where it
           is, because it has been said and still counts */
        l.el.classList.toggle("is-waiting", !live && done <= l.first);
      }
    }

    function run() {
      raf = requestAnimationFrame(run);
      draw();
    }

    PageAudio.onState((speaking) => {
      cancelAnimationFrame(raf); raf = 0;
      if (!speaking) { clear(); return; }
      bind();
      if (marks.length) { draw(); run(); }
    });

    return { clear };
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

    /* the exit button rests when the reader is still */
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
         but a mouse click shouldn't leave a focus ring on a control */
      const el = document.activeElement;
      const byKeyboard = !!(el && el.matches && el.matches(":focus-visible"));

      flip(() => root.classList.add("is-play"));
      bar.inert = true;                      /* keep hidden controls off the tab order */
      listen(true);
      stir();
      if (byKeyboard) $("#exitBtn").focus({ preventScroll: true });
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
      mute: "आवाज़ बंद करें", unmute: "आवाज़ चालू करें",
      read: "पढ़कर सुनाओ", reading: "पढ़ना रोको",
      play: "चलाओ", playHint: "कहानी बड़ी करके देखो",
      start: "कहानी चलाओ", exit: "बाहर आओ"
    };

    /* ── the gate ─────────────────────────────────────────────────────────
       A page is not finished when it arrives, it is finished when it has
       said its piece: the narration has run out, or the cover entrance has
       played, or there was never anything to wait for. Nothing may move the
       book on before then.

       It is a set of pages rather than a single flag because a page already
       heard is still heard when you come back to it later, which is what
       makes going back safe: returning to page four cannot take away the
       fact that page four has been read.
       ------------------------------------------------------------------- */
    const heard = new Set();       /* pages that have finished presenting */

    const canForward = () =>
      Book.index < Book.total - 1 && heard.has(Book.index);

    /* every forward move in the book goes through here — the timer, the
       keyboard and a swipe alike, so the rule cannot be sidestepped by
       reaching for a different input */
    const forward = () => { if (canForward()) Book.next(); };

    /* ── the book turning itself ──────────────────────────────────────────
       There is no forward arrow. A page that has said its piece waits a beat
       and then turns, so a child with their hands in their lap hears the
       whole book without being asked to do anything.

       The beat is short but not nothing: a page that flipped on the last
       syllable would read as an interruption, and the painting is worth a
       moment of its own once the words have stopped.

       Page 16 is the one exception, and not because of its length: what
       follows it is not a page but the game, and going there is the child's
       decision to make rather than a timer's. canForward() already stops at
       the last page, so nothing here has to say so twice.
       ------------------------------------------------------------------- */
    const AutoTurn = (() => {
      const WAIT = 1500;
      let timer = 0;

      function cancel() { clearTimeout(timer); timer = 0; }

      /* Armed for a named page, and checked again when it fires. A turn that
         happened in between — a swipe, a key — leaves the old timer harmless
         rather than racing it onto a page it was never meant for.

         `after` is the extra a page owes beyond its voice: Page 13 answers
         itself with the drums, and the beat belongs after the answer. */
      function arm(i, after) {
        cancel();
        if (halted || i !== Book.index || !canForward()) return;
        timer = setTimeout(() => {
          timer = 0;
          if (i === Book.index) forward();
        }, WAIT + (after || 0));
      }

      return {
        cancel, arm,

        /* Coming back to a tab that was left. A page that finished while we
           were away is simply given its beat again; one that was cut off
           mid-sentence is read from the top, because with no arrow to press
           a page that never finished would otherwise be the end of the book. */
        resume() {
          if (halted) return;
          const i = Book.index;
          if (heard.has(i)) arm(i);
          else if (PlayMode.on || i > 0) Book.present();
        }
      };
    })();

    /* what a page still owes after its voice: the coda window, in ms */
    const codaMs = (i) => {
      const coda = PAGES[i] && PAGES[i].coda;
      if (!coda) return 0;
      const [, from, to, , delay] = coda.fx;
      return (delay || 0) + (to - from) * 1000;
    };

    /* Tapping the words reads the page again, and the turn waits for that
       reading rather than landing in the middle of it — the clip's own
       ending arms it afresh. A page with no recording has nothing to wait
       for, so its beat is left running. */
    const replay = () => {
      if (PageAudio.hasClip) AutoTurn.cancel();
      Book.replay();
    };

    function sync(i) {
      /* whatever was armed was armed for the page we have just left */
      AutoTurn.cancel();
      /* the big Play invitation belongs to the title page only */
      document.documentElement.classList.toggle("at-cover", i === 0);
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
      /* keyboard --------------------------------------------------------
         The book turns itself; the keys only let a reader run ahead of the
         beat, or go back for another look at a page. */
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

      /* swipe — the same two moves under a finger ------------------------ */
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
         counts as unheard again from this moment, so the beat that turns it
         cannot land until the page has played itself out. */
      const play = () => {
        heard.delete(Book.index);
        sync(Book.index);
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
         it, and re-added after a reflow so the restart actually takes.

         One press, one pop, no matter how it was made. The finger sounds it
         on pointerdown and the click that closes the same press must not
         sound it again; a click with no press behind it — Enter, Space, a
         screen reader's activation — has not sounded yet and takes its pop
         here. This used to read e.detail to tell those apart, which is a
         guess about how a browser numbers a click rather than a record of
         what actually happened, and a touch browser that raises its click
         with detail 0 would pop twice. */
      let sounded = false;
      startBtn.addEventListener("pointerdown", () => {
        sounded = true;
        Tap.play();
      }, { passive: true });
      /* a press the browser takes away for a scroll never becomes a click,
         and would otherwise leave the latch set over the next press */
      startBtn.addEventListener("pointercancel", () => { sounded = false; });
      startBtn.addEventListener("click", () => {
        if (!sounded) Tap.play();
        sounded = false;
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

      /* read aloud, with word-by-word highlighting. Switching the narration
         off mid-page leaves that page waiting on a voice that is no longer
         coming, and with no arrow to press that would be the end of the
         book — so the page counts as said and takes its beat now. */
      readBtn.addEventListener("click", () => {
        Tap.play();
        PageAudio.toggle();
        syncReadLabel();
        if (!PageAudio.on && !heard.has(Book.index)) {
          heard.add(Book.index);
          AutoTurn.arm(Book.index);
        }
      });

      PageAudio.onState((speaking) =>
        readBtn.classList.toggle("is-speaking", speaking));

      /* आगे answers the touch before it acts on it, the same way the cover's
         play button does — and for a stronger reason. Pressing आगे pulls the
         book down around it: the story stops, the bed and the narration go,
         fullscreen is asked for and the game's frame takes the screen, all in
         the same tick as the press. Sounding on pointerdown puts the pop
         under way before any of that begins, rather than on the click that
         arrives a moment later on a touch screen.

         One press, one pop, the same latch as the cover: the click that
         closes the press stays quiet, and a click with no press behind it —
         Enter, Space, a screen reader's activation — takes its pop there. */
      let ctaSounded = false;
      frame.addEventListener("pointerdown", (e) => {
        const el = e.target instanceof Element ? e.target : null;
        if (!el || !el.closest(".fx__cta")) return;
        ctaSounded = true;
        Tap.play();
      }, { passive: true });
      /* a press the browser takes away for a scroll never becomes a click,
         and would otherwise leave the latch set over the next press */
      frame.addEventListener("pointercancel", () => { ctaSounded = false; });

      /* what a tap on the picture itself means: आगे leads out of the book,
         and the words read their page again */
      frame.addEventListener("click", (e) => {
        const el = e.target instanceof Element ? e.target : null;
        if (!el) return;
        if (el.closest(".fx__cta")) {
          if (!ctaSounded) Tap.play();
          ctaSounded = false;
          Handoff.go();
          return;
        }
        if (el.closest(".fx__say")) replay();
      });
      $(".caption").addEventListener("click", () => replay());

      /* stop the world when the tab is hidden --------------------------- */
      document.addEventListener("visibilitychange", () => {
        const hidden = document.hidden;
        document.documentElement.classList.toggle("is-hidden", hidden);
        /* nothing plays into a hidden tab. The narration and the effect are
           abandoned; the bed is only held, and fades back in on return. */
        if (hidden) { PageAudio.stop(); Sfx.stop(); AutoTurn.cancel(); }
        else AutoTurn.resume();
        Bed.hold(hidden);
      });

      /* rebuild the scene if the visitor flips reduced-motion on/off ---- */
      calmMedia.addEventListener("change", () => Ambience.build(PAGES[Book.index]));
    }

    return {
      start() {
        bind();
        Book.onChange(sync);

        /* the only thing that opens the way forward, and so the only thing
           that starts the beat before the page turns */
        Book.onReady((i) => {
          heard.add(i);
          if (i !== Book.index) return;
          AutoTurn.arm(i);   /* a coda page has already had its drums by now */
        });

        /* A page read a second time earns its beat again when that second
           reading ends. onReady fires once per visit and has already gone by
           here, so the re-arm has to come off the clip itself. */
        PageAudio.onEnded((n) => {
          const i = n - 1;
          if (i === Book.index && heard.has(i)) AutoTurn.arm(i, codaMs(i));
        });

        sync(Book.index);
        syncSoundLabel();
        syncReadLabel();
        syncPlayLabels();
      },

      /* the book's controls, put down for good */
      halt() {
        AutoTurn.cancel();
        [soundBtn, readBtn, playBtn, startBtn, exitBtn]
          .forEach((b) => { if (b) b.disabled = true; });
      }
    };
  })();

  /* ── Handoff ────────────────────────────────────────────────────────────
     आगे, on Page 16, and what is on the other side of it.

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

  /* Fetch the button tap now, while the title page is being looked at, so the
     cover's कहानी चलाओ has nothing left to load when it is pressed. */
  Tap.arm();

  /* Load the game as the book comes within sight of its last page, so आगे has
     nothing left to load when it is pressed. */
  Book.onChange((i, total) => { if (i >= total - 2) Handoff.arm(); });
})();
