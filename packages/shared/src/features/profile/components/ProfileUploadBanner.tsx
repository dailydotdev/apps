import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
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
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';

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
  targetId?: TargetId;
}

export function ProfileUploadBanner({
  className,
  banner = defaultBanner,
  onClose,
  onUpload,
  status,
  targetId = TargetId.MyProfile,
}: ProfileUploadBannerProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

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
      action: {
        copy: 'Go to profile',
        onClick: () => router.push(`${webappUrl}settings/profile`),
      },
    });
    onClose();
  };

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CvBanner,
      target_id: targetId,
    });
  }, [logEvent, targetId]);

  return (
    <div
      style={{ background: cvUploadBannerBg }}
      className={classNames(
        'rounded-10 border-border-subtlest-tertiary relative mx-auto my-3 flex w-full max-w-[63.75rem] flex-col overflow-hidden border px-4 py-3',
        className?.container,
      )}
    >
      <img
        className={classNames(
          'tablet:absolute tablet:bottom-0 tablet:right-0 laptop:top-0 pointer-events-none absolute -rotate-[15] object-cover',
          className?.image,
        )}
        src={getImage()}
        alt="Animated devices, money, and a rubber duck"
      />
      <div className="tablet:mt-[unset] mt-56 flex w-full max-w-[26.5rem] flex-col gap-2">
        <Typography
          type={TypographyType.Title2}
          bold
          className="tablet:max-w-[unset] max-w-[15.5rem]"
        >
          {props.title}
        </Typography>
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          {props.description}
        </Typography>
        <DragDrop
          state={status}
          isCompactList
          className={classNames('laptop:mb-4 mb-0 mt-4')}
          onFilesDrop={([file]) => onUpload(file)}
          validation={fileValidation}
          isCopyBold
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
