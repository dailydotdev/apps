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
import {
  appStoreReviewCopy,
  appStoreReviewRequestDelayMs,
} from '../appStoreReview/common';
import PlusRenewalReviewModal, {
  plusRenewalCopy,
} from './PlusRenewalReviewModal';

jest.mock('../../lib/ios', () => ({
  ...jest.requireActual('../../lib/ios'),
  openIOSWriteReview: jest.fn(() => true),
  requestIOSReview: jest.fn(() => true),
}));

const logEvent = jest.fn();
const clearMarketingCta = jest.fn();
const onRequestClose = jest.fn();

const marketingCta: MarketingCta = {
  campaignId: 'review-plus-renewal',
  createdAt: new Date('2026-11-10T00:00:00.000Z'),
  variant: MarketingCtaVariant.AppStoreReviewPlus,
  flags: { title: '', ctaUrl: '', ctaText: '' },
};

const renderModal = (cta: MarketingCta = marketingCta) =>
  render(
    <TestBootProvider
      auth={{ user: { ...loggedUser, isPlus: true } }}
      client={new QueryClient()}
      log={{ logEvent }}
    >
      <PlusRenewalReviewModal
        marketingCta={cta}
        ariaHideApp={false}
        isOpen
        onRequestClose={onRequestClose}
      />
    </TestBootProvider>,
  );

describe('PlusRenewalReviewModal', () => {
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

  it('thanks the member and asks for a rating', () => {
    renderModal();

    expect(
      screen.getByRole('heading', { name: plusRenewalCopy.headline }),
    ).toBeInTheDocument();
    expect(screen.getByText(plusRenewalCopy.text)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: appStoreReviewCopy.ctaLabel }),
    ).toHaveTextContent(appStoreReviewCopy.cta);
    expect(
      screen.queryByRole('button', { name: /gift/i }),
    ).not.toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.AppStoreReview,
      target_id: marketingCta.campaignId,
    });

    act(() => {
      jest.advanceTimersByTime(appStoreReviewRequestDelayMs);
    });

    expect(requestIOSReview).toHaveBeenCalledTimes(1);
  });

  it('uses the campaign copy when Customer.io sets it', () => {
    renderModal({
      ...marketingCta,
      flags: {
        title: 'One year of Plus',
        description: 'Thanks for a whole year with us.',
        ctaText: '',
        ctaUrl: '',
      },
    });

    expect(
      screen.getByRole('heading', { name: 'One year of Plus' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Thanks for a whole year with us.'),
    ).toBeInTheDocument();
  });

  it('opens the write-a-review screen from the CTA', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', { name: appStoreReviewCopy.ctaLabel }),
    );

    expect(openIOSWriteReview).toHaveBeenCalledTimes(1);
    expect(clearMarketingCta).toHaveBeenCalledWith(marketingCta.campaignId);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('goes back to the feed without rating', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: plusRenewalCopy.back }));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.AppStoreReview,
      target_id: marketingCta.campaignId,
    });
    expect(clearMarketingCta).toHaveBeenCalledWith(marketingCta.campaignId);
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(openIOSWriteReview).not.toHaveBeenCalled();
  });
});
