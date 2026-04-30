const ADJECTIVES = [
  'Brave',
  'Bright',
  'Calm',
  'Clever',
  'Curious',
  'Daring',
  'Eager',
  'Fearless',
  'Friendly',
  'Gentle',
  'Happy',
  'Honest',
  'Jolly',
  'Keen',
  'Kind',
  'Lively',
  'Lucky',
  'Merry',
  'Mighty',
  'Noble',
  'Patient',
  'Peaceful',
  'Playful',
  'Quick',
  'Quiet',
  'Radiant',
  'Sharp',
  'Silent',
  'Steady',
  'Swift',
  'Tidy',
  'Upbeat',
  'Vivid',
  'Witty',
  'Zealous',
];

const ANIMALS = [
  'Badger',
  'Bear',
  'Beaver',
  'Bison',
  'Cheetah',
  'Coyote',
  'Crane',
  'Dolphin',
  'Eagle',
  'Falcon',
  'Ferret',
  'Fox',
  'Hare',
  'Hawk',
  'Hedgehog',
  'Heron',
  'Koala',
  'Lemur',
  'Lion',
  'Lynx',
  'Marmot',
  'Otter',
  'Owl',
  'Panda',
  'Panther',
  'Penguin',
  'Quokka',
  'Rabbit',
  'Raccoon',
  'Raven',
  'Robin',
  'Squirrel',
  'Stag',
  'Tiger',
  'Turtle',
  'Walrus',
  'Whale',
  'Wolf',
];

const hashString = (input: string): number => {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

export const anonymousDisplayName = (participantId: string): string => {
  const hash = hashString(participantId);
  const adjective = ADJECTIVES[hash % ADJECTIVES.length];
  const animal = ANIMALS[Math.floor(hash / ADJECTIVES.length) % ANIMALS.length];
  return `${adjective} ${animal}`;
};

export const anonymousHandle = (participantId: string): string =>
  anonymousDisplayName(participantId).toLowerCase().replace(/\s+/g, '-');
