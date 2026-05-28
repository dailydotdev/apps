import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import ReadingReminderCatLaptop from './ReadingReminderCatLaptop';

type TopHeroProps = {
  className?: string;
  /**
   * Small grey eyebrow above the bold headline. Omit for a single-line
   * card that only shows the headline (`subtitle`). The original
   * "Enable reminder" hero falls back to its legacy copy so existing
   * webapp callers keep their two-line layout.
   */
  title?: string;
  subtitle?: string;
  onCtaClick?: () => void;
  /**
   * When omitted, the dismiss/close button is not rendered (use for
   * cards that the user must not be able to hide, e.g. the logged-out
   * sign-in card).
   */
  onClose?: () => void;
  /**
   * Optional illustration rendered on the left side of the card.
   * Defaults to the reading-reminder cat artwork to keep the original
   * "Enable reminder" hero usage backwards-compatible.
   */
  illustration?: ReactNode;
  ctaLabel?: string;
  ctaVariant?: ButtonVariant;
  /**
   * Optional custom action node rendered in place of the default
   * single-CTA button. Use when the card needs multiple buttons
   * (e.g. Log in + Sign up).
   */
  actions?: ReactNode;
};

const defaultIllustration = (
  <ReadingReminderCatLaptop className="!m-0 h-32 w-32 shrink-0 rounded-12 object-contain tablet:h-36 tablet:w-36" />
);

export const TopHero = ({
  className,
  title,
  subtitle = 'Turn on your daily reading reminder and keep your routine.',
  onCtaClick,
  onClose,
  illustration = defaultIllustration,
  ctaLabel = 'Enable reminder',
  ctaVariant = ButtonVariant.Primary,
  actions,
}: TopHeroProps): ReactElement => {
  return (
    <section
      className={classNames(
        // Small left padding so illustrations breathe against the card
        // edge; larger right padding so headlines don't kiss the close
        // button or the right border. Equal vertical padding lives on
        // the card shell so every illustration/text combination has the
        // same top and bottom breathing room.
        'relative flex w-full items-center gap-4 overflow-hidden rounded-16 border border-border-subtlest-quaternary bg-background-default py-2 pl-3 pr-8 tablet:gap-5',
        className,
      )}
    >
      {illustration}
      <div className="flex min-w-0 max-w-[18rem] flex-1 flex-col items-start gap-3">
        <div className="flex flex-col">
          {!!title && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {title}
            </Typography>
          )}
          <Typography
            type={TypographyType.Callout}
            bold
            className={classNames(title && 'mt-0.5')}
          >
            {subtitle}
          </Typography>
        </div>
        {actions ?? (
          <Button
            type="button"
            variant={ctaVariant}
            size={ButtonSize.Small}
            onClick={onCtaClick}
          >
            {ctaLabel}
          </Button>
        )}
      </div>
      {onClose && (
        <CloseButton
          type="button"
          size={ButtonSize.XSmall}
          className="absolute right-2 top-2 shrink-0"
          aria-label="Close banner"
          onClick={onClose}
        />
      )}
    </section>
  );
};
