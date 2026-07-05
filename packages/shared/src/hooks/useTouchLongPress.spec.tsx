import type { TouchEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { useTouchLongPress } from './useTouchLongPress';

const createTouchEvent = (x = 0, y = 0): TouchEvent<Element> =>
  ({
    currentTarget: document.createElement('div'),
    touches: [{ clientX: x, clientY: y }],
  } as unknown as TouchEvent<Element>);

describe('useTouchLongPress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.documentElement.style.userSelect = '';
    document.documentElement.style.removeProperty('-webkit-user-select');
    jest.useRealTimers();
  });

  it('suppresses text selection while a long press is pending', () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() =>
      useTouchLongPress({
        enabled: true,
        onLongPress,
      }),
    );

    const previousUserSelect = 'text';
    document.documentElement.style.userSelect = previousUserSelect;

    act(() => {
      result.current.onTouchStart(createTouchEvent(), 'message-1');
    });

    expect(document.documentElement).toHaveStyle({ userSelect: 'none' });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(document.documentElement.style.userSelect).toBe(previousUserSelect);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('keeps selection suppressed until touch end after long press fires', () => {
    const onLongPress = jest.fn();
    const previousUserSelect = document.documentElement.style.userSelect;
    const { result } = renderHook(() =>
      useTouchLongPress({
        enabled: true,
        onLongPress,
      }),
    );

    act(() => {
      result.current.onTouchStart(createTouchEvent(), 'message-1');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledWith('message-1');
    expect(document.documentElement).toHaveStyle({ userSelect: 'none' });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(document.documentElement.style.userSelect).toBe(previousUserSelect);
  });

  it('restores text selection when movement cancels the long press', () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() =>
      useTouchLongPress({
        enabled: true,
        onLongPress,
      }),
    );

    act(() => {
      result.current.onTouchStart(createTouchEvent(), 'message-1');
      result.current.onTouchMove(createTouchEvent(20, 0));
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
    // eslint-disable-next-line jest-dom/prefer-to-have-style
    expect(document.documentElement.style.userSelect).toBe('');
  });
});
