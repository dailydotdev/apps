import type { ReactElement } from 'react';
import React, { createElement, useState, useEffect } from 'react';
import z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useInterval } from '@kickass-coderz/react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import { TextField } from '../../fields/TextField';
import {
  MagicIcon,
  ShieldIcon,
  ShieldCheckIcon,
  SearchIcon,
  EyeIcon,
  PlusUserIcon,
  SparkleIcon,
  UserIcon,
} from '../../icons';
import { DragDrop } from '../../fields/DragDrop';
import { parseOpportunityMutationOptions } from '../../../features/opportunity/mutations';
import { useToastNotification } from '../../../hooks';
import type { ApiErrorResult } from '../../../graphql/common';
import { labels } from '../../../lib';
import type { Opportunity } from '../../../features/opportunity/types';

const jobLinkSchema = z.string().url('Please enter a valid URL');

export interface RecruiterJobLinkModalProps extends ModalProps {
  onSubmit: (opportunity: Opportunity) => void;
}

const fileValidation = {
  acceptedTypes: [
    'application/pdf',
    'application/docx', // docx file
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx file
  ],
  acceptedExtensions: ['pdf', 'docx'],
};

const loadingMessages = [
  'Respecting developer preferences',
  'Matching with opt-in candidates only',
  'Analyzing role requirements',
  'Checking trust signals',
  'Finding developers who want to hear from you',
  'Verifying mutual interest',
  'Building trust-first connections',
  'Scanning opted-in talent pool',
  'Prioritizing authentic matches',
];

const loadingIcons = [
  ShieldIcon,
  ShieldCheckIcon,
  SearchIcon,
  EyeIcon,
  PlusUserIcon,
  SparkleIcon,
  UserIcon,
  MagicIcon,
  ShieldCheckIcon,
];

export const RecruiterJobLinkModal = ({
  onSubmit,
  onRequestClose,
  ...modalProps
}: RecruiterJobLinkModalProps): ReactElement => {
  const [jobLink, setJobLink] = useState('');
  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const { displayToast } = useToastNotification();

  const validateJobLink = (value: string) => {
    if (!value.trim()) {
      setError('');
      return false;
    }

    const result = jobLinkSchema.safeParse(value.trim());
    if (!result.success) {
      setError(result.error[0]?.message || 'Invalid URL');
      return false;
    }

    setError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setJobLink(value);
    validateJobLink(value);
  };

  const { mutateAsync: parseOpportunity } = useMutation(
    parseOpportunityMutationOptions(),
  );
  const { mutate: handleSubmit, isPending } = useMutation({
    mutationFn: async () => {
      if (jobLink) {
        const trimmedLink = jobLink.trim();

        if (trimmedLink && validateJobLink(trimmedLink)) {
          return parseOpportunity({ url: trimmedLink });
        }
      }

      if (file) {
        return parseOpportunity({ file });
      }

      throw new Error('No job link or file provided');
    },
    onError: (mutationError: ApiErrorResult) => {
      displayToast(
        mutationError?.response?.errors?.[0]?.message || labels.error.generic,
      );
    },
    onSuccess: (opportunity) => {
      onSubmit(opportunity);
    },
  });

  useInterval(
    () => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    },
    isPending ? 1800 : null,
  );

  useEffect(() => {
    if (!isPending) {
      setLoadingMessageIndex(0);
    }
  }, [isPending]);

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={false}
    >
      <Modal.Body className="flex flex-col items-center gap-6 p-6 !py-10">
        <div className="mx-auto flex items-center justify-center gap-3 rounded-12 bg-brand-float px-4 py-1">
          <MagicIcon className="text-brand-default" />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Brand}
          >
            Something magical in 3...2...1...
          </Typography>
        </div>

        <Typography type={TypographyType.Title1} bold center>
          Find out who&#39;s ready to say yes
        </Typography>

        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          center
        >
          Your role is matched privately inside daily.dev&#39;s developer
          network
        </Typography>

        <div className="flex w-full flex-col gap-4">
          <TextField
            label="Paste your job link"
            inputId="job-link"
            name="job-link"
            placeholder="https://yourcompany.com/careers/senior-engineer"
            value={jobLink}
            onChange={handleChange}
            valid={!error && jobLink.trim().length > 0}
            hint={error}
          />

          <div className="text-center text-text-secondary typo-callout">
            Or upload
          </div>

          <DragDrop
            state={undefined} // we don't want double loader
            isCompactList
            className="w-full laptop:min-h-20"
            onFilesDrop={(files) => {
              setFile(files[0]);
            }}
            validation={fileValidation}
            isCopyBold
            dragDropDescription="Drop PDF or Word here or"
            ctaLabelDesktop="Select file"
            ctaLabelMobile="Select file"
            disabled={isPending}
          />

          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            onClick={() => {
              handleSubmit();
            }}
            disabled={(!jobLink.trim() && !file) || !!error || isPending}
            className="w-full gap-2 tablet:w-auto"
          >
            {isPending ? (
              <>
                {createElement(loadingIcons[loadingMessageIndex])}
                {loadingMessages[loadingMessageIndex]}
              </>
            ) : (
              <>
                <MagicIcon />
                Find my matches
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2">
            <ShieldIcon className="text-text-secondary" />
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
              center
            >
              Built on trust, not scraping. Every match is fully opt-in.
            </Typography>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="!justify-center bg-surface-float">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
          center
        >
          See real developer introductions in hours, not weeks.
        </Typography>
      </Modal.Footer>
    </Modal>
  );
};

export default RecruiterJobLinkModal;
