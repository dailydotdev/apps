import { render } from '@testing-library/react';
import React from 'react';
import { PinCoach } from './PinCoach';
import type { SidebarTourState } from './useSidebarTourState';

let mockShortcuts: unknown[] = [];
let mockAreShortcutsLoaded = false;

jest.mock('../../components/sidebar/useSidebarDragState', () => ({
  useSidebarDragState: () => ({ isDragging: false, setDragging: jest.fn() }),
}));

jest.mock('../../components/sidebar/SidebarShortcutsDock', () => ({
  useSidebarShortcutItems: () => ({
    resolved: mockShortcuts,
    isFetched: mockAreShortcutsLoaded,
  }),
}));

jest.mock('./useCoachAnchor', () => ({
  useCoachAnchor: () => ({ rect: null }),
}));

jest.mock('./CoachPopover', () => ({
  CoachPopover: (): null => null,
}));

const onSuccess = jest.fn();

const coach: SidebarTourState['pinCoach'] = {
  isActive: true,
  onShown: jest.fn(),
  onRetire: jest.fn(),
  onSuccess,
};

const renderCoach = () => render(<PinCoach coach={coach} isPanelOpen />);

describe('PinCoach success detection', () => {
  beforeEach(() => {
    onSuccess.mockClear();
    mockShortcuts = [];
    mockAreShortcutsLoaded = false;
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

  it('ignores growth that no open panel or drag can explain', () => {
    mockShortcuts = [{ key: 'tags' }];
    mockAreShortcutsLoaded = true;
    const { rerender } = render(<PinCoach coach={coach} isPanelOpen={false} />);

    mockShortcuts = [{ key: 'tags' }, { key: 'bookmarks' }];
    rerender(<PinCoach coach={coach} isPanelOpen={false} />);

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
