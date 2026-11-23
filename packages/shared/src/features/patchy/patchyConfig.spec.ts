import type { PatchyConfigResponse } from '../../graphql/patchy';
import { defaultPatchyConfig, toPatchyConfig } from './patchyConfig';
import type * as PatchyConfigModule from './patchyConfig';

describe('toPatchyConfig', () => {
  it('falls back to the defaults without a config', () => {
    expect(toPatchyConfig(null)).toEqual(defaultPatchyConfig);
    expect(toPatchyConfig({})).toEqual(defaultPatchyConfig);
  });

  it('applies the API values over the defaults', () => {
    const config = toPatchyConfig({
      awayHours: 72,
      lateNight: { startHour: 0, endHour: 4 },
      reactions: [
        { trigger: 'bookmark', enabled: false, emote: 'moon', face: 'happy' },
      ],
      moods: [
        { mood: 'ready', face: 'happy', copy: 'Let’s read', label: 'eager' },
      ],
    });

    expect(config.awayMs).toBe(72 * 60 * 60 * 1000);
    expect(config.lateNight).toEqual({ startHour: 0, endHour: 4 });
    expect(config.reactions.bookmark).toEqual({
      enabled: false,
      emote: 'moon',
      face: 'happy',
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

  it('ignores the old peek fields an older API still sends', () => {
    const config = toPatchyConfig({
      reactions: [
        {
          trigger: 'upvote',
          enabled: true,
          emote: 'sparkle',
          face: 'wink',
          poseImage: 'https://media.daily.dev/wave.webp',
          priority: 4,
        },
      ],
    } as unknown as Partial<PatchyConfigResponse>);
    expect(config.reactions.upvote).toEqual({
      enabled: true,
      emote: 'sparkle',
      face: 'wink',
    });
  });

  it('skips unknown entries and keeps defaults for bad values', () => {
    const config = toPatchyConfig({
      awayHours: -1,
      lateNight: { startHour: 2, endHour: 2 },
      fridayDeploy: { startHour: 12, endHour: 18, tags: [] },
      faces: [
        { face: 'confused', image: 'https://media.daily.dev/confused.webp' },
        { face: 'happy', image: '' },
      ],
      reactions: [
        { trigger: 'commented', enabled: true, emote: 'hearts', face: 'happy' },
        { trigger: 'upvote', enabled: true, emote: 'confetti', face: 'grumpy' },
      ],
    } as Partial<PatchyConfigResponse>);

    expect(config.awayMs).toBe(defaultPatchyConfig.awayMs);
    expect(config.lateNight).toEqual(defaultPatchyConfig.lateNight);
    expect(config.fridayDeploy.tags).toEqual(
      defaultPatchyConfig.fridayDeploy.tags,
    );
    expect(config.faceImage).toEqual(defaultPatchyConfig.faceImage);
    expect(config.reactions).not.toHaveProperty('commented');
    expect(config.reactions.upvote).toEqual(
      defaultPatchyConfig.reactions.upvote,
    );
  });
});

describe('isPatchyFaceAnimated', () => {
  const load = (
    faces?: { face: string; image: string }[],
  ): typeof PatchyConfigModule => {
    localStorage.setItem('patchy_config', JSON.stringify({ faces }));
    let loaded: typeof PatchyConfigModule | undefined;
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      loaded = require('./patchyConfig');
    });
    if (!loaded) {
      throw new Error('patchyConfig did not load');
    }
    return loaded;
  };

  afterEach(() => localStorage.clear());

  it('reads animation off the served image, not the face name', () => {
    const config = load([
      {
        face: 'neutral',
        image:
          'https://media.daily.dev/image/upload/v1/public/patchy-v1-face-neutral.webp',
      },
    ]);

    expect(config.isPatchyFaceAnimated('neutral')).toBe(false);
    expect(config.isPatchyFaceAnimated('yawn')).toBe(true);
    expect(config.isPatchyOneShotFace('yawn')).toBe(true);
    expect(config.isPatchyOneShotFace('reading')).toBe(false);
  });
});
