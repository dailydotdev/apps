import type { ReactElement, ChangeEvent } from 'react';
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalSize } from './common/types';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import Textarea from '../fields/Textarea';
import { Checkbox } from '../fields/Checkbox';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useCaptureConsoleLogs } from '../../hooks/useCaptureConsoleLogs';
import { FeedbackCategory, submitFeedback } from '../../graphql/feedback';
import type { FeedbackInput } from '../../graphql/feedback';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { CameraIcon } from '../icons/Camera';
import { ImageIcon } from '../icons/Image';
import { TrashIcon } from '../icons/Trash';
import {
  supportsScreenCapture,
  captureScreenshot,
  createPreviewUrl,
  revokePreviewUrl,
  isValidImageType,
  isValidFileSize,
  MAX_SCREENSHOT_SIZE,
} from '../../lib/screenshot';

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
  const { getLogsJson } = useCaptureConsoleLogs();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<FeedbackCategory>(
    FeedbackCategory.BugReport,
  );
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null,
  );
  const [includeConsoleLogs, setIncludeConsoleLogs] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const canCaptureScreen = useMemo(() => supportsScreenCapture(), []);

  // Clean up preview URL when component unmounts or screenshot changes
  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        revokePreviewUrl(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  const handleScreenshotChange = useCallback(
    (file: File | null) => {
      // Revoke old preview URL
      if (screenshotPreview) {
        revokePreviewUrl(screenshotPreview);
      }

      if (file) {
        // Validate file type
        if (!isValidImageType(file)) {
          displayToast('Invalid image type. Use PNG, JPG, WebP, or GIF.');
          return;
        }

        // Validate file size
        if (!isValidFileSize(file)) {
          displayToast(
            `File too large. Maximum size is ${
              MAX_SCREENSHOT_SIZE / 1024 / 1024
            }MB.`,
          );
          return;
        }

        setScreenshot(file);
        setScreenshotPreview(createPreviewUrl(file));
      } else {
        setScreenshot(null);
        setScreenshotPreview(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [screenshotPreview, displayToast],
  );

  const handleCaptureScreenshot = useCallback(async () => {
    setIsCapturing(true);
    try {
      const file = await captureScreenshot();
      if (file) {
        handleScreenshotChange(file);
      }
    } catch (error) {
      displayToast('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [handleScreenshotChange, displayToast]);

  const handleFileUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleScreenshotChange(file);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleScreenshotChange],
  );

  const handleRemoveScreenshot = useCallback(() => {
    handleScreenshotChange(null);
  }, [handleScreenshotChange]);

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
      screenshot: screenshot || undefined,
      consoleLogs: includeConsoleLogs ? getLogsJson() : undefined,
    });
  }, [
    category,
    description,
    screenshot,
    includeConsoleLogs,
    getLogsJson,
    submitMutation,
    displayToast,
  ]);

  const isSubmitDisabled = !description.trim() || isPending || isCapturing;

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      size={ModalSize.Small}
      shouldCloseOnOverlayClick={!isPending && !isCapturing}
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
                disabled={isPending || isCapturing}
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
          disabled={isPending || isCapturing}
          className={{
            baseField: 'min-h-[150px]',
          }}
        />

        {/* Attachments section */}
        <div className="flex flex-col gap-3">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            Attachments (optional)
          </Typography>

          {/* Screenshot buttons */}
          <div className="flex flex-wrap gap-2">
            {canCaptureScreen && (
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                onClick={handleCaptureScreenshot}
                disabled={isPending || isCapturing}
                icon={<CameraIcon />}
              >
                {isCapturing ? 'Capturing...' : 'Capture Screenshot'}
              </Button>
            )}
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || isCapturing}
              icon={<ImageIcon />}
            >
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload screenshot"
            />
          </div>

          {/* Screenshot preview */}
          {screenshotPreview && (
            <div className="relative inline-block w-fit">
              <img
                src={screenshotPreview}
                alt="Screenshot preview"
                className="max-h-32 rounded-8 border border-border-subtlest-tertiary object-contain"
              />
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.XSmall}
                onClick={handleRemoveScreenshot}
                disabled={isPending}
                icon={<TrashIcon />}
                className="absolute -right-2 -top-2"
                aria-label="Remove screenshot"
              />
            </div>
          )}

          {/* Console logs checkbox */}
          <Checkbox
            name="includeConsoleLogs"
            checked={includeConsoleLogs}
            onToggleCallback={setIncludeConsoleLogs}
            disabled={isPending || isCapturing}
          >
            <span className="text-text-secondary">
              Include console logs (helps debug issues)
            </span>
          </Checkbox>
        </div>

        {/* Submit button */}
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={handleSubmit}
          loading={isPending}
          disabled={isSubmitDisabled}
          className="w-full"
        >
          Submit Feedback
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default FeedbackModal;
