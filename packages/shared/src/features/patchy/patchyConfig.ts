import type { PatchyConfigResponse } from '../../graphql/patchy';
import { storageWrapper } from '../../lib/storageWrapper';

// The client owns the vocabulary (each trigger needs a signal in the app);
// the API's `patchyConfig` owns how Patchy reacts to it. These defaults are
// the fallback until a config is cached, and fill anything the cached one
// leaves out.
export const patchyTriggers = [
  'upvote',
  'bookmark',
  // Not every post lands: he side-eyes it with you.
  'downvote',
  // A bone from his panel: happy chomping.
  'bone',
  'streak_day',
  'late_night',
  'friday_deploy',
  'welcome_back',
  // Escalations: the same action, again and again in one day, gets a bigger
  // reaction than the first time.
  'on_a_roll',
  'bookmark_pile',
] as const;
export type PatchyTrigger = (typeof patchyTriggers)[number];

export const patchyFaces = [
  'neutral',
  'happy',
  'sleepy',
  'asleep',
  'sideeye',
  // Micro-animation faces for the streak circle.
  'lookright',
  'lookdown',
  'yawn',
  'tongue',
  'wink',
  'alert',
  'earflop',
] as const;
export type PatchyFace = (typeof patchyFaces)[number];

export const patchyEmotes = [
  'hearts',
  'dots',
  'sparkle',
  'moon',
  'sweat',
  'cloud',
  'bone',
  'none',
] as const;
export type PatchyEmote = (typeof patchyEmotes)[number];

export const patchyMoods = [
  'happy',
  'ready',
  'sleepy',
  'resting',
  'away',
] as const;
export type PatchyMood = (typeof patchyMoods)[number];

// A reaction plays inside the streak circle: his face changes and a tiny
// emote floats out of it. Small enough to show on every action.
export interface PatchyReaction {
  enabled: boolean;
  emote: PatchyEmote;
  face: PatchyFace;
}

export interface PatchyHourWindow {
  // Local hours, start inclusive, end exclusive. A start after the end wraps
  // past midnight (23 to 3).
  startHour: number;
  endHour: number;
}

export interface PatchyConfig {
  awayMs: number;
  lateNight: PatchyHourWindow;
  fridayDeploy: PatchyHourWindow & { tags: string[] };
  faceImage: Record<PatchyFace, string>;
  reactions: Record<PatchyTrigger, PatchyReaction>;
  moods: Record<PatchyMood, { face: PatchyFace; copy: string; label: string }>;
}

const HOUR = 60 * 60 * 1000;
const media = 'https://media.daily.dev/image/upload';

// The pose he leans out with to point at a suggestion.
export const patchyOfferPose = `${media}/v1795078962/public/patchy-v1-peek-point.webp`;

export const defaultPatchyConfig: PatchyConfig = {
  awayMs: 48 * HOUR,
  lateNight: { startHour: 1, endHour: 5 },
  fridayDeploy: {
    startHour: 12,
    endHour: 18,
    tags: [
      'deploy',
      'deployment',
      'devops',
      'cicd',
      'ci-cd',
      'continuous-delivery',
      'continuous-deployment',
      'continuous-integration',
    ],
  },
  faceImage: {
    neutral: `${media}/v1794998763/public/patchy-v1-face-neutral.webp`,
    happy: `${media}/v1794998764/public/patchy-v1-face-happy.webp`,
    sleepy: `${media}/v1794998765/public/patchy-v1-face-sleepy.webp`,
    asleep: `${media}/v1794998767/public/patchy-v1-face-asleep.webp`,
    sideeye: `${media}/v1794998768/public/patchy-v1-face-sideeye.webp`,
    lookright: `${media}/v1795078965/public/patchy-v1-face-lookright.webp`,
    lookdown: `${media}/v1795078967/public/patchy-v1-face-lookdown.webp`,
    yawn: `${media}/v1795078969/public/patchy-v1-face-yawn.webp`,
    tongue: `${media}/v1795078970/public/patchy-v1-face-tongue.webp`,
    wink: `${media}/v1795078972/public/patchy-v1-face-wink.webp`,
    alert: `${media}/v1795078973/public/patchy-v1-face-alert.webp`,
    earflop: `${media}/v1795078975/public/patchy-v1-face-earflop.webp`,
  },
  reactions: {
    upvote: { enabled: true, emote: 'hearts', face: 'happy' },
    bookmark: { enabled: true, emote: 'dots', face: 'sideeye' },
    downvote: { enabled: true, emote: 'cloud', face: 'sideeye' },
    bone: { enabled: true, emote: 'bone', face: 'tongue' },
    streak_day: { enabled: true, emote: 'sparkle', face: 'happy' },
    late_night: { enabled: true, emote: 'moon', face: 'sleepy' },
    friday_deploy: { enabled: true, emote: 'sweat', face: 'sideeye' },
    welcome_back: { enabled: true, emote: 'hearts', face: 'happy' },
    on_a_roll: { enabled: true, emote: 'hearts', face: 'tongue' },
    bookmark_pile: { enabled: true, emote: 'sweat', face: 'sideeye' },
  },
  moods: {
    happy: {
      face: 'happy',
      copy: 'Happy you stopped by today',
      label: 'delighted',
    },
    ready: { face: 'neutral', copy: 'Ready when you are', label: 'curious' },
    sleepy: { face: 'sleepy', copy: 'Getting sleepy', label: 'sleepy' },
    resting: { face: 'asleep', copy: 'Rest day, napping', label: 'napping' },
    away: {
      face: 'asleep',
      copy: 'Gone fishing. Glad you are back',
      label: 'gone fishing',
    },
  },
};

