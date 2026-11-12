import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { LogEvent, TargetType } from '../../lib/log';
import { openIOSWriteReview, requestIOSReview } from '../../lib/ios';
import * as bootHook from '../../hooks/useBoot';
import type { MarketingCta } from '../marketing/cta/common';
import { MarketingCtaVariant } from '../marketing/cta/common';
import AppStoreReviewModal, {
  appStoreReviewCopy,
  appStoreReviewRequestDelayMs,
} from './AppStoreReviewModal';

jest.mock('../../lib/ios', () => ({
  ...jest.requireActual('../../lib/ios'),
  openIOSWriteReview: jest.fn(() => true),
  requestIOSReview: jest.fn(() => true),
}));

const logEvent = jest.fn();
const clearMarketingCta = jest.fn();
const onRequestClose = jest.fn();

const marketingCta: MarketingCta = {
  campaignId: 'review-heavy-week',
  createdAt: new Date('2026-11-10T00:00:00.000Z'),
  variant: MarketingCtaVariant.AppStoreReview,
  flags: { title: '', ctaUrl: '', ctaText: '' },
};

const renderModal = (cta: MarketingCta = marketingCta) =>
  render(
    <TestBootProvider
      auth={{ user: loggedUser }}
      client={new QueryClient()}
      log={{ logEvent }}
    >
      <AppStoreReviewModal
        marketingCta={cta}
        ariaHideApp={false}
        isOpen
        onRequestClose={onRequestClose}
      />
    </TestBootProvider>,
  );

describe('AppStoreReviewModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(bootHook, 'useBoot').mockReturnValue({
      clearMarketingCta,
    } as unknown as ReturnType<typeof bootHook.useBoot>);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows the default copy and logs the impression', () => {
    renderModal();

    expect(
      screen.getByRole('heading', { name: appStoreReviewCopy.headline }),
    ).toBeInTheDocument();
    expect(screen.getByText(appStoreReviewCopy.text)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: appStoreReviewCopy.ctaLabel }),
    ).toHaveTextContent(appStoreReviewCopy.cta);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.AppStoreReview,
      target_id: marketingCta.campaignId,
    });
  });

  it('uses the campaign copy when Customer.io sets it', () => {
    renderModal({
      ...marketingCta,
      flags: {
        title: 'Thanks for staying with Plus',
        description: 'Glad to have you for another month.',
        ctaText: 'Leave a rating',
        ctaUrl: '',
      },
    });

    expect(
      screen.getByRole('heading', { name: 'Thanks for staying with Plus' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Glad to have you for another month.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: appStoreReviewCopy.ctaLabel }),
    ).toHaveTextContent('Leave a rating');
  });

  it('asks iOS for the rating pop-up after a pause, even once closed', () => {
    renderModal();

    expect(requestIOSReview).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole('button', { name: appStoreReviewCopy.dismiss }),
    );

    act(() => {
      jest.advanceTimersByTime(appStoreReviewRequestDelayMs);
    });

    expect(requestIOSReview).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.RequestAppStoreReview,
      target_type: TargetType.AppStoreReview,
      target_id: marketingCta.campaignId,
    });
  });

  it('opens the write-a-review screen from the CTA and clears the ask', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', { name: appStoreReviewCopy.ctaLabel }),
    );

    expect(openIOSWriteReview).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.AppStoreReview,
      target_id: marketingCta.campaignId,
    });
    expect(clearMarketingCta).toHaveBeenCalledWith(marketingCta.campaignId);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('clears the ask on not now without opening the store', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', { name: appStoreReviewCopy.dismiss }),
    );

    expect(openIOSWriteReview).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.AppStoreReview,
      target_id: marketingCta.campaignId,
    });
    expect(clearMarketingCta).toHaveBeenCalledWith(marketingCta.campaignId);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
