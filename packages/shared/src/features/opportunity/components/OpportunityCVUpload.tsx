import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { fileValidation, useUploadCv } from '../../profile/hooks/useUploadCv';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { UploadIcon } from '../../../components/icons/Upload';
import { IconSize } from '../../../components/Icon';
import { DragDrop } from '../../../components/fields/DragDrop';
import { opportunityBriefcase } from '../../../lib/image';
import useSidebarRendered from '../../../hooks/useSidebarRendered';
import { FeelingLazy } from '../../profile/components/FeelingLazy';

export const OpportunityCVUpload = (): ReactElement => {
  const { sidebarRendered } = useSidebarRendered();
  const { onUpload } = useUploadCv();

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <FlexCol className="gap-4">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          center
        >
          Upload your CV so we can match you with opportunities that align with
          your skills and preferences.
        </Typography>
        <div className="relative">
          {sidebarRendered && (
            <img
              src={opportunityBriefcase}
              className="absolute -left-12 z-1 w-24 -rotate-6"
              alt="daily.dev jobs"
            />
          )}

          <DragDrop
            isCompactList
            showRemove
            fullClick
            className={classNames('w-full')}
            validation={fileValidation}
            onFilesDrop={handleFileSelect}
            uploadIcon={
              <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float text-text-primary">
                <UploadIcon size={IconSize.Small} />
              </span>
            }
          />
        </div>
        {sidebarRendered && (
          <FlexCol className="items-center">
            <FeelingLazy />
          </FlexCol>
        )}
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          center
          className="mt-2"
        >
          🛡️ We never want to waste your time. Ever.
          <br /> 100% confidential. Zero bad recruiting.
        </Typography>
      </FlexCol>
    </div>
  );
};
