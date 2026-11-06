import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import {
  cloudinaryOrganizationImageFallback,
  cloudinarySquadsImageFallback,
} from '@dailydotdev/shared/src/lib/image';

export enum Family {
  Critter = 'critter',
  Visitor = 'visitor',
  Person = 'person',
  Reserved = 'reserved',
}

export interface Character {
  id: string;
  name: string;
  family: Family;
  line: string;
  src: string;
  faceSrc: string;
  busySrc?: string;
  assignable: boolean;
  note?: string;
}

const asset = (file: string): string => `/avatar-placeholders/${file}.webp`;

const character = (
  id: string,
  name: string,
  family: Family,
  line: string,
  extra: Partial<Pick<Character, 'note'>> & { busy?: boolean } = {},
): Character => ({
  id,
  name,
  family,
  line,
  src: asset(id),
  faceSrc: asset(`${id}-face`),
  busySrc: extra.busy ? asset(`${id}-busy`) : undefined,
  assignable: family === Family.Critter || family === Family.Visitor,
  note: extra.note,
});

// Order is load-bearing: the assignable pool below is frozen as v1, and an
// appended character would reshuffle every existing user (see chapter 2).
export const characters: Character[] = [
  character(
    'threads',
    'Threads',
    Family.Critter,
    'Eight arms, eight open PRs.',
    {
      busy: true,
    },
  ),
  character('nocturne', 'Nocturne', Family.Critter, 'Ships after midnight.', {
    busy: true,
  }),
  character(
    'mesh',
    'Mesh',
    Family.Critter,
    'Quietly connected to everything.',
    {
      busy: true,
    },
  ),
  character('lumen', 'Lumen', Family.Critter, 'Lights up dark mode.', {
    busy: true,
  }),
  character(
    'ember',
    'Ember',
    Family.Critter,
    'Warm, curious, slightly on fire.',
  ),
  character('kernel', 'Kernel', Family.Critter, 'Runs on everything.'),
  character('reload', 'Reload', Family.Critter, 'Regrows whatever you delete.'),
  character('idle', 'Idle', Family.Critter, 'Calm during any incident.', {
    note: 'Wears the daily.dev mark on its scarf. Repaint before it ships, the mark belongs to Patchy.',
  }),
  character(
    'daemon',
    'Daemon',
    Family.Critter,
    'Runs in the background. Guards the hoard.',
  ),
  character(
    'float',
    'Float',
    Family.Critter,
    'Precise enough, most of the time.',
  ),
  character('fetch', 'Fetch', Family.Critter, 'Always brings the data back.'),
  character('nyan', 'Nyan', Family.Critter, 'Brings the disco to standup.'),
  character('rusty', 'Rusty', Family.Visitor, 'Memory safe and proud of it.'),
  character(
    'ping',
    'Ping',
    Family.Visitor,
    'Replies in under two milliseconds.',
  ),
  character('byte', 'Byte', Family.Visitor, 'Small, round, eight bits of joy.'),
  character(
    'remote',
    'Remote',
    Family.Visitor,
    'Works from a very different timezone.',
  ),
  character(
    'ternary',
    'Ternary',
    Family.Visitor,
    'Sees true, false, and maybe.',
  ),
  character(
    'review',
    'Review',
    Family.Visitor,
    'Given enough eyes, all bugs are shallow.',
  ),
  character('human-sketch', 'Sketch', Family.Person, 'Pencil behind the ear.', {
    busy: true,
  }),
  character('human-hood', 'Hood', Family.Person, 'Hood up, headphones in.', {
    busy: true,
  }),
  character(
    'human-terrarium',
    'Terrarium',
    Family.Person,
    'Grows bonsai between builds.',
  ),
  character(
    'human-aurora',
    'Aurora',
    Family.Person,
    'Glasses on, aurora behind.',
  ),
  character(
    'human-braids',
    'Braids',
    Family.Person,
    'Sunset and a fresh hoodie.',
  ),
  character('human-beard', 'Beard', Family.Person, 'Twenty years of shipping.'),
  character(
    'human-backpack',
    'Backpack',
    Family.Person,
    'Laptop always in the bag.',
  ),
  character('human-orbit', 'Orbit', Family.Person, 'Has a planet for a halo.'),
  character(
    'human-laugh',
    'Laugh',
    Family.Person,
    'Laughs at the stack trace.',
  ),
  character(
    'patchy',
    'Patchy',
    Family.Reserved,
    'daily.dev’s own. Only official accounts wear the collar.',
  ),
  character(
    'cooler',
    'Cooler',
    Family.Reserved,
    'Where the office talks. The first organization idea, see chapter 5.',
  ),
];

export const characterById = Object.fromEntries(
  characters.map((item) => [item.id, item]),
) as Record<string, Character>;

export interface Backdrop {
  id: string;
  label: string;
  note: string;
  src: string;
  faceSrc: string;
  picked?: boolean;
}

