import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { StarIcon, OpenLinkIcon } from '../../components/icons';
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
      </div>

      <ul className="grid grid-cols-1 gap-2 tablet:grid-cols-2 laptop:grid-cols-3">
        {items.map((q) => {
          const read = readSet.has(q.id);
          return (
            <li key={q.id}>
              <a
                href={q.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onRead(q.id)}
                className={classNames(
                  'group relative flex h-full flex-col gap-2 rounded-12 border border-border-subtlest-quaternary bg-background-default p-3 transition-colors hover:border-border-subtlest-tertiary hover:bg-surface-float',
                  read && 'opacity-60',
                )}
              >
                <div className="flex items-start justify-between gap-2">
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
                  <OpenLinkIcon
                    size={IconSize.XXSmall}
                    className="mt-1 shrink-0 text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Footnote}
                  bold
                  color={
                    read ? TypographyColor.Tertiary : TypographyColor.Primary
                  }
                  className={classNames(
                    'line-clamp-3 !leading-snug transition-colors',
                    read && 'decoration-text-quaternary/40 line-through',
                    !read && 'group-hover:text-brand-default',
                  )}
                >
                  {q.title}
                </Typography>
                <div className="mt-auto flex items-center gap-3 pt-1 text-text-quaternary">
                  <Typography
                    type={TypographyType.Caption2}
                    color={TypographyColor.Quaternary}
                    className="tabular-nums"
                  >
                    ↑ {q.upvotes}
                  </Typography>
                  <Typography
                    type={TypographyType.Caption2}
                    color={TypographyColor.Quaternary}
                    className="tabular-nums"
                  >
                    💬 {q.comments}
                  </Typography>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
