/**
 * journey-2d.js — Pure 2D Winding Honey Path (SVG + Vanilla JS)
 * Builds a responsive continuous S-curve & loop SVG path framed by TWO thin
 * black outlines enclosing a darker interior channel, and animates golden honey
 * strictly inside the channel synchronized smoothly with scroll progress.
 */
(function initJourney2D() {
  'use strict';

  const board = document.getElementById('journeyBoard');
  const svg = document.getElementById('journeySvg');
  if (!board || !svg) return;

  const pathOutline = document.getElementById('journeyPathOutline');
  const pathInterior = document.getElementById('journeyPathInterior');
  const pathBridgeOutline = document.getElementById('journeyPathBridgeOutline');
  const pathBridgeInterior = document.getElementById('journeyPathBridgeInterior');
  const pathHoney = document.getElementById('journeyPathHoney');
  const pathSheen = document.getElementById('journeyPathSheen');
  const inletCollar = document.getElementById('journeyInletCollar');
  const outletCollar = document.getElementById('journeyOutletCollar');
  const outletHoneyFill = document.getElementById('journeyOutletHoneyFill');
  const outletBorders = document.getElementById('journeyOutletBorders');

  const inletAnchor = document.getElementById('journeyInletMarker');
  const jarWrapAnchor = document.getElementById('jarFinaleWrap');
  const jarInletAnchor = document.getElementById('jarInletAnchor');
  const nodes = [1, 2, 3, 4, 5].map((i) => document.getElementById(`node-0${i}`));

  if (!pathOutline || !pathInterior || !pathHoney || !inletAnchor || !jarInletAnchor) return;
  if (nodes.some((n) => !n)) return;

  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 840px)');

  const state = {
    samples: [],      // [{ s, x, y }]
    totalLength: 1,
    scrollTarget: 0,
    scrollSmooth: 0,
    inletPt: { x: 0, y: 0 },
    outletPt: { x: 0, y: 0 },
    nozzleH: 26,
    outerW: 34,
    innerW: 30,
    honeyW: 29.5,
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

  function normVec(x, y) {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }

  /**
   * Builds a G1-continuous SVG cubic Bezier path string from waypoints:
   * Each point carries `{ x, y, tx, ty, hIn, hOut }`.
   */
  function buildCubicPath(waypoints) {
    if (!waypoints.length) return '';
    let d = `M ${waypoints[0].x.toFixed(1)} ${waypoints[0].y.toFixed(1)}`;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const lOut = a.hOut !== undefined ? a.hOut : dist * 0.38;
      const lIn = b.hIn !== undefined ? b.hIn : dist * 0.38;
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
    if (boardRect.width < 100 || boardRect.height < 200) return;

    const isMob = mobileQuery.matches;
    const outerW = isMob ? 24 : 34;
    const innerW = isMob ? 20 : 30;
    const honeyW = isMob ? 19.5 : 29.5;
    const sheenW = isMob ? 4 : 6;
    const nozzleH = 26;

    state.outerW = outerW;
    state.innerW = innerW;
    state.honeyW = honeyW;
    state.nozzleH = nozzleH;

    svg.setAttribute('viewBox', `0 0 ${boardRect.width.toFixed(1)} ${boardRect.height.toFixed(1)}`);

    const tankImg = document.getElementById('honeyTankImg');
    const pourZone = document.getElementById('journeyPour');
    if (tankImg && pourZone) {
      const tRect = tankImg.getBoundingClientRect();
      const zRect = pourZone.getBoundingClientRect();
      if (tRect.width > 40 && zRect.width > 40) {
        const spoutX = tRect.left + tRect.width * 0.732 - zRect.left;
        inletAnchor.style.left = `${((spoutX / zRect.width) * 100).toFixed(2)}%`;
      }
    }

    const inlet = centerRelToBoard(inletAnchor, boardRect);
    const n1 = centerRelToBoard(nodes[0], boardRect);
    const n2 = centerRelToBoard(nodes[1], boardRect);
    const n3 = centerRelToBoard(nodes[2], boardRect);
    const n4 = centerRelToBoard(nodes[3], boardRect);
    const n5 = centerRelToBoard(nodes[4], boardRect);
    const jarTargetEl = jarWrapAnchor || jarInletAnchor;
    const jarTop = centerRelToBoard(jarTargetEl, boardRect);

    state.inletPt = { x: inlet.x, y: inlet.top + 6 };
    const exitEnd = { x: jarTop.x, y: jarTop.top - nozzleH + 2 };
    state.outletPt = { x: jarTop.x, y: jarTop.top + 2 };

    const waypoints = [];
    let bridgeWaypoints = [];

    if (!isMob) {
      // DESKTOP S-CURVE + STAGE 02 SIGNATURE LOOP
      const dy01 = Math.max(70, n1.y - state.inletPt.y);
      const tEntry = { x: 0, y: 1 };
      const t1 = normVec(0.05, 0.99);
      const rL = Math.min(115, Math.max(58, (n2.x - 36) * 0.62));
      const t2 = normVec(-0.42, 0.91);
      const t3 = normVec(0.06, 0.99);
      const t4 = normVec(-0.14, 0.99);
      const t5 = normVec(0.76, 0.65);

      waypoints.push({ x: state.inletPt.x, y: state.inletPt.y, tx: tEntry.x, ty: tEntry.y, hOut: Math.min(110, dy01 * 0.44) });
      waypoints.push({ x: n1.x, y: n1.y, tx: t1.x, ty: t1.y, hIn: Math.min(110, dy01 * 0.44), hOut: 125 });

      // Stage 02 -> Clockwise Left Teardrop Loop cleanly outside RTL text copy
      waypoints.push({ x: n2.x, y: n2.y, tx: t2.x, ty: t2.y, hIn: 120, hOut: rL * 0.72 });
      waypoints.push({ x: n2.x - rL * 0.74, y: n2.y + rL * 1.48, tx: -1, ty: 0, hIn: rL * 0.56, hOut: rL * 0.46 });
      waypoints.push({ x: n2.x - rL * 1.46, y: n2.y + rL * 0.86, tx: 0, ty: -1, hIn: rL * 0.42, hOut: rL * 0.42 });
      waypoints.push({ x: n2.x - rL * 0.70, y: n2.y + rL * 0.24, tx: 1, ty: 0, hIn: rL * 0.46, hOut: rL * 0.52 });
      waypoints.push({ x: n2.x + rL * 0.16, y: n2.y + rL * 1.38, tx: 0.52, ty: 0.85, hIn: rL * 0.62, hOut: 125 });

      waypoints.push({ x: n3.x, y: n3.y, tx: t3.x, ty: t3.y, hIn: 115, hOut: 125 });
      waypoints.push({ x: n4.x, y: n4.y, tx: t4.x, ty: t4.y, hIn: 120, hOut: 115 });
      waypoints.push({ x: n5.x, y: n5.y, tx: t5.x, ty: t5.y, hIn: 95, hOut: Math.max(60, Math.abs(exitEnd.x - n5.x) * 0.42) });

      // Final vertical descent straight into Stage 05 jar mouth anchor
      const dropY = Math.max(n5.y + 38, exitEnd.y - 72);
      waypoints.push({ x: exitEnd.x, y: dropY, tx: 0, ty: 1, hIn: 56, hOut: 28 });
      waypoints.push({ x: exitEnd.x, y: exitEnd.y, tx: 0, ty: 1, hIn: 24, hOut: 0 });

      // Outgoing loop crossover segment painted as crisp overpass over vertical entry neck
      bridgeWaypoints = waypoints.slice(5, 7);
    } else {
      // MOBILE EDITORIAL RAIL + TRUE CIRCULAR CROSSING TEARDROP LOOP BELOW STAGE 02 COPY
      const xRail = n2.x;
      const dy01m = Math.max(60, n1.y - state.inletPt.y);
      const stage2Copy = nodes[1].closest('.journey-step')?.querySelector('.journey-step__copy');
      const stage2Bot = stage2Copy
        ? stage2Copy.getBoundingClientRect().bottom - boardRect.top
        : n2.y + 100;
      const availGap = Math.max(122, n3.y - stage2Bot);
      const rM = Math.min(38, Math.max(26, availGap * 0.27));
      const loopY = stage2Bot + availGap * 0.52;
      const gateY = Math.max(n2.y + 38, stage2Bot + 8);
      const cxLoop = Math.min(boardRect.width - 96, xRail + rM * 1.48);

      waypoints.push({ x: state.inletPt.x, y: state.inletPt.y, tx: 0, ty: 1, hOut: Math.min(54, dy01m * 0.44) });
      waypoints.push({ x: n1.x, y: n1.y, tx: 0, ty: 1, hIn: Math.min(54, dy01m * 0.44), hOut: 44 });
      waypoints.push({ x: xRail, y: n2.y, tx: 0, ty: 1, hIn: 42, hOut: Math.max(24, (gateY - n2.y) * 0.42) });

      // Compact counter-clockwise right circular loop cleanly inside open gap below Stage 02 copy
      waypoints.push({ x: xRail, y: gateY, tx: 0, ty: 1, hIn: Math.max(20, (gateY - n2.y) * 0.35), hOut: Math.max(24, (loopY - gateY) * 0.62) });
      waypoints.push({ x: cxLoop, y: loopY + rM, tx: 1, ty: 0, hIn: rM * 0.68, hOut: rM * 0.46 });
      waypoints.push({ x: cxLoop + rM * 0.96, y: loopY, tx: 0, ty: -1, hIn: rM * 0.44, hOut: rM * 0.44 });
      waypoints.push({ x: cxLoop, y: loopY - rM, tx: -1, ty: 0, hIn: rM * 0.46, hOut: rM * 0.62 });
      const returnY = Math.min(n3.y - 24, loopY + rM + 14);
      waypoints.push({ x: xRail, y: returnY, tx: 0, ty: 1, hIn: rM * 0.62, hOut: 16 });

      waypoints.push({ x: n3.x, y: n3.y, tx: 0, ty: 1, hIn: 24, hOut: 40 });
      waypoints.push({ x: n4.x, y: n4.y, tx: 0, ty: 1, hIn: 40, hOut: 40 });
      waypoints.push({ x: n5.x, y: n5.y, tx: 0, ty: 1, hIn: 40, hOut: 44 });

      // Smooth sweep across bottom cleanly down into centered mobile jar mouth
      const dropY = Math.max(n5.y + 42, exitEnd.y - 54);
      waypoints.push({ x: exitEnd.x, y: dropY, tx: 0, ty: 1, hIn: 44, hOut: 22 });
      waypoints.push({ x: exitEnd.x, y: exitEnd.y, tx: 0, ty: 1, hIn: 20, hOut: 0 });

      bridgeWaypoints = waypoints.slice(6, 8);
    }

    const d = buildCubicPath(waypoints);
    const bridgeD = bridgeWaypoints.length >= 2 ? buildCubicPath(bridgeWaypoints) : '';

    pathOutline.setAttribute('d', d);
    pathOutline.setAttribute('stroke-width', String(outerW));

    pathInterior.setAttribute('d', d);
    pathInterior.setAttribute('stroke-width', String(innerW));

    if (pathBridgeOutline && pathBridgeInterior) {
      pathBridgeOutline.setAttribute('d', bridgeD);
      pathBridgeOutline.setAttribute('stroke-width', String(outerW));
      pathBridgeInterior.setAttribute('d', bridgeD);
      pathBridgeInterior.setAttribute('stroke-width', String(innerW));
    }

    pathHoney.setAttribute('d', d);
    pathHoney.setAttribute('stroke-width', String(honeyW));

    if (pathSheen) {
      pathSheen.setAttribute('d', d);
      pathSheen.setAttribute('stroke-width', String(sheenW));
    }

    // Crisp Collector Collar at Top Inlet (2D funnel mouth catching 3D pour stream)
    if (inletCollar) {
      const ix = state.inletPt.x;
      const iy = state.inletPt.y;
      const rw = outerW * 0.64;
      inletCollar.setAttribute(
        'd',
        `M ${(ix - rw).toFixed(1)} ${(iy - 5).toFixed(1)} ` +
        `Q ${ix.toFixed(1)} ${(iy + 6).toFixed(1)} ${(ix + rw).toFixed(1)} ${(iy - 5).toFixed(1)} ` +
        `L ${(ix + outerW * 0.5).toFixed(1)} ${(iy + 8).toFixed(1)} ` +
        `L ${(ix - outerW * 0.5).toFixed(1)} ${(iy + 8).toFixed(1)} Z`
      );
    }

    // Crisp Tapered Nozzle at Bottom Exit (#C8C4BB open interior framed by two 2px #111111 side rails)
    if (outletCollar && outletHoneyFill) {
      const ox = exitEnd.x;
      const oy0 = exitEnd.y - 1;
      const oy1 = exitEnd.y + nozzleH;
      const railHalfTop = outerW * 0.5 - 1; // centers 2px stroke strictly on outer edge
      const railHalfBot = 5.4;              // 10.8px centerline (~12.8px outer, ~8.8px inner hole)
      const topHon = honeyW * 0.5;
      const botHon = 4.6; // ~9.2px golden honey ribbon seamlessly handing off into 3D pour!

      outletCollar.setAttribute(
        'd',
        `M ${(ox - railHalfTop).toFixed(1)} ${(oy0 - 0.5).toFixed(1)} ` +
        `L ${(ox - railHalfBot).toFixed(1)} ${oy1.toFixed(1)} ` +
        `L ${(ox + railHalfBot).toFixed(1)} ${oy1.toFixed(1)} ` +
        `L ${(ox + railHalfTop).toFixed(1)} ${(oy0 - 0.5).toFixed(1)} Z`
      );
      outletHoneyFill.setAttribute(
        'd',
        `M ${(ox - topHon).toFixed(1)} ${(oy0 - 1.5).toFixed(1)} ` +
        `L ${(ox - botHon).toFixed(1)} ${(oy1 + 1.5).toFixed(1)} ` +
        `L ${(ox + botHon).toFixed(1)} ${(oy1 + 1.5).toFixed(1)} ` +
        `L ${(ox + topHon).toFixed(1)} ${(oy0 - 1.5).toFixed(1)} Z`
      );
      if (outletBorders) {
        outletBorders.setAttribute(
          'd',
          `M ${(ox - railHalfTop).toFixed(1)} ${oy0.toFixed(1)} L ${(ox - railHalfBot).toFixed(1)} ${oy1.toFixed(1)} ` +
          `M ${(ox + railHalfTop).toFixed(1)} ${oy0.toFixed(1)} L ${(ox + railHalfBot).toFixed(1)} ${oy1.toFixed(1)}`
        );
      }
    }

    // Sample points along SVG path so scroll tracking maps Y coordinate smoothly along length
    state.totalLength = Math.max(1, pathHoney.getTotalLength());
    pathHoney.style.strokeDasharray = `${state.totalLength}`;
    if (pathSheen) pathSheen.style.strokeDasharray = `${state.totalLength}`;

    state.samples = [];
    const sampleCount = 160;
    for (let i = 0; i <= sampleCount; i++) {
      const dist = (i / sampleCount) * state.totalLength;
      const pt = pathHoney.getPointAtLength(dist);
      state.samples.push({ s: i / sampleCount, x: pt.x, y: pt.y });
    }

    updateScrollTarget();
    applyFillProgress(reducedQuery.matches ? 1.0 : state.scrollSmooth);
  }

  /**
   * Computes path fill fraction s (0..1) corresponding to the viewport's focal point
   * moving smoothly from Inlet down through Stage 01..05 to the Stage 05 nozzle.
   */
  function updateScrollTarget() {
    if (reducedQuery.matches) {
      state.scrollTarget = 1.0;
      return;
    }
    const boardRect = board.getBoundingClientRect();
    // Viewport reading focal height inside the #journeyBoard coordinate system
    const focalYInBoard = window.innerHeight * 0.56 - boardRect.top;

    if (focalYInBoard <= state.inletPt.y + 4) {
      state.scrollTarget = 0.025;
      return;
    }
    if (focalYInBoard >= state.outletPt.y - 6) {
      state.scrollTarget = 1.0;
      return;
    }

    // Walk forward monotonically through sampled path segments so loops never jump backwards
    let matchedS = 0.025;
    for (let i = 0; i < state.samples.length; i++) {
      if (state.samples[i].y <= focalYInBoard) {
        matchedS = state.samples[i].s;
      }
    }
    state.scrollTarget = Math.min(1.0, Math.max(0.025, matchedS));
  }

  function applyFillProgress(s) {
    const clamped = Math.min(1.0, Math.max(0.0, s));
    const dashOffset = state.totalLength * (1.0 - clamped);
    pathHoney.style.strokeDashoffset = dashOffset.toFixed(1);
    if (pathSheen) {
      pathSheen.style.strokeDashoffset = dashOffset.toFixed(1);
    }

    // Reveal tapered honey fill inside bottom nozzle smoothly as honey arrives at Stage 05 exit
    if (outletHoneyFill) {
      const nozzleAlpha = Math.max(0, Math.min(1, (clamped - 0.945) / 0.045));
      outletHoneyFill.style.opacity = nozzleAlpha.toFixed(3);
    }

    // Broadcast active editorial stage cleanly based on focal viewport intersection
    const vpMid = window.innerHeight * 0.5;
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
      state.scrollSmooth += diff * 0.24;
      applyFillProgress(state.scrollSmooth);
    }
  }

  window.addEventListener('scroll', updateScrollTarget, { passive: true });
  window.addEventListener('resize', rebuildPathGeometry);
  window.addEventListener('honey:rebuild-path', rebuildPathGeometry);

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => rebuildPathGeometry());
    ro.observe(board);
  }

  const tankEl = document.getElementById('honeyTankImg');
  if (tankEl && !tankEl.complete) {
    tankEl.addEventListener('load', rebuildPathGeometry, { once: true });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(rebuildPathGeometry);
  }

  rebuildPathGeometry();
  tick();
})();
