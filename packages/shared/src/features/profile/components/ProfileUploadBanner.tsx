import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { MutationStatus } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DragDrop } from '../../../components/fields/DragDrop';
import {
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
import { useToastNotification, useViewSize, ViewSize } from '../../../hooks';
import { cvUploadBannerBg } from '../../../styles/custom';
import { FeelingLazy } from './FeelingLazy';
import { webappUrl } from '../../../lib/constants';
import { fileValidation } from '../hooks/useUploadCv';

const defaultBanner = {
  title: 'Your next job should apply to you',
  description:
    'Upload your CV so we quietly match you with roles you might actually want. Nothing is shared without your ok.',
  cover: {
    laptop: uploadCvBgLaptop,
    tablet: uploadCvBgTablet,
    base: uploadCvBgMobile,
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
  };
  className?: Partial<{
    container: string;
    image: string;
  }>;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  status: MutationStatus;
}

export function ProfileUploadBanner({
  className,
  banner = defaultBanner,
  onClose,
  onUpload,
  status,
}: ProfileUploadBannerProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const { displayToast } = useToastNotification();

  const getImage = () => {
    const cover = banner?.cover;

    if (isLaptop) {
      return cover?.laptop || uploadCvBgTablet;
    }

    if (isTablet) {
      return cover?.tablet || uploadCvBgTablet;
    }

    return cover?.base || uploadCvBgMobile;
  };

  const props = (() => {
    return {
      title: banner.title || defaultBanner.title,
      description: banner.description || defaultBanner.description,
    };
  })();

  const router = useRouter();
  const handleClose = () => {
    displayToast('You can upload your CV later from your profile', {
      onUndo: () => router.push(`${webappUrl}settings/profile`),
      undoCopy: 'Go to profile',
    });
    onClose();
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
        alt="Animated devices, money, and a rubber duck"
      />
      <div className="mt-56 flex w-full max-w-[26.5rem] flex-col gap-2 tablet:mt-[unset]">
        <Typography
          type={TypographyType.Title2}
          bold
          className="max-w-[15.5rem] tablet:max-w-[unset]"
        >
          {props.title}
        </Typography>
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          {props.description}
        </Typography>
        <DragDrop
          state={status}
          isCompactList
          className={classNames('my-4')}
          onFilesDrop={([file]) => onUpload(file)}
          validation={fileValidation}
        />
        <FeelingLazy />
      </div>
      <Button
        className="absolute right-2 top-2"
        variant={ButtonVariant.Tertiary}
        icon={<MiniCloseIcon />}
        size={ButtonSize.Small}
        onClick={handleClose}
      />
    </div>
  );
}
