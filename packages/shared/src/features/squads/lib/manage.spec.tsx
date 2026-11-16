import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourcePermissions } from '../../../graphql/sources';
import { getSquadManageGroups, SquadManageLockedPlan } from './manage';
import { SquadManageSection } from './routes';
import { SquadViewer } from './viewer';

const squadWith = (permissions: SourcePermissions[]): Squad =>
  ({
    features: {},
    moderationPostCount: 0,
    currentMember: { permissions },
  }) as unknown as Squad;

const sections = (squad: Squad) =>
  getSquadManageGroups(squad, SquadViewer.Admin).flatMap(({ items }) =>
    items.map(({ id }) => id),
  );

describe('getSquadManageGroups', () => {
  it('shows Plan to editors', () => {
    const squad = squadWith([SourcePermissions.Edit]);

    expect(sections(squad)).toContain(SquadManageSection.Plan);
  });

  it('hides Plan from staff who cannot edit the squad', () => {
    const squad = squadWith([SourcePermissions.ModeratePost]);

    expect(sections(squad)).not.toContain(SquadManageSection.Plan);
  });

  const locked = (squad: Squad) =>
    getSquadManageGroups(squad, SquadViewer.Admin)
      .flatMap(({ items }) => items)
      .filter(({ lockedPlan }) => !!lockedPlan)
      .map(({ id }) => id);

  const lockedPlans = (squad: Squad) =>
    Object.fromEntries(
      getSquadManageGroups(squad, SquadViewer.Admin)
        .flatMap(({ items }) => items)
        .filter(({ lockedPlan }) => !!lockedPlan)
        .map(({ id, lockedPlan }) => [id, lockedPlan]),
    );

  it('shows every plan section locked to editors of a squad with no plan', () => {
    const squad = squadWith([SourcePermissions.Edit]);

    expect(lockedPlans(squad)).toEqual({
      [SquadManageSection.Products]: SquadManageLockedPlan.Startups,
      [SquadManageSection.Jobs]: SquadManageLockedPlan.Enterprise,
      [SquadManageSection.Links]: SquadManageLockedPlan.Startups,
      [SquadManageSection.Branding]: SquadManageLockedPlan.Startups,
      [SquadManageSection.Intel]: SquadManageLockedPlan.Startups,
      [SquadManageSection.Agent]: SquadManageLockedPlan.Startups,
    });
  });

  it('locks only Enterprise sections for a squad on a Startups plan', () => {
    const squad = {
      ...squadWith([SourcePermissions.Edit]),
      features: { links: true, products: true, cta: true },
      currentMember: { permissions: [SourcePermissions.Edit], seat: true },
    } as unknown as Squad;

    expect(lockedPlans(squad)).toEqual({
      [SquadManageSection.Jobs]: SquadManageLockedPlan.Enterprise,
    });
  });

  it('locks nothing for an Enterprise squad', () => {
    const squad = {
      ...squadWith([SourcePermissions.Edit]),
      features: { verified: true, links: true, products: true, jobs: true },
      currentMember: { permissions: [SourcePermissions.Edit], seat: true },
    } as unknown as Squad;

    expect(locked(squad)).toEqual([]);
  });

  it('shows no locks to staff who cannot edit the squad', () => {
    const squad = squadWith([SourcePermissions.ModeratePost]);

    expect(locked(squad)).toEqual([]);
  });

  it('opens Agent and API to admins of a Startups plan squad', () => {
    const squad = {
      ...squadWith([SourcePermissions.Edit]),
      features: { links: true, products: true },
      currentMember: {
        permissions: [SourcePermissions.Edit],
        role: SourceMemberRole.Admin,
      },
    } as unknown as Squad;

    expect(sections(squad)).toContain(SquadManageSection.Agent);
  });
});
