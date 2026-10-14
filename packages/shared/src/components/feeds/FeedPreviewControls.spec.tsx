import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { FeedPreviewControls } from './FeedPreviewControls';
import { LogEvent, Origin } from '../../lib/log';

const logEvent = jest.fn();
const onClick = jest.fn();

const renderComponent = (isOpen: boolean, isTagStyle = false) =>
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      <FeedPreviewControls
        isOpen={isOpen}
        isTagStyle={isTagStyle}
        textDisabled="0/5 to show feed preview"
        origin={Origin.EditTag}
        onClick={onClick}
        data-funnel-track="feed preview"
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

it.each([
  [false, 'true'],
  [true, 'false'],
])(
  'logs the new visibility as a string target_id when isOpen is %s',
  (isOpen, expected) => {
    renderComponent(isOpen);
    fireEvent.click(screen.getByRole('button'));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ToggleFeedPreview,
      target_id: expected,
      extra: JSON.stringify({ origin: Origin.EditTag }),
    });
    expect(onClick).toHaveBeenCalledWith(!isOpen);
  },
);

it.each([false, true])(
  'forwards data-funnel-track to the button (tag style: %s)',
  (isTagStyle) => {
    renderComponent(false, isTagStyle);

    expect(screen.getByRole('button')).toHaveAttribute(
      'data-funnel-track',
      'feed preview',
    );
  },
);
