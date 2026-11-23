import { act, renderHook } from '@testing-library/react';
import * as patchyConfig from './patchyConfig';
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

const render = (isReactionsEnabled = true, isReading = false) =>
  renderHook(() =>
    usePatchyCompanion({
      isEnabled: true,
      isReactionsEnabled,
      isReading,
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
    // His animated face brings its own motion.
    expect(result.current).toMatchObject({
      face: 'delighted',
      motion: null,
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
      face: 'panting',
      emote: 'hearts',
      emoteCount: 3,
    });
  });

  it('smirks at a bookmark with a little "…"', () => {
    const { result } = render();
    act(() => emitPatchyEvent({ type: 'bookmark' }));
    expect(result.current).toMatchObject({ face: 'smirk', emote: 'dots' });
  });

  it('keeps the circle motion for a reaction a config maps to a still face', () => {
    const spy = jest.spyOn(patchyConfig, 'getPatchyConfig').mockReturnValue(
      patchyConfig.toPatchyConfig({
        reactions: [
          {
            trigger: 'bookmark',
            enabled: true,
            emote: 'dots',
            face: 'sideeye',
          },
        ],
      } as Parameters<typeof patchyConfig.toPatchyConfig>[0]),
    );
    const { result } = render();
    act(() => emitPatchyEvent({ type: 'bookmark' }));
    expect(result.current).toMatchObject({ face: 'sideeye', motion: 'wobble' });
    spy.mockRestore();
  });

  it('says nope to a downvote under a little cloud', () => {
    const { result } = render();
    act(() => emitPatchyEvent({ type: 'downvote', postId: 'p1' }));
    expect(result.current).toMatchObject({
      face: 'nope',
      emote: 'cloud',
    });
  });

  it('reads the newspaper while a post is open, and drops it to react', () => {
    const { result } = render(true, true);
    expect(result.current.face).toBe('reading');
    act(() => emitPatchyEvent({ type: 'upvote' }));
    expect(result.current.face).toBe('delighted');
    act(() => {
      jest.advanceTimersByTime(PATCHY_REACTION_MS + 100);
    });
    expect(result.current.face).toBe('reading');
  });

  it('chomps a bone even with reactions off', () => {
    const { result } = render(false);
    act(() => emitPatchyEvent({ type: 'bone' }));
    expect(result.current).toMatchObject({
      face: 'chomp',
      emote: 'bone',
      emoteCount: 3,
    });
  });

  it('stays still with reactions off', () => {
    const { result } = render(false);
    act(() => emitPatchyEvent({ type: 'upvote' }));
    expect(result.current.emote).toBeNull();
  });
});
