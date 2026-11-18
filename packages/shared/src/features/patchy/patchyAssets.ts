import { cloudinaryPatchyFed } from '../../lib/image';

// Stills cut from the launch-videos art (dont-blink armchair set + standing
// wave) for the first, staff-only build. Purpose-drawn peek poses and a Rive
// mood file replace these later; keep every URL behind this map so the swap is
// one file.
const media = 'https://media.daily.dev/image/upload';

export type PatchyFace = 'awake' | 'happy' | 'heavy' | 'asleep' | 'sideeye';

export const patchyFaceImage: Record<PatchyFace, string> = {
  awake: `${media}/v1794994652/public/patchy-face-awake.webp`,
  happy: `${media}/v1794994653/public/patchy-face-happy.webp`,
  heavy: `${media}/v1794994654/public/patchy-face-heavy.webp`,
  asleep: `${media}/v1794994656/public/patchy-face-asleep.webp`,
  sideeye: `${media}/v1794994657/public/patchy-face-sideeye.webp`,
};

export type PatchyPose = 'wave' | 'heavy' | 'sideeye' | 'bone';

export const patchyPoseImage: Record<PatchyPose, string> = {
  wave: `${media}/v1794994658/public/patchy-peek-wave.webp`,
  heavy: `${media}/v1794994659/public/patchy-peek-heavy.webp`,
  sideeye: `${media}/v1794994661/public/patchy-peek-sideeye.webp`,
  bone: cloudinaryPatchyFed,
};

export const patchyDenImage = {
  plate: `${media}/v1794994662/public/patchy-den-plate.webp`,
  idle: `${media}/v1794994664/public/patchy-den-idle.webp`,
  blink: `${media}/v1794994665/public/patchy-den-blink.webp`,
  happy: `${media}/v1794994666/public/patchy-den-happy.webp`,
};
