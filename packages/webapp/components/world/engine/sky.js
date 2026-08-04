import { mixTok, T } from './taxonomy';

/* ================================================================== the sky
   The sky USED to be a readout: whichever realm you had been reading lately
   owned it, ranked never blended. It was devcraft's answer to "where does
   recency live", and as a piece of information design it worked.

   It is not that any more, and the reason is worth writing down. The sky is the
   single biggest thing on screen and the only channel that survives at
   share-card size — which makes it simultaneously the best readout in the world
   and the thing that decides what this page LOOKS like. Those two claims cannot
   both be honoured, and the readout is the one that loses: the same fact is
   already carried, permanently and unfakeably, by which quarters of the map are
   large. Recency was the weakest thing the sky could have been spending itself
   on, and paying for it in a world whose colour changed under its owner the
   moment the growth log landed was paying twice.

   So the reading sky is gone and the sky is GIVEN AWAY instead. Note what is
   still not on offer: land, level, density, monuments. Those are the portrait.
   The sky could be handed over precisely because losing it as a readout costs
   the portrait nothing; nothing else is that cheap.

   Two axes rather than one list, because two axes is what makes a sky feel
   FOUND instead of picked: eight palettes and five hours is forty skies.

   Its own module so the bench in the panel can list the same eight and five the
   renderer paints from — a second copy of these tables would drift by the first
   palette anybody added. */

export const SKY_PAL = [
  {id:'brand',   n:'Brand dusk', a:mixTok(T.onion20,T.salt10,0.24), b:T.cheese10},
  {id:'clear',   n:'Clear day',  a:mixTok(T.water10,T.salt10,0.16), b:T.salt0},
  {id:'blossom', n:'Blossom',    a:mixTok(T.bacon10,T.salt10,0.28), b:T.cheese10},
  {id:'ember',   n:'Ember',      a:mixTok(T.onion90,T.bun40,0.22),  b:T.bun20},
  {id:'seaglass',n:'Seaglass',   a:mixTok(T.blue40,T.salt10,0.32),  b:T.lettuce10},
  {id:'orchid',  n:'Orchid',     a:mixTok(T.cabbage40,T.salt10,0.18),b:T.bacon10},
  {id:'harvest', n:'Harvest',    a:mixTok(T.cheese40,T.salt10,0.12), b:T.bun10},
  {id:'slate',   n:'Slate',      a:mixTok(T.pepper10,T.salt50,0.44), b:T.salt40},
];

/* The hour moves the sun and nothing else moves with it, which is the whole
   reason it can be given away for free: the sun is placed once and never
   animated, so re-aiming it costs one environment repaint and zero per-frame
   work. `tint`/`ka`/`kb`/`mul` are how an hour reaches the SKY as well as the
   light — a palette dragged toward one colour and scaled down. Without it,
   night is a bright noon sky with the lamps turned up, which reads as an
   eclipse rather than an evening.
   DAY is the file's original lighting rig to the decimal, so it is the default
   and nothing about the locked art direction moves unless somebody asks. */
export const SKY_HOUR = [
  {id:'dawn', n:'Dawn',  sun:[0.9,0.42,0.55],  sunC:0xFFD9C8, sunI:1.5,
   hemiI:0.30, fillI:0.72, rimI:0.52, exp:0.90, tint:0xFF879F, ka:0.24, kb:0.34, mul:0.94},
  {id:'day',  n:'Day',   sun:[0.62,1.5,0.4],   sunC:0xFFF3B7, sunI:2.0,
   hemiI:0.30, fillI:0.80, rimI:0.40, exp:0.93, tint:0xFFFFFF, ka:0.00, kb:0.00, mul:1.00},
  {id:'gold', n:'Golden',sun:[-0.35,0.55,0.86],sunC:0xFFE24C, sunI:2.1,
   hemiI:0.26, fillI:0.70, rimI:0.58, exp:0.96, tint:0xFFAB81, ka:0.30, kb:0.26, mul:0.97},
  {id:'dusk', n:'Dusk',  sun:[-0.85,0.26,-0.3],sunC:0xFFAB81, sunI:1.15,
   hemiI:0.24, fillI:0.66, rimI:0.66, exp:0.86, tint:0x6B56DD, ka:0.42, kb:0.22, mul:0.84},
  /* The one that repays the whole feature. Everything emissive in this world —
     lamps, beacons, the orrery, lit windows, the ley lines — is already on the
     bloom layer and already sized for daylight, so dropping the key by 4x hands
     the frame to them without a single new light being added. It is also the
     best share card the file can produce, which is not a coincidence: a world
     at night is a world whose ONLY bright parts are the parts you built. */
  {id:'night',n:'Night', sun:[-0.5,0.34,-0.62],sunC:0x9FB6FF, sunI:0.50,
   hemiI:0.15, fillI:0.40, rimI:0.60, exp:0.80, tint:0x141A2E, ka:0.72, kb:0.46, mul:0.58},
];

/* Where a sky starts before anybody touches it — the file's own art direction,
   which is what every world was painted with before the bench existed. */
export const DEFAULT_SKY = { pal: 'brand', hour: 'day' };

export const skyPalOf=id=>SKY_PAL.find(p=>p.id===id)||SKY_PAL[0];
export const skyHourOf=id=>SKY_HOUR.find(h=>h.id===id)||SKY_HOUR[1];
