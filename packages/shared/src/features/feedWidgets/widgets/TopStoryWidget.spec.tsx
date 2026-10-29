import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import basePost from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { FEED_HERO_QUERY, baseFeedSupportedTypes } from '../../../graphql/feed';
import { useFeedLayout } from '../../../hooks/useFeedLayout';
import { FeedWidgetsProvider } from '../FeedWidgetsContext';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { TopStoryWidget } from './TopStoryWidget';
import { TOP_STORY_MODAL_FEED_NAME } from './useTopStoryPostModal';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../hooks/useFeedLayout', () => ({
  useFeedLayout: jest.fn(),
}));

const post = {
  ...basePost,
  id: 'top-story-1',
  slug: 'top-story-1-slug',
  title: 'The top story',
  commentsPermalink: '/posts/top-story-1-slug',
};

const push = jest.fn().mockResolvedValue(true);

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/my-feed',
        asPath: '/my-feed',
        query: {},
        push,
      } as unknown as NextRouter),
  );
  jest
    .mocked(useFeedLayout)
    .mockReturnValue({ shouldUseListFeedLayout: false } as ReturnType<
      typeof useFeedLayout
    >);
  mockGraphQL({
    request: {
      query: FEED_HERO_QUERY,
      variables: { loggedIn: false, supportedTypes: baseFeedSupportedTypes },
    },
    result: { data: { feedHero: { posts: [post], highlights: [] } } },
  });
});

const renderWidget = (size: FeedWidgetSize) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <FeedWidgetsProvider feedName="my-feed" isEditing={false}>
        <TopStoryWidget
          widget={{ id: 'w1', kind: FeedWidgetKind.TopStory, size }}
          size={size}
          isEditing={false}
          onConfigChange={() => false}
          canConfigure={false}
          isConfiguring={false}
          onConfigureEnd={() => undefined}
        />
      </FeedWidgetsProvider>
    </TestBootProvider>,
  );

const expectModalPush = () => {
  expect(push).toHaveBeenCalledTimes(1);
  const [url, as] = push.mock.calls[0];
  expect(url).toContain(`pmid=${post.slug}`);
  expect(url).toContain(`pmcid=${TOP_STORY_MODAL_FEED_NAME}`);
  expect(as).toMatch(new RegExp(`posts/${post.slug}$`));
};

describe('TopStoryWidget', () => {
  it('should open the post modal from the Large card', async () => {
    renderWidget(FeedWidgetSize.Large);

    fireEvent.click(await screen.findByRole('link', { name: post.title }));

    expectModalPush();
  });

  it('should open the post modal from the Small tile', async () => {
    renderWidget(FeedWidgetSize.Small);

    fireEvent.click(await screen.findByText(post.title));

    expectModalPush();
  });

  it('should leave a modified click on the Small tile to the link', async () => {
    renderWidget(FeedWidgetSize.Small);

    fireEvent.click(await screen.findByText(post.title), { metaKey: true });

    expect(push).not.toHaveBeenCalled();
  });

  it('should open the post page where the feed would not open a modal', async () => {
    jest
      .mocked(useFeedLayout)
      .mockReturnValue({ shouldUseListFeedLayout: true } as ReturnType<
        typeof useFeedLayout
      >);
    renderWidget(FeedWidgetSize.Large);

    fireEvent.click(await screen.findByRole('link', { name: post.title }));

    expect(push).toHaveBeenCalledWith(post.commentsPermalink);
  });
});
