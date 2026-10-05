import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import post from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import type { PostCardProps } from '../common/common';
import { visibleOnGroupHover } from '../common/common';
import { POST_FETCH_SMART_TITLE_QUERY, PostType } from '../../../graphql/posts';
import type { LoggedUser } from '../../../lib/user';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ArticleGrid } from './ArticleGrid';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../../__tests__/helpers/graphql';
import { ActionType } from '../../../graphql/actions';
import { USER_INTEGRATIONS } from '../../../graphql/users';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

const defaultProps: PostCardProps = {
  post,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(
    <TestBootProvider client={new QueryClient()}>
      <ArticleGrid {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

const videoPostTypeComponentProps = {
  post: { ...defaultProps.post, type: PostType.VideoYouTube },
};

it('should call on link click on component left click', async () => {
  renderComponent();
  const el = await screen.findByTitle('The Prosecutor’s Fallacy');
  el.click();
  await waitFor(() => expect(defaultProps.onPostClick).toBeCalled());
});

it('should call on read post link click on component middle mouse up', async () => {
  renderComponent();
  const el = await screen.findByText('Read post');
  el.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
  await waitFor(() =>
    expect(defaultProps.onReadArticleClick).toBeCalledTimes(1),
  );
});

it('should call on watch video link click on component middle mouse up', async () => {
  renderComponent(videoPostTypeComponentProps);
  const el = await screen.findByText('Watch video');
  el.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
  await waitFor(() =>
    expect(defaultProps.onReadArticleClick).toBeCalledTimes(1),
  );
});

it('should call on upvote click on upvote button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Upvote');
  el.click();
  await waitFor(() => expect(defaultProps.onUpvoteClick).toBeCalledWith(post));
});

it('should call on comment click on comment button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Comments');
  el.click();
  await waitFor(() => expect(defaultProps.onCommentClick).toBeCalledWith(post));
});

it('should call on share click on copy link button click', async () => {
  renderComponent({});
  const el = await screen.findByLabelText('Copy link');
  el.click();
  await waitFor(() => expect(defaultProps.onCopyLinkClick).toBeCalled());
});

it('should not display publication date createdAt is empty', async () => {
  renderComponent({
    ...defaultProps,
    post: { ...post, createdAt: undefined },
  });
  const el = screen.queryByText('Jun 13, 2018');
  expect(el).not.toBeInTheDocument();
});

it('should format publication date', async () => {
  renderComponent();
  const el = await screen.findByText('Jun 13, 2018');
  expect(el).toBeInTheDocument();
});

it('should format read time when available', async () => {
  renderComponent();
  const el = await screen.findByTestId('readTime');
  expect(el).toHaveTextContent('8m read time');
});

it('should change text to watch time when post type is video:youtube ', async () => {
  renderComponent(videoPostTypeComponentProps);
  const el = await screen.findByTestId('readTime');
  expect(el).toHaveTextContent('8m watch time');
});

it('should hide read time when not available', async () => {
  const usePost = { ...post };
  delete usePost.readTime;
  renderComponent({ post: usePost });
  expect(screen.queryByTestId('readTime')).not.toBeInTheDocument();
});

it('should show author image when available', async () => {
  renderComponent();
  const el = await screen.findByAltText("ido's profile");
  expect(el).toBeInTheDocument();
});

it('should show trending flag', async () => {
  const usePost = { ...post, trending: 20 };
  renderComponent({ post: usePost });
  expect(await screen.findByText('Trending now')).toBeInTheDocument();
});

it('should open the article when clicking the read post button', async () => {
  renderComponent();
  const read = await screen.findByText('Read post');
  fireEvent.click(read);
  expect(defaultProps.onReadArticleClick).toBeCalledTimes(1);
});

it('should open the video when clicking the watch video button', async () => {
  renderComponent(videoPostTypeComponentProps);
  const read = await screen.findByText('Watch video');
  fireEvent.click(read);
  expect(defaultProps.onReadArticleClick).toBeCalledTimes(1);
});

