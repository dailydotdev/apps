import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import AuthContext from '../components/AuthContext';
import { LoggedUser } from '../lib/user';
import SubComment, { Props } from '../components/SubComment';
import { MockedProvider } from '@apollo/client/testing';

const baseComment = {
  id: 'c1',
  content: 'my comment',
  author: {
    image: 'https://daily.dev/ido.png',
    id: 'u1',
    name: 'Ido',
  },
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
    firstComment: false,
  };

  return render(
    <MockedProvider addTypename={false} mocks={[]}>
      <AuthContext.Provider
        value={{ user, shouldShowLogin: false, showLogin: jest.fn() }}
      >
        <SubComment {...defaultProps} {...props} />
      </AuthContext.Provider>
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

it('should move timeline above profile picture when not first comment', async () => {
  const res = renderLayout();
  const el = await res.findByTestId('timeline');
  expect(el).toHaveStyleRule('top', '-1rem');
});

it('should move timeline to profile picture when first comment', async () => {
  const res = renderLayout({ firstComment: true });
  const el = await res.findByTestId('timeline');
  expect(el).toHaveStyleRule('top', '0');
});
