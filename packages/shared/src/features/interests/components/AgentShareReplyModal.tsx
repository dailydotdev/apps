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
      // Firefox cannot put an image on the clipboard at all, so fall back to
      // saving the file rather than reporting a failure.
      const url = URL.createObjectURL(blob);
      const download = document.createElement('a');

      download.href = url;
      download.download = 'daily-dev-agent.png';
      // Firefox ignores a click on a detached anchor and cancels a download
      // whose blob url was revoked in the same task, so it must be in the
      // document first and the url held a beat after.
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