const isOneOf = <T extends string>(
  values: readonly T[],
  value: unknown,
): value is T => values.includes(value as T);

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const isHour = (value: unknown): value is number =>
  isCount(value) && Number.isInteger(value) && value <= 23;

const toWindow = (
  window: Partial<PatchyHourWindow> | undefined,
  fallback: PatchyHourWindow,
): PatchyHourWindow =>
  window &&
  isHour(window.startHour) &&
  isHour(window.endHour) &&
  window.startHour !== window.endHour
    ? { startHour: window.startHour, endHour: window.endHour }
    : { startHour: fallback.startHour, endHour: fallback.endHour };

// Layers the API config over the defaults one field at a time, so a missing,
// malformed or unknown value can only ever fall back, never break Patchy.
export const toPatchyConfig = (
  response: Partial<PatchyConfigResponse> | null | undefined,
): PatchyConfig => {
  const fallback = defaultPatchyConfig;
  if (!response || typeof response !== 'object') {
    return fallback;
  }

  const faceImage = { ...fallback.faceImage };
  response.faces?.forEach(({ face, image }) => {
    if (isOneOf(patchyFaces, face) && isText(image)) {
      faceImage[face] = image;
    }
  });

  const reactions = { ...fallback.reactions };
  response.reactions?.forEach((reaction) => {
    if (!isOneOf(patchyTriggers, reaction?.trigger)) {
      return;
    }
    const base = fallback.reactions[reaction.trigger];
    reactions[reaction.trigger] = {
      enabled:
        typeof reaction.enabled === 'boolean' ? reaction.enabled : base.enabled,
      emote: isOneOf(patchyEmotes, reaction.emote)
        ? reaction.emote
        : base.emote,
      face: isOneOf(patchyFaces, reaction.face) ? reaction.face : base.face,
    };
  });

  const moods = { ...fallback.moods };
  response.moods?.forEach((mood) => {
    if (!isOneOf(patchyMoods, mood?.mood)) {
      return;
    }
    const base = fallback.moods[mood.mood];
    moods[mood.mood] = {
      face: isOneOf(patchyFaces, mood.face) ? mood.face : base.face,
      copy: isText(mood.copy) ? mood.copy : base.copy,
      label: isText(mood.label) ? mood.label : base.label,
    };
  });

  const fridayTags = response.fridayDeploy?.tags?.filter(isText);

  return {
    awayMs: isCount(response.awayHours)
      ? response.awayHours * HOUR
      : fallback.awayMs,
    lateNight: toWindow(response.lateNight, fallback.lateNight),
    fridayDeploy: {
      ...toWindow(response.fridayDeploy, fallback.fridayDeploy),
      tags: fridayTags?.length ? fridayTags : fallback.fridayDeploy.tags,
    },
    faceImage,
    reactions,
    moods,
  };
};

const PATCHY_CONFIG_STORAGE_KEY = 'patchy_config';

export const cachePatchyConfig = (response: PatchyConfigResponse): void => {
  storageWrapper.setItem(PATCHY_CONFIG_STORAGE_KEY, JSON.stringify(response));
};

let loadedConfig: PatchyConfig | null = null;

// The config Patchy runs with for this page load: the one cached by the
// previous load, else the defaults. A freshly fetched config is cached for
// the next load instead of swapping art and timing mid-session.
export const getPatchyConfig = (): PatchyConfig => {
  if (typeof window === 'undefined') {
    return defaultPatchyConfig;
  }
  if (!loadedConfig) {
    let cached: Partial<PatchyConfigResponse> | null = null;
    try {
      cached = JSON.parse(
        storageWrapper.getItem(PATCHY_CONFIG_STORAGE_KEY) ?? 'null',
      );
    } catch {
      cached = null;
    }
    loadedConfig = toPatchyConfig(cached);
  }
  return loadedConfig;
};
