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
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon, SparkleIcon } from '../../components/icons';
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
  onCollapse: () => void;
  skipAnchor: string;
}

export const CoverClosing = ({
  totals,
  onCollapse,
  skipAnchor,
}: CoverClosingProps): ReactElement => {
  const remaining = totals.total - totals.readCount;
  const progressPct = totals.total
    ? Math.round((totals.readCount / totals.total) * 100)
    : 0;

  return (
    <section
      className={classNames(
        'overflow-hidden rounded-16 border p-6 transition-colors tablet:p-7',
        totals.isComplete
          ? 'border-brand-default/40 bg-gradient-to-br from-brand-float via-background-subtle to-background-subtle'
          : 'border-border-subtlest-tertiary bg-background-subtle',
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {totals.isComplete ? (
              <span className="inline-grid size-6 place-items-center rounded-full bg-brand-float text-brand-default">
                <SparkleIcon size={IconSize.XSmall} />
              </span>
            ) : null}
            <Typography
              type={TypographyType.Caption2}
              color={
                totals.isComplete
                  ? TypographyColor.Brand
                  : TypographyColor.Quaternary
              }
              bold
              className="uppercase tracking-[0.18em]"
            >
              {totals.isComplete
                ? 'Brief complete'
                : `${totals.readCount} of ${totals.total} read`}
            </Typography>
          </div>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
            bold
            className="tabular-nums"
          >
            {progressPct}%
          </Typography>
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-surface-float"
          role="progressbar"
          aria-label={briefCopy.progressLabel}
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className={classNames(
              'block h-full rounded-full transition-all duration-500',
              totals.isComplete
                ? 'bg-accent-avocado-default'
                : 'bg-brand-default',
            )}
            style={{ width: `${Math.max(progressPct, 4)}%` }}
          />
        </div>

        <div className="flex flex-col items-start gap-4 tablet:flex-row tablet:items-end tablet:justify-between">
          <div className="min-w-0 flex-1">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title2}
              bold
              className="!leading-tight tracking-[-0.02em]"
            >
              {totals.isComplete
                ? briefCopy.closingTitleDone
                : briefCopy.closingTitleProgress}
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              className="mt-1 max-w-prose"
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
                className="mt-2 italic"
              >
                {briefCopy.closingPivot}
              </Typography>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              onClick={onCollapse}
            >
              {briefCopy.controlCollapse}
            </Button>
            <ShareBrief variant={ButtonVariant.Float} />
            <Button
              tag="a"
              href={skipAnchor}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="rotate-180" />}
            >
              {briefCopy.scrollCue}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
