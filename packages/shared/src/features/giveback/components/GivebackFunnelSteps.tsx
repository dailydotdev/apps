import type { ReactElement, ReactNode, RefObject } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { CoinIcon, GiftIcon, VIcon } from '../../../components/icons';
import { cloudinaryCharmBookmarks } from '../../../lib/image';
import { GivebackMascot } from './GivebackMascot';
import { GivebackCauseSelection } from './GivebackCauseSelection';
import type { CauseSelection, StepKey } from './givebackFunnelTypes';

// The finale reassures the choice by spelling out the value the visitor just
// unlocked - three short, deck-ready propositions rather than a recap of the
// causes (which would just echo the picker screen).
const IMPACT_VALUES: ReadonlyArray<{
  icon: ReactElement;
  title: string;
  sub: string;
}> = [
  {
    icon: <VIcon secondary />,
    title: 'You call the shots',
    sub: 'Real, vetted nonprofits, picked by you.',
  },
  {
    icon: <CoinIcon secondary />,
    title: 'Costs you nothing',
    sub: 'We fund every single dollar.',
  },
  {
    icon: <GiftIcon secondary />,
    title: 'Real-world impact',
    sub: 'Small actions add up to real support.',
  },
];

// Choreographed enter: rise + de-blur + fade, staggered per element so each step
// reveals top-to-bottom rather than popping in as a block (motion-safe only).
const Reveal = ({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'motion-safe:animate-funnel-step-in motion-safe:will-change-transform',
      className,
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// A soft, on-brand glow behind each step's hero icon/illustration so the visual
// feels alive and the campaign reads as a real, considered initiative.
const Stage = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="relative flex min-h-36 items-center justify-center tablet:min-h-52">
    <span
      aria-hidden
      className="bg-accent-cabbage-default/20 absolute inset-0 m-auto size-56 rounded-full blur-3xl motion-safe:animate-glow-pulse"
    />
    <div className="relative">{children}</div>
  </div>
);

// "How it works" as a vertical editorial timeline: oversized brand-gradient
// numerals threaded by a gradient rail (the money "flowing" down to causes),
// rather than a row of identical gradient icon-circles. Reads intentional and
// on-brand instead of generic.
const FLOW_STEPS: ReadonlyArray<{ title: string; sub: string }> = [
  {
    title: 'You take an action',
    sub: 'Share us, post, leave a review, cast a vote. Small things that help more devs find daily.dev.',
  },
  {
    title: 'The pot fills up',
    sub: 'Each action drops real daily.dev money in. Never yours.',
  },
  {
    title: 'We fund your causes',
    sub: 'Hit the goal together and the money goes out to the causes you picked.',
  },
];

const FlowSequence = (): ReactElement => (
  <FlexCol className="w-full text-left">
    {FLOW_STEPS.map((step, index) => {
      const isLast = index === FLOW_STEPS.length - 1;
      return (
        <FlexRow key={step.title} className="items-start gap-4">
          <FlexCol className="items-center self-stretch">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-gradient-to-br from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default">
              <span className="font-bold tabular-nums text-background-default typo-title2">
                {index + 1}
              </span>
            </span>
            {!isLast && (
              <span
                aria-hidden
                className="via-accent-cabbage-default/50 from-accent-avocado-default/60 to-accent-cheese-default/40 my-1 w-0.5 flex-1 rounded-2 bg-gradient-to-b"
              />
            )}
          </FlexCol>
          <FlexCol
            className={classNames(
              'min-w-0 flex-1 gap-1',
              isLast ? 'pb-0' : 'pb-6',
            )}
          >
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Title3}
              bold
              className="[text-wrap:balance]"
            >
              {step.title}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
              className="[text-wrap:pretty]"
            >
              {step.sub}
            </Typography>
          </FlexCol>
        </FlexRow>
      );
    })}
  </FlexCol>
);

interface GivebackFunnelStepProps {
  stepKey: StepKey;
  selection: CauseSelection;
  // The intro step renders the in-flow slot the floating video docks over.
  videoSlotRef: RefObject<HTMLDivElement>;
}

