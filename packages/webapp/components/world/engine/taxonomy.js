import * as THREE from 'three';

/**
 * The taxonomy and the ladder: six realms, forty districts, twelve levels.
 *
 * Lifted out of the renderer because it is the only part of the world that is
 * pure data — it decides what a niche IS, not how it is drawn — and because
 * `buildWorld` has to be testable without a WebGL context. The ladder is
 * devcraft's `world-lab.html`, recalibrated against the full export; the realm
 * palettes and their light are the concept art from `concept-lab.html`.
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
   tail. A ladder whose ceiling is reachable stops being a ceiling.

   `reads` is the only field that reaches a reader, as "L7". The names and the
   descriptions are for whoever edits the geometry: they say what each rung is
   supposed to BUILD, next to the threshold that triggers it. Twelve invented
   names is a second vocabulary to learn before a level means anything, so the
   UI counts instead of naming, and nothing here should be rendered. */
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
   KEEL, its LIQUID and its MOTION, and only the district varies inside that:

     ARCANE SWARM  white terraces on a crystal keel   domes & spires   teal water
     FRAMEWORKS    one colossal tree on root buttress timber & glass   dew
     METAL FORGES  basalt columns under a dark deck   brick & iron     LAVA
     SHIPYARDS     grey crag under a concrete deck    sheds & cranes   basins
     BASTION       snow over grey rock, icicles below ring-walls       ice-melt
     ARTISAN'S     rounded clay boulder, shrub fringe stucco & tile    fountains

   THE UNDERSIDE IS REALM IDENTITY. Every concept image is a floating island and
   in every one of them the bottom is the tell — crystal stalactites, wrapped
   roots, hexagonal basalt columns, wet grey crag, icicles, rounded clay
   boulders. One keel cone for all six threw that away, and it is the part that
   reads at share-card size, from below, in shadow.

   AND EVERY REALM GETS A LANDFORM, present at L1 before a single building is:
   floating shards, a great tree, a lava vent, harbour basins, ramparts, a
   fountain square. Three realms used to have terrain of their own and three had
   only props, which left half the set unreadable until L3.

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

/* ---------------------------------------------------------- realm materials
   Two tables, deliberately kept apart.

   T above is the daily.dev ramp, used ONLY for district accents and for the
   chrome. C is the concept-art palette, read off the six reference images, used
   for everything the realm itself is made of. Keeping them separate is what
   stops the next person from "harmonising" a realm back into the brand ramp and
   losing the thing the art was for.

   The first pass derived every realm from token mixes, which kept the palette
   on-brand and made all six realms siblings of the same pastel family. The
   concept art says something louder: each realm is its own WORLD, with its own
   light, its own rock and its own weather. The brand rides the accent — the
   lodestone band, the roof trim, the lamps, the banners — which is where it is
   legible and where it does not fight the light. */
