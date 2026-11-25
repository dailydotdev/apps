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

  it('locks nothing on a community squad', () => {
    const squad = squadWith([SourcePermissions.Edit]);

    expect(lockedPlans(squad)).toEqual({});
  });

  it('shows every plan section locked to editors of a company page with no plan', () => {
    const squad = {
      ...squadWith([SourcePermissions.Edit]),
      flags: { company: true },
    } as unknown as Squad;

    // Links stays open: a free company page sets its website there
    expect(lockedPlans(squad)).toEqual({
      [SquadManageSection.Products]: SquadManageLockedPlan.Startups,
      [SquadManageSection.Jobs]: SquadManageLockedPlan.Enterprise,
      [SquadManageSection.Branding]: SquadManageLockedPlan.Enterprise,
      [SquadManageSection.Intel]: SquadManageLockedPlan.Startups,
      [SquadManageSection.Agent]: SquadManageLockedPlan.Startups,
    });
  });

  it('locks Enterprise sections for a squad on the Starter plan', () => {
    const squad = {
      ...squadWith([SourcePermissions.Edit]),
      features: { links: true, products: true },
      currentMember: { permissions: [SourcePermissions.Edit], seat: true },
    } as unknown as Squad;

    expect(lockedPlans(squad)).toEqual({
      [SquadManageSection.Jobs]: SquadManageLockedPlan.Enterprise,
      [SquadManageSection.Branding]: SquadManageLockedPlan.Enterprise,
    });
  });

  it('opens Branding for the header button on the Team plan', () => {
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

  it('opens Links to a company page with no plan, for its website', () => {
    const squad = {
      ...squadWith([SourcePermissions.Edit]),
      flags: { company: true },
    } as Squad;

    expect(sections(squad)).toContain(SquadManageSection.Links);
    expect(locked(squad)).not.toContain(SquadManageSection.Links);
  });

  it('opens Auto-posting to editors of a squad with no plan', () => {
    const squad = squadWith([SourcePermissions.Edit]);

    expect(sections(squad)).toContain(SquadManageSection.AutoPosting);
    expect(locked(squad)).not.toContain(SquadManageSection.AutoPosting);
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
