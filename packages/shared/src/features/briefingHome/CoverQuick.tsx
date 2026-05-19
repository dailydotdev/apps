import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import {
  StarIcon,
  UpvoteIcon,
  DiscussIcon,
  ArrowIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { QuickHit } from './types';
import { briefCopy } from './copy';

interface CoverQuickProps {
  quickHits: QuickHit[];
  readSet: Set<string>;
  onRead: (id: string) => void;
}

export const CoverQuick = ({
  quickHits,
  readSet,
  onRead,
}: CoverQuickProps): ReactElement => (
  <section>
    <div className="mb-2 flex items-center gap-2 px-1">
      <StarIcon
        size={IconSize.XSmall}
        className="text-accent-bun-default"
        secondary
      />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Primary}
        bold
        className="uppercase tracking-[0.16em]"
      >
        {briefCopy.quickEyebrow}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="tabular-nums"
      >
        · {quickHits.length}
      </Typography>
    </div>

    <ul className="grid grid-cols-1 gap-x-6 rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-3 tablet:grid-cols-2 tablet:px-4">
      {quickHits.map((q) => {
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
                'group flex items-center gap-3 py-2.5 transition-colors',
                read && 'opacity-60',
              )}
            >
              <span
                className={classNames(
                  'inline-block size-1.5 shrink-0 rounded-full transition-colors',
                  read ? 'bg-text-quaternary' : 'bg-accent-bun-default',
                )}
              />
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
                bold
                className="w-14 shrink-0 truncate uppercase tracking-[0.12em]"
              >
                {q.eyebrow}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={
                  read ? TypographyColor.Tertiary : TypographyColor.Primary
                }
                className={classNames(
                  'min-w-0 flex-1 !leading-snug transition-colors',
                  read && 'decoration-text-quaternary/40 line-through',
                  !read && 'group-hover:text-brand-default',
                )}
              >
                {q.title}
              </Typography>
              <span className="hidden shrink-0 items-center gap-3 text-text-quaternary tablet:inline-flex">
                <span className="inline-flex items-center gap-1">
                  <UpvoteIcon size={IconSize.XXSmall} />
                  <Typography
                    type={TypographyType.Caption2}
                    color={TypographyColor.Quaternary}
                  >
                    {q.upvotes}
                  </Typography>
                </span>
                <span className="inline-flex items-center gap-1">
                  <DiscussIcon size={IconSize.XXSmall} />
                  <Typography
                    type={TypographyType.Caption2}
                    color={TypographyColor.Quaternary}
                  >
                    {q.comments}
                  </Typography>
                </span>
              </span>
              <ArrowIcon
                size={IconSize.XXSmall}
                className="rotate-90 text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100"
              />
            </a>
          </li>
        );
      })}
    </ul>
  </section>
);
