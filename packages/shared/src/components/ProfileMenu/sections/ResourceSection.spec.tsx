import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFeature } from '../../GrowthBookProvider';
import { iOSSupportsReview, openIOSWriteReview } from '../../../lib/ios';
import { LogEvent, TargetType } from '../../../lib/log';
import { rateAppTitle, ResourceSection } from './ResourceSection';

jest.mock('next/router', () => ({
  useRouter: () => ({ prefetch: jest.fn(() => Promise.resolve()) }),
}));
jest.mock('../../../hooks', () => ({
  useViewSize: () => false,
  ViewSize: { MobileL: 'mobileL' },
}));
jest.mock('../../GrowthBookProvider', () => ({ useFeature: jest.fn() }));
jest.mock('../../../lib/ios', () => ({
  ...jest.requireActual('../../../lib/ios'),
  iOSSupportsReview: jest.fn(),
  openIOSWriteReview: jest.fn(() => true),
}));

const mockLogEvent = jest.fn();

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

describe('ResourceSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useFeature).mockReturnValue(true);
    jest.mocked(iOSSupportsReview).mockReturnValue(true);
  });

  it('shows the rate row in the iOS app with the review bridge', () => {
    render(<ResourceSection />);

    const row = screen.getByRole('button', { name: rateAppTitle });
    expect(row).toBeInTheDocument();
    expect(screen.getByText('Changelog').compareDocumentPosition(row)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    fireEvent.click(row);

    expect(openIOSWriteReview).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.AppStoreReview,
      target_id: 'profile_menu',
    });
  });

  it('hides the rate row without the review bridge', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    render(<ResourceSection />);

    expect(
      screen.queryByRole('button', { name: rateAppTitle }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Changelog')).toBeInTheDocument();
  });

  it('hides the rate row when the feature is off', () => {
    jest.mocked(useFeature).mockReturnValue(false);
    render(<ResourceSection />);

    expect(
      screen.queryByRole('button', { name: rateAppTitle }),
    ).not.toBeInTheDocument();
  });
});
