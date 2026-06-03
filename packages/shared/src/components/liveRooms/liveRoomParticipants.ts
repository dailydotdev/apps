import type { UserShortProfile } from '../../lib/user';
import {
  anonymousDisplayName,
  anonymousHandle,
} from '../../lib/liveRoom/anonymousName';

export const userDisplayName = (
  user: Pick<UserShortProfile, 'username'>,
): string => `@${user.username}`;

export const buildParticipantProfile = (
  participantId: string,
): UserShortProfile => ({
  id: participantId,
  name: anonymousDisplayName(participantId),
  username: anonymousHandle(participantId),
  image: '',
  createdAt: '',
  reputation: 0,
  permalink: '',
});
