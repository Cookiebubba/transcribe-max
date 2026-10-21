/* Blade Forever — dataset + derivation logic.  window.BF_DATA
 * Plain script. No DOM, no fetch, no Math.random (seeded PRNG keyed on handle).
 * See data.md for shape, derivations, provenance and the hivecoding.gg merge. */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------------ *
   * REAL INPUT — chat replay al0kXm7r3Kk, first 3.6h, pulled 2026-10-21 *
   * ------------------------------------------------------------------ */
  var RAW = [
    ["@humblelifeskills", 107, "mod member"],
    ["@TheZarion007", 85, ""],
    ["@shmloney", 84, ""],
    ["@byanuragbaral", 65, ""],
    ["@AppsCreative", 56, ""],
    ["@Sam-Amodei", 48, ""],
    ["@davidkang5708", 45, "mod"],
    ["@Ackk53", 40, ""],
    ["@chrislink73", 34, ""],
    ["@rieefq", 33, ""],
    ["@BrandynMakes", 33, "mod member"],
    ["@sumwhat1275", 29, "member"],
    ["@Choso-r6f", 28, ""],
    ["@Zincツ", 28, ""],
    ["@adrianpadurariu", 27, "member"],
    ["@RobbieHyatt", 24, ""],
    ["@IAMYOURFATHERANDYOURMOTHER", 23, ""],
    ["@argofowl", 21, ""],
    ["@iamdonh", 19, "mod"]
  ];
  var BOT = { handle: "@nightbot", messages: 42, wouldRank: 8 };

  /* ------------------------------ constants ------------------------------ */
  var LEDGER_START = "2026-05-01";         // history day 0
  var LEDGER_END = "2026-10-21";           // pull date
  var LEDGER_STREAMS = 60;                 // placeholder ledger length
  var TIERS = ["ascendant", "exalted", "honored", "tempered", "footman"];
  var TITLES_TOP = ["First of the Hall", "Hand of the Hall", "Keeper of the Long Fire",
                    "Ember Sworn", "Voice of the Keep"];
  var TITLES_TIER = { exalted: "Captain of the Hall", honored: "Knight of the Hall",
                      tempered: "Sergeant", footman: "Footman" };
  var CATEGORIES = ["feature", "bugfix", "refactor", "ui", "test", "docs"];
  var WEAPONS = ["Notched Iron", "Footman's Sword", "Oathsteel", "Emberbrand", "Bladeforever"];

  /* ------------------------------- PRNG ---------------------------------- */
  function hash32(str) {                    // FNV-1a
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function prng(handle, salt) {             // mulberry32, keyed on handle+salt
    var a = hash32(handle + "|" + salt);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }   // inclusive

  /* ------------------------- dates (UTC, no locale) ----------------------- */
  var DAY_MS = 86400000;
  function dayToISO(d) { return new Date(Date.parse(LEDGER_START + "T00:00:00Z") + d * DAY_MS).toISOString().slice(0, 10); }
  function isoToDay(s) { return Math.round((Date.parse(s + "T00:00:00Z") - Date.parse(LEDGER_START + "T00:00:00Z")) / DAY_MS); }
  var LAST_DAY = isoToDay(LEDGER_END);

  /* ------------------------ derivations (CARDS.md) ------------------------ */
  function levelFor(msgs) { return clamp(Math.floor(1 + 5.2 * Math.sqrt(msgs)), 1, 60); }
  function mightFor(msgs) { return clamp(Math.round(98 * Math.sqrt(msgs / 107)), 1, 99); }
  function tierFor(rank) { return rank <= 5 ? "ascendant" : rank <= 10 ? "exalted" : rank <= 25 ? "honored" : rank <= 100 ? "tempered" : "footman"; }
  function titleFor(rank, tier) { return tier === "ascendant" ? TITLES_TOP[rank - 1] : TITLES_TIER[tier]; }
  function insightFor(used) { return clamp(Math.round(16 * Math.sqrt(used)), 0, 99); }   // from hive.used ONLY
  function vigourFor(streams) { return clamp(Math.round(streams * 1.8), 0, 99); }
  function resolveFor(months, streak) { return clamp(Math.round(months * 5 + streak * 3.5), 0, 99); }
  function classFor(m) {
    if (m.isMod) return "Warden";
    if (m.hive.used >= 3) return "Artificer";
    if (m.isMember) return "Oathsworn";
    if (m.chat.messages >= 80) return "Chronicler";
    if (m.chat.messages >= 40) return "Journeyman";
    return "Wanderer";
  }
  function weaponFor(months) {
    return months <= 0 ? WEAPONS[0] : months <= 2 ? WEAPONS[1] : months <= 5 ? WEAPONS[2] : months <= 11 ? WEAPONS[3] : WEAPONS[4];
  }
  function acceptRateFor(h) { return h.suggestions > 0 ? Math.round(h.used / h.suggestions * 100) / 100 : 0; }

  // Recompute every derived field from its inputs. Idempotent; also used after hive merge.
  function derive(m) {
    m.hive.acceptRate = acceptRateFor(m.hive);
    m.stats = {
      MIG: mightFor(m.chat.messages),
      VIG: vigourFor(m.chat.streams),
      INS: insightFor(m.hive.used),
      RES: resolveFor(m.chat.months, m.chat.streak)
    };
    m.level = levelFor(m.chat.messages);
    m.cls = classFor(m);
    m.weapon = weaponFor(m.chat.months);
    return m;
  }

  /* ------------------------ placeholder generation ------------------------ */
  function makeHistory(r, messages, streams, flags) {
    var cap = Math.max(3, Math.min(14, Math.ceil(messages / 4)));
    var n = clamp(Math.min(streams, cap, messages), 1, 14);
    var last = LAST_DAY - ri(r, 0, 1);
    var span = Math.max(n - 1, ri(r, 30, Math.min(170, last)));
    var first = last - span;
    var days = {}; days[first] = 1; days[last] = 1;
    var count = Object.keys(days).length;
    while (count < n) { var d = first + ri(r, 0, span); if (!days[d]) { days[d] = 1; count++; } }
    var list = Object.keys(days).map(Number).sort(function (a, b) { return a - b; });
    var w = list.map(function () { return 0.2 + r(); });
    var wsum = w.reduce(function (a, b) { return a + b; }, 0);
    var spare = messages - list.length;
    var alloc = w.map(function (x) { return Math.floor(spare * x / wsum); });
    var rem = spare - alloc.reduce(function (a, b) { return a + b; }, 0);
    for (var i = 0; rem > 0; i = (i + 1) % list.length, rem--) alloc[i]++;
    return list.map(function (d, i) { return { day: d, messages: alloc[i] + 1 }; });
  }

  function initialsFor(name) { var a = name.replace(/[^A-Za-z0-9]/g, ""); return (a.slice(0, 2) || "??").toUpperCase(); }

  function buildPersonality(r, m) {
    var tech = 25 + r() * 30 + m.stats.INS * 0.4;
    var sup = 30 + r() * 30 + (m.isMod ? 22 : 0) + (m.isMember ? 10 : 0);
    var cur = 25 + r() * 40 + Math.min(25, m.hive.suggestions * 0.6);
    var hum = 20 + r() * 60;
    var per = 25 + r() * 30 + m.chat.streak * 3 + m.chat.months * 1.5;
    return { curious: clamp(Math.round(cur), 0, 100), supportive: clamp(Math.round(sup), 0, 100),
             technical: clamp(Math.round(tech), 0, 100), humorous: clamp(Math.round(hum), 0, 100),
             persistent: clamp(Math.round(per), 0, 100) };
  }

  function buildBadges(m) {
    var b = [];
    if (m.isMod) b.push({ slug: "mod-squad", name: "Mod Squad", rarity: "legendary", real: true });
    if (m.isMember) b.push({ slug: "oath-taken", name: "Oath Taken", rarity: "rare", real: true });
    if (m.rank <= 5) b.push({ slug: "top-five", name: "Top Five of the Ledger", rarity: "legendary", real: true });
    if (m.hive.used >= 3) b.push({ slug: "prompt-smith", name: "Prompt Smith", rarity: "epic", real: false });
    if (m.chat.months >= 12) b.push({ slug: "relic-bearer", name: "Relic Bearer", rarity: "legendary", real: false });
    if (m.chat.streak >= 8) b.push({ slug: "unbroken", name: "Unbroken", rarity: "rare", real: false });
    if (m.chat.superchatTotal > 0) b.push({ slug: "patron", name: "Patron of the Hall", rarity: "epic", real: false });
    b.push({ slug: "hall-regular", name: "Hall Regular", rarity: "common", real: true });
    return b;
  }

  function buildMember(row, rank) {
    var handle = row[0], msgs = row[1], flags = row[2];
    var isMod = /\bmod\b/.test(flags), isMember = /\bmember\b/.test(flags);
    var name = handle.replace(/^@/, "");
    var rs = prng(handle, "streams"), rh = prng(handle, "hive"), rm = prng(handle, "months"),
        rk = prng(handle, "streak"), rc = prng(handle, "super"), rp = prng(handle, "persona"),
        rt = prng(handle, "history");

    var streams = clamp(Math.round(3 + 4.2 * Math.sqrt(msgs) * (0.5 + rs())), 2, LEDGER_STREAMS);
    var suggestions = Math.max(1, Math.round(msgs * (0.1 + 0.4 * rh())));
    var used = Math.min(suggestions, Math.round(suggestions * (0.05 + 0.35 * rh())));
    var topCategory = CATEGORIES[Math.floor(rh() * CATEGORIES.length)];
    var bestScore = Math.round((0.35 + 0.6 * rh()) * 100) / 100;
    var months = isMember ? ri(rm, 1, 16) : 0;
    var streak = Math.min(streams, ri(rk, 0, 4) + Math.floor(months * 0.7));
    var superTotal = (rc() < (isMember ? 0.5 : 0.15)) ? ri(rc, 2, 60) : 0;

    var history = makeHistory(rt, msgs, streams);
    var tier = tierFor(rank);
    var m = {
      handle: handle, name: name, initials: initialsFor(name),
      channelId: null,                                  // join key, PENDING (see data.md)
      isBot: false, isMod: isMod, isMember: isMember,
      rank: rank, tier: tier, level: 0, title: titleFor(rank, tier), cls: "", weapon: "",
      stats: { MIG: 0, VIG: 0, INS: 0, RES: 0 },
      personality: null,
      hive: { suggestions: suggestions, used: used, acceptRate: 0, topCategory: topCategory, bestScore: bestScore },
      chat: { messages: msgs, streams: streams, firstSeen: dayToISO(history[0].day),
              lastSeen: dayToISO(history[history.length - 1].day), streak: streak,
              superchatTotal: superTotal, months: months },
      history: history, badges: []
    };
    derive(m);
    m.personality = buildPersonality(rp, m);
    m.badges = buildBadges(m);
    return m;
  }

  function buildBot() {
    return {
      handle: BOT.handle, name: "nightbot", initials: "NI", channelId: null,
      isBot: true, isMod: false, isMember: false, wouldRank: BOT.wouldRank,
      rank: null, tier: null, level: null, title: null, cls: null, weapon: null,
      stats: { MIG: 0, VIG: 0, INS: 0, RES: 0 },
      personality: { curious: 0, supportive: 0, technical: 0, humorous: 0, persistent: 0 },
      hive: { suggestions: 0, used: 0, acceptRate: 0, topCategory: "none", bestScore: 0 },
      chat: { messages: BOT.messages, streams: 0, firstSeen: LEDGER_END, lastSeen: LEDGER_END,
              streak: 0, superchatTotal: 0, months: 0 },
      history: [], badges: []
    };
  }

  /* ------------------------------ provenance ------------------------------ */
  var PROVENANCE = {
    source: "YouTube chat replay al0kXm7r3Kk, first 3.6h, 1,500 events, 154 chatters, pulled 2026-10-21",
    real: ["handle", "name", "initials", "isBot", "isMod", "isMember", "rank", "tier", "title",
           "level", "stats.MIG", "chat.messages"],
    realWhen: {
      "cls": "real only when cls is Warden (first-checked rule; later rules depend on placeholder hive.used) or after hive merge",
      "weapon": "real only for non-members (Notched Iron); member month length is placeholder",
      "chat.months": "0 is real for non-members; member month counts are placeholder",
      "hive.*, stats.INS": "real only after hivecoding.gg merge for that member"
    },
    placeholder: ["channelId", "stats.VIG", "stats.INS", "stats.RES", "personality.*", "hive.*",
                  "chat.streams", "chat.firstSeen", "chat.lastSeen", "chat.streak", "chat.superchatTotal",
                  "chat.months", "history", "badges (entries flagged real:false)", "cls (non-Warden)", "weapon (members)"],
    pending: {
      "channelId": "YouTube channel id from the replay payload (authorChannelId)",
      "hive.*, stats.INS": "hivecoding.gg per-member export, joined on channelId",
      "stats.VIG, chat.streams, firstSeen, lastSeen, streak, history": "backfill of past stream chat replays",
      "chat.months, chat.superchatTotal": "YouTube membership + Super Chat events"
    }
  };
  var REAL_SET = {}; PROVENANCE.real.forEach(function (f) { REAL_SET[f] = true; });

  /* ------------------------------ assemble -------------------------------- */
  var members = RAW.map(function (row, i) { return buildMember(row, i + 1); });
  members.push(buildBot());

  var DATA = {
    members: members,
    meta: {
      schema: "bf-member/1", channel: "MaxBladeTv",
      sample: { streamId: "al0kXm7r3Kk", window: "first 3.6 hours", events: 1500, uniqueChatters: 154, pulled: "2026-10-21" },
      listed: { humans: RAW.length, bots: 1, unlistedChatters: 154 - RAW.length - 1 },
      ledger: { start: LEDGER_START, end: LEDGER_END, historyDayZero: LEDGER_START, streams: LEDGER_STREAMS, placeholder: true },
      rules: { tiers: "1-5 ascendant, 6-10 exalted, 11-25 honored, 26-100 tempered, 101+ footman",
               level: "min(60, floor(1+5.2*sqrt(messages)))", MIG: "min(99, round(98*sqrt(messages/107)))",
               INS: "min(99, round(16*sqrt(hive.used)))", VIG: "min(99, round(1.8*streams))",
               RES: "min(99, round(5*months + 3.5*streak))" },
      hiveMerged: false,
      provenance: PROVENANCE
    }
  };

  /* -------------------------------- helpers ------------------------------- */
  DATA.ranked = function () { return DATA.members.filter(function (m) { return !m.isBot; }); };
  DATA.bots = function () { return DATA.members.filter(function (m) { return m.isBot; }); };
  DATA.byHandle = function (h) {
    for (var i = 0; i < DATA.members.length; i++) if (DATA.members[i].handle === h) return DATA.members[i];
    return null;
  };

  // Is `field` (dotted path, e.g. "stats.VIG") real? Pass the member to resolve conditional fields.
  /* An unrecognised path used to fall through to false, so a typo in the UI
     would silently badge REAL data as placeholder - the exact failure this
     helper exists to prevent. Warn instead of failing quietly. Built lazily so
     it does not depend on declaration order. */
  var KNOWN = null;
  function knownPaths() {
    if (KNOWN) return KNOWN;
    KNOWN = {};
    Object.keys(REAL_SET || {}).forEach(function (f) { KNOWN[f] = 1; });
    var pv = (DATA.meta && DATA.meta.provenance) || {};
    (pv.placeholder || []).forEach(function (f) { KNOWN[f.replace(/\.\*$/, "")] = 1; });
    Object.keys(pv.realWhen || {}).forEach(function (f) { KNOWN[f] = 1; });
    return KNOWN;
  }

  DATA.isReal = function (field, member) {
    var f = String(field);
    var K = knownPaths();
    if (!K[f] && !K[f.split(".")[0]] && typeof console !== "undefined" && console.warn) {
      console.warn('[BF_DATA] isReal(): unrecognised field path "' + f +
        '" - returning false. Compare it against meta.provenance.');
    }
    if (REAL_SET[f]) return true;
    var top = f.split(".")[0];
    if (!member) return false;                       // conservative without a member
    if (member._hiveReal && (top === "hive" || f === "stats.INS")) return true;
    if (f === "cls") return member.cls === "Warden" || !!member._hiveReal && !!member.chat._flagsReal;
    if (f === "weapon" || f === "chat.months") return !member.isMember;
    return false;
  };

  /* ----------------- hivecoding.gg merge (join: channelId) ---------------- */
  // rows: [{channelId, suggestions, used, bestScore, topCategory, acceptRate?}]
  // Also accepts DATA.setChannelIds({handle: "UC..."}) to fill the join key first.
  DATA.setChannelIds = function (map) {
    Object.keys(map).forEach(function (h) { var m = DATA.byHandle(h); if (m) m.channelId = map[h]; });
  };
  DATA.mergeHive = function (rows) {
    var byId = {}, report = { matched: [], bfOnly: [], hiveOnly: [], unjoinable: [] };
    (rows || []).forEach(function (r) { if (r && r.channelId) byId[r.channelId] = r; });
    var seen = {};
    DATA.ranked().forEach(function (m) {
      if (!m.channelId) { report.unjoinable.push(m.handle); return; }   // stays placeholder
      var r = byId[m.channelId]; seen[m.channelId] = true;
      if (r) {
        var sug = Math.max(0, r.suggestions | 0), used = clamp(r.used | 0, 0, sug);
        m.hive = { suggestions: sug, used: used, acceptRate: 0,
                   topCategory: r.topCategory || "none", bestScore: clamp(+r.bestScore || 0, 0, 1) };
        report.matched.push(m.handle);
      } else {                                      // exists here, absent in hive => never prompted (real zeros)
        m.hive = { suggestions: 0, used: 0, acceptRate: 0, topCategory: "none", bestScore: 0 };
        report.bfOnly.push(m.handle);
      }
      m._hiveReal = true; m.chat._flagsReal = true;
      derive(m);
    });
    Object.keys(byId).forEach(function (id) { if (!seen[id]) report.hiveOnly.push(id); });   // no card is minted
    // re-run class-dependent badge (Prompt Smith) from the merged number
    DATA.ranked().forEach(function (m) {
      m.badges = m.badges.filter(function (b) { return b.slug !== "prompt-smith"; });
      if (m.hive.used >= 3) m.badges.unshift({ slug: "prompt-smith", name: "Prompt Smith", rarity: "epic", real: !!m._hiveReal });
    });
    DATA.meta.hiveMerged = report.matched.length > 0 || report.bfOnly.length > 0;
    return report;
  };

  /* -------------------------------- validate ------------------------------ */
  function pearson(xs, ys) {
    var n = xs.length, mx = 0, my = 0, i;
    for (i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; } mx /= n; my /= n;
    var sxy = 0, sxx = 0, syy = 0;
    for (i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); syy += (ys[i] - my) * (ys[i] - my); }
    return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
  }
  function mean(a) { return a.reduce(function (x, y) { return x + y; }, 0) / (a.length || 1); }

  DATA.validate = function () {
    var fails = [], checks = 0;
    function ok(cond, msg) { checks++; if (!cond) fails.push(msg); }
    var hum = DATA.ranked(), bots = DATA.bots();
    var real = {}; RAW.forEach(function (r) { real[r[0]] = r[1]; });

    ok(hum.length === RAW.length, "human member count != 19");
    ok(bots.length === 1 && bots[0].isBot && bots[0].rank === null && bots[0].tier === null, "bot not excluded from ranks");
    ok(hum.every(function (m) { return !m.isBot; }), "bot leaked into ranked()");
    ok(bots[0] && bots[0].chat.messages === 42 && bots[0].wouldRank === 8, "bot message count / wouldRank");

    var shapes = ["handle", "name", "initials", "rank", "tier", "level", "title", "cls", "weapon", "stats",
                  "personality", "hive", "chat", "history", "badges"];
    DATA.members.forEach(function (m) {
      shapes.forEach(function (k) { ok(m[k] !== undefined, m.handle + ": missing " + k); });
      ["MIG", "VIG", "INS", "RES"].forEach(function (k) { ok(typeof m.stats[k] === "number" && m.stats[k] >= 0 && m.stats[k] <= 99, m.handle + ": stat " + k + " out of 0-99"); });
      ["curious", "supportive", "technical", "humorous", "persistent"].forEach(function (k) { ok(typeof m.personality[k] === "number" && m.personality[k] >= 0 && m.personality[k] <= 100, m.handle + ": personality " + k); });
      ["suggestions", "used", "acceptRate", "topCategory", "bestScore"].forEach(function (k) { ok(m.hive[k] !== undefined, m.handle + ": hive." + k); });
      ["messages", "streams", "firstSeen", "lastSeen", "streak", "superchatTotal", "months"].forEach(function (k) { ok(m.chat[k] !== undefined, m.handle + ": chat." + k); });
    });

    var prev = Infinity;
    hum.forEach(function (m, i) {
      var h = m.handle, c = m.chat, hv = m.hive;
      ok(m.rank === i + 1, h + ": rank not contiguous");
      ok(c.messages === real[h], h + ": chat.messages != real count");
      ok(c.messages <= prev, h + ": not ordered by messages"); prev = c.messages;
      ok(m.tier === tierFor(m.rank), h + ": tier != rank band");
      ok(m.level === levelFor(c.messages) && m.level >= 1 && m.level <= 60, h + ": level");
      ok(m.stats.MIG === mightFor(c.messages), h + ": MIG");
      // INS <-> hive.used <-> Artificer
      ok(m.stats.INS === insightFor(hv.used), h + ": INS not derived from hive.used");
      ok((hv.used === 0) === (m.stats.INS === 0), h + ": INS zero-ness disagrees with hive.used");
      ok(hv.used <= hv.suggestions, h + ": used > suggestions");
      ok(Math.abs(hv.acceptRate - (hv.suggestions ? hv.used / hv.suggestions : 0)) <= 0.005, h + ": acceptRate != used/suggestions");
      ok(hv.bestScore >= 0 && hv.bestScore <= 1, h + ": bestScore range");
      ok(m.cls === classFor(m), h + ": class != CARDS.md order");
      ok(!(m.cls === "Artificer" && hv.used < 3), h + ": Artificer with used<3");
      ok(!(hv.used >= 3 && !m.isMod && m.cls !== "Artificer"), h + ": used>=3 non-mod not Artificer");
      ok(!m.isMod || m.cls === "Warden", h + ": mod not Warden");
      // VIG <-> streams ; RES <-> tenure
      ok(m.stats.VIG === vigourFor(c.streams), h + ": VIG not derived from streams");
      ok(m.stats.RES === resolveFor(c.months, c.streak), h + ": RES not derived from months+streak");
      ok(c.streak <= c.streams && c.streak >= 0, h + ": streak > streams");
      ok(c.streams >= 1 && c.streams <= LEDGER_STREAMS, h + ": streams range");
      // membership / weapon
      ok(m.isMember === (c.months > 0), h + ": isMember != (months>0)");
      ok(m.weapon === weaponFor(c.months), h + ": weapon != months band");
      ok(c.months > 0 || m.weapon === "Notched Iron", h + ": months 0 must be Notched Iron");
      ok(c.months === 0 || m.weapon !== "Notched Iron", h + ": member holding Notched Iron");
      // history
      var H = m.history, sum = H.reduce(function (a, e) { return a + e.messages; }, 0), chron = true;
      for (var j = 1; j < H.length; j++) if (H[j].day <= H[j - 1].day) chron = false;
      ok(H.length >= 1, h + ": empty history");
      ok(chron, h + ": history not strictly chronological");
      ok(Math.abs(sum - c.messages) <= Math.max(2, 0.05 * c.messages), h + ": history sum " + sum + " != messages " + c.messages);
      ok(H.length <= c.streams, h + ": more history days than streams");
      ok(H.every(function (e) { return e.messages >= 1 && e.day >= 0 && e.day <= LAST_DAY; }), h + ": history entry range");
      ok(c.firstSeen === dayToISO(H[0].day) && c.lastSeen === dayToISO(H[H.length - 1].day), h + ": first/lastSeen != history ends");
      ok(c.firstSeen <= c.lastSeen && c.lastSeen <= LEDGER_END, h + ": date order");
      // badges / provenance
      ok(m.isMod === m.badges.some(function (b) { return b.slug === "mod-squad"; }), h + ": mod badge mismatch");
      ok(DATA.isReal("stats.INS", m) === false || m._hiveReal, h + ": INS badged real without hive merge");
      ok(DATA.isReal("chat.messages", m) && DATA.isReal("stats.MIG", m), h + ": real fields not badged real");
      ok(!DATA.isReal("stats.VIG", m) && !DATA.isReal("hive.used", m) || m._hiveReal, h + ": placeholder badged real");
    });

    // cross-member correlations
    var strs = hum.map(function (m) { return m.chat.streams; }), vig = hum.map(function (m) { return m.stats.VIG; });
    var mon = hum.map(function (m) { return m.chat.months; }), stk = hum.map(function (m) { return m.chat.streak; });
    var res = hum.map(function (m) { return m.stats.RES; });
    ok(pearson(strs, vig) > 0.95, "VIG/streams correlation too low");
    ok(pearson(mon, res) > 0.3 && pearson(stk, res) > 0.3, "RES/tenure correlation too low");
    ok(pearson(hum.map(function (m) { return m.stats.INS; }), hum.map(function (m) { return m.personality.technical; })) > 0.4, "technical vs INS correlation too low");
    var mods = hum.filter(function (m) { return m.isMod; }), non = hum.filter(function (m) { return !m.isMod; });
    ok(mean(mods.map(function (m) { return m.personality.supportive; })) > mean(non.map(function (m) { return m.personality.supportive; })) + 10, "mods do not skew supportive");
    ok(mods.every(function (m) { return m.personality.supportive >= 50; }), "a mod has supportive < 50");

    // determinism
    var again = buildMember(RAW[0], 1);
    ok(JSON.stringify(again.history) === JSON.stringify(DATA.members[0].history) && again.chat.streams === DATA.members[0].chat.streams, "dataset not deterministic");

    var result = { ok: fails.length === 0, checks: checks, failures: fails };
    if (typeof console !== "undefined") {
      if (fails.length) { console.error("[BF_DATA] " + fails.length + " invariant failure(s) of " + checks + " checks"); fails.forEach(function (f) { console.error("  FAIL " + f); }); }
      else console.log("[BF_DATA] all " + checks + " invariant checks passed");
    }
    return result;
  };

  root.BF_DATA = DATA;
})(typeof window !== "undefined" ? window : globalThis);
