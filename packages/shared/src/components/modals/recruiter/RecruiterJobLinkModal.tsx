import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import z from 'zod';
import { useMutation } from '@tanstack/react-query';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import { TextField } from '../../fields/TextField';
import { MagicIcon, ShieldIcon } from '../../icons';
import { DragDrop } from '../../fields/DragDrop';
import type { PendingSubmission } from '../../../features/opportunity/context/PendingSubmissionContext';
import { ModalClose } from '../common/ModalClose';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import {
  parseOpportunityMutationOptions,
  getParseOpportunityMutationErrorMessage,
} from '../../../features/opportunity/mutations';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { ApiErrorResult } from '../../../graphql/common';

const jobLinkSchema = z.url({ message: 'Please enter a valid URL' });

export interface RecruiterJobLinkModalProps extends ModalProps {
  onSubmit: (submission: PendingSubmission) => void;
  closeable?: boolean;
}

const fileValidation = {
  acceptedTypes: [
    'application/pdf',
    'application/docx', // docx file
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx file
  ],
  acceptedExtensions: ['pdf', 'docx'],
};

export const RecruiterJobLinkModal = ({
  onSubmit,
  onRequestClose,
  closeable = false,
  ...modalProps
}: RecruiterJobLinkModalProps): ReactElement => {
  const [jobLink, setJobLink] = useState('');
  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const { displayToast } = useToastNotification();
  const [, setPendingOpportunityId] = usePersistentContext<string | null>(
    PersistentContextKeys.PendingOpportunityId,
    null,
  );

  const { mutateAsync: parseOpportunity, isPending } = useMutation({
    ...parseOpportunityMutationOptions(),
    onError: (err: ApiErrorResult) => {
      displayToast(getParseOpportunityMutationErrorMessage(err));
    },
  });

  const validateJobLink = useCallback((value: string) => {
    if (!value.trim()) {
      setError('');
      return false;
    }

    const result = jobLinkSchema.safeParse(value.trim());
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Invalid URL');
      return false;
    }

    setError('');
    return true;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setJobLink(value);
      validateJobLink(value);
      if (value.trim()) {
        setFile(null);
      }
    },
    [validateJobLink],
  );

  const handleFilesDrop = useCallback((files: File[]) => {
    setFile(files[0]);
    setJobLink('');
    setError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    const payload: { url?: string; file?: File } = {};

    if (jobLink) {
      const trimmedLink = jobLink.trim();
      if (trimmedLink && validateJobLink(trimmedLink)) {
        payload.url = trimmedLink;
      }

      return;
    }

    if (file) {
      payload.file = file;
    }

    const opportunity = await parseOpportunity(payload);
    await setPendingOpportunityId(opportunity.id);

    if (payload.url) {
      onSubmit({ type: 'url', url: payload.url });
    } else if (payload.file) {
      onSubmit({ type: 'file', file: payload.file });
    }
  }, [
    jobLink,
    file,
    validateJobLink,
    parseOpportunity,
    setPendingOpportunityId,
    onSubmit,
  ]);

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={closeable}
      shouldCloseOnEsc={closeable}
    >
      {closeable && <ModalClose className="top-2" onClick={onRequestClose} />}
      <Modal.Body className="flex flex-col gap-6 p-6">
        <Typography type={TypographyType.Title1} bold center>
          Help us understand your role
        </Typography>

        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          center
        >
          Share a link or upload a job description. We&#39;ll extract the
          details and match your role with developers who opted in to hear about
          it.
        </Typography>

        <div className="flex w-full flex-col gap-4">
          <TextField
            label="Job description URL"
            inputId="job-link"
            name="job-link"
            placeholder="https://yourcompany.com/careers/senior-engineer"
            value={jobLink}
            onChange={handleChange}
            valid={!error && jobLink.trim().length > 0}
            hint={
              error ||
              "We'll extract title, requirements, salary, and location from the page"
            }
          />

          <div className="text-center text-text-secondary typo-callout">
            Or upload a job description
          </div>

          <DragDrop
            state={undefined}
            isCompactList
            className="w-full laptop:min-h-20"
            onFilesDrop={handleFilesDrop}
            validation={fileValidation}
            isCopyBold
            dragDropDescription="Drop PDF or Word file here or"
            ctaLabelDesktop="Browse files"
            ctaLabelMobile="Browse files"
          />

          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            onClick={handleSubmit}
            disabled={(!jobLink.trim() && !file) || !!error || isPending}
            loading={isPending}
            className="w-full gap-2 tablet:w-auto"
          >
            <MagicIcon />
            Analyze & find matches
          </Button>

          <div className="flex items-center justify-center gap-2">
            <ShieldIcon className="text-text-secondary" />
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
              center
            >
              Developers only see your role if they opted in and it fits.
            </Typography>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RecruiterJobLinkModal;
