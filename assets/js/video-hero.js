/* ============================================================
   video-hero.js — the intro plays once, the loop plays forever.

   The two clips are authored as a matched pair: the intro's final
   frame hands over to the loop's first frame. So the handover is a
   straight layer change — no seek, no replay, no restart of the
   intro when the loop comes round again.

   Sources are assigned here rather than in the markup so a phone
   never downloads the landscape cut, and a desktop never downloads
   the portrait one. CSS already sizes the stage to whichever aspect
   ratio is in play, so the clip fills the box exactly — neither cut
   is cropped or stretched.

   There is no player here: no controls, no progress, no spinner.

   Recovery matters. A muted, video-only clip may be paused by the
   browser itself — a backgrounded tab, or power saving — which
   surfaces as an AbortError rather than a real failure. Treating
   that as fatal would leave the hero frozen on a poster for the
   rest of the visit, so every interruption is retried, and the
   listeners stay armed after the burst so any later interaction
   or a return to the tab brings the hero back to life.
   ============================================================ */
(function () {
  "use strict";

  var root = document.querySelector("[data-video-hero]");
  if (!root) return;

  var intro = root.querySelector('[data-video="intro"]');
  var loop  = root.querySelector('[data-video="loop"]');
  if (!intro || !loop) return;

  var mq      = window.matchMedia("(max-width: 900px)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  var CUTS = {
    desktop: {
      intro:       "assets/video/hero-desktop-intro.mp4",
      loop:        "assets/video/hero-desktop-loop.mp4",
      introPoster: "assets/img/hero-desktop-intro-poster.jpg",
      loopPoster:  "assets/img/hero-desktop-loop-poster.jpg"
    },
    mobile: {
      intro:       "assets/video/hero-mobile-intro.mp4",
      loop:        "assets/video/hero-mobile-loop.mp4",
      introPoster: "assets/img/hero-mobile-intro-poster.jpg",
      loopPoster:  "assets/img/hero-mobile-loop-poster.jpg"
    }
  };

  /* One state, one owner: whichever phase we are in decides what is
     visible, so a late callback can never fight the current state. */
  var phase        = "boot";   // boot -> intro -> loop, or -> still
  var retryTimer   = 0;
  var burst        = 0;        // retries used in the current burst
  var BURST_MAX    = 6;
  var gestureArmed = false;

  function cut() {
    return mq.matches ? CUTS.mobile : CUTS.desktop;
  }

  /* Point one layer at a source, but only when it actually changes —
     re-assigning the same src would abort a running decode. */
  function assign(el, src, poster) {
    el.setAttribute("poster", poster);
    if (el.getAttribute("src") === src) return false;
    el.setAttribute("src", src);
    el.load();
    return true;
  }

  function showIntro() {
    phase = "intro";
    root.classList.remove("is-looping", "is-still");
  }

  function showLoop() {
    phase = "loop";
    root.classList.remove("is-still");
    root.classList.add("is-looping");
  }

  /* Playback is genuinely unavailable (or not wanted): the poster
     holds the frame. See hero.css — still no player chrome. */
  function showStill() {
    phase = "still";
    root.classList.remove("is-looping");
    root.classList.add("is-still");
  }

  function stopTimers() {
    window.clearTimeout(retryTimer);
    window.clearTimeout(safetyTimer);
  }

  /* ---- intro ---- */

  function attemptIntro() {
    if (phase === "loop" || phase === "still") return;

    var played = intro.play();
    if (!played || !played.then) { showIntro(); return; }

    played.then(function () {
      if (phase !== "loop") { showIntro(); burst = 0; }
    }).catch(function (err) {
      if (phase === "loop" || phase === "still") return;

      /* A real block (no gesture yet): hold the still, but keep the
         one-shot interaction listener armed so the first tap or key
         press starts the hero for real. */
      if (err && err.name === "NotAllowedError") {
        armGesture();
        showStill();
        return;
      }

      /* Interrupted — the browser paused our clip, it did not fail.
         Wait a beat and pick the intro back up where it left off. */
      scheduleRetry();
    });
  }

  function scheduleRetry() {
    if (phase === "loop" || phase === "still" || reduced.matches) return;

    /* The tab being hidden is the usual cause, and retrying in the
       dark just burns power. Leaving the timer unarmed hands the
       recovery to the visibility listener below. */
    if (document.visibilityState === "hidden") return;

    if (burst >= BURST_MAX) return;      // stop the burst, stay armed elsewhere
    burst++;

    window.clearTimeout(retryTimer);
    retryTimer = window.setTimeout(function () {
      if (phase === "loop" || phase === "still") return;
      if (document.visibilityState === "hidden") return;
      attemptIntro();
    }, Math.min(400 * burst, 2500));
  }

  /* A block needs a real gesture; the first one releases it. */
  function armGesture() {
    if (gestureArmed) return;
    gestureArmed = true;

    function release() {
      window.removeEventListener("pointerdown", release);
      window.removeEventListener("keydown", release);
      window.removeEventListener("touchstart", release);
      gestureArmed = false;
      if (reduced.matches) return;
      root.classList.remove("is-still");
      burst = 0;
      attemptIntro();
    }

    window.addEventListener("pointerdown", release, { passive: true });
    window.addEventListener("keydown", release);
    window.addEventListener("touchstart", release, { passive: true });
  }

  /* ---- handover ---- */

  function startLoop() {
    stopTimers();
    intro.pause();                      // the intro is never replayed

    try { loop.currentTime = 0; } catch (err) { /* not seekable yet */ }

    var played = loop.play();
    if (played && played.then) {
      played.then(function () {
        burst = 0;
        showLoop();
      }).catch(function (err) {
        if (err && err.name === "NotAllowedError") { armGesture(); showStill(); return; }
        /* Could not take over this instant — hold the last intro frame
           and retry, so the seam is never a black gap. */
        window.setTimeout(function () {
          if (phase === "still") return;
          if (document.visibilityState === "hidden") return;
          var p2 = loop.play();
          if (p2 && p2.then) p2.then(showLoop).catch(showStill);
          else showLoop();
        }, 300);
      });
    } else {
      showLoop();
    }
  }

  /* `ended` is the signal, but a stalled or throttled tab can swallow
     it, so the expected end of the intro is also armed as a backstop. */
  var safetyTimer = 0;

  function armSafety() {
    window.clearTimeout(safetyTimer);
    if (!isFinite(intro.duration) || intro.duration <= 0) return;

    safetyTimer = window.setTimeout(function () {
      if (phase === "loop" || phase === "still") return;
      var finished = intro.ended || intro.currentTime >= intro.duration - 0.2;
      if (finished) startLoop();
      else armSafety();                 // paused or still running: wait again
    }, (intro.duration + 0.4) * 1000);
  }

  /* ---- boot ---- */

  function boot() {
    var c = cut();
    assign(intro, c.intro, c.introPoster);
    assign(loop,  c.loop,  c.loopPoster);

    if (reduced.matches) {              // motion is not wanted: hold the still
      showStill();
      return;
    }

    intro.addEventListener("ended", startLoop);
    intro.addEventListener("loadedmetadata", armSafety);
    intro.addEventListener("stalled", scheduleRetry);
    intro.addEventListener("error", showStill);
    loop.addEventListener("error", showStill);
    loop.addEventListener("playing", function () {
      if (phase !== "still") showLoop();
    });

    /* Any of these means the hero can move again. */
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") return;
      burst = 0;
      if (phase === "loop") { loop.play(); return; }
      if (phase === "intro" || phase === "boot") attemptIntro();
      else if (phase === "still" && !gestureArmed) showStill();
    });
    intro.addEventListener("canplay", function () {
      if ((phase === "intro" || phase === "boot") && intro.paused) attemptIntro();
    });

    attemptIntro();
  }

  /* Crossing the breakpoint swaps cuts mid-flight. The intro is not
     replayed; the hero simply picks up on the loop for the new cut. */
  function onRangeChange() {
    var c = cut();
    var introChanged = assign(intro, c.intro, c.introPoster);
    var loopChanged  = assign(loop,  c.loop,  c.loopPoster);
    if (!introChanged && !loopChanged) return;

    stopTimers();
    burst = 0;

    if (reduced.matches) {
      intro.pause();
      loop.pause();
      showStill();
      return;
    }

    root.classList.remove("is-still");
    startLoop();
  }

  if (mq.addEventListener) mq.addEventListener("change", onRangeChange);
  else if (mq.addListener) mq.addListener(onRangeChange);

  if (reduced.addEventListener) reduced.addEventListener("change", onRangeChange);
  else if (reduced.addListener) reduced.addListener(onRangeChange);

  boot();
})();