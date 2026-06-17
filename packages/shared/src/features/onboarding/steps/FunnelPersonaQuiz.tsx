import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { FunnelStepPersonaQuiz } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  ButtonSize,
  ButtonV2,
  ButtonVariant,
} from '../../../components/buttons/ButtonV2';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { DownvoteIcon, UpvoteIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { usePersonaQuiz } from './persona/usePersonaQuiz';
import type { AnswerValue } from './persona/engine';
import type { DeveloperPersona } from './persona/data';
import styles from './FunnelPersonaQuiz.module.css';

// Fallback until a mascot video is provided via parameters.
const MASCOT_EMOJI = '🧞';

const MASCOT_GLOW = 'drop-shadow(0 0 40px rgba(192,132,252,.45))';

type MascotSize = 'sm' | 'md' | 'lg';

const MASCOT_VIDEO_SIZE: Record<MascotSize, string> = {
  sm: 'h-32 w-32',
  md: 'h-48 w-48',
  // Patchy stays compact on mobile so the bubble and answers keep room, then
  // grows to full size beside the content on laptop.
  lg: 'h-32 w-32 tablet:h-40 tablet:w-40 laptop:h-96 laptop:w-96',
};

const MASCOT_EMOJI_SIZE: Record<MascotSize, string> = {
  sm: 'text-6xl',
  md: 'text-[6rem]',
  lg: 'text-7xl tablet:text-8xl laptop:text-[12rem]',
};

// Patchy sits above the bubble on mobile and to its right on laptop.
const MASCOT_STAGE_CLASS = 'order-first shrink-0 laptop:order-none';

type MascotState =
  | 'thinking'
  | 'reveal'
  | 'unsure'
  | 'onpath'
  | 'idle1'
  | 'idle2';

// How long Patchy rests before a random idle clip plays, and between idles.
const IDLE_MIN_DELAY_MS = 2600;
const IDLE_MAX_DELAY_MS = 6500;

const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min);

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface MascotProps {
  /** Base path; each clip resolves to `${baseUrl}-${state}.webm` (+ .mov). */
  baseUrl?: string;
  /** All clips to mount and preload, so switching never re-decodes/flashes. */
  clips?: MascotState[];
  /** The clip Patchy rests on; also the one replayed on the `playing` beat. */
  activeClip?: MascotState;
  /** Idle fillers played at random while Patchy is otherwise at rest. */
  idleClips?: MascotState[];
  size?: MascotSize;
  /** Replays the active clip whenever it flips true (e.g. the thinking beat). */
  playing?: boolean;
  /** Playback speed; the thinking clip runs faster, the rest at natural speed. */
  playbackRate?: number;
  /** Fires once the active clip passes its halfway point. */
  onHalfway?: () => void;
  className?: string;
}

