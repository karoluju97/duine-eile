/* Duine Eile demo: sample counties, venues and games.
   Everything here is sample data for the demo. Venues are well-known public
   places or generic placeholders ("Astro pitch, <town>"), not real bookings. */
(function () {
  'use strict';

  // Republic of Ireland only (26 counties).
  const COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
    'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
  ];

  const ACTIVITIES = {
    football:   { name: '5-a-side',        kind: 'player', minutes: 60,  cost: '€5 each',  size: 10 },
    gaelic:     { name: 'Gaelic football', kind: 'player', minutes: 60,  cost: 'Free',     size: 14 },
    hurling:    { name: 'Hurling',         kind: 'player', minutes: 60,  cost: 'Free',     size: 14 },
    hockey:     { name: 'Hockey',          kind: 'player', minutes: 60,  cost: '€5 each',  size: 14 },
    basketball: { name: 'Basketball',      kind: 'player', minutes: 60,  cost: '€4 each',  size: 6 },
    tennis:     { name: 'Tennis',          kind: 'player', minutes: 60,  cost: '€5 each',  size: 4 },
    padel:      { name: 'Padel',           kind: 'player', minutes: 90,  cost: '€8 each',  size: 4 },
    golf:       { name: 'Pitch & putt',    kind: 'player', minutes: 120, cost: '€10 each', size: 4 },
    gym:        { name: 'Gym',             kind: 'player', minutes: 60,  cost: 'Own membership', size: 3 },
    climbing:   { name: 'Climbing',        kind: 'player', minutes: 120, cost: '€15 each', size: 4 },
    surfing:    { name: 'Surfing',         kind: 'player', minutes: 120, cost: 'Free',     size: 4 },
    swimming:   { name: 'Open-water swim', kind: 'route',  minutes: 45,  cost: 'Free',     size: 6 },
    poolswim:   { name: 'Pool swimming',   kind: 'route',  minutes: 45,  cost: '€6 each',  size: 4 },
    running:    { name: 'Running',         kind: 'route',  minutes: 60,  cost: 'Free',     size: 8 },
    walking:    { name: 'Walking',         kind: 'route',  minutes: 60,  cost: 'Free',     size: 8 },
    hiking:     { name: 'Hiking',          kind: 'route',  minutes: 180, cost: 'Free',     size: 8 },
    cycling:    { name: 'Cycling',         kind: 'route',  minutes: 150, cost: 'Free',     size: 6 },
    yoga:       { name: 'Yoga',            kind: 'route',  minutes: 60,  cost: 'Free',     size: 8 },
    boardgames: { name: 'Board games',     kind: 'player', minutes: 180, cost: 'Free',     size: 6 },
    gaming:     { name: 'Online gaming',   kind: 'player', minutes: 120, cost: 'Free',     size: 5 },
    volleyball: { name: 'Volleyball',      kind: 'player', minutes: 90,  cost: '€4 each',  size: 12 },
    pickleball: { name: 'Pickleball',      kind: 'player', minutes: 60,  cost: '€5 each',  size: 4 },
    badminton:  { name: 'Badminton',       kind: 'player', minutes: 60,  cost: '€5 each',  size: 4 },
    dancing:    { name: 'Dancing',         kind: 'player', minutes: 90,  cost: '€10 each', size: 10 },
    chess:      { name: 'Chess',           kind: 'player', minutes: 120, cost: 'Free',     size: 2 },
    quiz:       { name: 'Table quiz',      kind: 'player', minutes: 150, cost: '€5 each',  size: 4 },
    darts:      { name: 'Darts',           kind: 'player', minutes: 120, cost: 'Free',     size: 4 },
    pool:       { name: 'Pool',            kind: 'player', minutes: 120, cost: '€2 a game', size: 4 }
  };
  const ORDER = ['football', 'gaelic', 'hurling', 'hockey', 'basketball', 'volleyball', 'tennis', 'padel', 'pickleball', 'badminton',
    'golf', 'gym', 'climbing', 'surfing', 'swimming', 'poolswim', 'running', 'walking', 'hiking', 'cycling', 'yoga', 'dancing',
    'boardgames', 'chess', 'quiz', 'darts', 'pool', 'gaming'];

  const LEVELS = {
    player: [
      { id: 'beginner',     name: 'Beginner',     desc: 'New or rusty, here to learn' },
      { id: 'casual',       name: 'Casual',       desc: 'Plays for fun, no pressure' },
      { id: 'intermediate', name: 'Intermediate', desc: 'Plays regularly, knows the game' },
      { id: 'advanced',     name: 'Advanced',     desc: 'Strong player, plays to win' },
      { id: 'competitive',  name: 'Competitive',  desc: 'Club or league standard' }
    ],
    route: [
      { id: 'easy',     name: 'Easy',     desc: 'Gentle pace, short distance' },
      { id: 'moderate', name: 'Moderate', desc: 'Steady pace, some effort' },
      { id: 'hard',     name: 'Hard',     desc: 'Long or steep, good fitness needed' }
    ]
  };

  // Outdoor spots per county. Football, padel and board games use generic venues.
  const PLACES = {
    Carlow:    { town: 'Carlow', hiking: ['Mount Leinster'], running: ['Oak Park Forest'], cycling: ['Barrow Way towpath'] },
    Cavan:     { town: 'Cavan', hiking: ['Killykeen Forest Park'], running: ['Killykeen Forest Park'] },
    Clare:     { town: 'Ennis', hiking: ['Cliffs of Moher coastal walk', 'Burren Way, Ballyvaughan'], swimming: ['Pollock Holes, Kilkee', 'Lahinch Beach'], running: ['Lees Road, Ennis'], cycling: ['Loop Head'], surfing: ['Lahinch Beach'] },
    Cork:      { town: 'Cork', padel: true, hiking: ['Gougane Barra Forest Park', 'Hungry Hill, Beara'], swimming: ['Myrtleville', 'Sandycove Island, Kinsale'], running: ['The Marina'], cycling: ['Passage West Greenway'], surfing: ['Garrettstown'], climbing: true },
    Donegal:   { town: 'Letterkenny', hiking: ['Errigal', 'Slieve League cliffs'], swimming: ['Portsalon', 'Rathmullan Beach'], running: ['Glenveagh National Park'], cycling: ['Fanad Head loop'], surfing: ['Bundoran'] },
    Dublin:    { town: 'Dublin', padel: true, hiking: ['Howth Cliff Path', 'Ticknock & Three Rock'], swimming: ['Forty Foot, Sandycove', 'Seapoint', 'Bull Wall, Clontarf'], running: ['Phoenix Park', 'Clontarf Promenade'], cycling: ['Phoenix Park', 'Dublin Bay to Howth'], climbing: true },
    Galway:    { town: 'Galway', padel: true, hiking: ['Diamond Hill, Connemara National Park'], swimming: ['Blackrock Diving Tower, Salthill'], running: ['Salthill Promenade'], cycling: ['Connemara loop from Oughterard'], climbing: true },
    Kerry:     { town: 'Killarney', padel: true, hiking: ['Carrauntoohil', 'Torc Mountain'], swimming: ['Inch Beach', 'Banna Strand'], running: ['Killarney National Park'], cycling: ['Gap of Dunloe'], surfing: ['Inch Beach'] },
    Kildare:   { town: 'Naas', padel: true, hiking: ['Donadea Forest Park'], running: ['The Curragh plains'], cycling: ['Royal Canal Greenway, Maynooth'] },
    Kilkenny:  { town: 'Kilkenny', hiking: ['Brandon Hill, Graiguenamanagh'], running: ['Kilkenny Castle Park'] },
    Laois:     { town: 'Portlaoise', hiking: ['Glenbarrow, Slieve Bloom'], running: ['Emo Court'] },
    Leitrim:   { town: 'Carrick-on-Shannon', swimPool: 'Acres Lake heated pool, Drumshanbo', hiking: ['Glencar Waterfall walk'], running: ['Shannon Blueway, Carrick'], cycling: ['Shannon Blueway'] },
    Limerick:  { town: 'Limerick', padel: true, hiking: ['Ballyhoura Mountains'], running: ['University of Limerick riverside'], cycling: ['Limerick Greenway'], climbing: true },
    Longford:  { town: 'Longford', hiking: ['Corlea Trackway'], running: ['Royal Canal, Longford'], cycling: ['Royal Canal Greenway, Cloondara'] },
    Louth:     { town: 'Dundalk', hiking: ['Slieve Foye, Carlingford'], swimming: ['Clogherhead', 'Blackrock, Dundalk Bay'], running: ['Blackrock Promenade'], cycling: ['Carlingford Greenway'] },
    Mayo:      { town: 'Westport', hiking: ['Croagh Patrick'], swimming: ['Keel Beach, Achill', 'Bertra Beach'], running: ['Westport Quay'], cycling: ['Great Western Greenway'], surfing: ['Keel Beach, Achill'] },
    Meath:     { town: 'Navan', hiking: ['Hill of Tara'], swimming: ['Bettystown Beach'], running: ['Bettystown Beach'], cycling: ['Boyne Greenway'] },
    Monaghan:  { town: 'Monaghan', hiking: ['Rossmore Forest Park'], running: ['Rossmore Forest Park'] },
    Offaly:    { town: 'Tullamore', hiking: ['Slieve Bloom, Kinnitty'], running: ['Lough Boora Discovery Park'], cycling: ['Grand Canal Greenway'] },
    Roscommon: { town: 'Roscommon', hiking: ['Lough Key Forest Park'], running: ['Lough Key Forest Park'] },
    Sligo:     { town: 'Sligo', hiking: ['Benbulben, Gortarowey loop', 'Knocknarea'], swimming: ['Rosses Point', 'Strandhill'], running: ['Strandhill seafront'], surfing: ['Strandhill'] },
    Tipperary: { town: 'Clonmel', hiking: ['Galtymore', "Devil's Bit"], swimming: ['Dromineer, Lough Derg'], running: ['Suir Blueway, Clonmel'], cycling: ['Suir Blueway, Clonmel to Carrick'] },
    Waterford: { town: 'Waterford', padel: true, hiking: ['Mahon Falls, Comeraghs'], swimming: ['Guillamene, Tramore', 'Tramore Beach'], running: ['Tramore Promenade'], cycling: ['Waterford Greenway'], surfing: ['Tramore Beach'] },
    Westmeath: { town: 'Athlone', running: ['Athlone riverside'], cycling: ['Old Rail Trail Greenway'] },
    Wexford:   { town: 'Wexford', hiking: ['Forth Mountain'], swimming: ['Curracloe Beach', 'Rosslare Strand'], running: ['Curracloe Beach'], cycling: ['Hook Peninsula loop'] },
    Wicklow:   { town: 'Bray', hiking: ['Glendalough Spinc', 'Djouce', 'Bray Head'], swimming: ['Greystones South Beach', 'Brittas Bay'], running: ['Bray Promenade'], cycling: ['Sally Gap'] }
  };

  // Counties with established hockey clubs (the rest would come from Hockey Ireland's club finder).
  const HOCKEY = ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Kilkenny', 'Wexford', 'Wicklow', 'Kildare', 'Louth'];

  const TIMES = {
    football: ['18:30', '19:00', '20:00', '21:00'],
    padel: ['10:30', '12:00', '18:00', '19:30'],
    hiking: ['09:30', '10:00', '11:00'],
    swimming: ['07:00', '07:30', '08:00', '12:30'],
    running: ['07:00', '18:30', '19:00'],
    cycling: ['08:30', '09:00', '10:00'],
    boardgames: ['19:00', '19:30'],
    gaelic: ['19:00', '19:30', '11:00'],
    basketball: ['19:30', '20:00'],
    tennis: ['10:00', '18:30', '19:30'],
    golf: ['10:00', '14:00', '17:30'],
    gym: ['07:00', '18:00', '19:00'],
    climbing: ['18:30', '19:30'],
    surfing: ['08:00', '10:00', '14:00'],
    walking: ['10:00', '13:00', '19:00'],
    yoga: ['09:00', '19:00'],
    gaming: ['20:00', '21:00', '21:30'],
    volleyball: ['19:00', '20:00'],
    pickleball: ['10:00', '18:30', '19:30'],
    badminton: ['18:00', '19:00', '20:00'],
    dancing: ['19:00', '20:00'],
    chess: ['14:00', '19:00'],
    quiz: ['20:30', '21:00'],
    darts: ['20:00', '21:00'],
    pool: ['19:30', '20:30'],
    poolswim: ['07:00', '12:30', '19:00'],
    hurling: ['19:00', '19:30', '11:00'],
    hockey: ['19:30', '20:00', '11:00']
  };

  const NOTES = {
    football: ['Bibs sorted, bring a light and a dark top.', 'Friendly game, no slide tackles.', 'Usually 5 v 5, rolling subs if we get extra.'],
    padel: ['Rackets available to borrow at the desk.', 'Doubles, we mix partners each set.', 'Court booked, split on the night.'],
    hiking: ['Meet at the car park. Boots and rain gear essential.', 'Steady pace, plenty of stops for photos.', 'Bring lunch, we stop at the top if the weather allows.'],
    swimming: ['Tow floats recommended. We swim along the shore, no heroics.', 'Short dip and a flask of tea after.', 'Check the forecast the night before, we cancel in big swell.'],
    running: ['Chatty pace, about 6 minutes per km, nobody left behind.', 'Easy 5 km loop, coffee after.', 'Tempo session, warm-up together first.'],
    cycling: ['Road bikes, about 25 km/h average, café stop halfway.', 'Mixed group, we regroup at the top of every climb.', 'Lights and a spare tube please.'],
    boardgames: ['Bringing Catan and Ticket to Ride, new players welcome.', 'Learning a new game tonight, nobody knows the rules yet.', 'Quick party games, then something longer.'],
    gaelic: ['Bring a ball if you have one.', 'Seven-a-side, friendly.', 'Mixed group, mostly lads who played underage.'],
    basketball: ['3 v 3, half court.', 'Pickup run, winners stay on.', 'Bring a light and a dark top.'],
    tennis: ['Doubles, courts booked.', 'Bring your own racket, balls sorted.', 'Rallying first, then a few sets.'],
    golf: ['Clubs available to rent.', 'Nine holes, then a coffee.', 'Nobody takes it too seriously.'],
    gym: ['Looking for a lifting partner.', 'Leg day, spotting each other.', 'Early session before work.'],
    climbing: ['Bouldering, shoes for rent at the desk.', 'Top-rope, need a belay partner.', 'Beginners welcome, we can show you the basics.'],
    surfing: ['Check the forecast, we cancel in big swell.', 'Longboards, mellow waves.', 'Wetsuit essential.'],
    walking: ['Easy pace, coffee after.', 'Lunchtime loop, about 5 km.', 'Dogs welcome on leads.'],
    yoga: ['Bring a mat.', 'Gentle flow, all welcome.', 'Outdoor if dry, indoors if not.'],
    gaming: ['Discord link in the chat.', 'Squads, chill vibes, no rage.', 'Trying a new co-op game tonight.'],
    volleyball: ['6 v 6, rotate every set.', 'Indoor, friendly.', 'Bring indoor shoes.'],
    pickleball: ['Paddles to borrow.', 'Doubles, we mix partners.', 'New to it? Grand, it takes ten minutes to learn.'],
    badminton: ['Court booked, shuttles sorted.', 'Doubles, bring a racket.', 'Friendly rallies, then games.'],
    dancing: ['Salsa class, no partner needed.', 'Swing night, beginners welcome.', 'Céilí, the caller shows you the steps.'],
    chess: ['Bring a board if you have one.', 'Casual games, a few blitz rounds.', 'Happy to go over openings.'],
    quiz: ['Need one more for our team.', 'General knowledge, music round at the end.', 'Proceeds go to the local club.'],
    darts: ['501, doubles out.', 'Casual arrows, nobody is Luke Littler.', 'Board booked in the back.'],
    pool: ['Winner stays on.', 'Doubles if there are four of us.', 'Bring coins.'],
    poolswim: ['Lane swim, steady pace.', 'Bring a cap and goggles.', 'Building up to 1 km, nobody racing.'],
    hurling: ['Helmets on, bring your own hurl.', 'Pucking around then a small-sided game.', 'Spare sliotars in the bag.'],
    hockey: ['Seven-a-side on the astro.', 'Shin guards and gumshield please.', 'Spare sticks if you need one.']
  };

  const HANDLES = [
    'astro_aoife', 'cliffpath_conor', 'padelpete', 'saltwater_sinead', 'trailtom',
    'boardgame_bren', 'fiveaside_fergal', 'sunrise_swimmer', 'hillwalker_h', 'greenway_gav',
    'dicetower_d', 'offside_ollie', 'kitbag_kev', 'tidetimes_tara', 'summit_sam',
    'cadence_ciara', 'meeple_mick', 'lobber_lou', 'splash_saoirse', 'bogland_ben',
    'pacer_paddy', 'longball_liam', 'dropshot_dee', 'ridgeline_rory', 'chainring_cat',
    'riverrun_ruth', 'catan_cathal', 'wavecheck_will', 'nutmeg_niamh', 'switchback_shay',
    'topcorner_tadhg', 'drybag_dara', 'cairn_clodagh', 'volley_vinny', 'puncture_pol'
  ];

  function slug(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(r, list) { return list[Math.floor(r() * list.length)]; }

  function buildVenues() {
    const out = [];
    COUNTIES.forEach(function (county) {
      const p = PLACES[county];
      const add = function (activity, name) {
        out.push({ id: slug(county + '-' + activity + '-' + name), county: county, activity: activity, name: name });
      };
      add('football', 'Astro pitch, ' + p.town);
      add('gaelic', 'GAA pitch, ' + p.town);
      add('hurling', 'GAA pitch, ' + p.town);
      if (HOCKEY.indexOf(county) >= 0) add('hockey', 'Hockey pitch, ' + p.town);
      add('basketball', 'Sports hall, ' + p.town);
      add('volleyball', 'Sports hall, ' + p.town);
      add('pickleball', 'Sports hall, ' + p.town);
      add('badminton', 'Sports hall, ' + p.town);
      add('dancing', 'Dance studio, ' + p.town);
      add('chess', 'Library, ' + p.town);
      add('quiz', 'Pub, ' + p.town);
      add('darts', 'Pub, ' + p.town);
      add('pool', 'Pool hall, ' + p.town);
      add('poolswim', p.swimPool || 'Leisure centre pool, ' + p.town);
      add('tennis', 'Tennis courts, ' + p.town);
      if (p.padel) add('padel', 'Padel courts, ' + p.town);
      add('golf', 'Pitch and putt, ' + p.town);
      add('gym', 'Gym, ' + p.town);
      if (p.climbing) add('climbing', 'Climbing wall, ' + p.town);
      ['surfing', 'hiking', 'swimming', 'running', 'cycling'].forEach(function (a) {
        (p[a] || []).forEach(function (name) { add(a, name); });
      });
      // Walks: anywhere you can run or cycle, without duplicates.
      const walks = [];
      (p.running || []).concat(p.cycling || []).forEach(function (name) { if (walks.indexOf(name) < 0) walks.push(name); });
      walks.forEach(function (name) { add('walking', name); });
      add('yoga', 'Community centre, ' + p.town);
      add('boardgames', 'Community centre, ' + p.town);
      ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'].forEach(function (platform) { add('gaming', 'Online · ' + platform); });
    });
    return out;
  }

  // Sample games are generated relative to "now" so the demo always looks current.
  function build(now) {
    const venues = buildVenues();
    const games = [];
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekendOffsets = [];
    for (let k = 0; k < 7; k++) {
      const d = (today.getDay() + k) % 7;
      if (d === 0 || d === 6) weekendOffsets.push(k);
    }

    COUNTIES.forEach(function (county) {
      const r = rng(hash(county));
      const local = venues.filter(function (v) { return v.county === county; });
      // At least one game for every activity the county has, then a few extras.
      const seeds = [];
      ORDER.forEach(function (a) {
        const options = local.filter(function (v) { return v.activity === a; });
        if (options.length) seeds.push(pick(r, options));
      });
      const extras = 3 + Math.floor(r() * 3);
      for (let e = 0; e < extras; e++) seeds.push(pick(r, local));
      for (let i = 0; i < seeds.length; i++) {
        const venue = seeds[i];
        const act = ACTIVITIES[venue.activity];
        let offset = Math.floor(r() * 7);
        if (venue.activity === 'hiking' || venue.activity === 'cycling') offset = pick(r, weekendOffsets);
        const t = pick(r, TIMES[venue.activity]).split(':');
        const start = new Date(today);
        start.setDate(start.getDate() + offset);
        start.setHours(+t[0], +t[1], 0, 0);
        if (start <= now) start.setDate(start.getDate() + 1);

        const size = act.size + (act.kind === 'route' ? Math.floor(r() * 3) - 1 : 0);
        const left = Math.min(size - 1, pick(r, [0, 1, 1, 1, 2, 3]));
        const pool = HANDLES.slice();
        const organiser = pool.splice(Math.floor(r() * pool.length), 1)[0];
        const players = [];
        for (let j = 0; j < size - 1 - left; j++) players.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);

        const levels = act.kind === 'player'
          ? ['beginner', 'casual', 'casual', 'intermediate', 'intermediate', 'advanced', 'competitive']
          : ['easy', 'moderate', 'moderate', 'hard'];

        games.push({
          id: 'g-' + slug(county) + '-' + i,
          county: county,
          activity: venue.activity,
          venueId: venue.id,
          start: start.toISOString(),
          size: size,
          organiser: organiser,
          players: players,
          friends: 0,
          level: pick(r, levels),
          cost: act.cost,
          note: pick(r, NOTES[venue.activity])
        });
      }
    });
    return { venues: venues, games: games };
  }

  const AGE_GROUPS = ['18–21', '22–25', '26–30', '31–35', '36–45', '46–55', '56+'];

  const PROVINCES = [
    { name: 'Munster', counties: ['Clare', 'Cork', 'Kerry', 'Limerick', 'Tipperary', 'Waterford'] },
    { name: 'Leinster', counties: ['Carlow', 'Dublin', 'Kildare', 'Kilkenny', 'Laois', 'Longford', 'Louth', 'Meath', 'Offaly', 'Westmeath', 'Wexford', 'Wicklow'] },
    { name: 'Connacht', counties: ['Galway', 'Leitrim', 'Mayo', 'Roscommon', 'Sligo'] },
    { name: 'Ulster (ROI)', counties: ['Cavan', 'Donegal', 'Monaghan'] }
  ];

  // A made-up but stable age group for sample users.
  function ageGroup(handle) { return AGE_GROUPS[hash(handle + ':age') % 6]; }

  // A made-up but stable show-up record for sample users.
  function record(handle) {
    const h = hash(handle);
    const total = 4 + (h % 22);
    const came = total - ((h >>> 6) % 3 === 0 ? 1 : 0);
    return { came: came, total: total };
  }

  window.DuineData = {
    COUNTIES: COUNTIES, ACTIVITIES: ACTIVITIES, ORDER: ORDER, LEVELS: LEVELS,
    HANDLES: HANDLES, AGE_GROUPS: AGE_GROUPS, PROVINCES: PROVINCES,
    build: build, record: record, ageGroup: ageGroup, pick: pick
  };
})();
