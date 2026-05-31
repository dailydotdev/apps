import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RelatedEntities } from '@dailydotdev/shared/src/components/RelatedEntities';
import { RequestKey, StaleTime } from '@dailydotdev/shared/src/lib/query';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import { TOP_CREATORS_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/users';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { UserIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TagSectionHeader } from './TagSectionHeader';

interface TagPeopleProps {
  tag: string;
  initialContributors?: UserShortProfile[];
}

/**
 * "Who shapes #{tag}" — groups the top sources covering a tag and the top
 * contributors writing about it under one section, so the people/origins of
 * the topic read as a single coherent block rather than two stray carousels.
 * Renders nothing if neither has data (and nothing is still loading).
 */
export function TagPeople({
  tag,
  initialContributors = [],
}: TagPeopleProps): ReactElement | null {
  const { data: sourcesData, isPending: sourcesPending } = useQuery({
    queryKey: [RequestKey.SourceByTag, null, tag],
    queryFn: async () =>
      gqlClient.request<{ sourcesByTag: Connection<Source> }>(
        SOURCES_BY_TAG_QUERY,
        { tag, first: 6 },
      ),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const { data: contributorsData, isPending: contributorsPending } = useQuery({
    queryKey: [RequestKey.TopCreatorsByTag, null, tag],
    queryFn: async () =>
      gqlClient.request<{ topCreatorsByTag: UserShortProfile[] }>(
        TOP_CREATORS_BY_TAG_QUERY,
        { tag, limit: 6 },
      ),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const sources =
    sourcesData?.sourcesByTag?.edges?.map((edge) => edge.node) ?? [];
  const contributors =
    contributorsData?.topCreatorsByTag ?? initialContributors;

  const isLoading = sourcesPending || contributorsPending;
  if (!isLoading && sources.length === 0 && contributors.length === 0) {
    return null;
  }

  return (
    <section className="flex scroll-mt-16 flex-col gap-3">
      <TagSectionHeader
        icon={<UserIcon size={IconSize.Medium} secondary />}
        title={`Who shapes #${tag}`}
        subtitle="The sources and developers driving the conversation."
      />
      <RelatedEntities
        isLoading={sourcesPending}
        items={sources.map((source) => ({
          id: source.id,
          image: source.image,
          imageAlt: `${source.name} logo`,
          name: source.name,
          permalink: source.permalink,
        }))}
        title="Top sources"
        className="mx-4 !mb-0"
      />
      <RelatedEntities
        isLoading={contributorsPending && initialContributors.length === 0}
        items={contributors.map((user) => ({
          id: user.id,
          image: user.image,
          imageAlt: `${user.name} avatar`,
          name: user.name,
          permalink: user.permalink,
        }))}
        title="Top contributors"
        className="mx-4 !mb-0"
      />
    </section>
  );
}
