import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import z from 'zod';
import type { ModalProps } from '../../modals/common/Modal';
import { Modal } from '../../modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import { TextField } from '../../fields/TextField';
import { UploadIcon } from '../../icons';
import { DragDrop } from '../../fields/DragDrop';
import { Loader } from '../../Loader';
import { reimportOpportunityMutationOptions } from '../../../features/opportunity/mutations';
import { generateQueryKey, RequestKey } from '../../../lib/query';

const jobLinkSchema = z.url({ message: 'Please enter a valid URL' });

export interface OpportunityReimportModalProps extends ModalProps {
  opportunityId: string;
}

const fileValidation = {
  acceptedTypes: [
    'application/pdf',
    'application/docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  acceptedExtensions: ['pdf', 'docx'],
};

export const OpportunityReimportModal = ({
  opportunityId,
  onRequestClose,
  ...modalProps
}: OpportunityReimportModalProps): ReactElement => {
  const queryClient = useQueryClient();
  const [jobLink, setJobLink] = useState('');
  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const { mutate: reimportOpportunity, isPending } = useMutation({
    ...reimportOpportunityMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Opportunity, null, opportunityId),
      });
      onRequestClose?.(null);
    },
    onError: (err) => {
      setError(err?.message || 'Failed to reimport. Please try again.');
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

  const handleSubmit = useCallback(() => {
    const payload: {
      opportunityId: string;
      url?: string;
      file?: File;
    } = {
      opportunityId,
    };

    if (jobLink) {
      const trimmedLink = jobLink.trim();
      if (trimmedLink && validateJobLink(trimmedLink)) {
        payload.url = trimmedLink;
        reimportOpportunity(payload);
        return;
      }
    }

    if (file) {
      payload.file = file;
      reimportOpportunity(payload);
    }
  }, [jobLink, file, opportunityId, validateJobLink, reimportOpportunity]);

  const hasInput = jobLink.trim().length > 0 || !!file;

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
    >
      <Modal.Header title="Import & Update Job" />
      <Modal.Body className="flex flex-col gap-6 p-6">
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          Paste a URL or upload a file to update your job posting. All sections
          will be updated with the new content.
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
            disabled={isPending}
            hint={
              error ||
              "We'll extract details from the page and update all sections"
            }
          />

          <div className="text-center text-text-secondary typo-callout">
            Or upload a file
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
            disabled={!hasInput || !!error || isPending}
            className="w-full gap-2"
          >
            {isPending ? (
              <Loader innerClassName="!w-5 !h-5" />
            ) : (
              <>
                <UploadIcon />
                Update Job Posting
              </>
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default OpportunityReimportModal;
