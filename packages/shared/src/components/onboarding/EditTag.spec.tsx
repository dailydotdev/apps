import React from 'react';
import { render, screen } from '@testing-library/react';
import { EditTag } from './EditTag';
import type { FeedSettings } from '../../graphql/feedSettings';

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => ({ value: false, isLoading: false }),
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
  }) as FeedSettings;

const renderEditTag = (count: number, isOnboarding = true) =>
  render(
    <EditTag
      feedSettings={feedSettingsWith(count)}
      userId="u1"
      hidePreview
      isOnboarding={isOnboarding}
    />,
  );

describe('EditTag', () => {
  it('shows the onboarding headline without a progress bar', () => {
    renderEditTag(3);

    expect(
      screen.getByRole('heading', {
        name: 'Pick tags that are relevant to you',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows the plain headline outside onboarding', () => {
    renderEditTag(3, false);

    expect(
      screen.getByRole('heading', {
        name: 'Pick tags that are relevant to you',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
