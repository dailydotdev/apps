import { renderHook } from '@testing-library/react';
import type { Squad } from '../../../graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { useComposerAudience } from './useComposerAudience';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const squad = (id: string, overrides: Partial<Squad> = {}): Squad =>
  ({
    id,
    handle: id,
    name: id,
    type: SourceType.Squad,
    active: true,
    currentMember: {
      role: SourceMemberRole.Member,
      permissions: [SourcePermissions.Post],
    },
    ...overrides,
  }) as Squad;

const companyPage = (role: SourceMemberRole) =>
  squad('acme', {
    flags: { company: true } as Squad['flags'],
    currentMember: { role, permissions: [SourcePermissions.Post] },
  } as Partial<Squad>);

const renderAudience = (
  squads: Squad[],
  {
    isTeamMember = false,
    initialSquadHandle = undefined as string | undefined,
  } = {},
) => {
  jest.mocked(useAuthContext).mockReturnValue({
    user: { ...loggedUser, isTeamMember },
    squads,
  } as unknown as ReturnType<typeof useAuthContext>);

  return renderHook(() => useComposerAudience(initialSquadHandle)).result
    .current.selectedIds;
};

describe('useComposerAudience', () => {
  it('starts on the profile when the user runs no company page', () => {
    expect(renderAudience([squad('friends')])).toEqual([loggedUser.id]);
  });

  it('starts on the company page its admin runs', () => {
    expect(
      renderAudience([squad('friends'), companyPage(SourceMemberRole.Admin)]),
    ).toEqual(['acme']);
  });

  it('keeps the profile for a company page member who is not an admin', () => {
    expect(renderAudience([companyPage(SourceMemberRole.Moderator)])).toEqual([
      loggedUser.id,
    ]);
  });

  it('keeps the profile for daily.dev team members', () => {
    expect(
      renderAudience([companyPage(SourceMemberRole.Admin)], {
        isTeamMember: true,
      }),
    ).toEqual([loggedUser.id]);
  });

  it('prefers the squad the composer was opened on', () => {
    expect(
      renderAudience([squad('friends'), companyPage(SourceMemberRole.Admin)], {
        initialSquadHandle: 'friends',
      }),
    ).toEqual(['friends']);
  });
});