const C={
  /* --- the arcane swarm: white marble terraces, lavender crystal, teal water
     The crystal lives ON the island, never under it — see keelCrystal.
     "White marble" is a trap: put every surface between 0.85 and 0.97 luminance
     and the whole place dissolves into fog. In the reference the marble is white
     only where the sun hits it — the terrace walls are a full step down in
     shadow, the keel deeper again, and the colour that carries the image is the
     SATURATED violet of the trees and crystal against a properly green lawn.
     Pale is one note here, not the key. */
  sw:{ skyA:0x5FADEC, skyB:0xE6D6F5,
       cliff:0xD6C9E6, cliff2:0xB6A4D0,                      // terrace walls: mid
       rock:0x9276BE,                                        // keel: deepest
       crys:0xC44FF5, crys2:0x8B45E0,                        // magic: fully saturated
       grass:0x5FBE63, grass2:0x84D477,                      // lawn: real green
       stone:0xFAF7FC, stone2:0xDACEEA,                      // marble: lit / shaded
       wood:0x8A5C3A, metal:0xE8C86A,
       leaf:0x9A57D6, leaf2:0xB16BE4, water:0x45C8E0, warm:0xFFD070 },
  /* --- the frameworks: one colossal tree, timber cottages, glass, purple dusk */
  fr:{ skyA:0x8F7FE0, skyB:0xF7D8E9, cliff:0x8A6A50, cliff2:0x6E5340, rock:0x5C4536,
       bark:0x8B6A4E, bark2:0x6B4F3B, canopy:0x8FD032, canopy2:0xB6E958,
       grass:0x63B23C, grass2:0x86CC4E, stone:0xE7D2A8, stone2:0xD3B888,
       /* Roof moss a step below the lawn: at the same value the cottages read
          as green patches ON the grass rather than as buildings standing on it. */
       wood:0xC08B55, metal:0xC9A05E, moss:0x497F30, moss2:0x356021,
       glass:0xA9E7D8, water:0x5FD3E6, warm:0xFFCE6A, shroom:0xF07EC0, shroom2:0xA46BE0 },
  /* --- the metal forges: purple dusk, basalt columns, brick, molten orange
     Read as a VALUE ladder, not a hue. The reference is not a dark picture — it
     is a light plaza with dark things standing on it and one blazing hot accent.
     In order, darkest to lightest: keel columns → metal roofs → brick walls →
     plaza deck, then the lava sitting a long way outside the whole ramp. */
  fo:{ skyA:0x2E1854, skyB:0xF56A22,
       cliff:0x5C4F66, cliff2:0x453A50, rock:0x3A3145,       // keel: the darkest tier
       deck:0xBCAEC2, deck2:0xA294AA,                        // plaza: the lightest
       brick:0xC26B45, brick2:0xDC8659,                      // walls: warm mid
       iron:0x565064, iron2:0x3E3849,                        // roofs: dark, not black
       wood:0x6B4C40, metal:0xAAA2B2,
       lava:0xFF8422, lavaHot:0xFFDC7C, quench:0x3FC7C7, warm:0xFFC96A, smoke:0x9C93A8 },
  /* --- the shipyards: noon blue, grey crag, concrete deck, turquoise basins
     The sheds are the WHITE thing here and the deck is the mid tone they stand
     on — cream sheds on cream concrete dissolve into the ground. Crag darker
     again below, so the island reads as a poured slab sitting on wet rock
     rather than as one beige mass. */
  sh:{ skyA:0x3897E2, skyB:0xE2F0FB,
       cliff:0x6E6E6A, cliff2:0x4A4A48, rock:0x585855,        // crag: darkest
       deck:0xBBAD94, deck2:0x9E9078,                         // concrete: mid
       hull:0xF2EDE2, stripe:0x2E9EC4, stripe2:0x15718F,      // sheds: white + band
       stone:0xD2C9B6, stone2:0xB4A88F, wood:0x8A5A2E, metal:0x8A939C,
       rust:0x96612F, lattice:0xC08F52, water:0x1FB8D6, warm:0xFFD48A,
       grass:0x7C9668, grass2:0x94AC7C },
  /* --- the bastion: winter blue, grey ashlar, deep snow, cyan ward-light
     Snow is the brightest thing in the world and rock in shadow is nearly the
     darkest — that gap IS the realm. Run the whole fortress through a narrow
     band of mid-grey with white icing on top and it reads as a paper model. The
     pines stay as the one deep accent anchoring an image otherwise made of
     white and sky. */
  ba:{ skyA:0x2A8FE0, skyB:0xEAF4FF,
       cliff:0x4E4E58, cliff2:0x35353E, rock:0x3A3A44,        // crag: darkest
       snow:0xF7FAFF, snow2:0xD4E2F2, ice:0xBCDDF2,           // snow: brightest
       stone:0x6E6E7A, stone2:0x53535E, wood:0x5A4436, metal:0x848C98,
       pine:0x24523A, pine2:0x1A3F2B, ward:0x4FC3F5, water:0x4FA6D8, warm:0xFFA23C },
  /* --- the artisan's quarter: honey stucco, rose roofs, clay boulder, doves
     Everything honey — towers, the paving they stand on and the boulder
     underneath — inside half a stop of each other reads as one extruded lump of
     clay. Paving goes up toward cream, the boulder drops toward earth, and the
     stucco keeps the middle with a proper shadow tone of its own. */
  qu:{ skyA:0x3AA2EC, skyB:0xEDF6FF,
       cliff:0x8E6238, cliff2:0x6B4726, rock:0x7A5230,        // boulder: darkest
       stucco:0xEDBA6E, stucco2:0xD4914A, stucco3:0xFADFAC,   // walls: lit / shaded
       rose:0xDE5872, rose2:0xBE3E58, blush:0xEE7690,
       stone:0xF9E9CA, stone2:0xE6D0A6,                        // paving: lightest
       wood:0x8E5D2E, metal:0x33292F,
       leaf:0x4C8A30, leaf2:0x6BA845, water:0x54C0E6, warm:0xFFD070 },
};

