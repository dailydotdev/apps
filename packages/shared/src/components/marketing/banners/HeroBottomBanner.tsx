import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import CloseButton from '../../CloseButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import ReadingReminderCatLaptop from './ReadingReminderCatLaptop';

type TopHeroProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  onCtaClick?: () => void;
  onClose?: () => void;
  illustration?: ReactNode;
  ctaLabel?: string;
  ctaVariant?: ButtonVariant;
  actions?: ReactNode;
};

const defaultIllustration = (
  <ReadingReminderCatLaptop className="!m-0 h-24 w-28 shrink-0 self-center rounded-12 object-contain tablet:h-28 tablet:w-32" />
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
