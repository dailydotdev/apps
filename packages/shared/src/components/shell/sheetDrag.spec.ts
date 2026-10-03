import { fireEvent } from '@testing-library/react';
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
});
