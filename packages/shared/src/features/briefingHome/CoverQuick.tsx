import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { UpvoteIcon, DiscussIcon } from '../../components/icons';
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
  <section className="mt-8">
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
      bold
      className="mb-3 uppercase tracking-[0.18em]"
    >
      {briefCopy.quickEyebrow}
    </Typography>
    <ul className="grid grid-cols-1 gap-x-6 gap-y-1 tablet:grid-cols-2">
      {quickHits.map((q) => {
        const read = readSet.has(q.id);
        return (
          <li
            key={q.id}
            className="border-b border-border-subtlest-tertiary last:border-b-0"
          >
            <a
              href={q.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRead(q.id)}
              className={classNames(
                'group flex items-center gap-3 py-2.5 transition-colors hover:bg-surface-float',
                read && 'opacity-60',
              )}
            >
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
                bold
                className="w-16 shrink-0 truncate uppercase tracking-[0.12em]"
              >
                {q.eyebrow}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={
                  read ? TypographyColor.Tertiary : TypographyColor.Primary
                }
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
            </a>
          </li>
        );
      })}
    </ul>
  </section>
);
