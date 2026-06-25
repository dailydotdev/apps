import type { CSSProperties, ReactElement, ReactNode, RefObject } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import CloseButton from '../../../components/CloseButton';
import {
  CoinIcon,
  GiftIcon,
  MoveToIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { cloudinaryCharmBookmarks } from '../../../lib/image';
import type { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';
import { GivebackBackground } from './GivebackBackground';
import { GivebackMascot } from './GivebackMascot';
import { GivebackCauseSelection } from './GivebackCauseSelection';
import { GivebackCampaignVideo } from './GivebackCampaignVideo';

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
    title: 'You chose well',
    sub: 'Real, vetted nonprofits, picked by you.',
  },
  {
    icon: <CoinIcon secondary />,
    title: 'Costs you nothing',
    sub: 'daily.dev funds every single dollar.',
  },
  {
    icon: <GiftIcon secondary />,
    title: 'Real, lasting impact',
    sub: 'Everyday actions become real support.',
  },
];

type CauseSelection = ReturnType<typeof useGivebackCauseSelection>;

// Step keys double as analytics labels and drive the progress bar. Kept tight
// so the funnel only highlights what matters: what it is, how it works, pick
// causes, and the impact — then straight into the campaign.
const STEP_KEYS = ['intro', 'how', 'causes', 'impact'] as const;
type StepKey = (typeof STEP_KEYS)[number];

interface GivebackFunnelProps {
  selection: CauseSelection;
  // Replay (opened from "How it works") can be dismissed; the forced first-run
  // cannot, so the user always reaches the campaign with the context they need.
  canClose?: boolean;
  onClose?: () => void;
  onComplete: () => void;
}

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
  <div className="relative flex min-h-52 items-center justify-center">
    <span
      aria-hidden
      className="bg-accent-cabbage-default/20 absolute inset-0 m-auto size-56 rounded-full blur-3xl motion-safe:animate-glow-pulse"
    />
    <div className="relative">{children}</div>
  </div>
);

// The campaign explainer that starts inline on step 1, then docks to a floating
// bottom-right player for the rest of the funnel. It is a SINGLE mounted
// instance positioned over an in-flow slot (step 1) or pinned to the corner
// (later steps), so playback never restarts when it moves.
const DOCK_WIDTH = 320;

