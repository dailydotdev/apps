import React from 'react';
import { render, RenderResult, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

import PostPage, { Props } from '../pages/posts/[id]';
import {
  CANCEL_UPVOTE_MUTATION,
  Post,
  POST_BY_ID_QUERY,
  PostData,
  UPVOTE_MUTATION,
} from '../graphql/posts';
import UserContext from '../components/UserContext';
import { POST_COMMENTS_QUERY, PostCommentsData } from '../graphql/comments';

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
        commentsPermalink: 'https://localhost:5002/posts/9CuRpr5NiEY5',
        ...data,
      },
    },
  },
});

const createCommentsMock = (): MockedResponse<PostCommentsData> => ({
  request: {
    query: POST_COMMENTS_QUERY,
    variables: {
      postId: '0e4005b2d3cf191f8c44c2718a457a1e',
    },
  },
  result: {
    data: {
      // TODO: something with MockProvider is wrong and it returns empty nodes even when mock is set
      postComments: {
        pageInfo: {},
        edges: [],
      },
    },
  },
});

const renderPost = (
  props: Partial<Props> = {},
  mocks: MockedResponse[] = [createPostMock(), createCommentsMock()],
): RenderResult => {
  const defaultProps: Props = {
    id: '0e4005b2d3cf191f8c44c2718a457a1e',
    initialApolloState: null,
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

  const user = props.user || defaultProps.user;

  return render(
    <MockedProvider addTypename={false} mocks={mocks}>
      <UserContext.Provider value={user}>
        <PostPage {...defaultProps} {...props} />
      </UserContext.Provider>
    </MockedProvider>,
  );
};

it('should show source image', async () => {
  const res = renderPost();
  const el = await res.findByAltText('Towards Data Science');
  expect(el).toHaveAttribute(
    'data-src',
    'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
  );
});

it('should show source name', async () => {
  const res = renderPost();
  await res.findByText('Towards Data Science');
});

it('should format publication date', async () => {
  const res = renderPost();
  await res.findByText('May 16, 2020');
});

it('should format read time when available', async () => {
  const res = renderPost();
  const el = await res.findByTestId('readTime');
  expect(el).toHaveTextContent('8m read time');
});

it('should hide read time when not available', async () => {
  const res = renderPost({}, [
    createPostMock({ readTime: null }),
    createCommentsMock(),
  ]);
  await res.findByText('May 16, 2020');
  expect(res.queryByTestId('readTime')).toBeNull();
});

it('should set href to the post permalink', async () => {
  const res = renderPost();
  // Wait for GraphQL to return
  await res.findByText('Learn SQL');
  const el = res.getByTitle('Go to article');
  expect(el).toHaveAttribute('href', 'http://localhost:4000/r/9CuRpr5NiEY5');
});

it('should show post title as heading', async () => {
  const res = renderPost();
  await res.findByText('Learn SQL');
});

it('should show post tags', async () => {
  const res = renderPost();
  await res.findByText('#development #data-science #sql');
});

it('should show post image and set placeholder', async () => {
  const res = renderPost();
  // Wait for GraphQL to return
  await res.findByText('Learn SQL');
  const el = await res.findByAltText('Post cover image');
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
    createCommentsMock(),
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
  const el = await res.findByText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation and set color on click', async () => {
  let mutationCalled = false;
  const res = renderPost({}, [
    createPostMock({ upvoted: true }),
    createCommentsMock(),
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
  const el = await res.findByText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should share article when share api is available', async () => {
  const mock = jest.fn();
  global.navigator.share = mock;
  mock.mockResolvedValue(null);
  const res = renderPost();
  // Wait for GraphQL to return
  await res.findByText('Learn SQL');
  const el = await res.findByText('Share');
  el.click();
  await waitFor(() =>
    expect(mock).toBeCalledWith({
      text: 'Learn SQL',
      url: 'https://localhost:5002/posts/9CuRpr5NiEY5',
    }),
  );
});
