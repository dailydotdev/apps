import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ExploreChipsBar } from '@dailydotdev/shared/src/components/feeds/ExploreChipsBar';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import {
  cardHandlers,
  exploreCategories,
} from '../../features/feed/feedHero.mocks';
import { realPosts } from '../realData';
import { isCardWidget } from './production';
import type { WidgetCategory, WidgetKind, WidgetSize } from './catalog';
import {
  sizeLabel,
  widgetCatalog,
  WidgetContent,
  WidgetSurface,
} from './catalog';

/** A feed of `columns` cards at its real width, the hero on top. */
export const HeroInFeed = ({
  columns,
  children,
  rows = 1,
  feedLabel,
}: {
  columns: number;
  children: ReactNode;
  rows?: number;
  /** A line above the tabs, for heroes that change what the feed is for. */
  feedLabel?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-6 rounded-24 border border-border-subtlest-quaternary bg-background-default p-6 [&_article]:!border-border-subtlest-quaternary">
    {children}
    {feedLabel}
    <ExploreChipsBar categories={exploreCategories} />
    <div
      className="grid gap-8"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {realPosts.slice(10, 10 + columns * rows).map((post) => (
        <ArticleGrid key={post.id} post={post} {...cardHandlers} />
      ))}
    </div>
  </div>
);

/** The way into edit mode: quiet until the hero is hovered, like a widget board. */
export const CustomizeButton = ({
  isEditing,
  onClick,
  className,
}: {
  isEditing?: boolean;
  onClick?: () => void;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'flex h-8 items-center gap-1.5 rounded-10 px-3 font-bold typo-footnote',
      isEditing
        ? 'bg-text-primary text-surface-invert'
        : 'bg-surface-float text-text-secondary hover:text-text-primary',
      className,
    )}
  >
    {isEditing ? (
      'Done'
    ) : (
      <>
        <EditIcon size={IconSize.Size16} />
        Customize
      </>
    )}
  </button>
);

const categoryOrder: WidgetCategory[] = [
  'News',
  'You',
  'Community',
  'daily.dev',
];

/** The add sheet: every widget, grouped, each with the sizes it comes in. */
export const WidgetGallery = ({
  onAdd,
  disabledReason,
  addedKinds = [],
  hiddenKinds = [],
  className,
}: {
  onAdd?: (kind: WidgetKind, size: WidgetSize) => void;
  /** Why adding is blocked, for the Limit strategy. */
  disabledReason?: string;
  /** Already on the rail: shown, but marked Added instead of addable. */
  addedKinds?: WidgetKind[];
  /** Not offered at all, e.g. the ad, which is ours. */
  hiddenKinds?: WidgetKind[];
  className?: string;
}): ReactElement => {
  const [selected, setSelected] = React.useState<
    Partial<Record<WidgetKind, WidgetSize>>
  >({});

  return (
    <div
      className={classNames(
        'flex flex-col gap-5 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-5',
        className,
      )}
    >
      <header className="flex items-center gap-2">
        <h3 className="font-bold text-text-primary typo-title3">
          Add a widget
        </h3>
        {disabledReason && (
          <span className="ml-auto rounded-8 bg-accent-bacon-flat px-2 py-1 text-accent-bacon-default typo-caption1">
            {disabledReason}
          </span>
        )}
      </header>
      {categoryOrder.map((category) => (
        <section key={category} className="flex flex-col gap-2">
          <h4 className="font-bold uppercase tracking-wider text-text-quaternary typo-caption2">
            {category}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(widgetCatalog)
              .filter(
                (def) =>
                  def.category === category && !hiddenKinds.includes(def.kind),
              )
              .map((def) => {
                const size = selected[def.kind] ?? def.sizes[0];
                return (
                  <div
                    key={def.kind}
                    className="flex flex-col gap-2 rounded-16 bg-surface-float p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary typo-footnote">
                        {def.name}
                      </span>
                      {def.isProposed && (
                        <span className="rounded-6 bg-accent-cabbage-flat px-1.5 text-accent-cabbage-default typo-caption2">
                          Idea
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-text-tertiary typo-caption1">
                      {def.description}
                    </p>
                    <div className="mt-auto flex items-center gap-1">
                      {def.sizes.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setSelected((current) => ({
                              ...current,
                              [def.kind]: option,
                            }))
                          }
                          className={classNames(
                            'h-6 rounded-8 px-2 typo-caption2',
                            option === size
                              ? 'bg-text-primary text-surface-invert'
                              : 'text-text-tertiary hover:bg-surface-hover',
                          )}
                        >
                          {sizeLabel[option]}
                        </button>
                      ))}
                      {addedKinds.includes(def.kind) ? (
                        <span className="ml-auto text-text-quaternary typo-caption1">
                          Added
                        </span>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Add ${def.name}`}
                          disabled={!!disabledReason || !onAdd}
                          onClick={() => onAdd?.(def.kind, size)}
                          className="ml-auto flex size-6 items-center justify-center rounded-8 bg-text-primary text-surface-invert disabled:opacity-40"
                        >
                          <PlusIcon size={IconSize.Size16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
};

/** A single widget at a given size, outside any shelf, for the catalog page. */
export const WidgetPreview = ({
  kind,
  size,
}: {
  kind: WidgetKind;
  size: WidgetSize;
}): ReactElement => {
  const width = size === 'w' || size === 'l' ? '36rem' : '17.25rem';
  const height = size === 'm' || size === 'l' ? '27.5rem' : '13.25rem';

  return (
    <div className="flex flex-col" style={{ width, height }}>
      <WidgetSurface className="flex-1" isBare={isCardWidget(kind, size)}>
        <WidgetContent kind={kind} size={size} />
      </WidgetSurface>
    </div>
  );
};
