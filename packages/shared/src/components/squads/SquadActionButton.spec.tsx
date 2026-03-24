import { QueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import type { Squad } from '../../graphql/sources';
import type { SourcesQueryData } from '../../hooks/source/useSources';
import { generateQueryKey, RequestKey } from '../../lib/query';
import {
  updateSquadDirectoryCache,
  updateSquadMembershipInListData,
} from './SquadActionButton';

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

describe('SquadActionButton cache helpers', () => {
  it('should update the matching squad without mutating unrelated nodes', () => {
    const squad = generateTestSquad();
    const otherSquad = generateTestSquad({
      id: 'other-squad',
      handle: 'other-squad',
      name: 'Other squad',
    });
    const data = createDirectoryData([squad, otherSquad]);

    const updatedData = updateSquadMembershipInListData(
      data,
      squad.id!,
      (currentSquad) => ({
        ...currentSquad,
        currentMember: undefined,
        membersCount: currentSquad.membersCount - 1,
      }),
    );

    expect(
      updatedData.pages[0].sources.edges[0].node.currentMember,
    ).toBeUndefined();
    expect(updatedData.pages[0].sources.edges[0].node.membersCount).toBe(
      squad.membersCount - 1,
    );
    expect(updatedData.pages[0].sources.edges[1].node).toEqual(otherSquad);
    expect(data.pages[0].sources.edges[0].node.currentMember).toEqual(
      squad.currentMember,
    );
  });

  it('should update every matching directory query, not just the first one', () => {
    const queryClient = new QueryClient();
    const squad = generateTestSquad();
    const firstCategoryKey = generateQueryKey(
      RequestKey.Sources,
      undefined,
      undefined,
      true,
      squad.category?.id,
      5,
    );
    const secondCategoryKey = generateQueryKey(
      RequestKey.Sources,
      undefined,
      undefined,
      true,
      squad.category?.id,
      10,
    );

    queryClient.setQueryData(firstCategoryKey, createDirectoryData([squad]));
    queryClient.setQueryData(secondCategoryKey, createDirectoryData([squad]));

    updateSquadDirectoryCache({
      queryClient,
      squadId: squad.id!,
      categoryId: squad.category?.id,
      updateSquad: (currentSquad): Squad => ({
        ...currentSquad,
        currentMember: undefined,
        membersCount: currentSquad.membersCount - 1,
      }),
    });

    expect(
      queryClient.getQueryData<InfiniteData<SourcesQueryData<Squad>>>(
        firstCategoryKey,
      )?.pages[0].sources.edges[0].node.currentMember,
    ).toBeUndefined();
    expect(
      queryClient.getQueryData<InfiniteData<SourcesQueryData<Squad>>>(
        secondCategoryKey,
      )?.pages[0].sources.edges[0].node.currentMember,
    ).toBeUndefined();
  });
});
