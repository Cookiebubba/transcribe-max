/* =====================================================================
   Blade Forever — card window scene (scene.js)
   window.BF_SCENE = { presetFor(member), supported(), create(canvas, preset, opts),
                       setQuality(q), getQuality(), PRESETS, DEFAULT }
   Raw WebGL 1 + one GLSL fragment shader. No libraries, no network, no images.

   WHAT IT IS
   The front window of the card is a portal into a static 3D scene. The
   scene is a signed-distance field raymarched in the fragment shader and
   lit by exactly ONE point light (the lantern): inverse-square falloff,
   soft shadows, ambient occlusion, GGX specular, height fog with analytic
   in-scattering around the light, and glossy reflections of that glow on
   wet stone and metal. A faint non-directional ambient term keeps shadows
   off pure black; it is not a light.

   PORTAL PROJECTION
   The canvas IS the window. In scene space the window is a rectangle on
   the plane z = 0, centred at (0, eyeHeight, 0), uWinH half-size. Every
   pixel is a point on that rectangle; its ray starts at the virtual eye
   and passes through that point (off-axis projection), and marching starts
   at the window plane so nothing can render in front of the glass.
   The eye sits at distance D in front of the window. Its offset follows
   the card pose: the viewer direction in card space is
       v = (-cos rx * sin ry, -sin rx, cos rx * cos ry)
   (the inverse of the card's CSS rotateX(rx) rotateY(ry)), and the eye is
   placed at window centre + (D*k*v.x, D*k*v.y, D), k = preset parallax.
   At pose 0 the eye is dead centre and the view is the straight-on
   painting. Points on the window plane never move relative to the frame;
   deeper points move further with the eye, exactly like a real window.

   RENDERING POLICY
   Nothing in the scene animates. A frame is drawn only when the pose has
   changed (dirty flag): a reduced-resolution frame while the card moves,
   then one full-resolution frame once it has been still for SETTLE_MS.
   Nothing is drawn while the card is off-screen, the tab is hidden, or the
   front face is turned away; the pending frame is drawn on return.
   Device pixel ratio is capped at 2. BF_SCENE.setQuality(q), q in
   [0.35, 1], is the single quality knob: it scales resolution, march
   steps and shadow steps together.

   PRESET FORMAT  (see PRESETS / DEFAULT below)
   { id, figure:bool, prop:'none'|'planted-sword',
     camera:{ eyeHeight, eyeDist, winWidth, parallax },
     street:{ halfWidth, cell, seed, arches:[z,z,z] },     // z < 0 = depth
     post:[x,z],                                          // lamp-post base
     light:{ pos:[x,y,z], color:[r,g,b], intensity, radius },  // THE light
     ambient:[r,g,b], exposure,
     fog:{ color:[r,g,b], density, ground, height, scatter },
     palette:{ stone, plaster, timber, cloth, tabard, metal, trim, blade },
     figurePos:[x,z,yaw], propPos:[x,z,lean] }
   Units are metres; the window is winWidth metres wide. A member preset in
   PRESETS[handle] is merged over DEFAULT (only the keys it sets change);
   everyone else gets DEFAULT varied by a hash of the handle (street seed,
   arch spacing, lamp side), the lantern tinted by tier and the planted
   blade toned by weapon. `figure` and `prop` are compile-time switches
   (#defines), so unused geometry costs nothing.
   BF_SCENE.disabled = true forces the CSS fallback (testing).

   FIGURE HOOK
   scene.setFigure(false) removes the built-in SDF figure (e.g. when a
   rigged model is dropped into the card's character slot), and
   scene.camera() returns the live off-axis camera { eye, projection,
   view, figure } (column-major 4x4 arrays, scene metres) so an external
   WebGL renderer can draw a model that lines up with this scene.
   ===================================================================== */
