import type { InfiniteData } from '@tanstack/react-query';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import type { Squad } from '../../graphql/sources';
import type { SourcesQueryData } from '../../hooks/source/useSources';
import { updateSquadMembershipInListData } from './SquadActionButton';

const createDirectoryData = (
  squads: Squad[],
): InfiniteData<SourcesQueryData<Squad>> => ({
  pages: [
    {
      sources: {
        edges: squads.map((squad) => ({ node: squad })),
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  ],
  pageParams: [''],
});

describe('updateSquadMembershipInListData', () => {
  it('should clear currentMember for the matching squad without mutating others', () => {
    const squad = generateTestSquad();
    const otherSquad = generateTestSquad({
      id: 'other-squad',
      handle: 'other-squad',
      name: 'Other squad',
    });
    const data = createDirectoryData([squad, otherSquad]);

    const updatedData = updateSquadMembershipInListData(
      data,
      squad.id,
      (currentSquad) => ({
        ...currentSquad,
        currentMember: null,
        membersCount: currentSquad.membersCount - 1,
      }),
    );

    expect(updatedData.pages[0].sources.edges[0].node.currentMember).toBeNull();
    expect(updatedData.pages[0].sources.edges[0].node.membersCount).toBe(
      squad.membersCount - 1,
    );
    expect(updatedData.pages[0].sources.edges[1].node).toEqual(otherSquad);
    expect(data.pages[0].sources.edges[0].node.currentMember).toEqual(
      squad.currentMember,
    );
  });
});
