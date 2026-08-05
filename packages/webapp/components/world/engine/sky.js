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

export const SKY_PAL = [
  {id:'brand',   n:'Brand dusk', a:mixTok(T.onion20,T.salt10,0.24), b:T.cheese10},
  {id:'clear',   n:'Clear day',  a:mixTok(T.water10,T.salt10,0.16), b:T.salt0},
  /* The Arcane Swarm's own weather: a bright blue zenith over a lilac horizon.
     It is the most identifiable sky in the concept set and the picker had
     nothing like it — orchid is a saturated magenta and blossom is pink. */
  {id:'lilac',   n:'Lilac day',  a:mixTok(T.water10,T.salt10,0.06),
                                 b:mixTok(T.cabbage10,T.salt10,0.62)},
  {id:'blossom', n:'Blossom',    a:mixTok(T.bacon10,T.salt10,0.28), b:T.cheese10},
  {id:'ember',   n:'Ember',      a:mixTok(T.onion90,T.bun40,0.22),  b:T.bun20},
  {id:'seaglass',n:'Seaglass',   a:mixTok(T.blue40,T.salt10,0.32),  b:T.lettuce10},
  {id:'orchid',  n:'Orchid',     a:mixTok(T.cabbage40,T.salt10,0.18),b:T.bacon10},
  /* A late afternoon, not a yellow wall: the gold belongs at the HORIZON with a
     warm blue over it. */
  {id:'harvest', n:'Harvest',    a:mixTok(T.water40,T.bun40,0.42),  b:T.cheese20},
  /* Overcast with weather in it: a deep blue-grey overhead going to pale
     silver at the horizon. */
  {id:'slate',   n:'Slate',      a:mixTok(T.pepper60,T.water90,0.34), b:T.salt40},
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
