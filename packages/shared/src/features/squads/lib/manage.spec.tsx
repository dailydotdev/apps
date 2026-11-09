import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import { getSquadManageGroups } from './manage';
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

  it('shows plan sections locked to editors of a squad with no plan', () => {
    const squad = squadWith([SourcePermissions.Edit]);

    expect(locked(squad)).toEqual([
      SquadManageSection.Products,
      SquadManageSection.Links,
      SquadManageSection.Intel,
    ]);
  });

  it('locks nothing for a squad on a plan', () => {
    const squad = {
      ...squadWith([SourcePermissions.Edit]),
      features: { links: true, products: true },
      currentMember: { permissions: [SourcePermissions.Edit], seat: true },
    } as unknown as Squad;

    expect(locked(squad)).toEqual([]);
  });
});
