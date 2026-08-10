import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../../components/modals/common/types';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { ImageIcon, LinkIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useViewSize, ViewSize } from '../../../hooks';
import type { AgentMessage } from '../chat';
import { nodeToPng } from '../nodeToPng';
import { useAgent } from '../AgentContext';
import { useShareAgent } from '../hooks/useShareAgent';
import { AgentReplyCard } from './AgentReplyCard';

/** Long enough for the browser to have taken the blob off the anchor. */
const blobReleaseMs = 100;

/**
 * The sheet for passing a reply on.
 *
 * The reply itself is the subject, so it is a card — signed, attributed, and
 * sitting on the sheet like something already made rather than a quotation in a
 * box. Everything under it is ordinary: two buttons of the shapes this app uses
 * everywhere else, because a bespoke control is one more thing to learn on a
 * screen whose whole job is one press.
 *
 * Two presses, because two different things are worth sending. The link hands
 * over the agent's topic, so the recipient can have their own watching it. The
 * image hands over what this run found, for the places a link is not welcome —
 * a thread, a screenshot channel, a slide. Neither publishes the conversation:
 * there is no transcript to point at, and the line under the buttons says so
 * rather than letting the reader believe they have published it.
 */
export const AgentShareReplyModal = ({
  isOpen,
  onRequestClose,
  message,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  message: AgentMessage;
}): ReactElement => {
  const { interest } = useAgent();
  const name = interest?.query ?? 'This agent';
  // The app's own share path: the system sheet where there is one, a tracked
  // copy where there is not, and the referral params either way.
  const { isCopying, isSharing, onShare } = useShareAgent(interest);
  const { displayToast } = useToastNotification();
  const [isCopied, setCopied] = useState(false);
  const [isDrawing, setDrawing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = !useViewSize(ViewSize.Tablet);

  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [isCopied]);

  const shareLabel = isMobile ? 'Share agent' : 'Copy link';

  // A photograph of the card above, taken when asked for rather than kept
  // around: it is the card on screen that is the design, and rendering it early
  // would only give the two a chance to disagree.
  const copyImage = async () => {
    if (!cardRef.current) {
      return;
    }

    setDrawing(true);

    let blob: Blob;

    try {
      blob = await nodeToPng(cardRef.current);
    } catch {
      displayToast('Could not turn the reply into an image');
      setDrawing(false);

      return;
    }

    setDrawing(false);

    try {
      if (typeof ClipboardItem === 'undefined') {
        throw new Error('no image clipboard');
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
    } catch {
      // Firefox cannot put an image on the clipboard at all, and a card nobody
      // can paste is worth less than a file they can drag. Saving it is the
      // same outcome by a different route, so it is not reported as a failure.
      const url = URL.createObjectURL(blob);
      const download = document.createElement('a');

      download.href = url;
      download.download = 'daily-dev-agent.png';
      // In the document before it is pressed, and the url held a beat after:
      // Firefox is the browser this path exists for, and it ignores a click on
      // a detached anchor and cancels a download whose blob url was revoked in
      // the same task. So the toast said "Image saved" and nothing was.
      document.body.appendChild(download);
      download.click();
      download.remove();
      setTimeout(() => URL.revokeObjectURL(url), blobReleaseMs);
      displayToast('Image saved');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Medium}
    >
      <Modal.Header title="Share this reply" />
      <Modal.Body className="gap-5">
        <AgentReplyCard ref={cardRef} message={message} name={name} />

        {/* Stacked on a phone, where a row of two would be two cramped
            buttons; side by side from tablet up, primary first. */}
        <FlexCol className="gap-3 tablet:flex-row">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            className="flex-1"
            icon={
              isCopying ? (
                <VIcon size={IconSize.Size16} className="agent-icon-in" />
              ) : (
                <LinkIcon size={IconSize.Size16} />
              )
            }
            loading={isSharing}
            onClick={onShare}
          >
            {/* The hook opens the system sheet on a phone, so the label has to
                say the thing that is about to happen. */}
            {isCopying ? 'Link copied' : shareLabel}
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            className="flex-1"
            icon={
              isCopied ? (
                <VIcon
                  size={IconSize.Size16}
                  className="agent-icon-in text-status-success"
                />
              ) : (
                <ImageIcon size={IconSize.Size16} />
              )
            }
            loading={isDrawing}
            onClick={copyImage}
          >
            {isCopied ? 'Image copied' : 'Copy image'}
          </Button>
        </FlexCol>

        <FlexRow className="justify-center pb-1">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="max-w-sm text-center"
          >
            The link opens this agent with its topic ready to run. Nothing here
            is published.
          </Typography>
        </FlexRow>
      </Modal.Body>
    </Modal>
  );
};
