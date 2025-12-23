import type { ReactElement } from 'react';
import React, { createElement, useState, useEffect, useCallback } from 'react';
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
import type {
  ApiErrorResult,
  ApiZodErrorExtension,
} from '../../../graphql/common';
import { labels } from '../../../lib';
import type { Opportunity } from '../../../features/opportunity/types';
import Alert, { AlertType } from '../../widgets/Alert';
import { FlexCol } from '../../utilities';

const jobLinkSchema = z.string().url({ message: 'Please enter a valid URL' });

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

interface LoadingButtonContentProps {
  isPending: boolean;
}

const LoadingButtonContent = ({ isPending }: LoadingButtonContentProps) => {
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!isPending) {
      setLoadingMessageIndex(0);
      return undefined;
    }

    const intervalId = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);

    return () => clearInterval(intervalId);
  }, [isPending]);

  if (!isPending) {
    return (
      <>
        <MagicIcon />
        Find my matches
      </>
    );
  }

  return (
    <>
      {createElement(loadingIcons[loadingMessageIndex])}
      {loadingMessages[loadingMessageIndex]}
    </>
  );
};

interface ValidationIssue {
  path: (string | number)[];
  message: string;
}

export const RecruiterJobLinkModal = ({
  onSubmit,
  onRequestClose,
  ...modalProps
}: RecruiterJobLinkModalProps): ReactElement => {
  const [jobLink, setJobLink] = useState('');
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationIssue[]>(
    [],
  );
  const [file, setFile] = useState<File | null>(null);
  const { displayToast } = useToastNotification();

  const validateJobLink = useCallback((value: string) => {
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
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setJobLink(value);
      validateJobLink(value);
      setValidationErrors([]);
    },
    [validateJobLink],
  );

  const handleFilesDrop = useCallback((files: File[]) => {
    setFile(files[0]);
    setValidationErrors([]);
  }, []);

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
      const firstError = mutationError?.response?.errors?.[0];
      const isZodError =
        firstError?.extensions?.code === 'ZOD_VALIDATION_ERROR';

      if (isZodError) {
        const zodError = firstError as unknown as {
          extensions: ApiZodErrorExtension;
        };
        const issues = zodError.extensions.issues as ValidationIssue[];
        setValidationErrors(issues);
      } else {
        displayToast(firstError?.message || labels.error.generic);
      }
    },
    onSuccess: (opportunity) => {
      onSubmit(opportunity);
    },
  });

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
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

        {validationErrors.length > 0 && (
          <Alert type={AlertType.Error} className="w-full">
            <FlexCol className="gap-2">
              <Typography type={TypographyType.Callout} bold>
                We couldn&apos;t parse all the information from your job
                posting:
              </Typography>
              <ul className="ml-4 list-disc">
                {validationErrors.map((issue) => (
                  <li
                    key={`${issue.path.join('-')}-${issue.message}`}
                    className="typo-footnote"
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Please try a different job link or upload a more detailed job
                description.
              </Typography>
            </FlexCol>
          </Alert>
        )}

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
            onFilesDrop={handleFilesDrop}
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
            <LoadingButtonContent isPending={isPending} />
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