export interface Concept extends Character {
  why: string;
  badge?: string;
  backdrops?: Backdrop[];
}

const concept = (
  id: string,
  name: string,
  line: string,
  why: string,
  badge?: string,
): Concept => ({
  ...character(id, name, Family.Reserved, line),
  why,
  badge,
});

const backdrop = (
  file: string,
  label: string,
  note: string,
  picked = false,
): Backdrop => ({
  id: file,
  label,
  note,
  src: asset(file),
  faceSrc: asset(`${file}-face`),
  picked,
});

// The first renders sat a purple object on a purple backdrop and vanished
// below 32 pixels. Teal is the complement of the warm windows and fire, and it
// keeps the tile edge visible on the dark theme too.
const objectBackdrops = (id: string): Backdrop[] => [
  backdrop(
    `${id}-purple`,
    'Purple (first render)',
    'Same hue as the object. Melts at 24 pixels.',
  ),
  backdrop(
    `${id}-navy`,
    'Midnight',
    'Object pops, but the tile melts into the dark theme.',
  ),
  backdrop(
    `${id}-plum`,
    'Plum black',
    'Most dramatic, and the least visible tile on dark.',
  ),
  backdrop(
    id,
    'Teal',
    'Warm against cool. Object and tile edge read on both themes.',
    true,
  ),
];

export const deletedConcepts: Concept[] = [
  concept(
    'ghost-outline',
    'Outline',
    'Only the dotted edge of a ghost is left.',
    'An empty slot where someone used to be. The only option that reads as “removed” at 24 pixels, because there is no body left to read as a someone. Pairs with the dashed slot treatment below.',
    'Recommended',
  ),
  concept(
    'ghost-pixels',
    'Fade',
    'A ghost dissolving into pixels.',
    'Your first pick, and still the warmest. At 24 pixels the dissolve shrinks to a texture, so it reads as a quiet gray character more than as gone.',
  ),
  concept(
    'ghost-breaking',
    'Breaking',
    'Half the ghost has drifted away.',
    'Pushes the dissolve until the silhouette itself breaks. Strong at 40 and up, a little noisy at 24.',
  ),
  concept(
    'ghost-voxel',
    'Voxel',
    'A ghost built from blocks, some missing.',
    'The most “data”. The blocks only show from 40 pixels up, below that it is a soft white blob.',
  ),
];

export const organizationConcepts: Concept[] = [
  concept(
    'org-building',
    'HQ',
    'A toy office building with lit windows.',
    'Maps one to one onto today’s building icon, so the meaning carries over with zero learning. Reads as “company” at every size.',
    'Picked',
  ),
  concept(
    'org-badge',
    'Badge',
    'An employee ID badge on a lanyard.',
    'The cleverest: a badge is what a company gives you. Great on job posts and the recruiter workspace, a little abstract on an organization page.',
  ),
  concept(
    'org-desk',
    'Desk',
    'Monitor, coffee, a plant.',
    'Warm and very developer, but three objects is a scene, and scenes get busy below 32 pixels.',
  ),
  concept(
    'cooler',
    'Cooler',
    'Where the office talks.',
    'The first idea. Charming, but it says “office culture” more than “company”, and at 24 pixels it is a blue bottle.',
  ),
];

export const squadConcepts: Concept[] = [
  concept(
    'squad-campfire',
    'Campfire',
    'Marshmallows around a daily.dev purple flame.',
    'A squad is where people gather, and the campfire says it without showing a single person: the members are implied by the sticks leaning in. The flame burns in brand purple, so it is unmistakably ours, and the dark navy backdrop keeps it readable at small sizes.',
    'Picked',
  ),
  concept(
    'squad-mugs',
    'Cheers',
    'Four mugs clinking in a toast.',
    'Several faces in one image read as a group at a glance. Lively, but more literal than the campfire, and four faces get busy below 32 pixels.',
  ),
  concept(
    'squad-treehouse',
    'Clubhouse',
    'A treehouse with glowing windows.',
    'The literal clubhouse. Lovely as a cover, but the most detail of the three, so it softens fastest at small sizes.',
  ),
];

organizationConcepts[0].backdrops = objectBackdrops('org-building');
squadConcepts[0].backdrops = [
  backdrop(
    'squad-campfire-purple',
    'First render',
    'Purple on purple. Melts at 24 pixels.',
  ),
  backdrop(
    'squad-campfire-teal',
    'Teal',
    'Readable, but it lost the purple completely.',
  ),
  backdrop(
    'squad-campfire',
    'Purple flame',
    'The fire itself is daily.dev purple, glowing on dark navy. The brand lives in the subject, and the dark backdrop keeps it readable on both themes.',
    true,
  ),
  backdrop(
    'squad-campfire-crossed',
    'Crossed',
    'Simplified: one big flame, two crossed sticks, three stones. The crispest at 24 pixels, but a regular orange fire.',
  ),
  backdrop(
    'squad-campfire-aubergine',
    'Aubergine',
    'Original composition on deep dark purple. Better, still busy small.',
  ),
  backdrop(
    'squad-campfire-dusk',
    'Dusk',
    'Violet to plum with a warm ground glow. Prettiest large, busiest small.',
  ),
];

