/* ============================================================
   honey-divider.js — <honey-divider>

   A reusable boundary between two sections that reads as thick,
   viscous honey rather than as a decorative curve. Four rules keep
   it from degenerating into the clichés:

   1. The pool's surface is NOT a sine wave. It is built from a few
      keyed levels of different sizes and blended with smoothstep, so
      the contour is level for a while, rises into a soft bulge,
      levels off again — asymmetric, and never repeating on a
      regular interval.
   2. The pool's underside carries six pendants of deliberately
      unequal length. Two of them shed a droplet; the rest simply
      taper. Nothing is evenly spaced.
   3. Every drip joins the pool through a fillet, and every tip is
      rounded. Sharp corners read as icicles, which is the wrong
      material entirely.
   4. The geometry is computed from the element's measured size, so
      the drops keep their proportions on a 390px phone and a 2560px
      desktop alike. A stretched viewBox would squash the rounded
      tips, which is why this is generated rather than authored.

   Usage:
     <honey-divider></honey-divider>
     <honey-divider honey="#D6861E" honey-lit="#E8A93C" comb></honey-divider>
     <honey-divider flip size="sm"></honey-divider>

   Attributes: honey, honey-lit, honey-deep, flip, comb, size
   ============================================================ */

(() => {
  if (customElements.get('honey-divider')) return;

  const NS = 'http://www.w3.org/2000/svg';
  const n = (v) => (Math.round(v * 100) / 100).toString();
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---- the shape recipe ------------------------------------------
     Keyed levels, in fractions of the band height. Positive = the
     honey rises (smaller y). */
  const TOP = [
    { x: 0.00, y:  0.42 }, { x: 0.13, y: -0.88 }, { x: 0.29, y:  0.24 },
    { x: 0.44, y: -0.34 }, { x: 0.61, y:  0.92 }, { x: 0.78, y: -0.52 },
    { x: 1.00, y:  0.18 },
  ];
  const SHOULDER = [
    { x: 0.00, y:  0.20 }, { x: 0.18, y: -0.30 }, { x: 0.37, y:  0.34 },
    { x: 0.55, y: -0.22 }, { x: 0.74, y:  0.28 }, { x: 1.00, y: -0.16 },
  ];
  /* x = position across the band, w = width multiplier of the drip,
     l = length multiplier, drop = sheds a droplet */
  const DRIPS = [
    { x: 0.085, w: 0.58, l: 0.40, drop: false },
    { x: 0.235, w: 0.84, l: 0.88, drop: true  },
    { x: 0.395, w: 0.46, l: 0.28, drop: false },
    { x: 0.560, w: 0.76, l: 1.00, drop: true  },
    { x: 0.720, w: 0.52, l: 0.56, drop: false },
    { x: 0.880, w: 0.70, l: 0.72, drop: false },
  ];

  /* The pool sits high in the band so its surface can overshoot the
     footage's bottom edge once the hero pulls it up — that overshoot
     is what welds the clip's honey floor to this pool. */
  const TOP_BASE = 0.115, TOP_AMP = 0.044;
  const SH_BASE  = 0.600, SH_AMP  = 0.022;
  const DRIP_MAX = 0.300;

  /* Smoothstep blend between keys: level, rise, level. C1-continuous,
     so the contour has no corners. */
  const level = (u, keys) => {
    if (u <= keys[0].x) return keys[0].y;
    for (let i = 1; i < keys.length; i++) {
      if (u <= keys[i].x) {
        const a = keys[i - 1], b = keys[i];
        const t = (u - a.x) / (b.x - a.x);
        return a.y + (b.y - a.y) * (t * t * (3 - 2 * t));
      }
    }
    return keys[keys.length - 1].y;
  };

  /* ---- colour ----------------------------------------------------- */
  const parseHex = (h) => {
    const s = String(h || '').trim().replace(/^#/, '');
    const v = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
    if (!/^[0-9a-f]{6}$/i.test(v)) return null;
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  };
  const toHex = (rgb) => '#' + rgb.map((c) => clamp(Math.round(c), 0, 255)
    .toString(16).padStart(2, '0')).join('');
  const shade = (hex, amt) => {
    const c = parseHex(hex);
    if (!c) return hex;
    return amt < 0
      ? toHex(c.map((v) => v * (1 + amt)))
      : toHex(c.map((v) => v + (255 - v) * amt));
  };

  /* ---- one drip, as an ordered list of cubic segments -------------
     Coordinates are relative to (centre, shoulder). Traversal runs
     left to right; `rev` walks the identical shape the other way,
     which is what lets the whole outline be emitted clockwise. */
  const dripSegs = (rw, len, h) => ([
    { c1: [-h + rw * 0.55, 0],      c2: [-rw * 1.25, len * 0.12], to: [-rw, len * 0.34] },
    { c1: [-rw * 0.80, len * 0.62], c2: [-rw * 0.60, len * 0.86], to: [-rw * 0.44, len * 0.95] },
    { c1: [-rw * 0.30, len * 1.03], c2: [-rw * 0.14, len * 1.05], to: [0, len * 1.05] },
    { c1: [rw * 0.14, len * 1.05],  c2: [rw * 0.30, len * 1.03],  to: [rw * 0.44, len * 0.95] },
    { c1: [rw * 0.60, len * 0.86],  c2: [rw * 0.80, len * 0.62],  to: [rw, len * 0.34] },
    { c1: [rw * 1.25, len * 0.12],  c2: [h - rw * 0.55, 0],       to: [h, 0] },
  ]);

  const dripPath = (xc, sy, rw, len, rev) => {
    const h = rw * 1.75;                       // fillet reach into the pool
    const segs = dripSegs(rw, len, h);
    const P = (u, v) => `${n(xc + u)} ${n(sy + v)}`;
    let d;
    if (!rev) {
      d = `M${P(-h, 0)}`;
      for (const s of segs) d += `C${P(...s.c1)} ${P(...s.c2)} ${P(...s.to)}`;
      return d;
    }
    d = `M${P(h, 0)}`;
    for (let i = segs.length - 1; i >= 0; i--) {
      const from = i === 0 ? [-h, 0] : segs[i - 1].to;
      d += `C${P(...segs[i].c2)} ${P(...segs[i].c1)} ${P(...from)}`;
    }
    return d;
  };

  const dropletPath = (cx, cy, r) => {
    const top = cy - r * 1.55;
    return `M${n(cx)} ${n(top)}`
      + `Q${n(cx + r * 0.92)} ${n(cy - r * 0.30)} ${n(cx + r)} ${n(cy)}`
      + `Q${n(cx + r * 0.92)} ${n(cy + r * 0.95)} ${n(cx)} ${n(cy + r)}`
      + `Q${n(cx - r * 0.92)} ${n(cy + r * 0.95)} ${n(cx - r)} ${n(cy)}`
      + `Q${n(cx - r * 0.92)} ${n(cy - r * 0.30)} ${n(cx)} ${n(top)}Z`;
  };

  const hexAt = (cx, cy, r) => {
    let d = 'M';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;      // pointy-top
      d += `${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}${i < 5 ? 'L' : ''}`;
    }
    return d + 'Z';
  };

  /* ---- the whole geometry ---------------------------------------- */
  function build(W, H, colors) {
    const topY = (x) => H * (TOP_BASE - TOP_AMP * level(x / W, TOP));
    const shY = (x) => H * (SH_BASE - SH_AMP * level(x / W, SHOULDER));

    const rwBase = clamp(Math.min(W * 0.0105, H * 0.075), 4, 13);
    const spans = DRIPS.map((d) => {
      const rw = rwBase * d.w;
      return { rw, h: rw * 1.75, xc: d.x * W, len: DRIP_MAX * H * d.l, drop: d.drop };
    });

    const step = Math.max(2, W / 500);

    /* --- outline, clockwise from the top-left of the pool --- */
    let d = `M0 ${n(topY(0))}`;
    for (let x = step; x < W; x += step) d += `L${n(x)} ${n(topY(x))}`;
    d += `L${n(W)} ${n(topY(W))}`;
    d += `L${n(W)} ${n(shY(W))}`;                       // right flank

    /* underside, walked right to left */
    let x = W;
    for (let i = spans.length - 1; i >= 0; i--) {
      const s = spans[i];
      const xe = s.xc + s.h, xs = s.xc - s.h;
      if (x > xe) {
        while (x - step > xe) { x -= step; d += `L${n(x)} ${n(shY(x))}`; }
        d += `L${n(xe)} ${n(shY(xe))}`;
        x = xe;
      }
      d += dripPath(s.xc, shY(s.xc), s.rw, s.len, true);
      d += `L${n(xs)} ${n(shY(xs))}`;
      x = xs;
    }
    while (x - step > 0) { x -= step; d += `L${n(x)} ${n(shY(x))}`; }
    d += `L0 ${n(shY(0))}Z`;

    /* --- the gloss along the surface --- */
    let gloss = `M0 ${n(topY(0) + 1)}`;
    for (let gx = step; gx < W; gx += step) gloss += `L${n(gx)} ${n(topY(gx) + 1)}`;
    gloss += `L${n(W)} ${n(topY(W) + 1)}`;

    /* --- droplets shed by the two long pendants --- */
    const dr = clamp(H * 0.018, 1.7, 4.6);
    let drops = '';
    for (const s of spans) {
      if (!s.drop) continue;
      drops += dropletPath(s.xc + s.rw * 0.35, shY(s.xc) + s.len * 1.05 + dr * 2.7, dr);
    }

    /* --- honeycomb, as a seamless two-row pattern tile --- */
    const hr = clamp(H * 0.19, 10, 30);
    const hp = Math.sqrt(3) * hr;
    let tile = '';
    for (const [ox, oy] of [[0, 0], [hp, 0], [hp / 2, hr * 1.5],
                            [hp / 2, hr * -1.5], [0, hr * 3], [hp, hr * 3]]) {
      tile += hexAt(ox, oy, hr);
    }

    const id = 'hd' + (++build.uid);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${n(W)} ${n(H)}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = `
<defs>
  <linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${colors.lit}"/>
    <stop offset=".42" stop-color="${colors.body}"/>
    <stop offset="1" stop-color="${colors.deep}"/>
  </linearGradient>
  <pattern id="${id}-p" width="${n(hp)}" height="${n(hr * 3)}" patternUnits="userSpaceOnUse">
    <path d="${tile}" fill="none" stroke="${colors.lit}" stroke-opacity=".085" stroke-width="1"/>
  </pattern>
  <path id="${id}-s" d="${d}"/>
  <clipPath id="${id}-c"><use href="#${id}-s"/></clipPath>
</defs>
<use href="#${id}-s" fill="url(#${id}-g)"/>
<g clip-path="url(#${id}-c)">
  <rect width="${n(W)}" height="${n(H)}" fill="url(#${id}-p)"/>
</g>
<path d="${gloss}" fill="none" stroke="${colors.lit}" stroke-opacity=".30" stroke-width="1.6"/>
${drops ? `<g fill="url(#${id}-g)">${drops}</g>` : ''}`;
    return svg;
  }
  build.uid = 0;

  class HoneyDivider extends HTMLElement {
    static get observedAttributes() {
      return ['honey', 'honey-lit', 'honey-deep', 'comb', 'size', 'flip'];
    }

    connectedCallback() {
      this.setAttribute('role', 'presentation');
      if (!this._ro) {
        this._ro = new ResizeObserver(() => this._schedule());
        this._ro.observe(this);
      }
      this._render();
    }

    disconnectedCallback() {
      if (this._ro) { this._ro.disconnect(); this._ro = null; }
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
    }

    attributeChangedCallback() {
      if (this.isConnected) this._schedule();
    }

    _schedule() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = 0;
        this._render();
      });
    }

    _render() {
      /* Quantise the inputs: the geometry only needs to be rebuilt when
         the band genuinely changes shape, not on every pixel of a drag. */
      const W = Math.max(320, Math.round(this.clientWidth / 12) * 12);
      const H = Math.max(60, Math.round(this.clientHeight / 2) * 2);
      const body = this.getAttribute('honey') || '#D6861E';
      const lit = this.getAttribute('honey-lit') || shade(body, 0.22);
      const deep = this.getAttribute('honey-deep') || shade(body, -0.30);
      const key = `${W}x${H}|${body}|${lit}|${deep}`;
      if (key === this._key) return;
      this._key = key;

      const svg = build(W, H, { body, lit, deep });
      if (!this.hasAttribute('comb')) {
        const pat = svg.querySelector('pattern');
        if (pat) pat.remove();
      }
      this.replaceChildren(svg);
    }
  }

  customElements.define('honey-divider', HoneyDivider);
})();