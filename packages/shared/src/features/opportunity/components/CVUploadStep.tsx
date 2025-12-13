import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DragDrop } from '../../../components/fields/DragDrop';
import { fileValidation } from '../../profile/hooks/useUploadCv';
import { UploadIcon } from '../../../components/icons/Upload';
import { IconSize } from '../../../components/Icon';
import { FeelingLazy } from '../../profile/components/FeelingLazy';
import { ProgressStep } from './ProgressStep';
import { CVUploadInfoBox } from './CVUploadInfoBox';

export const CVUploadStep = ({
  copy,
  currentStep,
  totalSteps,
  onFileSelect,
  skipButton,
  showCVUploadInfoBox = true,
}: {
  copy?: {
    title?: string;
    description?: string;
  };
  currentStep: number;
  totalSteps: number;
  onFileSelect: (files: File[]) => void;
  skipButton?: React.ReactNode;
  showCVUploadInfoBox?: boolean;
}): ReactElement => {
  const { title, description } = copy || {
    title: 'We never want to waste your time. Ever.',
    description:
      'Upload your CV so we know what really matters to you and every role we surface, now or later, is worth your time.',
  };
  return (
    <>
      <FlexCol className="gap-4">
        <Typography type={TypographyType.LargeTitle} bold center>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
        >
          {description}
        </Typography>
      </FlexCol>
      <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <ProgressStep currentStep={currentStep} totalSteps={totalSteps} />
        <div className="flex w-full flex-col gap-2">
          <DragDrop
            isCompactList
            showRemove
            fullClick
            className={classNames('w-full')}
            validation={fileValidation}
            onFilesDrop={onFileSelect}
            uploadIcon={
              <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float text-text-primary">
                <UploadIcon size={IconSize.Small} />
              </span>
            }
          />
          <FeelingLazy />
        </div>
        {showCVUploadInfoBox && <CVUploadInfoBox />}
        {skipButton}
      </FlexCol>
    </>
  );
};
