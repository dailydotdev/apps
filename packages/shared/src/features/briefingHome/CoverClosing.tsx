import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { ArrowIcon, ShareIcon, RefreshIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { briefCopy } from './copy';

interface CoverClosingProps {
  totals: {
    total: number;
    readMinutes: number;
    savedMinutes: number;
    readCount: number;
    isComplete: boolean;
  };
  edition: number;
  onReset: () => void;
}

const formatTomorrowTime = (): string => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  t.setHours(9, 0, 0, 0);
  return t.toLocaleString(undefined, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const CoverClosing = ({
  totals,
  edition,
  onReset,
}: CoverClosingProps): ReactElement => {
  const tomorrow = useMemo(formatTomorrowTime, []);
  const progressPct = totals.total
    ? Math.round((totals.readCount / totals.total) * 100)
    : 0;
  const headline = totals.isComplete
    ? "You're caught up."
    : `You opened ${totals.readCount} of ${totals.total}.`;
  const subline = totals.isComplete
    ? `~${totals.savedMinutes} min back in your evening.`
    : 'Skim the rest below, or come back tomorrow.';

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-text-quaternary">
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          bold
          className="uppercase tracking-[0.24em]"
        >
          P.S. · Brief no. {edition}
        </Typography>
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
      </div>
      <div className="flex flex-col items-start justify-between gap-3 tablet:flex-row tablet:items-end">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            bold
            className="!leading-tight"
          >
            {headline}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {subline} Next brief drops {tomorrow}.
          </Typography>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-text-tertiary">
          <a
            href="#brief-feed-start"
            className="inline-flex items-center gap-1 rounded-8 px-2 py-1.5 hover:bg-surface-float hover:text-text-primary"
          >
            <Typography type={TypographyType.Footnote} bold>
              Open the feed
            </Typography>
            <ArrowIcon size={IconSize.XXSmall} className="rotate-180" />
          </a>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator
                  .share({
                    title: briefCopy.shareHead,
                    url: window.location.href,
                  })
                  .catch(() => undefined);
                return;
              }
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard
                  .writeText(window.location.href)
                  .catch(() => undefined);
              }
            }}
            className="inline-flex items-center gap-1 rounded-8 px-2 py-1.5 hover:bg-surface-float hover:text-text-primary"
          >
            <ShareIcon size={IconSize.XXSmall} />
            <Typography type={TypographyType.Footnote} bold>
              Share
            </Typography>
          </button>
          {totals.readCount > 0 ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-8 px-2 py-1.5 hover:bg-surface-float hover:text-text-primary"
            >
              <RefreshIcon size={IconSize.XXSmall} />
              <Typography type={TypographyType.Footnote} bold>
                Reset
              </Typography>
            </button>
          ) : null}
        </div>
      </div>
      {!totals.isComplete ? (
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-border-subtlest-tertiary"
          role="progressbar"
          aria-label={briefCopy.progressLabel}
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className="block h-full rounded-full bg-text-primary transition-all duration-500"
            style={{ width: `${Math.max(progressPct, 2)}%` }}
          />
        </div>
      ) : null}
    </section>
  );
};
