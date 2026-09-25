/* ============================================================
   navbar.js — the mobile navigation panel.

   Below 900px the desktop bar is replaced outright rather than
   squeezed (see navbar.css), so all that is left to run is the
   panel itself: toggle, scroll lock, ESC, outside-click, focus
   containment, and a reset whenever the viewport leaves the
   mobile range.

   The panel ships `hidden` in the markup, so it is inert — and
   invisible to assistive tech — before this file runs.
   ============================================================ */
(function () {
  "use strict";

  var burger = document.getElementById("navBurger");
  var panel  = document.getElementById("mobileNav");
  if (!burger || !panel) return;

  var mq = window.matchMedia("(max-width: 900px)");
  var lastFocus = null;

  function isOpen() {
    return burger.getAttribute("aria-expanded") === "true";
  }

  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    panel.hidden = false;                       // unhide before focusing into it
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "إغلاق القائمة");
    document.body.classList.add("nav-open");    // scroll lock, see navbar.css

    var first = panel.querySelector("a[href], button");
    if (first) first.focus({ preventScroll: true });
  }

  function close(restoreFocus) {
    if (!isOpen()) return;
    panel.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "فتح القائمة");
    document.body.classList.remove("nav-open");

    if (restoreFocus && lastFocus && lastFocus.focus) {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  }

  burger.addEventListener("click", function () {
    if (isOpen()) close(true);
    else open();
  });

  /* A tap on a link is a navigation — get out of its way, but do not
     pull focus back to the burger mid-jump. */
  panel.addEventListener("click", function (event) {
    if (event.target.closest("a[href]")) close(false);
  });

  /* Tapping the page behind the panel dismisses it. */
  document.addEventListener("click", function (event) {
    if (!isOpen()) return;
    if (panel.contains(event.target) || burger.contains(event.target)) return;
    close(false);
  });

  document.addEventListener("keydown", function (event) {
    if (!isOpen()) return;

    if (event.key === "Escape") {
      close(true);
      return;
    }

    /* Light focus containment: the panel is modal in the sense that
       nothing behind it should be reachable while it is open. */
    if (event.key !== "Tab") return;
    var items = panel.querySelectorAll("a[href], button");
    if (!items.length) return;

    var first = items[0];
    var last  = items[items.length - 1];
    var active = document.activeElement;

    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* Growing past the breakpoint must never strand an open panel. */
  function onRangeChange() {
    if (!mq.matches) close(false);
  }
  if (mq.addEventListener) mq.addEventListener("change", onRangeChange);
  else if (mq.addListener) mq.addListener(onRangeChange);   // older Safari
})();