const GivebackFunnelVideo = ({
  slotRef,
  docked,
  onClose,
}: {
  slotRef: RefObject<HTMLDivElement>;
  docked: boolean;
  onClose: () => void;
}): ReactElement | null => {
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const update = () => {
      if (docked) {
        const width = Math.min(DOCK_WIDTH, window.innerWidth - 32);
        const height = (width * 9) / 16;
        setStyle({
          top: window.innerHeight - height - 16,
          left: window.innerWidth - width - 16,
          width,
        });
        return;
      }
      const el = slotRef.current;
      if (!el) {
        setStyle(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setStyle({ top: rect.top, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && slotRef.current) {
      observer = new ResizeObserver(update);
      observer.observe(slotRef.current);
    }
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer?.disconnect();
    };
  }, [docked, slotRef]);

  if (!style) {
    return null;
  }

  return (
    <div
      className="z-10 fixed transition-[top,left,width] duration-500 ease-in-out motion-reduce:transition-none"
      style={style}
    >
      <div className="relative shadow-2">
        <GivebackCampaignVideo />
        {docked && (
          <CloseButton
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
            className="absolute right-2 top-2 z-1"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
};

// "How it works" as a vertical editorial timeline: oversized brand-gradient
// numerals threaded by a gradient rail (the money "flowing" down to causes),
// rather than a row of identical gradient icon-circles. Reads intentional and
// on-brand instead of generic.
const FLOW_STEPS: ReadonlyArray<{ title: string; sub: string }> = [
  {
    title: 'You take an action',
    sub: 'Upvote, post, share, talk, write. Anything counts.',
  },
  {
    title: 'The pot grows toward the goal',
    sub: 'Every action drops real money in. You never pay a cent.',
  },
  {
    title: 'We donate it to your causes',
    sub: 'Hit the goal together and it’s sent automatically.',
  },
];

const FlowSequence = (): ReactElement => (
  <FlexCol className="mx-auto w-full max-w-md text-left">
    {FLOW_STEPS.map((step, index) => {
      const isLast = index === FLOW_STEPS.length - 1;
      return (
        <FlexRow key={step.title} className="gap-5">
          <FlexCol className="items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-16 bg-gradient-to-br from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default">
              <span className="font-bold tabular-nums text-background-default typo-title1">
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
            className={classNames('min-w-0 gap-1', isLast ? 'pb-0' : 'pb-8')}
          >
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Title3}
              bold
            >
              {step.title}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {step.sub}
            </Typography>
          </FlexCol>
        </FlexRow>
      );
    })}
  </FlexCol>
);

export const GivebackFunnel = ({
  selection,
  canClose = false,
  onClose,
  onComplete,
}: GivebackFunnelProps): ReactElement => {
  const { logEvent } = useLogContext();
  const [stepIndex, setStepIndex] = useState(0);
  const stepKey = STEP_KEYS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEP_KEYS.length - 1;

  // The explainer plays inline on step 1, then floats in the corner; one mounted
  // instance keeps it playing across the move.
  const videoSlotRef = useRef<HTMLDivElement>(null);
  const [videoClosed, setVideoClosed] = useState(false);

  // The visitor's own picks, surfaced front-and-center on the finale so the
  // moment celebrates exactly what they chose to fund. Keep each cause's index
  // in the full list so its branded emblem tint stays stable.
  const selectedCauses = selection.causes
    .map((cause, index) => ({ cause, index }))
    .filter(({ cause }) => selection.selectedIds.has(cause.id))
    .slice(0, 3);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.StartGivebackFunnel,
      extra: JSON.stringify({ mode: canClose ? 'replay' : 'forced' }),
    });
    // Only on mount - a fresh funnel run is one "start".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.ViewGivebackFunnelStep,
      extra: JSON.stringify({ step: stepKey, index: stepIndex }),
    });
  }, [logEvent, stepKey, stepIndex]);

  // Never trap the user on the causes step: only require a pick when there are
  // causes to pick from.
  const causesBlock =
    stepKey === 'causes' &&
    selection.causes.length > 0 &&
    selection.selectedCount === 0;

  const goNext = () => {
    if (isLast) {
      logEvent({ event_name: LogEvent.CompleteGivebackFunnel });
      onComplete();
      return;
    }
    setStepIndex((index) => index + 1);
  };

  const goBack = () => setStepIndex((index) => Math.max(0, index - 1));

  const ctaLabel = useMemo<Record<StepKey, string>>(
    () => ({
      intro: 'Got it',
      how: 'Sounds good',
      causes: 'Continue',
      impact: "Let's start",
    }),
    [],
  );

  const renderStep = (): ReactElement => {
    switch (stepKey) {
      case 'how':
        return (
          <FlexCol className="mx-auto w-full max-w-2xl items-center gap-8 text-center">
            <Reveal>
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title1}
                bold
                className="[text-wrap:balance]"
              >
                You act. We pay. Causes win.
              </Typography>
            </Reveal>
            <Reveal delay={120} className="flex w-full justify-center">
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
                  imageClassName="h-40 tablet:h-48"
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
                  {selectedCauses.length > 0
                    ? 'Your giving is now in motion'
                    : 'Real causes. Real impact.'}
                </Typography>
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
                  className="max-w-xl [text-wrap:pretty]"
                >
                  {selectedCauses.length > 0
                    ? 'From here, every action you take sends real money to the causes you picked. daily.dev funds it all, so it never costs you a thing.'
                    : "Your actions send real money straight to open-source maintainers, students, and devs who can't afford access. daily.dev funds it all, no cost to you."}
                </Typography>
              </FlexCol>
            </Reveal>

            <Reveal delay={220} className="w-full">
              <div className="mx-auto grid w-full max-w-3xl gap-3 tablet:grid-cols-3">
                {IMPACT_VALUES.map((value) => (
                  <FlexCol
                    key={value.title}
                    className="h-full items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5 text-center"
                  >
                    <span className="flex size-11 items-center justify-center rounded-14 bg-gradient-to-br from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default text-white [&_svg]:size-6">
                      {value.icon}
                    </span>
                    <Typography bold type={TypographyType.Title3}>
                      {value.title}
                    </Typography>
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Secondary}
                    >
                      {value.sub}
                    </Typography>
                  </FlexCol>
                ))}
              </div>
            </Reveal>
            {selectedCauses.length > 0 && (
              <Reveal delay={320}>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                  bold
                  className="max-w-xl [text-wrap:pretty]"
                >
                  Thank you for choosing who to back. From now on, your everyday
                  actions turn into real support for them. 💜
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
                Your activity funds real causes
              </Typography>
            </Reveal>
            <Reveal delay={220}>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="max-w-xl [text-wrap:pretty]"
              >
                daily.dev would rather back developers than ad networks. So we
                take our marketing budget and donate it, and you decide where it
                goes.
              </Typography>
            </Reveal>
          </FlexCol>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="How daily.dev Giveback works"
      className="fixed inset-0 z-modal flex flex-col overflow-y-auto bg-background-default"
    >
      <GivebackBackground />

      {/* Just a close affordance on replay — the heavy progress bar is gone. */}
      <header className="relative flex h-12 items-center justify-end px-4">
        {canClose && (
          <CloseButton
            type="button"
            size={ButtonSize.Small}
            onClick={onClose}
          />
        )}
      </header>

      <main
        className={classNames(
          'relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-4 tablet:px-6',
          // The cause picker changes height as you filter; top-anchor it so the
          // title + filters stay put and only the list below reflows (no
          // re-centering jump). Shorter steps stay vertically centered.
          stepKey === 'causes' ? 'justify-start' : 'justify-center',
        )}
      >
        {/* Lightweight carousel dots sit above the step content as a quick "where
            am I" cue, just over each step's title. */}
        <FlexRow className="mb-8 justify-center gap-2" aria-hidden>
          {STEP_KEYS.map((key, index) => (
            <span
              key={key}
              className={classNames(
                'h-2 rounded-4 transition-all duration-300',
                index === stepIndex
                  ? 'w-5 bg-accent-cabbage-default'
                  : 'w-2 bg-border-subtlest-tertiary',
              )}
            />
          ))}
        </FlexRow>

        {/* Keyed by step so the choreographed enter replays on every advance. */}
        <div key={stepKey} className="flex w-full flex-col">
          {renderStep()}
        </div>
      </main>

      {/* A small floating control bar of a fixed width: a glass pill that hovers
          above the page (shadow for depth), centered. The buttons flex to fill
          it - so a lone CTA spans the whole bar, and Back + Next split it evenly,
          keeping the bar the same width on every step. */}
      {/* Nested-radius rule: the bar's corner = the inner button radius
          (Large = rounded-14) + the bar's padding (p-2 = 8px) => rounded-22, so
          the inner and outer curves stay concentric. */}
      <footer className="pointer-events-none sticky bottom-0 z-3 flex justify-center px-4 pb-5 pt-2">
        <FlexRow className="bg-background-default/95 pointer-events-auto w-full max-w-md items-center gap-2 rounded-22 border border-border-subtlest-secondary p-2 shadow-2 backdrop-blur-xl">
          {!isFirst && (
            <Button
              type="button"
              size={ButtonSize.Large}
              variant={ButtonVariant.Float}
              className="flex-1"
              onClick={goBack}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="flex-1"
            disabled={
              causesBlock || (stepKey === 'causes' && selection.isSaving)
            }
            onClick={goNext}
          >
            {ctaLabel[stepKey]}
            {/* On the final step a forward "move to" icon on the right reads as
                "go take action next", not a "you're done" checkmark. */}
            {isLast && (
              <MoveToIcon aria-hidden size={IconSize.Small} className="ml-1" />
            )}
          </Button>
        </FlexRow>
      </footer>

      {!videoClosed && (
        <GivebackFunnelVideo
          slotRef={videoSlotRef}
          docked={stepIndex > 0}
          onClose={() => setVideoClosed(true)}
        />
      )}
    </div>
  );
};
