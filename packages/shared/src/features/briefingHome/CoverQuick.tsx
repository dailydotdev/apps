import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { StarIcon } from '../../components/icons';
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
        className="uppercase tracking-[0.18em]"
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
    <ul className="flex flex-col">
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
                'group flex flex-col gap-1 py-2.5',
                read && 'opacity-60',
              )}
            >
              <Typography
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
              <div className="flex items-center gap-2 text-text-quaternary">
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  bold
                  className="uppercase tracking-[0.12em]"
                >
                  {q.eyebrow}
                </Typography>
                <span aria-hidden>·</span>
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  className="tabular-nums"
                >
                  {q.upvotes} ↑ · {q.comments} 💬
                </Typography>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  </section>
);
