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
