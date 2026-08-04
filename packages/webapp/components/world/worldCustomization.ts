import { DEFAULT_LOOK_ID, lookFromPreset } from './engine/look';
import { DEFAULT_SKY } from './engine/sky';
import { NICHE_OF, REALM_OF } from './engine/taxonomy';
import type {
  WorldCrest,
  WorldDistrict,
  WorldLook,
  WorldSettings,
  WorldSky,
} from '../../graphql/world';

/**
 * Where a world starts before anybody touches it.
 *
 * The API stores what was chosen and answers null for what was not, deliberately:
 * this side has to render a world with no settings row at all, so a second set
 * of defaults over there would only be a copy that could disagree with these.
 */

export const WORLD_NAME_MAX_LENGTH = 30;

/** Reads at which a district raises the monument a crest can be built out of. */
const CREST_CHARGE_MIN_READS = 3;

/* The taxonomy is the renderer's, and it is JavaScript on purpose — it is
   ported near-verbatim from devcraft so every future diff against the source
   stays readable. These are the two shapes this file reads out of it. */
const NICHES = NICHE_OF as Record<
  string,
  { sig: string; accent: number; accent2: number }
>;
const REALMS = REALM_OF as Record<string, { id: string; name: string }>;

interface RankedDistrict {
  slug: string;
  reads: number;
  sig: string;
  accent: number;
  accent2: number;
  realmId: string;
  realmName: string;
}

/**
 * The districts the taxonomy can place, largest first. Anything it does not
 * know is dropped for the same reason the renderer drops it: the art is the
 * authority on what exists, and a niche with no district built for it cannot
 * appear on a shield either.
 */
const rank = (districts?: WorldDistrict[]): RankedDistrict[] =>
  (districts ?? [])
    .map(({ niche, reads }) => ({
      slug: niche?.slug,
      niche: NICHES[niche?.slug],
      reads,
    }))
    .filter(({ niche, reads }) => !!niche && reads > 0)
    .map(({ niche, reads, slug }) => ({
      slug,
      reads,
      sig: niche.sig,
      accent: niche.accent,
      accent2: niche.accent2,
      realmId: REALMS[slug].id,
      realmName: REALMS[slug].name,
    }))
    .sort((a, b) => b.reads - a.reads);

/* Roles come from BREADTH and epithets from VOLUME, so the two halves of the
   title are two different facts rather than the same one twice — a title has to
   be true before it is flattering, and "the relentless devotee" is a real
   description of someone who read one subject nine hundred times. */
const ROLES = [
  'devotee',
  'scholar',
  'wanderer',
  'cartographer',
  'archivist',
  'magpie',
];
const EPITHETS = [
  'quiet',
  'steady',
  'patient',
  'relentless',
  'sleepless',
  'untiring',
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Names for one world, built off the same facts, longest shapes first.
 *
 * The suggestion is the placeholder rather than the stored value: an untouched
 * world shows the name it would have been given anyway, and the user's job is
 * to disagree with it rather than to invent one. ✦ walks this list rather than
 * rerolling noise, so pressing it round comes back to where it started.
 *
 * Everything returned FITS. `The relentless cartographer of Artisan's Quarter`
 * is a better name than any of the short ones and it is 47 characters, so the
 * richest shapes are offered and then filtered rather than never written — and
 * the last two carry no realm or no epithet, which is what bounds them below the
 * limit whatever the taxonomy grows into. Offering a name the field cannot hold
 * is worse than offering a plainer one: ✦ COMMITS what it shows, so an
 * over-length suggestion is a save the API rejects.
 */
export const worldSuggestions = (districts?: WorldDistrict[]): string[] => {
  const ranked = rank(districts);
  if (!ranked.length) {
    return ['My world'];
  }

  const reads = ranked.reduce((sum, d) => sum + d.reads, 0);
  const byRealm = new Map<string, { name: string; reads: number }>();
  ranked.forEach((d) => {
    const realm = byRealm.get(d.realmId) ?? { name: d.realmName, reads: 0 };
    realm.reads += d.reads;
    byRealm.set(d.realmId, realm);
  });
  const realm = [...byRealm.values()].sort((a, b) => b.reads - a.reads)[0].name;

  const role = ROLES[clamp(byRealm.size - 1, 0, ROLES.length - 1)];
  const epithet =
    EPITHETS[
      clamp(
        Math.floor(Math.log2(Math.max(2, reads)) / 2.2),
        0,
        EPITHETS.length - 1,
      )
    ];

  const shapes = [
    `The ${epithet} ${role} of ${realm}`,
    `${realm}, in ${ranked.length} districts`,
    `The ${role}'s ${realm}`,
    `${sentence(epithet)} ${realm}`,
    `The ${epithet} ${role}`,
    `The ${realm}`,
  ];

  return [...new Set(shapes)].filter(
    (name) => name.length <= WORLD_NAME_MAX_LENGTH,
  );
};

/* Kept as ids rather than importing the division table, which carries the path
   emitters and belongs to whatever is drawing a shield. */
const DIVISION_IDS = [
  'plain',
  'pale',
  'fess',
  'bend',
  'chevron',
  'quarter',
] as const;

/**
 * Every world has a crest suggested from day one, derived the same way its name
 * is: the largest district gives the charge, the top two give the tinctures, and
 * the division comes off the user id — so the suggestion is already personal.
 *
 * Null when the reading behind it has raised nothing. Eligibility is having
 * built something: a world with nothing behind it has no mark rather than a
 * starter one, and an empty shield is the honest answer rather than a poor one.
 */
export const suggestedCrest = (
  userId: string,
  districts?: WorldDistrict[],
): WorldCrest | null => {
  const ranked = rank(districts);
  const top = ranked[0];
  if (!top || top.reads < CREST_CHARGE_MIN_READS) {
    return null;
  }

  const second = ranked[1] ?? top;
  /* Off the user id rather than off the reading, because a division encodes
     nothing — this only has to be stable and personal, so that two people who
     read the same subject are not handed the same shield. */
  const hash = [...userId].reduce(
    (total, char) => (total * 31 + char.charCodeAt(0)) % 1e9,
    0,
  );

  return {
    charge: top.sig,
    div: DIVISION_IDS[hash % DIVISION_IDS.length],
    a: top.accent,
    b: second.accent,
  };
};

/** What flies over this world: what the owner chose, or the suggestion. */
export const resolveCrest = (
  settings: Pick<WorldSettings, 'crest'> | null | undefined,
  userId: string,
  districts?: WorldDistrict[],
): WorldCrest | null => settings?.crest ?? suggestedCrest(userId, districts);

/** What the world is photographed through: the owner's look, or DIORAMA. */
export const resolveLook = (
  settings: Pick<WorldSettings, 'look'> | null | undefined,
): WorldLook => settings?.look ?? lookFromPreset(DEFAULT_LOOK_ID);

/** What hangs over it: the owner's sky, or the file's own art direction. */
export const resolveSky = (
  settings: Pick<WorldSettings, 'sky'> | null | undefined,
): WorldSky => settings?.sky ?? DEFAULT_SKY;

/**
 * Whether the owner has ever made this world theirs.
 *
 * `private` is not part of the test on purpose: hiding a world is a decision
 * about who may see it rather than something you made of it, and a reader who
 * only ever flipped that switch has still not named the place.
 */
export const isWorldCustomised = (
  settings: WorldSettings | null | undefined,
): boolean =>
  !!(settings?.name || settings?.sky || settings?.crest || settings?.look);
