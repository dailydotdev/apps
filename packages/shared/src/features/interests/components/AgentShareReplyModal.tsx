import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
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
import { FlexCol } from '../../../components/utilities';
import Markdown from '../../../components/Markdown';
import { LinkIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useCopyText } from '../../../hooks/useCopy';
import type { AgentMessage } from '../chat';
import { messageAsHtml } from '../replyText';
import { transcriptProse } from '../prose';

/**
 * The share sheet for one reply.
 *
 * Shaped like the one ChatGPT opens: the reply itself above, fading out at the
 * foot so a long one reads as a preview rather than a truncation, and a single
 * round action under it. One button, because a sheet that opens on a press
 * should not then ask which kind of sharing was meant.
 *
 * What the link opens is the agent's topic, not a copy of this conversation.
 * There is no published transcript to point at — and a question that keeps
 * working for the recipient is worth more than a snapshot of someone else's
 * findings anyway. The caption says so plainly rather than letting the reader
 * assume they have published the reply.
 */
export const AgentShareReplyModal = ({
  isOpen,
  onRequestClose,
  message,
  title,
  link,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  message: AgentMessage;
  /** The agent's name, the way the sheet is titled by the conversation's. */
  title: string;
  link: string;
}): ReactElement => {
  const [, copyText] = useCopyText();
  const [isCopied, setCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [isCopied]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Medium}
    >
      <Modal.Header title={title} />
      <Modal.Body className="gap-6">
        <div className="relative max-h-72 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          {/* The transcript's own prose, so the preview reads as the reply
              rather than as a quotation of it. */}
          <Markdown
            className={transcriptProse}
            content={messageAsHtml(message)}
          />
          {/* The reply runs out rather than stopping: a hard cut reads as
              content the sheet lost. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-float to-transparent"
          />
        </div>

        <FlexCol className="items-center gap-2 pb-2">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            className="!rounded-full"
            icon={
              isCopied ? (
                <VIcon size={IconSize.Large} className="agent-icon-in" />
              ) : (
                <LinkIcon size={IconSize.Large} />
              )
            }
            aria-label={isCopied ? 'Link copied' : 'Copy link'}
            onClick={() => {
              copyText({ textToCopy: link });
              setCopied(true);
            }}
          />
          <Typography type={TypographyType.Callout}>
            {isCopied ? 'Link copied' : 'Copy link'}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="max-w-xs text-center"
          >
            The link opens this agent with its topic ready to run. The reply
            itself stays here.
          </Typography>
        </FlexCol>
      </Modal.Body>
    </Modal>
  );
};