(function () {
  'use strict';

  var SETTLE_MS = 170;
  var MOTION_SCALE = 0.55;
  var DPR_CAP = 2;
  var quality = (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? 0.75 : 1;
  var live = [];

  /* ------------------------------------------------------------------ */
  /* presets                                                             */
  /* ------------------------------------------------------------------ */
  var DEFAULT = {
    id: 'vigil-street',
    figure: false,
    prop: 'planted-sword',
    camera: { eyeHeight: 1.45, eyeDist: 2.6, winWidth: 2.0, parallax: 0.6 },
    street: { halfWidth: 2.2, cell: 4.6, seed: 1, arches: [-9.5, -17.5, -26] },
    post: [-1.75, -4.4],
    light: { pos: [-1.21, 2.62, -4.4], color: [1.0, 0.62, 0.32], intensity: 7.5, radius: 0.07 },
    ambient: [0.011, 0.014, 0.022],
    exposure: 2.4,
    fog: { color: [0.0065, 0.009, 0.017], density: 0.016, ground: 0.045, height: 0.9, scatter: 0.011 },
    palette: {
      stone: [0.30, 0.28, 0.26], plaster: [0.34, 0.31, 0.27], timber: [0.07, 0.05, 0.04],
      cloth: [0.04, 0.04, 0.045], tabard: [0.12, 0.018, 0.016], metal: [0.56, 0.56, 0.58],
      trim: [0.80, 0.58, 0.30], blade: [0.62, 0.63, 0.65]
    },
    figurePos: [0.3, -3.4, -0.32],
    propPos: [0.2, -2.7, 0.13]
  };

  /* Humble: a Warden in blackened plate walking a wet street at night,
     Oathsteel lowered in his right hand; one iron street lantern. */
  var PRESETS = {
    '@humblelifeskills': {
      id: 'humble-night-street',
      figure: true,
      prop: 'none',
      camera: { eyeHeight: 1.3, eyeDist: 2.6, winWidth: 2.0, parallax: 0.6 },
      street: { halfWidth: 2.2, cell: 4.6, seed: 3, arches: [-8.5, -16, -25] },
      post: [-1.72, -2.45],
      light: { pos: [-1.18, 2.55, -2.45], color: [1.0, 0.6, 0.29], intensity: 7.5, radius: 0.07 },
      figurePos: [0.22, -2.6, -0.52],
      exposure: 1.9
    }
  };

  /* tier tints the lantern so the set reads as a set */
  var TIER_LIGHT = {
    ascendant: [1.0, 0.60, 0.29], exalted: [1.0, 0.72, 0.40], honored: [0.86, 0.80, 0.70],
    tempered: [1.0, 0.66, 0.38], footman: [0.92, 0.70, 0.46]
  };
  var WEAPON_BLADE = {
    'Notched Iron': [0.36, 0.35, 0.34], "Footman's Sword": [0.52, 0.52, 0.53], 'Oathsteel': [0.62, 0.63, 0.65],
    'Emberbrand': [0.70, 0.55, 0.42], 'Bladeforever': [0.80, 0.80, 0.84]
  };

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function merge(base, over) {
    var out = {}, k;
    for (k in base) out[k] = base[k];
    if (!over) return out;
    for (k in over) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k] && typeof base[k] === 'object') out[k] = merge(base[k], over[k]);
      else out[k] = over[k];
    }
    return out;
  }

  function presetFor(member) {
    var m = member || {};
    var own = PRESETS[m.handle];
    if (own) return merge(DEFAULT, own);
    var h = hash(String(m.handle || m.name || 'member'));
    var side = (h & 1) ? -1 : 1;            // which side of the street the lantern stands
    var p = merge(DEFAULT, {
      id: 'vigil-street:' + (m.handle || ''),
      street: { seed: (h % 97) / 9.7, arches: [-9 - (h % 3), -17 - ((h >> 3) % 3), -26] },
      post: [side * 1.75, -4.4 - ((h >> 5) % 3) * 0.3],
      light: { color: TIER_LIGHT[m.tier] || TIER_LIGHT.footman },
      propPos: [side * -0.18, -2.7, side * -0.13],
      palette: { blade: WEAPON_BLADE[m.weapon] || WEAPON_BLADE['Notched Iron'] }
    });
    p.light = merge(p.light, { pos: [side * 1.21, 2.62, p.post[1]] });
    return p;
  }

  /* ------------------------------------------------------------------ */
  /* shaders                                                             */
  /* ------------------------------------------------------------------ */
  var VERT = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0., 1.); }';

  var FRAG = [
'precision highp float;',
'#define PI 3.14159265',
'uniform vec2 uRes;',
'uniform vec3 uEye, uWinC;',
'uniform vec2 uWinH;',
'uniform vec3 uLightP, uLightC, uAmb, uFogC;',
'uniform float uLightR, uExposure;',
'uniform vec4 uFog;',        // base density, ground density, height falloff, scatter
'uniform vec4 uStreet;',     // half width, cell length, seed, -
'uniform vec3 uArchZ;',
'uniform vec2 uPost;',
'uniform vec3 uStone, uPlaster, uTimber, uCloth, uTabard, uMetal, uTrim, uBlade;',
'uniform vec4 uFig;',        // x, z, cos yaw, sin yaw
'uniform float uFigOn;',
'uniform vec4 uProp;',       // x, z, lean, -
'uniform int uSteps, uShSteps;',

/* ---------- hashing / noise (written for this project) ---------- */
'float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(.1291, .2173, .1739)); q += dot(q, q.yzx + 27.41); return fract((q.x + q.y) * q.z); }',
'float h11(float x){ return h21(vec2(x, x * .713 + 3.1)); }',
'float vn2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);',
'  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }',
'float vn3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); float n = i.z * 57.31;',
'  float a = mix(mix(h21(i.xy + n), h21(i.xy + vec2(1.,0.) + n), f.x), mix(h21(i.xy + vec2(0.,1.) + n), h21(i.xy + vec2(1.,1.) + n), f.x), f.y);',
'  n += 57.31;',
'  float b = mix(mix(h21(i.xy + n), h21(i.xy + vec2(1.,0.) + n), f.x), mix(h21(i.xy + vec2(0.,1.) + n), h21(i.xy + vec2(1.,1.) + n), f.x), f.y);',
'  return mix(a, b, f.z); }',
'float fbm2(vec2 p){ return .55 * vn2(p) + .3 * vn2(p * 2.07 + 5.3) + .15 * vn2(p * 4.13 + 1.7); }',

/* ---------- distance primitives ---------- */
'float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.); }',
'float sdBox2(vec2 p, vec2 b){ vec2 q = abs(p) - b; return length(max(q, 0.)) + min(max(q.x, q.y), 0.); }',
'float sdCap(vec3 p, vec3 a, vec3 b, float r){ vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h) - r; }',
'float sdTCap(vec3 p, vec3 a, vec3 b, float r1, float r2){ vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return (length(pa - ba * h) - mix(r1, r2, h)) * .9; }',
'float sdEll(vec3 p, vec3 r){ return (length(p / r) - 1.) * min(r.x, min(r.y, r.z)); }',
'float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.) / k; return min(a, b) - h * h * k * .25; }',
'vec2 opU(vec2 a, vec2 b){ return a.x < b.x ? a : b; }',

/* ---------- ground: wet setts in running bond ---------- */
'vec4 cobble(vec2 q){',
   /* rounded field stones: jittered Voronoi cells, joint distance from F2 - F1 */
'  vec2 g = q * vec2(1. / .17, 1. / .14);',
'  vec2 i = floor(g), f = fract(g);',
'  float d1 = 8., d2 = 8.; vec2 id = i;',
'  for (int y = -1; y <= 1; y++)',
'  for (int x = -1; x <= 1; x++) {',
'    vec2 o = vec2(float(x), float(y));',
'    vec2 c = i + o;',
'    vec2 r = o + vec2(h21(c), h21(c + 17.31)) * .76 + .12 - f;',
'    float d = dot(r, r);',
'    if (d < d1) { d2 = d1; d1 = d; id = c; } else if (d < d2) { d2 = d; }',
'  }',
'  float edge = (sqrt(d2) - sqrt(d1)) * .5 * .155;',
'  float j = h21(id * 1.37 + 4.1);',
'  float sd = .007 - edge;',
'  float dome = smoothstep(0., 1., clamp(-sd / .045, 0., 1.));',
'  return vec4(dome * (.72 + .28 * j), sd, j, h21(id + 9.7));',
'}',
'float ground(vec3 p){ if (p.y > .05) return p.y - .028; return (p.y - .028 * cobble(p.xz).x) * .6; }',

/* ---------- buildings either side of the street ---------- */
'vec2 walls(vec3 p){',
'  float HW = uStreet.x, L = uStreet.y;',
'  float side = p.x < 0. ? -1. : 1.;',
'  float ax = abs(p.x);',
'  float zz = -p.z + uStreet.z * 7.31 + (side > 0. ? L * .43 : 0.);',
'  float cell = floor(zz / L);',
'  float lz = zz - (cell + .5) * L;',
'  float hA = h21(vec2(cell, side * 3.1 + uStreet.z));',
'  float hB = h21(vec2(cell * 1.7 + 4.2, side + uStreet.z * .37));',
'  float face = HW + .12 * hA;',
'  float jet = face - (.26 + .2 * hB);',
'  float y1 = 2.9 + .35 * hA;',
'  float y2 = y1 + 2.5 + .8 * hB;',
'  float d = face - ax;',
'  float up = max(max(jet - ax, y1 - p.y), p.y - y2);',
'  d = min(d, up);',
'  float roof = max(max(jet - .32 - ax, y2 - .14 - p.y), (p.y - y2 - (ax - jet + .32) * .95) * .72);',
'  d = min(d, roof);',
'  float pier = max(max(abs(L * .5 - abs(lz)) - .2, face - .16 - ax), p.y - y1);',
'  d = min(d, pier);',
'  float jb = max(abs(p.y - y1 + .05) - .09, jet - .07 - ax);',
'  d = min(d, jb);',
'  vec2 o = vec2(abs(lz - (hA - .5) * 1.4), p.y);',
'  float door = min(sdBox2(o - vec2(0., .95), vec2(.48, .95)), length(o - vec2(0., 1.9)) - .48);',
'  float dw = hB > .42 ? max(door, abs(ax - face - .1) - .2) : 1e3;',
'  vec2 wo = vec2(abs(lz + (hA - .5) * 1.2 - (hB > .42 ? 1.3 : 0.)), p.y - 1.55);',
'  float win1 = max(sdBox2(wo, vec2(.28, .42)), abs(ax - face - .05) - .14);',
'  float lzw = abs(abs(lz) - L * .25);',
'  float win2 = max(sdBox2(vec2(lzw, p.y - y1 - 1.25), vec2(.26, .44)), abs(ax - jet - .05) - .12);',
'  d = max(d, -min(dw, min(win1, win2)));',
'  float m = p.y < y1 - .14 ? 2. : (p.y < y2 - .1 ? 3. : 4.);',
'  if (dw < .02 || win1 < .02 || win2 < .02) m = (p.y < y1 - .14) ? 8. : 9.;',
'  return vec2(d, m);',
'}',

/* ---------- pointed stone arches spanning the street ---------- */
'float archAt(vec3 p, float z0){',
'  vec3 q = p - vec3(0., 0., z0);',
'  float HW = uStreet.x;',
'  float slab = sdBox(q - vec3(0., 4.6, 0.), vec3(HW + .9, 4.6, .55));',
'  if (slab > .5) return slab;',
'  vec2 o = vec2(abs(q.x), q.y);',
'  float ow = HW - .42, spring = 2.75, c = ow * .38, R = ow + c;',
'  float open = o.y < spring ? o.x - ow : length(vec2(o.x + c, o.y - spring)) - R;',
'  return max(slab, -max(open, abs(q.z) - .8));',
'}',
'float arches(vec3 p){',
'  float d = 1e3;',
'  if (uArchZ.x < -.5) d = min(d, archAt(p, uArchZ.x));',
'  if (uArchZ.y < -.5) d = min(d, archAt(p, uArchZ.y));',
'  if (uArchZ.z < -.5) d = min(d, archAt(p, uArchZ.z));',
'  return d;',
'}',

/* ---------- the street lantern on its iron post (the only emitter) ---------- */
'float gShadow = 0.;',
'vec2 lamp(vec3 p){',
'  vec3 q = p - vec3(uPost.x, 0., uPost.y);',
'  float sgn = uPost.x < 0. ? 1. : -1.;',
'  q.x *= sgn;',
'  float arm = abs(uLightP.x - uPost.x);',
'  float d = sdBox(q - vec3(0., .12, 0.), vec3(.1, .12, .1)) - .025;',
'  float pb = sdCap(q, vec3(0., .2, 0.), vec3(0., 3.08, 0.), .095);',
'  if (pb > .03) d = min(d, pb); else {',
'    float post = sdTCap(q, vec3(0., .2, 0.), vec3(0., 3.02, 0.), .058, .04);',
'    post = min(post, sdTCap(q, vec3(0., .2, 0.), vec3(0., .5, 0.), .085, .06));',
'    float rings = length(vec2(length(q.xz) - .055, q.y - 2.48)) - .016;',
'    rings = min(rings, length(vec2(length(q.xz) - .065, q.y - .55)) - .016);',
'    float fin = length(q - vec3(0., 3.08, 0.)) - .045;',
'    d = min(d, min(min(post, rings), fin));',
'  }',
'  vec2 r = vec2(d, 6.);',
   /* the bracket and the lantern housing hug the light: shadow rays skip them */
'  if (gShadow > .5) return r;',
'  float ab = sdBox(q - vec3(arm * .5, 2.9, 0.), vec3(arm * .5 + .04, .1, .035));',
'  if (ab > .05) d = min(d, ab); else {',
'    float bar = sdCap(q, vec3(0., 2.96, 0.), vec3(arm + .02, 2.96, 0.), .02);',
'    float hook = sdCap(q, vec3(arm, 2.96, 0.), vec3(arm, 2.82, 0.), .009);',
'    d = min(d, min(bar, hook));',
'  }',
'  float bb = sdBox(q - vec3(arm * .31, 2.73, 0.), vec3(arm * .31 + .03, .25, .025));',
'  if (bb > .05) d = min(d, bb); else {',
'    float brace = sdCap(q, vec3(0., 2.5, 0.), vec3(arm * .62, 2.95, 0.), .013);',
'    vec2 sc = q.xy - vec2(arm * .36, 2.78);',
'    float scroll = max(max(abs(length(sc) - .1) - .011, abs(q.z) - .011), sc.y - .02);',
'    d = min(d, min(brace, scroll));',
'  }',
'  r = vec2(d, 6.);',
'  {',
'    vec3 l = p - uLightP;',
'    float lb = sdBox(l, vec3(.14, .22, .14));',
'    if (lb > .06) return opU(r, vec2(lb, 6.));',
'    vec2 a = abs(l.xz);',
'    float bars = max(length(a - vec2(.083)) - .0095, abs(l.y) - .13);',
'    float cap = sdTCap(l, vec3(0., .125, 0.), vec3(0., .2, 0.), .125, .018);',
'    float bot = sdTCap(l, vec3(0., -.125, 0.), vec3(0., -.165, 0.), .105, .03);',
'    float band = max(sdBox(l, vec3(.094, .135, .094)), -sdBox(l, vec3(.09, .118, .2)));',
'    band = max(band, -sdBox(l, vec3(.2, .118, .09)));',
'    float iron = min(min(bars, cap), min(bot, band));',
'    float glass = sdBox(l, vec3(.078, .118, .078));',
'    r = opU(r, opU(vec2(iron, 6.), vec2(glass, 7.)));',
'  }',
'  return r;',
'}',
/* ---------- the sword (shared by the figure and the planted prop) ---------- */
'vec2 sword(vec3 p, vec3 g, vec3 b, vec3 w, float L){',
'  vec3 n = cross(b, w);',
'  vec3 r = p - g;',
'  float s = dot(r, b), a = dot(r, w), c = dot(r, n);',
'  float hw = mix(.027, .02, s / L) * clamp((L - s) / .14, 0., 1.);',
'  float blade = max((abs(a) + abs(c) * 3.2 - hw) * .3, max(-s, s - L));',
'  float guard = sdCap(r, -w * .105, w * .105, .0115);',
'  guard = min(guard, sdCap(r, w * .1, w * .125 + b * .03, .009));',
'  guard = min(guard, sdCap(r, -w * .1, -w * .125 + b * .03, .009));',
'  float grip = sdTCap(r, -b * .015, -b * .14, .0155, .013);',
'  vec3 pq = r + b * .175;',
'  float ring = length(vec2(length(vec2(dot(pq, b), dot(pq, w))) - .028, dot(pq, n))) - .0085;',
'  vec2 res = vec2(blade, 15.);',
'  res = opU(res, vec2(min(guard, ring), 11.));',
'  res = opU(res, vec2(grip, 14.));',
'  return res;',
'}',

'#ifdef HAS_FIGURE',
/* ---------- the Warden: original armoured figure, mid-stride ----------
   figure space: +y up, +z = facing direction, +x = the figure\'s left. */
'float sabaton(vec3 p, vec3 a, vec3 b){',
'  vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);',
'  vec3 e = pa - ba * h; e.y *= 1.45;',
'  return (length(e) - mix(.054, .036, h)) * .66;',
'}',
'vec2 figure(vec3 p){',
'  float bd = min(sdCap(p, vec3(-.02, .35, -.06), vec3(0., 1.62, -.02), .36), sdCap(p, vec3(-.29, .84, .14), vec3(-.63, .1, -.3), .07));',
'  bd = max(bd, sdBox(p - vec3(-.06, .97, -.03), vec3(.6, 1., .62)));',
'  if (bd > .05) return vec2(bd, 10.);',
'  vec2 r = vec2(1e3, 10.);',
/* legs: left forward (heel strike), right back (toe-off) */
'  float lt = sdTCap(p, vec3(.105, .97, .0), vec3(.12, .54, .13), .088, .066);',
'  float lg = sdTCap(p, vec3(.12, .52, .15), vec3(.13, .12, .26), .06, .045);',
'  float rt = sdTCap(p, vec3(-.105, .97, .0), vec3(-.12, .53, -.085), .088, .066);',
'  float rg = sdTCap(p, vec3(-.12, .52, -.09), vec3(-.13, .15, -.33), .06, .045);',
'  float legs = min(smin(lt, lg, .04), smin(rt, rg, .04));',
'  float knees = min(length((p - vec3(.124, .535, .17)) * vec3(1., 1., 1.25)) - .066, length((p - vec3(-.121, .53, -.055)) * vec3(1., 1., 1.25)) - .066);',
'  legs = min(legs, knees * .85);',
'  legs = min(legs, sabaton(p, vec3(.13, .075, .23), vec3(.14, .062, .45)));',
'  legs = min(legs, sabaton(p, vec3(-.13, .13, -.36), vec3(-.132, .036, -.15)));',
'  r = opU(r, vec2(legs, 10.));',
/* torso: breastplate with a keel, waist, faulds */
'  float chest = sdEll(p - vec3(0., 1.285, .03), vec3(.182, .215, .138));',
'  float keel = sdCap(p, vec3(0., 1.12, .14), vec3(0., 1.39, .158), .018);',
'  chest = smin(chest, keel, .05);',
'  float waist = sdEll(p - vec3(0., 1.06, .015), vec3(.152, .13, .118));',
'  float torso = smin(chest, waist, .07);',
'  float gor = sdTCap(p, vec3(0., 1.47, .015), vec3(0., 1.585, .02), .092, .066);',
'  torso = min(torso, gor);',
'  float fy = clamp((.97 - p.y) / .2, 0., 1.);',
'  float lame = .006 * smoothstep(.25, .45, abs(fract((.97 - p.y) / .05) - .5));',
'  float faulds = max(length((p.xz - vec2(0., .012)) * vec2(1., 1.22)) - (.168 + .055 * fy) + lame, abs(p.y - .87) - .1) * .8;',
'  torso = min(torso, faulds);',
'  r = opU(r, vec2(torso, 10.));',
/* belt + tabard */
'  vec3 bq = p - vec3(0., .975, .012);',
'  float belt = length(vec2(length(bq.xz * vec2(1., 1.2)) - .162, bq.y)) - .021;',
'  belt = min(belt, sdBox(p - vec3(0., .975, .18), vec3(.026, .028, .012)) - .004);',
'  r = opU(r, vec2(belt, 14.));',
'  float ty = clamp((.96 - p.y) / .52, 0., 1.);',
'  float tz = .168 + .095 * ty * ty + .025 * ty + .007 * ty * sin(p.x * 70. + 1.);',
'  float tab = max(abs(p.z - tz) - .008, max(abs(p.x - .006) - (.094 + .02 * ty), abs(p.y - .705) - .255)) * .75;',
'  r = opU(r, vec2(tab, 13.));',
/* helm: rounded dome, central brow ridge, crest keel, eye slit, brass band */
'  vec3 h = p - vec3(0., 1.705, .032);',
'  float helm = sdEll(h, vec3(.12, .142, .134));',
'  float ridge = sdCap(h, vec3(0., .1, .06), vec3(0., -.075, .124), .026);',
'  helm = smin(helm, ridge, .04);',
'  float crest = max(sdBox(h - vec3(0., .1, -.012), vec3(.0075, .07, .135)), sdEll(h - vec3(0., .006, -.004), vec3(.124, .159, .142)));',
'  helm = min(helm, crest);',
'  float cheek = sdEll(h - vec3(0., -.075, .02), vec3(.105, .07, .11));',
'  helm = smin(helm, cheek, .03);',
'  float slit = sdBox(h - vec3(0., .018, .13), vec3(.085, .0085, .07));',
'  helm = max(helm, -slit);',
'  r = opU(r, vec2(helm, 10.));',
'  vec3 hb = h - vec3(0., .05, .0);',
'  float band = length(vec2(length(hb.xz * vec2(1., .89)) - .119, hb.y)) - .0075;',
'  r = opU(r, vec2(band, 11.));',
'  float slitIn = sdBox(h - vec3(0., .018, .06), vec3(.08, .007, .05));',
'  r = opU(r, vec2(slitIn, 16.));',
/* layered pauldrons with brass-edged lames */
'  for (int i = 0; i < 2; i++) {',
'    float s = i == 0 ? -1. : 1.;',
'    vec3 sp = p - vec3(0., 0., s * -.018 + .004);',
'    sp.x *= s;',
'    vec3 e1 = sp - vec3(0., 0., 0.);',
'    float pa = sdTCap(e1 * vec3(1., 1.5, 1.), vec3(.115, 2.25, 0.), vec3(.255, 2.115, 0.), .1, .092) / 1.5;',
'    float pb = sdTCap(e1 * vec3(1., 1.5, 1.), vec3(.15, 2.17, 0.), vec3(.268, 2.04, 0.), .095, .084) / 1.5;',
'    float pc = sdTCap(e1 * vec3(1., 1.5, 1.), vec3(.19, 2.09, 0.), vec3(.278, 1.965, 0.), .085, .074) / 1.5;',
'    float paul = min(pa, min(pb, pc));',
'    r = opU(r, vec2(paul, 17.));',
'  }',
/* arms: right (sword) forward, left back */
'  vec3 rs = vec3(-.214, 1.43, .035), re = vec3(-.268, 1.165, .085), rw = vec3(-.278, .935, .158);',
'  float ra = smin(sdTCap(p, rs, re, .058, .05), sdTCap(p, re, rw, .05, .042), .03);',
'  ra = min(ra, length((p - re) * vec3(1., 1.1, 1.)) - .058);',
'  ra = min(ra, sdTCap(p, rw + vec3(.002, .035, -.012), rw + vec3(-.004, -.028, .012), .043, .058));',
'  ra = min(ra, sdEll(p - vec3(-.283, .876, .182), vec3(.043, .054, .052)));',
'  vec3 ls = vec3(.214, 1.43, -.03), le = vec3(.262, 1.17, -.092), lw = vec3(.263, .943, -.078);',
'  float la = smin(sdTCap(p, ls, le, .058, .05), sdTCap(p, le, lw, .05, .042), .03);',
'  la = min(la, length((p - le) * vec3(1., 1.1, 1.)) - .058);',
'  la = min(la, sdTCap(p, lw + vec3(0., .035, 0.), lw + vec3(.004, -.028, .006), .043, .058));',
'  la = min(la, sdEll(p - vec3(.265, .878, -.066), vec3(.043, .055, .05)));',
'  r = opU(r, vec2(min(ra, la), 10.));',
/* the cloak: hangs from the shoulders, flares back with the stride */
'  float cy = clamp((1.47 - p.y) / 1.2, 0., 1.);',
'  vec2 cc = vec2(.0, -.03 - .21 * cy * cy);',
'  vec2 d2 = p.xz - cc;',
'  float ang = atan(d2.x, -d2.y);',
'  float R = .17 + .17 * cy + .02 * cy * sin(ang * 7. + 1.3) + .008 * sin(ang * 13. + 2.);',
'  float shell = abs(length(d2) - R) - .012;',
'  float hem = .28 + .05 * sin(ang * 4. + .7) + .02 * sin(ang * 9.);',
'  float cl = max(shell, max(p.y - 1.49, hem - p.y));',
'  cl = max(cl, d2.y + .015);',
'  r = opU(r, vec2(cl * .62, 12.));',
/* Oathsteel, lowered in the right hand, point trailing behind */
'  vec3 sb = vec3(-.3716, -.7962, -.4777);',
'  vec3 sw = vec3(-.9062, .4229, 0.);',
'  r = opU(r, sword(p, vec3(-.2933, .8180, .1327), sb, sw, .88));',
'  return r;',
'}',
'vec2 figureW(vec3 p){',
'  vec3 q = p - vec3(uFig.x, 0., uFig.y);',
'  q.xz = vec2(uFig.z * q.x - uFig.w * q.z, uFig.w * q.x + uFig.z * q.z);',
'  return figure(q);',
'}',
'#endif',

'#ifdef HAS_PROP',
'vec2 prop(vec3 p){',
'  vec3 q = p - vec3(uProp.x, 0., uProp.y);',
'  if (sdBox(q - vec3(0., .55, 0.), vec3(.25, .6, .25)) > .1) return vec2(sdBox(q - vec3(0., .55, 0.), vec3(.25, .6, .25)), 15.);',
'  vec3 b = normalize(vec3(sin(uProp.z), -1., .12));',
'  vec3 w = normalize(cross(b, vec3(0., 0., 1.)));',
'  return sword(q, vec3(0., .9, 0.) - b * .0, b, w, 1.05);',
'}',
'#endif',

'vec2 map(vec3 p){',
'  vec2 r = vec2(ground(p), 1.);',
'  r = opU(r, walls(p));',
'  r = opU(r, vec2(arches(p), 5.));',
'  r = opU(r, lamp(p));',
'#ifdef HAS_FIGURE',
'  if (uFigOn > .5) r = opU(r, figureW(p));',
'#endif',
'#ifdef HAS_PROP',
'  r = opU(r, prop(p));',
'#endif',
'  return r;',
'}',
'float mapD(vec3 p){ return map(p).x; }',

'vec3 calcNormal(vec3 p, float e){',
'  vec2 k = vec2(1., -1.);',
'  return normalize(k.xyy * mapD(p + k.xyy * e) + k.yyx * mapD(p + k.yyx * e) + k.yxy * mapD(p + k.yxy * e) + k.xxx * mapD(p + k.xxx * e));',
'}',

'float softShadow(vec3 ro, vec3 rd, float tmax, float k){',
'  gShadow = 1.;',
'  float res = 1., t = .02, ph = 1e3;',
'  for (int i = 0; i < 72; i++) {',
'    if (i >= uShSteps) break;',
'    float h = mapD(ro + rd * t);',
    /* triangulate the closest approach between this and the previous sample */
'    float y = h * h / (2. * ph);',
'    float d = sqrt(max(h * h - y * y, 0.));',
'    res = min(res, k * d / max(t - y, 1e-4));',
'    ph = h;',
'    t += clamp(h, .01, .22);',
'    if (res < .003 || t > tmax) break;',
'  }',
'  gShadow = 0.;',
'  res = clamp(res, 0., 1.);',
'  return res * res * (3. - 2. * res);',
'}',

'float calcAO(vec3 p, vec3 n){',
'  float o = 0., s = 1.;',
'  for (int i = 0; i < 5; i++) {',
'    float h = .015 + .075 * float(i);',
'    o += (h - mapD(p + n * h)) * s;',
'    s *= .72;',
'  }',
'  return clamp(1. - 2.6 * o, 0., 1.);',
'}',

/* single-scattering of the lantern in the fog, closed form for a point light */
'vec3 inscatter(vec3 ro, vec3 rd, float t0, float t1){',
'  vec3 lo = uLightP - ro;',
'  float tc = dot(lo, rd);',
'  float h = sqrt(max(dot(lo, lo) - tc * tc, 1e-4));',
'  float a1 = t1 - tc, a0 = t0 - tc, h2 = h * h;',
'  float I = (atan(a1 / h) - atan(a0 / h)) / h;',
   /* tight aerosol halo: 1/r^4 integrand, closed form, scale rho = 0.55 m */
'  float I4 = (a1 / (2. * h2 * (h2 + a1 * a1)) + atan(a1 / h) / (2. * h2 * h)) - (a0 / (2. * h2 * (h2 + a0 * a0)) + atan(a0 / h) / (2. * h2 * h));',
'  I = I + .5625 * 1.6 * I4;',
'  float dens = uFog.x + uFog.y * exp(-uLightP.y / uFog.z);',
'  float att = exp(-dens * (max(tc, 0.) - t0 + h) * .8);',
'  return uLightC * uFog.w * I * att * (1. / (4. * PI));',
'}',
'float fogDepth(vec3 ro, vec3 rd, float t0, float t1){',
'  float dt = t1 - t0;',
'  float y0 = ro.y + rd.y * t0;',
'  float k = rd.y / uFog.z;',
'  float e = abs(k) < 1e-3 ? dt : (1. - exp(-k * dt)) / k;',
'  return uFog.x * dt + uFog.y * exp(-y0 / uFog.z) * e;',
'}',
/* ray vs. the lantern glass (for reflections of the emitter itself) */
'float hitGlass(vec3 ro, vec3 rd){',
'  vec3 o = ro - uLightP;',
'  vec3 inv = 1. / rd, b = vec3(.078, .118, .078);',
'  vec3 t1 = (-b - o) * inv, t2 = (b - o) * inv;',
'  vec3 tn = min(t1, t2), tf = max(t1, t2);',
'  float a = max(max(tn.x, tn.y), tn.z), z = min(min(tf.x, tf.y), tf.z);',
'  return (z > max(a, 0.)) ? 1. : 0.;',
'}',
'vec3 glassGlow(vec3 l){',
'  float core = exp(-dot(l.xz, l.xz) * 320. - (l.y + .02) * (l.y + .02) * 90.);',
'  return uLightC * (1.1 + 5.5 * core);',
'}',
'vec3 envGlow(vec3 p, vec3 r, float rough){',
'  vec3 e = uFogC * 1.4 + inscatter(p, r, .02, 30.) * (1. - rough * .6);',
'  e += hitGlass(p, r) * uLightC * .9 * (1. - rough) * (1. - rough);',
'  return e;',
'}',

'vec3 cheapShade(vec3 ro, vec3 rd){',
'  float t = .02;',
'  vec2 h = vec2(-1.);',
'  for (int i = 0; i < 64; i++) {',
'    vec2 m = map(ro + rd * t);',
'    if (m.x < .002 * t) { h = vec2(t, m.y); break; }',
'    t += m.x;',
'    if (t > 30.) break;',
'  }',
'  vec3 c = uFogC;',
'  if (h.x > 0.) {',
'    vec3 p = ro + rd * t;',
'    if (h.y > 6.5 && h.y < 7.5) return glassGlow(p - uLightP);',
'    vec3 n = calcNormal(p, .002);',
'    vec3 Lv = uLightP - p; float d2 = dot(Lv, Lv);',
'    vec3 a = h.y < 1.5 ? uStone * .3 : h.y < 5.5 ? uStone * .8 : h.y < 12.5 && h.y > 9.5 ? uMetal * .5 : h.y < 13.5 ? uTabard : uStone * .3;',
'    c = a * (uLightC * max(dot(n, Lv), 0.) / (d2 * sqrt(d2) + 1e-3) / PI + uAmb);',
'  }',
'  float T = exp(-fogDepth(ro, rd, 0., t));',
'  return c * T + uFogC * (1. - T) + inscatter(ro, rd, 0., t);',
'}',
'float ggx(float ndh, float a){ float a2 = a * a; float d = ndh * ndh * (a2 - 1.) + 1.; return a2 / (PI * d * d); }',

'void main(){',
'  vec2 uv = gl_FragCoord.xy / uRes * 2. - 1.;',
'  vec3 wp = uWinC + vec3(uv.x * uWinH.x, uv.y * uWinH.y, 0.);',
'  vec3 ro = uEye;',
'  vec3 rd = normalize(wp - ro);',
'  float t0 = length(wp - ro);',
'  float t = t0, tmax = 70.;',
'  vec2 hit = vec2(-1.);',
'  for (int i = 0; i < 220; i++) {',
'    if (i >= uSteps) break;',
'    vec2 h = map(ro + rd * t);',
'    if (h.x < .00045 * t) { hit = vec2(t, h.y); break; }',
'    t += h.x * .92;',
'    if (t > tmax) break;',
'  }',
'  vec3 col;',
'  if (hit.x < 0.) {',
'    t = tmax;',
'    float sky = smoothstep(-.1, .6, rd.y);',
'    col = uFogC * mix(1.15, .55, sky);',
'  } else {',
'    vec3 p = ro + rd * t;',
'    float mid = hit.y;',
'    vec3 n = calcNormal(p, .0007 + .0004 * t);',
'    vec3 v = -rd;',
'    vec3 alb = uStone; vec3 f0 = vec3(.04); float rough = .7; float metal = 0.; vec3 emit = vec3(0.);',
'    float wet = 0.; float aoMul = 1.;',
'    if (mid < 1.5) {',
          /* wet setts: per-stone colour, puddles in the hollows */
'      vec4 cb = cobble(p.xz);',
'      float j = cb.z;',
'      alb = uStone * (.55 + .5 * j) * mix(vec3(1.), vec3(1.08, .97, .9), cb.w);',
'      float gap = smoothstep(-.006, .004, cb.y);',
'      float pm = fbm2(p.xz * .5 + 3.1) + .25 * fbm2(p.xz * 2.3);',
'      float puddle = smoothstep(.66, .74, pm) * (1. - smoothstep(.0, .6, abs(p.x) - 1.2));',
'      wet = .7 + .3 * vn2(p.xz * 3.);',
'      alb *= mix(1., .45, wet) * mix(1., .3, gap);',
'      rough = mix(.36, .16, wet) + .12 * vn2(p.xz * 40.) + .3 * gap;',
'      n = normalize(mix(n, vec3(0., 1., 0.), puddle));',
'      rough = mix(rough, .03, puddle);',
'      wet = max(wet * (1. - gap * .7), puddle);',
'      alb *= 1. - .6 * puddle;',
'      aoMul = 1. - .5 * gap;',
'      f0 = vec3(.04);',
'    } else if (mid < 2.5 || mid == 8.) {',
          /* ashlar wall: coursed blocks, mortar, rising damp */
'      vec2 wq = vec2(-p.z + uStreet.z * 3., p.y);',
'      if (abs(n.z) > .7) wq.x = p.x;',
'      float course = floor(wq.y / .34);',
'      float bx = wq.x / (.62 + .18 * h11(course)) + h11(course + 7.) * 3.;',
'      float bid = h21(vec2(floor(bx), course));',
'      vec2 bf = vec2(abs(fract(bx) - .5) * .62, abs(fract(wq.y / .34) - .5) * .34);',
'      float mortar = 1. - smoothstep(.006, .016, min(.31 - bf.x, .17 - bf.y));',
'      alb = uStone * (.7 + .45 * bid) * mix(1., .55, mortar);',
'      alb *= .8 + .4 * vn3(p * 3.1);',
'      float damp = 1. - smoothstep(.0, 1.1, p.y + .4 * vn2(p.zx * 2.));',
'      wet = damp * .8;',
'      alb *= mix(1., .5, wet);',
'      rough = mix(.75, .3, wet) + .15 * mortar;',
'      aoMul = 1. - .35 * mortar;',
'      if (mid == 8.) { alb *= .25; rough = .5; }',
'    } else if (mid < 3.5 || mid == 9.) {',
          /* jettied upper storey: limewash between dark timbers */
'      vec2 wq = vec2(-p.z + uStreet.z * 3., p.y);',
'      if (abs(n.z) > .7) wq.x = p.x;',
'      float post = abs(fract(wq.x / .9) - .5) * .9;',
'      float beam = min(abs(fract((wq.y - .1) / 1.3) - .5) * 1.3, 1.);',
'      float diag = abs(fract((wq.x + wq.y) / 1.8) - .5) * 1.8 * .7;',
'      float tim = 1. - smoothstep(.055, .07, min(min(post, beam), diag));',
'      alb = mix(uPlaster * (.75 + .35 * vn3(p * 2.3)), uTimber * (.8 + .4 * vn3(p * 9.)), tim);',
'      alb *= .85 + .3 * fbm2(wq * 1.7);',
'      rough = mix(.85, .6, tim);',
'      if (mid == 9.) { alb = vec3(.012, .013, .016); rough = .2; f0 = vec3(.05); }',
'    } else if (mid < 4.5) {',
'      alb = vec3(.05, .05, .055) * (.7 + .6 * vn3(p * 6.)); rough = .45;',
'    } else if (mid < 5.5) {',
          /* arch stone: voussoirs radiating from the arch centre */
'      float a = atan(p.y - 2.75, abs(p.x));',
'      float vs = abs(fract(a * 5.5) - .5);',
'      float course = abs(fract(p.y / .4) - .5);',
'      float joint = p.y > 2.6 ? vs : course;',
'      float mortar = 1. - smoothstep(.02, .05, joint);',
'      float bid = h21(vec2(floor(a * 5.5), floor(p.y / .4)));',
'      alb = uStone * (.75 + .4 * bid) * mix(1., .6, mortar) * (.85 + .3 * vn3(p * 3.));',
'      rough = .7;',
'    } else if (mid < 6.5) {',
'      alb = vec3(.035, .033, .032); f0 = vec3(.32, .31, .3); metal = .7; rough = .42 + .2 * vn3(p * 30.);',
'    } else if (mid < 7.5) {',
'      emit = glassGlow(p - uLightP);',
'      alb = vec3(0.); f0 = vec3(.04); rough = .05;',
'    } else if (mid < 10.5 || mid > 16.5) {',
          /* blackened plate: worn, pitted steel */
'      float wear = vn3(p * 55.);',
'      float scuff = smoothstep(.55, .85, vn3(p * 9. + 2.));',
'      alb = vec3(.02); metal = 1.;',
'      f0 = uMetal * (.7 + .25 * wear + .3 * scuff);',
'      rough = .24 + .14 * wear - .1 * scuff;',
'      vec3 fs = p - vec3(uFig.x, 0., uFig.y);',
'      fs.xz = vec2(uFig.z * fs.x - uFig.w * fs.z, uFig.w * fs.x + uFig.z * fs.z);',
       /* plate seams: lames on limbs, plackart edge on the breastplate */
'      float seam = 0.;',
'      if (fs.y < 1.42 && abs(fs.x) > .19) seam = 1. - smoothstep(.0025, .006, abs(fract(fs.y / .062) - .5) * .062 - .025);',
'      if (fs.y < .98) seam = 1. - smoothstep(.0025, .006, abs(fract(fs.y / .07 + .3) - .5) * .07 - .029);',
'      float plack = abs(fs.y - 1.13 - abs(fs.x) * .55);',
'      if (abs(fs.x) < .17 && fs.z > 0.) seam = max(seam, 1. - smoothstep(.002, .005, plack));',
'      f0 *= 1. - .6 * seam; rough += .3 * seam; aoMul = 1. - .5 * seam;',
'      if (mid > 16.5) {',
'        vec3 fq = p - vec3(uFig.x, 0., uFig.y);',
'        fq.xz = vec2(uFig.z * fq.x - uFig.w * fq.z, uFig.w * fq.x + uFig.z * fq.z);',
'        fq.x = abs(fq.x);',
'        float sl = fq.y + (fq.x - .2) * .62;',
'        float edge = min(abs(sl - 1.392), abs(sl - 1.338));',
'        if (edge < .007 && fq.x > .17) { f0 = uTrim * .9; rough = .3; }',
'      }',
'    } else if (mid < 11.5) {',
'      alb = vec3(.02); metal = 1.; f0 = uTrim * (.85 + .2 * vn3(p * 40.)); rough = .28;',
'    } else if (mid < 12.5) {',
'      float weave = .9 + .1 * vn3(p * 140.);',
'      alb = uCloth * weave * (.8 + .4 * vn3(p * 7.)); rough = .92;',
'    } else if (mid < 13.5) {',
          /* Warden tabard: deep red, a single gold-thread pale with an oath ring */
'      vec3 fq = p - vec3(uFig.x, 0., uFig.y);',
'      fq.xz = vec2(uFig.z * fq.x - uFig.w * fq.z, uFig.w * fq.x + uFig.z * fq.z);',
'      float pale = 1. - smoothstep(.009, .013, abs(fq.x - .006));',
'      float ring = 1. - smoothstep(.006, .01, abs(length(vec2(fq.x - .006, fq.y - .83)) - .038));',
'      float thread = max(pale * step(fq.y, .79), ring);',
'      alb = mix(uTabard * (.8 + .4 * vn3(p * 60.)), uTrim * .55, thread);',
'      rough = mix(.88, .45, thread); f0 = mix(vec3(.04), uTrim * .6, thread);',
'      alb *= .85 + .3 * smoothstep(.0, .3, fq.y - .45);',
'    } else if (mid < 14.5) {',
'      alb = vec3(.09, .055, .035) * (.8 + .4 * vn3(p * 50.)); rough = .62;',
'    } else if (mid < 15.5) {',
          /* Oathsteel: polished, with a darker fuller */
'      alb = vec3(.02); metal = 1.; f0 = uBlade; rough = .11 + .05 * vn3(p * 80.);',
'    } else {',
'      alb = vec3(.004); rough = .9;',
'    }',
'    float ao = calcAO(p, n) * aoMul;',
'    vec3 Lv = uLightP - p;',
'    float d2 = dot(Lv, Lv), dl = sqrt(d2);',
'    vec3 l = Lv / dl;',
'    float ndl = dot(n, l);',
'    float ndv = max(dot(n, v), .001);',
'    vec3 c = vec3(0.);',
'    if (mid > 6.5 && mid < 7.5) {',
'      c = emit;',
'    } else {',
'      float sh = 0.;',
'      if (ndl > 0.) sh = softShadow(p + n * .006, l, dl - .24, clamp(dl / .14, 6., 40.));',
'      float att = 1. / (d2 + uLightR * uLightR);',
'      vec3 E = uLightC * att * max(ndl, 0.) * sh;',
'      vec3 hv = normalize(l + v);',
'      float ndh = max(dot(n, hv), 0.);',
'      float a = max(rough * rough, .002);',
'      float a2 = min(a + uLightR / (2. * dl), 1.);',
'      float D = ggx(ndh, a2) * (a / a2) * (a / a2);',
'      float kk = (rough + 1.) * (rough + 1.) / 8.;',
'      float G = (max(ndl, 0.) / (max(ndl, 0.) * (1. - kk) + kk)) * (ndv / (ndv * (1. - kk) + kk));',
'      vec3 F = f0 + (1. - f0) * pow(1. - max(dot(hv, v), 0.), 5.);',
'      vec3 spec = D * G * F / (4. * max(ndl, .001) * ndv);',
'      vec3 diff = (1. - F) * (1. - metal) * alb / PI;',
'      c = (diff + spec) * E;',
          /* faint non-directional ambient (not a light) */
'      c += uAmb * alb * ao * (1. - metal * .9);',
          /* glossy surfaces mirror the fog glow and the lantern itself */
'      vec3 rr = reflect(rd, n);',
'      vec3 Fv = f0 + (1. - f0) * pow(1. - ndv, 5.);',
'      float gloss = (1. - rough) * (1. - rough);',
'      if ((mid < 1.5 && rough < .06) || (metal > .9 && rough < .42)) c += cheapShade(p + n * .01, rr) * Fv * (mid < 1.5 ? .9 : (1. - rough) * ao);',
'      else c += envGlow(p + n * .01, rr, rough) * Fv * gloss * ao * (metal > .5 ? 1. : .9 * (.35 + wet));',
'    }',
'    col = c;',
'  }',
  /* fog between the window and the hit (not in front of the glass) */
'  float tau = fogDepth(ro, rd, t0, t);',
'  float T = exp(-tau);',
'  col = col * T + uFogC * (1. - T);',
'  col += inscatter(ro, rd, t0, t);',
  /* grade: exposure, soft shoulder, gentle split-tone, vignette, dither */
'  col *= uExposure;',
'  col = col * (1. + col / 7.) / (1. + col);',
'  col = pow(max(col, 0.), vec3(1. / 2.2));',
'  float lum = dot(col, vec3(.299, .587, .114));',
'  col = mix(col, col * vec3(.92, .97, 1.08), (1. - lum) * .5);',
'  col = mix(vec3(lum), col, 1.04);',
'  float vig = smoothstep(1.55, .35, length(uv * vec2(.95, 1.05)));',
'  col *= mix(.62, 1., vig);',
'  col += (h21(gl_FragCoord.xy + 17.3) - .5) / 255.;',
'  gl_FragColor = vec4(col, 1.);',
'}'
  ].join('\n');

  /* ------------------------------------------------------------------ */
  /* runtime                                                             */
  /* ------------------------------------------------------------------ */
  var supportCache = null;
  function supported() {
    if (BF_SCENE.disabled) return false;
    if (supportCache != null) return supportCache;
    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl', { failIfMajorPerformanceCaveat: false }) || c.getContext('experimental-webgl');
      if (!gl) return (supportCache = false);
      var hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      supportCache = !!(hp && hp.precision > 0);
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    } catch (e) { supportCache = false; }
    return supportCache;
  }

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  function create(canvas, preset, opts) {
    opts = opts || {};
    if (!supported()) return null;
    var gl;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false,
        premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    } catch (e) { gl = null; }
    if (!gl) return null;

    var P = preset;
    var S = {
      gl: gl, canvas: canvas, preset: P, prog: null, u: {}, ready: false, failed: false,
      pose: { rx: 0, ry: 0 }, eye: [0, 0, 0], drawn: null, dirty: true, motion: false,
      figure: !!P.figure, visible: true, settleT: 0, raf: 0, destroyed: false, lastMs: 0
    };

    var defs = (P.figure ? '#define HAS_FIGURE\n' : '') + (P.prop === 'planted-sword' ? '#define HAS_PROP\n' : '');
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG.replace('precision highp float;', 'precision highp float;\n' + defs));
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.linkProgram(prog);
    var par = gl.getExtension('KHR_parallel_shader_compile');

    function fail(why) {
      if (S.failed || S.destroyed) return;
      S.failed = true;
      if (window.console && console.warn) console.warn('BF_SCENE: falling back to the CSS scene (' + why + ')');
      if (opts.onFail) opts.onFail(why);
    }

    function finishLink() {
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        var log = gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(prog) || 'link failed';
        fail(log.slice(0, 300));
        return;
      }
      S.prog = prog;
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uEye', 'uWinC', 'uWinH', 'uLightP', 'uLightC', 'uAmb', 'uFogC', 'uLightR', 'uExposure', 'uFog',
        'uStreet', 'uArchZ', 'uPost', 'uStone', 'uPlaster', 'uTimber', 'uCloth', 'uTabard', 'uMetal', 'uTrim', 'uBlade',
        'uFig', 'uFigOn', 'uProp', 'uSteps', 'uShSteps'].forEach(function (k) { S.u[k] = gl.getUniformLocation(prog, k); });
      staticUniforms();
      S.ready = true;
      S.dirty = true;
      draw(false);
      if (opts.onReady) opts.onReady(S.api);
    }

    function pollLink() {
      if (S.destroyed) return;
      if (gl.isContextLost()) return;
      if (gl.getProgramParameter(prog, par.COMPLETION_STATUS_KHR)) finishLink();
      else S.raf = requestAnimationFrame(pollLink);
    }

    function staticUniforms() {
      var u = S.u, c = P.camera, L = P.light, f = P.fog, pl = P.palette, st = P.street;
      var a = st.arches || [];
      gl.uniform3f(u.uLightP, L.pos[0], L.pos[1], L.pos[2]);
      gl.uniform3f(u.uLightC, L.color[0] * L.intensity, L.color[1] * L.intensity, L.color[2] * L.intensity);
      gl.uniform1f(u.uLightR, L.radius);
      gl.uniform3fv(u.uAmb, P.ambient);
      gl.uniform3fv(u.uFogC, f.color);
      gl.uniform4f(u.uFog, f.density, f.ground, f.height, f.scatter);
      gl.uniform4f(u.uStreet, st.halfWidth, st.cell, st.seed, 0);
      gl.uniform3f(u.uArchZ, a[0] || 0, a[1] || 0, a[2] || 0);
      gl.uniform2f(u.uPost, P.post[0], P.post[1]);
      gl.uniform3fv(u.uStone, pl.stone); gl.uniform3fv(u.uPlaster, pl.plaster); gl.uniform3fv(u.uTimber, pl.timber);
      gl.uniform3fv(u.uCloth, pl.cloth); gl.uniform3fv(u.uTabard, pl.tabard); gl.uniform3fv(u.uMetal, pl.metal);
      gl.uniform3fv(u.uTrim, pl.trim); gl.uniform3fv(u.uBlade, pl.blade);
      gl.uniform4f(u.uFig, P.figurePos[0], P.figurePos[1], Math.cos(P.figurePos[2]), Math.sin(P.figurePos[2]));
      gl.uniform4f(u.uProp, P.propPos[0], P.propPos[1], P.propPos[2], 0);
      gl.uniform1f(u.uExposure, P.exposure);
      gl.uniform3f(u.uWinC, 0, c.eyeHeight, 0);
    }

    function winHalf() {
      var w = canvas.clientWidth || 292, h = canvas.clientHeight || 280;
      var hw = P.camera.winWidth / 2;
      return [hw, hw * h / w];
    }

    function eyeFor(rx, ry) {
      var R = Math.PI / 180, c = P.camera;
      var vx = -Math.cos(rx * R) * Math.sin(ry * R), vy = -Math.sin(rx * R);
      var k = c.eyeDist * c.parallax;
      return [k * vx, c.eyeHeight + k * vy, c.eyeDist];
    }

    function facing() {
      var R = Math.PI / 180;
      return Math.cos(S.pose.rx * R) * Math.cos(S.pose.ry * R) > 0.02;
    }

    function draw(motion) {
      if (!S.ready || S.destroyed || gl.isContextLost()) return;
      if (!S.visible || document.hidden || !facing()) { S.dirty = true; return; }
      var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      var scale = dpr * quality * (motion ? MOTION_SCALE : 1);
      var cw = canvas.clientWidth || 292, ch = canvas.clientHeight || 280;
      var w = Math.max(32, Math.round(cw * scale)), h = Math.max(32, Math.round(ch * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      var eye = eyeFor(S.pose.rx, S.pose.ry), wh = winHalf(), u = S.u;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.uRes, w, h);
      gl.uniform3f(u.uEye, eye[0], eye[1], eye[2]);
      gl.uniform2f(u.uWinH, wh[0], wh[1]);
      gl.uniform1f(u.uFigOn, S.figure ? 1 : 0);
      var q = motion ? Math.min(quality, 0.8) : quality;
      gl.uniform1i(u.uSteps, Math.round(80 + 120 * q));
      gl.uniform1i(u.uShSteps, Math.round(24 + 44 * q));
      var t0 = performance.now();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      S.lastMs = performance.now() - t0;
      S.eye = eye;
      S.drawn = { rx: S.pose.rx, ry: S.pose.ry, motion: motion, w: w, h: h };
      S.dirty = motion;
      S.frames = (S.frames || 0) + 1;
      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    }

    function settle() {
      clearTimeout(S.settleT);
      S.settleT = setTimeout(function () { if (S.dirty) draw(false); }, SETTLE_MS);
    }

    function setPose(rx, ry) {
      S.pose.rx = rx; S.pose.ry = ry;
      if (!S.ready) { S.dirty = true; return; }
      var e = eyeFor(rx, ry), d = S.drawn;
      var moved = !d || Math.abs(e[0] - S.eye[0]) + Math.abs(e[1] - S.eye[1]) > 0.0004;
      if (!moved) { if (S.dirty) settle(); return; }
      draw(true);
      settle();
    }

    /* off-screen / hidden-tab pause */
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (es) {
        var v = es[es.length - 1].isIntersecting;
        S.visible = v;
        if (v && S.dirty) draw(false);
      });
      io.observe(opts.observe || canvas);
    }
    function onVis() { if (!document.hidden && S.dirty) draw(false); }
    document.addEventListener('visibilitychange', onVis);
    function onResize() { S.dirty = true; settle(); }
    window.addEventListener('resize', onResize);
    function onLost(e) { e.preventDefault(); S.ready = false; }
    function onRestored() { fail('context lost'); }
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    function camera() {
      var e = S.eye, wh = winHalf(), c = P.camera;
      var n = 0.05, f = 80, D = e[2];
      var l = (-wh[0] - e[0]) * n / D, r = (wh[0] - e[0]) * n / D;
      var b = (c.eyeHeight - wh[1] - e[1]) * n / D, t = (c.eyeHeight + wh[1] - e[1]) * n / D;
      var proj = [2 * n / (r - l), 0, 0, 0, 0, 2 * n / (t - b), 0, 0,
        (r + l) / (r - l), (t + b) / (t - b), -(f + n) / (f - n), -1, 0, 0, -2 * f * n / (f - n), 0];
      var view = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -e[0], -e[1], -e[2], 1];
      return { eye: e.slice(), projection: proj, view: view, window: { center: [0, c.eyeHeight, 0], half: wh },
        figure: { position: [P.figurePos[0], 0, P.figurePos[1]], yaw: P.figurePos[2] } };
    }

    S.api = {
      preset: P,
      setPose: setPose,
      setFigure: function (on) { on = !!on && !!P.figure; if (on === S.figure) return; S.figure = on; S.dirty = true; draw(false); },
      render: function () { S.dirty = true; draw(false); },
      camera: camera,
      stats: function () { return { lastMs: S.lastMs, frames: S.frames || 0, drawn: S.drawn, quality: quality, ready: S.ready }; },
      destroy: function () {
        if (S.destroyed) return;
        S.destroyed = true;
        clearTimeout(S.settleT); cancelAnimationFrame(S.raf);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('resize', onResize);
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        var i = live.indexOf(S); if (i >= 0) live.splice(i, 1);
        var lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      },
      _redraw: function () { S.dirty = true; draw(false); }
    };
    live.push(S);

    if (par) S.raf = requestAnimationFrame(pollLink);
    else finishLink();
    return S.failed ? null : S.api;
  }

  var BF_SCENE = {
    PRESETS: PRESETS,
    DEFAULT: DEFAULT,
    disabled: false,
    presetFor: presetFor,
    supported: supported,
    create: create,
    setQuality: function (q) {
      quality = Math.max(0.35, Math.min(1, Number(q) || 1));
      live.forEach(function (S) { S.api._redraw(); });
    },
    getQuality: function () { return quality; }
  };
  window.BF_SCENE = BF_SCENE;
})();