const Mascot = ({
  baseUrl,
  clips = ['thinking'],
  activeClip = clips[0],
  idleClips,
  size = 'md',
  playing = false,
  playbackRate = 1,
  onHalfway,
  className,
}: MascotProps): ReactElement => {
  const videoRefs = useRef<Partial<Record<MascotState, HTMLVideoElement>>>({});
  // The clip currently animating, or null when Patchy rests. Idle scheduling
  // keys off this being null.
  const [playingClip, setPlayingClip] = useState<MascotState | null>(null);
  // What's actually painted. It only advances once a clip is truly rendering
  // (its `playing` event), so a swap never reveals a blank/seeking frame —
  // which, with alpha clips, shows through as a flicker.
  const [shownClip, setShownClip] = useState<MascotState>(activeClip);

  // Mount every primary and idle clip so swaps never re-decode or flash black.
  const mountedClips = useMemo(
    () => Array.from(new Set([...clips, ...(idleClips ?? [])])),
    [clips, idleClips],
  );

  const play = useCallback(
    (clip: MascotState) => {
      const video = videoRefs.current[clip];
      if (!video) {
        return;
      }
      // Only one clip animates at a time; pausing the rest also stops their
      // `ended` from later clobbering the active clip's state.
      Object.entries(videoRefs.current).forEach(([key, other]) => {
        if (key !== clip && other && !other.paused) {
          other.pause();
        }
      });
      video.currentTime = 0;
      video.playbackRate = clip === activeClip ? playbackRate : 1;
      setPlayingClip(clip);
      video.play().catch(() => undefined);
    },
    [activeClip, playbackRate],
  );

  // Entry animation: play the active clip once when Patchy first appears.
  useEffect(() => {
    if (!baseUrl) {
      return;
    }
    play(activeClip);
    // Mount-only; later replays go through the `playing` effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  // Replay the active clip whenever `playing` re-arms (e.g. each answer).
  useEffect(() => {
    if (!baseUrl || !playing) {
      return;
    }
    play(activeClip);
  }, [baseUrl, playing, activeClip, play]);

  // While Patchy rests, occasionally play a random idle clip.
  useEffect(() => {
    if (
      !baseUrl ||
      playingClip !== null ||
      !idleClips?.length ||
      prefersReducedMotion()
    ) {
      return undefined;
    }
    const timeout = setTimeout(
      () => play(idleClips[Math.floor(Math.random() * idleClips.length)]),
      randomBetween(IDLE_MIN_DELAY_MS, IDLE_MAX_DELAY_MS),
    );
    return () => clearTimeout(timeout);
  }, [baseUrl, playingClip, idleClips, play]);

  // Swap the visible clip only once it has begun rendering frames.
  const handlePlaying = (clip: MascotState): void => {
    setShownClip(clip);
  };

  const handleEnded = (clip: MascotState): void => {
    // Keep the ended clip's last frame on screen until the next one renders.
    setPlayingClip((current) => (current === clip ? null : current));
  };

  const handleTimeUpdate = (
    event: React.SyntheticEvent<HTMLVideoElement>,
  ): void => {
    const video = event.currentTarget;
    if (
      onHalfway &&
      video.duration &&
      video.currentTime >= video.duration / 2
    ) {
      onHalfway();
    }
  };

  if (!baseUrl) {
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

  return (
    <div className={classNames('relative', MASCOT_VIDEO_SIZE[size], className)}>
      {mountedClips.map((clip) => (
        <video
          key={clip}
          ref={(el) => {
            if (el) {
              videoRefs.current[clip] = el;
            }
          }}
          muted
          playsInline
          preload="auto"
          onPlaying={() => handlePlaying(clip)}
          onEnded={() => handleEnded(clip)}
          onTimeUpdate={clip === activeClip ? handleTimeUpdate : undefined}
          className={classNames(
            'absolute inset-0 h-full w-full object-contain transition-opacity duration-150',
            clip === shownClip ? 'opacity-100' : 'opacity-0',
          )}
        >
          <source src={`${baseUrl}-${clip}.webm`} type="video/webm" />
          <source
            src={`${baseUrl}-${clip}.mov`}
            type='video/quicktime; codecs="hvc1"'
          />
        </video>
      ))}
    </div>
  );
};

// Clips the in-quiz mascot can swap between; all preloaded to avoid flashes.
const QUIZ_CLIPS: MascotState[] = ['thinking', 'onpath', 'unsure'];

// Random idle fillers played whenever Patchy is waiting on the user.
const IDLE_CLIPS: MascotState[] = ['idle1', 'idle2'];

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

// Phrases the result as something Patchy says, e.g. "You're a Backend
// Developer". Personas already prefixed with "The" keep their article.
const personaRevealPhrase = (name: string): string => {
  if (name.startsWith('The ')) {
    return `You're the ${name.slice(4)}`;
  }
  const article = /^[aeiou]/i.test(name) ? 'an' : 'a';
  return `You're ${article} ${name}`;
};

const SpeechBubble = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      styles.panel,
      'relative w-full p-6 text-center tablet:p-8',
      className,
    )}
  >
    {children}
    {/* Thought-cloud trailing toward Patchy: up on mobile (he sits above the
     * bubble), out to the right on laptop (he sits beside it). */}
    <span
      aria-hidden
      className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col-reverse items-center gap-1.5 laptop:hidden"
    >
      <span className={classNames(styles.bubbleDot, 'h-4 w-4')} />
      <span className={classNames(styles.bubbleDot, 'h-2.5 w-2.5')} />
      <span className={classNames(styles.bubbleDot, 'h-1.5 w-1.5')} />
    </span>
    <span
      aria-hidden
      className="absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 items-center gap-2 laptop:flex"
    >
      <span className={classNames(styles.bubbleDot, 'h-5 w-5')} />
      <span className={classNames(styles.bubbleDot, 'h-3 w-3')} />
      <span className={classNames(styles.bubbleDot, 'h-2 w-2')} />
    </span>
  </div>
);

