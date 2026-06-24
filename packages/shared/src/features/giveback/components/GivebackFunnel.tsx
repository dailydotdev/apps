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
  ArrowIcon,
  CoinIcon,
  DiscussIcon,
  EarthIcon,
  GiftIcon,
  TwitterIcon,
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

// Step keys double as analytics labels and drive the progress bar.
const STEP_KEYS = [
  'intro',
  'how',
  'causes',
  'impact',
  'example',
  'start',
] as const;
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

// Step 2: the whole campaign at a glance, so the flow is never a mystery.
const FLOW_STEPS: ReadonlyArray<{
  icon: ReactElement;
  title: string;
  sub: string;
}> = [
  {
    icon: <UpvoteIcon />,
    title: 'You take an action',
    sub: 'Post, talk, write, or host',
  },
  {
    icon: <CoinIcon />,
    title: 'daily.dev adds money',
    sub: 'Into the shared community pot',
  },
  {
    icon: <VIcon />,
    title: 'We hit the goal together',
    sub: 'The whole community chips in',
  },
  {
    icon: <GiftIcon />,
    title: 'We fund your causes',
    sub: 'Automatically, every cent',
  },
];

const FlowSequence = (): ReactElement => (
  <FlexCol className="w-full gap-2 tablet:flex-row tablet:items-stretch tablet:gap-1">
    {FLOW_STEPS.map((flowStep, index) => (
      <React.Fragment key={flowStep.title}>
        <FlexRow className="flex-1 items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left tablet:flex-col tablet:text-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white [&_svg]:size-6">
            {flowStep.icon}
          </span>
          <FlexCol className="gap-0.5 tablet:items-center">
            <Typography bold type={TypographyType.Footnote}>
              {flowStep.title}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {flowStep.sub}
            </Typography>
          </FlexCol>
        </FlexRow>
        {index < FLOW_STEPS.length - 1 && (
          <span
            aria-hidden
            className="flex items-center justify-center text-text-quaternary [&_svg]:size-5"
          >
            <ArrowIcon className="rotate-180 tablet:rotate-90" />
          </span>
        )}
      </React.Fragment>
    ))}
  </FlexCol>
);

// The cause payout for an action, in plain dollars.
const RewardTag = ({ amount }: { amount: number }): ReactElement => (
  <FlexRow className="shrink-0 items-center gap-1 rounded-8 bg-accent-avocado-flat px-2 py-0.5 text-accent-avocado-default [&_svg]:size-3.5">
    <CoinIcon />
    <Typography bold type={TypographyType.Caption2} className="tabular-nums">
      +${amount}
    </Typography>
  </FlexRow>
);

const ProofFooter = ({
  action,
  amount,
}: {
  action: string;
  amount: number;
}): ReactElement => (
  <FlexRow className="mt-1 items-center justify-between gap-2 border-t border-border-subtlest-tertiary pt-2.5">
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Tertiary}
      bold
      className="uppercase tracking-wide"
    >
      {action}
    </Typography>
    <RewardTag amount={amount} />
  </FlexRow>
);

