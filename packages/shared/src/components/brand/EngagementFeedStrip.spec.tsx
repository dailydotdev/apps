import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { EngagementFeedStrip } from './EngagementFeedStrip';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import type { ResolvedCreative } from '../../lib/engagementAds';

jest.mock('../../contexts/LogContext');

const mockUseLogContext = useLogContext as jest.MockedFunction<
  typeof useLogContext
>;
const logEvent = jest.fn();

const creative: ResolvedCreative = {
  genId: 'gen-123',
  name: 'Google Cloud',
  body: 'Get $300 in free credits',
  cta: 'Claim credits',
  url: 'https://cloud.google.com/free',
  logo: 'https://example.com/logo.png',
  icon: 'https://example.com/icon.png',
  primaryColor: '#4285F4',
  secondaryColor: '#34A853',
  tools: [],
  keywords: [],
  tags: [],
  placements: ['feed_strip'],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockAllIsIntersecting(false);
  mockUseLogContext.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
});

describe('EngagementFeedStrip', () => {
  it('logs an impression with gen_id once it becomes visible', () => {
    render(<EngagementFeedStrip creative={creative} />);

    expect(logEvent).not.toHaveBeenCalled();

    mockAllIsIntersecting(true);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_id: 'Google Cloud',
      extra: JSON.stringify({
        origin: Origin.EngagementFeedStrip,
        gen_id: 'gen-123',
      }),
    });

    // Toggling visibility again must not re-log the impression.
    mockAllIsIntersecting(false);
    mockAllIsIntersecting(true);
    expect(
      logEvent.mock.calls.filter(
        ([event]) => event.event_name === LogEvent.Impression,
      ),
    ).toHaveLength(1);
  });

  it('logs a click with gen_id when the CTA is clicked', () => {
    render(<EngagementFeedStrip creative={creative} />);

    fireEvent.click(screen.getByText('Claim credits'));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_id: 'Google Cloud',
      extra: JSON.stringify({
        origin: Origin.EngagementFeedStrip,
        gen_id: 'gen-123',
      }),
    });
  });

  it('includes source_id in extra for a CPA (skadi) creative', () => {
    render(
      <EngagementFeedStrip creative={{ ...creative, sourceId: 'cpa-src-9' }} />,
    );

    mockAllIsIntersecting(true);
    fireEvent.click(screen.getByText('Claim credits'));

    const expectedExtra = JSON.stringify({
      origin: Origin.EngagementFeedStrip,
      gen_id: 'gen-123',
      source_id: 'cpa-src-9',
    });
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.Impression,
        extra: expectedExtra,
      }),
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.Click,
        extra: expectedExtra,
      }),
    );
  });
});
