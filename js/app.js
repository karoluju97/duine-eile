/* Duine Eile demo app. No server: the account, joins, posts and chats are kept
   in this browser's localStorage so the demo works on GitHub Pages. */
(function () {
  'use strict';

  const D = window.DuineData;
  const KEY = 'duine-eile-demo-v1';
  const appEl = document.getElementById('app');
  const topEl = document.getElementById('topbar');
  const tabEl = document.getElementById('tabbar');

  const DATA = D.build(new Date());
  const VENUES = {};
  DATA.venues.forEach(function (v) { VENUES[v.id] = v; });

  const GREETINGS = {
    football: 'Legend, that sorts us. Bring a light and a dark top.',
    padel: 'Great stuff, court is booked. See you there.',
    hiking: "Brilliant. We'll meet at the car park 10 minutes before.",
    swimming: "Nice one. Water's about 12 degrees, bring something warm for after.",
    running: "Welcome aboard. We'll set off right on time.",
    cycling: 'Perfect, we roll out on the dot. Bring a spare tube.',
    boardgames: "Great, that's a full table. Snacks welcome.",
    gaelic: "Great, that's us with full sides. See you at the pitch.",
    basketball: "Nice, that's teams sorted.",
    tennis: 'Brilliant, doubles is on.',
    golf: 'Grand, tee time is booked.',
    gym: 'Sound, see you there.',
    climbing: "Great, I'll meet you at the front desk.",
    surfing: "Class. I'll post a surf check that morning.",
    walking: "Lovely, we'll head off on time.",
    yoga: 'Lovely, see you there.',
    gaming: "Nice one, I'll drop the invite in here before we start.",
    volleyball: "Great, that's both teams full.",
    pickleball: 'Brilliant, doubles is on.',
    badminton: 'Great, court is booked.',
    dancing: 'Lovely, see you on the floor.',
    chess: 'Great, see you there.',
    quiz: "Class, that's the team sorted.",
    darts: 'Sound, see you at the oche.',
    pool: 'Sound, see you there.'
  };
  const REPLIES = [
    'Grand, see you there.',
    'Nice one, the more the merrier.',
    "I'll be the one in the green jacket.",
    'Perfect. Running a few minutes early if anyone wants to meet first.',
    'Sound, thanks for filling the spot.'
  ];

  /* ---------- state ---------- */
  function blank() {
    return {
      user: null, account: null, signedOut: false, draft: null,
      joined: [], waitlist: [], posted: [], chats: {}, reported: {},
      filters: { activity: 'foryou', level: 'all', day: 'any' }
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s === 'object') return Object.assign(blank(), s);
      }
    } catch (e) { /* storage blocked: run in memory */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  let state = load();
  const ui = { resetArmed: false, error: null, copied: false, signinMode: 'login' };
  const MAP = window.DuineMap;
  const JOIN_STEPS = ['username', 'age', 'county', 'activities', 'level'];
  function signedIn() { return !!state.user && !state.signedOut; }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function now() { return new Date(); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function fmtDate(d) { return d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' }); }
  function fmtTime(d) {
    let h = d.getHours(); const m = d.getMinutes();
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + ':' + String(m).padStart(2, '0') + ap;
  }
  function dayName(d) {
    const diff = Math.round((startOfDay(d) - startOfDay(now())) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return fmtDate(d);
  }
  function when(g) { const d = new Date(g.start); return dayName(d) + ' · ' + fmtTime(d); }
  function isoDate(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  function act(id) { return D.ACTIVITIES[id]; }
  function levelsFor(activity) { return D.LEVELS[act(activity).kind]; }
  function levelName(id) {
    const all = D.LEVELS.player.concat(D.LEVELS.route);
    const l = all.find(function (x) { return x.id === id; });
    return l ? l.name : id;
  }
  function initials(h) { return h.replace(/[^a-z0-9]/gi, ' ').trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase(); }

  function allGames() { return DATA.games.concat(state.posted); }
  function getGame(id) { return allGames().find(function (g) { return g.id === id; }); }
  function isJoined(g) { return state.joined.indexOf(g.id) >= 0; }
  function isWaiting(g) { return state.waitlist.indexOf(g.id) >= 0; }
  function isMine(g) { return !!g.mine; }
  function going(g) { return 1 + (g.friends || 0) + g.players.length + (isJoined(g) ? 1 : 0); }
  function spotsLeft(g) { return Math.max(0, g.size - going(g)); }
  function endOf(g) { return new Date(new Date(g.start).getTime() + act(g.activity).minutes * 60000); }
  function isOver(g) { return now() > endOf(g); }
  function chatDeletesAt(g) { return addDays(startOfDay(new Date(g.start)), 2); } // midnight at the end of the day after
  function chatDeleted(g) { return now() >= chatDeletesAt(g); }
  function activitiesIn(county) {
    return D.ORDER.filter(function (a) { return DATA.venues.some(function (v) { return v.county === county && v.activity === a; }); });
  }
  function venuesIn(county, activity) {
    return DATA.venues.filter(function (v) { return v.county === county && (!activity || v.activity === activity); });
  }

  function spotTag(g) {
    if (isOver(g)) return '<span class="tag tag-grey">Finished</span>';
    const left = spotsLeft(g);
    if (left === 0) return '<span class="tag tag-grey">' + (isJoined(g) || isMine(g) ? 'Full' : 'Full · waitlist') + '</span>';
    if (left === 1) return '<span class="tag tag-hot">1 spot left</span>';
    return '<span class="tag tag-ok">' + left + ' spots</span>';
  }

  function icon(name) {
    const paths = {
      pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
      back: '<path d="M15 18l-6-6 6-6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
      games: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M9 4v6"/>',
      mine: '<path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="8" r="4"/><path d="M16 3l2 2 3-3"/>',
      map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
    };
    return '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
  }

  /* ---------- routing ---------- */
  function parseHash() {
    let h = location.hash.replace(/^#\/?/, '');
    let q = '';
    const i = h.indexOf('?');
    if (i >= 0) { q = h.slice(i + 1); h = h.slice(0, i); }
    const params = {};
    q.split('&').forEach(function (p) {
      if (!p) return;
      const kv = p.split('=');
      params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return { parts: h.split('/').filter(Boolean), params: params };
  }
  function go(hash) {
    if (location.hash === hash) render(); else location.hash = hash;
  }

  function render() {
    const r = parseHash();
    let page = r.parts[0] || 'games';
    if (!signedIn()) {
      if (page !== 'join' || !state.draft) page = 'welcome';
    } else if (page === 'welcome' || page === 'join') page = 'games';

    let html, title;
    switch (page) {
      case 'join': html = viewJoin(r.parts[1], parseInt(r.parts[2], 10) || 0); title = 'Create your account'; break;
      case 'game': html = viewGame(r.parts[1]); title = 'Game'; break;
      case 'post': html = viewPost(r.params); title = 'Post a game'; break;
      case 'mine': html = viewMine(); title = 'My games'; break;
      case 'venues': html = viewVenues(); title = 'Venues'; break;
      case 'profile': html = viewProfile(); title = 'Profile'; break;
      case 'welcome': html = viewWelcome(); title = ui.signinMode === 'login' ? 'Log in' : 'Create an account'; break;
      default: page = 'games'; html = viewFeed(); title = 'Games in ' + state.user.county;
    }
    renderChrome(page);
    appEl.innerHTML = html;
    document.title = title + ' · Duine Eile';
    ui.error = null;
    const log = document.getElementById('chat-log');
    if (log) log.scrollTop = log.scrollHeight;
  }

  function renderChrome(page) {
    if (!signedIn()) {
      topEl.innerHTML ='<div class="topbar-inner"><a class="brand" href="#/"><span class="brand-mark" aria-hidden="true">+1</span><span>Duine Eile</span></a></div>';
      tabEl.innerHTML = '';
      tabEl.hidden = true;
      return;
    }
    const upcomingMine = allGames().filter(function (g) { return (isJoined(g) || isMine(g)) && !isOver(g); }).length;
    const links = [
      ['games', '#/', 'Games', 'games'],
      ['mine', '#/mine', 'My games', 'mine'],
      ['venues', '#/venues', 'Venues', 'map'],
      ['profile', '#/profile', 'Profile', 'user']
    ];
    const nav = function (cls) {
      return links.map(function (l) {
        const badge = l[0] === 'mine' && upcomingMine ? '<span class="badge" aria-label="' + upcomingMine + ' upcoming">' + upcomingMine + '</span>' : '';
        return '<a class="' + cls + (page === l[0] ? ' active' : '') + '" href="' + l[1] + '"' + (page === l[0] ? ' aria-current="page"' : '') + '>' + icon(l[3]) + '<span>' + l[2] + '</span>' + badge + '</a>';
      }).join('');
    };
    const counties = D.COUNTIES.map(function (c) {
      return '<option' + (c === state.user.county ? ' selected' : '') + '>' + c + '</option>';
    }).join('');
    topEl.innerHTML =
      '<div class="topbar-inner">' +
        '<a class="brand" href="#/"><span class="brand-mark" aria-hidden="true">+1</span><span>Duine Eile</span></a>' +
        '<nav class="nav-desktop" aria-label="Main">' + nav('nav-link') + '</nav>' +
        '<div class="topbar-right">' +
          '<label class="county-switch">' + icon('pin') + '<span class="sr-only">Your county</span>' +
            '<select data-change="county">' + counties + '</select></label>' +
          '<a class="btn btn-dark btn-sm post-top" href="#/post">' + icon('plus') + '<span>Post a game</span></a>' +
        '</div>' +
      '</div>';
    tabEl.hidden = false;
    tabEl.innerHTML = nav('tab-link');
  }

  /* ---------- views ---------- */
  /* ----- sign in ----- */
  function viewWelcome() {
    const login = ui.signinMode === 'login';
    const social = ['Apple', 'Google', 'Facebook'].map(function (p) {
      return '<button type="button" class="btn btn-lg btn-block ' + (p === 'Apple' ? 'btn-dark' : 'btn-outline') + '" data-action="social" data-provider="' + p + '">Continue with ' + p + '</button>';
    }).join('');
    return '' +
      '<section class="auth">' +
        '<div class="auth-intro">' +
          '<span class="brand-tile" aria-hidden="true">+1</span>' +
          '<h1 class="display">Short a player?<br>Find one more.</h1>' +
          '<p class="lead">Games, hikes, swims and board game nights near you.</p>' +
          '<ol class="steps">' +
            '<li><b>Pick your county.</b> See what\'s on near you this week.</li>' +
            '<li><b>Say "I\'m in".</b> A group chat opens for that game.</li>' +
            '<li><b>Turn up.</b> The chat deletes the day after.</li>' +
          '</ol>' +
        '</div>' +
        '<div class="card auth-card">' +
          '<div class="seg" role="group" aria-label="Log in or create an account">' +
            '<button type="button" class="seg-btn' + (login ? ' on' : '') + '" aria-pressed="' + login + '" data-action="signin-mode" data-value="login">Log in</button>' +
            '<button type="button" class="seg-btn' + (!login ? ' on' : '') + '" aria-pressed="' + !login + '" data-action="signin-mode" data-value="create">Create account</button>' +
          '</div>' +
          (ui.error ? '<p class="error" role="alert">' + esc(ui.error) + '</p>' : '') +
          '<form class="auth-form" data-form="signin" novalidate>' +
            '<div class="field"><label for="si-email">Email</label><input id="si-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" value="' + esc(ui.lastEmail || '') + '"></div>' +
            '<div class="field"><div class="label-row"><label for="si-pass">Password</label>' + (login ? '<button type="button" class="link-btn" data-action="forgot">Forgot it?</button>' : '') + '</div>' +
              '<input id="si-pass" name="password" type="password" autocomplete="' + (login ? 'current-password' : 'new-password') + '">' +
              '</div>' +
            '<button class="btn btn-primary btn-lg btn-block" type="submit">' + (login ? 'Log in' : 'Create account') + '</button>' +
          '</form>' +
          '<div class="divider"><span>or</span></div>' +
          '<div class="social">' + social + '</div>' +
          '<p class="auth-foot">' + (login
            ? 'New here? <button type="button" class="link-btn strong" data-action="signin-mode" data-value="create">Create an account</button>'
            : 'Already have an account? <button type="button" class="link-btn strong" data-action="signin-mode" data-value="login">Log in</button>') + '</p>' +
          '<p class="muted small center">18+ only.</p>' +
        '</div>' +
      '</section>';
  }

  /* ----- sign-up steps, one question per screen ----- */
  function stepHead(n, back) {
    let bars = '';
    for (let i = 1; i <= JOIN_STEPS.length; i++) bars += '<span class="' + (i <= n ? 'done' : '') + '"></span>';
    return '<div class="step-head">' +
      '<div class="step-top"><a class="icon-btn" href="' + back + '" aria-label="Back">' + icon('back') + '</a>' +
      '<span class="step-count">Step ' + n + ' of ' + JOIN_STEPS.length + '</span></div>' +
      '<div class="step-bars" aria-hidden="true">' + bars + '</div></div>';
  }
  function joinTitle(eyebrow, title, sub) {
    return '<div class="join-title">' + (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + '</p>' : '') +
      '<h1 class="display">' + esc(title) + '</h1>' + (sub ? '<p class="lead">' + sub + '</p>' : '') + '</div>';
  }
  function nextBtn(label, ok, step) {
    return '<div class="join-actions"><button type="button" class="btn btn-dark btn-lg btn-block"' + (ok ? '' : ' disabled aria-disabled="true"') +
      ' data-action="j-next" data-step="' + step + '">' + esc(label) + '</button></div>';
  }
  function errorBox() { return ui.error ? '<p class="error" role="alert">' + esc(ui.error) + '</p>' : ''; }

  function viewJoin(step, sub) {
    const d = state.draft;
    if (JOIN_STEPS.indexOf(step) < 0) step = 'username';
    let html;
    if (step === 'username') {
      html = stepHead(1, '#/') +
        joinTitle('', 'Pick a username') +
        errorBox() +
        '<form class="join-form" data-form="j-username" novalidate>' +
          '<div class="field"><label for="j-name">Username</label>' +
          '<input id="j-name" class="input-lg" name="username" autocomplete="off" maxlength="20" placeholder="e.g. sunday_swimmer" value="' + esc(d.username || '') + '">' +
          '</div>' +
          '<div class="join-actions"><button class="btn btn-dark btn-lg btn-block" type="submit">Next</button></div>' +
        '</form>';
    } else if (step === 'age') {
      const chips = D.AGE_GROUPS.map(function (g) {
        const on = d.ageGroup === g;
        return '<button type="button" class="choice' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-action="j-age" data-value="' + g + '">' + g + '</button>';
      }).join('');
      html = stepHead(2, '#/join/username') +
        joinTitle('', 'What\'s your age group?') +
        '<div class="choice-grid" role="radiogroup" aria-label="Age group">' + chips + '</div>' +
        '<label class="toggle-card"><b>Show it on my profile</b>' +
          '<input type="checkbox" data-change="j-showage"' + (d.showAge !== false ? ' checked' : '') + '></label>' +
        nextBtn('Next', !!d.ageGroup, 'age');
    } else if (step === 'county') {
      html = '<div class="join-wide">' + stepHead(3, '#/join/age') + '</div>' +
        '<div class="county-step">' +
          joinTitle('', 'Where are you based?') +
          '<div class="map-card">' + mapSvg(d.county) + '</div>' +
          '<div class="selected-bar"><span><span class="muted small">Selected</span><b>' + esc(d.county || 'None yet') + '</b></span></div>' +
          '<div class="county-list">' + countyList(d.county) + '</div>' +
          nextBtn(d.county ? 'Next · ' + d.county : 'Pick a county', !!d.county, 'county') +
        '</div>';
    } else if (step === 'activities') {
      const acts = activitiesIn(d.county);
      d.activities = (d.activities || []).filter(function (a) { return acts.indexOf(a) >= 0; });
      const tiles = acts.map(function (a) {
        const on = d.activities.indexOf(a) >= 0;
        return '<button type="button" class="tile' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-action="j-act" data-value="' + a + '">' +
          actIcon(a) + '<span>' + esc(act(a).name) + '</span></button>';
      }).join('');
      const n = d.activities.length;
      html = stepHead(4, '#/join/county') +
        joinTitle('', 'What are you into?') +
        '<div class="tile-grid">' + tiles + '</div>' +
        nextBtn(n ? 'Next · ' + n + ' picked' : 'Pick at least one', n > 0, 'activities');
    } else {
      const list = d.activities || [];
      if (!list.length) { location.hash = '#/join/activities'; return ''; }
      const i = Math.min(sub, list.length - 1);
      const a = list[i];
      const chosen = (d.levels || {})[a];
      const opts = levelsFor(a).map(function (l) {
        const on = chosen === l.id;
        return '<button type="button" class="choice choice-wide' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-action="j-level" data-act="' + a + '" data-value="' + l.id + '">' +
          '<b>' + esc(l.name) + '</b><span>' + esc(l.desc) + '</span></button>';
      }).join('');
      const last = i === list.length - 1;
      html = stepHead(5, i === 0 ? '#/join/activities' : '#/join/level/' + (i - 1)) +
        joinTitle(act(a).name + ' · ' + (i + 1) + ' of ' + list.length, act(a).kind === 'player' ? 'How do you play?' : 'What pace suits you?') +
        '<div class="choice-list" role="radiogroup" aria-label="Level for ' + esc(act(a).name) + '">' + opts + '</div>' +
        '<div class="join-actions"><button type="button" class="btn btn-dark btn-lg btn-block"' + (chosen ? '' : ' disabled aria-disabled="true"') +
          ' data-action="j-next" data-step="level" data-index="' + i + '">' + (last ? 'Finish' : 'Next: ' + esc(act(list[i + 1]).name)) + '</button></div>';
    }
    return '<section class="join join-' + step + '">' + html + '</section>';
  }

  function countyList(selected) {
    return D.PROVINCES.map(function (p) {
      return '<div class="province"><h2 class="filter-title">' + esc(p.name) + '</h2><div class="chip-row">' +
        p.counties.map(function (c) {
          const on = c === selected;
          return '<button type="button" class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-action="j-county" data-value="' + c + '">' + c + '</button>';
        }).join('') + '</div></div>';
    }).join('');
  }

  function mapSvg(selected) {
    const parts = Object.keys(MAP.counties).map(function (name) {
      const c = MAP.counties[name];
      if (name === 'NI') return '<path class="ni" d="' + c.d + '"/>';
      const on = name === selected;
      return '<path class="county' + (on ? ' on' : '') + '" d="' + c.d + '" role="button" tabindex="0" aria-label="' + name + '" aria-pressed="' + on + '" data-action="j-county" data-value="' + name + '"/>';
    }).join('');
    const sel = selected && MAP.counties[selected]
      ? '<text class="map-sel" x="' + MAP.counties[selected].c[0] + '" y="' + (MAP.counties[selected].c[1] + 5) + '" text-anchor="middle">' + esc(selected) + '</text>' : '';
    const ni = MAP.counties.NI.c;
    return '<svg class="ireland" viewBox="0 0 ' + MAP.w + ' ' + MAP.h + '" role="group" aria-label="Map of Ireland. Choose your county.">' +
      '<g class="counties">' + parts + '</g>' + sel +
      '<text class="map-ni" x="' + (ni[0] + 18) + '" y="' + (ni[1] - 4) + '" text-anchor="middle">Northern Ireland</text>' +
      '<text class="map-ni" x="' + (ni[0] + 18) + '" y="' + (ni[1] + 12) + '" text-anchor="middle">not covered yet</text>' +
      '<g id="map-tip" visibility="hidden" aria-hidden="true"><rect rx="14" height="28"/><text text-anchor="middle"></text></g>' +
    '</svg>';
  }

  function actIcon(a) {
    const paths = {
      football: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 8l3.8 2.8-1.5 4.4H9.7L8.2 10.8z',
      padel: 'M12 2.5c3.6 0 6 2.6 6 6.2c0 3.3-2.3 5.8-4.5 6.6V21h-3v-5.7C8.3 14.5 6 12 6 8.7C6 5.1 8.4 2.5 12 2.5zM10 7h.01M14 7h.01M12 10h.01',
      hiking: 'M3 20l6-10 4 6 3-4 5 8z',
      swimming: 'M3 15c2 0 2-1.5 4.5-1.5S10 15 12 15s2-1.5 4.5-1.5S19 15 21 15M3 19c2 0 2-1.5 4.5-1.5S10 19 12 19s2-1.5 4.5-1.5S19 19 21 19M15 4a2 2 0 1 0 0.01 0M7 11l4-3 3 3',
      running: 'M14 3a2 2 0 1 0 0.01 0M7 21l3-6 3 2v4M10 15l1.5-6 4 2.5 3-1M11.5 9l-3.5 1.5-2 3',
      cycling: 'M5.5 13a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7zM18.5 13a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7zM5.5 16.5L10 9h5l3.5 7.5M10 9l2.5 7.5M14 5h2',
      boardgames: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01',
      gaelic: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM4 9c5 1.5 11 1.5 16 0M4 15c5-1.5 11-1.5 16 0',
      basketball: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3v18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8',
      tennis: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM5.5 5.8c3.5 3.2 3.5 9.2 0 12.4M18.5 5.8c-3.5 3.2-3.5 9.2 0 12.4',
      golf: 'M7 21V3l9 4-9 4M4 21h8',
      gym: 'M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12',
      climbing: 'M9 4h6a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zM9 8v8',
      surfing: 'M3 18c3 0 3-2 6-2s3 2 6 2s3-2 6-2M15 3c3 1 5 4 4 7l-8 2c-1-4 1-8 4-9z',
      walking: 'M13 3a2 2 0 1 0 0.01 0M10 21l2-6 2 3v3M12 15l-1-5-3 2v3M11 10l4 1 2 3',
      yoga: 'M12 3a2 2 0 1 0 0.01 0M12 7v6M5 10l7 3 7-3M7 20l5-3 5 3',
      gaming: 'M7 8h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L14.5 14h-5l-1.3 1A3 3 0 0 1 3 13v-1a4 4 0 0 1 4-4zM8 11v3M6.5 12.5h3M15.5 12h.01M17.5 13.5h.01',
      volleyball: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 3c-1 4 0 7 3 9M3.5 15c4-1 7 0 9-3M20.5 15c-3-2-5-4-5-8',
      pickleball: 'M9 3h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-1v6h-4v-6H9a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM20 18.5a1.5 1.5 0 1 0 0.01 0',
      badminton: 'M12 21a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3zM9 18L6 4M15 18l3-14M12 18V3M7.5 11h9',
      dancing: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0a3 3 0 1 1 6 0zM20 16a3 3 0 1 1-6 0a3 3 0 1 1 6 0z',
      chess: 'M12 3a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM9.5 10h5l-1 6h-3zM7 21h10l-1-3H8z',
      quiz: 'M4 5h16v11H9l-5 4zM10 9a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.3M12 14h.01',
      darts: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10zM12 11a1 1 0 1 0 0 2a1 1 0 1 0 0-2z',
      pool: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7.5a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM12 11.5a2.3 2.3 0 1 0 0 4.6a2.3 2.3 0 1 0 0-4.6z'
    };
    return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + paths[a] + '"/></svg>';
  }

  function showTip(el) {
    const tip = document.getElementById('map-tip');
    if (!tip) return;
    const name = el.dataset.value;
    const c = MAP.counties[name].c;
    const w = name.length * 8 + 26;
    const rect = tip.querySelector('rect');
    const text = tip.querySelector('text');
    rect.setAttribute('x', c[0] - w / 2); rect.setAttribute('y', c[1] - 40); rect.setAttribute('width', w);
    text.setAttribute('x', c[0]); text.setAttribute('y', c[1] - 21);
    text.textContent = name;
    tip.setAttribute('visibility', 'visible');
  }
  function hideTip() {
    const tip = document.getElementById('map-tip');
    if (tip) tip.setAttribute('visibility', 'hidden');
  }

  function startDraft(provider, email) {
    state.draft = { provider: provider, email: email || null, username: '', ageGroup: null, showAge: true, county: null, activities: [], levels: {} };
    save();
    go('#/join/username');
  }
  function finishJoin() {
    const d = state.draft;
    state.user = {
      username: d.username, county: d.county, activities: d.activities.slice(),
      ageGroup: d.ageGroup, showAge: d.showAge !== false, levels: Object.assign({}, d.levels)
    };
    state.account = { email: d.email, provider: d.provider };
    state.signedOut = false;
    state.draft = null;
    state.filters = { activity: 'foryou', level: 'all', day: 'any' };
    save();
    go('#/');
  }

  function viewFeed() {
    const county = state.user.county;
    const acts = activitiesIn(county);
    const f = state.filters;
    if (f.activity !== 'all' && f.activity !== 'foryou' && acts.indexOf(f.activity) < 0) f.activity = 'foryou';
    const mineActs = (state.user.activities || []).filter(function (a) { return acts.indexOf(a) >= 0; });
    if (f.activity === 'foryou' && !mineActs.length) f.activity = 'all';

    const today = startOfDay(now());
    let games = allGames().filter(function (g) { return g.county === county && !isOver(g); });
    games = games.filter(function (g) {
      if (f.activity === 'foryou') return mineActs.indexOf(g.activity) >= 0;
      if (f.activity !== 'all') return g.activity === f.activity;
      return true;
    });
    games = games.filter(function (g) {
      if (f.level === 'all') return true;
      return g.level === f.level;
    });
    games = games.filter(function (g) {
      const d = startOfDay(new Date(g.start));
      const diff = Math.round((d - today) / 864e5);
      if (f.day === 'today') return diff === 0;
      if (f.day === 'tomorrow') return diff === 1;
      if (f.day === 'weekend') { const wd = d.getDay(); return (wd === 0 || wd === 6) && diff < 7; }
      return true;
    });
    games.sort(function (a, b) {
      const urgentA = spotsLeft(a) === 1 ? 0 : 1, urgentB = spotsLeft(b) === 1 ? 0 : 1;
      if (f.day === 'any' && urgentA !== urgentB) return urgentA - urgentB;
      return new Date(a.start) - new Date(b.start);
    });

    const chip = function (key, value, label) {
      const on = f[key] === value;
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-action="filter" data-key="' + key + '" data-value="' + value + '">' + esc(label) + '</button>';
    };
    const actChips = (mineActs.length ? chip('activity', 'foryou', 'For you') : '') + chip('activity', 'all', 'All') +
      acts.map(function (a) { return chip('activity', a, act(a).name); }).join('');
    const dayChips = chip('day', 'any', 'Any day') + chip('day', 'today', 'Today') + chip('day', 'tomorrow', 'Tomorrow') + chip('day', 'weekend', 'This weekend');
    const levelOpts = '<option value="all">Any level</option>' +
      '<optgroup label="Players">' + D.LEVELS.player.map(function (l) { return '<option value="' + l.id + '"' + (f.level === l.id ? ' selected' : '') + '>' + l.name + '</option>'; }).join('') + '</optgroup>' +
      '<optgroup label="Routes">' + D.LEVELS.route.map(function (l) { return '<option value="' + l.id + '"' + (f.level === l.id ? ' selected' : '') + '>' + l.name + '</option>'; }).join('') + '</optgroup>';

    const resetLink = (f.activity !== 'all' || f.day !== 'any' || f.level !== 'all')
      ? '<button type="button" class="btn btn-outline" data-action="clear-filters">Show everything</button>' : '';
    const list = games.length ? games.map(card).join('') :
      '<div class="empty card"><h3>Nothing matches yet</h3><p class="muted">Try another day or activity, or be the first to post one in ' + esc(county) + '.</p><div class="chip-row"><a class="btn btn-primary" href="#/post">Post a game</a>' + resetLink + '</div></div>';

    const oneMore = games.filter(function (g) { return spotsLeft(g) === 1; }).length;

    return '' +
      '<div class="page-head">' +
        '<div><p class="eyebrow">' + esc(county) + ' · next 7 days</p>' +
        '<h1 class="display">Games looking for one more</h1>' +
        '<p class="muted">' + games.length + ' game' + (games.length === 1 ? '' : 's') + (oneMore ? ' · ' + oneMore + ' need just one more' : '') + '</p></div>' +
      '</div>' +
      '<div class="feed-layout">' +
        '<aside class="filters" aria-label="Filters">' +
          '<div class="filter-group"><h2 class="filter-title">Activity</h2><div class="chip-row">' + actChips + '</div></div>' +
          '<div class="filter-group"><h2 class="filter-title">When</h2><div class="chip-row">' + dayChips + '</div></div>' +
          '<div class="filter-group"><label class="filter-title" for="f-level">Level</label><select id="f-level" data-change="filter-level">' + levelOpts + '</select></div>' +
        '</aside>' +
        '<section class="game-list" aria-label="Games">' + list + '</section>' +
      '</div>' +
      '<a class="fab" href="#/post">' + icon('plus') + '<span>Short a player? Post a game</span></a>';
  }

  function card(g) {
    const v = VENUES[g.venueId];
    const a = act(g.activity);
    let btn;
    if (isMine(g)) btn = '<span class="pill pill-dark">Organising</span>';
    else if (isJoined(g)) btn = '<span class="pill pill-ok">' + icon('check') + 'You\'re in</span>';
    else if (spotsLeft(g) === 0) btn = '<button type="button" class="btn btn-sm btn-outline" data-action="waitlist" data-id="' + g.id + '">' + (isWaiting(g) ? 'On waitlist' : 'Join waitlist') + '</button>';
    else btn = '<button type="button" class="btn btn-sm btn-primary" data-action="join" data-id="' + g.id + '">I\'m in</button>';
    return '' +
      '<article class="card game-card">' +
        '<div class="card-top"><span class="eyebrow">' + esc(a.name) + ' · ' + esc(levelName(g.level)) + '</span>' + spotTag(g) + '</div>' +
        '<h3 class="card-title"><a class="stretch" href="#/game/' + g.id + '">' + esc(when(g)) + '</a></h3>' +
        '<p class="meta">' + esc(v.name) + ' · ' + esc(g.cost) + '</p>' +
        '<div class="card-bottom"><span class="meta">' + going(g) + ' of ' + g.size + ' going · by ' + esc(g.organiser) + '</span>' + btn + '</div>' +
      '</article>';
  }

  function viewGame(id) {
    const g = getGame(id);
    if (!g) return '<a class="back" href="#/">' + icon('back') + 'Back to games</a><div class="empty card"><h2>Game not found</h2><p class="muted">It may have been removed.</p></div>';
    const v = VENUES[g.venueId];
    const a = act(g.activity);
    const lv = levelsFor(g.activity).find(function (l) { return l.id === g.level; });
    const rec = isMine(g) ? null : D.record(g.organiser);
    const people = [g.organiser].concat(g.players);
    const avatars = people.slice(0, 7).map(function (h, i) {
      return '<span class="avatar' + (i === 0 ? ' avatar-org' : '') + '" title="' + esc(h) + '">' + esc(initials(h)) + '</span>';
    }).join('') +
      (people.length > 7 ? '<span class="avatar avatar-more">+' + (people.length - 7) + '</span>' : '') +
      ((g.friends || 0) ? '<span class="avatar avatar-more" title="Organiser\'s friends">+' + g.friends + '</span>' : '') +
      (isJoined(g) ? '<span class="avatar avatar-you" title="You">' + esc(initials(state.user.username)) + '</span>' : '') +
      Array.from({ length: Math.min(spotsLeft(g), 4) }).map(function () { return '<span class="avatar avatar-open" aria-hidden="true">?</span>'; }).join('');

    const details = '' +
      '<section class="detail-main">' +
        '<p class="eyebrow">' + esc(a.name) + ' · ' + esc(g.county) + '</p>' +
        '<h1 class="display">' + esc(when(g)) + '</h1>' +
        '<div class="tag-row">' + spotTag(g) + '</div>' +
        '<dl class="card info">' +
          '<div><dt>Where</dt><dd>' + esc(v.name) + '</dd></div>' +
          '<div><dt>When</dt><dd>' + esc(fmtDate(new Date(g.start))) + ', ' + esc(fmtTime(new Date(g.start))) + ' to ' + esc(fmtTime(endOf(g))) + '</dd></div>' +
          '<div><dt>Cost</dt><dd>' + esc(g.cost) + '</dd></div>' +
          '<div><dt>Level</dt><dd>' + esc(lv ? lv.name : g.level) + (lv ? '<span class="dd-sub">' + esc(lv.desc) + '</span>' : '') + '</dd></div>' +
        '</dl>' +
        (g.note ? '<blockquote class="note"><span class="note-from">' + esc(g.organiser) + ' says</span>' + esc(g.note) + '</blockquote>' : '') +
        '<section class="people"><h2 class="h-small">Who\'s going · ' + going(g) + ' of ' + g.size + '</h2><div class="avatars">' + avatars + '</div>' +
          (rec ? '<p class="muted small">Organised by <b>' + esc(g.organiser) + '</b> · ' + esc(D.ageGroup(g.organiser)) + ' · turned up to ' + rec.came + ' of ' + rec.total + ' games</p>' : '<p class="muted small">You\'re organising this game.</p>') +
        '</section>' +
      '</section>';

    let side;
    if (isJoined(g) || isMine(g)) {
      side = chatPanel(g);
    } else if (isOver(g)) {
      side = '<div class="card cta"><h2>This game has finished</h2><a class="btn btn-dark btn-block" href="#/">Find another game</a></div>';
    } else if (spotsLeft(g) === 0) {
      side = '<div class="card cta"><h2>This game is full</h2><button type="button" class="btn btn-block ' + (isWaiting(g) ? 'btn-outline' : 'btn-dark') + '" data-action="waitlist" data-id="' + g.id + '">' + (isWaiting(g) ? 'Leave waitlist' : 'Join the waitlist') + '</button></div>';
    } else {
      side = '<div class="card cta"><h2>' + (spotsLeft(g) === 1 ? 'Take the last spot' : spotsLeft(g) + ' spots left') + '</h2>' +
        '<button type="button" class="btn btn-primary btn-block btn-lg" data-action="join" data-id="' + g.id + '">I\'m in</button></div>';
    }

    return '<a class="back" href="#/">' + icon('back') + 'Back to games</a>' +
      '<div class="detail-layout">' + details + '<aside class="detail-side">' + side + '</aside></div>';
  }

  function chatPanel(g) {
    const status = isMine(g)
      ? '<div class="joined-banner"><span class="joined-icon">' + icon('check') + '</span><div><b>You\'re organising</b><span>' + spotsLeft(g) + ' spot' + (spotsLeft(g) === 1 ? '' : 's') + ' still open</span></div>' +
        '<button type="button" class="btn btn-sm btn-outline-light" data-action="copy-link" data-id="' + g.id + '">' + (ui.copied ? 'Link copied' : 'Copy link') + '</button></div>'
      : '<div class="joined-banner"><span class="joined-icon">' + icon('check') + '</span><div><b>You\'re in</b><span>' + esc(when(g)) + '</span></div>' +
        (isOver(g) ? '' : '<button type="button" class="btn btn-sm btn-outline-light" data-action="leave" data-id="' + g.id + '">Leave</button>') + '</div>';

    if (chatDeleted(g)) {
      return '<div class="card chat">' + status + '<div class="chat-gone">' + icon('clock') + '<p>This chat was deleted the day after the game. Nothing from it is kept.</p></div></div>';
    }
    return '' +
      '<section class="card chat" aria-label="Game chat">' + status +
        '<div class="chat-head"><h2 class="h-small">Game chat</h2><p class="chat-expiry">' + icon('clock') + 'Deletes at midnight on ' + esc(fmtDate(addDays(chatDeletesAt(g), -1))) + ', the day after the game.</p></div>' +
        '<div class="chat-log" id="chat-log" aria-live="polite">' + chatMessages(g) + '</div>' +
        '<form class="chat-form" data-form="chat" data-id="' + g.id + '">' +
          '<label class="sr-only" for="chat-input">Message the group</label>' +
          '<input id="chat-input" name="text" autocomplete="off" maxlength="300" placeholder="Message the group">' +
          '<button class="btn btn-primary" type="submit">Send</button>' +
        '</form>' +
      '</section>';
  }

  function chatMessages(g) {
    const msgs = state.chats[g.id] || [];
    if (!msgs.length) return '<p class="muted small chat-empty">No messages yet. Say hello.</p>';
    return msgs.map(function (m) {
      const mine = m.from === state.user.username;
      const reported = state.reported[m.id];
      return '<div class="msg ' + (mine ? 'msg-mine' : 'msg-theirs') + '">' +
        (mine ? '' : '<span class="msg-from">' + esc(m.from) + '</span>') +
        '<p>' + esc(m.text) + '</p>' +
        (mine ? '' : (reported
          ? '<span class="msg-flag">Reported · kept for review</span>'
          : '<button type="button" class="msg-report" data-action="report" data-id="' + g.id + '" data-msg="' + m.id + '">Report</button>')) +
      '</div>';
    }).join('');
  }

  function viewPost(params) {
    const county = state.user.county;
    const acts = activitiesIn(county);
    const pre = params.venue && VENUES[params.venue] && VENUES[params.venue].county === county ? VENUES[params.venue] : null;
    const first = pre ? pre.activity : ((state.user.activities || []).find(function (a) { return acts.indexOf(a) >= 0; }) || acts[0]);
    const tomorrow = addDays(now(), 1);
    return '' +
      '<a class="back" href="#/">' + icon('back') + 'Cancel</a>' +
      '<div class="narrow">' +
        '<h1 class="display">Short a player?</h1>' +
        '<form class="card form" data-form="post" novalidate>' +
          (ui.error ? '<p class="error" role="alert">' + esc(ui.error) + '</p>' : '') +
          '<div class="field"><label for="p-act">What are you doing?</label><select id="p-act" name="activity" data-change="post-activity">' +
            acts.map(function (a) { return '<option value="' + a + '"' + (a === first ? ' selected' : '') + '>' + esc(act(a).name) + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label for="p-venue">Where</label><select id="p-venue" name="venue">' + venueOptions(county, first, pre && pre.id) + '</select></div>' +
          '<div class="grid-2">' +
            '<div class="field"><label for="p-date">Date</label><input id="p-date" type="date" name="date" min="' + isoDate(now()) + '" value="' + isoDate(tomorrow) + '"></div>' +
            '<div class="field"><label for="p-time">Time</label><input id="p-time" type="time" name="time" value="19:00"></div>' +
          '</div>' +
          '<div class="grid-2">' +
            stepper('have', 'Already going (incl. you)', 1, 1, 21) +
            stepper('need', 'Players needed', 1, 1, 10) +
          '</div>' +
          '<div class="grid-2">' +
            '<div class="field"><label for="p-level">Level</label><select id="p-level" name="level">' + levelOptions(first) + '</select></div>' +
            '<div class="field"><label for="p-cost">Cost each</label><input id="p-cost" name="cost" maxlength="20" value="' + esc(act(first).cost) + '"></div>' +
          '</div>' +
          '<div class="field"><label for="p-note">Anything people should know? <span class="optional">Optional</span></label><textarea id="p-note" name="note" rows="3" maxlength="200" placeholder="e.g. Bring both colours, bibs are sorted."></textarea></div>' +
          '<button class="btn btn-dark btn-block btn-lg" type="submit">Post game</button>' +
        '</form>' +
      '</div>';
  }

  function stepper(name, label, value, min, max, hint) {
    return '<div class="field"><label for="p-' + name + '">' + label + '</label><div class="stepper">' +
      '<button type="button" class="step-btn" aria-label="One fewer" data-action="step" data-target="' + name + '" data-delta="-1">−</button>' +
      '<input id="p-' + name + '" name="' + name + '" type="number" inputmode="numeric" min="' + min + '" max="' + max + '" value="' + value + '">' +
      '<button type="button" class="step-btn step-plus" aria-label="One more" data-action="step" data-target="' + name + '" data-delta="1">+</button>' +
    '</div></div>';
  }
  function venueOptions(county, activity, selected) {
    return venuesIn(county, activity).map(function (v) {
      return '<option value="' + v.id + '"' + (v.id === selected ? ' selected' : '') + '>' + esc(v.name) + '</option>';
    }).join('');
  }
  function levelOptions(activity) {
    return levelsFor(activity).map(function (l, i) {
      const def = act(activity).kind === 'player' ? 'casual' : 'moderate';
      return '<option value="' + l.id + '"' + (l.id === def ? ' selected' : '') + '>' + l.name + ' · ' + esc(l.desc) + '</option>';
    }).join('');
  }

  function viewMine() {
    const games = allGames().filter(function (g) { return isJoined(g) || isMine(g); });
    const upcoming = games.filter(function (g) { return !isOver(g); }).sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
    const past = games.filter(isOver).sort(function (a, b) { return new Date(b.start) - new Date(a.start); });
    const waiting = allGames().filter(function (g) { return isWaiting(g) && !isOver(g); });
    const section = function (title, list, empty) {
      return '<section class="mine-section"><h2 class="h-small">' + title + '</h2>' +
        (list.length ? '<div class="game-list">' + list.map(card).join('') + '</div>' : '<p class="muted">' + empty + '</p>') + '</section>';
    };
    return '<div class="page-head"><div><p class="eyebrow">' + esc(state.user.username) + '</p><h1 class="display">My games</h1></div></div>' +
      section('Coming up', upcoming, 'Nothing yet. <a href="#/">Find a game</a> or <a href="#/post">post one</a>.') +
      (waiting.length ? section('On the waitlist', waiting, '') : '') +
      (past.length ? section('Finished', past, '') : '');
  }

  function viewVenues() {
    const county = state.user.county;
    const acts = activitiesIn(county);
    const upcoming = allGames().filter(function (g) { return g.county === county && !isOver(g); });
    const groups = acts.map(function (a) {
      const vs = venuesIn(county, a);
      return '<section class="venue-group"><h2 class="h-small">' + esc(act(a).name) + ' <span class="count">' + vs.length + '</span></h2><ul class="venue-list">' +
        vs.map(function (v) {
          const n = upcoming.filter(function (g) { return g.venueId === v.id; }).length;
          return '<li class="card venue"><div><b>' + esc(v.name) + '</b><span class="muted small">' + (n ? n + ' game' + (n === 1 ? '' : 's') + ' coming up' : 'No games yet') + '</span></div>' +
            '<a class="btn btn-sm btn-outline" href="#/post?venue=' + v.id + '">Post here</a></li>';
        }).join('') + '</ul></section>';
    }).join('');
    return '<div class="page-head"><div><p class="eyebrow">' + esc(county) + '</p><h1 class="display">What\'s in ' + esc(county) + '</h1>' +
      '</div></div>' +
      '<div class="venue-grid">' + groups + '</div>' +
      '';
  }

  function viewProfile() {
    const u = state.user;
    const counties = D.COUNTIES.map(function (c) { return '<option' + (c === u.county ? ' selected' : '') + '>' + c + '</option>'; }).join('');
    const acts = D.ORDER.map(function (a) {
      const on = (u.activities || []).indexOf(a) >= 0;
      return '<label class="check-chip"><input type="checkbox" name="activities" value="' + a + '"' + (on ? ' checked' : '') + '><span>' + esc(act(a).name) + '</span></label>';
    }).join('');
    const playedGames = allGames().filter(function (g) { return (isJoined(g) || isMine(g)) && isOver(g); }).length;
    const ages = D.AGE_GROUPS.map(function (g) { return '<option' + (g === u.ageGroup ? ' selected' : '') + '>' + g + '</option>'; }).join('');
    const levels = (u.activities || []).map(function (a) {
      const opts = levelsFor(a).map(function (l) { return '<option value="' + l.id + '"' + ((u.levels || {})[a] === l.id ? ' selected' : '') + '>' + l.name + '</option>'; }).join('');
      return '<div class="field"><label for="pr-lv-' + a + '">' + esc(act(a).name) + '</label><select id="pr-lv-' + a + '" name="level-' + a + '">' + opts + '</select></div>';
    }).join('');
    const acc = state.account;
    return '<div class="page-head"><div><p class="eyebrow">Profile' + (u.showAge !== false && u.ageGroup ? ' · ' + esc(u.ageGroup) : '') + '</p><h1 class="display">' + esc(u.username) + '</h1></div></div>' +
      '<div class="profile-layout">' +
        '<form class="card form" data-form="profile" novalidate>' +
          (ui.error ? '<p class="error" role="alert">' + esc(ui.error) + '</p>' : '') +
          '<div class="field"><label for="pr-name">Username</label><input id="pr-name" name="username" maxlength="20" value="' + esc(u.username) + '"></div>' +
          '<div class="grid-2">' +
            '<div class="field"><label for="pr-county">County</label><select id="pr-county" name="county">' + counties + '</select></div>' +
            '<div class="field"><label for="pr-age">Age group</label><select id="pr-age" name="ageGroup"><option value="">Rather not say</option>' + ages + '</select></div>' +
          '</div>' +
          '<label class="check-line"><input type="checkbox" name="showAge"' + (u.showAge !== false ? ' checked' : '') + '><span>Show my age group on my profile</span></label>' +
          '<fieldset class="field"><legend>Activities</legend><div class="chip-row">' + acts + '</div></fieldset>' +
          (levels ? '<fieldset class="field"><legend>Your level</legend><div class="grid-2">' + levels + '</div></fieldset>' : '') +
          '<button class="btn btn-dark" type="submit">Save changes</button>' +
        '</form>' +
        '<div class="profile-side">' +
          '<div class="card record"><h2 class="h-small">Show-up record</h2>' +
            '<p class="record-num">' + playedGames + ' <span>games played</span></p>' +
            '</div>' +
          '<div class="card"><h2 class="h-small">Your data</h2><ul class="plain small">' +
            '<li>Only your username is shown to other people.</li>' +
            '<li>Game chats delete at midnight the day after the game.</li>' +
            '<li>Reported messages are kept for review, then deleted.</li>' +
            '<li>18+ only.</li></ul></div>' +
          '<div class="card"><h2 class="h-small">Account</h2><p class="muted small">' +
            (acc ? (acc.provider === 'email' ? 'Signed in with ' + esc(acc.email) : 'Signed in with ' + esc(acc.provider)) : 'Demo account') + '</p>' +
            '<button type="button" class="btn btn-sm btn-outline" data-action="signout">Sign out</button></div>' +
          '<div class="card"><h2 class="h-small">Demo</h2>' +
            '<button type="button" class="btn btn-sm ' + (ui.resetArmed ? 'btn-danger' : 'btn-outline') + '" data-action="reset">' + (ui.resetArmed ? 'Tap again to wipe everything' : 'Reset the demo') + '</button></div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- actions ---------- */
  function seedChat(g) {
    if (state.chats[g.id]) return;
    state.chats[g.id] = [{ id: uid(), from: g.organiser, text: GREETINGS[g.activity], ts: Date.now() }];
  }
  function chatRefresh(g) {
    const log = document.getElementById('chat-log');
    if (!log) return;
    log.innerHTML = chatMessages(g);
    log.scrollTop = log.scrollHeight;
  }

  const actions = {
    filter: function (el) { state.filters[el.dataset.key] = el.dataset.value; save(); render(); },
    'clear-filters': function () { state.filters = { activity: 'all', level: 'all', day: 'any' }; save(); render(); },
    join: function (el) {
      const g = getGame(el.dataset.id);
      if (!g || isOver(g) || spotsLeft(g) === 0 || isJoined(g)) return;
      state.joined.push(g.id);
      state.waitlist = state.waitlist.filter(function (x) { return x !== g.id; });
      seedChat(g);
      save();
      go('#/game/' + g.id);
    },
    leave: function (el) {
      const id = el.dataset.id;
      state.joined = state.joined.filter(function (x) { return x !== id; });
      delete state.chats[id];
      save();
      render();
    },
    waitlist: function (el) {
      const id = el.dataset.id;
      if (state.waitlist.indexOf(id) >= 0) state.waitlist = state.waitlist.filter(function (x) { return x !== id; });
      else state.waitlist.push(id);
      save();
      render();
    },
    report: function (el) {
      state.reported[el.dataset.msg] = true;
      save();
      chatRefresh(getGame(el.dataset.id));
    },
    step: function (el) {
      const input = el.closest('form').elements[el.dataset.target];
      const v = (parseInt(input.value, 10) || 0) + parseInt(el.dataset.delta, 10);
      input.value = Math.max(+input.min, Math.min(+input.max, v));
    },
    'copy-link': function (el) {
      const url = location.href.split('#')[0] + '#/game/' + el.dataset.id;
      const done = function () { ui.copied = true; render(); setTimeout(function () { ui.copied = false; }, 0); };
      try { navigator.clipboard.writeText(url).then(done, done); } catch (e) { done(); }
    },
    reset: function () {
      if (!ui.resetArmed) { ui.resetArmed = true; render(); return; }
      ui.resetArmed = false;
      state = blank();
      save();
      go('#/');
    },
    signout: function () { state.signedOut = true; ui.signinMode = 'login'; save(); go('#/'); },
    'signin-mode': function (el) { ui.signinMode = el.dataset.value; ui.error = null; render(); },
    forgot: function () { ui.error = 'Demo: password reset emails come with real accounts.'; render(); },
    social: function (el) {
      const p = el.dataset.provider;
      if (state.user && state.account && state.account.provider === p) {
        state.signedOut = false; save(); go('#/'); return;
      }
      startDraft(p, null);
    },
    'j-age': function (el) { state.draft.ageGroup = el.dataset.value; save(); render(); },
    'j-county': function (el) {
      const fromMap = el.tagName.toLowerCase() === 'path';
      state.draft.county = el.dataset.value; save(); render();
      if (fromMap) { const p = document.querySelector('path.county.on'); if (p) p.focus(); }
    },
    'j-act': function (el) {
      const d = state.draft, a = el.dataset.value, i = d.activities.indexOf(a);
      if (i >= 0) d.activities.splice(i, 1); else d.activities.push(a);
      save(); render();
    },
    'j-level': function (el) { state.draft.levels[el.dataset.act] = el.dataset.value; save(); render(); },
    'j-next': function (el) {
      const d = state.draft, step = el.dataset.step;
      if (step === 'age' && d.ageGroup) go('#/join/county');
      else if (step === 'county' && d.county) go('#/join/activities');
      else if (step === 'activities' && d.activities.length) go('#/join/level/0');
      else if (step === 'level') {
        const i = parseInt(el.dataset.index, 10);
        if (!d.levels[d.activities[i]]) return;
        if (i + 1 < d.activities.length) go('#/join/level/' + (i + 1)); else finishJoin();
      }
    }
  };

  const changes = {
    county: function (el) {
      state.user.county = el.value;
      save();
      const page = parseHash().parts[0] || 'games';
      if (page === 'game' || page === 'post') go('#/'); else render();
    },
    'filter-level': function (el) { state.filters.level = el.value; save(); render(); },
    'j-showage': function (el) { state.draft.showAge = el.checked; save(); },
    'post-activity': function (el) {
      const form = el.closest('form');
      const a = el.value;
      form.elements.venue.innerHTML = venueOptions(state.user.county, a);
      form.elements.level.innerHTML = levelOptions(a);
      form.elements.cost.value = act(a).cost;
    }
  };

  const USERNAME = /^[A-Za-z0-9_]{3,20}$/;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const forms = {
    signin: function (f) {
      const email = f.elements.email.value.trim().toLowerCase();
      const pass = f.elements.password.value;
      ui.lastEmail = email;
      if (!EMAIL.test(email)) { ui.error = 'Enter a valid email address.'; return render(); }
      const known = state.user && state.account && state.account.email === email;
      if (ui.signinMode === 'login') {
        if (!pass) { ui.error = 'Enter your password.'; return render(); }
        if (!known) { ui.error = 'No account with that email in this browser. Create one instead.'; return render(); }
        state.signedOut = false; save(); go('#/');
      } else {
        if (pass.length < 8) { ui.error = 'Use a password of at least 8 characters.'; return render(); }
        if (known) { ui.error = 'There\'s already an account with that email. Log in instead.'; return render(); }
        startDraft('email', email);
      }
    },
    'j-username': function (f) {
      const name = f.elements.username.value.trim();
      if (!USERNAME.test(name)) { ui.error = 'Pick a username of 3 to 20 letters, numbers or underscores.'; return render(); }
      if (D.HANDLES.indexOf(name.toLowerCase()) >= 0) { ui.error = 'That username is taken. Try another.'; return render(); }
      state.draft.username = name;
      save();
      go('#/join/age');
    },
    profile: function (f) {
      const name = f.elements.username.value.trim();
      if (!USERNAME.test(name)) { ui.error = 'Pick a username of 3 to 20 letters, numbers or underscores.'; return render(); }
      const old = state.user.username;
      state.user.username = name;
      state.user.county = f.elements.county.value;
      state.user.activities = Array.from(f.querySelectorAll('input[name="activities"]:checked')).map(function (i) { return i.value; });
      state.user.ageGroup = f.elements.ageGroup.value || null;
      state.user.showAge = f.elements.showAge.checked;
      const levels = state.user.levels || (state.user.levels = {});
      state.user.activities.forEach(function (a) {
        const sel = f.elements['level-' + a];
        if (sel) levels[a] = sel.value;
        else if (!levels[a]) levels[a] = act(a).kind === 'player' ? 'casual' : 'moderate';
      });
      state.posted.forEach(function (g) { if (g.organiser === old) g.organiser = name; });
      Object.keys(state.chats).forEach(function (k) { state.chats[k].forEach(function (m) { if (m.from === old) m.from = name; }); });
      save();
      go('#/');
    },
    post: function (f) {
      const e = f.elements;
      const start = new Date(e.date.value + 'T' + (e.time.value || '19:00'));
      if (isNaN(start)) { ui.error = 'Pick a date and time.'; return render(); }
      if (start - now() < 15 * 60000) { ui.error = 'Pick a time at least 15 minutes from now.'; return render(); }
      if (!e.venue.value) { ui.error = 'Pick a venue.'; return render(); }
      const have = Math.max(1, parseInt(e.have.value, 10) || 1);
      const need = Math.max(1, parseInt(e.need.value, 10) || 1);
      const g = {
        id: 'u-' + Date.now().toString(36),
        county: state.user.county,
        activity: e.activity.value,
        venueId: e.venue.value,
        start: start.toISOString(),
        size: have + need,
        organiser: state.user.username,
        players: [],
        friends: have - 1,
        level: e.level.value,
        cost: e.cost.value.trim() || 'Free',
        note: e.note.value.trim(),
        mine: true
      };
      state.posted.push(g);
      state.chats[g.id] = [];
      save();
      go('#/game/' + g.id);
    },
    chat: function (f) {
      const g = getGame(f.dataset.id);
      const text = f.elements.text.value.trim();
      if (!g || !text) return;
      const msgs = state.chats[g.id] || (state.chats[g.id] = []);
      msgs.push({ id: uid(), from: state.user.username, text: text, ts: Date.now() });
      f.elements.text.value = '';
      save();
      chatRefresh(g);
      // A sample player answers so the demo feels alive.
      const others = [g.organiser].concat(g.players).filter(function (h) { return h !== state.user.username; });
      if (!others.length) return;
      setTimeout(function () {
        const list = state.chats[g.id];
        if (!list) return;
        list.push({ id: uid(), from: D.pick(Math.random, others), text: D.pick(Math.random, REPLIES), ts: Date.now() });
        save();
        chatRefresh(g);
      }, 1400);
    }
  };

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el || !actions[el.dataset.action]) return;
    e.preventDefault();
    actions[el.dataset.action](el);
  });
  document.addEventListener('change', function (e) {
    const el = e.target.closest('[data-change]');
    if (el && changes[el.dataset.change]) changes[el.dataset.change](el);
  });
  document.addEventListener('submit', function (e) {
    const f = e.target.closest('form[data-form]');
    if (!f || !forms[f.dataset.form]) return;
    e.preventDefault();
    forms[f.dataset.form](f);
  });
  // Map: keyboard selection, hover and focus labels.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest && e.target.closest('[role="button"][data-action]');
    if (!el || el.tagName === 'BUTTON' || !actions[el.dataset.action]) return;
    e.preventDefault();
    actions[el.dataset.action](el);
  });
  document.addEventListener('mouseover', function (e) {
    const p = e.target.closest && e.target.closest('path.county');
    if (p) showTip(p); else hideTip();
  });
  document.addEventListener('focusin', function (e) {
    const p = e.target.closest && e.target.closest('path.county');
    if (p) showTip(p); else hideTip();
  });

  window.addEventListener('hashchange', function () {
    ui.resetArmed = false;
    render();
    window.scrollTo(0, 0);
  });

  render();
})();
