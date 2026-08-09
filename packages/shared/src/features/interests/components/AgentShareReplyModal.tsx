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
import { FlexCol, FlexRow } from '../../../components/utilities';
import { CopyIcon, LinkIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useCopyText } from '../../../hooks/useCopy';
import { useViewSize, ViewSize } from '../../../hooks';
import type { AgentMessage } from '../chat';
import { messageAsMarkdown } from '../replyText';
import { useAgent } from '../AgentContext';
import { useShareAgent } from '../hooks/useShareAgent';
import { AgentReplyCard } from './AgentReplyCard';

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
 * text hands over what this run actually found, for a thread that wants the
 * findings rather than a subscription. Neither is a copy of the conversation:
 * there is no published transcript to point at, and the line under the buttons
 * says so rather than letting the reader believe they have published it.
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
  const { isCopying, onShare } = useShareAgent(interest);
  const [, copyText] = useCopyText();
  const [isCopied, setCopied] = useState(false);
  const isMobile = !useViewSize(ViewSize.Tablet);

  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [isCopied]);

  const shareLabel = isMobile ? 'Share agent' : 'Copy link';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Medium}
    >
      <Modal.Header title="Share this reply" />
      <Modal.Body className="gap-5">
        <AgentReplyCard message={message} name={name} />

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
                <CopyIcon size={IconSize.Size16} />
              )
            }
            onClick={() => {
              copyText({ textToCopy: messageAsMarkdown(message) });
              setCopied(true);
            }}
          >
            {isCopied ? 'Reply copied' : 'Copy reply'}
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
