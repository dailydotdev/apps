import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import styles from './PostOnboardingActivation.module.css';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
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
  className,
}: PostOnboardingActivationViewProps): ReactElement => {
  const ratio = steps > 0 ? Math.min(Math.max(progress / steps, 0), 1) : 0;

  return (
    <aside
      aria-label="Personalize your feed"
      className={classNames(
        'relative w-full overflow-hidden border-b bg-raw-pepper-90 shadow-2',
        styles.border,
        className,
      )}
    >
      {/* Soft brand glow, centered behind the content. */}
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

      {/* Content is capped and centered so it sits mid-page instead of
       * stretching across the full-width bar. */}
      <div className="relative mx-auto flex max-w-[63.75rem] flex-col gap-3 px-4 py-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-6 tablet:px-6">
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
              type={TypographyType.Body}
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
          className={classNames('w-full shrink-0 tablet:w-auto', styles.cta)}
          onClick={onCtaClick}
        >
          {ctaLabel}
        </Button>
      </div>
    </aside>
  );
};
