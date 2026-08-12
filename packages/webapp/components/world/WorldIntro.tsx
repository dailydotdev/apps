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
        'pointer-events-none absolute inset-x-0 z-2 flex justify-center px-4',
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
          {LINES[step](!!isTouch)}
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
