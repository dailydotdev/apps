/**
 * The op vocabulary: the contract between an authored builder and the renderer.
 *
 * A builder never returns geometry. It calls this API, every call is recorded as
 * a flat op, and only the ops are persisted and replayed. That is what lets the
 * source run once in a sandbox at authoring time and never again for a visitor.
 *
 * Everything here is data on purpose. The recorder in `record.js` and the
 * replayer inside the engine both read these tables, so a new shape is one entry
 * rather than a change on both sides.
 */

/** Geometry primitives, by the arity and clamp range of their arguments. */
export const GEOM = {
  //           args: [name, min, max, default]
  box: { three: 'BoxGeometry', args: [['w', 0.01, 40], ['h', 0.01, 40], ['d', 0.01, 40]] },
  cyl: {
    three: 'CylinderGeometry',
    args: [['rTop', 0, 20], ['rBottom', 0, 20], ['h', 0.01, 40], ['seg', 3, 32, 10]],
  },
  sphere: {
    three: 'SphereGeometry',
    args: [['r', 0.01, 20], ['widthSeg', 3, 32, 10], ['heightSeg', 2, 24, 7]],
  },
  cone: { three: 'ConeGeometry', args: [['r', 0.01, 20], ['h', 0.01, 40], ['seg', 3, 32, 10]] },
  torus: {
    three: 'TorusGeometry',
    args: [['r', 0.01, 20], ['tube', 0.005, 8], ['radialSeg', 3, 16, 6], ['tubularSeg', 3, 32, 10]],
  },
  octa: { three: 'OctahedronGeometry', args: [['r', 0.01, 20]] },
  plane: { three: 'PlaneGeometry', args: [['w', 0.01, 40], ['h', 0.01, 40]] },
};

export const GEOM_KINDS = Object.keys(GEOM);

/**
 * Which palette names a builder may reference, per realm.
 *
 * Colours are referenced by NAME and resolved against the district's palette at
 * draw time, never written as hex. That single rule is what keeps an authored
 * object in its district's colours and its realm's identity for free, and it is
 * why the same source placed in Rust and in Python is two different objects.
 *
 * Realm keys are the material world of the realm (`C[realm.pal]` in the
 * taxonomy); the four niche keys are the per-district dressing. `roof` is
 * deliberately absent: the taxonomy sets it and the renderer never reads it.
 */
const NICHE_KEYS = ['accent', 'accent2', 'roof2', 'bloom'];

const REALM_KEYS = {
  swarm: ['cliff', 'cliff2', 'rock', 'crys', 'crys2', 'grass', 'grass2', 'stone', 'stone2', 'wood', 'metal', 'leaf', 'leaf2', 'water', 'warm'],
  frame: ['cliff', 'cliff2', 'rock', 'bark', 'bark2', 'canopy', 'canopy2', 'grass', 'grass2', 'stone', 'stone2', 'wood', 'metal', 'moss', 'moss2', 'glass', 'water', 'warm', 'shroom', 'shroom2'],
  forge: ['cliff', 'cliff2', 'rock', 'deck', 'deck2', 'brick', 'brick2', 'iron', 'iron2', 'wood', 'metal', 'lava', 'lavaHot', 'quench', 'warm', 'smoke'],
  ship: ['cliff', 'cliff2', 'rock', 'deck', 'deck2', 'hull', 'stripe', 'stripe2', 'stone', 'stone2', 'wood', 'metal', 'rust', 'lattice', 'water', 'warm', 'grass', 'grass2'],
  bastion: ['cliff', 'cliff2', 'rock', 'snow', 'snow2', 'ice', 'stone', 'stone2', 'wood', 'metal', 'pine', 'pine2', 'ward', 'water', 'warm'],
  quarter: ['cliff', 'cliff2', 'rock', 'stucco', 'stucco2', 'stucco3', 'rose', 'rose2', 'blush', 'stone', 'stone2', 'wood', 'metal', 'leaf', 'leaf2', 'water', 'warm'],
};

export const REALMS = Object.keys(REALM_KEYS);

export const paletteKeys = (realm) => [...(REALM_KEYS[realm] ?? []), ...NICHE_KEYS];

/** Material options a builder may set, and the range each is clamped to. */
export const MAT_OPTS = {
  rough: [0, 1],
  flat: 'boolean',
  glow: [0, 3],
};

/**
 * The families a builder can replace, and the footprint each claims.
 *
 * These mirror `PLAN_D` in the renderer: an authored object stands in the same
 * slot as the generated one it replaces, so it cannot claim more ground than
 * its family already had.
 */
export const FAMILIES = {
  house: {
    name: 'Dwelling',
    hint: 'The bulk of a district. The most of anything you can change at once.',
    footprint: 0.95,
  },
  tower: {
    name: 'Tower',
    hint: 'Height, which is the part that survives being zoomed out.',
    footprint: 2.1,
  },
  hall: {
    name: 'Hall',
    hint: 'A wide roof. Reads as a place people gather.',
    footprint: 2.4,
  },
  garden: {
    name: 'Garden',
    hint: 'Tended ground. The cheapest way to look cared for.',
    footprint: 0.3,
  },
  plant: {
    name: 'Growth',
    hint: 'Trees, crystal, whatever this realm grows.',
    footprint: 0.44,
  },
  lamp: {
    name: 'Light',
    hint: 'Warm points that carry at night and at share-card size.',
    footprint: 0.24,
  },
  feature: {
    name: 'Prop',
    hint: 'Small details that make the realm feel inhabited.',
    footprint: 0.38,
  },
  landmark: {
    name: 'Landmark',
    hint: 'The realm-defining centerpiece, such as the Frameworks\u2019 Great Tree.',
    footprint: 5,
  },
  monument: {
    name: 'Monument',
    hint: 'A district identity object, repeated as part of the realm skyline.',
    footprint: 3.4,
  },
};

export const FAMILY_KINDS = Object.keys(FAMILIES);

/** How many seeded variants are recorded per builder. */
export const VARIANTS = 5;

export const OPS_VERSION = 1;

/**
 * The same four jobs, named in each realm's own materials.
 *
 * Realms genuinely do not share a vocabulary: the forges have `brick` and `iron`
 * where the swarm has `stone` and `roof2`, and a starting file that hard-codes
 * either one is a starting file that fails to validate in four realms out of
 * six. So a scaffold asks for the ROLE and gets the realm's word for it.
 *
 * This is a convenience, not a restriction. Any name in `paletteKeys(realm)` is
 * legal; these are only the ones a first draft usually wants.
 */
export const ROLES = {
  swarm: { wall: 'stone', wall2: 'stone2', roof: 'roof2', trim: 'wood' },
  frame: { wall: 'stone', wall2: 'stone2', roof: 'moss', trim: 'wood' },
  forge: { wall: 'brick', wall2: 'brick2', roof: 'iron', trim: 'wood' },
  ship: { wall: 'hull', wall2: 'stone2', roof: 'stripe', trim: 'wood' },
  bastion: { wall: 'stone', wall2: 'stone2', roof: 'snow2', trim: 'wood' },
  quarter: { wall: 'stucco', wall2: 'stucco2', roof: 'rose', trim: 'wood' },
};

export const rolesOf = (realm) => ROLES[realm] ?? ROLES.frame;
