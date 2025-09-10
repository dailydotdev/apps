import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { ReactElement } from 'react';
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
import { ShieldPlusIcon } from '../../../components/icons';

export const CVOverlay = ({
  onDismiss,
}: {
  onDismiss: () => void;
}): ReactElement => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const { back } = useRouter();
  return (
    <div className="absolute top-10 z-1 size-full h-screen bg-blur-glass backdrop-blur-xl laptop:top-16">
      <div className="mx-auto mt-10 flex max-w-[42.5rem] flex-col gap-6 rounded-16 border border-border-subtlest-secondary bg-blur-baseline p-6">
        <div>
          <Typography
            type={TypographyType.LargeTitle}
            bold
            center
            className="mb-4"
          >
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
            className={classNames('w-full')}
            validation={fileValidation}
            onFilesDrop={() => {
              setFileUploaded(true);
            }}
            uploadIcon={
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<UploadIcon />}
                className="cursor-default text-text-primary"
              />
            }
          />
          <FeelingLazy />
        </div>
        <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4">
          <div className="flex gap-2">
            <ShieldPlusIcon secondary className="text-status-success" />
            <Typography type={TypographyType.Subhead} bold>
              Why we ask for your CV
            </Typography>
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Because guessing is a waste of everyone&apos;s time. The more signal
            we have from day one, the less noise you&apos;ll ever see here.
            We&apos;d rather show you nothing than risk wasting your time, and
            that starts with knowing exactly what&apos;s worth showing you.
            <br />
            <br />
            Your CV stays 100% confidential and no recruiter sees it unless you
            explicitly say yes to an opportunity.
          </Typography>
        </div>
        <div className="flex justify-between">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Large}
            onClick={back}
          >
            Back
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            onClick={onDismiss}
            disabled={!fileUploaded}
          >
            Upload CV & Activate Filters
          </Button>
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          center
        >
          🛡️ One upload. 100% confidential. Zero bad recruiting.
        </Typography>
      </div>
    </div>
  );
};
