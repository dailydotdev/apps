import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import type { MutationStatus } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DragDrop } from '../../../components/fields/DragDrop';
import { fromCDN } from '../../../lib/links';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
import { cvUploadBannerBg } from '../../../styles/custom';
import { FeelingLazy } from './FeelingLazy';
import { fileValidation } from '../hooks/useUploadCv';
import { useCloseCvBanner } from '../hooks/useCloseCvBanner';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';

const defaultBanner = {
  title: 'Complete your profile faster',
  description:
    'Upload your CV to import your experience, skills, and education. You can review and edit everything after.',
};

const bannerImage = fromCDN('/app/assets/cv-upload-banner.webp');

interface ProfileUploadBannerProps {
  banner?: {
    title: string;
    description: string;
  };
  className?: string;
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
  const { logEvent } = useLogContext();

  const props = (() => {
    return {
      title: banner.title || defaultBanner.title,
      description: banner.description || defaultBanner.description,
    };
  })();

  const handleClose = useCloseCvBanner(onClose);

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
        'relative my-3 flex w-full flex-col overflow-hidden rounded-10 border border-border-subtlest-tertiary tablet:min-h-56 tablet:flex-row',
        className,
      )}
    >
      {/* Fades soften where the cropped desk meets the banner edge */}
      <img
        className="pointer-events-none aspect-[12/5] w-full object-cover object-[60%_bottom] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] tablet:absolute tablet:inset-y-0 tablet:right-0 tablet:aspect-auto tablet:h-full tablet:w-1/2 tablet:[mask-image:linear-gradient(to_right,transparent,black_35%)] laptop:max-w-[36rem]"
        src={bannerImage}
        alt="A developer and their dog thinking at a desk"
      />
      <div className="relative flex w-full flex-col gap-2 px-4 pb-3 tablet:max-w-[55%] tablet:py-4 laptop:max-w-[28rem]">
        <Typography
          type={TypographyType.Title2}
          bold
          className="pr-8 tablet:pr-0"
        >
          {props.title}
        </Typography>
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          {props.description}
        </Typography>
        <DragDrop
          state={status}
          isCompactList
          className="mb-0 mt-4 laptop:mb-4"
          onFilesDrop={([file]) => onUpload(file)}
          validation={fileValidation}
          isCopyBold
        />
        <FeelingLazy />
      </div>
      <Button
        className="absolute right-2 top-2 z-1"
        variant={ButtonVariant.Primary}
        icon={<MiniCloseIcon />}
        size={ButtonSize.Small}
        onClick={handleClose}
      />
    </div>
  );
}
