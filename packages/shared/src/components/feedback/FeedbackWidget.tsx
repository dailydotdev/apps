import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { FeedbackIcon } from '../icons';
import { Drawer, DrawerPosition } from '../drawers/Drawer';
import Textarea from '../fields/Textarea';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { FeedbackCategory, submitFeedback } from '../../graphql/feedback';
import type { FeedbackInput } from '../../graphql/feedback';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';

const FEEDBACK_MAX_LENGTH = 2000;

const categoryOptions: { value: FeedbackCategory; label: string }[] = [
  { value: FeedbackCategory.Bug, label: 'Bug Report' },
  { value: FeedbackCategory.FeatureRequest, label: 'Feature Request' },
  { value: FeedbackCategory.General, label: 'General Feedback' },
  { value: FeedbackCategory.Other, label: 'Other' },
];

interface FeedbackWidgetProps {
  className?: string;
}

export function FeedbackWidget({
  className,
}: FeedbackWidgetProps): ReactElement | null {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const isMobile = useViewSize(ViewSize.MobileL);

  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>(
    FeedbackCategory.General,
  );
  const [description, setDescription] = useState('');

  const { mutate: submitMutation, isPending } = useMutation({
    mutationFn: (input: FeedbackInput) => submitFeedback(input),
    onSuccess: () => {
      displayToast('Thank you for your feedback!');
      setIsOpen(false);
      setDescription('');
      setCategory(FeedbackCategory.General);
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

  const handleClose = useCallback(() => {
    if (!isPending) {
      setIsOpen(false);
    }
  }, [isPending]);

  // Only show for authenticated users
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        icon={<FeedbackIcon />}
        className={classNames('fixed bottom-4 right-4 z-3 shadow-2', className)}
        onClick={() => setIsOpen(true)}
        aria-label="Send feedback"
      >
        {!isMobile && 'Feedback'}
      </Button>

      {/* Feedback form drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={handleClose}
        position={isMobile ? DrawerPosition.Bottom : DrawerPosition.Right}
        appendOnRoot
        closeOnOutsideClick={!isPending}
        title="Send Feedback"
        className={{
          wrapper: isMobile ? 'max-h-[80vh]' : 'h-full w-96 max-w-full',
        }}
      >
        <div className="flex flex-col gap-4">
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
        </div>
      </Drawer>
    </>
  );
}

export default FeedbackWidget;
