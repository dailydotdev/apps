import type { ReactElement } from 'react';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { ContentEmbed, ContentEmbedPost } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { ContentEmbeds } from './ContentEmbeds';
import user from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { LoggedUser } from '../../lib/user';

const createPost = (
  overrides: Partial<ContentEmbedPost> = {},
): ContentEmbedPost => ({
  title: 'Embedded post',
  image: 'https://daily.dev/image.jpg',
  createdAt: new Date().toISOString(),
  readTime: 4,
  numUpvotes: 1200,
  numComments: 3,
  numReposts: 5,
  numAwards: 2,
  analytics: {
    impressions: 10,
  },
  type: PostType.Freeform,
  commentsPermalink: '/posts/p1',
  ...overrides,
});

const createEmbed = (post: ContentEmbedPost = createPost()): ContentEmbed => ({
  id: 'embed-1',
  referenceType: 'post',
  url: '/posts/p1',
  sortOrder: 0,
  post,
});

const renderComponent = (
  props: Partial<Parameters<typeof ContentEmbeds>[0]> = {},
): ReactElement => (
  <ContentEmbeds embeds={[createEmbed()]} variant="post" {...props} />
);

it('should render post metadata and engagement stats as passive metadata', () => {
  render(renderComponent());

  expect(screen.getByText('Now')).toBeInTheDocument();
  expect(screen.getByText('4m read time')).toBeInTheDocument();
  expect(screen.queryByText('10 Impressions')).not.toBeInTheDocument();
  expect(screen.getByText('1.2K Upvotes')).toBeInTheDocument();
  expect(screen.getByText('3 Comments')).toBeInTheDocument();
  expect(screen.getByText('5 Reposts')).toBeInTheDocument();
  expect(screen.getByText('2 Awards')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /upvotes/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /comments/i }),
  ).not.toBeInTheDocument();
});

it('should keep comment embeds compact while showing engagement stats', () => {
  render(renderComponent({ variant: 'comment' }));

  expect(screen.getByText('Now')).toBeInTheDocument();
  expect(screen.getByText('4m read time')).toBeInTheDocument();
  expect(screen.getByText('1.2K Upvotes')).toBeInTheDocument();
  expect(screen.getByText('3 Comments')).toBeInTheDocument();
});

it('should open embedded post links in a new tab', () => {
  render(renderComponent());

  expect(screen.getByRole('link', { name: /Embedded post/i })).toHaveAttribute(
    'target',
    '_blank',
  );
});

it('should reuse collection metadata for source count', () => {
  render(
    renderComponent({
      embeds: [
        createEmbed(
          createPost({
            type: PostType.Collection,
            numCollectionSources: 12,
          }),
        ),
      ],
    }),
  );

  expect(screen.getByText('12 sources')).toBeInTheDocument();
});

it('should reuse poll metadata for vote count', () => {
  render(
    renderComponent({
      embeds: [
        createEmbed(
          createPost({
            type: PostType.Poll,
            readTime: undefined,
            numPollVotes: 15,
          }),
        ),
      ],
    }),
  );

  expect(screen.getByText('Voting open')).toBeInTheDocument();
  expect(screen.getByText('15 votes')).toBeInTheDocument();
  expect(screen.queryByText('4m read time')).not.toBeInTheDocument();
});

describe('embedded post impressions', () => {
  const renderWithViewer = (loggedUser?: LoggedUser) =>
    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ user: loggedUser, isLoggedIn: !!loggedUser }}
      >
        <ContentEmbeds
          embeds={[createEmbed(createPost({ author: { id: user.id } }))]}
          variant="post"
        />
      </TestBootProvider>,
    );

  it('shows the count to the author', () => {
    renderWithViewer(user);

    expect(screen.getByText('10 Impressions')).toBeInTheDocument();
  });

  it('hides the count from another reader', () => {
    renderWithViewer({ ...user, id: 'someone-else' });

    expect(screen.queryByText('10 Impressions')).not.toBeInTheDocument();
  });

  it('hides the count from an anonymous reader', () => {
    renderWithViewer();

    expect(screen.queryByText('10 Impressions')).not.toBeInTheDocument();
  });

  it('keeps the analytics link out of the passive row', () => {
    renderWithViewer(user);

    expect(
      screen.queryByRole('link', { name: 'Post analytics' }),
    ).not.toBeInTheDocument();
  });
});
