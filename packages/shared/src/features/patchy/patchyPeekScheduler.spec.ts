import {
  createPatchyPeekScheduler,
  PATCHY_PEEK_COOLDOWN_MS,
} from './patchyPeekScheduler';
import { patchyPeeks } from './patchyTriggers';

describe('createPatchyPeekScheduler', () => {
  it('shows a requested peek once nothing blocks it', () => {
    const scheduler = createPatchyPeekScheduler();

    expect(scheduler.request('upvote', 0)).toBe(true);
    expect(scheduler.take(100, true)).toBeNull();
    expect(scheduler.hasPending()).toBe(true);
    expect(scheduler.take(200, false)).toBe('upvote');
    expect(scheduler.hasPending()).toBe(false);
  });

  it('drops every request during the cooldown after a peek', () => {
    const scheduler = createPatchyPeekScheduler();
    scheduler.request('upvote', 0);
    scheduler.take(0, false);

    expect(scheduler.request('bookmark', PATCHY_PEEK_COOLDOWN_MS - 1)).toBe(
      false,
    );
    expect(scheduler.take(PATCHY_PEEK_COOLDOWN_MS - 1, false)).toBeNull();
    expect(scheduler.request('bookmark', PATCHY_PEEK_COOLDOWN_MS)).toBe(true);
    expect(scheduler.take(PATCHY_PEEK_COOLDOWN_MS, false)).toBe('bookmark');
  });

  it('keeps one pending peek and drops the rest', () => {
    const scheduler = createPatchyPeekScheduler();

    expect(scheduler.request('upvote', 0)).toBe(true);
    expect(scheduler.request('bookmark', 10)).toBe(false);
    expect(scheduler.take(20, false)).toBe('upvote');
    expect(scheduler.take(30, false)).toBeNull();
  });

  it('lets a higher-priority trigger replace the pending one', () => {
    const scheduler = createPatchyPeekScheduler();
    scheduler.request('upvote', 0);

    expect(scheduler.request('streak_day', 10)).toBe(true);
    expect(scheduler.request('upvote', 20)).toBe(false);
    expect(scheduler.take(30, false)).toBe('streak_day');
  });

  it('forgets a pending peek that waited past its TTL', () => {
    const scheduler = createPatchyPeekScheduler();
    scheduler.request('upvote', 0);

    expect(scheduler.take(patchyPeeks.upvote.ttlMs + 1, false)).toBeNull();
    expect(scheduler.hasPending()).toBe(false);
  });
});
