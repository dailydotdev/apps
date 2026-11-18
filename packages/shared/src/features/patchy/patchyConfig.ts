import type { PatchyConfigResponse } from '../../graphql/patchy';
import { storageWrapper } from '../../lib/storageWrapper';

// The client owns the vocabulary (each trigger needs a signal in the app);
// the API's `patchyConfig` owns how Patchy reacts to it. These defaults are
// the fallback until a config is cached, and fill anything the cached one
// leaves out.
export const patchyTriggers = [
  'upvote',
  'bookmark',
  'streak_day',
  'late_night',
  'friday_deploy',
  'welcome_back',
] as const;
export type PatchyTrigger = (typeof patchyTriggers)[number];

export const patchyFaces = [
  'neutral',
  'happy',
  'sleepy',
  'asleep',
  'sideeye',
] as const;
export type PatchyFace = (typeof patchyFaces)[number];

export const patchyEmotes = [
  'hearts',
  'dots',
  'sparkle',
  'moon',
  'sweat',
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

export interface PatchyReaction {
  enabled: boolean;
  poseImage: string;
  emote: PatchyEmote;
  // The icon face while (and right after) he peeks.
  face: PatchyFace;
  // Higher wins when two triggers compete for the single pending slot.
  priority: number;
  // A pending peek that could not show (scrolling, a modal) goes stale after
  // this long: a hearts peek three minutes after the upvote reads as random.
  ttlMs: number;
}

export interface PatchyHourWindow {
  // Local hours, start inclusive, end exclusive. A start after the end wraps
  // past midnight (23 to 3).
  startHour: number;
  endHour: number;
}

export interface PatchyConfig {
  cooldownMs: number;
  awayMs: number;
  lateNight: PatchyHourWindow;
  fridayDeploy: PatchyHourWindow & { tags: string[] };
  faceImage: Record<PatchyFace, string>;
  reactions: Record<PatchyTrigger, PatchyReaction>;
  moods: Record<PatchyMood, { face: PatchyFace; copy: string; label: string }>;
  den: { idleImage: string; blinkImage: string };
}

const SECOND = 1000;
const HOUR = 60 * 60 * SECOND;
const media = 'https://media.daily.dev/image/upload';
const pose = {
  wave: `${media}/v1794998769/public/patchy-v1-peek-wave.webp`,
  deadpan: `${media}/v1794998770/public/patchy-v1-peek-deadpan.webp`,
  sleepy: `${media}/v1794998772/public/patchy-v1-peek-sleepy.webp`,
  bone: `${media}/v1794998773/public/patchy-v1-peek-bone.webp`,
};

export const defaultPatchyConfig: PatchyConfig = {
  cooldownMs: 180 * SECOND,
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
  },
  reactions: {
    upvote: {
      enabled: true,
      poseImage: pose.wave,
      emote: 'hearts',
      face: 'happy',
      priority: 1,
      ttlMs: 20 * SECOND,
    },
    bookmark: {
      enabled: true,
      poseImage: pose.deadpan,
      emote: 'dots',
      face: 'sideeye',
      priority: 1,
      ttlMs: 20 * SECOND,
    },
    // Usually lands while the post modal is open, so it waits for it to close.
    streak_day: {
      enabled: true,
      poseImage: pose.bone,
      emote: 'sparkle',
      face: 'happy',
      priority: 3,
      ttlMs: 600 * SECOND,
    },
    late_night: {
      enabled: true,
      poseImage: pose.sleepy,
      emote: 'moon',
      face: 'sleepy',
      priority: 2,
      ttlMs: 300 * SECOND,
    },
    friday_deploy: {
      enabled: true,
      poseImage: pose.wave,
      emote: 'sweat',
      face: 'sideeye',
      priority: 2,
      ttlMs: 300 * SECOND,
    },
    welcome_back: {
      enabled: true,
      poseImage: pose.wave,
      emote: 'hearts',
      face: 'happy',
      priority: 4,
      ttlMs: 600 * SECOND,
    },
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
  den: {
    idleImage: `${media}/v1794998775/public/patchy-v1-den-idle.webp`,
    blinkImage: `${media}/v1794998776/public/patchy-v1-den-blink.webp`,
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
      poseImage: isText(reaction.poseImage)
        ? reaction.poseImage
        : base.poseImage,
      emote: isOneOf(patchyEmotes, reaction.emote)
        ? reaction.emote
        : base.emote,
      face: isOneOf(patchyFaces, reaction.face) ? reaction.face : base.face,
      priority: isCount(reaction.priority) ? reaction.priority : base.priority,
      ttlMs: isCount(reaction.ttlSeconds)
        ? reaction.ttlSeconds * SECOND
        : base.ttlMs,
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
    cooldownMs: isCount(response.cooldownSeconds)
      ? response.cooldownSeconds * SECOND
      : fallback.cooldownMs,
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
    den: {
      idleImage: isText(response.den?.idleImage)
        ? response.den.idleImage
        : fallback.den.idleImage,
      blinkImage: isText(response.den?.blinkImage)
        ? response.den.blinkImage
        : fallback.den.blinkImage,
    },
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
