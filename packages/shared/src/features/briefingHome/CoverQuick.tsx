import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  ArrowIcon,
  StarIcon,
  UpvoteIcon,
  DiscussIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { QuickHit } from './types';

interface CoverQuickProps {
  quickHits: QuickHit[];
  readSet: Set<string>;
  onRead: (id: string) => void;
}

const eyebrowTokenFor = (eyebrow: string): string => {
  const key = eyebrow.toLowerCase();
  if (key.includes('tool')) {
    return 'bg-accent-bun-float text-accent-bun-default';
  }
  if (key.includes('release') || key.includes('ship')) {
    return 'bg-accent-avocado-float text-accent-avocado-default';
  }
  if (key.includes('read') || key.includes('long')) {
    return 'bg-accent-water-float text-accent-water-default';
  }
  if (key.includes('discuss') || key.includes('hot')) {
    return 'bg-accent-ketchup-float text-accent-ketchup-default';
  }
  return 'bg-surface-float text-text-tertiary';
};

export const CoverQuick = ({
  quickHits,
  readSet,
  onRead,
}: CoverQuickProps): ReactElement => {
  const items = useMemo(
    () =>
      quickHits.map((q) => ({
        ...q,
        eyebrowClass: eyebrowTokenFor(q.eyebrow),
      })),
    [quickHits],
  );

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2 px-1">
        <StarIcon
          size={IconSize.Small}
          className="self-center text-accent-bun-default"
          secondary
        />
        <Typography type={TypographyType.Title3} bold>
          Quick hits
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="tabular-nums"
        >
          · {quickHits.length}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="ml-auto"
        >
          Worth knowing, not worth a thread
        </Typography>
      </div>

      <ul className="grid grid-cols-1 gap-x-6 tablet:grid-cols-2">
        {items.map((q) => {
          const read = readSet.has(q.id);
          return (
            <li
              key={q.id}
              className="border-b border-border-subtlest-tertiary last:border-b-0 tablet:[&:nth-last-child(2)]:border-b-0"
            >
              <a
                href={q.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onRead(q.id)}
                className={classNames(
                  'group flex items-start gap-3 py-3.5 transition-opacity',
                  read && 'opacity-60',
                )}
              >
                <span
                  className={classNames(
                    'inline-flex shrink-0 items-center rounded-6 px-2 py-0.5',
                    q.eyebrowClass,
                  )}
                >
                  <Typography
                    type={TypographyType.Caption2}
                    bold
                    className="uppercase tracking-[0.12em]"
                  >
                    {q.eyebrow}
                  </Typography>
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Footnote}
                    color={
                      read ? TypographyColor.Tertiary : TypographyColor.Primary
                    }
                    className={classNames(
                      '!leading-snug transition-colors',
                      read && 'decoration-text-quaternary/40 line-through',
                      !read && 'group-hover:text-brand-default',
                    )}
                  >
                    {q.title}
                  </Typography>
                  <div className="flex items-center gap-3 text-text-quaternary">
                    <span className="inline-flex items-center gap-0.5">
                      <UpvoteIcon
                        size={IconSize.XXSmall}
                        className="text-accent-avocado-default"
                      />
                      <Typography
                        type={TypographyType.Caption2}
                        color={TypographyColor.Quaternary}
                        className="tabular-nums"
                      >
                        {q.upvotes}
                      </Typography>
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <DiscussIcon size={IconSize.XXSmall} />
                      <Typography
                        type={TypographyType.Caption2}
                        color={TypographyColor.Quaternary}
                        className="tabular-nums"
                      >
                        {q.comments}
                      </Typography>
                    </span>
                  </div>
                </div>
                <ArrowIcon
                  size={IconSize.XXSmall}
                  className="mt-1 shrink-0 -rotate-45 text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
