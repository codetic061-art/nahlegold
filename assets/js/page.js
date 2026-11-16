/* ============================================================
   page.js — interactive page enhancements
   - Product category filtering
   - Smooth anchor navigation handling
   ============================================================ */
(function () {
  "use strict";

  // Product category filter chips
  var chips = document.querySelectorAll(".filter-row .chip");
  var cards = document.querySelectorAll(".prod-grid .prod-card");

  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var filter = chip.getAttribute("data-filter");

        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");

        cards.forEach(function (card) {
          var cat = card.getAttribute("data-cat");
          if (filter === "all" || cat === filter) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#" || targetId.length <= 1) return;
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        // Close mobile nav if open
        var mobileNav = document.getElementById("mobileNav");
        var navBurger = document.getElementById("navBurger");
        if (mobileNav && !mobileNav.hidden) {
          mobileNav.hidden = true;
          document.body.classList.remove("nav-open");
          if (navBurger) navBurger.setAttribute("aria-expanded", "false");
        }
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        targetEl.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: targetEl.classList.contains("journey-step") ? "center" : "start"
        });
      }
    });
  });
})();
