import classNames from 'classnames';
import type { ReactElement } from 'react';
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
  title?: string;
  subtitle?: string;
  onCtaClick: () => void;
  onClose: () => void;
};

export const TopHero = ({
  className,
  title = 'Never miss a learning day',
  subtitle = 'Turn on your daily reading reminder and keep your routine.',
  onCtaClick,
  onClose,
}: TopHeroProps): ReactElement => {
  return (
    <section
      className={classNames(
        'relative flex w-full items-center gap-4 rounded-16 border border-border-subtlest-quaternary bg-background-default py-0 pl-6 pr-4 tablet:gap-6',
        className,
      )}
    >
      <ReadingReminderCatLaptop className="!m-0 h-32 w-32 shrink-0 rounded-12 object-contain tablet:h-36 tablet:w-36" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
        <div className="flex flex-col">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {title}
          </Typography>
          <Typography type={TypographyType.Callout} bold className="mt-0.5">
            {subtitle}
          </Typography>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onCtaClick}
        >
          Enable reminder
        </Button>
      </div>
      <CloseButton
        type="button"
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2 shrink-0"
        aria-label="Close banner"
        onClick={onClose}
      />
    </section>
  );
};
