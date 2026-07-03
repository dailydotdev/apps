import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { EngagementBanner } from './EngagementBanner';
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
  placements: ['top_banner'],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockAllIsIntersecting(false);
  mockUseLogContext.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
});

describe('EngagementBanner', () => {
  it('logs a single impression with gen_id once visible', () => {
    render(<EngagementBanner creative={creative} />);

    expect(logEvent).not.toHaveBeenCalled();

    mockAllIsIntersecting(true);
    mockAllIsIntersecting(false);
    mockAllIsIntersecting(true);

    expect(
      logEvent.mock.calls.filter(
        ([event]) => event.event_name === LogEvent.Impression,
      ),
    ).toHaveLength(1);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_id: 'Google Cloud',
      extra: JSON.stringify({
        origin: Origin.EngagementBanner,
        gen_id: 'gen-123',
      }),
    });
  });

  it('logs a click with gen_id and source_id for a CPA creative', () => {
    render(
      <EngagementBanner creative={{ ...creative, sourceId: 'cpa-src-9' }} />,
    );

    fireEvent.click(screen.getByText('Claim credits'));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_id: 'Google Cloud',
      extra: JSON.stringify({
        origin: Origin.EngagementBanner,
        gen_id: 'gen-123',
        source_id: 'cpa-src-9',
      }),
    });
  });
});
