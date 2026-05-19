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
import { ArrowIcon, BriefIcon, SparkleIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
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

const formatDate = (): string =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
    <section className="relative flex flex-col items-center pb-4 pt-6 text-center">
      <div
        aria-hidden
        className="flex w-full max-w-[42rem] items-center gap-3 text-text-quaternary"
      >
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
        <span className="inline-flex items-center gap-1.5">
          <BriefIcon
            size={IconSize.XSmall}
            className="text-accent-ketchup-default"
            secondary
          />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-[0.28em]"
          >
            End of brief
          </Typography>
        </span>
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
      </div>

      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.LargeTitle}
        bold
        className="mt-6 !leading-[1.05] tracking-[-0.03em]"
      >
        {totals.isComplete
          ? briefCopy.closingTitleDone
          : briefCopy.closingTitleProgress}
      </Typography>
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="mt-2 max-w-prose"
      >
        {totals.isComplete
          ? briefCopy.closingSubDone(
              totals.total,
              totals.readMinutes,
              totals.savedMinutes,
            )
          : briefCopy.closingSubProgress(remaining)}
      </Typography>
      {totals.isComplete ? (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="mt-1 italic"
        >
          {briefCopy.closingPivot}
        </Typography>
      ) : null}

      {showProgressBar ? (
        <div className="mt-5 w-full max-w-xs">
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-surface-float"
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
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
            className="mt-1.5 tabular-nums"
          >
            {totals.readCount} of {totals.total} read · {progressPct}%
          </Typography>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col items-center gap-3 tablet:flex-row">
        <Button
          tag="a"
          href="#brief-end"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          icon={<ArrowIcon className="rotate-180" />}
          iconPosition={ButtonIconPosition.Right}
          className={classNames(
            'min-w-[12rem]',
            totals.isComplete && '!bg-accent-avocado-default',
          )}
        >
          {totals.isComplete ? 'Open the feed' : briefCopy.scrollCue}
        </Button>
        <ShareBrief variant={ButtonVariant.Float} />
      </div>

      <div
        aria-hidden
        className="mt-8 flex items-center gap-2 text-text-quaternary"
      >
        <SparkleIcon size={IconSize.XXSmall} className="text-text-quaternary" />
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          className="tabular-nums"
        >
          {briefCopy.editionLabel(edition)} · {formatDate()} · Filed by
          daily.dev
        </Typography>
        <SparkleIcon size={IconSize.XXSmall} className="text-text-quaternary" />
      </div>
    </section>
  );
};
