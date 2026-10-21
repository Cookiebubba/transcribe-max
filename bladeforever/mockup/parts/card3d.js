/* =====================================================================
   Blade Forever — collectible card (card3d.js)
   window.BF_CARD = { mount(el, member), update(member), destroy() }
   Needs card3d.css. Vanilla JS, no libraries, no network, no images.

   MOTION MODEL
   - The card pivots about its own centre (transform-origin 50% 50%).
   - Pointer ANYWHERE on the page sets a tilt target (max +-MAX_TILT deg),
     lerped toward every frame. Idle: a slow sway (not when reduced-motion).
   - Press-drag anywhere (mouse) or on the card (touch) spins both axes
     freely. On release a damped spring carries the inertia and settles on
     the nearest face-front rest pose. A tap/click on the card (no drag)
     flips it to the back; tap again to flip back. Enter/Space also flips.
   - prefers-reduced-motion: no idle sway, no embers, no inertia (release
     eases back with a critically damped lerp); dragging still works.

   ---------------------------------------------------------------------
   CHARACTER SWAP  (replacing the placeholder with a 3D character)
   ---------------------------------------------------------------------
   The front face has exactly one container for the hero figure:

        <div class="bf-character" data-bf-slot="character">...</div>

   It sits on its own depth plane (translateZ 36) inside the portrait
   window, is 294u x 286u (u = card width / 340), already clipped by the
   arched window, and sits above the scenery and under the frame. To swap:

     var slot = BF_CARD.characterSlot();   // the live .bf-character node
     slot.replaceChildren(myImg);          // <img>, <canvas>, <video> ...
     // or: renderer.setSize(slot.clientWidth, slot.clientHeight);
     //     slot.replaceChildren(renderer.domElement);   // WebGL / three.js

   img/canvas/video children are auto-sized to fill (object-fit: contain).
   Nothing else (frame, plates, hologram, motion) needs to change.
   Listen for `bf-character-slot` on the stage if you need to re-attach
   after update(): it fires with detail:{slot, member} every time the card
   re-renders, and the placeholder is only re-inserted when the slot is
   empty or still holds the placeholder (data-bf-placeholder).
   For live fight poses, the card exposes the tilt each frame as
   `BF_CARD.pose` = {rx, ry, spin, nx, ny} (normalised pointer -1..1) so a
   WebGL scene can aim the character.
   ===================================================================== */
