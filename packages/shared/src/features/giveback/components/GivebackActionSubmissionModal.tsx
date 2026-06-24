import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { RootPortal } from '../../../components/tooltips/Portal';
import { OpenLinkIcon } from '../../../components/icons';
import { uploadContentImage } from '../../../graphql/posts';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { labels } from '../../../lib/labels';
import { anchorDefaultRel } from '../../../lib/strings';
import type { ContributionAction } from '../types';
import { formatDonationAmount } from '../utils';
import { getActionPlatformVisual } from '../actionPlatform';
import { useSubmitContributionAction } from '../hooks/useSubmitContributionAction';
import { GivebackScreenshotField } from './GivebackScreenshotField';
import { GivebackPlatformLogo } from './GivebackPlatformLogo';

interface GivebackActionSubmissionModalProps {
  action: ContributionAction;
  onClose: () => void;
}

// Instructions may arrive as one paragraph or as several lines (one step each).
// Split on line breaks so multi-line how-tos render as a numbered checklist the
// user can follow top to bottom.
const toInstructionSteps = (instructions: string): string[] =>
  instructions
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

// The explicit "what we're asking you to do" block at the top of every action.
// Leads with the platform identity and the reward, states the ask in a big
// title, and hands the user a one-tap way to go start it on the real surface.
const ActionBrief = ({
  action,
  titleId,
}: {
  action: ContributionAction;
  titleId: string;
}): ReactElement => {
  const { metadata } = action;
  const isLove = metadata.isLoveAction;
  const {
    Icon,
    name: platformName,
    forceDark,
    logoUrl,
  } = getActionPlatformVisual(metadata.platform);

  return (
    <FlexCol className="gap-4">
      <FlexRow className="items-center justify-between gap-3">
        <FlexRow className="min-w-0 items-center gap-2.5">
          <span className="shadow-1 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-12 bg-white text-black">
            <GivebackPlatformLogo
              logoUrl={logoUrl}
              Icon={Icon}
              forceDark={forceDark}
            />
          </span>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="min-w-0 truncate uppercase tracking-wider"
          >
            {platformName}
          </Typography>
        </FlexRow>
        {isLove ? (
          <span className="shrink-0 rounded-10 bg-accent-cabbage-flat px-3 py-1.5">
            <Typography
              bold
              type={TypographyType.Caption1}
              className="text-accent-cabbage-default"
            >
              Just for love
            </Typography>
          </span>
        ) : (
          <FlexCol className="shrink-0 items-end rounded-10 bg-surface-float px-3 py-1">
            <Typography
              bold
              type={TypographyType.Title4}
              className="tabular-nums text-status-success"
            >
              +{formatDonationAmount(action.points)}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              to your causes
            </Typography>
          </FlexCol>
        )}
      </FlexRow>

      <FlexCol className="gap-1.5">
        <Typography
          bold
          id={titleId}
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          className="[text-wrap:balance]"
        >
          {action.title}
        </Typography>
        {action.description && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            {action.description}
          </Typography>
        )}
      </FlexCol>

      {metadata.externalUrl && (
        <Button
          tag="a"
          href={metadata.externalUrl}
          target="_blank"
          rel={anchorDefaultRel}
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          icon={<OpenLinkIcon />}
          className="w-fit"
        >
          {isLove ? `Open ${platformName}` : `Go to ${platformName}`}
        </Button>
      )}
    </FlexCol>
  );
};

// The full how-to, surfaced prominently (not as fine print) so the requirement
// is impossible to miss. Multi-line instructions become a numbered checklist.
const InstructionsBlock = ({
  instructions,
}: {
  instructions: string;
}): ReactElement => {
  const steps = toInstructionSteps(instructions);

  return (
    <FlexCol className="gap-3 rounded-16 bg-surface-float p-4">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        bold
        className="uppercase tracking-wider"
      >
        How to complete it
      </Typography>
      {steps.length > 1 ? (
        <ol className="flex flex-col gap-2.5">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-cabbage-default font-bold tabular-nums text-white typo-caption2">
                {index + 1}
              </span>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                {step}
              </Typography>
            </li>
          ))}
        </ol>
      ) : (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {instructions}
        </Typography>
      )}
    </FlexCol>
  );
};

