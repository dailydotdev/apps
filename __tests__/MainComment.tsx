import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import UserContext from '../components/UserContext';
import { LoggedUser } from '../lib/user';
import MainComment, { Props } from '../components/MainComment';
import { MockedProvider } from '@apollo/client/testing';

const author = {
  image: 'https://daily.dev/ido.png',
  id: 'u1',
  name: 'Ido',
};

const baseComment = {
  id: 'c1',
  content: 'my comment',
  author: author,
  createdAt: new Date(2017, 1, 10, 0, 0),
  upvoted: false,
  permalink: 'https://daily.dev',
};

const renderLayout = (
  props: Partial<Props> = {},
  user: LoggedUser = null,
): RenderResult => {
  const defaultProps: Props = {
    comment: baseComment,
  };

  return render(
    <MockedProvider addTypename={false} mocks={[]}>
      <UserContext.Provider value={user}>
        <MainComment {...defaultProps} {...props} />
      </UserContext.Provider>
    </MockedProvider>,
  );
};

it('should show author profile image', async () => {
  const res = renderLayout();
  const el = await res.findByAltText(`Ido's profile image`);
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
});

it('should show author name', async () => {
  const res = renderLayout();
  await res.findByText('Ido');
});

it('should show formatted comment date', async () => {
  const res = renderLayout();
  await res.findByText('Feb 10, 2017');
});

it('should show comment content', async () => {
  const res = renderLayout();
  await res.findByText('my comment');
});

it('should have no subcomments', async () => {
  renderLayout();
  expect(screen.queryAllByTestId('subcomment').length).toEqual(0);
});

it('should have subcomments', async () => {
  renderLayout({
    comment: {
      ...baseComment,
      children: {
        pageInfo: {},
        edges: [
          {
            node: {
              ...baseComment,
              id: 'c2',
            },
            cursor: '',
          },
        ],
      },
    },
  });
  expect(screen.queryAllByTestId('subcomment').length).toEqual(1);
});
