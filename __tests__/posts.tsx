import React from 'react';
import { render, RenderResult, waitFor } from '@testing-library/react';

import PostPage, { Props } from '../pages/posts/[id]';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import {
  CANCEL_UPVOTE_MUTATION,
  Post,
  POST_BY_ID_QUERY,
  PostData,
  UPVOTE_MUTATION,
} from '../graphql/posts';

const createPostMock = (
  data: Partial<Post> = {},
): MockedResponse<PostData> => ({
  request: {
    query: POST_BY_ID_QUERY,
    variables: {
      id: '0e4005b2d3cf191f8c44c2718a457a1e',
    },
  },
  result: {
    data: {
      post: {
        id: '0e4005b2d3cf191f8c44c2718a457a1e',
        __typename: 'PostPage',
        title: 'Learn SQL',
        permalink: 'http://localhost:4000/r/9CuRpr5NiEY5',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
        placeholder:
          'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAEAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAHBAAAgICAwAAAAAAAAAAAAAAAQIAAwQhERJx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwDGsKlTiWvywI6nXsn21qbXO9sYiIP/2Q==',
        createdAt: '2020-05-16T15:16:05.000Z',
        readTime: 8,
        tags: ['development', 'data-science', 'sql'],
        source: {
          __typename: 'Source',
          name: 'Towards Data Science',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
        },
        upvoted: false,
        commented: false,
        ...data,
      },
    },
  },
});

const renderPost = (
  props: Partial<Props> = {},
  mocks: MockedResponse[] = [createPostMock()],
): RenderResult => {
  const defaultProps: Props = {
    id: '0e4005b2d3cf191f8c44c2718a457a1e',
    initialApolloState: null,
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

  return render(
    <MockedProvider addTypename={false} mocks={mocks}>
      <PostPage {...defaultProps} {...props} />
    </MockedProvider>,
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
  const res = renderPost({}, [createPostMock({ readTime: null })]);
  await waitFor(() => res.getByText('May 16, 2020'));
  expect(res.queryByTestId('readTime')).toBeNull();
});

it('should set href to the post permalink', async () => {
  const res = renderPost();
  const el = await waitFor(() => res.getByRole('link'));
  expect(el).toHaveAttribute('href', 'http://localhost:4000/r/9CuRpr5NiEY5');
});

it('should show post title as heading', async () => {
  const res = renderPost();
  await waitFor(() => res.getByText('Learn SQL'));
});

it('should show post tags', async () => {
  const res = renderPost();
  await waitFor(() => res.getByText('#development #data-science #sql'));
});

it('should show post image and set placeholder', async () => {
  const res = renderPost();
  // Wait for GraphQL to return
  await waitFor(() => res.getByText('Learn SQL'));
  const el = await waitFor(() => res.getByAltText('Post cover image'));
  expect(el).toHaveAttribute(
    'data-src',
    'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
  );
  expect(el).toHaveAttribute(
    'data-lowsrc',
    'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAEAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAHBAAAgICAwAAAAAAAAAAAAAAAQIAAwQhERJx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwDGsKlTiWvywI6nXsn21qbXO9sYiIP/2Q==',
  );
});

it('should send upvote mutation and set button color on click', async () => {
  let mutationCalled = false;
  const res = renderPost({}, [
    createPostMock(),
    {
      request: {
        query: UPVOTE_MUTATION,
        variables: { id: '0e4005b2d3cf191f8c44c2718a457a1e' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await waitFor(() => res.getByText('Upvote'));
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation and set color on click', async () => {
  let mutationCalled = false;
  const res = renderPost({}, [
    createPostMock({ upvoted: true }),
    {
      request: {
        query: CANCEL_UPVOTE_MUTATION,
        variables: { id: '0e4005b2d3cf191f8c44c2718a457a1e' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await waitFor(() => res.getByText('Upvote'));
  el.click();
  await waitFor(() => mutationCalled);
});
