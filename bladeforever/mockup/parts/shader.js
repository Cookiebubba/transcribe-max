/* Blade Forever — page background shader. Exposes window.BF_SHADER = { mount(el), destroy() } */
(function () {
  'use strict';

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uT;',
    'uniform vec3 uVoid,uDeep,uMist,uEmber,uArcane;',
    'float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(17.1,9.7);a*=.5;}return s;}',
    /* drifting ember motes: one cell layer, cheap */
    'float motes(vec2 uv,float t,float sc,float sp){',
    ' vec2 q=uv*sc;q.y-=t*sp;vec2 id=floor(q),f=fract(q)-.5;',
    ' float r=h(id);vec2 o=vec2(h(id+3.1)-.5,h(id+7.7)-.5)*.6;',
    ' o.x+=sin(t*.35+r*20.)*.15;',
    ' float d=length(f-o);float tw=.5+.5*sin(t*.8+r*40.);',
    ' return step(.90,r)*smoothstep(.11,0.,d)*tw;}',
    'void main(){',
    ' vec2 frag=gl_FragCoord.xy;vec2 uv=frag/uRes;',
    ' float asp=uRes.x/uRes.y;vec2 p=vec2(uv.x*asp,uv.y);',
    ' float t=uT;',
    /* fog: warped fbm, slow upward drift + lateral sway */
    ' vec2 q=p*1.6+vec2(t*.010,-t*.014);',
    ' vec2 w=vec2(fbm(q+vec2(0.,t*.02)),fbm(q+vec2(5.2,1.3)-t*.015));',
    ' float f1=fbm(q+1.7*w);',
    ' float f2=fbm(p*3.1+vec2(-t*.02,t*.03)+w);',
    ' float fog=smoothstep(.3,.75,f1)*.8+f2*.3;',
    /* base: stone-dark gradient, lighter toward lower-middle */
    ' vec3 col=mix(uDeep,uVoid,smoothstep(.1,1.,uv.y));',
    ' col=mix(col,uMist*1.35,fog*(.7+.3*(1.-uv.y)));',
    /* lights */
    ' vec2 le=vec2(.28*asp,-.08);float de=length((p-le)*vec2(.7,1.15));',
    ' float em=exp(-de*2.6)*(.7+.3*fbm(p*2.+t*.05));',
    ' col+=uEmber*em*.22*(.55+fog*.7);',
    ' vec2 la=vec2(.78*asp,1.05);float da=length((p-la)*vec2(.6,1.));',
    ' float ar=exp(-da*2.4)*(.8+.2*sin(t*.12));',
    ' col+=uArcane*ar*.16*(.5+fog*.8);',
    /* slow arcane shimmer: faint drifting caustic veil in the upper half */
    ' float sh=fbm(p*5.+vec2(t*.03,-t*.02)+w*2.);',
    ' sh=smoothstep(.55,.9,sh)*smoothstep(.35,1.,uv.y);',
    ' col+=uArcane*sh*.035;',
    /* motes */
    ' float m=motes(p,t,14.,.05)+.6*motes(p+4.7,t,24.,.035);',
    ' m*=.35+smoothstep(0.,.8,1.-uv.y);',
    ' col+=uEmber*m*.5;',
    /* vignette */
    ' vec2 v=uv-.5;float vig=smoothstep(.95,.25,length(v*vec2(1.,.9)));',
    ' col*=mix(.45,1.,vig);',
    /* dither to avoid banding */
    ' col+=(h(frag+fract(t))-.5)/255.;',
    ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  var DEFAULTS = { void: '#07080b', deep: '#0d1016', mist: '#161b25', ember: '#e0954a', arcane: '#7aa8d8' };
  var STYLE_ID = 'bf-shader-style';

  var state = null;

  function hex(s) {
    s = String(s || '').trim();
    if (s.charAt(0) !== '#') return null;
    if (s.length === 4) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    if (s.length !== 7) return null;
    var n = parseInt(s.slice(1), 16);
    if (isNaN(n)) return null;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function palette() {
    var out = {}, cs = null;
    try { cs = getComputedStyle(document.documentElement); } catch (e) {}
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = cs ? hex(cs.getPropertyValue('--' + k)) : null;
      out[k] = v || hex(DEFAULTS[k]);
    });
    return out;
  }

  function injectCss() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '.bf-shader{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;background:' + DEFAULTS.void + '}' +
      '.bf-shader-fallback{background:' +
      'radial-gradient(ellipse 60% 50% at 28% 108%,rgba(224,149,74,.16),transparent 70%),' +
      'radial-gradient(ellipse 55% 45% at 78% -6%,rgba(122,168,216,.12),transparent 70%),' +
      'linear-gradient(180deg,' + DEFAULTS.deep + ',' + DEFAULTS.void + ');background-size:100% 100%,100% 100%,100% 100%}' +
      '.bf-shader-fallback::after{content:"";position:absolute;inset:-20%;' +
      'background:radial-gradient(ellipse 40% 30% at 30% 60%,rgba(22,27,37,.8),transparent 70%),radial-gradient(ellipse 45% 35% at 70% 40%,rgba(22,27,37,.7),transparent 70%);' +
      'animation:bf-fog-drift 60s ease-in-out infinite alternate}' +
      '@keyframes bf-fog-drift{from{transform:translate3d(-4%,3%,0)}to{transform:translate3d(4%,-3%,0)}}' +
      '@media (prefers-reduced-motion:reduce){.bf-shader-fallback::after{animation:none}}';
    document.head.appendChild(s);
  }

  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed');
    return s;
  }

  function setupGL(canvas) {
    var gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false }) ||
             canvas.getContext('experimental-webgl');
    if (!gl) throw new Error('no webgl');
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link failed');
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var u = {};
    ['uRes', 'uT', 'uVoid', 'uDeep', 'uMist', 'uEmber', 'uArcane'].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });
    var pal = palette();
    gl.uniform3fv(u.uVoid, pal.void);
    gl.uniform3fv(u.uDeep, pal.deep);
    gl.uniform3fv(u.uMist, pal.mist);
    gl.uniform3fv(u.uEmber, pal.ember);
    gl.uniform3fv(u.uArcane, pal.arcane);
    return { gl: gl, prog: prog, buf: buf, u: u };
  }

  function mount(el) {
    if (state) destroy();
    var host = el || document.body;
    var S = state = { host: host, raf: 0, running: false, canvas: null, g: null, rt: 0, t0: 0, still: reduced(), lost: false };
    try { injectCss(); } catch (e) {}

    var canvas = document.createElement('canvas');
    canvas.className = 'bf-shader';
    canvas.setAttribute('aria-hidden', 'true');
    S.canvas = canvas;
    host.insertBefore(canvas, host.firstChild);

    try {
      S.g = setupGL(canvas);
    } catch (e) {
      S.g = null;
      canvas.className = 'bf-shader bf-shader-fallback';
      return;
    }

    /* Fog is low-frequency: render at 0.6 of CSS pixels, DPR capped at 1.5. */
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
      var w = Math.max(2, Math.round(window.innerWidth * dpr));
      var h = Math.max(2, Math.round(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      S.g.gl.viewport(0, 0, w, h);
      S.g.gl.uniform2f(S.g.u.uRes, w, h);
    }

    function draw(t) {
      var g = S.g; if (!g || S.lost) return;
      g.gl.uniform1f(g.u.uT, t);
      g.gl.drawArrays(g.gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      S.raf = 0;
      if (!S.running) return;
      draw(S.offset + (now - S.t0) / 1000);
      S.raf = requestAnimationFrame(frame);
    }

    function start() {
      if (S.running || S.still || document.hidden || S.lost) return;
      S.running = true;
      S.t0 = performance.now();
      S.raf = requestAnimationFrame(frame);
    }
    function stop() {
      S.running = false;
      if (S.raf) cancelAnimationFrame(S.raf);
      S.raf = 0;
      S.offset = (S.offset || 0) + (performance.now() - S.t0) / 1000;
    }
    S.offset = 20 + Math.random() * 40; /* time offset so first frame is already mid-drift */

    S.onVis = function () { if (document.hidden) { if (S.running) stop(); } else start(); };
    S.onResize = function () {
      clearTimeout(S.rt);
      S.rt = setTimeout(function () {
        if (!state) return;
        size();
        if (!S.running) draw(S.offset);
      }, 150);
    };
    S.onLost = function (e) { e.preventDefault(); S.lost = true; stop(); };
    S.onRestored = function () {
      try { S.g = setupGL(canvas); S.lost = false; size(); S.still ? draw(S.offset) : start(); }
      catch (e) { canvas.className = 'bf-shader bf-shader-fallback'; }
    };
    S.onMotion = function () {
      var r = reduced();
      if (r === S.still) return;
      S.still = r;
      if (r) { if (S.running) stop(); draw(S.offset); } else start();
    };

    document.addEventListener('visibilitychange', S.onVis);
    window.addEventListener('resize', S.onResize);
    canvas.addEventListener('webglcontextlost', S.onLost);
    canvas.addEventListener('webglcontextrestored', S.onRestored);
    try {
      S.mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (S.mq.addEventListener) S.mq.addEventListener('change', S.onMotion);
    } catch (e) {}

    size();
    draw(S.offset); /* always paint one frame immediately */
    start();
  }

  function destroy() {
    var S = state;
    if (!S) return;
    state = null;
    S.running = false;
    if (S.raf) cancelAnimationFrame(S.raf);
    clearTimeout(S.rt);
    document.removeEventListener('visibilitychange', S.onVis);
    window.removeEventListener('resize', S.onResize);
    try { if (S.mq && S.mq.removeEventListener) S.mq.removeEventListener('change', S.onMotion); } catch (e) {}
    if (S.canvas) {
      S.canvas.removeEventListener('webglcontextlost', S.onLost);
      S.canvas.removeEventListener('webglcontextrestored', S.onRestored);
      try {
        if (S.g) {
          var ext = S.g.gl.getExtension('WEBGL_lose_context');
          if (ext) ext.loseContext();
        }
      } catch (e) {}
      if (S.canvas.parentNode) S.canvas.parentNode.removeChild(S.canvas);
    }
    S.g = null;
  }

  window.BF_SHADER = { mount: mount, destroy: destroy };
})();
