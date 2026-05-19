import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  UpvoteIcon,
  DiscussIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { QuickHit } from './types';

interface QuickHitsProps {
  quickHits: QuickHit[];
  readSet: Set<string>;
  onRead: (id: string) => void;
}

export const QuickHits = ({
  quickHits,
  readSet,
  onRead,
}: QuickHitsProps): ReactElement => (
  <ul className="flex flex-col">
    {quickHits.map((q) => {
      const read = readSet.has(q.id);
      return (
        <li key={q.id} className="border-b border-border-subtlest-tertiary">
          <a
            href={q.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRead(q.id)}
            className={classNames(
              'group flex items-center gap-3 px-2 py-3 transition-colors hover:bg-surface-float',
              read && 'opacity-60',
            )}
          >
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
              bold
              className="w-20 shrink-0 truncate uppercase tracking-[0.12em]"
            >
              {q.eyebrow}
            </Typography>
            <Typography
              type={TypographyType.Subhead}
              color={read ? TypographyColor.Tertiary : TypographyColor.Primary}
              className={classNames(
                'min-w-0 flex-1 truncate transition-colors',
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
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {q.upvotes}
                </Typography>
              </span>
              <span className="inline-flex items-center gap-1">
                <DiscussIcon size={IconSize.XXSmall} />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {q.comments}
                </Typography>
              </span>
            </span>
          </a>
        </li>
      );
    })}
  </ul>
);
