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
  EarthIcon,
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

// A soft, on-brand pillar block behind each step's hero icon/illustration.
const Stage = ({ children }: { children: ReactNode }): ReactElement => (
  <FlexRow className="min-h-40 items-center justify-center">{children}</FlexRow>
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
    <FlexRow className="items-center gap-4">
      <FlexCol className="items-center gap-2">
        <span className="flex size-12 items-center justify-center rounded-16 bg-surface-float text-accent-cabbage-default [&_svg]:size-6">
          <UpvoteIcon />
        </span>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          Take an action
        </Typography>
      </FlexCol>

      <span
        className={classNames(
          'text-accent-cheese-default transition-opacity duration-500 motion-reduce:transition-none [&_svg]:size-6',
          filled ? 'opacity-100' : 'opacity-0',
        )}
      >
        <CoinIcon />
      </span>

      <FlexCol className="items-center gap-2">
        <div className="border-accent-cabbage-default/40 relative flex h-16 w-14 items-end overflow-hidden rounded-b-16 rounded-t-6 border-2 bg-surface-float">
          <div
            aria-hidden
            className="w-full bg-gradient-to-t from-accent-avocado-default to-accent-cabbage-default transition-[height] duration-1000 ease-out motion-reduce:transition-none"
            style={{ height: filled ? '72%' : '0%' }}
          />
        </div>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          Community pot
        </Typography>
      </FlexCol>
    </FlexRow>
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
    <Stage>{stage}</Stage>
    <FlexCol className="items-center gap-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="max-w-lg"
      >
        {body}
      </Typography>
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
            title="It's a team effort — and free for you"
            body="Every small action you take adds money to a shared community pot. We donate it together when we hit the goal. You never pay a cent."
          />
        );
      case 'causes':
        return (
          <FlexCol className="w-full gap-6">
            <FlexCol className="gap-2 text-center">
              <Eyebrow>Pick your causes</Eyebrow>
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title2}
                bold
              >
                Choose what we fund together
              </Typography>
            </FlexCol>
            <GivebackCauseSelection
              causes={selection.causes}
              isLoading={selection.isLoading}
              selectedIds={selection.selectedIds}
              onToggle={selection.toggleCause}
            />
          </FlexCol>
        );
      case 'impact':
        return (
          <StepLayout
            stage={<GivebackMascot imageClassName="h-40 tablet:h-44" />}
            eyebrow="Your impact"
            title="Beautiful choices"
            body={
              selection.selectedCount > 0
                ? `Your ${selection.selectedCount} ${
                    selection.selectedCount === 1 ? 'cause' : 'causes'
                  } help fund real things — open source, scholarships, and access to tech for people who need it. Chosen by you.`
                : 'These causes fund real things — open source, scholarships, and access to tech for people who need it. Chosen by the community.'
            }
          />
        );
      case 'example':
        return (
          <StepLayout
            stage={<FundingPot />}
            eyebrow="See it work"
            title="Take action → the pot grows"
            body="Upvote, share, comment — each action drops money into the pot. When the community reaches the goal, daily.dev sends every cent to your causes automatically. No effort, no cost."
          />
        );
      case 'start':
        return (
          <StepLayout
            stage={<GivebackMascot imageClassName="h-40 tablet:h-44" />}
            eyebrow="You're all set"
            title="Let's grow something good"
            body="Jump in, take your first action, and watch the community pot climb toward the goal. The more we grow, the more we give."
          />
        );
      case 'intro':
      default:
        return (
          <StepLayout
            stage={
              <span className="flex size-20 items-center justify-center rounded-32 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-2-cabbage [&_svg]:size-10">
                <EarthIcon />
              </span>
            }
            eyebrow="daily.dev giveback"
            title="We give our ad budget to good causes"
            body="Instead of paying ad giants to grow, daily.dev takes that budget and donates it to real-world causes. That's Giveback — and the community decides where it goes."
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

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8">
        {renderStep()}
      </main>

      <footer className="sticky bottom-0 mx-auto w-full max-w-2xl px-4 pb-6 pt-2">
        <Button
          type="button"
          size={ButtonSize.Large}
          variant={ButtonVariant.Primary}
          className="w-full"
          disabled={causesBlock || (stepKey === 'causes' && selection.isSaving)}
          onClick={goNext}
        >
          {isLast && <VIcon aria-hidden className="mr-1" />}
          {ctaLabel[stepKey]}
        </Button>
      </footer>
    </div>
  );
};
