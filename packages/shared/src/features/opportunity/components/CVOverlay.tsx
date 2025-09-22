import React, { useCallback, useEffect, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DragDrop } from '../../../components/fields/DragDrop';
import { fileValidation, useUploadCv } from '../../profile/hooks/useUploadCv';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { UploadIcon } from '../../../components/icons/Upload';
import { FeelingLazy } from '../../profile/components/FeelingLazy';
import { ShieldPlusIcon } from '../../../components/icons';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import { getCandidatePreferencesOptions } from '../queries';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { IconSize } from '../../../components/Icon';

export const CVOverlay = ({
  blur = true,
  backButton,
  onUploadSuccess,
}: {
  blur?: boolean;
  backButton?: ReactNode;
  onUploadSuccess?: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const { onUpload, isPending: isUploadPending } = useUploadCv({
    shouldOpenModal: false,
    onUploadSuccess,
  });

  const opts = getCandidatePreferencesOptions(user?.id);
  const [, set] = useUpdateQuery(opts);

  const { data: preferences } = useQuery(opts);

  const [file, setFile] = useState<File | null>(null);

  const handleUpload = useCallback(async () => {
    await onUpload(file as File);

    set({
      ...preferences,
      cv: {
        fileName: file.name,
        lastModified: new Date(),
      },
    });
  }, [file, onUpload, preferences, set]);

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
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          center
        >
          🛡️ One upload. 100% confidential. Zero bad recruiting.
        </Typography>
      </div>
    </ConditionalWrapper>
  );
};
