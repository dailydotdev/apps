import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useFeedWidgets } from '@dailydotdev/shared/src/features/feedWidgets/useFeedWidgets';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  FeedWidgetKind,
  FeedWidgetSize,
} from '@dailydotdev/shared/src/features/feedWidgets/types';
import { ShortcutsWidgetCue } from './ShortcutsWidgetCue';

jest.mock(
  '@dailydotdev/shared/src/features/feedWidgets/useFeedWidgets',
  () => ({
    useFeedWidgets: jest.fn(),
  }),
);

jest.mock('@dailydotdev/shared/src/hooks/useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

const widget = {
  id: 'shortcuts-1',
  kind: FeedWidgetKind.Shortcuts,
  size: FeedWidgetSize.Small,
};
const addWidget = jest.fn();
const removeWidget = jest.fn();
const displayToast = jest.fn();

const mockFeedWidgets = (canAdd = true) =>
  jest.mocked(useFeedWidgets).mockReturnValue({
    canAdd,
    addWidget,
    removeWidget,
  } as unknown as ReturnType<typeof useFeedWidgets>);

beforeEach(() => {
  jest.clearAllMocks();
  addWidget.mockReturnValue({ widget, saved: Promise.resolve(true) });
  removeWidget.mockReturnValue({ saved: Promise.resolve(true) });
  jest.mocked(useToastNotification).mockReturnValue({
    displayToast,
  } as unknown as ReturnType<typeof useToastNotification>);
  mockFeedWidgets();
});

describe('ShortcutsWidgetCue', () => {
  it('moves shortcuts into the feed’s first card, with an undo that puts them back', async () => {
    render(<ShortcutsWidgetCue onDismiss={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Move to feed' }));

    expect(addWidget).toHaveBeenCalledWith(FeedWidgetKind.Shortcuts, {
      slot: 0,
    });
    await waitFor(() => expect(displayToast).toHaveBeenCalled());
    const [, { action }] = displayToast.mock.calls[0];
    action.onClick();
    expect(removeWidget).toHaveBeenCalledWith(widget.id);
  });

  it('keeps shortcuts where they are when dismissed', () => {
    const onDismiss = jest.fn();
    render(<ShortcutsWidgetCue onDismiss={onDismiss} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Keep shortcuts here' }),
    );

    expect(onDismiss).toHaveBeenCalled();
    expect(addWidget).not.toHaveBeenCalled();
  });

  it('stays out of the way when the rail is full', () => {
    mockFeedWidgets(false);
    const { container } = render(<ShortcutsWidgetCue onDismiss={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
