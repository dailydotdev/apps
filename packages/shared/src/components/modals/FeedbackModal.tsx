import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalSize } from './common/types';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import Textarea from '../fields/Textarea';
import { useToastNotification } from '../../hooks/useToastNotification';
import { FeedbackCategory, submitFeedback } from '../../graphql/feedback';
import type { FeedbackInput } from '../../graphql/feedback';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';

const FEEDBACK_MAX_LENGTH = 2000;

const categoryOptions: { value: FeedbackCategory; label: string }[] = [
  { value: FeedbackCategory.BugReport, label: 'Bug Report' },
  { value: FeedbackCategory.FeatureRequest, label: 'Feature Request' },
  { value: FeedbackCategory.UxIssue, label: 'UX Issue' },
  { value: FeedbackCategory.PerformanceComplaint, label: 'Performance' },
  { value: FeedbackCategory.ContentQuality, label: 'Content Quality' },
];

const FeedbackModal = ({
  onRequestClose,
  ...props
}: ModalProps): ReactElement => {
  const { displayToast } = useToastNotification();

  const [category, setCategory] = useState<FeedbackCategory>(
    FeedbackCategory.BugReport,
  );
  const [description, setDescription] = useState('');

  const { mutate: submitMutation, isPending } = useMutation({
    mutationFn: (input: FeedbackInput) => submitFeedback(input),
    onSuccess: () => {
      displayToast('Thank you for your feedback!');
      onRequestClose?.(null);
    },
    onError: () => {
      displayToast('Failed to submit feedback. Please try again.');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!description.trim()) {
      displayToast('Please enter your feedback');
      return;
    }

    submitMutation({
      category,
      description: description.trim(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
  }, [category, description, submitMutation, displayToast]);

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      size={ModalSize.Small}
      shouldCloseOnOverlayClick={!isPending}
    >
      <Modal.Header title="Send Feedback" />
      <Modal.Body className="flex flex-col gap-4">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Help us improve by sharing your thoughts
        </Typography>

        {/* Category selector */}
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            Category
          </Typography>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  category === option.value
                    ? ButtonVariant.Primary
                    : ButtonVariant.Float
                }
                size={ButtonSize.Small}
                onClick={() => setCategory(option.value)}
                disabled={isPending}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Description textarea */}
        <Textarea
          inputId="feedback-description"
          label="Your feedback"
          placeholder="Tell us what's on your mind..."
          value={description}
          valueChanged={setDescription}
          maxLength={FEEDBACK_MAX_LENGTH}
          rows={6}
          fieldType="tertiary"
          disabled={isPending}
          className={{
            baseField: 'min-h-[150px]',
          }}
        />

        {/* Submit button */}
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={handleSubmit}
          loading={isPending}
          disabled={!description.trim() || isPending}
          className="w-full"
        >
          Submit Feedback
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default FeedbackModal;
