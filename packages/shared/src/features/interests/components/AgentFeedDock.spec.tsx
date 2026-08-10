import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgentFeedDock } from './AgentFeedDock';

const bar = (): HTMLElement =>
  screen.getByTestId('field').closest('.fixed') as HTMLElement;

const withColumn = (rect: Partial<DOMRect>) => {
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({ left: 0, width: 0, ...rect } as DOMRect);
};

const mountDock = () =>
  render(
    <AgentFeedDock>
      <div data-testid="field">Field</div>
    </AgentFeedDock>,
  );

afterEach(() => jest.restoreAllMocks());

describe('AgentFeedDock', () => {
  it('pins itself to the column it was dropped into, not to the window', () => {
    withColumn({ left: 240, width: 1160 });
    mountDock();

    expect(bar()).toHaveStyle({ left: '240px', width: '1160px' });
  });

  it('spans the window rather than collapsing when the column measures nothing', () => {
    withColumn({ left: 0, width: 0 });
    mountDock();

    expect(bar()).toHaveStyle({ left: '0px', right: '0px' });
    expect(bar()).not.toHaveAttribute(
      'style',
      expect.stringContaining('width'),
    );
  });

  it('leaves a marker in the flow that takes up no room', () => {
    withColumn({ left: 100, width: 800 });
    mountDock();

    // An aria-hidden spacer has no role to query it by.
    const marker = document.querySelector('[aria-hidden]');

    expect(marker).toHaveClass('h-0');
  });

  it('watches the column, so it can follow the sidebar', () => {
    const observe = jest.fn();

    (global.ResizeObserver as jest.Mock).mockImplementation(() => ({
      observe,
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    withColumn({ left: 100, width: 800 });
    mountDock();

    expect(observe).toHaveBeenCalledTimes(2);
  });

  it('stops watching when it goes', () => {
    const disconnect = jest.fn();

    (global.ResizeObserver as jest.Mock).mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect,
    }));
    withColumn({ left: 100, width: 800 });
    const { unmount } = mountDock();
    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
