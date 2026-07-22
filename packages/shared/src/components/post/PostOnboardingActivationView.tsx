import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import styles from './PostOnboardingActivation.module.css';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

export interface PostOnboardingActivationViewProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  /** Completed steps of the onboarding, drives the progress ring. */
  progress?: number;
  /** Total steps of the onboarding. */
  steps?: number;
  onCtaClick?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const PostOnboardingActivationView = ({
  title = "Your feed isn't set up yet",
  description = "You're one step away from discovering what's next.",
  ctaLabel = 'Finish setup',
  progress = 1,
  steps = 2,
  onCtaClick,
  onDismiss,
  className,
}: PostOnboardingActivationViewProps): ReactElement => {
  const ratio = steps > 0 ? Math.min(Math.max(progress / steps, 0), 1) : 0;

  return (
    <aside
      aria-label="Personalize your feed"
      className={classNames(
        'relative w-full overflow-hidden border-y bg-raw-pepper-90 shadow-2 laptop:mx-auto laptop:max-w-[69.25rem] laptop:rounded-16 laptop:border',
        styles.border,
        className,
      )}
    >
      {/* Soft brand glow bleeding in from the right, echoing the strip banner. */}
      <div
        className={classNames(
          'pointer-events-none absolute inset-0',
          styles.glow,
        )}
      />
      {/* Hairline sheen along the top edge for the glossy panel feel. */}
      <div
        className={classNames(
          'pointer-events-none absolute inset-x-0 top-0 h-px',
          styles.sheen,
        )}
      />

      <div className="relative flex flex-col gap-4 px-5 py-4 pr-12 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-6 tablet:pr-14 laptop:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          {/* Progress ring: setup started, not finished. */}
          <span
            className="relative flex size-11 shrink-0 items-center justify-center"
            aria-hidden
          >
            <svg viewBox="0 0 36 36" className="size-11 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r={RADIUS}
                fill="none"
                strokeWidth="3"
                className={styles.ringTrack}
              />
              <circle
                cx="18"
                cy="18"
                r={RADIUS}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
                className="text-accent-cabbage-default"
              />
            </svg>
            <span className="absolute font-bold text-white typo-caption1">
              {progress}/{steps}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Callout}
              bold
              className="text-white [text-wrap:balance]"
            >
              {title}
            </Typography>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Footnote}
              className={classNames(
                'mt-0.5 [text-wrap:pretty]',
                styles.description,
              )}
            >
              {description}
            </Typography>
          </div>
        </div>

        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          className={classNames('w-auto shrink-0 self-start', styles.cta)}
          onClick={onCtaClick}
        >
          {ctaLabel}
        </Button>
      </div>

      <CloseButton
        type="button"
        aria-label="Dismiss feed personalization"
        className={classNames(
          'absolute right-3 top-3 tablet:top-1/2 tablet:-translate-y-1/2',
          styles.close,
        )}
        size={ButtonSize.Small}
        onClick={onDismiss}
      />
    </aside>
  );
};
