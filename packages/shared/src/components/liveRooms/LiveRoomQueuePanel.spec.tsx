import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import React from 'react';
import type { LiveRoomParticipantRecord } from '../../lib/liveRoom/protocol';
import type { UserShortProfile } from '../../lib/user';
import { LiveRoomQueuePanel } from './LiveRoomQueuePanel';

jest.mock('../ProfilePicture', () => ({
  ProfilePicture: () => <div>avatar</div>,
  ProfileImageSize: { Small: 'small' },
}));

jest.mock('../profile/ProfileTooltip', () => ({
  ProfileTooltip: (props: { children: ReactElement; userId: string }) => {
    const mockReact = jest.requireActual('react') as Pick<
      typeof React,
      'cloneElement'
    >;

    return mockReact.cloneElement(props.children, {
      'data-profile-tooltip-user-id': props.userId,
    });
  },
}));

const createdAt = '2026-05-12T10:00:00.000Z';

const participantProfile: UserShortProfile = {
  id: 'participant-1',
  name: 'Participant',
  username: 'participant',
  image: '',
  createdAt,
  reputation: 0,
  permalink: '/participant',
};

const createParticipant = (
  participantId: string,
  role: LiveRoomParticipantRecord['role'] = 'audience',
): LiveRoomParticipantRecord => ({
  participantId,
  role,
  sessionIds: [`session-${participantId}`],
  joinedAt: createdAt,
  updatedAt: createdAt,
});

const defaultProps = {
  tab: 'queue' as const,
  mode: 'moderated' as const,
  activeSpeakerParticipantIds: [],
  queuedParticipantIds: ['participant-1'],
  audienceParticipantIds: [],
  participantsById: {
    'participant-1': createParticipant('participant-1'),
  },
  participantProfilesById: new Map([['participant-1', participantProfile]]),
  coHostParticipantIds: [],
  canModerate: false,
  canManageCoHosts: false,
  stageLimit: null,
  moderationBusy: null,
  guardedModerationAction: jest.fn(async (_key, fn) => fn()),
  grantCoHost: jest.fn(),
  revokeCoHost: jest.fn(),
  promoteSpeaker: jest.fn(),
  removeSpeaker: jest.fn(),
  kickParticipant: jest.fn(),
};

const expectProfileLinks = (): void => {
  const nameLink = screen.getByRole('link', { name: '@participant' });
  expect(nameLink).toHaveAttribute('href', participantProfile.permalink);
  expect(nameLink).toHaveAttribute('target', '_blank');
  expect(nameLink).toHaveAttribute('rel', 'noopener noreferrer');
  expect(nameLink).toHaveAttribute(
    'data-profile-tooltip-user-id',
    participantProfile.id,
  );

  const avatarLink = screen.getByRole('link', {
    name: 'Open @participant profile',
  });
  expect(avatarLink).toHaveAttribute('href', participantProfile.permalink);
  expect(avatarLink).toHaveAttribute('target', '_blank');
  expect(avatarLink).toHaveAttribute('rel', 'noopener noreferrer');
  expect(avatarLink).toHaveAttribute(
    'data-profile-tooltip-user-id',
    participantProfile.id,
  );
};

describe('LiveRoomQueuePanel', () => {
  it('links and shows the profile tooltip on queued participant names and avatars', () => {
    render(<LiveRoomQueuePanel {...defaultProps} />);

    expectProfileLinks();
  });

  it('links and shows the profile tooltip on audience participant names and avatars', () => {
    render(
      <LiveRoomQueuePanel
        {...defaultProps}
        tab="audience"
        queuedParticipantIds={[]}
        audienceParticipantIds={['participant-1']}
      />,
    );

    expectProfileLinks();
  });
});
