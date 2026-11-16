/**
 * journey-ui.js — Editorial Storytelling Stage Sync, Desktop Cursor-Following
 * Image Previews (non-occluding, clamped, zero-flicker), and Touch Tap-to-Preview.
 */
(function initJourneyUI() {
  'use strict';

  const previewEl = document.getElementById('journeyPreview');
  const previewImg = document.getElementById('journeyPreviewImg');
  const previewTag = document.getElementById('journeyPreviewTag');
  const previewTitle = document.getElementById('journeyPreviewTitle');
  const steps = Array.from(document.querySelectorAll('.journey-step'));
  const railDots = Array.from(document.querySelectorAll('.journey-rail__dot'));
  const triggers = Array.from(document.querySelectorAll('[data-preview-trigger]'));

  const STAGE_META = {
    1: {
      src: 'assets/img/journey/stage-01-flowers-bees.jpg',
      alt: 'نحلة تجمع الرحيق وحبوب اللقاح من أزهار البرسيم والموالح',
      tag: '01 · من الزهور إلى النحل',
      title: 'جمع الرحيق من المراعي الطبيعية',
    },
    2: {
      src: 'assets/img/journey/stage-02-beehive-comb.jpg',
      alt: 'أقراص شمع العسل السداسية داخل الخلية مملوءة بالعسل الذهبي',
      tag: '02 · داخل خلية النحل',
      title: 'الخلايا السداسية وشمع النحل',
    },
    3: {
      src: 'assets/img/journey/stage-03-honey-making.jpg',
      alt: 'النحل يختم خلايا الشمع الممتلئة بالعسل الطبيعي الصافي',
      tag: '03 · فن صناعة العسل',
      title: 'تحويل الرحيق إلى عسل ذهبي',
    },
    4: {
      src: 'assets/img/journey/stage-04-harvest.jpg',
      alt: 'فرز وتصفية العسل الطبيعي يدويًا في المناحل المختارة',
      tag: '04 · عملية الحصاد والعناية',
      title: 'فرز يدوي دون تسخين أو إضافات',
    },
    5: {
      src: 'assets/img/journey/stage-05-bottled-jar.jpg',
      alt: 'تعبئة العسل الذهبي الصافي داخل البرطمان الزجاجي',
      tag: '05 · عسل نقي، معبّأ بعناية',
      title: 'من المنحل إلى برطمان نحل الذهب',
    },
  };

  // Preload optimized local stage images cleanly once DOM settles
  const preloaded = new Set();
  function preloadStageImages() {
    Object.values(STAGE_META).forEach((m) => {
      if (preloaded.has(m.src)) return;
      const img = new Image();
      img.src = m.src;
      preloaded.add(m.src);
    });
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadStageImages, { timeout: 1800 });
  } else {
    setTimeout(preloadStageImages, 600);
  }

  /* ==============================================================
     1. FLOATING CURSOR PREVIEW (Desktop Pointer)
     ============================================================== */
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const floatState = {
    active: false,
    stage: null,
    activeTrigger: null,
    lastClientX: 0,
    lastClientY: 0,
    targetX: 0,
    targetY: 0,
    currX: 0,
    currY: 0,
    velX: 0,
    rafId: 0,
    hideTimer: 0,
  };

  function getNavHeight() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
    return parseFloat(raw) || 76;
  }

  function computeNonOccludingPosition(clientX, clientY, triggerEl) {
    const cardW = previewEl ? previewEl.offsetWidth || 276 : 276;
    const cardH = previewEl ? previewEl.offsetHeight || 228 : 228;
    const navH = getNavHeight();
    const pad = 16;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardEl = triggerEl ? triggerEl.closest('.journey-step__card') : null;
    const cardRect = cardEl ? cardEl.getBoundingClientRect() : null;
    const trigRect = triggerEl ? triggerEl.getBoundingClientRect() : null;
    const avoidRect = cardRect || trigRect;

    let x = clientX + 26;
    let y = clientY - cardH * 0.45;

    if (avoidRect) {
      const spaceLeft = avoidRect.left - pad;
      const spaceRight = vw - pad - avoidRect.right;
      const cardCenter = avoidRect.left + avoidRect.width * 0.5;
      const preferLeft = cardCenter > vw * 0.5;

      // Keep floating preview smoothly adjacent to pointer & strictly outside the milestone card
      if (preferLeft && spaceLeft >= cardW + 20) {
        const anchorLeft = avoidRect.left - cardW - 22;
        const nudgeX = Math.max(-44, Math.min(0, (clientX - avoidRect.right) * 0.14));
        x = Math.max(pad, Math.min(anchorLeft, anchorLeft + nudgeX));
      } else if (!preferLeft && spaceRight >= cardW + 20) {
        const anchorRight = avoidRect.right + 22;
        const nudgeX = Math.max(0, Math.min(44, (clientX - avoidRect.left) * 0.14));
        x = Math.min(vw - cardW - pad, Math.max(anchorRight, anchorRight + nudgeX));
      } else if (spaceLeft >= cardW + 20) {
        x = avoidRect.left - cardW - 22;
      } else if (spaceRight >= cardW + 20) {
        x = avoidRect.right + 22;
      } else {
        // Vertical dodge outside the hovered trigger/title if viewport is very narrow
        const topSpace = avoidRect.top - (navH + pad);
        const botSpace = vh - pad - avoidRect.bottom;
        if (topSpace >= cardH + 14) {
          y = avoidRect.top - cardH - 14;
        } else if (botSpace >= cardH + 14) {
          y = avoidRect.bottom + 14;
        } else if (trigRect) {
          y = trigRect.top > cardH + navH + 20 ? trigRect.top - cardH - 16 : trigRect.bottom + 16;
        }
      }
    } else if (x + cardW > vw - pad) {
      x = clientX - cardW - 26;
    }

    x = Math.min(vw - cardW - pad, Math.max(pad, x));
    y = Math.min(vh - cardH - pad, Math.max(navH + 12, y));
    return { x, y };
  }

  function tickFloat() {
    if (!floatState.active && Math.abs(floatState.targetX - floatState.currX) < 0.4) {
      floatState.rafId = 0;
      return;
    }
    const prevX = floatState.currX;
    const ease = reducedQuery.matches ? 1 : 0.18;
    floatState.currX += (floatState.targetX - floatState.currX) * ease;
    floatState.currY += (floatState.targetY - floatState.currY) * ease;
    floatState.velX = (floatState.currX - prevX) * 0.35;

    const tilt = reducedQuery.matches ? 0 : Math.max(-4.5, Math.min(4.5, floatState.velX));
    if (previewEl) {
      previewEl.style.transform = `translate3d(${floatState.currX.toFixed(1)}px, ${floatState.currY.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    }
    floatState.rafId = requestAnimationFrame(tickFloat);
  }

  function showFloatingPreview(stageId, clientX, clientY, triggerEl) {
    if (!previewEl || !previewImg) return;
    const meta = STAGE_META[stageId];
    if (!meta) return;

    window.clearTimeout(floatState.hideTimer);
    floatState.activeTrigger = triggerEl || null;
    floatState.lastClientX = clientX;
    floatState.lastClientY = clientY;

    if (floatState.stage !== stageId) {
      floatState.stage = stageId;
      if (previewImg.getAttribute('src') !== meta.src) {
        previewImg.src = meta.src;
        previewImg.alt = meta.alt;
      }
      if (previewTag) previewTag.textContent = meta.tag;
      if (previewTitle) previewTitle.textContent = meta.title;
    }

    const pos = computeNonOccludingPosition(clientX, clientY, triggerEl);
    floatState.targetX = pos.x;
    floatState.targetY = pos.y;

    if (!floatState.active) {
      floatState.currX = pos.x;
      floatState.currY = pos.y;
      floatState.active = true;
      previewEl.classList.add('is-visible');
      previewEl.setAttribute('aria-hidden', 'false');
    }

    if (!floatState.rafId) {
      floatState.rafId = requestAnimationFrame(tickFloat);
    }
  }

  function scheduleHideFloatingPreview(immediate = false) {
    window.clearTimeout(floatState.hideTimer);
    const hideNow = () => {
      floatState.active = false;
      floatState.stage = null;
      floatState.activeTrigger = null;
      if (previewEl) {
        previewEl.classList.remove('is-visible');
        previewEl.setAttribute('aria-hidden', 'true');
      }
    };
    if (immediate) {
      hideNow();
    } else {
      floatState.hideTimer = window.setTimeout(hideNow, 75);
    }
  }

  /* ==============================================================
     2. TOUCH / MOBILE INLINE TAP-TO-PREVIEW
     ============================================================== */
  function toggleMobilePreview(stepEl, forceOpen) {
    if (!stepEl) return;
    const box = stepEl.querySelector('.journey-step__mobile-preview');
    const btn = stepEl.querySelector('.journey-step__preview-btn');
    if (!box) return;

    const currentlyOpen = stepEl.classList.contains('is-preview-open');
    const nextOpen = typeof forceOpen === 'boolean' ? forceOpen : !currentlyOpen;

    if (nextOpen) {
      steps.forEach((other) => {
        if (other !== stepEl) {
          other.classList.remove('is-preview-open');
          const ob = other.querySelector('.journey-step__mobile-preview');
          const obtn = other.querySelector('.journey-step__preview-btn');
          if (ob) ob.hidden = true;
          if (obtn) obtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    stepEl.classList.toggle('is-preview-open', nextOpen);
    box.hidden = !nextOpen;
    if (btn) btn.setAttribute('aria-expanded', String(nextOpen));
  }

  triggers.forEach((trigger) => {
    const stageId = trigger.getAttribute('data-stage');
    const stepEl = trigger.closest('.journey-step');

    trigger.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch' || !hoverQuery.matches) return;
      showFloatingPreview(stageId, e.clientX, e.clientY, trigger);
    });

    trigger.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || !hoverQuery.matches) return;
      floatState.lastClientX = e.clientX;
      floatState.lastClientY = e.clientY;
      if (!floatState.active) {
        showFloatingPreview(stageId, e.clientX, e.clientY, trigger);
        return;
      }
      const pos = computeNonOccludingPosition(e.clientX, e.clientY, trigger);
      floatState.targetX = pos.x;
      floatState.targetY = pos.y;
    });

    trigger.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch' || !hoverQuery.matches) return;
      scheduleHideFloatingPreview(false);
    });

    trigger.addEventListener('click', (e) => {
      if (hoverQuery.matches && window.innerWidth > 900) return;
      e.preventDefault();
      toggleMobilePreview(stepEl);
    });
  });

  document.querySelectorAll('.journey-step__preview-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const stepEl = btn.closest('.journey-step');
      toggleMobilePreview(stepEl);
    });
  });

  // Hide preview immediately if scrolled out from under cursor or pointer leaves document
  window.addEventListener('scroll', () => {
    if (!floatState.active || !floatState.activeTrigger) return;
    const r = floatState.activeTrigger.getBoundingClientRect();
    const inside =
      floatState.lastClientX >= r.left - 4 &&
      floatState.lastClientX <= r.right + 4 &&
      floatState.lastClientY >= r.top - 4 &&
      floatState.lastClientY <= r.bottom + 4;
    if (!inside) scheduleHideFloatingPreview(true);
  }, { passive: true });

  document.addEventListener('mouseleave', () => scheduleHideFloatingPreview(true));
  window.addEventListener('blur', () => scheduleHideFloatingPreview(true));

  /* ==============================================================
     3. ACTIVE STAGE & PROGRESS RAIL SYNC
     ============================================================== */
  function setActiveStage(stageNum) {
    steps.forEach((step) => {
      const s = Number(step.getAttribute('data-stage-idx'));
      step.classList.toggle('is-active', s === stageNum);
    });
    railDots.forEach((dot) => {
      const s = Number(dot.getAttribute('data-rail-stage'));
      const isActive = s === stageNum;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'step' : 'false');
    });
  }

  window.addEventListener('honey:stage', (e) => {
    if (e.detail && typeof e.detail.stage === 'number') {
      setActiveStage(e.detail.stage);
    }
  });

  // IntersectionObserver fallback (also handles static/reduced-motion mode)
  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          if (document.getElementById('experienceWrap')?.classList.contains('is-static-fallback')) {
            const idx = Number(entry.target.getAttribute('data-stage-idx'));
            if (idx) setActiveStage(idx);
          }
        }
      });
    },
    { threshold: 0.25 }
  );
  steps.forEach((step) => stepObserver.observe(step));

  // If reduced-motion / no-WebGL fallback triggers, open inline thumbnails gracefully
  window.addEventListener('honey:fallback', () => {
    steps.forEach((step) => {
      const box = step.querySelector('.journey-step__mobile-preview');
      if (box) box.hidden = false;
      step.classList.add('is-revealed', 'is-preview-open');
    });
  });

  // Clicking a rail dot smoothly navigates to that stage
  railDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetId = dot.getAttribute('data-target');
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        target.scrollIntoView({ behavior: reducedQuery.matches ? 'auto' : 'smooth', block: 'center' });
      }
    });
  });
})();
