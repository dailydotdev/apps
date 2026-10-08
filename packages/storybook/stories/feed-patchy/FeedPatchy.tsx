import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
} from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { ScreenProps } from './shell';
import { funnelStepRail } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { onboardingHeadlineClasses } from '@dailydotdev/shared/src/components/onboarding/common';
import type { FunnelPosition } from './shell';
import { AFTER_POSITION, Confetti, Phone } from './shell';
import { formatHour, ReminderPicker } from './reminder';

// Cut from the designer's transparent character sheet.
const patchy = {
  waiting: '/images/patchy/patchy-waiting.png',
  fed: '/images/patchy/patchy-bone.png',
  bone: '/images/patchy/bone.png',
};

const BONE_WIDTH = 150;
const DOG_HEIGHT = 230;
/** Mouth position inside the dog image, as a fraction of its box. */
const MOUTH = { x: 0.74, y: 0.3 };
/** The whole of Patchy catches: a drop this far outside his box still lands. */
const CATCH_PAD = 12;
/** He leans in once the bone is this close to his box. */
const NEAR_PAD = 64;

/** A press that moves less than this is a tap, not a drag. */
const TAP_SLOP = 6;
/** Untouched this long, the bone dips toward Patchy as a hint. */
const IDLE_MS = 3000;

/** Where a story opens the screen, so a case can be checked without replaying. */
export type FeedStart = 'intro' | 'ready' | 'reminder' | 'set' | 'skipped';

interface FeedPatchyProps extends ScreenProps {
  /** Plays the line-by-line intro before Patchy appears. */
  hasIntro?: boolean;
  /** Once fed, Patchy keeps the bone and asks when to nudge you. */
  withReminder?: boolean;
  startAt?: FeedStart;
  /** What the notification prompt answers once the time is set. */
  isNotificationDenied?: boolean;
  /** The current hour, to say "today" or "tomorrow"; defaults to the clock. */
  nowHour?: number;
  /** Where the screen sits in the onboarding funnel, for the step dots. */
  position?: FunnelPosition;
}

/** The opening: two lines on a blank screen, then the ask with the bone. */
enum Intro {
  Ready = 'ready',
  Commit = 'commit',
  /** The real headline and bone, held at the centre of the screen. */
  Give = 'give',
  /** Both glide up to where they live. */
  Settle = 'settle',
  /** Patchy and the CTA arrive; the bone can be dragged. */
  Done = 'done',
}

const introLines: Partial<Record<Intro, string>> = {
  [Intro.Ready]: 'Ready to make it official?',
  [Intro.Commit]: 'Commit to learning something every day.',
};

const ASK = 'Give Patchy the Knowledge Bone.';

/** [ms from mount, what happens]. Each line fades in, holds, fades out. */
const introTimeline: Array<[number, Intro | 'in' | 'out']> = [
  [250, 'in'],
  [1950, 'out'],
  [2450, Intro.Commit],
  [2500, 'in'],
  [4500, 'out'],
  [5000, Intro.Give],
  [6400, Intro.Settle],
  [7300, Intro.Done],
];

const SETTLE_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const DECODE_WAIT_MS = 1200;

enum FeedPhase {
  Floating = 'floating',
  Flash = 'flash',
  Fed = 'fed',
  /** Reminder version: the time picker rises under Patchy. */
  Remind = 'remind',
  /** Reminder version: the time is set, or skipped. */
  Set = 'set',
}

/** How long the fed moment plays before the reminder ask arrives. */
const FED_HOLD_MS = 1900;
const DEFAULT_HOUR = 9;
/** The celebration line's glide home, which the reminder waits out. */
const HEADLINE_GLIDE_MS = 900;
/** How far above the intro's ask the celebration line sits. */
const CELEBRATE_RAISE = 140;
/** Patchy's size while he shares the screen with the picker. */
const REMIND_SCALE = 0.6;
/** Below this, Patchy's step-up is not worth showing; he steps aside. */
const MIN_REMIND_SCALE = 0.3;
/** Screens shorter than this get the compact reminder. */
const COMPACT_HEIGHT = 800;
/** The reminder subtext and its gap, kept clear above Patchy. */
const SUBTEXT_RESERVE = 68;