/* Every builder that isn't realm-specific — paving, scatter, hedges, the
   lodestone — needs a ground, a second ground and a foliage without caring what
   the realm calls them. Aliased here rather than repeated in each palette, so
   the six stay readable as the art descriptions they are. */
/* The swarm is the one realm whose CAPS are not turf: in the reference the high
   plate is dressed white stone and the green is the lawn that surrounds it, so
   the inner terrace paves and the outer ones stay grass. */
C.sw.ground=C.sw.grass;   C.sw.ground2=0xE2D9EE;     C.sw.foliage=0x3F9448; C.sw.foliage2=0x64BC5E;
C.fr.ground=C.fr.grass;   C.fr.ground2=C.fr.grass2;  C.fr.foliage=C.fr.moss; C.fr.foliage2=C.fr.canopy;
/* Forge caps run the other way round: `ground2` dresses the innermost terrace,
   and in the forges that terrace is the swept plaza — the brightest surface on
   the island. Assigned like the other five it came out as the DARKEST, which
   put the one light plane underneath everything else. */
C.fo.ground=C.fo.deck2;   C.fo.ground2=C.fo.deck;    C.fo.foliage=0x4A4438;  C.fo.foliage2=0x3A3630;
C.fo.stone=C.fo.deck;     C.fo.stone2=C.fo.deck2;    // the forges pave in the same dark slab they stand on
C.fo.water=C.fo.lava;     // and their liquid is molten: the pool, the falls, the channel
C.sh.ground=C.sh.deck;    C.sh.ground2=C.sh.deck2;   C.sh.foliage=C.sh.grass;C.sh.foliage2=C.sh.grass2;
C.ba.ground=C.ba.snow;    C.ba.ground2=C.ba.snow2;   C.ba.foliage=C.ba.pine; C.ba.foliage2=C.ba.pine2;
C.qu.ground=C.qu.stone;   C.qu.ground2=C.qu.stone2;  C.qu.foliage=C.qu.leaf; C.qu.foliage2=C.qu.leaf2;

/* --------------------------------------------------------------- realm light
   Each concept image is lit as its own place: the forges are a dusk workshop
   with a hot bounce off the lava, the bastion a bright winter day where the
   only thing separating one white plane from the next is how blue its shadow
   goes. A realm's rig is what makes its materials read the way they were
   painted, so entering a realm switches to it; the world view stays on the sky
   the owner chose, because up there you are looking at all six at once.

   `haze` is the horizon band. Five realms want it near-white — that is what a
   bright day does. The forges want the EMBER, so their ramp runs indigo →
   magenta → orange with no white in it anywhere; a white band there turns the
   dusk into an overcast afternoon and takes the whole realm down with it. */
export const REALM_LIGHT={
  /* On an island made of pale material the ambient IS the contrast budget. At
     hemi 0.42 plus a 0.75 bounce every shadow the sun cast was filled back in
     before it landed, and the marble read as fog. Ambient down, sun up — the
     shading does the drawing. */
  swarm:  {haze:0xFFFFFF, sun:0xFFF4D4,si:2.45, sky:0xBBD8FF,gnd:0xB79EDC,hi:0.26, bo:0xA274D6,bi:0.48, exp:1.02},
  frame:  {haze:0xFBE4F2, sun:0xFFE7C0,si:2.10, sky:0xC7B6F5,gnd:0x6B8F42,hi:0.32, bo:0x9A7BE8,bi:0.70, exp:1.02},
  /* Lit from BOTH ends: a cool dusk sun still strong enough to shape the
     buildings and throw hard shadows across the pale plaza, plus a hot bounce
     off the lava from below. Run the sun at 0.85 and let the lava do everything
     and nothing has form — the island comes back as one flat purple smudge. */
  forge:  {haze:0xB03C55, sun:0xF4E6FF,si:2.05, sky:0x6B5A9E,gnd:0xD4642A,hi:0.46, bo:0xFF8422,bi:1.30, exp:1.14},
  ship:   {haze:0xFFFFFF, sun:0xFFFBEF,si:2.55, sky:0xA8D6F8,gnd:0x8A8172,hi:0.26, bo:0x2FBFD8,bi:0.50, exp:1.02},
  /* Cool bounce, low ambient: snow in shadow goes blue. A near-white hemi
     ground at 0.55 lights the shadow sides back up to the value of the lit
     ones, which is how a fortress ends up reading as a paper model of itself. */
  bastion:{haze:0xFFFFFF, sun:0xFFFFFF,si:2.50, sky:0xBEDCFF,gnd:0x7FA0C8,hi:0.30, bo:0x6FA8E0,bi:0.50, exp:1.02},
  quarter:{haze:0xFFF6E8, sun:0xFFEFC8,si:2.40, sky:0xB8DEFF,gnd:0xC49660,hi:0.28, bo:0xFFC98A,bi:0.55, exp:1.02},
};

