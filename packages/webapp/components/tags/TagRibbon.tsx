import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '@dailydotdev/shared/src/lib/query';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getTagPageLink } from '@dailydotdev/shared/src/lib/links';

interface TagRibbonProps {
  tag: string;
  contributors: UserShortProfile[];
  relatedTags: { name?: string }[];
}

const Column = ({
  kicker,
  children,
}: {
  kicker: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <span className="uppercase tracking-widest text-text-quaternary typo-caption1">
      {kicker}
    </span>
    {children}
  </div>
);

const PersonRow = ({
  image,
  name,
  permalink,
  subtitle,
}: {
  image: string;
  name: string;
  permalink: string;
  subtitle?: string;
}): ReactElement => (
  <Link href={permalink} passHref prefetch={false}>
    <a className="flex items-center gap-2.5 text-text-secondary hover:text-text-primary">
      <img
        src={image}
        alt={name}
        className="size-7 shrink-0 rounded-full object-cover"
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-bold typo-footnote">{name}</span>
        {subtitle && (
          <span className="truncate text-text-quaternary typo-caption1">
            {subtitle}
          </span>
        )}
      </span>
    </a>
  </Link>
);

/**
 * Editorial "ribbon" — the people, sources, and adjacent topics around a tag,
 * presented as three lightweight columns inside a banded strip (kickers + thin
 * rules) rather than heavy cards. The supporting cast of the topic's front page.
 */
export function TagRibbon({
  tag,
  contributors,
  relatedTags,
}: TagRibbonProps): ReactElement | null {
  const { data: sourcesData } = useQuery({
    queryKey: [RequestKey.SourceByTag, null, tag],
    queryFn: async () =>
      gqlClient.request<{ sourcesByTag: Connection<Source> }>(
        SOURCES_BY_TAG_QUERY,
        { tag, first: 5 },
      ),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const sources =
    sourcesData?.sourcesByTag?.edges?.map((edge) => edge.node) ?? [];
  const people = contributors.slice(0, 5);
  const related = relatedTags
    .map((item) => item.name)
    .filter((name): name is string => !!name)
    .slice(0, 12);

  if (people.length === 0 && sources.length === 0 && related.length === 0) {
    return null;
  }

  return (
    <section className="mx-4 grid grid-cols-1 gap-x-8 gap-y-6 border-y border-border-subtlest-tertiary py-6 tablet:grid-cols-3">
      {people.length > 0 && (
        <Column kicker={`Voices in ${tag}`}>
          <div className="flex flex-col gap-2.5">
            {people.map((user) => (
              <PersonRow
                key={user.id}
                image={user.image}
                name={user.name}
                permalink={user.permalink}
                subtitle={user.username ? `@${user.username}` : undefined}
              />
            ))}
          </div>
        </Column>
      )}
      {sources.length > 0 && (
        <Column kicker="Top sources">
          <div className="flex flex-col gap-2.5">
            {sources.map((source) => (
              <PersonRow
                key={source.id}
                image={source.image}
                name={source.name}
                permalink={source.permalink}
                subtitle={source.handle ? `@${source.handle}` : undefined}
              />
            ))}
          </div>
        </Column>
      )}
      {related.length > 0 && (
        <Column kicker="Related desks">
          <ul className="flex flex-wrap gap-2">
            {related.map((name) => (
              <li key={name}>
                <Link href={getTagPageLink(name)} passHref prefetch={false}>
                  <a className="flex h-8 items-center rounded-10 bg-surface-float px-3 text-text-secondary typo-footnote hover:text-text-primary">
                    #{name}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </Column>
      )}
    </section>
  );
}
