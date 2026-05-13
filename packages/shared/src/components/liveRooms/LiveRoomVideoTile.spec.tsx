import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
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

jest.mock('../profile/ProfileTooltip', () => ({
  ProfileTooltip: (props: {
    children: ReactElement;
    initialUser?: { name: string };
    userId: string;
  }) => {
    const mockReact = jest.requireActual('react') as Pick<
      typeof React,
      'cloneElement'
    >;

    return mockReact.cloneElement(props.children, {
      'data-profile-tooltip-user-id': props.userId,
      'data-profile-tooltip-user-name': props.initialUser?.name,
    });
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
  it('shows the profile tooltip on linked speaker names', () => {
    render(
      <LiveRoomVideoTile stream={null} user={defaultUser} selfView={false} />,
    );

    expect(
      screen.getByRole('link', { name: defaultUser.name }),
    ).toHaveAttribute('href', defaultUser.permalink);
    expect(
      screen.getByRole('link', { name: defaultUser.name }),
    ).toHaveAttribute('data-profile-tooltip-user-id', defaultUser.id);
    expect(
      screen.getByRole('link', { name: defaultUser.name }),
    ).toHaveAttribute('data-profile-tooltip-user-name', defaultUser.name);
  });

  it('does not show the profile tooltip on speaker names without profile links', () => {
    const user = { ...defaultUser, permalink: '' };

    render(<LiveRoomVideoTile stream={null} user={user} selfView={false} />);

    expect(
      screen.getByText(user.name, { selector: 'span' }),
    ).not.toHaveAttribute('data-profile-tooltip-user-id');
  });

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
