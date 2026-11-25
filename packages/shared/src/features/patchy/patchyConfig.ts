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
  // Animated faces, one per reaction.
  'reading',
  'chomp',
  'nope',
  'hopeful',
  'delighted',
  'smirk',
  'proud',
  'overjoyed',
  'panting',
  'drowsy',
  'nervous',
  'sheepish',
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

// The bone you give him: the panel's card and his floating emote.
export const patchyBoneImage = `${media}/v1795439489/public/patchy-v1-bone.webp`;

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
    neutral: `${media}/v1795442030/public/patchy-v1-face-anim-neutral.webp`,
    happy: `${media}/v1795505922/public/patchy-v1-face-pose-happy.webp`,
    sleepy: `${media}/v1795505923/public/patchy-v1-face-pose-sleepy.webp`,
    asleep: `${media}/v1795442020/public/patchy-v1-face-anim-asleep.webp`,
    sideeye: `${media}/v1795505924/public/patchy-v1-face-pose-sideeye.webp`,
    lookright: `${media}/v1795442027/public/patchy-v1-face-anim-glance.webp`,
    lookdown: `${media}/v1795505927/public/patchy-v1-face-pose-lookdown.webp`,
    yawn: `${media}/v1795442040/public/patchy-v1-face-anim-yawn.webp`,
    tongue: `${media}/v1795442034/public/patchy-v1-face-anim-tongue.webp`,
    wink: `${media}/v1795442039/public/patchy-v1-face-anim-wink.webp`,
    alert: `${media}/v1795505925/public/patchy-v1-face-pose-alert.webp`,
    earflop: `${media}/v1795442024/public/patchy-v1-face-anim-earflop.webp`,
    reading: `${media}/v1795439583/public/patchy-v1-face-anim-reading.webp`,
    chomp: `${media}/v1795439584/public/patchy-v1-face-anim-bone.webp`,
    nope: `${media}/v1795439586/public/patchy-v1-face-anim-nope.webp`,
    hopeful: `${media}/v1795439588/public/patchy-v1-face-anim-hopeful.webp`,
    delighted: `${media}/v1795442035/public/patchy-v1-face-anim-upvote.webp`,
    smirk: `${media}/v1795442022/public/patchy-v1-face-anim-bookmark.webp`,
    proud: `${media}/v1795442033/public/patchy-v1-face-anim-streak.webp`,
    overjoyed: `${media}/v1795442037/public/patchy-v1-face-anim-welcome.webp`,
    panting: `${media}/v1795442031/public/patchy-v1-face-anim-on-a-roll.webp`,
    drowsy: `${media}/v1795442029/public/patchy-v1-face-anim-late-night.webp`,
    nervous: `${media}/v1795442026/public/patchy-v1-face-anim-friday-deploy.webp`,
    sheepish: `${media}/v1795442021/public/patchy-v1-face-anim-bookmark-pile.webp`,
  },
  reactions: {
    upvote: { enabled: true, emote: 'hearts', face: 'delighted' },
    bookmark: { enabled: true, emote: 'dots', face: 'smirk' },
    downvote: { enabled: true, emote: 'cloud', face: 'nope' },
    bone: { enabled: true, emote: 'bone', face: 'chomp' },
    streak_day: { enabled: true, emote: 'sparkle', face: 'proud' },
    late_night: { enabled: true, emote: 'moon', face: 'drowsy' },
    friday_deploy: { enabled: true, emote: 'sweat', face: 'nervous' },
    welcome_back: { enabled: true, emote: 'hearts', face: 'overjoyed' },
    on_a_roll: { enabled: true, emote: 'hearts', face: 'panting' },
    bookmark_pile: { enabled: true, emote: 'sweat', face: 'sheepish' },
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

// Whether a face animates is read off the image the config gives it, so a
// config that points a face back at a still image gets the circle's motion
// and blinks again. Animated assets are named `patchy-v1-face-anim-*`.
const isAnimatedImage = (image: string | undefined): boolean =>
  !!image?.includes('-anim-');

export const isPatchyFaceAnimated = (face: PatchyFace): boolean =>
  isAnimatedImage(getPatchyConfig().faceImage[face]);

// The animated faces that keep playing; every other one plays once from its
// first frame each time it shows.
const patchyLoopingFaces = new Set<PatchyFace>([
  'neutral',
  'asleep',
  'reading',
  'hopeful',
]);

export const isPatchyOneShotFace = (face: PatchyFace): boolean =>
  isPatchyFaceAnimated(face) && !patchyLoopingFaces.has(face);
