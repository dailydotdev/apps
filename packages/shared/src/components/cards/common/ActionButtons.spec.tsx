import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import ActionButtons from './ActionButtons';
import type { ActionButtonsVariant } from './ActionButtons';
import post from '../../../../__tests__/fixture/post';
import type { AuthContextData } from '../../../contexts/AuthContext';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';
import { featureListCardLargeActions } from '../../../lib/featureManagement';

jest.mock('../../../hooks/post/usePostImpressions', () => ({
  usePostImpressions: jest.fn(),
}));

jest.mock('../../../hooks/useEngagementBarV2', () => ({
  useEngagementBarV2: jest.fn(),
}));

const mockImpressions = (impressions: number) =>
  jest.mocked(usePostImpressions).mockReturnValue({
    showImpressions: impressions > 0,
    impressions,
    canViewAnalytics: false,
    onImpressionsClick: jest.fn(),
  });

const renderComponent = (variant: ActionButtonsVariant) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ActionButtons post={post} variant={variant} />
    </TestBootProvider>,
  );

const variants: ActionButtonsVariant[] = ['grid', 'list'];

describe.each([false, true])('ActionButtons (v2: %s)', (isV2) => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useEngagementBarV2).mockReturnValue(isV2);
  });

  it.each(variants)('shows the impressions stat on a %s card', (variant) => {
    mockImpressions(1000);

    renderComponent(variant);

    expect(
      screen.getByRole('button', { name: 'Impressions' }),
    ).toBeInTheDocument();
  });

  it.each(variants)(
    'hides the impressions stat on a %s card without impressions',
    (variant) => {
      mockImpressions(0);

      renderComponent(variant);

      expect(
        screen.queryByRole('button', { name: 'Impressions' }),
      ).not.toBeInTheDocument();
    },
  );
});

describe('list_card_large_actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useEngagementBarV2).mockReturnValue(false);
    mockImpressions(1000);
  });

  const flagged = (isEnabled: boolean) => {
    const gb = new GrowthBook();
    gb.setFeatures({
      [featureListCardLargeActions.id]: { defaultValue: isEnabled },
    });
    return gb;
  };

  const renderWithFlag = (
    variant: ActionButtonsVariant,
    gb: GrowthBook,
    auth: Partial<AuthContextData> = { user: loggedUser },
  ): void => {
    render(
      <TestBootProvider client={new QueryClient()} gb={gb} auth={auth}>
        <ActionButtons post={post} variant={variant} />
      </TestBootProvider>,
    );
  };

  const upvote = () => document.querySelector(`#post-${post.id}-upvote-btn`);

  it('keeps list cards at 24px in the control arm', () => {
    renderWithFlag('list', flagged(false));

    expect(upvote()).not.toHaveClass('h-8');
  });

  it('renders list cards at 32px in the treatment, bookmark in the bar', () => {
    renderWithFlag('list', flagged(true));

    expect(upvote()).toHaveClass('h-8');
    expect(
      screen.getByRole('button', { name: 'Bookmark' }),
    ).toBeInTheDocument();
  });

  it('is never evaluated by grid cards', () => {
    const gb = flagged(true);
    const evaluate = jest.spyOn(gb, 'getFeatureValue');
    renderWithFlag('grid', gb);

    expect(evaluate).not.toHaveBeenCalledWith(
      featureListCardLargeActions.id,
      expect.anything(),
    );
  });

  it('is never evaluated for logged-out readers', () => {
    const gb = flagged(true);
    const evaluate = jest.spyOn(gb, 'getFeatureValue');
    renderWithFlag('list', gb, { user: undefined, isLoggedIn: false });

    expect(upvote()).not.toHaveClass('h-8');
    expect(evaluate).not.toHaveBeenCalledWith(
      featureListCardLargeActions.id,
      expect.anything(),
    );
  });
});
