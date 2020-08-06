import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import UserContext from '../components/UserContext';
import { LoggedUser } from '../lib/user';
import CommentActionButtons, {
  Props,
} from '../components/CommentActionButtons';

const renderLayout = (
  comment: Partial<Comment> = {},
  user: LoggedUser = null,
): RenderResult => {
  const props: Props = {
    comment: {
      id: 'c1',
      content: 'my comment',
      author: {
        image: 'https://daily.dev/ido.png',
        id: 'u1',
        name: 'Ido',
      },
      createdAt: new Date(),
      upvoted: false,
      permalink: 'https://daily.dev',
      ...comment,
    },
  };

  return render(
    <UserContext.Provider value={user}>
      <CommentActionButtons {...props} />
    </UserContext.Provider>,
  );
};

it('should not show menu when user is not the author', async () => {
  const res = renderLayout();
  expect(res.queryByTitle('Open menu')).toBeNull();
});

it('should show menu when user is not the author', async () => {
  const res = renderLayout(
    {},
    {
      id: 'u1',
      image: 'https://daily.dev/ido.png',
      providers: ['github'],
    },
  );
  expect(res.getByTitle('Open menu')).toBeDefined();
});