export const GivebackActionSubmissionModal = ({
  action,
  onClose,
}: GivebackActionSubmissionModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { submit, isPending } = useSubmitContributionAction();
  const linkInputId = `giveback-proof-link-${action.id}`;
  const noteInputId = `giveback-proof-note-${action.id}`;

  const [link, setLink] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>();
  const [screenshotUrl, setScreenshotUrl] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { evidence, metadata } = action;
  const isLove = metadata.isLoveAction;
  const showUrl = !!evidence.url;
  const showScreenshot = !!evidence.screenshot;
  const showNote = !!evidence.note;

  const canSubmit = useMemo(() => {
    if (isUploading) {
      return false;
    }
    const hasLink = !evidence.url?.required || link.trim().length > 0;
    const hasScreenshot = !evidence.screenshot?.required || !!screenshotUrl;
    const hasNote = !evidence.note?.required || note.trim().length > 0;

    return hasLink && hasScreenshot && hasNote;
  }, [evidence, isUploading, link, note, screenshotUrl]);

  const onScreenshotSelect = async (base64: string, file: File) => {
    setScreenshotPreview(base64);
    setIsUploading(true);
    try {
      const url = await uploadContentImage(file);
      setScreenshotUrl(url);
    } catch {
      setScreenshotPreview(undefined);
      setScreenshotUrl(undefined);
      displayToast(labels.error.generic);
    } finally {
      setIsUploading(false);
    }
  };

  const clearScreenshot = () => {
    setScreenshotPreview(undefined);
    setScreenshotUrl(undefined);
  };

  // Close on Escape, matching the backdrop click below.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const onSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      await submit({
        actionId: action.id,
        evidence: {
          url: link.trim() || undefined,
          screenshotUrl: screenshotUrl || undefined,
          note: note.trim() || undefined,
        },
      });
      logEvent({
        event_name: LogEvent.SubmitGivebackAction,
        target_id: action.id,
        extra: JSON.stringify({
          platform: metadata.platform,
          points: action.points,
          has_url: !!link.trim(),
          has_screenshot: !!screenshotUrl,
          has_note: !!note.trim(),
        }),
      });
      setIsSubmitted(true);
    } catch {
      logEvent({
        event_name: LogEvent.SubmitGivebackActionError,
        target_id: action.id,
      });
      displayToast(labels.error.generic);
    }
  };

  const onLoveAcknowledge = () => {
    logEvent({
      event_name: LogEvent.ClickGivebackLoveAction,
      target_id: action.id,
      extra: JSON.stringify({ platform: metadata.platform }),
    });
    onClose();
  };

  return (
    <RootPortal>
      <div className="fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper px-4 backdrop-blur-sm">
        {/* Full-bleed backdrop target: a real button so it closes on click and
            keyboard, while the dialog sits above it and is unaffected. */}
        <button
          type="button"
          aria-label="Close"
          tabIndex={-1}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <section
          aria-modal="true"
          role="dialog"
          aria-labelledby="giveback-submission-title"
          className="relative z-1 flex max-h-[calc(100vh-2rem)] w-full max-w-[35rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-default shadow-2"
        >
          <div
            aria-hidden
            className="bg-accent-cabbage-default/20 pointer-events-none absolute -right-20 -top-20 size-56 rounded-full blur-3xl"
          />
          <div
            aria-hidden
            className="bg-accent-onion-default/20 pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full blur-3xl"
          />
          <FlexCol className="relative gap-5 overflow-y-auto p-5 tablet:p-6">
            {!isSubmitted && (
              <ActionBrief
                action={action}
                titleId="giveback-submission-title"
              />
            )}

            {!isSubmitted && metadata.instructions && (
              <InstructionsBlock instructions={metadata.instructions} />
            )}

            {isLove && !isSubmitted && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                This one&apos;s a voluntary thank-you. No reward or donation is
                attached, we just genuinely appreciate it.
              </Typography>
            )}

            {!isLove && isSubmitted && (
              <FlexCol className="relative gap-4 overflow-hidden rounded-18 border border-accent-cabbage-default bg-accent-cabbage-flat p-5 shadow-2-cabbage">
                <Typography
                  bold
                  id="giveback-submission-title"
                  tag={TypographyTag.H2}
                  type={TypographyType.Title3}
                >
                  You helped unlock {formatDonationAmount(action.points)}
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  className="text-text-tertiary"
                >
                  It already counts toward your contribution. If it&apos;s
                  rejected, we&apos;ll subtract it.
                </Typography>
              </FlexCol>
            )}

            {!isLove && !isSubmitted && (
              <FlexCol className="gap-4">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Done it? Add your proof below. It counts toward your
                  contribution the moment you submit.
                </Typography>

                {showUrl && (
                  <label htmlFor={linkInputId} className="flex flex-col gap-2">
                    <Typography bold type={TypographyType.Footnote}>
                      Public link
                    </Typography>
                    <input
                      id={linkInputId}
                      className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
                      placeholder="https://..."
                      value={link}
                      onChange={(event) => setLink(event.target.value)}
                    />
                  </label>
                )}

                {showScreenshot && (
                  <FlexCol className="gap-2">
                    <Typography bold type={TypographyType.Footnote}>
                      Screenshot
                    </Typography>
                    <GivebackScreenshotField
                      inputId={`giveback-proof-${action.id}`}
                      previewSrc={screenshotPreview}
                      isUploading={isUploading}
                      onSelect={onScreenshotSelect}
                      onClear={clearScreenshot}
                    />
                  </FlexCol>
                )}

                {showNote && (
                  <label htmlFor={noteInputId} className="flex flex-col gap-2">
                    <Typography bold type={TypographyType.Footnote}>
                      Note
                    </Typography>
                    <textarea
                      id={noteInputId}
                      maxLength={1000}
                      className="min-h-24 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
                      placeholder="Add any context that helps us validate this."
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </label>
                )}
              </FlexCol>
            )}

            <FlexRow className="justify-end gap-2">
              {isLove ? (
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Primary}
                  onClick={onLoveAcknowledge}
                >
                  Got it
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    onClick={onClose}
                  >
                    {isSubmitted ? 'Done' : 'Cancel'}
                  </Button>
                  {!isSubmitted && (
                    <Button
                      type="button"
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Primary}
                      disabled={!canSubmit}
                      loading={isPending}
                      onClick={onSubmit}
                    >
                      Submit for review
                    </Button>
                  )}
                </>
              )}
            </FlexRow>
          </FlexCol>
        </section>
      </div>
    </RootPortal>
  );
};
