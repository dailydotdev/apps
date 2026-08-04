import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { useVisualViewport } from '../../hooks/utils/useVisualViewport';
import { Drawer } from './Drawer';

jest.mock('../../hooks/utils/useVisualViewport', () => ({
  useVisualViewport: jest.fn(),
}));

describe('Drawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(useVisualViewport)
      .mockReturnValue({ width: 375, height: 812, offsetTop: 0 });
  });

  it('sizes a full-screen drawer to the visual viewport', () => {
    // The virtual keyboard shrinks the visual viewport, not the layout one, so
    // this is what keeps bottom action bars above the keyboard.
    jest
      .mocked(useVisualViewport)
      .mockReturnValue({ width: 375, height: 500, offsetTop: 40 });

    render(
      <Drawer isOpen isFullScreen onClose={jest.fn()}>
        content
      </Drawer>,
    );

    const overlay = screen.getByText('content').closest('.fixed');
    expect(overlay).toHaveStyle({ height: '500px', top: '40px' });
  });

  it('leaves non-full-screen drawers sized by CSS', () => {
    render(
      <Drawer isOpen onClose={jest.fn()}>
        content
      </Drawer>,
    );

    const overlay = screen.getByText('content').closest('.fixed');
    expect(overlay).not.toHaveStyle({ height: '812px' });
  });

  it('locks the page scroll behind it while open', () => {
    // Regression: scrolling inside the mobile composer drawer chained to the
    // post page behind it, which visibly jumped and shifted. <html> is the
    // page's actual scroller, so the body class alone does not block it.
    const { unmount } = render(
      <Drawer isOpen isFullScreen onClose={jest.fn()}>
        content
      </Drawer>,
    );

    expect(document.body).toHaveClass('hidden-scrollbar');
    expect(document.documentElement).toHaveStyle({ overflow: 'hidden' });

    unmount();
    expect(document.body).not.toHaveClass('hidden-scrollbar');
    expect(document.documentElement).not.toHaveStyle({ overflow: 'hidden' });
  });

  it('keeps the page locked until the last stacked drawer closes', () => {
    const { unmount: unmountInner } = render(
      <Drawer isOpen onClose={jest.fn()}>
        inner
      </Drawer>,
    );
    const { unmount: unmountOuter } = render(
      <Drawer isOpen onClose={jest.fn()}>
        outer
      </Drawer>,
    );

    unmountInner();
    expect(document.body).toHaveClass('hidden-scrollbar');

    unmountOuter();
    expect(document.body).not.toHaveClass('hidden-scrollbar');
  });

  it('contains its own scrolling instead of chaining it to the page', () => {
    render(
      <Drawer isOpen isFullScreen onClose={jest.fn()}>
        content
      </Drawer>,
    );

    const wrapper = screen.getByText('content').closest('.overflow-y-auto');
    expect(wrapper).toHaveClass('overscroll-contain');
  });

  it('closes only on a direct backdrop hit, not on bubbled child clicks', () => {
    // Portaled dropdowns bubble synthetic clicks up the React tree; treating
    // any outside-the-panel target as a backdrop hit closed the drawer when
    // picking a dropdown item.
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(
      <Drawer isOpen instantOpen onClose={onClose}>
        <button type="button">child</button>
      </Drawer>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'child' }));
    // The close call is debounced behind the 300ms exit animation, so give the
    // clock a chance to prove nothing was scheduled.
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(onClose).not.toHaveBeenCalled();

    const overlay = screen
      .getByRole('button', { name: 'child' })
      .closest('.fixed') as Element;
    fireEvent.click(overlay);
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
