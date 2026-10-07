import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';

export enum CommunityPackMemberType {
  Squad = 'squad',
  Source = 'source',
  User = 'user',
}

export interface CommunityPackMember {
  id: string;
  name: string;
  image: string;
  type: CommunityPackMemberType;
  // Squad members or source followers; people have none.
  membersCount?: number;
}

export interface CommunityPack {
  tag: string;
  title: string;
  members: CommunityPackMember[];
}

type PackSource = Pick<Source, 'name' | 'image' | 'type'> & {
  id: string;
  membersCount: number;
};

type PackPerson = Pick<UserShortProfile, 'id' | 'name' | 'image'>;

type TaggedSources = { edges: Array<{ node: PackSource }> };

type KeywordFlags = { flags?: { title?: string } | null };

type CommunityPacksData = Record<
  string,
  KeywordFlags | TaggedSources | PackSource[] | PackPerson[] | null
>;

const PACK_SLOTS = 3;
// A pack thinner than this reads as filler next to full ones.
const MIN_PACK_MEMBERS = 5;

const buildCommunityPacksQuery = (count: number): string => {
  const indexes = Array.from({ length: count }, (_, index) => index);
  const variables = indexes
    .map((index) => `$tag${index}: String!, $search${index}: String!`)
    .join(', ');
  const fields = indexes
    .map(
      (index) => `
    keyword${index}: keyword(value: $tag${index}) { flags { title } }
    tagged${index}: sourcesByTag(tag: $tag${index}, first: 20) {
      edges { node { ...PackSource } }
    }
    searched${index}: searchSources(query: $search${index}, limit: 10) {
      ...PackSource
    }
    people${index}: topCreatorsByTag(tag: $tag${index}, limit: 8) {
      id
      name
      image
    }`,
    )
    .join('');

  return `
  query CommunityPacks(${variables}) {${fields}
  }
  fragment PackSource on Source {
    id
    name
    image
    type
    membersCount
  }
`;
};

const toMember =
  (type: CommunityPackMemberType) =>
  (entity: PackSource | PackPerson): CommunityPackMember => ({
    id: entity.id,
    name: entity.name,
    image: entity.image,
    type,
    membersCount: 'membersCount' in entity ? entity.membersCount : undefined,
  });

const interleave = <T>(lists: T[][]): T[] =>
  Array.from(
    { length: Math.max(...lists.map((list) => list.length)) },
    (_, index) => lists.flatMap((list) => list[index] ?? []),
  ).flat();

// Each topic becomes one pack: its biggest Squads, its top publishers and its
// top writers. Anything an earlier pack already holds is left to that pack, so
// no two packs repeat the same faces.
export const buildCommunityPacks = (
  tags: string[],
  data: CommunityPacksData,
  limit: number,
): CommunityPack[] => {
  const used = new Set<string>();
  const take = (
    type: CommunityPackMemberType,
    candidates: Array<PackSource | PackPerson>,
  ): CommunityPackMember[] => {
    const picked = candidates
      .map(toMember(type))
      .filter((member) => !used.has(`${type}:${member.id}`))
      .slice(0, PACK_SLOTS);
    picked.forEach((member) => used.add(`${type}:${member.id}`));

    return picked;
  };

  return tags
    .map((tag, index) => {
      const tagged =
        (data[`tagged${index}`] as TaggedSources | null)?.edges.map(
          ({ node }) => node,
        ) ?? [];
      const searched = (data[`searched${index}`] as PackSource[] | null) ?? [];
      const squads = [
        ...new Map(
          [...searched, ...tagged]
            .filter(({ type }) => type === SourceType.Squad)
            .map((squad) => [squad.id, squad]),
        ).values(),
      ].sort((a, b) => b.membersCount - a.membersCount);
      const keyword = data[`keyword${index}`] as KeywordFlags | null;

      return {
        tag,
        title: keyword?.flags?.title || `#${tag}`,
        members: interleave([
          take(CommunityPackMemberType.Squad, squads),
          take(
            CommunityPackMemberType.Source,
            tagged.filter(({ type }) => type === SourceType.Machine),
          ),
          take(
            CommunityPackMemberType.User,
            (data[`people${index}`] as PackPerson[] | null) ?? [],
          ),
        ]),
      };
    })
    .filter(({ members }) => members.length >= MIN_PACK_MEMBERS)
    .slice(0, limit);
};

export const communityPacksQueryOptions = ({
  tags,
  limit,
}: {
  tags: string[];
  limit: number;
}) => ({
  queryKey: ['community_packs', null, { tags, limit }],
  queryFn: async () => {
    const variables = Object.fromEntries(
      tags.flatMap((tag, index) => [
        [`tag${index}`, tag],
        [`search${index}`, tag.replace(/-/g, ' ')],
      ]),
    );
    const data = await gqlClient.request<CommunityPacksData>(
      buildCommunityPacksQuery(tags.length),
      variables,
    );

    return buildCommunityPacks(tags, data, limit);
  },
  staleTime: StaleTime.OneHour,
  enabled: tags.length > 0,
});
