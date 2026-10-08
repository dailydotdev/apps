import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import type { SourceMember, Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourcePermissions } from '../../../graphql/sources';
import { getSquadPostingState, getSquadViewer, SquadViewer } from './viewer';

const squadWith = (
  role: SourceMemberRole | undefined,
  permissions: SourcePermissions[] = [],
  props: Partial<Squad> = {},
): Squad => {
  const squad = generateTestSquad(props);

  return {
    ...squad,
    currentMember: role
      ? ({ ...squad.currentMember, role, permissions } as SourceMember)
      : undefined,
  };
};

describe('getSquadViewer', () => {
  it.each([
    [undefined, false, SquadViewer.Anonymous],
    [undefined, true, SquadViewer.Visitor],
    [SourceMemberRole.Member, true, SquadViewer.Member],
    [SourceMemberRole.Moderator, true, SquadViewer.Moderator],
    [SourceMemberRole.Admin, true, SquadViewer.Admin],
    [SourceMemberRole.Blocked, true, SquadViewer.Blocked],
  ])('maps role %s (logged in %s) to %s', (role, isLoggedIn, viewer) => {
    expect(getSquadViewer(squadWith(role), isLoggedIn)).toBe(viewer);
  });
});

describe('getSquadPostingState', () => {
  const state = (squad: Squad) =>
    getSquadPostingState(squad, getSquadViewer(squad, true));

  it('asks a visitor to join', () => {
    expect(state(squadWith(undefined))).toEqual({
      canPost: false,
      reason: 'Join the Squad to create new posts',
      isReviewed: false,
    });
  });

  it('tells a blocked member they lost access', () => {
    expect(state(squadWith(SourceMemberRole.Blocked))).toMatchObject({
      canPost: false,
      reason: "You can't post in this Squad",
    });
  });

  it('keeps members out when only moderators post', () => {
    expect(state(squadWith(SourceMemberRole.Member))).toMatchObject({
      canPost: false,
      reason: 'Only admins and moderators can post',
    });
  });

  it('names the reputation a member is missing', () => {
    const squad = squadWith(SourceMemberRole.Member, [], {
      postingMinReputation: 250,
    });

    expect(state(squad)).toMatchObject({
      canPost: false,
      reason: 'You need 250 reputation points to post',
    });
  });

  it('marks a member post as reviewed when approval is required', () => {
    const squad = squadWith(SourceMemberRole.Member, [SourcePermissions.Post], {
      moderationRequired: true,
    });

    expect(state(squad)).toEqual({ canPost: true, isReviewed: true });
  });

  it('never reviews a moderator post', () => {
    const squad = squadWith(
      SourceMemberRole.Moderator,
      [SourcePermissions.Post, SourcePermissions.ModeratePost],
      { moderationRequired: true },
    );

    expect(state(squad)).toEqual({ canPost: true, isReviewed: false });
  });
});
