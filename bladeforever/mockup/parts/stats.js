/* Blade Forever — stats panel. window.BF_STATS = { mount(el, member), update(member) } */
(function () {
  'use strict';

  var uid = 0;
  var host = null;
  var current = null;

  var STAT_DEFS = [
    { key: 'MIG', name: 'Might', note: 'Raw volume of voice' },
    { key: 'VIG', name: 'Vigor', note: 'Staying power' },
    { key: 'INS', name: 'Insight', note: 'Depth of contribution' },
    { key: 'RES', name: 'Resolve', note: 'Loyalty to the hall' }
  ];
  var AXES = [
    { key: 'curious', label: 'Curious' },
    { key: 'supportive', label: 'Supportive' },
    { key: 'technical', label: 'Technical' },
    { key: 'humorous', label: 'Humorous' },
    { key: 'persistent', label: 'Persistent' }
  ];
  var TIERS = { ascendant: 'Ascendant', exalted: 'Exalted', honored: 'Honored', tempered: 'Tempered', footman: 'Footman' };
  var RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : (d == null ? 0 : d); }
  function has(v) { return v !== undefined && v !== null && v !== ''; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fmt(n) { return Math.round(num(n)).toLocaleString('en-US'); }
  function f1(n) { return (Math.round(n * 10) / 10).toString(); }
  function fmtDate(s) {
    if (!has(s)) return '—';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
    if (!m) return esc(s);
    return Number(m[3]) + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1];
  }
  function tierOf(m) {
    var t = String(m.tier || '').toLowerCase();
    return TIERS[t] ? t : 'footman';
  }
  function head(title, sub) {
    return '<header class="bfs-sec-head"><h3 class="bfs-h">' + esc(title) + '</h3>' +
      (sub ? '<span class="bfs-h-sub">' + sub + '</span>' : '') + '</header>';
  }

  /* ---------- identity ---------- */
  function identity(m) {
    var tier = tierOf(m);
    var cells = [
      ['Class', m.cls], ['Level', has(m.level) ? m.level : null], ['Weapon', m.weapon]
    ].filter(function (c) { return has(c[1]); });
    return '<section class="bfs-id" style="--tier:var(--t-' + tier + ')">' +
      '<div class="bfs-id-top">' +
        '<span class="bfs-rank"><span class="bfs-rank-hash">Rank</span><b>' + (has(m.rank) ? esc(m.rank) : '—') + '</b></span>' +
        '<span class="bfs-tier"><i class="bfs-gem" aria-hidden="true"></i>' + esc(TIERS[tier]) + '</span>' +
      '</div>' +
      '<h2 class="bfs-name">' + esc(m.name || m.handle || 'Unnamed') + '</h2>' +
      (has(m.title) ? '<p class="bfs-title">' + esc(m.title) + '</p>' : '') +
      (has(m.handle) ? '<p class="bfs-handle">' + esc(m.handle) + '</p>' : '') +
      '<dl class="bfs-id-meta">' + cells.map(function (c) {
        return '<div><dt>' + c[0] + '</dt><dd>' + esc(c[1]) + '</dd></div>';
      }).join('') + '</dl>' +
    '</section>';
  }

  /* ---------- core stats ---------- */
  function coreStats(m) {
    var s = m.stats || {};
    var rows = STAT_DEFS.map(function (d, i) {
      var raw = num(s[d.key], 0);
      var v = clamp(Math.round(raw), 0, 99);
      return '<li class="bfs-stat bfs-s-' + d.key.toLowerCase() + '" style="--v:' + v + ';--i:' + i + '">' +
        '<div class="bfs-stat-lab"><b class="bfs-stat-key">' + d.key + '</b><span class="bfs-stat-name">' + d.name + '</span></div>' +
        '<div class="bfs-meter" role="meter" aria-label="' + d.name + '" aria-valuemin="0" aria-valuemax="99" aria-valuenow="' + v + '">' +
          '<span class="bfs-meter-fill"></span></div>' +
        '<span class="bfs-stat-val">' + v + '</span>' +
      '</li>';
    }).join('');
    return '<section class="bfs-sec">' + head('Attributes', 'out of 99') + '<ul class="bfs-stats">' + rows + '</ul></section>';
  }

  /* ---------- radar ---------- */
  function radar(m) {
    var p = m.personality || {};
    var id = 'bfsr' + (++uid);
    var W = 500, H = 296, cx = 250, cy = 148, R = 104, n = AXES.length;
    function pt(i, r) {
      var a = (-90 + i * 360 / n) * Math.PI / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }
    var rings = '';
    [20, 40, 60, 80, 100].forEach(function (lv) {
      var pts = AXES.map(function (_, i) { var q = pt(i, R * lv / 100); return f1(q[0]) + ',' + f1(q[1]); }).join(' ');
      rings += '<polygon class="bfs-ring' + (lv === 100 ? ' bfs-ring-out' : '') + '" points="' + pts + '"/>';
    });
    var spokes = AXES.map(function (_, i) {
      var q = pt(i, R); return '<line class="bfs-spoke" x1="' + cx + '" y1="' + cy + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '"/>';
    }).join('');
    var vals = AXES.map(function (a) { return clamp(num(p[a.key], 0), 0, 100); });
    var poly = vals.map(function (v, i) { var q = pt(i, R * v / 100); return f1(q[0]) + ',' + f1(q[1]); }).join(' ');
    var dots = vals.map(function (v, i) {
      var q = pt(i, R * v / 100); return '<circle class="bfs-rdot" cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="4.2"/>';
    }).join('');
    var labels = AXES.map(function (a, i) {
      var q = pt(i, R + 15);
      var c = Math.cos((-90 + i * 360 / n) * Math.PI / 180);
      var anchor = c > 0.3 ? 'start' : (c < -0.3 ? 'end' : 'middle');
      var y1, y2;
      if (i === 0) { y1 = q[1] - 17; y2 = q[1] - 2; }                 /* block above vertex */
      else if (Math.sin((-90 + i * 360 / n) * Math.PI / 180) > 0.5) { y1 = q[1] + 14; y2 = q[1] + 30; } /* below */
      else { y1 = q[1] - 4; y2 = q[1] + 12; }                        /* beside */
      return '<text class="bfs-rlab" x="' + f1(q[0]) + '" y="' + f1(y1) + '" text-anchor="' + anchor + '">' + a.label + '</text>' +
             '<text class="bfs-rval" x="' + f1(q[0]) + '" y="' + f1(y2) + '" text-anchor="' + anchor + '">' + Math.round(vals[i]) + '</text>';
    }).join('');
    var ticks = [50].map(function (lv) {
      return '<text class="bfs-rtick" x="' + (cx + 4) + '" y="' + f1(cy - R * lv / 100 + 3) + '">' + lv + '</text>';
    }).join('');
    return '<section class="bfs-sec">' + head('Temperament', 'five virtues, 0–100') +
      '<svg class="bfs-radar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Personality radar: ' +
      AXES.map(function (a, i) { return a.label + ' ' + Math.round(vals[i]); }).join(', ') + '">' +
      '<defs><radialGradient id="' + id + '" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--ember)" stop-opacity=".55"/><stop offset="1" stop-color="var(--ember-deep)" stop-opacity=".30"/></radialGradient></defs>' +
      rings + spokes + ticks +
      '<g class="bfs-rshape" style="transform-origin:' + cx + 'px ' + cy + 'px"><polygon class="bfs-rpoly" points="' + poly + '" fill="url(#' + id + ')"/>' + dots + '</g>' +
      labels + '</svg></section>';
  }

  /* ---------- hivecoding.gg ---------- */
  function hive(m) {
    var h = m.hive;
    var hexIcon = '<svg class="bfs-hex" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l8 4.6v9.8l-8 4.6-8-4.6V7.1z"/><path d="M12 8l3.6 2.1v4.2L12 16.4l-3.6-2.1v-4.2z"/></svg>';
    var top = '<header class="bfs-hive-head">' + hexIcon +
      '<div><h3 class="bfs-hive-site">hivecoding.gg</h3><p class="bfs-hive-sub">Prompt Engine record &middot; separate source, not chat data</p></div></header>';
    if (!h || typeof h !== 'object') {
      return '<section class="bfs-hive">' + top + '<p class="bfs-empty">No hivecoding.gg record has been matched to this member yet.</p></section>';
    }
    var sug = Math.max(0, Math.round(num(h.suggestions))), used = Math.max(0, Math.round(num(h.used)));
    var rate = has(h.acceptRate) ? clamp(num(h.acceptRate), 0, 1) : (sug ? used / sug : 0);
    var pct = Math.round(rate * 100);
    var best = has(h.bestScore) ? num(h.bestScore).toFixed(2) : '—';
    return '<section class="bfs-hive">' + top +
      '<div class="bfs-hive-body">' +
        '<div class="bfs-ring-wrap" style="--p:' + pct + '">' +
          '<svg viewBox="0 0 64 64" class="bfs-donut" role="img" aria-label="Accept rate ' + pct + ' percent">' +
          '<circle class="bfs-donut-bg" cx="32" cy="32" r="26" pathLength="100"/>' +
          '<circle class="bfs-donut-fg" cx="32" cy="32" r="26" pathLength="100" stroke-dasharray="' + pct + ' 100" transform="rotate(-90 32 32)"/></svg>' +
          '<span class="bfs-donut-num">' + pct + '<small>%</small></span>' +
          '<span class="bfs-donut-cap">accept rate</span>' +
        '</div>' +
        '<dl class="bfs-hive-grid">' +
          '<div><dt>Suggestions</dt><dd>' + fmt(sug) + '</dd></div>' +
          '<div><dt>Used in chat</dt><dd>' + fmt(used) + '</dd></div>' +
          '<div><dt>Best score</dt><dd>' + best + '</dd></div>' +
          '<div><dt>Top category</dt><dd class="bfs-cat">' + (has(h.topCategory) ? esc(h.topCategory) : '—') + '</dd></div>' +
        '</dl>' +
      '</div></section>';
  }

  /* ---------- history ---------- */
  function history(m) {
    var hs = (Array.isArray(m.history) ? m.history : []).filter(function (p) { return p && isFinite(Number(p.messages)); });
    var title = head('Activity', 'messages per active day');
    if (!hs.length) return '<section class="bfs-sec">' + title + '<p class="bfs-empty">No recorded activity yet.</p></section>';
    var id = 'bfsh' + (++uid);
    var W = 600, H = 200, L = 14, Rr = 64, T = 26, B = 44;
    var pw = W - L - Rr, ph = H - T - B, base = T + ph;
    var vals = hs.map(function (p) { return Math.max(0, Number(p.messages)); });
    var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
    var top = Math.max(1, max);
    var iMax = vals.indexOf(max), iMin = vals.indexOf(min);
    var last = hs.length - 1;
    function X(i) { return hs.length === 1 ? L + pw / 2 : L + pw * i / last; }
    function Y(v) { return base - ph * v / top; }
    var pts = vals.map(function (v, i) { return [X(i), Y(v)]; });
    var line = pts.map(function (q, i) { return (i ? 'L' : 'M') + f1(q[0]) + ' ' + f1(q[1]); }).join('');
    var area = line + 'L' + f1(pts[last][0]) + ' ' + base + 'L' + f1(pts[0][0]) + ' ' + base + 'Z';
    var svg = '<svg class="bfs-spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Messages per day, minimum ' + min + ', maximum ' + max + ', latest ' + vals[last] + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ember-deep)" stop-opacity=".42"/><stop offset="1" stop-color="var(--ember-deep)" stop-opacity=".03"/></linearGradient></defs>' +
      '<line class="bfs-grid" x1="' + L + '" x2="' + (L + pw) + '" y1="' + f1(Y(top)) + '" y2="' + f1(Y(top)) + '"/>' +
      '<line class="bfs-grid" x1="' + L + '" x2="' + (L + pw) + '" y1="' + f1(Y(top / 2)) + '" y2="' + f1(Y(top / 2)) + '"/>' +
      '<line class="bfs-base" x1="' + L + '" x2="' + (L + pw) + '" y1="' + base + '" y2="' + base + '"/>';
    if (hs.length > 1) {
      svg += '<path class="bfs-area" d="' + area + '" fill="url(#' + id + ')"/><path class="bfs-line" d="' + line + '" pathLength="1"/>';
    }
    /* min / max markers */
    function lab(i, txt, cls, below) {
      var x = clamp(pts[i][0], L + 22, L + pw - 22), y = pts[i][1] + (below ? 19 : -11);
      return '<circle class="bfs-mark" cx="' + f1(pts[i][0]) + '" cy="' + f1(pts[i][1]) + '" r="3"/>' +
        '<text class="bfs-slab ' + cls + '" x="' + f1(x) + '" y="' + f1(Math.max(12, y)) + '" text-anchor="middle">' + txt + '</text>';
    }
    if (hs.length > 1) {
      if (iMax !== last) svg += lab(iMax, 'peak ' + fmt(max), '');
      if (iMin !== last && iMin !== iMax) svg += lab(iMin, 'low ' + fmt(min), '', true);
    }
    var lp = pts[last];
    svg += '<circle class="bfs-last-halo" cx="' + f1(lp[0]) + '" cy="' + f1(lp[1]) + '" r="9"/><circle class="bfs-last" cx="' + f1(lp[0]) + '" cy="' + f1(lp[1]) + '" r="5"/>' +
      '<text class="bfs-slab bfs-slab-last" x="' + f1(lp[0] + 14) + '" y="' + f1(lp[1] + 5) + '">' + fmt(vals[last]) + (iMax === last && hs.length > 1 ? ' peak' : '') + '</text>';
    var d0 = hs[0].day, d1 = hs[last].day;
    svg += '<text class="bfs-axis" x="' + L + '" y="' + (H - 8) + '">' + (has(d0) ? 'day ' + esc(d0) : 'first') + '</text>' +
      (hs.length > 1 ? '<text class="bfs-axis" x="' + (L + pw) + '" y="' + (H - 8) + '" text-anchor="end">' + (has(d1) ? 'day ' + esc(d1) : 'latest') + '</text>' : '') +
      '</svg>';
    var total = vals.reduce(function (a, b) { return a + b; }, 0);
    var summary = '<p class="bfs-spark-note">' + hs.length + ' active ' + (hs.length === 1 ? 'day' : 'days') + ' &middot; ' + fmt(total) + ' messages &middot; avg ' + f1(total / hs.length) + '</p>';
    return '<section class="bfs-sec">' + title + svg + summary + '</section>';
  }

  /* ---------- chat record ---------- */
  function chat(m) {
    var c = m.chat || {};
    var sc = num(c.superchatTotal, 0);
    var items = [
      ['Messages', fmt(c.messages), 'big'], ['Streams', fmt(c.streams), 'big'],
      ['Streak', fmt(c.streak) + '<small> streams</small>', 'big'], ['Months', fmt(c.months) + '<small> active</small>', 'big'],
      ['First seen', fmtDate(c.firstSeen), ''], ['Last seen', fmtDate(c.lastSeen), ''],
      ['Superchats', sc > 0 ? '$' + sc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'none yet', '']
    ];
    return '<section class="bfs-sec">' + head('Chat record', 'live stream chat') +
      '<dl class="bfs-chat">' + items.map(function (it) {
        return '<div class="' + it[2] + '"><dt>' + it[0] + '</dt><dd>' + it[1] + '</dd></div>';
      }).join('') + '</dl></section>';
  }

  /* ---------- badges ---------- */
  function badges(m) {
    var b = Array.isArray(m.badges) ? m.badges : [];
    var body;
    if (!b.length) {
      body = '<p class="bfs-empty">No badges earned yet. The hall is watching.</p>';
    } else {
      body = '<ul class="bfs-badges">' + b.map(function (x) {
        var r = RARITIES.indexOf(String(x.rarity).toLowerCase()) >= 0 ? String(x.rarity).toLowerCase() : 'common';
        return '<li class="bfs-badge bfs-r-' + r + '"><i class="bfs-bgem" aria-hidden="true"></i>' +
          '<span class="bfs-bname">' + esc(x.name || x.slug) + '</span><span class="bfs-brar">' + r + '</span></li>';
      }).join('') + '</ul>';
    }
    return '<section class="bfs-sec">' + head('Honours', b.length ? b.length + (b.length === 1 ? ' badge' : ' badges') : '') + body + '</section>';
  }

  /* ---------- assemble ---------- */
  function render(m) {
    m = m || {};
    var html =
      '<article class="bfs-sheet">' +
        '<div class="bfs-grain" aria-hidden="true"></div>' +
        '<div class="bfs-inner">' +
          identity(m) + coreStats(m) + radar(m) + hive(m) + history(m) + chat(m) + badges(m) +
        '</div>' +
      '</article>';
    host.innerHTML = html;
    host.classList.remove('bfs-in');
    void host.offsetWidth;
    requestAnimationFrame(function () { requestAnimationFrame(function () { host && host.classList.add('bfs-in'); }); });
  }

  window.BF_STATS = {
    mount: function (el, member) {
      host = el;
      host.classList.add('bfs');
      current = member;
      render(member);
    },
    update: function (member) {
      if (!host) return;
      current = member;
      render(member);
    }
  };
})();
