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

/* DISTRICT, not town, and it is the word everywhere else a reader can see one:
   the stat tile, the rail heading, the guide, the level-up notification. "Town"
   reads better and describes a third of the ladder. The bottom rungs are a
   lodestone on bare rock, then a cairn, then a camp, and nothing is a town until
   L4 or so, which is where most of anybody's districts sit.

   What one opens is `userUpvotedFeed` filtered to that niche: the owner's
   upvotes, not a reading list. Saying "read the posts" promised a feed of the
   topic itself, which is a different product and one this page does not have. */
const LINES: Record<
  WorldIntroStep,
  (options: { verb: string; isOwn: boolean }) => string
> = {
  realm: ({ verb }) => `Six realms, one per subject. ${verb} one to walk in.`,
  district: ({ verb, isOwn }) =>
    `Every district is a topic. ${verb} one to see what ${
      isOwn ? 'you' : 'they'
    } upvoted there.`,
};

interface WorldIntroProps {
  step: WorldIntroStep;
  /** The scrubber is up, so the bar has to stand above it. */
  hasTimeline?: boolean;
  isTouch?: boolean;
  /** Whose upvotes the second step is promising. */
  isOwn?: boolean;
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
  isOwn,
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
      <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default py-2 pl-4 pr-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          className="min-w-0"
        >
          {LINES[step]({ verb: isTouch ? 'Tap' : 'Click', isOwn: !!isOwn })}
        </Typography>
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
