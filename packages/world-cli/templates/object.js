/**
 * __NAME__ for the __REALM__ realm.
 *
 * This one builder is compiled for three level tiers and reused throughout the
 * realm, including its zoomed-out island. Branch on `w.tier` when the object
 * should gain detail as the world grows. Colours are palette NAMES, never hex.
 */
export function __FAMILY__(w) {
  const { rnd, lerp, tier } = w;
  const wide = lerp(0.8, 1.0, rnd());
  const tall = lerp(0.7, 1.0, rnd()) * (1 + (tier - 1) * 0.2);

  w.box(wide, tall, wide).mat('__WALL__', { rough: 0.85 }).at(0, tall / 2, 0);
  w.cone(wide * 0.82, 0.5, 4)
    .mat('__ROOF__', { rough: 0.7 })
    .rot(0, Math.PI / 4, 0)
    .at(0, tall + 0.25, 0);
  w.box(0.22, 0.34, 0.05).mat('__TRIM__', { rough: 0.9 }).at(0, 0.17, wide / 2);
  w.octa(0.07).glow('accent', 1.5).at(0, tall + 0.58, 0);
}
