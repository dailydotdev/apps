import * as THREE from 'three';

/**
 * The taxonomy and the ladder: six realms, forty districts, twelve levels.
 *
 * Lifted out of the renderer because it is the only part of the world that is
 * pure data — it decides what a niche IS, not how it is drawn — and because
 * `buildWorld` has to be testable without a WebGL context. Everything here is
 * verbatim from devcraft `world-lab.html`.
 */

/* ------------------------------------------------------------------ ladder */
/* Calibrated 2026-08-02 against the FULL export — 10,404,383 districts over
   1,325,633 users — not against a sample. That matters, because the previous
   ladder (1/3/8/16/30/55/100/180/300/550/1000/2000) was tuned on a world
   labelled "p50" that measures p93.9 across the real userbase, so every rung
   sat about two percentile-decades too high:

       61.6% of all districts came out L1, 84% were L1-L2, and the top four
       rungs between them described 0.14% of the map. Half of all users owned
       nothing above a WAYSTONE — a whole world of lodestones on bare rock.

   The distribution the ladder actually has to survive is brutally long-tailed:
   45.6% of districts hold exactly ONE article, p50=2, p75=4, p90=12, p99=87,
   and the largest district on the platform holds 8,615. No ladder can split
   the 45.6% — one article is one article — so L1 is a floor we accept.

   The trap here, and the first recalibration walked straight into it, is that
   the ladder has TWO jobs and only one of them is visible in that histogram:

     1. GLOBAL — separate districts across the userbase. Optimising this alone
        means equal population per rung, and since the population is dominated
        by the singletons it drags every rung DOWN.
     2. INTRA-WORLD — separate one user's districts from EACH OTHER. This is
        the one you actually look at, because you look at one world at a time.

   Tuning purely for (1) put 19 of a four-year reader's 40 districts on the same
   rung: a world where everything is the same size, which is precisely the
   saturation the twelve-step ladder exists to prevent. So the rungs DOUBLE from
   L4 up — one rung per doubling of attention, which is scale-free and therefore
   spreads any world's districts the same way wherever that world sits. Measured
   over the whole export: L1 45.6% (was 61.6%), L3-L10 27.7% (was 15.6%), and a
   four-year reader now uses 8 rungs with 40% on the modal one instead of 7 and
   48%.

   Two honest limits. With twelve rungs the bottom and the top compete: every
   rung spent separating 1-from-2-from-3 articles is a rung not available to a
   veteran, and a 14-rung ladder would get that reader to 9 rungs / 28% without
   giving anything back at the bottom. And the modal pile-up is not all ladder —
   that reader genuinely has 16 districts sitting between 320 and 640 articles,
   which no choice of thresholds can pull apart.

   SKY COURT stays endgame on purpose: 0.005% of districts, and the biggest
   district still sits 6.7x above the top rung so there is headroom left in the
   tail. A ladder whose ceiling is reachable stops being a ceiling. */
export const LEVELS = [
  { n:'WAYSTONE',  reads:1,    d:'A single lodestone on bare rock. One article is a real thing that happened — it gets land, however little.' },
  { n:'CAIRN',     reads:2,    d:'Somebody stacked stones and planted the first crystal sprout. Still wild, no longer untouched.' },
  { n:'CAMP',      reads:3,    d:'A tended camp: lantern, path, the district\'s signature motif appears — identity arrives early, before size does.' },
  { n:'HOLD',      reads:5,    d:'Ground is cut into two terraces and the first roof goes up. The plot starts reading as built, not found.' },
  { n:'ATELIER',   reads:10,   d:'A working hamlet with a pool at its heart. Gardens, hedges, the first real greenery.' },
  { n:'SANCTUM',   reads:20,   d:'Three terraces, a dome, and the first spire. Birds arrive — the place is worth circling.' },
  { n:'CONCLAVE',  reads:40,   d:'Water spills off the rim as a falls. Lamps line the paths. Density picks up faster than the land does.' },
  { n:'SPIRE',     reads:80,   d:'Ground runs out before the reading does: cantilever decks brace out past the cliff on struts. The silhouette stops being a lump.' },
  { n:'ACADEMY',   reads:160,  d:'Four terraces, a spire cluster, and sky bridges strung between the towers. Legible from across the map.' },
  { n:'ARCANUM',   reads:320,  d:'Lanterns and hanging gardens spill over the terrace lips, a second hall opens, and the district starts growing downward as well as out.' },
  { n:'CITADEL',   reads:640,  d:'The Great Spire goes up — one landmark that owns the skyline — over a full upper tier of decks and bridges.' },
  { n:'SKY COURT', reads:1280, d:'The endgame plot. Everything lit, everything tended, everything moving. A capital of one subject.' },
];

