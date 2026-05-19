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
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon } from '../../components/icons';
import { ShareBrief } from './ShareBrief';
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
}

export const CoverClosing = ({
  totals,
  edition,
}: CoverClosingProps): ReactElement => {
  const remaining = totals.total - totals.readCount;
  const progressPct = totals.total
    ? Math.round((totals.readCount / totals.total) * 100)
    : 0;
  const showProgressBar = !totals.isComplete && progressPct > 0;

  return (
    <section className="flex items-center gap-4 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          bold
          className="uppercase tracking-[0.18em]"
        >
          {briefCopy.editionLabel(edition)} · End of brief
        </Typography>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          bold
          className="!leading-tight"
        >
          {totals.isComplete
            ? briefCopy.closingTitleDone
            : briefCopy.closingTitleProgress}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {totals.isComplete
            ? briefCopy.closingSubDone(
                totals.total,
                totals.readMinutes,
                totals.savedMinutes,
              )
            : briefCopy.closingSubProgress(remaining)}
        </Typography>
        {showProgressBar ? (
          <div
            className="mt-1 h-1 w-full max-w-[14rem] overflow-hidden rounded-full bg-surface-float"
            role="progressbar"
            aria-label={briefCopy.progressLabel}
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className="block h-full rounded-full bg-brand-default transition-all duration-500"
              style={{ width: `${Math.max(progressPct, 4)}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ShareBrief variant={ButtonVariant.Float} />
        <Button
          tag="a"
          href="#brief-feed-start"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="rotate-180" />}
          iconPosition={ButtonIconPosition.Right}
          className={classNames(
            totals.isComplete && '!bg-accent-avocado-default',
          )}
        >
          {totals.isComplete ? 'Open the feed' : briefCopy.scrollCue}
        </Button>
      </div>
    </section>
  );
};
