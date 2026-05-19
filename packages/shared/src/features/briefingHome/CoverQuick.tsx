import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  StarIcon,
  OpenLinkIcon,
  UpvoteIcon,
  DiscussIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { StatPill } from './StatPill';
import type { QuickHit } from './types';

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
    <div className="mb-3 flex items-baseline gap-2 px-1">
      <StarIcon
        size={IconSize.Small}
        className="self-center text-accent-bun-default"
        secondary
      />
      <Typography type={TypographyType.Title3} bold>
        Quick hits
      </Typography>
    </div>

    <ul className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
      {quickHits.map((q) => {
        const read = readSet.has(q.id);
        return (
          <li key={q.id}>
            <a
              href={q.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRead(q.id)}
              className={classNames(
                'group relative flex h-full flex-col gap-3 rounded-12 border border-border-subtlest-quaternary bg-background-default p-4 transition-colors hover:border-border-subtlest-tertiary hover:bg-surface-float',
                read && 'opacity-60',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Body}
                    bold
                    color={
                      read ? TypographyColor.Tertiary : TypographyColor.Primary
                    }
                    className={classNames(
                      'line-clamp-3 block break-words !leading-snug transition-colors',
                      read && 'decoration-text-quaternary/40 line-through',
                      !read && 'group-hover:text-brand-default',
                    )}
                  >
                    {q.title}
                  </Typography>
                </div>
                <OpenLinkIcon
                  size={IconSize.XSmall}
                  className="mt-0.5 shrink-0 text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatPill
                    ariaLabel={`${q.upvotes} upvotes`}
                    onClick={() => {
                      onRead(q.id);
                      window.open(q.url, '_blank', 'noopener,noreferrer');
                    }}
                    icon={
                      <UpvoteIcon
                        size={IconSize.XSmall}
                        className="text-accent-avocado-default"
                      />
                    }
                    value={q.upvotes}
                  />
                  <StatPill
                    ariaLabel={`${q.comments} comments`}
                    onClick={() => {
                      onRead(q.id);
                      window.open(q.url, '_blank', 'noopener,noreferrer');
                    }}
                    icon={
                      <DiscussIcon
                        size={IconSize.XSmall}
                        className="text-text-tertiary"
                      />
                    }
                    value={q.comments}
                  />
                </div>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  bold
                  className="shrink-0 uppercase tracking-[0.14em]"
                >
                  {q.eyebrow}
                </Typography>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  </section>
);
