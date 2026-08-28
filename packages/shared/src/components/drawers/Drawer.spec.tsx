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
      <Drawer isOpen isFullScreen onClose={jest.fn()}>
        inner
      </Drawer>,
    );
    const { unmount: unmountOuter } = render(
      <Drawer isOpen isFullScreen onClose={jest.fn()}>
        outer
      </Drawer>,
    );

    unmountInner();
    expect(document.body).toHaveClass('hidden-scrollbar');

    unmountOuter();
    expect(document.body).not.toHaveClass('hidden-scrollbar');
  });

  it('leaves the page scrollable behind a partial drawer', () => {
    const { unmount } = render(
      <Drawer isOpen onClose={jest.fn()}>
        content
      </Drawer>,
    );

    expect(document.body).not.toHaveClass('hidden-scrollbar');
    expect(document.documentElement).not.toHaveStyle({ overflow: 'hidden' });
    unmount();
  });

  it('hands back the inline overflow it found instead of deleting it', () => {
    // Another lock (react-modal today, something else later) may already own
    // an inline overflow; the last drawer out must not wipe it.
    document.documentElement.style.overflow = 'clip';

    const { unmount } = render(
      <Drawer isOpen isFullScreen onClose={jest.fn()}>
        content
      </Drawer>,
    );
    expect(document.documentElement).toHaveStyle({ overflow: 'hidden' });

    unmount();
    expect(document.documentElement).toHaveStyle({ overflow: 'clip' });
    document.documentElement.style.removeProperty('overflow');
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

  it('exposes dialog semantics and takes focus on open', () => {
    render(
      <Drawer isOpen title="Filters" onClose={jest.fn()}>
        content
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
  });

  it('restores focus to the opener when it closes', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(
      <Drawer isOpen onClose={jest.fn()}>
        content
      </Drawer>,
    );
    expect(opener).not.toHaveFocus();

    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('closes the top-most drawer on Escape', () => {
    jest.useFakeTimers();
    const onCloseOuter = jest.fn();
    const onCloseInner = jest.fn();
    render(
      <Drawer isOpen instantOpen onClose={onCloseOuter}>
        outer
      </Drawer>,
    );
    render(
      <Drawer isOpen instantOpen onClose={onCloseInner}>
        inner
      </Drawer>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(onCloseInner).toHaveBeenCalledTimes(1);
    expect(onCloseOuter).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('keeps Tab cycling inside the drawer', () => {
    render(
      <Drawer isOpen onClose={jest.fn()}>
        <button type="button">first</button>
        <button type="button">last</button>
      </Drawer>,
    );

    const first = screen.getByRole('button', { name: 'first' });
    const last = screen.getByRole('button', { name: 'last' });

    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(first).toHaveFocus();

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('closes only on a direct backdrop hit, not on bubbled child clicks', () => {
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