// Fixed configs (left column / size / timing) so the floating dust is stable
// across SSR and re-renders instead of jumping on every paint. Delays are
// negative so each speck starts partway through its rise: at load the dust is
// already spread up the screen instead of bunched at the bottom edge.
const MAGIC_PARTICLES = [
  { left: '10%', size: 3, delay: '-2.5s', duration: '5s' },
  { left: '22%', size: 5, delay: '-1.6s', duration: '6.2s' },
  { left: '34%', size: 3, delay: '-3.2s', duration: '4.6s' },
  { left: '44%', size: 4, delay: '-0.8s', duration: '5.6s' },
  { left: '52%', size: 6, delay: '-2.4s', duration: '6.8s' },
  { left: '61%', size: 3, delay: '-4s', duration: '5.2s' },
  { left: '70%', size: 5, delay: '-0.4s', duration: '6s' },
  { left: '79%', size: 4, delay: '-3s', duration: '4.4s' },
  { left: '88%', size: 3, delay: '-1.2s', duration: '6.4s' },
  { left: '16%', size: 4, delay: '-3.8s', duration: '5.4s' },
  { left: '66%', size: 3, delay: '-4.6s', duration: '4.8s' },
  { left: '93%', size: 5, delay: '-2s', duration: '7s' },
];

// Decorative spotlight-stage layer: a colour-shifting aurora plus floating
// "magic dust" rising from the lamp. Purely presentational, behind content.
const StageBackdrop = (): ReactElement => (
  <div aria-hidden className={styles.stageBackdrop}>
    <span className={styles.auroraAlt} />
    {MAGIC_PARTICLES.map((particle) => (
      <span
        key={particle.left + particle.delay}
        className={styles.magicParticle}
        style={
          {
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            '--particle-delay': particle.delay,
            '--particle-duration': particle.duration,
          } as React.CSSProperties
        }
      />
    ))}
  </div>
);

interface QuizStageProps {
  /** When set, the progress header is shown; otherwise it stays in the DOM but
   * invisible so the intro/reveal screens don't shift relative to questions. */
  progress?: { questionNumber: number; value: number };
  mascot: ReactNode;
  children: ReactNode;
}

// Shared skeleton for the intro, question and reveal screens: a top progress
// header (reserved on every screen) above the bubble + Patchy. On mobile Patchy
// stacks on top with actions anchored to the bottom thumb zone; on laptop they
// sit side by side as a centered row.
const QuizStage = ({
  progress,
  mascot,
  children,
}: QuizStageProps): ReactElement => (
  <div className="flex flex-1 flex-col px-4 py-6 tablet:px-6 laptop:py-10">
    <div
      aria-hidden={!progress}
      className={classNames(
        'mx-auto flex w-full max-w-screen-laptop flex-col gap-2',
        !progress && 'invisible',
      )}
    >
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Question {progress?.questionNumber ?? 1}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {warmthLabelFor(progress?.value ?? 0)}
        </Typography>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-10 bg-surface-float">
        <div
          className={classNames(
            styles.progressFill,
            'h-full rounded-10 transition-[width] duration-500',
          )}
          style={{ width: `${(progress?.value ?? 0) * 100}%` }}
        />
      </div>
    </div>
    <div className="mx-auto mt-4 flex w-full max-w-screen-laptop flex-1 flex-col items-center gap-8 laptop:mt-0 laptop:flex-row laptop:items-center laptop:justify-center laptop:gap-6">
      {children}
      {mascot}
    </div>
  </div>
);

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
    className={classNames(
      styles.card,
      'flex flex-col items-center gap-2 rounded-16 border-2 border-border-subtlest-tertiary bg-surface-float p-6 text-center hover:-translate-y-1 hover:border-accent-cabbage-default active:translate-y-0 active:scale-[0.98] tablet:p-8',
    )}
  >
    <span
      className={classNames(
        styles.cardEmoji,
        size === 'small' ? 'text-4xl leading-none' : 'text-5xl leading-none',
      )}
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

// Reveal firework: glowing dots (same family as the floating dust) explode
// radially from the emblem centre. Generated once (deterministic, no
// randomness) so it's SSR-stable.
const FIREWORK_COLORS = [
  'var(--theme-accent-cabbage-default)',
  'var(--theme-accent-cabbage-bolder)',
  'var(--theme-accent-cabbage-subtler)',
  'var(--theme-accent-onion-default)',
  'var(--theme-accent-onion-bolder)',
  'var(--theme-accent-onion-subtler)',
];

