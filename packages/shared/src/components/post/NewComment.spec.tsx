import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { NewComment } from './NewComment';

const mockShowLogin = jest.fn();
const mockLogEvent = jest.fn();
const mockUser = {
  id: 'user-1',
  name: 'User',
  username: 'user',
  image: '',
  permalink: '#',
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    user: mockUser,
    showLogin: mockShowLogin,
  }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../contexts', () => ({
  useActiveFeedContext: () => ({ logOpts: undefined }),
}));

jest.mock('../../lib/feed', () => ({
  postLogEvent: jest.fn(() => ({ event_name: 'open comment' })),
}));

jest.mock('../ProfilePicture', () => ({
  ProfileImageSize: {
    Large: 'large',
    Medium: 'medium',
  },
  ProfilePicture: () => <span />,
  getProfilePictureClasses: () => '',
}));

jest.mock('../image/Image', () => ({
  Image: () => null,
}));

const CommentInputOrModal = ({
  inputId,
}: {
  inputId: string;
}): React.ReactElement => (
  <div data-testid="comment-input" id={inputId} tabIndex={-1} />
);

describe('NewComment', () => {
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  beforeEach(() => {
    jest.clearAllMocks();
    window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
      window.setTimeout(
        () => callback(0),
        0,
      )) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = ((id: number) =>
      window.clearTimeout(id)) as typeof window.cancelAnimationFrame;
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('focuses the composer input from the comment click handler', async () => {
    render(
      <NewComment
        post={{ id: 'post-1' } as never}
        CommentInputOrModal={CommentInputOrModal}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /share your thoughts/i }),
    );

    await waitFor(() => {
      expect(screen.getByTestId('comment-input')).toHaveFocus();
    });
  });
});
