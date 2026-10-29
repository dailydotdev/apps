import React from 'react';
import { render, screen } from '@testing-library/react';
import { EditTag } from './EditTag';
import type { FeedSettings } from '../../graphql/feedSettings';
import { featureOnboardingTagProgress } from '../../lib/featureManagement';

const mockFeatures = new Map<unknown, boolean>();

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: ({
    feature,
    shouldEvaluate,
  }: {
    feature: unknown;
    shouldEvaluate?: boolean;
  }) => ({
    value: shouldEvaluate !== false && !!mockFeatures.get(feature),
    isLoading: false,
  }),
}));

jest.mock('../tags/TagSelection', () => ({
  TagSelection: () => <div />,
}));

jest.mock('../../hooks/useTagSearch', () => ({
  useTagSearch: () => ({ data: undefined }),
}));

const feedSettingsWith = (count: number) =>
  ({
    includeTags: Array.from({ length: count }, (_, index) => `tag-${index}`),
  } as FeedSettings);

const renderEditTag = (
  count: number,
  isOnboarding = true,
  requiredTags?: number,
) =>
  render(
    <EditTag
      feedSettings={feedSettingsWith(count)}
      userId="u1"
      hidePreview
      isOnboarding={isOnboarding}
      requiredTags={requiredTags}
    />,
  );

describe('EditTag tag progress experiment', () => {
  beforeEach(() => mockFeatures.clear());

  it('keeps the production headline without a progress bar in control', () => {
    renderEditTag(3);

    expect(
      screen.getByRole('heading', {
        name: 'Pick tags that are relevant to you',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows the progress header in the experiment', () => {
    mockFeatures.set(featureOnboardingTagProgress, true);
    renderEditTag(3);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '30',
    );
    expect(screen.getByText('Pick 2 more tags to get started.')).toBeVisible();
  });

  it('never shows the progress header outside onboarding', () => {
    mockFeatures.set(featureOnboardingTagProgress, true);
    renderEditTag(3, false);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it.each([
    [5, 'Keep tuning your feed', 'Pick 5 more tags for a smarter feed.'],
    [10, 'Your feed is getting smarter', 'Pick 10 more tags to dial it in.'],
    [20, 'Your feed is dialed in', 'Add tags to fine-tune.'],
  ])('moves to the next headline at %i tags', (count, headline, guidance) => {
    mockFeatures.set(featureOnboardingTagProgress, true);
    renderEditTag(count);

    expect(screen.getByRole('heading', { name: headline })).toBeVisible();
    expect(screen.getByText(guidance)).toBeVisible();
  });

  it('follows the funnel minimum instead of a fixed five tags', () => {
    mockFeatures.set(featureOnboardingTagProgress, true);
    renderEditTag(3, true, 3);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    expect(
      screen.getByRole('heading', { name: 'Keep tuning your feed' }),
    ).toBeVisible();
    expect(
      screen.getByText('Pick 7 more tags for a smarter feed.'),
    ).toBeVisible();
  });

  it('shows the step headline in full on first paint', () => {
    mockFeatures.set(featureOnboardingTagProgress, true);
    renderEditTag(0);

    expect(
      screen.getByText('Pick tags that are relevant to you', {
        selector: 'span:not(.invisible)',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pick 5 tags to get started.')).toBeVisible();
  });
});