/* ------------------------------------------------------- realms & districts
   Six realms, forty districts — the whole taxonomy from world-procedural.html.

   The load-bearing rule here is that REALMS must never be confusable. Palette
   alone can't carry that: swap the colours on two identical towns and you get
   two identical towns. So a realm owns its LANDFORM, its ARCHITECTURE, its
   LIQUID and its MOTION, and only the district varies inside that:

     ARCANE SWARM   floating sky-garden   crystal spires   water   wisps
     FRAMEWORKS     living canopy         timber & leaf    dew     butterflies
     METAL FORGES   volcanic mesa         brick & iron     LAVA    embers
     SHIPYARDS      harbour atoll         sheds & cranes   sea     boats
     BASTION        walled crag           ramparts         moat    patrols
     ARTISAN'S      old town              gables & tiles   canal   doves

   A realm also owns the SKY, deliberately: everything under one sky reads as
   one place, so the sky is the fastest "which realm am I in" signal there is —
   and the one that survives at share-card size.

   Districts inside a realm vary by accent family, roof colour and signature
   monument. Accents lean on associations a developer already has (JS is
   cheese-yellow, Rust is bun-orange, Go is blueCheese) so the district reads
   before the label does. */

/* Raw daily.dev tokens, by name, for the places a colour is mixed rather than
   used neat. Mixing two tokens is a design-system move, not a departure from
   it — it is exactly how the product derives its `-flat` and `-float` variants
   (`color-mix(..., var(--theme-background-default))`). */
export const T={
  salt0:0xFFFFFF, salt10:0xF5F6FA, salt20:0xEBEEF5, salt30:0xE1E5EF,
  salt40:0xD7DDE9, salt50:0xCDD4E4, salt60:0xC3CCE0, salt70:0xBAC4DA,
  salt80:0xB1BBD5, salt90:0xA8B3CE,
  pepper10:0x545861, pepper20:0x4B4E57, pepper30:0x41454D, pepper40:0x383C44,
  pepper50:0x2F333B, pepper60:0x272A32, pepper70:0x1E2229, pepper90:0x0F1218,
  cabbage10:0xD97EFE, cabbage20:0xCB6EF1, cabbage40:0xBA56E1, cabbage90:0x8826AA,
  onion10:0x887BF8,  onion20:0x7E6FEE,  onion40:0x6B56DD,  onion90:0x401F9E,
  blue10:0x6EF2FE,   blue20:0x5BEAF6,   blue40:0x29D8E5,   blue90:0x00A0AB,
  avocado10:0x8AF4A9, avocado30:0x68E792, avocado40:0x57E087, avocado90:0x00B25B,
  lettuce10:0xCFFFA8, lettuce20:0xBBFE7D, lettuce40:0xA9F261, lettuce90:0x86D02F,
  cheese10:0xFFF3B7, cheese20:0xFFED99, cheese30:0xFFE877, cheese40:0xFFE24C, cheese90:0xE5C723,
  bun10:0xFFB794,    bun20:0xFFAB81,    bun40:0xFF9157,    bun90:0xD55E00,
  bacon10:0xFF879F,  bacon40:0xF25D82,  bacon90:0xCB3160,
  water10:0x7BA7FF,  water20:0x6696FA,  water40:0x4A7EEE,  water90:0x0B42C1,
  ketchup10:0xF57869, ketchup40:0xDD5143, ketchup90:0xA51A14,
  burger10:0xCA8368, burger40:0xAA6247, burger90:0x713015,
};
export const mixTok=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t).getHex();