const REVEAL_FIREWORK = Array.from({ length: 30 }, (_, index) => {
  // Even radial spread + slight per-spoke jitter so it reads organic.
  const angle = (index / 30) * Math.PI * 2 + (index % 2 ? 0.12 : -0.12);
  const distance = 95 + (index % 4) * 48; // 95 to 239px rings
  const gravity = 24 + (index % 3) * 16; // gentle downward sag
  return {
    id: index,
    dx: `${Math.round(Math.cos(angle) * distance)}px`,
    dy: `${Math.round(Math.sin(angle) * distance + gravity)}px`,
    sw: `${4 + (index % 3) * 2}px`,
    sc: FIREWORK_COLORS[index % FIREWORK_COLORS.length],
    sd: `${1.1 + (index % 4) * 0.2}s`,
    sdelay: `${(index % 3) * 0.05}s`,
  };
});

// The celebratory persona "amulet" for the reveal: a glowing coin in the
// persona's brand colour with a shockwave ring, and a firework of glowing dots
// that explodes outward from the icon. `--persona` cascades to every layer.
const PersonaEmblem = ({
  persona,
}: {
  persona: DeveloperPersona;
}): ReactElement => (
  <div
    className={styles.emblem}
    style={{ '--persona': persona.color } as React.CSSProperties}
  >
    <span aria-hidden className={styles.emblemFlash} />
    {REVEAL_FIREWORK.map((spark) => (
      <span
        key={spark.id}
        aria-hidden
        className={styles.fireworkSpark}
        style={
          {
            '--dx': spark.dx,
            '--dy': spark.dy,
            '--sw': spark.sw,
            '--sc': spark.sc,
            '--sd': spark.sd,
            '--sdelay': spark.sdelay,
          } as React.CSSProperties
        }
      />
    ))}
    <span className={styles.emblemCoin}>
      <span className={styles.emblemEmoji}>{persona.emoji}</span>
    </span>
  </div>
);

