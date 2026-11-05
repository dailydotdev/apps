import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { FunnelGlassBar } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelGlassBar';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MoveToIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { CREW_ON_BASE, CREW_ON_BASE_CENTER, PLAZA_SKY } from './crewOnBase';

export enum StepId {
  Account = 'account',
  Company = 'company',
  Plan = 'plan',
  Setup = 'setup',
}

export const steps = [
  { id: StepId.Account, label: 'Account' },
  { id: StepId.Company, label: 'Company' },
  { id: StepId.Plan, label: 'Plan' },
  { id: StepId.Setup, label: 'Set up' },
];

// The label beside the logo on business.daily.dev (apps/business-site
// Header.astro), in its light style on a dark page: the text leads, with a soft
// purple fill and border behind it.
const logoLabel = {
  background: 'rgba(192,132,252,.1)',
  border: '1px solid rgba(192,132,252,.2)',
  color: '#D8B4FE',
  fontSize: 10,
  lineHeight: '14px',
  letterSpacing: '0.5px',
  padding: '2px 6px',
  borderRadius: 12,
};

export const Wordmark = (): ReactElement => (
  <span className="flex items-center">
    <LogoIcon className={{ container: 'h-logo' }} />
    <LogoText className={{ container: 'ml-1 h-logo' }} />
  </span>
);

export enum LockupVariant {
  Plain = 'plain',
  Pill = 'pill',
  Text = 'text',
  Divider = 'divider',
}

export const Lockup = ({
  variant = LockupVariant.Pill,
}: {
  variant?: LockupVariant;
}): ReactElement => (
  <span
    className="flex shrink-0 items-center gap-1.5 laptop:gap-2"
    aria-label="daily.dev for Startups"
    role="img"
  >
    <Wordmark />
    {variant === LockupVariant.Pill && (
      <span className="whitespace-nowrap font-bold uppercase" style={logoLabel}>
        Startups
      </span>
    )}
    {variant === LockupVariant.Text && (
      <span className="whitespace-nowrap font-bold text-text-primary typo-callout">
        for Startups
      </span>
    )}
    {variant === LockupVariant.Divider && (
      <>
        <span className="h-5 w-px bg-border-subtlest-secondary" />
        <span className="whitespace-nowrap text-text-secondary typo-callout">
          for Startups
        </span>
      </>
    )}
  </span>
);

export enum ProgressStyle {
  /** Pills that carry each answer: Sam, Acme, Starter. */
  Chips = 'chips',
  /** Thin segments with a glowing current one, after Deck. */
  Glow = 'glow',
  /** A vertical journey beside the form, after Lightspark and Remote. */
  Journey = 'journey',
  /** Back, dots and the main button in one bar, after Riverside and Zaro. */
  Dock = 'dock',
  /** A checklist card on the right, after Tembo. */
  Card = 'card',
  /** Connected nodes with checks. */
  Rail = 'rail',
}

/** Lets a story pin a style, and the prototype make past steps clickable. */
export const ProgressContext = createContext<{
  style?: ProgressStyle;
  onSelect?: (step: StepId) => void;
  canSelect?: (step: StepId) => boolean;
  /** What the person has chosen so far, for styles that show it. */
  answers?: Partial<Record<StepId, string>>;
}>({});

const sampleAnswers: Partial<Record<StepId, string>> = {
  [StepId.Company]: 'Acme',
  [StepId.Plan]: 'Starter',
};

const BRAND = 'var(--theme-accent-cabbage-default)';
// The purple the landing page uses for its accents.
const LILAC = '#D8B4FE';

// Survives each step's remount, so the line grows on from the last step.
let lastIndex = 0;

enum StepState {
  Done = 'done',
  Current = 'current',
  Upcoming = 'upcoming',
}

