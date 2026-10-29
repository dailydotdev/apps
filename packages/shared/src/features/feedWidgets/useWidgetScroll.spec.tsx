import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useWidgetScroll } from './useWidgetScroll';

let notify: () => void;

beforeEach(() => {
  jest
    .spyOn(globalThis, 'ResizeObserver')
    .mockImplementation((callback: ResizeObserverCallback) => {
      notify = callback as unknown as () => void;

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });
});

afterEach(() => jest.restoreAllMocks());

const Probe = () => {
  const scroll = useWidgetScroll();

  return (
    <div ref={scroll.ref} onScroll={scroll.onScroll} data-testid="list">
      <ul />
    </div>
  );
};

let scrollHeight: number;

const mountList = () => {
  scrollHeight = 874;
  jest
    .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    .mockImplementation(() => scrollHeight);
  render(<Probe />);
  act(() => notify());

  return screen.getByTestId('list');
};

// A scroll-snapped list re-snaps to the row it rested on when a row is
// inserted above it, which scrolls it down by the new row's height. The
// browser reports the resize and the scroll in either order.
const insertRowAbove = (list: HTMLElement, report: () => void) => {
  scrollHeight = 954;
  // eslint-disable-next-line no-param-reassign
  list.scrollTop = 80;
  act(report);
};

describe('useWidgetScroll', () => {
  it('keeps a list at the top when a row arrives above, resize first', () => {
    const list = mountList();

    insertRowAbove(list, () => notify());

    expect(list.scrollTop).toBe(0);
  });

  it('keeps a list at the top when a row arrives above, scroll first', () => {
    const list = mountList();

    insertRowAbove(list, () => fireEvent.scroll(list));

    expect(list.scrollTop).toBe(0);
  });

  it('leaves a list the reader scrolled down where it is', () => {
    const list = mountList();
    list.scrollTop = 40;
    fireEvent.scroll(list);

    insertRowAbove(list, () => notify());

    expect(list.scrollTop).toBe(80);
  });
});
