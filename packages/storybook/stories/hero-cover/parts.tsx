import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FeedHeroCarousel } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroCarousel';
import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  cardHandlers,
  FeedHeroProviders,
  adWithoutCta,
  heroPosts,
} from '../features/feed/feedHero.mocks';
import type { AgentUpdate, Promo } from './data';
import { promos, toneClass } from './data';
import type { AgentChatVariant } from './agentChat';
import { AgentChatColumn } from './agentChat';
export type PromoVariant = 'tile' | 'art' | 'list';

/* ------------------------------------------------------------------ */
/* Page scaffold                                                       */
/* ------------------------------------------------------------------ */

export const Page = ({
  chapter,
  question,
  title,
  goal,
  metric,
  children,
}: {
  chapter: string;
  question: string;
  title: string;
  goal: string;
  metric: string;
  children: ReactNode;
}): ReactElement => (
  <FeedHeroProviders>
    <div className="min-h-screen bg-background-default p-4 tablet:p-6 laptop:p-10">
      <header className="mb-10 flex max-w-[48rem] flex-col gap-3">
        <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
          {chapter} · {question}
        </span>
        <h1 className="font-bold text-text-primary typo-title1">{title}</h1>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 typo-callout">
          <dt className="text-text-tertiary">Goal</dt>
          <dd className="text-text-secondary">{goal}</dd>
          <dt className="text-text-tertiary">Metric</dt>
          <dd className="text-text-secondary">{metric}</dd>
        </dl>
      </header>
      <div className="flex flex-col gap-14">{children}</div>
    </div>
  </FeedHeroProviders>
);

export const Case = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <div className="flex max-w-[56rem] flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
      {!!note && <p className="text-text-tertiary typo-callout">{note}</p>}
    </div>
    {children}
  </section>
);

/** A feed of `columns` cards at a typical window, scrolled sideways if the
 * Storybook canvas is narrower. */
