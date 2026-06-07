import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { FunnelStepPersonaQuiz } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { DownvoteIcon, UpvoteIcon } from '../../../components/icons';
import ConfettiSvg from '../../../svg/ConfettiSvg';
import { usePersonaQuiz } from './persona/usePersonaQuiz';
import type { DeveloperPersona } from './persona/data';
import styles from './FunnelPersonaQuiz.module.css';

// Fallback until a mascot video is provided via parameters.
const MASCOT_EMOJI = '🧞';

const MASCOT_GLOW = 'drop-shadow(0 0 40px rgba(192,132,252,.45))';

type MascotSize = 'sm' | 'md' | 'lg';

const MASCOT_VIDEO_SIZE: Record<MascotSize, string> = {
  sm: 'h-32 w-32',
  md: 'h-48 w-48',
  lg: 'h-96 w-96',
};

const MASCOT_EMOJI_SIZE: Record<MascotSize, string> = {
  sm: 'text-6xl',
  md: 'text-[6rem]',
  lg: 'text-[12rem]',
};

interface MascotProps {
  videoUrl?: string;
  size?: MascotSize;
  /** Plays the thinking animation while true; otherwise rests on the first frame. */
  playing?: boolean;
  className?: string;
}

const Mascot = ({
  videoUrl,
  size = 'md',
  playing = false,
  className,
}: MascotProps): ReactElement => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    // Start the thinking animation on each answer and let it play through;
    // it is never stopped or reset once it begins.
    if (!video || !playing) {
      return;
    }
    video.currentTime = 0;
    video.playbackRate = 1.8;
    video.play().catch(() => undefined);
  }, [playing]);

  if (!videoUrl) {
    return (
      <span
        className={classNames(
          MASCOT_EMOJI_SIZE[size],
          'leading-none',
          className,
        )}
        style={{ filter: MASCOT_GLOW }}
      >
        {MASCOT_EMOJI}
      </span>
    );
  }

  // Convention: an alpha WebM (Chrome/Firefox) colocated with an HEVC .mov
  // sibling carrying alpha for Safari.
  const isWebm = videoUrl.endsWith('.webm');
  const hevcUrl = isWebm ? videoUrl.replace(/\.webm$/, '.mov') : undefined;

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      className={classNames(
        MASCOT_VIDEO_SIZE[size],
        'object-contain',
        className,
      )}
    >
      <source src={videoUrl} type={isWebm ? 'video/webm' : undefined} />
      {hevcUrl && (
        <source src={hevcUrl} type='video/quicktime; codecs="hvc1"' />
      )}
    </video>
  );
};

const THINKING_DOT_DELAYS = [0, 0.16, 0.32];

const ThinkingDots = (): ReactElement => (
  <span className="flex items-center gap-1.5" aria-label="Patchy is thinking">
    {THINKING_DOT_DELAYS.map((delay) => (
      <span
        key={delay}
        className={classNames(
          styles.dot,
          'size-2 rounded-full bg-accent-cabbage-default',
        )}
        style={{ animationDelay: `${delay}s` }}
      />
    ))}
  </span>
);

const warmthLabelFor = (value: number): string => {
  if (value >= 0.8) {
    return 'almost got it';
  }
  if (value >= 0.5) {
    return 'narrowing it down';
  }
  if (value >= 0.2) {
    return 'getting warmer';
  }
  return 'just getting started';
};

type PersonaCardSize = 'medium' | 'small';

interface PersonaCardProps {
  persona: DeveloperPersona;
  onSelect: (personaId: string) => void;
  size?: PersonaCardSize;
}

const PersonaCard = ({
  persona,
  onSelect,
  size = 'medium',
}: PersonaCardProps): ReactElement => (
  <button
    key={persona.id}
    type="button"
    onClick={() => onSelect(persona.id)}
    className="flex flex-col items-center gap-2 rounded-16 border-2 border-border-subtlest-tertiary bg-surface-float p-6 text-center transition-all hover:-translate-y-1 hover:border-accent-cabbage-default tablet:p-8"
  >
    <span
      className={
        size === 'small' ? 'text-4xl leading-none' : 'text-5xl leading-none'
      }
      style={{ color: persona.color }}
    >
      {persona.emoji}
    </span>
    <Typography
      type={size === 'small' ? TypographyType.Body : TypographyType.Title3}
      bold
    >
      {persona.name}
    </Typography>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
    >
      {persona.tagline}
    </Typography>
  </button>
);

