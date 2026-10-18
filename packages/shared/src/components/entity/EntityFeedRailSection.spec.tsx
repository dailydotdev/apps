import React from 'react';
import { render, screen } from '@testing-library/react';
import { EntityFeedRailSection } from './EntityFeedRailSection';
import { OtherFeedPage } from '../../lib/query';

let mockIsEmpty = false;

jest.mock('../feeds/HorizontalFeed', () => ({
  __esModule: true,
  default: ({ emptyScreen }: { emptyScreen: React.ReactElement }) =>
    mockIsEmpty ? emptyScreen : <div data-testid="rail">posts</div>,
}));

const renderComponent = () =>
  render(
    <EntityFeedRailSection
      heading="Most upvoted posts from React"
      feedName={OtherFeedPage.SourceMostUpvoted}
      feedQueryKey={['sourceMostUpvoted']}
      query="query"
      variables={{}}
    />,
  );

describe('EntityFeedRailSection', () => {
  it('should render the heading when the feed has posts', () => {
    mockIsEmpty = false;
    renderComponent();
    const heading = screen.getByText('Most upvoted posts from React');
    expect(heading).toBeVisible();
    expect(screen.getByTestId('rail')).toBeInTheDocument();
  });

  it('should hide the whole section, heading included, when the feed is empty', () => {
    mockIsEmpty = true;
    renderComponent();
    const heading = screen.getByText('Most upvoted posts from React');
    expect(heading.closest('.hidden')).toBeInTheDocument();
  });
});
