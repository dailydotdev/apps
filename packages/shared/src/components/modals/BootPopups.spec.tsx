import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { Alerts } from '../../graphql/alerts';
import { UPDATE_ALERTS } from '../../graphql/alerts';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import type { MarketingCta } from '../marketing/cta/common';
import { MarketingCtaVariant } from '../marketing/cta/common';
import { LazyModal } from './common/types';
import { BootPopups } from './BootPopups';
import { useAppStoreReviewPrompt } from '../../hooks/useAppStoreReviewPrompt';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureFirstReputation } from '../../lib/featureManagement';

jest.mock('../../hooks/useAppStoreReviewPrompt', () => ({
  useAppStoreReviewPrompt: jest.fn(),
}));
jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));
jest.mock('../../hooks/useLazyModal', () => ({
  ...jest.requireActual('../../hooks/useLazyModal'),
  useLazyModal: jest.fn(),
}));

const openModal = jest.fn();

const reviewCta: MarketingCta = {
  campaignId: 'app_store_review_streak_5',
  createdAt: new Date('2026-11-19T00:00:00.000Z'),
  variant: MarketingCtaVariant.AppStoreReview,
  flags: { title: '', ctaUrl: '', ctaText: '' },
};

const plusCta: MarketingCta = {
  ...reviewCta,
  campaignId: 'app_store_review_plus_renewal',
  variant: MarketingCtaVariant.AppStoreReviewPlus,
};

const updateAlerts = jest.fn();

const renderComponent = (
  alerts: Partial<Alerts> = {},
  user: typeof loggedUser = loggedUser,
) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user }}
      alerts={{
        alerts: { filter: true, bootPopup: true, ...alerts },
        loadedAlerts: true,
        updateAlerts,
      }}
    >
      <BootPopups />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useConditionalFeature).mockImplementation(({ feature }) => ({
    value: feature === featureFirstReputation ? true : feature.defaultValue,
    isLoading: false,
  }));
  jest.mocked(useLazyModal).mockReturnValue({
    openModal,
    closeModal: jest.fn(),
    modal: null,
  } as unknown as ReturnType<typeof useLazyModal>);
});

describe('BootPopups App Store review ask', () => {
  it('opens the ask on load, like any marketing CTA popup', async () => {
    jest.mocked(useAppStoreReviewPrompt).mockReturnValue(reviewCta);
    renderComponent();

    await waitFor(() =>
      expect(openModal).toHaveBeenCalledWith({
        type: LazyModal.AppStoreReview,
        props: expect.objectContaining({ marketingCta: reviewCta }),
      }),
    );
  });

  it('opens the Plus thank-you for the Plus variant', async () => {
    jest.mocked(useAppStoreReviewPrompt).mockReturnValue(plusCta);
    renderComponent();

    await waitFor(() =>
      expect(openModal).toHaveBeenCalledWith({
        type: LazyModal.AppStoreReviewPlus,
        props: expect.objectContaining({ marketingCta: plusCta }),
      }),
    );
  });

  it('waits for the daily boot popup slot', async () => {
    jest.mocked(useAppStoreReviewPrompt).mockReturnValue(reviewCta);
    renderComponent({ bootPopup: false });

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(openModal).not.toHaveBeenCalled();
  });

  it('leaves the boot to the streak milestone modal', async () => {
    jest.mocked(useAppStoreReviewPrompt).mockReturnValue(reviewCta);
    renderComponent({ showStreakMilestone: true });

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(openModal).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: LazyModal.AppStoreReview }),
    );
  });

  it('opens nothing without an ask', async () => {
    jest.mocked(useAppStoreReviewPrompt).mockReturnValue(null);
    renderComponent();

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(openModal).not.toHaveBeenCalled();
  });
});

describe('BootPopups first reputation', () => {
  beforeEach(() => {
    jest.mocked(useAppStoreReviewPrompt).mockReturnValue(null);
  });

  it('opens the moment right away, outside the daily slot', async () => {
    renderComponent(
      { showFirstReputation: true, bootPopup: false },
      { ...loggedUser, reputation: 60 },
    );

    await waitFor(() =>
      expect(openModal).toHaveBeenCalledWith(
        expect.objectContaining({ type: LazyModal.FirstReputation }),
      ),
    );
  });

  it('leaves 250 to the privileges modal and clears the alert', async () => {
    mockGraphQL({
      request: {
        query: UPDATE_ALERTS,
        variables: { data: { showFirstReputation: false } },
      },
      result: { data: { updateUserAlerts: {} } },
    });
    renderComponent(
      { showFirstReputation: true },
      { ...loggedUser, reputation: 260 },
    );

    await waitForNock();
    expect(updateAlerts).toHaveBeenCalledWith(
      expect.objectContaining({ showFirstReputation: false }),
    );
    expect(openModal).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: LazyModal.FirstReputation }),
    );
  });

  it('waits for the rollout', async () => {
    jest.mocked(useConditionalFeature).mockImplementation(({ feature }) => ({
      value: feature.defaultValue,
      isLoading: false,
    }));
    renderComponent(
      { showFirstReputation: true },
      { ...loggedUser, reputation: 60 },
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(openModal).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: LazyModal.FirstReputation }),
    );
    expect(updateAlerts).not.toHaveBeenCalled();
  });
});
