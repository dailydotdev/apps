import React, { useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DragDrop } from '../../../components/fields/DragDrop';
import { fileValidation } from '../../profile/hooks/useUploadCv';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { UploadIcon } from '../../../components/icons/Upload';
import { FeelingLazy } from '../../profile/components/FeelingLazy';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import { IconSize } from '../../../components/Icon';
import { useCVUploadManager } from '../hooks/useCVUploadManager';
import { CVUploadInfoBox } from './CVUploadInfoBox';

export const CVOverlay = ({
  blur = true,
  backButton,
  onUploadSuccess,
}: {
  blur?: boolean;
  backButton?: ReactNode;
  onUploadSuccess?: () => void;
}): ReactElement => {
  const {
    file,
    setFile,
    handleUpload,
    isPending: isUploadPending,
  } = useCVUploadManager(onUploadSuccess);

  useEffect(() => {
    if (!blur) {
      return () => {};
    }
    document.body.classList.add('hidden-scrollbar');

    return () => {
      document.body.classList.remove('hidden-scrollbar');
    };
  }, [blur]);

  return (
    <ConditionalWrapper
      condition={blur}
      wrapper={(children) => (
        <div className="absolute top-10 z-1 size-full h-screen bg-blur-glass backdrop-blur-xl laptop:top-16">
          {children}
        </div>
      )}
    >
      <div className="mx-auto mt-10 flex max-w-[42.5rem] flex-col gap-6 rounded-16 border border-border-subtlest-secondary bg-blur-baseline p-6">
        <div className="flex flex-col gap-4">
          <Typography type={TypographyType.LargeTitle} bold center>
            We never want to waste your time. Ever.
          </Typography>
          <Typography
            type={TypographyType.Title3}
            center
            color={TypographyColor.Secondary}
          >
            Upload your CV so we know what really matters to you and every role
            we surface, now or later, is worth your time.{' '}
          </Typography>
        </div>
        <div className="flex w-full flex-col gap-2">
          <DragDrop
            isCompactList
            showRemove
            fullClick
            className={classNames('w-full')}
            validation={fileValidation}
            onFilesDrop={(uploadedFiles) => {
              setFile(uploadedFiles[0]);
            }}
            uploadIcon={
              <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float text-text-primary">
                <UploadIcon size={IconSize.Small} />
              </span>
            }
          />
          <FeelingLazy />
        </div>
        <CVUploadInfoBox />
        <div className="flex flex-col justify-between gap-4 tablet:flex-row">
          {backButton}
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            onClick={() => {
              handleUpload();
            }}
            disabled={!file}
            loading={isUploadPending}
          >
            Upload CV & Activate Filters
          </Button>
        </div>
      </div>
    </ConditionalWrapper>
  );
};
