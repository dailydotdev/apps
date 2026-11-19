import { act, renderHook } from '@testing-library/react';
import { emitPatchyEvent } from './patchyEvents';
import { PATCHY_REACTION_MS, usePatchyCompanion } from './usePatchyCompanion';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1' } }),
}));
jest.mock('./usePatchyConfigSync', () => ({
  usePatchyConfigSync: () => undefined,
}));
jest.mock('../../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false,
}));

const render = (isReactionsEnabled = true) =>
  renderHook(() =>
    usePatchyCompanion({
      isEnabled: true,
      isReactionsEnabled,
      isStreakLoading: false,
      state: 'safe',
      hasReadToday: true,
      lastViewAt: new Date(),
    }),
  );

describe('usePatchyCompanion', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 19, 12));
    localStorage.clear();
  });
  afterEach(() => jest.useRealTimers());

  it('reacts to every upvote inside the circle, then settles', () => {
    const { result } = render();
    act(() => emitPatchyEvent({ type: 'upvote', postId: 'p1' }));
    expect(result.current).toMatchObject({
      face: 'happy',
      motion: 'hop',
      emote: 'hearts',
      emoteCount: 1,
    });
    const firstKey = result.current.emoteKey;

    act(() => emitPatchyEvent({ type: 'upvote', postId: 'p2' }));
    expect(result.current.emoteKey).toBeGreaterThan(firstKey);

    act(() => {
      jest.advanceTimersByTime(PATCHY_REACTION_MS + 100);
    });
    expect(result.current.emote).toBeNull();
  });

  it('gives the third upvote of the day a few more hearts', () => {
    const { result } = render();
    act(() => emitPatchyEvent({ type: 'upvote' }));
    act(() => emitPatchyEvent({ type: 'upvote' }));
    act(() => emitPatchyEvent({ type: 'upvote' }));
    expect(result.current).toMatchObject({
      face: 'tongue',
      emote: 'hearts',
      emoteCount: 3,
    });
  });

  it('side-eyes a bookmark with a little "…"', () => {
    const { result } = render();
    act(() => emitPatchyEvent({ type: 'bookmark' }));
    expect(result.current).toMatchObject({
      face: 'sideeye',
      motion: 'wobble',
      emote: 'dots',
    });
  });

  it('stays still with reactions off', () => {
    const { result } = render(false);
    act(() => emitPatchyEvent({ type: 'upvote' }));
    expect(result.current.emote).toBeNull();
  });
});
