// Patchy art v1 (purpose-drawn rail faces, peek poses and den scenes). Every
// URL stays behind these maps so new art or a Rive mood file is a one-file
// swap.
const media = 'https://media.daily.dev/image/upload';

export type PatchyFace = 'neutral' | 'happy' | 'sleepy' | 'asleep' | 'sideeye';

export const patchyFaceImage: Record<PatchyFace, string> = {
  neutral: `${media}/v1794998763/public/patchy-v1-face-neutral.webp`,
  happy: `${media}/v1794998764/public/patchy-v1-face-happy.webp`,
  sleepy: `${media}/v1794998765/public/patchy-v1-face-sleepy.webp`,
  asleep: `${media}/v1794998767/public/patchy-v1-face-asleep.webp`,
  sideeye: `${media}/v1794998768/public/patchy-v1-face-sideeye.webp`,
};

// Each pose is cut flat down its left side, where it meets the rail edge.
export type PatchyPose = 'wave' | 'deadpan' | 'sleepy' | 'bone';

export const patchyPoseImage: Record<PatchyPose, string> = {
  wave: `${media}/v1794998769/public/patchy-v1-peek-wave.webp`,
  deadpan: `${media}/v1794998770/public/patchy-v1-peek-deadpan.webp`,
  sleepy: `${media}/v1794998772/public/patchy-v1-peek-sleepy.webp`,
  bone: `${media}/v1794998773/public/patchy-v1-peek-bone.webp`,
};

// Full den scenes (room with Patchy at his desk), 16:9.
export const patchyDenImage = {
  idle: `${media}/v1794998775/public/patchy-v1-den-idle.webp`,
  blink: `${media}/v1794998776/public/patchy-v1-den-blink.webp`,
};
