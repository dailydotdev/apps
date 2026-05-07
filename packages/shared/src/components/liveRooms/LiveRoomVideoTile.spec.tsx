import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { LiveRoomVideoTile } from './LiveRoomVideoTile';

jest.mock('./useLiveRoomAudioLevel', () => ({
  SPEAKING_LEVEL_THRESHOLD: 0.5,
  useLiveRoomAudioLevel: () => 0,
}));

jest.mock('../../hooks', () => {
  const actual = jest.requireActual('../../hooks');
  return {
    ...actual,
    useViewSize: () => true,
  };
});

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: undefined, showLogin: jest.fn() }),
}));

jest.mock('../../hooks/contentPreference/useContentPreference', () => ({
  useContentPreference: () => ({
    follow: jest.fn(),
    unfollow: jest.fn(),
  }),
}));

jest.mock(
  '../../hooks/contentPreference/useContentPreferenceStatusQuery',
  () => ({
    useContentPreferenceStatusQuery: () => ({ data: undefined }),
  }),
);

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: jest.fn() }),
}));

jest.mock('./LiveRoomTileActions', () => ({
  LiveRoomTileActions: () => null,
}));

jest.mock('../ProfilePicture', () => ({
  ProfilePicture: ({ user }: { user: { name: string } }) => (
    <div>{user.name}</div>
  ),
  ProfileImageSize: {
    Small: 'small',
    XXLarge: 'xxlarge',
  },
}));

jest.mock('../drawers', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../tooltips/Portal', () => ({
  RootPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../hooks/useTouchLongPress', () => ({
  useTouchLongPress: () => ({
    onTouchStart: jest.fn(),
    onTouchEnd: jest.fn(),
    onTouchMove: jest.fn(),
    onTouchCancel: jest.fn(),
  }),
}));

const defaultUser = {
  id: 'user-1',
  username: 'user-1',
  name: 'User One',
  image: '',
  permalink: '/u/user-1',
  createdAt: '',
  reputation: 0,
};

describe('LiveRoomVideoTile', () => {
  it('unmutes the current speaker from the muted badge', () => {
    const onToggleSelfMute = jest.fn();

    render(
      <LiveRoomVideoTile
        stream={null}
        user={defaultUser}
        selfView
        isMuted
        onToggleSelfMute={onToggleSelfMute}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Unmute yourself' }));

    expect(onToggleSelfMute).toHaveBeenCalledTimes(1);
  });

  it('expands a short muted-by-user note for other speakers', () => {
    render(
      <LiveRoomVideoTile
        stream={null}
        user={defaultUser}
        isMuted
        selfView={false}
      />,
    );

    const mutedButton = screen.getByRole('button', { name: 'Muted by user' });

    expect(mutedButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(mutedButton);

    expect(mutedButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Muted by user')).toHaveAttribute(
      'aria-hidden',
      'false',
    );

    fireEvent.mouseLeave(mutedButton);

    expect(mutedButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Muted by user')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
