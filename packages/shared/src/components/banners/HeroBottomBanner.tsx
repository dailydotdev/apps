import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MiniCloseIcon } from '../icons';
import feedStyles from '../Feed.module.css';
import ReadingReminderCatLaptop from './ReadingReminderCatLaptop';

type TopHeroProps = {
  className?: string;
  variant?: 'default' | 'lightAndTight';
  applyFeedWidthConstraint?: boolean;
  title?: string;
  subtitle?: string;
  shouldShowDismiss?: boolean;
  onCtaClick?: () => void;
  onClose?: () => void;
};

export const TopHero = ({
  className,
  variant = 'default',
  applyFeedWidthConstraint = true,
  title = 'Never miss a learning day',
  subtitle = 'Turn on your daily reading reminder and keep your routine.',
  shouldShowDismiss = false,
  onCtaClick,
  onClose,
}: TopHeroProps): ReactElement => {
  if (variant === 'lightAndTight') {
    return (
      <section
        className={classNames(
          'mb-4 h-fit w-full pb-0',
          applyFeedWidthConstraint && feedStyles.cards,
          className,
        )}
      >
        <div className="top-hero-animated-border overflow-hidden rounded-16 bg-[length:200%_200%] p-px shadow-2 motion-safe:[animation:top-hero-border-shift_4s_ease-in-out_infinite]">
          <div className="overflow-hidden rounded-[0.9375rem] bg-raw-pepper-90">
            <div className="flex flex-col gap-4 px-4 py-2 tablet:flex-row tablet:items-center tablet:justify-between tablet:px-5 tablet:py-2">
              <div className="flex flex-col gap-0">
                <h3 className="text-white/70 font-bold typo-title3">{title}</h3>
                <p className="text-[0.9375rem] font-normal leading-5 text-text-secondary">
                  {subtitle}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end tablet:self-auto">
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Primary}
                  onClick={onCtaClick}
                >
                  Enable reminder
                </Button>
                {shouldShowDismiss && (
                  <Button
                    type="button"
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    className="text-white/80 hover:text-white"
                    icon={<MiniCloseIcon />}
                    aria-label="Close banner"
                    onClick={onClose}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={classNames(
        'mb-4 w-full pb-0',
        applyFeedWidthConstraint && feedStyles.cards,
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
        <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
        <div className="top-hero-glow pointer-events-none absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2">
          {shouldShowDismiss && (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              className="text-white/80 absolute right-3 top-3 z-2 hover:text-white"
              icon={<MiniCloseIcon />}
              aria-label="Close banner"
              onClick={onClose}
            />
          )}
          <div className="flex flex-col tablet:flex-row tablet:items-stretch">
            <div className="flex flex-1 flex-col items-center p-5 text-center tablet:items-start tablet:p-6 tablet:text-left">
              <div className="flex flex-col items-center gap-1 tablet:items-start">
                <p className="text-white/80 mt-2 text-[0.9375rem]">{title}</p>
                <h3 className="font-bold text-white typo-title2">{subtitle}</h3>
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  className="mt-4 w-fit"
                  onClick={onCtaClick}
                >
                  Enable reminder
                </Button>
              </div>
            </div>
            <div className="bg-black/20 flex h-[12.5rem] w-full items-center justify-center p-2 tablet:h-auto tablet:w-[14.5rem] tablet:p-3 laptopL:w-[16rem]">
              <ReadingReminderCatLaptop className="m-0 h-full w-full max-w-none scale-105 object-contain laptopL:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
