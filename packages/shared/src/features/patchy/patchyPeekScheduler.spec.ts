import { createPatchyPeekScheduler } from './patchyPeekScheduler';
import type { PatchyConfig } from './patchyConfig';
import { defaultPatchyConfig } from './patchyConfig';

const COOLDOWN_MS = defaultPatchyConfig.cooldownMs;
const scheduler = (config: PatchyConfig = defaultPatchyConfig) =>
  createPatchyPeekScheduler(() => config);

describe('createPatchyPeekScheduler', () => {
  it('shows a requested peek once nothing blocks it', () => {
    const peeks = scheduler();

    expect(peeks.request('upvote', 0)).toBe(true);
    expect(peeks.take(100, true)).toBeNull();
    expect(peeks.hasPending()).toBe(true);
    expect(peeks.take(200, false)).toBe('upvote');
    expect(peeks.hasPending()).toBe(false);
  });

  it('drops every request during the cooldown after a peek', () => {
    const peeks = scheduler();
    peeks.request('upvote', 0);
    peeks.take(0, false);

    expect(peeks.request('bookmark', COOLDOWN_MS - 1)).toBe(false);
    expect(peeks.take(COOLDOWN_MS - 1, false)).toBeNull();
    expect(peeks.request('bookmark', COOLDOWN_MS)).toBe(true);
    expect(peeks.take(COOLDOWN_MS, false)).toBe('bookmark');
  });

  it('keeps one pending peek and drops the rest', () => {
    const peeks = scheduler();

    expect(peeks.request('upvote', 0)).toBe(true);
    expect(peeks.request('bookmark', 10)).toBe(false);
    expect(peeks.take(20, false)).toBe('upvote');
    expect(peeks.take(30, false)).toBeNull();
  });

  it('lets a higher-priority trigger replace the pending one', () => {
    const peeks = scheduler();
    peeks.request('upvote', 0);

    expect(peeks.request('streak_day', 10)).toBe(true);
    expect(peeks.request('upvote', 20)).toBe(false);
    expect(peeks.take(30, false)).toBe('streak_day');
  });

  it('forgets a pending peek that waited past its TTL', () => {
    const peeks = scheduler();
    peeks.request('upvote', 0);

    expect(
      peeks.take(defaultPatchyConfig.reactions.upvote.ttlMs + 1, false),
    ).toBeNull();
    expect(peeks.hasPending()).toBe(false);
  });

  it('drops a reaction the config turned off', () => {
    const peeks = scheduler({
      ...defaultPatchyConfig,
      reactions: {
        ...defaultPatchyConfig.reactions,
        upvote: { ...defaultPatchyConfig.reactions.upvote, enabled: false },
      },
    });

    expect(peeks.request('upvote', 0)).toBe(false);
    expect(peeks.request('bookmark', 0)).toBe(true);
  });
});
