import { act, render } from '@testing-library/react';
import React from 'react';
import { PinCoach } from './PinCoach';
import type { SidebarTourState } from './useSidebarTourState';

let mockShortcuts: unknown[] = [];
let mockAreShortcutsLoaded = false;
let mockIsDragging = false;
let mockAnchorRect: DOMRect | null = null;

jest.mock('../../components/sidebar/useSidebarDragState', () => ({
  useSidebarDragState: () => ({
    isDragging: mockIsDragging,
    setDragging: jest.fn(),
  }),
}));

jest.mock('../../components/sidebar/SidebarShortcutsDock', () => ({
  useSidebarShortcutItems: () => ({
    resolved: mockShortcuts,
    isFetched: mockAreShortcutsLoaded,
  }),
}));

jest.mock('./useCoachAnchor', () => ({
  useCoachAnchor: () => ({ rect: mockAnchorRect }),
}));

jest.mock('./CoachPopover', () => ({
  CoachPopover: (): null => null,
}));

const onShown = jest.fn();
const onSuccess = jest.fn();

const coach: SidebarTourState['pinCoach'] = {
  isActive: true,
  hasBeenShown: true,
  onShown,
  onRetire: jest.fn(),
  onSuccess,
};

const unseenCoach: SidebarTourState['pinCoach'] = {
  ...coach,
  hasBeenShown: false,
};

const renderCoach = () => render(<PinCoach coach={coach} isPanelOpen />);

describe('PinCoach success detection', () => {
  beforeEach(() => {
    onSuccess.mockClear();
    mockShortcuts = [];
    mockAreShortcutsLoaded = false;
    mockIsDragging = false;
    mockAnchorRect = null;
  });

  it('does not count storage hydration as a pin', () => {
    const { rerender } = renderCoach();

    // The dock's store answers with an existing dock while a panel happens to
    // be open. Nothing was pinned, so the lesson must survive.
    mockShortcuts = [{ key: 'tags' }, { key: 'sources' }];
    mockAreShortcutsLoaded = true;
    rerender(<PinCoach coach={coach} isPanelOpen />);

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('counts a pin made after storage has answered', () => {
    mockShortcuts = [{ key: 'tags' }];
    mockAreShortcutsLoaded = true;
    const { rerender } = renderCoach();

    mockShortcuts = [{ key: 'tags' }, { key: 'bookmarks' }];
    rerender(<PinCoach coach={coach} isPanelOpen />);

    expect(onSuccess).toHaveBeenCalledWith('button');
  });

  it('claims nothing for a card that never got its exposure', () => {
    mockShortcuts = [{ key: 'tags' }];
    mockAreShortcutsLoaded = true;
    const { rerender } = render(<PinCoach coach={unseenCoach} isPanelOpen />);

    // The panel is open and a pin happens inside the dwell window, so the
    // budget is still unspent, but the card has not been counted as read.
    mockShortcuts = [{ key: 'tags' }, { key: 'bookmarks' }];
    rerender(<PinCoach coach={unseenCoach} isPanelOpen />);

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('ignores growth that no open panel or drag can explain', () => {
    mockShortcuts = [{ key: 'tags' }];
    mockAreShortcutsLoaded = true;
    const { rerender } = render(<PinCoach coach={coach} isPanelOpen={false} />);

    mockShortcuts = [{ key: 'tags' }, { key: 'bookmarks' }];
    rerender(<PinCoach coach={coach} isPanelOpen={false} />);

    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('PinCoach drag attribution', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    onSuccess.mockClear();
    mockShortcuts = [{ key: 'tags' }];
    mockAreShortcutsLoaded = true;
    mockIsDragging = false;
    mockAnchorRect = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const endADrag = (rerender: (element: React.ReactElement) => void) => {
    mockIsDragging = true;
    rerender(<PinCoach coach={coach} isPanelOpen={false} />);
    mockIsDragging = false;
    rerender(<PinCoach coach={coach} isPanelOpen={false} />);
  };

  it('credits a drag whose drop lands right after it ended', () => {
    const { rerender } = render(<PinCoach coach={coach} isPanelOpen={false} />);

    endADrag(rerender);
    mockShortcuts = [{ key: 'tags' }, { key: 'bookmarks' }];
    rerender(<PinCoach coach={coach} isPanelOpen={false} />);

    expect(onSuccess).toHaveBeenCalledWith('drag');
  });

  it('does not credit a drag for growth that arrives much later', () => {
    const { rerender } = render(<PinCoach coach={coach} isPanelOpen={false} />);

    // Drag a shortcut out to remove it, then hit Undo long afterwards: the list
    // grows again, but that is a restore, not the lesson being learned.
    endADrag(rerender);
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    mockShortcuts = [{ key: 'tags' }, { key: 'bookmarks' }];
    rerender(<PinCoach coach={coach} isPanelOpen={false} />);

    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('PinCoach exposure dwell', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    onShown.mockClear();
    mockShortcuts = [];
    mockAreShortcutsLoaded = true;
    mockIsDragging = false;
    mockAnchorRect = { top: 0, height: 40 } as DOMRect;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('charges the exposure budget only once the card has sat there', () => {
    renderCoach();

    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(onShown).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(onShown).toHaveBeenCalledTimes(1);
  });

  it('lets a panel that flashed past cost nothing', () => {
    const { rerender } = renderCoach();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    rerender(<PinCoach coach={coach} isPanelOpen={false} />);
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onShown).not.toHaveBeenCalled();
  });

  it('counts one exposure per visit, not one per render', () => {
    const { rerender } = renderCoach();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    rerender(<PinCoach coach={coach} isPanelOpen />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onShown).toHaveBeenCalledTimes(1);
  });
});