function FunnelPersonaQuizComponent({
  parameters: { headline, explainer, cta, mascotVideoUrl },
  onTransition,
}: FunnelStepPersonaQuiz): ReactElement {
  const {
    phase,
    questionNumber,
    questionText,
    progress,
    isThinking,
    tiebreakPersonas,
    triplebreakPersonas,
    modifiers,
    selectedModifierIds,
    personas,
    result,
    isManual,
    questionsAnswered,
    start,
    answer,
    chooseTiebreak,
    pickManually,
    selectPersona,
    confirmPersona,
    toggleModifier,
  } = usePersonaQuiz();

  const handleComplete = () => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: {
        persona: result?.persona.id,
        modifiers: result?.modifiers ?? [],
        confidence: isManual ? undefined : result?.confidence,
        questions: questionsAnswered,
        manual: isManual,
      },
    });
  };

  if (phase === 'intro') {
    return (
      <div
        key={phase}
        className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10 text-center"
      >
        <Mascot videoUrl={mascotVideoUrl} size="md" className={styles.float} />
        <div className="flex max-w-3xl flex-col gap-4">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            bold
          >
            {headline || 'Let Patchy guess what kind of dev you are'}
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
          >
            {explainer ||
              'A few quick yes/no questions. Patchy handles the rest.'}
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            onClick={start}
            type="button"
          >
            {cta || 'Game on!'}
          </Button>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={pickManually}
            type="button"
          >
            Nah, I&apos;ll pick myself
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'picker') {
    return (
      <div
        key={phase}
        className="flex flex-1 flex-col items-center gap-6 px-6 py-10 text-center"
      >
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          Who are you, really?
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Pick your type. Patchy will pretend it knew all along.
        </Typography>
        <div className="flex w-full max-w-xl flex-col gap-2">
          {personas.map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => selectPersona(persona.id)}
              className="flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left transition-colors hover:border-accent-cabbage-default"
            >
              <span
                className="shrink-0 text-4xl leading-none"
                style={{ color: persona.color }}
              >
                {persona.emoji}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Typography type={TypographyType.Body} bold>
                  {persona.name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                >
                  {persona.tagline}
                </Typography>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'tiebreak') {
    return (
      <div
        key={phase}
        className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center"
      >
        <Mascot videoUrl={mascotVideoUrl} size="sm" className={styles.float} />
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          I&apos;m torn between these two.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Which one feels more like you?
        </Typography>
        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 tablet:grid-cols-2">
          {tiebreakPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onSelect={chooseTiebreak}
            />
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'triplebreak') {
    return (
      <div
        key={phase}
        className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center"
      >
        <Mascot videoUrl={mascotVideoUrl} size="sm" className={styles.float} />
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          You&apos;re a tough one. Could be any of these three.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Pick the one that fits best.
        </Typography>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 tablet:grid-cols-3">
          {triplebreakPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onSelect={chooseTiebreak}
              size="small"
            />
          ))}
        </div>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          onClick={pickManually}
          type="button"
        >
          None of these. Let me pick.
        </Button>
      </div>
    );
  }

  if (phase === 'modifiers' && result) {
    return (
      <div
        key={phase}
        className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center"
      >
        <Mascot videoUrl={mascotVideoUrl} size="sm" className={styles.float} />
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          One more thing.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-md"
        >
          Tick any of these that describe you. They tune your feed beyond your
          persona.
        </Typography>
        <div className="flex w-full max-w-xl flex-col gap-3">
          {modifiers.map((modifier) => {
            const checked = selectedModifierIds.includes(modifier.id);
            return (
              <button
                key={modifier.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggleModifier(modifier.id)}
                className={classNames(
                  'flex w-full items-center gap-4 rounded-16 border-2 p-4 text-left transition-colors',
                  checked
                    ? 'border-accent-cabbage-default bg-surface-float'
                    : 'border-border-subtlest-tertiary bg-surface-float hover:border-text-quaternary',
                )}
              >
                <span className="shrink-0 text-4xl leading-none">
                  {modifier.emoji}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Typography type={TypographyType.Body} bold>
                    {modifier.label}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Secondary}
                  >
                    {modifier.description}
                  </Typography>
                </span>
                <span
                  className={classNames(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-6 border-2 text-sm font-bold',
                    checked
                      ? 'border-accent-cabbage-default bg-accent-cabbage-default text-text-primary'
                      : 'border-border-subtlest-tertiary',
                  )}
                  aria-hidden
                >
                  {checked ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.XLarge}
          onClick={handleComplete}
          type="button"
        >
          {selectedModifierIds.length === 0
            ? 'None of these — continue'
            : 'Continue →'}
        </Button>
      </div>
    );
  }

  if (phase === 'reveal' && result) {
    const { persona } = result;
    return (
      <div
        key={phase}
        className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center"
      >
        <div className="relative flex items-center justify-center">
          <ConfettiSvg
            aria-hidden
            className="pointer-events-none absolute -top-10 h-44 w-72"
          />
          <span
            className={classNames(
              styles.revealEmoji,
              'text-[6rem] leading-none',
            )}
            style={
              {
                color: persona.color,
                filter: `drop-shadow(0 0 40px ${persona.color})`,
                '--persona-glow': persona.color,
              } as CSSProperties
            }
          >
            {persona.emoji}
          </span>
        </div>
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          className={styles.revealName}
          style={{ color: persona.color }}
        >
          {persona.name}
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className={classNames(styles.revealTagline, 'max-w-md')}
        >
          {persona.tagline}
        </Typography>
        <div
          className={classNames(
            styles.revealActions,
            'mt-2 flex flex-col items-center gap-3',
          )}
        >
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            onClick={confirmPersona}
            type="button"
          >
            {cta || "Yes, that's me!"}
          </Button>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={pickManually}
            type="button"
          >
            Nah, I&apos;ll pick myself
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div key={phase} className="flex flex-1 flex-col px-6 py-10">
      <div className="mx-auto flex w-full max-w-screen-laptop flex-col gap-2">
        <div className="flex items-center justify-between">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Question {questionNumber}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {warmthLabelFor(progress)}
          </Typography>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-10 bg-surface-float">
          <div
            className="h-full rounded-10 bg-accent-cabbage-default transition-[width] duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-screen-laptop items-center justify-center gap-6">
          <div
            key={`question-${questionNumber}`}
            className={classNames(
              styles.questionIn,
              'flex w-full max-w-xl flex-col gap-8 text-center',
            )}
          >
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.LargeTitle}
              bold
            >
              {questionText}
            </Typography>
            <div className="relative mx-auto w-full max-w-lg">
              <div
                className={classNames(
                  'flex flex-row gap-3 transition-opacity duration-200',
                  isThinking && 'pointer-events-none opacity-0',
                )}
              >
                <Button
                  className="flex-1"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Large}
                  type="button"
                  icon={<UpvoteIcon />}
                  disabled={isThinking}
                  onClick={() => answer(1)}
                >
                  Yes
                </Button>
                <Button
                  className="flex-1"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Large}
                  type="button"
                  disabled={isThinking}
                  onClick={() => answer(0.5)}
                >
                  Not sure
                </Button>
                <Button
                  className="flex-1"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Large}
                  type="button"
                  icon={<DownvoteIcon />}
                  disabled={isThinking}
                  onClick={() => answer(0)}
                >
                  No
                </Button>
              </div>
              {isThinking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ThinkingDots />
                </div>
              )}
            </div>
          </div>
          <Mascot
            videoUrl={mascotVideoUrl}
            size="lg"
            playing={isThinking}
            className="hidden shrink-0 laptop:block"
          />
        </div>
      </div>
    </div>
  );
}

export const FunnelPersonaQuiz = withIsActiveGuard(FunnelPersonaQuizComponent);
