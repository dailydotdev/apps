import {
  createPatchyPeekScheduler,
  PATCHY_PEEK_GAP_MS,
  PATCHY_PEEK_QUEUE_LIMIT,
} from './patchyPeekScheduler';
import type { PatchyConfig } from './patchyConfig';
import { defaultPatchyConfig } from './patchyConfig';

const COOLDOWN_MS = defaultPatchyConfig.cooldownMs;
const GAP = PATCHY_PEEK_GAP_MS;
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

  it('shows a bookmark and then an upvote, one after the other', () => {
    const peeks = scheduler();

    expect(peeks.request('bookmark', 0)).toBe(true);
    expect(peeks.request('upvote', 100)).toBe(true);
    expect(peeks.take(200, false)).toBe('bookmark');
    expect(peeks.take(200 + GAP - 1, false)).toBeNull();
    expect(peeks.take(200 + GAP, false)).toBe('upvote');
  });

  it('lets an upvote peek while the bookmark one is still showing', () => {
    const peeks = scheduler();
    peeks.request('bookmark', 0);
    peeks.take(0, false);

    expect(peeks.request('upvote', 1000)).toBe(true);
    expect(peeks.take(GAP, false)).toBe('upvote');
  });

  it('peeks the same reaction once per cooldown', () => {
    const peeks = scheduler();
    peeks.request('upvote', 0);
    peeks.take(0, false);

    expect(peeks.request('upvote', COOLDOWN_MS - 1)).toBe(false);
    expect(peeks.request('upvote', COOLDOWN_MS)).toBe(true);
    expect(peeks.take(COOLDOWN_MS, false)).toBe('upvote');
  });

  it('does not queue the same reaction twice', () => {
    const peeks = scheduler();

    expect(peeks.request('upvote', 0)).toBe(true);
    expect(peeks.request('upvote', 10)).toBe(false);
  });

  it('shows the highest priority first', () => {
    const peeks = scheduler();
    peeks.request('upvote', 0);
    peeks.request('streak_day', 10);

    expect(peeks.take(20, false)).toBe('streak_day');
    expect(peeks.take(20 + GAP, false)).toBe('upvote');
  });

  it('drops the lowest priority when the queue is full', () => {
    const peeks = scheduler();
    expect(PATCHY_PEEK_QUEUE_LIMIT).toBe(3);
    peeks.request('upvote', 0);
    peeks.request('streak_day', 0);
    peeks.request('welcome_back', 0);

    expect(peeks.request('late_night', 0)).toBe(true);
    expect(peeks.request('bookmark', 0)).toBe(false);
    expect(peeks.take(0, false)).toBe('welcome_back');
    expect(peeks.take(GAP, false)).toBe('streak_day');
    expect(peeks.take(GAP * 2, false)).toBe('late_night');
    expect(peeks.hasPending()).toBe(false);
  });

  it('forgets a peek that waited past its TTL', () => {
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
