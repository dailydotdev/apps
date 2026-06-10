import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { DiscussIcon, TrendingIcon, UpvoteIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface TagBestOfShowcaseProps {
  tag: string;
  topPosts: ReactNode;
  mostUpvoted: ReactNode;
  bestDiscussed: ReactNode;
  className?: string;
}

type LensId = 'top' | 'upvoted' | 'discussed';

interface Lens {
  id: LensId;
  label: string;
  description: string;
  icon: ReactNode;
}

const lenses: Lens[] = [
  {
    id: 'top',
    label: 'Top posts',
    description: 'The broadest signal — start here to get oriented fast.',
    icon: <TrendingIcon size={IconSize.Size16} />,
  },
  {
    id: 'upvoted',
    label: 'Most upvoted',
    description: 'What the community decided was worth saving.',
    icon: <UpvoteIcon size={IconSize.Size16} />,
  },
  {
    id: 'discussed',
    label: 'Best discussed',
    description: 'The threads developers had the most to say about.',
    icon: <DiscussIcon size={IconSize.Size16} />,
  },
];

export const TagBestOfShowcase = ({
  tag,
  topPosts,
  mostUpvoted,
  bestDiscussed,
  className,
}: TagBestOfShowcaseProps): ReactElement => {
  const [active, setActive] = useState<LensId>('top');
  const activeLens = lenses.find((lens) => lens.id === active) ?? lenses[0];
  const railById: Record<LensId, ReactNode> = {
    top: topPosts,
    upvoted: mostUpvoted,
    discussed: bestDiscussed,
  };

  return (
    <section
      id="best-posts"
      className={classNames(
        'overflow-hidden rounded-16 border border-border-subtlest-tertiary',
        className,
      )}
    >
      <header className="flex flex-col gap-4 p-5 laptop:p-6">
        <div>
          <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
            The best of #{tag}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="mt-1"
          >
            {activeLens.description}
          </Typography>
        </div>
        <div
          role="tablist"
          aria-label="Choose how to explore the best posts"
          className="no-scrollbar flex gap-1 overflow-x-auto rounded-12 border border-border-subtlest-tertiary p-1"
        >
          {lenses.map((lens) => {
            const isActive = lens.id === active;
            return (
              <button
                key={lens.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(lens.id)}
                className={classNames(
                  'flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-10 px-3 py-2 font-bold transition-colors duration-200 typo-footnote',
                  isActive
                    ? 'bg-surface-float text-text-primary'
                    : 'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
                )}
              >
                <span
                  className={classNames(
                    isActive && 'text-accent-cabbage-default',
                  )}
                >
                  {lens.icon}
                </span>
                <span className="whitespace-nowrap">{lens.label}</span>
              </button>
            );
          })}
        </div>
      </header>
      <div className="border-t border-border-subtlest-tertiary py-5">
        {railById[active]}
      </div>
    </section>
  );
};