const StepNode = ({ state }: { state: StepState }): ReactElement => (
  <span
    className="relative flex size-6 shrink-0 items-center justify-center rounded-full"
    style={{
      transition: 'background-color .3s ease, box-shadow .3s ease',
      ...(state === StepState.Done && { background: BRAND, color: '#fff' }),
      ...(state === StepState.Current && {
        boxShadow: `inset 0 0 0 2px ${BRAND}, 0 0 0 4px color-mix(in srgb, ${BRAND} 22%, transparent)`,
      }),
      ...(state === StepState.Upcoming && {
        boxShadow: 'inset 0 0 0 1.5px var(--theme-border-subtlest-secondary)',
      }),
    }}
  >
    {state === StepState.Done && <VIcon size={IconSize.Size16} secondary />}
    {state === StepState.Current && (
      <span className="size-2 rounded-full" style={{ background: BRAND }} />
    )}
  </span>
);

const StepConnector = ({
  isFilled,
  shouldAnimate,
}: {
  isFilled: boolean;
  shouldAnimate: boolean;
}): ReactElement => {
  const [isGrown, setGrown] = useState(isFilled && !shouldAnimate);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(isFilled));

    return () => cancelAnimationFrame(frame);
  }, [isFilled]);

  return (
    <span className="mx-1.5 h-0.5 min-w-0 flex-1 overflow-hidden rounded-50 bg-border-subtlest-tertiary">
      <span
        className="block h-full rounded-50"
        style={{
          background: BRAND,
          width: isGrown ? '100%' : '0%',
          transition: 'width .5s cubic-bezier(.4, 0, .2, 1)',
        }}
      />
    </span>
  );
};

const getStepState = (index: number, currentIndex: number): StepState => {
  if (index < currentIndex) {
    return StepState.Done;
  }

  return index === currentIndex ? StepState.Current : StepState.Upcoming;
};

const labelClass: Record<StepState, string> = {
  [StepState.Done]: 'text-text-secondary',
  [StepState.Current]: 'font-bold text-text-primary',
  [StepState.Upcoming]: 'text-text-tertiary',
};

const StepLabel = ({
  step,
  state,
}: {
  step: (typeof steps)[number];
  state: StepState;
}): ReactElement => {
  const { onSelect, canSelect } = useContext(ProgressContext);
  const className = classNames(
    'whitespace-nowrap typo-footnote',
    labelClass[state],
  );

  // Only a step you can really go back to looks and acts like a link.
  return state === StepState.Done && onSelect && canSelect?.(step.id) ? (
    <button
      type="button"
      className={classNames(className, 'underline hover:text-text-primary')}
      onClick={() => onSelect(step.id)}
    >
      {step.label}
    </button>
  ) : (
    <span className={className}>{step.label}</span>
  );
};

/**
 * Connected steps. Finished ones are solid with a check and fill the line up to
 * the current step, which is ringed. Labels sit under their nodes.
 */
const RailProgress = ({
  currentIndex,
}: {
  currentIndex: number;
}): ReactElement => {
  const shouldAnimate = useRef(lastIndex !== currentIndex).current;

  useEffect(() => {
    lastIndex = currentIndex;
  }, [currentIndex]);

  return (
    <ol className="flex w-full items-start">
      {steps.map((step, index) => {
        const state = getStepState(index, currentIndex);
        const isLast = index === steps.length - 1;

        return (
          <li
            key={step.id}
            aria-current={state === StepState.Current ? 'step' : undefined}
            className={classNames(
              'flex flex-col gap-2',
              isLast ? 'shrink-0' : 'min-w-0 flex-1',
            )}
          >
            <span className="flex items-center">
              <StepNode state={state} />
              {!isLast && (
                <StepConnector
                  isFilled={index < currentIndex}
                  shouldAnimate={shouldAnimate && index === currentIndex - 1}
                />
              )}
            </span>
            <StepLabel step={step} state={state} />
          </li>
        );
      })}
    </ol>
  );
};

