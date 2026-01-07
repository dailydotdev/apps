import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { autofillProfileCover } from '../../../lib/image';

import { CustomPromptIcon } from '../../../components/icons';
import { cvUploadBannerBg } from '../../../styles/custom';
import { FeelingLazy } from './FeelingLazy';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { UploadIcon } from '../../../components/icons/Upload';
import { useFileInput } from '../../fileUpload/hooks/useFileInput';
import { useFileValidation } from '../../fileUpload/hooks/useFileValidation';
import { useToastNotification } from '../../../hooks';
import { webappUrl } from '../../../lib/constants';
import Link from '../../../components/utilities/Link';

interface ProfileUploadBannerProps {
  targetId?: TargetId;
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
  showManualButton?: boolean;
}

export function AutofillProfileBanner({
  targetId = TargetId.MyProfile,
  onUpload,
  isLoading,
  showManualButton = true,
}: ProfileUploadBannerProps): ReactElement {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { validateFiles } = useFileValidation();
  const handleFiles = (files: FileList | null) => {
    const { validFiles, errors } = validateFiles(files);

    if (errors.length > 0) {
      displayToast(errors[0].message);
      return;
    }

    const [valid] = validFiles;

    if (valid) {
      onUpload(valid).catch(() => {
        displayToast('Failed to upload file. Please try again.');
      });
    }
  };

  const { input, openFileInput } = useFileInput({
    inputRef,
    onFiles: handleFiles,
    multiple: false,
    disabled: isLoading,
    accept: '.pdf,.docx',
  });

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
      className="relative mx-auto my-4 flex w-full flex-col items-center justify-center overflow-hidden rounded-10 border border-border-subtlest-tertiary p-4 laptop:flex-row"
    >
      {input}
      <div className="flex flex-1 flex-col items-center gap-1 laptop:items-baseline">
        <CustomPromptIcon />
        <Typography type={TypographyType.Body} bold>
          Autofill your profile!
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Secondary}
        >
          Instantly import your details directly from your CV!
        </Typography>
        <div className="my-2 flex flex-row gap-3">
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            icon={<UploadIcon />}
            onClick={openFileInput}
            disabled={isLoading}
          >
            Upload PDF
          </Button>
          {showManualButton && (
            <Link href={`${webappUrl}settings/profile`} passHref>
              <Button
                tag="a"
                size={ButtonSize.Small}
                variant={ButtonVariant.Subtle}
              >
                Fill in manually
              </Button>
            </Link>
          )}
        </div>
        <FeelingLazy
          copy=""
          className="flex-row-reverse items-start justify-end"
        />
      </div>
      <div className="w-60 laptop:w-40">
        <img
          className="w-full object-cover"
          src={autofillProfileCover}
          alt="Illustration that demonstrates converting document to account profile"
        />
      </div>
    </div>
  );
}
