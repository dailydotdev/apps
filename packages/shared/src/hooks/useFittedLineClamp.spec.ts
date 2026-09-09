import { act, renderHook } from '@testing-library/react';
import { useFittedLineClamp } from './useFittedLineClamp';

const LINE_HEIGHT = 20;
const MAX_LINES = 6;

let notify: (() => void) | undefined;

beforeEach(() => {
  notify = undefined;

  Object.defineProperty(global, 'ResizeObserver', {
    writable: true,
    value: jest.fn().mockImplementation((callback: () => void) => {
      notify = callback;

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    }),
  });

  jest
    .spyOn(window, 'getComputedStyle')
    // `line-height` resolves even on a box that is not rendered, so the hook's
    // own guard cannot stand in for keeping the element in flow.
    .mockImplementation(
      () =>
        ({
          lineHeight: `${LINE_HEIGHT}px`,
          paddingBottom: '0px',
        } as CSSStyleDeclaration),
    );
});

afterEach(() => {
  jest.restoreAllMocks();
});

/** A container whose floor sits `room` pixels below where the text starts. */
const attach = (
  result: { current: ReturnType<typeof useFittedLineClamp> },
  room: number,
) => {
  const container = document.createElement('div');
  const text = document.createElement('p');

  container.getBoundingClientRect = () => ({ bottom: room } as DOMRect);
  text.getBoundingClientRect = () => ({ top: 0 } as DOMRect);

  act(() => {
    result.current.containerRef(container);
    result.current.textRef(text);
  });
};

describe('useFittedLineClamp', () => {
  it('clamps to the whole lines that fit', () => {
    const { result } = renderHook(() => useFittedLineClamp(MAX_LINES));
    attach(result, LINE_HEIGHT * 3);

    expect(result.current.lines).toBe(3);
    expect(result.current.style).toEqual({ WebkitLineClamp: 3 });
  });

  it('never exceeds the ceiling however much room there is', () => {
    const { result } = renderHook(() => useFittedLineClamp(MAX_LINES));
    attach(result, LINE_HEIGHT * 50);

    expect(result.current.lines).toBe(MAX_LINES);
  });

  // `display: none` reports a 0x0 box at the origin, which measures as a full
  // viewport of room, brings the text back, and oscillates. The box has to stay
  // in flow for the next measurement to read the same geometry.
  it('hides the text without removing it from layout when nothing fits', () => {
    const { result } = renderHook(() => useFittedLineClamp(MAX_LINES));
    attach(result, 0);

    expect(result.current.lines).toBe(0);
    // Exactly one declaration: `display` here would take the box out of flow.
    expect(Object.keys(result.current.style)).toEqual(['visibility']);
    expect(result.current.style).toEqual({ visibility: 'hidden' });
  });

  it('settles at zero instead of oscillating once hidden', () => {
    const { result } = renderHook(() => useFittedLineClamp(MAX_LINES));
    attach(result, 0);

    expect(result.current.lines).toBe(0);

    // The element is still in flow, so a re-measure reads the same geometry.
    act(() => notify?.());

    expect(result.current.lines).toBe(0);
    expect(result.current.style).toEqual({ visibility: 'hidden' });
  });
});
