import type { PatchyConfigResponse } from '../../graphql/patchy';
import { defaultPatchyConfig, toPatchyConfig } from './patchyConfig';

describe('toPatchyConfig', () => {
  it('falls back to the defaults without a config', () => {
    expect(toPatchyConfig(null)).toEqual(defaultPatchyConfig);
    expect(toPatchyConfig({})).toEqual(defaultPatchyConfig);
  });

  it('applies the API values over the defaults', () => {
    const config = toPatchyConfig({
      cooldownSeconds: 60,
      awayHours: 72,
      lateNight: { startHour: 0, endHour: 4 },
      reactions: [
        {
          trigger: 'bookmark',
          enabled: false,
          poseImage: 'https://media.daily.dev/bookmark.webp',
          emote: 'moon',
          face: 'happy',
          priority: 5,
          ttlSeconds: 30,
        },
      ],
      moods: [
        { mood: 'ready', face: 'happy', copy: 'Let’s read', label: 'eager' },
      ],
    });

    expect(config.cooldownMs).toBe(60_000);
    expect(config.awayMs).toBe(72 * 60 * 60 * 1000);
    expect(config.lateNight).toEqual({ startHour: 0, endHour: 4 });
    expect(config.reactions.bookmark).toEqual({
      enabled: false,
      poseImage: 'https://media.daily.dev/bookmark.webp',
      emote: 'moon',
      face: 'happy',
      priority: 5,
      ttlMs: 30_000,
    });
    expect(config.reactions.upvote).toEqual(
      defaultPatchyConfig.reactions.upvote,
    );
    expect(config.moods.ready).toEqual({
      face: 'happy',
      copy: 'Let’s read',
      label: 'eager',
    });
  });

  it('skips unknown entries and keeps defaults for bad values', () => {
    const config = toPatchyConfig({
      cooldownSeconds: -1,
      lateNight: { startHour: 2, endHour: 2 },
      fridayDeploy: { startHour: 12, endHour: 18, tags: [] },
      faces: [
        { face: 'confused', image: 'https://media.daily.dev/confused.webp' },
        { face: 'happy', image: '' },
      ],
      reactions: [
        {
          trigger: 'commented',
          enabled: true,
          poseImage: 'https://media.daily.dev/comment.webp',
          emote: 'hearts',
          face: 'happy',
          priority: 1,
          ttlSeconds: 20,
        },
        {
          trigger: 'upvote',
          enabled: true,
          poseImage: 'https://media.daily.dev/wave.webp',
          emote: 'confetti',
          face: 'grumpy',
          priority: 1,
          ttlSeconds: 20,
        },
      ],
    } as Partial<PatchyConfigResponse>);

    expect(config.cooldownMs).toBe(defaultPatchyConfig.cooldownMs);
    expect(config.lateNight).toEqual(defaultPatchyConfig.lateNight);
    expect(config.fridayDeploy.tags).toEqual(
      defaultPatchyConfig.fridayDeploy.tags,
    );
    expect(config.faceImage).toEqual(defaultPatchyConfig.faceImage);
    expect(config.reactions).not.toHaveProperty('commented');
    expect(config.reactions.upvote).toEqual({
      ...defaultPatchyConfig.reactions.upvote,
      poseImage: 'https://media.daily.dev/wave.webp',
    });
  });
});
