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
  MedalBadgeIcon,
  UpvoteIcon,
  VIcon,
} from '../../../components/icons';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import type { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';
import { GivebackBackground } from './GivebackBackground';
import { GivebackMascot } from './GivebackMascot';
import { GivebackCauseSelection } from './GivebackCauseSelection';
import { GivebackCampaignVideo } from './GivebackCampaignVideo';

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

// The campaign as a connected milestone track: the community acts together,
// raises the bar, unlocks the goal (the glowing focal point), and the budget is
// released to causes. Each node has its own accent so it reads as a journey, not
// four identical tiles.
const FLOW_STEPS: ReadonlyArray<{
  icon: ReactElement;
  title: string;
  sub: string;
  gradient: string;
  isGoal?: boolean;
}> = [
  {
    icon: <UpvoteIcon />,
    title: 'Everyone takes action',
    sub: 'Post, talk, write, or host',
    gradient: 'from-accent-cabbage-default to-accent-onion-default',
  },
  {
    icon: <CoinIcon />,
    title: 'We raise the bar together',
    sub: 'Every action grows the pot',
    gradient: 'from-accent-cabbage-default to-accent-avocado-default',
  },
  {
    icon: <MedalBadgeIcon />,
    title: 'We unlock the goal',
    sub: 'Hit the milestone, release the budget',
    gradient: 'from-accent-cheese-default to-accent-bacon-default',
    isGoal: true,
  },
  {
    icon: <GiftIcon />,
    title: 'Causes get funded',
    sub: 'Every dollar, automatically',
    gradient: 'from-accent-avocado-default to-accent-lettuce-default',
  },
];

const FlowSequence = (): ReactElement => (
  <div className="relative w-full">
    {/* The connecting track, gradient-filled to read as momentum to the goal. */}
    <div
      aria-hidden
      className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 bg-gradient-to-r from-accent-cabbage-default via-accent-avocado-default to-accent-cheese-default tablet:block"
    />
    <FlexCol className="relative gap-6 tablet:flex-row tablet:gap-0">
      {FLOW_STEPS.map((step) => (
        <FlexCol
          key={step.title}
          className="flex-1 items-center gap-3 text-center"
        >
          <span className="relative">
            {step.isGoal && (
              <span
                aria-hidden
                className="bg-accent-cheese-default/30 absolute -inset-1.5 rounded-full blur-md motion-safe:animate-glow-pulse"
              />
            )}
            <span
              className={classNames(
                'ring-white/15 relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-2 ring-1 ring-inset [&_svg]:size-7',
                step.gradient,
              )}
            >
              {step.icon}
            </span>
          </span>
          <FlexCol className="max-w-[12rem] gap-0.5">
            <Typography bold type={TypographyType.Footnote}>
              {step.title}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {step.sub}
            </Typography>
          </FlexCol>
        </FlexCol>
      ))}
    </FlexCol>
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.Span}
    type={TypographyType.Caption1}
    color={TypographyColor.Tertiary}
    bold
    className="uppercase tracking-wider"
  >
    {children}
  </Typography>
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
  // moment celebrates exactly what they chose to fund.
  const selectedCauses = selection.causes
    .filter((cause) => selection.selectedIds.has(cause.id))
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
          <FlexCol className="w-full items-center gap-6 text-center">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title1}
                bold
                className="[text-wrap:balance]"
              >
                You act. We pay. Causes win.
              </Typography>
            </Reveal>
            <Reveal delay={180} className="w-full">
              <FlowSequence />
            </Reveal>
            <Reveal delay={300}>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                You never pay a cent. daily.dev funds every dollar.
              </Typography>
            </Reveal>
          </FlexCol>
        );
      case 'causes':
        return (
          <FlexCol className="w-full gap-6">
            <Reveal>
              <FlexCol className="gap-2 text-center">
                <Eyebrow>Pick your causes</Eyebrow>
                <Typography
                  tag={TypographyTag.H2}
                  type={TypographyType.Title2}
                  bold
                  className="[text-wrap:balance]"
                >
                  Choose what we fund together
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
          <FlexCol className="w-full items-center gap-5 text-center">
            <Reveal>
              <Stage>
                <GivebackMascot imageClassName="h-40 tablet:h-48" />
              </Stage>
            </Reveal>
            <Reveal delay={90}>
              <Eyebrow>Your impact</Eyebrow>
            </Reveal>
            <Reveal delay={180}>
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title1}
                bold
                className="[text-wrap:balance]"
              >
                {selectedCauses.length > 0
                  ? 'Look what you just set in motion'
                  : 'Real causes. Real impact.'}
              </Typography>
            </Reveal>

            {selectedCauses.length > 0 ? (
              <>
                <Reveal delay={250}>
                  <Typography
                    tag={TypographyTag.P}
                    type={TypographyType.Body}
                    color={TypographyColor.Secondary}
                    className="max-w-xl [text-wrap:pretty]"
                  >
                    Because you chose{' '}
                    {selectedCauses.length === 1 ? 'this' : 'these'}, every
                    action you take sends real money straight to:
                  </Typography>
                </Reveal>
                <Reveal delay={330} className="w-full">
                  <div className="mx-auto grid w-full max-w-3xl gap-3 tablet:grid-cols-3">
                    {selectedCauses.map((cause) => (
                      <FlexCol
                        key={cause.id}
                        className="border-accent-avocado-default/40 h-full items-center gap-2 rounded-16 border bg-accent-avocado-flat p-4 text-center"
                      >
                        <span className="flex size-11 items-center justify-center rounded-14 bg-accent-avocado-default text-white [&_svg]:size-6">
                          <GiftIcon />
                        </span>
                        <Typography bold type={TypographyType.Callout}>
                          {cause.title}
                        </Typography>
                        {cause.description && (
                          <Typography
                            type={TypographyType.Caption1}
                            color={TypographyColor.Secondary}
                          >
                            {cause.description}
                          </Typography>
                        )}
                      </FlexCol>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={440}>
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                    bold
                    className="max-w-xl [text-wrap:pretty]"
                  >
                    Thank you for giving back. The community is better because
                    of you. 💚
                  </Typography>
                </Reveal>
              </>
            ) : (
              <Reveal delay={250}>
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
                  className="max-w-xl [text-wrap:pretty]"
                >
                  Your actions send real money straight to the people behind
                  these causes: open-source maintainers, students, and devs who
                  can&apos;t afford access. No middlemen.
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
            <Reveal delay={90}>
              <Eyebrow>daily.dev giveback</Eyebrow>
            </Reveal>
            <Reveal delay={180}>
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title1}
                bold
                className="[text-wrap:balance]"
              >
                Your activity funds real causes
              </Typography>
            </Reveal>
            <Reveal delay={270}>
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

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-4">
        {/* Keyed by step so the choreographed enter replays on every advance. */}
        <div key={stepKey} className="flex w-full flex-col">
          {renderStep()}
        </div>
      </main>

      <footer className="sticky bottom-0 mx-auto flex w-full max-w-md flex-col gap-4 px-6 pb-6 pt-3">
        {/* Lightweight carousel dots: a quick "where am I" without a long bar. */}
        <FlexRow className="justify-center gap-2" aria-hidden>
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

        <FlexRow className="items-center gap-3">
          {!isFirst && (
            <Button
              type="button"
              size={ButtonSize.Large}
              variant={ButtonVariant.Float}
              className="shrink-0"
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
            {isLast && <VIcon aria-hidden className="mr-1" />}
            {ctaLabel[stepKey]}
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
