import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type {
  CommunityMomentum,
  CommunityPulse as CommunityPulseData,
  CommunityStance,
  ControversyLevel,
  HighlightKind,
  SentimentSplit,
} from '../types';
import { platformVisuals } from '../platforms';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  ArrowIcon,
  SparkleIcon,
  TrendingIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useToggle } from '../../../hooks/useToggle';
import { largeNumberFormat } from '../../../lib/numberFormat';

const stanceDot: Record<CommunityStance, string> = {
  positive: 'bg-status-success',
  divided: 'bg-status-warning',
  critical: 'bg-status-error',
  mixed: 'bg-status-warning',
};

const controversyText: Record<ControversyLevel, string> = {
  calm: 'text-status-success',
  lively: 'text-status-warning',
  heated: 'text-status-error',
};

const momentumLabel: Record<CommunityMomentum, string> = {
  rising: 'Rising',
  steady: 'Steady',
  cooling: 'Cooling',
};

const highlightMeta: Record<
  HighlightKind,
  { label: string; dot: string; text: string }
> = {
  'the-bull-case': {
    label: 'The bull case',
    dot: 'bg-status-success',
    text: 'text-status-success',
  },
  'the-skeptic': {
    label: 'The skeptic',
    dot: 'bg-status-error',
    text: 'text-status-error',
  },
  'the-tell': {
    label: 'The tell',
    dot: 'bg-accent-cabbage-default',
    text: 'text-action-plus-default',
  },
  'the-receipt': {
    label: 'The receipt',
    dot: 'bg-accent-salt-default',
    text: 'text-text-secondary',
  },
};

const leanDot = (split: SentimentSplit): string => {
  const net = split.agree - split.disagree;
  if (net >= 10) {
    return 'bg-status-success';
  }
  if (net <= -10) {
    return 'bg-status-error';
  }
  return 'bg-status-warning';
};

const Section = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex min-w-0 flex-col gap-2.5 border-t border-border-subtlest-tertiary p-4">
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    type={TypographyType.Caption1}
    color={TypographyColor.Tertiary}
    bold
    tag={TypographyTag.Span}
    className="uppercase tracking-wide"
  >
    {children}
  </Typography>
);

const SentimentBar = ({ split }: { split: SentimentSplit }): ReactElement => (
  <div className="flex h-2.5 overflow-hidden rounded-4 bg-background-subtle">
    <span className="bg-status-success" style={{ width: `${split.agree}%` }} />
    <span className="bg-status-warning" style={{ width: `${split.mixed}%` }} />
    <span className="bg-status-error" style={{ width: `${split.disagree}%` }} />
  </div>
);

const Details = ({ pulse }: { pulse: CommunityPulseData }): ReactElement => (
  <>
    <Section>
      <SectionLabel>Highlights</SectionLabel>
      <div className="flex flex-col gap-2.5">
        {pulse.highlights.map((highlight) => {
          const meta = highlightMeta[highlight.kind];
          return (
            <div
              key={highlight.text}
              className="rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-3"
            >
              <span className="mb-1.5 flex items-center gap-1.5">
                <span className={classNames('size-2 rounded-4', meta.dot)} />
                <span
                  className={classNames(
                    'font-bold uppercase tracking-wide typo-caption1',
                    meta.text,
                  )}
                >
                  {meta.label}
                </span>
              </span>
              <Typography type={TypographyType.Callout} className="break-words">
                “{highlight.text}”
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="mt-1 break-words"
              >
                — {highlight.who}
              </Typography>
            </div>
          );
        })}
      </div>
    </Section>

    <Section>
      <SectionLabel>How each platform leans</SectionLabel>
      <div className="flex flex-col gap-2">
        {pulse.perPlatform.map((item) => {
          const visual = platformVisuals[item.platform];
          return (
            <div key={item.platform} className="flex items-center gap-2.5">
              <span
                className={classNames(
                  'flex size-5 shrink-0 items-center justify-center rounded-6',
                  visual.chipClassName,
                  visual.markClassName,
                )}
                style={
                  visual.chipColor
                    ? { background: visual.chipColor }
                    : undefined
                }
              >
                {visual.mark}
              </span>
              <Typography
                type={TypographyType.Footnote}
                className="w-24 shrink-0 text-text-tertiary"
                tag={TypographyTag.Span}
              >
                {visual.label}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                bold
                tag={TypographyTag.Span}
                className="min-w-0 flex-1 truncate"
              >
                {item.read}
              </Typography>
              <span
                className={classNames(
                  'size-2.5 shrink-0 rounded-4',
                  leanDot(item.split),
                )}
              />
            </div>
          );
        })}
      </div>
    </Section>

    <Section>
      <SectionLabel>Where it splits</SectionLabel>
      <ul className="flex flex-col gap-2">
        {pulse.contention.map((item) => (
          <li key={item} className="relative pl-4">
            <span className="absolute left-0 top-2 size-1.5 rounded-4 bg-accent-salt-default" />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              className="break-words"
            >
              {item}
            </Typography>
          </li>
        ))}
      </ul>
    </Section>

    <Section>
      <div className="flex items-center gap-1.5">
        <SparkleIcon
          size={IconSize.XSmall}
          className="shrink-0 text-action-plus-default"
        />
        <SectionLabel>Bottom line</SectionLabel>
      </div>
      <Typography type={TypographyType.Callout} className="break-words">
        {pulse.bottomLine}
      </Typography>
    </Section>
  </>
);

interface CommunityPulseProps {
  pulse: CommunityPulseData;
}

export const CommunityPulse = ({
  pulse,
}: CommunityPulseProps): ReactElement => {
  const [showDetails, toggleDetails] = useToggle(false);

  return (
    <div className="flex w-full min-w-0 flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float">
      {/* Glance: the whole answer in one view */}
      <div className="flex min-w-0 flex-col gap-3 p-4">
        <Typography type={TypographyType.Title3} bold className="break-words">
          {pulse.verdict}
        </Typography>

        <div className="flex flex-col gap-2">
          <SentimentBar split={pulse.overallSplit} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-secondary typo-caption1">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-4 bg-status-success" />
              {pulse.overallSplit.agree}% agree
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-4 bg-status-warning" />
              {pulse.overallSplit.mixed}% mixed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-4 bg-status-error" />
              {pulse.overallSplit.disagree}% disagree
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-tertiary typo-caption1">
          <span className="flex items-center gap-1.5">
            <span
              className={classNames(
                'size-2.5 rounded-4',
                stanceDot[pulse.stance],
              )}
            />
            <span className="font-bold capitalize text-text-primary typo-footnote">
              {pulse.stance}
            </span>
          </span>
          <span
            className={classNames(
              'font-bold capitalize',
              controversyText[pulse.controversyLevel],
            )}
          >
            {pulse.controversyLevel}
          </span>
          <span className="flex items-center gap-1">
            <TrendingIcon size={IconSize.XSmall} />{' '}
            {momentumLabel[pulse.momentum]}
          </span>
          <span>{largeNumberFormat(pulse.totalVoices)} voices</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggleDetails()}
        aria-expanded={showDetails}
        className="flex w-full items-center justify-between border-t border-border-subtlest-tertiary p-4 font-bold text-text-secondary typo-footnote hover:bg-surface-hover"
      >
        {showDetails ? 'Hide breakdown' : 'Show the full breakdown'}
        <ArrowIcon
          size={IconSize.Small}
          className={showDetails ? undefined : 'rotate-180'}
        />
      </button>

      {showDetails && <Details pulse={pulse} />}
    </div>
  );
};