const startPhase: Record<FeedStart, FeedPhase> = {
  intro: FeedPhase.Floating,
  ready: FeedPhase.Floating,
  reminder: FeedPhase.Remind,
  set: FeedPhase.Set,
  skipped: FeedPhase.Set,
};

const prefersReducedMotion = () =>
  !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const FeedPatchy = ({
  onCommit,
  hasIntro: wantsIntro = true,
  withReminder = false,
  startAt = 'intro',
  isNotificationDenied = false,
  nowHour,
  position = AFTER_POSITION,
}: FeedPatchyProps): ReactElement => {
  // Reduced motion skips the 7s opening and goes straight to the ask.
  const [hasIntro] = useState(
    () => wantsIntro && startAt === 'intro' && !prefersReducedMotion(),
  );
  const stage = useRef<HTMLDivElement>(null);
  const dog = useRef<HTMLImageElement>(null);
  const boneSlot = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLSpanElement>(null);
  const introAsk = useRef<HTMLDivElement>(null);
  const introBone = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(hasIntro ? Intro.Ready : Intro.Done);
  const [isLineIn, setIsLineIn] = useState(false);
  // How far the headline and bone sit from home while held at the centre.
  const [lift, setLift] = useState({ headline: 0, bone: { x: 0, y: 0 } });
  const isIntro = intro !== Intro.Done;
  const isAskShown = [Intro.Give, Intro.Settle, Intro.Done].includes(intro);
  const [phase, setPhase] = useState(startPhase[startAt]);
  // Confetti belongs to the moment of feeding, not to a screen opened past it.
  const [hasFedHere, setHasFedHere] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [hasTouched, setHasTouched] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const grab = useRef({ x: 0, y: 0 });
  // Where the press started, to tell a tap from a drag on release.
  const pressedAt = useRef({ x: 0, y: 0 });
  // The bone follows the finger through this ref and a direct style write,
  // not state: a state update per move re-rendered the whole funnel chrome.
  const boneButton = useRef<HTMLButtonElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  // Set when a press became a drag, so the click that follows its release
  // does not count as a tap.
  const wasDragged = useRef(false);
  // Feeding happens once, however many events race to it (a held Enter key
  // repeats its click before the re-render lands).
  const isFedRef = useRef(false);
  // The bone's centre at rest, so distance comes from the pointer rather than
  // a layout read that may trail the last render by a frame.
  const rest = useRef({ x: 0, y: 0 });
  const isFed = phase !== FeedPhase.Floating;
  const hasBone = isFed && phase !== FeedPhase.Flash;
  const picker = useRef<HTMLDivElement>(null);
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [isReminderSkipped, setIsReminderSkipped] = useState(
    startAt === 'skipped',
  );
  const [isDenied, setIsDenied] = useState(false);
  // How far Patchy rises so his feet clear the picker.
  const [rise, setRise] = useState(0);
  // The ask arrives in two beats: the headline glides home and changes its
  // line, and only once it has landed does the rest of the reminder appear.
  const isAsking = phase === FeedPhase.Remind;
  const [hasAskLanded, setHasAskLanded] = useState(startAt === 'reminder');
  const isPicking = isAsking && hasAskLanded;
  const isCelebrating =
    withReminder && (phase === FeedPhase.Flash || phase === FeedPhase.Fed);

  useEffect(() => {
    if (!withReminder || phase !== FeedPhase.Fed) {
      return undefined;
    }
    const timeout = window.setTimeout(
      () => setPhase(FeedPhase.Remind),
      FED_HOLD_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [withReminder, phase]);

  useEffect(() => {
    if (!isAsking) {
      return undefined;
    }
    const timeout = window.setTimeout(
      () => setHasAskLanded(true),
      HEADLINE_GLIDE_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [isAsking]);

  // The screen's usable height: the viewport less the status-bar inset the
  // native wrapper pads the body with. Not the screen element's own height,
  // which grows with its content.
  const [isCompact, setIsCompact] = useState(false);
  useLayoutEffect(() => {
    const screen = stage.current?.closest('.cs-phone');
    if (!screen) {
      return undefined;
    }
    // The status-bar inset can arrive after mount; it changes the screen's
    // height too, so the observer below catches it.
    const measure = () => {
      const height =
        window.innerHeight -
        parseFloat(getComputedStyle(document.body).paddingTop || '0');
      setIsCompact(height < COMPACT_HEIGHT);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(screen);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Patchy's size while he shares the screen with the picker, fitted to the
  // gap between the headline and the picker's top.
  const [remindScale, setRemindScale] = useState(REMIND_SCALE);

  useLayoutEffect(() => {
    if (!isAsking || !picker.current) {
      return;
    }
    // Patchy's wrapper sits on bottom-7 (1.75rem); land him 1rem above the
    // picker's top edge. Measured while the picker is still hidden, so he
    // can step up in step with the headline.
    setRise(picker.current.offsetHeight + 16 - 28);
    const headlineBottom = stage.current
      ?.closest('.cs-phone')
      ?.querySelector('h1')
      ?.getBoundingClientRect().bottom;
    if (headlineBottom === undefined) {
      return;
    }
    const pickerTop = picker.current.getBoundingClientRect().top;
    const reserve = isCompact ? 0 : SUBTEXT_RESERVE;
    const room = pickerTop - 16 - (headlineBottom + 16 + reserve);
    setRemindScale(Math.min(REMIND_SCALE, room / DOG_HEIGHT));
  }, [isAsking, isCompact]);

  const isDogStepping = isAsking && remindScale >= MIN_REMIND_SCALE;

  // A time still ahead today nudges today; otherwise the first is tomorrow.
  const [currentHour] = useState(() => nowHour ?? new Date().getHours());
  const nudgeDay = hour > currentHour ? 'today' : 'tomorrow';

  // Hidden while Patchy steps up, and fading out once set: out of the tab
  // order and the accessibility tree until it is really on screen.
  useEffect(() => {
    if (picker.current) {
      picker.current.inert = !isPicking;
    }
  });

  // The clock starts once all three images have decoded, so a slow network
  // never lets the ask or Patchy arrive as an empty box, but never waits more
  // than a beat for them.
  useEffect(() => {
    if (!hasIntro) {
      return undefined;
    }
    let timeouts: number[] = [];
    let isCancelled = false;
    const decode = (src: string) => {
      const image = new Image();
      image.src = src;
      return image.decode().catch(() => undefined);
    };
    const beat = new Promise((resolve) => {
      window.setTimeout(resolve, DECODE_WAIT_MS);
    });
    Promise.race([Promise.all(Object.values(patchy).map(decode)), beat]).then(
      () => {
        if (isCancelled) {
          return;
        }
        timeouts = introTimeline.map(([at, step]) =>
          window.setTimeout(() => {
            if (step === 'in' || step === 'out') {
              setIsLineIn(step === 'in');
              return;
            }
            setIntro(step);
          }, at),
        );
      },
    );
    return () => {
      isCancelled = true;
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [hasIntro]);

  // The headline and bone never leave their real places in the layout. For the
  // ask they are shifted onto invisible stand-ins at the centre of the screen,
  // measured here before paint, then released so they glide home.
  useLayoutEffect(() => {
    if (intro !== Intro.Give) {
      return;
    }
    const ask = introAsk.current?.getBoundingClientRect();
    const home = headline.current?.getBoundingClientRect();
    const slot = introBone.current?.getBoundingClientRect();
    const boneHome = boneSlot.current?.getBoundingClientRect();
    if (!ask || !home || !slot || !boneHome) {
      return;
    }
    setLift({
      headline: ask.top - home.top,
      bone: {
        x: slot.left + slot.width / 2 - (boneHome.left + boneHome.width / 2),
        y: slot.top + slot.height / 2 - (boneHome.top + boneHome.height / 2),
      },
    });
  }, [intro]);

  const heldAtCentre = intro === Intro.Give;
  const glide =
    intro === Intro.Settle
      ? `transform 900ms ${SETTLE_EASE}, opacity 600ms ease-out`
      : 'opacity 600ms ease-out';

  // The idle timer arms once Patchy is on screen and re-arms after each ghost
  // pass; any touch disarms it for good.
  useEffect(() => {
    if (isIntro || hasTouched || isIdle) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setIsIdle(true), IDLE_MS);
    return () => window.clearTimeout(timeout);
  }, [isIntro, hasTouched, isIdle]);

  const mouth = () => {
    const rect = dog.current?.getBoundingClientRect();
    if (!rect) {
      return null;
    }
    return {
      x: rect.left + rect.width * MOUTH.x,
      y: rect.top + rect.height * MOUTH.y,
    };
  };

  const drag = (event: ReactPointerEvent<HTMLButtonElement>) => ({
    x: event.clientX - grab.current.x,
    y: event.clientY - grab.current.y,
  });

  // Whether the bone's centre is over Patchy, grown by `pad` on every side.
  const isOverDog = (next: { x: number; y: number }, pad: number) => {
    const rect = dog.current?.getBoundingClientRect();
    if (!rect) {
      return false;
    }
    const x = rest.current.x + next.x;
    const y = rest.current.y + next.y;
    return (
      x >= rect.left - pad &&
      x <= rect.right + pad &&
      y >= rect.top - pad &&
      y <= rect.bottom + pad
    );
  };

  const boneTransform = (at: { x: number; y: number }, isLifted: boolean) =>
    `translate(${at.x}px, ${at.y}px)${isLifted ? ' scale(1.08)' : ''}`;

  const springBack = () => {
    dragOffset.current = { x: 0, y: 0 };
    setOffset({ x: 0, y: 0 });
    setIsNear(false);
    setIsOver(false);
  };

  const onDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (isFed || isIntro) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    rest.current = {
      x: rect.left + rect.width / 2 - offset.x,
      y: rect.top + rect.height / 2 - offset.y,
    };
    grab.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
    pressedAt.current = { x: event.clientX, y: event.clientY };
    dragOffset.current = offset;
    wasDragged.current = false;
    setIsDragging(true);
    setHasTouched(true);
    setIsIdle(false);
  };

  const onMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragging || isFed) {
      return;
    }
    const next = drag(event);
    dragOffset.current = next;
    if (boneButton.current) {
      boneButton.current.style.transform = boneTransform(next, true);
    }
    // Same-value updates bail out, so these only render when they flip.
    setIsNear(isOverDog(next, NEAR_PAD));
    setIsOver(isOverDog(next, CATCH_PAD));
  };

  // The bone snaps the last few pixels into the mouth; the flash peaks as the
  // images cross-fade underneath it, so the swap is never seen.
  const feed = (target: { x: number; y: number }) => {
    if (isFedRef.current) {
      return;
    }
    isFedRef.current = true;
    setOffset({
      x: target.x - rest.current.x,
      y: target.y - rest.current.y,
    });
    setHasFedHere(true);
    setPhase(FeedPhase.Flash);
    window.setTimeout(() => setPhase(FeedPhase.Fed), 180);
    window.setTimeout(onCommit, 500);
  };

  const onUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragging || isFed) {
      return;
    }
    setIsDragging(false);
    const isTap =
      Math.hypot(
        event.clientX - pressedAt.current.x,
        event.clientY - pressedAt.current.y,
      ) < TAP_SLOP;
    // A tap is left to the click that follows, the one path a tap, the
    // keyboard and assistive technology all share.
    if (isTap) {
      dragOffset.current = offset;
      return;
    }
    wasDragged.current = true;
    const next = drag(event);
    const target = mouth();
    // Dropped anywhere on Patchy, the bone still flies into his mouth.
    if (target && isOverDog(next, CATCH_PAD)) {
      feed(target);
    } else {
      springBack();
    }
  };

  // The system took the pointer back (a call, a gesture, palm rejection):
  // nothing was released, so nothing is fed.
  const onCancel = () => {
    if (!isDragging) {
      return;
    }
    setIsDragging(false);
    springBack();
  };

  // A tap, Enter or Space on the focused bone, and a screen reader's activate
  // all arrive here: each feeds Patchy, as a drop on him does.
  const onClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }
    if (isFed || isIntro) {
      return;
    }
    const target = mouth();
    if (!target) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    rest.current = {
      x: rect.left + rect.width / 2 - offset.x,
      y: rect.top + rect.height / 2 - offset.y,
    };
    setHasTouched(true);
    setIsIdle(false);
    feed(target);
  };

  return (
    <Phone
      headline={
        isFed ? (
          // Reminder version: the celebration line holds where the ask stood
          // during the intro, then glides home as the reminder takes over.
          <span
            // Above the confetti, which bursts up past the line.
            className="relative z-2 block"
            style={
              withReminder
                ? {
                    transform: isCelebrating
                      ? `translateY(${lift.headline - CELEBRATE_RAISE}px)`
                      : 'none',
                    // Appears in place; only the way up is animated.
                    transition: isCelebrating
                      ? 'none'
                      : `transform ${HEADLINE_GLIDE_MS}ms ${SETTLE_EASE}`,
                  }
                : undefined
            }
          >
            <span key={withReminder ? phase : 'fed'} className="cs-rise block">
              {(phase === FeedPhase.Fed || phase === FeedPhase.Flash) && (
                <>
                  You’re committed 🎉
                  <br />
                  Day 1 starts now
                </>
              )}
              {isAsking && 'When should Patchy nudge you?'}
              {phase === FeedPhase.Set &&
                isReminderSkipped &&
                'Day 1 starts now'}
              {phase === FeedPhase.Set &&
                !isReminderSkipped &&
                isDenied &&
                'Notifications are off'}
              {phase === FeedPhase.Set &&
                !isReminderSkipped &&
                !isDenied &&
                `See you ${nudgeDay} at ${formatHour(hour)}`}
            </span>
          </span>
        ) : (
          <span
            ref={headline}
            className="block"
            style={{
              opacity: isAskShown ? 1 : 0,
              transform: heldAtCentre
                ? `translateY(${lift.headline}px)`
                : 'none',
              transition: glide,
            }}
          >
            {ASK}
          </span>
        )
      }
      subheadline={
        isFed &&
        !(withReminder && !isPicking && phase !== FeedPhase.Set) &&
        !(isPicking && isCompact) ? (
          <span key={withReminder ? phase : 'fed'} className="cs-rise block">
            {(phase === FeedPhase.Fed || phase === FeedPhase.Flash) &&
              'Keep showing up. Keep learning. Patchy will be waiting for you tomorrow.'}
            {isPicking &&
              'One nudge a day, at the time you usually have five minutes.'}
            {phase === FeedPhase.Set &&
              isReminderSkipped &&
              'You can set a reading reminder anytime from your settings.'}
            {phase === FeedPhase.Set &&
              !isReminderSkipped &&
              isDenied &&
              `Turn them on in your phone’s settings and Patchy will nudge you at ${formatHour(
                hour,
              )}.`}
            {phase === FeedPhase.Set &&
              !isReminderSkipped &&
              !isDenied &&
              'Patchy will nudge you then. Today’s read still counts, so start now.'}
          </span>
        ) : undefined
      }
      cta={
        withReminder
          ? {
              idle: isFed
                ? `Remind me at ${formatHour(hour)}`
                : 'Feed Patchy first',
              done: isPicking
                ? `Remind me at ${formatHour(hour)}`
                : 'Start reading →',
            }
          : { idle: 'Feed Patchy first', done: 'Start reading →' }
      }
      isDone={
        withReminder
          ? isPicking || phase === FeedPhase.Set
          : phase === FeedPhase.Fed
      }
      onCta={
        isPicking
          ? () => {
              // In production the system prompt answers here; the story
              // takes its answer from `isNotificationDenied`.
              setIsDenied(isNotificationDenied);
              setPhase(FeedPhase.Set);
            }
          : undefined
      }
      hasSkip={isPicking}
      skipLabel="I’ll do it later"
      onSkip={() => {
        setIsReminderSkipped(true);
        setPhase(FeedPhase.Set);
      }}
      isIntro={isIntro}
      position={position}
    >
      {/* The intro's own layer: the screen-centred lines, plus invisible
          stand-ins for where the headline and bone are held during the ask. */}
      {isIntro && (
        <div
          aria-hidden={intro === Intro.Give || intro === Intro.Settle}
          className="pointer-events-none absolute inset-0 z-1 flex items-center"
        >
          <div className={classNames(funnelStepRail, 'relative')}>
            {introLines[intro] && (
              <div
                className={onboardingHeadlineClasses}
                style={{
                  opacity: isLineIn ? 1 : 0,
                  filter: isLineIn ? 'blur(0)' : 'blur(6px)',
                  transform: isLineIn ? 'none' : 'translateY(8px)',
                  transition:
                    'opacity 500ms ease-out, filter 500ms ease-out, transform 500ms ease-out',
                }}
              >
                {introLines[intro]}
              </div>
            )}
            <div className="invisible absolute inset-x-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-6">
              <div ref={introAsk} className={onboardingHeadlineClasses}>
                {ASK}
              </div>
              <div
                ref={introBone}
                style={{
                  width: BONE_WIDTH,
                  height: Math.round((BONE_WIDTH * 351) / 520),
                }}
              />
            </div>
          </div>
        </div>
      )}
      <div
        ref={stage}
        className={classNames(
          'relative flex w-full flex-1 flex-col items-center justify-between overflow-visible',
          // On a tall viewport, keep the phone's distance from bone to dog.
          'tablet:max-h-[32rem]',
        )}
        style={{ minHeight: isCompact ? 300 : 380 }}
      >
        {/* The dog: both frames stacked, cross-faded under the flash. */}
        <div
          className={classNames(
            // The lean-in stays through the swap: both frames must share one
            // box while they cross-fade, or the dog visibly jumps.
            'absolute bottom-7 origin-bottom transition-[transform,opacity] duration-500',
            (isNear || isFed) && 'scale-[1.04]',
            isIntro && 'translate-y-4 opacity-0',
          )}
          style={{
            height: DOG_HEIGHT,
            // Moves with the headline: same start, length and curve.
            ...(withReminder && {
              transition: `transform ${HEADLINE_GLIDE_MS}ms ${SETTLE_EASE}, opacity 500ms ease-out`,
            }),
            ...(isAsking && {
              opacity: isDogStepping ? 1 : 0,
              transform: `translateY(-${rise}px) scale(${remindScale})`,
            }),
          }}
        >
          <img
            ref={dog}
            src={patchy.waiting}
            alt="Patchy looking up"
            draggable={false}
            className={classNames(
              'h-full w-auto select-none transition-opacity duration-300',
              hasBone && 'opacity-0',
            )}
          />
          <img
            src={patchy.fed}
            alt="Patchy with the bone of knowledge"
            draggable={false}
            className={classNames(
              'absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2 select-none transition-opacity duration-300',
              hasBone ? 'opacity-100' : 'opacity-0',
            )}
          />
          {/* Flash: a warm burst over the mouth that hides the frame swap. */}
          <span
            aria-hidden
            className={classNames(
              'pointer-events-none absolute rounded-full bg-white blur-2xl transition-opacity',
              phase === FeedPhase.Flash
                ? 'opacity-100 duration-100'
                : 'opacity-0 duration-500',
            )}
            style={{
              width: 220,
              height: 220,
              left: `calc(${MOUTH.x * 100}% - 110px)`,
              top: `calc(${MOUTH.y * 100}% - 110px)`,
            }}
          />
          {isFed && (
            <span
              aria-hidden
              className="cs-halo pointer-events-none absolute -inset-10 rounded-full bg-overlay-float-bun blur-3xl"
            />
          )}
          {hasFedHere && (
            <Confetti
              origin={{ left: `${MOUTH.x * 100}%`, top: `${MOUTH.y * 100}%` }}
            />
          )}
        </div>

        {/* The bone: floats until grabbed, then follows the finger. */}
        {!hasBone && (
          <div
            ref={boneSlot}
            className="relative z-1 mt-2"
            style={{
              opacity: isAskShown ? 1 : 0,
              transform: heldAtCentre
                ? `translate(${lift.bone.x}px, ${lift.bone.y}px)`
                : 'none',
              transition: glide,
            }}
          >
            <button
              ref={boneButton}
              type="button"
              aria-label="Give Patchy the Knowledge Bone"
              // Not reachable until Patchy is there to take it.
              disabled={isIntro}
              aria-hidden={!isAskShown}
              onClick={onClick}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onCancel}
              className={classNames(
                'cs-touch relative z-1 cursor-grab touch-none active:cursor-grabbing',
                !isDragging && !isFed && 'cs-float',
                isIdle && !isDragging && 'cs-ghost',
                phase === FeedPhase.Flash && 'cs-swallow',
              )}
              // A ghost pass is two dips; when it ends the idle timer re-arms.
              onAnimationEnd={(event) => {
                if (event.animationName === 'csGhost') {
                  setIsIdle(false);
                }
              }}
              style={{
                width: BONE_WIDTH,
                transform: boneTransform(
                  isDragging ? dragOffset.current : offset,
                  isDragging,
                ),
                transition: isDragging
                  ? 'none'
                  : 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-accent-cheese-default opacity-40 blur-2xl"
              />
              <img
                src={patchy.bone}
                alt=""
                draggable={false}
                className="relative w-full select-none drop-shadow-[0_0_1.125rem_color-mix(in_srgb,var(--theme-accent-cheese-default)_65%,transparent)]"
              />
            </button>
          </div>
        )}

        {/* Patchy's speech bubble, up and to the left of his head, white with
            black text in both themes like a comic. The bone
            comes in toward his mouth on the right, so it never covers the
            line, and the bubble draws above it regardless. */}
        {!isFed && isDragging && (
          <span
            role="status"
            className="cs-bubble absolute right-[calc(50%+2.5rem)] z-2 w-max max-w-[8.5rem] rounded-16 rounded-br-2 border border-border-subtlest-tertiary bg-white px-3 py-2 text-right font-bold text-black shadow-2 typo-callout"
            style={{
              bottom: DOG_HEIGHT * 0.8 + 28,
              transformOrigin: '100% 100%',
            }}
          >
            {isOver && 'Drop it!'}
            {!isOver && (isNear ? 'Almost there…' : 'Bring it to me!')}
            <span
              aria-hidden
              className="absolute -bottom-1.5 right-2 size-3 rotate-45 border-b border-r border-border-subtlest-tertiary bg-white"
            />
          </span>
        )}
        {/* The reminder ask. Mounted, unseen, while Patchy steps up so he
            knows how far to rise; rises once the headline lands; stays
            mounted once set so it can fade away. */}
        {withReminder && (isAsking || phase === FeedPhase.Set) && (
          <div
            ref={picker}
            aria-hidden={!isPicking}
            className={classNames(
              'absolute inset-x-0 bottom-0 z-1 transition-[opacity,transform] duration-300',
              isPicking && 'cs-sheet',
              !isPicking && 'pointer-events-none opacity-0',
              phase === FeedPhase.Set && 'translate-y-4',
            )}
          >
            <ReminderPicker
              hour={hour}
              onChange={setHour}
              isCompact={isCompact}
            />
          </div>
        )}
        {withReminder &&
          phase === FeedPhase.Set &&
          !isReminderSkipped &&
          !isDenied && (
            <span
              role="status"
              className="cs-bubble absolute left-[calc(50%+2.25rem)] right-0 rounded-16 rounded-bl-2 border border-border-subtlest-tertiary bg-white px-3 py-2 text-left font-bold text-black shadow-2 typo-callout"
              style={{ bottom: DOG_HEIGHT + 12, animationDelay: '450ms' }}
            >
              See you at {formatHour(hour)}!
              <span
                aria-hidden
                className="absolute -bottom-1.5 left-2 size-3 rotate-45 border-b border-r border-border-subtlest-tertiary bg-white"
              />
            </span>
          )}
      </div>
    </Phone>
  );
};
