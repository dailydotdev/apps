import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import ActionButtons from './ActionButtons';
import type { ActionButtonsVariant } from './ActionButtons';
import post from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';
import { useViewSize } from '../../../hooks/useViewSize';
import { featureCommentFirstAction } from '../../../lib/featureManagement';

jest.mock('../../../hooks/post/usePostImpressions', () => ({
  usePostImpressions: jest.fn(),
}));

// jsdom reports every media query as unmatched, so the viewport is forced:
// the award gate must behave the same on both sides of the laptop breakpoint.
jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('../../../hooks/useEngagementBarV2', () => ({
  useEngagementBarV2: jest.fn(),
}));

jest.mock('../../post/PostAwardAction', () => ({
  __esModule: true,
  default: () => <div data-testid="award-action" />,
}));

const mockImpressions = (enabled: boolean) =>
  jest.mocked(usePostImpressions).mockReturnValue({
    enabled,
    showImpressions: enabled,
    impressions: enabled ? 1000 : 0,
    canViewAnalytics: false,
    onImpressionsClick: jest.fn(),
  });

const renderComponent = (variant: ActionButtonsVariant) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ActionButtons post={post} variant={variant} />
    </TestBootProvider>,
  );

const variants: ActionButtonsVariant[] = ['grid', 'list', 'signal'];

describe.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])('ActionButtons (v2: %s, laptop: %s)', (isV2, isLaptop) => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useEngagementBarV2).mockReturnValue(isV2);
    jest.mocked(useViewSize).mockReturnValue(isLaptop);
  });

  it.each(variants)(
    'hides the award action on a %s card when impressions are enabled',
    (variant) => {
      mockImpressions(true);

      renderComponent(variant);

      expect(screen.queryByTestId('award-action')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Impressions' }),
      ).toBeInTheDocument();
    },
  );

  it.each(variants)(
    'keeps the award action on a %s card when impressions are disabled',
    (variant) => {
      mockImpressions(false);

      renderComponent(variant);

      expect(screen.getByTestId('award-action')).toBeInTheDocument();
    },
  );
});

describe('ActionButtons comment-first experiment', () => {
  const renderWithFlag = (isCommentFirst: boolean) => {
    const gb = new GrowthBook();
    gb.setFeatures({
      [featureCommentFirstAction.id]: { defaultValue: isCommentFirst },
    });

    return render(
      <TestBootProvider client={new QueryClient()} gb={gb}>
        <ActionButtons post={post} variant="grid" />
      </TestBootProvider>,
    );
  };

  const actionOrder = (container: HTMLElement) =>
    Array.from(
      container.querySelectorAll(
        `#post-${post.id}-upvote-btn, #post-${post.id}-comment-btn, #post-${post.id}-downvote-btn`,
      ),
    ).map((element) => element.id);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useEngagementBarV2).mockReturnValue(false);
    jest.mocked(useViewSize).mockReturnValue(false);
    mockImpressions(false);
  });

  it('keeps the control order when the flag is off', () => {
    const { container } = renderWithFlag(false);

    expect(actionOrder(container)).toEqual([
      `post-${post.id}-upvote-btn`,
      `post-${post.id}-comment-btn`,
      `post-${post.id}-downvote-btn`,
    ]);
  });

  it('moves the comment action first when the flag is on', () => {
    const { container } = renderWithFlag(true);

    expect(actionOrder(container)).toEqual([
      `post-${post.id}-comment-btn`,
      `post-${post.id}-upvote-btn`,
      `post-${post.id}-downvote-btn`,
    ]);
  });
});
