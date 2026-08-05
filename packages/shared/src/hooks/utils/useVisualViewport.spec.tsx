import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useVisualViewport } from './useVisualViewport';

const Viewport = ({ enabled }: { enabled?: boolean }): React.ReactElement => {
  const { width, height, offsetTop } = useVisualViewport(enabled);

  return <div>{`${width}x${height}@${offsetTop}`}</div>;
};

type ViewportStub = EventTarget & {
  width: number;
  height: number;
  offsetTop: number;
};

describe('useVisualViewport', () => {
  let viewport: ViewportStub;

  beforeEach(() => {
    viewport = Object.assign(new EventTarget(), {
      width: 375,
      height: 812,
      offsetTop: 0,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'visualViewport');
  });

  it('reads size and offset from the visual viewport', () => {
    render(<Viewport />);

    expect(screen.getByText('375x812@0')).toBeInTheDocument();
  });

  it('tracks the keyboard shrinking the visual viewport', () => {
    render(<Viewport />);

    viewport.height = 500;
    act(() => {
      viewport.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByText('375x500@0')).toBeInTheDocument();
  });

  it('does not subscribe when disabled', () => {
    render(<Viewport enabled={false} />);

    viewport.height = 500;
    act(() => {
      viewport.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByText('375x812@0')).toBeInTheDocument();
  });

  it('tracks iOS panning the layout viewport under the keyboard', () => {
    render(<Viewport />);

    viewport.offsetTop = 40;
    act(() => {
      viewport.dispatchEvent(new Event('scroll'));
    });

    expect(screen.getByText('375x812@40')).toBeInTheDocument();
  });
});
