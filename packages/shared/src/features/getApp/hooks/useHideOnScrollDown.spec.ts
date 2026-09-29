import { act, renderHook } from '@testing-library/react';
import { useHideOnScrollDown } from './useHideOnScrollDown';

const scrollTo = async (y: number) => {
  await act(async () => {
    window.scrollY = y;
    window.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
  });
};

beforeEach(() => {
  window.scrollY = 0;
});

describe('useHideOnScrollDown', () => {
  it('should hide on the way down and come back on any scroll up', async () => {
    const { result } = renderHook(() => useHideOnScrollDown(true));

    await scrollTo(400);
    expect(result.current).toBe(true);

    await scrollTo(380);
    expect(result.current).toBe(false);
  });

  it('should always show near the top of the page', async () => {
    const { result } = renderHook(() => useHideOnScrollDown(true));

    await scrollTo(400);
    await scrollTo(40);

    expect(result.current).toBe(false);
  });

  it('should never hide when disabled', async () => {
    const { result } = renderHook(() => useHideOnScrollDown(false));

    await scrollTo(400);

    expect(result.current).toBe(false);
  });
});
