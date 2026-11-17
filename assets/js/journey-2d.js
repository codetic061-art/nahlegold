/**
 * journey-2d.js — Soft Organic 2D Honey Journey Channel (SVG + Vanilla JS)
 * - ZERO black outlines or hard borders: defined strictly via layered warm amber tonal shading
 *   (soft cream-amber cushion -> rich golden-tan channel wall -> deep amber-brown interior ->
 *    bright animated scroll-driven liquid honey + subtle surface sheen).
 * - Connects seamlessly at top to the Hero 3D Honeycomb Collector Channel spout coordinates
 *   (`honey:hero-spout`) and sweeps cleanly down through art-directed S-curves into #jarInletAnchor.
 */
(function initJourney2D() {
  'use strict';

  const board = document.getElementById('journeyBoard');
  const svg = document.getElementById('journeySvg');
  if (!board || !svg) return;

  const pathCushion = document.getElementById('journeyPathCushion');
  const pathWall = document.getElementById('journeyPathWall');
  const pathCore = document.getElementById('journeyPathCore');
  const pathTrough = document.getElementById('journeyPathTrough');
  const pathHoney = document.getElementById('journeyPathHoney');
  const pathSheen = document.getElementById('journeyPathSheen');
  const inletCup = document.getElementById('journeyInletCup');
  const inletHoney = document.getElementById('journeyInletHoney');
  const inletSheen = document.getElementById('journeyInletSheen');

  const inletAnchor = document.getElementById('journeyInletMarker');
  const jarInletAnchor = document.getElementById('jarInletAnchor');
  const nodes = [1, 2, 3, 4, 5].map((i) => document.getElementById(`node-0${i}`));

  if (!pathCushion || !pathCore || !pathHoney || !inletAnchor || !jarInletAnchor) return;
  if (nodes.some((n) => !n)) return;

  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 840px)');

  const state = {
    samples: [],
    totalLength: 1,
    scrollTarget: 0.06,
    scrollSmooth: 0.06,
    inletPt: { x: 0, y: 0 },
    outletPt: { x: 0, y: 0 },
    spoutClientX: null,
    spoutRadiusPx: null,
    rafId: 0,
    activeStage: 0,
  };

  function centerRelToBoard(el, boardRect) {
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width * 0.5 - boardRect.left,
      y: r.top + r.height * 0.5 - boardRect.top,
      top: r.top - boardRect.top,
      bottom: r.bottom - boardRect.top,
    };
  }

  /**
   * Generates a G1-continuous cubic Bezier S-spline string from `{ x, y, tx, ty, hIn, hOut }` nodes.
   */
  function buildCubicPath(waypoints) {
    if (!waypoints.length) return '';
    let d = `M ${waypoints[0].x.toFixed(1)} ${waypoints[0].y.toFixed(1)}`;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const lOut = a.hOut !== undefined ? a.hOut : dist * 0.45;
      const lIn = b.hIn !== undefined ? b.hIn : dist * 0.45;
      const c1x = a.x + a.tx * lOut;
      const c1y = a.y + a.ty * lOut;
      const c2x = b.x - b.tx * lIn;
      const c2y = b.y - b.ty * lIn;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    return d;
  }

  function rebuildPathGeometry() {
    const boardRect = board.getBoundingClientRect();
    if (boardRect.width < 120 || boardRect.height < 220) return;

    const isMob = mobileQuery.matches;
    const cushionW = isMob ? 30 : 44;
    const wallW = isMob ? 25 : 37;
    const coreW = isMob ? 20 : 30;
    const troughW = isMob ? 12 : 18;
    const honeyW = isMob ? 15 : 23;
    const sheenW = isMob ? 3.4 : 5.2;

    svg.setAttribute('viewBox', `0 0 ${boardRect.width.toFixed(1)} ${boardRect.height.toFixed(1)}`);

    // Synchronize top horizontal inlet position relative to offsetParent (.nh-journey__inlet)
    // so there is zero padding-inline offset between Hero 3D stream and SVG channel!
    const liveClientX = state.spoutClientX ?? (window.__NH_HERO_SPOUT__ ? window.__NH_HERO_SPOUT__.clientX : null);
    if (liveClientX !== null && Number.isFinite(liveClientX)) {
      const parentRect = inletAnchor.offsetParent
        ? inletAnchor.offsetParent.getBoundingClientRect()
        : boardRect;
      const clampedInParent = Math.max(18, Math.min(parentRect.width - 18, liveClientX - parentRect.left));
      inletAnchor.style.left = `${clampedInParent.toFixed(1)}px`;
    }

    const inlet = centerRelToBoard(inletAnchor, boardRect);
    const n1 = centerRelToBoard(nodes[0], boardRect);
    const n2 = centerRelToBoard(nodes[1], boardRect);
    const n3 = centerRelToBoard(nodes[2], boardRect);
    const n4 = centerRelToBoard(nodes[3], boardRect);
    const n5 = centerRelToBoard(nodes[4], boardRect);
    const jarTop = centerRelToBoard(jarInletAnchor, boardRect);

    // Top entry of the wide tube starts cleanly at y = 24 inside the tapered inlet collar
    // (#journeyInletHoney bridges seamlessly from exact 3D stream radius at y = -2 down to honeyW at y = 32).
    state.inletPt = { x: inlet.x, y: 24 };
    state.outletPt = { x: jarTop.x, y: Math.max(n5.y + 80, jarTop.top + 6) };

    const pts = [];
    if (!isMob) {
      // Art-directed Desktop S-Curves: pure monotonic vertical tangents (tx=0, ty=1) at every node
      // guarantee flowing liquid grace + zero encroachment into opposing RTL text columns.
      const dy01 = Math.max(90, n1.y - state.inletPt.y);
      const dy12 = Math.max(90, n2.y - n1.y);
      const dy23 = Math.max(90, n3.y - n2.y);
      const dy34 = Math.max(90, n4.y - n3.y);
      const dy45 = Math.max(90, n5.y - n4.y);
      const dy5e = Math.max(90, state.outletPt.y - n5.y);

      pts.push({ x: state.inletPt.x, y: state.inletPt.y, tx: 0, ty: 1, hOut: dy01 * 0.52 });
      pts.push({ x: n1.x, y: n1.y, tx: 0, ty: 1, hIn: dy01 * 0.50, hOut: dy12 * 0.56 });
      pts.push({ x: n2.x, y: n2.y, tx: 0, ty: 1, hIn: dy12 * 0.56, hOut: dy23 * 0.56 });
      pts.push({ x: n3.x, y: n3.y, tx: 0, ty: 1, hIn: dy23 * 0.56, hOut: dy34 * 0.56 });
      pts.push({ x: n4.x, y: n4.y, tx: 0, ty: 1, hIn: dy34 * 0.56, hOut: dy45 * 0.56 });
      pts.push({ x: n5.x, y: n5.y, tx: 0, ty: 1, hIn: dy45 * 0.54, hOut: dy5e * 0.54 });

      const approachY = Math.max(n5.y + 38, state.outletPt.y - 46);
      pts.push({ x: state.outletPt.x, y: approachY, tx: 0, ty: 1, hIn: Math.max(36, (approachY - n5.y) * 0.50), hOut: 20 });
      pts.push({ x: state.outletPt.x, y: state.outletPt.y, tx: 0, ty: 1, hIn: 18, hOut: 0 });
    } else {
      // Responsive Mobile Organic Winding Snake:
      // Curving cleanly into left gutter inside open inlet gap before reaching mobile copy
      const elbowY = Math.max(58, Math.min(n1.y - 42, 92));
      const dyTop = Math.max(36, elbowY - state.inletPt.y);
      const dyElbow1 = Math.max(40, n1.y - elbowY);
      const dy12m = Math.max(60, n2.y - n1.y);
      const dy23m = Math.max(60, n3.y - n2.y);
      const dy34m = Math.max(60, n4.y - n3.y);
      const dy45m = Math.max(60, n5.y - n4.y);
      const dy5em = Math.max(70, state.outletPt.y - n5.y);

      pts.push({ x: state.inletPt.x, y: state.inletPt.y, tx: 0, ty: 1, hOut: dyTop * 0.56 });
      pts.push({ x: n1.x, y: elbowY, tx: 0, ty: 1, hIn: dyTop * 0.56, hOut: dyElbow1 * 0.45 });
      pts.push({ x: n1.x, y: n1.y, tx: 0, ty: 1, hIn: dyElbow1 * 0.45, hOut: dy12m * 0.52 });
      pts.push({ x: n2.x, y: n2.y, tx: 0, ty: 1, hIn: dy12m * 0.52, hOut: dy23m * 0.52 });
      pts.push({ x: n3.x, y: n3.y, tx: 0, ty: 1, hIn: dy23m * 0.52, hOut: dy34m * 0.52 });
      pts.push({ x: n4.x, y: n4.y, tx: 0, ty: 1, hIn: dy34m * 0.52, hOut: dy45m * 0.52 });
      pts.push({ x: n5.x, y: n5.y, tx: 0, ty: 1, hIn: dy45m * 0.50, hOut: dy5em * 0.52 });

      const approachYm = Math.max(n5.y + 34, state.outletPt.y - 42);
      pts.push({ x: state.outletPt.x, y: approachYm, tx: 0, ty: 1, hIn: Math.max(32, (approachYm - n5.y) * 0.50), hOut: 18 });
      pts.push({ x: state.outletPt.x, y: state.outletPt.y, tx: 0, ty: 1, hIn: 16, hOut: 0 });
    }

    const d = buildCubicPath(pts);

    pathCushion.setAttribute('d', d);
    pathCushion.setAttribute('stroke-width', String(cushionW));

    if (pathWall) {
      pathWall.setAttribute('d', d);
      pathWall.setAttribute('stroke-width', String(wallW));
    }

    pathCore.setAttribute('d', d);
    pathCore.setAttribute('stroke-width', String(coreW));

    if (pathTrough) {
      pathTrough.setAttribute('d', d);
      pathTrough.setAttribute('stroke-width', String(troughW));
    }

    pathHoney.setAttribute('d', d);
    pathHoney.setAttribute('stroke-width', String(honeyW));

    if (pathSheen) {
      pathSheen.setAttribute('d', d);
      pathSheen.setAttribute('stroke-width', String(sheenW));
    }

    // Seamless tapered inlet collar matching exact 3D stream radius at Hero-to-Journey seam (y = -2..32)
    const liveRadius = state.spoutRadiusPx ?? (window.__NH_HERO_SPOUT__ ? window.__NH_HERO_SPOUT__.radiusPx : null);
    const ix = state.inletPt.x;
    const hTop = Number.isFinite(liveRadius) ? Math.max(4.0, Math.min(13.0, liveRadius)) : (isMob ? 5.5 : 8.0);
    const hBot = honeyW * 0.50;

    if (inletCup) {
      const cTop = hTop + 3.0;
      const cBot = cushionW * 0.50;
      inletCup.setAttribute('opacity', '0.88');
      inletCup.setAttribute(
        'd',
        `M ${(ix - cTop).toFixed(1)} 2 ` +
        `L ${(ix + cTop).toFixed(1)} 2 ` +
        `C ${(ix + cTop).toFixed(1)} 12, ${(ix + cBot).toFixed(1)} 18, ${(ix + cBot).toFixed(1)} 32 ` +
        `L ${(ix - cBot).toFixed(1)} 32 ` +
        `C ${(ix - cBot).toFixed(1)} 18, ${(ix - cTop).toFixed(1)} 12, ${(ix - cTop).toFixed(1)} 2 Z`
      );
    }

    if (inletHoney) {
      inletHoney.setAttribute(
        'd',
        `M ${(ix - hTop).toFixed(1)} -2 ` +
        `L ${(ix + hTop).toFixed(1)} -2 ` +
        `C ${(ix + hTop).toFixed(1)} 10, ${(ix + hBot).toFixed(1)} 18, ${(ix + hBot).toFixed(1)} 34 ` +
        `L ${(ix - hBot).toFixed(1)} 34 ` +
        `C ${(ix - hBot).toFixed(1)} 18, ${(ix - hTop).toFixed(1)} 10, ${(ix - hTop).toFixed(1)} -2 Z`
      );
    }

    if (inletSheen) {
      inletSheen.setAttribute('d', `M ${ix.toFixed(1)} 0 L ${ix.toFixed(1)} 32`);
      inletSheen.setAttribute('stroke-width', String(Math.max(2.4, sheenW * 0.85)));
    }

    // Sample arc lengths monotonically for smooth scroll-driven honey progression
    state.totalLength = Math.max(1, pathHoney.getTotalLength());
    pathHoney.style.strokeDasharray = `${state.totalLength}`;
    if (pathSheen) pathSheen.style.strokeDasharray = `${state.totalLength}`;

    state.samples = [];
    const sampleCount = 180;
    for (let i = 0; i <= sampleCount; i++) {
      const dist = (i / sampleCount) * state.totalLength;
      const pt = pathHoney.getPointAtLength(dist);
      state.samples.push({ s: i / sampleCount, x: pt.x, y: pt.y });
    }

    updateScrollTarget();
    applyFillProgress(reducedQuery.matches ? 1.0 : state.scrollSmooth);

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  }

  function updateScrollTarget() {
    if (reducedQuery.matches) {
      state.scrollTarget = 1.0;
      return;
    }
    const boardRect = board.getBoundingClientRect();
    const focalYInBoard = window.innerHeight * 0.56 - boardRect.top;

    if (focalYInBoard <= state.inletPt.y + 12) {
      state.scrollTarget = 0.06;
      return;
    }
    if (focalYInBoard >= state.outletPt.y - 6) {
      state.scrollTarget = 1.0;
      return;
    }

    let matchedS = 0.06;
    for (let i = 0; i < state.samples.length; i++) {
      if (state.samples[i].y <= focalYInBoard) {
        matchedS = state.samples[i].s;
      }
    }
    state.scrollTarget = Math.min(1.0, Math.max(0.06, matchedS));
  }

  function applyFillProgress(s) {
    const clamped = Math.min(1.0, Math.max(0.0, s));
    const dashOffset = state.totalLength * (1.0 - clamped);
    pathHoney.style.strokeDashoffset = dashOffset.toFixed(1);
    if (pathSheen) {
      pathSheen.style.strokeDashoffset = dashOffset.toFixed(1);
    }

    const vpMid = window.innerHeight * 0.50;
    let bestStage = 1;
    let bestDist = Infinity;
    nodes.forEach((nodeEl, idx) => {
      const r = nodeEl.getBoundingClientRect();
      const d = Math.abs((r.top + r.height * 0.5) - vpMid);
      if (d < bestDist) {
        bestDist = d;
        bestStage = idx + 1;
      }
    });
    if (bestStage !== state.activeStage) {
      state.activeStage = bestStage;
      window.dispatchEvent(new CustomEvent('honey:stage', { detail: { stage: bestStage, progress: clamped } }));
    }
  }

  function tick() {
    state.rafId = requestAnimationFrame(tick);
    if (document.hidden) return;
    if (reducedQuery.matches) {
      if (state.scrollSmooth !== 1) {
        state.scrollSmooth = 1;
        applyFillProgress(1);
      }
      return;
    }
    const diff = state.scrollTarget - state.scrollSmooth;
    if (Math.abs(diff) > 0.25) {
      state.scrollSmooth = state.scrollTarget;
      applyFillProgress(state.scrollSmooth);
    } else if (Math.abs(diff) > 0.0004) {
      state.scrollSmooth += diff * 0.22;
      applyFillProgress(state.scrollSmooth);
    }
  }

  window.addEventListener('honey:hero-spout', (e) => {
    if (e.detail && typeof e.detail.clientX === 'number') {
      state.spoutClientX = e.detail.clientX;
      if (typeof e.detail.radiusPx === 'number') {
        state.spoutRadiusPx = e.detail.radiusPx;
      }
      rebuildPathGeometry();
    }
  });

  window.addEventListener('scroll', updateScrollTarget, { passive: true });
  window.addEventListener('resize', rebuildPathGeometry);

  if (window.ResizeObserver) {
    new ResizeObserver(rebuildPathGeometry).observe(board);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(rebuildPathGeometry);
  }

  rebuildPathGeometry();
  tick();
})();