(function () {
  'use strict';

  var MAX_TILT = 13;          // deg, pointer tracking
  var SENS = 0.5;             // deg per px while dragging
  var TILT_LERP = 0.085;      // per 60fps frame
  var SPRING_K = 0.010, SPRING_C = 0.075, VMAX = 38;
  var IDLE_AFTER = 3200;      // ms without pointer before idle sway

  var uidCounter = 0;
  var inst = null;
  var rmQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function wrap180(d) { d = ((d + 180) % 360 + 360) % 360 - 180; return d; }
  var RAD = Math.PI / 180;
  var TIERS = ['ascendant', 'exalted', 'honored', 'tempered', 'footman'];

  /* ---------------- geometry helpers (340 x 476 design grid) ---------------- */
  function rr(x, y, w, h, r) {
    return 'M' + (x + r) + ',' + y + ' H' + (x + w - r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + w) + ',' + (y + r) +
      ' V' + (y + h - r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + w - r) + ',' + (y + h) +
      ' H' + (x + r) + ' A' + r + ',' + r + ' 0 0 1 ' + x + ',' + (y + h - r) +
      ' V' + (y + r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + r) + ',' + y + ' Z';
  }
  // arched window: round top (rt), soft bottom (rb)
  function arch(x0, y0, x1, y1, rt, rb) {
    return 'M' + x0 + ',' + (y1 - rb) + ' V' + (y0 + rt) + ' A' + rt + ',' + rt + ' 0 0 1 ' + (x0 + rt) + ',' + y0 +
      ' H' + (x1 - rt) + ' A' + rt + ',' + rt + ' 0 0 1 ' + x1 + ',' + (y0 + rt) +
      ' V' + (y1 - rb) + ' A' + rb + ',' + rb + ' 0 0 1 ' + (x1 - rb) + ',' + y1 +
      ' H' + (x0 + rb) + ' A' + rb + ',' + rb + ' 0 0 1 ' + x0 + ',' + (y1 - rb) + ' Z';
  }
  var P_WIN = arch(34, 62, 306, 326, 110, 14);       // the opening
  var P_MID = arch(22, 50, 318, 338, 122, 26);       // inlay groove
  var P_RING = arch(10, 38, 330, 350, 134, 38);      // outer edge of window surround

  /* ---------------- thorn crown: original motif ---------------- */
  function thorns(id) {
    var out = '', i, a, cx = 144, cy = 172, R = 134;
    var spec = [[210, .85], [227, .72], [243, .6], [257, .46]];
    for (i = 0; i < spec.length; i++) {
      a = spec[i][0] * RAD;
      var px = cx + R * Math.cos(a), py = cy + R * Math.sin(a), rot = spec[i][0] + 90, s = spec[i][1];
      out += '<use href="#' + id + '-th" transform="translate(' + px.toFixed(1) + ' ' + py.toFixed(1) + ') rotate(' + rot + ') scale(' + s + ')"/>';
    }
    // mirror for the right side
    return '<g>' + out + '</g><g transform="translate(340 0) scale(-1 1)">' + out + '</g>';
  }

  /* ---------------- FRONT frame (sculpted bezel + window surround) ---------------- */
  function frameSVG(id) {
    return '<svg class="bf-frame-svg" viewBox="0 0 340 476" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="' + id + '-m" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="340" y2="476">' +
        '<stop offset="0" style="stop-color:var(--metal-hi)"/><stop offset=".28" style="stop-color:var(--metal-mid)"/>' +
        '<stop offset=".5" style="stop-color:var(--metal-lo)"/><stop offset=".74" style="stop-color:var(--metal-mid)"/>' +
        '<stop offset="1" style="stop-color:var(--metal-lo)"/></linearGradient>' +
      '<linearGradient id="' + id + '-bh" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="340" y2="476">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/>' +
        '<stop offset=".6" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></linearGradient>' +
      '<linearGradient id="' + id + '-bl" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="340" y2="476">' +
        '<stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset=".5" stop-color="#000" stop-opacity=".15"/>' +
        '<stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>' +
      '<radialGradient id="' + id + '-rv" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".85"/>' +
        '<stop offset=".4" style="stop-color:var(--metal-hi)"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></radialGradient>' +
      '<radialGradient id="' + id + '-gem" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".9"/>' +
        '<stop offset=".35" style="stop-color:var(--accent)"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>' +
      '<filter id="' + id + '-gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/>' +
        '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -.7"/></filter>' +
      '<filter id="' + id + '-sf" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
      '<clipPath id="' + id + '-fc"><path clip-rule="evenodd" d="' + rr(0, 0, 340, 476, 20) + ' ' + rr(10, 10, 320, 456, 12) + ' ' + P_RING + ' ' + P_WIN + '"/></clipPath>' +
      '<path id="' + id + '-th" d="M0,0 C4,-13 20,-27 42,-30 C31,-21 24,-11 21,4 C14,8 5,6 0,0 Z"/>' +
      '</defs>' +
      /* bezel + window surround: sculpted metal */
      '<path fill-rule="evenodd" fill="url(#' + id + '-m)" d="' + rr(0, 0, 340, 476, 20) + ' ' + rr(10, 10, 320, 456, 12) + '"/>' +
      '<path fill-rule="evenodd" fill="url(#' + id + '-m)" d="' + P_RING + ' ' + P_WIN + '"/>' +
      '<rect width="340" height="476" filter="url(#' + id + '-gr)" clip-path="url(#' + id + '-fc)" opacity=".16"/>' +
      /* groove + glowing rune filament */
      '<path d="' + P_MID + '" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="5.5"/>' +
      '<path d="' + P_MID + '" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1" transform="translate(0 2.6)"/>' +
      '<path d="' + P_MID + '" fill="none" style="stroke:var(--accent);opacity:calc(.3 + var(--i) * .7);filter:drop-shadow(0 0 3px var(--accent))" stroke-width="1.5" stroke-dasharray="20 5 3 5" stroke-linecap="round"/>' +
      /* thorn crown */
      '<g style="fill:color-mix(in srgb, var(--gold) calc(20% + var(--i) * 25%), var(--metal-mid))" stroke="#000" stroke-opacity=".6" stroke-width="1.2" stroke-linejoin="round">' + thorns(id) + '</g>' +
      /* bevels */
      '<path d="' + rr(.9, .9, 338.2, 474.2, 19.2) + '" fill="none" stroke="url(#' + id + '-bh)" stroke-width="1.8"/>' +
      '<path d="' + rr(10, 10, 320, 456, 12) + '" fill="none" stroke="url(#' + id + '-bl)" stroke-width="2.2"/>' +
      '<path d="' + P_RING + '" fill="none" stroke="url(#' + id + '-bh)" stroke-width="2.2"/>' +
      '<path d="' + P_WIN + '" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="7" filter="url(#' + id + '-sf)"/>' +
      '<path d="' + P_WIN + '" fill="none" stroke="url(#' + id + '-bl)" stroke-width="3"/>' +
      /* rivets */
      '<g stroke="#000" stroke-opacity=".6" stroke-width="1">' +
        [[22, 22], [318, 22], [22, 454], [318, 454], [24, 342], [316, 342]].map(function (p) {
          return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.2" fill="url(#' + id + '-rv)"/>';
        }).join('') + '</g>' +
      /* bottom keystone gem */
      '<g transform="translate(170 350)"><rect x="-17" y="-6" width="34" height="12" rx="6" style="fill:url(#' + id + '-m)" stroke="#000" stroke-opacity=".5"/>' +
      '<rect x="-9" y="-4" width="18" height="8" rx="4" fill="url(#' + id + '-gem)" style="filter:drop-shadow(0 0 4px var(--accent))"/></g>' +
      '</svg>';
  }

  /* ---------------- scenery (own depth planes) ---------------- */
  function rng(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  function sceneFarSVG(id) {
    var r = rng(41), stars = '', i;
    for (i = 0; i < 34; i++) {
      stars += '<circle cx="' + (r() * 294).toFixed(1) + '" cy="' + (r() * 150).toFixed(1) + '" r="' + (0.4 + r() * 1.1).toFixed(2) + '" fill="#fff" opacity="' + (0.25 + r() * 0.6).toFixed(2) + '"/>';
    }
    return '<svg viewBox="0 0 294 286" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + '-sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" style="stop-color:var(--void)"/>' +
        '<stop offset=".55" style="stop-color:color-mix(in srgb, var(--accent) calc(var(--i) * 12% + 4%), var(--deep))"/>' +
        '<stop offset="1" style="stop-color:color-mix(in srgb, var(--accent) calc(var(--i) * 46% + 8%), var(--deep))"/></linearGradient>' +
      '<radialGradient id="' + id + '-moon" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.75"/><stop offset=".5" style="stop-color:var(--accent);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></radialGradient>' +
      '</defs>' +
      '<rect width="294" height="286" fill="url(#' + id + '-sky)"/>' + stars +
      '<circle cx="147" cy="118" r="104" fill="url(#' + id + '-moon)"/>' +
      '<circle cx="147" cy="118" r="34" style="fill:color-mix(in srgb, var(--accent) calc(var(--i) * 30% + 10%), var(--parch))" opacity=".92"/>' +
      '<circle cx="158" cy="110" r="30" style="fill:color-mix(in srgb, var(--accent) 12%, var(--deep))" opacity=".35"/>' +
      /* far ridge + keep silhouette */
      '<path d="M0,196 L26,176 L52,190 L84,160 L112,182 L140,168 L176,190 L210,156 L246,184 L274,170 L294,184 V286 H0Z" style="fill:color-mix(in srgb, var(--mist) 80%, var(--accent) 6%)" opacity=".9"/>' +
      '<path d="M96,206 V168 h10 v-12 h8 v12 h8 v-18 h8 v18 h8 v-12 h8 v12 h10 V206Z M168,206 V176 h8 v-8 h6 v8 h8 v-14 h6 v14 h8 V206Z" style="fill:var(--deep)" stroke="var(--void)" stroke-linejoin="round" stroke-width="1.5" opacity=".95"/>' +
      '<path d="M0,226 C40,208 70,222 110,214 C160,204 200,226 240,214 C262,208 280,212 294,218 V286 H0Z" style="fill:var(--deep)"/>' +
      '</svg>';
  }

  function sceneNearSVG(id) {
    return '<svg viewBox="0 0 294 286" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + '-st" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--void)"/><stop offset="1" style="stop-color:var(--mist)"/></linearGradient>' +
      '<radialGradient id="' + id + '-fl" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--ember);stop-opacity:.9"/><stop offset="1" style="stop-color:var(--ember);stop-opacity:0"/></radialGradient>' +
      '</defs>' +
      /* ruined pillars + broken arch, left and right */
      '<g fill="url(#' + id + '-st)" stroke="var(--void)" stroke-width="1.5" stroke-linejoin="round">' +
        '<path d="M-6,286 V96 H-6 L38,96 V286Z"/><rect x="-8" y="84" width="52" height="14" rx="5"/>' +
        '<path d="M44,92 C70,84 92,102 100,132 L86,134 C80,114 66,104 44,108Z"/>' +
        '<path d="M300,286 V80 H256 V286Z"/><rect x="250" y="68" width="52" height="14" rx="5"/>' +
        '<path d="M250,76 C224,68 202,86 194,116 L208,118 C214,98 228,88 250,92Z"/>' +
      '</g>' +
      '<g style="fill:var(--void)" opacity=".6"><path d="M34,286 L34,226 L44,222 L52,232 L60,224 L62,286Z"/><path d="M232,286 L234,236 L244,230 L252,240 L258,286Z"/></g>' +
      /* braziers: warm light grows with tier */
      '<g style="opacity:calc(.35 + var(--i) * .65)">' +
        '<circle cx="22" cy="206" r="30" fill="url(#' + id + '-fl)"/><circle cx="272" cy="198" r="30" fill="url(#' + id + '-fl)"/>' +
        '<path d="M16,214 q6,-18 6,-18 q6,10 6,18z" style="fill:var(--ember)"/><path d="M266,206 q6,-18 6,-18 q6,10 6,18z" style="fill:var(--ember)"/></g>' +
      /* ground */
      '<path d="M0,262 C50,250 90,262 147,258 C200,254 250,262 294,252 V286 H0Z" style="fill:var(--void)" opacity=".92"/>' +
      '<g style="fill:var(--mist)" opacity=".7"><ellipse cx="60" cy="268" rx="14" ry="4"/><ellipse cx="236" cy="272" rx="18" ry="4.5"/><ellipse cx="190" cy="266" rx="8" ry="2.6"/></g>' +
      '</svg>';
  }

  /* ---------------- PLACEHOLDER CHARACTER: original standing warrior ----------------
     Hooded helm, tattered cloak, sword planted point-down, both hands on the pommel.
     Authored in the 294 x 286 slot grid; feet on y=268. Replace via the slot. */
  function placeholderSVG(id) {
    return '<svg data-bf-placeholder viewBox="0 0 294 286" preserveAspectRatio="xMidYMax meet" aria-label="Placeholder warrior silhouette" role="img"><defs>' +
      '<linearGradient id="' + id + '-cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--mist)"/><stop offset=".55" style="stop-color:var(--deep)"/><stop offset="1" style="stop-color:var(--void)"/></linearGradient>' +
      '<linearGradient id="' + id + '-cp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--raise)"/><stop offset="1" style="stop-color:var(--void)"/></linearGradient>' +
      '<linearGradient id="' + id + '-bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--ink-faint)"/><stop offset=".5" style="stop-color:var(--ink)"/><stop offset="1" style="stop-color:var(--ink-faint)"/></linearGradient>' +
      '</defs>' +
      '<g stroke-linejoin="round" stroke-linecap="round">' +
      /* trailing cape behind */
      '<path d="M147,90 C104,96 80,160 62,268 Q92,278 118,270 Q147,280 176,270 Q204,278 232,268 C214,160 190,96 147,90Z" fill="url(#' + id + '-cp)" style="stroke:var(--accent);stroke-opacity:.35" stroke-width="1"/>' +
      /* cloak */
      '<path d="M121,104 C100,122 96,196 86,268 Q116,276 147,270 Q178,276 208,268 C198,196 194,122 173,104 Q147,94 121,104Z" fill="url(#' + id + '-cl)" style="stroke:var(--accent);stroke-opacity:.55" stroke-width="1.2"/>' +
      /* ragged hem */
      '<path d="M86,268 l9,-9 l8,10 l9,-11 l9,11 l9,-9 l9,10 l9,-10 l9,10 l9,-11 l9,11 l8,-9 l9,10 l9,-11 l8,10 l6,-9 L208,268Z" fill="var(--void)" opacity=".85"/>' +
      /* arms reaching to the hilt */
      '<path d="M112,112 C98,138 112,160 138,160 L146,150 C126,146 120,132 128,114Z" fill="url(#' + id + '-cl)" style="stroke:var(--accent);stroke-opacity:.4" stroke-width="1"/>' +
      '<path d="M182,112 C196,138 182,160 156,160 L148,150 C168,146 174,132 166,114Z" fill="url(#' + id + '-cl)" style="stroke:var(--accent);stroke-opacity:.4" stroke-width="1"/>' +
      /* pauldrons */
      '<ellipse cx="117" cy="110" rx="21" ry="12" transform="rotate(-14 117 110)" fill="var(--deep)" style="stroke:var(--accent);stroke-opacity:.6" stroke-width="1.4"/>' +
      '<ellipse cx="177" cy="110" rx="21" ry="12" transform="rotate(14 177 110)" fill="var(--deep)" style="stroke:var(--accent);stroke-opacity:.6" stroke-width="1.4"/>' +
      /* belt */
      '<path d="M104,176 Q147,190 190,176 L191,184 Q147,198 103,184Z" fill="var(--void)" style="stroke:var(--accent);stroke-opacity:.35" stroke-width="1"/>' +
      '<rect x="141" y="178" width="12" height="11" rx="3" style="fill:var(--accent)" opacity=".8"/>' +
      /* helm, plume, visor glow */
      '<path d="M131,86 Q131,60 147,58 Q163,60 163,86 L160,100 Q147,106 134,100Z" fill="var(--deep)" style="stroke:var(--accent);stroke-opacity:.7" stroke-width="1.4"/>' +
      '<path d="M147,58 Q166,34 190,44 Q168,48 158,66Z" fill="var(--blood)" opacity=".85"/>' +
      '<rect x="134" y="79" width="26" height="4" rx="2" style="fill:var(--accent);filter:drop-shadow(0 0 4px var(--accent))"/>' +
      /* sword, point down */
      '<path d="M141,158 L153,158 L151,258 L147,270 L143,258Z" fill="url(#' + id + '-bd)" stroke="var(--void)" stroke-width="1.2"/>' +
      '<path d="M147,162 V254" style="stroke:var(--accent);filter:drop-shadow(0 0 3px var(--accent))" stroke-width="1.4" opacity=".75"/>' +
      '<rect x="122" y="150" width="50" height="8" rx="4" style="fill:var(--gold)" stroke="var(--void)" stroke-width="1.2"/>' +
      '<rect x="144.5" y="132" width="5" height="19" rx="2.5" fill="var(--raise)" stroke="var(--void)"/>' +
      '<circle cx="147" cy="128" r="6" style="fill:var(--gold)" stroke="var(--void)" stroke-width="1.2"/>' +
      '<circle cx="147" cy="142" r="6.5" fill="var(--void)"/>' +
      /* boots */
      '<ellipse cx="126" cy="268" rx="14" ry="5" fill="var(--void)"/><ellipse cx="168" cy="268" rx="14" ry="5" fill="var(--void)"/>' +
      '</g></svg>';
  }

  /* ---------------- BACK face ---------------- */
  function sigilSVG(id, initials) {
    var ticks = '', i, a;
    for (i = 0; i < 48; i++) {
      a = i * 7.5 * RAD;
      var big = i % 4 === 0, r1 = 96, r2 = big ? 88 : 92;
      ticks += '<line x1="' + (170 + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (176 + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (170 + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (176 + r2 * Math.sin(a)).toFixed(1) + '" stroke-width="' + (big ? 1.6 : .8) + '"/>';
    }
    return '<svg class="bf-back-svg" viewBox="0 0 340 476" aria-hidden="true"><defs>' +
      '<radialGradient id="' + id + '-bg" cx=".5" cy=".37" r=".6"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.24"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></radialGradient>' +
      '<linearGradient id="' + id + '-sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--ink-faint)"/><stop offset=".5" style="stop-color:var(--ink)"/><stop offset="1" style="stop-color:var(--ink-faint)"/></linearGradient>' +
      '</defs>' +
      '<rect x="22" y="22" width="296" height="432" rx="14" fill="url(#' + id + '-bg)"/>' +
      '<g style="stroke:var(--accent);opacity:calc(.4 + var(--i) * .55)" fill="none">' +
        '<circle cx="170" cy="176" r="100" stroke-width="1.2" stroke-dasharray="22 5 3 5"/>' +
        '<circle cx="170" cy="176" r="74" stroke-width="1"/>' + ticks +
        '<circle cx="170" cy="176" r="40" stroke-width="1.4"/></g>' +
      /* sword behind the initials */
      '<g stroke-linejoin="round"><path d="M170,40 L177,62 L176,238 L164,238 L163,62Z" fill="url(#' + id + '-sw)" opacity=".92" stroke="#000" stroke-opacity=".5"/>' +
      '<rect x="132" y="236" width="76" height="9" rx="4.5" style="fill:var(--gold)" stroke="#000" stroke-opacity=".5"/>' +
      '<rect x="167.5" y="245" width="5" height="22" rx="2.5" style="fill:var(--raise)"/><circle cx="170" cy="273" r="6.5" style="fill:var(--gold)"/></g>' +
      '<circle cx="170" cy="176" r="36" style="fill:var(--deep)" stroke="#000" stroke-opacity=".6" stroke-width="2"/>' +
      '<circle cx="170" cy="176" r="33" fill="none" style="stroke:var(--accent)" stroke-width="1.2" opacity=".8"/>' +
      '</svg>';
  }

  function backFrameSVG(id) {
    return '<svg class="bf-back-svg" viewBox="0 0 340 476" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + '-bm" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="340" y2="476">' +
        '<stop offset="0" style="stop-color:var(--metal-hi)"/><stop offset=".3" style="stop-color:var(--metal-mid)"/><stop offset=".55" style="stop-color:var(--metal-lo)"/><stop offset="1" style="stop-color:var(--metal-mid)"/></linearGradient>' +
      '<linearGradient id="' + id + '-bb" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="340" y2="476"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>' +
      '</defs>' +
      '<path fill-rule="evenodd" fill="url(#' + id + '-bm)" d="' + rr(0, 0, 340, 476, 20) + ' ' + rr(14, 14, 312, 448, 12) + '"/>' +
      '<path d="' + rr(.9, .9, 338.2, 474.2, 19.2) + '" fill="none" stroke="url(#' + id + '-bb)" stroke-width="1.8"/>' +
      '<path d="' + rr(14, 14, 312, 448, 12) + '" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2.4"/>' +
      '<path d="' + rr(7, 7, 326, 462, 14) + '" fill="none" style="stroke:var(--accent);opacity:calc(.25 + var(--i) * .7);filter:drop-shadow(0 0 3px var(--accent))" stroke-width="1.2" stroke-dasharray="18 5 3 5" stroke-linecap="round"/>' +
      [[26, 26], [314, 26], [26, 450], [314, 450]].map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.6" style="fill:var(--metal-hi)" stroke="#000" stroke-opacity=".6"/>';
      }).join('') +
      '</svg>';
  }

  /* ---------------- build / render ---------------- */
  function fmtDate(d) { return d ? String(d) : '-'; }
  function num(v) { return (v == null || isNaN(v)) ? '-' : Number(v).toLocaleString('en-US'); }

  function renderFront(m, id) {
    var stats = m.stats || {}, keys = ['MIG', 'VIG', 'INS', 'RES'];
    var name = m.name || (m.handle || '').replace(/^@/, '') || 'Unknown';
    var fs = clamp(300 / (name.length * 0.6), 13, 21);
    var rank = m.rank == null ? '-' : m.rank;
    var tier = TIERS.indexOf(m.tier) < 0 ? 'footman' : m.tier;
    return '' +
      '<div class="bf-plane" style="--z:6"><div class="bf-win">' + sceneFarSVG(id + 'a') + '</div></div>' +
      '<div class="bf-plane" style="--z:20"><div class="bf-win">' + sceneNearSVG(id + 'b') + '</div></div>' +
      '<div class="bf-plane" style="--z:36"><div class="bf-win"><div class="bf-character" data-bf-slot="character">' + placeholderSVG(id + 'c') + '</div></div></div>' +
      '<div class="bf-plane" style="--z:46"><div class="bf-win"><div class="bf-fog"></div></div></div>' +
      '<div class="bf-plane" style="--z:56">' + frameSVG(id + 'f') + '</div>' +
      '<div class="bf-plane" style="--z:60"><div class="bf-rim"></div></div>' +
      '<div class="bf-plane bf-motes-plane" style="--z:64"><div class="bf-motes"></div></div>' +
      '<div class="bf-plane" style="--z:74">' +
        '<div class="bf-pill"><i></i>' + esc(tier) + '</div>' +
        '<div class="bf-lv"><span>LV</span><b>' + esc(m.level == null ? '-' : m.level) + '</b></div>' +
        '<div class="bf-medal' + (String(rank).length > 2 ? ' is-long' : '') + '"><b><small>#</small>' + esc(rank) + '</b></div>' +
        '<div class="bf-id"><h2 class="bf-name" style="font-size:calc(var(--u) * ' + fs.toFixed(1) + ')">' + esc(name) + '</h2>' +
          '<p class="bf-title">' + esc(m.title || '') + '</p>' +
          '<p class="bf-sub">' + esc(m.cls || '') + '<em>/</em>' + esc(m.weapon || '') + '</p></div>' +
      '</div>' +
      '<div class="bf-plane" style="--z:84"><div class="bf-stats">' +
        keys.map(function (k) {
          var v = clamp(Number(stats[k]) || 0, 0, 99);
          return '<div class="bf-stat"><span>' + k + '</span><b>' + v + '</b><u style="--w:' + (v / 99 * 100).toFixed(1) + '%"></u></div>';
        }).join('') + '</div></div>' +
      '<div class="bf-plane" style="--z:92"><div class="bf-holo"></div></div>';
  }

  function renderBack(m, id) {
    var c = m.chat || {}, h = m.hive || {};
    var name = m.name || (m.handle || '').replace(/^@/, '') || 'Unknown';
    return '' +
      '<div class="bf-plane" style="--z:14">' + sigilSVG(id + 's', m.initials || name.slice(0, 2).toUpperCase()) + '</div>' +
      '<div class="bf-plane" style="--z:30">' + backFrameSVG(id + 'k') + '</div>' +
      '<div class="bf-plane" style="--z:34"><div class="bf-rim"></div></div>' +
      '<div class="bf-plane" style="--z:44">' +
        '<div class="bf-b-word">Blade Forever</div>' +
        '<div class="bf-b-ini">' + esc(m.initials || name.slice(0, 2).toUpperCase()) + '</div>' +
        '<div class="bf-b-id"><h3>' + esc(m.handle || name) + '</h3><p>Sworn ' + esc(fmtDate(c.firstSeen)) + ' &middot; seen ' + esc(fmtDate(c.lastSeen)) + '</p></div>' +
        '<div class="bf-b-grid">' +
          '<div class="bf-b-cell"><span>Messages</span><b>' + num(c.messages) + '</b></div>' +
          '<div class="bf-b-cell"><span>Streams</span><b>' + num(c.streams) + '</b></div>' +
          '<div class="bf-b-cell"><span>Streak</span><b>' + num(c.streak) + '</b></div>' +
          '<div class="bf-b-cell"><span>Hive used</span><b>' + num(h.used) + '/' + num(h.suggestions) + '</b></div>' +
        '</div>' +
        '<div class="bf-b-foot">' + esc(m.tier || '') + ' &middot; rank ' + esc(m.rank == null ? '-' : m.rank) + '</div>' +
      '</div>' +
      '<div class="bf-plane" style="--z:56"><div class="bf-holo"></div></div>';
  }

  function build(member) {
    var id = 'bf' + (++uidCounter);
    var stage = document.createElement('div');
    stage.className = 'bf-stage';
    stage.tabIndex = 0;
    stage.setAttribute('role', 'img');
    stage.innerHTML =
      '<div class="bf-shadow"></div>' +
      '<div class="bf-card">' +
        '<div class="bf-slabs"></div>' +
        '<div class="bf-plane bf-corewrap" style="--z:0;transform:none"><div class="bf-core"></div></div>' +
        '<div class="bf-face bf-front"><div class="bf-plane" style="--z:0"><div class="bf-glass"></div></div><div class="bf-front-in" style="display:contents"></div></div>' +
        '<div class="bf-face bf-back"><div class="bf-plane" style="--z:0"><div class="bf-glass"></div></div><div class="bf-back-in" style="display:contents"></div></div>' +
      '</div>';
    var slabs = stage.querySelector('.bf-slabs');
    slabs.style.cssText = 'display:contents';
    var html = '', z;
    for (z = -3; z <= 3.01; z += 0.75) html += '<div class="bf-slab" style="--zz:' + z.toFixed(2) + '"></div>';
    slabs.innerHTML = html;
    return { id: id, stage: stage, card: stage.querySelector('.bf-card'), shadow: stage.querySelector('.bf-shadow'),
      front: stage.querySelector('.bf-front-in'), back: stage.querySelector('.bf-back-in') };
  }

  function render(I, member) {
    var m = member || {};
    var tier = TIERS.indexOf(m.tier) < 0 ? 'footman' : m.tier;
    var slot = I.front.querySelector('.bf-character');
    var keep = null;
    // keep a swapped-in character (anything that is not our placeholder) across updates
    if (slot && slot.firstElementChild && !slot.firstElementChild.hasAttribute('data-bf-placeholder')) {
      keep = Array.prototype.slice.call(slot.childNodes);
    }
    I.card.setAttribute('data-tier', tier);
    I.stage.setAttribute('aria-label', (m.name || m.handle || 'Member') + ', ' + tier + ' tier, rank ' + (m.rank == null ? 'unranked' : m.rank) + ', level ' + (m.level == null ? '?' : m.level));
    I.front.innerHTML = renderFront(m, I.id);
    I.back.innerHTML = renderBack(m, I.id);
    if (keep) {
      slot = I.front.querySelector('.bf-character');
      slot.replaceChildren.apply(slot, keep);
    }
    I.member = m;
    makeMotes(I, tier);
    var evt;
    try { evt = new CustomEvent('bf-character-slot', { detail: { slot: I.front.querySelector('.bf-character'), member: m } }); I.stage.dispatchEvent(evt); } catch (e) { /* old browsers */ }
  }

  function makeMotes(I, tier) {
    var host = I.front.querySelector('.bf-motes');
    if (!host || tier !== 'ascendant' || I.reduced) return;
    var h = '', i, r = Math.random;
    for (i = 0; i < 22; i++) {
      h += '<span class="bf-mote" style="--l:' + (6 + r() * 88).toFixed(1) + '%;--s:' + (1.8 + r() * 3.4).toFixed(1) +
        ';--d:' + (5 + r() * 6).toFixed(1) + 's;--dl:' + (-r() * 11).toFixed(1) + 's;--dx:calc(var(--u) * ' + ((r() - 0.5) * 90).toFixed(0) + ')"></span>';
    }
    host.innerHTML = h;
  }

  /* ---------------- interaction + physics ---------------- */
  function start(I) {
    var S = I.S = {
      tx: 0, ty: 0,          // tilt targets (deg)
      cx: 0, cy: 0,          // tilt current
      sx: 0, sy: 0,          // spin angles
      vx: 0, vy: 0,          // spin velocities (deg / 60fps frame)
      rx: 0, ry: 0,          // spin rest poses
      flipped: false, dragging: false, pid: null,
      lx: 0, ly: 0, lt: 0, down: null, moved: 0, lastPtr: -1e9, nx: 0, ny: 0
    };
    I.reduced = !!(rmQuery && rmQuery.matches);
    I.last = 0;

    function rect() { return I.stage.getBoundingClientRect(); }

    function onMove(e) {
      var r = rect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var vw = window.innerWidth || 1, vh = window.innerHeight || 1;
      if (e.pointerType !== 'touch' || S.dragging) {
        S.nx = clamp((e.clientX - cx) / (vw * 0.5), -1, 1);
        S.ny = clamp((e.clientY - cy) / (vh * 0.5), -1, 1);
        S.ty = S.nx * MAX_TILT; S.tx = -S.ny * MAX_TILT;
        S.lastPtr = performance.now();
      }
      if (S.dragging && e.pointerId === S.pid) {
        var now = performance.now(), dx = e.clientX - S.lx, dy = e.clientY - S.ly;
        var dt = Math.max(1, now - S.lt) / 16.667;
        S.sy += dx * SENS; S.sx -= dy * SENS;
        S.vy += ((dx * SENS) / dt - S.vy) * 0.5;
        S.vx += ((-dy * SENS) / dt - S.vx) * 0.5;
        S.moved += Math.abs(dx) + Math.abs(dy);
        S.lx = e.clientX; S.ly = e.clientY; S.lt = now;
        if (e.cancelable && e.pointerType !== 'mouse') e.preventDefault();
      }
    }
    function interactive(t) {
      return t && t.closest && t.closest('a, button, input, select, textarea, label, [contenteditable], [data-bf-nodrag]');
    }
    function onDown(e) {
      if (S.dragging || (e.button != null && e.button !== 0)) return;
      var inside = I.stage.contains(e.target);
      if (!inside && (interactive(e.target) || e.pointerType === 'touch')) return;
      S.dragging = true; S.pid = e.pointerId; S.lx = e.clientX; S.ly = e.clientY; S.lt = performance.now();
      S.moved = 0; S.down = inside; S.vx = S.vy = 0;
      document.documentElement.classList.add('bf-dragging');
      onMove(e);
    }
    function onUp(e) {
      if (!S.dragging || (e.pointerId != null && e.pointerId !== S.pid)) return;
      S.dragging = false;
      document.documentElement.classList.remove('bf-dragging');
      var idle = performance.now() - S.lt;
      if (idle > 90) { S.vx = 0; S.vy = 0; }
      if (S.down && S.moved < 6 && e.type === 'pointerup') { toggleFlip(); return; }
      if (I.reduced) { S.vx = S.vy = 0; }
      S.vx = clamp(S.vx, -VMAX, VMAX); S.vy = clamp(S.vy, -VMAX, VMAX);
      var base = S.flipped ? 180 : 0;
      // project where the inertia would carry us, then pick the nearest face-front pose
      S.ry = base + 360 * Math.round((S.sy + S.vy * 5.5 - base) / 360);
      S.rx = 360 * Math.round((S.sx + S.vx * 5.5) / 360);
    }
    function toggleFlip() {
      S.flipped = !S.flipped;
      var base = S.flipped ? 180 : 0;
      S.ry = base + 360 * Math.round((S.sy - base) / 360);
      S.rx = 360 * Math.round(S.sx / 360);
      // a flip is a quick whip of velocity toward the new pose
      if (!I.reduced) S.vy += (S.ry - S.sy) * 0.07;
    }
    function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFlip(); }
      else if (e.key === 'ArrowLeft') { S.vy -= 9; S.ry = 360 * Math.round((S.sy - 90) / 360); }
      else if (e.key === 'ArrowRight') { S.vy += 9; S.ry = 360 * Math.round((S.sy + 90) / 360); }
    }
    function onLeave() { S.lastPtr = performance.now() - IDLE_AFTER + 600; }
    function onSel(e) { if (S.dragging) e.preventDefault(); }
    function onRM() { I.reduced = !!rmQuery.matches; if (I.reduced) I.front.querySelectorAll('.bf-motes').forEach(function (n) { n.innerHTML = ''; }); else makeMotes(I, I.card.getAttribute('data-tier')); }

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('blur', onUp);
    document.addEventListener('selectstart', onSel);
    document.documentElement.addEventListener('pointerleave', onLeave);
    I.stage.addEventListener('keydown', onKey);
    if (rmQuery && rmQuery.addEventListener) rmQuery.addEventListener('change', onRM);
    I.off = function () {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('blur', onUp);
      document.removeEventListener('selectstart', onSel);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (rmQuery && rmQuery.removeEventListener) rmQuery.removeEventListener('change', onRM);
      document.documentElement.classList.remove('bf-dragging');
    };

    var lastSig = '';
    function tick(now) {
      I.raf = requestAnimationFrame(tick);
      var dt = I.last ? clamp((now - I.last) / 16.667, 0.2, 3) : 1;
      I.last = now;

      // idle sway when the pointer has been quiet
      var tx = S.tx, ty = S.ty;
      if (!I.reduced && now - S.lastPtr > IDLE_AFTER) {
        var t = now / 1000;
        ty = Math.sin(t * 0.55) * 7; tx = Math.cos(t * 0.41) * 4.5;
      }
      var k = 1 - Math.pow(1 - TILT_LERP, dt);
      S.cx += (ty - S.cx) * k;
      S.cy += (tx - S.cy) * k;

      if (!S.dragging) {
        if (I.reduced) {
          var kr = 1 - Math.pow(1 - 0.16, dt);
          S.sy += (S.ry - S.sy) * kr; S.sx += (S.rx - S.sx) * kr;
        } else {
          S.vy += (-SPRING_K * (S.sy - S.ry) - SPRING_C * S.vy) * dt;
          S.vx += (-SPRING_K * (S.sx - S.rx) - SPRING_C * S.vx) * dt;
          S.sy += S.vy * dt; S.sx += S.vx * dt;
        }
      }

      var ry = S.cx + S.sy, rx = S.cy + S.sx;
      var fy = wrap180(ry), fx = wrap180(rx), by = wrap180(ry - 180);
      var sig = ry.toFixed(2) + '|' + rx.toFixed(2);
      if (sig === lastSig) return;
      lastSig = sig;

      var c = I.card.style;
      I.card.style.transform = 'rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
      var sinY = Math.sin(fy * RAD), sinX = Math.sin(fx * RAD), sinB = Math.sin(by * RAD);
      c.setProperty('--mx', (50 + sinY * 62).toFixed(1) + '%');
      c.setProperty('--my', (50 - sinX * 62).toFixed(1) + '%');
      c.setProperty('--bmx', (50 + sinB * 62).toFixed(1) + '%');
      c.setProperty('--bmy', (50 - sinX * 62).toFixed(1) + '%');
      c.setProperty('--ang', (ry * 0.6 + rx * 0.3).toFixed(1));
      var ss = I.shadow.style, face = Math.abs(Math.cos(fy * RAD) * Math.cos(fx * RAD));
      ss.setProperty('--sx', (-sinY * 40).toFixed(1) + 'px');
      ss.setProperty('--sy', (sinX * 14).toFixed(1) + 'px');
      ss.setProperty('--ss', (0.7 + 0.3 * face).toFixed(3));
      ss.setProperty('--so', (0.45 + 0.4 * face).toFixed(3));
      BF_CARD.pose = { rx: rx, ry: ry, spin: S.sy, nx: S.nx, ny: S.ny };
    }
    I.raf = requestAnimationFrame(tick);
  }

  /* ---------------- public API ---------------- */
  var BF_CARD = {
    pose: { rx: 0, ry: 0, spin: 0, nx: 0, ny: 0 },
    mount: function (el, member) {
      if (!el) throw new Error('BF_CARD.mount: element required');
      if (inst) BF_CARD.destroy();
      var I = build(member);
      inst = I;
      I.reduced = !!(rmQuery && rmQuery.matches);
      render(I, member);
      el.appendChild(I.stage);
      I.host = el;
      start(I);
      return I.stage;
    },
    update: function (member) {
      if (!inst) return;
      render(inst, member);
    },
    destroy: function () {
      if (!inst) return;
      cancelAnimationFrame(inst.raf);
      if (inst.off) inst.off();
      if (inst.stage.parentNode) inst.stage.parentNode.removeChild(inst.stage);
      inst = null;
    },
    /* the live container to drop a 3D character / canvas / img into */
    characterSlot: function () { return inst ? inst.front.querySelector('.bf-character') : null; }
  };
  window.BF_CARD = BF_CARD;
})();
