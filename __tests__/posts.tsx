import React from 'react';
import { render, RenderResult, waitFor } from '@testing-library/react';

import Post, { Props } from '../pages/posts/[id]';
import {
  ApolloClient,
  ApolloProvider,
  from,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';

const createInitialState = (): NormalizedCacheObject => ({
  'Post:0e4005b2d3cf191f8c44c2718a457a1e': {
    id: '0e4005b2d3cf191f8c44c2718a457a1e',
    __typename: 'Post',
    title: 'Learn SQL & MongoDb Simultaneously — The Easy Way (Part 1)',
    permalink: 'http://localhost:4000/r/9CuRpr5NiEY5',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
    createdAt: '2020-05-16T15:16:05.000Z',
    readTime: 8,
    tags: ['development', 'data-science', 'sql'],
    source: {
      __typename: 'Source',
      name: 'Towards Data Science',
      image:
        'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
    },
  },
  ROOT_QUERY: {
    __typename: 'Query',
    'post({"id":"0e4005b2d3cf191f8c44c2718a457a1e"})': {
      __ref: 'Post:0e4005b2d3cf191f8c44c2718a457a1e',
    },
  },
});

const renderPost = (
  props: Partial<Props> = {},
  initialApolloState = createInitialState(),
): RenderResult => {
  const defaultProps: Props = {
    id: '0e4005b2d3cf191f8c44c2718a457a1e',
    initialApolloState: initialApolloState,
    isLoggedIn: true,
    user: {
      id: 'u1',
      name: 'Ido Shamun',
      providers: ['github'],
      email: 'ido@acme.com',
      image: 'https://daily.dev/ido.png',
      infoConfirmed: true,
      premium: false,
    },
  };

  const client = new ApolloClient({
    link: from([]),
    cache: new InMemoryCache(),
  });
  client.cache.restore(defaultProps.initialApolloState);

  return render(
    <ApolloProvider client={client}>
      <Post {...defaultProps} {...props} />
    </ApolloProvider>,
  );
};

it('should show source image', async () => {
  const res = renderPost();
  const el = await waitFor(() => res.getByAltText('Towards Data Science'));
  expect(el).toHaveAttribute(
    'data-src',
    'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
  );
});

it('should show source name', async () => {
  const res = renderPost();
  await waitFor(() => res.getByText('Towards Data Science'));
});

it('should format publication date', async () => {
  const res = renderPost();
  await waitFor(() => res.getByText('May 16, 2020'));
});

it('should format read time when available', async () => {
  const res = renderPost();
  const el = await waitFor(() => res.getByTestId('readTime'));
  expect(el).toHaveTextContent('8m read time');
});

it('should hide read time when not available', async () => {
  const state = createInitialState();
  state['Post:0e4005b2d3cf191f8c44c2718a457a1e'].readTime = null;
  const res = renderPost({}, state);
  await waitFor(() => res.getByText('May 16, 2020'));
  expect(res.queryByTestId('readTime')).toBeNull();
});

it('should set href to the post permalink', async () => {
  const res = renderPost();
  const el = await waitFor(() => res.getByRole('link'));
  expect(el).toHaveAttribute('href', 'http://localhost:4000/r/9CuRpr5NiEY5');
});
