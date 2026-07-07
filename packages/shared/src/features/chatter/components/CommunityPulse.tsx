import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type {
  CommunityMomentum,
  CommunityPulse as CommunityPulseData,
  CommunityStance,
  ControversyLevel,
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
  AiIcon,
  SparkleIcon,
  TrendingIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
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

interface CommunityPulseProps {
  pulse: CommunityPulseData;
}

export const CommunityPulse = ({
  pulse,
}: CommunityPulseProps): ReactElement => (
  <div className="flex w-full min-w-0 flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float">
    {/* Verdict + at-a-glance meta */}
    <div className="flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-6 bg-action-plus-float text-action-plus-default">
          <AiIcon size={IconSize.XSmall} />
        </span>
        <SectionLabel>Community Pulse</SectionLabel>
      </div>
      <Typography type={TypographyType.Title3} bold>
        {pulse.verdict}
      </Typography>
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
        <span>{pulse.perPlatform.length} platforms</span>
      </div>
    </div>

    {/* Overall sentiment */}
    <Section>
      <SentimentBar split={pulse.overallSplit} />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-secondary typo-caption1">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-4 bg-status-success" />
          Agree {pulse.overallSplit.agree}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-4 bg-status-warning" />
          Mixed {pulse.overallSplit.mixed}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-4 bg-status-error" />
          Disagree {pulse.overallSplit.disagree}%
        </span>
      </div>
    </Section>

    {/* Cross-platform divergence — text-forward, no competing bars */}
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

    {/* The debate — stacked, calm */}
    <Section>
      <SectionLabel>Common ground</SectionLabel>
      <ul className="flex flex-col gap-2">
        {pulse.consensus.map((item) => (
          // Icon is absolutely positioned (not a flex sibling) so the text stays
          // a plain block child and wraps against the card width.
          <li key={item} className="relative pl-6">
            <VIcon
              size={IconSize.XSmall}
              className="absolute left-0 top-0.5 text-status-success"
            />
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
      <div className="mt-1 flex flex-col gap-2">
        <SectionLabel>Where it splits</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {pulse.contention.map((tag) => (
            <span
              key={tag}
              className="rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2.5 py-1 text-text-secondary typo-caption1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Section>

    {/* Bottom line — label row stays flex (short); the paragraph is a plain
        block child so it wraps against the card width instead of clipping. */}
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

    {/* Strongest counterpoint */}
    <Section>
      <div className="rounded-12 border-l-2 border-accent-cabbage-default bg-background-subtle p-3">
        <SectionLabel>Strongest pushback</SectionLabel>
        <Typography type={TypographyType.Callout} className="mt-1.5 italic">
          “{pulse.counterpoint.text}”
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="mt-1.5"
        >
          — {pulse.counterpoint.attribution}
        </Typography>
      </div>
    </Section>
  </div>
);
