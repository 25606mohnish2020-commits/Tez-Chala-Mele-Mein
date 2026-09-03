/* =========================================================================
   Outbound analytics — the seven verbs of XAPI_EVENTS.md, for this game.

   Two halves:

   GameBus   the game's own internal bus (window.GameBus). game.js says what
             is happening in its own words — GameBus.emit('question:answered',
             {...}) — and knows nothing about statements, hosts or verbs.

   the map   below: listens to the bus and turns what it hears into exactly the
             seven statements every SwiftPAL game emits, identically shaped,
             then hands each to the platform bridge (SwiftPAL.sendEvent). If
             the bridge is missing — the file not loaded, standalone dev — the
             statement still leaves the page as
             postMessage({ type:"swiftpal:xapi", statement }).

   Per-template variety lives in context.template, never in a new verb.

   The raw bus is a firehose and is dev-only: with ?dev=1 every internal signal
   is also posted as { type:"swiftpal:signal", name, detail }. Production hosts
   receive the seven verbs and nothing else.
   ========================================================================= */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------- identity */
  /* The book's stable content id. It never changes per journey — the journey
     binding is the host's, on the URL — so reusing the book elsewhere cannot
     conflict. Set once here for this book. */
  const SKILL_CODE = 'TCMM_TEZ_CHALA_MELE_MEIN_GAME';
  const LO_CODE    = 'TCMM_TEZ_CHALA_MELE_MEIN';
  const PHASE      = 'practice';

  /* what the host launched us with: ?context_id=…&journey_id=…[&medium=][&dev=1] */
  const params     = new URLSearchParams(global.location ? global.location.search : '');
  const DEV        = params.get('dev') === '1';
  const MEDIUM     = params.get('medium') || 'hi';
  const CONTEXT_ID = params.get('context_id') || null;
  const JOURNEY_ID = params.get('journey_id') || null;

  /* ------------------------------------------------------------- GameBus */
  function hostWindow(){
    try { if (global.parent && global.parent !== global) return global.parent; } catch (e) { /* still postable */ }
    return global;
  }

  const handlers = new Map();
  const GameBus = {
    on(name, fn){
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name).add(fn);
      return () => GameBus.off(name, fn);
    },
    off(name, fn){
      const set = handlers.get(name);
      if (set) set.delete(fn);
    },
    emit(name, detail){
      const d = detail || {};
      const set = handlers.get(name);
      if (set) for (const fn of Array.from(set)) {
        try { fn(d, name); } catch (err) { if (DEV) console.warn('[GameBus] handler failed for ' + name, err); }
      }
      if (DEV) {
        try { hostWindow().postMessage({ type: 'swiftpal:signal', name, detail: d }, '*'); } catch (e) { /* nothing listening */ }
      }
    }
  };
  global.GameBus = GameBus;

  /* --------------------------------------------------------------- state */
  const sessionStart = Date.now();          // session_ms counts from here
  let launchedAt = 0;                       // duration_ms counts from the launch

  /* the screen the child is on — its id, where it sits in the flow, and what
     kind of screen it is; every statement carries this in its context */
  const screen = { id: null, index: -1, template: null, format: null };

  /* the score book: per question, how many taps so far and whether the first
     of them was right. score = first-try accuracy across answered questions. */
  const attempts = new Map();               // question id → taps on it
  const firstTry = new Map();               // question id → first tap correct?

  function setScreen(id, index, template, format){
    screen.id = id == null ? screen.id : id;
    screen.index = (typeof index === 'number') ? index : screen.index;
    screen.template = template || null;
    screen.format = format || null;
  }

  function context(){
    return {
      skill_code: SKILL_CODE,
      lo_code: LO_CODE,
      medium: MEDIUM,
      session_ms: Date.now() - sessionStart,
      question_id: screen.id,
      question_index: screen.index,
      template: screen.template,
      question_format: screen.format,
      phase: PHASE,
      context_id: CONTEXT_ID,
      journey_id: JOURNEY_ID
    };
  }

  /* --------------------------------------------------------------- send */
  function send(verb, object, result){
    const statement = { verb, object, context: context() };
    if (result) statement.result = result;
    const bridge = global.SwiftPAL;
    if (bridge && typeof bridge.sendEvent === 'function') {
      bridge.sendEvent(statement);
    } else {
      try { hostWindow().postMessage({ type: 'swiftpal:xapi', statement }, '*'); } catch (e) { /* nothing listening */ }
      if (DEV) console.info('[xapi] (no bridge)', statement);
    }
    return statement;
  }

  /* the two older host messages that still fire beside activity_completed */
  function post(type, payload){
    const bridge = global.SwiftPAL;
    if (bridge && typeof bridge.post === 'function') { bridge.post(type, payload); return; }
    try { hostWindow().postMessage(Object.assign({ type }, payload || {}), '*'); } catch (e) { /* nothing listening */ }
  }

  function round2(x){ return Math.round(x * 100) / 100; }

  function score(){
    let answered = 0, right = 0;
    for (const ok of firstTry.values()) { answered++; if (ok) right++; }
    return answered ? round2(right / answered) : 0;
  }

  /* ----------------------------------------------------------- the map */

  /* शुरू करें on the start screen — or, embedded in the book, the आगे tap that
     stands in for it */
  GameBus.on('activity:launched', () => {
    launchedAt = Date.now();
    attempts.clear();
    firstTry.clear();
    send('activity_launched', { type: 'activity', id: SKILL_CODE });
  });

  /* a passive screen mounts: the map between questions, a celebration */
  GameBus.on('screen:viewed', d => {
    setScreen(d.id, d.index, d.template, null);
    send('screen_viewed', { type: 'screen', id: d.id });
  });

  /* an answerable screen mounts */
  GameBus.on('question:started', d => {
    setScreen(d.id, d.index, d.template, d.format || 'mcq');
    attempts.set(d.id, 0);
    send('question_started', { type: 'question', id: d.id });
  });

  /* every answer tap, right or wrong */
  GameBus.on('question:answered', d => {
    const n = (attempts.get(d.id) || 0) + 1;
    attempts.set(d.id, n);
    if (n === 1) firstTry.set(d.id, !!d.correct);
    const o = d.option || {};
    send('question_answered',
      {
        type: o.type || 'image',
        id: o.id,
        text: o.text == null ? null : String(o.text),
        mediaUrl: o.mediaUrl || null,
        ui_index: d.ui_index,
        original_index: d.original_index
      },
      {
        score: (n === 1 && d.correct) ? 1 : 0,
        attempt: n,
        is_correct: !!d.correct
      });
  });

  /* the hint bulb. This game has no bulb on its screens, so nothing here
     emits it — the mapping is kept so the shape is the same the day one is
     drawn. */
  GameBus.on('hint:used', () => {
    send('hint_used', { type: 'hint', id: 'bulb' });
  });

  /* any replay of a recording the child asked for */
  GameBus.on('audio:replayed', d => {
    send('audio_replayed', { type: 'audio', id: d.id || 'question_voice' });
  });

  /* ONLY the child's tap on आगे बढ़ें at the end. There is no partial variant:
     completed is always true and progress always 100, and the celebration is
     always seen first because the event does not exist until the tap. */
  GameBus.on('activity:completed', () => {
    const result = {
      completed: true,
      progress: 100,
      score: score(),
      duration_ms: launchedAt ? Date.now() - launchedAt : Date.now() - sessionStart
    };
    send('activity_completed', { type: 'activity', id: SKILL_CODE }, result);
    /* the validator report and the next-module message, both moved to this
       same tap for backward compatibility */
    post('swiftpal:lesson_complete', {
      report: { skill_code: SKILL_CODE, lo_code: LO_CODE, medium: MEDIUM,
                context_id: CONTEXT_ID, journey_id: JOURNEY_ID, result }
    });
    post('swiftpal:proceed', { skill_code: SKILL_CODE, context_id: CONTEXT_ID, journey_id: JOURNEY_ID });
  });

  /* read-only view, handy from the console with ?dev=1 */
  global.GameAnalytics = Object.freeze({
    get context(){ return context(); },
    get score(){ return score(); }
  });
})(window);
