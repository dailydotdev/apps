import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DragDrop } from '../../../components/fields/DragDrop';
import {
  uploadCvBannerSuccessLaptop,
  uploadCvBannerSuccessMobile,
  uploadCvBannerSuccessTablet,
  uploadCvBgLaptop,
  uploadCvBgMobile,
  uploadCvBgTablet,
} from '../../../lib/image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
import { useViewSize, ViewSize } from '../../../hooks';
import { cvUploadBannerBg } from '../../../styles/custom';
import { FeelingLazy } from './FeelingLazy';

const defaultBanner = {
  title: 'Your next job should apply to you',
  description:
    'Upload your CV so we quietly match you with roles you might actually want. Nothing is shared without your ok.',
  cover: {
    laptop: uploadCvBgLaptop,
    tablet: uploadCvBgTablet,
    base: uploadCvBgMobile,
  },
  successCover: {
    laptop: uploadCvBannerSuccessLaptop,
    tablet: uploadCvBannerSuccessTablet,
    base: uploadCvBannerSuccessMobile,
  },
};

interface Cover {
  laptop: string;
  tablet: string;
  base: string;
}

interface ProfileUploadBannerProps {
  banner?: {
    title: string;
    description: string;
    cover?: Cover;
    successCover?: Cover;
  };
  className?: Partial<{
    container: string;
    image: string;
  }>;
  onClose: () => void;
}

export function ProfileUploadBanner({
  className,
  banner = defaultBanner,
  onClose,
}: ProfileUploadBannerProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);

  const getImage = () => {
    if (isLaptop) {
      return banner?.cover?.laptop || uploadCvBgTablet;
    }

    if (isTablet) {
      return banner?.cover?.tablet || uploadCvBgTablet;
    }

    return banner?.cover?.base || uploadCvBgMobile;
  };

  return (
    <div
      style={{ background: cvUploadBannerBg }}
      className={classNames(
        'relative mx-auto my-3 flex w-full max-w-[63.75rem] flex-col overflow-hidden rounded-10 border border-border-subtlest-tertiary px-4 py-3',
        className?.container,
      )}
    >
      <img
        className={classNames(
          'pointer-events-none absolute -rotate-[15] object-cover tablet:absolute tablet:bottom-0 tablet:right-0 laptop:top-0',
          className?.image,
        )}
        src={getImage()}
        alt="Animated money, devices, and a rubber duck"
      />
      <div className="mt-56 flex w-full max-w-[26.5rem] flex-col gap-2 tablet:mt-[unset]">
        <Typography
          type={TypographyType.Title2}
          bold
          className="max-w-[15.5rem] tablet:max-w-[unset]"
        >
          {banner.title || defaultBanner.title}
        </Typography>
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          {banner.description || defaultBanner.description}
        </Typography>
        <DragDrop isCompactList className="my-4" onFilesDrop={(file) => file} />
        <FeelingLazy />
      </div>
      <Button
        className="absolute right-2 top-2"
        variant={ButtonVariant.Tertiary}
        icon={<MiniCloseIcon />}
        size={ButtonSize.Small}
        onClick={onClose}
      />
    </div>
  );
}
