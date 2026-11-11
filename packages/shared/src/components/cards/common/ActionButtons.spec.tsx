import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ActionButtons from './ActionButtons';
import type { ActionButtonsVariant } from './ActionButtons';
import post from '../../../../__tests__/fixture/post';
import type { AuthContextData } from '../../../contexts/AuthContext';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';

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

describe('ActionButtons list card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useEngagementBarV2).mockReturnValue(false);
    mockImpressions(1000);
  });

  const renderList = (auth: Partial<AuthContextData>): void => {
    render(
      <TestBootProvider client={new QueryClient()} auth={auth}>
        <ActionButtons post={post} variant="list" />
      </TestBootProvider>,
    );
  };

  const upvote = () => document.querySelector(`#post-${post.id}-upvote-btn`);

  it('renders list cards at 32px, bookmark in the bar', () => {
    renderList({ user: loggedUser });

    expect(upvote()).toHaveClass('h-8');
    expect(
      screen.getByRole('button', { name: 'Bookmark' }),
    ).toBeInTheDocument();
  });

  it('renders list cards at 32px for logged-out readers', () => {
    renderList({ user: undefined, isLoggedIn: false });

    expect(upvote()).toHaveClass('h-8');
  });
});