export const familyLabel: Record<Family, string> = {
  [Family.Critter]: 'Critters',
  [Family.Visitor]: 'Bots and visitors',
  [Family.Person]: 'People',
  [Family.Reserved]: 'Reserved',
};

export const familyRule: Record<Family, string> = {
  [Family.Critter]: 'Auto-assigned and pickable',
  [Family.Visitor]: 'Auto-assigned and pickable',
  [Family.Person]: 'Pickable only, never auto-assigned',
  [Family.Reserved]: 'Never assigned, never pickable',
};

export const assignablePoolV1 = characters.filter((item) => item.assignable);

export const pickableCharacters = characters.filter(
  (item) => item.family !== Family.Reserved,
);

// FNV-1a, 32 bit. Small, fast, stable across JS engines and easy to mirror in
// SQL for the backend backfill.
export const hashSeed = (seed: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
};

export const getCharacterForUser = (
  userId: string,
  pool: Character[] = assignablePoolV1,
): Character => pool[hashSeed(userId) % pool.length];

// The pixel size where the full-frame render stops reading and the face crop
// takes over. ProfileImageSize.Large is 40px.
export const FACE_CROP_MAX_PX = 40;

export const getCharacterSrc = (item: Character, sizePx: number): string =>
  sizePx <= FACE_CROP_MAX_PX ? item.faceSrc : item.src;

export const placeholderAvatarSrc = fallbackImages.avatar;
export const placeholderCompanySrc = fallbackImages.company;
export const placeholderOrganizationSrc = cloudinaryOrganizationImageFallback;
export const placeholderSquadSrc = cloudinarySquadsImageFallback;

export enum AvatarMode {
  Today = 'today',
  Characters = 'characters',
}

export interface MockPerson {
  id: string;
  name: string;
  username: string;
  pickedId?: string;
  official?: boolean;
}

// Every person here signed up without a photo, which is the case the whole
// exploration is about. The ids are real hash inputs, picked so the twelve
// land on distinct characters; chapter 2 shows how often real ones collide.
export const people: MockPerson[] = [
  { id: 'qG0WRldi5b8EkoKlv', name: 'Maya Okafor', username: 'mayao' },
  { id: 'Wt2pcT6HJviqAOpTw', name: 'Tomás Ruiz', username: 'truiz' },
  { id: 'l1exJDDUC54MPVx3n', name: 'Priya Nair', username: 'priyacodes' },
  { id: '56P2mmUSS849XRAb4', name: 'Jonas Weber', username: 'jweber' },
  { id: 'hqdbMJM0tCA4vdnqo', name: 'Leah Cohen', username: 'leahc' },
  { id: 'upbateOCkMc4udOmR', name: 'Sam Park', username: 'sampark' },
  { id: 'LrGrVqCUVudXaGNnQ', name: 'Amara Diallo', username: 'amarad' },
  { id: 'hCu3qMUp49yd6cQYH', name: 'Chen Wei', username: 'chenwei' },
  {
    id: '3Jd2IsTMOrvFZTGam',
    name: 'Noa Levi',
    username: 'noalevi',
    pickedId: 'human-aurora',
  },
  { id: 'RfxItYR7k3pBqiAk1', name: 'Diego Alves', username: 'dalves' },
  { id: 'FOtbCpBHjcUg7dqOI', name: 'Ines Moreau', username: 'inesm' },
  { id: 'uUNIEQHBcWrOGcRQI', name: 'Arjun Mehta', username: 'arjunm' },
];

export const dailyDevTeam: MockPerson = {
  id: 'dailydev-official',
  name: 'daily.dev',
  username: 'dailydotdev',
  official: true,
};

export const getPersonCharacter = (person: MockPerson): Character => {
  if (person.official) {
    return characterById.patchy;
  }

  if (person.pickedId) {
    return characterById[person.pickedId];
  }

  return getCharacterForUser(person.id);
};

export const resolveAvatarSrc = (
  person: MockPerson,
  sizePx: number,
  mode: AvatarMode,
): string =>
  mode === AvatarMode.Today && !person.official
    ? placeholderAvatarSrc
    : getCharacterSrc(getPersonCharacter(person), sizePx);

// Chance that at least two of `groupSize` people share a character, drawing
// uniformly from `poolSize`. The birthday problem, for avatar stacks.
export const duplicateChance = (
  poolSize: number,
  groupSize: number,
): number => {
  let allDistinct = 1;
  for (let index = 1; index < groupSize; index += 1) {
    allDistinct *= (poolSize - index) / poolSize;
  }
  return 1 - Math.max(allDistinct, 0);
};

export const randomId = (): string => {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length: 17 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');
};