export const REALMS=[
{ id:'swarm', name:'THE ARCANE SWARM', theme:'AI, agents & data',
  land:'a floating sky-garden, terraced and lit from within',
  accent:T.cabbage40, seed:11,
  sky:[T.onion20,T.cheese10],
  /* materials */
  /* Luminous, and violet rather than neutral. Four realms used to sit on plain
     salt stone and were indistinguishable at world scale — the fix is not more
     hue on the roofs but a different VALUE and CAST for each realm's rock. The
     Swarm keeps the lightest stone in the world and takes an onion tint. */
  cliff:mixTok(T.salt20,T.onion10,0.24), cliffDark:mixTok(T.salt50,T.onion40,0.30),
  rock:mixTok(T.salt90,T.onion40,0.34),
  stone:T.salt0, stone2:mixTok(T.salt30,T.cabbage10,0.16), wood:T.burger10, metal:T.cheese40,
  ground:mixTok(T.avocado90,T.salt10,0.44), ground2:mixTok(T.avocado40,T.salt10,0.34),
  foliage:mixTok(T.avocado90,T.salt10,0.30), foliage2:T.avocado40,
  liquid:T.blue40, liquidGlow:0.35,
  niches:[
    {id:'ai_llm',   label:'LLMS',      title:'THE WHISPERING LIBRARY', sig:'obelisk', seed:101,
     accent:T.cabbage10, accent2:T.onion10, roof:T.cabbage90, roof2:T.cabbage40, bloom:T.cabbage10},
    {id:'ai_agents',label:'AGENTS',    title:'THE SWARM ROOST',        sig:'roost',   seed:202,
     accent:T.onion10,   accent2:T.blue10,  roof:T.onion90,   roof2:T.onion40,  bloom:T.onion10},
    {id:'ai_infra', label:'AI INFRA',  title:'THE CONDUIT WORKS',      sig:'conduit', seed:303,
     accent:T.blue10,    accent2:T.cabbage10, roof:T.blue90,  roof2:T.blue40,   bloom:T.blue10},
    {id:'ml_ds',    label:'ML & DS',   title:'THE ORRERY GARDENS',     sig:'orrery',  seed:404,
     accent:T.cheese30,  accent2:T.bun10,   roof:T.bun90,     roof2:T.bun40,    bloom:T.cheese20},
    {id:'data_eng', label:'DATA ENG',  title:'THE AQUEDUCT TERRACES',  sig:'aqueduct',seed:505,
     accent:T.water10,   accent2:T.blue10,  roof:T.water90,   roof2:T.water40,  bloom:T.water10},
    {id:'ai_safety',label:'AI SAFETY', title:'THE WARDING RING',       sig:'wardring',seed:606,
     accent:T.cheese20,  accent2:T.cabbage10, roof:T.bacon90, roof2:T.bacon40,  bloom:T.cheese10},
    {id:'python',   label:'PYTHON',    title:'THE SERPENT STEPS',      sig:'coil',    seed:707,
     accent:T.lettuce10, accent2:T.cheese30, roof:T.avocado90,roof2:T.avocado40,bloom:T.lettuce10},
  ]},

{ id:'frame', name:'THE FRAMEWORKS', theme:'web, mobile & app dev',
  land:'a living canopy on root buttresses',
  accent:T.avocado40, seed:22,
  sky:[T.water10,T.cheese10], skyMix:0.30,
  cliff:mixTok(T.burger10,T.salt10,0.42), cliffDark:T.burger40,
  rock:mixTok(T.burger90,T.salt40,0.34),
  stone:mixTok(T.cheese10,T.salt10,0.45), stone2:T.burger10, wood:T.burger40, metal:T.cheese40,
  ground:mixTok(T.avocado90,T.lettuce20,0.26), ground2:mixTok(T.avocado40,T.lettuce10,0.30),
  foliage:T.avocado90, foliage2:T.lettuce20,
  liquid:T.blue20, liquidGlow:0.3,
  niches:[
    {id:'js_ts',     label:'JS / TS',   title:'THE GREAT LOOM',       sig:'loom',      seed:111,
     accent:T.cheese30, accent2:T.bun10,   roof:T.cheese90, roof2:T.cheese40, bloom:T.cheese20},
    {id:'css_design',label:'CSS & UI',  title:'THE DYEWORKS',         sig:'loom',      seed:222,
     accent:T.bacon10,  accent2:T.cabbage10, roof:T.bacon90, roof2:T.bacon40, bloom:T.bacon10},
    {id:'android',   label:'ANDROID',   title:'THE GREEN CANOPY',     sig:'canopywalk',seed:333,
     accent:T.avocado10,accent2:T.lettuce10, roof:T.avocado90, roof2:T.avocado40, bloom:T.lettuce10},
    {id:'ios_apple', label:'IOS',       title:'THE ORCHARD OF GLASS', sig:'canopywalk',seed:444,
     accent:T.salt10,   accent2:T.blue10,  roof:T.salt90,   roof2:T.salt50,   bloom:T.salt10},
    {id:'jvm',       label:'JVM',       title:'THE OLD BEANWOOD',     sig:'greenhouse',seed:555,
     accent:T.bun10,    accent2:T.ketchup10, roof:T.bun90,  roof2:T.bun40,    bloom:T.bun10},
    {id:'dotnet',    label:'.NET',      title:'THE LATTICE HALLS',    sig:'greenhouse',seed:666,
     accent:T.cabbage10,accent2:T.onion10, roof:T.cabbage90,roof2:T.cabbage40,bloom:T.cabbage10},
    {id:'php',       label:'PHP',       title:'THE ELEPHANT GROVE',   sig:'wellspring',seed:777,
     accent:T.onion10,  accent2:T.water10, roof:T.onion90,  roof2:T.onion40,  bloom:T.onion10},
    {id:'ruby',      label:'RUBY',      title:'THE RED ORCHARD',      sig:'wellspring',seed:888,
     accent:T.ketchup10,accent2:T.bacon10, roof:T.ketchup90,roof2:T.ketchup40,bloom:T.ketchup10},
  ]},

{ id:'forge', name:'THE METAL FORGES', theme:'systems & low-level',
  land:'a volcanic mesa on basalt columns',
  accent:T.bun40, seed:33,
  /* Dusk, not damnation. Deep indigo overhead and an ember horizon: the forges
     have to feel like a warm workshop at the end of the day, not a hellscape —
     the whole world is meant to be somewhere you'd want to live. */
  sky:[T.onion90,T.bun40], skyMix:0.04,   // keep the dusk saturated
  cliff:T.pepper20, cliffDark:T.pepper50, rock:mixTok(T.pepper20,T.bun90,0.34),
  stone:mixTok(T.pepper10,T.salt40,0.46), stone2:mixTok(T.pepper30,T.salt40,0.30),
  wood:T.burger90, metal:T.salt70,
  ground:mixTok(T.pepper20,T.burger90,0.35), ground2:mixTok(T.pepper10,T.bun90,0.30),
  foliage:mixTok(T.avocado90,T.pepper40,0.45), foliage2:T.burger90,
  liquid:T.bun40, liquidGlow:1.6,          // molten, and it lights the place
  niches:[
    {id:'c_cpp',      label:'C / C++',    title:'THE DEEP FOUNDRY',   sig:'bigwheel', seed:121,
     accent:T.water10, accent2:T.blue10,  roof:T.water90,  roof2:T.water40,  bloom:T.water10},
    {id:'rust',       label:'RUST',       title:'THE OXIDE WORKS',    sig:'bigwheel', seed:232,
     accent:T.bun10,   accent2:T.cheese30,roof:T.bun90,    roof2:T.bun40,    bloom:T.bun10},
    {id:'linux_os',   label:'LINUX & OS', title:'THE KERNEL FORGE',   sig:'anvilyard',seed:343,
     accent:T.cheese30,accent2:T.bun10,   roof:T.cheese90, roof2:T.cheese40, bloom:T.cheese20},
    {id:'embedded',   label:'EMBEDDED',   title:'THE CIRCUIT KILNS',  sig:'crucible', seed:454,
     accent:T.avocado10,accent2:T.lettuce10,roof:T.avocado90,roof2:T.avocado40,bloom:T.lettuce10},
    {id:'gamedev',    label:'GAMEDEV',    title:'THE PIXEL SMELTERY', sig:'crucible', seed:565,
     accent:T.cabbage10,accent2:T.bacon10, roof:T.cabbage90,roof2:T.cabbage40,bloom:T.cabbage10},
    {id:'niche_langs',label:'NICHE LANGS',title:'THE PIPE ORGAN',     sig:'pipeorgan',seed:676,
     accent:T.blue10,  accent2:T.onion10, roof:T.blue90,   roof2:T.blue40,   bloom:T.blue10},
  ]},

{ id:'ship', name:'THE SHIPYARDS', theme:'cloud, infra & ops',
  land:'a harbour atoll ringed by open water',
  accent:T.blue40, seed:44,
  sky:[T.blue40,T.salt10], skyMix:0.44,
  /* Warm sand on the deck, teal in the rock and the water under it. The
     harbour is the LIGHT cold realm; the Bastion is the dark one. */
  cliff:mixTok(T.salt40,T.blue90,0.28), cliffDark:mixTok(T.salt70,T.blue90,0.40),
  rock:mixTok(T.salt90,T.blue90,0.44),
  stone:mixTok(T.salt10,T.blue10,0.10), stone2:mixTok(T.salt30,T.blue10,0.14),
  wood:T.burger10, metal:T.blue90,
  /* Cool concrete, not warm sand. The quay used to share the Artisan's Quarter's
     warm floor, and a floor is most of what you see of a realm from above. */
  ground:mixTok(T.salt60,T.blue90,0.13), ground2:mixTok(T.salt40,T.blue10,0.15),
  foliage:mixTok(T.avocado90,T.salt40,0.40), foliage2:T.avocado40,
  liquid:T.blue40, liquidGlow:0.28,
  niches:[
    {id:'k8s',             label:'KUBERNETES', title:'THE GREAT DRYDOCK',  sig:'drydock',   seed:141,
     accent:T.water10, accent2:T.blue10,  roof:T.water90, roof2:T.water40, bloom:T.water10},
    {id:'cloud',           label:'CLOUD',      title:'THE CLOUD HARBOUR',  sig:'drydock',   seed:242,
     accent:T.salt10,  accent2:T.blue10,  roof:T.salt90,  roof2:T.salt50,  bloom:T.salt10},
    {id:'go',              label:'GO',         title:'THE GOPHER QUAY',    sig:'containers',seed:343,
     accent:T.blue10,  accent2:T.cheese30,roof:T.blue90,  roof2:T.blue40,  bloom:T.blue10},
    {id:'ci_devex',        label:'CI/CD',      title:'THE GANTRY LINE',    sig:'crane',     seed:444,
     accent:T.avocado10,accent2:T.lettuce10,roof:T.avocado90,roof2:T.avocado40,bloom:T.lettuce10},
    {id:'observability',   label:'OBSERVE',    title:'THE WATCH LIGHT',    sig:'lighthouse',seed:545,
     accent:T.cabbage10,accent2:T.bun10,  roof:T.cabbage90,roof2:T.cabbage40,bloom:T.cabbage10},
    {id:'databases',       label:'DATABASES',  title:'THE TANK FARM',      sig:'containers',seed:646,
     accent:T.bun10,   accent2:T.cheese30,roof:T.bun90,   roof2:T.bun40,   bloom:T.bun10},
    {id:'distributed_arch',label:'DISTRIBUTED',title:'THE CROSS-DOCKS',    sig:'crane',     seed:747,
     accent:T.onion10, accent2:T.cabbage10,roof:T.onion90, roof2:T.onion40, bloom:T.onion10},
    {id:'selfhost',        label:'SELF-HOST',  title:'THE HOME BERTH',     sig:'lighthouse',seed:848,
     accent:T.cheese30,accent2:T.bun10,   roof:T.cheese90,roof2:T.cheese40,bloom:T.cheese20},
  ]},

{ id:'bastion', name:'THE BASTION', theme:'security & defense',
  land:'a snow-capped crag, ramparts on every terrace',
  accent:T.water40, seed:55,
  sky:[T.water40,T.salt0],
  /* SNOW ON BLACK ROCK. A muted dark-teal fortress was correctly placed in the
     set and boring in it — the Bastion had a slot and no character. Its
     identity is now internal CONTRAST rather than an overall value: the palest
     ground in the world sitting on the darkest crag, which nothing else in the
     set does. It is still the cold dark realm from across the map, and up close
     it is a winter fortress with lanterns burning on the walls. */
  cliff:mixTok(T.pepper20,T.water90,0.26), cliffDark:mixTok(T.pepper40,T.water90,0.20),
  rock:mixTok(T.pepper50,T.water90,0.30),
  stone:mixTok(T.salt30,T.water90,0.14), stone2:mixTok(T.salt60,T.water90,0.24),
  wood:T.burger90, metal:T.water90,
  ground:mixTok(T.salt0,T.water10,0.12), ground2:mixTok(T.salt20,T.water10,0.20),
  foliage:mixTok(T.avocado90,T.pepper40,0.52), foliage2:mixTok(T.avocado90,T.water90,0.34),
  liquid:mixTok(T.blue10,T.salt10,0.32), liquidGlow:0.22,
  niches:[
    {id:'sec_appsec', label:'APPSEC',   title:'THE INNER KEEP',    sig:'keep',     seed:151,
     accent:T.water10, accent2:T.blue10,  roof:T.water90, roof2:T.water40, bloom:T.water10},
    {id:'sec_crypto', label:'CRYPTO',   title:'THE SEALED VAULT',  sig:'vault',    seed:252,
     accent:T.cheese30,accent2:T.cheese10,roof:T.cheese90,roof2:T.cheese40,bloom:T.cheese20},
    {id:'sec_threats',label:'THREATS',  title:'THE WATCHFIRES',    sig:'watchfire',seed:353,
     accent:T.bun10,   accent2:T.ketchup10,roof:T.ketchup90,roof2:T.ketchup40,bloom:T.bun10},
  ]},

{ id:'quarter', name:'THE ARTISAN’S QUARTER', theme:'craft, career & culture',
  land:'a warm old town of gables and squares',
  accent:T.bacon40, seed:66,
  sky:[T.bacon10,T.cheese10], skyMix:0.46,
  /* Terracotta, not cream. It used to share the Shipyards' pale sand; now the
     whole town sits on warm clay with a rose cast, which is the one thing the
     other five realms have none of. */
  /* A hill town in the sun: golden sandstone cliffs over terracotta paving.
     "Warm" was not enough on its own — the Shipyards were warm too. This is
     the only realm in the set that is SATURATED rather than tinted. */
  cliff:mixTok(T.bun10,T.cheese10,0.34), cliffDark:mixTok(T.bun40,T.burger40,0.32),
  /* Lifted off near-black: a dark red root read as the Forges' from a
     distance, and the two realms are meant to be nothing alike. */
  rock:mixTok(mixTok(T.burger90,T.bacon90,0.35),T.salt40,0.30),
  stone:mixTok(T.salt10,T.bun10,0.12), stone2:mixTok(T.cheese10,T.bun10,0.28),
  wood:T.burger40, metal:T.cheese40,
  ground:mixTok(T.burger40,T.bun10,0.44), ground2:mixTok(T.bun10,T.cheese10,0.40),
  foliage:mixTok(T.avocado90,T.cheese10,0.30), foliage2:T.avocado40,
  liquid:T.blue20, liquidGlow:0.3,
  niches:[
    {id:'devtools',       label:'DEVTOOLS',   title:'THE TOOLWRIGHTS',   sig:'workshop',  seed:161,
     accent:T.blue10,  accent2:T.water10, roof:T.blue90,  roof2:T.blue40,  bloom:T.blue10},
    {id:'git_vcs',        label:'GIT & VCS',  title:'THE RECORD HOUSE',  sig:'library',   seed:262,
     accent:T.bun10,   accent2:T.cheese30,roof:T.bun90,   roof2:T.bun40,   bloom:T.bun10},
    {id:'software_craft', label:'CRAFT',      title:'THE GUILD ROW',     sig:'workshop',  seed:363,
     accent:T.bacon10, accent2:T.cabbage10,roof:T.bacon90, roof2:T.bacon40, bloom:T.bacon10},
    {id:'cs_fundamentals',label:'FUNDAMENTALS',title:'THE OLD ACADEMY',  sig:'library',   seed:464,
     accent:T.onion10, accent2:T.cabbage10,roof:T.onion90, roof2:T.onion40, bloom:T.onion10},
    {id:'career',         label:'CAREER',     title:'THE HOUR TOWER',    sig:'clocktower',seed:565,
     accent:T.avocado10,accent2:T.lettuce10,roof:T.avocado90,roof2:T.avocado40,bloom:T.lettuce10},
    {id:'eng_mgmt',       label:'ENG MGMT',   title:'THE COUNCIL SQUARE',sig:'clocktower',seed:666,
     accent:T.water10, accent2:T.onion10, roof:T.water90, roof2:T.water40, bloom:T.water10},
    {id:'industry_news',  label:'INDUSTRY',   title:'THE CRIER’S MARKET',sig:'market',    seed:767,
     accent:T.cheese30,accent2:T.bun10,   roof:T.cheese90,roof2:T.cheese40,bloom:T.cheese20},
    {id:'other',          label:'THE COMMONS',title:'THE COMMONS',       sig:'market',    seed:868,
     accent:T.salt10,  accent2:T.cheese30,roof:T.salt90,  roof2:T.salt50,  bloom:T.salt10},
  ]},
];

