import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SparkleIcon } from '../icons';
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

export const TagBestOfShowcase = ({
  tag,
  topPosts,
  mostUpvoted,
  bestDiscussed,
  className,
}: TagBestOfShowcaseProps): ReactElement => (
  <section
    id="best-posts"
    className={classNames(
      'shadow-1 mb-6 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-primary py-5',
      className,
    )}
  >
    <div className="mx-4 mb-5 flex flex-col gap-2 laptop:mx-6">
      <span className="flex w-fit items-center gap-1.5 rounded-full bg-accent-cheese-subtlest px-3 py-1 font-bold text-accent-cheese-default typo-caption1">
        <SparkleIcon size={IconSize.Size16} />
        Editor scan
      </span>
      <Typography tag={TypographyTag.H2} type={TypographyType.Title2} bold>
        Best of #{tag}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-[42rem]"
      >
        Start with the strongest posts, then compare what the community upvoted
        and debated.
      </Typography>
    </div>
    <div className="flex flex-col">
      <div id="top-posts">{topPosts}</div>
      <div id="upvoted-posts">{mostUpvoted}</div>
      <div id="discussed-posts">{bestDiscussed}</div>
    </div>
  </section>
);
