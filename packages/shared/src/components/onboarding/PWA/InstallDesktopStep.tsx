import React, { ReactElement } from 'react';
import { useViewSize, ViewSize } from '../../../hooks';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { LazyImage } from '../../LazyImage';
import { Button, ButtonVariant } from '../../buttons/Button';
import { useInstallPWA } from './useInstallPWA';
import { cloudinaryPWADesktopInstall } from '../../../lib/image';

interface OnboardingStepProps {
  onClickNext: () => void;
}

export const InstallDesktopStep = ({
  onClickNext,
}: OnboardingStepProps): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isInstalledPWA, promptToInstall } = useInstallPWA();

  return (
    <section className="flex max-w-screen-laptop flex-col text-center tablet:px-10">
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
      <Button variant={ButtonVariant.Primary} onClick={promptToInstall}>
        Install
      </Button>{' '}
      - {isInstalledPWA ? 'Installed' : 'Not installed'}
      <LazyImage imgSrc={cloudinaryPWADesktopInstall} imgAlt="" />
    </section>
  );
};
