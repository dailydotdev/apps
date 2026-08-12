import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CompassIcon,
  HashtagIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { WorldIntroStep } from './useWorldIntro';

/* An icon each, and both of them mean something rather than decorate: a compass
   for the step that asks you to go somewhere, and the hash a topic is written
   with everywhere else in the product (`#react`) for the step that says a town
   is one. */
const STEPS: Record<
  WorldIntroStep,
  { Icon: ComponentType<IconProps>; line: (verb: string) => string }
> = {
  realm: {
    Icon: CompassIcon,
    line: (verb) => `Six realms, one per subject. ${verb} one to walk in.`,
  },
  district: {
    Icon: HashtagIcon,
    line: (verb) => `Every town is a topic. ${verb} one to read the posts.`,
  },
};

/** Only the dots read this: the step itself comes from where the reader is. */
const ORDER: WorldIntroStep[] = ['realm', 'district'];

interface WorldIntroProps {
  step: WorldIntroStep;
  /** The scrubber is up, so the bar has to stand above it. */
  hasTimeline?: boolean;
  isTouch?: boolean;
  onDismiss: () => void;
}

/**
 * One line at a time, on the world, for as long as the reader has not done the
 * thing it is asking for.
 *
 * A bar rather than a modal. The page has just spent most of a megabyte of
 * renderer earning a first impression, and covering that with a panel to explain
 * it throws the impression away to describe what is behind the panel. It also
 * means the hint and the thing it points at are on screen together, which is the
 * only arrangement where "click a realm" can be followed while it is read.
 *
 * The close button is a real exit: somebody who already knows how this works
 * should be able to say so once and never see it again. Doing what it asks
 * retires it just the same, and that is the path almost everyone takes.
 *
 * The two dots are the answer to the question every onboarding hint provokes,
 * which is how many more of these there are going to be. They are a read-out and
 * not a control: there is nothing to click, because the way to the second step
 * is to do the first.
 */
export function WorldIntro({
  step,
  hasTimeline,
  isTouch,
  onDismiss,
}: WorldIntroProps): ReactElement {
  const { Icon, line } = STEPS[step];

  return (
    <div
      data-world-overlay
      className={classNames(
        /* Centred on the WORLD, not on the window. The rail owns the left 320px
           on laptop, so a container spanning the full width centres the bar half
           a rail to the left of the map it is pointing at. Same correction, and
           the same 20rem, that `WorldInvite` makes for the card it centres over
           bare ground. */
        'pointer-events-none absolute inset-x-0 z-2 flex justify-center px-4 laptop:left-80 laptop:right-0',
        /* Clears the scrubber, whose height is its own padding plus a row of
           transports, the sparkline and the dates. Hard-coded the same way the
           bar hard-codes the rail's width beside it: if the scrubber grows a
           row, this number moves with it. */
        hasTimeline ? 'bottom-36' : 'bottom-6',
      )}
    >
      {/* Keyed by step so the second hint plays the entrance too. Without it
          React keeps the node, only the text swaps, and the change is easy to
          miss on a screen where something else has just moved.
          `motion-safe` because the animation is the only thing lost when it is
          off: the bar's resting state is the finished frame, so a reader who has
          asked for less motion simply gets it already there. */}
      <div
        key={step}
        className="pointer-events-auto flex max-w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-2 shadow-2 motion-safe:animate-[fade-slide-up_0.2s_ease-out_both]"
      >
        {/* The one piece of colour. Solid-backed rather than tinted glass,
            because this stands over a 3D scene whose sky is the reader's to
            change: eight palettes across five hours, and a translucent plate
            holds against none of them. */}
        <span className="from-accent-cabbage-default/24 to-accent-onion-default/24 flex h-8 w-8 flex-none items-center justify-center rounded-12 bg-gradient-to-br text-accent-cabbage-default">
          <Icon size={IconSize.Size16} />
        </span>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          className="min-w-0"
        >
          {line(isTouch ? 'Tap' : 'Click')}
        </Typography>
        <span className="flex flex-none items-center gap-1" aria-hidden>
          {ORDER.map((id) => (
            <i
              key={id}
              className={classNames(
                'h-1.5 w-1.5 rounded-2 transition-colors duration-200',
                id === step
                  ? 'bg-accent-cabbage-default'
                  : 'bg-border-subtlest-secondary',
              )}
            />
          ))}
        </span>
        <CloseButton
          type="button"
          size={ButtonSize.XSmall}
          aria-label="Dismiss the tips"
          onClick={onDismiss}
        />
      </div>
    </div>
  );
}