function PersonaQuizPhases({
  parameters: { headline, explainer, cta, mascotVideoBaseUrl },
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

  // Which clip plays during the thinking beat, chosen per answer.
  const [thinkingClip, setThinkingClip] = useState<MascotState>('thinking');
  // On the reveal we hold the answer back until Patchy finishes his animation.
  const [revealReady, setRevealReady] = useState(false);

  useEffect(() => {
    if (phase !== 'reveal') {
      return undefined;
    }
    setRevealReady(false);
    // Patchy now plays the reveal on every breakpoint, so wait for his
    // animation whenever there is a video to wait for.
    if (!mascotVideoBaseUrl) {
      setRevealReady(true);
      return undefined;
    }
    // Fallback in case the video never reports progress (e.g. blocked autoplay).
    const timeout = setTimeout(() => setRevealReady(true), 2500);
    return () => clearTimeout(timeout);
  }, [phase, mascotVideoBaseUrl]);

  const handleAnswer = (value: AnswerValue) => {
    if (isThinking) {
      return;
    }
    const options: MascotState[] =
      value === 1 ? ['thinking', 'onpath'] : ['thinking', 'unsure'];
    setThinkingClip(options[Math.floor(Math.random() * options.length)]);
    answer(value);
  };

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
      <QuizStage
        key={phase}
        mascot={
          <Mascot
            baseUrl={mascotVideoBaseUrl}
            clips={['onpath']}
            idleClips={IDLE_CLIPS}
            size="lg"
            className={MASCOT_STAGE_CLASS}
          />
        }
      >
        <div className="flex w-full max-w-xl flex-1 flex-col items-center gap-8 laptop:flex-none">
          <SpeechBubble>
            <div className="flex flex-col gap-4">
              <Typography
                tag={TypographyTag.H1}
                type={TypographyType.LargeTitle}
                bold
              >
                {headline || "Let's play a game"}
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                {explainer ||
                  'A few quick yes/no questions are enough for me to know what kind of dev you are.'}
              </Typography>
            </div>
          </SpeechBubble>
          <div className="mt-auto flex w-full flex-col items-center gap-3 laptop:mt-0 laptop:w-auto">
            <ButtonV2
              className={classNames(
                styles.cta,
                'w-full transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] laptop:w-auto',
              )}
              variant={ButtonVariant.Primary}
              size={ButtonSize.XLarge}
              onClick={start}
              type="button"
            >
              {cta || "I'm ready!"}
            </ButtonV2>
            <ButtonV2
              className="text-text-tertiary transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Medium}
              onClick={pickManually}
              type="button"
            >
              Nah, I&apos;ll pick myself
            </ButtonV2>
          </div>
        </div>
      </QuizStage>
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
              className="flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left transition-[transform,border-color] duration-200 ease-out hover:translate-x-1 hover:border-accent-cabbage-default active:scale-[0.99]"
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
      <QuizStage
        key={phase}
        mascot={
          <Mascot
            baseUrl={mascotVideoBaseUrl}
            clips={['unsure']}
            idleClips={IDLE_CLIPS}
            size="lg"
            className={MASCOT_STAGE_CLASS}
          />
        }
      >
        <div className="flex w-full flex-1 flex-col items-center gap-8 laptop:flex-none">
          <SpeechBubble className="max-w-xl">
            <div className="flex flex-col gap-4">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.LargeTitle}
                bold
              >
                I&apos;m torn between these two.
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                Which one feels more like you?
              </Typography>
            </div>
          </SpeechBubble>
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
      </QuizStage>
    );
  }

  if (phase === 'triplebreak') {
    return (
      <QuizStage
        key={phase}
        mascot={
          <Mascot
            baseUrl={mascotVideoBaseUrl}
            clips={['unsure']}
            idleClips={IDLE_CLIPS}
            size="lg"
            className={MASCOT_STAGE_CLASS}
          />
        }
      >
        <div className="flex w-full flex-1 flex-col items-center gap-8 laptop:flex-none">
          <SpeechBubble className="max-w-xl">
            <div className="flex flex-col gap-4">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.LargeTitle}
                bold
              >
                You&apos;re a tough one. Could be any of these three.
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                Pick the one that fits best.
              </Typography>
            </div>
          </SpeechBubble>
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
          <ButtonV2
            className="mt-auto text-text-tertiary transition-transform duration-150 ease-out hover:scale-105 active:scale-95 laptop:mt-0"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={pickManually}
            type="button"
          >
            None of these. Let me pick.
          </ButtonV2>
        </div>
      </QuizStage>
    );
  }

  if (phase === 'modifiers' && result) {
    return (
      <QuizStage
        key={phase}
        mascot={
          <Mascot
            baseUrl={mascotVideoBaseUrl}
            clips={['onpath']}
            idleClips={IDLE_CLIPS}
            size="lg"
            className={MASCOT_STAGE_CLASS}
          />
        }
      >
        <div className="flex w-full max-w-xl flex-1 flex-col items-center gap-8 laptop:flex-none">
          <SpeechBubble>
            <div className="flex flex-col gap-4">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.LargeTitle}
                bold
              >
                One more thing.
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                Tick any of these that describe you. They tune your feed beyond
                your persona.
              </Typography>
            </div>
          </SpeechBubble>
          <div className="flex w-full flex-col gap-3">
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
                    styles.card,
                    'flex w-full items-center gap-4 rounded-16 border-2 p-4 text-left active:scale-[0.99]',
                    checked
                      ? 'border-accent-cabbage-default bg-surface-float'
                      : 'border-border-subtlest-tertiary bg-surface-float hover:border-text-quaternary',
                  )}
                >
                  <span
                    className={classNames(
                      styles.cardEmoji,
                      'shrink-0 text-4xl leading-none',
                    )}
                  >
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
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-6 border-2 text-sm font-bold transition-colors',
                      checked
                        ? 'border-accent-cabbage-default bg-accent-cabbage-default text-text-primary'
                        : 'border-border-subtlest-tertiary',
                    )}
                    aria-hidden
                  >
                    {checked && <span className={styles.tick}>✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <ButtonV2
            className={classNames(
              styles.cta,
              'mt-auto w-full transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] laptop:mt-0 laptop:w-auto',
            )}
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            onClick={handleComplete}
            type="button"
          >
            {selectedModifierIds.length === 0
              ? 'None of these, continue'
              : 'Continue →'}
          </ButtonV2>
        </div>
      </QuizStage>
    );
  }

  if (phase === 'reveal' && result) {
    const { persona } = result;
    return (
      <QuizStage
        key={phase}
        mascot={
          <Mascot
            baseUrl={mascotVideoBaseUrl}
            clips={['reveal']}
            idleClips={IDLE_CLIPS}
            size="lg"
            onHalfway={() => setRevealReady(true)}
            className={MASCOT_STAGE_CLASS}
          />
        }
      >
        <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 laptop:flex-none">
          {revealReady && (
            <>
              <PersonaEmblem persona={persona} />
              <Typography
                tag={TypographyTag.H1}
                type={TypographyType.Title1}
                bold
                className={classNames(styles.revealName, 'text-center')}
                style={{
                  color: `color-mix(in srgb, ${persona.color} 60%, white)`,
                }}
              >
                {personaRevealPhrase(persona.name)}
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className={classNames(
                  styles.revealTagline,
                  'max-w-md text-center',
                )}
              >
                {persona.tagline}
              </Typography>
              <div
                className={classNames(
                  styles.revealActions,
                  'mt-auto flex w-full flex-col items-center gap-3 laptop:mt-2 laptop:w-auto',
                )}
              >
                <ButtonV2
                  className={classNames(
                    styles.cta,
                    'w-full transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] laptop:w-auto',
                  )}
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.XLarge}
                  onClick={confirmPersona}
                  type="button"
                >
                  {cta || "Yes, that's me!"}
                </ButtonV2>
                <ButtonV2
                  className="text-text-tertiary transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Medium}
                  onClick={pickManually}
                  type="button"
                >
                  Nah, I&apos;ll pick myself
                </ButtonV2>
              </div>
            </>
          )}
        </div>
      </QuizStage>
    );
  }

  return (
    <QuizStage
      key={phase}
      progress={{ questionNumber, value: progress }}
      mascot={
        <Mascot
          baseUrl={mascotVideoBaseUrl}
          clips={QUIZ_CLIPS}
          activeClip={thinkingClip}
          idleClips={IDLE_CLIPS}
          size="lg"
          playing={isThinking}
          playbackRate={thinkingClip === 'thinking' ? 1.8 : 1}
          className={MASCOT_STAGE_CLASS}
        />
      }
    >
      <div
        key={`question-${questionNumber}`}
        className={classNames(
          styles.questionIn,
          'relative flex w-full max-w-xl flex-1 flex-col items-center gap-8 laptop:flex-none',
        )}
      >
        <SpeechBubble
          className={classNames(
            'transition-opacity duration-200',
            isThinking && 'opacity-0',
          )}
        >
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.LargeTitle}
            bold
          >
            {questionText}
          </Typography>
        </SpeechBubble>
        <div className="mx-auto mt-auto w-full max-w-sm laptop:mt-0">
          <div
            className={classNames(
              'flex flex-col gap-7 transition-opacity duration-200',
              isThinking && 'pointer-events-none opacity-0',
            )}
          >
            <div className="flex w-full items-center justify-center gap-2">
              <button
                type="button"
                disabled={isThinking}
                onClick={() => handleAnswer(1)}
                className={classNames(
                  styles.answer,
                  styles.answerYes,
                  'flex items-center gap-3 p-1 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95]',
                )}
              >
                <Typography
                  type={TypographyType.Title3}
                  color={TypographyColor.Secondary}
                >
                  Yes
                </Typography>
                <span className={classNames(styles.answerBadge, 'h-20 w-20')}>
                  <UpvoteIcon size={IconSize.XLarge} />
                </span>
              </button>
              <button
                type="button"
                disabled={isThinking}
                onClick={() => handleAnswer(0)}
                className={classNames(
                  styles.answer,
                  styles.answerNo,
                  'flex items-center gap-3 p-1 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95]',
                )}
              >
                <span className={classNames(styles.answerBadge, 'h-20 w-20')}>
                  <DownvoteIcon size={IconSize.XLarge} />
                </span>
                <Typography
                  type={TypographyType.Title3}
                  color={TypographyColor.Secondary}
                >
                  No
                </Typography>
              </button>
            </div>
            <button
              type="button"
              disabled={isThinking}
              onClick={() => handleAnswer(0.5)}
              className={classNames(
                styles.notSure,
                'mx-auto flex items-center gap-2 px-5 py-2 transition-transform duration-150 ease-out hover:scale-105 active:scale-95',
              )}
            >
              <Typography type={TypographyType.Footnote} bold>
                Not sure
              </Typography>
            </button>
          </div>
        </div>
        {isThinking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ThinkingDots />
          </div>
        )}
      </div>
    </QuizStage>
  );
}

function FunnelPersonaQuizComponent(
  props: FunnelStepPersonaQuiz,
): ReactElement {
  // The spotlight stage lives above every phase so its animation runs
  // continuously across the step. Phases remount on transition (keyed), so a
  // backdrop nested inside them would restart its animation each time.
  return (
    <div className={classNames(styles.stage, 'relative isolate flex flex-1 flex-col')}>
      <StageBackdrop />
      <PersonaQuizPhases {...props} />
    </div>
  );
}

export const FunnelPersonaQuiz = withIsActiveGuard(FunnelPersonaQuizComponent);