export const GivebackFunnelStep = ({
  stepKey,
  selection,
  videoSlotRef,
}: GivebackFunnelStepProps): ReactElement => {
  // Whether the visitor picked any causes, so the finale can celebrate their
  // choice rather than fall back to the generic copy.
  const hasSelectedCauses = selection.causes.some((cause) =>
    selection.selectedIds.has(cause.id),
  );

  switch (stepKey) {
    case 'how':
      return (
        <FlexCol className="mx-auto w-full max-w-md items-center gap-8">
          <Reveal className="w-full">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title1}
              bold
              className="text-center [text-wrap:balance]"
            >
              You act. We pay. Causes win.
            </Typography>
          </Reveal>
          <Reveal delay={120} className="w-full">
            <FlowSequence />
          </Reveal>
        </FlexCol>
      );
    case 'causes':
      return (
        <FlexCol className="w-full gap-6">
          <Reveal>
            <FlexCol className="gap-2 text-center">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title1}
                bold
                className="[text-wrap:balance]"
              >
                Pick the causes we&apos;ll fund together
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="mx-auto max-w-xl [text-wrap:pretty]"
              >
                Choose as many as you like. You can change them anytime.
              </Typography>
            </FlexCol>
          </Reveal>
          <Reveal delay={120}>
            <GivebackCauseSelection
              causes={selection.causes}
              isLoading={selection.isLoading}
              selectedIds={selection.selectedIds}
              onToggle={selection.toggleCause}
            />
          </Reveal>
        </FlexCol>
      );
    case 'impact':
      return (
        <FlexCol className="w-full items-center gap-6 text-center">
          <Reveal>
            <Stage>
              <GivebackMascot
                imageClassName="h-28 tablet:h-36"
                image={{
                  src: cloudinaryCharmBookmarks,
                  alt: 'daily.dev charm celebrating your causes',
                }}
              />
            </Stage>
          </Reveal>
          <Reveal delay={120}>
            <FlexCol className="items-center gap-3">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title1}
                bold
                className="[text-wrap:balance]"
              >
                {hasSelectedCauses
                  ? "You're in. Now every action funds them."
                  : 'Real causes. Real impact.'}
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="max-w-xl [text-wrap:pretty]"
              >
                {hasSelectedCauses
                  ? 'From here on, every action you take becomes real money for the causes you picked. We fund all of it. You never pay a thing.'
                  : "Your actions become real money for open-source maintainers, students, and devs who can't afford access. We fund all of it, no cost to you."}
              </Typography>
            </FlexCol>
          </Reveal>

          <Reveal delay={220} className="w-full">
            <div className="mx-auto grid w-full max-w-3xl gap-3 tablet:grid-cols-3">
              {IMPACT_VALUES.map((value) => (
                // Horizontal (icon left, copy right) on mobile to keep the
                // finale short; stacks/centers in the 3-up grid on tablet+.
                <FlexRow
                  key={value.title}
                  className="items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 text-left tablet:h-full tablet:flex-col tablet:items-center tablet:gap-2 tablet:p-5 tablet:text-center"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-gradient-to-br from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default text-white tablet:size-11 tablet:rounded-14 [&_svg]:size-5 tablet:[&_svg]:size-6">
                    {value.icon}
                  </span>
                  <FlexCol className="min-w-0 gap-0.5 tablet:items-center">
                    <Typography
                      bold
                      type={TypographyType.Title3}
                      className="[text-wrap:balance]"
                    >
                      {value.title}
                    </Typography>
                    <Typography
                      color={TypographyColor.Secondary}
                      // Smaller on mobile so the longest sub ("...picked by you.")
                      // clears the card edge; full Callout size at tablet+.
                      className="typo-footnote [text-wrap:pretty] tablet:typo-callout"
                    >
                      {value.sub}
                    </Typography>
                  </FlexCol>
                </FlexRow>
              ))}
            </div>
          </Reveal>
          {hasSelectedCauses && (
            <Reveal delay={320}>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
                className="max-w-xl [text-wrap:pretty]"
              >
                Thanks for choosing who to back. From now on, your everyday
                actions are working for them. 💜
              </Typography>
            </Reveal>
          )}
        </FlexCol>
      );
    case 'intro':
    default:
      return (
        <FlexCol className="w-full items-center gap-5 text-center">
          {/* The floating player overlays this slot while on step 1. */}
          <div
            ref={videoSlotRef}
            aria-hidden
            className="aspect-video w-full max-w-xl"
          />
          <Reveal delay={120}>
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title1}
              bold
              className="[text-wrap:balance]"
            >
              We&apos;d rather fund the world than pay for ads
            </Typography>
          </Reveal>
          <Reveal delay={220}>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              className="max-w-xl [text-wrap:pretty]"
            >
              Most companies grow by buying ads. We&apos;d rather grow through
              developers who love daily.dev, and put that budget into causes
              that matter. The deal is simple: help more people discover us, and
              we fund the causes you choose. It never costs you a thing.
            </Typography>
          </Reveal>
        </FlexCol>
      );
  }
};