// Real community proof: three believable posts from real action types, so the
// visitor can picture exactly what to do and what it gives back.
const CommunityProof = (): ReactElement => (
  <div className="grid w-full grid-cols-1 gap-3 text-left tablet:grid-cols-3">
    <FlexCol className="gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      <FlexRow className="items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-cabbage-default font-bold text-white typo-caption1">
          MR
        </span>
        <FlexCol className="min-w-0">
          <Typography bold type={TypographyType.Caption1}>
            Maya Rivera
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            @maya.builds
          </Typography>
        </FlexCol>
        <span className="ml-auto text-text-tertiary [&_svg]:size-5">
          <TwitterIcon />
        </span>
      </FlexRow>
      <Typography type={TypographyType.Caption1}>
        Gave a talk on dev tooling today and put @dailydotdev front and center.
        The room ate it up 🔥
      </Typography>
      <FlexRow className="items-center gap-4 text-text-tertiary [&_svg]:size-4">
        <FlexRow className="items-center gap-1 typo-caption2">
          <DiscussIcon />
          24
        </FlexRow>
        <FlexRow className="items-center gap-1 typo-caption2">
          <UpvoteIcon />
          312
        </FlexRow>
      </FlexRow>
      <ProofFooter action="Speak at an event" amount={200} />
    </FlexCol>

    <FlexCol className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
      <div className="relative h-28 w-full bg-gradient-to-br from-accent-onion-default to-accent-cabbage-default">
        <span className="bg-white/90 absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full">
          <span
            aria-hidden
            className="ml-1 border-y-[7px] border-l-[12px] border-y-transparent border-l-black"
          />
        </span>
      </div>
      <FlexCol className="gap-2 p-4">
        <Typography bold type={TypographyType.Footnote}>
          Why daily.dev is my homepage now
        </Typography>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          Sam Codes · 18K views
        </Typography>
        <ProofFooter action="Make a video" amount={150} />
      </FlexCol>
    </FlexCol>

    <FlexCol className="gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      <FlexRow className="items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-secondary [&_svg]:size-5">
          <EarthIcon />
        </span>
        <FlexCol className="min-w-0">
          <Typography bold type={TypographyType.Caption1}>
            lena.dev
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            6 min read
          </Typography>
        </FlexCol>
      </FlexRow>
      <Typography bold type={TypographyType.Footnote}>
        How I finally fixed my dev feed
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        The setup that keeps me current without the endless noise.
      </Typography>
      <ProofFooter action="Write a post" amount={120} />
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

interface StepLayoutProps {
  stage: ReactNode;
  eyebrow: string;
  title: string;
  body: string;
}

const StepLayout = ({
  stage,
  eyebrow,
  title,
  body,
}: StepLayoutProps): ReactElement => (
  <FlexCol className="items-center gap-5 text-center">
    <Reveal>
      <Stage>{stage}</Stage>
    </Reveal>
    <FlexCol className="items-center gap-3">
      <Reveal delay={90}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={180}>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title1}
          bold
          className="[text-wrap:balance]"
        >
          {title}
        </Typography>
      </Reveal>
      <Reveal delay={270}>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="max-w-xl [text-wrap:pretty]"
        >
          {body}
        </Typography>
      </Reveal>
    </FlexCol>
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
      impact: 'Love it',
      example: "I'm in",
      start: "Let's start",
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
          <StepLayout
            stage={<GivebackMascot imageClassName="h-52 tablet:h-64" />}
            eyebrow="Nice picks"
            title="Real causes. Real impact."
            body={
              selection.selectedCount > 0
                ? `Your ${selection.selectedCount} ${
                    selection.selectedCount === 1 ? 'pick goes' : 'picks go'
                  } straight to the people behind them: open-source maintainers, students, and devs who can't afford access. No middlemen.`
                : "This money goes straight to the people behind these causes: open-source maintainers, students, and devs who can't afford access. No middlemen."
            }
          />
        );
      case 'example':
        return (
          <FlexCol className="w-full items-center gap-5 text-center">
            <Reveal>
              <Eyebrow>Real people, real actions</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title1}
                bold
                className="[text-wrap:balance]"
              >
                This is what taking action looks like
              </Typography>
            </Reveal>
            <Reveal delay={180} className="w-full">
              <CommunityProof />
            </Reveal>
            <Reveal delay={320}>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                Every post here sent real money to the community&apos;s causes.
              </Typography>
            </Reveal>
          </FlexCol>
        );
      case 'start':
        return (
          <StepLayout
            stage={<GivebackMascot imageClassName="h-52 tablet:h-64" />}
            eyebrow="You're in"
            title="Let's fund something real"
            body="Take your first action now. The more we move together, the more we give. Your causes are counting on it."
          />
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

      <header className="relative flex items-center gap-3 px-4 py-4">
        {!isFirst ? (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={goBack}
            aria-label="Back"
          />
        ) : (
          <span className="size-8 shrink-0" />
        )}

        <FlexRow className="flex-1 items-center gap-1.5" aria-hidden>
          {STEP_KEYS.map((key, index) => (
            <span
              key={key}
              className={classNames(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                index <= stepIndex
                  ? 'bg-accent-cabbage-default'
                  : 'bg-border-subtlest-tertiary',
              )}
            />
          ))}
        </FlexRow>

        {canClose ? (
          <CloseButton
            type="button"
            size={ButtonSize.Small}
            onClick={onClose}
          />
        ) : (
          <span className="size-8 shrink-0" />
        )}
      </header>

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-8">
        {/* Keyed by step so the choreographed enter replays on every advance. */}
        <div key={stepKey} className="flex w-full flex-col">
          {renderStep()}
        </div>
      </main>

      <footer className="sticky bottom-0 mx-auto w-full max-w-4xl px-6 pb-6 pt-2">
        <Reveal key={stepKey} delay={360}>
          <Button
            type="button"
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full"
            disabled={
              causesBlock || (stepKey === 'causes' && selection.isSaving)
            }
            onClick={goNext}
          >
            {isLast && <VIcon aria-hidden className="mr-1" />}
            {ctaLabel[stepKey]}
          </Button>
        </Reveal>
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
