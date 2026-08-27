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

/* API stores null for anything unchosen rather than a default, so defaults live only here — a second copy server-side could disagree with these. */

export const WORLD_NAME_MAX_LENGTH = 30;

/** Reads at which a district raises the monument a crest can be built out of. */
const CREST_CHARGE_MIN_READS = 3;

/* Ported near-verbatim from devcraft's JS renderer so future diffs against the source stay readable. */
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

/** Districts the taxonomy can place, largest first; anything unknown to it is dropped, matching what the renderer can draw. */
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

/* Role comes from breadth (realm count), epithet from volume (read count) — two independent facts, not the same one twice. */
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
 * Longest shapes first, then filtered to WORLD_NAME_MAX_LENGTH — an over-length suggestion would be a save the API rejects, since accepting one commits it.
 * Used as the placeholder rather than a stored default, so an untouched world shows the name it would've had anyway.
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

/* Kept as ids rather than importing the division table, which carries path emitters that belong to the shield renderer. */
const DIVISION_IDS = [
  'plain',
  'pale',
  'fess',
  'bend',
  'chevron',
  'quarter',
] as const;

/** Returns null when the top district hasn't raised CREST_CHARGE_MIN_READS — an unbuilt world gets no mark rather than a starter one. */
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
  /* Off the user id rather than the reading — a division encodes nothing, it just needs to be stable and personal. */
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

/** `private` is deliberately excluded — hiding a world is a visibility decision, not something made of it. */
export const isWorldCustomised = (
  settings: WorldSettings | null | undefined,
): boolean =>
  !!(settings?.name || settings?.sky || settings?.crest || settings?.look);