/* A district's palette is its realm's materials with the niche's accents laid
   over the top, so every builder can read one flat object and never has to know
   which realm it is drawing for. */
export function paletteOf(realm,niche){
  const P={...realm,...niche};
  P.realm=realm; P.kit=realm.id;
  P.skyA=realm.sky[0]; P.skyB=realm.sky[1];
  return P;
}

/* Level from a lifetime article count, on the twelve-step ladder. */
export function levelOf(articles){
  if(articles<=0)return 0;
  let L=1; for(let i=0;i<LEVELS.length;i++) if(articles>=LEVELS[i].reads) L=i+1;
  return L;
}
/* A REALM is scored on the same ladder with the thresholds moved out 8x. The
   divisor tracks the ladder: on the recalibrated rungs 4x puts a four-year
   reader at L12 / L12 / L11 / L11 / L11 / L10, which is the saturation the
   twelve-step ladder exists to prevent, one scale up. 8x lands the same reader
   on L11 / L11 / L11 / L11 / L10 / L10 and holds L11+L12 to 0.006% of realms.

   No divisor rescues the middle of this axis, and it is honest to say so: a
   user reads a handful of niches inside one or two realms, so 82% of realm
   instances are a single-digit article count and score L1 whatever we do. The
   realm ladder separates the top of the userbase; it is not a progress bar for
   the median. Floored at 1: a realm you have read once is small, not absent. */
export const REALM_DIV=8;
export const realmLevelOf=a=>a<=0?0:Math.max(1,levelOf(a/REALM_DIV));

export const NICHE_OF={}, REALM_OF={};
REALMS.forEach(r=>r.niches.forEach(n=>{ NICHE_OF[n.id]=n; REALM_OF[n.id]=r; }));
