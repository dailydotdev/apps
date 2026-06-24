import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
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

// The "aha" moment: an action drops a coin into the community pot, which fills
// toward the goal. Animates from empty on mount (when its step is reached).
const FundingPot = (): ReactElement => {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <FlexRow className="items-center gap-5">
      <FlexCol className="items-center gap-2">
        <span className="flex size-16 items-center justify-center rounded-20 bg-surface-float text-accent-cabbage-default [&_svg]:size-8">
          <UpvoteIcon />
        </span>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Take an action
        </Typography>
      </FlexCol>

      <span
        className={classNames(
          'text-accent-cheese-default [&_svg]:size-9',
          filled
            ? 'motion-safe:animate-coin-drop'
            : 'opacity-0 motion-reduce:opacity-100',
        )}
      >
        <CoinIcon />
      </span>

      <FlexCol className="items-center gap-2">
        <div className="border-accent-cabbage-default/40 relative flex h-28 w-24 items-end overflow-hidden rounded-b-20 rounded-t-8 border-2 bg-surface-float">
          <div
            aria-hidden
            className="w-full bg-gradient-to-t from-accent-avocado-default to-accent-cabbage-default transition-[height] duration-1000 ease-out motion-reduce:transition-none"
            style={{ height: filled ? '72%' : '0%' }}
          />
        </div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Community pot
        </Typography>
      </FlexCol>
    </FlexRow>
  );
};

// A real, concrete example pulled from the take-action list: the visitor "tries"
// an action and immediately sees the result — a posted share + money landing in
// the pot. Makes the abstract mechanic tangible.
const GivebackActionDemo = (): ReactElement => {
  const [done, setDone] = useState(false);

  return (
    <FlexCol className="w-full max-w-md gap-3 text-left">
      <FlexRow className="items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-12 bg-background-default text-text-primary [&_svg]:size-6">
          <TwitterIcon />
        </span>
        <FlexCol className="min-w-0 flex-1 gap-0.5">
          <Typography bold type={TypographyType.Callout}>
            Share daily.dev on X
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Post about daily.dev to your followers
          </Typography>
        </FlexCol>
        {done ? (
          <FlexRow className="shrink-0 items-center gap-1 rounded-10 bg-accent-avocado-flat px-2 py-1 font-bold text-accent-avocado-default typo-caption2 [&_svg]:size-4">
            <VIcon />
            Done
          </FlexRow>
        ) : (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            className="shrink-0"
            onClick={() => setDone(true)}
          >
            Try it
          </Button>
        )}
      </FlexRow>

      {done && (
        <Reveal className="flex flex-col gap-3">
          <FlexCol className="gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
            <FlexRow className="items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-cabbage-default font-bold text-white typo-caption1">
                Y
              </span>
              <FlexCol className="min-w-0">
                <Typography bold type={TypographyType.Caption1}>
                  You
                </Typography>
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Tertiary}
                >
                  @you · now
                </Typography>
              </FlexCol>
              <span className="ml-auto text-text-tertiary [&_svg]:size-5">
                <TwitterIcon />
              </span>
            </FlexRow>
            <Typography type={TypographyType.Footnote}>
              Just found @dailydotdev — the home for developers. The feed
              actually gets me. Worth a look 👀
            </Typography>
            <FlexRow className="items-center gap-4 text-text-tertiary [&_svg]:size-4">
              <FlexRow className="items-center gap-1 typo-caption2">
                <DiscussIcon />
                12
              </FlexRow>
              <FlexRow className="items-center gap-1 typo-caption2">
                <UpvoteIcon />
                148
              </FlexRow>
            </FlexRow>
          </FlexCol>

          <FlexRow className="items-center justify-between rounded-12 bg-accent-avocado-flat px-4 py-3 text-accent-avocado-default">
            <FlexRow className="items-center gap-2 [&_svg]:size-5">
              <CoinIcon />
              <Typography bold type={TypographyType.Footnote}>
                +50 dropped into the pot
              </Typography>
            </FlexRow>
            <Typography
              bold
              type={TypographyType.Caption1}
              className="tabular-nums"
            >
              Goal 64%
            </Typography>
          </FlexRow>

          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="text-center"
          >
            That&apos;s every action. One move, real money.
          </Typography>
        </Reveal>
      )}
    </FlexCol>
  );
};

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

  useEffect(() => {
    logEvent({
      event_name: LogEvent.StartGivebackFunnel,
      extra: JSON.stringify({ mode: canClose ? 'replay' : 'forced' }),
    });
    // Only on mount — a fresh funnel run is one "start".
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
          <StepLayout
            stage={<FundingPot />}
            eyebrow="How it works"
            title="You act. We pay. Causes win."
            body="Every action you take drops money into one shared pot. Hit the goal together and we donate it — automatically. It never costs you a cent."
          />
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
                  } straight to the people behind them — open-source maintainers, students, and devs who can't afford access. No middlemen.`
                : 'This money goes straight to the people behind these causes — open-source maintainers, students, and devs who can’t afford access. No middlemen.'
            }
          />
        );
      case 'example':
        return (
          <FlexCol className="w-full items-center gap-5 text-center">
            <Reveal>
              <Eyebrow>See it in action</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title1}
                bold
                className="[text-wrap:balance]"
              >
                One action. Watch what happens.
              </Typography>
            </Reveal>
            <Reveal delay={180} className="flex w-full justify-center">
              <GivebackActionDemo />
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
          <StepLayout
            stage={
              <span className="flex size-28 items-center justify-center rounded-32 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-2-cabbage [&_svg]:size-14">
                <EarthIcon />
              </span>
            }
            eyebrow="daily.dev giveback"
            title="Your activity funds real causes"
            body="daily.dev would rather back developers than ad networks. So we take our marketing budget and donate it — and you decide where it goes."
          />
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
    </div>
  );
};