const ChipsProgress = ({
  currentIndex,
}: {
  currentIndex: number;
}): ReactElement => {
  const { answers, onSelect, canSelect } = useContext(ProgressContext);
  const shown = { ...sampleAnswers, ...answers };

  return (
    <ol className="flex w-full flex-wrap items-center justify-center gap-1.5 laptop:justify-start">
      {steps.map((step, index) => {
        const state = getStepState(index, currentIndex);
        const isClickable =
          state === StepState.Done && !!onSelect && !!canSelect?.(step.id);
        const content = (
          <>
            {state === StepState.Done && (
              <VIcon
                size={IconSize.Size16}
                className="text-accent-avocado-default"
                secondary
              />
            )}
            {state === StepState.Done
              ? (shown[step.id] ?? step.label)
              : step.label}
          </>
        );
        const className =
          'flex h-8 items-center gap-1 whitespace-nowrap rounded-10 px-2.5 typo-footnote';

        return (
          <li
            key={step.id}
            aria-current={state === StepState.Current ? 'step' : undefined}
          >
            {isClickable ? (
              <button
                type="button"
                onClick={() => onSelect?.(step.id)}
                className={classNames(
                  className,
                  'bg-surface-float font-bold text-text-primary hover:bg-surface-hover',
                )}
              >
                {content}
              </button>
            ) : (
              <span
                className={classNames(
                  className,
                  state === StepState.Done &&
                    'bg-surface-float font-bold text-text-primary',
                  state === StepState.Current && 'font-bold',
                  state === StepState.Upcoming &&
                    'font-bold text-text-quaternary',
                )}
                style={
                  state === StepState.Current
                    ? { background: LILAC, color: '#0F0F12' }
                    : undefined
                }
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};

const GlowProgress = ({
  currentIndex,
}: {
  currentIndex: number;
}): ReactElement => (
  <div className="flex w-full flex-col gap-3">
    <div className="flex gap-1.5">
      {steps.map((step, index) => {
        const state = getStepState(index, currentIndex);

        return (
          <span
            key={step.id}
            className="h-1 flex-1 rounded-50"
            style={{
              background:
                state === StepState.Upcoming ? 'rgba(168,179,206,.18)' : LILAC,
              opacity: state === StepState.Done ? 0.55 : 1,
              boxShadow:
                state === StepState.Current
                  ? `0 0 14px 1px ${LILAC}`
                  : undefined,
              transition: 'opacity .3s ease, box-shadow .3s ease',
            }}
          />
        );
      })}
    </div>
    <p className="flex justify-between typo-footnote">
      <span className="font-bold text-text-primary">
        {steps[currentIndex]?.label ?? 'All done'}
      </span>
      <span className="tabular-nums text-text-tertiary">
        {`${Math.min(currentIndex + 1, steps.length)} of ${steps.length}`}
      </span>
    </p>
  </div>
);

const stepHints: Record<StepId, string> = {
  [StepId.Account]: 'Sign up or log in',
  [StepId.Company]: 'Name your page',
  [StepId.Plan]: 'Pick a plan and pay',
  [StepId.Setup]: 'Your agent finishes it',
};

const JourneyProgress = ({
  currentIndex,
}: {
  currentIndex: number;
}): ReactElement => (
  <ol className="flex flex-col">
    {steps.map((step, index) => {
      const state = getStepState(index, currentIndex);
      const isLast = index === steps.length - 1;

      return (
        <li
          key={step.id}
          aria-current={state === StepState.Current ? 'step' : undefined}
          className="flex gap-3"
        >
          <span className="flex flex-col items-center">
            <StepNode state={state} />
            {!isLast && (
              <span
                className="my-1 w-0.5 flex-1 rounded-50"
                style={{
                  minHeight: 28,
                  background:
                    state === StepState.Done
                      ? BRAND
                      : 'var(--theme-border-subtlest-tertiary)',
                }}
              />
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col pb-5">
            <StepLabel step={step} state={state} />
            {state === StepState.Current && (
              <span className="text-text-tertiary typo-caption1">
                {stepHints[step.id]}
              </span>
            )}
          </span>
        </li>
      );
    })}
  </ol>
);

/** Back, then dots with the current one stretched, as Riverside does. */
export const DockProgress = ({
  current,
}: {
  current: StepId;
}): ReactElement => {
  const currentIndex = steps.findIndex(({ id }) => id === current);

  return (
    <div
      className="flex items-center gap-1.5 px-3"
      role="img"
      aria-label={`Step ${currentIndex + 1} of ${steps.length}`}
    >
      {steps.map((step, index) => (
        <span
          key={step.id}
          className="h-1.5 rounded-50"
          style={{
            width: index === currentIndex ? 20 : 6,
            background: index <= currentIndex ? LILAC : 'rgba(168,179,206,.3)',
            opacity: index < currentIndex ? 0.55 : 1,
          }}
        />
      ))}
    </div>
  );
};

/** The whole journey as a checklist with a percentage. */
export const ProgressCard = ({
  current,
}: {
  current: StepId;
}): ReactElement => {
  const currentIndex = steps.findIndex(({ id }) => id === current);
  const percent = Math.round((currentIndex / steps.length) * 100);

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="flex justify-between font-bold typo-callout">
        Getting you live
        <span className="font-normal tabular-nums text-text-tertiary">
          {`${percent}%`}
        </span>
      </p>
      <div className="h-1 w-full overflow-hidden rounded-50 bg-border-subtlest-tertiary">
        <div
          className="h-full rounded-50"
          style={{ background: LILAC, width: `${percent}%` }}
        />
      </div>
      <ul className="flex flex-col gap-2">
        {steps.map((step, index) => {
          const state = getStepState(index, currentIndex);

          return (
            <li key={step.id} className="flex items-center gap-2">
              <StepNode state={state} />
              <StepLabel step={step} state={state} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const DEFAULT_PROGRESS = ProgressStyle.Chips;

export const Progress = ({
  current,
  style,
  className,
  isComplete,
}: {
  current: StepId;
  style?: ProgressStyle;
  className?: string;
  /** Every step finished, on the last screen. */
  isComplete?: boolean;
}): ReactElement => {
  const context = useContext(ProgressContext);
  const shown = style ?? context.style ?? DEFAULT_PROGRESS;
  const currentIndex = isComplete
    ? steps.length
    : steps.findIndex(({ id }) => id === current);

  return (
    <nav aria-label="Progress" className={classNames('w-full', className)}>
      {shown === ProgressStyle.Rail && (
        <RailProgress currentIndex={currentIndex} />
      )}
      {shown === ProgressStyle.Chips && (
        <ChipsProgress currentIndex={currentIndex} />
      )}
      {shown === ProgressStyle.Glow && (
        <GlowProgress currentIndex={currentIndex} />
      )}
      {shown === ProgressStyle.Journey && (
        <JourneyProgress currentIndex={currentIndex} />
      )}
    </nav>
  );
};

// The stage from the landing page's carousel and the /startups/ agent demo
// (recruiter-landing, HomeProductTour + lib/launch/surfaces.ts): a dark gradient
// and two blurred glows that drift, inside the double-border bezel.
// The form starts at the same height on every screen, so nothing above a click
// ever moves. That height centres a typical form on the page, not in the space
// left under the header: half the page, less half a form, less what's above it
// (40px page padding, 76px header, 32px gap, 16px below). A screen too long for
// that starts right under the stepper instead, so more of it shows at once.
const FORM_WIDTH = 440;

const FORM_STYLES = `
.startups-form { padding-top: 16px; animation: startupsStep .2s cubic-bezier(.23,1,.32,1) both; }
@keyframes startupsStep { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.startups-shell button { transition: transform .12s cubic-bezier(.23,1,.32,1), background-color .15s ease-out, border-color .15s ease-out, color .15s ease-out; }
.startups-shell button:active:not(:disabled) { transform: scale(.97); }
.startups-shell button:focus-visible, .startups-shell a:focus-visible { outline: 2px solid #D8B4FE; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .startups-form { animation-name: startupsFade; }
  .startups-shell button:active:not(:disabled) { transform: none; }
}
@keyframes startupsFade { from { opacity: 0; } to { opacity: 1; } }

/* The phone sign-up, as on our panel sign-up wall: the art owns the top half and
   dissolves into the page, and the centred form sits at the bottom. */
@media (max-width: 1019px) {
  .startups-form { padding-top: 0; }
  .startups-wall .startups-form { padding-top: 0; }
}
.startups-wall-art { height: 50dvh; }
.startups-wall-image { width: 320%; bottom: 10%; }
@media (max-height: 759px) {
  .startups-wall-art { height: 32dvh; }
  .startups-wall-image { width: 220%; bottom: 0; }
}
@media (min-width: 1020px) {
  .startups-wall-art { display: none; }
}
@media (max-width: 1019px) {
  .startups-wall main { flex: 1; }
  .startups-wall main > div { justify-content: flex-end; gap: 24px; }
  .startups-wall header { align-items: center; }
  .startups-wall .startups-form { flex: none; text-align: center; }
  .startups-wall .startups-form p { text-align: center !important; }
  .startups-wall .startups-form .flex-wrap { justify-content: center; }
}
@media (min-width: 1020px) {
  .startups-form:not(.startups-form-tall) { margin-top: max(0px, calc(50dvh - 200px - 164px)); }
}
`;

// Concentric corners: the outer radius is the inner radius plus the padding
// between them. Everything in the box is clipped to the inner radius.
const STAGE_PADDING = 8;
const STAGE_INNER_RADIUS = 18;
const STAGE_OUTER_RADIUS = STAGE_INNER_RADIUS + STAGE_PADDING;

const STAGE_STYLES = `
.startups-glow { position: absolute; border-radius: 9999px; filter: blur(64px); will-change: transform; }
.startups-glow-a { animation: startupsDriftA 9s ease-in-out infinite alternate; }
.startups-glow-b { animation: startupsDriftB 12s ease-in-out infinite alternate; }
@keyframes startupsDriftA { from { transform: translate(-14px, -10px) scale(1); } to { transform: translate(16px, 12px) scale(1.09); } }
@keyframes startupsDriftB { from { transform: translate(12px, 14px) scale(1.06); } to { transform: translate(-16px, -12px) scale(1); } }
.startups-preview header button { visibility: hidden; }
.startups-pay { min-height: 100%; }
@media (min-width: 1020px) { .startups-pay { height: 100%; padding: 24px; } }
.startups-enter { animation: startupsEnter .5s cubic-bezier(.25, .46, .45, .94) both; }
@keyframes startupsEnter { from { opacity: 0; transform: translateY(8px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@media (prefers-reduced-motion: reduce) { .startups-glow, .startups-enter { animation: none; } }
`;

// One colour pair per step, as the carousel has per tab.
const stageGlows: Record<StepId, { a: string; b: string }> = {
  [StepId.Account]: { a: 'rgba(124,107,234,.6)', b: 'rgba(34,211,238,.38)' },
  [StepId.Company]: { a: 'rgba(186,86,225,.55)', b: 'rgba(59,130,246,.45)' },
  [StepId.Plan]: { a: 'rgba(139,92,246,.6)', b: 'rgba(242,93,130,.38)' },
  [StepId.Setup]: { a: 'rgba(45,212,191,.42)', b: 'rgba(124,107,234,.58)' },
};

export enum StageFill {
  /** Gradient and drifting glows, for mock-ups that sit on it. */
  Glow = 'glow',
  /** A flat surface: what's in the box is real and fills it. */
  Surface = 'surface',
}

export const Stage = ({
  step,
  className,
  fill = StageFill.Glow,
}: {
  step: StepId;
  className?: string;
  fill?: StageFill;
}): ReactElement => {
  const { a, b } = stageGlows[step];

  return (
    <div
      aria-hidden
      className={classNames('pointer-events-none select-none', className)}
      style={{
        borderRadius: STAGE_OUTER_RADIUS,
        padding: STAGE_PADDING,
        background: 'rgba(255,255,255,.07)',
        boxShadow:
          'inset 0 0 0 1px rgba(160,129,202,.32), 0 0 44px -20px rgba(160,129,202,.3)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: STAGE_STYLES }} />
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: STAGE_INNER_RADIUS,
          background:
            fill === StageFill.Surface
              ? '#141418'
              : 'radial-gradient(90% 55% at 50% 108%, rgba(67,56,202,.42), transparent 75%), linear-gradient(180deg, #17171c, #101014)',
          boxShadow: '0 0 0 1px rgba(255,255,255,.1)',
        }}
      >
        {fill === StageFill.Glow && (
          <>
            {/* The night sky of the /startups/ hero, as tiny dots */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,.55), transparent), radial-gradient(1px 1px at 34% 8%, rgba(255,255,255,.35), transparent), radial-gradient(1.5px 1.5px at 62% 14%, rgba(255,255,255,.45), transparent), radial-gradient(1px 1px at 84% 26%, rgba(255,255,255,.5), transparent), radial-gradient(1px 1px at 8% 62%, rgba(255,255,255,.3), transparent), radial-gradient(1.5px 1.5px at 92% 58%, rgba(255,255,255,.35), transparent), radial-gradient(1px 1px at 48% 92%, rgba(255,255,255,.4), transparent), radial-gradient(1px 1px at 74% 84%, rgba(255,255,255,.3), transparent)',
              }}
            />
            <div
              className="startups-glow startups-glow-a"
              style={{
                background: a,
                width: 460,
                height: 460,
                left: '-6%',
                top: '8%',
              }}
            />
            <div
              className="startups-glow startups-glow-b"
              style={{
                background: b,
                width: 520,
                height: 520,
                right: '-10%',
                bottom: '-4%',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

/** One solid card over the art, never a second frame inside the frame. */
export const FloatingCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'w-full rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-2',
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Two equal columns, as on the panel sign-up wall (`OnboardingSignupHero`,
 * `background="panel"`), with the form on the left. The right is the landing
 * page's stage, and what sits on it supports the current step.
 */
export const Shell = ({
  current,
  children,
  aside,
  hideProgress,
  asideClassName,
  isCentered,
  isPlainOnPhone,
  stageFill = StageFill.Glow,
  isFullBleed,
  isPhoneWall,
  phoneBack,
  isComplete,
  isTall,
}: {
  /** Too long to centre, so it starts right under the stepper. */
  isTall?: boolean;
  isComplete?: boolean;
  stageFill?: StageFill;
  /** What's in the box fills it, instead of sitting centred on it. */
  isFullBleed?: boolean;
  /** On a phone, back is an icon beside the logo, as in the onboarding funnel. */
  phoneBack?: { label: string; onClick: () => void };
  /** On a phone, the art and centred form of our sign-up wall. */
  isPhoneWall?: boolean;
  current: StepId;
  children: ReactNode;
  aside?: ReactNode;
  hideProgress?: boolean;
  asideClassName?: string;
  isCentered?: boolean;
  /** The aside goes straight on the page on a phone, with no stage around it. */
  isPlainOnPhone?: boolean;
}): ReactElement => {
  const { style = DEFAULT_PROGRESS } = useContext(ProgressContext);

  return (
    <div
      className={classNames(
        isPhoneWall && 'startups-wall',
        'startups-shell relative isolate flex min-h-dvh w-full flex-col bg-background-default text-text-primary',
        !isCentered && 'laptop:grid laptop:grid-cols-2',
      )}
    >
      {isPhoneWall && (
        <div
          aria-hidden
          className="startups-wall-art pointer-events-none absolute inset-x-0 top-0 select-none overflow-hidden"
          style={{ background: PLAZA_SKY }}
        >
          <img
            src={CREW_ON_BASE}
            alt=""
            className="startups-wall-image absolute"
            style={{
              left: '50%',
              maxWidth: 'none',
              transform: `translateX(-${CREW_ON_BASE_CENTER}%)`,
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: '32%',
              background:
                'linear-gradient(180deg, transparent, var(--theme-background-default))',
            }}
          />
        </div>
      )}
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-1 flex min-w-0 flex-col items-center px-5 py-6 laptop:min-h-dvh laptop:px-10 laptop:py-10"
      >
        <style dangerouslySetInnerHTML={{ __html: FORM_STYLES }} />
        <div
          className="flex w-full flex-1 flex-col gap-8"
          style={{ maxWidth: FORM_WIDTH }}
        >
          <header className="flex flex-col gap-6">
            <div className="relative flex items-center justify-center laptop:justify-start">
              {phoneBack && (
                <Button
                  aria-label={phoneBack.label}
                  className="absolute laptop:hidden"
                  style={{ left: -8 }}
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Medium}
                  icon={<MoveToIcon className="rotate-180" />}
                  onClick={phoneBack.onClick}
                />
              )}
              <Lockup />
            </div>
            {!hideProgress && (
              <Progress
                current={current}
                isComplete={isComplete}
                className={classNames(
                  current === StepId.Account && 'hidden laptop:block',
                )}
              />
            )}
          </header>
          <div
            key={current}
            className={classNames(
              'startups-form flex flex-col gap-6',
              isTall && 'startups-form-tall',
            )}
          >
            {children}
          </div>
        </div>
      </main>
      {aside && !isCentered && (
        <aside
          className={classNames(
            'relative min-w-0 px-5 pb-8 laptop:sticky laptop:top-0 laptop:h-dvh laptop:p-10',
            asideClassName,
          )}
        >
          <div className="relative h-full w-full">
            <Stage
              step={current}
              fill={stageFill}
              className={classNames(
                'absolute inset-0',
                isPlainOnPhone && 'hidden laptop:block',
              )}
            />
            {isFullBleed ? (
              <div
                className="relative z-1 h-full"
                style={{ padding: STAGE_PADDING }}
              >
                <div
                  className="h-full overflow-y-auto overflow-x-hidden"
                  style={{ borderRadius: STAGE_INNER_RADIUS }}
                >
                  {aside}
                </div>
              </div>
            ) : (
              <div
                className={classNames(
                  'startups-enter relative z-1 flex h-full flex-col items-center justify-center',
                  !isPlainOnPhone && 'p-5',
                )}
              >
                <div className="flex w-full max-w-[28rem] flex-col gap-3">
                  {style === ProgressStyle.Card && (
                    <FloatingCard>
                      <ProgressCard current={current} />
                    </FloatingCard>
                  )}
                  {aside}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

/** Keeps each step's content in one fragment for the shell's column. */
export const FormColumn = ({
  children,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => <>{children}</>;

export const Title = ({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <h1 className="text-balance font-bold tracking-tight typo-large-title">
      {title}
    </h1>
    {description && (
      <p className="text-pretty text-text-secondary typo-callout">
        {description}
      </p>
    )}
  </div>
);

/** A shape standing in for something still loading. */
export const Skeleton = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}): ReactElement => (
  <ElementPlaceholder
    aria-hidden
    className={classNames('shrink-0 animate-pulse', className)}
    style={style}
  />
);

/** The step's primary action, the funnel's double-border button. */
export const Cta = ({
  children,
  current,
}: {
  children: ReactNode;
  current?: StepId;
}): ReactElement => {
  const { style } = useContext(ProgressContext);

  return (
    <FunnelGlassBar>
      {style === ProgressStyle.Dock && current && (
        <DockProgress current={current} />
      )}
      {children}
    </FunnelGlassBar>
  );
};
