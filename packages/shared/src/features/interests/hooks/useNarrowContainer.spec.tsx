import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { narrowContainerWidth, useNarrowContainer } from './useNarrowContainer';

type Observed = (entries: { contentRect: { width: number } }[]) => void;

let notify: Observed;

beforeEach(() => {
  jest
    .spyOn(globalThis, 'ResizeObserver')
    .mockImplementation((callback: ResizeObserverCallback) => {
      notify = callback as unknown as Observed;

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });
});

afterEach(() => jest.restoreAllMocks());

const Probe = () => {
  const { ref, isNarrow } = useNarrowContainer<HTMLDivElement>();

  return (
    <div ref={ref} data-testid="box">
      {isNarrow ? 'narrow' : 'wide'}
    </div>
  );
};

const measure = (width: number) =>
  act(() => notify([{ contentRect: { width } }]));

/**
 * The panel's cards ask the panel how wide it is, not the window — the reader
 * drags it, and a media query can only ever answer for the viewport.
 */
describe('useNarrowContainer', () => {
  it('starts wide, before anything has been measured', () => {
    render(<Probe />);

    expect(screen.getByTestId('box')).toHaveTextContent('wide');
  });

  it('turns over at the threshold and back again', () => {
    render(<Probe />);

    measure(narrowContainerWidth - 1);
    expect(screen.getByTestId('box')).toHaveTextContent('narrow');

    measure(narrowContainerWidth);
    expect(screen.getByTestId('box')).toHaveTextContent('wide');
  });

  // Zero is what an element measures before layout and again while hidden.
  // Taking it literally would stack every card the moment the panel closed.
  it('ignores a zero measurement rather than reading it as narrow', () => {
    render(<Probe />);

    measure(0);

    expect(screen.getByTestId('box')).toHaveTextContent('wide');
  });
});
