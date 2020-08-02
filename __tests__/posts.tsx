import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { MockedResponse } from '@apollo/client/utilities/testing/mocking/mockLink';
import { act, render, RenderResult, waitFor } from '@testing-library/react';

import Post, { POST_BY_ID_QUERY, Props } from '../pages/posts/[id]';

const mocks: MockedResponse[] = [
  {
    request: {
      query: POST_BY_ID_QUERY,
      variables: { id: 'p1' },
    },
    result: {
      data: {
        post: {
          id: 'p1',
          title: 'My post',
          permalink: 'https://daily.dev',
          image: 'https://daily.dev/image.com',
        },
      },
    },
  },
];

const renderPost = (props: Partial<Props> = {}): RenderResult => {
  const defaultProps: Props = {
    id: 'p1',
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
    <MockedProvider mocks={mocks} addTypename={false}>
      <Post {...defaultProps} {...props} />
    </MockedProvider>,
  );
};

it('should be true', async () => {
  renderPost();
  // Let Apollo update the component
  await waitFor<void>(() =>
    act(() => new Promise((resolve) => setTimeout(resolve, 0))),
  );
  expect(true).toEqual(true);
});
