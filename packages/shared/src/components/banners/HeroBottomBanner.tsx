import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { MiniCloseIcon } from '../icons';
import ReadingReminderCatLaptop from './ReadingReminderCatLaptop';

type HeroBottomBannerProps = {
  className?: string;
  onCtaClick?: () => void;
  onClose?: () => void;
};

export const HeroBottomBanner = ({
  className,
  onCtaClick,
  onClose,
}: HeroBottomBannerProps): ReactElement => {
  return (
    <section className={classNames('w-full px-4 pb-0', className)}>
      <div className="relative overflow-hidden rounded-t-16 rounded-b-none px-[1px] pb-0 pt-[1px]">
        <div className="absolute inset-0 rounded-t-16 rounded-b-none bg-[linear-gradient(122deg,#2d1b8f_0%,#5d1fb7_45%,#ff00a8_100%)]" />
        <div className="pointer-events-none absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#ff00a8]/35 blur-3xl" />
        <div className="relative overflow-hidden rounded-t-[0.9375rem] rounded-b-none bg-raw-pepper-90 shadow-2">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            className="absolute right-3 top-3 z-2 text-white/80 hover:text-white"
            icon={<MiniCloseIcon />}
            aria-label="Close banner"
            onClick={onClose}
          />
          <div className="flex flex-col tablet:flex-row tablet:items-stretch">
            <div className="flex flex-1 flex-col justify-between p-5 tablet:p-6">
              <div className="flex flex-col gap-1">
                <p className="mt-2 text-[0.9375rem] text-white/80">
                  Never miss a learning day
                </p>
                <h3 className="typo-title2 font-bold text-white">
                  Turn on your daily reading reminder and keep your routine.
                </h3>
              </div>
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                className="mt-4 w-fit"
                onClick={onCtaClick}
              >
                Enable reminder
              </Button>
            </div>
            <div className="flex h-[12rem] w-full items-center justify-center bg-black/20 p-3 tablet:h-auto tablet:w-[13.5rem] tablet:p-4">
              <ReadingReminderCatLaptop className="m-0 h-full w-full max-w-none object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