it('should show read post button on hover when in laptop size', async () => {
  renderComponent();
  const header = await screen.findByTestId('cardHeaderActions');
  expect(header).toHaveClass('flex');
  expect(header).toHaveClass(visibleOnGroupHover);
});

it('should show cover image when available', async () => {
  renderComponent();
  const image = await screen.findByAltText('Post Cover image');
  expect(image).toBeInTheDocument();
});

it('should show cover image with play icon when post is video:youtube type', async () => {
  renderComponent(videoPostTypeComponentProps);
  const image = await screen.findByTestId('playIconVideoPost');
  expect(image).toBeInTheDocument();
});

describe('copy link cover', () => {
  const renderCopied = (user?: LoggedUser): RenderResult => {
    const client = new QueryClient();
    client.setQueryData(
      generateQueryKey(RequestKey.PostActions, { id: post.id }),
      { interaction: 'copy', previousInteraction: 'none' },
    );
    mockGraphQL({
      request: { query: USER_INTEGRATIONS },
      result: { data: { userIntegrations: { pageInfo: {}, edges: [] } } },
    });

    return render(
      <TestBootProvider client={client} auth={{ user }}>
        <ArticleGrid {...defaultProps} />
      </TestBootProvider>,
    );
  };

  it('should offer Slack after copying', async () => {
    renderCopied(loggedUser);
    expect(await screen.findByText('Connect Slack')).toBeInTheDocument();
    expect(
      screen.queryByText('Why not share it on social, too?'),
    ).not.toBeInTheDocument();
  });

  it('should keep the social cover when logged out', async () => {
    renderCopied();
    expect(
      await screen.findByText('Why not share it on social, too?'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Connect Slack')).not.toBeInTheDocument();
  });
});

describe('clean title hint', () => {
  const clickbaitPost = { ...post, clickbaitTitleDetected: true };
  const originalTitle = post.title as string;
  const cleanTitle = 'What the prosecutor gets wrong about probability';

  const renderClickbait = (user: LoggedUser): RenderResult =>
    render(
      <TestBootProvider client={new QueryClient()} auth={{ user }}>
        <ArticleGrid {...defaultProps} post={clickbaitPost} />
      </TestBootProvider>,
    );

  it('should preview the clean title for a free reader without rewriting the card', async () => {
    mockGraphQL({
      request: {
        query: POST_FETCH_SMART_TITLE_QUERY,
        variables: { id: post.id },
      },
      result: { data: { fetchSmartTitle: { title: cleanTitle } } },
    });
    mockGraphQL(completeActionMock({ action: ActionType.FetchedSmartTitle }));
    renderClickbait({ ...loggedUser, isPlus: false });

    fireEvent.pointerEnter(screen.getByText(originalTitle));

    expect(await screen.findByText('Clean title by Plus')).toBeInTheDocument();
    expect(await screen.findByText(cleanTitle)).toBeInTheDocument();
    expect(screen.getByText('Get Plus')).toBeInTheDocument();
    expect(screen.getByText(originalTitle)).toBeInTheDocument();
  });

  it('should open the post when a free reader clicks the title', async () => {
    renderClickbait({ ...loggedUser, isPlus: false });

    screen.getByText(originalTitle).click();

    await waitFor(() => expect(defaultProps.onPostClick).toBeCalled());
  });

  it('should explain the used allowance instead of fetching', async () => {
    renderClickbait({ ...loggedUser, isPlus: false, clickbaitTries: 5 });

    fireEvent.pointerEnter(screen.getByText(originalTitle));

    expect(
      await screen.findByText(
        'You have seen 5 clean titles this month. Plus rewrites every one.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Clean title by Plus')).not.toBeInTheDocument();
  });

  it('should keep the plain title for a Plus member', async () => {
    renderClickbait({ ...loggedUser, isPlus: true });

    expect(screen.getByText(originalTitle).closest('a')).toBeNull();
  });
});
