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
    football:   { name: '5-a-side',        kind: 'player', minutes: 60,  cost: '€5 each', size: 10 },
    padel:      { name: 'Padel',           kind: 'player', minutes: 90,  cost: '€8 each', size: 4 },
    hiking:     { name: 'Hiking',          kind: 'route',  minutes: 180, cost: 'Free',    size: 8 },
    swimming:   { name: 'Open-water swim', kind: 'route',  minutes: 45,  cost: 'Free',    size: 6 },
    running:    { name: 'Running',         kind: 'route',  minutes: 60,  cost: 'Free',    size: 8 },
    cycling:    { name: 'Cycling',         kind: 'route',  minutes: 150, cost: 'Free',    size: 6 },
    boardgames: { name: 'Board games',     kind: 'player', minutes: 180, cost: 'Free',    size: 6 }
  };
  const ORDER = ['football', 'padel', 'hiking', 'swimming', 'running', 'cycling', 'boardgames'];

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
    Clare:     { town: 'Ennis', hiking: ['Cliffs of Moher coastal walk', 'Burren Way, Ballyvaughan'], swimming: ['Pollock Holes, Kilkee', 'Lahinch Beach'], running: ['Lees Road, Ennis'], cycling: ['Loop Head'] },
    Cork:      { town: 'Cork', padel: true, hiking: ['Gougane Barra Forest Park', 'Hungry Hill, Beara'], swimming: ['Myrtleville', 'Sandycove Island, Kinsale'], running: ['The Marina'], cycling: ['Passage West Greenway'] },
    Donegal:   { town: 'Letterkenny', hiking: ['Errigal', 'Slieve League cliffs'], swimming: ['Portsalon', 'Rathmullan Beach'], running: ['Glenveagh National Park'], cycling: ['Fanad Head loop'] },
    Dublin:    { town: 'Dublin', padel: true, hiking: ['Howth Cliff Path', 'Ticknock & Three Rock'], swimming: ['Forty Foot, Sandycove', 'Seapoint', 'Bull Wall, Clontarf'], running: ['Phoenix Park', 'Clontarf Promenade'], cycling: ['Phoenix Park', 'Dublin Bay to Howth'] },
    Galway:    { town: 'Galway', padel: true, hiking: ['Diamond Hill, Connemara National Park'], swimming: ['Blackrock Diving Tower, Salthill'], running: ['Salthill Promenade'], cycling: ['Connemara loop from Oughterard'] },
    Kerry:     { town: 'Killarney', padel: true, hiking: ['Carrauntoohil', 'Torc Mountain'], swimming: ['Inch Beach', 'Banna Strand'], running: ['Killarney National Park'], cycling: ['Gap of Dunloe'] },
    Kildare:   { town: 'Naas', padel: true, hiking: ['Donadea Forest Park'], running: ['The Curragh plains'], cycling: ['Royal Canal Greenway, Maynooth'] },
    Kilkenny:  { town: 'Kilkenny', hiking: ['Brandon Hill, Graiguenamanagh'], running: ['Kilkenny Castle Park'] },
    Laois:     { town: 'Portlaoise', hiking: ['Glenbarrow, Slieve Bloom'], running: ['Emo Court'] },
    Leitrim:   { town: 'Carrick-on-Shannon', hiking: ['Glencar Waterfall walk'], running: ['Shannon Blueway, Carrick'], cycling: ['Shannon Blueway'] },
    Limerick:  { town: 'Limerick', padel: true, hiking: ['Ballyhoura Mountains'], running: ['University of Limerick riverside'], cycling: ['Limerick Greenway'] },
    Longford:  { town: 'Longford', hiking: ['Corlea Trackway'], running: ['Royal Canal, Longford'], cycling: ['Royal Canal Greenway, Cloondara'] },
    Louth:     { town: 'Dundalk', hiking: ['Slieve Foye, Carlingford'], swimming: ['Clogherhead', 'Blackrock, Dundalk Bay'], running: ['Blackrock Promenade'], cycling: ['Carlingford Greenway'] },
    Mayo:      { town: 'Westport', hiking: ['Croagh Patrick'], swimming: ['Keel Beach, Achill', 'Bertra Beach'], running: ['Westport Quay'], cycling: ['Great Western Greenway'] },
    Meath:     { town: 'Navan', hiking: ['Hill of Tara'], swimming: ['Bettystown Beach'], running: ['Bettystown Beach'], cycling: ['Boyne Greenway'] },
    Monaghan:  { town: 'Monaghan', hiking: ['Rossmore Forest Park'], running: ['Rossmore Forest Park'] },
    Offaly:    { town: 'Tullamore', hiking: ['Slieve Bloom, Kinnitty'], running: ['Lough Boora Discovery Park'], cycling: ['Grand Canal Greenway'] },
    Roscommon: { town: 'Roscommon', hiking: ['Lough Key Forest Park'], running: ['Lough Key Forest Park'] },
    Sligo:     { town: 'Sligo', hiking: ['Benbulben, Gortarowey loop', 'Knocknarea'], swimming: ['Rosses Point', 'Strandhill'], running: ['Strandhill seafront'] },
    Tipperary: { town: 'Clonmel', hiking: ['Galtymore', "Devil's Bit"], swimming: ['Dromineer, Lough Derg'], running: ['Suir Blueway, Clonmel'], cycling: ['Suir Blueway, Clonmel to Carrick'] },
    Waterford: { town: 'Waterford', padel: true, hiking: ['Mahon Falls, Comeraghs'], swimming: ['Guillamene, Tramore', 'Tramore Beach'], running: ['Tramore Promenade'], cycling: ['Waterford Greenway'] },
    Westmeath: { town: 'Athlone', running: ['Athlone riverside'], cycling: ['Old Rail Trail Greenway'] },
    Wexford:   { town: 'Wexford', hiking: ['Forth Mountain'], swimming: ['Curracloe Beach', 'Rosslare Strand'], running: ['Curracloe Beach'], cycling: ['Hook Peninsula loop'] },
    Wicklow:   { town: 'Bray', hiking: ['Glendalough Spinc', 'Djouce', 'Bray Head'], swimming: ['Greystones South Beach', 'Brittas Bay'], running: ['Bray Promenade'], cycling: ['Sally Gap'] }
  };

  const TIMES = {
    football: ['18:30', '19:00', '20:00', '21:00'],
    padel: ['10:30', '12:00', '18:00', '19:30'],
    hiking: ['09:30', '10:00', '11:00'],
    swimming: ['07:00', '07:30', '08:00', '12:30'],
    running: ['07:00', '18:30', '19:00'],
    cycling: ['08:30', '09:00', '10:00'],
    boardgames: ['19:00', '19:30']
  };

  const NOTES = {
    football: ['Bibs sorted, bring a light and a dark top.', 'Friendly game, no slide tackles.', 'Usually 5 v 5, rolling subs if we get extra.'],
    padel: ['Rackets available to borrow at the desk.', 'Doubles, we mix partners each set.', 'Court booked, split on the night.'],
    hiking: ['Meet at the car park. Boots and rain gear essential.', 'Steady pace, plenty of stops for photos.', 'Bring lunch, we stop at the top if the weather allows.'],
    swimming: ['Tow floats recommended. We swim along the shore, no heroics.', 'Short dip and a flask of tea after.', 'Check the forecast the night before, we cancel in big swell.'],
    running: ['Chatty pace, about 6 minutes per km, nobody left behind.', 'Easy 5 km loop, coffee after.', 'Tempo session, warm-up together first.'],
    cycling: ['Road bikes, about 25 km/h average, café stop halfway.', 'Mixed group, we regroup at the top of every climb.', 'Lights and a spare tube please.'],
    boardgames: ['Bringing Catan and Ticket to Ride, new players welcome.', 'Learning a new game tonight, nobody knows the rules yet.', 'Quick party games, then something longer.']
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
      if (p.padel) add('padel', 'Padel courts, ' + p.town);
      ['hiking', 'swimming', 'running', 'cycling'].forEach(function (a) {
        (p[a] || []).forEach(function (name) { add(a, name); });
      });
      add('boardgames', 'Community centre, ' + p.town);
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

  // A made-up but stable show-up record for sample users.
  function record(handle) {
    const h = hash(handle);
    const total = 4 + (h % 22);
    const came = total - ((h >>> 6) % 3 === 0 ? 1 : 0);
    return { came: came, total: total };
  }

  window.DuineData = {
    COUNTIES: COUNTIES, ACTIVITIES: ACTIVITIES, ORDER: ORDER, LEVELS: LEVELS,
    HANDLES: HANDLES, build: build, record: record, pick: pick
  };
})();
