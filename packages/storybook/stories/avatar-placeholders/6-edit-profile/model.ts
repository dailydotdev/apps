import { characterById, getCharacterForUser } from '../data';
import type { Character } from '../data';

export enum AvatarSource {
  Assigned = 'assigned',
  Character = 'character',
  Upload = 'upload',
  Social = 'social',
}

export const sourceLabel: Record<AvatarSource, string> = {
  [AvatarSource.Assigned]: 'Assigned character',
  [AvatarSource.Character]: 'Chosen character',
  [AvatarSource.Upload]: 'Uploaded photo',
  [AvatarSource.Social]: 'Social photo',
};

export interface Photo {
  src: string;
  width: number;
  height: number;
  // Crop as the focus point in image fractions plus a zoom over "cover".
  cx: number;
  cy: number;
  zoom: number;
}

export interface AvatarState {
  source: AvatarSource;
  characterId?: string;
  photo?: Photo;
  provider?: SocialProvider;
}

export enum SocialProvider {
  Google = 'Google',
  GitHub = 'GitHub',
}

export enum Device {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Laptop = 'laptop',
}

export const deviceSpec: Record<
  Device,
  { label: string; width: number; height: number; range: string }
> = {
  [Device.Mobile]: {
    label: 'Mobile',
    width: 375,
    height: 760,
    range: 'below 656px (tablet)',
  },
  [Device.Tablet]: {
    label: 'Tablet',
    width: 720,
    height: 700,
    range: '656px to 1019px',
  },
  [Device.Laptop]: {
    label: 'Laptop',
    width: 1100,
    height: 700,
    range: '1020px (laptop) and up',
  },
};

export interface Person {
  id: string;
  name: string;
  username: string;
}

export const assignedFor = (person: Person): Character =>
  getCharacterForUser(person.id);

export const displayedCharacter = (
  state: AvatarState,
  person: Person,
): Character | undefined => {
  if (state.source === AvatarSource.Assigned) {
    return assignedFor(person);
  }
  if (state.source === AvatarSource.Character && state.characterId) {
    return characterById[state.characterId];
  }
  return undefined;
};

export const isPhoto = (state: AvatarState): boolean =>
  state.source === AvatarSource.Upload || state.source === AvatarSource.Social;

// What `user.image` actually holds in each state. The client never stores the
// assigned character: it is derived from the id, so the column keeps noProfile.
export const storedImageValue = (state: AvatarState): string => {
  switch (state.source) {
    case AvatarSource.Assigned:
      return 'https://media.daily.dev/image/upload/…/public/noProfile';
    case AvatarSource.Character:
      return `https://media.daily.dev/image/upload/…/avatars/characters/v1/${state.characterId}`;
    case AvatarSource.Upload:
      return 'https://media.daily.dev/image/upload/…/avatars/avatar_Yt4Wm9Qa2';
    default:
      return state.provider === SocialProvider.Google
        ? 'https://lh3.googleusercontent.com/a/…=s96-c'
        : 'https://avatars.githubusercontent.com/u/…?v=4';
  }
};

const photoCache = new Map<string, string>();

// A stand-in "photo" drawn on a canvas, so reviewers can walk every flow
// without a real picture. It is obviously not a person on purpose.
export const samplePhotoSrc = (initials: string, hue: number): string => {
  const key = `${initials}-${hue}`;
  const cached = photoCache.get(key);
  if (cached) {
    return cached;
  }
  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const context = canvas.getContext('2d');
  if (!context) {
    return '';
  }

  const gradient = context.createLinearGradient(0, 0, 640, 480);
  gradient.addColorStop(0, `hsl(${hue} 70% 62%)`);
  gradient.addColorStop(1, `hsl(${(hue + 60) % 360} 65% 38%)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 640, 480);
  context.fillStyle = 'rgba(255,255,255,0.18)';
  context.beginPath();
  context.arc(470, 120, 150, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = 'rgba(255,255,255,0.92)';
  context.font = 'bold 150px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(initials, 360, 250);
  context.font = '600 22px system-ui, sans-serif';
  context.fillStyle = 'rgba(255,255,255,0.7)';
  context.fillText('PHOTO STAND-IN', 360, 360);

  const src = canvas.toDataURL('image/png');
  photoCache.set(key, src);
  return src;
};

export const samplePhoto = (initials = 'AR', hue = 18): Photo => ({
  src: samplePhotoSrc(initials, hue),
  width: 640,
  height: 480,
  cx: 0.56,
  cy: 0.52,
  zoom: 1.1,
});

export interface Scenario {
  id: string;
  label: string;
  description: string;
  person: Person;
  initial: () => AvatarState;
  providerPhoto?: () => Photo;
  provider?: SocialProvider;
}

const alex: Person = {
  id: 'yPFEni2v5glRTN8dY',
  name: 'Alex Rivera',
  username: 'arivera',
};

export const scenarios: Scenario[] = [
  {
    id: 'assigned',
    label: 'Email signup, never touched it',
    description:
      'The most common case. user.image is still noProfile, so the client shows the character derived from the id.',
    person: alex,
    initial: () => ({ source: AvatarSource.Assigned }),
  },
  {
    id: 'chosen',
    label: 'Picked a character',
    description:
      'Chose Daemon in the reveal or the picker. user.image holds the character URL, so every client, email and OG image agrees.',
    person: alex,
    initial: () => ({ source: AvatarSource.Character, characterId: 'daemon' }),
  },
  {
    id: 'upload',
    label: 'Uploaded a photo',
    description:
      'A photo uploaded in settings. Switching to a character replaces it, removing it falls back to the assigned character, never to gray.',
    person: alex,
    initial: () => ({ source: AvatarSource.Upload, photo: samplePhoto() }),
  },
  {
    id: 'social',
    label: 'Signed up with GitHub',
    description:
      'The provider photo came in at signup. Same as an upload, plus a way back to the GitHub photo after trying a character (needs the backend to keep the provider URL).',
    person: alex,
    provider: SocialProvider.GitHub,
    initial: () => ({
      source: AvatarSource.Social,
      provider: SocialProvider.GitHub,
      photo: samplePhoto('GH', 220),
    }),
    providerPhoto: () => samplePhoto('GH', 220),
  },
];
