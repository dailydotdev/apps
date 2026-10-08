import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourcePermissions } from '../../../graphql/sources';
import { verifyPermission } from '../../../graphql/squads';
import { moderationRequired } from '../../../components/squads/utils';

export enum SquadViewer {
  Anonymous = 'anonymous',
  Visitor = 'visitor',
  Member = 'member',
  Moderator = 'moderator',
  Admin = 'admin',
  Blocked = 'blocked',
}

const roleViewer: Partial<Record<SourceMemberRole, SquadViewer>> = {
  [SourceMemberRole.Admin]: SquadViewer.Admin,
  [SourceMemberRole.Moderator]: SquadViewer.Moderator,
  [SourceMemberRole.Member]: SquadViewer.Member,
  [SourceMemberRole.Blocked]: SquadViewer.Blocked,
};

export const getSquadViewer = (
  squad: Pick<Squad, 'currentMember'>,
  isLoggedIn: boolean,
): SquadViewer => {
  if (!isLoggedIn) {
    return SquadViewer.Anonymous;
  }

  const role = squad.currentMember?.role;

  return (role && roleViewer[role]) || SquadViewer.Visitor;
};

export const isJoinedViewer = (viewer: SquadViewer): boolean =>
  [SquadViewer.Member, SquadViewer.Moderator, SquadViewer.Admin].includes(
    viewer,
  );

export const isStaffViewer = (viewer: SquadViewer): boolean =>
  viewer === SquadViewer.Moderator || viewer === SquadViewer.Admin;

export const squadBlockedCopy = "You can't post in this Squad";

export interface SquadPostingState {
  canPost: boolean;
  reason?: string;
  isReviewed: boolean;
}

export const getSquadPostingState = (
  squad: Squad,
  viewer: SquadViewer,
): SquadPostingState => {
  if (viewer === SquadViewer.Blocked) {
    return { canPost: false, reason: squadBlockedCopy, isReviewed: false };
  }

  if (!isJoinedViewer(viewer)) {
    return {
      canPost: false,
      reason: 'Join the Squad to create new posts',
      isReviewed: false,
    };
  }

  if (verifyPermission(squad, SourcePermissions.Post)) {
    return { canPost: true, isReviewed: moderationRequired(squad) };
  }

  if (
    typeof squad.postingMinReputation === 'number' &&
    viewer === SquadViewer.Member
  ) {
    return {
      canPost: false,
      reason: `You need ${squad.postingMinReputation.toLocaleString(
        'en-US',
      )} reputation to post`,
      isReviewed: false,
    };
  }

  return {
    canPost: false,
    reason: 'Only admins and moderators can post',
    isReviewed: false,
  };
};
