import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '@dailydotdev/shared/src/lib/query';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import { TOP_CREATORS_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/users';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { SourceIcon, UserIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { TagModule } from './TagModule';

interface TagPeopleProps {
  tag: string;
  initialContributors?: UserShortProfile[];
}

interface EntityRowProps {
  image: string;
  name: string;
  permalink: string;
  subtitle?: string;
}

const EntityRow = ({
  image,
  name,
  permalink,
  subtitle,
}: EntityRowProps): ReactElement => (
  <Link href={permalink} passHref prefetch={false}>
    <a className="-mx-2 flex items-center gap-3 rounded-10 px-2 py-2 transition-colors hover:bg-background-default">
      <img
        src={image}
        alt={`${name} logo`}
        className="size-8 shrink-0 rounded-full object-cover"
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-bold typo-footnote">{name}</span>
        {subtitle && (
          <span className="truncate text-text-tertiary typo-caption1">
            {subtitle}
          </span>
        )}
      </span>
    </a>
  </Link>
);

const RowsSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-3">
    {[0, 1, 2].map((index) => (
      <div key={index} className="flex items-center gap-3">
        <ElementPlaceholder className="size-8 rounded-full" />
        <ElementPlaceholder className="h-4 w-28 rounded-8" />
      </div>
    ))}
  </div>
);

/**
 * Top sources and top contributors as compact, uniform rows (avatar + name)
 * inside hub modules — replacing the old variable-width entity cards that
 * looked inconsistent. Each renders only when it has data.
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

  const showSources = sourcesPending || sources.length > 0;
  const showContributors =
    (contributorsPending && initialContributors.length === 0) ||
    contributors.length > 0;

  if (!showSources && !showContributors) {
    return null;
  }

  return (
    <>
      {showSources && (
        <TagModule
          title="Top sources"
          icon={<SourceIcon size={IconSize.Small} secondary />}
        >
          {sourcesPending && sources.length === 0 ? (
            <RowsSkeleton />
          ) : (
            <div className="flex flex-col gap-1">
              {sources.map((source) => (
                <EntityRow
                  key={source.id}
                  image={source.image}
                  name={source.name}
                  permalink={source.permalink}
                  subtitle={source.handle ? `@${source.handle}` : undefined}
                />
              ))}
            </div>
          )}
        </TagModule>
      )}
      {showContributors && (
        <TagModule
          title="Top contributors"
          icon={<UserIcon size={IconSize.Small} secondary />}
        >
          {contributorsPending && contributors.length === 0 ? (
            <RowsSkeleton />
          ) : (
            <div className="flex flex-col gap-1">
              {contributors.map((user) => (
                <EntityRow
                  key={user.id}
                  image={user.image}
                  name={user.name}
                  permalink={user.permalink}
                  subtitle={user.username ? `@${user.username}` : undefined}
                />
              ))}
            </div>
          )}
        </TagModule>
      )}
    </>
  );
}