export const REALMS=[
{ id:'swarm', name:'Arcane Swarm', theme:'AI, agents & data',
  land:'terraced white marble on a keel of cut crystal',
  accent:T.cabbage40, seed:11, pal:'sw', keel:'crystal', form:'shards',
  liquidGlow:0.30,
  niches:[
    {id:'ai_llm',   label:'LLMs',      title:'THE WHISPERING LIBRARY', sig:'obelisk', seed:101,
     accent:T.cabbage10, accent2:T.onion10, roof:T.cabbage90, roof2:T.cabbage40, bloom:T.cabbage10},
    {id:'ai_agents',label:'Agents',    title:'THE SWARM ROOST',        sig:'roost',   seed:202,
     accent:T.onion10,   accent2:T.blue10,  roof:T.onion90,   roof2:T.onion40,  bloom:T.onion10},
    {id:'ai_infra', label:'AI infra',  title:'THE CONDUIT WORKS',      sig:'conduit', seed:303,
     accent:T.blue10,    accent2:T.cabbage10, roof:T.blue90,  roof2:T.blue40,   bloom:T.blue10},
    {id:'ml_ds',    label:'ML & DS',   title:'THE ORRERY GARDENS',     sig:'orrery',  seed:404,
     accent:T.cheese30,  accent2:T.bun10,   roof:T.bun90,     roof2:T.bun40,    bloom:T.cheese20},
    {id:'data_eng', label:'Data eng',  title:'THE AQUEDUCT TERRACES',  sig:'aqueduct',seed:505,
     accent:T.water10,   accent2:T.blue10,  roof:T.water90,   roof2:T.water40,  bloom:T.water10},
    {id:'ai_safety',label:'AI safety', title:'THE WARDING RING',       sig:'wardring',seed:606,
     accent:T.cheese20,  accent2:T.cabbage10, roof:T.bacon90, roof2:T.bacon40,  bloom:T.cheese10},
    {id:'python',   label:'Python',    title:'THE SERPENT STEPS',      sig:'coil',    seed:707,
     accent:T.lettuce10, accent2:T.cheese30, roof:T.avocado90,roof2:T.avocado40,bloom:T.lettuce10},
  ]},

{ id:'frame', name:'Frameworks', theme:'web, mobile & app dev',
  land:'a colossal tree on root buttresses, cottages under its canopy',
  accent:T.avocado40, seed:22, pal:'fr', keel:'roots', form:'greattree',
  liquidGlow:0.26,
  niches:[
    {id:'js_ts',     label:'JS / TS',  title:'THE GREAT LOOM',       sig:'loom',      seed:111,
     accent:T.cheese30, accent2:T.bun10,   roof:T.cheese90, roof2:T.cheese40, bloom:T.cheese20},
    {id:'css_design',label:'CSS & UI', title:'THE DYEWORKS',         sig:'loom',      seed:222,
     accent:T.bacon10,  accent2:T.cabbage10, roof:T.bacon90, roof2:T.bacon40, bloom:T.bacon10},
    {id:'android',   label:'Android',  title:'THE GREEN CANOPY',     sig:'canopywalk',seed:333,
     accent:T.avocado10,accent2:T.lettuce10, roof:T.avocado90, roof2:T.avocado40, bloom:T.lettuce10},
    {id:'ios_apple', label:'iOS',      title:'THE ORCHARD OF GLASS', sig:'canopywalk',seed:444,
     accent:T.salt10,   accent2:T.blue10,  roof:T.salt90,   roof2:T.salt50,   bloom:T.salt10},
    {id:'jvm',       label:'JVM',      title:'THE OLD BEANWOOD',     sig:'greenhouse',seed:555,
     accent:T.bun10,    accent2:T.ketchup10, roof:T.bun90,  roof2:T.bun40,    bloom:T.bun10},
    {id:'dotnet',    label:'.NET',     title:'THE LATTICE HALLS',    sig:'greenhouse',seed:666,
     accent:T.cabbage10,accent2:T.onion10, roof:T.cabbage90,roof2:T.cabbage40,bloom:T.cabbage10},
    {id:'php',       label:'PHP',      title:'THE ELEPHANT GROVE',   sig:'wellspring',seed:777,
     accent:T.onion10,  accent2:T.water10, roof:T.onion90,  roof2:T.onion40,  bloom:T.onion10},
    {id:'ruby',      label:'Ruby',     title:'THE RED ORCHARD',      sig:'wellspring',seed:888,
     accent:T.ketchup10,accent2:T.bacon10, roof:T.ketchup90,roof2:T.ketchup40,bloom:T.ketchup10},
  ]},

{ id:'forge', name:'Metal Forges', theme:'systems & low-level',
  land:'a dark deck on hexagonal basalt columns, lit from the cracks',
  accent:T.bun40, seed:33, pal:'fo', keel:'columns', form:'lavavent',
  liquidGlow:1.5,                          // molten, and it lights the place
  niches:[
    {id:'c_cpp',      label:'C / C++',     title:'THE DEEP FOUNDRY',   sig:'bigwheel', seed:121,
     accent:T.water10, accent2:T.blue10,  roof:T.water90,  roof2:T.water40,  bloom:T.water10},
    {id:'rust',       label:'Rust',        title:'THE OXIDE WORKS',    sig:'bigwheel', seed:232,
     accent:T.bun10,   accent2:T.cheese30,roof:T.bun90,    roof2:T.bun40,    bloom:T.bun10},
    {id:'linux_os',   label:'Linux & OS',  title:'THE KERNEL FORGE',   sig:'anvilyard',seed:343,
     accent:T.cheese30,accent2:T.bun10,   roof:T.cheese90, roof2:T.cheese40, bloom:T.cheese20},
    {id:'embedded',   label:'Embedded',    title:'THE CIRCUIT KILNS',  sig:'crucible', seed:454,
     accent:T.avocado10,accent2:T.lettuce10,roof:T.avocado90,roof2:T.avocado40,bloom:T.lettuce10},
    {id:'gamedev',    label:'Gamedev',     title:'THE PIXEL SMELTERY', sig:'crucible', seed:565,
     accent:T.cabbage10,accent2:T.bacon10, roof:T.cabbage90,roof2:T.cabbage40,bloom:T.cabbage10},
    {id:'niche_langs',label:'Niche langs', title:'THE PIPE ORGAN',     sig:'pipeorgan',seed:676,
     accent:T.blue10,  accent2:T.onion10, roof:T.blue90,   roof2:T.blue40,   bloom:T.blue10},
  ]},

{ id:'ship', name:'Shipyards', theme:'cloud, infra & ops',
  land:'a concrete dock on grey crag, basins cut into the deck',
  accent:T.blue40, seed:44, pal:'sh', keel:'crag', form:'basins',
  liquidGlow:0.18,
  niches:[
    {id:'k8s',             label:'Kubernetes',  title:'THE GREAT DRYDOCK',  sig:'drydock',   seed:141,
     accent:T.water10, accent2:T.blue10,  roof:T.water90, roof2:T.water40, bloom:T.water10},
    {id:'cloud',           label:'Cloud',       title:'THE CLOUD HARBOUR',  sig:'drydock',   seed:242,
     accent:T.salt10,  accent2:T.blue10,  roof:T.salt90,  roof2:T.salt50,  bloom:T.salt10},
    {id:'go',              label:'Go',          title:'THE GOPHER QUAY',    sig:'containers',seed:343,
     accent:T.blue10,  accent2:T.cheese30,roof:T.blue90,  roof2:T.blue40,  bloom:T.blue10},
    {id:'ci_devex',        label:'CI/CD',       title:'THE GANTRY LINE',    sig:'crane',     seed:444,
     accent:T.avocado10,accent2:T.lettuce10,roof:T.avocado90,roof2:T.avocado40,bloom:T.lettuce10},
    {id:'observability',   label:'Observe',     title:'THE WATCH LIGHT',    sig:'lighthouse',seed:545,
     accent:T.cabbage10,accent2:T.bun10,  roof:T.cabbage90,roof2:T.cabbage40,bloom:T.cabbage10},
    {id:'databases',       label:'Databases',   title:'THE TANK FARM',      sig:'containers',seed:646,
     accent:T.bun10,   accent2:T.cheese30,roof:T.bun90,   roof2:T.bun40,   bloom:T.bun10},
    {id:'distributed_arch',label:'Distributed', title:'THE CROSS-DOCKS',    sig:'crane',     seed:747,
     accent:T.onion10, accent2:T.cabbage10,roof:T.onion90, roof2:T.onion40, bloom:T.onion10},
    {id:'selfhost',        label:'Self-host',   title:'THE HOME BERTH',     sig:'lighthouse',seed:848,
     accent:T.cheese30,accent2:T.bun10,   roof:T.cheese90,roof2:T.cheese40,bloom:T.cheese20},
  ]},

{ id:'bastion', name:'Bastion', theme:'security & defense',
  land:'a snow-capped crag, ring-walls on every terrace, icicles below',
  accent:T.water40, seed:55, pal:'ba', keel:'ice', form:'ramparts',
  liquidGlow:0.22,
  niches:[
    {id:'sec_appsec', label:'AppSec',  title:'THE INNER KEEP',    sig:'keep',     seed:151,
     accent:T.water10, accent2:T.blue10,  roof:T.water90, roof2:T.water40, bloom:T.water10},
    {id:'sec_crypto', label:'Crypto',  title:'THE SEALED VAULT',  sig:'vault',    seed:252,
     accent:T.cheese30,accent2:T.cheese10,roof:T.cheese90,roof2:T.cheese40,bloom:T.cheese20},
    {id:'sec_threats',label:'Threats', title:'THE WATCHFIRES',    sig:'watchfire',seed:353,
     accent:T.bun10,   accent2:T.ketchup10,roof:T.ketchup90,roof2:T.ketchup40,bloom:T.bun10},
  ]},

{ id:'quarter', name:'Artisan’s Quarter', theme:'craft, career & culture',
  land:'honey stucco on a rounded clay boulder, shrubs over the lip',
  accent:T.bacon40, seed:66, pal:'qu', keel:'clay', form:'square',
  liquidGlow:0.20,
  niches:[
    {id:'devtools',       label:'Devtools',     title:'THE TOOLWRIGHTS',   sig:'workshop',  seed:161,
     accent:T.blue10,  accent2:T.water10, roof:T.blue90,  roof2:T.blue40,  bloom:T.blue10},
    {id:'git_vcs',        label:'Git & VCS',    title:'THE RECORD HOUSE',  sig:'library',   seed:262,
     accent:T.bun10,   accent2:T.cheese30,roof:T.bun90,   roof2:T.bun40,   bloom:T.bun10},
    {id:'software_craft', label:'Craft',        title:'THE GUILD ROW',     sig:'workshop',  seed:363,
     accent:T.bacon10, accent2:T.cabbage10,roof:T.bacon90, roof2:T.bacon40, bloom:T.bacon10},
    {id:'cs_fundamentals',label:'Fundamentals', title:'THE OLD ACADEMY',  sig:'library',   seed:464,
     accent:T.onion10, accent2:T.cabbage10,roof:T.onion90, roof2:T.onion40, bloom:T.onion10},
    {id:'career',         label:'Career',       title:'THE HOUR TOWER',    sig:'clocktower',seed:565,
     accent:T.avocado10,accent2:T.lettuce10,roof:T.avocado90,roof2:T.avocado40,bloom:T.lettuce10},
    {id:'eng_mgmt',       label:'Eng mgmt',     title:'THE COUNCIL SQUARE',sig:'clocktower',seed:666,
     accent:T.water10, accent2:T.onion10, roof:T.water90, roof2:T.water40, bloom:T.water10},
    {id:'industry_news',  label:'Industry',     title:'THE CRIER’S MARKET',sig:'market',    seed:767,
     accent:T.cheese30,accent2:T.bun10,   roof:T.cheese90,roof2:T.cheese40,bloom:T.cheese20},
    {id:'other',          label:'Commons',      title:'THE COMMONS',       sig:'market',    seed:868,
     accent:T.salt10,  accent2:T.cheese30,roof:T.salt90,  roof2:T.salt50,  bloom:T.salt10},
  ]},
];

/* A district's palette is realm data + concept colours + the niche's accents,
   flattened, so every builder reads one object and never has to know which
   realm it is drawing for. */
export function paletteOf(realm,niche){
  const P={...C[realm.pal],...realm,...niche};
  P.realm=realm; P.kit=realm.id; P.c=C[realm.pal];
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
const REALM_DIV=8;
export const realmLevelOf=a=>a<=0?0:Math.max(1,levelOf(a/REALM_DIV));

export const NICHE_OF={}, REALM_OF={};
REALMS.forEach(r=>r.niches.forEach(n=>{ NICHE_OF[n.id]=n; REALM_OF[n.id]=r; }));
