import { mixTok, T } from './taxonomy';

/* The sky is customisable, not a recency readout (which quarters of the map are
   large already carries that fact). Two axes rather than one list — nine
   palettes by five hours makes a sky feel FOUND instead of picked. Its own
   module so the bench in the panel lists the same tables the renderer paints from.

   These paint the WORLD view and the share card. Inside a realm the realm's own
   rig takes over (see REALM_LIGHT), because a realm's materials were painted
   under one specific light — so what these have to do is hold six very different
   islands in one frame at once.

   EVERY ONE OF THEM NEEDS A RAMP. `a` is the zenith and `b` the horizon, and the
   two have to sit apart in VALUE: a palette whose ends are the same brightness
   paints a flat card, the islands stop reading as lit from above, and the whole
   world comes out as cut-outs pasted on coloured paper. Two of these were
   exactly that and are fixed here — harvest was yellow over yellow, slate was
   grey over grey. The concept art is the reference: every realm image is a
   saturated top over a pale, warmer horizon. */

/* THE CLOUDS BELONG TO THE SKY. They were one white cumulus repeated fourteen
   times under every palette, which is the same mistake the first art pass made
   with the realms: a sky is not a colour, it is weather. So a palette carries
   its own cloud — a FORM (what shape the sea below the islands takes) and two
   colours, the lit top and the shaded underside.

   The underside is the part that does the work. Every concept image has it:
   pink under the frameworks' dusk, orange under the forges, cool blue under the
   bastion's winter day. A cloud lit evenly on all sides is a cotton ball; one
   with a coloured belly is somewhere with an atmosphere. */
export const CLOUD_FORMS = {
  /* Fair-weather cumulus, the default. Round, squat, well spaced. */
  billow:{n:14, puffs:[3,5], r:[1.2,2.6], flat:0.55, sx:5.0, sz:3.0, stack:0,   op:0.62},
  /* Towering, stacked, a size bigger than anything on the ground — the swarm's
     reference is mostly sky, and this is what fills it. */
  tower: {n:11, puffs:[4,7], r:[1.1,2.5], flat:0.86, sx:3.2, sz:2.2, stack:1.6, op:0.66},
  /* Long low banks. Reads as distance rather than as objects, which is what an
     evening sky wants under a world it is not competing with. */
  bank:  {n:10, puffs:[5,8], r:[1.0,2.1], flat:0.30, sx:11.0,sz:2.0, stack:0,   op:0.52},
  /* Torn and sparse, with gaps you can see through: smoke that has drifted a
     long way from whatever made it. */
  torn:  {n:17, puffs:[2,4], r:[0.7,1.9], flat:0.42, sx:6.0, sz:3.4, stack:0.5, op:0.40},
  /* Thin sheets. Barely there, and the horizon reads straight through them. */
  wisp:  {n:12, puffs:[3,5], r:[1.5,3.0], flat:0.16, sx:8.0, sz:4.0, stack:0,   op:0.34},
};

