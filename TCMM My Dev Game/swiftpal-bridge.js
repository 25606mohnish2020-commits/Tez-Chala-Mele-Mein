/* =========================================================================
   SwiftPAL platform bridge — shipped in every game.

   One call, every platform:

       SwiftPAL.sendEvent(statement)

   `statement` is one xAPI-style object { verb, object, result, context } (see
   XAPI_EVENTS.md). The bridge works out where it is running and delivers the
   statement as a JSON string to the host:

     Android   window.SwiftPALAndroid.sendEvent(json)          (JavascriptInterface)
     iOS       window.webkit.messageHandlers.SwiftPAL.postMessage(json)
     Electron  window.SwiftPALElectron.sendEvent(json)         (preload contextBridge)
     Web       parent.postMessage({ source:"swiftpal", fn:"sendEvent", args:[json] }, "*")

   The web route is the one that is always there: a game inside an iframe posts
   to its parent, a game opened on its own posts to its own window, so a host
   page — or the DevTools console — can listen either way. The native names
   above are the contract with the app shells; a shell that exposes a different
   object only needs its name added to the matching probe below.

   `?dev=1` on the URL echoes every statement to the console as well.

   The game's own internal bus is `GameBus` (xapi.js), never this name: the
   global `SwiftPAL` belongs to the bridge so a host can replace this file with
   its own build without the game noticing.
   ========================================================================= */
(function (global) {
  'use strict';

  if (global.SwiftPAL && global.SwiftPAL.__bridge) return;   // already shipped by the host

  const DEV = /[?&]dev=1(?:&|$)/.test(global.location ? global.location.search : '');

  const json = s => (typeof s === 'string' ? s : JSON.stringify(s));

  /* the window a web host is listening on: the parent when framed, else us */
  function hostWindow(){
    try { if (global.parent && global.parent !== global) return global.parent; } catch (e) { /* cross-origin parent: still postable */ }
    return global;
  }

  /* Each probe answers with a sender, or null when that shell is not present.
     Checked in order on every send rather than once at load, because a native
     shell can inject its object a moment after the page starts. */
  const probes = [
    ['android', () => {
      const a = global.SwiftPALAndroid;
      return (a && typeof a.sendEvent === 'function') ? s => a.sendEvent(json(s)) : null;
    }],
    ['ios', () => {
      const w = global.webkit;
      const h = w && w.messageHandlers && (w.messageHandlers.SwiftPAL || w.messageHandlers.swiftpal);
      return (h && typeof h.postMessage === 'function') ? s => h.postMessage(json(s)) : null;
    }],
    ['electron', () => {
      const e = global.SwiftPALElectron;
      return (e && typeof e.sendEvent === 'function') ? s => e.sendEvent(json(s)) : null;
    }],
    ['web', () => s => hostWindow().postMessage({ source: 'swiftpal', fn: 'sendEvent', args: [json(s)] }, '*')]
  ];

  function route(){
    for (const [platform, probe] of probes) {
      const send = probe();
      if (send) return { platform, send };
    }
    return { platform: 'none', send(){ /* nowhere to go */ } };
  }

  const SwiftPAL = {
    __bridge: true,
    get dev(){ return DEV; },
    get platform(){ return route().platform; },

    /* the one entry point. Answers with the platform it went to. */
    sendEvent(statement){
      const r = route();
      try { r.send(statement); }
      catch (err) { if (DEV) console.warn('[swiftpal] sendEvent failed on', r.platform, err); }
      if (DEV) console.info('[swiftpal] ' + r.platform, statement);
      return r.platform;
    },

    /* the older host messages that still travel beside the statements —
       swiftpal:proceed, swiftpal:lesson_complete — go to the web host as-is */
    post(type, payload){
      const msg = Object.assign({ type }, payload || {});
      try { hostWindow().postMessage(msg, '*'); } catch (e) { /* nothing listening */ }
      if (DEV) console.info('[swiftpal] ' + type, msg);
    }
  };

  global.SwiftPAL = SwiftPAL;
})(window);
