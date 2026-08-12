import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { WorldIntroStep } from './useWorldIntro';

const LINES: Record<WorldIntroStep, (isTouch: boolean) => string> = {
  realm: (isTouch) =>
    `Six realms, one per subject. ${isTouch ? 'Tap' : 'Click'} one to walk in.`,
  district: (isTouch) =>
    `Every town is a topic. ${
      isTouch ? 'Tap' : 'Click'
    } one to read the posts.`,
};

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
 * The close button is a real exit rather than a step counter: somebody who
 * already knows how this works should be able to say so once and never see it
 * again. Doing what it asks retires it just the same, and that is the path
 * almost everyone takes.
 */
export function WorldIntro({
  step,
  hasTimeline,
  isTouch,
  onDismiss,
}: WorldIntroProps): ReactElement {
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
      {/* Keyed by step so the second hint arrives rather than appearing: with
          the node kept, only the words change, and that is easy to miss on a
          screen where a whole realm has just opened behind it. */}
      <div
        key={step}
        className="pointer-events-auto relative flex max-w-full items-center gap-2 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default py-2 pl-4 pr-2 motion-safe:animate-[fade-slide-up_0.2s_ease-out_both]"
      >
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          className="min-w-0"
        >
          {LINES[step](!!isTouch)}
        </Typography>
        <CloseButton
          type="button"
          size={ButtonSize.XSmall}
          aria-label="Dismiss the tips"
          onClick={onDismiss}
        />
        {/* The whole of the decoration, and it is the world's own, not chrome
            borrowed from the rest of the app: every plate on the map carries a
            level bar along its bottom edge, so the hint that points at them
            wears the same one. What it fills is how far through the two steps
            the reader is.
            The light travelling along it is the motion the boot bar makes while
            the world is raised, so the sequence reads as a continuation of what
            the reader just sat through. Under the text rather than across it: a
            sheen over words is the universal sign of content still loading. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
        >
          <i
            className={classNames(
              'absolute inset-y-0 left-0 bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default opacity-40 transition-[width] duration-300',
              step === 'realm' ? 'w-1/2' : 'w-full',
            )}
          />
          {/* Hidden rather than parked when motion is off: at rest it would be a
              bright quarter stuck at the left end, which reads as a bar that
              stopped loading. */}
          <i className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default motion-safe:animate-meter-shine motion-reduce:hidden" />
        </span>
      </div>
    </div>
  );
}
