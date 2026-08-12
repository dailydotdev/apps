import type { ReactElement, ReactNode, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import ProgressCircle from '../../components/ProgressCircle';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';

export type CoachPointerTop = number | 'center';

export interface CoachProgress {
  total: number;
  active: number;
}

const CoachPointer = ({ top }: { top: CoachPointerTop }): ReactElement => (
  <span
    aria-hidden
    className="absolute -left-1 size-2 rotate-45 border-b border-l border-border-subtlest-tertiary bg-background-subtle"
    style={
      top === 'center'
        ? { top: '50%', marginTop: -4 }
        : { top: top - 4, marginTop: 0 }
    }
  />
);

// The shared completion ring. It swaps to a check icon at exactly 100, which
// would claim the tour is over while the last step is still open, so the sweep
// stops a hair short of full.
const CoachProgressRing = ({ total, active }: CoachProgress): ReactElement => (
  // Flex rather than inline, so the wrapper is exactly as tall as the ring and
  // the row centres the circle instead of a line box with descender space.
  <span aria-hidden className="flex shrink-0 items-center">
    <ProgressCircle
      progress={Math.min(99, ((active + 1) / total) * 100)}
      size={18}
      stroke={2}
    />
  </span>
);

export const SkipTourButton = ({
  onClick,
}: {
  onClick: () => void;
}): ReactElement => (
  <Button
    type="button"
    // Sits directly beside the primary action, so it trims its side padding to
    // stay a quiet text control rather than reading as a second button. A
    // tertiary button has no fill, which makes the trim invisible. Important,
    // because the size's own `px-2` is emitted after `px-1.5` and would win.
    className="!px-1.5 active:scale-95"
    size={ButtonSize.XSmall}
    variant={ButtonVariant.Tertiary}
    onClick={onClick}
  >
    Skip tour
  </Button>
);

export const CoachPrimaryButton = ({
  children,
  onClick,
  buttonRef,
}: {
  children: ReactNode;
  onClick: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}): ReactElement => (
  <Button
    ref={buttonRef}
    type="button"
    // Keeps the primary action visibly the heavier of the pair even when its
    // label is as short as "Next".
    className="min-w-[5.5rem] active:scale-95"
    size={ButtonSize.Small}
    variant={ButtonVariant.Primary}
    onClick={onClick}
  >
    {children}
  </Button>
);

export interface CoachCardProps {
  message: string;
  // Re-runs the enter animation on the copy block when the step changes, while
  // the shell stays mounted and the ring sweeps continuously.
  stepKey?: string;
  progress?: CoachProgress;
  control?: ReactNode;
  actions?: ReactNode;
  pointer?: CoachPointerTop;
  // Turns the card into a labelled dialog. Only the tour passes it: the ambient
  // coaches are unannounced popovers like every other one in the house.
  dialogLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CoachCard = forwardRef<HTMLDivElement, CoachCardProps>(
  (
    {
      message,
      stepKey,
      progress,
      control,
      actions,
      pointer,
      dialogLabel,
      className,
      style,
    },
    ref,
  ): ReactElement => (
    <div
      ref={ref}
      style={style}
      role={dialogLabel ? 'dialog' : undefined}
      aria-label={dialogLabel}
      // The step block below remounts on every step, and a live region that
      // remounts announces nothing; the card itself is what survives.
      aria-live="polite"
      className={classNames(
        'animate-coach-card-in relative w-56 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-3.5 pl-4 pt-4 shadow-2',
        className,
      )}
    >
      {pointer !== undefined && <CoachPointer top={pointer} />}

      <div
        key={stepKey}
        className="animate-coach-card-in flex flex-col gap-3.5"
      >
        <Typography
          className="text-balance"
          type={TypographyType.Footnote}
          color={TypographyColor.Primary}
        >
          {message}
        </Typography>

        {control}

        {actions && (
          <div className="flex items-center justify-between gap-2">
            {progress ? <CoachProgressRing {...progress} /> : <span />}
            <span className="flex items-center gap-2">{actions}</span>
          </div>
        )}
      </div>
    </div>
  ),
);

CoachCard.displayName = 'CoachCard';
