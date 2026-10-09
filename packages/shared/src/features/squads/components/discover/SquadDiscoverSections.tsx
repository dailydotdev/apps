import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { Squad, SourceCategory } from '../../../../graphql/sources';
import { squadCategoryPreviewQueryOptions } from '../../../../graphql/squads';
import {
  getFlatteredSources,
  useSources,
} from '../../../../hooks/source/useSources';
import Link from '../../../../components/utilities/Link';
import { Image, ImageType } from '../../../../components/image/Image';
import {
  Typography,
  TypographyTag,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { PlaceholderSquadList } from '../../../../components/cards/squad/PlaceholderSquadList';
import { SquadWidget } from '../widgets/SquadWidget';
import { SquadDiscoverRow } from './SquadDiscoverRow';
import type { usePromotedSquad } from './usePromotedSquad';
import {
  POPULAR_SQUADS_LIMIT,
  isBrowsableSquad,
  popularSquadsQuery,
  withPromotedSlot,
} from './common';

export const SquadSectionHeader = ({
  title,
  subtitle,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}): ReactElement => (
  <header className={classNames('flex flex-col gap-0.5', className)}>
    <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
      {title}
    </Typography>
    {subtitle && (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {subtitle}
      </Typography>
    )}
  </header>
);

const usePopularSquads = (
  excludeIds: (string | undefined)[] = [],
): { squads: Squad[]; isFetched: boolean } => {
  const { result } = useSources<Squad>({ query: popularSquadsQuery });

  return {
    squads: getFlatteredSources(result).filter(
      (squad) => isBrowsableSquad(squad) && !excludeIds.includes(squad.id),
    ),
    isFetched: result.isFetched,
  };
};

// The biggest squads across daily.dev in three columns from laptop; phones
// keep the first four.
export const PopularSquads = ({
  promoted,
  excludeIds,
}: {
  promoted: ReturnType<typeof usePromotedSquad>;
  /** Squads another section on the page already shows. */
  excludeIds?: (string | undefined)[];
}): ReactElement => {
  const { squads, isFetched } = usePopularSquads(excludeIds);
  const slots = withPromotedSlot(squads, promoted).slice(
    0,
    POPULAR_SQUADS_LIMIT,
  );
  const isLoading = !isFetched || promoted.isLoading;

  return (
    <section className="flex flex-col">
      <SquadSectionHeader
        title="Popular Squads"
        subtitle="Most members across daily.dev"
        className="mb-2"
      />
      <ul className="grid grid-cols-1 gap-x-8 laptop:grid-flow-col laptop:grid-cols-3 laptop:grid-rows-3">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index} className="py-2">
                <PlaceholderSquadList />
              </li>
            ))
          : slots.map(({ squad, ad }, index) => (
              <li
                key={squad.id}
                className={classNames(index >= 4 && 'hidden laptop:block')}
              >
                <SquadDiscoverRow squad={squad} ad={ad} />
              </li>
            ))}
      </ul>
    </section>
  );
};

export const PopularSquadsWidget = ({
  excludeIds,
}: {
  excludeIds?: (string | undefined)[];
}): ReactElement | null => {
  const { squads } = usePopularSquads(excludeIds);

  if (!squads.length) {
    return null;
  }

  return (
    <SquadWidget title="Popular Squads">
      <div className="mt-2 flex flex-col">
        {squads.slice(0, 5).map((squad) => (
          <SquadDiscoverRow key={squad.id} squad={squad} />
        ))}
      </div>
    </SquadWidget>
  );
};

const TopicTile = ({
  category,
}: {
  category: SourceCategory;
}): ReactElement => {
  const { data: squads = [] } = useQuery(
    squadCategoryPreviewQueryOptions(category.id),
  );
  const path = `/squads/discover/${category.slug}`;

  return (
    <Link href={path} passHref>
      <a
        href={path}
        className="flex min-h-28 flex-col justify-between gap-3 rounded-16 bg-surface-float p-4 transition-colors hover:bg-surface-hover"
      >
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Body}
          className="tablet:typo-title3"
          bold
        >
          {category.title}
        </Typography>
        <span className="flex min-h-7 flex-row-reverse justify-end pl-2">
          {squads
            .slice()
            .reverse()
            .map((squad) => (
              <Image
                key={squad.id}
                src={squad.image}
                alt={`${squad.name} source`}
                type={ImageType.Squad}
                className="-ml-2 size-7 shrink-0 rounded-full object-cover ring-2 ring-background-default"
              />
            ))}
        </span>
      </a>
    </Link>
  );
};

export const SquadTopicTiles = ({
  categories,
}: {
  categories: SourceCategory[];
}): ReactElement => (
  <section className="flex flex-col">
    <SquadSectionHeader title="Browse by topic" className="mb-3" />
    <div className="grid grid-cols-2 gap-3 laptop:grid-cols-4">
      {categories.map((category) => (
        <TopicTile key={category.id} category={category} />
      ))}
    </div>
  </section>
);
