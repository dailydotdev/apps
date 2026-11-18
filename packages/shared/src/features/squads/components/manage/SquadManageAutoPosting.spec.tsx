import type { Squad } from '../../../../graphql/sources';
import {
  AutoPostingMethod,
  isAutoPostingIncluded,
} from './SquadManageAutoPosting';

const squadWith = (features: Partial<Squad['features']>): Squad =>
  ({ features }) as unknown as Squad;

const included = (squad: Squad) =>
  Object.values(AutoPostingMethod).filter((method) =>
    isAutoPostingIncluded(squad, method),
  );

describe('isAutoPostingIncluded', () => {
  it('includes nothing for a squad with no plan', () => {
    expect(included(squadWith({}))).toEqual([]);
  });

  it('includes only the API on a Startups plan', () => {
    expect(included(squadWith({ links: true, products: true }))).toEqual([
      AutoPostingMethod.Api,
    ]);
  });

  it('includes every method on Enterprise', () => {
    expect(
      included(squadWith({ verified: true, links: true, products: true })),
    ).toEqual([
      AutoPostingMethod.Api,
      AutoPostingMethod.Rss,
      AutoPostingMethod.Youtube,
      AutoPostingMethod.WebPage,
    ]);
  });
});
