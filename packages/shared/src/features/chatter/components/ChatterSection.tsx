import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { ChatterPlatform } from '../types';
import { platformVisuals } from '../platforms';
import { useArticleChatter } from '../hooks/useArticleChatter';
import { ChatterPlatformCard } from './ChatterPlatformCard';
import { CommunityPulse } from './CommunityPulse';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { AiIcon, ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import { useToggle } from '../../../hooks/useToggle';

type ChatterFilter = ChatterPlatform | 'all';

const filters: { value: ChatterFilter; label: string }[] = [
  { value: 'all', label: 'All sources' },
  { value: ChatterPlatform.X, label: platformVisuals[ChatterPlatform.X].label },
  {
    value: ChatterPlatform.HackerNews,
    label: platformVisuals[ChatterPlatform.HackerNews].label,
  },
];

const LoadingSkeleton = (): ReactElement => (
  <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <div className="flex items-center gap-3">
      <ElementPlaceholder className="size-8 rounded-10" />
      <ElementPlaceholder className="h-4 w-64 rounded-8" />
    </div>
    <ElementPlaceholder className="mt-4 h-2.5 w-full rounded-4" />
    <ElementPlaceholder className="mt-4 h-3 w-full rounded-8" />
    <ElementPlaceholder className="mt-2 h-3 w-3/4 rounded-8" />
  </div>
);

interface ChatterSectionProps {
  post: Post;
  className?: string;
}

export const ChatterSection = ({
  post,
  className,
}: ChatterSectionProps): ReactElement => {
  const { chatter, isLoading } = useArticleChatter(post);
  const [filter, setFilter] = useState<ChatterFilter>('all');
  const [isRawOpen, toggleRawOpen] = useToggle(false);

  const sources =
    chatter?.sources.filter(
      (source) => filter === 'all' || source.platform === filter,
    ) ?? [];

  return (
    <section
      aria-label="Community Pulse"
      className={classNames('flex flex-col gap-4', className)}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-action-plus-float text-action-plus-default">
          <AiIcon size={IconSize.Small} />
        </span>
        <div>
          <Typography type={TypographyType.Body} bold>
            The Chatter — how the wider dev community reacted
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            An AI read of the conversation across X & Hacker News — not just the
            raw comments.
          </Typography>
        </div>
      </div>

      {isLoading || !chatter ? (
        <LoadingSkeleton />
      ) : (
        <>
          <CommunityPulse pulse={chatter.pulse} />

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => toggleRawOpen()}
              aria-expanded={isRawOpen}
              className="flex w-full items-center justify-between rounded-12 border border-border-subtlest-tertiary px-4 py-3 font-bold text-text-secondary typo-callout hover:bg-surface-hover"
            >
              {isRawOpen
                ? 'Hide the raw discussion'
                : 'See the raw discussion by platform'}
              <ArrowIcon
                size={IconSize.Small}
                className={isRawOpen ? undefined : 'rotate-180'}
              />
            </button>

            {isRawOpen && (
              <>
                <div className="flex flex-wrap gap-2">
                  {filters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={filter === item.value}
                      onClick={() => setFilter(item.value)}
                      className={classNames(
                        'rounded-10 border px-3 py-1.5 font-bold transition-colors typo-footnote',
                        filter === item.value
                          ? 'border-border-subtlest-primary bg-surface-hover text-text-primary'
                          : 'border-border-subtlest-tertiary text-text-secondary hover:bg-surface-hover',
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {sources.map((source) => (
                  <ChatterPlatformCard key={source.platform} source={source} />
                ))}
              </>
            )}
          </div>
        </>
      )}

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="text-center"
      >
        Summaries are AI-generated from public posts and may be imperfect.
        Always open the source thread for full context.
      </Typography>
    </section>
  );
};
