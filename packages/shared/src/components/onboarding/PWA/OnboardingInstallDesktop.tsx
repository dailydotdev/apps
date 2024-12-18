import React, { ReactElement } from 'react';
import { useViewSize, ViewSize } from '../../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { useInstallPWA } from './useInstallPWA';
import { cloudinaryPWADesktopInstall } from '../../../lib/image';
import { PWADesktopIcon } from '../../icons/PWADesktop';

export const OnboardingInstallDesktop = ({
  onClickNext,
}: {
  onClickNext: () => void;
}): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { promptToInstall } = useInstallPWA();

  return (
    <section className="flex flex-1 flex-col laptop:justify-between">
      <div className="mb-14 flex flex-col items-center gap-6 justify-self-start text-center">
        <Typography
          bold
          tag={TypographyTag.H1}
          type={isLaptop ? TypographyType.LargeTitle : TypographyType.Title2}
          className="mb-4 tablet:mb-6"
        >
          More daily.dev on your desktop?
          <br />
          Yes, please! 👀
        </Typography>
        <Button
          icon={<PWADesktopIcon aria-hidden />}
          onClick={async () => {
            await promptToInstall?.();
            onClickNext?.();
          }}
          variant={ButtonVariant.Primary}
        >
          Install on desktop
        </Button>
        <Typography
          bold
          color={TypographyColor.Tertiary}
          tag={TypographyTag.P}
          type={TypographyType.Subhead}
        >
          Manual: Press the{' '}
          <span className="mx-1.5 inline-grid size-7 place-content-center rounded-1/2 bg-accent-salt-bolder align-middle text-text-primary">
            <PWADesktopIcon className="inline-block" aria-hidden />
          </span>{' '}
          icon next to the browser search bar and choose {`"`}Install{`"`} to
          level up
        </Typography>
      </div>
      <figure className="pointer-events-none mx-auto w-full laptopL:w-2/3">
        <img
          alt="Amazing daily.dev extension screenshot"
          className="w-full"
          loading="lazy"
          role="presentation"
          src={cloudinaryPWADesktopInstall}
        />
      </figure>
    </section>
  );
};
