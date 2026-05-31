import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { WidgetCard } from '@dailydotdev/shared/src/components/widgets/WidgetCard';
import { RequestKey, StaleTime } from '@dailydotdev/shared/src/lib/query';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getTagPageLink } from '@dailydotdev/shared/src/lib/links';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { TagFaqItem } from './tagContent';

interface TagWidgetsProps {
  title: string;
  tag: string;
  description?: string;
  occurrences?: number;
  contributorsCount?: number;
  createdAt?: Date | string;
  contributors: UserShortProfile[];
  relatedTags: { name?: string }[];
  roadmap?: ReactNode;
  faqItems: TagFaqItem[];
}

const Stat = ({ value, label }: { value: string; label: string }) => (
  <span className="text-text-tertiary typo-footnote">
    <b className="text-text-primary">{value}</b> {label}
  </span>
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

const MiniLabel = ({ children }: { children: ReactNode }) => (
  <span className="uppercase tracking-widest text-text-quaternary typo-caption1">
    {children}
  </span>
);

/**
 * "Everything about the topic" — composed from native daily.dev widget cards:
 * an About card (definition, key stats, related topics, learning path), a
 * People & sources card, and an FAQ card. The supporting hub around the feed.
 */
export function TagWidgets({
  title,
  tag,
  description,
  occurrences,
  contributorsCount,
  createdAt,
  contributors,
  relatedTags,
  roadmap,
  faqItems,
}: TagWidgetsProps): ReactElement {
  const { data: sourcesData, isPending: sourcesPending } = useQuery({
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

  const year = createdAt ? new Date(createdAt).getFullYear() : undefined;
  const hasPeople = people.length > 0 || sources.length > 0 || sourcesPending;

  return (
    <div className="mx-4 grid grid-cols-1 gap-4 tablet:grid-cols-2">
      <WidgetCard heading={`About #${title}`} className="tablet:col-span-2">
        <div className="flex flex-col gap-4">
          {description && (
            <p className="text-text-secondary typo-body">{description}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {!!occurrences && occurrences > 0 && (
              <Stat
                value={largeNumberFormat(occurrences) ?? `${occurrences}`}
                label="posts"
              />
            )}
            {!!contributorsCount && contributorsCount > 0 && (
              <Stat value={`${contributorsCount}`} label="contributors" />
            )}
            {related.length > 0 && (
              <Stat value={`${related.length}`} label="related topics" />
            )}
            {!!year && !Number.isNaN(year) && (
              <Stat value={`${year}`} label="tracked since" />
            )}
          </div>
          {related.length > 0 && (
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
          )}
          {roadmap}
        </div>
      </WidgetCard>

      {hasPeople && (
        <WidgetCard heading="People & sources">
          <div className="flex flex-col gap-4">
            {people.length > 0 && (
              <div className="flex flex-col gap-3">
                <MiniLabel>Top contributors</MiniLabel>
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
            )}
            {sources.length > 0 && (
              <div className="flex flex-col gap-3">
                <MiniLabel>Top sources</MiniLabel>
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
            )}
          </div>
        </WidgetCard>
      )}

      {faqItems.length > 0 && (
        <WidgetCard heading={`${title} FAQ`}>
          <div className="-my-2 flex flex-col">
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group border-b border-border-subtlest-tertiary py-2 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold typo-footnote [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ArrowIcon
                    size={IconSize.Small}
                    className="shrink-0 rotate-180 text-text-tertiary transition-transform group-open:rotate-0"
                  />
                </summary>
                <p className="pt-1 text-text-tertiary typo-footnote">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </WidgetCard>
      )}
    </div>
  );
}
