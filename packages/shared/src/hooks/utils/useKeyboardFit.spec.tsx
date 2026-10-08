import React, { useRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import { useKeyboardFit } from './useKeyboardFit';

const Screen = (): React.ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const height = useKeyboardFit(ref, true);

  return (
    <div ref={ref}>
      <textarea aria-label="composer" />
      <span>{height === undefined ? 'unfitted' : `fitted ${height}`}</span>
    </div>
  );
};

type ViewportStub = EventTarget & {
  width: number;
  height: number;
  offsetTop: number;
  scale: number;
};

describe('useKeyboardFit', () => {
  let viewport: ViewportStub;
  const scrollTo = jest.fn();

  const change = (next: Partial<ViewportStub>) => {
    Object.assign(viewport, next);
    act(() => {
      viewport.dispatchEvent(new Event('resize'));
    });
  };

  beforeEach(() => {
    viewport = Object.assign(new EventTarget(), {
      width: 390,
      height: 844,
      offsetTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 844,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });
    window.scrollTo = scrollTo;
    scrollTo.mockClear();
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'visualViewport');
    Reflect.deleteProperty(document.documentElement, 'clientHeight');
  });

  it('fits to the area above the keyboard and holds the page at the top', () => {
    render(<Screen />);
    screen.getByLabelText('composer').focus();
    window.scrollY = 200;

    change({ height: 500 });

    expect(screen.getByText('fitted 500')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('ends on the keyboard when the browser keeps a pan', () => {
    render(<Screen />);
    screen.getByLabelText('composer').focus();

    change({ height: 500, offsetTop: 40 });

    expect(screen.getByText('fitted 540')).toBeInTheDocument();
  });

  it('ignores pinch-zoom, which shrinks the viewport without a keyboard', () => {
    render(<Screen />);
    screen.getByLabelText('composer').focus();

    change({ height: 422, scale: 2 });

    expect(screen.getByText('unfitted')).toBeInTheDocument();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('ignores a shorter viewport while nothing is being typed in', () => {
    render(<Screen />);

    change({ height: 500 });

    expect(screen.getByText('unfitted')).toBeInTheDocument();
  });

  it('lets go once the keyboard closes', () => {
    render(<Screen />);
    screen.getByLabelText('composer').focus();
    change({ height: 500 });

    change({ height: 844 });

    expect(screen.getByText('unfitted')).toBeInTheDocument();
  });
});