export const SKY_PAL = [
  {id:'brand',   n:'Brand dusk', a:mixTok(T.onion20,T.salt10,0.24), b:T.cheese10,
   cloud:{form:'billow', top:mixTok(T.salt0,T.cheese10,0.30), bot:mixTok(T.bacon10,T.onion20,0.42)}},
  {id:'clear',   n:'Clear day',  a:mixTok(T.water10,T.salt10,0.16), b:T.salt0,
   cloud:{form:'billow', top:T.salt0, bot:mixTok(T.salt40,T.water10,0.34)}},
  /* The Arcane Swarm's own weather: a bright blue zenith over a lilac horizon.
     It is the most identifiable sky in the concept set and the picker had
     nothing like it — orchid is a saturated magenta and blossom is pink. */
  {id:'lilac',   n:'Lilac day',  a:mixTok(T.water10,T.salt10,0.06),
                                 b:mixTok(T.cabbage10,T.salt10,0.62),
   cloud:{form:'tower', top:T.salt0, bot:mixTok(T.cabbage10,T.salt20,0.48)}},
  {id:'blossom', n:'Blossom',    a:mixTok(T.bacon10,T.salt10,0.28), b:T.cheese10,
   cloud:{form:'billow', top:mixTok(T.salt0,T.bacon10,0.14), bot:mixTok(T.bacon40,T.salt30,0.42)}},
  {id:'ember',   n:'Ember',      a:mixTok(T.onion90,T.bun40,0.22),  b:T.bun20,
   cloud:{form:'torn', top:mixTok(T.salt90,T.onion90,0.44), bot:mixTok(T.bun40,T.ketchup40,0.36)}},
  {id:'seaglass',n:'Seaglass',   a:mixTok(T.blue40,T.salt10,0.32),  b:T.lettuce10,
   cloud:{form:'billow', top:T.salt0, bot:mixTok(T.blue40,T.salt30,0.40)}},
  {id:'orchid',  n:'Orchid',     a:mixTok(T.cabbage40,T.salt10,0.18),b:T.bacon10,
   cloud:{form:'wisp', top:mixTok(T.salt0,T.cabbage10,0.22), bot:mixTok(T.cabbage40,T.bacon40,0.44)}},
  /* A late afternoon, not a yellow wall: the gold belongs at the HORIZON with a
     warm blue over it. */
  {id:'harvest', n:'Harvest',    a:mixTok(T.water40,T.bun40,0.42),  b:T.cheese20,
   cloud:{form:'bank', top:mixTok(T.salt0,T.cheese10,0.42), bot:mixTok(T.bun40,T.burger40,0.30)}},
  /* Overcast with weather in it: a deep blue-grey overhead going to pale
     silver at the horizon. */
  {id:'slate',   n:'Slate',      a:mixTok(T.pepper60,T.water90,0.34), b:T.salt40,
   cloud:{form:'bank', top:mixTok(T.salt40,T.salt80,0.40), bot:mixTok(T.pepper10,T.water90,0.34)}},
];

/* The sun is placed once and never animated, so re-aiming it costs one repaint
   and zero per-frame work. `tint`/`ka`/`kb`/`mul` drag the palette toward one
   colour and scale it down so the SKY moves with the light, not just the lamps.
   DAY matches the original lighting rig to the decimal and is the default. */
export const SKY_HOUR = [
  {id:'dawn', n:'Dawn',  sun:[0.9,0.42,0.55],  sunC:0xFFD9C8, sunI:1.5,
   hemiI:0.30, fillI:0.72, rimI:0.52, exp:0.90, tint:0xFF879F, ka:0.24, kb:0.34, mul:0.94},
  {id:'day',  n:'Day',   sun:[0.62,1.5,0.4],   sunC:0xFFF3B7, sunI:2.0,
   hemiI:0.30, fillI:0.80, rimI:0.40, exp:0.93, tint:0xFFFFFF, ka:0.00, kb:0.00, mul:1.00},
  {id:'gold', n:'Golden',sun:[-0.35,0.55,0.86],sunC:0xFFE24C, sunI:2.1,
   hemiI:0.26, fillI:0.70, rimI:0.58, exp:0.96, tint:0xFFAB81, ka:0.30, kb:0.26, mul:0.97},
  {id:'dusk', n:'Dusk',  sun:[-0.85,0.26,-0.3],sunC:0xFFAB81, sunI:1.15,
   hemiI:0.24, fillI:0.66, rimI:0.66, exp:0.86, tint:0x6B56DD, ka:0.42, kb:0.22, mul:0.84},
  /* Dropping the key by 4x hands the frame to whatever is already on the bloom
     layer (lamps, beacons, lit windows) without adding a single new light. */
  {id:'night',n:'Night', sun:[-0.5,0.34,-0.62],sunC:0x9FB6FF, sunI:0.50,
   hemiI:0.15, fillI:0.40, rimI:0.60, exp:0.80, tint:0x141A2E, ka:0.72, kb:0.46, mul:0.58},
];

/* The file's own art direction: what every world was painted with before the bench. */
export const DEFAULT_SKY = { pal: 'brand', hour: 'day' };

export const skyPalOf=id=>SKY_PAL.find(p=>p.id===id)||SKY_PAL[0];
export const skyHourOf=id=>SKY_HOUR.find(h=>h.id===id)||SKY_HOUR[1];
