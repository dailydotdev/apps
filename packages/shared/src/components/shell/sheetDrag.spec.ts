import { createEvent, fireEvent } from '@testing-library/react';
import { attachSheetDrag } from './sheetDrag';

describe('attachSheetDrag', () => {
  const mount = () => {
    const panel = document.createElement('div');
    Object.defineProperty(panel, 'offsetHeight', { value: 300 });
    document.body.appendChild(panel);
    const detach = attachSheetDrag(panel, jest.fn());
    return { panel, detach };
  };

  it('marks the sheet entered once its enter animation ends', () => {
    const { panel, detach } = mount();

    const child = document.createElement('span');
    panel.appendChild(child);
    fireEvent.animationEnd(child);
    expect(panel).not.toHaveAttribute('data-entered');

    fireEvent.animationEnd(panel);
    expect(panel).toHaveAttribute('data-entered', 'true');
    detach();
  });

  it('marks the sheet entered when a drag starts before that', () => {
    const { panel, detach } = mount();

    fireEvent.touchStart(panel, { touches: [{ clientY: 400 }] });
    fireEvent.touchMove(panel, { touches: [{ clientY: 380 }] });
    expect(panel).toHaveAttribute('data-dragging', 'true');
    expect(panel).toHaveAttribute('data-entered', 'true');

    fireEvent.touchEnd(panel, { changedTouches: [{ clientY: 380 }] });
    expect(panel).not.toHaveAttribute('data-dragging');
    expect(panel).toHaveAttribute('data-entered', 'true');
    detach();
  });

  it('leaves a sideways swipe to a row that scrolls sideways', () => {
    const { panel, detach } = mount();

    fireEvent.touchStart(panel, { touches: [{ clientX: 340, clientY: 400 }] });
    const first = createEvent.touchMove(panel, {
      touches: [{ clientX: 320, clientY: 405 }],
    });
    fireEvent(panel, first);
    // The thumb drifts down as it carries on sideways.
    const drift = createEvent.touchMove(panel, {
      touches: [{ clientX: 120, clientY: 430 }],
    });
    fireEvent(panel, drift);

    expect(panel).not.toHaveAttribute('data-dragging');
    expect(first.defaultPrevented).toBe(false);
    expect(drift.defaultPrevented).toBe(false);
    expect(panel).not.toHaveStyle({ transform: 'translateY(30px)' });
    fireEvent.touchEnd(panel, { changedTouches: [{ clientY: 430 }] });
    detach();
  });

  it('still drags on a downward pull that wobbles sideways', () => {
    const { panel, detach } = mount();

    fireEvent.touchStart(panel, { touches: [{ clientX: 200, clientY: 400 }] });
    fireEvent.touchMove(panel, { touches: [{ clientX: 204, clientY: 420 }] });

    expect(panel).toHaveAttribute('data-dragging', 'true');
    fireEvent.touchEnd(panel, { changedTouches: [{ clientY: 420 }] });
    detach();
  });

  it('leaves an upward swipe to the content once the sheet is at full height', () => {
    const { panel, detach } = mount();
    panel.setAttribute('data-expanded', 'true');

    fireEvent.touchStart(panel, { touches: [{ clientY: 400 }] });
    const move = createEvent.touchMove(panel, { touches: [{ clientY: 340 }] });
    fireEvent(panel, move);

    expect(panel).not.toHaveAttribute('data-dragging');
    expect(move.defaultPrevented).toBe(false);
    detach();
  });

  it('still takes a downward pull from full height', () => {
    const { panel, detach } = mount();
    panel.setAttribute('data-expanded', 'true');

    fireEvent.touchStart(panel, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(panel, { touches: [{ clientY: 160 }] });

    expect(panel).toHaveAttribute('data-dragging', 'true');
    fireEvent.touchEnd(panel, { changedTouches: [{ clientY: 160 }] });
    detach();
  });

  it('ends a settle on its own transition, not a child\u2019s', () => {
    const { panel, detach } = mount();
    const child = document.createElement('span');
    panel.appendChild(child);

    fireEvent.touchStart(panel, { touches: [{ clientY: 400 }] });
    fireEvent.touchMove(panel, { touches: [{ clientY: 380 }] });
    fireEvent.touchEnd(panel, { changedTouches: [{ clientY: 380 }] });
    expect(panel).toHaveStyle({ maxHeight: 'none' });

    fireEvent.transitionEnd(child);
    expect(panel).toHaveStyle({ maxHeight: 'none' });

    fireEvent.transitionEnd(panel);
    expect(panel).not.toHaveStyle({ maxHeight: 'none' });
    detach();
  });
});
