import { renderHook } from '@testing-library/react';
import { useIsBootPopupsPaused, usePauseBootPopups } from './bootPopupsPause';

describe('bootPopupsPause', () => {
  it('is not paused by default', () => {
    const { result } = renderHook(() => useIsBootPopupsPaused());

    expect(result.current).toBe(false);
  });

  it('pauses while a page holds it and resumes when it lets go', () => {
    const { result } = renderHook(() => useIsBootPopupsPaused());
    const { rerender, unmount } = renderHook(
      ({ pause }) => usePauseBootPopups(pause),
      { initialProps: { pause: true } },
    );

    expect(result.current).toBe(true);

    rerender({ pause: false });
    expect(result.current).toBe(false);

    rerender({ pause: true });
    expect(result.current).toBe(true);

    unmount();
    expect(result.current).toBe(false);
  });

  it('stays paused until every page lets go', () => {
    const { result } = renderHook(() => useIsBootPopupsPaused());
    const { unmount: releaseFirst } = renderHook(() =>
      usePauseBootPopups(true),
    );
    const { unmount: releaseSecond } = renderHook(() =>
      usePauseBootPopups(true),
    );

    releaseFirst();
    expect(result.current).toBe(true);

    releaseSecond();
    expect(result.current).toBe(false);
  });
});