export const Stage = ({
  columns,
  children,
}: {
  columns: HeroColumns;
  children: ReactNode;
}): ReactElement => (
  <div className="no-scrollbar overflow-x-auto">
    <div style={{ width: STAGE_WIDTH[columns] }}>{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export type HeroColumns = 1 | 2 | 3 | 4 | 5 | 6;

const STAGE_WIDTH: Record<HeroColumns, string> = {
  1: '23.4375rem',
  2: '48rem',
  3: '61.25rem',
  4: '78rem',
  5: '97.5rem',
  6: '121.75rem',
};

export const gridColsClass: Record<HeroColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

/** The carousel's paging controls under the featured card: the side columns
 * stop at the card's bottom edge, not the row's. */
const CARD_HEIGHT_CLASS = 'pb-12';

/* ------------------------------------------------------------------ */
/* Promo strip                                                         */
/* ------------------------------------------------------------------ */

const PromoBadge = ({ promo }: { promo: Promo }): ReactElement | null =>
  promo.badge ? (
    <span
      className={classNames(
        'rounded-6 px-1.5 font-bold text-text-primary typo-caption2',
        toneClass[promo.tone].subtle,
      )}
    >
      {promo.badge}
    </span>
  ) : null;

const PromoText = ({
  promo,
  titleClamp = 'line-clamp-2',
}: {
  promo: Promo;
  titleClamp?: string;
}): ReactElement => (
  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
    <span className="flex items-center gap-1.5">
      <span
        className={classNames(
          'truncate font-bold typo-caption1',
          toneClass[promo.tone].text,
        )}
      >
        {promo.eyebrow}
      </span>
      <PromoBadge promo={promo} />
    </span>
    <span
      className={classNames(
        'break-words font-bold text-text-primary typo-callout',
        titleClamp,
      )}
    >
      {promo.title}
    </span>
    <span className="truncate text-text-tertiary typo-caption1">
      {promo.meta}
    </span>
  </span>
);

/**
 * Its own bar, on the same flat surface as B, with the action spelled out under
 * the copy. One link for the whole bar: the button is what it looks like, the
 * bar is what it hits.
 */
const PromoTile = ({ promo }: { promo: Promo }): ReactElement => (
  <a
    href="#"
    className="group/promo flex min-h-0 flex-1 flex-col gap-2 overflow-hidden hero-card rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 transition-colors hover:border-border-subtlest-secondary"
  >
    <span className="flex min-h-0 items-start gap-3">
      <span
        className={classNames(
          'flex size-10 shrink-0 items-center justify-center rounded-12',
          toneClass[promo.tone].subtle,
        )}
      >
        {promo.icon(IconSize.Small)}
      </span>
      <PromoText promo={promo} titleClamp="line-clamp-1" />
    </span>
    <span className="ml-[3.25rem] mt-auto inline-flex h-7 items-center self-start rounded-10 border border-border-subtlest-secondary px-3 font-bold text-text-primary transition-colors typo-footnote group-hover/promo:bg-surface-hover">
      {promo.cta}
    </span>
  </a>
);

const PromoArt = ({ promo }: { promo: Promo }): ReactElement => (
  <a
    href="#"
    className="hero-card group/promo relative flex min-h-0 flex-1 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float transition-colors hover:border-border-subtlest-secondary"
  >
    <span className="flex min-w-0 flex-1 flex-col justify-center py-3 pl-4 pr-2">
      <PromoText promo={promo} />
    </span>
    <span
      className={classNames(
        'relative flex w-24 shrink-0 items-center justify-center overflow-hidden',
        toneClass[promo.tone].subtle,
      )}
    >
      {promo.image ? (
        <img
          src={promo.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover/promo:scale-105"
        />
      ) : (
        <span className="-rotate-12 transition-transform duration-300 group-hover/promo:rotate-0">
          {promo.icon(IconSize.XXLarge)}
        </span>
      )}
    </span>
  </a>
);

const PromoListRow = ({ promo }: { promo: Promo }): ReactElement => (
  <a
    href="#"
    className="relative flex min-h-0 flex-1 items-start gap-3 p-3 transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-border-subtlest-tertiary last:after:hidden hover:bg-surface-hover"
  >
    <span
      className={classNames(
        'relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-12',
        toneClass[promo.tone].subtle,
      )}
    >
      {promo.image ? (
        <img
          src={promo.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        promo.icon(IconSize.Medium)
      )}
    </span>
    <PromoText promo={promo} titleClamp="line-clamp-1" />
    <span className="flex h-6 shrink-0 items-center rounded-8 bg-surface-float px-2 font-bold text-text-primary typo-caption1">
      {promo.cta}
    </span>
  </a>
);

export const PromoStrip = ({
  variant,
  items = promos.slice(0, 3),
  direction = 'column',
  className,
}: {
  variant: PromoVariant;
  items?: Promo[];
  /** `row` runs the strip under the hero on narrow feeds; `scroll` is the
   * phone, where three bars side by side would each be too narrow to read. */
  direction?: 'column' | 'row' | 'scroll';
  className?: string;
}): ReactElement => {
  const isRow = direction === 'row';
  const directionClass = {
    column: 'flex-col',
    row: 'h-28 flex-row',
    scroll:
      'no-scrollbar h-28 snap-x flex-row overflow-x-auto [&>*]:w-64 [&>*]:flex-none [&>*]:snap-start',
  }[direction];

  if (variant === 'list') {
    return (
      <aside
        className={classNames(
          'hero-card flex min-h-0 min-w-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary',
          isRow ? 'h-20 flex-row' : 'flex-col',
          className,
        )}
      >
        {items.map((promo) => (
          <PromoListRow key={promo.id} promo={promo} />
        ))}
      </aside>
    );
  }

  const Item = variant === 'art' ? PromoArt : PromoTile;

  return (
    <aside
      className={classNames(
        'flex min-h-0 min-w-0 gap-3',
        directionClass,
        className,
      )}
    >
      {items.map((promo) => (
        <Item key={promo.id} promo={promo} />
      ))}
    </aside>
  );
};

/* ------------------------------------------------------------------ */
/* The cover                                                           */
/* ------------------------------------------------------------------ */

/**
 * Every widget in the row is one surface: the feed cards, the ad, the agent
 * chat and the promo bars all carry `hero-card`, and the row decides their
 * border and fill in one place, so they can never drift apart. A class
 * selector, so it outranks the feed frame's own `article` border rule.
 */
const HERO_CARD_CLASS = 'hero-card';
const HERO_CARD_BORDER_CLASS =
  '[&_.hero-card]:!border-border-subtlest-tertiary [&_.hero-card:hover]:!border-border-subtlest-secondary';
const HERO_CARD_FILLED_CLASS = '[&_.hero-card]:!bg-background-subtle';
const HERO_CARD_FLAT_CLASS = '[&_.hero-card]:!bg-transparent';

const heroCardProps = {
  ...cardHandlers,
  domProps: { className: HERO_CARD_CLASS },
};

const CardHeight = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    className={classNames('flex min-h-0 min-w-0 flex-col', CARD_HEIGHT_CLASS)}
  >
    {children}
  </div>
);

/** The feed's own ad card, so the slot reads as part of the grid. */
const AdColumn = (): ReactElement => (
  <CardHeight>
    <AdGrid
      ad={adWithoutCta}
      index={0}
      feedIndex={0}
      domProps={{ className: HERO_CARD_CLASS }}
    />
  </CardHeight>
);

export type HeroCoverProps = {
  columns?: HeroColumns;
  promoVariant?: PromoVariant;
  promoCount?: 3 | 4;
  agentVariant?: AgentChatVariant;
  /** No fills on the cards, borders only. */
  flat?: boolean;
  posts?: Post[];
  updates?: AgentUpdate[];
  /** Stories for the columns the row has left over, as feed cards. */
  sidePosts?: Post[];
};

/**
 * Featured card (2) · ad (1) · agent updates (1) · promo strip (1).
 * Narrower feeds drop the agent column first, then move the strip under the
 * row, then hand the ad back to the feed, so the featured card never shrinks
 * below two columns. A sixth column takes the next story as a feed card.
 */
export const HeroCover = ({
  columns = 5,
  promoVariant = 'tile',
  promoCount = 3,
  agentVariant = 'group',
  flat = false,
  posts = heroPosts,
  updates,
  sidePosts = [],
}: HeroCoverProps): ReactElement => {
  const items = promos.slice(0, promoCount);
  const hasAd = columns >= 3;
  const hasAgents = columns >= 5;
  const isStripInRow = columns >= 4;
  const spareColumns = Math.max(0, columns - 5);
  const surfaceClass = classNames(
    HERO_CARD_BORDER_CLASS,
    flat ? HERO_CARD_FLAT_CLASS : HERO_CARD_FILLED_CLASS,
  );

  if (columns === 1) {
    return (
      <div className={classNames('flex flex-col gap-4', surfaceClass)}>
        <FeedHeroCarousel posts={posts} layout="stacked" {...heroCardProps} />
        <PromoStrip variant={promoVariant} items={items} direction="scroll" />
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col gap-6', surfaceClass)}>
      <section
        className={classNames(
          'grid grid-rows-[27.5rem] gap-8',
          gridColsClass[columns],
        )}
      >
        <FeedHeroCarousel
          posts={posts}
          layout="wide"
          className="col-span-2"
          {...heroCardProps}
        />
        {hasAd && <AdColumn />}
        {hasAgents && (
          <CardHeight>
            <AgentChatColumn
              variant={agentVariant}
              updates={updates}
              className="flex-1"
            />
          </CardHeight>
        )}
        {isStripInRow && (
          <CardHeight>
            <PromoStrip
              variant={promoVariant}
              items={items}
              className="flex-1"
            />
          </CardHeight>
        )}
        {sidePosts.slice(0, spareColumns).map((post) => (
          <CardHeight key={post.id}>
            <ArticleGrid post={post} {...heroCardProps} />
          </CardHeight>
        ))}
      </section>
      {!isStripInRow && (
        <PromoStrip variant={promoVariant} items={items} direction="row" />
      )}
    </div>
  );
};
